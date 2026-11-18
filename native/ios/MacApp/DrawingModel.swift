import AppKit
import SwiftUI

struct DrawingPoint: Codable, Equatable {
    var x: Double
    var y: Double
}

struct DrawingStroke: Codable, Equatable {
    var colorIndex: Int
    var width: Double
    var erasing: Bool
    var points: [DrawingPoint]
}

struct DrawingDraft: Codable {
    var version: Int
    var strokes: [DrawingStroke]
}

@MainActor final class DrawingModel: ObservableObject {
    static let paper = CGSize(width: 1000, height: 700)
    static let strokeLimit = 10_000
    static let palette: [NSColor] = [.black, .systemRed, .systemOrange, .systemGreen, .systemBlue, .systemPurple]
    let colors = DrawingModel.palette
    let colorNames = ["墨黑", "红色", "橙色", "绿色", "蓝色", "紫色"]
    @Published var colorIndex = 0
    @Published var width: Double = 8
    @Published var erasing = false
    @Published private(set) var strokes: [DrawingStroke] = []
    @Published private(set) var currentStroke: DrawingStroke?
    @Published private(set) var saveError: String?
    @Published private(set) var exportError: String?
    @Published private(set) var revision = 0
    private let draftURL: URL
    private var unreadableDraft = false
    private var hasEdits = false
    private enum Action {
        case stroke(DrawingStroke)
        case clear([DrawingStroke])
    }
    private var undoActions: [Action] = []
    private var redoActions: [Action] = []

    init(storageURL: URL? = nil) {
        let support = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        draftURL = storageURL ?? support.appendingPathComponent("com.feiwenchao.kidsprout.mac", isDirectory: true).appendingPathComponent("drawing-v1.json")
        guard FileManager.default.fileExists(atPath: draftURL.path) else { return }
        do {
            let draft = try JSONDecoder().decode(DrawingDraft.self, from: Data(contentsOf: draftURL))
            guard draft.version == 1, draft.strokes.allSatisfy(Self.isValid) else { throw DrawingError.invalidDraft }
            // Existing valid drafts remain intact even if an older version allowed more strokes.
            strokes = draft.strokes
        } catch {
            unreadableDraft = true
            saveError = "草稿暂时无法读取，已打开空白画纸。原文件会保留，新作会在绘画后保存。"
        }
    }

    var canUndo: Bool { !undoActions.isEmpty }
    var canRedo: Bool { !redoActions.isEmpty }
    var limitMessage: String? {
        strokes.count >= Self.strokeLimit ? "画纸已有 \(strokes.count) 笔，已达到新增上限。已有画作完整保留，可撤销或清空后继续。" : nil
    }

    func beginStroke(at point: CGPoint) {
        endStroke()
        guard strokes.count < Self.strokeLimit, let point = Self.validPoint(point) else { return }
        currentStroke = DrawingStroke(colorIndex: min(max(colorIndex, 0), 5), width: min(max(width.isFinite ? width : 8, 3), 24), erasing: erasing, points: [point])
    }

    func appendPoint(_ point: CGPoint) {
        guard let point = Self.validPoint(point), var stroke = currentStroke, stroke.points.last != point else { return }
        stroke.points.append(point)
        currentStroke = stroke
    }

    func endStroke() {
        guard let stroke = currentStroke else { return }
        currentStroke = nil
        strokes.append(stroke)
        undoActions.append(.stroke(stroke))
        redoActions.removeAll()
        changed()
    }

    func undo() {
        endStroke()
        guard let action = undoActions.popLast() else { return }
        switch action {
        case .stroke: strokes.removeLast()
        case .clear(let previous): strokes = previous
        }
        redoActions.append(action)
        changed()
    }

    func redo() {
        endStroke()
        guard let action = redoActions.popLast() else { return }
        switch action {
        case .stroke(let stroke): strokes.append(stroke)
        case .clear: strokes.removeAll()
        }
        undoActions.append(action)
        changed()
    }

    func clear() {
        endStroke()
        guard !strokes.isEmpty else { return }
        undoActions.append(.clear(strokes))
        redoActions.removeAll()
        strokes.removeAll()
        changed()
    }

    func save() {
        // Merely visiting a corrupt draft must not replace the recoverable original.
        guard !unreadableDraft || hasEdits else { return }
        do {
            try FileManager.default.createDirectory(at: draftURL.deletingLastPathComponent(), withIntermediateDirectories: true)
            if unreadableDraft {
                let backup = draftURL.deletingLastPathComponent().appendingPathComponent("drawing-unreadable-\(UUID().uuidString).json")
                try FileManager.default.copyItem(at: draftURL, to: backup)
                unreadableDraft = false
            }
            let data = try JSONEncoder().encode(DrawingDraft(version: 1, strokes: strokes))
            try data.write(to: draftURL, options: .atomic)
            saveError = nil
        } catch {
            saveError = "草稿未能保存，画作仍在当前窗口。请检查本机存储空间后重试。"
        }
    }

    func pngData() throws -> Data {
        let pixelWidth = 2000
        let pixelHeight = 1400
        guard let context = CGContext(data: nil, width: pixelWidth, height: pixelHeight, bitsPerComponent: 8, bytesPerRow: pixelWidth * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { throw DrawingError.renderFailed }
        context.setFillColor(NSColor.white.cgColor)
        context.fill(CGRect(x: 0, y: 0, width: pixelWidth, height: pixelHeight))
        context.translateBy(x: 0, y: CGFloat(pixelHeight))
        context.scaleBy(x: 2, y: -2)
        Self.render(strokes, in: context)
        guard let image = context.makeImage(), let data = NSBitmapImageRep(cgImage: image).representation(using: .png, properties: [:]) else { throw DrawingError.renderFailed }
        return data
    }

    @discardableResult func exportPNG(to url: URL) -> Bool {
        do {
            endStroke()
            try pngData().write(to: url, options: .atomic)
            exportError = nil
            return true
        } catch {
            exportError = "图片保存失败，请检查所选位置的写入权限和存储空间后重试。"
            return false
        }
    }

    static func render(_ strokes: [DrawingStroke], in context: CGContext) {
        context.saveGState()
        context.setLineCap(.round)
        context.setLineJoin(.round)
        context.setAllowsAntialiasing(true)
        for stroke in strokes {
            guard let first = stroke.points.first else { continue }
            let color = stroke.erasing ? NSColor.white : palette[stroke.colorIndex]
            let width = stroke.width * (stroke.erasing ? 3 : 1)
            context.setStrokeColor(color.cgColor)
            context.setFillColor(color.cgColor)
            context.setLineWidth(width)
            if stroke.points.count == 1 {
                context.fillEllipse(in: CGRect(x: first.x - width / 2, y: first.y - width / 2, width: width, height: width))
            } else {
                context.beginPath()
                context.move(to: CGPoint(x: first.x, y: first.y))
                for point in stroke.points.dropFirst() { context.addLine(to: CGPoint(x: point.x, y: point.y)) }
                context.strokePath()
            }
        }
        context.restoreGState()
    }

    private func changed() {
        hasEdits = true
        revision += 1
        save()
    }

    private static func validPoint(_ point: CGPoint) -> DrawingPoint? {
        guard point.x.isFinite, point.y.isFinite else { return nil }
        return DrawingPoint(x: min(max(point.x, 0), paper.width), y: min(max(point.y, 0), paper.height))
    }

    private static func isValid(_ stroke: DrawingStroke) -> Bool {
        (0..<6).contains(stroke.colorIndex) && stroke.width.isFinite && (3...24).contains(stroke.width) && !stroke.points.isEmpty && stroke.points.allSatisfy {
            $0.x.isFinite && $0.y.isFinite && (0...1000).contains($0.x) && (0...700).contains($0.y)
        }
    }

    private enum DrawingError: Error { case invalidDraft, renderFailed }
}

import AppKit
import SwiftUI

struct DrawingPoint: Codable, Equatable { var x: Double; var y: Double }
struct DrawingStroke: Codable, Equatable {
    var colorIndex: Int
    var width: Double
    var erasing: Bool
    var points: [DrawingPoint]
    var colorHex: String? = nil
    var opacity: Double? = nil
    var eraserScale: Double? = nil
}
struct DrawingDraft: Codable {
    var version: Int
    var strokes: [DrawingStroke]
    var templateID: String? = nil
    var showGrid: Bool? = nil
}

@MainActor final class DrawingModel: ObservableObject {
    static let paper = CGSize(width: 1000, height: 700)
    static let strokeLimit = 10_000
    static let palette = DrawingPalette.hex.map { NSColor(DrawingPalette.color($0)) }
    private static let legacyPalette: [NSColor] = [.black, .systemRed, .systemOrange, .systemGreen, .systemBlue, .systemPurple]
    let colors = DrawingModel.palette
    let colorNames = DrawingPalette.names
    @Published var colorIndex = 0
    @Published var customColor = DrawingPalette.color("#52775E")
    @Published var width: Double = 8
    @Published private(set) var tool: DrawingTool = .pen
    @Published var showGrid = false
    @Published private(set) var templateID: String?
    var erasing: Bool { get { tool == .eraser } set { tool = newValue ? .eraser : .pen } }
    @Published private(set) var strokes: [DrawingStroke] = []
    @Published private(set) var currentStroke: DrawingStroke?
    @Published private(set) var saveError: String?
    @Published private(set) var exportError: String?
    @Published private(set) var revision = 0
    private let draftURL: URL
    private let illustrationDirectory: URL?
    private var unreadableDraft = false
    private var hasEdits = false
    private var toolWidths: [DrawingTool: Double] = [.pen: 8, .marker: 24, .eraser: 32]
    private var cachedGuide: (String, CGImage)?
    private enum Action {
        case stroke(DrawingStroke)
        case clear([DrawingStroke])
        case template([DrawingStroke], String?, String?)
    }
    private var undoActions: [Action] = []
    private var redoActions: [Action] = []

    init(storageURL: URL? = nil, illustrationDirectory: URL? = nil) {
        let support = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        draftURL = storageURL ?? support.appendingPathComponent("com.feiwenchao.kidsprout.mac", isDirectory: true).appendingPathComponent("drawing-v1.json")
        self.illustrationDirectory = illustrationDirectory
        guard FileManager.default.fileExists(atPath: draftURL.path) else { return }
        do {
            var draft = try JSONDecoder().decode(DrawingDraft.self, from: Data(contentsOf: draftURL))
            guard [1, 2].contains(draft.version), draft.strokes.allSatisfy({ Self.isValid($0, version: draft.version) }), draft.templateID == nil || DrawingTemplateAsset.name(draft.templateID) != nil else { throw DrawingError.invalidDraft }
            if draft.version == 1 {
                // Old indices used six system colors; never reinterpret those indices
                // through the new twelve-color website palette.
                for index in draft.strokes.indices where draft.strokes[index].colorHex == nil {
                    draft.strokes[index].colorHex = Self.hex(Self.legacyPalette[draft.strokes[index].colorIndex])
                    if draft.strokes[index].erasing { draft.strokes[index].eraserScale = 3 }
                }
            }
            strokes = draft.strokes
            templateID = draft.templateID
            showGrid = draft.showGrid ?? false
        } catch {
            unreadableDraft = true
            saveError = "草稿暂时无法读取，已打开空白画纸。原文件会保留，新作会在绘画后保存。"
        }
    }
    var canUndo: Bool { !undoActions.isEmpty }
    var canRedo: Bool { !redoActions.isEmpty }
    var limitMessage: String? { strokes.count >= Self.strokeLimit ? "画纸已有 \(strokes.count) 笔，已达到新增上限。已有画作完整保留，可撤销或清空后继续。" : nil }
    func selectTool(_ newTool: DrawingTool) {
        guard newTool != tool else { return }
        toolWidths[tool] = width
        tool = newTool
        width = toolWidths[newTool] ?? 8
    }
    func selectTemplate(_ id: String?) {
        guard id != templateID, id == nil || DrawingTemplateAsset.name(id) != nil else { return }
        endStroke()
        undoActions.append(.template(strokes, templateID, id))
        redoActions.removeAll()
        strokes.removeAll()
        templateID = id
        changed()
    }
    func beginStroke(at point: CGPoint) {
        endStroke()
        guard strokes.count < Self.strokeLimit, let point = Self.validPoint(point) else { return }
        let index = min(max(colorIndex, 0), 11)
        currentStroke = DrawingStroke(colorIndex: index, width: min(max(width.isFinite ? width : 8, 2), 48), erasing: erasing, points: [point], colorHex: colorIndex < 0 ? DrawingPalette.hex(customColor) : DrawingPalette.hex[index], opacity: tool == .marker ? 0.32 : 1)
    }
    func appendPoint(_ point: CGPoint) {
        guard let point = Self.validPoint(point), var stroke = currentStroke, stroke.points.last != point else { return }
        stroke.points.append(point); currentStroke = stroke
    }
    func endStroke() {
        guard let stroke = currentStroke else { return }
        currentStroke = nil; strokes.append(stroke); undoActions.append(.stroke(stroke)); redoActions.removeAll(); changed()
    }
    func undo() {
        endStroke()
        guard let action = undoActions.popLast() else { return }
        switch action {
        case .stroke: strokes.removeLast()
        case .clear(let previous): strokes = previous
        case .template(let previous, let old, _): strokes = previous; templateID = old
        }
        redoActions.append(action); changed()
    }
    func redo() {
        endStroke()
        guard let action = redoActions.popLast() else { return }
        switch action {
        case .stroke(let stroke): strokes.append(stroke)
        case .clear: strokes.removeAll()
        case .template(_, _, let next): strokes.removeAll(); templateID = next
        }
        undoActions.append(action); changed()
    }
    func clear() {
        endStroke()
        guard !strokes.isEmpty else { return }
        undoActions.append(.clear(strokes)); redoActions.removeAll(); strokes.removeAll(); changed()
    }
    func save() {
        guard !unreadableDraft || hasEdits else { return }
        do {
            try FileManager.default.createDirectory(at: draftURL.deletingLastPathComponent(), withIntermediateDirectories: true)
            if unreadableDraft {
                let backup = draftURL.deletingLastPathComponent().appendingPathComponent("drawing-unreadable-\(UUID().uuidString).json")
                try FileManager.default.copyItem(at: draftURL, to: backup); unreadableDraft = false
            }
            try JSONEncoder().encode(DrawingDraft(version: 2, strokes: strokes, templateID: templateID, showGrid: showGrid)).write(to: draftURL, options: .atomic)
            saveError = nil
        } catch { saveError = "草稿未能保存，画作仍在当前窗口。请检查本机存储空间后重试。" }
    }
    func guideImage() -> CGImage? {
        guard let name = DrawingTemplateAsset.name(templateID) else { return nil }
        if let cachedGuide, cachedGuide.0 == name { return cachedGuide.1 }
        let url = illustrationDirectory?.appendingPathComponent("\(name).png") ?? Bundle.main.url(forResource: name, withExtension: "png", subdirectory: "illustrations")
        guard let url, let image = NSImage(contentsOf: url), let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else { return nil }
        cachedGuide = (name, cg); return cg
    }
    func drawBackground(in context: CGContext, exported: Bool = false) {
        context.setFillColor(NSColor.white.cgColor); context.fill(CGRect(origin: .zero, size: Self.paper))
        if !exported {
            context.saveGState(); context.setLineWidth(1)
            if showGrid {
                context.setStrokeColor(NSColor(red: 0.89, green: 0.92, blue: 0.86, alpha: 0.8).cgColor)
                for x in stride(from: 40, to: 1000, by: 40) { context.move(to: CGPoint(x: x, y: 0)); context.addLine(to: CGPoint(x: x, y: 700)) }
                for y in stride(from: 40, to: 700, by: 40) { context.move(to: CGPoint(x: 0, y: y)); context.addLine(to: CGPoint(x: 1000, y: y)) }
                context.strokePath()
            }
            if templateID != nil {
                context.setStrokeColor(NSColor(red: 0.85, green: 0.89, blue: 0.82, alpha: 1).cgColor)
                for y in [129.5, 276.5, 423.5, 570.5] { context.move(to: CGPoint(x: 100, y: y)); context.addLine(to: CGPoint(x: 900, y: y)) }
                context.strokePath()
            }
            context.restoreGState()
        }
        if let image = guideImage() {
            context.saveGState(); context.translateBy(x: 0, y: 700); context.scaleBy(x: 1, y: -1)
            context.draw(image, in: CGRect(origin: .zero, size: Self.paper)); context.restoreGState()
        }
    }
    func pngData() throws -> Data {
        guard let context = CGContext(data: nil, width: 2000, height: 1400, bitsPerComponent: 8, bytesPerRow: 8000, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else { throw DrawingError.renderFailed }
        context.translateBy(x: 0, y: 1400); context.scaleBy(x: 2, y: -2)
        drawBackground(in: context, exported: true)
        Self.render(strokes, in: context)
        guard let image = context.makeImage(), let data = NSBitmapImageRep(cgImage: image).representation(using: .png, properties: [:]) else { throw DrawingError.renderFailed }
        return data
    }
    @discardableResult func exportPNG(to url: URL) -> Bool {
        do { endStroke(); try pngData().write(to: url, options: .atomic); exportError = nil; return true }
        catch { exportError = "图片保存失败，请检查所选位置的写入权限和存储空间后重试。"; return false }
    }
    static func render(_ strokes: [DrawingStroke], in context: CGContext) {
        context.saveGState(); context.beginTransparencyLayer(auxiliaryInfo: nil)
        context.setLineCap(.round); context.setLineJoin(.round); context.setAllowsAntialiasing(true)
        for stroke in strokes {
            guard let first = stroke.points.first else { continue }
            let color = stroke.colorHex.map { NSColor(DrawingPalette.color($0)) } ?? palette[min(max(stroke.colorIndex, 0), 11)]
            context.setBlendMode(stroke.erasing ? .clear : .normal)
            context.setAlpha(stroke.erasing ? 1 : stroke.opacity ?? 1)
            let width = stroke.width * (stroke.erasing ? stroke.eraserScale ?? 1 : 1)
            context.setStrokeColor(color.cgColor); context.setFillColor(color.cgColor); context.setLineWidth(width)
            if stroke.points.count == 1 { context.fillEllipse(in: CGRect(x: first.x - width/2, y: first.y - width/2, width: width, height: width)) }
            else {
                context.beginPath(); context.move(to: CGPoint(x: first.x, y: first.y))
                for point in stroke.points.dropFirst() { context.addLine(to: CGPoint(x: point.x, y: point.y)) }
                context.strokePath()
            }
        }
        context.endTransparencyLayer(); context.restoreGState()
    }
    private func changed() { hasEdits = true; revision += 1; save() }
    private static func validPoint(_ point: CGPoint) -> DrawingPoint? {
        guard point.x.isFinite, point.y.isFinite else { return nil }
        return DrawingPoint(x: min(max(point.x, 0), 1000), y: min(max(point.y, 0), 700))
    }
    private static func hex(_ color: NSColor) -> String {
        let rgb = color.usingColorSpace(.deviceRGB) ?? .black
        return String(format: "#%02X%02X%02X", Int((rgb.redComponent * 255).rounded()), Int((rgb.greenComponent * 255).rounded()), Int((rgb.blueComponent * 255).rounded()))
    }
    private static func isValid(_ stroke: DrawingStroke, version: Int) -> Bool {
        (0..<(version == 1 ? 6 : 12)).contains(stroke.colorIndex) && stroke.width.isFinite && (version == 1 ? 3...24 : 2...48).contains(stroke.width)
            && (stroke.colorHex == nil || DrawingPalette.isValid(stroke.colorHex!)) && (stroke.opacity == nil || (stroke.opacity!.isFinite && (0...1).contains(stroke.opacity!)))
            && (stroke.eraserScale == nil || (stroke.eraserScale!.isFinite && (1...3).contains(stroke.eraserScale!)))
            && !stroke.points.isEmpty && stroke.points.allSatisfy { $0.x.isFinite && $0.y.isFinite && (0...1000).contains($0.x) && (0...700).contains($0.y) }
    }
    private enum DrawingError: Error { case invalidDraft, renderFailed }
}

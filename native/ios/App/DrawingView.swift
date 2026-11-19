#if os(iOS)
import SwiftUI
import PencilKit

private struct PencilDraft: Codable {
    var version: Int
    var drawing: Data
    var templateID: String?
    var showGrid: Bool
}
final class PersistentPKCanvasView: PKCanvasView {
    private let drawingHistory = UndoManager()
    override var undoManager: UndoManager? { drawingHistory }
}

@MainActor final class DrawingModel: ObservableObject {
    static let paper = CGSize(width: 1000, height: 700)
    let canvas = PersistentPKCanvasView()
    @Published var revision = 0
    @Published var colorIndex = 0
    @Published var customColor = DrawingPalette.color("#52775E")
    @Published var width: Double = 8
    @Published private(set) var tool: DrawingTool = .pen
    @Published var showGrid = false
    @Published private(set) var templateID: String?
    @Published var saveError: String?
    var erasing: Bool { get { tool == .eraser } set { tool = newValue ? .eraser : .pen; updateTool() } }
    let colors = DrawingPalette.hex.map { UIColor(DrawingPalette.color($0)) }
    let colorNames = DrawingPalette.names
    private let draftURL: URL
    private let illustrationDirectory: URL?
    private var unreadableDraft = false
    private var hasEdits = false
    private var toolWidths: [DrawingTool: Double] = [.pen: 8, .marker: 24, .eraser: 32]
    private var cachedGuide: (String, UIImage)?
    init(storageURL: URL? = nil, illustrationDirectory: URL? = nil) {
        let folder = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        draftURL = storageURL ?? folder.appendingPathComponent("sprout-drawing-v1.pkdrawing")
        self.illustrationDirectory = illustrationDirectory
        canvas.drawingPolicy = .anyInput
        canvas.isScrollEnabled = false
        canvas.backgroundColor = .clear
        canvas.isOpaque = false
        canvas.overrideUserInterfaceStyle = .light
        canvas.accessibilityIdentifier = "drawingCanvas"
        canvas.accessibilityLabel = "画纸，支持手指和 Apple Pencil 绘画"
        if FileManager.default.fileExists(atPath: draftURL.path) {
            do {
                let data = try Data(contentsOf: draftURL)
                if let draft = try? JSONDecoder().decode(PencilDraft.self, from: data) {
                    guard draft.version == 2, draft.templateID == nil || DrawingTemplateAsset.name(draft.templateID) != nil else { throw CocoaError(.fileReadCorruptFile) }
                    canvas.drawing = try PKDrawing(data: draft.drawing)
                    templateID = draft.templateID
                    showGrid = draft.showGrid
                } else { canvas.drawing = try PKDrawing(data: data) }
            } catch {
                unreadableDraft = true
                saveError = "草稿暂时无法读取，已打开空白画纸。原文件会保留，新作会在绘画后保存。"
            }
        }
        updateTool()
    }
    var canUndo: Bool { canvas.undoManager?.canUndo ?? false }
    var canRedo: Bool { canvas.undoManager?.canRedo ?? false }
    func selectTool(_ newTool: DrawingTool) {
        guard newTool != tool else { return }
        toolWidths[tool] = width; tool = newTool; width = toolWidths[newTool] ?? 8; updateTool()
    }
    func updateTool() {
        let size = min(max(width.isFinite ? width : 8, 2), 48)
        let color = colorIndex < 0 ? UIColor(customColor) : colors[min(max(colorIndex, 0), 11)]
        switch tool {
        case .eraser: canvas.tool = PKEraserTool(.bitmap, width: size)
        case .pen: canvas.tool = PKInkingTool(.pen, color: color, width: size)
        case .marker: canvas.tool = PKInkingTool(.marker, color: color.withAlphaComponent(0.32), width: size)
        }
    }
    func selectTemplate(_ id: String?) {
        guard id != templateID, id == nil || DrawingTemplateAsset.name(id) != nil else { return }
        replace(with: PKDrawing(), template: id)
    }
    func drawingChanged() { hasEdits = true; revision += 1; save() }
    func save() {
        guard !unreadableDraft || hasEdits else { return }
        do {
            try FileManager.default.createDirectory(at: draftURL.deletingLastPathComponent(), withIntermediateDirectories: true)
            if unreadableDraft {
                try FileManager.default.copyItem(at: draftURL, to: draftURL.deletingLastPathComponent().appendingPathComponent("drawing-unreadable-\(UUID().uuidString).pkdrawing"))
                unreadableDraft = false
            }
            // One atomic envelope keeps the selected guide and ink in the same
            // transaction. Raw PKDrawing v1 files are still accepted above.
            let draft = PencilDraft(version: 2, drawing: canvas.drawing.dataRepresentation(), templateID: templateID, showGrid: showGrid)
            try JSONEncoder().encode(draft).write(to: draftURL, options: .atomic)
            saveError = nil
        } catch { saveError = "草稿未能保存，画作仍在当前页面。请检查本机存储空间后重试。" }
    }
    func undo() { canvas.undoManager?.undo(); drawingChanged() }
    func redo() { canvas.undoManager?.redo(); drawingChanged() }
    func clear() { guard !canvas.drawing.strokes.isEmpty else { return }; replace(with: PKDrawing(), template: templateID) }
    private func replace(with drawing: PKDrawing, template: String?) {
        let old = canvas.drawing, oldTemplate = templateID
        canvas.undoManager?.registerUndo(withTarget: self) { target in target.replace(with: old, template: oldTemplate) }
        templateID = template
        canvas.drawing = drawing
        drawingChanged()
    }
    private func guideImage() -> UIImage? {
        guard let name = DrawingTemplateAsset.name(templateID) else { return nil }
        if let cachedGuide, cachedGuide.0 == name { return cachedGuide.1 }
        let url = illustrationDirectory?.appendingPathComponent("\(name).png") ?? Bundle.main.url(forResource: name, withExtension: "png", subdirectory: "illustrations")
        guard let url, let image = UIImage(contentsOfFile: url.path) else { return nil }
        cachedGuide = (name, image); return image
    }
    func drawBackground(in context: CGContext, exported: Bool = false) {
        context.setFillColor(UIColor.white.cgColor); context.fill(CGRect(origin: .zero, size: Self.paper))
        if !exported {
            context.saveGState(); context.setLineWidth(1)
            if showGrid {
                context.setStrokeColor(UIColor(red: 0.89, green: 0.92, blue: 0.86, alpha: 0.8).cgColor)
                for x in stride(from: 40, to: 1000, by: 40) { context.move(to: CGPoint(x: x, y: 0)); context.addLine(to: CGPoint(x: x, y: 700)) }
                for y in stride(from: 40, to: 700, by: 40) { context.move(to: CGPoint(x: 0, y: y)); context.addLine(to: CGPoint(x: 1000, y: y)) }
                context.strokePath()
            }
            if templateID != nil {
                context.setStrokeColor(UIColor(red: 0.85, green: 0.89, blue: 0.82, alpha: 1).cgColor)
                for y in [129.5, 276.5, 423.5, 570.5] { context.move(to: CGPoint(x: 100, y: y)); context.addLine(to: CGPoint(x: 900, y: y)) }
                context.strokePath()
            }
            context.restoreGState()
        }
        guideImage()?.draw(in: CGRect(origin: .zero, size: Self.paper))
    }
    func exportPNG() -> URL? {
        let format = UIGraphicsImageRendererFormat(); format.scale = 2
        let image = UIGraphicsImageRenderer(size: Self.paper, format: format).image { context in
            drawBackground(in: context.cgContext, exported: true)
            canvas.drawing.image(from: CGRect(origin: .zero, size: Self.paper), scale: 2).draw(in: CGRect(origin: .zero, size: Self.paper))
        }
        let directory = FileManager.default.temporaryDirectory.appendingPathComponent("sprout-export-\(UUID().uuidString)", isDirectory: true)
        let url = directory.appendingPathComponent("萌呀小画家.png")
        do {
            guard let data = image.pngData() else { throw CocoaError(.fileWriteUnknown) }
            try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
            try data.write(to: url, options: .atomic); return url
        } catch { saveError = "图片暂时无法导出，请再试一次。"; return nil }
    }
}

private final class FixedPaperView: UIView {
    let board: DrawingModel
    init(board: DrawingModel) {
        self.board = board
        super.init(frame: .zero)
        backgroundColor = .white; clipsToBounds = true; addSubview(board.canvas)
    }
    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }
    override func layoutSubviews() {
        super.layoutSubviews()
        let scale = min(bounds.width / DrawingModel.paper.width, bounds.height / DrawingModel.paper.height)
        let canvas = board.canvas
        canvas.transform = .identity
        canvas.frame = CGRect(origin: .zero, size: DrawingModel.paper)
        canvas.contentSize = DrawingModel.paper
        canvas.transform = CGAffineTransform(scaleX: scale, y: scale)
        canvas.center = CGPoint(x: bounds.midX, y: bounds.midY)
        setNeedsDisplay()
    }
    override func draw(_ rect: CGRect) {
        guard let context = UIGraphicsGetCurrentContext() else { return }
        let scale = min(bounds.width / 1000, bounds.height / 700)
        context.saveGState(); context.translateBy(x: (bounds.width - 1000 * scale)/2, y: (bounds.height - 700 * scale)/2); context.scaleBy(x: scale, y: scale)
        board.drawBackground(in: context); context.restoreGState()
    }
    override func didMoveToWindow() { super.didMoveToWindow(); if window != nil { board.canvas.becomeFirstResponder() } }
}
private struct PaperCanvas: UIViewRepresentable {
    @ObservedObject var board: DrawingModel
    func makeCoordinator() -> Coordinator { Coordinator(board) }
    func makeUIView(context: Context) -> UIView { board.canvas.delegate = context.coordinator; return FixedPaperView(board: board) }
    func updateUIView(_ uiView: UIView, context: Context) { board.updateTool(); uiView.setNeedsDisplay() }
    final class Coordinator: NSObject, PKCanvasViewDelegate {
        let board: DrawingModel
        init(_ board: DrawingModel) { self.board = board }
        func canvasViewDrawingDidChange(_ canvasView: PKCanvasView) { board.drawingChanged() }
    }
}

struct DrawingView: View {
    @EnvironmentObject private var board: DrawingModel
    @EnvironmentObject private var model: AppModel
    @Environment(\.scenePhase) private var scenePhase
    @Environment(\.dismiss) private var dismiss
    var expanded = false
    @State private var showFullscreen = false
    @State private var sheet: ExportSheet?
    @State private var pendingShare = false
    @State private var confirmClear = false
    private enum ExportSheet: Identifiable {
        case gate, share(URL)
        var id: String { switch self { case .gate: "gate"; case .share: "share" } }
    }
    var body: some View {
        Page {
            SectionHeader(eyebrow: "LITTLE ARTIST · 自由创作", title: "小小画板 ✧", detail: "让想象力，跟着小手自由生长。")
            HStack {
                Button { if expanded { dismiss() } else { showFullscreen = true } } label: { Label(expanded ? "退出全屏" : "全屏", systemImage: expanded ? "arrow.down.right.and.arrow.up.left" : "arrow.up.left.and.arrow.down.right") }.accessibilityIdentifier("drawingFullscreen")
                Spacer(); exportButton
            }
            DrawingWorkspaceLayout {
                DrawingToolbox(selectedTool: Binding(get: { board.tool }, set: board.selectTool), colorIndex: $board.colorIndex, customColor: $board.customColor, width: $board.width)
            } paper: {
                VStack(alignment: .leading, spacing: 16) {
                    DrawingTracingPicker(templates: model.curriculum?.tracingTemplates ?? [], selectedID: board.templateID, select: board.selectTemplate)
                    HStack(spacing: 10) { Text("我的画纸").font(.caption).foregroundStyle(Sprout.muted); Spacer(minLength: 0); historyButtons }
                    DrawingPaperMat {
                        Group {
                            if showFullscreen { Color.white }
                            else { PaperCanvas(board: board) }
                        }.aspectRatio(10.0/7.0, contentMode: .fit).background(.white)
                            .overlay { if board.canvas.drawing.strokes.isEmpty && board.templateID == nil { DrawingEmptyPrompt() } }
                            .clipShape(RoundedRectangle(cornerRadius: 6)).accessibilityIdentifier("paper")
                    }
                    Text(board.templateID == nil ? "选一支喜欢的颜色，画下第一个小灵感吧" : "临摹底稿会保留在作品里；网格和辅助线不会导出。").font(.caption).foregroundStyle(Sprout.muted)
                }
            }
            Text(board.saveError ?? "支持手指与 Apple Pencil · 草稿自动保存 · 作品只保存在这台设备。").font(.footnote).foregroundStyle(board.saveError == nil ? Sprout.muted : Sprout.orange)
        }
        .navigationTitle("小小画板")
        .onDisappear { board.save() }
        .onChange(of: scenePhase) { _, state in if state != .active { board.save() } }
        .confirmationDialog("清空画纸？清空后可以点撤销找回。", isPresented: $confirmClear, titleVisibility: .visible) { Button("清空画纸", role: .destructive) { board.clear() } }
        .fullScreenCover(isPresented: $showFullscreen) { DrawingView(expanded: true).environmentObject(board).environmentObject(model) }
        .sheet(item: $sheet, onDismiss: {
            if pendingShare { pendingShare = false; if let url = board.exportPNG() { sheet = .share(url) } }
        }) { route in
            switch route { case .gate: ParentGate { pendingShare = true; sheet = nil }; case .share(let url): SystemShare(url: url) }
        }
    }
    private var historyButtons: some View {
        Group {
            Button { board.undo() } label: { Label("撤销", systemImage: "arrow.uturn.backward") }.disabled(!board.canUndo).keyboardShortcut("z", modifiers: .command).accessibilityIdentifier("undoDrawing")
            Button { board.redo() } label: { Label("重做", systemImage: "arrow.uturn.forward") }.disabled(!board.canRedo).keyboardShortcut("z", modifiers: [.command, .shift]).accessibilityIdentifier("redoDrawing")
            Button { board.showGrid.toggle(); board.save() } label: { Label("网格", systemImage: "square.grid.3x3") }.tint(board.showGrid ? Sprout.green : Sprout.muted).accessibilityIdentifier("drawingGrid")
            Button { confirmClear = true } label: { Label("清空", systemImage: "trash") }.disabled(board.canvas.drawing.strokes.isEmpty).accessibilityIdentifier("clearDrawing")
        }.font(.caption).frame(minHeight: 44)
    }
    private var exportButton: some View {
        Button { sheet = .gate } label: { Label("保存我的画", systemImage: "square.and.arrow.up").frame(minHeight: 44) }.buttonStyle(.borderedProminent).accessibilityIdentifier("shareDrawing")
    }
}
private struct SystemShare: UIViewControllerRepresentable {
    let url: URL
    func makeUIViewController(context: Context) -> UIActivityViewController { UIActivityViewController(activityItems: [url], applicationActivities: nil) }
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
#endif

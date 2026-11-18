import SwiftUI
import PencilKit

@MainActor final class DrawingModel: ObservableObject {
    static let paper = CGSize(width: 1000, height: 700)
    let canvas = PKCanvasView()
    @Published var revision = 0
    @Published var colorIndex = 0
    @Published var width: Double = 8
    @Published var erasing = false
    @Published var saveError: String?
    let colors: [UIColor] = [.label, .systemRed, .systemOrange, .systemGreen, .systemBlue, .systemPurple]
    let colorNames = ["墨黑", "红色", "橙色", "绿色", "蓝色", "紫色"]
    private let draftURL: URL
    init(storageURL: URL? = nil) {
        let folder = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        try? FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        draftURL = storageURL ?? folder.appendingPathComponent("sprout-drawing-v1.pkdrawing")
        canvas.drawingPolicy = .anyInput
        canvas.isScrollEnabled = false
        canvas.backgroundColor = .clear
        canvas.isOpaque = false
        canvas.overrideUserInterfaceStyle = .light
        canvas.accessibilityIdentifier = "drawingCanvas"
        canvas.accessibilityLabel = "画纸，支持手指和 Apple Pencil 绘画"
        if let data = try? Data(contentsOf: draftURL), let drawing = try? PKDrawing(data: data) { canvas.drawing = drawing }
        updateTool()
    }
    var canUndo: Bool { canvas.undoManager?.canUndo ?? false }
    var canRedo: Bool { canvas.undoManager?.canRedo ?? false }
    func updateTool() {
        canvas.tool = erasing ? PKEraserTool(.bitmap, width: width * 3) : PKInkingTool(.pen, color: colorIndex == 0 ? .black : colors[colorIndex], width: width)
    }
    func drawingChanged() { revision += 1; save() }
    func save() {
        do { try canvas.drawing.dataRepresentation().write(to: draftURL, options: .atomic); saveError = nil }
        catch { saveError = "草稿未能保存，请稍后再试。" }
    }
    func undo() { canvas.undoManager?.undo(); drawingChanged() }
    func redo() { canvas.undoManager?.redo(); drawingChanged() }
    func clear() { replace(with: PKDrawing()) }
    private func replace(with drawing: PKDrawing) {
        let old = canvas.drawing
        canvas.undoManager?.registerUndo(withTarget: self) { target in target.replace(with: old) }
        canvas.drawing = drawing
        drawingChanged()
    }
    func exportPNG() -> URL? {
        let format = UIGraphicsImageRendererFormat()
        format.scale = 2
        let renderer = UIGraphicsImageRenderer(size: Self.paper, format: format)
        let image = renderer.image { context in
            UIColor.white.setFill()
            context.fill(CGRect(origin: .zero, size: Self.paper))
            canvas.drawing.image(from: CGRect(origin: .zero, size: Self.paper), scale: 2).draw(in: CGRect(origin: .zero, size: Self.paper))
        }
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("萌芽小画家.png")
        do { try image.pngData()?.write(to: url, options: .atomic); return url }
        catch { saveError = "图片暂时无法导出，请再试一次。"; return nil }
    }
}

private final class FixedPaperView: UIView {
    let canvas: PKCanvasView
    init(canvas: PKCanvasView) {
        self.canvas = canvas
        super.init(frame: .zero)
        backgroundColor = .white
        clipsToBounds = true
        addSubview(canvas)
    }
    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }
    override func layoutSubviews() {
        super.layoutSubviews()
        let scale = min(bounds.width / DrawingModel.paper.width, bounds.height / DrawingModel.paper.height)
        canvas.transform = .identity
        canvas.frame = CGRect(origin: .zero, size: DrawingModel.paper)
        canvas.contentSize = DrawingModel.paper
        canvas.transform = CGAffineTransform(scaleX: scale, y: scale)
        canvas.center = CGPoint(x: bounds.midX, y: bounds.midY)
    }
    override func didMoveToWindow() { super.didMoveToWindow(); if window != nil { canvas.becomeFirstResponder() } }
}

private struct PaperCanvas: UIViewRepresentable {
    @ObservedObject var board: DrawingModel
    func makeCoordinator() -> Coordinator { Coordinator(board) }
    func makeUIView(context: Context) -> UIView {
        board.canvas.delegate = context.coordinator
        return FixedPaperView(canvas: board.canvas)
    }
    func updateUIView(_ uiView: UIView, context: Context) { board.updateTool() }
    final class Coordinator: NSObject, PKCanvasViewDelegate {
        let board: DrawingModel
        init(_ board: DrawingModel) { self.board = board }
        func canvasViewDrawingDidChange(_ canvasView: PKCanvasView) { board.drawingChanged() }
    }
}

struct DrawingView: View {
    @EnvironmentObject private var board: DrawingModel
    @Environment(\.scenePhase) private var scenePhase
    @State private var sheet: ExportSheet?
    @State private var pendingShare = false
    @State private var confirmClear = false
    private enum ExportSheet: Identifiable {
        case gate
        case share(URL)
        var id: String { switch self { case .gate: "gate"; case .share: "share" } }
    }
    var body: some View {
        Page {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 7) { Text("今天的灵感，画在这里").font(.title2.bold()); Text("支持手指与 Apple Pencil · 草稿自动保存").font(.subheadline).foregroundStyle(.secondary) }
                Spacer()
                Image(systemName: "pencil.and.scribble").font(.largeTitle).foregroundStyle(Sprout.green)
            }
            Panel {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 44), spacing: 12)], spacing: 10) {
                    ForEach(board.colors.indices, id: \.self) { index in
                        Button { board.colorIndex = index; board.erasing = false; board.updateTool() } label: {
                            Circle().fill(index == 0 ? Color.black : Color(uiColor: board.colors[index])).frame(width: 29, height: 29).padding(6).overlay(Circle().stroke(board.colorIndex == index && !board.erasing ? Sprout.green : .clear, lineWidth: 3)).frame(width: 44, height: 44).contentShape(Rectangle())
                        }.frame(minWidth: 44, minHeight: 44).accessibilityLabel("\(board.colorNames[index])画笔").accessibilityAddTraits(board.colorIndex == index && !board.erasing ? .isSelected : []).accessibilityIdentifier("color\(index)")
                    }
                    Button { board.erasing.toggle(); board.updateTool() } label: { Image(systemName: "eraser.fill").font(.title2).frame(width: 44, height: 44).background(board.erasing ? Sprout.mint : .clear, in: RoundedRectangle(cornerRadius: 12)) }.accessibilityLabel("橡皮擦").accessibilityIdentifier("eraser")
                }
                HStack { Text(board.erasing ? "橡皮大小" : "画笔粗细").font(.subheadline); Slider(value: $board.width, in: 3...24, step: 1).onChange(of: board.width) { _, _ in board.updateTool() }.accessibilityLabel("画笔粗细"); Text("\(Int(board.width))").font(.caption.monospacedDigit()).frame(width: 24) }
            }
            PaperCanvas(board: board).aspectRatio(10.0/7.0, contentMode: .fit).background(.white).clipShape(RoundedRectangle(cornerRadius: 16)).overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.gray.opacity(0.25))).accessibilityIdentifier("paper")
            ViewThatFits(in: .horizontal) {
                HStack(spacing: 12) { historyButtons; Spacer(); exportButton }
                VStack(spacing: 15) { HStack { historyButtons; Spacer() }; exportButton }
            }
            Text(board.saveError ?? "画纸大小固定，旋转屏幕也不会挤坏画作。作品只保存在这台设备。").font(.footnote).foregroundStyle(board.saveError == nil ? Color.secondary : Sprout.orange)
        }
        .navigationTitle("小小画板")
        .onDisappear { board.save() }
        .onChange(of: scenePhase) { _, state in if state != .active { board.save() } }
        .confirmationDialog("清空画纸？清空后可以点撤销找回。", isPresented: $confirmClear, titleVisibility: .visible) { Button("清空画纸", role: .destructive) { board.clear() } }
        .sheet(item: $sheet, onDismiss: {
            if pendingShare { pendingShare = false; if let url = board.exportPNG() { sheet = .share(url) } }
        }) { route in
            switch route {
            case .gate: ParentGate { pendingShare = true; sheet = nil }
            case .share(let url): SystemShare(url: url)
            }
        }
    }
    private var historyButtons: some View {
        Group {
            Button { board.undo() } label: { Label("撤销", systemImage: "arrow.uturn.backward").frame(minHeight: 44) }.disabled(!board.canUndo).accessibilityIdentifier("undoDrawing")
            Button { board.redo() } label: { Label("重做", systemImage: "arrow.uturn.forward").frame(minHeight: 44) }.disabled(!board.canRedo).accessibilityIdentifier("redoDrawing")
            Button { confirmClear = true } label: { Label("清空", systemImage: "trash").frame(minHeight: 44) }.accessibilityIdentifier("clearDrawing")
        }.font(.subheadline)
    }
    private var exportButton: some View {
        Button { sheet = .gate } label: { Label("分享 PNG", systemImage: "square.and.arrow.up").frame(minHeight: 44) }.buttonStyle(.borderedProminent).accessibilityIdentifier("shareDrawing")
    }
}

private struct SystemShare: UIViewControllerRepresentable {
    let url: URL
    func makeUIViewController(context: Context) -> UIActivityViewController { UIActivityViewController(activityItems: [url], applicationActivities: nil) }
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

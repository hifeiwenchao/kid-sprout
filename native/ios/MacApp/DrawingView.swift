import AppKit
import SwiftUI
import UniformTypeIdentifiers

private final class MacCanvasView: NSView {
    let board: DrawingModel
    override var isFlipped: Bool { true }
    override var acceptsFirstResponder: Bool { true }
    init(board: DrawingModel) {
        self.board = board
        super.init(frame: .zero)
        setAccessibilityElement(true)
        setAccessibilityRole(.image)
        setAccessibilityIdentifier("drawingCanvas")
        setAccessibilityLabel("画纸，使用鼠标或触控板按住拖动画画")
    }
    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }
    private var paperRect: CGRect {
        let scale = min(bounds.width / DrawingModel.paper.width, bounds.height / DrawingModel.paper.height)
        let size = CGSize(width: DrawingModel.paper.width * scale, height: DrawingModel.paper.height * scale)
        return CGRect(x: bounds.midX - size.width / 2, y: bounds.midY - size.height / 2, width: size.width, height: size.height)
    }
    private func logicalPoint(_ event: NSEvent) -> CGPoint {
        let point = convert(event.locationInWindow, from: nil)
        let rect = paperRect
        return CGPoint(x: (point.x - rect.minX) * 1000 / max(rect.width, 1), y: (point.y - rect.minY) * 700 / max(rect.height, 1))
    }
    override func draw(_ dirtyRect: NSRect) {
        guard let context = NSGraphicsContext.current?.cgContext else { return }
        context.setFillColor(NSColor.white.cgColor)
        context.fill(bounds)
        let rect = paperRect
        context.saveGState()
        context.clip(to: rect)
        context.translateBy(x: rect.minX, y: rect.minY)
        context.scaleBy(x: rect.width / 1000, y: rect.height / 700)
        DrawingModel.render(board.strokes, in: context)
        if let stroke = board.currentStroke { DrawingModel.render([stroke], in: context) }
        context.restoreGState()
    }
    override func mouseDown(with event: NSEvent) {
        window?.makeFirstResponder(self)
        guard paperRect.contains(convert(event.locationInWindow, from: nil)) else { return }
        board.beginStroke(at: logicalPoint(event))
        needsDisplay = true
    }
    override func mouseDragged(with event: NSEvent) {
        board.appendPoint(logicalPoint(event))
        needsDisplay = true
    }
    override func mouseUp(with event: NSEvent) {
        board.appendPoint(logicalPoint(event))
        board.endStroke()
        needsDisplay = true
    }
    override func keyDown(with event: NSEvent) {
        if event.modifierFlags.contains(.command), event.charactersIgnoringModifiers?.lowercased() == "z" {
            if event.modifierFlags.contains(.shift) { board.redo() } else { board.undo() }
            needsDisplay = true
        } else { super.keyDown(with: event) }
    }
    override func viewWillMove(toWindow newWindow: NSWindow?) {
        if newWindow == nil { board.endStroke() }
        super.viewWillMove(toWindow: newWindow)
    }
}

private struct PaperCanvas: NSViewRepresentable {
    @ObservedObject var board: DrawingModel
    func makeNSView(context: Context) -> MacCanvasView { MacCanvasView(board: board) }
    func updateNSView(_ view: MacCanvasView, context: Context) {
        view.setAccessibilityValue("\(board.strokes.count) 笔")
        view.needsDisplay = true
    }
}

struct DrawingView: View {
    @EnvironmentObject private var board: DrawingModel
    @Environment(\.scenePhase) private var scenePhase
    @State private var showGate = false
    @State private var pendingExport = false
    @State private var exportInProgress = false
    @State private var confirmClear = false
    @State private var exportMessage: String?
    @State private var exportHostWindow: NSWindow?
    @State private var sheetEndObserver: NSObjectProtocol?
    @State private var activeSavePanel: NSSavePanel?

    var body: some View {
        Page {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 7) {
                    Text("今天的灵感，画在这里").font(.title2.bold())
                    Text("鼠标或触控板按住拖动 · 草稿自动保存").font(.subheadline).foregroundStyle(.secondary)
                }
                Spacer()
                Image(systemName: "pencil.and.scribble").font(.largeTitle).foregroundStyle(Sprout.green)
            }
            Panel {
                HStack(spacing: 12) {
                    ForEach(board.colors.indices, id: \.self) { index in
                        Button { board.colorIndex = index; board.erasing = false } label: {
                            Circle().fill(Color(nsColor: board.colors[index])).frame(width: 26, height: 26).padding(7)
                                .overlay(Circle().stroke(board.colorIndex == index && !board.erasing ? Sprout.green : .clear, lineWidth: 3))
                                .frame(width: 44, height: 44).contentShape(Rectangle())
                        }.buttonStyle(.plain).accessibilityLabel("\(board.colorNames[index])画笔")
                            .accessibilityAddTraits(board.colorIndex == index && !board.erasing ? .isSelected : []).accessibilityIdentifier("color\(index)")
                    }
                    Button { board.erasing.toggle() } label: {
                        Image(systemName: "eraser.fill").font(.title2).frame(width: 44, height: 44).background(board.erasing ? Sprout.mint : .clear, in: RoundedRectangle(cornerRadius: 12))
                    }.buttonStyle(.plain).accessibilityLabel("橡皮擦").accessibilityIdentifier("eraser")
                    Spacer(minLength: 0)
                }
                HStack {
                    Text(board.erasing ? "橡皮大小" : "画笔粗细").font(.subheadline)
                    Slider(value: $board.width, in: 3...24, step: 1).accessibilityLabel("画笔粗细").accessibilityIdentifier("drawingWidth")
                    Text("\(Int(board.width))").font(.caption.monospacedDigit()).frame(width: 24)
                }
            }
            PaperCanvas(board: board).aspectRatio(10.0 / 7.0, contentMode: .fit)
                .background(.white).clipShape(RoundedRectangle(cornerRadius: 16))
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.gray.opacity(0.3)))
                .accessibilityIdentifier("paper")
            ViewThatFits(in: .horizontal) {
                HStack(spacing: 12) { historyButtons; Spacer(); exportButton }
                VStack(spacing: 15) { HStack { historyButtons; Spacer() }; exportButton }
            }
            if let message = board.saveError { feedback(message, error: true) }
            if let message = board.limitMessage { feedback(message, error: true) }
            if let message = exportMessage { feedback(message, error: board.exportError != nil) }
            Text("画纸大小固定，调整窗口也不会挤坏画作。作品只保存在这台 Mac。").font(.footnote).foregroundStyle(.secondary)
        }
        .navigationTitle("小小画板")
        .onDisappear { board.endStroke(); board.save() }
        .onChange(of: scenePhase) { _, state in if state != .active { board.endStroke(); board.save() } }
        .confirmationDialog("清空画纸？清空后可以点撤销找回。", isPresented: $confirmClear, titleVisibility: .visible) {
            Button("清空画纸", role: .destructive) { board.clear() }
            Button("取消", role: .cancel) {}
        }
        .sheet(isPresented: $showGate, onDismiss: {
            guard pendingExport else { finishExportPresentation(); return }
            pendingExport = false
            presentAfterGateEnds()
        }) {
            ParentGate { pendingExport = true; showGate = false }
        }
    }

    private var historyButtons: some View {
        Group {
            Button { board.undo() } label: { Label("撤销", systemImage: "arrow.uturn.backward").frame(minHeight: 36) }
                .disabled(!board.canUndo).keyboardShortcut("z", modifiers: .command).help("撤销（⌘Z）").accessibilityIdentifier("undoDrawing")
            Button { board.redo() } label: { Label("重做", systemImage: "arrow.uturn.forward").frame(minHeight: 36) }
                .disabled(!board.canRedo).keyboardShortcut("z", modifiers: [.command, .shift]).help("重做（⇧⌘Z）").accessibilityIdentifier("redoDrawing")
            Button { confirmClear = true } label: { Label("清空", systemImage: "trash").frame(minHeight: 36) }
                .disabled(board.strokes.isEmpty).accessibilityIdentifier("clearDrawing")
        }.font(.subheadline)
    }

    private var exportButton: some View {
        Button {
            board.endStroke()
            exportMessage = nil
            // Capture the document window before the parent gate becomes key.
            guard var window = NSApp.keyWindow ?? NSApp.mainWindow else {
                exportMessage = "暂时无法打开保存窗口，请重新进入画板后重试。"
                return
            }
            while let parent = window.sheetParent { window = parent }
            exportHostWindow = window
            pendingExport = false
            exportInProgress = true
            showGate = true
        } label: { Label("保存 PNG", systemImage: "square.and.arrow.down").frame(minHeight: 36) }
            .buttonStyle(.borderedProminent).disabled(exportInProgress).accessibilityIdentifier("shareDrawing")
    }

    private func feedback(_ message: String, error: Bool) -> some View {
        Text(message).font(.footnote).foregroundStyle(error ? Sprout.orange : Sprout.green).accessibilityIdentifier("drawingFeedback")
    }

    private func presentAfterGateEnds() {
        guard let window = exportHostWindow, window.isVisible else {
            exportMessage = "暂时无法打开保存窗口，请重新进入画板后重试。"
            finishExportPresentation()
            return
        }
        // SwiftUI calls onDismiss while its AppKit sheet can still be attached.
        // Wait for the owning window's sheet transition rather than targeting the
        // transient key window or delaying for an arbitrary animation duration.
        if window.attachedSheet != nil {
            sheetEndObserver = NotificationCenter.default.addObserver(forName: NSWindow.didEndSheetNotification, object: window, queue: .main) { _ in
                if let observer = sheetEndObserver { NotificationCenter.default.removeObserver(observer) }
                sheetEndObserver = nil
                DispatchQueue.main.async { chooseExportLocation(in: window) }
            }
        } else {
            DispatchQueue.main.async { chooseExportLocation(in: window) }
        }
    }

    private func chooseExportLocation(in window: NSWindow) {
        let panel = NSSavePanel()
        panel.title = "保存小画家的作品"
        panel.nameFieldStringValue = "萌芽小画家.png"
        panel.allowedContentTypes = [.png]
        panel.canCreateDirectories = true
        panel.isExtensionHidden = false
        activeSavePanel = panel
        let complete: (NSApplication.ModalResponse) -> Void = { response in
            finishExportPresentation()
            guard response == .OK, let url = panel.url else { exportMessage = "已取消保存，画作仍保留在画纸上。"; return }
            exportMessage = board.exportPNG(to: url) ? "作品已保存为 PNG 图片。" : board.exportError
        }
        panel.beginSheetModal(for: window, completionHandler: complete)
    }

    private func finishExportPresentation() {
        if let observer = sheetEndObserver { NotificationCenter.default.removeObserver(observer) }
        sheetEndObserver = nil
        activeSavePanel = nil
        exportHostWindow = nil
        exportInProgress = false
    }
}

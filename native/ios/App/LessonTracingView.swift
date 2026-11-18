import SwiftUI
#if os(iOS)
import KidSproutCore
#endif

private struct LessonStroke {
    var points: [CGPoint]
    var width: CGFloat
}

/// Lesson ink deliberately has its own history, separate from the drawing board.
struct LessonTracingView: View {
    @EnvironmentObject private var model: AppModel
    let group: String
    let symbol: String
    @State private var strokes: [LessonStroke] = []
    @State private var current: [CGPoint] = []
    @State private var currentWidth: CGFloat = 0.01
    @State private var history: [[LessonStroke]] = []
    @State private var status = "用手指或鼠标描一描，再请大人看看你的线条。"

    private var template: TracingTemplate? {
        model.curriculum?.tracingTemplates.first { $0.group == group && $0.label == symbol }
    }

    var body: some View {
        if let template {
            VStack(alignment: .leading, spacing: 12) {
                ViewThatFits(in: .horizontal) {
                    HStack { title; Spacer(); instruction }
                    VStack(alignment: .leading, spacing: 5) { title; instruction }
                }
                GeometryReader { geometry in
                    ZStack {
                        Color(red: 1, green: 0.996, blue: 0.984)
                        Canvas { context, size in
                            // Match the four writing lines of the exported 1000 × 700 guide.
                            let glyphWidth = CGFloat(symbol.count > 1 ? 208 : 100)
                            let scale = min(size.width * 0.8 / glyphWidth, size.height * 0.63 / 120)
                            let top = (size.height - 120 * scale) / 2 - 20 * scale
                            for line in [20, 60, 100, 140] {
                                let y = top + CGFloat(line) * scale
                                var path = Path()
                                path.move(to: CGPoint(x: size.width * 0.1, y: y))
                                path.addLine(to: CGPoint(x: size.width * 0.9, y: y))
                                context.stroke(path, with: .color(Color(red: 0.78, green: 0.83, blue: 0.75).opacity(line == 100 ? 0.9 : 0.5)), style: StrokeStyle(lineWidth: line == 100 ? 1.2 : 0.8, dash: line == 60 ? [5, 5] : []))
                            }
                        }
                        .allowsHitTesting(false)
                        NativeIllustration(name: template.asset).allowsHitTesting(false)
                        Canvas { context, size in
                            for stroke in strokes { paint(stroke, context: &context, size: size) }
                            if !current.isEmpty { paint(LessonStroke(points: current, width: currentWidth), context: &context, size: size) }
                        }
                        .contentShape(Rectangle())
                        .highPriorityGesture(DragGesture(minimumDistance: 0, coordinateSpace: .local)
                            .onChanged { event in
                                let next = normalized(event.location, size: geometry.size)
                                if current.isEmpty {
                                    currentWidth = 5 / max(1, geometry.size.width)
                                    status = "顺着虚线慢慢写，不着急，每一笔都是练习。"
                                }
                                if current.last != next { current.append(next) }
                            }
                            .onEnded { _ in commitStroke() })
                        .accessibilityLabel("\(template.label)临摹练写区域")
                        .accessibilityHint("在字形虚线上用手指、触控笔或鼠标画线。")
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                    .overlay { RoundedRectangle(cornerRadius: 10).stroke(Sprout.line) }
                }
                .aspectRatio(1000.0 / 700, contentMode: .fit)
                ViewThatFits(in: .horizontal) {
                    HStack(spacing: 8) { Spacer(minLength: 0); undoButton; clearButton; finishButton }
                    VStack(alignment: .leading, spacing: 8) { HStack { undoButton; clearButton }; finishButton }
                }
                Text(status).font(.caption).foregroundStyle(Sprout.muted).accessibilityIdentifier("lessonTracingStatus")
            }
            .padding(14)
            .background(Sprout.mint.opacity(0.5), in: RoundedRectangle(cornerRadius: 18))
            .overlay { RoundedRectangle(cornerRadius: 18).stroke(Sprout.line) }
            .onChange(of: "\(group):\(symbol)") { _, _ in
                strokes = []; current = []; history = []
                status = "用手指或鼠标描一描，再请大人看看你的线条。"
            }
        }
    }

    private var title: some View { HStack(spacing: 8) { Text("小手写一写").font(.headline); Text(symbol).font(.system(.title3, design: .rounded, weight: .bold)) }.foregroundStyle(Sprout.green) }
    private var instruction: some View { Text("沿着虚线，慢慢描一描").font(.caption).foregroundStyle(Sprout.muted) }
    private var undoButton: some View {
        Button("撤销一笔") {
            commitStroke()
            if let previous = history.popLast() { strokes = previous }
            status = "退回一笔啦，再慢慢写一写。"
        }.buttonStyle(.bordered).disabled(history.isEmpty && current.isEmpty).frame(minHeight: 44)
    }
    private var clearButton: some View {
        Button("重新写") {
            commitStroke(); remember(); strokes = []
            status = "笔迹清空啦，再练一次；点“撤销一笔”还能找回。"
        }.buttonStyle(.bordered).disabled(strokes.isEmpty && current.isEmpty).frame(minHeight: 44)
    }
    private var finishButton: some View {
        Button("我练好啦 ✓") {
            commitStroke()
            status = "认真练习，真棒！请大人一起看看字形，再试着在纸上写一写。"
        }.buttonStyle(.borderedProminent).tint(Sprout.green).disabled(strokes.isEmpty && current.isEmpty).frame(minHeight: 44)
    }
    private func normalized(_ point: CGPoint, size: CGSize) -> CGPoint {
        CGPoint(x: min(1, max(0, point.x / max(1, size.width))), y: min(1, max(0, point.y / max(1, size.height))))
    }
    private func remember() {
        history.append(strokes)
        if history.count > 40 { history.removeFirst() }
    }
    private func commitStroke() {
        guard !current.isEmpty else { return }
        remember(); strokes.append(LessonStroke(points: current, width: currentWidth)); current = []
    }
    private func paint(_ stroke: LessonStroke, context: inout GraphicsContext, size: CGSize) {
        guard let first = stroke.points.first else { return }
        let start = CGPoint(x: first.x * size.width, y: first.y * size.height)
        let width = stroke.width * size.width
        if stroke.points.count == 1 {
            context.fill(Path(ellipseIn: CGRect(x: start.x - width / 2, y: start.y - width / 2, width: width, height: width)), with: .color(Color(red: 0.32, green: 0.47, blue: 0.37)))
        } else {
            var path = Path(); path.move(to: start)
            for point in stroke.points.dropFirst() { path.addLine(to: CGPoint(x: point.x * size.width, y: point.y * size.height)) }
            context.stroke(path, with: .color(Color(red: 0.32, green: 0.47, blue: 0.37)), style: StrokeStyle(lineWidth: width, lineCap: .round, lineJoin: .round))
        }
    }
}

import SwiftUI
#if os(iOS)
import KidSproutCore
#endif

/// A finite, silent story using the same three illustrations as the web lesson.
struct MemorySceneView: View {
    @EnvironmentObject private var model: AppModel
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    let subject: NativeSubject
    let symbol: String
    @State private var frameIndex = 2
    @State private var replay = 0

    private var scene: MemoryScene? {
        model.curriculum?.memoryScenes.first { $0.subject == subject && $0.symbol == symbol }
    }

    var body: some View {
        if let scene {
            VStack(spacing: 9) {
                HStack {
                    Label("记忆小剧场", systemImage: "sparkle").font(.caption.weight(.semibold))
                    Spacer()
                    Button { replay += 1 } label: {
                        Label("再看一次", systemImage: "arrow.clockwise").font(.caption).frame(minHeight: 40)
                    }
                    .buttonStyle(.bordered)
                    .accessibilityLabel("重播\(symbol)记忆动画")
                }
                .foregroundStyle(Sprout.gold)
                ZStack {
                    ForEach(Array(scene.frames.enumerated()), id: \.offset) { index, asset in
                        NativeIllustration(name: asset)
                            .opacity(index == min(frameIndex, scene.frames.count - 1) ? 1 : 0)
                    }
                }
                .frame(maxWidth: 370)
                .aspectRatio(320.0 / 180, contentMode: .fit)
                .accessibilityHidden(true)
                .animation(reduceMotion ? nil : .easeInOut(duration: 0.5), value: frameIndex)
                Text(scene.title).font(.headline).foregroundStyle(Sprout.gold)
                Text(scene.description).font(.subheadline).foregroundStyle(Sprout.muted)
                Text(reduceMotion ? "图形安静地陪你记一记，也可以用手指比划一下。" : "跟着图形记一记，再用小手比划一下。")
                    .font(.caption).foregroundStyle(Sprout.muted)
            }
            .multilineTextAlignment(.center)
            .padding(16)
            .frame(maxWidth: .infinity)
            .background(Sprout.goldWash, in: RoundedRectangle(cornerRadius: 19))
            .overlay { RoundedRectangle(cornerRadius: 19).stroke(Sprout.gold.opacity(0.2)) }
            .task(id: "\(scene.id)-\(replay)-\(reduceMotion)") {
                guard !scene.frames.isEmpty else { return }
                if reduceMotion { frameIndex = scene.frames.count - 1; return }
                frameIndex = 0
                do {
                    try await Task.sleep(for: .milliseconds(1500))
                    try Task.checkCancellation()
                    frameIndex = min(1, scene.frames.count - 1)
                    try await Task.sleep(for: .milliseconds(1600))
                    try Task.checkCancellation()
                    frameIndex = scene.frames.count - 1
                } catch { /* Leaving the lesson or replaying cancels the old story. */ }
            }
            .accessibilityElement(children: .contain)
            .accessibilityLabel("\(symbol)记忆小剧场")
        }
    }
}

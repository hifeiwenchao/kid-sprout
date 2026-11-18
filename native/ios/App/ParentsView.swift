import SwiftUI

struct ParentGate: View {
    @Environment(\.dismiss) private var dismiss
    @State private var answer = ""
    @State private var showError = false
    @FocusState private var answerFocused: Bool
    @State private var left = Int.random(in: 12...19)
    @State private var right = Int.random(in: 7...14)
    let success: () -> Void
    var body: some View {
        NavigationStack {
            ScrollView {
            VStack(spacing: 24) {
                Image(systemName: "person.crop.circle.badge.checkmark").font(.system(size: 64)).foregroundStyle(Sprout.accent)
                Text("请家长来帮忙").font(.largeTitle.bold())
                Text("即将打开系统分享或邮件功能。\n请家长完成小算术后继续。").multilineTextAlignment(.center).foregroundStyle(.secondary)
                Text("\(left) + \(right) = ?").font(.system(size: 36, weight: .bold, design: .rounded)).accessibilityIdentifier("gateQuestion")
                TextField("输入答案", text: $answer).keyboardType(.numberPad).textFieldStyle(.roundedBorder).font(.title2).multilineTextAlignment(.center).frame(maxWidth: 220).accessibilityIdentifier("gateAnswer").focused($answerFocused)
                if showError { Text("再算一算，请家长填写。 ").foregroundStyle(Sprout.orange) }

            }.padding(28).padding(.top, 24).frame(maxWidth: 560).frame(maxWidth: .infinity)
            }.scrollDismissesKeyboard(.interactively).accessibilityIdentifier("parentGateScroll")
                .safeAreaInset(edge: .bottom) {
                    Button("家长确认，继续") { if Int(answer) == left + right { answerFocused = false; success() } else { showError = true; answer = "" } }.buttonStyle(BigButton()).frame(maxWidth: 300).accessibilityIdentifier("gateConfirm").padding(16).frame(maxWidth: .infinity).background(.regularMaterial)
                }
                .toolbar { ToolbarItem(placement: .cancellationAction) { Button("取消") { dismiss() } } }
        }.presentationDetents([.large]).presentationCompactAdaptation(.fullScreenCover)
    }
}

struct ParentsView: View {
    @EnvironmentObject private var model: AppModel
    @Environment(\.openURL) private var openURL
    @State private var showGate = false
    @State private var pendingMail = false
    @State private var mailUnavailable = false
    var body: some View {
        Page {
            Panel {
                Label("陪伴，是最好的启蒙", systemImage: "heart.circle.fill").font(.title2.bold()).foregroundStyle(Sprout.accent)
                Text("这是一位爸爸为自家娃制作的小小启蒙应用。希望孩子可以在轻松的探索里认识数字，在画纸上自由表达，也希望它能给亲子时光带来一些灵感。").lineSpacing(6)
                Text("免费 · 无账号 · 无广告 · 无打赏").font(.subheadline.bold()).foregroundStyle(Sprout.accent)
            }
            Panel {
                Text("一起学习的小建议").font(.title3.bold())
                Text("让孩子先说说自己的发现，再一起数一数。答错时鼓励再试，疲倦时就停下来。屏幕上的认识，可以在生活里用水果、玩具和积木继续练习。").lineSpacing(6)
                Toggle(isOn: $model.progress.soundEnabled) { Label("中文点读声音", systemImage: "speaker.wave.2.fill") }.frame(minHeight: 44).onChange(of: model.progress.soundEnabled) { _, enabled in if !enabled { model.stopSpeaking() } }
                Text("点读使用设备的中文合成语音。未安装中文声音或静音时，仍可通过文字和图形学习。").font(.footnote).foregroundStyle(.secondary)
            }
            Panel {
                Text("这台设备上的成长记录").font(.title3.bold())
                Label("认识 \(model.progress.learnedNumbers.count) 个数字", systemImage: "book.closed")
                Label("完成 \(model.progress.gamesCompleted) 局小游戏", systemImage: "gamecontroller")
                Label("收获 \(model.progress.stars) 颗成长星星", systemImage: "star")
                Text("学习记录和画作保存在本机，与网页版独立。删除应用会移除这些本地记录。应用无需网络，不收集个人信息。").font(.footnote).foregroundStyle(.secondary)
            }
            Panel {
                Text("关于作者").font(.title3.bold())
                Text("欢迎提出建议，或告诉我使用中遇到的问题。")
                Button { showGate = true } label: { Label { Text(verbatim: "hi@feiwenchao.com") } icon: { Image(systemName: "envelope.fill") }.frame(minHeight: 44) }.accessibilityIdentifier("authorEmail")
                Text("点击后请家长确认，再打开系统邮件应用。").font(.footnote).foregroundStyle(.secondary)
            }
        }.navigationTitle("家长区")
            .sheet(isPresented: $showGate, onDismiss: { if pendingMail { pendingMail = false; openURL(URL(string: "mailto:hi@feiwenchao.com")!) { accepted in mailUnavailable = !accepted } } }) { ParentGate { pendingMail = true; showGate = false } }
            .alert("暂时无法打开邮件", isPresented: $mailUnavailable) { Button("知道了", role: .cancel) {} } message: { Text("请先在设备上设置邮件应用，也可以手动发送邮件到 hi@feiwenchao.com。") }
    }
}

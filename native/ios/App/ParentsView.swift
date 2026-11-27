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
                Text(gateExplanation).multilineTextAlignment(.center).foregroundStyle(.secondary)
                Text("\(left) + \(right) = ?").font(.system(size: 36, weight: .bold, design: .rounded)).accessibilityIdentifier("gateQuestion")
                TextField("输入答案", text: $answer)
                    #if os(iOS)
                    .keyboardType(.numberPad)
                    #endif
                    .textFieldStyle(.roundedBorder).font(.title2).multilineTextAlignment(.center).frame(maxWidth: 220).accessibilityIdentifier("gateAnswer").focused($answerFocused)
                if showError { Text("再算一算，请家长填写。 ").foregroundStyle(Sprout.orange) }

            }.padding(28).padding(.top, 24).frame(maxWidth: 560).frame(maxWidth: .infinity)
            }
                #if os(iOS)
                .scrollDismissesKeyboard(.interactively)
                #endif
                .accessibilityIdentifier("parentGateScroll")
                .safeAreaInset(edge: .bottom) {
                    Button("家长确认，继续") { if Int(answer) == left + right { answerFocused = false; success() } else { showError = true; answer = "" } }.buttonStyle(BigButton()).frame(maxWidth: 300).accessibilityIdentifier("gateConfirm").padding(16).frame(maxWidth: .infinity).background(.regularMaterial)
                }
                .toolbar { ToolbarItem(placement: .cancellationAction) { Button("取消") { dismiss() } } }
        }
        #if os(iOS)
        .presentationDetents([.large]).presentationCompactAdaptation(.fullScreenCover)
        #else
        .frame(minWidth: 440, idealWidth: 500, minHeight: 420, idealHeight: 550)
        #endif
    }
    private var gateExplanation: String {
        #if os(macOS)
        "即将选择 PNG 保存位置、打开邮件或外部网页。\n请家长完成小算术后继续。"
        #else
        "即将打开系统分享、邮件或外部网页。\n请家长完成小算术后继续。"
        #endif
    }
}

struct ParentsView: View {
    @EnvironmentObject private var model: AppModel
    @Environment(\.openURL) private var openURL
    @State private var showGate = false
    @State private var pendingMail = false
    @State private var mailUnavailable = false
    @State private var showPrivacy = false
    var body: some View {
        Page {
            Panel {
                Label("陪伴，是最好的启蒙", systemImage: "heart.circle.fill").font(.title2.bold()).foregroundStyle(Sprout.accent)
                Text("从数字到语言，跟着孩子自己的节奏探索。每天 5–10 分钟，把小发现慢慢带进生活。").lineSpacing(6)
                Text("免费 · 无账号 · 无广告 · 无打赏").font(.subheadline.bold()).foregroundStyle(Sprout.accent)
            }
            Panel {
                Text("一起学习的小建议").font(.title3.bold())
                ForEach(Array(tips.enumerated()), id: \.offset) { index, tip in
                    VStack(alignment: .leading, spacing: 8) { Text(String(format: "%02d · %@", index + 1, tip.0)).font(.headline).foregroundStyle(Sprout.green); Text(tip.1).font(.subheadline).lineSpacing(6).foregroundStyle(Sprout.muted) }
                }
                Toggle(isOn: $model.progress.soundEnabled) { Label("点读声音", systemImage: "speaker.wave.2.fill") }.frame(minHeight: 44).onChange(of: model.progress.soundEnabled) { _, enabled in if !enabled { model.stopSpeaking() } }
                Text("中文与英文使用对应的系统合成语音。无可用语音或静音时，仍可通过文字、口型和图形学习。").font(.footnote).foregroundStyle(Sprout.muted)
            }
            Panel {
                Text("这台设备上的成长记录").font(.title3.bold())
                Label("认识 \(model.progress.learnedNumbers.count) 个数字", systemImage: "book.closed")
                Label("走过 \(model.progress.learnedPinyin.count) 课拼音小路", systemImage: "character.book.closed")
                Label("认识 \(model.progress.learnedLetters.count) 个英文字母", systemImage: "textformat.abc")
                Label("完成 \(model.progress.gamesCompleted) 局小游戏", systemImage: "gamecontroller")
                Label("收获 \(model.progress.stars) 颗成长星星", systemImage: "star")
                Text(storageExplanation).font(.footnote).foregroundStyle(.secondary)
            }
            Panel {
                Button { showPrivacy = true } label: { Label("隐私政策", systemImage: "hand.raised.fill").frame(minHeight: 44) }
                    .accessibilityIdentifier("privacyPolicy")
            }
            Panel {
                Text("关于作者").font(.title3.bold())
                Text("欢迎提出建议，或告诉我使用中遇到的问题。")
                Button { showGate = true } label: { Label { Text(verbatim: "service@feiwenchao.com") } icon: { Image(systemName: "envelope.fill") }.frame(minHeight: 44) }.accessibilityIdentifier("authorEmail")
                Text("点击后请家长确认，再打开系统邮件应用。").font(.footnote).foregroundStyle(.secondary)
            }
        }.navigationTitle("家长区")
            .sheet(isPresented: $showGate, onDismiss: { if pendingMail { pendingMail = false; openURL(URL(string: "mailto:service@feiwenchao.com")!) { accepted in mailUnavailable = !accepted } } }) { ParentGate { pendingMail = true; showGate = false } }
            .sheet(isPresented: $showPrivacy) { PrivacyPolicyView() }
            .alert("暂时无法打开邮件", isPresented: $mailUnavailable) { Button("知道了", role: .cancel) {} } message: { Text("请先在设备上设置邮件应用，也可以手动发送邮件到 service@feiwenchao.com。") }
    }
    private var tips: [(String, String)] {
        [("每天一点点", "一次玩 5–10 分钟就好。低龄孩子先认数字、看看字母；拼音可以在准备好时一起慢慢学。"),
         ("把发现带进生活", "数桌上的苹果、找书里的字母、听一个汉字的声调。屏幕外也有很多小课堂。"),
         ("陪孩子一起听读", "拼音按 2024 新版人教一年级上册顺序组织，是自主制作的辅助练习。例字合成语音用于读音参考，声母的轻短音建议结合老师示范；英文字母学习的是字母名和常见单词。"),
         ("鼓励每一次尝试", "答错可以再试，没有倒计时和排名。认识的数字、完成的拼音课、字母和成就自动保存在本机；画作也会保留在这台设备。")]
    }
    private var storageExplanation: String {
        #if os(macOS)
        "学习记录和画作保存在本机应用数据目录，与网页及手机独立。移除 .app 不会自动删除这些记录。应用无需网络，不收集个人信息。"
        #else
        "学习记录和画作保存在本机，与网页版独立。删除应用会移除这些本地记录。应用无需网络，不收集个人信息。"
        #endif
    }
}

struct AuthorView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.openURL) private var openURL
    @State private var showGate = false
    @State private var pendingMail = false
    @State private var unavailable = false
    @State private var showPrivacy = false
    var body: some View {
        NavigationStack {
            Page {
                Image(systemName: "leaf").font(.system(size: 33)).foregroundStyle(Sprout.green).padding(18).background(Sprout.mint, in: RoundedRectangle(cornerRadius: 18)).frame(maxWidth: .infinity)
                SectionHeader(eyebrow: "A LITTLE APP, MADE WITH LOVE", title: "关于作者", detail: "一个爸爸写给孩子的小小启蒙世界。")
                Panel {
                    Text("我是一个 90 后程序员，也是一个孩子的爸爸。萌呀启蒙最初是我为自家娃做的小应用：希望把数字、拼音、字母和画画，变成一段轻松、有趣的亲子时光。").lineSpacing(7)
                    Text("如果它也陪伴了你的孩子，或你有任何建议、意见反馈，欢迎写信给我。每一个小想法，都可能让这里再长出一片新叶子。").lineSpacing(7)
                    Button { showGate = true } label: { HStack { Image(systemName: "envelope"); Text(verbatim: "service@feiwenchao.com"); Spacer(); Image(systemName: "arrow.up.right") }.font(.subheadline).padding(16).frame(minHeight: 50).background(Sprout.mint, in: RoundedRectangle(cornerRadius: 13)) }.buttonStyle(.plain).foregroundStyle(Sprout.green).accessibilityIdentifier("authorEmail")
                    Text("点击邮箱后，请家长确认，再由系统邮件应用继续。").font(.caption).foregroundStyle(Sprout.muted)
                }
                Button { showPrivacy = true } label: { Label("隐私政策", systemImage: "hand.raised.fill").frame(minHeight: 44) }
                    .accessibilityIdentifier("privacyPolicy")
                Text("免费使用 · 没有广告、打赏或内购").font(.caption).foregroundStyle(Sprout.muted).frame(maxWidth: .infinity)
            }.navigationTitle("关于作者").toolbar { ToolbarItem(placement: .confirmationAction) { Button("完成") { dismiss() } } }
        }.frame(idealWidth: 570, idealHeight: 670)
            .sheet(isPresented: $showGate, onDismiss: { if pendingMail { pendingMail = false; openURL(URL(string: "mailto:service@feiwenchao.com")!) { unavailable = !$0 } } }) { ParentGate { pendingMail = true; showGate = false } }
            .sheet(isPresented: $showPrivacy) { PrivacyPolicyView() }
            .alert("暂时无法打开邮件", isPresented: $unavailable) { Button("知道了", role: .cancel) {} } message: { Text("请先设置系统邮件应用，也可以手动发邮件至 service@feiwenchao.com。") }
    }
}

struct PrivacyPolicyView: View {
    @Environment(\.dismiss) private var dismiss
    private let sections: [(String, [String])] = [
        ("一、我们收集什么信息", [
            "本应用不要求注册或登录，不收集姓名、电话、地址、照片、精确位置、联系人、设备广告标识符，也不包含广告、分析 SDK、社交功能或在线账户。",
            "学习进度、游戏完成记录和画板草稿只保存在使用本应用的设备本地，用于恢复学习状态。我们无法读取这些本地内容，也不会将其上传到服务器。"
        ]),
        ("二、语音与系统功能", [
            "点读功能调用设备系统提供的中文或英文合成语音。语音文本由本应用在设备上生成；本应用不保存录音，也不主动上传语音内容。邮件、系统分享和保存图片仅在家长主动操作并确认后交由操作系统处理。"
        ]),
        ("三、儿童隐私", [
            "本应用面向儿童与家长共同使用，提供离线学习内容，不以收集儿童个人信息为目的。涉及发送邮件、系统分享或打开外部网页的功能，会先提示家长确认。请家长陪伴孩子使用，并帮助孩子不要在邮件或其他外部服务中提交个人信息。"
        ]),
        ("四、第三方网站", [
            "课程说明中可能提供教材资料来源链接。打开外部网站前会进行家长确认；这些网站由其运营者独立负责，请在访问前阅读相应的隐私政策。"
        ]),
        ("五、政策更新与联系我们", [
            "如果本政策发生变化，我们会在公开隐私政策页面更新日期和内容，并同步本应用内的说明。对隐私或产品有任何问题，欢迎发送邮件至 service@feiwenchao.com。"
        ])
    ]
    var body: some View {
        NavigationStack {
            Page {
                SectionHeader(title: "萌呀启蒙隐私政策", detail: "更新日期：2026 年 11 月 19 日")
                Text("萌呀启蒙（以下简称“本应用”）是一款由个人开发者制作的儿童启蒙学习应用，提供数字、拼音、英文字母、小游戏和画板练习。我们重视孩子和家长的隐私，并按本政策说明数据处理方式。").lineSpacing(6)
                ForEach(Array(sections.enumerated()), id: \.offset) { _, section in
                    Panel {
                        Text(section.0).font(.headline).foregroundStyle(Sprout.green)
                        ForEach(Array(section.1.enumerated()), id: \.offset) { _, paragraph in
                            Text(verbatim: paragraph).font(.subheadline).lineSpacing(6)
                        }
                    }
                }
                Text("© 2026 萌呀启蒙 · 免费、无账号、无广告").font(.caption).foregroundStyle(Sprout.muted)
            }.navigationTitle("隐私政策")
                .toolbar { ToolbarItem(placement: .confirmationAction) { Button("完成") { dismiss() } } }
        }
        #if os(macOS)
        .frame(minWidth: 500, idealWidth: 650, minHeight: 500, idealHeight: 760)
        #else
        .presentationDetents([.large]).presentationCompactAdaptation(.fullScreenCover)
        #endif
    }
}

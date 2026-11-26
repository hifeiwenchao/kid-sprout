import SwiftUI
import AVFoundation
#if os(iOS)
import KidSproutCore
#else
import AppKit
#endif

@main
struct KidSproutApp: App {
    @StateObject private var model = AppModel()
    @StateObject private var board = DrawingModel()
    init() {
        #if os(macOS) && DEBUG
        let arguments = ProcessInfo.processInfo.arguments
        if let index = arguments.firstIndex(of: "-AppleInterfaceStyle"), index + 1 < arguments.count {
            switch arguments[index + 1] {
            case "Dark": NSApplication.shared.appearance = NSAppearance(named: .darkAqua)
            case "Light": NSApplication.shared.appearance = NSAppearance(named: .aqua)
            default: break
            }
        }
        #endif
    }
    var body: some Scene {
        #if os(macOS)
        Window("萌呀启蒙", id: "main") { RootView().environmentObject(model).environmentObject(board).tint(Sprout.accent).frame(minWidth: 760, minHeight: 600) }
            .defaultSize(width: 1200, height: 850).windowResizability(.contentMinSize)
        #else
        WindowGroup { RootView().environmentObject(model).environmentObject(board).tint(Sprout.accent) }
        #endif
    }
}

@MainActor final class AppModel: NSObject, ObservableObject, AVSpeechSynthesizerDelegate {
    @Published var progress: LearningProgress { didSet { repository.save(progress) } }
    @Published var activeGame: NativeGame?
    @Published var resumeSubject: NativeSubject?
    @Published private(set) var recentGameIDs: [String] = []
    let curriculum: Curriculum?
    let activities: ActivityLibrary?
    private let repository = ProgressRepository()
    private let speaker = AVSpeechSynthesizer()
    private var speechCompletion: (() -> Void)?
    private var activeUtterance: AVSpeechUtterance?
    override init() {
        progress = repository.load()
        curriculum = Bundle.main.url(forResource: "curriculum", withExtension: "json").flatMap { try? Data(contentsOf: $0) }.flatMap { try? Curriculum.decode($0) }
        activities = Bundle.main.url(forResource: "activities", withExtension: "json").flatMap { try? Data(contentsOf: $0) }.flatMap { try? ActivityLibrary.decode($0) }
        super.init()
        recentGameIDs = RecentActivityHistory.normalized(UserDefaults.standard.stringArray(forKey: "sprout-recent-games-v1") ?? [], allowedIDs: activities?.games.map(\.id) ?? [])
        speaker.delegate = self
        let format = DateFormatter(); format.locale = Locale(identifier: "en_US_POSIX"); format.dateFormat = "yyyy-MM-dd"
        progress.visitDates.insert(format.string(from: Date()))
    }
    func speak(_ text: String, language: String = "zh-CN", completion: (() -> Void)? = nil) {
        stopSpeaking()
        guard progress.soundEnabled else { return }
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: language)
        utterance.rate = language.hasPrefix("en") ? 0.42 : 0.40
        activeUtterance = utterance; speechCompletion = completion
        speaker.speak(utterance)
    }
    func stopSpeaking() { speechCompletion = nil; activeUtterance = nil; speaker.stopSpeaking(at: .immediate) }
    nonisolated func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        Task { @MainActor [weak self] in
            guard let self, self.activeUtterance === utterance else { return }
            let completion = self.speechCompletion
            self.speechCompletion = nil; self.activeUtterance = nil
            completion?()
        }
    }
    func select(_ value: Int) { progress.lastNumber = value }
    func markLearned(_ value: Int) { progress.learnedNumbers.insert(value) }
    func markPinyin(_ id: String) { progress.learnedPinyin.insert(id); progress.lastPinyin = id }
    func markLetter(_ id: String) { progress.learnedLetters.insert(id); progress.lastLetter = id }
    func reward() { progress.stars += 1; progress.gamesCompleted += 1 }
    func play(_ game: NativeGame) { stopSpeaking(); activeGame = game }
    func recordGameVisit(_ game: NativeGame) {
        recentGameIDs = RecentActivityHistory.recording(game.id, in: recentGameIDs, allowedIDs: activities?.games.map(\.id) ?? [])
        UserDefaults.standard.set(recentGameIDs, forKey: "sprout-recent-games-v1")
    }
}

enum Area: String, CaseIterable, Identifiable {
    case home, numbers, pinyin, alphabet, drawing, games, parents
    var id: String { rawValue }
    static let learning: [Self] = [.home, .numbers, .pinyin, .alphabet, .drawing, .games]
    var title: String { switch self { case .home: "探索首页"; case .numbers: "数字乐园"; case .pinyin: "拼音天地"; case .alphabet: "字母森林"; case .drawing: "小小画板"; case .games: "游戏大厅"; case .parents: "给爸爸妈妈的话" } }
    var shortTitle: String { switch self { case .home: "探索"; case .numbers: "数字"; case .pinyin: "拼音"; case .alphabet: "字母"; case .drawing: "画板"; case .games: "游戏"; case .parents: "家长" } }
    var symbol: String { switch self { case .home: "house"; case .numbers: "123.rectangle"; case .pinyin: "character.book.closed"; case .alphabet: "textformat.abc"; case .drawing: "paintpalette"; case .games: "gamecontroller"; case .parents: "heart" } }
    var subject: NativeSubject? { NativeSubject(rawValue: rawValue) }
}

struct RootView: View {
    @EnvironmentObject private var model: AppModel
    @State private var area: Area = .home
    @State private var showAuthor = false
    @State private var showParents = false
    @State private var showAchievements = false
    var body: some View {
        GeometryReader { geometry in
            let wide = geometry.size.width >= 700
            VStack(spacing: 0) {
                HStack(spacing: 0) {
                    if wide { sidebar.frame(width: 210); Rectangle().fill(Sprout.line).frame(width: 1) }
                    VStack(spacing: 0) {
                        topbar(wide: wide)
                        if model.curriculum == nil || model.activities == nil {
                            ContentUnavailableView("课程资源暂时无法读取", systemImage: "book.closed", description: Text("请重新构建应用，确保 curriculum.json、activities.json 与插画已一起打包。"))
                        } else { NavigationStack { content }.id(area) }
                    }
                }
                if !wide { bottomNavigation }
            }.background(Sprout.background).foregroundStyle(Sprout.ink)
        }
        .onChange(of: area) { _, _ in model.stopSpeaking() }
        .sheet(item: $model.activeGame, onDismiss: { model.stopSpeaking() }) { GamePlayerView(game: $0).environmentObject(model) }
        .sheet(isPresented: $showAuthor) { AuthorView().environmentObject(model) }
        .sheet(isPresented: $showParents) { NavigationStack { ParentsView().toolbar { ToolbarItem(placement: .confirmationAction) { Button("完成") { showParents = false } } } }.frame(idealWidth: 650, idealHeight: 750) }
        .sheet(isPresented: $showAchievements) { GrowthRecordView().environmentObject(model) }
    }
    private var sidebar: some View {
        ScrollView {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 10) {
                Image(systemName: "leaf.fill").font(.system(size: 28)).foregroundStyle(Sprout.green)
                VStack(alignment: .leading, spacing: 5) { Text("萌呀启蒙").font(.title3.bold()); Text("SPROUT · 每天一点点").font(.system(size: 8)).tracking(1).foregroundStyle(Sprout.muted) }
            }.padding(.vertical, 16)
            Text("学习地图 / LET’S EXPLORE").font(.system(size: 9, weight: .medium)).foregroundStyle(Sprout.muted).padding(.top, 14)
            ForEach(Area.learning) { destination in
                Button { area = destination } label: {
                    HStack(spacing: 12) {
                        if let subject = destination.subject { Text(subject.monogram).font(.system(size: 20, weight: .bold, design: .rounded)).frame(width: 28).foregroundStyle(subject.accent) }
                        else { Image(systemName: destination.symbol).font(.system(size: 19)).frame(width: 28) }
                        Text(destination.title).font(.subheadline.weight(area == destination ? .semibold : .regular)); Spacer(minLength: 0)
                        if area == destination { Circle().fill(Sprout.green).frame(width: 5, height: 5) }
                    }.padding(.horizontal, 12).frame(minHeight: 48).background(area == destination ? Sprout.mint : .clear, in: RoundedRectangle(cornerRadius: 13))
                }.buttonStyle(SproutCardButton()).accessibilityIdentifier("nav-\(destination.rawValue)").accessibilityAddTraits(area == destination ? .isSelected : [])
            }
            Spacer(minLength: 10)
            VStack(alignment: .leading, spacing: 12) {
                Label("每一点进步，都在发芽", systemImage: "sparkles").font(.caption.bold())
                Text("认识了 \(model.progress.learnedNumbers.count + model.progress.learnedPinyin.count + model.progress.learnedLetters.count) 位新朋友").font(.caption2).foregroundStyle(Sprout.muted)
                ProgressView(value: Double(model.progress.learnedNumbers.count + model.progress.learnedPinyin.count + model.progress.learnedLetters.count), total: 51).tint(Sprout.green)
            }.padding(16).background(Sprout.mint, in: RoundedRectangle(cornerRadius: 17))
            Button { showParents = true } label: { Label("给爸爸妈妈的话", systemImage: "heart").font(.subheadline).frame(minHeight: 44) }.buttonStyle(SproutCardButton())
            Button { showAuthor = true } label: { Label("关于作者", systemImage: "person.crop.circle").font(.subheadline).frame(minHeight: 44) }.buttonStyle(SproutCardButton())
            Text("愿每一份好奇，都被温柔看见。").font(.system(size: 9)).foregroundStyle(Sprout.muted)
        }.padding(16)
        }.background(Sprout.panel)
    }
    private func topbar(wide: Bool) -> some View {
        HStack(spacing: 12) {
            Text(wide ? "萌呀启蒙  /  \(area.title)" : area.title).font(.caption).foregroundStyle(Sprout.muted).lineLimit(1)
            Spacer(minLength: 0)
            if wide { Label("第 \(model.progress.visitDates.count) 天打卡", systemImage: "flame").font(.caption2).foregroundStyle(Sprout.gold).padding(8).background(Sprout.goldWash, in: Capsule()) }
            Button { model.progress.soundEnabled.toggle(); if !model.progress.soundEnabled { model.stopSpeaking() } } label: { Image(systemName: model.progress.soundEnabled ? "speaker.wave.2" : "speaker.slash").frame(width: 44, height: 44) }.buttonStyle(SproutCardButton()).accessibilityLabel(model.progress.soundEnabled ? "关闭声音" : "开启声音")
            Button { showAchievements = true } label: { Image(systemName: "medal").frame(width: 44, height: 44) }.buttonStyle(SproutCardButton()).accessibilityLabel("我的成就")
            if !wide { Menu { Button("给爸爸妈妈的话") { showParents = true }; Button("关于作者") { showAuthor = true } } label: { Image(systemName: "ellipsis.circle").frame(width: 44, height: 44) }.accessibilityLabel("更多").accessibilityIdentifier("nav-more") }
        }.padding(.horizontal, 22).padding(.vertical, 5).background(Sprout.background).overlay(alignment: .bottom) { Rectangle().fill(Sprout.line).frame(height: 1) }
    }
    private var bottomNavigation: some View {
        HStack(spacing: 0) { ForEach(Area.learning) { destination in
            Button { area = destination } label: {
                VStack(spacing: 5) { Image(systemName: destination.symbol).font(.system(size: 19)); Text(destination.shortTitle).font(.caption2) }
                    .frame(maxWidth: .infinity, minHeight: 56).background(area == destination ? Sprout.mint : .clear, in: RoundedRectangle(cornerRadius: 11))
            }.buttonStyle(SproutCardButton()).foregroundStyle(area == destination ? Sprout.green : Sprout.muted).accessibilityLabel(destination.title).accessibilityIdentifier("nav-\(destination.rawValue)").accessibilityAddTraits(area == destination ? .isSelected : [])
        } }.padding(.horizontal, 7).padding(.top, 5).background(Sprout.panel).overlay(alignment: .top) { Rectangle().fill(Sprout.line).frame(height: 1) }
    }
    @ViewBuilder private var content: some View {
        switch area {
        case .home: ExploreView { area = $0 }
        case .numbers: NumbersView()
        case .pinyin: PinyinView()
        case .alphabet: AlphabetView()
        case .drawing: DrawingView()
        case .games: Page { SectionHeader(eyebrow: "THE PLAYROOM", title: "把学习，变成一场游戏", detail: "60 个小小挑战。不计时、不比较，试一试就很棒。"); GameLibraryView() }
        case .parents: ParentsView()
        }
    }
}

struct ExploreView: View {
    @EnvironmentObject private var model: AppModel
    let navigate: (Area) -> Void
    var body: some View {
        Page {
            SectionHeader(eyebrow: "HELLO, LITTLE EXPLORER", title: "嗨，小小探险家 ☀", detail: "今天的小发现，会长成明天的大本领。")
            continuing
            ViewThatFits(in: .horizontal) {
                HStack(spacing: 8) { heroCopy.frame(minWidth: 270); heroArt.frame(minWidth: 240, maxWidth: 400) }
                VStack(alignment: .leading, spacing: 12) { heroCopy; heroArt.frame(height: 210) }
            }.padding(26).background(Sprout.yellow, in: RoundedRectangle(cornerRadius: 25))
            SectionHeader(eyebrow: "PICK A LITTLE ADVENTURE", title: "今天，想去哪里玩？", detail: "三片小天地，慢慢探索就好")
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 220), spacing: 16)], spacing: 16) { ForEach(NativeSubject.allCases) { subject in subjectCard(subject) } }
            Button { navigate(.drawing) } label: {
                HStack(spacing: 18) { Image(systemName: "pencil.and.scribble").font(.system(size: 35)); VStack(alignment: .leading, spacing: 6) { Text("小小画板").font(.title3.bold()); Text("让想象力，跟着小手自由生长。").font(.caption) }; Spacer(); Image(systemName: "arrow.right") }.padding(23).background(Sprout.mint, in: RoundedRectangle(cornerRadius: 19))
            }.buttonStyle(.plain).foregroundStyle(Sprout.green)
            featured
            Text("每天 5–10 分钟 · 陪伴，是最好的启蒙").font(.caption).foregroundStyle(Sprout.muted).frame(maxWidth: .infinity).padding(.vertical, 12)
        }
    }
    private var heroCopy: some View {
        VStack(alignment: .leading, spacing: 17) {
            Text("✦ 好奇的小脑袋，欢迎来到").font(.caption).foregroundStyle(Sprout.gold)
            Text("小小的你，\n有大大的探索力。").font(.system(size: 34, weight: .bold, design: .rounded)).fixedSize(horizontal: false, vertical: true)
            Text("认数字、学拼音、读字母。\n把每一个「我会啦」，装进成长的小口袋。").font(.subheadline).lineSpacing(6)
            Button { navigate(.numbers) } label: { Label("开始今天的探索", systemImage: "arrow.right").padding(.horizontal, 18).frame(minHeight: 48).background(Sprout.green, in: RoundedRectangle(cornerRadius: 12)).foregroundStyle(Sprout.background) }.buttonStyle(SproutCardButton()).accessibilityIdentifier("continueLearning")
        }.frame(maxWidth: .infinity, alignment: .leading)
    }
    private var heroArt: some View {
        ZStack(alignment: .topTrailing) { NativeIllustration(name: "number_garden"); Text("A a").font(.system(size: 56, weight: .bold, design: .rounded)).foregroundStyle(Sprout.gold).rotationEffect(.degrees(8)).offset(y: -10); Text("ā").font(.system(size: 60, weight: .medium, design: .serif)).foregroundStyle(Sprout.purple).frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing) }.accessibilityHidden(true)
    }
    private func subjectCard(_ subject: NativeSubject) -> some View {
        Button { navigate(Area(rawValue: subject.rawValue)!) } label: {
            VStack(alignment: .leading, spacing: 13) {
                HStack { Text(subject == .numbers ? "01 / 数字启蒙" : subject == .pinyin ? "02 / 中文启蒙" : "03 / 英语启蒙").font(.caption); Spacer(); Image(systemName: "arrow.up.right") }
                Text(subject == .numbers ? "1 2 3" : subject == .pinyin ? "a o e" : "A a").font(.system(size: 57, weight: .bold, design: subject == .pinyin ? .serif : .rounded)).frame(maxWidth: .infinity).padding(.vertical, 8)
                Text(subject.title).font(.title2.bold())
                Text(subject == .numbers ? "从 0 到 10，和数字交朋友" : subject == .pinyin ? "跟着课次小路，慢慢学会拼读" : "从 Aa 到 Zz，打开字母的奇妙森林").font(.caption).lineSpacing(4)
                Divider().overlay(subject.accent.opacity(0.15))
                HStack { Text("\(learned(subject)) / \(total(subject)) 位新朋友"); Spacer(); Text("20 个小游戏") }.font(.caption2)
                ProgressView(value: Double(learned(subject)), total: Double(total(subject))).tint(subject.accent)
            }.padding(21).background(subject.wash, in: RoundedRectangle(cornerRadius: 21)).overlay(RoundedRectangle(cornerRadius: 21).stroke(subject.accent.opacity(0.18)))
        }.buttonStyle(SproutCardButton()).foregroundStyle(subject.accent)
    }
    private var continuing: some View {
        Panel {
            SectionHeader(title: "继续学习", detail: "从上次的小发现，接着出发。")
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 240), spacing: 16)], spacing: 12) {
            ForEach(NativeSubject.allCases) { subject in Button { model.resumeSubject = subject; navigate(Area(rawValue: subject.rawValue)!) } label: {
                HStack(spacing: 13) { Text(subject.monogram).font(.title3.bold()).frame(width: 44, height: 46).background(subject.wash, in: RoundedRectangle(cornerRadius: 12)).foregroundStyle(subject.accent); VStack(alignment: .leading, spacing: 5) { Text(subject.title).font(.subheadline.bold()); Text(continueLabel(subject)).font(.caption).foregroundStyle(Sprout.muted) }; Spacer(); Image(systemName: "arrow.right").foregroundStyle(Sprout.muted) }.frame(minHeight: 60)
            }.buttonStyle(SproutCardButton()) }
            }
        }
    }
    private var featured: some View {
        VStack(alignment: .leading, spacing: 15) {
            HStack { SectionHeader(eyebrow: "LEARN THROUGH PLAY", title: "玩一会，也学一点"); Spacer(); Button("全部游戏 →") { navigate(.games) }.buttonStyle(.plain).font(.caption).foregroundStyle(Sprout.green) }
            if let games = model.activities?.games { ForEach(["numbers-count", "pinyin-listen", "alphabet-match"], id: \.self) { id in if let game = games.first(where: { $0.id == id }) { GameCard(game: game, compact: true) } } }
        }
    }
    private func learned(_ subject: NativeSubject) -> Int { switch subject { case .numbers: model.progress.learnedNumbers.count; case .pinyin: model.progress.learnedPinyin.count; case .alphabet: model.progress.learnedLetters.count } }
    private func total(_ subject: NativeSubject) -> Int { subject == .numbers ? 11 : subject == .pinyin ? 14 : 26 }
    private func continueLabel(_ subject: NativeSubject) -> String {
        switch subject {
        case .numbers: if let next = (0...10).first(where: { !model.progress.learnedNumbers.contains($0) }) { return "下一位朋友：数字 \(next)" }; return "11 个数字都认识啦，再复习一下吧"
        case .pinyin: if let next = model.curriculum?.pinyin.lessons.first(where: { !model.progress.learnedPinyin.contains($0.id) }) { return "继续学习第 \(next.number) 课" }; return "14 课都完成啦，再复习一下吧"
        case .alphabet: if let next = model.curriculum?.alphabet.letters.first(where: { !model.progress.learnedLetters.contains($0.id) }) { return "下一位朋友：字母 \(next.id)" }; return "A–Z 都认识啦，再复习一下吧"
        }
    }
}

struct GrowthRecordView: View {
    @EnvironmentObject private var model: AppModel
    @Environment(\.dismiss) private var dismiss
    var body: some View {
        NavigationStack { Page { SectionHeader(eyebrow: "LITTLE ACHIEVEMENTS", title: "每一点进步，都在发芽", detail: "不着急，也不用和别人比。今天的你，已经很了不起。")
            Panel { Text("\(model.progress.stars) 颗小星星").font(.largeTitle.bold()).foregroundStyle(Sprout.gold); Text("完成 \(model.progress.gamesCompleted) 次游戏 · 来探索了 \(model.progress.visitDates.count) 天").font(.subheadline) }
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 13)], spacing: 13) {
                ForEach(Array(badges.enumerated()), id: \.offset) { _, badge in
                    VStack(spacing: 12) {
                        if badge.earned { Text(badge.symbol).font(.system(size: 35)) } else { Image(systemName: "lock").font(.system(size: 32)).foregroundStyle(Sprout.muted) }
                        Text(badge.title).font(.headline)
                        Text(badge.detail).font(.caption).foregroundStyle(Sprout.muted)
                        Text(badge.earned ? "已获得 · 你真棒！" : "等待你来点亮").font(.caption2).foregroundStyle(badge.earned ? Sprout.green : Sprout.muted)
                    }.padding(18).frame(maxWidth: .infinity, minHeight: 170).background(badge.earned ? Sprout.goldWash : Sprout.panel, in: RoundedRectangle(cornerRadius: 18)).overlay(RoundedRectangle(cornerRadius: 18).stroke(Sprout.line))
                }
            }
            ForEach(NativeSubject.allCases) { subject in Panel { Text(subject.title).font(.title3.bold()).foregroundStyle(subject.accent); Text(subject == .numbers ? "认识 \(model.progress.learnedNumbers.count) / 11 个数字" : subject == .pinyin ? "走过 \(model.progress.learnedPinyin.count) / 14 课拼音小路" : "认识 \(model.progress.learnedLetters.count) / 26 位字母朋友") } }
        }.toolbar { ToolbarItem(placement: .confirmationAction) { Button("完成") { dismiss() } } }.navigationTitle("我的小成就") }.frame(idealWidth: 600, idealHeight: 700)
    }
    private var badges: [(title: String, detail: String, earned: Bool, symbol: String)] {
        [("第一位朋友", "认识第 1 个数字", !model.progress.learnedNumbers.isEmpty, "🌱"),
         ("数字好伙伴", "认识 5 个数字", model.progress.learnedNumbers.count >= 5, "🌼"),
         ("闪亮小星星", "认识全部 11 个数字", model.progress.learnedNumbers.count == 11, "🌟"),
         ("游戏小能手", "完整通关任意小游戏", model.progress.gamesCompleted > 0, "🏆"),
         ("拼音小萌芽", "完成任意一课拼音学习", !model.progress.learnedPinyin.isEmpty, "🌷"),
         ("拼音好伙伴", "完成全部 14 课拼音", model.progress.learnedPinyin.count == 14, "🦋"),
         ("字母新朋友", "认识第一个英文字母", !model.progress.learnedLetters.isEmpty, "🍃"),
         ("字母收藏家", "认识全部 26 个字母", model.progress.learnedLetters.count == 26, "🌈")]
    }
}

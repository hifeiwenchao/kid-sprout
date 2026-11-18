import SwiftUI
import AVFoundation
import KidSproutCore

@main
struct KidSproutApp: App {
    @StateObject private var model = AppModel()
    @StateObject private var board = DrawingModel()
    var body: some Scene {
        WindowGroup {
            RootView().environmentObject(model).environmentObject(board).tint(Sprout.accent)
        }
    }
}

@MainActor final class AppModel: ObservableObject {
    @Published var progress: LearningProgress { didSet { repository.save(progress) } }
    let curriculum: Curriculum?
    private let repository = ProgressRepository()
    private let speaker = AVSpeechSynthesizer()
    init() {
        progress = repository.load()
        if let url = Bundle.main.url(forResource: "curriculum", withExtension: "json"), let data = try? Data(contentsOf: url) { curriculum = try? Curriculum.decode(data) }
        else { curriculum = nil }
    }
    func speak(_ text: String) {
        guard progress.soundEnabled else { return }
        speaker.stopSpeaking(at: .immediate)
        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = AVSpeechSynthesisVoice(language: "zh-CN")
        utterance.rate = 0.42
        speaker.speak(utterance)
    }
    func stopSpeaking() { speaker.stopSpeaking(at: .immediate) }
    func select(_ value: Int) { progress.lastNumber = value }
    func markLearned(_ value: Int) { progress.learnedNumbers.insert(value) }
    func reward() { progress.stars += 5; progress.gamesCompleted += 1 }
}

enum Sprout {
    static let accent = Color(uiColor: UIColor { traits in
        traits.userInterfaceStyle == .dark ? UIColor(red: 0.57, green: 0.83, blue: 0.65, alpha: 1) : UIColor(red: 0.16, green: 0.48, blue: 0.36, alpha: 1)
    })
    static let green = Color(red: 0.16, green: 0.48, blue: 0.36)
    static let orange = Color(red: 0.78, green: 0.35, blue: 0.14)
    static let yellow = Color(red: 1, green: 0.88, blue: 0.55)
    static let mint = Color(red: 0.83, green: 0.93, blue: 0.85)
    static let ink = Color(red: 0.16, green: 0.24, blue: 0.21)
}

enum Area: String, CaseIterable, Identifiable {
    case home, numbers, games, drawing, parents
    var id: String { rawValue }
    var title: String { switch self { case .home: "探索"; case .numbers: "数字乐园"; case .games: "小游戏"; case .drawing: "画板"; case .parents: "家长区" } }
    var symbol: String { switch self { case .home: "leaf.fill"; case .numbers: "123.rectangle.fill"; case .games: "gamecontroller.fill"; case .drawing: "paintpalette.fill"; case .parents: "person.2.fill" } }
}

struct RootView: View {
    @Environment(\.horizontalSizeClass) private var sizeClass
    @EnvironmentObject private var model: AppModel
    @State private var area: Area? = .home
    var body: some View {
        Group {
            if sizeClass == .regular {
                NavigationSplitView {
                    List(Area.allCases, selection: $area) { item in Label(item.title, systemImage: item.symbol).tag(item).padding(.vertical, 9) }
                        .navigationTitle("萌芽启蒙")
                        .safeAreaInset(edge: .bottom) { Label("每天一点，快乐长大", systemImage: "sun.max.fill").font(.caption).foregroundStyle(.secondary).padding() }
                } detail: { NavigationStack { content(area ?? .home) } }
            } else {
                TabView(selection: Binding(get: { area ?? .home }, set: { area = $0 })) {
                    ForEach(Area.allCases) { item in
                        NavigationStack { content(item) }.tabItem { Label(item.title, systemImage: item.symbol) }.tag(item)
                    }
                }
            }
        }
        .onChange(of: area) { _, _ in model.stopSpeaking() }
    }
    @ViewBuilder private func content(_ item: Area) -> some View {
        switch item {
        case .home: ExploreView(navigate: { area = $0 })
        case .numbers: NumbersView()
        case .games: GamesView()
        case .drawing: DrawingView()
        case .parents: ParentsView()
        }
    }
}

struct Page<Content: View>: View {
    let content: Content
    init(@ViewBuilder content: () -> Content) { self.content = content() }
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) { content }.padding(22).frame(maxWidth: 950).frame(maxWidth: .infinity)
        }.background(Color(uiColor: .systemGroupedBackground))
    }
}
struct Panel<Content: View>: View {
    let content: Content
    init(@ViewBuilder content: () -> Content) { self.content = content() }
    var body: some View { VStack(alignment: .leading, spacing: 16) { content }.padding(22).frame(maxWidth: .infinity, alignment: .leading).background(Color(uiColor: .secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 25)) }
}
struct BigButton: ButtonStyle {
    var color = Sprout.green
    func makeBody(configuration: Configuration) -> some View {
        configuration.label.font(.headline).padding(.horizontal, 20).frame(minHeight: 50).frame(maxWidth: .infinity).foregroundStyle(.white).background(color.opacity(configuration.isPressed ? 0.75 : 1), in: RoundedRectangle(cornerRadius: 17))
    }
}
struct SproutIllustration: View {
    var body: some View {
        ZStack {
            Circle().fill(Sprout.yellow).frame(width: 126, height: 126)
            Image(systemName: "leaf.fill").font(.system(size: 66)).foregroundStyle(Sprout.green).rotationEffect(.degrees(-20)).offset(x: -13, y: -10)
            Image(systemName: "leaf.fill").font(.system(size: 48)).foregroundStyle(Color(red: 0.32, green: 0.65, blue: 0.4)).rotationEffect(.degrees(45)).offset(x: 21, y: -22)
            Text("☺︎").font(.system(size: 35, weight: .bold)).foregroundStyle(Sprout.ink).offset(y: 28)
        }.accessibilityHidden(true)
    }
}

struct ExploreView: View {
    @EnvironmentObject private var model: AppModel
    let navigate: (Area) -> Void
    var body: some View {
        Page {
            HStack { Label("小小好奇心，大大的世界", systemImage: "sun.max.fill").font(.subheadline).foregroundStyle(.secondary); Spacer() }
            ViewThatFits {
                HStack(spacing: 28) { heroText; SproutIllustration() }
                VStack(alignment: .leading, spacing: 18) { heroText; SproutIllustration().frame(maxWidth: .infinity) }
            }.padding(25).frame(maxWidth: .infinity, alignment: .leading).background(Sprout.mint, in: RoundedRectangle(cornerRadius: 28))
            HStack(spacing: 12) {
                metric("\(model.progress.learnedNumbers.count) / 11", "认识的数字", symbol: "book.closed.fill")
                metric("\(model.progress.stars)", "成长星星", symbol: "star.fill")
            }
            Button { navigate(.numbers) } label: {
                HStack { VStack(alignment: .leading, spacing: 7) { Text("继续我的小探索").font(.headline); Text("上次认识了数字 \(model.progress.lastNumber)").font(.subheadline) }; Spacer(); Image(systemName: "arrow.right.circle.fill").font(.largeTitle) }.padding(22)
            }.foregroundStyle(Sprout.ink).background(Sprout.yellow, in: RoundedRectangle(cornerRadius: 23)).accessibilityIdentifier("continueLearning")
            Text("今天，想玩点什么？").font(.title2.bold())
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 14)], spacing: 14) {
                destination(.numbers, description: "从 0 到 10，一起数一数", emoji: "🍎")
                destination(.games, description: "3 个小游戏，每次 5 关", emoji: "🎈")
                destination(.drawing, description: "把奇思妙想画下来", emoji: "🎨")
            }
            Label("建议家长陪伴，一次学习一点点。", systemImage: "heart.fill").font(.footnote).foregroundStyle(.secondary)
        }.navigationTitle("萌芽启蒙")
    }
    private var heroText: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("你好，小小探索家！").font(.system(.largeTitle, design: .rounded, weight: .bold))
            Text("数一数、玩一玩、画一画\n让每一份好奇心，悄悄发芽。").font(.body).lineSpacing(5)
        }.foregroundStyle(Sprout.ink).frame(maxWidth: .infinity, alignment: .leading)
    }
    private func metric(_ value: String, _ title: String, symbol: String) -> some View {
        VStack(alignment: .leading, spacing: 8) { Image(systemName: symbol).foregroundStyle(Sprout.orange); Text(value).font(.title2.bold()); Text(title).font(.caption).foregroundStyle(.secondary) }.frame(maxWidth: .infinity, alignment: .leading).padding(20).background(Color(uiColor: .secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 22))
    }
    private func destination(_ area: Area, description: String, emoji: String) -> some View {
        Button { navigate(area) } label: {
            VStack(alignment: .leading, spacing: 13) { Text(emoji).font(.system(size: 40)); Text(area.title).font(.title3.bold()); Text(description).font(.subheadline).foregroundStyle(.secondary).multilineTextAlignment(.leading) }.frame(maxWidth: .infinity, minHeight: 140, alignment: .leading).padding(20).background(Color(uiColor: .secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 24))
        }.buttonStyle(.plain)
    }
}

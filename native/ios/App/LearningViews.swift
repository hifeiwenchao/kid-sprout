import SwiftUI
#if os(iOS)
import KidSproutCore
#endif

struct NumbersView: View {
    @EnvironmentObject private var model: AppModel
    @State private var counter = FruitCounter(total: 0)
    @State private var zeroHasApple = false
    @State private var countText = "点一点水果，一起数一数"
    private var value: Int { model.progress.lastNumber }
    var body: some View {
        Page {
            Text("认识数字，从身边的小事开始").font(.subheadline).foregroundStyle(.secondary)
            if let lessons = model.curriculum?.numbers {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 53), spacing: 10)], spacing: 10) {
                    ForEach(lessons) { lesson in
                        Button { model.select(lesson.value) } label: {
                            VStack(spacing: 3) {
                                Text("\(lesson.value)").font(.system(.title2, design: .rounded, weight: .bold))
                                if model.progress.learnedNumbers.contains(lesson.value) { Image(systemName: "checkmark.circle.fill").font(.caption2) }
                            }.frame(maxWidth: .infinity, minHeight: 57).foregroundStyle(value == lesson.value ? Color.white : Color.primary).background(value == lesson.value ? Sprout.green : Sprout.panel, in: RoundedRectangle(cornerRadius: 17))
                        }.accessibilityLabel("数字\(lesson.value)\(model.progress.learnedNumbers.contains(lesson.value) ? "，已学过" : "")").accessibilityIdentifier("lesson\(lesson.value)")
                    }
                }
                Panel {
                    HStack(alignment: .center, spacing: 24) {
                        Text("\(value)").font(.system(size: 106, weight: .bold, design: .rounded)).foregroundStyle(Sprout.green).minimumScaleFactor(0.6).accessibilityHidden(true)
                        VStack(alignment: .leading, spacing: 12) {
                            Text(lessons[value].name).font(.largeTitle.bold())
                            Text(value == 0 ? "一个也没有，就是 0" : "\(value) 个苹果，\(value) 个好朋友").font(.subheadline).foregroundStyle(.secondary)
                            Button { model.speak(lessons[value].name) } label: { Label("听一听", systemImage: "speaker.wave.2.fill").frame(minHeight: 44) }.buttonStyle(.bordered).accessibilityIdentifier("speakNumber")
                        }
                    }.frame(maxWidth: .infinity)
                    Divider()
                    if value == 0 { zeroBasket }
                    else {
                        FruitGrid(count: value, visited: counter.visited) { index in
                            let oldCount = counter.visited.count
                            let count = counter.tap(index)
                            countText = "已经数了 \(count) 个苹果"
                            if count != oldCount { model.speak("\(count)") }
                        }
                        Text(countText).font(.headline).frame(maxWidth: .infinity).accessibilityIdentifier("countFeedback")
                        Button { resetCounter() } label: { Text("重新数一数").frame(minHeight: 44).frame(maxWidth: .infinity).contentShape(Rectangle()) }
                    }
                    Button {
                        model.markLearned(value)
                        model.speak("太棒了，你认识数字\(lessons[value].name)啦")
                    } label: { Label(model.progress.learnedNumbers.contains(value) ? "已经认识啦" : "我认识这个数字啦", systemImage: "checkmark.seal.fill") }.buttonStyle(BigButton()).accessibilityIdentifier("markLearned")
                }
                HStack {
                    Button { model.select(max(0, value - 1)) } label: { Label("上一个", systemImage: "chevron.left").frame(minHeight: 44) }.disabled(value == 0)
                    Spacer()
                    Text("\(value + 1) / 11").foregroundStyle(.secondary)
                    Spacer()
                    Button { model.select(min(10, value + 1)) } label: { Label("下一个", systemImage: "chevron.right").frame(minHeight: 44) }.disabled(value == 10)
                }
            } else {
                ContentUnavailableView("课程暂时无法打开", systemImage: "book.closed", description: Text("请重新安装应用，离线课程文件可能已损坏。"))
            }
            Label("数过的水果会亮起来，重复点也不会多算。", systemImage: "lightbulb.fill").font(.footnote).foregroundStyle(.secondary)
        }.navigationTitle("数字乐园").onAppear { resetCounter() }.onChange(of: value) { _, _ in resetCounter(); zeroHasApple = false }
    }
    private var zeroBasket: some View {
        VStack(spacing: 14) {
            ZStack {
                Image(systemName: "basket.fill").font(.system(size: 90)).foregroundStyle(Sprout.orange.opacity(0.7))
                if zeroHasApple { Text("🍎").font(.system(size: 44)).offset(y: -26) }
            }.frame(height: 112).accessibilityLabel(zeroHasApple ? "篮子里有一个苹果" : "空篮子")
            Text(zeroHasApple ? "放入 1 个，现在有 1 个" : "空空的篮子，有 0 个苹果").font(.headline).multilineTextAlignment(.center)
            Button(zeroHasApple ? "拿走苹果" : "放入苹果") { zeroHasApple.toggle(); model.speak(zeroHasApple ? "放入一个苹果，现在有一个" : "一个也没有了，这就是零") }.buttonStyle(.borderedProminent).controlSize(.large).frame(minHeight: 44).accessibilityIdentifier("zeroApple")
        }.frame(maxWidth: .infinity)
    }
    private func resetCounter() { counter = FruitCounter(total: value); countText = "点一点水果，一起数一数" }
}

struct FruitGrid: View {
    let count: Int
    var visited: Set<Int> = []
    var tap: ((Int) -> Void)? = nil
    var body: some View {
        if count == 0 {
            VStack(spacing: 10) { Image(systemName: "basket").font(.system(size: 68)); Text("空篮子").font(.headline) }.foregroundStyle(Sprout.orange).frame(maxWidth: .infinity, minHeight: 110).accessibilityLabel("没有水果，零个")
        } else {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 54), spacing: 9)], spacing: 10) {
                ForEach(0..<count, id: \.self) { index in
                    if let tap {
                        Button { tap(index) } label: { fruit(index) }.buttonStyle(.plain).accessibilityLabel("第\(index + 1)个苹果\(visited.contains(index) ? "，数过了" : "")").accessibilityIdentifier("fruit\(index)")
                    } else { fruit(index).accessibilityHidden(true) }
                }
            }.accessibilityElement(children: tap == nil ? .ignore : .contain).accessibilityLabel(tap == nil ? "\(count) 个苹果" : "可点击的苹果")
        }
    }
    private func fruit(_ index: Int) -> some View {
        Text("🍎").font(.system(size: 36)).frame(minWidth: 48, minHeight: 55).frame(maxWidth: .infinity).background(visited.contains(index) ? Sprout.mint : Color.clear, in: RoundedRectangle(cornerRadius: 16)).overlay(alignment: .bottomTrailing) { if visited.contains(index) { Image(systemName: "checkmark.circle.fill").font(.caption).foregroundStyle(Sprout.green) } }
    }
}

struct GamesView: View {
    @EnvironmentObject private var model: AppModel
    var body: some View {
        Page {
            HStack { VStack(alignment: .leading, spacing: 9) { Text("玩着玩着，就学会了").font(.title2.bold()); Text("每次 5 关，答错也能再试。通关获得 5 颗星星。").foregroundStyle(.secondary) }; Spacer(); Text("🎈").font(.system(size: 55)) }
            ForEach(GameKind.allCases) { kind in
                NavigationLink { GameView(kind: kind) } label: {
                    HStack(spacing: 18) { Image(systemName: kind.symbol).font(.system(size: 30)).foregroundStyle(Sprout.green).frame(width: 62, height: 68).background(Sprout.mint, in: RoundedRectangle(cornerRadius: 20)); VStack(alignment: .leading, spacing: 7) { Text(kind.title).font(.title3.bold()); Text(kind.subtitle).font(.subheadline).foregroundStyle(.secondary) }; Spacer(); Image(systemName: "chevron.right").foregroundStyle(.secondary) }.padding(20).background(Sprout.panel, in: RoundedRectangle(cornerRadius: 25))
                }.buttonStyle(.plain).accessibilityIdentifier("game-\(kind.rawValue)")
            }
            Label("已完成 \(model.progress.gamesCompleted) 局 · 收获 \(model.progress.stars) 颗星星", systemImage: "star.fill").font(.subheadline).foregroundStyle(.secondary)
        }.navigationTitle("小游戏")
    }
}

struct GameView: View {
    @EnvironmentObject private var model: AppModel
    let kind: GameKind
    @State private var game: GameSession
    @State private var feedback = "慢慢想，你一定可以！"
    @State private var counter = FruitCounter(total: 10)
    init(kind: GameKind) { self.kind = kind; _game = State(initialValue: GameSession(kind: kind)) }
    var body: some View {
        Page {
            if game.isFinished {
                Panel {
                    Text("🌟").font(.system(size: 84)).frame(maxWidth: .infinity)
                    Text("五关完成，真棒！").font(.largeTitle.bold()).frame(maxWidth: .infinity)
                    Text("收获 5 颗成长星星\n每一次认真尝试，都值得鼓励。").multilineTextAlignment(.center).frame(maxWidth: .infinity).foregroundStyle(.secondary)
                    Button("再玩一局") { game = GameSession(kind: kind); resetRound() }.buttonStyle(BigButton()).accessibilityIdentifier("playAgain")
                }.accessibilityIdentifier("gameComplete")
            } else {
                HStack { Text("第 \(game.round + 1) / 5 关").font(.headline); Spacer(); Label("认真尝试就很棒", systemImage: "heart.fill").font(.caption).foregroundStyle(.secondary) }
                ProgressView(value: Double(game.round), total: 5).tint(Sprout.green).accessibilityLabel("游戏进度")
                Panel {
                    Text(prompt).font(.title2.bold()).frame(maxWidth: .infinity).multilineTextAlignment(.center)
                    Button { speakPrompt() } label: { Label("再听一次", systemImage: "speaker.wave.2.fill").frame(minHeight: 44) }.frame(maxWidth: .infinity)
                    if kind == .countFruit { FruitGrid(count: game.current.quantity, visited: counter.visited, tap: { index in let old = counter.visited.count; let count = counter.tap(index); if count != old { model.speak("\(count)") } }) }
                    else if kind == .findNumber { Text("🔎").font(.system(size: 84)).frame(maxWidth: .infinity).accessibilityHidden(true); Text("找一找：\(numberName(game.current.quantity))").font(.largeTitle.bold()).frame(maxWidth: .infinity) }
                    if kind == .compareQuantities {
                        ViewThatFits(in: .horizontal) {
                            HStack(alignment: .top, spacing: 16) { basket(0); basket(1) }
                            VStack(spacing: 16) { basket(0); basket(1) }
                        }
                    } else {
                        HStack(spacing: 12) { ForEach(game.current.choices, id: \.self) { value in
                            Button { answer(value) } label: { Text("\(value)").font(.system(size: 34, weight: .bold, design: .rounded)).frame(maxWidth: .infinity, minHeight: 78).background(Sprout.mint, in: RoundedRectangle(cornerRadius: 20)).foregroundStyle(Sprout.ink) }.buttonStyle(.plain).disabled(game.answeredCorrectly).accessibilityIdentifier("answer\(value)")
                        } }
                    }
                    Text(feedback).font(.headline).foregroundStyle(game.answeredCorrectly ? Sprout.accent : .primary).multilineTextAlignment(.center).frame(maxWidth: .infinity, minHeight: 48).accessibilityIdentifier("gameFeedback")
                    if game.answeredCorrectly {
                        Button(game.round == 4 ? "完成挑战，领取星星" : "下一关") {
                            game.next()
                            if game.claimReward() { model.reward(); model.speak("太棒了，五关完成") }
                            else { resetRound() }
                        }.buttonStyle(BigButton()).accessibilityIdentifier("nextRound")
                    }
                }
                Text("先选答案，答对后再进入下一关。").font(.footnote).foregroundStyle(.secondary)
            }
        }.navigationTitle(kind.title).onAppear { resetRound() }.onDisappear { model.stopSpeaking() }
    }
    private var prompt: String { switch kind { case .countFruit: "一共有几个苹果？"; case .findNumber: "找到数字\(numberName(game.current.quantity))"; case .compareQuantities: "哪一篮苹果更多？" } }
    private func numberName(_ value: Int) -> String { model.curriculum?.numbers[value].name ?? "\(value)" }
    private func speakPrompt() { model.speak(prompt) }
    private func resetRound() { counter = FruitCounter(total: game.current.quantity); feedback = "慢慢想，你一定可以！"; speakPrompt() }
    private func answer(_ value: Int) {
        switch game.submit(value) {
        case .correct: feedback = "答对啦！你观察得真仔细。"; model.speak("答对啦")
        case .incorrect: feedback = "再看一看，试一次吧！"; model.speak("再试一次吧")
        case .locked: break
        }
    }
    private func basket(_ side: Int) -> some View {
        Button { answer(side) } label: {
            VStack(spacing: 12) { Text(side == 0 ? "左边一篮" : "右边一篮").font(.headline); FruitGrid(count: side == 0 ? game.current.quantity : game.current.otherQuantity); Text("选这一篮").font(.headline) }.padding(16).frame(minWidth: 125, maxWidth: .infinity).background(Sprout.mint, in: RoundedRectangle(cornerRadius: 20)).foregroundStyle(Sprout.ink)
        }.buttonStyle(.plain).disabled(game.answeredCorrectly).accessibilityIdentifier("basket\(side)")
    }
}

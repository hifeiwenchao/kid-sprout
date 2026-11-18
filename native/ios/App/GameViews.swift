import SwiftUI
import AVFoundation
#if os(iOS)
import KidSproutCore
#endif

private let gameCategories = [("all", "所有练习目标"), ("recognize", "观察与认知"), ("listen", "听音与辨认"), ("think", "顺序与思考"), ("build", "动手与组合")]

struct GameCard: View {
    @EnvironmentObject private var model: AppModel
    @State private var presentedGame: NativeGame?
    let game: NativeGame
    var compact = false
    var body: some View {
        Button { model.stopSpeaking(); presentedGame = game } label: {
            HStack(alignment: .center, spacing: 15) {
                Group {
                    if let asset = cardAsset { NativeIllustration(name: asset).padding(10) }
                    else { Text(game.symbol).font(.system(size: game.symbol.count > 3 ? 19 : 30)) }
                }.frame(width: 58, height: 62).background(game.subject.wash, in: RoundedRectangle(cornerRadius: 16))
                VStack(alignment: .leading, spacing: 7) {
                    Text("\(game.subject.title) · \(game.skill)").font(.system(size: 10)).foregroundStyle(game.subject.accent)
                    Text(game.title).font(.headline).foregroundStyle(Sprout.ink)
                    Text(game.description).font(.caption).lineSpacing(4).foregroundStyle(Sprout.muted).fixedSize(horizontal: false, vertical: true)
                }.frame(maxWidth: .infinity, alignment: .leading)
                Image(systemName: "arrow.up.right").font(.caption).foregroundStyle(Sprout.muted)
            }.padding(compact ? 16 : 20).frame(maxWidth: .infinity, minHeight: compact ? 100 : 125, alignment: .leading)
                .background(Sprout.panel, in: RoundedRectangle(cornerRadius: 18)).overlay(RoundedRectangle(cornerRadius: 18).stroke(Sprout.line))
        }.buttonStyle(.plain).accessibilityIdentifier("game-\(game.id)")
            .sheet(item: $presentedGame, onDismiss: { model.stopSpeaking() }) { GamePlayerView(game: $0).environmentObject(model) }
    }
    private var cardAsset: String? {
        guard game.subject == .numbers else { return nil }
        return ["count":"number_motif_0", "compare":"rabbit", "train":"train_engine", "picnic":"bear", "memory":"number_motif_4", "balloons":"number_motif_8"][game.type]
    }
}

struct GameLibraryView: View {
    @EnvironmentObject private var model: AppModel
    var subject: NativeSubject? = nil
    @State private var selectedSubject = "all"
    @State private var category = "all"
    @State private var query = ""
    private var currentSubject: NativeSubject? { subject ?? NativeSubject(rawValue: selectedSubject) }
    private var filtered: [NativeGame] { model.activities?.filtered(subject: currentSubject, category: category, query: query) ?? [] }
    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            if let subject { SectionHeader(eyebrow: "LEARN THROUGH PLAY", title: "\(subject.title) · 玩一会，也学一点", detail: "20 个小游戏，按小小目标慢慢探索。") }
            else {
                ScrollView(.horizontal, showsIndicators: false) { HStack(spacing: 9) {
                    filterButton("全部学科", value: "all", selected: $selectedSubject)
                    ForEach(NativeSubject.allCases) { filterButton($0.title, value: $0.rawValue, selected: $selectedSubject) }
                } }
            }
            ViewThatFits(in: .horizontal) { HStack(spacing: 16) { search.frame(minWidth: 170); categoryPicker.frame(minWidth: 160, maxWidth: 230) }; VStack(alignment: .leading, spacing: 14) { search; categoryPicker } }
                .padding(17).background(Sprout.mint, in: RoundedRectangle(cornerRadius: 17))
            Text("\(filtered.count) 个小游戏，选一个开始吧").font(.caption).foregroundStyle(Sprout.muted).accessibilityIdentifier("gameFilterStatus")
            if filtered.isEmpty {
                Panel { Image(systemName: "leaf").font(.largeTitle).foregroundStyle(Sprout.green).frame(maxWidth: .infinity); Text("小伙伴还没找到").font(.title3.bold()).frame(maxWidth: .infinity); Text("换个词，或试试其他练习目标吧。").font(.subheadline).foregroundStyle(Sprout.muted).frame(maxWidth: .infinity); Button("显示全部游戏") { query = ""; category = "all"; selectedSubject = "all" }.buttonStyle(BigButton()) }
            } else if subject != nil && category == "all" && query.isEmpty {
                ForEach(Array(gameCategories.dropFirst()), id: \.0) { item in
                    let games = filtered.filter { $0.category == item.0 }
                    if !games.isEmpty { VStack(alignment: .leading, spacing: 13) { HStack { Text(item.1).font(.headline); Text("\(games.count) 个游戏").font(.caption).foregroundStyle(Sprout.muted) }; cards(games) } }
                }
            } else { cards(filtered) }
        }
    }
    private var search: some View { VStack(alignment: .leading, spacing: 8) { Text("找一找小游戏").font(.caption); HStack { Image(systemName: "magnifyingglass").foregroundStyle(Sprout.muted); TextField("游戏名、练习目标…", text: $query).textFieldStyle(.plain).accessibilityIdentifier("gameSearch"); if !query.isEmpty { Button { query = "" } label: { Image(systemName: "xmark.circle.fill") }.buttonStyle(.plain).accessibilityLabel("清除搜索") } }.padding(12).background(Sprout.panel, in: RoundedRectangle(cornerRadius: 11)) } }
    private var categoryPicker: some View { VStack(alignment: .leading, spacing: 8) { Text("今天想练什么").font(.caption); Picker("练习目标", selection: $category) { ForEach(gameCategories, id: \.0) { Text($0.1).tag($0.0) } }.labelsHidden().pickerStyle(.menu).frame(maxWidth: .infinity, minHeight: 44).background(Sprout.panel, in: RoundedRectangle(cornerRadius: 11)).accessibilityIdentifier("gameCategory") } }
    private func cards(_ games: [NativeGame]) -> some View { LazyVGrid(columns: [GridItem(.adaptive(minimum: 240), spacing: 14)], spacing: 14) { ForEach(games) { GameCard(game: $0) } } }
    private func filterButton(_ label: String, value: String, selected: Binding<String>) -> some View { Button { selected.wrappedValue = value } label: { Text(label).font(.subheadline).padding(.horizontal, 15).frame(minHeight: 44).foregroundStyle(selected.wrappedValue == value ? Sprout.green : Sprout.muted).background(selected.wrappedValue == value ? Sprout.mint : Sprout.panel, in: RoundedRectangle(cornerRadius: 12)).overlay(RoundedRectangle(cornerRadius: 12).stroke(Sprout.line)) }.buttonStyle(.plain) }
}

@MainActor private final class NativeDrum: ObservableObject {
    @Published var error: String?
    @Published var playing = false
    @Published var finished = false
    private let engine = AVAudioEngine()
    private let player = AVAudioPlayerNode()
    private var generation = UUID()
    init() { engine.attach(player); engine.connect(player, to: engine.mainMixerNode, format: AVAudioFormat(standardFormatWithSampleRate: 44100, channels: 1)) }
    func play(_ count: Int) {
        stop(); error = nil
        let beats = max(1, min(10, count)), rate = 44100.0
        guard let format = AVAudioFormat(standardFormatWithSampleRate: rate, channels: 1), let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: AVAudioFrameCount(Double(beats) * 0.65 * rate)), let samples = buffer.floatChannelData?[0] else { error = "声音暂时无法播放，可以展开鼓点提示。"; return }
        buffer.frameLength = buffer.frameCapacity
        for index in 0..<Int(buffer.frameLength) {
            let time = Double(index) / rate, beatTime = time.truncatingRemainder(dividingBy: 0.65)
            samples[index] = beatTime < 0.18 ? Float(sin(2 * .pi * (120 - 160 * beatTime) * beatTime) * exp(-28 * beatTime) * 0.55) : 0
        }
        do {
            if !engine.isRunning { try engine.start() }
            let token = generation; playing = true
            player.scheduleBuffer(buffer, completionCallbackType: .dataPlayedBack) { [weak self] _ in Task { @MainActor in if self?.generation == token { self?.playing = false; self?.finished = true } } }
            player.play()
        } catch { self.error = "声音暂时无法播放，可以展开鼓点提示。"; playing = false }
    }
    func stop() { generation = UUID(); player.stop(); engine.stop(); playing = false; finished = false }
}

struct GamePlayerView: View {
    @EnvironmentObject private var model: AppModel
    @Environment(\.dismiss) private var dismiss
    let game: NativeGame
    @State private var session: ActivitySession
    @State private var memory: MemoryGameState
    @State private var balloons: SequenceGameState
    @State private var selected: [String] = []
    @State private var quantity = 0
    @State private var counted: Set<Int> = []
    @State private var feedback = "不着急，想好了再试一试。"
    @State private var showHint = false
    @State private var showDrumHint = false
    @State private var heardDrum = false
    @State private var traceNumber = 0
    @State private var mismatchTask: Task<Void, Never>?
    @StateObject private var drum = NativeDrum()
    private var round: ActivityRound { session.current }
    init(game: NativeGame) {
        self.game = game
        let rounds = game.randomRounds()
        _session = State(initialValue: ActivitySession(rounds: rounds))
        _memory = State(initialValue: MemoryGameState(round: rounds[0]))
        _balloons = State(initialValue: SequenceGameState(round: rounds[0]))
    }
    var body: some View {
        NavigationStack {
            Page {
                if session.completed { completion }
                else {
                    HStack { Text("\(game.subject.title) · \(game.skill)").font(.caption).foregroundStyle(game.subject.accent); Spacer(); Button("重新开始") { restart() }.buttonStyle(.plain).font(.caption).foregroundStyle(Sprout.muted) }
                    if round.mode != "trace" {
                        HStack(spacing: 9) { ForEach(session.rounds.indices, id: \.self) { index in Capsule().fill(index <= session.index ? game.subject.accent : Sprout.line).frame(height: 5) } }
                        Text("第 \(session.index + 1) / \(session.rounds.count) 关").font(.caption).foregroundStyle(Sprout.muted)
                    }
                    Text(round.prompt).font(.system(.title2, design: .rounded, weight: .bold)).frame(maxWidth: .infinity, alignment: .center).multilineTextAlignment(.center).accessibilityIdentifier("activityPrompt")
                    scene
                    if round.scene != "drum", round.speech != nil || round.speechLang == "en-US" {
                        Button { listen() } label: { Label(!model.progress.soundEnabled ? "开启声音听一听" : game.subject == .pinyin ? "听例字读音参考" : "再听一遍", systemImage: "speaker.wave.2").frame(minHeight: 44) }.buttonStyle(.bordered).tint(game.subject.accent)
                    }
                    interaction
                    if round.mode != "trace" {
                        DisclosureGroup(isExpanded: $showHint) { Text(round.hint ?? "慢慢观察，试一试；也可以请大人陪你一起想。").font(.subheadline).lineSpacing(5).padding(.top, 9) } label: { Text("看看小提示").font(.subheadline) }.tint(game.subject.accent)
                        Text(feedback).font(.subheadline).lineSpacing(5).foregroundStyle(session.solved ? Sprout.green : Sprout.muted).frame(maxWidth: .infinity, alignment: .center).accessibilityIdentifier("gameFeedback")
                        if session.solved { Button(session.index == session.rounds.count - 1 ? "领取小星星" : "下一关 →") { next() }.buttonStyle(BigButton(color: game.subject.accent)).accessibilityIdentifier("nextRound") }
                    }
                    if game.subject == .pinyin { Text("合成语音播放例字读音参考，不等同于标准拼音音素录音；请配合老师或家长示范。").font(.caption2).foregroundStyle(Sprout.muted) }
                }
            }
            .navigationTitle(game.title)
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button("关闭") { dismiss() } } }
        }
        #if os(macOS)
        .frame(minWidth: 560, idealWidth: 720, minHeight: 580, idealHeight: 820)
        #endif
        .onAppear { startRound() }
        .onDisappear { mismatchTask?.cancel(); drum.stop(); model.stopSpeaking() }
        .onChange(of: model.progress.soundEnabled) { _, enabled in if !enabled { drum.stop() } }
        .onChange(of: drum.finished) { _, finished in if finished { heardDrum = true } }
    }
    @ViewBuilder private var scene: some View {
        switch round.scene {
        case "fruit":
            VStack(spacing: 13) {
                if (round.count ?? 0) == 0 { NativeIllustration(name: "empty_basket").frame(height: 100); Text("一个水果也没有，可以用 0 表示。").font(.subheadline).foregroundStyle(Sprout.muted) }
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 56), spacing: 12)], spacing: 13) { ForEach(0..<(round.count ?? 0), id: \.self) { index in Button {
                    guard !session.solved else { return }
                    guard counted.insert(index).inserted else { return }
                    model.speak("\(counted.count)")
                } label: { NativeIllustration(name: round.item ?? "number_motif_0").frame(height: 56).padding(8).background(counted.contains(index) ? Sprout.mint : .clear, in: RoundedRectangle(cornerRadius: 14)).overlay(alignment: .topTrailing) { if counted.contains(index) { Image(systemName: "checkmark.circle.fill").foregroundStyle(Sprout.green) } } }.buttonStyle(.plain).accessibilityLabel("第 \(index + 1) 个水果").accessibilityIdentifier("fruit\(index)") } }
                Text("已经数了 \(counted.count) 个水果").font(.caption).foregroundStyle(Sprout.muted).accessibilityIdentifier("countFeedback")
            }.padding(21).background(Sprout.goldWash, in: RoundedRectangle(cornerRadius: 21))
        case "compare":
            VStack(spacing: 16) { NativeIllustration(name: "rabbit").frame(height: 100); Text("数一数，选一篮更多的送给小兔").font(.caption).foregroundStyle(Sprout.muted)
                HStack(alignment: .top, spacing: 14) { ForEach(Array((round.counts ?? []).enumerated()), id: \.offset) { index, count in Button { submit([String(index)]) } label: { VStack(spacing: 10) { LazyVGrid(columns: [GridItem(.adaptive(minimum: 25))], spacing: 5) { ForEach(0..<count, id: \.self) { _ in NativeIllustration(name: "number_motif_7").frame(height: 38) } }.frame(minHeight: 90); Image(systemName: "basket.fill").font(.system(size: 50)).foregroundStyle(Sprout.gold); Text(session.solved ? "\(count) 根胡萝卜" : index == 0 ? "这一篮" : "那一篮").font(.caption) }.padding(18).frame(maxWidth: .infinity).background(Sprout.goldWash, in: RoundedRectangle(cornerRadius: 18)).overlay(RoundedRectangle(cornerRadius: 18).stroke(session.solved && round.answer == [String(index)] ? Sprout.green : Sprout.line, lineWidth: 2)) }.buttonStyle(.plain).disabled(session.solved).accessibilityIdentifier("basket\(index)") } }
            }
        case "train": trainScene((round.values ?? []).map { $0 == -1 ? "?" : String($0) })
        case "alphabet-train": trainScene((round.display ?? "").components(separatedBy: "→").map { $0.trimmingCharacters(in: .whitespaces) })
        case "drum":
            VStack(spacing: 15) { DrumIllustration().frame(height: 125); Button { listen() } label: { Label(drum.playing ? "正在敲鼓…" : !model.progress.soundEnabled ? "开启声音听一听" : "再听一遍小鼓", systemImage: "play.fill").frame(minHeight: 44) }.buttonStyle(.borderedProminent).disabled(drum.playing || session.solved); Toggle("展开鼓点提示，无声也能玩", isOn: $showDrumHint).font(.caption).disabled(drum.playing); if showDrumHint { Text(Array(repeating: "●", count: round.count ?? 0).joined(separator: "  ")).font(.title2).foregroundStyle(Sprout.gold) }; if let error = drum.error { Text(error).font(.caption).foregroundStyle(Sprout.orange) } }.padding(22).frame(maxWidth: .infinity).background(Sprout.goldWash, in: RoundedRectangle(cornerRadius: 20))
        case "picnic": NativeIllustration(name: "bear").frame(height: 130)
        default:
            if let display = round.display, !display.isEmpty { Text(display).font(.system(size: display.count <= 5 ? 48 : 25, weight: .semibold, design: .rounded)).multilineTextAlignment(.center).padding(24).frame(maxWidth: .infinity).background(game.subject.wash, in: RoundedRectangle(cornerRadius: 20)) }
        }
        if game.id == "pinyin-tones", let symbol = toneSymbol { MemorySceneView(subject: .pinyin, symbol: symbol) }
        if let visual = round.visualText, !visual.isEmpty { Text(visual).font(.system(size: 22)).multilineTextAlignment(.center).lineSpacing(10).padding(20).frame(maxWidth: .infinity).background(game.subject.wash.opacity(0.6), in: RoundedRectangle(cornerRadius: 18)) }
    }
    private var toneSymbol: String? {
        guard let answer = round.answer.first else { return nil }
        let accents: [UInt32: String] = [0x304:"ā", 0x301:"á", 0x30C:"ǎ", 0x300:"à"]
        return answer.decomposedStringWithCanonicalMapping.unicodeScalars.compactMap { accents[$0.value] }.first
    }
    private func trainScene(_ values: [String]) -> some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(alignment: .bottom, spacing: 7) {
                NativeIllustration(name: "train_engine").frame(width: 85, height: 85)
                ForEach(Array(values.enumerated()), id: \.offset) { _, value in
                    VStack(spacing: 3) {
                        Text(value == "?" && session.solved ? round.answer.first ?? "?" : value).font(.system(size: 29, weight: .bold, design: .rounded))
                            .frame(width: 55, height: 55).background(value == "?" ? Sprout.yellow : Sprout.mint, in: RoundedRectangle(cornerRadius: 11))
                        HStack { Circle().frame(width: 10, height: 10); Spacer(); Circle().frame(width: 10, height: 10) }.foregroundStyle(Sprout.muted).padding(.horizontal, 7)
                    }
                }
            }.padding(16)
        }.background(Sprout.goldWash, in: RoundedRectangle(cornerRadius: 20))
    }
    @ViewBuilder private var interaction: some View {
        switch round.mode {
        case "trace":
            ScrollView(.horizontal, showsIndicators: false) { HStack { ForEach(0...10, id: \.self) { number in Button { traceNumber = number } label: { Text(String(number)).font(.headline).frame(width: 44, height: 44).background(traceNumber == number ? Sprout.mint : Sprout.panel, in: RoundedRectangle(cornerRadius: 10)) }.buttonStyle(.plain) } } }
            LessonTracingView(group: "numbers", symbol: String(traceNumber))
        case "memory": memoryCards
        case "balloons": balloonCards
        case "build": builder
        default:
            if round.scene != "compare" {
                if round.mode == "sequence" {
                    Text("按顺序点选，再点「选好啦」；点已选卡片可以撤回").font(.caption).foregroundStyle(Sprout.muted)
                    if selected.isEmpty { Text("把小伙伴请到这里来").font(.caption).foregroundStyle(Sprout.muted).frame(maxWidth: .infinity, minHeight: 48).background(game.subject.wash, in: RoundedRectangle(cornerRadius: 12)) }
                    else { LazyVGrid(columns: [GridItem(.adaptive(minimum: 65))], spacing: 9) { ForEach(Array(selected.enumerated()), id: \.offset) { index, value in Button { if !session.solved { selected.remove(at: index) } } label: { Text("\(round.choices.first(where: { $0.value == value })?.label ?? value) ×").font(.headline).padding(12).frame(maxWidth: .infinity).background(game.subject.wash, in: RoundedRectangle(cornerRadius: 12)) }.buttonStyle(.plain).disabled(session.solved) } } }
                } else if round.mode == "select" { Text("找齐所有符合条件的小伙伴，再点「选好啦」").font(.caption).foregroundStyle(Sprout.muted) }
                choiceCards
                if ["sequence", "select"].contains(round.mode) { HStack { Button("清空重来") { selected = [] }.buttonStyle(.bordered); Button("选好啦") { submit(selected) }.buttonStyle(.borderedProminent) }.frame(minHeight: 48).disabled(session.solved) }
            }
        }
    }
    private var choiceCards: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 100), spacing: 13)], spacing: 13) { ForEach(round.choices) { choice in
            Button {
                guard !session.solved else { return }
                if round.mode == "choice" { submit([choice.value]) }
                else if let index = selected.firstIndex(of: choice.value) { selected.remove(at: index) }
                else { selected.append(choice.value) }
            } label: {
                VStack(spacing: 9) { Text(choice.label).font(.system(size: choice.label.count <= 4 ? 31 : 20, weight: .semibold, design: .rounded)).multilineTextAlignment(.center); if let small = choice.small { Text(small).font(.caption).foregroundStyle(Sprout.muted) } }
                    .padding(17).frame(maxWidth: .infinity, minHeight: 88).background(selected.contains(choice.value) || session.solved && round.answer.contains(choice.value) ? game.subject.wash : Sprout.panel, in: RoundedRectangle(cornerRadius: 17)).overlay(RoundedRectangle(cornerRadius: 17).stroke(selected.contains(choice.value) || session.solved && round.answer.contains(choice.value) ? game.subject.accent : Sprout.line, lineWidth: 2))
            }.buttonStyle(.plain).disabled(session.solved || round.mode == "sequence" && selected.contains(choice.value) || round.scene == "drum" && (drum.playing || !heardDrum && !showDrumHint)).accessibilityIdentifier("answer\(choice.value)")
        } }
    }
    private var builder: some View {
        VStack(spacing: 20) {
            Text("点加号、减号调整数量，再点「装好啦」").font(.caption).foregroundStyle(Sprout.muted)
            if quantity == 0 { Text("空空的，还没有").foregroundStyle(Sprout.muted).frame(minHeight: 70) }
            else { LazyVGrid(columns: [GridItem(.adaptive(minimum: 34))], spacing: 8) { ForEach(0..<quantity, id: \.self) { _ in if round.scene == "picnic" { NativeIllustration(name: "cookie").frame(height: 38) } else { Text(round.item ?? "⭐").font(.system(size: 29)) } } }.padding(13).frame(minHeight: 70) }
            HStack(spacing: 25) { Button { quantity = max(0, quantity - 1) } label: { Image(systemName: "minus").frame(width: 48, height: 48).background(Sprout.panel, in: Circle()) }.buttonStyle(.plain).disabled(quantity == 0 || session.solved).accessibilityLabel("减少一个"); Text(String(quantity)).font(.system(size: 37, weight: .bold, design: .rounded)).frame(minWidth: 60); Button { quantity = min(round.max ?? 10, quantity + 1) } label: { Image(systemName: "plus").frame(width: 48, height: 48).background(Sprout.panel, in: Circle()) }.buttonStyle(.plain).disabled(quantity >= (round.max ?? 10) || session.solved).accessibilityLabel("增加一个") }
            HStack { Button("清空重来") { quantity = 0 }.buttonStyle(.bordered); Button("装好啦") { submit([String(quantity)]) }.buttonStyle(.borderedProminent) }.disabled(session.solved)
        }.padding(22).frame(maxWidth: .infinity).background(game.subject.wash, in: RoundedRectangle(cornerRadius: 21))
    }
    private var memoryCards: some View {
        VStack(spacing: 15) {
            Text("数字几，就找几颗星星；翻开两张卡片，让它们牵手。").font(.caption).foregroundStyle(Sprout.muted)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 110), spacing: 13)], spacing: 13) { ForEach(Array(round.choices.enumerated()), id: \.offset) { index, choice in
                let visible = memory.revealed.contains(index) || memory.matched.contains(index)
                Button { flip(index) } label: {
                    VStack(spacing: 9) { Text(visible ? choice.label : "?").font(.system(size: visible && choice.label.count > 3 ? 20 : 37, weight: .bold, design: .rounded)).multilineTextAlignment(.center); Text(memory.matched.contains(index) ? "✓ 找到朋友" : visible ? choice.small ?? "记住它的位置" : "点我翻一翻").font(.caption2) }
                        .padding(13).frame(maxWidth: .infinity, minHeight: 125).background(visible ? Sprout.goldWash : Sprout.mint, in: RoundedRectangle(cornerRadius: 18)).overlay(RoundedRectangle(cornerRadius: 18).stroke(memory.matched.contains(index) ? Sprout.green : Sprout.line, lineWidth: 2))
                }.buttonStyle(.plain).disabled(memory.matched.contains(index) || memory.mismatched).accessibilityLabel(visible ? choice.label : "翻开第 \(index + 1) 张卡片")
            } }
            Text("已找到 \(memory.matched.count / 2) / 3 对").font(.caption).foregroundStyle(Sprout.muted)
        }
    }
    private var balloonCards: some View {
        VStack(spacing: 18) {
            Text(balloons.nextValue.map { "下一位数字朋友：\($0)" } ?? "这一关全部找到啦！").font(.title3.bold()).foregroundStyle(Sprout.purple)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 82), spacing: 14)], spacing: 14) { ForEach(round.choices) { choice in
                let popped = balloons.picked.contains(choice.value)
                Button { let result = balloons.tap(choice.value); if result == .incorrect { feedback = "不着急，先找数字 \(balloons.nextValue ?? "") 的气球哦。" }; if result == .correct { model.speak(choice.value); feedback = "数字 \(choice.value) 找到啦！"; if balloons.completed { submit(balloons.picked) } } } label: {
                    VStack(spacing: 0) { ZStack { Ellipse().fill(popped ? Sprout.mint : Sprout.numberWashes[(Int(choice.value) ?? 1) % Sprout.numberWashes.count]); Text(popped ? "✓" : choice.label).font(.system(size: 29, weight: .bold, design: .rounded)) }.frame(height: 90); Rectangle().fill(Sprout.muted.opacity(0.4)).frame(width: 1, height: 25) }.opacity(popped ? 0.5 : 1)
                }.buttonStyle(.plain).disabled(popped || session.solved).accessibilityLabel("数字 \(choice.label) 的气球")
            } }
            ProgressView(value: Double(balloons.picked.count), total: Double(max(1, round.answer.count))).tint(Sprout.purple)
            Text("已经找到 \(balloons.picked.count) / \(round.answer.count) 个").font(.caption).foregroundStyle(Sprout.muted)
        }.padding(20).background(Sprout.purpleWash, in: RoundedRectangle(cornerRadius: 21))
    }
    private var completion: some View {
        VStack(spacing: 23) { Image(systemName: "star.circle.fill").font(.system(size: 80)).foregroundStyle(Sprout.gold); Text("小小探险家，真棒！").font(.largeTitle.bold()); Text("\(game.title)的 \(session.rounds.count) 关都完成啦！\n收下一颗小星星，记住今天的小发现。").font(.subheadline).lineSpacing(6).multilineTextAlignment(.center); Button("再玩一局") { restart() }.buttonStyle(BigButton(color: game.subject.accent)); Button("回到游戏大厅") { dismiss() }.buttonStyle(.bordered) }.padding(.vertical, 35).frame(maxWidth: .infinity).accessibilityIdentifier("gameComplete")
    }
    private func submit(_ answer: [String]) {
        guard round.scene != "drum" || !drum.playing && (heardDrum || showDrumHint) else { return }
        let result = session.submit(answer)
        if result == .incorrect { feedback = "差一点点，看看小提示，再试一次吧。"; showHint = true }
        if result == .correct { solvedFeedback() }
    }
    private func solvedFeedback() { model.stopSpeaking(); drum.stop(); feedback = "答对啦！\(round.explanation ?? "你观察得真仔细。")"; showHint = true }
    private func flip(_ index: Int) {
        switch memory.flip(index) {
        case .mismatch:
            feedback = "记住它们的位置，再找一找。"
            mismatchTask?.cancel(); mismatchTask = Task { @MainActor in try? await Task.sleep(for: .seconds(1.4)); guard !Task.isCancelled else { return }; memory.resetMismatch() }
        case .matched: feedback = "找到一对好朋友啦！"
        case .completed: _ = session.completeInteraction(); solvedFeedback()
        case .revealed: model.speak(round.choices[index].small ?? "记住这位朋友")
        case .ignored: break
        }
    }
    private func next() { drum.stop(); model.stopSpeaking(); if session.advance() { if session.completed { if session.claimReward() { model.reward() } } else { resetInteraction(); startRound() } } }
    private func resetInteraction() { mismatchTask?.cancel(); selected = []; quantity = 0; counted = []; showHint = false; showDrumHint = false; heardDrum = false; feedback = "不着急，想好了再试一试。"; memory = MemoryGameState(round: round); balloons = SequenceGameState(round: round) }
    private func restart() { drum.stop(); model.stopSpeaking(); session = ActivitySession(rounds: game.randomRounds()); resetInteraction(); startRound() }
    private func startRound() { if round.scene == "drum" { if model.progress.soundEnabled { drum.play(round.count ?? 1) } } else if let speech = round.speech { model.speak(speech, language: round.speechLang ?? "zh-CN") } }
    private func listen() { model.progress.soundEnabled = true; if round.scene == "drum" { model.stopSpeaking(); drum.play(round.count ?? 1) } else { model.speak(round.speech ?? round.display ?? round.prompt, language: round.speechLang ?? "zh-CN") } }
}

private struct DrumIllustration: View {
    var body: some View {
        Canvas { context, size in
            let scale = min(size.width / 180, size.height / 130)
            context.translateBy(x: (size.width - 180 * scale) / 2, y: (size.height - 130 * scale) / 2)
            context.scaleBy(x: scale, y: scale)
            let shell = Path(roundedRect: CGRect(x: 40, y: 50, width: 100, height: 60), cornerRadius: 12)
            context.fill(shell, with: .color(Color(red: 0.91, green: 0.68, blue: 0.52)))
            var strings = Path()
            for x in stride(from: 45, through: 125, by: 20) { strings.move(to: CGPoint(x: x, y: 56)); strings.addLine(to: CGPoint(x: x + 10, y: 105)); strings.addLine(to: CGPoint(x: x + 20, y: 56)) }
            context.stroke(strings, with: .color(Color(red: 0.98, green: 0.89, blue: 0.69)), style: StrokeStyle(lineWidth: 3, lineCap: .round))
            context.fill(Path(ellipseIn: CGRect(x: 37, y: 38, width: 106, height: 29)), with: .color(Color(red: 0.98, green: 0.91, blue: 0.76)))
            context.stroke(Path(ellipseIn: CGRect(x: 37, y: 38, width: 106, height: 29)), with: .color(Color(red: 0.70, green: 0.52, blue: 0.35)), lineWidth: 4)
            var sticks = Path(); sticks.move(to: CGPoint(x: 54, y: 7)); sticks.addLine(to: CGPoint(x: 89, y: 43)); sticks.move(to: CGPoint(x: 126, y: 7)); sticks.addLine(to: CGPoint(x: 96, y: 43))
            context.stroke(sticks, with: .color(Color(red: 0.64, green: 0.51, blue: 0.38)), style: StrokeStyle(lineWidth: 7, lineCap: .round))
        }.accessibilityHidden(true)
    }
}

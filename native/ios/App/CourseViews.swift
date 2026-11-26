import SwiftUI
#if os(iOS)
import KidSproutCore
#endif

private enum CourseColors {
    static let numbers: [Color] = [
        Color(red: 0.50, green: 0.63, blue: 0.47), Color(red: 0.91, green: 0.68, blue: 0.31),
        Color(red: 0.87, green: 0.59, blue: 0.53), Color(red: 0.56, green: 0.69, blue: 0.77),
        Color(red: 0.67, green: 0.59, blue: 0.75), Color(red: 0.81, green: 0.59, blue: 0.64),
        Color(red: 0.51, green: 0.64, blue: 0.55), Color(red: 0.84, green: 0.66, blue: 0.49),
        Color(red: 0.69, green: 0.61, blue: 0.77), Color(red: 0.57, green: 0.65, blue: 0.76)
    ]
    static func number(_ value: Int) -> Color { numbers[min(9, max(0, value - 1))] }
}

private struct CourseHeading: View {
    let eyebrow: String
    let title: String
    let subtitle: String
    var color: Color = Sprout.green
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(eyebrow).font(.caption.weight(.medium)).tracking(0.7).foregroundStyle(Sprout.muted)
            Text(title).font(.system(.title, design: .rounded, weight: .bold)).foregroundStyle(Sprout.ink)
            Text(subtitle).font(.subheadline).foregroundStyle(Sprout.muted).lineSpacing(5)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

private struct CourseSheet<Content: View>: View {
    @Environment(\.dismiss) private var dismiss
    let title: String
    @ViewBuilder let content: () -> Content
    var body: some View {
        NavigationStack {
            Page { content() }
                .navigationTitle(title)
                .toolbar { ToolbarItem(placement: .confirmationAction) { Button("完成") { dismiss() }.frame(minWidth: 44, minHeight: 44) } }
        }
        #if os(macOS)
        .frame(minWidth: 560, idealWidth: 920, maxWidth: 1120, minHeight: 540, idealHeight: 780)
        #else
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
        #endif
    }
}

private struct CoursePractice<Content: View>: View {
    let title: String
    @ViewBuilder let content: () -> Content
    var body: some View {
        DisclosureGroup { content().padding(.top, 16) } label: {
            Text(title).font(.headline).frame(minHeight: 44)
        }
        .padding(18).tint(Sprout.green)
        .background(Sprout.panel, in: RoundedRectangle(cornerRadius: 18))
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(Sprout.line))
    }
}

private struct NumberSelection: Identifiable { let value: Int; var id: Int { value } }

struct NumbersView: View {
    @EnvironmentObject private var model: AppModel
    @State private var selected: NumberSelection?
    @State private var showingSong = false
    var body: some View {
        Page {
            CourseHeading(eyebrow: "01 / NUMBER GARDEN", title: "和数字，交个朋友", subtitle: "从 0 到 10，听一听、数一数、玩一玩。每一个小发现，都值得一颗星星。")
            Button { showingSong = true } label: { Label("听首数字儿歌", systemImage: "music.note").frame(minHeight: 44) }
                .buttonStyle(.bordered).tint(Sprout.green)
            if let lessons = model.curriculum?.numbers, !lessons.isEmpty {
                CourseHeading(eyebrow: "每一个数字，都是新朋友", title: "认识数字 0–10", subtitle: "点一点小卡片，听听数字的声音")
                ViewThatFits(in: .horizontal) {
                    numberGrid(lessons, compact: false).frame(minWidth: 560)
                    numberGrid(lessons, compact: true)
                }
                numberProgress
                Button {
                    selected = NumberSelection(value: lessons.first { !model.progress.learnedNumbers.contains($0.value) }?.value ?? model.progress.lastNumber)
                } label: { Label("继续认识数字朋友", systemImage: "arrow.right").frame(minHeight: 44) }
                    .buttonStyle(.borderedProminent).tint(Sprout.green)
                GameLibraryView(subject: .numbers)
            } else {
                ContentUnavailableView("课程暂时无法打开", systemImage: "book.closed", description: Text("请重新安装应用，离线课程文件可能已损坏。"))
            }
        }
        .navigationTitle("数字乐园")
        .sheet(item: $selected) { selection in NumberLessonView(initialValue: selection.value) }
        .sheet(isPresented: $showingSong) { NumberSongView() }
        .onAppear { resumeIfRequested() }
        .onChange(of: model.resumeSubject) { _, _ in resumeIfRequested() }
    }
    private func resumeIfRequested() {
        guard model.resumeSubject == .numbers else { return }
        model.resumeSubject = nil
        guard let lessons = model.curriculum?.numbers, !lessons.isEmpty else { return }
        let lesson = lessons.first { !model.progress.learnedNumbers.contains($0.value) }
            ?? lessons.first { $0.value == model.progress.lastNumber }
            ?? lessons[0]
        selected = NumberSelection(value: lesson.value)
    }
    private func numberGrid(_ lessons: [NumberLesson], compact: Bool) -> some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 13), count: compact ? 2 : 5), spacing: 13) {
            ForEach(lessons) { lesson in
                NumberCourseCard(lesson: lesson, learned: model.progress.learnedNumbers.contains(lesson.value), compact: compact) {
                    selected = NumberSelection(value: lesson.value)
                }
            }
        }
    }
    private var numberProgress: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label(model.progress.learnedNumbers.count == 11 ? "真棒！11 个数字朋友都认识你啦！" : model.progress.learnedNumbers.isEmpty ? "收集你的数字小星星，开始第一步吧！" : "真棒！你已经认识 \(model.progress.learnedNumbers.count) 个数字朋友啦", systemImage: "star")
                .font(.caption).foregroundStyle(Sprout.muted)
            HStack(spacing: 6) {
                ForEach(0...10, id: \.self) { value in Circle().fill(model.progress.learnedNumbers.contains(value) ? Sprout.green : Sprout.line).frame(width: 7, height: 7) }
                Spacer()
                Text("\(model.progress.learnedNumbers.count) / 11").font(.caption.monospacedDigit()).foregroundStyle(Sprout.muted)
            }
            .accessibilityElement(children: .ignore).accessibilityLabel("已认识 \(model.progress.learnedNumbers.count) 个数字，共 11 个")
        }
    }
}

private struct NumberCourseCard: View {
    @Environment(\.colorScheme) private var scheme
    let lesson: NumberLesson
    let learned: Bool
    var compact = false
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            VStack(spacing: 5) {
                HStack {
                    Text(lesson.name).font(.caption2).padding(5).background(Sprout.panel.opacity(0.6), in: RoundedRectangle(cornerRadius: 6))
                    Spacer()
                    Image(systemName: "speaker.wave.2").font(.caption)
                }
                Text("\(lesson.value)").font(.system(size: 70, weight: .heavy, design: .rounded)).minimumScaleFactor(0.5).lineLimit(1)
                if lesson.value == 0 {
                    VStack(spacing: 1) { NativeIllustration(name: "empty_basket").frame(height: 26); Text("一个也没有").font(.system(size: 9)) }.frame(height: 38)
                } else {
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 1), count: min(5, lesson.value)), spacing: 1) {
                        ForEach(0..<lesson.value, id: \.self) { _ in NativeIllustration(name: lesson.motifAsset).frame(height: lesson.value > 5 ? 17 : 23) }
                    }.frame(maxWidth: 125, minHeight: 38)
                }
            }
            .foregroundStyle(CourseColors.number(lesson.value))
            .padding(12)
            .frame(maxWidth: .infinity, minHeight: 163)
            .background(CourseColors.number(lesson.value).opacity(scheme == .dark ? 0.17 : 0.13), in: RoundedRectangle(cornerRadius: 16))
            .overlay { RoundedRectangle(cornerRadius: 16).stroke(CourseColors.number(lesson.value).opacity(0.2)) }
            .overlay(alignment: .bottomTrailing) { if learned { Image(systemName: "checkmark.circle.fill").font(.caption).padding(7).foregroundStyle(CourseColors.number(lesson.value)) } }
        }
        .buttonStyle(.plain)
        .accessibilityLabel("认识数字 \(lesson.value)，\(lesson.name)\(learned ? "，已认识" : "")")
        .accessibilityIdentifier("lesson\(lesson.value)")
    }
}

private struct NumberLessonView: View {
    @EnvironmentObject private var model: AppModel
    @State private var value: Int
    @State private var visited: Set<Int> = []
    @State private var hasApple = false
    @State private var presentedGame: NativeGame?
    init(initialValue: Int) { _value = State(initialValue: initialValue) }
    private var lesson: NumberLesson? { model.curriculum?.numbers.first { $0.value == value } }
    var body: some View {
        CourseSheet(title: "认识数字 \(value)") {
            if let lesson {
                CourseHeading(eyebrow: "认识一位新朋友", title: "你好，我是数字\(lesson.name)！", subtitle: value == 0 ? "一个也没有，可以用 0 表示。" : "\(lesson.name)\(lesson.unit)\(lesson.fruit)，一起数一数")
                Text(String(value))
                    .font(.system(size: 112, weight: .bold, design: .rounded))
                    .foregroundStyle(Sprout.green)
                    .frame(maxWidth: .infinity, minHeight: 140)
                    .background(Sprout.mint, in: RoundedRectangle(cornerRadius: 22))
                    .accessibilityLabel("数字 \(value)，\(lesson.name)")
                    .accessibilityIdentifier("numberLessonSymbol")
                Button { readNumber(lesson) } label: { Label("再听一遍", systemImage: "speaker.wave.2").frame(minHeight: 44) }.buttonStyle(.bordered)
                if value == 0 { zeroBasket }
                else {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 68), spacing: 10)], spacing: 12) {
                        ForEach(0..<value, id: \.self) { index in
                            Button {
                                if visited.insert(index).inserted { model.speak("\(visited.count)") }
                            } label: {
                                VStack(spacing: 4) {
                                    NativeIllustration(name: lesson.motifAsset).frame(width: 48, height: 52)
                                    Text("\(index + 1)").font(.caption)
                                }
                                .frame(maxWidth: .infinity, minHeight: 76)
                                .background(visited.contains(index) ? Sprout.mint : Sprout.panel, in: RoundedRectangle(cornerRadius: 14))
                            }.buttonStyle(.plain)
                                .accessibilityLabel("第 \(index + 1) \(lesson.unit)\(lesson.fruit)\(visited.contains(index) ? "，数过了" : "")")
                                .accessibilityIdentifier("fruit\(index)")
                        }
                    }
                    Text(visited.isEmpty ? "试着点一点每\(lesson.unit)\(lesson.fruit)吧" : "已经数过 \(visited.count) \(lesson.unit)\(lesson.fruit)")
                        .font(.subheadline).foregroundStyle(Sprout.muted).accessibilityIdentifier("countFeedback")
                    Button("重新数一数") { visited = [] }.buttonStyle(.bordered)
                }
                CoursePractice(title: "记忆小剧场 · 看图记一记") { MemorySceneView(subject: .numbers, symbol: String(value)) }.id("memory-\(value)")
                CoursePractice(title: "小手写一写 · 临摹数字") { LessonTracingView(group: "numbers", symbol: String(value)).id(value) }.id("tracing-\(value)")
                if value == 0, let game = model.activities?.games.first(where: { $0.id == "numbers-zero-shelves" }) {
                    Button("找一找空书架 →") { launch(game) }.buttonStyle(.borderedProminent).tint(Sprout.green)
                }
                HStack {
                    Button("上一个朋友") { value -= 1 }.disabled(value == 0).buttonStyle(.bordered).frame(minHeight: 44)
                    Spacer()
                    if value < 10 {
                        Button("认识数字 \(value + 1) →") { value += 1 }.buttonStyle(.borderedProminent).tint(Sprout.green).frame(minHeight: 44)
                    } else {
                        NavigationLink("和数字一起玩 →") { GameLibraryView(subject: .numbers) }.buttonStyle(.borderedProminent).tint(Sprout.green).frame(minHeight: 44)
                    }
                }
                Text(value == 0 ? "数字排排队：0 在 1 的前面。试试放入苹果，再把它拿走。" : "数过的物体会亮起来，重复点也不会多算。")
                    .font(.caption).foregroundStyle(Sprout.muted)
            }
        }
        .onAppear { beginLesson() }
        .onChange(of: value) { _, _ in beginLesson() }
        .onDisappear { model.stopSpeaking() }
        .sheet(item: $presentedGame) { GamePlayerView(game: $0).environmentObject(model) }
    }
    private var zeroBasket: some View {
        VStack(spacing: 14) {
            ZStack {
                NativeIllustration(name: "empty_basket").frame(width: 150, height: 120)
                if hasApple { NativeIllustration(name: "number_motif_0").frame(width: 45, height: 48).offset(y: -9) }
            }.accessibilityLabel(hasApple ? "篮子里有 1 个苹果" : "空篮子，一个苹果也没有")
            Text(hasApple ? "1 个苹果" : "0 个苹果").font(.title2.bold()).foregroundStyle(Sprout.green)
            Text(hasApple ? "篮子里有 1 个苹果。拿走它，再看看还剩几个？" : "一个苹果也没有啦！一个也没有，可以用 0 表示。")
                .font(.subheadline).foregroundStyle(Sprout.muted).multilineTextAlignment(.center)
            Button(hasApple ? "拿走苹果" : "放入 1 个苹果") {
                hasApple.toggle()
                model.speak(hasApple ? "篮子里有一个苹果，用数字一表示。把苹果拿走，再看看吧。" : "零，一个也没有，用零表示。篮子里有零个苹果。")
            }.buttonStyle(.bordered).frame(minHeight: 44).accessibilityIdentifier("zeroApple")
        }
        .padding(20).frame(maxWidth: .infinity)
        .background(Sprout.mint.opacity(0.45), in: RoundedRectangle(cornerRadius: 19))
    }
    private func beginLesson() {
        visited = []; hasApple = false
        model.progress.lastNumber = value
        model.markLearned(value)
        if let lesson { readNumber(lesson) }
    }
    private func readNumber(_ lesson: NumberLesson) {
        model.speak(value == 0 ? "零，一个也没有，用零表示。数字零在数字一的前面。" : "\(lesson.name)，数字\(lesson.name)。\(lesson.name)\(lesson.unit)\(lesson.fruit)")
    }
    private func launch(_ game: NativeGame) {
        model.stopSpeaking()
        presentedGame = game
    }
}

struct PinyinView: View {
    @EnvironmentObject private var model: AppModel
    @Environment(\.openURL) private var openURL
    @State private var selected: PinyinLesson?
    @State private var tone: PinyinTone?
    @State private var toneGame: NativeGame?
    @State private var sourceURL: URL?
    @State private var showSourceGate = false
    @State private var sourceApproved = false
    @State private var sourceUnavailable = false
    private var lessons: [PinyinLesson] { model.curriculum?.pinyin.lessons ?? [] }
    var body: some View {
        Page {
            pinyinHero
            CourseHeading(eyebrow: "一课一课，认识新朋友", title: "我的拼音小路", subtitle: "按课次慢慢学，点开卡片就能开始", color: Sprout.purple)
            HStack { ProgressView(value: Double(model.progress.learnedPinyin.count), total: 14).tint(Sprout.purple); Text("已学 \(model.progress.learnedPinyin.count) / 14 课").font(.caption).foregroundStyle(Sprout.muted) }
            ForEach([2, 3, 4], id: \.self) { unit in
                VStack(alignment: .leading, spacing: 15) {
                    HStack(spacing: 13) {
                        Text(String(format: "%02d", unit - 1)).font(.title3.bold()).foregroundStyle(Sprout.purple).padding(12).background(Sprout.purpleWash, in: RoundedRectangle(cornerRadius: 14))
                        VStack(alignment: .leading, spacing: 4) {
                            Text(unit == 2 ? "从单韵母开始" : unit == 3 ? "声母朋友来集合" : "韵母的奇妙组合").font(.headline).foregroundStyle(Sprout.ink)
                            Text(unit == 2 ? "教材第二单元 · 第1–4课" : unit == 3 ? "教材第三单元 · 第5–9课" : "教材第四单元 · 第10–14课").font(.caption).foregroundStyle(Sprout.muted)
                        }
                    }
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 12)], spacing: 12) {
                        ForEach(lessons.filter { $0.unit == unit }) { lesson in lessonCard(lesson) }
                    }
                }.padding(.vertical, 8)
            }
            CourseHeading(eyebrow: "声音也会走小路", title: "四顶声调小帽子", subtitle: "伸出小手，跟着线条比划一下", color: Sprout.purple)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 125), spacing: 12)], spacing: 12) {
                ForEach(model.curriculum?.pinyin.tones ?? []) { item in
                    Button { tone = item; model.speak("\(item.name)。\(item.hint)") } label: {
                        VStack(spacing: 10) {
                            TonePath(number: item.number).stroke(Sprout.purple, style: StrokeStyle(lineWidth: 5, lineCap: .round, lineJoin: .round)).frame(width: 80, height: 62)
                            Text("\(item.name) \(toneSymbol(item.number))").font(.headline)
                            Text(item.hint).font(.caption).foregroundStyle(Sprout.muted).multilineTextAlignment(.center)
                        }.frame(maxWidth: .infinity, minHeight: 155).padding(12).background(Sprout.purpleWash, in: RoundedRectangle(cornerRadius: 18))
                    }.buttonStyle(.plain).foregroundStyle(Sprout.purple)
                }
            }
            GameLibraryView(subject: .pinyin)
            pinyinParentNote
        }
        .navigationTitle("拼音天地")
        .sheet(item: $selected) { lesson in PinyinLessonView(initialID: lesson.id) }
        .sheet(item: $tone) { item in
            CourseSheet(title: "\(item.name)，声音的小路") {
                CourseHeading(eyebrow: "声音的小路", title: "\(item.name)，\(item.hint.prefix(4))", subtitle: item.hint, color: Sprout.purple)
                MemorySceneView(subject: .pinyin, symbol: toneSymbol(item.number))
                Text("伸出手指画一画，再请大人带着读一读。").font(.subheadline).foregroundStyle(Sprout.muted)
                if let game = model.activities?.games.first(where: { $0.id == "pinyin-tones" }) {
                    Button("玩声调小滑梯 →") {
                        model.stopSpeaking(); toneGame = game
                    }.buttonStyle(.borderedProminent).tint(Sprout.purple)
                }
            }
            .sheet(item: $toneGame) { GamePlayerView(game: $0).environmentObject(model) }
            .onDisappear { model.stopSpeaking() }
        }
        .sheet(isPresented: $showSourceGate, onDismiss: openApprovedSource) {
            ParentGate { sourceApproved = true; showSourceGate = false }
        }
        .alert("暂时无法打开网页", isPresented: $sourceUnavailable) { Button("知道了", role: .cancel) {} } message: { Text("请稍后重试，学习内容仍可离线使用。") }
        .onAppear { resumeIfRequested() }
        .onChange(of: model.resumeSubject) { _, _ in resumeIfRequested() }
    }
    private func openApprovedSource() {
        let approvedURL = sourceApproved ? sourceURL : nil
        sourceURL = nil
        sourceApproved = false
        if let approvedURL { openURL(approvedURL) { accepted in sourceUnavailable = !accepted } }
    }
    private func resumeIfRequested() {
        guard model.resumeSubject == .pinyin else { return }
        model.resumeSubject = nil
        selected = lessons.first { !model.progress.learnedPinyin.contains($0.id) }
            ?? lessons.first { $0.id == model.progress.lastPinyin }
            ?? lessons.first
    }
    private var pinyinHero: some View {
        VStack(alignment: .leading, spacing: 20) {
            ViewThatFits(in: .horizontal) {
                HStack(spacing: 25) { pinyinHeroCopy; CourseLetterArt(isAlphabet: false).frame(width: 240, height: 210) }
                VStack(alignment: .leading, spacing: 15) { pinyinHeroCopy; CourseLetterArt(isAlphabet: false).frame(height: 160).frame(maxWidth: .infinity) }
            }
        }.padding(25).frame(maxWidth: .infinity, alignment: .leading).background(Sprout.purpleWash, in: RoundedRectangle(cornerRadius: 24)).overlay { RoundedRectangle(cornerRadius: 24).stroke(Sprout.purple.opacity(0.12)) }
    }
    private var pinyinHeroCopy: some View {
        VStack(alignment: .leading, spacing: 14) {
            CourseHeading(eyebrow: "字音里的小小魔法", title: "你好呀，\n拼音朋友！", subtitle: "看看形象小动画，跟着读一读。\n从 a o e 出发，慢慢拼出新世界。", color: Sprout.purple)
            Button("开始拼音探险 →") { selected = lessons.first { !model.progress.learnedPinyin.contains($0.id) } ?? lessons.first }
                .buttonStyle(.borderedProminent).tint(Sprout.purple).frame(minHeight: 44)
            Text("14节小课 · 2024新版人教教材顺序").font(.caption).foregroundStyle(Sprout.muted)
        }.frame(minWidth: 200, maxWidth: .infinity, alignment: .leading)
    }
    private func lessonCard(_ lesson: PinyinLesson) -> some View {
        Button { selected = lesson } label: {
            VStack(alignment: .leading, spacing: 20) {
                HStack { Text("第 \(String(format: "%02d", lesson.number)) 课"); Spacer(); if model.progress.learnedPinyin.contains(lesson.id) { Image(systemName: "checkmark.circle.fill") } }.font(.caption).foregroundStyle(Sprout.purple)
                Text(lesson.title).font(.system(size: 27, weight: .bold, design: .rounded)).minimumScaleFactor(0.7).lineLimit(1).foregroundStyle(Sprout.ink)
                HStack { Text(lesson.number < 3 ? "口型与四声" : lesson.number < 10 ? "声母与拼读" : "韵母与拼读"); Spacer(); Image(systemName: "arrow.up.right") }.font(.caption).foregroundStyle(Sprout.muted)
            }.padding(18).frame(maxWidth: .infinity, alignment: .leading).background(Sprout.panel, in: RoundedRectangle(cornerRadius: 17)).overlay { RoundedRectangle(cornerRadius: 17).stroke(Sprout.purple.opacity(0.19)) }
        }.buttonStyle(.plain).accessibilityLabel("第\(lesson.number)课，\(lesson.title)\(model.progress.learnedPinyin.contains(lesson.id) ? "，已学过" : "")")
    }
    private var pinyinParentNote: some View {
        DisclosureGroup("给陪伴的大朋友：学习顺序与读音说明") {
            VStack(alignment: .leading, spacing: 12) {
                Text("按2024新版人教一年级上册第二至第四单元的14课顺序编排，第9课为 y w。口型提示、例字和游戏由本站自主设计。")
                Text("按钮播放的是系统中文语音提供的例字读音参考，不是独立拼音标准录音。声母发音应轻而短，例字含完整音节；请结合口型提示，由大人陪读。设备无声时，也可全程看提示学习。")
                ForEach(Array((model.curriculum?.pinyin.sources ?? []).enumerated()), id: \.offset) { _, source in
                    if let url = URL(string: source.url) {
                        Button(source.title) { sourceURL = url; sourceApproved = false; showSourceGate = true }
                            .buttonStyle(.plain).foregroundStyle(Sprout.purple)
                            .accessibilityHint("请家长验证后打开外部网页")
                    }
                }
            }.font(.caption).foregroundStyle(Sprout.muted).padding(.top, 12)
        }.padding(17).background(Sprout.purpleWash.opacity(0.5), in: RoundedRectangle(cornerRadius: 17)).tint(Sprout.purple)
    }
}

private func toneSymbol(_ number: Int) -> String { ["ā", "á", "ǎ", "à"][min(3, max(0, number - 1))] }

private struct TonePath: Shape {
    let number: Int
    func path(in rect: CGRect) -> Path {
        let points: [CGPoint]
        switch number {
        case 1: points = [CGPoint(x: 0.12, y: 0.28), CGPoint(x: 0.88, y: 0.28)]
        case 2: points = [CGPoint(x: 0.12, y: 0.73), CGPoint(x: 0.88, y: 0.24)]
        case 3: points = [CGPoint(x: 0.12, y: 0.39), CGPoint(x: 0.45, y: 0.8), CGPoint(x: 0.88, y: 0.22)]
        default: points = [CGPoint(x: 0.12, y: 0.24), CGPoint(x: 0.88, y: 0.8)]
        }
        var path = Path()
        for (index, point) in points.enumerated() {
            let actual = CGPoint(x: rect.minX + point.x * rect.width, y: rect.minY + point.y * rect.height)
            if index == 0 { path.move(to: actual) } else { path.addLine(to: actual) }
        }
        return path
    }
}

private struct PinyinLessonView: View {
    @EnvironmentObject private var model: AppModel
    @Environment(\.dynamicTypeSize) private var typeSize
    @State private var lessonID: String
    @State private var symbol = ""
    @State private var finished = false
    @State private var feedback = "慢慢读，不着急。学会一课就收下一片小叶子。"
    init(initialID: String) { _lessonID = State(initialValue: initialID) }
    private var lessons: [PinyinLesson] { model.curriculum?.pinyin.lessons ?? [] }
    private var lesson: PinyinLesson? { lessons.first { $0.id == lessonID } }
    private var item: PinyinItem? { model.curriculum?.pinyin.items.first { $0.symbol == symbol } }
    var body: some View {
        CourseSheet(title: "拼音小路") {
            if let lesson {
                CourseHeading(eyebrow: "拼音小路 · 第 \(lesson.number) / 14 课", title: "你好，\(lesson.title)", subtitle: "先看口型，再跟着大人读一读", color: Sprout.purple)
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 10) {
                        ForEach(lesson.symbols, id: \.self) { value in
                            Button {
                                model.stopSpeaking(); symbol = value
                            } label: { Text(value).font(.system(size: 28, weight: .bold, design: .rounded)).frame(minWidth: 64, minHeight: 62).background(symbol == value ? Sprout.purple : Sprout.purpleWash, in: RoundedRectangle(cornerRadius: 15)).foregroundStyle(symbol == value ? Color.white : Sprout.purple) }
                                .buttonStyle(.plain).accessibilityAddTraits(symbol == value ? .isSelected : [])
                        }
                    }
                }
                if let item { pinyinDetail(item) }
                CoursePractice(title: "记忆小剧场 · 看口型记拼音") { MemorySceneView(subject: .pinyin, symbol: symbol) }.id("memory-\(symbol)")
                if !lesson.readSyllables.isEmpty {
                    Panel {
                        Text("整体认读小伙伴").font(.headline).foregroundStyle(Sprout.purple)
                        Text("整个音节直接读，和声母短音分开体会。").font(.subheadline).foregroundStyle(Sprout.muted)
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 65), spacing: 10)], spacing: 10) {
                            ForEach(lesson.readSyllables, id: \.self) { value in Text(value).font(.system(.title3, design: .rounded, weight: .bold)).padding(10).frame(maxWidth: .infinity).background(Sprout.purpleWash, in: RoundedRectangle(cornerRadius: 10)) }
                        }
                    }
                }
                Panel {
                    Text(lesson.number < 3 ? "给韵母戴上四声小帽子" : "和大人一起拼一拼").font(.headline).foregroundStyle(Sprout.purple)
                    ForEach(lesson.spellings, id: \.self) { spelling in Text(spelling).font(.system(.title3, design: .rounded, weight: .medium)).foregroundStyle(Sprout.ink).lineSpacing(5) }
                    Text(lesson.rule).font(.subheadline).foregroundStyle(Sprout.muted).padding(.top, 4)
                }
                Text("例字读音参考 · \(model.progress.soundEnabled ? "系统中文语音，请结合口型由大人陪读" : "声音已关闭，仍可看提示学习")").font(.caption).foregroundStyle(Sprout.muted)
                Text(feedback).font(.subheadline).foregroundStyle(finished ? Sprout.green : Sprout.muted).accessibilityIdentifier("pinyinLessonFeedback")
                ViewThatFits(in: .horizontal) {
                    HStack { previous(lesson); Spacer(); finish(lesson) }
                    VStack(alignment: .leading, spacing: 10) { previous(lesson); finish(lesson) }
                }
            }
        }
        .onAppear { beginLesson() }
        .onChange(of: lessonID) { _, _ in beginLesson() }
        .onDisappear { model.stopSpeaking() }
    }
    private func pinyinDetail(_ item: PinyinItem) -> some View {
        Panel {
            let layout = typeSize.isAccessibilitySize ? AnyLayout(VStackLayout(alignment: .leading, spacing: 16)) : AnyLayout(HStackLayout(alignment: .center, spacing: 22))
            layout {
                VStack(spacing: 6) { Text(item.symbol).font(.system(size: 68, weight: .bold, design: .rounded)); Text(item.kind == "initial" ? "声母" : "韵母").font(.caption) }.foregroundStyle(Sprout.purple).frame(minWidth: 95).padding(12).background(Sprout.purpleWash, in: RoundedRectangle(cornerRadius: 18))
                VStack(alignment: .leading, spacing: 9) {
                    Text("口型小提示").font(.caption).foregroundStyle(Sprout.purple)
                    Text(item.hint).font(.headline).foregroundStyle(Sprout.ink)
                    Text(item.kind == "initial" ? "声母读得轻而短。例字里还有韵母，要分开体会。" : "韵母读得响亮一些，注意嘴巴怎样变化。").font(.subheadline).foregroundStyle(Sprout.muted)
                }
            }
            if !spellingNote.isEmpty { Text(spellingNote).font(.subheadline).foregroundStyle(Sprout.purple) }
            Divider()
            Text("例字读音参考").font(.caption).foregroundStyle(Sprout.muted)
            Text("\(item.example)  \(item.examplePinyin)").font(.title3.bold()).foregroundStyle(Sprout.ink)
            if item.symbol != "o" {
                Button {
                    model.speak(item.speech)
                    feedback = model.progress.soundEnabled ? "正在听例字读音参考；也可以跟大人一起读。" : "现在是安静学习，看看例字和口型，也可以请大人陪读。"
                } label: { Label("听例字", systemImage: "speaker.wave.2").frame(minHeight: 44) }.buttonStyle(.bordered).tint(Sprout.purple)
            }
            if let note = item.referenceNote { Text(note).font(.subheadline).foregroundStyle(Sprout.muted) }
        }
    }
    private var spellingNote: String {
        if ["ü", "üe", "ün"].contains(symbol) { return "和 y、j、q、x 拼写时，ü 的两点会藏起来，读音要记住。" }
        if symbol == "i" { return "i 戴上声调小帽子时，要把上面的小点去掉。" }
        if ["ui", "iu", "un"].contains(symbol) { return "\(symbol)是复合韵母的简写形式，跟着例字连起来读。" }
        return ""
    }
    private func previous(_ lesson: PinyinLesson) -> some View {
        Button("上一课") { lessonID = "lesson-\(lesson.number - 1)" }.buttonStyle(.bordered).tint(Sprout.purple).disabled(lesson.number == 1).frame(minHeight: 44)
    }
    private func finish(_ lesson: PinyinLesson) -> some View {
        Button(finished ? (lesson.number < 14 ? "认识下一课 →" : "继续复习 →") : "完成这一课 ✓") {
            if finished {
                lessonID = lesson.number < 14 ? "lesson-\(lesson.number + 1)" : lessons.first { !model.progress.learnedPinyin.contains($0.id) }?.id ?? "lesson-1"
            } else {
                model.markPinyin(lesson.id); finished = true
                feedback = "第\(lesson.number)课的小叶子收好啦！\(lesson.number == 14 ? "最后一课也读过啦，还可以回头多读几遍。" : "再读一遍，或去认识下一课吧。")"
                model.speak("真棒，收下一片拼音小叶子！")
            }
        }.buttonStyle(.borderedProminent).tint(Sprout.purple).frame(minHeight: 44)
    }
    private func beginLesson() {
        model.stopSpeaking(); symbol = lesson?.symbols.first ?? ""; finished = false
        feedback = "慢慢读，不着急。学会一课就收下一片小叶子。"
        model.progress.lastPinyin = lessonID
    }
}

struct AlphabetView: View {
    @EnvironmentObject private var model: AppModel
    @State private var groupID = "a-f"
    @State private var selected: AlphabetLetter?
    private var alphabet: AlphabetCurriculum? { model.curriculum?.alphabet }
    private var nextLetter: AlphabetLetter? { alphabet?.letters.first { !model.progress.learnedLetters.contains($0.id) } ?? alphabet?.letters.first }
    var body: some View {
        Page {
            alphabetHero
            CourseHeading(eyebrow: "MEET THE LETTERS", title: "今天，认识哪几个字母？", subtitle: "点开卡片，听读字母和单词，再练写大小写", color: Sprout.gold)
            HStack { Image(systemName: "sparkle").foregroundStyle(Sprout.gold); Text("已认识 \(model.progress.learnedLetters.count) / 26").font(.subheadline).foregroundStyle(Sprout.muted); Spacer() }
            if let alphabet {
                LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: 4), spacing: 6) {
                    ForEach(alphabet.groups) { group in
                        Button { groupID = group.id } label: {
                            VStack(spacing: 5) { Text(group.label).font(.system(.headline, design: .rounded)).lineLimit(1).minimumScaleFactor(0.6); Text("\(group.letters.filter { model.progress.learnedLetters.contains($0) }.count) / \(group.letters.count)").font(.caption2) }
                                .foregroundStyle(groupID == group.id ? Sprout.ink : Sprout.muted).frame(maxWidth: .infinity, minHeight: 63).background(groupID == group.id ? Sprout.panel : Sprout.goldWash.opacity(0.45), in: RoundedRectangle(cornerRadius: 12)).overlay { RoundedRectangle(cornerRadius: 12).stroke(groupID == group.id ? Sprout.gold.opacity(0.3) : Color.clear) }
                        }.buttonStyle(.plain).accessibilityLabel("\(group.label)，已认识\(group.letters.filter { model.progress.learnedLetters.contains($0) }.count)个").accessibilityAddTraits(groupID == group.id ? .isSelected : [])
                    }
                }
                ViewThatFits(in: .horizontal) {
                    letterGrid(alphabet, columns: 6).frame(minWidth: 684)
                    letterGrid(alphabet, columns: 3)
                }
                Label("大写和小写，都是同一位字母朋友的名字。先看模样、跟着读，再动手描一描。", systemImage: "lightbulb")
                    .font(.caption).foregroundStyle(Sprout.muted)
            }
            GameLibraryView(subject: .alphabet)
        }
        .navigationTitle("字母森林")
        .sheet(item: $selected) { letter in AlphabetLessonView(initialID: letter.id) }
        .onAppear { resumeIfRequested() }
        .onChange(of: model.resumeSubject) { _, _ in resumeIfRequested() }
    }
    private func resumeIfRequested() {
        guard model.resumeSubject == .alphabet else { return }
        model.resumeSubject = nil
        guard let alphabet else { return }
        let letter = alphabet.letters.first { !model.progress.learnedLetters.contains($0.id) }
            ?? alphabet.letters.first { $0.id == model.progress.lastLetter }
            ?? alphabet.letters.first
        selected = letter
        if let letter, let group = alphabet.groups.first(where: { $0.letters.contains(letter.id) }) { groupID = group.id }
    }
    private func letterGrid(_ alphabet: AlphabetCurriculum, columns: Int) -> some View {
        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 12), count: columns), spacing: 12) {
            ForEach(alphabet.letters.filter { letter in alphabet.groups.first { $0.id == groupID }?.letters.contains(letter.id) ?? false }) { letter in
                AlphabetCourseCard(letter: letter, learned: model.progress.learnedLetters.contains(letter.id)) { selected = letter }
            }
        }
    }
    private var alphabetHero: some View {
        ViewThatFits(in: .horizontal) {
            HStack(spacing: 25) { alphabetHeroCopy; CourseLetterArt(isAlphabet: true).frame(width: 240, height: 225) }
            VStack(alignment: .leading, spacing: 10) { alphabetHeroCopy; CourseLetterArt(isAlphabet: true).frame(height: 180).frame(maxWidth: .infinity) }
        }.padding(25).frame(maxWidth: .infinity, alignment: .leading).background(Sprout.goldWash, in: RoundedRectangle(cornerRadius: 24)).overlay { RoundedRectangle(cornerRadius: 24).stroke(Sprout.gold.opacity(0.14)) }
    }
    private var alphabetHeroCopy: some View {
        VStack(alignment: .leading, spacing: 14) {
            CourseHeading(eyebrow: "ENGLISH GARDEN · 英文字母", title: "小小字母，\n大声说 Hello!", subtitle: "认识 A–Z，发现大小写的小秘密。\n听一听、描一描，和字母朋友一起玩。", color: Sprout.gold)
            Button(model.progress.learnedLetters.isEmpty ? "从 A 开始认识 →" : model.progress.learnedLetters.count == 26 ? "再听听字母朋友 →" : "继续认识 \(nextLetter?.id ?? "A") →") { selected = nextLetter }
                .buttonStyle(.borderedProminent).tint(Sprout.green).frame(minHeight: 44)
            Text("每次认识几个，每天进步一点点").font(.caption).foregroundStyle(Sprout.muted)
        }.frame(minWidth: 210, maxWidth: .infinity, alignment: .leading)
    }
}

/// These are native shapes and letter blocks, matching the CSS hero artwork.
private struct CourseLetterArt: View {
    let isAlphabet: Bool
    var body: some View {
        GeometryReader { geometry in
            let width = geometry.size.width
            let height = geometry.size.height
            ZStack {
                Circle().fill((isAlphabet ? Sprout.yellow : Sprout.purple).opacity(0.09)).frame(width: min(width, height) * 1.1)
                Image(systemName: "cloud.fill").font(.system(size: 45)).foregroundStyle(Sprout.panel).position(x: width * 0.68, y: height * 0.18)
                letterBlock(isAlphabet ? "A" : "ā", lower: isAlphabet ? "a" : "", tint: isAlphabet ? Sprout.gold : Sprout.purple).rotationEffect(.degrees(-12)).position(x: width * 0.35, y: height * 0.48)
                letterBlock(isAlphabet ? "B" : "b", lower: isAlphabet ? "b" : "", tint: Sprout.green).scaleEffect(0.86).rotationEffect(.degrees(12)).position(x: width * 0.74, y: height * 0.67)
                if !isAlphabet {
                    Text("ō").font(.system(size: 42, weight: .bold, design: .rounded)).foregroundStyle(Sprout.gold).padding(15).background(Sprout.panel, in: RoundedRectangle(cornerRadius: 16)).rotationEffect(.degrees(9)).position(x: width * 0.8, y: height * 0.28)
                }
                Image(systemName: "sparkle").font(.title2).foregroundStyle(Sprout.gold).position(x: width * 0.18, y: height * 0.2)
                Text(isAlphabet ? "Hello, little learner!" : "听一听，世界有声音").font(.caption).foregroundStyle(Sprout.muted).position(x: width * 0.5, y: height * 0.95)
            }
        }.accessibilityHidden(true)
    }
    private func letterBlock(_ upper: String, lower: String, tint: Color) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 3) {
            Text(upper).font(.system(size: 64, weight: .heavy, design: .rounded))
            if !lower.isEmpty { Text(lower).font(.system(size: 40, weight: .bold, design: .rounded)) }
        }.foregroundStyle(tint).padding(.horizontal, 15).padding(.vertical, 10).background(Sprout.panel, in: RoundedRectangle(cornerRadius: 20)).overlay { RoundedRectangle(cornerRadius: 20).stroke(tint.opacity(0.15)) }
    }
}

private struct AlphabetCourseCard: View {
    let letter: AlphabetLetter
    let learned: Bool
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            VStack(spacing: 7) {
                HStack { Text("字母朋友"); Spacer(); Image(systemName: "speaker.wave.2") }.font(.caption2).foregroundStyle(Sprout.muted)
                HStack(alignment: .firstTextBaseline, spacing: 1) {
                    Text(letter.uppercase).font(.system(size: 55, weight: .heavy, design: .rounded)).foregroundStyle(Sprout.gold)
                    Text(letter.lowercase).font(.system(size: 36, weight: .bold, design: .rounded)).foregroundStyle(Sprout.green)
                }.lineLimit(1).minimumScaleFactor(0.7)
                Text(letter.emoji).font(.system(size: 32)).accessibilityHidden(true)
                Text(letter.word).font(.system(.subheadline, design: .rounded, weight: .bold)).lineLimit(1).minimumScaleFactor(0.7).foregroundStyle(Sprout.ink)
                Text(letter.translation).font(.caption).foregroundStyle(Sprout.muted)
            }.padding(13).frame(maxWidth: .infinity, minHeight: 204).background(Sprout.panel, in: RoundedRectangle(cornerRadius: 18)).overlay { RoundedRectangle(cornerRadius: 18).stroke(Sprout.line) }
                .overlay(alignment: .bottomTrailing) { if learned { Image(systemName: "checkmark.circle.fill").font(.caption).foregroundStyle(Sprout.green).padding(6) } }
        }.buttonStyle(.plain).accessibilityLabel("\(learned ? "复习" : "认识")字母 \(letter.id)，小写 \(letter.lowercase)，\(letter.word) \(letter.translation)\(learned ? "，已认识" : "")")
    }
}

private struct AlphabetLessonView: View {
    @EnvironmentObject private var model: AppModel
    @State private var letterID: String
    init(initialID: String) { _letterID = State(initialValue: initialID) }
    private var letters: [AlphabetLetter] { model.curriculum?.alphabet.letters ?? [] }
    private var letter: AlphabetLetter? { letters.first { $0.id == letterID } }
    private var index: Int { letters.firstIndex { $0.id == letterID } ?? 0 }
    var body: some View {
        CourseSheet(title: "字母朋友 \(letterID)") {
            if let letter {
                CourseHeading(eyebrow: "认识一位字母朋友 · \(index + 1) / 26", title: "你好，我是 \(letter.uppercase) \(letter.lowercase)", subtitle: "大写和小写，都是同一位字母朋友", color: Sprout.gold)
                HStack(spacing: 18) { letterTile(letter.uppercase, label: "大写朋友", color: Sprout.gold); letterTile(letter.lowercase, label: "小写朋友", color: Sprout.green) }
                Label(letter.hint, systemImage: "lightbulb").font(.subheadline).foregroundStyle(Sprout.muted)
                Button {
                    model.progress.soundEnabled = true; model.speak(letter.id, language: "en-US")
                } label: { Label(model.progress.soundEnabled ? "听字母名 \(letter.id)" : "开启声音听字母名", systemImage: "speaker.wave.2").frame(minHeight: 44) }.buttonStyle(.bordered).tint(Sprout.green)
                VStack(alignment: .leading, spacing: 12) {
                    HStack(spacing: 16) {
                        Text(letter.emoji).font(.system(size: 47)).accessibilityHidden(true)
                        VStack(alignment: .leading, spacing: 5) { Text("我的单词朋友").font(.caption).foregroundStyle(Sprout.muted); Text(letter.word).font(.system(.title2, design: .rounded, weight: .bold)).foregroundStyle(Sprout.ink); Text(letter.translation).font(.subheadline).foregroundStyle(Sprout.muted) }
                        Spacer(minLength: 0)
                    }
                    Button {
                        model.progress.soundEnabled = true; model.speak(letter.word, language: "en-US")
                    } label: { Label(model.progress.soundEnabled ? "听英文单词" : "开启声音听单词", systemImage: "speaker.wave.2").frame(minHeight: 44) }.buttonStyle(.bordered).accessibilityLabel("\(model.progress.soundEnabled ? "听英文单词" : "开启声音听单词") \(letter.word)")
                }.padding(17).background(Sprout.goldWash, in: RoundedRectangle(cornerRadius: 18))
                Text(model.progress.soundEnabled ? "听到的是字母的名字。点单词旁的小喇叭，还能听英文单词。" : "声音已关闭，仍然可以看卡片学习。想听英文，点“开启声音听字母名”。").font(.caption).foregroundStyle(Sprout.muted)
                CoursePractice(title: "记忆小剧场 · 看图记字母") { MemorySceneView(subject: .alphabet, symbol: letter.uppercase + letter.lowercase) }.id("memory-\(letter.id)")
                CoursePractice(title: "小手写一写 · 大小写一起练") { LessonTracingView(group: "alphabet", symbol: letter.uppercase + letter.lowercase).id(letter.id) }.id("tracing-\(letter.id)")
                HStack {
                    Button("上一位朋友") { if index > 0 { letterID = letters[index - 1].id } }.buttonStyle(.bordered).disabled(index == 0).frame(minHeight: 44)
                    Spacer()
                    if index < letters.count - 1 {
                        Button("认识 \(letters[index + 1].id) →") { letterID = letters[index + 1].id }.buttonStyle(.borderedProminent).tint(Sprout.green).frame(minHeight: 44)
                    } else {
                        NavigationLink("和字母一起玩 →") { GameLibraryView(subject: .alphabet) }.buttonStyle(.borderedProminent).tint(Sprout.green).frame(minHeight: 44)
                    }
                }
            }
        }
        .onAppear { beginLesson() }
        .onChange(of: letterID) { _, _ in beginLesson() }
        .onDisappear { model.stopSpeaking() }
    }
    private func letterTile(_ value: String, label: String, color: Color) -> some View {
        VStack(spacing: 7) { Text(label).font(.caption).foregroundStyle(Sprout.muted); Text(value).font(.system(size: 92, weight: .bold, design: .rounded)).minimumScaleFactor(0.6).foregroundStyle(color) }
            .frame(maxWidth: .infinity, minHeight: 150).padding(12).background(color.opacity(0.11), in: RoundedRectangle(cornerRadius: 20))
    }
    private func beginLesson() {
        model.stopSpeaking(); model.progress.lastLetter = letterID; model.markLetter(letterID)
        model.speak(letterID, language: "en-US")
    }
}

private struct NumberSongView: View {
    @EnvironmentObject private var model: AppModel
    @State private var singing = false
    @State private var lineIndex = 0
    @State private var didPlay = false
    @State private var playbackID = UUID()
    private let lines = ["零像鸡蛋圆溜溜，一个也没有就是零", "一像铅笔细又长", "二像小鸭水上漂", "三像耳朵听声音", "四像小旗迎风飘", "五像秤钩来买菜", "六像口哨嘟嘟响", "七像镰刀割青草", "八像葫芦扭扭腰", "九像气球天上飞", "一零手拉手就是十"]
    var body: some View {
        CourseSheet(title: "数字朋友歌") {
            CourseHeading(eyebrow: "唱唱念念，记住数字", title: "数字朋友歌", subtitle: "拍一拍小手，跟着节奏一起念")
            ForEach(Array(lines.enumerated()), id: \.offset) { index, line in
                Button {
                    pause(); lineIndex = index; didPlay = true; model.progress.soundEnabled = true; model.speak(line)
                } label: {
                    HStack(spacing: 14) {
                        Text("\(index)").font(.system(.title2, design: .rounded, weight: .bold)).foregroundStyle(CourseColors.number(index)).frame(width: 40, height: 43).background(CourseColors.number(index).opacity(0.13), in: RoundedRectangle(cornerRadius: 10))
                        Text(line).font(.subheadline).foregroundStyle(Sprout.ink).frame(maxWidth: .infinity, alignment: .leading)
                        if singing && lineIndex == index { Image(systemName: "speaker.wave.2.fill").foregroundStyle(Sprout.green) }
                        else if !model.progress.soundEnabled { Text("开启声音\n听这一句").font(.caption2).foregroundStyle(Sprout.green) }
                    }.padding(10).background(singing && lineIndex == index ? Sprout.mint : Sprout.panel, in: RoundedRectangle(cornerRadius: 13))
                }.buttonStyle(.plain).accessibilityLabel("\(model.progress.soundEnabled ? "听" : "开启声音听")第\(index + 1)句，\(line)")
            }
            Button {
                if singing { pause() }
                else { model.progress.soundEnabled = true; singing = true; didPlay = true; playbackID = UUID(); playLine(lineIndex, id: playbackID) }
            } label: { Label(!model.progress.soundEnabled ? "开启声音听数字儿歌" : singing ? "暂停播放" : didPlay ? "继续听儿歌" : "播放数字儿歌", systemImage: singing ? "pause.fill" : "play.fill").frame(minHeight: 44) }.buttonStyle(.borderedProminent).tint(Sprout.green)
            Text("也可以点一句，单独听一听。").font(.caption).foregroundStyle(Sprout.muted)
        }.onDisappear { pause() }
    }
    private func pause() { singing = false; playbackID = UUID(); model.stopSpeaking() }
    private func playLine(_ index: Int, id: UUID) {
        guard singing && playbackID == id else { return }
        guard index < lines.count else { singing = false; lineIndex = 0; return }
        lineIndex = index
        model.speak(lines[index]) {
            Task { @MainActor in
                try? await Task.sleep(for: .milliseconds(400))
                guard singing && playbackID == id else { return }
                playLine(index + 1, id: id)
            }
        }
    }
}

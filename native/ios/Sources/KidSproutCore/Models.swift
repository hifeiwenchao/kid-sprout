import Foundation

public struct FruitCounter: Sendable {
    public let total: Int
    public private(set) var visited: Set<Int> = []
    public init(total: Int) { self.total = max(0, total) }
    @discardableResult public mutating func tap(_ index: Int) -> Int {
        if (0..<total).contains(index) { visited.insert(index) }
        return visited.count
    }
}

public enum GameKind: String, CaseIterable, Identifiable, Sendable {
    case countFruit, findNumber, compareQuantities
    public var id: String { rawValue }
    public var title: String {
        switch self { case .countFruit: return "数一数水果"; case .findNumber: return "寻找数字"; case .compareQuantities: return "比比多少" }
    }
    public var subtitle: String {
        switch self { case .countFruit: return "点点水果，选出数量"; case .findNumber: return "听一听，找到数字朋友"; case .compareQuantities: return "看一看，哪一篮更多" }
    }
    public var symbol: String {
        switch self { case .countFruit: return "apple.logo"; case .findNumber: return "magnifyingglass"; case .compareQuantities: return "basket.fill" }
    }
}

public struct GameQuestion: Equatable, Sendable {
    public let quantity: Int
    public let otherQuantity: Int
    public let answer: Int
    public let choices: [Int]
    public init(quantity: Int, otherQuantity: Int, answer: Int, choices: [Int]) {
        self.quantity = quantity; self.otherQuantity = otherQuantity; self.answer = answer; self.choices = choices
    }
}

public struct GameSession: Sendable {
    public enum Submission: Equatable { case incorrect, correct, locked }
    public let kind: GameKind
    public let questions: [GameQuestion]
    public private(set) var round = 0
    public private(set) var answeredCorrectly = false
    public private(set) var isFinished = false
    private var rewardClaimed = false
    public var current: GameQuestion { questions[round] }
    public init(kind: GameKind, questions: [GameQuestion]? = nil) {
        self.kind = kind
        if let questions, questions.count == 5 { self.questions = questions }
        else {
            self.questions = (0..<5).map { _ in
                let quantity = Int.random(in: 0...10)
                if kind == .compareQuantities {
                    let left = Int.random(in: 1...8)
                    let right = (1...8).filter { $0 != left }.randomElement()!
                    return GameQuestion(quantity: left, otherQuantity: right, answer: left > right ? 0 : 1, choices: [0,1])
                }
                let alternatives = Array((0...10).filter { $0 != quantity }.shuffled().prefix(2))
                return GameQuestion(quantity: quantity, otherQuantity: 0, answer: quantity, choices: (alternatives + [quantity]).shuffled())
            }
        }
    }
    public mutating func submit(_ value: Int) -> Submission {
        guard !isFinished, !answeredCorrectly else { return .locked }
        guard value == current.answer else { return .incorrect }
        answeredCorrectly = true
        return .correct
    }
    @discardableResult public mutating func next() -> Bool {
        guard !isFinished, answeredCorrectly else { return false }
        if round == 4 { isFinished = true }
        else { round += 1; answeredCorrectly = false }
        return true
    }
    public mutating func claimReward() -> Bool {
        guard isFinished, !rewardClaimed else { return false }
        rewardClaimed = true
        return true
    }
}

public struct LearningProgress: Codable, Equatable, Sendable {
    public var version = 1
    public var learnedNumbers: Set<Int> = []
    public var lastNumber = 0
    public var stars = 0
    public var gamesCompleted = 0
    public var soundEnabled = true
    public var learnedPinyin: Set<String> = []
    public var learnedLetters: Set<String> = []
    public var lastPinyin = "lesson-1"
    public var lastLetter = "A"
    public var visitDates: Set<String> = []
    public init() {}
    private enum CodingKeys: String, CodingKey {
        case version, learnedNumbers, lastNumber, stars, gamesCompleted, soundEnabled
        case learnedPinyin, learnedLetters, lastPinyin, lastLetter, visitDates
    }
    public init(from decoder: Decoder) throws {
        let values = try decoder.container(keyedBy: CodingKeys.self)
        version = try values.decodeIfPresent(Int.self, forKey: .version) ?? 1
        learnedNumbers = try values.decodeIfPresent(Set<Int>.self, forKey: .learnedNumbers) ?? []
        lastNumber = try values.decodeIfPresent(Int.self, forKey: .lastNumber) ?? 0
        stars = try values.decodeIfPresent(Int.self, forKey: .stars) ?? 0
        gamesCompleted = try values.decodeIfPresent(Int.self, forKey: .gamesCompleted) ?? 0
        soundEnabled = try values.decodeIfPresent(Bool.self, forKey: .soundEnabled) ?? true
        learnedPinyin = try values.decodeIfPresent(Set<String>.self, forKey: .learnedPinyin) ?? []
        learnedLetters = try values.decodeIfPresent(Set<String>.self, forKey: .learnedLetters) ?? []
        lastPinyin = try values.decodeIfPresent(String.self, forKey: .lastPinyin) ?? "lesson-1"
        lastLetter = try values.decodeIfPresent(String.self, forKey: .lastLetter) ?? "A"
        visitDates = try values.decodeIfPresent(Set<String>.self, forKey: .visitDates) ?? []
    }
    public func validated() -> Self {
        var result = self
        result.learnedNumbers = learnedNumbers.filter { (0...10).contains($0) }
        result.lastNumber = (0...10).contains(lastNumber) ? lastNumber : 0
        result.stars = max(0, min(stars, 1_000_000))
        result.gamesCompleted = max(0, min(gamesCompleted, 200_000))
        let lessons = Set((1...14).map { "lesson-\($0)" })
        let letters = Set((65...90).compactMap { UnicodeScalar($0).map(String.init) })
        result.learnedPinyin = learnedPinyin.intersection(lessons)
        result.learnedLetters = learnedLetters.intersection(letters)
        result.lastPinyin = lessons.contains(lastPinyin) ? lastPinyin : "lesson-1"
        result.lastLetter = letters.contains(lastLetter) ? lastLetter : "A"
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.isLenient = false
        result.visitDates = Set(visitDates.filter { value in
            guard value.count == 10, let date = formatter.date(from: value) else { return false }
            return formatter.string(from: date) == value
        }.sorted().suffix(3660))
        return result
    }
}

public struct ProgressRepository {
    public static let key = "kid-sprout-native-progress-v1"
    private let defaults: UserDefaults
    public init(defaults: UserDefaults = .standard) { self.defaults = defaults }
    public func load() -> LearningProgress {
        guard let data = defaults.data(forKey: Self.key), let saved = try? JSONDecoder().decode(LearningProgress.self, from: data), saved.version == 1 else { return LearningProgress() }
        return saved.validated()
    }
    public func save(_ progress: LearningProgress) {
        if let data = try? JSONEncoder().encode(progress.validated()) { defaults.set(data, forKey: Self.key) }
    }
}

public struct NumberLesson: Codable, Equatable, Identifiable, Sendable {
    public let value: Int
    public let name: String
    public let motifAsset: String
    public let fruit: String
    public let unit: String
    public var id: Int { value }
    private enum CodingKeys: String, CodingKey { case value, name, motifAsset, fruit, unit }
    public init(from decoder: Decoder) throws {
        let values = try decoder.container(keyedBy: CodingKeys.self)
        value = try values.decode(Int.self, forKey: .value)
        name = try values.decode(String.self, forKey: .name)
        motifAsset = try values.decodeIfPresent(String.self, forKey: .motifAsset) ?? (value == 0 ? "empty_basket" : "number_motif_\(max(0, value - 1))")
        fruit = try values.decodeIfPresent(String.self, forKey: .fruit) ?? "苹果"
        unit = try values.decodeIfPresent(String.self, forKey: .unit) ?? "个"
    }
}
public struct Curriculum: Decodable, Sendable {
    public let schemaVersion: Int
    public let brand: String
    public let numbers: [NumberLesson]
    public let pinyin: PinyinCurriculum
    public let alphabet: AlphabetCurriculum
    public let memoryScenes: [MemoryScene]
    public let tracingTemplates: [TracingTemplate]
    private enum CodingKeys: String, CodingKey { case schemaVersion, brand, numbers, pinyin, alphabet, memoryScenes, tracingTemplates }
    public init(from decoder: Decoder) throws {
        let values = try decoder.container(keyedBy: CodingKeys.self)
        schemaVersion = try values.decode(Int.self, forKey: .schemaVersion)
        brand = try values.decode(String.self, forKey: .brand)
        numbers = try values.decode([NumberLesson].self, forKey: .numbers)
        pinyin = try values.decodeIfPresent(PinyinCurriculum.self, forKey: .pinyin) ?? .empty
        alphabet = try values.decodeIfPresent(AlphabetCurriculum.self, forKey: .alphabet) ?? .empty
        memoryScenes = try values.decodeIfPresent([MemoryScene].self, forKey: .memoryScenes) ?? []
        tracingTemplates = try values.decodeIfPresent([TracingTemplate].self, forKey: .tracingTemplates) ?? []
    }
    public enum ContentError: Error { case invalidContent }
    public static func decode(_ data: Data) throws -> Curriculum {
        let result = try JSONDecoder().decode(Self.self, from: data)
        guard result.schemaVersion == 1, !result.brand.isEmpty, result.numbers.map(\.value) == Array(0...10), result.numbers.allSatisfy({ !$0.name.isEmpty }) else { throw ContentError.invalidContent }
        if !result.pinyin.lessons.isEmpty {
            guard result.pinyin.lessons.map(\.number) == Array(1...14), Set(result.pinyin.items.map(\.symbol)).count == 47, result.pinyin.tones.map(\.number) == [1, 2, 3, 4] else { throw ContentError.invalidContent }
        }
        if !result.alphabet.letters.isEmpty {
            guard result.alphabet.letters.map(\.id) == (65...90).compactMap({ UnicodeScalar($0).map(String.init) }), result.alphabet.groups.count == 4 else { throw ContentError.invalidContent }
        }
        guard result.memoryScenes.allSatisfy({ $0.frames.count == 3 && Set($0.frames).count == 3 }), Set(result.tracingTemplates.map(\.id)).count == result.tracingTemplates.count else { throw ContentError.invalidContent }
        return result
    }
}

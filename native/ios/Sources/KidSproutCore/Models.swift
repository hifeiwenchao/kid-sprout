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
    public init() {}
    public func validated() -> Self {
        var result = self
        result.learnedNumbers = learnedNumbers.filter { (0...10).contains($0) }
        result.lastNumber = (0...10).contains(lastNumber) ? lastNumber : 0
        result.stars = max(0, min(stars, 1_000_000))
        result.gamesCompleted = max(0, min(gamesCompleted, 200_000))
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
    public var id: Int { value }
}
public struct Curriculum: Decodable, Sendable {
    public let schemaVersion: Int
    public let brand: String
    public let numbers: [NumberLesson]
    public enum ContentError: Error { case invalidContent }
    public static func decode(_ data: Data) throws -> Curriculum {
        let result = try JSONDecoder().decode(Self.self, from: data)
        guard result.schemaVersion == 1, !result.brand.isEmpty, result.numbers.map(\.value) == Array(0...10), result.numbers.allSatisfy({ !$0.name.isEmpty }) else { throw ContentError.invalidContent }
        return result
    }
}

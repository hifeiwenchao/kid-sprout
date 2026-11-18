import Foundation

public struct ActivityChoice: Codable, Equatable, Identifiable, Sendable {
    public let value: String
    public let label: String
    public let small: String?
    public let match: String?
    public var id: String { value }
    public init(value: String, label: String, small: String? = nil, match: String? = nil) {
        self.value = value; self.label = label; self.small = small; self.match = match
    }
}

public struct ActivityRound: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let mode: String
    public let prompt: String
    public let answer: [String]
    public let choices: [ActivityChoice]
    public let display: String?
    public let visualText: String?
    public let speech: String?
    public let speechLang: String?
    public let hint: String?
    public let explanation: String?
    public let item: String?
    public let max: Int?
    public let scene: String?
    public let count: Int?
    public let counts: [Int]?
    public let values: [Int]?
    public init(id: String, mode: String = "choice", prompt: String, answer: [String], choices: [ActivityChoice] = [], display: String? = nil, visualText: String? = nil, speech: String? = nil, speechLang: String? = nil, hint: String? = nil, explanation: String? = nil, item: String? = nil, max: Int? = nil, scene: String? = nil, count: Int? = nil, counts: [Int]? = nil, values: [Int]? = nil) {
        self.id = id; self.mode = mode; self.prompt = prompt; self.answer = answer; self.choices = choices
        self.display = display; self.visualText = visualText; self.speech = speech; self.speechLang = speechLang
        self.hint = hint; self.explanation = explanation; self.item = item; self.max = max; self.scene = scene
        self.count = count; self.counts = counts; self.values = values
    }

    public var isValid: Bool {
        let modes: Set<String> = ["choice", "sequence", "select", "build", "memory", "balloons", "trace"]
        guard !id.isEmpty, !prompt.isEmpty, modes.contains(mode), Set(choices.map(\.value)).count == choices.count, choices.allSatisfy({ !$0.value.isEmpty && !$0.label.isEmpty }) else { return false }
        if mode == "trace" { return answer.isEmpty }
        if mode == "memory" {
            guard answer.isEmpty, choices.count == 6, choices.allSatisfy({ $0.match != nil }) else { return false }
            return Dictionary(grouping: choices, by: { $0.match! }).values.allSatisfy { $0.count == 2 }
        }
        guard !answer.isEmpty, Set(answer).count == answer.count else { return false }
        if mode == "build" {
            guard answer.count == 1, let quantity = Int(answer[0]), let maximum = max else { return false }
            return maximum > 0 && maximum <= 100 && (0...maximum).contains(quantity)
        }
        guard answer.allSatisfy({ value in choices.contains { $0.value == value } }) else { return false }
        if mode == "choice" { return answer.count == 1 }
        return true
    }
}

public struct NativeGame: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let subject: NativeSubject
    public let type: String
    public let title: String
    public let description: String
    public let symbol: String
    public let skill: String
    public let category: String
    public let sets: [[ActivityRound]]
    public func randomRounds() -> [ActivityRound] { sets.randomElement() ?? [] }
}

public struct ActivityLibrary: Codable, Equatable, Sendable {
    public let schemaVersion: Int
    public let games: [NativeGame]
    public enum ContentError: Error { case invalidContent }
    public static func decode(_ data: Data) throws -> Self {
        let result = try JSONDecoder().decode(Self.self, from: data)
        guard result.schemaVersion == 1, result.games.count == 60, Set(result.games.map(\.id)).count == 60 else { throw ContentError.invalidContent }
        for subject in NativeSubject.allCases {
            guard result.games.filter({ $0.subject == subject }).count == 20 else { throw ContentError.invalidContent }
        }
        for game in result.games {
            let count = game.id == "numbers-trace" ? 1 : ["numbers-memory", "numbers-balloons"].contains(game.id) ? 3 : 5
            guard game.id == "\(game.subject.rawValue)-\(game.type)", !game.title.isEmpty, game.sets.count == 8,
                  game.sets.allSatisfy({ $0.count == count && $0.allSatisfy(\.isValid) && Set($0.map(\.id)).count == $0.count }) else { throw ContentError.invalidContent }
        }
        return result
    }

    public func filtered(subject: NativeSubject? = nil, category: String? = nil, query: String = "") -> [NativeGame] {
        let search = query.trimmingCharacters(in: .whitespacesAndNewlines)
        return games.filter { game in
            (subject == nil || game.subject == subject) && (category == nil || category == "all" || game.category == category)
                && (search.isEmpty || [game.title, game.description, game.skill].joined(separator: " ").localizedCaseInsensitiveContains(search))
        }
    }
}

public struct ActivitySession: Sendable {
    public enum Submission: Equatable, Sendable { case incorrect, correct, locked }
    public let rounds: [ActivityRound]
    public private(set) var index = 0
    public private(set) var solved = false
    public private(set) var completed = false
    private var rewardClaimed = false
    public var current: ActivityRound { rounds[index] }
    public init(rounds: [ActivityRound]) {
        precondition(!rounds.isEmpty, "An activity requires at least one round")
        self.rounds = rounds
    }
    @discardableResult public mutating func submit(_ values: [String]) -> Submission {
        guard !solved, !completed else { return .locked }
        guard !["trace", "memory"].contains(current.mode), values.count == current.answer.count, Set(values).count == values.count else { return .incorrect }
        let correct = current.mode == "select" ? Set(values) == Set(current.answer) : values == current.answer
        guard correct else { return .incorrect }
        solved = true
        return .correct
    }
    /// Dedicated native interactions call this only after their own state is complete.
    @discardableResult public mutating func completeInteraction() -> Bool {
        guard !solved, !completed, ["memory", "trace"].contains(current.mode) else { return false }
        solved = true
        return true
    }
    @discardableResult public mutating func advance() -> Bool {
        guard solved, !completed else { return false }
        if index == rounds.count - 1 { completed = true }
        else { index += 1; solved = false }
        return true
    }
    @discardableResult public mutating func claimReward() -> Bool {
        guard completed, !rewardClaimed, !rounds.contains(where: { $0.mode == "trace" }) else { return false }
        rewardClaimed = true
        return true
    }
}

public struct MemoryGameState: Sendable {
    public enum Flip: Equatable, Sendable { case ignored, revealed, mismatch, matched, completed }
    public let choices: [ActivityChoice]
    public private(set) var revealed: Set<Int> = []
    public private(set) var matched: Set<Int> = []
    public private(set) var mismatched = false
    public var completed: Bool { !choices.isEmpty && matched.count == choices.count }
    public init(round: ActivityRound) { choices = round.choices }
    @discardableResult public mutating func flip(_ index: Int) -> Flip {
        guard choices.indices.contains(index), !completed, !mismatched, !matched.contains(index), !revealed.contains(index) else { return .ignored }
        revealed.insert(index)
        guard revealed.count == 2 else { return .revealed }
        let pair = Array(revealed)
        guard let first = choices[pair[0]].match, first == choices[pair[1]].match else { mismatched = true; return .mismatch }
        matched.formUnion(revealed)
        revealed.removeAll()
        return completed ? .completed : .matched
    }
    public mutating func resetMismatch() {
        guard mismatched else { return }
        revealed.removeAll(); mismatched = false
    }
}

public struct SequenceGameState: Sendable {
    public let answer: [String]
    public private(set) var picked: [String] = []
    public var completed: Bool { picked.count == answer.count }
    public var nextValue: String? { completed ? nil : answer[picked.count] }
    public init(round: ActivityRound) { answer = round.answer }
    @discardableResult public mutating func tap(_ value: String) -> ActivitySession.Submission {
        guard !completed, !picked.contains(value) else { return .locked }
        guard value == nextValue else { return .incorrect }
        picked.append(value)
        return .correct
    }
}

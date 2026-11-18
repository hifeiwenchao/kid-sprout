import Foundation

public enum NativeSubject: String, Codable, CaseIterable, Identifiable, Sendable {
    case numbers, pinyin, alphabet
    public var id: String { rawValue }
}

public struct PinyinSource: Codable, Equatable, Sendable {
    public let title: String
    public let url: String
    public let note: String
}

public struct PinyinLesson: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let number: Int
    public let unit: Int
    public let symbols: [String]
    public let title: String
    public let readSyllables: [String]
    public let spellings: [String]
    public let rule: String
}

public struct PinyinItem: Codable, Equatable, Identifiable, Sendable {
    public var id: String { symbol }
    public let symbol: String
    public let kind: String
    public let hint: String
    public let example: String
    public let examplePinyin: String
    public let speech: String
    public let referenceNote: String?
}

public struct PinyinTone: Codable, Equatable, Identifiable, Sendable {
    public var id: Int { number }
    public let number: Int
    public let mark: String
    public let name: String
    public let hint: String
    public let path: String
}

public struct PinyinCurriculum: Codable, Equatable, Sendable {
    public let edition: String
    public let sources: [PinyinSource]
    public let lessons: [PinyinLesson]
    public let items: [PinyinItem]
    public let tones: [PinyinTone]
    public static let empty = Self(edition: "", sources: [], lessons: [], items: [], tones: [])
}

public struct AlphabetLetter: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let uppercase: String
    public let lowercase: String
    public let word: String
    public let translation: String
    public let emoji: String
    public let hint: String
}

public struct AlphabetGroup: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let label: String
    public let letters: [String]
}

public struct AlphabetCurriculum: Codable, Equatable, Sendable {
    public let letters: [AlphabetLetter]
    public let groups: [AlphabetGroup]
    public static let empty = Self(letters: [], groups: [])
}

public struct MemoryScene: Codable, Equatable, Identifiable, Sendable {
    public var id: String { "\(subject.rawValue):\(symbol)" }
    public let subject: NativeSubject
    public let symbol: String
    public let title: String
    public let description: String
    public let frames: [String]
}

public struct TracingTemplate: Codable, Equatable, Identifiable, Sendable {
    public let id: String
    public let group: String
    public let label: String
    public let asset: String
}

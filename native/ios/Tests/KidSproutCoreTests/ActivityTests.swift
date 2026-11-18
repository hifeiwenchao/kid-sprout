import XCTest
@testable import KidSproutCore

final class ActivityTests: XCTestCase {
    private func data(_ name: String) throws -> Data {
        let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent().deletingLastPathComponent()
        return try Data(contentsOf: root.appendingPathComponent("shared/\(name).json"))
    }

    func testFullCurriculumAndActivityBundlesDecodeAndValidate() throws {
        let curriculum = try Curriculum.decode(data("curriculum"))
        XCTAssertEqual(curriculum.pinyin.lessons.count, 14)
        XCTAssertEqual(curriculum.pinyin.items.count, 47)
        XCTAssertEqual(curriculum.alphabet.letters.count, 26)
        XCTAssertEqual(curriculum.memoryScenes.count, 88)
        XCTAssertEqual(curriculum.tracingTemplates.count, 37)
        let library = try ActivityLibrary.decode(data("activities"))
        XCTAssertEqual(library.games.count, 60)
        for subject in NativeSubject.allCases { XCTAssertEqual(library.games.filter { $0.subject == subject }.count, 20) }
        for game in library.games {
            XCTAssertEqual(game.sets.count, 8)
            for rounds in game.sets {
                var session = ActivitySession(rounds: rounds)
                for round in rounds {
                    if ["memory", "trace"].contains(round.mode) { XCTAssertTrue(session.completeInteraction()) }
                    else { XCTAssertEqual(session.submit(round.answer), .correct) }
                    XCTAssertFalse(session.claimReward())
                    XCTAssertTrue(session.advance())
                }
                XCTAssertTrue(session.completed)
                XCTAssertEqual(session.claimReward(), game.type != "trace")
                XCTAssertFalse(session.claimReward())
            }
        }
    }

    func testSelectionIsUnorderedButSequenceRequiresOrderAndRejectsDuplicateAnswers() throws {
        let library = try ActivityLibrary.decode(data("activities"))
        let select = try XCTUnwrap(library.games.first { $0.type == "number-between" }?.sets[0][0])
        var selected = ActivitySession(rounds: [select])
        XCTAssertEqual(selected.submit([select.answer[0], select.answer[0], select.answer[0]]), .incorrect)
        XCTAssertFalse(selected.advance())
        XCTAssertFalse(selected.completeInteraction())
        XCTAssertEqual(selected.submit(select.answer.reversed()), .correct)
        XCTAssertEqual(selected.submit(select.answer), .locked)
        XCTAssertTrue(selected.advance())
        XCTAssertTrue(selected.claimReward())
        let sequence = try XCTUnwrap(library.games.first { $0.type == "hop-pattern" }?.sets[0][0])
        var ordered = ActivitySession(rounds: [sequence])
        XCTAssertEqual(ordered.submit(sequence.answer.reversed()), .incorrect)
        XCTAssertEqual(ordered.submit(sequence.answer), .correct)
    }

    func testMemoryRequiresTwoDifferentMatchingCardsAndMismatchCanRetry() throws {
        let library = try ActivityLibrary.decode(data("activities"))
        let round = try XCTUnwrap(library.games.first { $0.type == "memory" }?.sets[0][0])
        var memory = MemoryGameState(round: round)
        let first = 0
        let wrong = try XCTUnwrap(round.choices.indices.first { round.choices[$0].match != round.choices[first].match })
        XCTAssertEqual(memory.flip(first), .revealed)
        XCTAssertEqual(memory.flip(first), .ignored)
        XCTAssertEqual(memory.flip(wrong), .mismatch)
        XCTAssertEqual(memory.flip(1), .ignored)
        memory.resetMismatch()
        XCTAssertTrue(memory.revealed.isEmpty)
        for match in Set(round.choices.compactMap(\.match)) {
            let pair = round.choices.indices.filter { round.choices[$0].match == match }
            XCTAssertEqual(memory.flip(pair[0]), .revealed)
            let result = memory.flip(pair[1])
            XCTAssertTrue(result == .matched || result == .completed)
            XCTAssertEqual(memory.flip(pair[0]), .ignored)
        }
        XCTAssertTrue(memory.completed)
        XCTAssertEqual(memory.matched.count, 6)
    }

    func testBalloonsKeepProgressAfterAnIncorrectTap() throws {
        let library = try ActivityLibrary.decode(data("activities"))
        let round = try XCTUnwrap(library.games.first { $0.type == "balloons" }?.sets[0][0])
        var sequence = SequenceGameState(round: round)
        XCTAssertEqual(sequence.tap("4"), .incorrect)
        XCTAssertEqual(sequence.nextValue, "1")
        XCTAssertEqual(sequence.tap("1"), .correct)
        XCTAssertEqual(sequence.tap("1"), .locked)
        XCTAssertEqual(sequence.nextValue, "2")
        for value in round.answer.dropFirst() { XCTAssertEqual(sequence.tap(value), .correct) }
        XCTAssertTrue(sequence.completed)
        XCTAssertNil(sequence.nextValue)
    }

    func testExtendedProgressRejectsUnknownLessonsLettersAndDates() throws {
        let source = Data(#"{"version":1,"learnedNumbers":[0,12],"learnedPinyin":["lesson-1","lesson-14","lesson-15","b"],"learnedLetters":["A","Z","a","AA"],"lastPinyin":"bad","lastLetter":"bad","visitDates":["2026-11-18","2026-02-30","bad"]}"#.utf8)
        let progress = try JSONDecoder().decode(LearningProgress.self, from: source).validated()
        XCTAssertEqual(progress.learnedPinyin, ["lesson-1", "lesson-14"])
        XCTAssertEqual(progress.learnedLetters, ["A", "Z"])
        XCTAssertEqual(progress.lastPinyin, "lesson-1")
        XCTAssertEqual(progress.lastLetter, "A")
        XCTAssertEqual(progress.visitDates, ["2026-11-18"])
        XCTAssertEqual(try JSONDecoder().decode(LearningProgress.self, from: JSONEncoder().encode(progress)), progress)
    }
}

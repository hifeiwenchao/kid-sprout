import XCTest
@testable import KidSproutCore

final class LearningTests: XCTestCase {
    func testSparseLegacyProgressRetainsExistingLearning() throws {
        let old = Data(#"{"version":1,"learnedNumbers":[0,4,10],"stars":12}"#.utf8)
        let saved = try JSONDecoder().decode(LearningProgress.self, from: old)
        XCTAssertEqual(saved.learnedNumbers, [0, 4, 10])
        XCTAssertEqual(saved.stars, 12)
        XCTAssertEqual(saved.lastNumber, 0)
        XCTAssertTrue(saved.soundEnabled)
    }
    func testFruitCanBeTappedInAnyOrderAndOnlyCountsOnce() {
        var counter = FruitCounter(total: 4)
        XCTAssertEqual(counter.tap(3), 1)
        XCTAssertEqual(counter.tap(0), 2)
        XCTAssertEqual(counter.tap(3), 2)
        XCTAssertEqual(counter.tap(2), 3)
        XCTAssertEqual(counter.tap(1), 4)
        XCTAssertEqual(counter.tap(6), 4)
        XCTAssertEqual(counter.tap(-1), 4)
    }

    func testWrongAnswerCanRetryAndCorrectAnswerLocksUntilNext() {
        var game = GameSession(kind: .countFruit, questions: questions)
        XCTAssertEqual(game.submit(8), .incorrect)
        XCTAssertFalse(game.next())
        XCTAssertEqual(game.round, 0)
        XCTAssertEqual(game.submit(3), .correct)
        XCTAssertEqual(game.submit(3), .locked)
        XCTAssertEqual(game.round, 0)
        XCTAssertFalse(game.claimReward())
        XCTAssertTrue(game.next())
        XCTAssertEqual(game.round, 1)
        XCTAssertFalse(game.next())
        XCTAssertEqual(game.round, 1)
    }

    func testOnlyFifthCompletedRoundAwardsOnce() {
        var game = GameSession(kind: .findNumber, questions: questions)
        for index in 0..<5 {
            XCTAssertFalse(game.claimReward())
            XCTAssertEqual(game.submit(3), .correct)
            XCTAssertFalse(game.claimReward())
            XCTAssertTrue(game.next())
            XCTAssertEqual(game.isFinished, index == 4)
        }
        XCTAssertTrue(game.claimReward())
        XCTAssertFalse(game.claimReward())
        XCTAssertFalse(game.next())
        XCTAssertEqual(game.submit(3), .locked)
    }

    func testProgressSanitizesAndRoundTripsThroughLocalStorage() throws {
        let suite = "KidSproutTest-\(UUID().uuidString)"
        let defaults = try XCTUnwrap(UserDefaults(suiteName: suite))
        defer { defaults.removePersistentDomain(forName: suite) }
        let repository = ProgressRepository(defaults: defaults)
        let dirty = Data(#"{"version":1,"learnedNumbers":[-1,0,3,3,10,11],"lastNumber":99,"stars":-8,"gamesCompleted":-2,"soundEnabled":false}"#.utf8)
        defaults.set(dirty, forKey: ProgressRepository.key)
        var progress = repository.load()
        XCTAssertEqual(progress.learnedNumbers, [0,3,10])
        XCTAssertEqual(progress.lastNumber, 0)
        XCTAssertEqual(progress.stars, 0)
        XCTAssertEqual(progress.gamesCompleted, 0)
        progress.learnedNumbers.insert(7)
        progress.lastNumber = 7
        progress.stars = 15
        repository.save(progress)
        XCTAssertEqual(repository.load(), progress)
        defaults.set(Data("broken".utf8), forKey: ProgressRepository.key)
        XCTAssertEqual(repository.load(), LearningProgress())
        defaults.set(Data(#"{"version":99}"#.utf8), forKey: ProgressRepository.key)
        XCTAssertEqual(repository.load(), LearningProgress())
    }

    func testGeneratedQuestionsArePlayableAndHaveOneCorrectChoice() {
        for kind in GameKind.allCases {
            for _ in 0..<30 {
                let game = GameSession(kind: kind)
                XCTAssertEqual(game.questions.count, 5)
                for question in game.questions {
                    XCTAssertEqual(question.choices.filter { $0 == question.answer }.count, 1)
                    XCTAssertEqual(Set(question.choices).count, question.choices.count)
                    XCTAssertTrue((0...10).contains(question.quantity))
                    if kind == .compareQuantities { XCTAssertNotEqual(question.quantity, question.otherQuantity) }
                }
            }
        }
    }

    func testCurriculumRejectsMissingDuplicateOrUnsupportedContent() throws {
        let json = "{\"schemaVersion\":1,\"brand\":\"萌芽启蒙\",\"numbers\":[" + (0...10).map { "{\"value\":\($0),\"name\":\"数字\"}" }.joined(separator: ",") + "]}"
        XCTAssertEqual(try Curriculum.decode(Data(json.utf8)).numbers.map(\.value), Array(0...10))
        XCTAssertThrowsError(try Curriculum.decode(Data(json.replacingOccurrences(of: "schemaVersion\":1", with: "schemaVersion\":2").utf8)))
        XCTAssertThrowsError(try Curriculum.decode(Data(json.replacingOccurrences(of: "value\":10", with: "value\":9").utf8)))
    }

    private var questions: [GameQuestion] { (0..<5).map { _ in GameQuestion(quantity: 3, otherQuantity: 1, answer: 3, choices: [3, 8, 1]) } }
}

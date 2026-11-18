import XCTest
import AppKit

final class MacAppUITests: XCTestCase {
    private let app = XCUIApplication()
    override func setUpWithError() throws { continueAfterFailure = false; app.launch() }
    override func tearDownWithError() throws { app.terminate() }

    func testLearningCountingAndProgressRestore() {
        navigate("数字乐园")
        let lesson = app.buttons["lesson3"]
        XCTAssertTrue(lesson.waitForExistence(timeout: 5))
        lesson.click()
        app.buttons["fruit2"].click()
        app.buttons["fruit0"].click()
        app.buttons["fruit2"].click()
        XCTAssertEqual(text(app.staticTexts["countFeedback"]), "已经数了 2 个苹果")
        app.buttons["markLearned"].click()
        app.terminate(); app.launch()
        navigate("数字乐园")
        XCTAssertTrue(app.buttons["lesson3"].label.contains("已学过"))
        app.buttons["lesson0"].click()
        XCTAssertTrue(app.staticTexts["空空的篮子，有 0 个苹果"].exists)
        app.buttons["zeroApple"].click()
        XCTAssertTrue(app.staticTexts["放入 1 个，现在有 1 个"].exists)
        app.buttons["zeroApple"].click()
        XCTAssertTrue(app.staticTexts["空空的篮子，有 0 个苹果"].exists)
        capture("mac-numbers")
    }

    func testFiveRoundsRetryAndParentCancellation() {
        navigate("小游戏")
        app.buttons["game-findNumber"].click()
        for round in 0..<5 {
            let prompt = app.staticTexts.matching(NSPredicate(format: "value BEGINSWITH %@", "找一找：")).firstMatch
            XCTAssertTrue(prompt.waitForExistence(timeout: 5))
            let names = ["零","一","二","三","四","五","六","七","八","九","十"]
            let answer = names.firstIndex(of: text(prompt).replacingOccurrences(of: "找一找：", with: ""))!
            let wrong = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@ AND identifier != %@", "answer", "answer\(answer)")).firstMatch
            wrong.click()
            XCTAssertTrue(text(app.staticTexts["gameFeedback"]).contains("再看一看"))
            app.buttons["answer\(answer)"].click()
            XCTAssertFalse(app.buttons["answer\(answer)"].isEnabled)
            app.buttons["nextRound"].click()
            if round == 4 { XCTAssertTrue(app.buttons["再玩一局"].waitForExistence(timeout: 5), app.debugDescription) }
        }
        capture("mac-game-complete")
        navigate("家长区")
        app.buttons["authorEmail"].click()
        XCTAssertTrue(app.textFields["gateAnswer"].waitForExistence(timeout: 5))
        app.textFields["gateAnswer"].click(); app.textFields["gateAnswer"].typeText("0")
        app.buttons["gateConfirm"].click()
        XCTAssertTrue(app.staticTexts.matching(NSPredicate(format: "value BEGINSWITH %@", "再算一算")).firstMatch.exists)
        app.buttons["取消"].click()
        XCTAssertFalse(app.textFields["gateAnswer"].exists)
        capture("mac-parents")
    }

    func testDrawingHistoryRestoreAndGatedPNGSave() {
        navigate("画板")
        let paper = app.images["paper"].exists ? app.images["paper"] : app.images["drawingCanvas"]
        XCTAssertTrue(paper.waitForExistence(timeout: 5), app.debugDescription)
        let before = text(paper)
        let start = paper.coordinate(withNormalizedOffset: CGVector(dx: 0.2, dy: 0.3))
        let end = paper.coordinate(withNormalizedOffset: CGVector(dx: 0.6, dy: 0.4))
        start.press(forDuration: 0.1, thenDragTo: end)
        XCTAssertNotEqual(text(paper), before)
        let drawn = text(paper)
        capture("mac-drawing")
        app.scrollViews.firstMatch.scroll(byDeltaX: 0, deltaY: -500)
        app.buttons["undoDrawing"].click()
        XCTAssertEqual(text(paper), before)
        app.buttons["redoDrawing"].click()
        XCTAssertEqual(text(paper), drawn)
        app.terminate(); app.launch(); navigate("画板")
        XCTAssertEqual(text(paper), drawn)
        app.scrollViews.firstMatch.scroll(byDeltaX: 0, deltaY: -500)
        app.buttons["clearDrawing"].click()
        app.sheets.buttons["清空画纸"].click()
        XCTAssertEqual(text(paper), "0 笔")
        app.buttons["undoDrawing"].click()
        XCTAssertEqual(text(paper), drawn)
        app.buttons["shareDrawing"].click()
        app.buttons["取消"].click()
        XCTAssertTrue(app.buttons["shareDrawing"].isEnabled)
        app.buttons["shareDrawing"].click()
        let question = text(app.staticTexts["gateQuestion"])
        let values = question.components(separatedBy: CharacterSet.decimalDigits.inverted).compactMap(Int.init)
        XCTAssertEqual(values.count, 2)
        app.textFields["gateAnswer"].click()
        app.textFields["gateAnswer"].typeText("\(values.reduce(0, +))")
        app.buttons["gateConfirm"].click()
        let panel = app.sheets.firstMatch
        XCTAssertTrue(panel.waitForExistence(timeout: 5), app.debugDescription)
        let cancel = panel.buttons["Cancel"].exists ? panel.buttons["Cancel"] : panel.buttons["取消"]
        XCTAssertTrue(cancel.waitForExistence(timeout: 5), app.debugDescription)
        capture("mac-save-panel")
        cancel.click()
        XCTAssertTrue(app.buttons["shareDrawing"].isEnabled)
        app.buttons["shareDrawing"].click()
        let saveQuestion = text(app.staticTexts["gateQuestion"])
        let addends = saveQuestion.components(separatedBy: CharacterSet.decimalDigits.inverted).compactMap(Int.init)
        XCTAssertEqual(addends.count, 2)
        app.textFields["gateAnswer"].click()
        app.textFields["gateAnswer"].typeText("\(addends.reduce(0, +))")
        app.buttons["gateConfirm"].click()
        let savePanel = app.sheets["save-panel"]
        XCTAssertTrue(savePanel.waitForExistence(timeout: 5))
        let export = URL(fileURLWithPath: "/private/tmp/sprout-ui-\(UUID()).png")
        defer { try? FileManager.default.removeItem(at: export) }
        app.activate()
        app.typeKey("g", modifierFlags: [.command, .shift])
        let pathField = app.sheets["GoToWindow"].textFields["PathTextField"]
        XCTAssertTrue(pathField.waitForExistence(timeout: 5))
        pathField.click()
        app.typeKey("a", modifierFlags: .command)
        // Go To selects an existing folder; a not-yet-created filename can leave
        // its completion window open and block the save button underneath.
        pathField.typeText(export.deletingLastPathComponent().path + "/")
        pathField.typeKey(.return, modifierFlags: [])
        XCTAssertTrue(app.sheets["GoToWindow"].waitForNonExistence(timeout: 5), app.debugDescription)
        app.activate()
        let nameField = savePanel.textFields.matching(NSPredicate(format: "value ENDSWITH %@", ".png")).firstMatch
        XCTAssertTrue(nameField.waitForExistence(timeout: 5), app.debugDescription)
        nameField.click()
        app.typeKey("a", modifierFlags: .command)
        nameField.typeText(export.lastPathComponent)
        XCTAssertEqual(text(nameField), export.lastPathComponent)
        capture("mac-save-ready")
        let save = savePanel.buttons["OKButton"]
        XCTAssertTrue(save.waitForExistence(timeout: 5), app.debugDescription)
        save.click()
        XCTAssertTrue(savePanel.waitForNonExistence(timeout: 5), app.debugDescription)
        let saved = NSPredicate { _, _ in FileManager.default.fileExists(atPath: export.path) }
        expectation(for: saved, evaluatedWith: nil)
        waitForExpectations(timeout: 5)
        let bytes = try? Data(contentsOf: export)
        XCTAssertGreaterThan(bytes?.count ?? 0, 1000)
        let image = bytes.flatMap(NSBitmapImageRep.init(data:))
        XCTAssertEqual(image?.pixelsWide, 2000)
        XCTAssertEqual(image?.pixelsHigh, 1400)
        let artwork = XCTAttachment(contentsOfFile: export)
        artwork.name = "mac-exported-artwork"; artwork.lifetime = .keepAlways; add(artwork)
        capture("mac-export-complete")
        app.activate()
        // After restoring the cleared draft, Clear is the available redo action.
        app.typeKey("z", modifierFlags: [.command, .shift])
        XCTAssertEqual(text(paper), "0 笔")
        app.typeKey("z", modifierFlags: .command)
        XCTAssertEqual(text(paper), drawn)
        let window = app.windows["main"]
        let corner = window.coordinate(withNormalizedOffset: CGVector(dx: 1, dy: 1)).withOffset(CGVector(dx: -2, dy: -2))
        corner.press(forDuration: 0.1, thenDragTo: corner.withOffset(CGVector(dx: -330, dy: -190)))
        XCTAssertGreaterThanOrEqual(window.frame.width, 760)
        XCTAssertGreaterThan(paper.frame.height, 100)
        XCTAssertEqual(text(paper), drawn)
        XCTAssertEqual(paper.frame.width / paper.frame.height, 1000.0 / 700.0, accuracy: 0.05)
        capture("mac-drawing-small-window")
    }

    func testDarkHomeAndOtherGamesRemainPlayable() {
        app.terminate()
        app.launchArguments = ["-AppleInterfaceStyle", "Dark"]
        app.launch()
        capture("mac-home-dark")
        navigate("小游戏")
        app.buttons["game-countFruit"].click()
        let fruitCount = app.buttons.matching(NSPredicate(format: "identifier MATCHES %@", "fruit[0-9]+" )).count
        let correct = app.buttons["answer\(fruitCount)"]
        XCTAssertTrue(correct.waitForExistence(timeout: 5))
        correct.click()
        XCTAssertTrue(text(app.staticTexts["gameFeedback"]).contains("答对啦"))
        let back = app.buttons["chevron.backward"]
        XCTAssertTrue(back.exists); back.click()
        app.buttons["game-compareQuantities"].click()
        XCTAssertTrue(app.buttons["basket0"].waitForExistence(timeout: 5))
        XCTAssertTrue(app.buttons["basket1"].exists)
        capture("mac-compare-dark")
    }

    private func text(_ element: XCUIElement) -> String { (element.value as? String) ?? element.label }

    private func navigate(_ title: String) {
        let row = app.outlines.staticTexts[title].firstMatch
        if row.exists { row.click() }
        else { app.staticTexts[title].firstMatch.click() }
    }
    private func capture(_ name: String) {
        let shot = XCTAttachment(screenshot: app.screenshot())
        shot.name = name; shot.lifetime = .keepAlways; add(shot)
    }
}

import XCTest

final class AppUITests: XCTestCase {
    @MainActor func testLessonsGamesBoardAndParents() throws {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.buttons["continueLearning"].waitForExistence(timeout: 10))
        capture("explore", app: app)
        app.buttons["continueLearning"].tap()
        XCTAssertTrue(app.buttons["lesson3"].waitForExistence(timeout: 5))
        app.buttons["lesson3"].tap()
        app.buttons["fruit2"].tap()
        app.buttons["fruit0"].tap()
        app.buttons["fruit2"].tap()
        XCTAssertEqual(app.staticTexts["countFeedback"].label, "已经数了 2 个苹果")
        app.buttons["markLearned"].tap()
        capture("numbers", app: app)
        app.terminate()
        app.launch()
        app.buttons["continueLearning"].tap()
        XCTAssertTrue(app.buttons["lesson3"].label.contains("已学过"))
        navigate("小游戏", app: app)
        app.buttons["game-findNumber"].tap()
        let names = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]
        for _ in 0..<5 {
            let prompt = app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH %@", "找一找：")).firstMatch
            XCTAssertTrue(prompt.waitForExistence(timeout: 5))
            let name = prompt.label.replacingOccurrences(of: "找一找：", with: "")
            let answer = try XCTUnwrap(names.firstIndex(of: name))
            app.buttons["answer\(answer)"].tap()
            app.buttons["nextRound"].tap()
        }
        XCTAssertTrue(app.staticTexts["五关完成，真棒！"].waitForExistence(timeout: 5))
        capture("game-complete", app: app)
        navigate("画板", app: app)
        XCTAssertTrue(app.buttons["shareDrawing"].waitForExistence(timeout: 5))
        let paper = app.otherElements["paper"].firstMatch
        let region = paper.exists ? paper : app.otherElements["drawingCanvas"].firstMatch
        if region.exists {
            let start = region.coordinate(withNormalizedOffset: CGVector(dx: 0.2, dy: 0.3))
            let end = region.coordinate(withNormalizedOffset: CGVector(dx: 0.7, dy: 0.6))
            start.press(forDuration: 0.1, thenDragTo: end)
        }
        XCTAssertTrue(app.buttons["undoDrawing"].isEnabled)
        app.buttons["undoDrawing"].tap()
        XCTAssertTrue(app.buttons["redoDrawing"].isEnabled)
        app.buttons["redoDrawing"].tap()
        capture("drawing-portrait", app: app)
        XCUIDevice.shared.orientation = .landscapeLeft
        capture("drawing-landscape", app: app)
        XCUIDevice.shared.orientation = .portrait
        navigate("探索", app: app)
        app.terminate()
        app.launch()
        navigate("画板", app: app)
        capture("drawing-restored", app: app)
        app.buttons["shareDrawing"].tap()
        XCTAssertTrue(app.staticTexts["请家长来帮忙"].waitForExistence(timeout: 5))
        capture("parent-gate", app: app)
        let question = app.staticTexts["gateQuestion"].label
        let values = question.components(separatedBy: CharacterSet.decimalDigits.inverted).compactMap(Int.init)
        app.textFields["gateAnswer"].tap()
        app.textFields["gateAnswer"].typeText("0")
        app.buttons["gateConfirm"].tap()
        XCTAssertTrue(app.staticTexts["请家长来帮忙"].exists)
        app.textFields["gateAnswer"].tap()
        app.textFields["gateAnswer"].typeText(String(values.reduce(0, +)))
        app.buttons["gateConfirm"].tap()
        XCTAssertTrue(app.buttons["关闭"].waitForExistence(timeout: 8) || app.buttons["Close"].exists || app.otherElements["ActivityListView"].exists)
        capture("system-share", app: app)
        app.swipeDown()
        if app.buttons["关闭"].exists { app.buttons["关闭"].tap() }
        if app.buttons["Close"].exists { app.buttons["Close"].tap() }
        navigate("家长区", app: app)
        app.swipeUp()
        app.buttons["authorEmail"].tap()
        XCTAssertTrue(app.staticTexts["请家长来帮忙"].waitForExistence(timeout: 5))
        app.buttons["取消"].tap()
    }
    @MainActor func testCountingAndComparisonSupportRetry() throws {
        let app = XCUIApplication()
        app.launch()
        navigate("小游戏", app: app)
        app.buttons["game-countFruit"].tap()
        let quantity = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@", "fruit")).count
        let wrong = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@ AND identifier != %@", "answer", "answer\(quantity)")).firstMatch
        wrong.tap()
        XCTAssertEqual(app.staticTexts["gameFeedback"].label, "再看一看，试一次吧！")
        app.buttons["answer\(quantity)"].tap()
        XCTAssertTrue(app.buttons["nextRound"].exists)
        app.navigationBars.buttons["小游戏"].tap()
        app.buttons["game-compareQuantities"].tap()
        app.buttons["basket0"].tap()
        if !app.buttons["nextRound"].exists {
            XCTAssertEqual(app.staticTexts["gameFeedback"].label, "再看一看，试一次吧！")
            app.buttons["basket1"].tap()
        }
        XCTAssertTrue(app.buttons["nextRound"].exists)
        capture("comparison-game", app: app)
    }
    @MainActor func testParentGateCompactLandscapeWithKeyboard() {
        let app = XCUIApplication()
        app.launch()
        navigate("画板", app: app)
        app.buttons["shareDrawing"].tap()
        XCTAssertTrue(app.staticTexts["请家长来帮忙"].waitForExistence(timeout: 5))
        XCUIDevice.shared.orientation = .landscapeLeft
        let scroll = app.scrollViews["parentGateScroll"]
        scroll.swipeUp()
        app.textFields["gateAnswer"].tap()
        app.textFields["gateAnswer"].typeText("0")
        scroll.swipeUp()
        XCTAssertTrue(app.buttons["gateConfirm"].isHittable)
        app.buttons["gateConfirm"].tap()
        XCTAssertTrue(app.staticTexts["请家长来帮忙"].exists)
        capture("parent-gate-landscape", app: app)
        app.buttons["取消"].tap()
        XCUIDevice.shared.orientation = .portrait
    }
    @MainActor private func capture(_ name: String, app: XCUIApplication) {
        let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }
    @MainActor private func navigate(_ title: String, app: XCUIApplication) {
        if app.tabBars.buttons[title].exists { app.tabBars.buttons[title].tap() }
        else {
            let button = app.buttons[title].firstMatch
            if button.exists { button.tap() }
            else { app.staticTexts[title].firstMatch.tap() }
        }
    }
}

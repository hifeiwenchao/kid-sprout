// 本次仅静态更新；未在当前桌面运行 UI 测试，供后续专用 CI 执行。
import XCTest

final class AppUITests: XCTestCase {
    override func setUpWithError() throws { continueAfterFailure = false }

    @MainActor func testNumbersCountingAndProgressRestore() {
        let app = XCUIApplication()
        app.launch()
        XCTAssertTrue(app.buttons["continueLearning"].waitForExistence(timeout: 10))
        capture("explore", app: app)
        navigate("numbers", app: app)
        tap(app.buttons["lesson3"], app: app)
        tap(app.buttons["fruit2"], app: app)
        tap(app.buttons["fruit0"], app: app)
        tap(app.buttons["fruit2"], app: app)
        XCTAssertEqual(app.staticTexts["countFeedback"].label, "已经数过 2 颗草莓")
        XCTAssertTrue(app.buttons["重播3记忆动画"].exists)
        capture("numbers", app: app)
        tap(app.buttons["完成"], app: app)
        app.terminate()
        app.launch()
        navigate("numbers", app: app)
        reveal(app.buttons["lesson3"], app: app)
        XCTAssertTrue(app.buttons["lesson3"].label.contains("已认识"))
        tap(app.buttons["lesson0"], app: app)
        tap(app.buttons["zeroApple"], app: app)
        XCTAssertTrue(app.staticTexts["1 个苹果"].exists)
        tap(app.buttons["zeroApple"], app: app)
        XCTAssertTrue(app.staticTexts["0 个苹果"].exists)
        tap(app.buttons["完成"], app: app)
    }

    @MainActor func testPinyinAlphabetAndCombinedGameFilters() {
        let app = XCUIApplication()
        app.launch()
        navigate("pinyin", app: app)
        let firstLesson = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "第1课，")).firstMatch
        tap(firstLesson, app: app)
        XCTAssertTrue(app.buttons["a"].waitForExistence(timeout: 5))
        XCTAssertTrue(app.buttons["重播a记忆动画"].exists)
        tap(app.buttons["o"], app: app)
        XCTAssertTrue(app.buttons["重播o记忆动画"].exists)
        tap(app.buttons["完成这一课 ✓"], app: app)
        XCTAssertTrue(app.staticTexts["pinyinLessonFeedback"].label.contains("第1课的小叶子收好啦"))
        capture("pinyin", app: app)
        tap(app.buttons["完成"], app: app)
        reveal(firstLesson, app: app)
        XCTAssertTrue(firstLesson.label.contains("已学过"))
        navigate("alphabet", app: app)
        let letterA = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", "字母 A，小写 a，")).firstMatch
        tap(letterA, app: app)
        XCTAssertTrue(app.buttons["重播Aa记忆动画"].waitForExistence(timeout: 5))
        tap(app.buttons["听字母名 A"], app: app)
        tap(app.buttons["听英文单词 Apple"], app: app)
        reveal(app.buttons["我练好啦 ✓"], app: app)
        XCTAssertTrue(app.buttons["我练好啦 ✓"].exists)
        capture("alphabet", app: app)
        tap(app.buttons["完成"], app: app)
        reveal(letterA, app: app)
        XCTAssertTrue(letterA.label.contains("已认识"))

        navigate("games", app: app)
        assertGameCount(60, app: app)
        tap(subjectFilter("数字乐园", app: app), app: app)
        assertGameCount(20, app: app)
        tap(app.buttons["gameCategory"], app: app)
        tap(app.buttons["顺序与思考"], app: app)
        let categoryCount = gameCount(app: app)
        XCTAssertGreaterThan(categoryCount, 0)
        XCTAssertLessThan(categoryCount, 20)
        setGameSearch("气球", app: app)
        assertGameCount(1, app: app)
        XCTAssertTrue(app.buttons["game-numbers-balloons"].exists)
        setGameSearch("no-matching-sprout-game", app: app)
        assertGameCount(0, app: app)
        reveal(app.staticTexts["小伙伴还没找到"], app: app)
        XCTAssertTrue(app.staticTexts["小伙伴还没找到"].exists)
        tap(app.buttons["显示全部游戏"], app: app)
        assertGameCount(60, app: app)
        capture("game-filters", app: app)
    }

    @MainActor func testFiveRoundChoiceGameRetryAndAnswerLock() throws {
        let app = XCUIApplication()
        app.launch()
        openGame("numbers-find", search: "数字捉迷藏", app: app)
        let names = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]
        for round in 1...5 {
            let prompt = app.staticTexts["activityPrompt"]
            reveal(prompt, app: app)
            let name = try XCTUnwrap(prompt.label.components(separatedBy: "「").last?.components(separatedBy: "」").first)
            let answer = try XCTUnwrap(names.firstIndex(of: name))
            XCTAssertTrue(app.staticTexts["第 \(round) / 5 关"].exists)
            let wrong = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@ AND identifier != %@", "answer", "answer\(answer)")).firstMatch
            tap(wrong, app: app)
            XCTAssertTrue(app.staticTexts["gameFeedback"].label.contains("再试一次"))
            XCTAssertFalse(app.buttons["nextRound"].exists)
            let correct = app.buttons["answer\(answer)"]
            tap(correct, app: app)
            XCTAssertFalse(correct.isEnabled)
            tap(app.buttons["nextRound"], app: app)
        }
        XCTAssertTrue(app.buttons["再玩一局"].waitForExistence(timeout: 5))
        capture("game-complete", app: app)
        tap(app.buttons["再玩一局"], app: app)
        reveal(app.staticTexts["第 1 / 5 关"], app: app)
        XCTAssertTrue(app.staticTexts["第 1 / 5 关"].exists)
        XCTAssertFalse(app.buttons["nextRound"].exists)
        tap(app.buttons["关闭"], app: app)
    }

    @MainActor func testCountingAndComparisonSupportRetry() {
        let app = XCUIApplication()
        app.launch()
        openGame("numbers-count", search: "数一数水果", app: app)
        let quantity = app.buttons.matching(NSPredicate(format: "identifier MATCHES %@", "fruit[0-9]+")).count
        if quantity > 0 {
            tap(app.buttons["fruit0"], app: app)
            tap(app.buttons["fruit0"], app: app)
            XCTAssertEqual(app.staticTexts["countFeedback"].label, "已经数了 1 个水果")
        }
        let wrong = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@ AND identifier != %@", "answer", "answer\(quantity)")).firstMatch
        tap(wrong, app: app)
        XCTAssertTrue(app.staticTexts["gameFeedback"].label.contains("再试一次"))
        tap(app.buttons["answer\(quantity)"], app: app)
        XCTAssertTrue(app.buttons["nextRound"].exists)
        tap(app.buttons["关闭"], app: app)
        openGame("numbers-compare", search: "小兔分胡萝卜", app: app)
        tap(app.buttons["basket0"], app: app)
        if !app.buttons["nextRound"].exists {
            XCTAssertTrue(app.staticTexts["gameFeedback"].label.contains("再试一次"))
            tap(app.buttons["basket1"], app: app)
        }
        XCTAssertTrue(app.buttons["nextRound"].exists)
        XCTAssertFalse(app.buttons["basket0"].isEnabled)
        XCTAssertFalse(app.buttons["basket1"].isEnabled)
        capture("comparison-game", app: app)
        tap(app.buttons["关闭"], app: app)
    }

    @MainActor func testMemoryAndBalloonGameState() {
        let app = XCUIApplication()
        app.launch()
        openGame("numbers-memory", search: "记忆翻翻乐", app: app)
        let hiddenCards = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "翻开第 "))
        XCTAssertEqual(hiddenCards.count, 6)
        XCTAssertTrue(app.staticTexts["第 1 / 3 关"].exists)
        XCTAssertFalse(app.buttons["nextRound"].exists)
        tap(app.buttons["翻开第 1 张卡片"], app: app)
        XCTAssertEqual(hiddenCards.count, 5)
        XCTAssertTrue(app.staticTexts["已找到 0 / 3 对"].exists)
        tap(app.buttons["重新开始"], app: app)
        XCTAssertEqual(hiddenCards.count, 6)
        capture("memory-game", app: app)
        tap(app.buttons["关闭"], app: app)
        openGame("numbers-balloons", search: "数字气球派对", app: app)
        XCTAssertTrue(app.staticTexts["第 1 / 3 关"].exists)
        tap(app.buttons["数字 2 的气球"], app: app)
        XCTAssertTrue(app.staticTexts["gameFeedback"].label.contains("先找数字 1"))
        XCTAssertTrue(app.staticTexts["已经找到 0 / 5 个"].exists)
        for number in 1...5 { tap(app.buttons["数字 \(number) 的气球"], app: app) }
        XCTAssertFalse(app.buttons["数字 1 的气球"].isEnabled)
        tap(app.buttons["nextRound"], app: app)
        reveal(app.staticTexts["下一位数字朋友：6"], app: app)
        XCTAssertTrue(app.staticTexts["第 2 / 3 关"].exists)
        XCTAssertTrue(app.staticTexts["下一位数字朋友：6"].exists)
        capture("balloon-game", app: app)
        tap(app.buttons["关闭"], app: app)
    }

    @MainActor func testDrawingHistoryRestoreShareAndAuthorGate() {
        let app = XCUIApplication()
        app.launch()
        navigate("drawing", app: app)
        tap(app.buttons["drawingToolpen"], app: app)
        let paper = app.otherElements["paper"].firstMatch
        let canvas = app.otherElements["drawingCanvas"].firstMatch
        let region = paper.exists ? paper : canvas
        reveal(region, app: app)
        XCTAssertTrue(region.exists)
        let viewport = app.scrollViews.allElementsBoundByIndex.filter { $0.isHittable }
            .max(by: { $0.frame.width * $0.frame.height < $1.frame.width * $1.frame.height })
        let visiblePaper = region.frame.intersection(viewport?.frame ?? app.frame)
        XCTAssertGreaterThan(visiblePaper.height, 0)
        let origin = region.coordinate(withNormalizedOffset: .zero)
        let start = origin.withOffset(CGVector(dx: visiblePaper.minX - region.frame.minX + visiblePaper.width * 0.2, dy: visiblePaper.minY - region.frame.minY + visiblePaper.height * 0.3))
        let end = origin.withOffset(CGVector(dx: visiblePaper.minX - region.frame.minX + visiblePaper.width * 0.7, dy: visiblePaper.minY - region.frame.minY + visiblePaper.height * 0.6))
        start.press(forDuration: 0.1, thenDragTo: end)
        reveal(app.buttons["undoDrawing"], app: app)
        XCTAssertTrue(app.buttons["undoDrawing"].isEnabled)
        tap(app.buttons["undoDrawing"], app: app)
        XCTAssertTrue(app.buttons["redoDrawing"].isEnabled)
        tap(app.buttons["redoDrawing"], app: app)
        capture("drawing-portrait", app: app)
        XCUIDevice.shared.orientation = .landscapeLeft
        defer { XCUIDevice.shared.orientation = .portrait }
        capture("drawing-landscape", app: app)
        XCUIDevice.shared.orientation = .portrait
        navigate("home", app: app)
        app.terminate()
        app.launch()
        navigate("drawing", app: app)
        reveal(app.buttons["clearDrawing"], app: app)
        XCTAssertTrue(app.buttons["clearDrawing"].isEnabled, "Saved strokes should survive relaunch")
        tap(app.buttons["clearDrawing"], app: app)
        app.buttons["清空画纸"].tap()
        XCTAssertFalse(app.buttons["clearDrawing"].isEnabled)
        tap(app.buttons["undoDrawing"], app: app)
        XCTAssertTrue(app.buttons["clearDrawing"].isEnabled)
        capture("drawing-restored", app: app)
        tap(app.buttons["shareDrawing"], app: app)
        XCTAssertTrue(app.textFields["gateAnswer"].waitForExistence(timeout: 5))
        tap(app.buttons["取消"], app: app)
        XCTAssertFalse(app.textFields["gateAnswer"].exists)
        tap(app.buttons["shareDrawing"], app: app)
        XCTAssertTrue(app.staticTexts["gateQuestion"].waitForExistence(timeout: 5))
        let values = app.staticTexts["gateQuestion"].label.components(separatedBy: CharacterSet.decimalDigits.inverted).compactMap(Int.init)
        XCTAssertEqual(values.count, 2)
        app.textFields["gateAnswer"].tap()
        app.textFields["gateAnswer"].typeText("0")
        tap(app.buttons["gateConfirm"], app: app)
        XCTAssertTrue(app.textFields["gateAnswer"].exists)
        app.textFields["gateAnswer"].tap()
        app.textFields["gateAnswer"].typeText(String(values.reduce(0, +)))
        tap(app.buttons["gateConfirm"], app: app)
        XCTAssertTrue(app.buttons["关闭"].waitForExistence(timeout: 8) || app.buttons["Close"].exists || app.otherElements["ActivityListView"].exists)
        capture("system-share", app: app)
        if app.buttons["关闭"].exists { app.buttons["关闭"].tap() }
        else if app.buttons["Close"].exists { app.buttons["Close"].tap() }
        else { app.swipeDown() }
        XCTAssertTrue(app.buttons["nav-home"].waitForExistence(timeout: 5))
        openInformation("关于作者", app: app)
        tap(app.buttons["authorEmail"], app: app)
        XCTAssertTrue(app.textFields["gateAnswer"].waitForExistence(timeout: 5))
        tap(app.buttons["取消"], app: app)
        XCTAssertFalse(app.textFields["gateAnswer"].exists)
        tap(app.buttons["完成"], app: app)
        openInformation("给爸爸妈妈的话", app: app)
        tap(app.buttons["authorEmail"], app: app)
        XCTAssertTrue(app.textFields["gateAnswer"].waitForExistence(timeout: 5))
        tap(app.buttons["取消"], app: app)
        tap(app.buttons["完成"], app: app)
    }

    @MainActor func testParentGateCompactLandscapeWithKeyboard() {
        let app = XCUIApplication()
        app.launch()
        navigate("drawing", app: app)
        tap(app.buttons["shareDrawing"], app: app)
        XCTAssertTrue(app.textFields["gateAnswer"].waitForExistence(timeout: 5))
        XCUIDevice.shared.orientation = .landscapeLeft
        defer { XCUIDevice.shared.orientation = .portrait }
        let scroll = app.scrollViews["parentGateScroll"]
        scroll.swipeUp()
        app.textFields["gateAnswer"].tap()
        app.textFields["gateAnswer"].typeText("0")
        scroll.swipeUp()
        XCTAssertTrue(app.buttons["gateConfirm"].isHittable)
        app.buttons["gateConfirm"].tap()
        XCTAssertTrue(app.textFields["gateAnswer"].exists)
        capture("parent-gate-landscape", app: app)
        tap(app.buttons["取消"], app: app)
    }

    @MainActor private func navigate(_ area: String, app: XCUIApplication) {
        tap(app.buttons["nav-\(area)"], app: app)
    }
    @MainActor private func openInformation(_ title: String, app: XCUIApplication) {
        if app.buttons["nav-more"].exists { app.buttons["nav-more"].tap() }
        tap(app.buttons[title].firstMatch, app: app)
    }
    @MainActor private func openGame(_ id: String, search: String, app: XCUIApplication) {
        navigate("games", app: app)
        setGameSearch(search, app: app)
        tap(app.buttons["game-\(id)"], app: app)
        XCTAssertTrue(app.staticTexts["activityPrompt"].waitForExistence(timeout: 5))
    }
    @MainActor private func setGameSearch(_ query: String, app: XCUIApplication) {
        let field = app.textFields["gameSearch"]
        reveal(field, app: app)
        if app.buttons["清除搜索"].exists { tap(app.buttons["清除搜索"], app: app) }
        field.tap()
        field.typeText(query)
    }
    @MainActor private func subjectFilter(_ title: String, app: XCUIApplication) -> XCUIElement {
        app.buttons.matching(NSPredicate(format: "label == %@ AND NOT (identifier BEGINSWITH %@)", title, "nav-")).firstMatch
    }
    @MainActor private func gameCount(app: XCUIApplication) -> Int {
        let status = app.staticTexts["gameFilterStatus"]
        reveal(status, app: app)
        return Int(status.label.components(separatedBy: " ").first ?? "") ?? -1
    }
    @MainActor private func assertGameCount(_ expected: Int, app: XCUIApplication) {
        let status = app.staticTexts["gameFilterStatus"]
        reveal(status, app: app)
        let predicate = NSPredicate(format: "label BEGINSWITH %@", "\(expected) 个小游戏")
        expectation(for: predicate, evaluatedWith: status)
        waitForExpectations(timeout: 5)
    }
    @MainActor private func tap(_ element: XCUIElement, app: XCUIApplication) {
        reveal(element, app: app)
        XCTAssertTrue(element.exists && element.isHittable, element.debugDescription)
        element.tap()
    }
    @MainActor private func reveal(_ element: XCUIElement, app: XCUIApplication) {
        if element.exists && element.isHittable { return }
        for attempt in 0..<16 {
            let scrolls = app.scrollViews.allElementsBoundByIndex.filter { $0.isHittable }
            let frame = element.exists ? element.frame : .zero
            let aligned = scrolls.filter { frame == .zero || ($0.frame.minX <= frame.midX && $0.frame.maxX >= frame.midX) }
            guard let scroll = (aligned.isEmpty ? scrolls : aligned).max(by: { $0.frame.width * $0.frame.height < $1.frame.width * $1.frame.height }) else { break }
            let towardTop = frame != .zero ? frame.midY < scroll.frame.midY : attempt >= 10
            let start = scroll.coordinate(withNormalizedOffset: CGVector(dx: 0.96, dy: towardTop ? 0.25 : 0.8))
            let end = scroll.coordinate(withNormalizedOffset: CGVector(dx: 0.96, dy: towardTop ? 0.8 : 0.25))
            start.press(forDuration: 0.05, thenDragTo: end)
            if element.exists && element.isHittable { return }
        }
    }
    @MainActor private func capture(_ name: String, app: XCUIApplication) {
        let attachment = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}

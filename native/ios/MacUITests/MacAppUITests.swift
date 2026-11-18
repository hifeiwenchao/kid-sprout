// 本次仅静态更新；未在当前桌面运行 UI 测试，供后续专用 CI 执行。
import XCTest
import AppKit

final class MacAppUITests: XCTestCase {
    private let app = XCUIApplication()
    override func setUpWithError() throws { continueAfterFailure = false; app.launch() }
    override func tearDownWithError() throws { app.terminate() }

    func testLearningCountingAndProgressRestore() {
        navigate("numbers")
        click(app.buttons["lesson3"])
        click(app.buttons["fruit2"])
        click(app.buttons["fruit0"])
        click(app.buttons["fruit2"])
        XCTAssertEqual(text(app.staticTexts["countFeedback"]), "已经数过 2 颗草莓")
        XCTAssertTrue(app.buttons["重播3记忆动画"].exists)
        capture("mac-numbers")
        click(app.buttons["完成"])
        app.terminate()
        app.launch()
        navigate("numbers")
        reveal(app.buttons["lesson3"])
        XCTAssertTrue(app.buttons["lesson3"].label.contains("已认识"))
        click(app.buttons["lesson0"])
        click(app.buttons["zeroApple"])
        XCTAssertTrue(app.staticTexts["1 个苹果"].exists)
        click(app.buttons["zeroApple"])
        XCTAssertTrue(app.staticTexts["0 个苹果"].exists)
        click(app.buttons["完成"])
    }

    func testPinyinAlphabetAndCombinedGameFilters() {
        navigate("pinyin")
        let firstLesson = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "第1课，")).firstMatch
        click(firstLesson)
        XCTAssertTrue(app.buttons["a"].waitForExistence(timeout: 5))
        XCTAssertTrue(app.buttons["重播a记忆动画"].exists)
        click(app.buttons["o"])
        XCTAssertTrue(app.buttons["重播o记忆动画"].exists)
        click(app.buttons["完成这一课 ✓"])
        XCTAssertTrue(text(app.staticTexts["pinyinLessonFeedback"]).contains("第1课的小叶子收好啦"))
        capture("mac-pinyin")
        click(app.buttons["完成"])
        reveal(firstLesson)
        XCTAssertTrue(firstLesson.label.contains("已学过"))
        navigate("alphabet")
        let letterA = app.buttons.matching(NSPredicate(format: "label CONTAINS %@", "字母 A，小写 a，")).firstMatch
        click(letterA)
        XCTAssertTrue(app.buttons["重播Aa记忆动画"].waitForExistence(timeout: 5))
        click(app.buttons["听字母名 A"])
        click(app.buttons["听英文单词 Apple"])
        reveal(app.buttons["我练好啦 ✓"])
        XCTAssertTrue(app.buttons["我练好啦 ✓"].exists)
        capture("mac-alphabet")
        click(app.buttons["完成"])
        reveal(letterA)
        XCTAssertTrue(letterA.label.contains("已认识"))

        navigate("games")
        assertGameCount(60)
        click(subjectFilter("数字乐园"))
        assertGameCount(20)
        let picker = app.popUpButtons["gameCategory"].exists ? app.popUpButtons["gameCategory"] : app.buttons["gameCategory"]
        click(picker)
        let category = app.menuItems["顺序与思考"].exists ? app.menuItems["顺序与思考"] : app.buttons["顺序与思考"]
        click(category)
        let categoryCount = gameCount()
        XCTAssertGreaterThan(categoryCount, 0)
        XCTAssertLessThan(categoryCount, 20)
        setGameSearch("气球")
        assertGameCount(1)
        XCTAssertTrue(app.buttons["game-numbers-balloons"].exists)
        setGameSearch("no-matching-sprout-game")
        assertGameCount(0)
        reveal(app.staticTexts["小伙伴还没找到"])
        XCTAssertTrue(app.staticTexts["小伙伴还没找到"].exists)
        click(app.buttons["显示全部游戏"])
        assertGameCount(60)
        capture("mac-game-filters")
    }

    func testFiveRoundsRetryAndParentCancellation() throws {
        openGame("numbers-find", search: "数字捉迷藏")
        let names = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"]
        for round in 1...5 {
            let prompt = app.staticTexts["activityPrompt"]
            reveal(prompt)
            let name = try XCTUnwrap(text(prompt).components(separatedBy: "「").last?.components(separatedBy: "」").first)
            let answer = try XCTUnwrap(names.firstIndex(of: name))
            XCTAssertTrue(app.staticTexts["第 \(round) / 5 关"].exists)
            let wrong = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@ AND identifier != %@", "answer", "answer\(answer)")).firstMatch
            click(wrong)
            XCTAssertTrue(text(app.staticTexts["gameFeedback"]).contains("再试一次"))
            XCTAssertFalse(app.buttons["nextRound"].exists)
            let correct = app.buttons["answer\(answer)"]
            click(correct)
            XCTAssertFalse(correct.isEnabled)
            click(app.buttons["nextRound"])
        }
        XCTAssertTrue(app.buttons["再玩一局"].waitForExistence(timeout: 5), app.debugDescription)
        capture("mac-game-complete")
        click(app.buttons["再玩一局"])
        reveal(app.staticTexts["第 1 / 5 关"])
        XCTAssertTrue(app.staticTexts["第 1 / 5 关"].exists)
        XCTAssertFalse(app.buttons["nextRound"].exists)
        click(app.buttons["关闭"])
        click(app.buttons["给爸爸妈妈的话"])
        click(app.buttons["authorEmail"])
        XCTAssertTrue(app.textFields["gateAnswer"].waitForExistence(timeout: 5))
        app.textFields["gateAnswer"].click()
        app.textFields["gateAnswer"].typeText("0")
        click(app.buttons["gateConfirm"])
        let error = app.staticTexts.matching(NSPredicate(format: "value BEGINSWITH %@ OR label BEGINSWITH %@", "再算一算", "再算一算")).firstMatch
        XCTAssertTrue(error.exists)
        click(app.buttons["取消"])
        XCTAssertFalse(app.textFields["gateAnswer"].exists)
        capture("mac-parents")
        click(app.buttons["完成"])
        click(app.buttons["关于作者"])
        click(app.buttons["authorEmail"])
        XCTAssertTrue(app.textFields["gateAnswer"].waitForExistence(timeout: 5))
        click(app.buttons["取消"])
        XCTAssertFalse(app.textFields["gateAnswer"].exists)
        click(app.buttons["完成"])
    }

    func testMemoryAndBalloonGameState() {
        openGame("numbers-memory", search: "记忆翻翻乐")
        let hiddenCards = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "翻开第 "))
        XCTAssertEqual(hiddenCards.count, 6)
        XCTAssertTrue(app.staticTexts["第 1 / 3 关"].exists)
        XCTAssertFalse(app.buttons["nextRound"].exists)
        click(app.buttons["翻开第 1 张卡片"])
        XCTAssertEqual(hiddenCards.count, 5)
        XCTAssertTrue(app.staticTexts["已找到 0 / 3 对"].exists)
        click(app.buttons["重新开始"])
        XCTAssertEqual(hiddenCards.count, 6)
        capture("mac-memory-game")
        click(app.buttons["关闭"])
        openGame("numbers-balloons", search: "数字气球派对")
        XCTAssertTrue(app.staticTexts["第 1 / 3 关"].exists)
        click(app.buttons["数字 2 的气球"])
        XCTAssertTrue(text(app.staticTexts["gameFeedback"]).contains("先找数字 1"))
        XCTAssertTrue(app.staticTexts["已经找到 0 / 5 个"].exists)
        for number in 1...5 { click(app.buttons["数字 \(number) 的气球"]) }
        XCTAssertFalse(app.buttons["数字 1 的气球"].isEnabled)
        click(app.buttons["nextRound"])
        reveal(app.staticTexts["下一位数字朋友：6"])
        XCTAssertTrue(app.staticTexts["第 2 / 3 关"].exists)
        XCTAssertTrue(app.staticTexts["下一位数字朋友：6"].exists)
        capture("mac-balloon-game")
        click(app.buttons["关闭"])
    }

    func testDrawingHistoryRestoreAndGatedPNGSave() {
        navigate("drawing")
        click(app.buttons["drawingToolpen"])
        let paper = app.images["paper"].exists ? app.images["paper"] : app.images["drawingCanvas"]
        reveal(paper)
        XCTAssertTrue(paper.exists, app.debugDescription)
        let before = text(paper)
        let viewport = app.scrollViews.allElementsBoundByIndex.filter { $0.isHittable }
            .max(by: { $0.frame.width * $0.frame.height < $1.frame.width * $1.frame.height })
        let visiblePaper = paper.frame.intersection(viewport?.frame ?? app.frame)
        XCTAssertGreaterThan(visiblePaper.height, 0)
        let origin = paper.coordinate(withNormalizedOffset: .zero)
        let start = origin.withOffset(CGVector(dx: visiblePaper.minX - paper.frame.minX + visiblePaper.width * 0.2, dy: visiblePaper.minY - paper.frame.minY + visiblePaper.height * 0.3))
        let end = origin.withOffset(CGVector(dx: visiblePaper.minX - paper.frame.minX + visiblePaper.width * 0.6, dy: visiblePaper.minY - paper.frame.minY + visiblePaper.height * 0.4))
        start.press(forDuration: 0.1, thenDragTo: end)
        XCTAssertNotEqual(text(paper), before)
        let drawn = text(paper)
        capture("mac-drawing")
        click(app.buttons["undoDrawing"])
        XCTAssertEqual(text(paper), before)
        click(app.buttons["redoDrawing"])
        XCTAssertEqual(text(paper), drawn)
        app.terminate()
        app.launch()
        navigate("drawing")
        reveal(paper)
        XCTAssertEqual(text(paper), drawn)
        click(app.buttons["clearDrawing"])
        app.sheets.buttons["清空画纸"].click()
        XCTAssertEqual(text(paper), "0 笔")
        click(app.buttons["undoDrawing"])
        XCTAssertEqual(text(paper), drawn)
        click(app.buttons["shareDrawing"])
        XCTAssertTrue(app.textFields["gateAnswer"].waitForExistence(timeout: 5))
        click(app.buttons["取消"])
        XCTAssertTrue(app.buttons["shareDrawing"].isEnabled)
        click(app.buttons["shareDrawing"])
        answerParentGate()
        let panel = app.sheets.firstMatch
        XCTAssertTrue(panel.waitForExistence(timeout: 5), app.debugDescription)
        let cancel = panel.buttons["Cancel"].exists ? panel.buttons["Cancel"] : panel.buttons["取消"]
        XCTAssertTrue(cancel.waitForExistence(timeout: 5), app.debugDescription)
        capture("mac-save-panel")
        cancel.click()
        XCTAssertTrue(app.buttons["shareDrawing"].isEnabled)
        click(app.buttons["shareDrawing"])
        answerParentGate()
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
        // Go To must select an existing folder before setting the new filename.
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
        artwork.name = "mac-exported-artwork"
        artwork.lifetime = .keepAlways
        add(artwork)
        capture("mac-export-complete")
        app.activate()
        // After undoing Clear, it remains the available redo action.
        app.typeKey("z", modifierFlags: [.command, .shift])
        XCTAssertEqual(text(paper), "0 笔")
        app.typeKey("z", modifierFlags: .command)
        XCTAssertEqual(text(paper), drawn)
        let window = app.windows["main"]
        let corner = window.coordinate(withNormalizedOffset: CGVector(dx: 1, dy: 1)).withOffset(CGVector(dx: -2, dy: -2))
        corner.press(forDuration: 0.1, thenDragTo: corner.withOffset(CGVector(dx: -330, dy: -190)))
        XCTAssertGreaterThanOrEqual(window.frame.width, 760)
        reveal(paper)
        XCTAssertGreaterThan(paper.frame.height, 100)
        XCTAssertEqual(text(paper), drawn)
        XCTAssertEqual(paper.frame.width / paper.frame.height, 10.0 / 7.0, accuracy: 0.05)
        capture("mac-drawing-small-window")
    }

    func testDarkHomeAndOtherGamesRemainPlayable() {
        app.terminate()
        app.launchArguments = ["-AppleInterfaceStyle", "Dark"]
        app.launch()
        defer { app.launchArguments = [] }
        capture("mac-home-dark")
        openGame("numbers-count", search: "数一数水果")
        let fruitCount = app.buttons.matching(NSPredicate(format: "identifier MATCHES %@", "fruit[0-9]+")).count
        if fruitCount > 0 {
            click(app.buttons["fruit0"])
            click(app.buttons["fruit0"])
            XCTAssertEqual(text(app.staticTexts["countFeedback"]), "已经数了 1 个水果")
        }
        let wrong = app.buttons.matching(NSPredicate(format: "identifier BEGINSWITH %@ AND identifier != %@", "answer", "answer\(fruitCount)")).firstMatch
        click(wrong)
        XCTAssertTrue(text(app.staticTexts["gameFeedback"]).contains("再试一次"))
        click(app.buttons["answer\(fruitCount)"])
        XCTAssertTrue(text(app.staticTexts["gameFeedback"]).contains("答对啦"))
        click(app.buttons["关闭"])
        openGame("numbers-compare", search: "小兔分胡萝卜")
        click(app.buttons["basket0"])
        if !app.buttons["nextRound"].exists {
            XCTAssertTrue(text(app.staticTexts["gameFeedback"]).contains("再试一次"))
            click(app.buttons["basket1"])
        }
        XCTAssertTrue(app.buttons["nextRound"].exists)
        XCTAssertFalse(app.buttons["basket0"].isEnabled)
        XCTAssertFalse(app.buttons["basket1"].isEnabled)
        capture("mac-compare-dark")
        click(app.buttons["关闭"])
    }

    private func answerParentGate() {
        XCTAssertTrue(app.staticTexts["gateQuestion"].waitForExistence(timeout: 5))
        let values = text(app.staticTexts["gateQuestion"]).components(separatedBy: CharacterSet.decimalDigits.inverted).compactMap(Int.init)
        XCTAssertEqual(values.count, 2)
        click(app.textFields["gateAnswer"])
        app.textFields["gateAnswer"].typeText(String(values.reduce(0, +)))
        click(app.buttons["gateConfirm"])
    }
    private func text(_ element: XCUIElement) -> String { (element.value as? String) ?? element.label }
    private func navigate(_ area: String) { click(app.buttons["nav-\(area)"]) }
    private func openGame(_ id: String, search: String) {
        navigate("games")
        setGameSearch(search)
        click(app.buttons["game-\(id)"])
        XCTAssertTrue(app.staticTexts["activityPrompt"].waitForExistence(timeout: 5))
    }
    private func setGameSearch(_ query: String) {
        let field = app.textFields["gameSearch"]
        click(field)
        app.typeKey("a", modifierFlags: .command)
        field.typeText(query)
    }
    private func subjectFilter(_ title: String) -> XCUIElement {
        app.buttons.matching(NSPredicate(format: "label == %@ AND NOT (identifier BEGINSWITH %@)", title, "nav-")).firstMatch
    }
    private func gameCount() -> Int {
        let status = app.staticTexts["gameFilterStatus"]
        reveal(status)
        return Int(text(status).components(separatedBy: " ").first ?? "") ?? -1
    }
    private func assertGameCount(_ expected: Int) {
        let status = app.staticTexts["gameFilterStatus"]
        reveal(status)
        let prefix = "\(expected) 个小游戏"
        let predicate = NSPredicate(format: "value BEGINSWITH %@ OR label BEGINSWITH %@", prefix, prefix)
        expectation(for: predicate, evaluatedWith: status)
        waitForExpectations(timeout: 5)
    }
    private func click(_ element: XCUIElement) {
        reveal(element)
        XCTAssertTrue(element.exists && element.isHittable, element.debugDescription)
        element.click()
    }
    private func reveal(_ element: XCUIElement) {
        if element.exists && element.isHittable { return }
        for attempt in 0..<16 {
            let scrolls = app.scrollViews.allElementsBoundByIndex.filter { $0.isHittable }
            let frame = element.exists ? element.frame : .zero
            let aligned = scrolls.filter { frame == .zero || ($0.frame.minX <= frame.midX && $0.frame.maxX >= frame.midX) }
            guard let scroll = (aligned.isEmpty ? scrolls : aligned).max(by: { $0.frame.width * $0.frame.height < $1.frame.width * $1.frame.height }) else { break }
            let towardTop = frame != .zero ? frame.midY < scroll.frame.midY : attempt >= 10
            scroll.scroll(byDeltaX: 0, deltaY: towardTop ? -450 : 450)
            if element.exists && element.isHittable { return }
        }
    }
    private func capture(_ name: String) {
        let shot = XCTAttachment(screenshot: app.screenshot())
        shot.name = name
        shot.lifetime = .keepAlways
        add(shot)
    }
}

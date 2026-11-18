import AppKit
import XCTest
@testable import KidSproutMac

final class MacDrawingTests: XCTestCase {
    @MainActor func testStrokeClearUndoRedoAndNewBranchPersistTheVisibleDrawing() throws {
        let url = draftURL()
        defer { try? FileManager.default.removeItem(at: url.deletingLastPathComponent()) }
        let board = DrawingModel(storageURL: url)
        drawLine(board)
        XCTAssertEqual(board.strokes.count, 1)
        XCTAssertTrue(board.canUndo)
        board.clear()
        XCTAssertTrue(board.strokes.isEmpty)
        board.undo()
        XCTAssertEqual(board.strokes.count, 1)
        board.redo()
        XCTAssertTrue(board.strokes.isEmpty)
        board.undo()
        board.undo()
        XCTAssertTrue(board.strokes.isEmpty)
        XCTAssertTrue(board.canRedo)
        drawLine(board, start: CGPoint(x: 300, y: 200))
        XCTAssertFalse(board.canRedo)
        XCTAssertEqual(DrawingModel(storageURL: url).strokes.count, 1)
        XCTAssertEqual(board.strokes[0].points[0], DrawingPoint(x: 300, y: 200))
    }

    @MainActor func testFinishedStrokeRestoresToolsAndFixedPaperCoordinates() throws {
        let url = draftURL()
        defer { try? FileManager.default.removeItem(at: url.deletingLastPathComponent()) }
        let board = DrawingModel(storageURL: url)
        board.colorIndex = 4
        board.width = 17
        board.erasing = true
        drawLine(board)
        let restored = DrawingModel(storageURL: url)
        XCTAssertEqual(restored.strokes.count, 1)
        XCTAssertEqual(restored.strokes[0].colorIndex, 4)
        XCTAssertEqual(restored.strokes[0].width, 17)
        XCTAssertTrue(restored.strokes[0].erasing)
        XCTAssertEqual(restored.strokes[0].points, [DrawingPoint(x: 120, y: 140), DrawingPoint(x: 600, y: 300)])
        XCTAssertFalse(restored.canUndo)
        XCTAssertNil(restored.saveError)
    }

    @MainActor func testCorruptUnsupportedOrOutOfRangeDraftFallsBackWithoutOverwritingOriginal() throws {
        let url = draftURL()
        defer { try? FileManager.default.removeItem(at: url.deletingLastPathComponent()) }
        try FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
        let fixtures = [
            "not JSON",
            #"{"version":2,"strokes":[]}"#,
            #"{"version":1,"strokes":[{"colorIndex":0,"width":8,"erasing":false,"points":[{"x":1001,"y":5}]}]}"#,
            #"{"version":1,"strokes":[{"colorIndex":7,"width":8,"erasing":false,"points":[{"x":3,"y":5}]}]}"#,
            #"{"version":1,"strokes":[{"colorIndex":0,"width":0,"erasing":false,"points":[{"x":3,"y":5}]}]}"#,
            #"{"version":1,"strokes":[{"colorIndex":0,"width":8,"erasing":false,"points":[]}]}"#
        ]
        for fixture in fixtures {
            let bytes = Data(fixture.utf8)
            try bytes.write(to: url)
            let restored = DrawingModel(storageURL: url)
            XCTAssertTrue(restored.strokes.isEmpty)
            XCTAssertNotNil(restored.saveError)
            restored.save()
            XCTAssertEqual(try Data(contentsOf: url), bytes)
        }
    }

    @MainActor func testPointerCoordinatesClampToPaperAndNonfiniteSamplesDoNotCorruptDraft() throws {
        let url = draftURL()
        defer { try? FileManager.default.removeItem(at: url.deletingLastPathComponent()) }
        let board = DrawingModel(storageURL: url)
        board.beginStroke(at: CGPoint(x: -20, y: 800))
        board.appendPoint(CGPoint(x: 2000, y: -10))
        board.appendPoint(CGPoint(x: CGFloat.infinity, y: 10))
        board.endStroke()
        XCTAssertEqual(board.strokes[0].points, [DrawingPoint(x: 0, y: 700), DrawingPoint(x: 1000, y: 0)])
        XCTAssertEqual(DrawingModel(storageURL: url).strokes, board.strokes)
        board.beginStroke(at: CGPoint(x: CGFloat.nan, y: 4))
        board.endStroke()
        XCTAssertEqual(board.strokes.count, 1)
    }

    @MainActor func testStrokeLimitBlocksNewInkAndPreservesOlderOversizedDraft() throws {
        let url = draftURL()
        defer { try? FileManager.default.removeItem(at: url.deletingLastPathComponent()) }
        try FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
        let stroke = DrawingStroke(colorIndex: 0, width: 8, erasing: false, points: [DrawingPoint(x: 100, y: 100)])
        for count in [10_000, 10_001] {
            let original = DrawingDraft(version: 1, strokes: Array(repeating: stroke, count: count))
            try JSONEncoder().encode(original).write(to: url)
            let board = DrawingModel(storageURL: url)
            XCTAssertEqual(board.strokes.count, count)
            drawLine(board)
            XCTAssertEqual(board.strokes.count, count)
            XCTAssertNotNil(board.limitMessage)
            board.save()
            XCTAssertEqual(DrawingModel(storageURL: url).strokes.count, count)
            board.clear()
            XCTAssertTrue(board.strokes.isEmpty)
            board.undo()
            XCTAssertEqual(board.strokes.count, count)
        }
    }

    @MainActor func testPNGHasStableDimensionsWhiteBackgroundAndRenderedInk() throws {
        let url = draftURL()
        defer { try? FileManager.default.removeItem(at: url.deletingLastPathComponent()) }
        let board = DrawingModel(storageURL: url)
        board.width = 20
        board.beginStroke(at: CGPoint(x: 200, y: 100))
        board.appendPoint(CGPoint(x: 600, y: 100))
        board.endStroke()
        let image = try XCTUnwrap(NSBitmapImageRep(data: try board.pngData()))
        XCTAssertEqual(image.pixelsWide, 2000)
        XCTAssertEqual(image.pixelsHigh, 1400)
        let paper = try XCTUnwrap(image.colorAt(x: 0, y: 0)?.usingColorSpace(.deviceRGB))
        XCTAssertEqual(paper.redComponent, 1, accuracy: 0.001)
        XCTAssertEqual(paper.greenComponent, 1, accuracy: 0.001)
        XCTAssertEqual(paper.blueComponent, 1, accuracy: 0.001)
        XCTAssertEqual(paper.alphaComponent, 1, accuracy: 0.001)
        let ink = try XCTUnwrap(image.colorAt(x: 800, y: 200)?.usingColorSpace(.deviceRGB))
        XCTAssertLessThan(ink.redComponent, 0.01)
        board.erasing = true
        board.beginStroke(at: CGPoint(x: 400, y: 100))
        board.endStroke()
        let erased = try XCTUnwrap(NSBitmapImageRep(data: try board.pngData()))
        let erasedPixel = try XCTUnwrap(erased.colorAt(x: 800, y: 200)?.usingColorSpace(.deviceRGB))
        XCTAssertEqual(erasedPixel.redComponent, 1, accuracy: 0.001)
        board.undo()
        let undone = try XCTUnwrap(NSBitmapImageRep(data: try board.pngData()))
        XCTAssertLessThan(try XCTUnwrap(undone.colorAt(x: 800, y: 200)).redComponent, 0.01)
    }

    @MainActor func testFailedDraftAndPNGSaveShowReadableErrorsAndKeepDrawing() throws {
        let folder = draftURL().deletingLastPathComponent()
        defer { try? FileManager.default.removeItem(at: folder) }
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        let file = folder.appendingPathComponent("blocker")
        try Data("file is not a directory".utf8).write(to: file)
        let board = DrawingModel(storageURL: file.appendingPathComponent("draft.json"))
        drawLine(board)
        XCTAssertEqual(board.strokes.count, 1)
        XCTAssertNotNil(board.saveError)
        XCTAssertFalse(board.exportPNG(to: file.appendingPathComponent("painting.png")))
        XCTAssertNotNil(board.exportError)
        XCTAssertEqual(board.strokes.count, 1)
    }

    @MainActor private func drawLine(_ board: DrawingModel, start: CGPoint = CGPoint(x: 120, y: 140)) {
        board.beginStroke(at: start)
        board.appendPoint(CGPoint(x: 600, y: 300))
        board.endStroke()
    }

    private func draftURL() -> URL {
        FileManager.default.temporaryDirectory.appendingPathComponent("sprout-mac-test-\(UUID())", isDirectory: true).appendingPathComponent("draft.json")
    }
}

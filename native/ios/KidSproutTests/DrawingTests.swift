import XCTest
import PencilKit
@testable import KidSprout

final class DrawingTests: XCTestCase {
    @MainActor func testLegacyPencilDraftMigratesWithoutChangingInkAndTemplateHistoryRoundTrips() throws {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("drawing-test-\(UUID()).pkdrawing")
        defer { try? FileManager.default.removeItem(at: url) }
        let original = drawing()
        try original.dataRepresentation().write(to: url)
        let board = DrawingModel(storageURL: url)
        XCTAssertEqual(board.canvas.drawing.bounds, original.bounds)
        board.canvas.undoManager?.groupsByEvent = false
        board.canvas.undoManager?.beginUndoGrouping()
        board.selectTemplate("alphabet:Aa")
        board.canvas.undoManager?.endUndoGrouping()
        XCTAssertTrue(board.canvas.drawing.strokes.isEmpty)
        XCTAssertEqual(board.templateID, "alphabet:Aa")
        board.undo()
        XCTAssertNil(board.templateID)
        XCTAssertEqual(board.canvas.drawing.bounds, original.bounds)
        board.redo()
        let restored = DrawingModel(storageURL: url)
        XCTAssertEqual(restored.templateID, "alphabet:Aa")
        XCTAssertTrue(restored.canvas.drawing.strokes.isEmpty)
        XCTAssertEqual(board.colors.count, 12)
        board.selectTool(.marker)
        board.width = 48
        board.updateTool()
        let marker = try XCTUnwrap(board.canvas.tool as? PKInkingTool)
        XCTAssertEqual(marker.inkType, .marker)
        XCTAssertEqual(marker.width, 48)
        XCTAssertEqual(board.canvas.drawingPolicy, .anyInput)
    }

    @MainActor func testGridNeverChangesExportAndClearRetainsTheGuide() throws {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("drawing-test-\(UUID()).pkdrawing")
        defer { try? FileManager.default.removeItem(at: url) }
        let board = DrawingModel(storageURL: url)
        board.selectTemplate("numbers:0")
        board.canvas.drawing = drawing()
        board.clear()
        XCTAssertEqual(board.templateID, "numbers:0")
        let plain = try Data(contentsOf: XCTUnwrap(board.exportPNG()))
        board.showGrid = true
        XCTAssertEqual(try Data(contentsOf: XCTUnwrap(board.exportPNG())), plain)
    }
    @MainActor func testDraftSurvivesRecreationAndCorruptDraftFallsBackSafely() throws {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("drawing-test-\(UUID()).pkdrawing")
        defer { try? FileManager.default.removeItem(at: url) }
        let board = DrawingModel(storageURL: url)
        board.canvas.drawing = drawing()
        board.drawingChanged()
        let restored = DrawingModel(storageURL: url)
        XCTAssertEqual(restored.canvas.drawing.strokes.count, 1)
        XCTAssertEqual(restored.canvas.drawing.bounds, board.canvas.drawing.bounds)
        try Data("not a drawing".utf8).write(to: url)
        XCTAssertTrue(DrawingModel(storageURL: url).canvas.drawing.strokes.isEmpty)
    }
    @MainActor func testClearCanUndoAndRedoWithoutLosingSavedDraft() throws {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("drawing-test-\(UUID()).pkdrawing")
        defer { try? FileManager.default.removeItem(at: url) }
        let board = DrawingModel(storageURL: url)
        let undo = try XCTUnwrap(board.canvas.undoManager)
        undo.groupsByEvent = false
        board.canvas.drawing = drawing()
        board.drawingChanged()
        undo.beginUndoGrouping()
        board.clear()
        undo.endUndoGrouping()
        XCTAssertTrue(board.canvas.drawing.strokes.isEmpty)
        XCTAssertTrue(board.canUndo)
        board.undo()
        XCTAssertEqual(board.canvas.drawing.strokes.count, 1)
        XCTAssertTrue(board.canRedo)
        board.redo()
        XCTAssertTrue(board.canvas.drawing.strokes.isEmpty)
        XCTAssertTrue(DrawingModel(storageURL: url).canvas.drawing.strokes.isEmpty)
    }
    @MainActor func testPNGUsesStablePaperSizeAndWhiteBackground() throws {
        let board = DrawingModel(storageURL: FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString))
        board.canvas.drawing = drawing()
        let url = try XCTUnwrap(board.exportPNG())
        let image = try XCTUnwrap(UIImage(contentsOfFile: url.path)?.cgImage)
        XCTAssertEqual(image.width, 2000)
        XCTAssertEqual(image.height, 1400)
        XCTAssertEqual(DrawingModel.paper, CGSize(width: 1000, height: 700))
        let bytes = try XCTUnwrap(image.dataProvider?.data)
        let pixel = try XCTUnwrap(CFDataGetBytePtr(bytes))
        XCTAssertEqual(pixel[0], 255)
        XCTAssertEqual(pixel[1], 255)
        XCTAssertEqual(pixel[2], 255)
    }
    @MainActor func testMultiStrokeDraftRoundTripsAsOneCompleteDrawing() throws {
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("drawing-test-\(UUID()).pkdrawing")
        defer { try? FileManager.default.removeItem(at: url) }
        let board = DrawingModel(storageURL: url)
        let base = drawing().strokes[0]
        let strokes = (0..<1200).map { i in
            PKStroke(ink: base.ink, path: base.path, transform: CGAffineTransform(translationX: CGFloat(i % 100), y: CGFloat(i / 100)))
        }
        board.canvas.drawing = PKDrawing(strokes: strokes)
        board.save()
        let bytes = try Data(contentsOf: url)
        XCTAssertGreaterThan(bytes.count, 1024)
        XCTAssertNil(board.saveError)
        let restored = DrawingModel(storageURL: url)
        XCTAssertEqual(restored.canvas.drawing.strokes.count, strokes.count)
        XCTAssertEqual(restored.canvas.drawing.bounds, board.canvas.drawing.bounds)
    }
    private func drawing() -> PKDrawing {
        let points = [CGPoint(x: 120,y: 140), CGPoint(x: 600,y: 300)].enumerated().map { i, p in PKStrokePoint(location: p, timeOffset: Double(i), size: CGSize(width: 10, height: 10), opacity: 1, force: 1, azimuth: 0, altitude: .pi / 2) }
        return PKDrawing(strokes: [PKStroke(ink: PKInk(.pen, color: .red), path: PKStrokePath(controlPoints: points, creationDate: Date()))])
    }
}

package com.feiwenchao.kidsprout

import org.junit.Assert.*
import org.junit.Test
import kotlin.random.Random

class ModelsTest {
    @Test fun fruitCountsDistinctTouchesInAnyOrder() {
        val counter = FruitCounter(4)
        assertEquals(1, counter.touch(3))
        assertEquals(2, counter.touch(0))
        assertEquals(2, counter.touch(3))
        assertEquals(2, counter.touch(99))
        assertEquals(3, counter.touch(2))
        assertEquals(4, counter.touch(1))
        assertEquals(0, FruitCounter(0).touch(0))
    }

    @Test fun incorrectAnswersRetryCorrectAnswersLockUntilExplicitNext() {
        val session = GameSession(GameKind.FRUIT, Random(13))
        assertFalse(session.answer(-1))
        assertFalse(session.solved)
        assertEquals(0, session.round)
        assertFalse(session.next())
        assertTrue(session.answer(session.question.answer))
        assertTrue(session.solved)
        assertFalse(session.answer(session.question.answer))
        assertEquals(0, session.round)
        assertTrue(session.next())
        assertEquals(1, session.round)
        assertFalse(session.solved)
    }

    @Test fun everyGameHasFiveRoundsAndOnlyOneAward() {
        GameKind.entries.forEach { kind ->
            val session = GameSession(kind, Random(42))
            repeat(5) { index ->
                assertEquals(index, session.round)
                assertFalse(session.claimReward())
                assertTrue(session.answer(session.question.answer))
                session.next()
            }
            assertTrue(session.finished)
            assertTrue(session.claimReward())
            assertFalse(session.claimReward())
            assertFalse(session.next())
            assertFalse(session.answer(session.question.answer))
        }
    }

    @Test fun generatedQuestionsHaveUniqueChoicesAndUnambiguousComparisons() {
        GameKind.entries.forEach { kind ->
            repeat(100) { seed ->
                val q = GameSession(kind, Random(seed)).question
                assertEquals(q.options.size, q.options.distinct().size)
                assertTrue(q.options.contains(q.answer))
                assertTrue(q.left in 0..10)
                assertTrue(q.right in 0..10)
                if (kind == GameKind.COMPARE) {
                    assertNotEquals(q.left, q.right)
                    assertEquals(if (q.left > q.right) 0 else 1, q.answer)
                }
            }
        }
    }

    @Test fun progressFiltersUnknownLessonsAndDoesNotTreatAwardsAsLessons() {
        val progress = ProgressCodec.decode("""{"version":1,"learned":[0,3,3,10,-1,11,"bad"],"stars":7,"speech":false,"lastNumber":3}""")
        assertEquals(setOf(0,3,10), progress.learned)
        assertEquals(7, progress.stars)
        assertFalse(progress.speech)
        assertEquals(3, progress.lastNumber)
        assertEquals(progress, ProgressCodec.decode(ProgressCodec.encode(progress)))
    }

    @Test fun damagedAndFutureStorageSafelyFallsBack() {
        listOf("bad", "[]", "null", "{\"version\":99}").forEach {
            assertEquals(Progress(), ProgressCodec.decode(it))
        }
        val progress = ProgressCodec.decode("""{"version":1,"stars":-3,"learned":{},"lastNumber":99}""")
        assertEquals(0, progress.stars)
        assertEquals(0, progress.lastNumber)
        assertEquals(emptySet<Int>(), progress.learned)
    }

    private fun stroke(x: Float = .1f, eraser: Boolean = false) =
        InkStroke(listOf(InkPoint(x,.2f), InkPoint(.6f,.8f)), 0xff174b35, .012f, eraser)

    @Test fun drawingUndoRedoAndClearPreserveWholeActions() {
        val history = DrawingHistory()
        history.add(stroke())
        history.add(stroke(.3f, true))
        assertEquals(2, history.strokes.size)
        history.undo()
        assertEquals(1, history.strokes.size)
        history.redo()
        assertEquals(2, history.strokes.size)
        history.clear()
        assertTrue(history.strokes.isEmpty())
        history.undo()
        assertEquals(2, history.strokes.size)
        history.undo()
        history.add(stroke(.4f))
        assertFalse(history.canRedo)
    }

    @Test fun normalizedDrawingDraftRoundTripsAndRejectsCorruptStrokes() {
        val original = listOf(stroke(),stroke(.3f,true))
        assertEquals(original, DrawingCodec.decode(DrawingCodec.encode(original)))
        assertTrue(DrawingCodec.decode("not json").isEmpty())
        assertTrue(DrawingCodec.decode("""{"version":2,"strokes":[]}""").isEmpty())
        val malformed = """{"version":1,"strokes":[{"points":[{"x":4,"y":0.2}],"color":1,"width":0.01,"eraser":false}]}"""
        assertTrue(DrawingCodec.decode(malformed).isEmpty())
    }

    @Test fun drawingLimitRejectsOnlyTheNewStrokeAndKeepsSavedArtwork() {
        val dot=InkStroke(listOf(InkPoint(.5f,.5f)),0xff386746,.01f,false)
        val history=DrawingHistory(List(9_999){dot})
        history.add(dot)
        assertEquals(10_000,history.strokes.size)
        history.add(dot)
        assertEquals(10_000,history.strokes.size)
        listOf(10_000,10_001).forEach {count ->
            val oldDraft=List(count){dot}
            assertEquals(oldDraft,DrawingCodec.decode(DrawingCodec.encode(oldDraft)))
        }
    }
}

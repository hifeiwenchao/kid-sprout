package com.feiwenchao.kidsprout

import org.junit.Assert.*
import org.junit.Test
import java.io.File

class ParityTest {
    private fun asset(name: String) = File("../../shared/$name").readText()
    @Test fun completeOfflineCatalogAndIntersectionFilters() {
        val library = ActivityLibrary.decode(asset("activities.json"))
        assertEquals(60, library.games.size)
        listOf("numbers", "pinyin", "alphabet").forEach { subject ->
            assertEquals(20, library.filter(subject = subject).size)
        }
        val game = library.games.first { it.subject == "alphabet" && it.category == "listen" }
        assertTrue(library.filter("alphabet", "listen", game.title).contains(game))
        assertTrue(library.filter("numbers", "listen", game.title).isEmpty())
        assertTrue(library.filter(query = "没有这样的游戏").isEmpty())
        assertEquals(8, library.games.first().sets.size)
    }
    @Test fun allOfflineRoundsRemainSolvableAndAwardsAreExplicitOnce() {
        ActivityLibrary.decode(asset("activities.json")).games.forEach { game ->
            game.sets.forEach { rounds ->
                val session = ActivitySession(rounds)
                rounds.forEachIndexed { index, round ->
                    assertEquals(index, session.index)
                    assertFalse(session.advance())
                    assertFalse(session.claimReward())
                    if (round.mode in listOf("memory", "trace")) session.completeInteraction()
                    else assertTrue("${game.id}: ${round.id}", session.submit(round.answer))
                    assertFalse(session.submit(round.answer))
                    assertTrue(session.advance())
                }
                assertTrue(session.completed)
                assertEquals(game.type != "trace", session.claimReward())
                assertFalse(session.claimReward())
            }
        }
    }
    @Test fun sequenceOrderMultiSelectRetryMemoryAndBalloonState() {
        val sequence = ActivityRound("s", "sequence", "组合", listOf("a", "b"), emptyList())
        val session = ActivitySession(listOf(sequence))
        assertFalse(session.submit(listOf("b", "a")))
        assertFalse(session.solved)
        assertTrue(session.submit(listOf("a", "b")))
        val select = ActivitySession(listOf(sequence.copy(mode = "select")))
        assertTrue(select.submit(listOf("b", "a")))
        val memory = MemoryPairs(listOf(ActivityChoice("a","2",match="2"),ActivityChoice("b","★★",match="2"),ActivityChoice("c","3",match="3"),ActivityChoice("d","★★★",match="3")))
        assertFalse(memory.tap("a")); assertFalse(memory.tap("c")); assertEquals(2, memory.visible.size)
        memory.hideMismatch(); assertTrue(memory.visible.isEmpty())
        memory.tap("a"); assertTrue(memory.tap("b")); assertEquals(2,memory.matched.size)
        memory.tap("c"); memory.tap("d"); assertTrue(memory.complete)
        val balloons = BalloonOrder(listOf("1","2","3"))
        assertFalse(balloons.tap("2")); assertTrue(balloons.tap("1")); assertFalse(balloons.tap("1"))
        assertTrue(balloons.tap("2")); assertTrue(balloons.tap("3")); assertTrue(balloons.complete)
    }
    @Test fun curriculumIncludesRealThreeSubjectsAndArt() {
        val c = Curriculum.decode(asset("curriculum.json"))
        assertEquals(11,c.numbers.size); assertEquals(47,c.pinyin.items.size)
        assertEquals(14,c.pinyin.lessons.size); assertEquals("y w",c.pinyin.lessons[8].title)
        assertEquals(26,c.alphabet.letters.size); assertEquals(4,c.alphabet.groups.size)
        assertTrue(c.memoryScenes.size >= 84); assertEquals(37,c.tracingTemplates.size)
        assertTrue(c.pinyin.items.first{it.symbol=="o"}.referenceNote.orEmpty().contains("多音字"))
    }
    @Test fun oldProgressAndDrawingPreserveNewFieldsAndTemplateHistory() {
        val old = ProgressCodec.decode("""{"version":1,"learned":[0,2],"stars":4,"lastNumber":2}""")
        assertEquals(setOf(0,2),old.learned); assertTrue(old.learnedPinyin.isEmpty())
        val enriched = old.copy(learnedPinyin=setOf("lesson-1","lesson-8"),learnedLetters=setOf("A","Z"),lastPinyin="lesson-8",lastLetter="Z",visitDates=setOf("2026-11-18"))
        assertEquals(enriched,ProgressCodec.decode(ProgressCodec.encode(enriched)))
        val invalid = ProgressCodec.decode("""{"version":1,"learnedPinyin":["bad","lesson-1"],"learnedLetters":["bad","A"],"lastLetter":"bad"}""")
        assertEquals(setOf("lesson-1"),invalid.learnedPinyin);assertEquals(setOf("A"),invalid.learnedLetters);assertEquals("A",invalid.lastLetter)
        val ink = InkStroke(listOf(InkPoint(.1f,.2f)),0xff112233,.01f,false, .35f)
        val history = DrawingHistory(listOf(ink))
        history.selectTemplate("alphabet:Aa")
        assertTrue(history.strokes.isEmpty());assertEquals("alphabet:Aa",history.template)
        history.undo();assertEquals(listOf(ink),history.strokes);assertNull(history.template)
        history.redo();assertEquals("alphabet:Aa",history.template)
        val document = DrawingDocument(history.strokes,history.template)
        assertEquals(document,DrawingCodec.decodeDocument(DrawingCodec.encodeDocument(document)))
        assertEquals(1f,DrawingCodec.decode("""{"version":1,"strokes":[{"points":[{"x":0.2,"y":0.3}],"color":1,"width":0.01,"eraser":false}]}""").first().opacity)
    }
    @Test fun legacySquareDraftKeepsItsGeometryThroughTemplateUndoAndRestart() {
        val old=DrawingCodec.decodeDocument("""{"version":1,"strokes":[{"points":[{"x":0.2,"y":0.3}],"color":1,"width":0.01,"eraser":false}]}""")
        assertEquals(1000,old.paperWidth);assertEquals(1000,old.paperHeight)
        val history=DrawingHistory(old.strokes,old.template,old.paperWidth,old.paperHeight)
        history.selectTemplate("numbers:0");assertEquals(700,history.paperHeight)
        history.undo();assertEquals(1000,history.paperHeight);assertEquals(old.strokes,history.strokes)
        val saved=DrawingDocument(history.strokes,history.template,history.paperWidth,history.paperHeight)
        assertEquals(saved,DrawingCodec.decodeDocument(DrawingCodec.encodeDocument(saved)))
        assertEquals(700,DrawingCodec.decodeDocument("{}").paperHeight)
    }
    @Test fun continueLearningFindsFirstUnlearnedAndAchievementsMatchTheEightWebBadges() {
        val curriculum=Curriculum.decode(asset("curriculum.json"))
        val p=Progress(learned=setOf(0,2),learnedPinyin=setOf("lesson-1","lesson-3"),learnedLetters=setOf("A","C"))
        assertEquals(1,curriculum.nextNumber(p));assertEquals("lesson-2",curriculum.nextPinyin(p).id);assertEquals("B",curriculum.nextLetter(p).id)
        assertEquals(8,achievements(p).size)
        assertEquals(3,achievements(p).count{it.earned})
        val completed=p.copy(learned=(0..10).toSet(),learnedPinyin=(1..14).map{"lesson-$it"}.toSet(),learnedLetters=('A'..'Z').map{it.toString()}.toSet(),stars=1)
        assertTrue(achievements(completed).all{it.earned})
        assertEquals(0,curriculum.nextNumber(completed));assertEquals("lesson-1",curriculum.nextPinyin(completed).id);assertEquals("A",curriculum.nextLetter(completed).id)
    }
    @Test fun drumCannotBeAnsweredBeforeAFullListenOrSilentHintAndLocksDuringPlayback() {
        val listening=DrumListening()
        assertFalse(listening.canAnswer);assertTrue(listening.start());assertFalse(listening.start())
        listening.showHint();assertFalse(listening.canAnswer)
        listening.finish();assertTrue(listening.canAnswer)
        assertTrue(listening.start());assertFalse(listening.canAnswer);listening.finish();assertTrue(listening.canAnswer)
        val silent=DrumListening();silent.showHint();assertTrue(silent.canAnswer)
    }
}

package com.feiwenchao.kidsprout

import org.junit.Assert.assertEquals
import org.junit.Test

class RecentGamesTest {
    private val allowed = setOf("numbers-count", "pinyin-listen", "alphabet-match", "numbers-train")

    @Test fun invalidOrRepeatedSavedGamesAreFilteredAndBounded() {
        assertEquals(emptyList<String>(), RecentGames.restore(null, allowed))
        assertEquals(listOf("numbers-count", "alphabet-match", "pinyin-listen"),
            RecentGames.restore("removed|numbers-count|numbers-count|alphabet-match|pinyin-listen|numbers-train", allowed))
    }

    @Test fun reopeningMovesGameToFrontAndRetainsOnlyThree() {
        val old = listOf("numbers-count", "pinyin-listen", "alphabet-match")
        assertEquals(listOf("alphabet-match", "numbers-count", "pinyin-listen"), RecentGames.record(old, "alphabet-match", allowed))
        assertEquals(listOf("numbers-train", "numbers-count", "pinyin-listen"), RecentGames.record(old, "numbers-train", allowed))
        assertEquals(old, RecentGames.record(old, "unknown", allowed))
    }
}

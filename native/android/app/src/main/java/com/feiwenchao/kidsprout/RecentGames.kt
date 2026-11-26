package com.feiwenchao.kidsprout

/** Independent of learning progress: visiting a game never completes a lesson. */
object RecentGames {
    fun restore(raw: String?, allowedIds: Set<String>): List<String> =
        raw.orEmpty().split('|').filter { it in allowedIds }.distinct().take(3)

    fun record(ids: List<String>, id: String, allowedIds: Set<String>): List<String> =
        if (id !in allowedIds) restore(ids.joinToString("|"), allowedIds)
        else (listOf(id) + ids).filter { it in allowedIds }.distinct().take(3)
}

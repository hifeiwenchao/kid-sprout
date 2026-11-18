package com.feiwenchao.kidsprout

import com.google.gson.Gson
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import kotlin.random.Random

class FruitCounter(private val count: Int) {
    private val touched = mutableSetOf<Int>()
    fun touch(index: Int): Int {
        if (index in 0 until count) touched.add(index)
        return touched.size
    }
}

enum class GameKind(val title: String, val description: String) {
    FRUIT("数一数水果", "点点水果，再找到它的数量"),
    FIND("寻找数字", "听一听，找找数字朋友"),
    COMPARE("比比多少", "两篮水果，哪边更多呢？")
}
data class Question(val left: Int, val right: Int, val answer: Int, val options: List<Int>)
class GameSession(val kind: GameKind, private val random: Random = Random.Default) {
    var round = 0; private set
    var solved = false; private set
    var finished = false; private set
    private var awarded = false
    var question = makeQuestion(); private set
    private fun makeQuestion(): Question {
        val target = random.nextInt(0,11)
        return when (kind) {
            GameKind.COMPARE -> {
                val right = (0..10).filter { it != target }.random(random)
                Question(target,right,if (target > right) 0 else 1,listOf(0,1))
            }
            else -> Question(target,0,target,
                ((0..10).filter { it != target }.shuffled(random).take(3) + target).shuffled(random))
        }
    }
    fun answer(value: Int): Boolean {
        if (finished || solved || value != question.answer) return false
        solved = true
        return true
    }
    fun next(): Boolean {
        if (finished || !solved) return false
        if (round == 4) finished = true
        else { round++; solved = false; question = makeQuestion() }
        return true
    }
    fun claimReward(): Boolean {
        if (!finished || awarded) return false
        awarded = true
        return true
    }
}

data class Progress(val learned: Set<Int> = emptySet(), val stars: Int = 0,
                    val speech: Boolean = true, val lastNumber: Int = 0,
                    val learnedPinyin:Set<String> = emptySet(), val learnedLetters:Set<String> = emptySet(),
                    val lastPinyin:String="lesson-1", val lastLetter:String="A",val visitDates:Set<String> = emptySet())
private fun JsonElement?.integer(): Long? = runCatching {
    this?.takeIf { it.isJsonPrimitive && it.asJsonPrimitive.isNumber }?.asString?.toLongOrNull()
}.getOrNull()
private fun JsonElement?.decimal(): Float? = runCatching {
    this?.takeIf { it.isJsonPrimitive && it.asJsonPrimitive.isNumber }?.asFloat?.takeIf { it.isFinite() }
}.getOrNull()
private fun JsonElement?.boolean(): Boolean? = runCatching {
    this?.takeIf { it.isJsonPrimitive && it.asJsonPrimitive.isBoolean }?.asBoolean
}.getOrNull()
private fun parseObject(raw: String): JsonObject? = runCatching {
    JsonParser.parseString(raw).takeIf { it.isJsonObject }?.asJsonObject
}.getOrNull()
object ProgressCodec {
    private val pinyin=(1..14).map{"lesson-$it"}.toSet()
    private val letters=('A'..'Z').map{it.toString()}.toSet()
    private fun strings(obj:JsonObject,key:String,allowed:Set<String>?=null):Set<String> = obj[key]?.takeIf{it.isJsonArray}?.asJsonArray?.mapNotNull {
        runCatching { it.takeIf{v -> v.isJsonPrimitive && v.asJsonPrimitive.isString}?.asString }.getOrNull()
    }?.filter { allowed==null || it in allowed }?.toSet() ?: emptySet()
    private fun string(obj:JsonObject,key:String,allowed:Set<String>,fallback:String)=runCatching{obj[key].asString.takeIf{it in allowed}}.getOrNull()?:fallback
    fun decode(raw: String): Progress {
        val obj = parseObject(raw) ?: return Progress()
        if (obj["version"].integer() != 1L) return Progress()
        val learned = obj["learned"]?.takeIf { it.isJsonArray }?.asJsonArray
            ?.mapNotNull { it.integer()?.takeIf { v -> v in 0..10 }?.toInt() }?.toSet() ?: emptySet()
        return Progress(learned, obj["stars"].integer()?.takeIf { it in 0..1_000_000 }?.toInt() ?: 0,
            obj["speech"].boolean() ?: true,
            obj["lastNumber"].integer()?.takeIf { it in 0..10 }?.toInt() ?: 0,
            strings(obj,"learnedPinyin",pinyin),strings(obj,"learnedLetters",letters),
            string(obj,"lastPinyin",pinyin,"lesson-1"),string(obj,"lastLetter",letters,"A"),
            strings(obj,"visitDates").filter { it.matches(Regex("\\d{4}-\\d{2}-\\d{2}")) }.toSet())
    }
    fun encode(progress: Progress): String = Gson().toJson(mapOf("version" to 1,
        "learned" to progress.learned.sorted(), "stars" to progress.stars,
        "speech" to progress.speech, "lastNumber" to progress.lastNumber,
        "learnedPinyin" to progress.learnedPinyin.sorted(),"learnedLetters" to progress.learnedLetters.sorted(),
        "lastPinyin" to progress.lastPinyin,"lastLetter" to progress.lastLetter,"visitDates" to progress.visitDates.sorted()))
}

data class InkPoint(val x: Float, val y: Float)
data class InkStroke(val points: List<InkPoint>, val color: Long, val width: Float, val eraser: Boolean,val opacity:Float=1f)
data class DrawingDocument(val strokes:List<InkStroke> = emptyList(),val template:String?=null,val paperWidth:Int=1000,val paperHeight:Int=700)
class DrawingHistory(initial: List<InkStroke> = emptyList(),initialTemplate:String?=null,initialPaperWidth:Int=1000,initialPaperHeight:Int=700) {
    companion object { const val MAX_STROKES = 10_000 }
    var strokes: List<InkStroke> = initial.toList(); private set
    var template:String?=initialTemplate;private set
    var paperWidth=initialPaperWidth;private set
    var paperHeight=initialPaperHeight;private set
    private val past = ArrayDeque<DrawingDocument>()
    private val future = ArrayDeque<DrawingDocument>()
    val canRedo get() = future.isNotEmpty()
    val canUndo get() = past.isNotEmpty()
    val canAdd get() = strokes.size < MAX_STROKES
    private fun remember() {
        past.addLast(document())
        if (past.size > 100) past.removeFirst()
        future.clear()
    }
    fun add(stroke: InkStroke): Boolean {
        if (stroke.points.isEmpty() || !canAdd) return false
        remember(); strokes = strokes + stroke.copy(points = stroke.points.toList())
        return true
    }
    fun undo() {
        if (!canUndo) return
        future.addLast(document()); restore(past.removeLast())
    }
    fun redo() {
        if (!canRedo) return
        past.addLast(document()); restore(future.removeLast())
    }
    fun clear() {
        if (strokes.isEmpty()) return
        remember(); strokes = emptyList()
    }
    fun selectTemplate(id:String?) {
        if(template==id) return
        remember();template=id;strokes=emptyList();paperWidth=1000;paperHeight=700
    }
    fun document()=DrawingDocument(strokes.toList(),template,paperWidth,paperHeight)
    private fun restore(document:DrawingDocument){strokes=document.strokes;template=document.template;paperWidth=document.paperWidth;paperHeight=document.paperHeight}
}
object DrawingCodec {
    fun encode(strokes: List<InkStroke>): String = Gson().toJson(mapOf("version" to 1, "strokes" to strokes))
    fun encodeDocument(document:DrawingDocument):String=Gson().toJson(mapOf("version" to 1,"strokes" to document.strokes,"template" to document.template,"paperWidth" to document.paperWidth,"paperHeight" to document.paperHeight))
    fun decodeDocument(raw:String):DrawingDocument {
        val obj=parseObject(raw)
        val template=runCatching{obj?.get("template")?.asString?.takeIf{it.matches(Regex("numbers:(10|[0-9])|alphabet:[A-Z][a-z]"))}}.getOrNull()
        val strokes=decode(raw)
        val width=obj?.get("paperWidth").integer()?.takeIf{it==1000L}?.toInt()?:1000
        // The first Android release used square paper. Preserve those drawings
        // until the user deliberately switches to a new tracing template.
        val height=obj?.get("paperHeight").integer()?.takeIf{it in listOf(700L,1000L)}?.toInt()?:if(strokes.isNotEmpty())1000 else 700
        return DrawingDocument(strokes,template,width,height)
    }
    fun decode(raw: String): List<InkStroke> {
        val obj = parseObject(raw) ?: return emptyList()
        if (obj["version"].integer() != 1L) return emptyList()
        val items = obj["strokes"]?.takeIf { it.isJsonArray }?.asJsonArray ?: return emptyList()
        // Keep existing valid artwork even when an older version saved more than
        // today's creation limit. DrawingHistory refuses new strokes at the limit.
        return items.mapNotNull { element ->
            runCatching {
                val stroke = element.asJsonObject
                val width = stroke["width"].decimal()?.takeIf { it in .001f..0.1f } ?: return@mapNotNull null
                val color = stroke["color"].integer()?.takeIf { it in 0L..0xffffffffL } ?: return@mapNotNull null
                val eraser = stroke["eraser"].boolean() ?: return@mapNotNull null
                val rawPoints = stroke["points"].asJsonArray
                if (rawPoints.size() !in 1..20_000) return@mapNotNull null
                val points = rawPoints.map { point ->
                    val p = point.asJsonObject
                    val x = p["x"].decimal()?.takeIf { it in 0f..1f } ?: return@mapNotNull null
                    val y = p["y"].decimal()?.takeIf { it in 0f..1f } ?: return@mapNotNull null
                    InkPoint(x,y)
                }
                InkStroke(points,color,width,eraser,stroke["opacity"].decimal()?.takeIf{it in .01f..1f} ?: 1f)
            }.getOrNull()
        }
    }
}

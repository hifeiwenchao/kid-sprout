package com.feiwenchao.kidsprout

import android.app.Application
import android.content.ClipData
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Path
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.util.AtomicFile
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.core.content.FileProvider
import androidx.core.content.edit
import androidx.core.graphics.createBitmap
import androidx.core.net.toUri
import androidx.lifecycle.AndroidViewModel
import com.google.gson.JsonParser
import java.io.File
import java.util.Locale
import java.util.concurrent.Executors

data class NumberLesson(val value: Int, val name: String)
enum class Page(val label: String) { HOME("探索"), NUMBERS("数字"), GAMES("游戏"), DRAWING("画板"), PARENTS("家长") }

class AppState(application: Application) : AndroidViewModel(application) {
    private val prefs = application.getSharedPreferences("sprout-native-v1", 0)
    private val draftFile = AtomicFile(File(application.filesDir,"drawing-v1.json"))
    private val writer = Executors.newSingleThreadExecutor()
    private val mainHandler = Handler(Looper.getMainLooper())
    var progress by mutableStateOf(ProgressCodec.decode(runCatching { prefs.getString("progress", "") ?: "" }.getOrDefault(""))); private set
    var page by mutableStateOf(Page.HOME)
    var selectedNumber by mutableIntStateOf(progress.lastNumber); private set
    var session by mutableStateOf<GameSession?>(null); private set
    var gameRevision by mutableIntStateOf(0); private set
    var drawingRevision by mutableIntStateOf(0); private set
    var drawingStatus by mutableStateOf("画作自动保存在这台设备"); private set
    var speechStatus by mutableStateOf("语音准备中，也可以看图学习"); private set
    var message by mutableStateOf<String?>(null)
    private var speechReady = false
    private var speaker: TextToSpeech? = null
    val curriculum = runCatching {
        val content = application.assets.open("curriculum.json").bufferedReader().use { it.readText() }
        val root = JsonParser.parseString(content).asJsonObject
        require(root["schemaVersion"].asInt == 1)
        root["numbers"].asJsonArray.map {
            NumberLesson(it.asJsonObject["value"].asInt,it.asJsonObject["name"].asString)
        }.also { lessons -> require(lessons.map { it.value } == (0..10).toList()) }
    }.getOrElse {
        listOf("零","一","二","三","四","五","六","七","八","九","十")
            .mapIndexed { value,name -> NumberLesson(value,name) }
    }
    val drawing = DrawingHistory(runCatching {
        DrawingCodec.decode(String(draftFile.readFully(),Charsets.UTF_8))
    }.getOrDefault(emptyList()))

    init {
        if (!drawing.canAdd) drawingStatus = "画纸笔数已满，请先分享或清空后继续"
        speaker = TextToSpeech(application) { status ->
            val tts = speaker
            if (status == TextToSpeech.SUCCESS && tts != null) {
                val voice = tts.voices?.firstOrNull {
                    it.locale.language == "zh" && !it.isNetworkConnectionRequired
                }
                speechReady = voice != null
                if (voice != null) {
                    tts.voice = voice
                    tts.setSpeechRate(.85f)
                    speechStatus = "使用设备上的离线中文语音"
                } else speechStatus = "未找到离线中文声音，文字和图形照常使用"
            } else speechStatus = "当前设备的语音不可用，文字和图形照常使用"
        }
    }
    private fun saveProgress() { prefs.edit { putString("progress",ProgressCodec.encode(progress)) } }
    fun selectNumber(value: Int) {
        if (value !in 0..10) return
        selectedNumber = value
        progress = progress.copy(lastNumber = value)
        saveProgress()
    }
    fun markLearned() {
        progress = progress.copy(learned = progress.learned + selectedNumber)
        saveProgress()
    }
    fun setSpeech(enabled: Boolean) {
        progress = progress.copy(speech = enabled)
        saveProgress()
        if (!enabled) speaker?.stop()
    }
    fun say(text: String) {
        if (progress.speech && speechReady) speaker?.speak(text,TextToSpeech.QUEUE_FLUSH,null,"sprout")
    }
    fun stopSpeech() { speaker?.stop() }
    fun startGame(kind: GameKind) { session = GameSession(kind); gameRevision++ }
    fun answer(value: Int): Boolean {
        val accepted = session?.answer(value) == true
        gameRevision++
        if (accepted) say("答对啦，真棒")
        return accepted
    }
    fun nextRound() {
        val game = session ?: return
        game.next()
        if (game.claimReward()) {
            progress = progress.copy(stars = (progress.stars + 1).coerceAtMost(1_000_000))
            saveProgress()
        }
        gameRevision++
    }
    fun leaveGame() { session = null; gameRevision++ }
    fun addStroke(stroke: InkStroke) {
        if (!drawing.canAdd) {
            drawingStatus = "画纸笔数已满，刚才这笔未保存"
            message = "这张画纸已经画了很多笔。已有画作会保留，请家长先分享图片，或撤销、清空后继续画。"
            return
        }
        editDrawing { add(stroke) }
    }
    fun editDrawing(action: DrawingHistory.() -> Unit) {
        drawing.action()
        drawingRevision++
        val strokes = drawing.strokes
        drawingStatus = "正在保存画作…"
        writer.execute {
            var stream: java.io.FileOutputStream? = null
            val result = runCatching {
                val encoded = DrawingCodec.encode(strokes)
                stream = draftFile.startWrite()
                stream!!.write(encoded.toByteArray(Charsets.UTF_8))
                draftFile.finishWrite(stream)
            }
            if (result.isFailure) draftFile.failWrite(stream)
            mainHandler.post {
                drawingStatus = if (result.isSuccess) "画作已自动保存" else "保存失败，请稍后重试或分享图片"
            }
        }
    }
    fun shareDrawing() {
        val strokes = drawing.strokes.toList()
        writer.execute {
            val result = runCatching {
                val bitmap = createBitmap(1400,1400,Bitmap.Config.ARGB_8888)
                val canvas = Canvas(bitmap)
                canvas.drawColor(android.graphics.Color.WHITE)
                val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                    strokeCap = Paint.Cap.ROUND; strokeJoin = Paint.Join.ROUND
                }
                strokes.forEach { stroke ->
                    paint.color = if (stroke.eraser) android.graphics.Color.WHITE else stroke.color.toInt()
                    paint.strokeWidth = stroke.width * 1400
                    if (stroke.points.size == 1) {
                        paint.style = Paint.Style.FILL
                        val p = stroke.points.first()
                        canvas.drawCircle(p.x*1400,p.y*1400,paint.strokeWidth/2,paint)
                    } else {
                        paint.style = Paint.Style.STROKE
                        val path = Path()
                        stroke.points.forEachIndexed { index,p ->
                            if (index == 0) path.moveTo(p.x*1400,p.y*1400) else path.lineTo(p.x*1400,p.y*1400)
                        }
                        canvas.drawPath(path,paint)
                    }
                }
                val folder = File(getApplication<Application>().cacheDir,"artwork").apply { mkdirs() }
                val file = File(folder,"萌芽小画家.png")
                file.outputStream().use { bitmap.compress(Bitmap.CompressFormat.PNG,100,it) }
                bitmap.recycle()
                FileProvider.getUriForFile(getApplication(),"com.feiwenchao.kidsprout.files",file)
            }
            mainHandler.post {
                result.onSuccess { uri ->
                    val app = getApplication<Application>()
                    val send = Intent(Intent.ACTION_SEND).apply {
                        type = "image/png"
                        putExtra(Intent.EXTRA_STREAM,uri)
                        clipData = ClipData.newRawUri("萌芽画作",uri)
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    runCatching { app.startActivity(Intent.createChooser(send,"分享萌芽画作").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) }
                        .onFailure { message = "当前没有可用的分享应用" }
                }.onFailure { message = "图片生成失败，请稍后重试" }
            }
        }
    }
    fun emailAuthor() {
        val intent = Intent(Intent.ACTION_SENDTO, "mailto:hi@feiwenchao.com".toUri())
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        runCatching { getApplication<Application>().startActivity(intent) }
            .onFailure { message = "设备未安装邮件应用，邮箱：hi@feiwenchao.com" }
    }
    override fun onCleared() { speaker?.stop(); speaker?.shutdown(); writer.shutdown() }
}

package com.feiwenchao.kidsprout

import android.app.Application
import android.content.ClipData
import android.content.Intent
import android.graphics.*
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.AtomicFile
import androidx.compose.runtime.*
import androidx.core.content.FileProvider
import androidx.core.content.edit
import androidx.core.net.toUri
import androidx.lifecycle.AndroidViewModel
import java.io.File
import java.time.LocalDate
import java.util.Locale
import java.util.concurrent.Executors
import java.util.concurrent.ConcurrentHashMap
import kotlin.math.exp
import kotlin.math.sin

// All six learning spaces remain available on every screen size.
enum class Page(val label:String,val symbol:String) {
    HOME("探索首页","✦"), NUMBERS("数字乐园","123"), PINYIN("拼音天地","ā"),
    ALPHABET("字母森林","Aa"), DRAWING("小小画板","✎"), GAMES("游戏大厅","✧"), PARENTS("家长说明","♡")
}
class AppState(application:Application):AndroidViewModel(application) {
    private val prefs=application.getSharedPreferences("sprout-native-v1",0)
    private val draftFile=AtomicFile(File(application.filesDir,"drawing-v1.json"))
    private val writer=Executors.newSingleThreadExecutor()
    private val audioWriter=Executors.newSingleThreadExecutor()
    private val main=Handler(Looper.getMainLooper())
    var progress by mutableStateOf(ProgressCodec.decode(prefs.getString("progress","")?:""));private set
    private var currentPage by mutableStateOf(Page.HOME)
    var page:Page
        get()=currentPage
        set(value){if(currentPage!=value){stopSpeech();lessonDialog=null};currentPage=value}
    var lessonDialog by mutableStateOf<String?>(null)
    var selectedNumber by mutableIntStateOf(progress.lastNumber);private set
    var selectedPinyin by mutableStateOf("a");private set
    var selectedLetter by mutableStateOf(progress.lastLetter);private set
    var selectedGame by mutableStateOf<NativeGame?>(null);private set
    var session by mutableStateOf<ActivitySession?>(null);private set
    var gameRevision by mutableIntStateOf(0);private set
    var speechEpoch by mutableIntStateOf(0);private set
    var drawingRevision by mutableIntStateOf(0);private set
    var drawingStatus by mutableStateOf("画作自动保存在这台设备");private set
    var speechStatus by mutableStateOf("正在准备离线声音，文字和图形随时可用");private set
    var message by mutableStateOf<String?>(null)
    private var speaker:TextToSpeech?=null
    private var speechReady=false
    private var utteranceNumber=0
    private val speechCompletions=ConcurrentHashMap<String,()->Unit>()
    @Volatile private var audioTrack:AudioTrack?=null
    @Volatile private var audioGeneration=0
    private var drumCompletion:((Boolean)->Unit)?=null
    val curriculum=Curriculum.decode(application.assets.open("curriculum.json").bufferedReader().use{it.readText()})
    val activities=ActivityLibrary.decode(application.assets.open("activities.json").bufferedReader().use{it.readText()})
    private val allowedGameIds=activities.games.map{it.id}.toSet()
    var recentGameIds by mutableStateOf(RecentGames.restore(prefs.getString("recent-games",null),allowedGameIds));private set
    private val savedDrawing=runCatching{DrawingCodec.decodeDocument(String(draftFile.readFully(),Charsets.UTF_8))}.getOrDefault(DrawingDocument())
    val drawing=DrawingHistory(savedDrawing.strokes,savedDrawing.template,savedDrawing.paperWidth,savedDrawing.paperHeight)
    init {
        selectedPinyin=curriculum.pinyin.lessons.find{it.id==progress.lastPinyin}?.symbols?.first()?:"a"
        progress=progress.copy(visitDates=progress.visitDates+LocalDate.now().toString());saveProgress()
        if(!drawing.canAdd)drawingStatus="画纸笔数已满，请先保存或清空后继续"
        speaker=TextToSpeech(application) { status ->
            speechReady=status==TextToSpeech.SUCCESS
            speechStatus=if(speechReady) "使用设备已安装的离线中文/英语声音" else "设备语音不可用，文字和图形照常使用"
            speaker?.setOnUtteranceProgressListener(object:UtteranceProgressListener(){
                override fun onStart(utteranceId:String?){}
                override fun onDone(utteranceId:String?){finishSpeech(utteranceId)}
                @Deprecated("Android callback") override fun onError(utteranceId:String?){finishSpeech(utteranceId)}
            })
        }
    }
    private fun saveProgress(){prefs.edit{putString("progress",ProgressCodec.encode(progress))}}
    fun selectNumber(value:Int){if(value !in 0..10)return;stopSpeech();selectedNumber=value;progress=progress.copy(lastNumber=value);saveProgress()}
    fun selectPinyin(value:String){if(curriculum.pinyin.items.none{it.symbol==value})return;stopSpeech();selectedPinyin=value;progress=progress.copy(lastPinyin=curriculum.pinyin.lessons.first{value in it.symbols}.id);saveProgress()}
    fun selectLetter(value:String){if(curriculum.alphabet.letters.none{it.id==value})return;stopSpeech();selectedLetter=value;progress=progress.copy(lastLetter=value);saveProgress()}
    fun markLearned(){progress=progress.copy(learned=progress.learned+selectedNumber);saveProgress()}
    fun markPinyin(lessonId:String){if(curriculum.pinyin.lessons.none{it.id==lessonId})return;progress=progress.copy(learnedPinyin=progress.learnedPinyin+lessonId);saveProgress()}
    fun markLetter(){progress=progress.copy(learnedLetters=progress.learnedLetters+selectedLetter);saveProgress()}
    fun setSpeech(enabled:Boolean){progress=progress.copy(speech=enabled);saveProgress();if(!enabled)stopSpeech()}
    private fun finishSpeech(id:String?){id?.let{speechCompletions.remove(it)}?.let{callback->main.post{callback()}}}
    fun say(text:String,language:String="zh-CN",onFinished:(()->Unit)?=null):Boolean {
        if(!progress.speech || !speechReady)return false
        val tts=speaker?:return false
        val locale=Locale.forLanguageTag(language)
        val voices=tts.voices?.filter{it.locale.language==locale.language && !it.isNetworkConnectionRequired}.orEmpty()
        val preferred=listOf("xiaoxiao","xiaoyi","tingting","jenny","aria","samantha")
        val voice=voices.firstOrNull { v -> preferred.any{v.name.contains(it,true)} }?:voices.firstOrNull()
        if(voice==null){speechStatus="设备未安装${if(locale.language=="en")"英语" else "中文"}离线声音，可继续看图学习";return false}
        tts.voice=voice;tts.setSpeechRate(.88f);tts.setPitch(1f)
        speechCompletions.clear()
        val id="sprout-${++utteranceNumber}"
        if(onFinished!=null)speechCompletions[id]=onFinished
        return (tts.speak(text,TextToSpeech.QUEUE_FLUSH,null,id)==TextToSpeech.SUCCESS).also{if(!it)speechCompletions.remove(id)}
    }
    fun stopSpeech(){speechCompletions.clear();speaker?.stop();audioGeneration++;speechEpoch++;drumCompletion?.invoke(false);drumCompletion=null;runCatching{audioTrack?.pause();audioTrack?.flush()}}
    fun playDrums(count:Int,onFinished:(Boolean)->Unit={}) {
        if(!progress.speech){onFinished(false);return}
        val generation=++audioGeneration
        drumCompletion=onFinished
        audioWriter.execute {
            val rate=22050;val spacing=(rate*.6).toInt();val samples=ShortArray(spacing*count.coerceIn(1,10))
            repeat(count.coerceIn(1,10)) { beat ->
                repeat((rate*.22).toInt()) { i ->
                    val t=i.toDouble()/rate
                    samples[beat*spacing+i]=(sin(2*Math.PI*(95*t+12*(1-exp(-25*t))))*exp(-22*t)*26000).toInt().toShort()
                }
            }
            runCatching {
                if(generation!=audioGeneration)return@runCatching
                audioTrack?.release()
                val track=AudioTrack.Builder().setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_GAME).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build())
                    .setAudioFormat(AudioFormat.Builder().setSampleRate(rate).setEncoding(AudioFormat.ENCODING_PCM_16BIT).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).build())
                    .setTransferMode(AudioTrack.MODE_STATIC).setBufferSizeInBytes(samples.size*2).build()
                audioTrack=track;track.write(samples,0,samples.size)
                if(generation==audioGeneration){track.play();main.postDelayed({if(generation==audioGeneration){drumCompletion=null;onFinished(true)}},samples.size*1000L/rate)}
            }.onFailure{main.post{if(generation==audioGeneration){message="声音暂时不可用，可以打开圆点提示继续数。";drumCompletion=null;onFinished(false)}}}
        }
    }
    fun startGame(game:NativeGame){
        if(game.id !in allowedGameIds)return
        recentGameIds=RecentGames.record(recentGameIds,game.id,allowedGameIds)
        prefs.edit{putString("recent-games",recentGameIds.joinToString("|"))}
        stopSpeech();selectedGame=game;session=ActivitySession(game.sets.random());gameRevision++;page=Page.GAMES
    }
    fun submit(values:List<String>):Boolean {val ok=session?.submit(values)==true;gameRevision++;return ok}
    fun completeInteraction(){session?.completeInteraction();gameRevision++}
    fun nextRound(){val s=session?:return;if(s.advance() && s.claimReward()){progress=progress.copy(stars=(progress.stars+1).coerceAtMost(1_000_000));saveProgress()};gameRevision++}
    fun leaveGame(){stopSpeech();session=null;selectedGame=null;gameRevision++}
    fun addStroke(stroke:InkStroke){
        if(!drawing.canAdd){drawingStatus="画纸笔数已满，已有画作已保留";message="请家长先保存画作，或撤销、清空后继续画。";return}
        editDrawing{add(stroke)}
    }
    fun editDrawing(action:DrawingHistory.()->Unit){
        drawing.action();drawingRevision++
        val document=drawing.document()
        drawingStatus="正在保存画作…"
        writer.execute {
            var stream:java.io.FileOutputStream?=null
            val saved=runCatching {
                stream=draftFile.startWrite();stream!!.write(DrawingCodec.encodeDocument(document).toByteArray(Charsets.UTF_8));draftFile.finishWrite(stream)
            }
            if(saved.isFailure)draftFile.failWrite(stream)
            main.post{drawingStatus=if(saved.isSuccess)"画作已自动保存" else "保存失败，请稍后重试或保存 PNG"}
        }
    }
    fun shareDrawing(){
        val document=drawing.document()
        writer.execute {
            val result=runCatching {
                val bitmap=renderDrawing(getApplication(),document,curriculum)
                val folder=File(getApplication<Application>().cacheDir,"artwork").apply{mkdirs()}
                val file=File(folder,"萌呀小画家.png")
                file.outputStream().use{bitmap.compress(Bitmap.CompressFormat.PNG,100,it)};bitmap.recycle()
                FileProvider.getUriForFile(getApplication(),"com.feiwenchao.kidsprout.files",file)
            }
            main.post {
                result.onSuccess{uri ->
                    val send=Intent(Intent.ACTION_SEND).apply{type="image/png";putExtra(Intent.EXTRA_STREAM,uri);clipData=ClipData.newRawUri("萌呀画作",uri);addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)}
                    runCatching{getApplication<Application>().startActivity(Intent.createChooser(send,"保存或分享萌呀画作").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))}.onFailure{message="当前没有可用的分享应用"}
                }.onFailure{message="图片生成失败，请稍后重试"}
            }
        }
    }
    fun emailAuthor(){runCatching{getApplication<Application>().startActivity(Intent(Intent.ACTION_SENDTO,"mailto:service@feiwenchao.com".toUri()).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))}.onFailure{message="设备未安装邮件应用，邮箱：service@feiwenchao.com"}}
    override fun onCleared(){audioGeneration++;speechCompletions.clear();drumCompletion=null;speaker?.stop();speaker?.shutdown();runCatching{audioTrack?.release()};writer.shutdown();audioWriter.shutdown();super.onCleared()}
}

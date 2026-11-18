package com.feiwenchao.kidsprout

import com.google.gson.Gson

data class NumberLesson(val value:Int,val name:String,val motifAsset:String="",val fruit:String="苹果",val unit:String="个")
data class PinyinLesson(val id:String,val number:Int,val unit:Int,val symbols:List<String>,val title:String,
                        val readSyllables:List<String>,val spellings:List<String>,val rule:String)
data class PinyinItem(val symbol:String,val kind:String,val hint:String,val example:String,val examplePinyin:String,val speech:String,val referenceNote:String?=null)
data class PinyinTone(val number:Int,val mark:String,val name:String,val hint:String,val path:String)
data class ContentSource(val title:String,val url:String,val note:String)
data class PinyinContent(val edition:String,val sources:List<ContentSource>,val lessons:List<PinyinLesson>,val items:List<PinyinItem>,val tones:List<PinyinTone>)
data class LetterLesson(val id:String,val uppercase:String,val lowercase:String,val word:String,val translation:String,val emoji:String,val hint:String)
data class LetterGroup(val id:String,val label:String,val letters:List<String>)
data class AlphabetContent(val letters:List<LetterLesson>,val groups:List<LetterGroup>)
data class MemoryScene(val subject:String,val symbol:String,val title:String,val description:String,val frames:List<String>)
data class TracingTemplate(val id:String,val group:String,val label:String,val asset:String)
data class Curriculum(val schemaVersion:Int,val brand:String,val numbers:List<NumberLesson>,val pinyin:PinyinContent,
                      val alphabet:AlphabetContent,val memoryScenes:List<MemoryScene>,val tracingTemplates:List<TracingTemplate>) {
    fun nextNumber(progress:Progress)=numbers.firstOrNull{it.value !in progress.learned}?.value?:0
    fun nextPinyin(progress:Progress)=pinyin.lessons.firstOrNull{it.id !in progress.learnedPinyin}?:pinyin.lessons.first()
    fun nextLetter(progress:Progress)=alphabet.letters.firstOrNull{it.id !in progress.learnedLetters}?:alphabet.letters.first()
    companion object {
        fun decode(raw:String):Curriculum = Gson().fromJson(raw,Curriculum::class.java).also {
            require(it.schemaVersion==1 && it.numbers.map { n -> n.value }==(0..10).toList())
            require(it.pinyin.lessons.size==14 && it.pinyin.items.size==47 && it.alphabet.letters.size==26)
        }
    }
}
data class ActivityChoice(val value:String,val label:String,val small:String?=null,val match:String?=null)
data class ActivityRound(val id:String,val mode:String,val prompt:String,val answer:List<String>,val choices:List<ActivityChoice>,
                         val display:String?=null,val visualText:String?=null,val speech:String?=null,val speechLang:String?=null,
                         val hint:String?=null,val explanation:String?=null,val item:String?=null,val max:Int?=null,
                         val scene:String?=null,val count:Int?=null,val counts:List<Int>?=null,val values:List<Int>?=null)
data class NativeGame(val id:String,val subject:String,val type:String,val title:String,val description:String,
                      val symbol:String,val skill:String,val category:String,val sets:List<List<ActivityRound>>)
data class ActivityLibrary(val schemaVersion:Int,val games:List<NativeGame>) {
    fun filter(subject:String="all",category:String="all",query:String=""):List<NativeGame> {
        val q=query.trim().lowercase()
        return games.filter { (subject=="all" || it.subject==subject) && (category=="all" || it.category==category) &&
            (q.isEmpty() || "${it.title} ${it.description} ${it.skill}".lowercase().contains(q)) }
    }
    companion object {
        fun decode(raw:String):ActivityLibrary=Gson().fromJson(raw,ActivityLibrary::class.java).also {
            require(it.schemaVersion==1 && it.games.size==60 && it.games.map { g -> g.id }.distinct().size==60)
            require(it.games.all { g -> g.sets.size==8 && g.sets.all { rounds -> rounds.isNotEmpty() } })
        }
    }
}
class ActivitySession(val rounds:List<ActivityRound>) {
    init { require(rounds.isNotEmpty()) }
    var index=0; private set
    var solved=false; private set
    var completed=false; private set
    private var awarded=false
    val current get()=rounds[index]
    fun submit(values:List<String>):Boolean {
        if(completed || solved || current.mode in listOf("memory","trace")) return false
        val correct=if(current.mode=="select") values.size==values.distinct().size && values.toSet()==current.answer.toSet()
            else values==current.answer
        if(correct) solved=true
        return correct
    }
    fun completeInteraction():Boolean {
        if(completed || solved || current.mode !in listOf("memory","trace")) return false
        solved=true;return true
    }
    fun advance():Boolean {
        if(completed || !solved) return false
        if(index==rounds.lastIndex) completed=true else {index++;solved=false}
        return true
    }
    fun claimReward():Boolean {
        if(!completed || awarded || rounds.any { it.mode=="trace" }) return false
        awarded=true;return true
    }
}
class MemoryPairs(private val choices:List<ActivityChoice>) {
    var visible=emptySet<String>(); private set
    var matched=emptySet<String>(); private set
    val complete get()=matched.size==choices.size
    val mismatch get()=visible.size==2 && !matched.containsAll(visible)
    fun tap(value:String):Boolean {
        if(mismatch || value in visible || value in matched || choices.none{it.value==value}) return false
        visible=visible+value
        if(visible.size==2) {
            val pair=choices.filter { it.value in visible }
            if(pair[0].match!=null && pair[0].match==pair[1].match) {
                matched=matched+visible;visible=emptySet();return true
            }
        }
        return false
    }
    fun hideMismatch() { if(mismatch) visible=emptySet() }
}
class BalloonOrder(private val values:List<String>) {
    var popped=emptySet<String>(); private set
    val complete get()=popped.size==values.size
    fun tap(value:String):Boolean {
        if(complete || values[popped.size]!=value) return false
        popped=popped+value;return true
    }
}
class DrumListening {
    var playing=false;private set
    var heardComplete=false;private set
    var hintVisible=false;private set
    val canAnswer get()=!playing && (heardComplete || hintVisible)
    fun start():Boolean{if(playing)return false;playing=true;return true}
    fun finish(){if(playing)heardComplete=true;playing=false}
    fun cancel(){playing=false}
    fun showHint(){hintVisible=true}
}
data class Achievement(val title:String,val description:String,val symbol:String,val earned:Boolean)
fun achievements(p:Progress)=listOf(
    Achievement("第一位朋友","认识第 1 个数字","🌱",p.learned.isNotEmpty()),
    Achievement("数字好伙伴","认识 5 个数字","🌼",p.learned.size>=5),
    Achievement("闪亮小星星","认识全部 11 个数字","🌟",p.learned.size==11),
    Achievement("游戏小能手","完整通关任意小游戏","🏆",p.stars>0),
    Achievement("拼音小萌芽","完成任意一课拼音学习","🌷",p.learnedPinyin.isNotEmpty()),
    Achievement("拼音好伙伴","完成全部 14 课拼音","🦋",p.learnedPinyin.size==14),
    Achievement("字母新朋友","认识第一个英文字母","🍃",p.learnedLetters.isNotEmpty()),
    Achievement("字母收藏家","认识全部 26 个字母","🌈",p.learnedLetters.size==26))
val subjectNames=mapOf("numbers" to "数字乐园","pinyin" to "拼音天地","alphabet" to "字母森林")
val categoryNames=mapOf("recognize" to "观察与认知","listen" to "听音与辨认","think" to "顺序与思考","build" to "动手与组合")

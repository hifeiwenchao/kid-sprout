@file:OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
package com.feiwenchao.kidsprout

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties

@Composable fun NumbersPage(vm:AppState){
    var song by remember{mutableStateOf(false)}
    LazyColumn(Modifier.fillMaxSize(),contentPadding=PaddingValues(22.dp),verticalArrangement=Arrangement.spacedBy(20.dp)){
        item{PageTitle("01 / NUMBER GARDEN","和数字，交个朋友 🌱","从 0 到 10，听一听、数一数、玩一玩。每一个小发现，都值得一颗星星。")}
        item{OutlinedButton(onClick={song=true}){Text("♫ 听首数字儿歌")}}
        item{NumberCatalog(vm)}
        item{Text("已认识 ${vm.progress.learned.size} / 11 个数字朋友",color=MaterialTheme.colorScheme.primary)}
        item{SubjectGames(vm,"numbers")}
    }
    if(vm.lessonDialog=="numbers")LessonDialog("数字 ${vm.selectedNumber}",{vm.stopSpeech();vm.lessonDialog=null}){NumberDetails(vm)}
    if(song)LessonDialog("数字朋友歌",{vm.stopSpeech();song=false}){LazyColumn{item{NumberRhyme(vm)}}}
}
@Composable private fun NumberCatalog(vm:AppState){BoxWithConstraints{
    val columns=if(maxWidth>=840.dp)4 else if(maxWidth>=560.dp)3 else 2
    Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
        vm.curriculum.numbers.chunked(columns).forEach{row->Row(horizontalArrangement=Arrangement.spacedBy(12.dp)){
            row.forEach{n->OutlinedCard(onClick={vm.selectNumber(n.value);vm.lessonDialog="numbers"},modifier=Modifier.weight(1f),shape=RoundedCornerShape(20.dp),colors=CardDefaults.outlinedCardColors(containerColor=MaterialTheme.colorScheme.surface)){
                Column(Modifier.fillMaxWidth().padding(14.dp),horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.spacedBy(7.dp)){
                    Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.SpaceBetween){Text(n.name,style=MaterialTheme.typography.labelLarge);Text(if(n.value in vm.progress.learned)"✓" else "♫",color=MaterialTheme.colorScheme.primary)}
                    Text(n.value.toString(),fontSize=68.sp,fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.primary)
                    if(n.value==0)Illustration("empty_basket",Modifier.height(47.dp).fillMaxWidth(),"空篮子，一个也没有")
                    else FlowRow(Modifier.heightIn(min=47.dp),horizontalArrangement=Arrangement.Center,verticalArrangement=Arrangement.spacedBy(2.dp)){repeat(n.value){Illustration(n.motifAsset,Modifier.size(22.dp),null)}}
                    Text("点击认识 →",style=MaterialTheme.typography.labelSmall)
                }
            }}
            repeat(columns-row.size){Spacer(Modifier.weight(1f))}
        }}
    }
}}
@Composable private fun NumberDetails(vm:AppState){
    val number=vm.selectedNumber;val lesson=vm.curriculum.numbers.first{it.value==number}
    var touched by remember(number){mutableStateOf<List<Int>>(emptyList())};var zeroApple by remember(number){mutableStateOf(false)}
    LazyColumn(verticalArrangement=Arrangement.spacedBy(18.dp)){
        item{Panel{
            FlowRow(Modifier.fillMaxWidth(),verticalArrangement=Arrangement.spacedBy(8.dp),itemVerticalAlignment=Alignment.CenterVertically){Text("$number",fontSize=86.sp,fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.primary,modifier=Modifier.widthIn(min=100.dp));Text(lesson.name,fontSize=33.sp);SpeechButton(vm,"♫ 点读",lesson.name)}
            if(number==0){
                Illustration("empty_basket",Modifier.fillMaxWidth().height(130.dp),"一个也没有的空篮子")
                if(zeroApple)Illustration("number_motif_0",Modifier.align(Alignment.CenterHorizontally).size(65.dp),"一个苹果")
                Text(if(zeroApple)"篮子里有 1 个苹果。拿走它，再看看还剩几个？" else "一个苹果也没有啦！一个也没有，可以用 0 表示。")
                PrimaryButton(if(zeroApple)"拿走苹果" else "放入 1 个苹果",{zeroApple=!zeroApple;vm.say(if(zeroApple)"一个苹果" else "一个也没有，零")})
            }else{
                Text("点点${lesson.fruit}，一起数到 $number：",fontWeight=FontWeight.Bold)
                FlowRow(horizontalArrangement=Arrangement.spacedBy(8.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
                    repeat(number){i->Column(Modifier.width(54.dp).clickable{if(i !in touched){touched=touched+i;vm.say(touched.size.toString())}},horizontalAlignment=Alignment.CenterHorizontally){
                        Illustration(lesson.motifAsset,Modifier.size(50.dp),"第${i+1}${lesson.unit}${lesson.fruit}${if(i in touched)"，已数过" else ""}")
                        Text(if(i in touched)"${touched.indexOf(i)+1} ✓" else "·",fontSize=13.sp)
                    }}
                }
                Text("已数 ${touched.size} / $number ${lesson.unit}",color=MaterialTheme.colorScheme.primary)
            }
            PrimaryButton(if(number in vm.progress.learned)"已经认识啦 ✓" else "我认识这个数字啦",{vm.markLearned()})
            LessonNavigation(number>0,number<10,{vm.selectNumber(number-1)},{vm.selectNumber(number+1)})
        }}
        item{MemorySceneView(vm,"numbers",number.toString())}
        item{LessonTracing(vm,"numbers:$number")}
    }
}
@Composable fun PinyinPage(vm:AppState){
    val data=vm.curriculum.pinyin
    LazyColumn(Modifier.fillMaxSize(),contentPadding=PaddingValues(22.dp),verticalArrangement=Arrangement.spacedBy(20.dp)){
        item{PageTitle("02 / PINYIN LAND","听见声音，认识拼音 🌷","${data.edition} · 按 14 课循序渐进，听例字，看看口型，再试着拼一拼。")}
        item{Text("已完成 ${vm.progress.learnedPinyin.size} / 14 课",color=MaterialTheme.colorScheme.primary)}
        item{Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
            data.lessons.forEach{lesson->OutlinedCard(onClick={vm.selectPinyin(lesson.symbols.first());vm.lessonDialog="pinyin"},shape=RoundedCornerShape(18.dp),colors=CardDefaults.outlinedCardColors(containerColor=MaterialTheme.colorScheme.surface)){
                Row(Modifier.fillMaxWidth().padding(18.dp),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(16.dp)){
                    Text("${lesson.number}".padStart(2,'0'),fontSize=23.sp,color=MaterialTheme.colorScheme.primary)
                    Column(Modifier.weight(1f),verticalArrangement=Arrangement.spacedBy(5.dp)){Text("第 ${lesson.unit} 单元 · 第 ${lesson.number} 课",style=MaterialTheme.typography.labelSmall);Text(lesson.title,fontSize=25.sp,fontWeight=FontWeight.Bold);if(lesson.readSyllables.isNotEmpty())Text("整体认读：${lesson.readSyllables.joinToString(" ")}",style=MaterialTheme.typography.bodySmall)}
                    Text(if(lesson.id in vm.progress.learnedPinyin)"✓" else "›",fontSize=23.sp,color=MaterialTheme.colorScheme.primary)
                }
            }}
        }}
        item{Panel{SectionTitle("四声小滑梯","一声平，二声扬，三声拐弯，四声降。")
            data.tones.forEach{tone->ToneScene(vm,tone)}
        }}
        item{Panel{SectionTitle("23 个声母 · 24 个韵母")
            listOf("initial" to "声母","final" to "韵母").forEach{(kind,label)->Text(label,fontWeight=FontWeight.Bold);FlowRow(horizontalArrangement=Arrangement.spacedBy(7.dp),verticalArrangement=Arrangement.spacedBy(7.dp)){
                data.items.filter{it.kind==kind}.forEach{p->FilterChip(false,{vm.selectPinyin(p.symbol);vm.lessonDialog="pinyin"},label={Text(p.symbol,fontSize=22.sp)})}
            }}
        }}
        item{Panel{Text("教材课次参考",fontWeight=FontWeight.Bold);data.sources.forEach{s->Text("${s.title}\n${s.url}\n${s.note}",style=MaterialTheme.typography.bodySmall,lineHeight=23.sp)};Text("口型、例字和游戏为自主制作，不使用教材原图。",style=MaterialTheme.typography.bodySmall)}}
        item{SubjectGames(vm,"pinyin")}
    }
    if(vm.lessonDialog=="pinyin")LessonDialog("拼音小课堂",{vm.stopSpeech();vm.lessonDialog=null}){PinyinDetails(vm)}
}
@Composable private fun PinyinDetails(vm:AppState){
    val data=vm.curriculum.pinyin;val selected=vm.selectedPinyin;val pinyin=data.items.first{it.symbol==selected}
    val lesson=data.lessons.first{selected in it.symbols}
    LazyColumn(verticalArrangement=Arrangement.spacedBy(18.dp)){
        item{Panel{
            Text(selected,fontSize=82.sp,fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.primary)
            Text(if(pinyin.kind=="initial")"声母" else "韵母",style=MaterialTheme.typography.labelLarge)
            Text("口型小提示",fontWeight=FontWeight.Bold);Text(pinyin.hint,lineHeight=26.sp)
            Text("${pinyin.example}  ·  ${pinyin.examplePinyin}",fontSize=23.sp)
            if(pinyin.symbol!="o")SpeechButton(vm,"♫ 听例字读音参考",pinyin.speech)
            pinyin.referenceNote?.let{Text(it,lineHeight=25.sp,color=MaterialTheme.colorScheme.primary)}
            Text("合成语音是例字读音参考，不等同于标准拼音音素录音。声母轻短音请家长示范。",style=MaterialTheme.typography.bodySmall,lineHeight=23.sp)
        }}
        item{Panel{
            Text("第 ${lesson.unit} 单元 · 第 ${lesson.number} 课",style=MaterialTheme.typography.labelLarge)
            Text(lesson.title,fontSize=30.sp,fontWeight=FontWeight.Bold)
            FlowRow(horizontalArrangement=Arrangement.spacedBy(8.dp)){lesson.symbols.forEach{s->FilterChip(selected==s,{vm.selectPinyin(s)},label={Text(s,fontSize=29.sp)})}}
            if(lesson.readSyllables.isNotEmpty()){Text("整体认读音节",fontWeight=FontWeight.Bold);Text(lesson.readSyllables.joinToString("   "),fontSize=24.sp);Text("这些音节作为整体认读，请听家长或老师示范。",style=MaterialTheme.typography.bodySmall)}
            Text("拼读小提示",fontWeight=FontWeight.Bold)
            Text(lesson.rule,lineHeight=26.sp)
            lesson.spellings.forEach{Text(it,fontSize=19.sp,lineHeight=29.sp)}
            PrimaryButton(if(lesson.id in vm.progress.learnedPinyin)"这一课已经学过啦 ✓" else "我学完这一课啦",{vm.markPinyin(lesson.id)})
            LessonNavigation(lesson.number>1,lesson.number<14,{vm.selectPinyin(data.lessons[lesson.number-2].symbols.first())},{vm.selectPinyin(data.lessons[lesson.number].symbols.first())})
        }}
        item{MemorySceneView(vm,"pinyin",selected)}
    }
}
@Composable fun AlphabetPage(vm:AppState){
    val data=vm.curriculum.alphabet
    LazyColumn(Modifier.fillMaxSize(),contentPadding=PaddingValues(22.dp),verticalArrangement=Arrangement.spacedBy(20.dp)){
        item{PageTitle("03 / ALPHABET FOREST","和字母，成为新朋友 🍃","26 位字母朋友，带着大小写和简单的单词，等你来打招呼。")}
        item{Text("已认识 ${vm.progress.learnedLetters.size} / 26 个字母",color=MaterialTheme.colorScheme.primary)}
        data.groups.forEach{group->item{Column(verticalArrangement=Arrangement.spacedBy(14.dp)){
            SectionTitle(group.label)
            LetterCatalog(vm,data.letters.filter{it.id in group.letters})
        }}}
        item{SubjectGames(vm,"alphabet")}
    }
    if(vm.lessonDialog=="alphabet")LessonDialog("字母小课堂",{vm.stopSpeech();vm.lessonDialog=null}){AlphabetDetails(vm)}
}
@Composable private fun LetterCatalog(vm:AppState,letters:List<LetterLesson>){BoxWithConstraints{
    val columns=if(maxWidth>=700.dp)6 else if(maxWidth>=500.dp)4 else if(maxWidth>=360.dp)3 else 2
    Column(verticalArrangement=Arrangement.spacedBy(10.dp)){
        letters.chunked(columns).forEach{row->Row(horizontalArrangement=Arrangement.spacedBy(10.dp)){
            row.forEach{l->OutlinedCard(onClick={vm.selectLetter(l.id);vm.lessonDialog="alphabet"},modifier=Modifier.weight(1f),shape=RoundedCornerShape(17.dp),colors=CardDefaults.outlinedCardColors(containerColor=MaterialTheme.colorScheme.surface)){
                Column(Modifier.fillMaxWidth().padding(10.dp),horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.spacedBy(6.dp)){
                    Text(l.uppercase+l.lowercase,fontSize=31.sp,color=MaterialTheme.colorScheme.primary,fontWeight=FontWeight.Bold)
                    Text(l.emoji,fontSize=28.sp);Text(l.word,style=MaterialTheme.typography.labelLarge)
                    Text(if(l.id in vm.progress.learnedLetters)"已认识 ✓" else "点我认识",style=MaterialTheme.typography.labelSmall)
                }
            }}
            repeat(columns-row.size){Spacer(Modifier.weight(1f))}
        }}
    }
}}
@Composable private fun AlphabetDetails(vm:AppState){
    val data=vm.curriculum.alphabet;val letter=data.letters.first{it.id==vm.selectedLetter};val index=data.letters.indexOf(letter)
    LazyColumn(verticalArrangement=Arrangement.spacedBy(18.dp)){
        item{Panel{
            Text("${letter.uppercase} ${letter.lowercase}",fontSize=76.sp,fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.primary)
            SpeechButton(vm,"♫ 听字母 ${letter.uppercase}",letter.uppercase,"en-US")
            Text("${letter.emoji}  ${letter.word}",fontSize=35.sp,fontWeight=FontWeight.Bold)
            Text(letter.translation,fontSize=21.sp);SpeechButton(vm,"♫ 听单词 ${letter.word}",letter.word,"en-US")
            Text(letter.hint,lineHeight=27.sp)
            PrimaryButton(if(letter.id in vm.progress.learnedLetters)"已经认识啦 ✓" else "我认识这个字母啦",{vm.markLetter()})
            LessonNavigation(index>0,index<25,{vm.selectLetter(data.letters[index-1].id)},{vm.selectLetter(data.letters[index+1].id)})
        }}
        item{MemorySceneView(vm,"alphabet",letter.uppercase+letter.lowercase)}
        item{LessonTracing(vm,"alphabet:${letter.uppercase}${letter.lowercase}")}
    }
}
@Composable private fun LessonDialog(title:String,dismiss:()->Unit,content:@Composable ()->Unit){
    Dialog(onDismissRequest=dismiss,properties=DialogProperties(usePlatformDefaultWidth=false)){
        Surface(Modifier.widthIn(max=980.dp).fillMaxWidth(.96f).fillMaxHeight(.95f).imePadding(),shape=RoundedCornerShape(24.dp),color=MaterialTheme.colorScheme.background){
            Column(Modifier.padding(16.dp),verticalArrangement=Arrangement.spacedBy(12.dp)){
                Row(verticalAlignment=Alignment.CenterVertically){Text(title,Modifier.weight(1f),style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold);TextButton(onClick=dismiss,modifier=Modifier.heightIn(min=48.dp)){Text("完成 ✓")}}
                Box(Modifier.weight(1f)){content()}
            }
        }
    }
}
@Composable private fun LessonNavigation(previous:Boolean,next:Boolean,onPrevious:()->Unit,onNext:()->Unit){Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(12.dp)){OutlinedButton(onPrevious,Modifier.weight(1f).heightIn(min=48.dp),enabled=previous){Text("← 上一个")};OutlinedButton(onNext,Modifier.weight(1f).heightIn(min=48.dp),enabled=next){Text("下一个 →")}}}

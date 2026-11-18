@file:OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
package com.feiwenchao.kidsprout

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay

@Composable fun GamePlayer(vm:AppState){
    val session=vm.session?:return;val game=vm.selectedGame?:return
    @Suppress("UNUSED_VARIABLE")val revision=vm.gameRevision
    val round=session.current;val solved=session.solved
    LazyColumn(Modifier.fillMaxSize(),contentPadding=PaddingValues(22.dp),verticalArrangement=Arrangement.spacedBy(18.dp)){
        item{Row(verticalAlignment=Alignment.CenterVertically){TextButton(onClick={vm.leaveGame()}){Text("‹ 返回游戏")};Spacer(Modifier.weight(1f));Text("${subjectNames[game.subject]}",style=MaterialTheme.typography.labelLarge)}}
        item{PageTitle(game.skill,"${game.symbol} ${game.title}",game.description)}
        if(session.completed){item{Panel{
            Text(if(game.type=="trace")"认真练习，真棒！" else "挑战完成，真棒！ ✦",style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold)
            Text(if(game.type=="trace")"每一笔都有进步。也可以请家长看看，在纸上继续写。" else "收获一颗小星星！答错后继续尝试，也是很棒的学习。")
            PrimaryButton("再玩一次",{vm.startGame(game)})
            OutlinedButton(onClick={vm.leaveGame()}){Text("选择其他游戏")}
        }}}else{
            item{LinearProgressIndicator(progress={(session.index.toFloat())/session.rounds.size},modifier=Modifier.fillMaxWidth());Text(if(round.mode=="trace")"自由描画练习 · 不累计奖励" else "第 ${session.index+1} / ${session.rounds.size} 关",modifier=Modifier.padding(top=8.dp),style=MaterialTheme.typography.labelLarge)}
            item{key(round.id){RoundContent(vm,round,solved)}}
            if(solved)item{Panel(tint=MaterialTheme.colorScheme.secondaryContainer){Text("答对啦，真棒！ ✦",fontWeight=FontWeight.Bold);round.explanation?.let{Text(it,lineHeight=25.sp)}
                PrimaryButton(if(session.index==session.rounds.lastIndex)if(round.mode=="trace")"完成练习" else "完成挑战 · 领取星星" else "下一关 →",{vm.nextRound()})}}
        }
    }
}
@Composable private fun RoundContent(vm:AppState,round:ActivityRound,solved:Boolean){
    var feedback by remember{mutableStateOf<String?>(null)}
    var hint by remember{mutableStateOf(false)}
    val listening=remember{DrumListening()}
    var listeningRevision by remember{mutableIntStateOf(0)}
    @Suppress("UNUSED_VARIABLE")val listeningChange=listeningRevision
    val canAnswer=round.scene!="drum" || listening.canAnswer
    DisposableEffect(round.id){onDispose{vm.stopSpeech()}}
    val attempt:(List<String>)->Unit={answer->if(canAnswer)feedback=if(vm.submit(answer))null else "再看看，慢慢试一试。"}
    Panel{
        Text(round.prompt,style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold,lineHeight=31.sp)
        if(round.speech!=null)SpeechButton(vm,"♫ 再听一次",round.speech,round.speechLang?:"zh-CN")
        if(round.display!=null && round.scene !in listOf("train","alphabet-train"))Text(round.display,fontSize=26.sp,fontWeight=FontWeight.Bold,lineHeight=35.sp)
        round.visualText?.let{Text(it,fontSize=21.sp,lineHeight=31.sp)}
        RoundScene(vm,round,solved,listening){listeningRevision++}
        when(round.mode){
            "choice"->ChoiceOptions(round,solved || !canAnswer){attempt(listOf(it))}
            "sequence","select"->CombinationOptions(round,solved,attempt)
            "build"->BuildOptions(round,solved,attempt)
            "memory"->MemoryOptions(round,solved){vm.completeInteraction()}
            "balloons"->BalloonOptions(round,solved){attempt(it)}
            "trace"->{
                var number by remember{mutableIntStateOf(round.count?:0)}
                FlowRow(horizontalArrangement=Arrangement.spacedBy(6.dp)){(0..10).forEach{n->FilterChip(n==number,{number=n},label={Text(n.toString())})}}
                LessonTracing(vm,"numbers:$number")
                PrimaryButton("我练习好啦",{vm.completeInteraction()},enabled=!solved)
            }
        }
        feedback?.let{Text(it,color=MaterialTheme.colorScheme.error)}
        if(round.hint!=null){TextButton(onClick={hint=!hint}){Text(if(hint)"收起小提示" else "看看小提示")};if(hint)Text(round.hint,style=MaterialTheme.typography.bodyMedium,lineHeight=25.sp)}
    }
}
@Composable private fun ChoiceOptions(round:ActivityRound,solved:Boolean,choose:(String)->Unit){
    FlowRow(horizontalArrangement=Arrangement.spacedBy(10.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){
        round.choices.forEach{choice->OutlinedCard(onClick={choose(choice.value)},enabled=!solved,modifier=Modifier.widthIn(min=120.dp).heightIn(min=78.dp),shape=RoundedCornerShape(16.dp),colors=CardDefaults.outlinedCardColors(containerColor=MaterialTheme.colorScheme.surfaceVariant)){
            Column(Modifier.padding(16.dp),horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.spacedBy(5.dp)){
                Text(choice.label,fontSize=25.sp,fontWeight=FontWeight.Bold,textAlign=TextAlign.Center)
                choice.small?.let{Text(it,style=MaterialTheme.typography.bodySmall)}
            }
        }}
    }
}
@Composable private fun CombinationOptions(round:ActivityRound,solved:Boolean,attempt:(List<String>)->Unit){
    var selected by remember{mutableStateOf<List<String>>(emptyList())}
    val sequence=round.mode=="sequence"
    Text(if(sequence)"按先后顺序点击，组合好再检查。" else "找齐所有符合的朋友，再检查。",style=MaterialTheme.typography.bodySmall)
    if(sequence)Surface(color=MaterialTheme.colorScheme.secondaryContainer,shape=RoundedCornerShape(13.dp)){
        Text(if(selected.isEmpty())"等待你的组合…" else selected.map{v->round.choices.first{it.value==v}.label}.joinToString(" → "),Modifier.fillMaxWidth().padding(16.dp),fontSize=24.sp)
    }
    FlowRow(horizontalArrangement=Arrangement.spacedBy(9.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
        round.choices.forEach { choice ->
            FilterChip(choice.value in selected, {
                if(!solved) selected=if(choice.value in selected)selected-choice.value else selected+choice.value
            }, enabled=!solved, label={
                Column(Modifier.padding(vertical=8.dp)) {
                    Text(choice.label,fontSize=23.sp)
                    choice.small?.let { Text(it,style=MaterialTheme.typography.bodySmall) }
                }
            })
        }
    }
    Row(horizontalArrangement=Arrangement.spacedBy(10.dp)){
        PrimaryButton("检查一下",{attempt(selected)},enabled=!solved && selected.isNotEmpty())
        OutlinedButton(onClick={selected=emptyList()},enabled=!solved && selected.isNotEmpty()){Text("重新选")}
    }
}
@Composable private fun BuildOptions(round:ActivityRound,solved:Boolean,attempt:(List<String>)->Unit){
    var amount by remember{mutableIntStateOf(0)}
    val item=round.item?:"⭐"
    Text("已放入 $amount",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold)
    Surface(color=MaterialTheme.colorScheme.secondaryContainer,shape=RoundedCornerShape(18.dp)){
        FlowRow(Modifier.fillMaxWidth().heightIn(min=100.dp).padding(16.dp),horizontalArrangement=Arrangement.spacedBy(8.dp),verticalArrangement=Arrangement.spacedBy(8.dp)){
            if(amount==0)Text("还没有放入，一个也没有。",Modifier.padding(vertical=22.dp))
            repeat(amount){i->if(round.scene=="picnic")Illustration("cookie",Modifier.size(40.dp),"第${i+1}块饼干") else Text(item,fontSize=32.sp)}
        }
    }
    Row(horizontalArrangement=Arrangement.spacedBy(10.dp)){
        OutlinedButton(onClick={amount--},enabled=!solved && amount>0,modifier=Modifier.heightIn(min=54.dp)){Text("− 拿出一个")}
        PrimaryButton("＋ 放入一个",{amount++},enabled=!solved && amount<(round.max?:10))
    }
    PrimaryButton(if(round.scene=="picnic")"送给小熊" else "检查数量",{attempt(listOf(amount.toString()))},enabled=!solved)
}
@Composable private fun MemoryOptions(round:ActivityRound,solved:Boolean,complete:()->Unit){
    val memory=remember{MemoryPairs(round.choices)};var revision by remember{mutableIntStateOf(0)}
    @Suppress("UNUSED_VARIABLE")val change=revision
    LaunchedEffect(revision){if(memory.mismatch){delay(1000);memory.hideMismatch();revision++}}
    FlowRow(horizontalArrangement=Arrangement.spacedBy(10.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){
        round.choices.forEach{choice->val matched=choice.value in memory.matched;val visible=matched || choice.value in memory.visible
            OutlinedCard(onClick={memory.tap(choice.value);revision++;if(memory.complete)complete()},enabled=!solved && !matched && !memory.mismatch,modifier=Modifier.sizeIn(minWidth=88.dp,minHeight=85.dp,maxWidth=135.dp),shape=RoundedCornerShape(17.dp),colors=CardDefaults.outlinedCardColors(containerColor=if(matched)MaterialTheme.colorScheme.secondaryContainer else MaterialTheme.colorScheme.surfaceVariant)){
                Box(Modifier.fillMaxWidth().heightIn(min=85.dp).padding(10.dp),contentAlignment=Alignment.Center){Text(if(visible)choice.label else "✦",fontSize=if(visible)24.sp else 34.sp,textAlign=TextAlign.Center)}
            }
        }
    }
    Text("已找到 ${memory.matched.size/2} / ${round.choices.size/2} 对朋友",style=MaterialTheme.typography.labelLarge)
}
@Composable private fun BalloonOptions(round:ActivityRound,solved:Boolean,complete:(List<String>)->Unit){
    val balloons=remember{BalloonOrder(round.answer)};var revision by remember{mutableIntStateOf(0)};var incorrect by remember{mutableStateOf(false)}
    @Suppress("UNUSED_VARIABLE")val change=revision
    FlowRow(horizontalArrangement=Arrangement.spacedBy(12.dp),verticalArrangement=Arrangement.spacedBy(15.dp)){
        round.choices.forEachIndexed{index,choice->val popped=choice.value in balloons.popped
            Column(horizontalAlignment=Alignment.CenterHorizontally){
                Surface(onClick={incorrect=!balloons.tap(choice.value);revision++;if(balloons.complete)complete(round.answer)},enabled=!solved && !popped,shape=CircleShape,color=if(popped)MaterialTheme.colorScheme.surfaceVariant else listOf(Color(0xffdc7c79),Color(0xff91ad73),Color(0xffad90c5),Color(0xffe2b755),Color(0xff74a9bf))[index%5]){
                    Box(Modifier.size(78.dp),contentAlignment=Alignment.Center){Text(if(popped)"✓" else choice.label,fontSize=32.sp,fontWeight=FontWeight.Bold,color=Color(0xff233020))}
                }
                Text("│",color=MaterialTheme.colorScheme.outline)
            }
        }
    }
    Text("已点亮 ${balloons.popped.size} / ${round.answer.size} 个气球")
    if(incorrect)Text("按从小到大的顺序，再找找下一个。",color=MaterialTheme.colorScheme.error)
}

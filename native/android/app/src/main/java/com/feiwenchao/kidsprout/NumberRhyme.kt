package com.feiwenchao.kidsprout

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay

private val numberRhyme=listOf("零像鸡蛋圆溜溜，一个也没有就是零","一像铅笔细又长","二像小鸭水上漂","三像耳朵听声音","四像小旗迎风飘","五像秤钩来买菜","六像口哨嘟嘟响","七像镰刀割青草","八像葫芦扭扭腰","九像气球天上飞","一零手拉手就是十")
@Composable fun NumberRhyme(vm:AppState){
    var line by remember{mutableIntStateOf(0)}
    var playing by remember{mutableStateOf(false)}
    DisposableEffect(Unit){onDispose{if(playing)vm.stopSpeech()}}
    LaunchedEffect(vm.speechEpoch){playing=false}
    LaunchedEffect(vm.progress.speech){if(!vm.progress.speech){playing=false}}
    LaunchedEffect(playing,line){
        if(playing){
            val current=line
            fun advance(){if(playing && line==current){if(line==numberRhyme.lastIndex){playing=false;line=0}else line++}}
            val spoken=vm.say(numberRhyme[line],onFinished={advance()})
            if(!spoken){delay(2400);advance()}
        }
    }
    Panel{
        SectionTitle("♫ 数字朋友歌","拍一拍小手，跟着节奏一起念")
        numberRhyme.forEachIndexed{index,text->
            Surface(shape=RoundedCornerShape(10.dp),color=if(playing && line==index)MaterialTheme.colorScheme.secondaryContainer else MaterialTheme.colorScheme.surface){
                Text("$index   $text${if(!vm.progress.speech)" · 开启声音点读" else ""}",Modifier.fillMaxWidth().clickable{playing=false;if(!vm.progress.speech)vm.setSpeech(true);vm.say(text)}.padding(10.dp),fontWeight=if(playing && line==index)FontWeight.Bold else FontWeight.Normal)
            }
        }
        PrimaryButton(if(playing)"暂停儿歌" else if(!vm.progress.speech)"开启声音，听数字儿歌" else if(line==0)"播放数字儿歌" else "继续听儿歌",{if(playing){playing=false;vm.stopSpeech()}else{if(!vm.progress.speech)vm.setSpeech(true);playing=true}})
        Text("可以逐句点击；没有离线声音时，会逐句突出显示文字。",style=MaterialTheme.typography.bodySmall)
    }
}

package com.feiwenchao.kidsprout

import android.provider.Settings
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay

@Composable fun MemorySceneView(vm:AppState,subject:String,symbol:String){
    val scene=vm.curriculum.memoryScenes.find{it.subject==subject && it.symbol==symbol}?:return
    val context=LocalContext.current
    val reduced=runCatching{Settings.Global.getFloat(context.contentResolver,Settings.Global.ANIMATOR_DURATION_SCALE,1f)==0f}.getOrDefault(false)
    var replay by remember(scene){mutableIntStateOf(0)}
    var frame by remember(scene){mutableIntStateOf(if(reduced)scene.frames.lastIndex else 0)}
    var playing by remember(scene){mutableStateOf(false)}
    LaunchedEffect(scene,replay,reduced){
        if(reduced){frame=scene.frames.lastIndex;playing=false}else{
            playing=true;frame=0
            for(i in 1..scene.frames.lastIndex){delay(850);frame=i}
            delay(500);playing=false
        }
    }
    Panel{
        Text("✦ 记忆小剧场",fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.primary)
        Text(scene.title,style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold)
        Illustration(scene.frames[frame],Modifier.fillMaxWidth().heightIn(min=160.dp,max=260.dp),scene.description)
        Text(scene.description,style=MaterialTheme.typography.bodyMedium)
        OutlinedButton(onClick={replay++},enabled=!playing){Text(if(reduced)"再看一次（静态）" else if(playing)"正在播放…" else "↻ 再看一次")}
    }
}
@Composable fun ToneScene(vm:AppState,tone:PinyinTone){
    Column(verticalArrangement=Arrangement.spacedBy(8.dp)){
        Text("${tone.name} ${tone.mark}  ·  ${tone.hint}",fontWeight=FontWeight.Bold)
        MemorySceneView(vm,"pinyin",listOf("ā","á","ǎ","à")[tone.number-1])
    }
}
@Composable fun LessonTracing(vm:AppState,templateId:String){
    val template=vm.curriculum.tracingTemplates.find{it.id==templateId}?:return
    val history=remember(templateId){DrawingHistory(initialTemplate=templateId)}
    var revision by remember(templateId){mutableIntStateOf(0)}
    var strokes by remember(templateId){mutableIntStateOf(0)}
    Panel{
        Text("✎ 小手写一写",fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.primary)
        Text(if(template.group=="alphabet")"大写小写，在同一张画纸上练习" else "沿着虚线，描描数字 ${template.label}")
        InkPaper(history.strokes,template.asset,0xff638451,.009f,false,1f,true,Modifier.fillMaxWidth().aspectRatio(1000f/700f),revision){stroke->history.add(stroke);revision++;strokes++}
        Row(horizontalArrangement=Arrangement.spacedBy(12.dp)){
            OutlinedButton(onClick={history.undo();revision++},enabled=history.canUndo){Text("撤销一笔")}
            OutlinedButton(onClick={history.clear();revision++},enabled=history.strokes.isNotEmpty()){Text("清空重写")}
        }
        Text(if(strokes>0)"你认真练习的样子真棒！请家长一起看看，也在纸上继续写。" else "用手指或触控笔慢慢描一描。",style=MaterialTheme.typography.bodySmall)
        Text("不自动判断字形，不累计游戏奖励；切换课程会清空本次笔迹。",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

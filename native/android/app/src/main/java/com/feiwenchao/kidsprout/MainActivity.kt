@file:OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
package com.feiwenchao.kidsprout

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.automirrored.filled.VolumeOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlin.random.Random

class MainActivity:ComponentActivity(){
    private var model:AppState?=null
    override fun onCreate(savedInstanceState:Bundle?){super.onCreate(savedInstanceState);enableEdgeToEdge();setContent{SproutTheme{val vm:AppState=viewModel();model=vm;SproutApp(vm)}}}
    override fun onStop(){super.onStop();model?.stopSpeech()}
}
@Composable fun SproutApp(vm:AppState){
    var gateAction by remember{mutableStateOf<(() -> Unit)?>(null)}
    var author by remember{mutableStateOf(false)}
    var showAchievements by remember{mutableStateOf(false)}
    var fullDrawing by remember{mutableStateOf(false)}
    val gate:((()->Unit))->Unit={gateAction=it}
    val destinations=Page.entries.filter{it!=Page.PARENTS}
    BackHandler(vm.session!=null && vm.page==Page.GAMES){vm.leaveGame()}
    BackHandler(fullDrawing){fullDrawing=false}
    Surface(Modifier.fillMaxSize(),color=MaterialTheme.colorScheme.background){
        BoxWithConstraints(Modifier.fillMaxSize().safeDrawingPadding()){
            val wide=maxWidth>=800.dp && maxHeight>=480.dp
            Row(Modifier.fillMaxSize()){
                if(wide && !fullDrawing) Column(Modifier.width(218.dp).fillMaxHeight().background(MaterialTheme.colorScheme.surface).padding(18.dp).verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(8.dp)){
                    Text("🌱  萌芽启蒙",fontSize=23.sp,fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.primary,modifier=Modifier.padding(vertical=20.dp))
                    Text("KID SPROUT · 快乐长大",style=MaterialTheme.typography.labelSmall)
                    Spacer(Modifier.height(12.dp));Text("学习地图",style=MaterialTheme.typography.labelMedium)
                    destinations.forEach{destination ->
                        Surface(onClick={vm.page=destination},shape=RoundedCornerShape(12.dp),color=if(vm.page==destination)MaterialTheme.colorScheme.secondaryContainer else MaterialTheme.colorScheme.surface){
                            Row(Modifier.fillMaxWidth().padding(14.dp),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(12.dp)){
                                Text(destination.symbol,Modifier.width(28.dp),fontSize=23.sp,color=MaterialTheme.colorScheme.primary);Text(destination.label,fontWeight=if(vm.page==destination)FontWeight.Bold else FontWeight.Normal)
                            }
                        }
                    }
                    Spacer(Modifier.height(22.dp));Panel{Text("每一点好奇\n都会长大",fontWeight=FontWeight.Bold,fontSize=19.sp);Text("已收获 ${vm.progress.stars} 颗小星星",style=MaterialTheme.typography.bodySmall)}
                    TextButton(onClick={vm.page=Page.PARENTS}){Text("♡  家长陪伴说明")}
                    TextButton(onClick={author=true}){Text("关于作者 ↗")}
                }
                Column(Modifier.weight(1f)){
                    if(!fullDrawing) Row(Modifier.fillMaxWidth().padding(horizontal=20.dp,vertical=6.dp),verticalAlignment=Alignment.CenterVertically){
                        Text("萌芽启蒙  /  ${vm.page.label}",Modifier.weight(1f),style=MaterialTheme.typography.labelMedium,color=MaterialTheme.colorScheme.onSurfaceVariant)
                        TextButton(onClick={showAchievements=true}){Text("✦ ${vm.progress.stars} · 成就")}
                        IconButton(onClick={vm.setSpeech(!vm.progress.speech)}){Icon(if(vm.progress.speech)Icons.AutoMirrored.Filled.VolumeUp else Icons.AutoMirrored.Filled.VolumeOff,if(vm.progress.speech)"关闭点读" else "开启点读")}
                        IconButton(onClick={vm.page=Page.PARENTS}){Icon(Icons.Default.FamilyRestroom,"家长说明")}
                    }
                    Box(Modifier.weight(1f).fillMaxWidth(),contentAlignment=Alignment.TopCenter){
                        Box(Modifier.widthIn(max=1200.dp).fillMaxSize()){
                            when(vm.page){
                                Page.HOME->HomePage(vm)
                                Page.NUMBERS->NumbersPage(vm)
                                Page.PINYIN->PinyinPage(vm)
                                Page.ALPHABET->AlphabetPage(vm)
                                Page.GAMES->if(vm.session!=null)GamePlayer(vm) else GameLibrary(vm)
                                Page.DRAWING->DrawingWorkspace(vm,fullDrawing,{fullDrawing=!fullDrawing}){gate{vm.shareDrawing()}}
                                Page.PARENTS->ParentsPage(vm,{author=true})
                            }
                        }
                    }
                    if(!wide && !fullDrawing) Surface(color=MaterialTheme.colorScheme.surface,shadowElevation=3.dp){
                        Row(Modifier.fillMaxWidth().heightIn(min=68.dp)){
                            destinations.forEach{destination ->
                                val selected=vm.page==destination
                                Column(Modifier.weight(1f).clickable{vm.page=destination}.padding(vertical=9.dp),horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.spacedBy(3.dp)){
                                    Text(destination.symbol,fontSize=22.sp,color=MaterialTheme.colorScheme.primary)
                                    Text(when(destination){Page.HOME->"探索";Page.NUMBERS->"数字";Page.PINYIN->"拼音";Page.ALPHABET->"字母";Page.DRAWING->"画板";else->"游戏"},fontSize=11.sp,fontWeight=if(selected)FontWeight.Bold else FontWeight.Normal)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if(gateAction!=null)ParentGate({gateAction=null}){val action=gateAction;gateAction=null;action?.invoke()}
    if(showAchievements)AchievementsDialog(vm){showAchievements=false}
    if(author)AlertDialog(onDismissRequest={author=false},title={Text("关于作者")},text={Column(verticalArrangement=Arrangement.spacedBy(14.dp)){
        Text("萌芽启蒙，最初是我为自家娃制作的小小学习空间。希望用温柔的画面和轻松的小游戏，让孩子在家长陪伴下保留好奇、快乐探索。")
        Text("欢迎提出建议，或反馈使用中遇到的问题。")
        OutlinedButton(onClick={gate{vm.emailAuthor()}}){Text("hi@feiwenchao.com  ↗")}
    }},confirmButton={TextButton(onClick={author=false}){Text("回到学习")}})
    vm.message?.let{message ->AlertDialog(onDismissRequest={vm.message=null},title={Text("温馨提示")},text={Text(message)},confirmButton={TextButton(onClick={vm.message=null}){Text("知道了")}})}
}
@Composable private fun ParentGate(onDismiss:()->Unit,onVerified:()->Unit){
    val left=remember{Random.nextInt(12,25)};val right=remember{Random.nextInt(7,16)}
    var answer by remember{mutableStateOf("")};var error by remember{mutableStateOf(false)}
    AlertDialog(onDismissRequest=onDismiss,title={Text("请家长来帮忙")},text={Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
        Text("离开学习空间前，请家长完成这道小算术。")
        Text("$left + $right = ?",style=MaterialTheme.typography.headlineMedium)
        OutlinedTextField(answer,{answer=it.filter(Char::isDigit).take(3);error=false},label={Text("输入答案")},singleLine=true,keyboardOptions=KeyboardOptions(keyboardType=KeyboardType.Number),isError=error)
        if(error)Text("请家长再算一算。",color=MaterialTheme.colorScheme.error)
    }},confirmButton={TextButton(onClick={if(answer.toIntOrNull()==left+right)onVerified() else error=true}){Text("验证并继续")}},dismissButton={TextButton(onClick=onDismiss){Text("返回学习")}})
}

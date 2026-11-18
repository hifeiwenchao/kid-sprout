@file:OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
package com.feiwenchao.kidsprout

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable fun RoundScene(vm:AppState,round:ActivityRound,solved:Boolean,listening:DrumListening,onListeningChange:()->Unit){
    if(round.id.startsWith("pinyin-tones:")){
        val normalized=java.text.Normalizer.normalize(round.answer.firstOrNull().orEmpty(),java.text.Normalizer.Form.NFD)
        val tone=when{normalized.contains('\u0304')->"ā";normalized.contains('\u0301')->"á";normalized.contains('\u030c')->"ǎ";else->"à"}
        vm.curriculum.memoryScenes.firstOrNull{it.subject=="pinyin" && it.symbol==tone}?.let{scene->
            Text("看看声调小路，跟着比划一下。",style=MaterialTheme.typography.bodySmall)
            Illustration(scene.frames.last(),Modifier.fillMaxWidth().height(180.dp),"声调小滑梯")
        }
    }
    when(round.scene){
        "fruit"->{
            var touched by remember(round.id){mutableStateOf(setOf<Int>())}
            val count=round.count?:0
            if(count==0)Illustration("empty_basket",Modifier.fillMaxWidth().height(140.dp),"空篮子，一个也没有")
            else FlowRow(horizontalArrangement=Arrangement.spacedBy(9.dp),verticalArrangement=Arrangement.spacedBy(9.dp)){
                repeat(count){index->Column(Modifier.clickable(enabled=!solved){if(index !in touched){touched=touched+index;vm.say(touched.size.toString())}},horizontalAlignment=Alignment.CenterHorizontally){
                    Illustration(round.item?:"number_motif_0",Modifier.size(54.dp),"第${index+1}个水果${if(index in touched)"，已数过" else ""}")
                    Text(if(index in touched)"✓" else "·",color=MaterialTheme.colorScheme.primary)
                }}
            }
            Text(if(count==0)"篮子里没有水果。" else "可以先点点水果，一个一个数。已数 ${touched.size} 个。",style=MaterialTheme.typography.bodySmall)
        }
        "compare"->{
            Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.Bottom,horizontalArrangement=Arrangement.spacedBy(12.dp)){
                (round.counts?:listOf(0,1)).forEachIndexed{index,count->Column(Modifier.weight(1f),horizontalAlignment=Alignment.CenterHorizontally){
                    if(index==0)Illustration("rabbit",Modifier.size(55.dp),"小兔") else Spacer(Modifier.height(55.dp))
                    CountBasket(count,round.item?:"number_motif_7",Modifier.fillMaxWidth().height(160.dp))
                    Text(if(index==0)"左边的篮子" else "右边的篮子",style=MaterialTheme.typography.labelLarge)
                }}
            }
        }
        "train","alphabet-train"->{
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(vertical=10.dp),horizontalArrangement=Arrangement.spacedBy(8.dp),verticalAlignment=Alignment.Bottom){
                Illustration("train_engine",Modifier.size(94.dp),"数字小火车")
                val values=if(round.scene=="alphabet-train")round.display.orEmpty().split("→").map{it.trim()} else round.values.orEmpty().map{if(it<0)"?" else it.toString()}
                values.forEach{value->Column(horizontalAlignment=Alignment.CenterHorizontally){
                    Surface(shape=RoundedCornerShape(12.dp),color=MaterialTheme.colorScheme.secondaryContainer){Text(if(value=="?" && solved)round.answer.first() else value,Modifier.padding(horizontal=20.dp,vertical=17.dp),fontSize=31.sp,fontWeight=FontWeight.Bold)}
                    Text("●     ●",color=MaterialTheme.colorScheme.primary)
                }}
            }
        }
        "drum"->{
            Drum(Modifier.alignInScene().size(140.dp))
            Row(horizontalArrangement=Arrangement.spacedBy(10.dp)){
                PrimaryButton(if(listening.playing)"正在敲鼓，请完整听一听…" else if(!vm.progress.speech)"开启声音，听听鼓点" else "♫ 敲一敲，再听一次",{
                    if(listening.start()){
                        if(!vm.progress.speech)vm.setSpeech(true)
                        onListeningChange()
                        vm.playDrums(round.count?:1){heard->if(heard)listening.finish()else listening.cancel();onListeningChange()}
                    }
                },enabled=!solved && !listening.playing)
            }
            TextButton(onClick={listening.showHint();onListeningChange()},enabled=!solved && !listening.hintVisible){Text(if(listening.hintVisible)"圆点提示已展开" else "打开圆点提示（无声也能玩）")}
            if(listening.hintVisible)FlowRow(horizontalArrangement=Arrangement.spacedBy(12.dp)){repeat(round.count?:0){Text("●",fontSize=30.sp,color=MaterialTheme.colorScheme.primary)}}
            if(!listening.canAnswer)Text("完整听完鼓点，或展开圆点提示后再回答。",style=MaterialTheme.typography.bodySmall)
        }
        "picnic"->{
            Row(verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(20.dp)){
                Illustration("bear",Modifier.size(120.dp),"等待小饼干的小熊")
                Surface(shape=RoundedCornerShape(18.dp),color=MaterialTheme.colorScheme.secondaryContainer){Text("我的订单\n${round.count} 块饼干",Modifier.padding(20.dp),fontSize=23.sp,lineHeight=32.sp,fontWeight=FontWeight.Bold)}
            }
        }
    }
}
private fun Modifier.alignInScene()=this
@Composable private fun CountBasket(count:Int,asset:String,modifier:Modifier){
    Box(modifier.semantics{contentDescription="篮子里有$count 个物品"},contentAlignment=Alignment.BottomCenter){
        Canvas(Modifier.fillMaxWidth().height(80.dp)){
            val w=size.width;val h=size.height
            drawRoundRect(Color(0xffd0ab70),Offset(w*.07f,h*.28f),Size(w*.86f,h*.65f),CornerRadius(13f))
            drawLine(Color(0xff96774a),Offset(w*.06f,h*.28f),Offset(w*.94f,h*.28f),5f,StrokeCap.Round)
            repeat(5){i->val x=w*(.18f+i*.16f);drawLine(Color(0xffb48d52),Offset(x,h*.35f),Offset(x,h*.88f),2f)}
            repeat(3){i->val y=h*(.43f+i*.19f);drawLine(Color(0xffb48d52),Offset(w*.12f,y),Offset(w*.88f,y),2f)}
        }
        FlowRow(Modifier.fillMaxWidth().padding(horizontal=8.dp).padding(bottom=44.dp),horizontalArrangement=Arrangement.Center,verticalArrangement=Arrangement.spacedBy(2.dp)){
            repeat(count){Illustration(asset,Modifier.size(27.dp),null)}
        }
    }
}
@Composable private fun Drum(modifier:Modifier){Canvas(modifier.semantics{contentDescription="小鼓，点击按钮听鼓声"}){
    val w=size.width;val h=size.height
    drawRoundRect(Color(0xffd98968),Offset(w*.15f,h*.36f),Size(w*.7f,h*.43f),CornerRadius(w*.05f))
    drawOval(Color(0xfff0d9a5),Offset(w*.13f,h*.2f),Size(w*.74f,h*.4f))
    drawOval(Color(0xff9c7753),Offset(w*.13f,h*.2f),Size(w*.74f,h*.4f),style=Stroke(4f))
    drawLine(Color(0xff967750),Offset(w*.08f,h*.05f),Offset(w*.6f,h*.38f),w*.045f,StrokeCap.Round)
    drawLine(Color(0xff967750),Offset(w*.92f,h*.05f),Offset(w*.4f,h*.38f),w*.045f,StrokeCap.Round)
}}

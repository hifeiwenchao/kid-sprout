package com.feiwenchao.kidsprout

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties

@Composable fun AchievementsDialog(vm:AppState,dismiss:()->Unit){Dialog(dismiss,properties=DialogProperties(usePlatformDefaultWidth=false)){
    Surface(Modifier.fillMaxWidth(.94f).widthIn(max=660.dp).fillMaxHeight(.9f),shape=androidx.compose.foundation.shape.RoundedCornerShape(24.dp)){
        Column(Modifier.padding(22.dp),verticalArrangement=Arrangement.spacedBy(14.dp)){
            Row{Text("我的小成就 ✦",Modifier.weight(1f),style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold);TextButton(dismiss){Text("关闭")}}
            Text("每一次努力，都闪闪发光。认识 ${vm.progress.learned.size} 个数字 · 完成 ${vm.progress.learnedPinyin.size} 课拼音 · 认识 ${vm.progress.learnedLetters.size} 个字母")
            LazyColumn(Modifier.weight(1f),verticalArrangement=Arrangement.spacedBy(10.dp)){
                achievements(vm.progress).forEach{badge->item{Panel(tint=if(badge.earned)MaterialTheme.colorScheme.secondaryContainer else MaterialTheme.colorScheme.surfaceVariant){
                    Row(horizontalArrangement=Arrangement.spacedBy(15.dp)){
                        Text(if(badge.earned)badge.symbol else "♧",fontSize=32.sp)
                        Column(verticalArrangement=Arrangement.spacedBy(5.dp)){Text(badge.title,fontWeight=FontWeight.Bold);Text(badge.description,style=MaterialTheme.typography.bodySmall);Text(if(badge.earned)"已获得 · 你真棒！" else "等待你来点亮",style=MaterialTheme.typography.labelMedium,color=MaterialTheme.colorScheme.primary)}
                    }
                }}}
            }
            PrimaryButton("继续探索",dismiss)
        }
    }
}}

@file:OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
package com.feiwenchao.kidsprout

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable fun HomePage(vm:AppState){
    val nextNumber=vm.curriculum.nextNumber(vm.progress)
    val nextPinyin=vm.curriculum.nextPinyin(vm.progress)
    val nextLetter=vm.curriculum.nextLetter(vm.progress)
    val openNumbers={vm.selectNumber(nextNumber);vm.page=Page.NUMBERS;vm.lessonDialog="numbers"}
    LazyColumn(Modifier.fillMaxSize(),contentPadding=PaddingValues(22.dp),verticalArrangement=Arrangement.spacedBy(22.dp)){
        item{PageTitle("HELLO, LITTLE EXPLORER","今天，也有新发现 ✦","每一点好奇，都会长大。和爸爸妈妈一起，开启今天的探索吧。")}
        item{Panel(tint=MaterialTheme.colorScheme.secondaryContainer){
            Row(verticalAlignment=Alignment.CenterVertically){
                Column(Modifier.weight(1f),verticalArrangement=Arrangement.spacedBy(14.dp)){
                    Text("小小的探索，大大的世界",style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold)
                    Text("认识数字，拼读声音，\n和字母一起发现新朋友。",lineHeight=26.sp)
                    PrimaryButton("开始今天的探索 →",openNumbers)
                }
                Illustration("number_garden",Modifier.widthIn(max=190.dp).weight(.7f).height(175.dp),"数字乐园")
            }
        }}
        item{SectionTitle("选择一个学习空间","三片小天地，装满新的好奇心")}
        item{BoxWithConstraints{
            val columns=if(maxWidth>=700.dp)3 else 1
            val cardWidth=(maxWidth-12.dp*(columns-1))/columns
            FlowRow(maxItemsInEachRow=columns,horizontalArrangement=Arrangement.spacedBy(12.dp),verticalArrangement=Arrangement.spacedBy(12.dp)){
                listOf(Triple(Page.NUMBERS,"0 — 10","认识数字，感受数量"),Triple(Page.PINYIN,"a o e","听听声音，慢慢拼读"),Triple(Page.ALPHABET,"Aa Bb Cc","认识字母，发现新单词")).forEachIndexed{index,(page,art,note)->
                    OutlinedCard(onClick={vm.page=page},modifier=Modifier.width(cardWidth),shape=androidx.compose.foundation.shape.RoundedCornerShape(20.dp),colors=CardDefaults.outlinedCardColors(containerColor=MaterialTheme.colorScheme.surface)){
                        Column(Modifier.padding(20.dp),verticalArrangement=Arrangement.spacedBy(10.dp)){
                            Text("0${index+1}  LEARNING SPACE",style=MaterialTheme.typography.labelSmall)
                            Text(page.label,style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold)
                            Text(note,style=MaterialTheme.typography.bodyMedium)
                            Text(art,fontSize=39.sp,color=MaterialTheme.colorScheme.primary,fontWeight=FontWeight.Bold)
                            val learned=when(page){Page.NUMBERS->vm.progress.learned.size;Page.PINYIN->vm.progress.learnedPinyin.size;else->vm.progress.learnedLetters.size}
                            val total=when(page){Page.NUMBERS->11;Page.PINYIN->14;else->26}
                            LinearProgressIndicator(progress={learned.toFloat()/total},modifier=Modifier.fillMaxWidth())
                            Text("已认识 $learned / $total  ·  20 个小游戏  →",style=MaterialTheme.typography.labelMedium)
                        }
                    }
                }
            }
        }}
        item{Panel{SectionTitle("接着上次的小发现")
            ContinueRow("数字乐园",if(vm.progress.learned.size==11)"复习数字 0" else "认识数字 $nextNumber",openNumbers)
            ContinueRow("拼音天地",if(vm.progress.learnedPinyin.size==14)"复习 ${nextPinyin.title}" else "第 ${nextPinyin.number} 课 ${nextPinyin.title}"){vm.selectPinyin(nextPinyin.symbols.first());vm.page=Page.PINYIN;vm.lessonDialog="pinyin"}
            ContinueRow("字母森林",if(vm.progress.learnedLetters.size==26)"复习 Aa" else "认识 ${nextLetter.uppercase}${nextLetter.lowercase}"){vm.selectLetter(nextLetter.id);vm.page=Page.ALPHABET;vm.lessonDialog="alphabet"}
        }}
        item{SectionTitle("玩一会儿，也学一点","在小游戏里收获快乐和小星星")}
        item{FlowRow(horizontalArrangement=Arrangement.spacedBy(12.dp),verticalArrangement=Arrangement.spacedBy(12.dp)){
            listOf("numbers-count","pinyin-listen","alphabet-match").mapNotNull{id->vm.activities.games.find{it.id==id}}.forEach{game->GameCard(game,Modifier.fillMaxWidth()){vm.startGame(game)}}
        }}
        item{Panel(tint=MaterialTheme.colorScheme.secondaryContainer){Text("✎  把今天的想象，画下来",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold);Text("拿起画笔涂一涂，也可以描描数字和大小写字母。")
            PrimaryButton("打开小小画板 →",{vm.page=Page.DRAWING})}}
        item{Text("🌱 免费 · 离线可用 · 无广告\n建议家长陪伴，探索一会儿，也别忘了休息。",style=MaterialTheme.typography.bodySmall,lineHeight=23.sp)}
    }
}
@Composable private fun ContinueRow(title:String,lesson:String,onClick:()->Unit){OutlinedButton(onClick,modifier=Modifier.fillMaxWidth().heightIn(min=56.dp),shape=androidx.compose.foundation.shape.RoundedCornerShape(13.dp)){Text(title,Modifier.weight(1f));Text("$lesson  →")}}
@Composable fun ParentsPage(vm:AppState,author:()->Unit){LazyColumn(Modifier.fillMaxSize(),contentPadding=PaddingValues(24.dp),verticalArrangement=Arrangement.spacedBy(20.dp)){
    item{PageTitle("家长区 · 陪伴是最好的启蒙","陪孩子，一点点长大","不急着学会，先享受发现的快乐。")}
    item{Panel{SectionTitle("学习小记录");Text("数字 ${vm.progress.learned.size}/11 · 拼音 ${vm.progress.learnedPinyin.size}/14 课 · 字母 ${vm.progress.learnedLetters.size}/26");Text("游戏通关 ${vm.progress.stars} 次 · 来探索过 ${vm.progress.visitDates.size} 天");Text("课程完成与游戏奖励分别保存。学习记录和画作仅保存在当前安装，卸载后会移除；没有账号、广告、内购或分析服务。",lineHeight=25.sp)}}
    item{Panel{Row(verticalAlignment=Alignment.CenterVertically){Text("中英文点读",Modifier.weight(1f),fontWeight=FontWeight.Bold);Switch(vm.progress.speech,{vm.setSpeech(it)})};Text(vm.speechStatus);Text("拼音使用合成语音播放例字读音参考，不等同于标准拼音音素录音。声母轻短音请配合老师或家长示范。字母名和单词使用英语声音。",lineHeight=25.sp)}}
    item{Panel{SectionTitle("轻松学，慢慢长大");Text("低龄孩子可以先认识数字与字母，拼音按入学准备情况循序渐进。答错可以再试，不扣分；描画不自动判断字形，也不额外累计奖励。",lineHeight=25.sp);Text("记忆小剧场播放后自动停下，支持重播；系统关闭动画时展示静态图。请在纸上继续练写，注意休息。",lineHeight=25.sp)}}
    item{PrimaryButton("关于作者",author)}
}}

@file:OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
package com.feiwenchao.kidsprout

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

@Composable fun GameLibrary(vm:AppState){
    var subject by remember{mutableStateOf("all")};var category by remember{mutableStateOf("all")};var query by remember{mutableStateOf("")}
    val games=vm.activities.filter(subject,category,query)
    LazyColumn(Modifier.fillMaxSize(),contentPadding=PaddingValues(22.dp),verticalArrangement=Arrangement.spacedBy(18.dp)){
        item{PageTitle("PLAY & DISCOVER","游戏大厅","60 个小游戏，把好奇变成快乐。选一个喜欢的，慢慢试一试。")}
        item{FlowRow(horizontalArrangement=Arrangement.spacedBy(8.dp),verticalArrangement=Arrangement.spacedBy(7.dp)){
            (mapOf("all" to "全部学科")+subjectNames).forEach{(value,label)->FilterChip(subject==value,{subject=value},label={Text("$label ${if(value=="all")60 else 20}")})}
        }}
        item{Panel(tint=MaterialTheme.colorScheme.surfaceVariant){
            OutlinedTextField(query,{query=it},label={Text("搜索小游戏")},placeholder={Text("名称、玩法或练习目标")},singleLine=true,modifier=Modifier.fillMaxWidth())
            Text("想练习什么？",fontWeight=FontWeight.Bold)
            FlowRow(horizontalArrangement=Arrangement.spacedBy(7.dp),verticalArrangement=Arrangement.spacedBy(6.dp)){
                (mapOf("all" to "全部目标")+categoryNames).forEach{(value,label)->FilterChip(category==value,{category=value},label={Text(label)})}
            }
        }}
        item{Text("找到 ${games.size} 个小游戏",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)}
        if(games.isEmpty())item{Panel{Text("🌱 还没找到这个小游戏",style=MaterialTheme.typography.titleLarge);Text("换一个关键词，或者试试其他学科和练习目标。")
            PrimaryButton("清除筛选",{subject="all";category="all";query=""})}}
        else item{GameGrid(games){vm.startGame(it)}}
    }
}
@Composable fun SubjectGames(vm:AppState,subject:String){Column(verticalArrangement=Arrangement.spacedBy(16.dp)){
    SectionTitle("在游戏里，再发现一点","20 个小游戏 · 按练习目标慢慢探索")
    categoryNames.forEach{(category,label)->val games=vm.activities.filter(subject,category);if(games.isNotEmpty()){
        Text("$label · ${games.size} 个游戏",fontWeight=FontWeight.Bold)
        GameGrid(games){vm.startGame(it)}
    }}
}}
@Composable fun GameGrid(games:List<NativeGame>,start:(NativeGame)->Unit){BoxWithConstraints{
    val columns=if(maxWidth>=800.dp)3 else if(maxWidth>=550.dp)2 else 1
    Column(verticalArrangement=Arrangement.spacedBy(12.dp)){
        games.chunked(columns).forEach{row->Row(horizontalArrangement=Arrangement.spacedBy(12.dp)){
            row.forEach{game->GameCard(game,Modifier.weight(1f)){start(game)}}
            repeat(columns-row.size){Spacer(Modifier.weight(1f))}
        }}
    }
}}
@Composable fun GameCard(game:NativeGame,modifier:Modifier=Modifier,start:()->Unit){OutlinedCard(start,modifier,shape=RoundedCornerShape(19.dp),colors=CardDefaults.outlinedCardColors(containerColor=MaterialTheme.colorScheme.surface)){
    Row(Modifier.fillMaxWidth().padding(18.dp),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(14.dp)){
        Surface(shape=RoundedCornerShape(15.dp),color=MaterialTheme.colorScheme.secondaryContainer){Box(Modifier.size(54.dp),contentAlignment=Alignment.Center){Text(game.symbol,fontSize=25.sp)}}
        Column(Modifier.weight(1f),verticalArrangement=Arrangement.spacedBy(5.dp)){
            Text("${subjectNames[game.subject]} · ${game.skill}",style=MaterialTheme.typography.labelSmall,color=MaterialTheme.colorScheme.primary)
            Text(game.title,style=MaterialTheme.typography.titleMedium,fontWeight=FontWeight.Bold)
            Text(game.description,style=MaterialTheme.typography.bodySmall,lineHeight=20.sp)
        }
        Text("›",fontSize=24.sp,color=MaterialTheme.colorScheme.primary)
    }
}}

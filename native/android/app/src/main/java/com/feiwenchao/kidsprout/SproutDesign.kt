package com.feiwenchao.kidsprout

import android.graphics.BitmapFactory
import androidx.compose.foundation.Image
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable fun SproutTheme(content:@Composable ()->Unit){
    val scheme=if(isSystemInDarkTheme())darkColorScheme(primary=Color(0xffb5cc9c),onPrimary=Color(0xff25351f),secondary=Color(0xffd8c7eb),background=Color(0xff20251e),surface=Color(0xff282f24),surfaceVariant=Color(0xff37432f),secondaryContainer=Color(0xff3a4931),onSurfaceVariant=Color(0xffc1ccb7),outlineVariant=Color(0xff526049))
    else lightColorScheme(primary=Color(0xff52775e),onPrimary=Color.White,secondary=Color(0xff80628f),tertiary=Color(0xff826621),background=Color(0xfffafbf4),surface=Color(0xfffffefa),surfaceVariant=Color(0xfff0f4e7),secondaryContainer=Color(0xffeaf0df),onBackground=Color(0xff344b40),onSurface=Color(0xff344b40),onSurfaceVariant=Color(0xff59684f),outline=Color(0xff86957a),outlineVariant=Color(0xffe0e7d6))
    MaterialTheme(colorScheme=scheme,content=content)
}
@Composable fun PageTitle(kicker:String,title:String,subtitle:String){Column(verticalArrangement=Arrangement.spacedBy(9.dp),modifier=Modifier.padding(bottom=8.dp)){
    Text(kicker,style=MaterialTheme.typography.labelSmall,letterSpacing=.5.sp,color=MaterialTheme.colorScheme.onSurfaceVariant)
    Text(title,style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold)
    Text(subtitle,style=MaterialTheme.typography.bodyMedium,color=MaterialTheme.colorScheme.onSurfaceVariant,lineHeight=24.sp)
}}
@Composable fun Panel(modifier:Modifier=Modifier,tint:Color=MaterialTheme.colorScheme.surface,content:@Composable ColumnScope.()->Unit){
    OutlinedCard(modifier.fillMaxWidth(),shape=RoundedCornerShape(22.dp),colors=CardDefaults.outlinedCardColors(containerColor=tint),border=androidx.compose.foundation.BorderStroke(1.dp,MaterialTheme.colorScheme.outlineVariant)){
        Column(Modifier.padding(20.dp),verticalArrangement=Arrangement.spacedBy(13.dp),content=content)
    }
}
@Composable fun Illustration(name:String,modifier:Modifier=Modifier,description:String?=null,scale:ContentScale=ContentScale.Fit){
    val context=LocalContext.current
    val bitmap=remember(name){runCatching{context.assets.open("illustrations/$name.png").use{BitmapFactory.decodeStream(it)?.asImageBitmap()}}.getOrNull()}
    bitmap?.let{Image(it,description,modifier,contentScale=scale)}
}
@Composable fun PrimaryButton(text:String,onClick:()->Unit,modifier:Modifier=Modifier,enabled:Boolean=true){Button(onClick,modifier.heightIn(min=48.dp),enabled=enabled,shape=RoundedCornerShape(13.dp)){Text(text,fontWeight=FontWeight.Bold)}}
@Composable fun SectionTitle(title:String,note:String?=null){Column(verticalArrangement=Arrangement.spacedBy(5.dp)){Text(title,style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold);note?.let{Text(it,style=MaterialTheme.typography.bodyMedium,color=MaterialTheme.colorScheme.onSurfaceVariant)}}}
@Composable fun SpeechButton(vm:AppState,label:String,text:String,language:String="zh-CN",enabled:Boolean=true){
    OutlinedButton(onClick={if(!vm.progress.speech)vm.setSpeech(true);vm.say(text,language)},enabled=enabled,modifier=Modifier.heightIn(min=48.dp)){
        Text(if(vm.progress.speech)label else "开启声音 · ${label.removePrefix("♫ ")}")
    }
}

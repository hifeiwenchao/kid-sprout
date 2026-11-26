@file:OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
package com.feiwenchao.kidsprout

import android.app.Application
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas as AndroidCanvas
import android.graphics.Paint as AndroidPaint
import android.graphics.Path as AndroidPath
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.RectF
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.graphics.createBitmap

private val drawingPalette=listOf(0xff52775eL,0xff91ad73L,0xffe2b755L,0xffe99958L,0xffdc7c79L,0xffe3a0b2L,0xffad90c5L,0xff7f95c8L,0xff74a9bfL,0xff8bc5bcL,0xffa78265L,0xff414c48L)
private val colorNames=listOf("森林绿","嫩芽绿","阳光黄","橘子橙","珊瑚红","花瓣粉","葡萄紫","蓝莓蓝","天空蓝","薄荷青","小熊棕","石墨黑")
@Composable fun DrawingWorkspace(vm:AppState,fullscreen:Boolean,toggleFullscreen:()->Unit,save:()->Unit){
    var color by remember{mutableLongStateOf(drawingPalette[0])};var width by remember{mutableFloatStateOf(.008f)}
    var tool by remember{mutableStateOf("画笔")};var grid by remember{mutableStateOf(false)}
    var clear by remember{mutableStateOf(false)};var custom by remember{mutableStateOf(false)}
    var showCompactTools by remember{mutableStateOf(false)}
    val revision=vm.drawingRevision
    val template=vm.curriculum.tracingTemplates.find{it.id==vm.drawing.template}
    BoxWithConstraints(Modifier.fillMaxSize()){
        val toolColumnWidth=minOf(260.dp,maxWidth*.36f)
        val sideTools=maxWidth>740.dp || (maxWidth>=600.dp && maxHeight<440.dp)
        val tools:@Composable ()->Unit={
            Panel{
                Text("我的小工具箱 ✦",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold)
                Text("选一支画笔",style=MaterialTheme.typography.labelLarge)
                FlowRow(horizontalArrangement=Arrangement.spacedBy(5.dp)){listOf("画笔","荧光笔","橡皮擦").forEach{t->FilterChip(tool==t,{tool=t},label={Text(t)})}}
                Text("给想象一点颜色",style=MaterialTheme.typography.labelLarge)
                FlowRow(horizontalArrangement=Arrangement.spacedBy(3.dp),verticalArrangement=Arrangement.spacedBy(3.dp)){
                    drawingPalette.forEachIndexed{index,c->Box(Modifier.size(48.dp).clip(CircleShape).clickable{color=c;if(tool=="橡皮擦")tool="画笔"}.semantics{contentDescription="${colorNames[index]}画笔";selected=color==c},contentAlignment=Alignment.Center){Box(Modifier.size(31.dp).background(Color(c),CircleShape).then(if(color==c)Modifier.border(3.dp,MaterialTheme.colorScheme.onSurface,CircleShape) else Modifier))}}
                }
                OutlinedButton(onClick={custom=true}){Text("＋ 自选颜色")}
                Text("画笔粗细",style=MaterialTheme.typography.labelLarge)
                Slider(width,{width=it},valueRange=.002f..0.048f,modifier=Modifier.semantics{contentDescription="画笔粗细"})
                Text("每一笔，都是独一无二的你。",style=MaterialTheme.typography.bodySmall)
            }
        }
        val paper:@Composable ()->Unit={
            FlowRow(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(8.dp),verticalArrangement=Arrangement.spacedBy(6.dp),itemVerticalAlignment=Alignment.CenterVertically){
                Text("小小画板 ✧",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold)
                OutlinedButton(toggleFullscreen){Text(if(fullscreen)"退出全屏" else "全屏")}
                PrimaryButton("保存我的画",save)
            }
            Text("让想象力，跟着小手自由生长。",style=MaterialTheme.typography.bodyMedium)
            FlowRow(horizontalArrangement=Arrangement.spacedBy(7.dp),verticalArrangement=Arrangement.spacedBy(6.dp)){
                listOf("free" to "自由画画","numbers" to "数字 0–10","alphabet" to "字母 Aa–Zz").forEach{(group,label)->
                    FilterChip(if(group=="free")template==null else template?.group==group,{vm.editDrawing{selectTemplate(if(group=="free")null else vm.curriculum.tracingTemplates.first{it.group==group}.id)}},label={Text(label)})
                }
            }
            if(template!=null){
                val group=vm.curriculum.tracingTemplates.filter{it.group==template.group};val current=group.indexOf(template)
                var chooseCharacter by remember{mutableStateOf(false)}
                Box{OutlinedButton(onClick={chooseCharacter=true},modifier=Modifier.heightIn(min=48.dp)){Text("选择字符 · ${template.label} ▾")}
                    DropdownMenu(expanded=chooseCharacter,onDismissRequest={chooseCharacter=false}){group.forEach{t->DropdownMenuItem(text={Text("${t.label}${if(t.id==template.id)" ✓" else ""}")},onClick={vm.editDrawing{selectTemplate(t.id)};chooseCharacter=false})}}
                }
                Row(verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(10.dp)){
                    OutlinedButton(onClick={vm.editDrawing{selectTemplate(group[current-1].id)}},enabled=current>0){Text("‹")}
                    Text("正在临摹 ${template.label}",fontWeight=FontWeight.Bold)
                    OutlinedButton(onClick={vm.editDrawing{selectTemplate(group[current+1].id)}},enabled=current<group.lastIndex){Text("›")}
                }
                Text("切换字符会清空笔迹，误切可撤销找回。",style=MaterialTheme.typography.bodySmall)
            }
            FlowRow(horizontalArrangement=Arrangement.spacedBy(8.dp)){
                OutlinedButton(onClick={vm.editDrawing{undo()}},enabled=vm.drawing.canUndo){Text("↶ 撤销")}
                OutlinedButton(onClick={vm.editDrawing{redo()}},enabled=vm.drawing.canRedo){Text("↷ 重做")}
                FilterChip(grid,{grid=!grid},label={Text("网格")})
                OutlinedButton(onClick={clear=true},enabled=vm.drawing.strokes.isNotEmpty()){Text("清空")}
            }
            Box(Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.secondaryContainer,RoundedCornerShape(20.dp)).padding(14.dp)){
                InkPaper(vm.drawing.strokes,template?.asset,color,width,tool=="橡皮擦",if(tool=="荧光笔").35f else 1f,grid,Modifier.fillMaxWidth().aspectRatio(vm.drawing.paperWidth.toFloat()/vm.drawing.paperHeight),revision){vm.addStroke(it)}
            }
            Text(vm.drawingStatus,style=MaterialTheme.typography.bodySmall)
        }
        if(sideTools) Row(Modifier.fillMaxSize().padding(16.dp),horizontalArrangement=Arrangement.spacedBy(16.dp)){
            Column(Modifier.width(toolColumnWidth).fillMaxHeight().verticalScroll(rememberScrollState())){tools()}
            Column(Modifier.weight(1f).fillMaxHeight().verticalScroll(rememberScrollState()),verticalArrangement=Arrangement.spacedBy(10.dp)){paper()}
        }else Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(18.dp),verticalArrangement=Arrangement.spacedBy(14.dp)){
            Panel(tint=MaterialTheme.colorScheme.secondaryContainer){
                FlowRow(horizontalArrangement=Arrangement.spacedBy(6.dp),verticalArrangement=Arrangement.spacedBy(5.dp)){
                    listOf("画笔","荧光笔","橡皮擦").forEach{t->FilterChip(tool==t,{tool=t},label={Text(t)})}
                    OutlinedButton(onClick={showCompactTools=!showCompactTools},modifier=Modifier.heightIn(min=48.dp)){Text(if(showCompactTools)"收起颜色与粗细" else "颜色与粗细 ▾")}
                }
            }
            if(showCompactTools)tools()
            paper()
        }
    }
    if(clear)AlertDialog(onDismissRequest={clear=false},title={Text("换一张空白画纸？")},text={Text("底稿会保留；清空后可以撤销，找回刚才的画。")},confirmButton={TextButton(onClick={vm.editDrawing{clear()};clear=false}){Text("清空画纸")}},dismissButton={TextButton(onClick={clear=false}){Text("再画一会儿")}})
    if(custom)ColorChooser(color,{color=it;custom=false;if(tool=="橡皮擦")tool="画笔"},{custom=false})
}
@Composable private fun ColorChooser(initial:Long,choose:(Long)->Unit,dismiss:()->Unit){
    var red by remember{mutableFloatStateOf(((initial shr 16)and 255).toFloat())};var green by remember{mutableFloatStateOf(((initial shr 8)and 255).toFloat())};var blue by remember{mutableFloatStateOf((initial and 255).toFloat())}
    val color=0xff000000L or(red.toLong() shl 16)or(green.toLong() shl 8)or blue.toLong()
    AlertDialog(onDismissRequest=dismiss,title={Text("选择你的颜色")},text={Column{
        Box(Modifier.fillMaxWidth().height(48.dp).background(Color(color),RoundedCornerShape(10.dp)))
        Text("红");Slider(red,{red=it},valueRange=0f..255f)
        Text("绿");Slider(green,{green=it},valueRange=0f..255f)
        Text("蓝");Slider(blue,{blue=it},valueRange=0f..255f)
    }},confirmButton={TextButton(onClick={choose(color)}){Text("选好啦")}},dismissButton={TextButton(onClick=dismiss){Text("返回")}})
}
@Composable fun InkPaper(strokes:List<InkStroke>,asset:String?,color:Long,width:Float,eraser:Boolean,opacity:Float,grid:Boolean,modifier:Modifier,revision:Int=0,add:(InkStroke)->Unit){
    var active by remember(asset){mutableStateOf<List<InkPoint>>(emptyList())}
    Box(modifier.clip(RoundedCornerShape(10.dp)).background(Color.White).border(1.dp,Color(0xffdbe3d2),RoundedCornerShape(10.dp))){
        if(asset!=null)Illustration(asset,Modifier.fillMaxSize(),null,ContentScale.FillBounds)
        Canvas(Modifier.fillMaxSize().semantics{contentDescription=if(asset==null)"白色自由画纸，使用手指或触控笔绘画" else "虚线临摹画纸，底稿不会被橡皮和清空擦除"}.pointerInput(color,width,eraser,opacity,asset){
            awaitEachGesture {
                val down=awaitFirstDown(requireUnconsumed=false)
                fun point(p:Offset)=InkPoint((p.x/size.width).coerceIn(0f,1f),(p.y/size.height).coerceIn(0f,1f))
                val points=mutableListOf(point(down.position));active=points.toList();down.consume()
                try {
                    do{val event=awaitPointerEvent();val change=event.changes.firstOrNull{it.id==down.id}?:break
                        val p=point(change.position);if(points.size<20_000 && points.last()!=p)points.add(p)
                        active=points.toList();change.consume();val pressed=change.pressed
                    }while(pressed)
                    add(InkStroke(points.toList(),color,width,eraser,opacity))
                }finally{active=emptyList()}
            }
        }){
            @Suppress("UNUSED_VARIABLE")val redraw=revision
            if(grid){for(i in 1..9){drawLine(Color(0xffe5eadf),Offset(size.width*i/10,0f),Offset(size.width*i/10,size.height),1f);drawLine(Color(0xffe5eadf),Offset(0f,size.height*i/10),Offset(size.width,size.height*i/10),1f)}}
            if(asset!=null)listOf(.25f,.5f,.75f).forEach{y->drawLine(Color(0xffd9e1d1),Offset(0f,size.height*y),Offset(size.width,size.height*y),1.3f,pathEffect=PathEffect.dashPathEffect(floatArrayOf(6f,7f)))}
            drawIntoCanvas{canvas->canvas.saveLayer(Rect(Offset.Zero,size),Paint());strokes.forEach{drawInk(it)};if(active.isNotEmpty())drawInk(InkStroke(active,color,width,eraser,opacity));canvas.restore()}
        }
    }
}
private fun DrawScope.drawInk(stroke:InkStroke){
    val color=Color(stroke.color).copy(alpha=stroke.opacity);val width=stroke.width*size.width
    val blend=if(stroke.eraser)BlendMode.Clear else BlendMode.SrcOver
    if(stroke.points.size==1){val p=stroke.points.first();drawCircle(color,width/2,Offset(p.x*size.width,p.y*size.height),blendMode=blend)}
    else{val path=Path();stroke.points.forEachIndexed{i,p->if(i==0)path.moveTo(p.x*size.width,p.y*size.height)else path.lineTo(p.x*size.width,p.y*size.height)};drawPath(path,color,style=Stroke(width,cap=StrokeCap.Round,join=StrokeJoin.Round),blendMode=blend)}
}
fun renderDrawing(application:Application,document:DrawingDocument,curriculum:Curriculum):Bitmap{
    val width=document.paperWidth;val height=document.paperHeight
    val bitmap=createBitmap(width,height,Bitmap.Config.ARGB_8888);val canvas=AndroidCanvas(bitmap);canvas.drawColor(android.graphics.Color.WHITE)
    curriculum.tracingTemplates.find{it.id==document.template}?.let{template->application.assets.open("illustrations/${template.asset}.png").use{stream->BitmapFactory.decodeStream(stream)?.let{guide->canvas.drawBitmap(guide,null,RectF(0f,0f,width.toFloat(),height.toFloat()),null);guide.recycle()}}}
    val ink=createBitmap(width,height,Bitmap.Config.ARGB_8888);val inkCanvas=AndroidCanvas(ink)
    val paint=AndroidPaint(AndroidPaint.ANTI_ALIAS_FLAG).apply{strokeCap=AndroidPaint.Cap.ROUND;strokeJoin=AndroidPaint.Join.ROUND}
    document.strokes.forEach{stroke->
        paint.color=stroke.color.toInt();paint.alpha=(stroke.opacity*255).toInt();paint.strokeWidth=stroke.width*width
        paint.xfermode=if(stroke.eraser)PorterDuffXfermode(PorterDuff.Mode.CLEAR) else null
        if(stroke.points.size==1){paint.style=AndroidPaint.Style.FILL;val p=stroke.points.first();inkCanvas.drawCircle(p.x*width,p.y*height,paint.strokeWidth/2,paint)}
        else{paint.style=AndroidPaint.Style.STROKE;val path=AndroidPath();stroke.points.forEachIndexed{i,p->if(i==0)path.moveTo(p.x*width,p.y*height)else path.lineTo(p.x*width,p.y*height)};inkCanvas.drawPath(path,paint)}
    }
    canvas.drawBitmap(ink,0f,0f,null);ink.recycle();return bitmap
}

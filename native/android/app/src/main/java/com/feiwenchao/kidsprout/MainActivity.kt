@file:OptIn(androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
package com.feiwenchao.kidsprout

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Redo
import androidx.compose.material.icons.automirrored.filled.Undo
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlin.math.min
import kotlin.random.Random

class MainActivity : ComponentActivity() {
    private var state: AppState? = null
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SproutTheme {
                val vm: AppState = viewModel()
                state = vm
                SproutApp(vm)
            }
        }
    }
    override fun onStop() { super.onStop(); state?.stopSpeech() }
}

@Composable private fun SproutTheme(content: @Composable () -> Unit) {
    val dark = isSystemInDarkTheme()
    val scheme = if (dark) darkColorScheme(
        primary = Color(0xffb2dca0), onPrimary = Color(0xff17351c),
        secondary = Color(0xffffc486), background = Color(0xff18211b),
        surface = Color(0xff202b23), surfaceVariant = Color(0xff334337),
        onBackground = Color(0xffedf4e9), onSurface = Color(0xffedf4e9)
    ) else lightColorScheme(
        primary = Color(0xff386746), onPrimary = Color.White,
        secondary = Color(0xff9b5421), background = Color(0xfffffdf7),
        surface = Color(0xfffffdf7), surfaceVariant = Color(0xffe7efe1),
        onBackground = Color(0xff283c2f), onSurface = Color(0xff283c2f)
    )
    MaterialTheme(colorScheme = scheme, content = content)
}
private val Page.icon: ImageVector get() = when (this) {
    Page.HOME -> Icons.Default.Spa; Page.NUMBERS -> Icons.Default.LooksOne
    Page.GAMES -> Icons.Default.Extension; Page.DRAWING -> Icons.Default.Palette
    Page.PARENTS -> Icons.Default.FamilyRestroom
}

@Composable private fun SproutApp(vm: AppState) {
    var gateAction by remember { mutableStateOf<(() -> Unit)?>(null) }
    var parentsUnlocked by remember { mutableStateOf(false) }
    val gate: (() -> Unit) -> Unit = { gateAction = it }
    Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        BoxWithConstraints(Modifier.fillMaxSize().safeDrawingPadding()) {
            val wide = maxWidth >= 720.dp && maxHeight >= 520.dp
            Row(Modifier.fillMaxSize()) {
                if (wide) {
                    NavigationRail(Modifier.fillMaxHeight().width(120.dp),
                        containerColor = MaterialTheme.colorScheme.surfaceVariant,
                        header = {
                            Spacer(Modifier.height(24.dp))
                            Icon(Icons.Default.Spa,null,Modifier.size(42.dp),tint=MaterialTheme.colorScheme.primary)
                            Text("萌芽启蒙",fontWeight=FontWeight.Bold,modifier=Modifier.padding(vertical=12.dp))
                        }) {
                        Spacer(Modifier.height(24.dp))
                        Page.entries.forEach { page ->
                            NavigationRailItem(selected=vm.page==page,onClick={vm.page=page},
                                icon={Icon(page.icon,null)},label={Text(page.label)},
                                modifier=Modifier.padding(vertical=8.dp))
                        }
                    }
                }
                Column(Modifier.weight(1f)) {
                    Box(Modifier.weight(1f).fillMaxWidth(),contentAlignment=Alignment.TopCenter) {
                        Box(Modifier.widthIn(max=1060.dp).fillMaxSize()) {
                            when(vm.page) {
                                Page.HOME -> HomePage(vm)
                                Page.NUMBERS -> NumbersPage(vm)
                                Page.GAMES -> GamesPage(vm)
                                Page.DRAWING -> DrawingPage(vm) { gate { vm.shareDrawing() } }
                                Page.PARENTS -> ParentsPage(vm,parentsUnlocked,
                                    unlock={ gate { parentsUnlocked=true } },
                                    email={ gate { vm.emailAuthor() } })
                            }
                        }
                    }
                    if (!wide) NavigationBar(containerColor=MaterialTheme.colorScheme.surfaceVariant) {
                        Page.entries.forEach { page ->
                            NavigationBarItem(selected=vm.page==page,onClick={vm.page=page},
                                icon={Icon(page.icon,null)},label={Text(page.label)},alwaysShowLabel=true)
                        }
                    }
                }
            }
        }
    }
    if (gateAction != null) ParentGate(onDismiss={gateAction=null}) {
        val action=gateAction; gateAction=null; action?.invoke()
    }
    vm.message?.let { message ->
        AlertDialog(onDismissRequest={vm.message=null}, title={Text("温馨提示")},
            text={Text(message)},confirmButton={TextButton(onClick={vm.message=null}){Text("知道了")}})
    }
}

@Composable private fun PageTitle(eyebrow: String,title: String,subtitle: String) {
    Column(verticalArrangement=Arrangement.spacedBy(8.dp),modifier=Modifier.padding(bottom=12.dp)) {
        Text(eyebrow,color=MaterialTheme.colorScheme.primary,fontSize=13.sp,fontWeight=FontWeight.Bold)
        Text(title,style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold)
        Text(subtitle,style=MaterialTheme.typography.bodyMedium,color=MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
@Composable private fun SoftCard(modifier: Modifier=Modifier, content: @Composable ColumnScope.() -> Unit) {
    Card(modifier.fillMaxWidth(),shape=RoundedCornerShape(24.dp),
        colors=CardDefaults.cardColors(containerColor=MaterialTheme.colorScheme.surfaceVariant)) {
        Column(Modifier.padding(22.dp),verticalArrangement=Arrangement.spacedBy(14.dp),content=content)
    }
}
@Composable private fun BigButton(label: String,onClick: ()->Unit,modifier: Modifier=Modifier,
                                  enabled:Boolean=true,icon: ImageVector?=null) {
    Button(onClick,modifier.heightIn(min=52.dp),enabled=enabled,shape=RoundedCornerShape(16.dp)) {
        icon?.let { Icon(it,null,Modifier.size(20.dp)); Spacer(Modifier.width(8.dp)) }
        Text(label,fontWeight=FontWeight.Bold)
    }
}

@Composable private fun HomePage(vm:AppState) {
    LazyColumn(Modifier.fillMaxSize(),contentPadding=PaddingValues(24.dp),
        verticalArrangement=Arrangement.spacedBy(20.dp)) {
        item { PageTitle("萌芽启蒙 · 每一点好奇，都会长大","一起发现，小小世界","和家人一起，轻松认识数字、玩游戏、画出想象。") }
        item {
            SoftCard {
                Row(verticalAlignment=Alignment.CenterVertically) {
                    Column(Modifier.weight(1f),verticalArrangement=Arrangement.spacedBy(10.dp)) {
                        Text("今天也有新发现",style=MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold)
                        Text("从一个数字开始，\n让好奇心慢慢发芽。",lineHeight=26.sp)
                    }
                    SproutArt(Modifier.size(100.dp))
                }
                BigButton("继续认识 ${vm.progress.lastNumber}",{vm.selectNumber(vm.progress.lastNumber);vm.page=Page.NUMBERS},icon=Icons.AutoMirrored.Filled.ArrowForward)
            }
        }
        item {
            Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(12.dp)) {
                Stat("${vm.progress.learned.size} / 11","学过的数字",Modifier.weight(1f))
                Stat("${vm.progress.stars}","通关小星星",Modifier.weight(1f))
            }
        }
        item {
            Text("选一个喜欢的开始",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold)
        }
        item { ActivityCard("01","数字乐园","从 0 到 10，边看、边听、边数。",Icons.Default.LooksOne) {vm.page=Page.NUMBERS} }
        item { ActivityCard("02","小游戏","三种玩法，每局五关，慢慢试也很棒。",Icons.Default.Extension) {vm.page=Page.GAMES} }
        item { ActivityCard("03","小小画板","用颜色和线条，留下今天的想象。",Icons.Default.Palette) {vm.page=Page.DRAWING} }
        item { Text("适合家长陪伴 · 免费、无广告 · 内容离线可用",style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant) }
    }
}
@Composable private fun Stat(value:String,label:String,modifier:Modifier) {
    OutlinedCard(modifier,shape=RoundedCornerShape(20.dp)) {
        Column(Modifier.padding(20.dp),verticalArrangement=Arrangement.spacedBy(6.dp)) {
            Text(value,style=MaterialTheme.typography.headlineMedium,color=MaterialTheme.colorScheme.primary,fontWeight=FontWeight.Bold)
            Text(label,style=MaterialTheme.typography.labelLarge)
        }
    }
}
@Composable private fun ActivityCard(number:String,title:String,description:String,icon:ImageVector,action:()->Unit) {
    OutlinedCard(onClick=action,modifier=Modifier.fillMaxWidth(),shape=RoundedCornerShape(22.dp)) {
        Row(Modifier.padding(20.dp),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(16.dp)) {
            Icon(icon,null,Modifier.size(38.dp),tint=MaterialTheme.colorScheme.primary)
            Column(Modifier.weight(1f),verticalArrangement=Arrangement.spacedBy(4.dp)) {
                Text("$number  $title",fontWeight=FontWeight.Bold,style=MaterialTheme.typography.titleMedium)
                Text(description,style=MaterialTheme.typography.bodyMedium)
            }
            Icon(Icons.Default.ChevronRight,null)
        }
    }
}

@Composable private fun NumbersPage(vm:AppState) {
    val number=vm.selectedNumber
    val lesson=vm.curriculum.first {it.value==number}
    var touched by remember(number) {mutableStateOf(setOf<Int>())}
    val counter=remember(number) {FruitCounter(number)}
    var appleInBasket by remember(number) {mutableStateOf(false)}
    LazyColumn(Modifier.fillMaxSize(),contentPadding=PaddingValues(24.dp),verticalArrangement=Arrangement.spacedBy(20.dp)) {
        item {PageTitle("数字乐园 · 认识与数量","和数字交朋友","选一个数字，听一听，再把水果点一遍。")}
        item {
            FlowRow(horizontalArrangement=Arrangement.spacedBy(8.dp),verticalArrangement=Arrangement.spacedBy(8.dp)) {
                vm.curriculum.forEach { item ->
                    FilterChip(selected=number==item.value,onClick={vm.selectNumber(item.value)},
                        label={Text(item.value.toString(),fontSize=20.sp,fontWeight=FontWeight.Bold)},
                        trailingIcon=if(item.value in vm.progress.learned) {{Icon(Icons.Default.Check,null,Modifier.size(16.dp))}} else null,
                        modifier=Modifier.heightIn(min=52.dp).semantics{contentDescription="数字${item.value}，${if(item.value in vm.progress.learned) "已学过" else "还可以学习"}"})
                }
            }
        }
        item {
            SoftCard {
                Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.SpaceBetween) {
                    Text(number.toString(),fontSize=112.sp,fontWeight=FontWeight.ExtraBold,color=MaterialTheme.colorScheme.primary)
                    Column(horizontalAlignment=Alignment.CenterHorizontally,verticalArrangement=Arrangement.spacedBy(12.dp)) {
                        Text(lesson.name,fontSize=40.sp,fontWeight=FontWeight.Bold)
                        OutlinedButton(onClick={vm.say("数字，${lesson.name}")},modifier=Modifier.heightIn(min=52.dp)) {
                            Icon(Icons.AutoMirrored.Filled.VolumeUp,null);Spacer(Modifier.width(8.dp));Text("听一听")
                        }
                    }
                }
                if(number==0) {
                    Text("0 表示一个也没有",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold)
                    Basket(if(appleInBasket)1 else 0,Modifier.fillMaxWidth().height(140.dp))
                    Text(if(appleInBasket) "放进 1 个苹果，现在篮子里有 1 个。" else "空空的篮子里，一个苹果也没有。")
                    BigButton(if(appleInBasket) "拿走苹果，变成 0" else "放进 1 个苹果",{
                        appleInBasket=!appleInBasket
                        vm.say(if(appleInBasket) "一个苹果" else "一个也没有，是零")
                    })
                } else {
                    Text("点一下，就数一个",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold)
                    FlowRow(horizontalArrangement=Arrangement.spacedBy(8.dp),verticalArrangement=Arrangement.spacedBy(8.dp)) {
                        repeat(number) {index ->
                            FruitButton(index,index in touched) {
                                val count=counter.touch(index); touched=touched+index; vm.say(count.toString())
                            }
                        }
                    }
                    Text("已经数到 ${touched.size} / $number 个。${if(touched.size==number) "每个都找到啦！" else "试试把每个苹果都点一次。"}")
                }
            }
        }
        item {
            BigButton(if(number in vm.progress.learned) "已学过，也可以再练习" else "我认识这个数字啦",{vm.markLearned();vm.say("你又认识一个数字啦")},
                Modifier.fillMaxWidth(),icon=Icons.Default.CheckCircle)
        }
        item {
            Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.SpaceBetween) {
                TextButton(onClick={vm.selectNumber(number-1)},enabled=number>0,modifier=Modifier.heightIn(min=48.dp)) {Text("← 上一个")}
                TextButton(onClick={vm.selectNumber(number+1)},enabled=number<10,modifier=Modifier.heightIn(min=48.dp)) {Text("下一个 →")}
            }
        }
        item {Text(vm.speechStatus,style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)}
    }
}
@Composable private fun FruitButton(index:Int,selected:Boolean,onClick:()->Unit) {
    Box(Modifier.size(56.dp).clip(RoundedCornerShape(14.dp))
        .background(if(selected) MaterialTheme.colorScheme.primary.copy(alpha=.16f) else MaterialTheme.colorScheme.surface)
        .clickable(onClick=onClick).semantics {contentDescription="第${index+1}个苹果，${if(selected) "已数过" else "点一下数一数"}"},contentAlignment=Alignment.Center) {
        Canvas(Modifier.size(36.dp)){drawApple(Offset(size.width/2,size.height/2),size.minDimension*.36f)}
        if(selected) Icon(Icons.Default.Check,null,Modifier.size(16.dp).align(Alignment.TopEnd),tint=MaterialTheme.colorScheme.primary)
    }
}

@Composable private fun GamesPage(vm:AppState) {
    val revision=vm.gameRevision
    val game=vm.session
    // Snapshot the pure model's mutable fields so Compose's remembered lazy-content
    // lambda observes a new value when a round is solved, advanced or completed.
    val round=game?.round ?: 0
    val solved=game?.solved == true
    val finished=game?.finished == true
    var feedback by remember(game,round) {mutableStateOf("")}
    Column(Modifier.fillMaxSize()) {
    LazyColumn(Modifier.weight(1f),contentPadding=PaddingValues(24.dp),verticalArrangement=Arrangement.spacedBy(20.dp)) {
        item {PageTitle("小游戏 · 每一次尝试都在进步",game?.kind?.title ?: "玩着玩着，就学会啦",if(game==null) "每局五关，答错可以再试。通关收获一颗小星星。" else "慢慢观察，找到答案后再去下一关。")}
        if(game==null) {
            item {Text("已经收获 ${vm.progress.stars} 颗通关小星星",fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.primary)}
            GameKind.entries.forEachIndexed {index,kind ->
                item {ActivityCard("0${index+1}",kind.title,kind.description,
                    when(kind){GameKind.FRUIT->Icons.Default.LocalFlorist;GameKind.FIND->Icons.Default.Search;GameKind.COMPARE->Icons.Default.Balance}) {vm.startGame(kind)}}
            }
        } else if(finished) {
            item {SoftCard {
                Icon(Icons.Default.Stars,null,Modifier.size(72.dp),tint=MaterialTheme.colorScheme.secondary)
                Text("五关完成，真棒！",style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold)
                Text("一颗小星星已经放进你的收获里。\n你现在有 ${vm.progress.stars} 颗小星星。",lineHeight=28.sp)
                BigButton("再玩一局",{vm.startGame(game.kind)},Modifier.fillMaxWidth())
                OutlinedButton(onClick={vm.leaveGame()},modifier=Modifier.fillMaxWidth().heightIn(min=52.dp)){Text("选择其他游戏")}
            }}
        } else {
            val question=game.question
            item {
                Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.SpaceBetween) {
                    Text("第 ${round+1} / 5 关",fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.primary)
                    TextButton(onClick={vm.leaveGame()},modifier=Modifier.heightIn(min=48.dp)){Text("返回游戏")}
                }
                LinearProgressIndicator(progress={(round+(if(solved)1 else 0))/5f},modifier=Modifier.fillMaxWidth(),color=MaterialTheme.colorScheme.primary)
            }
            item {SoftCard {
                when(game.kind) {
                    GameKind.FRUIT -> {
                        Text("这里有几个苹果？",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold)
                        Basket(question.left,Modifier.fillMaxWidth().height(180.dp))
                        Text("看看有没有漏掉的，也可以用手指一起数。")
                    }
                    GameKind.FIND -> {
                        Text("请找到数字",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold)
                        Text("${question.answer}",fontSize=88.sp,fontWeight=FontWeight.ExtraBold,color=MaterialTheme.colorScheme.primary)
                        Text(vm.curriculum[question.answer].name,fontSize=28.sp)
                        OutlinedButton(onClick={vm.say("请找到数字，${vm.curriculum[question.answer].name}")},modifier=Modifier.heightIn(min=52.dp)) {
                            Icon(Icons.AutoMirrored.Filled.VolumeUp,null);Spacer(Modifier.width(8.dp));Text("再听一遍")
                        }
                    }
                    GameKind.COMPARE -> {
                        Text("哪一篮的苹果更多？",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold)
                        Row(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(12.dp)) {
                            Column(Modifier.weight(1f),horizontalAlignment=Alignment.CenterHorizontally) {
                                Text("左篮",fontWeight=FontWeight.Bold)
                                Basket(question.left,Modifier.fillMaxWidth().height(160.dp))
                            }
                            Column(Modifier.weight(1f),horizontalAlignment=Alignment.CenterHorizontally) {
                                Text("右篮",fontWeight=FontWeight.Bold)
                                Basket(question.right,Modifier.fillMaxWidth().height(160.dp))
                            }
                        }
                    }
                }
            }}
            item {
                FlowRow(Modifier.fillMaxWidth(),horizontalArrangement=Arrangement.spacedBy(12.dp),verticalArrangement=Arrangement.spacedBy(12.dp)) {
                    question.options.forEach {value ->
                        val label=if(game.kind==GameKind.COMPARE) (if(value==0) "左边更多" else "右边更多") else value.toString()
                        OutlinedButton(onClick={
                            val correct=vm.answer(value)
                            feedback=if(correct) "答对啦！准备好就去下一关。" else "再试一次，慢慢看看。"
                        },enabled=!solved,modifier=Modifier.heightIn(min=64.dp).widthIn(min=100.dp),shape=RoundedCornerShape(18.dp)) {
                            Text(label,fontSize=if(game.kind==GameKind.COMPARE)18.sp else 30.sp,fontWeight=FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
    if(game!=null&&!finished&&(solved||feedback.isNotEmpty())) {
        Column(Modifier.fillMaxWidth().padding(horizontal=24.dp,vertical=12.dp),verticalArrangement=Arrangement.spacedBy(12.dp)) {
            if(solved) {
                Text("答对啦！你观察得很仔细。",fontWeight=FontWeight.Bold,color=MaterialTheme.colorScheme.primary)
                BigButton(if(round==4) "完成挑战，收获星星" else "下一关",{vm.nextRound()},Modifier.fillMaxWidth(),icon=Icons.AutoMirrored.Filled.ArrowForward)
            } else Text(feedback,color=MaterialTheme.colorScheme.secondary,modifier=Modifier.semantics{contentDescription=feedback})
        }
    }
    }
}

@Composable private fun DrawingPage(vm:AppState,share:()->Unit) {
    var color by remember {mutableLongStateOf(0xff386746L)}
    var width by remember {mutableFloatStateOf(.012f)}
    var eraser by remember {mutableStateOf(false)}
    var confirmClear by remember {mutableStateOf(false)}
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val compact=maxHeight<420.dp
        val toolWidth=minOf(260.dp,maxWidth*.45f)
        val tools: @Composable ()->Unit = {
            DrawingTools(vm,color,{color=it;eraser=false},width,{width=it},eraser,{eraser=it},share,{confirmClear=true},compact)
        }
        if(compact) {
            Row(Modifier.fillMaxSize().padding(12.dp),horizontalArrangement=Arrangement.spacedBy(12.dp)) {
                Column(Modifier.width(toolWidth).fillMaxHeight().verticalScroll(rememberScrollState()),
                    verticalArrangement=Arrangement.spacedBy(8.dp)) {tools()}
                DrawingPaper(vm,color,width,eraser,Modifier.weight(1f).fillMaxHeight())
            }
        } else {
            Column(Modifier.fillMaxSize().padding(horizontal=20.dp,vertical=16.dp),verticalArrangement=Arrangement.spacedBy(10.dp)) {
                tools()
                DrawingPaper(vm,color,width,eraser,Modifier.weight(1f).fillMaxWidth())
                Text("大胆画吧，每一笔都有自己的故事。",Modifier.fillMaxWidth(),textAlign=TextAlign.Center,
                    style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
    if(confirmClear) AlertDialog(onDismissRequest={confirmClear=false},title={Text("让画纸重新空白？")},
        text={Text("清空后还可以点“撤销”找回来。")},
        confirmButton={TextButton(onClick={vm.editDrawing{clear()};confirmClear=false}){Text("清空")}},
        dismissButton={TextButton(onClick={confirmClear=false}){Text("继续画")}})
}
@Composable private fun DrawingTools(vm:AppState,color:Long,setColor:(Long)->Unit,
    width:Float,setWidth:(Float)->Unit,eraser:Boolean,setEraser:(Boolean)->Unit,
    share:()->Unit,clear:()->Unit,compact:Boolean) {
    // Observe history changes before evaluating the undo/redo/clear controls.
    @Suppress("UNUSED_VARIABLE") val revision=vm.drawingRevision
    val canUndo=vm.drawing.canUndo
    val canRedo=vm.drawing.canRedo
    val hasInk=vm.drawing.strokes.isNotEmpty()
    val palette=listOf(0xff386746L,0xffdb6b46L,0xffd49a19L,0xff4386afL,0xff956badL,0xff283c2fL)
    Row(Modifier.fillMaxWidth(),verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.SpaceBetween) {
        Column(Modifier.weight(1f)) {
            Text("小小画板",style=if(compact)MaterialTheme.typography.titleLarge else MaterialTheme.typography.headlineSmall,fontWeight=FontWeight.Bold)
            Text(vm.drawingStatus,style=MaterialTheme.typography.bodySmall,color=MaterialTheme.colorScheme.onSurfaceVariant)
        }
        IconButton(onClick=share,modifier=Modifier.size(52.dp).semantics{contentDescription="家长验证后分享 PNG 图片"}) {Icon(Icons.Default.IosShare,"分享画作")}
    }
    FlowRow(horizontalArrangement=Arrangement.spacedBy(4.dp),verticalArrangement=Arrangement.spacedBy(2.dp)) {
        palette.forEachIndexed {index,item ->
            Box(Modifier.size(48.dp).clip(CircleShape).clickable{setColor(item)}
                .semantics{contentDescription="${listOf("绿","橙","黄","蓝","紫","深灰")[index]}色画笔${if(color==item&&!eraser) "，已选中" else ""}"},contentAlignment=Alignment.Center) {
                Box(Modifier.size(32.dp).background(Color(item),CircleShape)
                    .then(if(color==item&&!eraser) Modifier.border(3.dp,MaterialTheme.colorScheme.onSurface,CircleShape) else Modifier))
            }
        }
        FilledTonalIconToggleButton(checked=eraser,onCheckedChange=setEraser,modifier=Modifier.size(48.dp)) {
            Icon(Icons.Default.AutoFixNormal,"橡皮擦${if(eraser) "，已选中" else ""}")
        }
    }
    val sizeControl: @Composable RowScope.()->Unit = {
        Text(if(eraser) "橡皮" else "粗细",style=MaterialTheme.typography.labelLarge)
        Slider(value=width,onValueChange=setWidth,valueRange=.004f..0.05f,
            modifier=Modifier.weight(1f).heightIn(min=48.dp).semantics{contentDescription="画笔粗细"})
    }
    val historyActions: @Composable ()->Unit = {
        IconButton(onClick={vm.editDrawing{undo()}},enabled=canUndo,modifier=Modifier.size(48.dp)) {Icon(Icons.AutoMirrored.Filled.Undo,"撤销")}
        IconButton(onClick={vm.editDrawing{redo()}},enabled=canRedo,modifier=Modifier.size(48.dp)) {Icon(Icons.AutoMirrored.Filled.Redo,"重做")}
        IconButton(onClick=clear,enabled=hasInk,modifier=Modifier.size(48.dp)) {Icon(Icons.Default.DeleteOutline,"清空画布")}
    }
    if(compact) {
        Row(verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(8.dp),content=sizeControl)
        Row {historyActions()}
    } else Row(verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(8.dp)) {
        sizeControl();historyActions()
    }
}
@Composable private fun DrawingPaper(vm:AppState,color:Long,width:Float,eraser:Boolean,modifier:Modifier) {
    val revision=vm.drawingRevision
    var active by remember {mutableStateOf<List<InkPoint>>(emptyList())}
    BoxWithConstraints(modifier,contentAlignment=Alignment.Center) {
        val side=min(maxWidth.value,maxHeight.value).dp
        Canvas(Modifier.size(side).clip(RoundedCornerShape(20.dp)).background(Color.White)
            .border(1.dp,Color(0xffced9c8),RoundedCornerShape(20.dp))
            .semantics{contentDescription="白色画纸，使用手指或触控笔自由绘画"}
            .pointerInput(color,width,eraser) {
                awaitEachGesture {
                    val down=awaitFirstDown(requireUnconsumed=false)
                    fun point(p:Offset)=InkPoint((p.x/size.width).coerceIn(0f,1f),(p.y/size.height).coerceIn(0f,1f))
                    val points=mutableListOf(point(down.position))
                    active=points.toList(); down.consume()
                    try {
                        do {
                            val event=awaitPointerEvent()
                            val change=event.changes.firstOrNull{it.id==down.id} ?: break
                            val next=point(change.position)
                            if(points.size<20_000&&points.last()!=next) points.add(next)
                            active=points.toList(); change.consume()
                            val pressed=change.pressed
                        } while(pressed)
                        vm.addStroke(InkStroke(points.toList(),color,width,eraser))
                    } finally {active=emptyList()}
                }
            }) {
            @Suppress("UNUSED_VARIABLE") val redraw=revision
            vm.drawing.strokes.forEach{drawInk(it)}
            if(active.isNotEmpty()) drawInk(InkStroke(active,color,width,eraser))
        }
    }
}
private fun DrawScope.drawInk(stroke:InkStroke) {
    val color=if(stroke.eraser)Color.White else Color(stroke.color)
    val width=stroke.width*size.minDimension
    if(stroke.points.size==1) {
        val point=stroke.points.first()
        drawCircle(color,width/2,Offset(point.x*size.width,point.y*size.height))
    } else {
        val path=Path()
        stroke.points.forEachIndexed {index,point ->
            if(index==0)path.moveTo(point.x*size.width,point.y*size.height) else path.lineTo(point.x*size.width,point.y*size.height)
        }
        drawPath(path,color,style=Stroke(width,cap=StrokeCap.Round))
    }
}

@Composable private fun ParentsPage(vm:AppState,unlocked:Boolean,unlock:()->Unit,email:()->Unit) {
    LazyColumn(Modifier.fillMaxSize(),contentPadding=PaddingValues(24.dp),verticalArrangement=Arrangement.spacedBy(20.dp)) {
        item {PageTitle("家长区 · 陪伴是最好的启蒙","陪孩子，一点点长大","不急着学会，先享受发现的快乐。")}
        item {SoftCard {
            Text("学习小记录",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold)
            Text("已认识 ${vm.progress.learned.size} 个数字 · 通关 ${vm.progress.stars} 局游戏")
            Text("课程记录与游戏星星分别保存；画作和进度保存在当前设备。应用免费、无账号、无广告，不收集个人信息。",lineHeight=25.sp)
        }}
        item {SoftCard {
            Row(verticalAlignment=Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("中文点读",fontWeight=FontWeight.Bold)
                    Text("使用设备的离线声音",style=MaterialTheme.typography.bodySmall)
                }
                Switch(checked=vm.progress.speech,onCheckedChange={vm.setSpeech(it)},modifier=Modifier.semantics{contentDescription="开启中文点读"})
            }
            Text(vm.speechStatus,style=MaterialTheme.typography.bodySmall)
            Text("数字课可以重复练习，学过标记由孩子或家长手动确认。游戏答错时可以慢慢再试，不扣分。",lineHeight=25.sp)
        }}
        if(!unlocked) item {BigButton("家长验证 · 了解作者",unlock,Modifier.fillMaxWidth(),icon=Icons.Default.Lock)}
        else item {SoftCard {
            Text("关于作者",style=MaterialTheme.typography.titleLarge,fontWeight=FontWeight.Bold)
            Text("萌芽启蒙，最初是我为自家娃制作的小小学习空间。希望用温柔的画面和轻松的小游戏，让孩子在家长陪伴下保留好奇、快乐探索。",lineHeight=27.sp)
            Text("欢迎提出建议，或反馈使用中遇到的问题。",lineHeight=26.sp)
            OutlinedButton(onClick=email,modifier=Modifier.fillMaxWidth().heightIn(min=52.dp)) {Icon(Icons.Default.MailOutline,null);Spacer(Modifier.width(8.dp));Text("hi@feiwenchao.com")}
        }}
        item {Text("第一阶段 · 数字 0–10 / 三款游戏 / 自由画板\n建议家长陪伴使用，适时休息，也在纸上继续涂画。",lineHeight=24.sp,style=MaterialTheme.typography.bodySmall)}
    }
}
@Composable private fun ParentGate(onDismiss:()->Unit,onVerified:()->Unit) {
    val left=remember{Random.nextInt(12,25)}
    val right=remember{Random.nextInt(7,16)}
    var answer by remember{mutableStateOf("")}
    var error by remember{mutableStateOf(false)}
    AlertDialog(onDismissRequest=onDismiss,icon={Icon(Icons.Default.FamilyRestroom,null)},
        title={Text("请家长来帮忙")},
        text={Column(verticalArrangement=Arrangement.spacedBy(12.dp)) {
            Text("离开学习空间前，请家长完成这道小算术。")
            Text("$left + $right = ?",style=MaterialTheme.typography.headlineMedium,fontWeight=FontWeight.Bold)
            OutlinedTextField(value=answer,onValueChange={answer=it.filter(Char::isDigit).take(3);error=false},
                label={Text("输入答案")},singleLine=true,keyboardOptions=KeyboardOptions(keyboardType=KeyboardType.Number),isError=error)
            if(error) Text("答案还不对，请家长再算一算。",color=MaterialTheme.colorScheme.error)
        }},
        confirmButton={TextButton(onClick={if(answer.toIntOrNull()==left+right)onVerified() else error=true},modifier=Modifier.heightIn(min=48.dp)){Text("验证并继续")}},
        dismissButton={TextButton(onClick=onDismiss,modifier=Modifier.heightIn(min=48.dp)){Text("返回学习")}})
}

@Composable private fun Basket(count:Int,modifier:Modifier) {
    Canvas(modifier.semantics{contentDescription=if(count==0)"空篮子，一个苹果也没有" else "装有${count}个苹果的篮子"}) {
        val w=size.width
        val h=size.height
        val basketWidth=min(w*.8f,h*1.45f)
        val left=(w-basketWidth)/2
        val top=h*.76f
        drawRoundRect(Color(0xffd3a665),Offset(left,top),androidx.compose.ui.geometry.Size(basketWidth,h*.19f),CornerRadius(14f))
        drawLine(Color(0xff986e3c),Offset(left,top),Offset(left+basketWidth,top),6f,StrokeCap.Round)
        val columns=5
        val radius=min(basketWidth/(columns*2.5f),h*.12f)
        repeat(count) { index ->
            val col=index%columns
            val row=index/columns
            val rowCount=min(count-row*columns,columns)
            val start=w/2-(rowCount-1)*radius*1.13f
            drawApple(Offset(start+col*radius*2.26f,top-radius*(1.1f+row*2.3f)),radius)
        }
        if(count==0) {
            drawCircle(Color(0xffd3a665).copy(alpha=.25f),h*.19f,Offset(w/2,h*.42f))
        }
    }
}
private fun DrawScope.drawApple(center:Offset,radius:Float) {
    drawCircle(Color(0xffd96749),radius,Offset(center.x-radius*.22f,center.y))
    drawCircle(Color(0xffe27752),radius,Offset(center.x+radius*.22f,center.y))
    drawLine(Color(0xff785c37),Offset(center.x,center.y-radius*.7f),Offset(center.x+radius*.1f,center.y-radius*1.3f),radius*.16f,StrokeCap.Round)
    drawOval(Color(0xff60905b),Offset(center.x+radius*.05f,center.y-radius*1.35f),androidx.compose.ui.geometry.Size(radius*.8f,radius*.35f))
    drawCircle(Color.White.copy(alpha=.45f),radius*.16f,Offset(center.x-radius*.5f,center.y-radius*.4f))
}
@Composable private fun SproutArt(modifier:Modifier) {
    Canvas(modifier) {
        val w=size.width;val h=size.height
        drawCircle(Color(0xffb8d69e).copy(alpha=.5f),w*.48f,Offset(w/2,h/2))
        drawLine(Color(0xff386746),Offset(w*.5f,h*.83f),Offset(w*.5f,h*.36f),w*.05f,StrokeCap.Round)
        val leaf=Path().apply{moveTo(w*.5f,h*.6f);cubicTo(w*.1f,h*.64f,w*.12f,h*.22f,w*.19f,h*.23f);cubicTo(w*.52f,h*.2f,w*.58f,h*.49f,w*.5f,h*.6f)}
        drawPath(leaf,Color(0xff5a965a))
        val other=Path().apply{moveTo(w*.5f,h*.44f);cubicTo(w*.45f,h*.13f,w*.8f,h*.12f,w*.85f,h*.18f);cubicTo(w*.87f,h*.44f,w*.64f,h*.54f,w*.5f,h*.44f)}
        drawPath(other,Color(0xff8bb36a))
    }
}

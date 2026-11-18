# 离线内容契约

`curriculum.json` 为两端打包使用的 UTF-8 JSON，不包含联网地址加载或执行脚本。由仓库根目录运行 `npm run native:content` 从网页课程生成，不手动修改。

- `schemaVersion: 1`：客户端读取内容前检查版本；不支持的版本应显示可理解的提示。
- `brand: String`：萌芽启蒙。
- `numbers: [{ value: Int, name, motifAsset, fruit, unit: String }]`：按 0–10 顺序排列，保留原课程各自的数量插画。0 使用空篮子。
- `pinyin: { edition, sources, lessons, items, tones }`：2024 新版人教版课程内容，保留网页课程字段。
- `alphabet: { letters, groups }`：26 个字母及分组，保留网页课程字段。

- `memoryScenes: [{subject,symbol,title,description,frames:[String]}]`：11数字、47声韵母、4声调、26字母，共88场景；每场景3张可有限播放的阶段PNG。
- `tracingTemplates: [{id,group,label,asset}]`：11个数字和26对大小写底稿，透明1000×700 PNG，不含网格与辅助线。`id`如`numbers:0`、`alphabet:Aa`，`label`为字符。

`activities.json` 是 `{schemaVersion:1,games:[...]}`。游戏稳定ID为`subject-type`，三科各20款，共60款；每款含8套确定种子题组，客户端启动时随机抽取一套。目录字段为`id,subject,type,title,description,symbol,skill,category,sets:[[round]]`。每关必含`id,mode,prompt,answer:[String],choices:[{value,label,small?,match?}]`。可选字段为`display,visualText,speech,speechLang,hint,explanation,item,max,scene,count,counts:[Int],values:[Int]`。网页`visual`转为保留分组/十格两行的纯文本，不含HTML。

模式为`choice`、`sequence`（严格顺序）、`select`（集合相等且不可重复）、`build`（0到max装填）、`memory`、`balloons`、`trace`。原版翻牌和气球各3关；描画只有一关自由练习，不领取奖励；其余每套5关。翻牌`choices.value`唯一，`match`为两个配对卡片共享的标签；气球`answer`按递增顺序，`choices`打乱。专用场景：`fruit`使用`count`与`item`资产名；`compare`使用`counts`左右篮数量及`0/1`答案；`train`使用`values`（`-1`为空车厢）；`drum`使用`count`生成本地鼓点，并可显示无声提示；`picnic`使用`count`订单、`max=10`与原生装填。

`illustrations/`含317张PNG。资产名均不带扩展名，按`illustrations/<name>.png`加载。包括`number_garden`、`number_motif_0…9`、`empty_basket`、`train_engine`、`rabbit`、`bear`、`cookie`、场景frames及临摹asset。构建时resvg光栅化，不依赖GUI或系统字体，客户端无SVG/HTML解释器。三个客户端打包本目录的同一份文件，不维护独立副本。

修改网页课程后运行 `npm run native:content`，再运行 `npm run native:content -- --check` 和 `npm test`。导出不包含时间戳，多次运行内容一致。

进度与画板分别使用平台本地存储，不写入课程文件，也不会自动导入网页 localStorage。

Swift核心保留旧`GameSession`。新`ActivitySession`答错可重试，答对锁定，显式`advance()`后末关完成，奖励只领一次；`MemoryGameState`负责两张翻牌/错配复原，`SequenceGameState`负责逐个顺序点击。`LearningProgress`兼容缺少新字段的v1 JSON，新增`learnedPinyin`（lesson-1…14）、`learnedLetters`（A…Z）、对应last字段、`visitDates`（yyyy-MM-dd），读取时过滤非法范围/日期。

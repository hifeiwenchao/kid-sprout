# 全端原生设计与功能一致实施计划

**Goal:** 所有原生端对齐当前网页版完整设计、课程和60个游戏。

**Architecture:** 网页数据和出题函数构建时导出纯JSON及本地PNG；Swift核心和Kotlin核心分别解释相同数据，使用原生页面/画板/专用游戏交互。Apple共享SwiftUI页面，iOS与Mac画板保留平台实现。

**Tech Stack:** Node、resvg（仅构建时）、Swift/SwiftUI/AppKit/PencilKit、Kotlin/Compose/Canvas。

**Spec:** `docs/superpowers/specs/2026-11-18-native-web-parity.md`

## 约束与接口

- 复用已批准的iOS17/macOS14/Android API26最低系统；完全离线、无WebView、无收费。
- 所有端同一课程与60款目录；页面以网页配色/插画/结构/文案为准；不得用占位课程/同一答题页代替特殊玩法。
- 不运行会影响当前桌面的UI自动化，不自动打开Xcode或应用。
- `activities.json`: `{schemaVersion:1,games:[{id,subject,type,title,description,symbol,skill,category,sets:[[round]]}]}`。
- round字段：`id,mode,prompt,answer:[String],choices:[{value,label,small?,match?}],display?,visualText?,speech?,speechLang?,hint?,explanation?,item?,max?,scene?,count?,counts?,values?`。mode为choice/sequence/select/build/memory/balloons/trace；scene用于fruit/compare/train/drum等原生场景。每游戏8套，特殊原版关数保持。
- curriculum新增：number的`motifAsset,fruit,unit`；`memoryScenes:[{subject,symbol,title,description,frames:[String]}]`；`tracingTemplates:[{id,group,label,asset}]`。PNG统一存`native/shared/illustrations/`，资产名不含扩展名，三平台用文件方式加载。
- Swift公共类型：`NativeSubject`（numbers/pinyin/alphabet）、`NativeGame`（Identifiable）、`ActivityLibrary.decode(Data)`、`ActivityRound`、`ActivityChoice`；`ActivitySession(rounds:)`提供`current/index/solved/completed/submit([String])/advance()/claimReward()/completeInteraction()`。保留旧GameSession以兼容历史测试。
- `Curriculum`增加可解码的拼音/字母/记忆/临摹类型。`LearningProgress`兼容旧JSON，新增`learnedPinyin/learnedLetters/lastPinyin/lastLetter/visitDates`并范围校验。
- Apple AppModel提供`curriculum/activities/progress`、`speak(_:language: = "zh-CN")`、`markLearned(Int)`、`markPinyin(String)`、`markLetter(String)`、`reward()`、`play(NativeGame)`。
- Apple公共视图：`Page`、`Panel`、`NativeIllustration(name:)`、`MemorySceneView(subject:symbol:)`、`LessonTracingView(group:symbol:)`、`GameLibraryView(subject: NativeSubject? = nil)`；主题Sprout由root提供。课程入口`NumbersView/PinyinView/AlphabetView`。

## Task 1：统一离线内容与Swift核心

负责`scripts/export-native-content.mjs`、新增导出工具、`native/shared/`、Swift Sources/Tests、相关Node测试及构建时依赖。

- [x] 先加60目录/三科各20、原版关数、四种题型/特殊模式、正确答案可达/唯一、稳定导出、旧记录兼容测试；记录缺失失败。
- [x] 从网页导出全部课程、记忆场景、临摹底稿、原始插画和8套题组；不保留HTML。用纯数据适配原版游戏。
- [x] 实现Swift新内容类型、通用会话/顺序/翻牌状态与兼容进度；运行Node及SwiftPM测试。
- [x] 报告文件/类型/校验结果，保持共享契约稳定，供两端消费。

## Task 2：Apple完整课程与临摹

负责`native/ios/App/CourseViews.swift`、`MemorySceneView.swift`、`LessonTracingView.swift`，替换原LearningViews中的NumbersView由root协调。

- [x] 对齐网页数字大卡片、拼音单元/课次/四声、四组字母页面以及课程详情。
- [x] 接入真实完成/继续学习进度，中文例字/英语语音，前后课切换，所有教学文案从共享数据读取。
- [x] 原生记忆场景有限动画与重播，减少动画静态；原生独立临摹笔迹/撤销/清空，底稿大小写并排。
- [x] 后台类型检查/构建由root统一协调，不运行GUI测试。

## Task 3：Android完整原生对齐

负责`native/android/`全部UI/模型/测试/文档，消费Task1契约，不修改Apple或共享导出。

- [x] 先写JSON解析、60游戏筛选/会话/旧存档兼容、特殊游戏状态测试，记录失败。
- [x] Compose主题/六入口导航/首页、三科课程/记忆/临摹、全部游戏目录及四种通用玩法和原版特殊玩法。
- [x] 对齐画板工作台/12色/自选/荧光笔/底稿/网格/导出，兼容现有画稿。
- [x] Gradle单测、assembleDebug、lintDebug；禁止启动模拟器/GUI；报告无法验证项。

## Task 4：Apple公共设计、游戏与画板集成

root负责AppModel、主题、导航/首页、游戏原生场景、平台画板、工程生成器与文档。

- [x] 建立网页设计常量和共享组件，完整侧栏/窄屏六入口、三科首页和真实进度/继续/精选/画板横幅；家长/作者内容独立。
- [x] 完整游戏库和交集筛选；四种通用模式，以及原生翻牌/气球/描画/火车/比较/听鼓/点心。
- [x] 两平台画板对齐工具和底稿，原子保存、撤销/清空、导出继续可用；增加必要模型测试。
- [x] 更新project generator打包全部新Swift文件和离线资源，后台构建iPhone/iPad/Mac，Release包含双架构。

## Task 5：审查、验证和交付

- [x] 并行实现后分别做需求/代码审查，重点60玩法覆盖、真实内容、存档和不抢桌面约束。
- [x] Node/共享资源/SwiftPM/Gradle测试、网页构建及Apple后台构建；不声称未经执行的UI验收。
- [x] 更新运行/范围/验证文档，打包Mac与Android产物。
- [x] 实现提交 `6e622ed`（macOS基础提交 `d400420`）已快进集成本机main，并成功push origin main。合并后网页125项、Swift核心12项再次通过，原目录iOS后台构建成功；保留用户本地Xcode开发团队等设置。

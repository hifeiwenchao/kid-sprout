# Native Apps Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement and review the tasks in this plan. Each platform owns a disjoint directory; independent platform implementation may run in parallel.

**Goal:** 交付萌呀启蒙第一阶段的两套真正原生应用。

**Architecture:** 由现有网页课程导出带版本的离线 JSON。SwiftUI 与 Compose 分别实现界面、游戏状态与持久化，原生画板保留草稿并通过系统分享导出图片。

**Tech Stack:** Node.js、SwiftUI、PencilKit、AVFoundation、Kotlin、Jetpack Compose、Android TextToSpeech。

**Spec:** `docs/superpowers/specs/2026-11-18-native-apps.md`

## Global Constraints

- 品牌为“萌呀启蒙”，免费、无账号、无广告、无打赏，不使用 WebView。
- 第一阶段实现数字 0–10、数一数水果/寻找数字/比比多少（三种五关游戏）、画板、离线记录与家长区。
- iOS 最低 iOS 17，bundle ID `com.feiwenchao.kidsprout`；Android 最低 API 26，application ID 相同。
- 外部分享与邮件经过家长算术验证；语音不可用时保留文字、图形反馈。
- 保持网页测试和构建通过。商店发布不在本阶段范围内。

### Task 1: 共享离线课程

**Files:** `scripts/export-native-content.mjs`, `tests/native-content.test.js`, `native/shared/curriculum.json`, `native/shared/README.md`。

**Interfaces:** 输出 schemaVersion=1，brand 为字符串；numbers 为 `{value,name}` 数组（0–10），pinyin 和 alphabet 保留现有课程字段。`npm run native:content` 生成，附加 `--check` 检查一致性。

- [x] 先写内容契约测试：断言 11 个数字、14 课顺序、47 声韵母、26 字母与源课程完全一致，检查导出可重复且产物没有漂移。
- [x] 执行 `node --test tests/native-content.test.js`，确认新增测试因缺少导出器失败。
- [x] 实现 `buildCurriculum()` 返回序列化纯数据；CLI 写入 `native/shared/curriculum.json`，检查模式只比较内容。
- [x] 执行 `npm run native:content && npm test`。

### Task 2: Apple 原生客户端

**Files:** `native/ios/**`（项目配置、应用入口、课程/进度/游戏模型、学习与游戏页面、PencilKit 画板、测试、运行说明）。

**Interfaces:** 直接将 `../shared/curriculum.json` 作为 bundle resource，读取 `numbers`。系统本地进度版本独立于内容 schema。系统分享通过家长验证。

- [x] 先写并运行模型测试：不同顺序点水果只累计一次；错误答案可重试；正确答案不能跳两关；仅完成第五关奖励一次；存档过滤无效数字并恢复。
- [x] 实现纯模型，再实现自适应导航、数字课程、三游戏、PencilKit 画板和家长区。画板自动保存 PKDrawing，清空/撤销/重做与 PNG 分享可用。
- [x] 生成可用的 Xcode project/scheme，运行 `xcodebuild test` 和模拟器 build；记录命令及结果。
- [x] 在 iPhone 与 iPad 模拟器运行，检查导航、游戏、画纸、旋转与重启恢复。

### Task 3: Android 原生客户端

**Files:** `native/android/**`（Gradle wrapper、工程与 manifest、Kotlin 数据与页面、画板、单元测试和运行说明）。

**Interfaces:** Gradle 将 `../shared` 打包为 assets，读取 `curriculum.json`。游戏和存档不依赖网页 JS。不声明 INTERNET 等无关权限。

- [x] 安装缺失的 JDK/官方 Android SDK 构建工具，保留本机路径在被忽略的 local.properties 中。
- [x] 先写并运行模型测试：水果去重计数、五关奖励一次、重试与锁定、存档过滤、画笔历史与序列化恢复。
- [x] 实现 Compose 自适应导航、数字课程与三游戏、原生 Canvas 画板，归一化笔迹并保存草稿；用 FileProvider 分享 PNG。
- [x] 使用 wrapper 执行 `testDebugUnitTest assembleDebug lintDebug`，修复错误并记录 APK 路径。
- [x] 若可用模拟器，运行手机与平板交互检查；否则明确区分编译/单测与真机验证。

### Task 4: 集成、审查与交付

**Files:** `README.md`, `.gitignore`, `.dockerignore`, `native/README.md`。

- [x] 记录每端启动、测试、安装命令、当前范围、后续迁移范围与签名边界；忽略 SDK、签名密钥与构建产物。
- [x] 独立审查共享数据、两端状态机、保存恢复、儿童区入口及布局，修复发现的问题。
- [x] 运行 `npm test && npm run build && npm run native:content -- --check` 与两端适当的构建测试。
- [x] 使用 `feature: 添加iOS与安卓原生启蒙应用首版` 提交。确认原 main 无未提交改动并快进集成，推送用户已授权的 `origin main`。实现提交为 `2229601`，测试环境与边界记录在 `native/VALIDATION.md`。

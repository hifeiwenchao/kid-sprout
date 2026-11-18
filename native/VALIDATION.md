# 原生验证记录

## 完整课程与网页设计对齐（2026-11-18）

本阶段将 iPhone/iPad、Mac、Android 手机/平板从数字首版扩展为网页版完整范围：六个入口、三科学习空间、60 个游戏、88 个记忆场景、课内临摹与自由画板。三端共用离线 JSON 和 317 张 PNG；拼音按 2024 新版人教 14 课顺序组织。

遵照用户要求，本阶段**没有打开 Xcode、模拟器或应用，没有运行 UI 自动化或操作鼠标键盘**。以下都是后台 CLI 测试、编译与文件检查，不能代替新界面的实际视觉和触控验收。下方首版与 macOS 初期的 UI 结果属于历史记录。

| 检查 | 本阶段实际结果 |
| --- | --- |
| 网页回归 | `npm test`：125/125；`npm run build` 成功 |
| 内容导出 | `npm run native:content -- --check` 成功；60 款、每科 20 款、每款 8 套，共 2,336 关；317 张 PNG 可逐字节重生 |
| Apple 共享核心 | `swift test --package-path native/ios`：12/12；覆盖全部题组可解、重试/锁定/奖励一次、翻牌/顺序状态与旧存档 |
| Mac 画板模型 | `npm run native:test:mac-drawing`：10/10；直接执行 SwiftPM XCTest，无 App 宿主；验证旧色板、坏稿保护、笔迹/底稿撤销、PNG 分层与橡皮、尺寸/上限/保存失败 |
| iPhone / iPad 编译 | `KidSprout`、`generic/platform=iOS Simulator` 的 `build-for-testing CODE_SIGNING_ALLOWED=NO` 成功；应用、单测和 UI 测试均只编译，未执行宿主/UI 测试 |
| Mac 编译 | `KidSproutMac` 的 `build-for-testing` 成功；Universal Release 构建成功，二进制同时含 arm64 / x86_64 |
| Android | `testDebugUnitTest assembleDebug lintDebug` 成功；17/17 JVM 单测；lint 无错误、4 条依赖版本提示 |
| 实际包内资源 | iOS bundle、Mac Release bundle 和 Android APK 各 319 个资源文件（2 JSON + 317 PNG）SHA-256 均与仓库一致 |
| Mac 签名 | `codesign --verify --deep --strict` 成功；本地 ad hoc 签名只含沙盒和用户所选文件读写权限，Release 无 get-task-allow |

审查修复了课程内启动游戏的弹窗层级、继续学习直达第一未学内容、重复点击水果不多播、听鼓未完整播放便可作答/重复播放、Android 多音字 o 的错误点读风险和离开页面后旧语音继续播放。三端均将课程进度与游戏奖励分开，拼音按 `lesson-1` 至 `lesson-14` 保存。

画稿兼容：iOS 接受旧 raw PKDrawing，v2 原子保存笔迹与底稿；Mac 保留 1000×700 坐标，旧六色与三倍橡皮显式迁移；Android 保留旧方稿 1000×1000 比例，新稿使用 1000×700，切底稿可撤销找回旧比例与墨迹。导出保留底稿，排除网格/辅助线。Mac 仍等待家长验证 sheet 完全关闭后呈现系统保存面板。

交付产物位于被 Git 忽略的 `native/artifacts/`：`kid-sprout-debug.apk`、`KidSproutMac.app`、`萌芽启蒙-macOS.zip`；本机后台日志与资源摘要保存在 `validation-web-parity/`。Xcode 必须打开 `native/ios/KidSprout.xcodeproj`，不能用只含核心库的 `Package.swift` 运行应用。

实现提交 `6e622ed` 与 macOS 基础提交 `d400420` 已快进合并并推送 `origin/main`。在原项目目录重新安装依赖后，网页 125 项、Swift 核心 12 项及 iOS 后台构建再次通过；用户本地的 Xcode 开发团队、图标与搜索路径设置已备份并保留为未提交改动。

**尚未验证**：本版实际 UI/键盘焦点/触控、字体放大后的视觉效果、实体触控笔、不同系统的离线语音与分享/邮件应用、最低系统与 Intel 实机。更新后的 UI 测试仅完成编译，需在专用设备/CI 执行；历史截图不能作为本版验收证据。iOS 真机签名、Mac Developer ID/公证、商店发布及跨端同步均未配置。

## 历史：原生数字首版

验证日期：2026-11-18。范围为数字 0–10、三款五关游戏、原生画板、本地进度和家长区。当前为模拟器/debug 阶段，尚未发布商店。

| 检查 | 环境与结果 |
| --- | --- |
| 网页回归 | Node.js，`npm test` 120 项通过；Vite 生产构建通过 |
| 共享课程 | `npm run native:content -- --check` 通过；实际 iOS bundle 和 Android APK 的课程资源均与仓库文件 SHA-256 相同 |
| iOS 核心模型 | `swift test --package-path native/ios` 6 项通过 |
| iOS 手机与平板 | Xcode 26.6 / iOS 26.5，iPhone 17 Pro 和 iPad Air 11 M4，各 10 项单元测试和 3 项 UI 测试通过；最终模拟器构建通过并独立安装启动 |
| Android 构建 | JDK 21 / Gradle 8.11.1 / SDK 35，`testDebugUnitTest assembleDebug lintDebug` 通过；9 项单元测试，lint 无错误，4 条依赖版本更新提示 |
| Android 界面 | 官方 API 35 arm64 模拟器；手机、平板、深色、800×360dp、360×360dp、320×480dp 检查通过 |

核心验证覆盖水果任意顺序去重计数、零的放入/取出、错误答案重试、正确答案锁定、五关奖励一次、学习进度恢复、损坏存档回退、画板撤销/重做/清空/重启恢复、家长错误答案/取消、真实 PNG 和系统分享面板。

Android 完整交互脚本完成三种游戏的全部 15 关。iOS UI 测试完整完成寻找数字五关，并验证数水果、比多少的答错重试；三游戏的五关状态与单次奖励均有模型测试。画稿在旋转或改变窗口后保持比例。最终 Android 小窗口均实际落笔并恢复；系统分享检查止于分享面板，没有向任何收件人发送作品或邮件。

审查及实测已修复：独立启动的 framework 路径、SwiftUI 分享空弹窗、自动邮箱链接绕过验证、iPad 多窗口共享画纸、只在读取端限制大画稿而丢稿、游戏结算界面未刷新，以及短横屏导航/画纸不可达。Android 新增画稿限制为 10,000 笔并显示提示，旧的有效超限画稿仍可读取；iOS 不再使用与写入不一致的 30MB 读取上限。

复验命令分别见 [iOS 说明](ios/README.md) 与 [Android 说明](android/README.md)。iOS 截图与实际导出作品保存在 [ios/screenshots/](ios/screenshots/)；Android 脚本将截图输出到被忽略的 `native/android/build/reports/qa/`。

尚未验证实体手机/平板、实体 Apple Pencil/Android 触控笔、各厂商系统语音、iOS 17 / Android 8.0 实机，以及各邮件/分享接收应用。安装到 iPhone/iPad 真机需要选择开发团队；正式发布还需配置签名和商店资料。网页与客户端不共享存档，进行中的游戏与画板撤销栈不跨进程重启保存。

## macOS 扩展

Mac客户端使用共用数字课程、五关游戏和家长介绍，AppKit画板与iOS PencilKit画板分别编译。最低macOS 14；本机验证环境为macOS 26.5、Xcode 26.6、Apple芯片。

- Swift核心模型6项、Mac画板模型7项测试通过，覆盖去重计数、五关/单次奖励、版本化记录、画笔历史、坏稿保护、坐标校验、10,000/10,001笔边界、PNG尺寸/白底/笔迹/橡皮和保存失败。
- 共用Apple界面修改后，iPhone 17 Pro与iPad Air 11 M4各10项单元测试、3项UI测试通过。网页120项、生产构建与共享课程检查通过。
- 通用Release构建成功，`file`确认同时包含`arm64`与`x86_64`；`codesign --verify --deep --strict`通过。本地ad hoc签名仅含应用沙盒和用户所选文件读写权限，Release未启用调试进程权限。实际bundle课程文件与共享JSON的SHA-256一致。
- 最终Mac完整套件7项单元测试、4项UI测试通过。桌面流程覆盖原生侧栏、任意顺序数水果/重复点击、零篮子、学过重启恢复、完整五关/错误重试/锁定、其他游戏入口、深色、鼠标绘画及历史/清空/草稿恢复、家长取消/错误答案、系统保存取消和实际PNG写入（2000×1400），并验证⌘Z/⇧⌘Z和缩小窗口后的画纸比例。

实测修复了家长验证关闭后保存面板挂到即将关闭窗口的问题：现在捕获主窗口，等待该窗口结束验证sheet后呈现保存面板。Mac保存通过系统对话框选择路径，不联网、不向外部收件人发送作品或邮件。

深色UI测试使用Mac Debug专用的进程外观覆盖，显式传入`-AppleInterfaceStyle Dark`；不修改系统外观，Release跟随系统。截图仅裁切应用窗口，保存在[macos/screenshots/](macos/screenshots/)，含真实导出作品。

Intel架构已编译，未在Intel实机运行；最低macOS 14尚未实机验证。当前包用于本地测试，未配置Developer ID签名、公证或商店分发。Mac移除`.app`后本地记录仍保留，记录与手机/网页独立。运行方式见[Mac说明](macos/README.md)。

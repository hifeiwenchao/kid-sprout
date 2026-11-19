# 原生验证记录

## Apple 首发归档、上传与实际提审（2026-11-19）

App Store Connect 新统一记录 Apple ID 为 `6836726939`，后台入口为 [分发页面](https://appstoreconnect.apple.com/apps/6836726939/distribution)。iOS 与 macOS 主应用 Bundle ID 均为 `com.feiwenchao.mengya`，直接读取两份归档的应用 Info.plist 确认版本 `1.0.0`、build `1`。旧 `com.feiwenchao.kidsprout` 属于另一款产品，本应用未沿用旧商店记录；本轮没有实现旧标识的数据迁移。

**最终状态：iOS 与 macOS 的 `1.0.0 (1)` 均已实际提交成功，两端页面均显示“正在等待审核”；均选择手动发布，尚未审核通过、尚未上线。**定价免费，供应范围已设全部 175 个国家/地区，中国大陆（CHN）显示“App 发布时供应”。安全评估与 AIGC 均已声明不含适用功能并在后台显示有效，App ICP 栏仍为空，自动校验未阻断本次提交；这不表示获得备案豁免或已批准中国大陆上线。

| 检查 | 本轮实际结果 / 证据 |
| --- | --- |
| iOS 签名归档 | `/tmp/mengya-ios-archive.log`：`ARCHIVE SUCCEEDED`；归档 `native/artifacts/app-store/Mengya-iOS-1.0.0-1.xcarchive` |
| Mac 签名归档 | `/tmp/mengya-macos-archive.log`：`ARCHIVE SUCCEEDED`；归档 `native/artifacts/app-store/Mengya-macOS-1.0.0-1.xcarchive` |
| iOS 导出上传 | `/tmp/mengya-ios-upload.log`：`Upload succeeded` 与 `EXPORT SUCCEEDED` |
| Mac 导出上传 | `/tmp/mengya-macos-upload.log`：`Upload succeeded` 与 `EXPORT SUCCEEDED` |
| iOS 实际提审 | 页面“正在等待审核”；审核提交 ID `7c3e17f1-1197-4576-a6c7-febe2e305494` |
| Mac 实际提审 | 页面“正在等待审核”；审核提交 ID `529d3f28-7a86-4807-9f30-3e85a58cbf53` |
| 两端版本资料 | 元数据、审核联系资料、build `1` 及手动发布设置均已保存；私人联系资料未写入仓库 |
| 后台截图 | 中屏 iPhone `1206×2622`、iPad `2064×2752` 与 Mac `1440×900` 各 1 张，各显示 `1/10`，均已保存并用于提交 |
| 定价 / 供应 | 免费，全部 175 个国家/地区；CHN“App 发布时供应”；两端均未上线 |
| 分类 / 年龄问卷 | 已完成：教育、`4+`、儿童 `6–8 岁` |
| 网页测试 | `/tmp/mengya-web-tests.log`：125/125，通过，0 失败 |
| 网页生产构建 | `/tmp/mengya-web-build.log`：Vite build 成功 |
| Apple 共享核心 | `/tmp/mengya-core-tests.log`：12/12，通过，0 失败；末尾 Swift Testing 的“0 tests”是另一测试运行器，不能覆盖前面的 XCTest 结果 |
| 公开页面 | [隐私政策](https://kid.feiwenchao.com/privacy.html) 与 [支持页面](https://kid.feiwenchao.com/support.html) 已发布，本轮公网 HTTPS 请求均返回 HTTP `200` |
| App Privacy | 已按用户确认发布“不收集数据”；不等于完成审核 |
| 专用截图 | iPhone 2 张原始 JPG、iPad 1 张原始 JPG；Mac `01-explore.png` 1440×900、RGB、无 alpha，来自实际归档 app 的后台窗口捕获；均已通过图片查看，来源与处理见 [截图记录](app-store/screenshots/README.md) |

本地提交状态凭据：`native/artifacts/app-store/proof/both-platforms-waiting-review.jpg`，同一后台页面下拉同时显示 iOS 与 macOS `1.0.0`“正在等待审核”。截图位于 Git 忽略目录且含后台账户信息，仅保留本地，不随文档提交或嵌入。

归档工程使用 iOS 自动签名、Mac Release 自动签名，Mac Debug 仍保留本地 ad hoc。Debug testability 为 `YES`，Release 为 `NO`。`PrivacyInfo.xcprivacy` 在 iOS app、嵌入的 Core framework 及 Mac app 中声明自身 UserDefaults 的 `CA92.1` 用途。应用内提供离线隐私政策，拼音资料外链、邮件及画作导出经过家长验证；本轮没有据此宣称完整交互或实机验收已经完成。

实际警告与边界：

- Mac 上传日志提示 `Upload Symbols Failed`，归档缺少 `KidSproutMac.app` 的 dSYM，涉及 UUID `43FD9B1F-F78F-3FCF-9E8F-6A81A44BD232`、`437D1205-A149-3307-A765-A95A362137CA`。随后仍明确 `Upload succeeded` 和 `EXPORT SUCCEEDED`，未阻断本次上传；符号缺失会影响崩溃符号化，应后续补齐匹配 dSYM。
- iOS 上传日志提示使用 iOS `26.5` SDK：从 **2027 年 4 月**起，iOS/iPadOS 上传或提交分发须使用 iOS `27` SDK / Xcode `27` 或更高版本。该未来要求没有阻断本次上传，后续发布需跟进。
- 两端归档有无 AppIntents.framework 依赖而跳过元数据提取的警告；iOS 还提示已签名 framework 未执行 strip。两份归档日志均以 `ARCHIVE SUCCEEDED` 结束，没有把这些警告遗漏为“无警告”。
- 三张移动端截图来自 Release 模拟器，Mac 图来自实际归档 app 的后台窗口；Mac 仅去掉 31px 系统标题栏后等比例居中适配到 1440×900，未改变应用内容。截图检查只覆盖首页显示，不替代全课程、语音、家长验证、触控笔、最低系统和 Intel 实机等验收。
- 两端已完成版本选包、元数据、联系资料和截图保存，并实际提交成功。当前只确认“正在等待审核”，尚无审核通过或上线结果；通过后仍需手动发布。App ICP 栏为空而自动校验未阻断，不构成备案豁免或中国大陆上线批准结论。没有在仓库记录私人审核联系电话。

发布资料与审核提交信息见 [Apple 发布记录](app-store/README.md)。下方保留各历史阶段原始记录；其中“未配置签名”“未上传”等表述仅描述当时阶段，当前发布状态以上述本轮记录为准。

## 历史：名称与开发团队更新（2026-11-19）

网页与 iOS/iPadOS、Mac、Android 的显示名称统一为“萌呀启蒙”，同步作者文案、画作导出/分享名称和共享课程品牌。Apple 工程与生成器的开发团队均设为 `5A9Z4D7HV3`（wenchao fei）。Mac 使用显式 Info.plist，防止自动生成配置将系统短名称覆盖成内部构建名。

网页 125 项测试、Vite 构建和共享资源一致性检查通过；iOS 模拟器后台构建、Mac arm64/x86_64 Release 与 Android APK 构建通过。直接检查产物确认 iOS 显示名、Mac 显示名/短名称与 Android application label 均为新名称；Mac 本地签名校验通过，测试包已重打。没有运行 UI 自动化或启动设备。iOS 真机签名需先在本机 Xcode 登录团队账户；Mac 交付包仍是本地 ad hoc 签名，未进行商店发布或公证。

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

交付产物位于被 Git 忽略的 `native/artifacts/`：`kid-sprout-debug.apk`、`KidSproutMac.app`、`萌呀启蒙-macOS.zip`；本机后台日志与资源摘要保存在 `validation-web-parity/`。Xcode 必须打开 `native/ios/KidSprout.xcodeproj`，不能用只含核心库的 `Package.swift` 运行应用。

实现提交 `6e622ed` 与 macOS 基础提交 `d400420` 已快进合并并推送 `origin/main`。在原项目目录重新安装依赖后，网页 125 项、Swift 核心 12 项及 iOS 后台构建再次通过；用户本地的 Xcode 开发团队、图标与搜索路径设置已备份并保留为未提交改动。

后续图标修正：原生成脚本使用不支持的 24 位 RGB 位图，绘图上下文为 nil，导致 iOS 和派生 Mac 图标全部为黑色。已改为显式 32 位 RGB（无 Alpha）上下文并重生全部 11 个尺寸。实际检查源 PNG 及编译后的 iPhone、iPad、Mac 图标均有彩色图案；iOS 后台构建、Mac 双架构 Release、签名和更新后的 Mac 压缩包检查通过。此检查直接读取图片文件，未启动应用或模拟器。

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

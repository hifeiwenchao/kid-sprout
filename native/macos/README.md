# 萌芽启蒙 · Mac 原生版

支持 macOS 14 及以上，使用 SwiftUI、AppKit 和系统中文语音。包含与 iPhone/iPad 首版一致的数字0–10、三款五关游戏、离线记录和家长区，Mac 画板支持鼠标及触控板拖动。没有 WebView、广告、收费或账号。拼音、字母及其余小游戏尚未迁移。

## 运行与构建

在 Finder 中进入仓库的 `native/ios/` 目录，双击 [KidSprout.xcodeproj](../ios/KidSprout.xcodeproj)，或在仓库根目录通过终端打开：

```sh
open native/ios/KidSprout.xcodeproj
```

在 Xcode 顶部选择 **KidSproutMac** scheme 和 **My Mac**，然后点击运行；运行 iPhone/iPad 版则选择 **KidSprout + iPhone / iPad Simulator**。

请打开 **KidSprout.xcodeproj**。同目录的 `Package.swift` 只包含 **KidSproutCore** 核心库及其测试，没有可运行的 App；如果 Xcode 中只看到 KidSproutCore，关闭该包窗口后重新打开上述工程。

在仓库根目录可执行：

```sh
node native/ios/generate-project.cjs
xcodebuild -project native/ios/KidSprout.xcodeproj -scheme KidSproutMac \
  -destination 'platform=macOS' -derivedDataPath /tmp/kid-sprout-macos test
xcodebuild -project native/ios/KidSprout.xcodeproj -scheme KidSproutMac \
  -configuration Release -destination 'generic/platform=macOS' \
  -derivedDataPath /tmp/kid-sprout-macos-release \
  ARCHS='arm64 x86_64' ONLY_ACTIVE_ARCH=NO build
open /tmp/kid-sprout-macos-release/Build/Products/Release/KidSproutMac.app
```

首次运行 Xcode UI 测试时，系统可能要求允许开发工具进行测试；模型和画板单元测试无需控制其他应用。通用 Release 产物同时包含 Apple 芯片与 Intel 架构，本机实际运行验证以当前 Mac 架构为准。

该工程默认使用本机 ad hoc 签名，不需要 Apple 开发者团队。正式向其他用户分发时，需另外配置 Developer ID 签名与 Apple 公证或 Mac App Store 发布；当前包用于本地测试。

本地交付包位于 `native/artifacts/萌芽启蒙-macOS.zip`，解压后双击 `KidSproutMac.app`。该目录已被 Git 忽略，需要在其他电脑按上述命令重新构建。界面及真实导出作品见 [screenshots/](screenshots/)。

## 桌面交互

- 单窗口侧栏导航，默认1100×800，最小760×600；可缩放或全屏，内容超出时滚动。
- 点击苹果按已点过的不同苹果数量播报；重复点击不会多算。课程、三种五关游戏和奖励逻辑与 iOS 共用。
- 白色画纸使用固定1000×700逻辑坐标等比显示；鼠标/触控板按住拖动绘画。六色、粗细、橡皮擦、撤销（⌘Z）、重做（⇧⌘Z）、清空均可用，清空可撤销。
- 每笔完成、历史操作、离开画板或后台时原子保存草稿，重启恢复当前画作；撤销栈不跨重启恢复。新增上限为10,000笔，达到上限提示并保留已有内容，旧版本有效超限稿仍可读取。
- “保存 PNG”经过家长验证后打开系统保存窗口，选择文件名和位置；输出2000×1400白底PNG，无工具栏。取消不会导出外部文件，保存失败时画作仍保留。
- 邮箱`hi@feiwenchao.com`通过家长验证后打开系统邮件应用；不会自动发送邮件。
- 支持深浅外观，画纸始终白底；系统没有中文声音时仍可用图文学习。

## 本地数据

Mac bundle ID 为 `com.feiwenchao.kidsprout.mac`，系统偏好保存学习记录；App Sandbox 私有 Application Support 子目录保存 `com.feiwenchao.kidsprout.mac/drawing-v1.json`。与网页和移动端存档独立，不联网同步。

损坏/不兼容的画稿不会仅因打开页面而被覆盖；继续绘画时先备份原文件再保存新稿。移除`.app`不会自动清理Mac的偏好和草稿；需要清理时应先退出应用，再通过Finder管理该应用的数据目录。

应用只启用沙盒和用户主动选择文件的读写权限，不申请网络、摄像头或麦克风权限。NSSavePanel授权选中的位置；不读取其他个人文件。

共享颜色、课程、游戏和家长界面位于`native/ios/App/`；Mac画板位于`native/ios/MacApp/`；画板单测位于`MacTests/`，桌面流程位于`MacUITests/`。AppKit画板与iOS PencilKit分别编译，核心模型直接编译进Mac目标，不链接iOS framework。

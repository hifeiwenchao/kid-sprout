# 萌芽启蒙 · iPhone / iPad 原生首版

SwiftUI、PencilKit 和 AVFoundation 实现，最低 iOS 17，无 WebView、无第三方运行依赖。首版包括数字 0–10、三种五关小游戏、画板和家长区。共享离线课程直接从 `../shared/curriculum.json` 打包；不展示尚未迁移的拼音、字母和其他游戏。

同一工程新增 **KidSproutMac** scheme，使用共用学习界面和独立AppKit画板支持macOS 14+，运行方式见[Mac说明](../macos/README.md)。iPhone/iPad继续选择**KidSprout** scheme。

## 使用 Xcode

在 Finder 中进入仓库的 `native/ios/` 目录，双击 **KidSprout.xcodeproj**，或在仓库根目录通过终端打开：

```sh
open native/ios/KidSprout.xcodeproj
```

在 Xcode 顶部选择 **KidSprout** scheme 和 **iPhone / iPad Simulator**（例如 iPhone 17 Pro），然后点击运行；运行 Mac 版则选择 **KidSproutMac + My Mac**。项目已提交，可直接打开，无需生成器。

请打开 **KidSprout.xcodeproj**。`Package.swift` 只包含 **KidSproutCore** 核心库及其测试，没有可运行的 App；如果 Xcode 中只看到 KidSproutCore，关闭该包窗口后重新打开上述工程。

真机运行时在 Signing & Capabilities 选择自己的 Apple 开发团队；bundle ID 为 `com.feiwenchao.kidsprout`。此阶段未配置 App Store 发布签名。

## 命令行构建与测试

在仓库根目录执行：

```sh
swift test --package-path native/ios
xcodebuild -project native/ios/KidSprout.xcodeproj -scheme KidSprout \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  -derivedDataPath /tmp/kid-sprout-ios-derived build CODE_SIGNING_ALLOWED=NO
xcodebuild -project native/ios/KidSprout.xcodeproj -scheme KidSprout \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro' \
  -derivedDataPath /tmp/kid-sprout-ios-derived test CODE_SIGNING_ALLOWED=NO
```

模拟器名称以本机 `xcrun simctl list devices available` 为准。测试包含课程校验、不同顺序点水果、游戏答错重试/锁关/单次奖励、损坏存档回退，以及 iOS 画板草稿恢复、清空撤销重做、PNG 尺寸与白底。UI 测试覆盖学习、游戏五关、重启进度、画板横竖屏与恢复、系统分享和邮件家长验证。

如新增源码或资源，需要更新项目：

```sh
node native/ios/generate-project.cjs
```

该脚本仅依赖 Node 内置库，不需要 XcodeGen。图标可用系统 AppKit 重绘：

```sh
swift native/ios/scripts/GenerateIcon.swift native/ios/App/Assets.xcassets/AppIcon.appiconset/icon.png
```

## 本地数据与交互

- 学习记录使用系统 UserDefaults 的 `kid-sprout-native-progress-v1`；读取时校验版本、数字范围和奖励数。课程完成与游戏奖励分开保存，与网页存档独立。
- 数水果时只累计不同水果，重复点击不会多算。零用空篮子和放入/拿走苹果解释。
- 每个小游戏每局五关；答错可重试，答对后锁定答案并显式下一关。第五关完成后每局只奖励一次。
- 画板支持手指及 Apple Pencil；首版仅支持单窗口，固定 1000×700 逻辑纸面随窗口等比显示。每笔改变、撤销/重做/清空、离开页面或应用转后台都会原子保存到 Application Support 的 `sprout-drawing-v1.pkdrawing`。清空可撤销。
- 分享输出 2000×1400 白底 PNG，包含笔迹、不含工具栏。分享及邮件都经过家长算术验证；取消验证不触发外部动作。
- 中文语音依赖系统可用声音；文字和图形可独立使用。家长区可关闭声音。
- 系统深浅色自适应，画纸始终为白底。首版无自动动画，不增加声音或动态刺激。

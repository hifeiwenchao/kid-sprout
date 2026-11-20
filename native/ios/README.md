# 萌呀启蒙 · iPhone / iPad

SwiftUI、PencilKit与AVFoundation实现，最低iOS17。按网页版设计组织六入口、三个完整学科、60游戏、88记忆场景、课内临摹和自由画板。所有内容离线，无WebView或第三方运行依赖，详细范围见[原生说明](../README.md)。

## 在Xcode运行

在Finder打开仓库的`native/ios/KidSprout.xcodeproj`，或在仓库根目录执行：

```sh
open native/ios/KidSprout.xcodeproj
```

顶部选择 **KidSprout** scheme 和 **iPhone / iPad Simulator** 后运行。Mac选择 **KidSproutMac + My Mac**。

**不要把`Package.swift`当作应用工程打开。**它只包含KidSproutCore共享库及模型测试，没有可运行的App。若顶部只有KidSproutCore，关闭该包窗口并打开上述`.xcodeproj`。

工程开发团队为 `wenchao fei`（Team ID：`5A9Z4D7HV3`）。真机运行前在 Xcode 的 Settings → Accounts 登录该团队所属 Apple 账户，并在 Signing & Capabilities 确认团队。iOS 与 Mac 主应用 Bundle ID 已由 `com.feiwenchao.mengya` 改为 `com.feiwenchao.kid-sprout`，版本 `1.0.0`、构建号 `2`。新标识已在 Apple Developer 注册。旧 `com.feiwenchao.kidsprout` 已被其他产品占用，不能用于本产品商店记录；更换标识后本地数据容器也会变化，本轮未实现跨 Bundle ID 数据迁移。

iOS 工程使用自动签名。新标识的 `1.0.0`（build `2`）已完成签名归档、导出上传和 App Store Connect 处理，并已提交审核（提交 `a198cc45-3460-4ce3-adb9-f9ab97e63323`，当前显示“等待审核”）。版本为手动发布，尚未上线。Release `ENABLE_TESTABILITY=NO`，Debug 保持 `YES`；共享隐私清单会同时打包进应用及嵌入的 Core framework，声明自身 UserDefaults 的 `CA92.1` 用途。后台无签名编译产物不能替代商店签名构建。

## 后台构建与模型测试

以下命令不会启动模拟器窗口或应用：

```sh
swift test --package-path native/ios
xcodebuild -project native/ios/KidSprout.xcodeproj -scheme KidSprout \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath /tmp/kid-sprout-ios build CODE_SIGNING_ALLOWED=NO
```

编译宿主单测/UI测试而不执行，可将`build`换为`build-for-testing`。实际UI自动化需在专用测试环境执行；当前用户会话只做后台验证。旧初版UI截图在`screenshots/`，不能代表本轮新界面验收。

验证设备 Release 编译且不申请签名，可使用以下后台命令；产物不能直接用于商店上传：

```sh
xcodebuild -project native/ios/KidSprout.xcodeproj -scheme KidSprout \
  -configuration Release -destination 'generic/platform=iOS' \
  -derivedDataPath /tmp/kid-sprout-ios-release \
  build CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO
```

新增Swift文件或资源后更新工程：

```sh
node native/ios/generate-project.cjs
```

重新生成 iOS 和 Mac 的不透明图标（在仓库根目录执行，不启动应用）：

```sh
swift native/ios/scripts/GenerateIcon.swift native/ios/App/Assets.xcassets/AppIcon.appiconset/icon.png
node native/ios/scripts/GenerateMacIcons.cjs
```

该脚本仅依赖Node内置库，无需XcodeGen。共享核心的全部Swift文件、App界面、`curriculum.json`、`activities.json`和`illustrations/`均由工程打包。离线PNG在构建内容时由resvg生成，应用运行时无SVG/HTML解析依赖。

## 交互与兼容

- iPhone底部六入口，iPad宽屏使用可滚动学习地图侧栏；课程详情和游戏是原生弹窗，课程内可直接开启游戏。
- 数字首次点击按累计数量播报，重复点击忽略。课程/游戏完成分别记录，游戏每局只领奖一次；三科继续学习直接打开未学课程，全部完成后复习。
- 系统中文/英语语音分别播放例字、字母名/单词；数字儿歌按实际语音结束回调逐句突出，可暂停和点句播放。
- 画板固定1000×700，手指与Apple Pencil都可画。保留旧raw PKDrawing草稿，新v2文件将笔迹与底稿一起原子保存。换底稿清墨可撤销恢复，橡皮/清空不会擦掉底稿。
- PNG为2000×1400白底，包含底稿、不含网格/辅助线；经家长确认后调用系统分享。原生全屏画板避免两个页面争用同一PKCanvasView。
- 学习记录使用UserDefaults，兼容v1数字存档；拼音按lesson-1…14、字母按A…Z记录。与网页/Android/Mac独立；删除应用会移除本地记录，撤销栈不跨重启保留。

## App Store 迁移

当前 `com.feiwenchao.kid-sprout` / `1.0.0 (2)` 的 [App Store Connect 新统一记录 `6836774748`](https://appstoreconnect.apple.com/apps/6836774748/distribution) 已创建。iOS build `2` 已上传、处理并关联版本，审核提交 `a198cc45-3460-4ce3-adb9-f9ab97e63323` 当前显示“等待审核”；Mac build `2` 也已上传并提交审核，提交 `d20238f9-2c11-4871-9bde-bf90db8d18fc` 在 2026-11-20 因 Guideline 2.1 需要补充资料被拒；iOS 仍等待审核。版本为手动发布，尚未上线。

旧 [统一记录 `6836726939`“萌呀启蒙旧标识存档”](https://appstoreconnect.apple.com/apps/6836726939/distribution) 曾用 `com.feiwenchao.mengya` 的 `1.0.0 (1)` 完成两端提交并等待审核；迁移时已执行撤回，旧两端均显示“被开发者拒绝”，原 iOS 提交 `7c3e17f1-1197-4576-a6c7-febe2e305494` 和 Mac 提交均已撤回。旧记录的元数据、私人审核联系资料、免费定价、全部 175 个国家/地区（含 CHN）和手动发布设置不会自动迁移；新记录的对应设置已重新保存并完成审核提交。

商店资料与迁移记录见 [Apple 发布记录](../app-store/README.md)，中文名称、副标题、描述、关键词与审核备注见 [简体中文元数据](../app-store/metadata.zh-Hans.md)。[隐私政策](https://kid.feiwenchao.com/privacy.html) 与 [支持页面](https://kid.feiwenchao.com/support.html) 已公开发布并确认 HTTP `200`；新记录的 App Privacy 已按用户确认发布“不收集数据”。旧 App ICP 栏为空且自动校验未阻断原提交，不表示备案豁免或中国大陆上线已获批准。

[专用 iPhone 目录](../app-store/screenshots/iphone/) 有 2 张原始 JPG，[专用 iPad 目录](../app-store/screenshots/ipad/) 有 1 张。它们实际来自旧标识 `com.feiwenchao.mengya` / `1.0.0 (1)`；中屏 iPhone `1206×2622` 与 iPad `2064×2752` 曾在旧后台各保存 1 张（`1/10`），大屏 iPhone 图保留本地。界面本轮未改，可复用，但不冒称 build `2` 新采集图。来源与范围见 [截图记录](../app-store/screenshots/README.md)，测试证据与未验证项见 [验证记录](../VALIDATION.md)。

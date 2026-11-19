# 萌呀启蒙 · iPhone / iPad

SwiftUI、PencilKit与AVFoundation实现，最低iOS17。按网页版设计组织六入口、三个完整学科、60游戏、88记忆场景、课内临摹和自由画板。所有内容离线，无WebView或第三方运行依赖，详细范围见[原生说明](../README.md)。

## 在Xcode运行

在Finder打开仓库的`native/ios/KidSprout.xcodeproj`，或在仓库根目录执行：

```sh
open native/ios/KidSprout.xcodeproj
```

顶部选择 **KidSprout** scheme 和 **iPhone / iPad Simulator** 后运行。Mac选择 **KidSproutMac + My Mac**。

**不要把`Package.swift`当作应用工程打开。**它只包含KidSproutCore共享库及模型测试，没有可运行的App。若顶部只有KidSproutCore，关闭该包窗口并打开上述`.xcodeproj`。

工程开发团队为 `wenchao fei`（Team ID：`5A9Z4D7HV3`）。真机运行前在 Xcode 的 Settings → Accounts 登录该团队所属 Apple 账户，并在 Signing & Capabilities 确认团队。iOS 与 Mac 主应用 Bundle ID 统一为 `com.feiwenchao.mengya`，首发版本 `1.0.0`、构建号 `1`。旧 `com.feiwenchao.kidsprout` 已被其他产品占用，不能继续用于本产品商店记录；更换标识后本地数据容器也会变化，本轮未实现旧标识数据迁移。

iOS 工程使用自动签名，本轮 `1.0.0`（build `1`）已签名归档、上传并实际提交成功，页面显示“正在等待审核”。Release `ENABLE_TESTABILITY=NO`，Debug 保持 `YES`；共享隐私清单会同时打包进应用及嵌入的 Core framework，声明自身 UserDefaults 的 `CA92.1` 用途。当前为手动发布，尚未审核通过或上线；后台无签名编译产物不能替代已提交的签名构建。

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

## App Store 准备

iPhone/iPad 与 Mac 的 `1.0.0`（build `1`）均已在 [App Store Connect 统一记录 `6836726939`](https://appstoreconnect.apple.com/apps/6836726939/distribution) 实际提交成功，两端页面均显示“正在等待审核”，均选择手动发布、尚未上线。iOS 审核提交 ID 为 `7c3e17f1-1197-4576-a6c7-febe2e305494`。两端 build `1`、版本元数据和审核联系资料已保存，私人联系资料仅保留在 Apple 后台。

后台定价免费，供应范围为全部 175 个国家/地区；中国大陆（CHN）显示“App 发布时供应”。App ICP 栏仍为空，自动校验未阻断提交，不表示备案豁免或已批准中国大陆上线。

商店资料与提交记录见 [Apple 发布记录](../app-store/README.md)，中文名称、副标题、描述、关键词与审核备注见 [简体中文元数据](../app-store/metadata.zh-Hans.md)。[隐私政策](https://kid.feiwenchao.com/privacy.html) 与 [支持页面](https://kid.feiwenchao.com/support.html) 已公开发布并确认 HTTP `200`；App Privacy 已按用户确认发布“不收集数据”。

新商店素材在 [专用 iPhone 目录](../app-store/screenshots/iphone/) 有 2 张原始 JPG、[专用 iPad 目录](../app-store/screenshots/ipad/) 有 1 张。中屏 iPhone `1206×2622` 与 iPad `2064×2752` 已分别成功上传到后台，各显示 `1/10`；大屏 iPhone 图仍保留在目录。来源与范围见 [截图记录](../app-store/screenshots/README.md)，不以历史截图代替最终验收。测试证据与未验证项见 [验证记录](../VALIDATION.md)。

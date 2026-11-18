# 萌芽启蒙 · iPhone / iPad

SwiftUI、PencilKit与AVFoundation实现，最低iOS17。按网页版设计组织六入口、三个完整学科、60游戏、88记忆场景、课内临摹和自由画板。所有内容离线，无WebView或第三方运行依赖，详细范围见[原生说明](../README.md)。

## 在Xcode运行

在Finder打开仓库的`native/ios/KidSprout.xcodeproj`，或在仓库根目录执行：

```sh
open native/ios/KidSprout.xcodeproj
```

顶部选择 **KidSprout** scheme 和 **iPhone / iPad Simulator** 后运行。Mac选择 **KidSproutMac + My Mac**。

**不要把`Package.swift`当作应用工程打开。**它只包含KidSproutCore共享库及模型测试，没有可运行的App。若顶部只有KidSproutCore，关闭该包窗口并打开上述`.xcodeproj`。

真机需在Signing & Capabilities选择自己的开发团队。应用bundle ID为`com.feiwenchao.kidsprout`，此阶段未配置App Store发布签名。

## 后台构建与模型测试

以下命令不会启动模拟器窗口或应用：

```sh
swift test --package-path native/ios
xcodebuild -project native/ios/KidSprout.xcodeproj -scheme KidSprout \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath /tmp/kid-sprout-ios build CODE_SIGNING_ALLOWED=NO
```

编译宿主单测/UI测试而不执行，可将`build`换为`build-for-testing`。实际UI自动化需在专用测试环境执行；当前用户会话只做后台验证。旧初版UI截图在`screenshots/`，不能代表本轮新界面验收。

新增Swift文件或资源后更新工程：

```sh
node native/ios/generate-project.cjs
```

该脚本仅依赖Node内置库，无需XcodeGen。共享核心的全部Swift文件、App界面、`curriculum.json`、`activities.json`和`illustrations/`均由工程打包。离线PNG在构建内容时由resvg生成，应用运行时无SVG/HTML解析依赖。

## 交互与兼容

- iPhone底部六入口，iPad宽屏使用可滚动学习地图侧栏；课程详情和游戏是原生弹窗，课程内可直接开启游戏。
- 数字首次点击按累计数量播报，重复点击忽略。课程/游戏完成分别记录，游戏每局只领奖一次；三科继续学习直接打开未学课程，全部完成后复习。
- 系统中文/英语语音分别播放例字、字母名/单词；数字儿歌按实际语音结束回调逐句突出，可暂停和点句播放。
- 画板固定1000×700，手指与Apple Pencil都可画。保留旧raw PKDrawing草稿，新v2文件将笔迹与底稿一起原子保存。换底稿清墨可撤销恢复，橡皮/清空不会擦掉底稿。
- PNG为2000×1400白底，包含底稿、不含网格/辅助线；经家长确认后调用系统分享。原生全屏画板避免两个页面争用同一PKCanvasView。
- 学习记录使用UserDefaults，兼容v1数字存档；拼音按lesson-1…14、字母按A…Z记录。与网页/Android/Mac独立；删除应用会移除本地记录，撤销栈不跨重启保留。

测试证据与未验证项见[验证记录](../VALIDATION.md)。

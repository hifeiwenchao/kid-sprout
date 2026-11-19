# 萌呀启蒙 · 全端原生应用

iPhone/iPad/Mac使用SwiftUI，iOS画板使用PencilKit，Mac画板使用AppKit；Android手机/平板使用Kotlin、Jetpack Compose和Canvas。所有端以本仓库网页版为设计、课程和玩法基准，使用相同离线资源，不使用WebView或运行网页JavaScript。免费，无账号、广告、打赏、内购或后端。

## 内容与页面

- 六个入口：探索首页、数字乐园、拼音天地、字母森林、小小画板、游戏大厅。宽屏学习地图侧栏，手机保留全部六个入口；统一奶油白、鼠尾草绿、浅紫与淡金卡片、原有插画和页面层级。
- 首页三学科学习进度、直接继续未学课程、精选游戏和画板横幅；八枚成长徽章、打卡和单独作者介绍。
- 数字0–10对应原有数量插画，零为空篮子互动；计数只累计首次点击的物体，重复点击不多算。数字儿歌按句播放。
- 拼音按2024新版人教一年级上册14课/三单元顺序，包含47个声韵母、16个整体认读音节、四声、口型、例字、拼读与拼写规则。点读是合成的例字读音参考，请结合老师/家长示范声母轻短音。
- A–Z大小写、四个分组、26个单词；字母名和单词分别用英语点读。
- 88个记忆小剧场使用网页原SVG的三个离线阶段图，有限播放并可重播；减少动态时使用静态图。数字与大小写课内可临摹，不自动评判字形或累计游戏奖励。
- 60个小游戏，三科各20，学科/目标/关键词组合筛选。四种通用玩法和原版翻牌、气球、火车、胡萝卜比较、点心装填、听鼓等专用交互；翻牌和气球各三关，描画为自由练习，其余每局五关。错答可重试，答对锁定，通关只领奖一次。
- 自由画板提供12色/自选色、画笔/荧光笔/橡皮、粗细、网格、撤销/重做/清空、37个数字/大小写底稿及前后切换。底稿与墨迹独立，换底稿清墨可撤销；导出带底稿、不带网格或辅助线。

## 工程

| 平台 | 说明 | 最低系统 |
| --- | --- | --- |
| iPhone / iPad | [ios/README.md](ios/README.md) | iOS 17 |
| Mac | [macos/README.md](macos/README.md) | macOS 14 |
| Android 手机 / 平板 | [android/README.md](android/README.md) | Android 8.0 / API 26 |
| 统一课程/题库/插画 | [shared/README.md](shared/README.md) | JSON schema 1 |

在Xcode打开`native/ios/KidSprout.xcodeproj`；iPhone/iPad选择**KidSprout + 模拟器**，Mac选择**KidSproutMac + My Mac**。`Package.swift`是没有应用入口的共享核心库，不能用KidSproutCore scheme运行客户端。

## 后台验证与内容更新

```sh
npm ci
npm run native:content
npm run native:content -- --check
npm test
npm run build
swift test --package-path native/ios
# macOS 后台画板模型与 PNG 测试
npm run native:test:mac-drawing
```

课程、题组与PNG在构建时从网页源数据导出，各端打包同一目录；内容不依赖CDN或在线网站。网页Docker构建排除`native/`。每游戏包含8套确定种子题组，每局随机选一套。

上述后台验证命令运行模型测试、Gradle 单测/lint 和 Xcode 构建，不启动应用或操作当前桌面。Mac UI 测试会使用鼠标/键盘并抢焦点，应放在专用机器/CI；本轮没有在当前桌面执行新 UI 测试。发布素材的后台截图采集另见 [专用截图记录](app-store/screenshots/README.md)。

## 数据与分发

学习记录及画作在当前设备保存，兼容已有数字学习进度与画稿。Apple保留1000×700稿纸和2000×1400导出；Android旧正方形画稿保留原比例，选择新底稿后使用1000×700新稿，撤销可恢复旧稿。撤销栈不跨进程重启保存。各端与网页不共享存档、不联网同步。

移动端卸载/清除应用数据会移除本地记录；Mac移除`.app`后数据仍保留。点读音色/离线可用性取决于系统语音，静音时可用图文和游戏提示。邮件和作品导出需先经过家长算术验证，再由系统邮件/分享/保存面板继续，不会自动发送邮件或作品。

本地测试包在Git忽略的`native/artifacts/`，旧测试包不等同于商店交付物。Apple 两端主应用统一使用 `com.feiwenchao.mengya`，`1.0.0`（build `1`）均已在 [App Store Connect 统一记录 `6836726939`](https://appstoreconnect.apple.com/apps/6836726939/distribution) 实际提交成功，iOS 与 macOS 均显示“正在等待审核”。两端均为手动发布，尚未审核通过、尚未上线。iOS 自动签名，Mac Release 自动签名、Debug 保持本地 ad hoc；Android 交付物仍为 debug 签名。

iPhone/iPad 与 Mac 均计划首发，且须包含中国大陆。后台定价已设免费，供应范围已设全部 175 个国家/地区，中国大陆（CHN）明确显示“App 发布时供应”。两端 build `1`、版本元数据、审核联系资料和截图均已保存；中屏 iPhone、iPad 与 Mac 截图后台各为 `1/10`。隐私/支持页已公开发布，App Privacy 已按用户确认发布“不收集数据”。App ICP 栏仍为空，自动校验未阻断提交，但不代表备案豁免或已批准中国大陆上线。审核提交 ID 与后续状态见 [Apple 发布记录](app-store/README.md)，检查证据与边界见 [验证记录](VALIDATION.md)；历史截图不能代替最终发布版本验收。

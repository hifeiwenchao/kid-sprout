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

本地测试包在Git忽略的`native/artifacts/`，旧测试包不等同于商店交付物。Apple 两端主应用已按用户要求由 `com.feiwenchao.mengya` 改为 `com.feiwenchao.kid-sprout`，当前版本 `1.0.0`（build `2`）。新标识已在 Apple Developer 注册，Mac 签名归档成功；iOS 归档因本机 Xcode 账户凭据失效及新标识缺少开发描述文件受阻，需恢复账户后继续。Mac 归档为 development 签名，其导出上传因缺少 Xcode 账户令牌失败；两端均等待本机 Xcode 重新登录，尚未上传成功或重新提审，尚未上线。iOS 自动签名，Mac Release 自动签名、Debug 保持本地 ad hoc；Android 交付物仍为 debug 签名。

旧 [App Store Connect 记录 `6836726939`“萌呀启蒙旧标识存档”](https://appstoreconnect.apple.com/apps/6836726939/distribution) 曾以 `com.feiwenchao.mengya` 的 `1.0.0 (1)` 完成两端上传和提审；为迁移标识已执行撤回，旧两端均显示“被开发者拒绝”，原提交已撤回。该记录的“正在等待审核”截图是迁移前的历史凭据，不能代表当前状态。[新统一记录 `6836774748`](https://appstoreconnect.apple.com/apps/6836774748/distribution) 已创建，iOS 版本元数据、审核联系资料和手动发布已保存；旧记录的免费、全部 175 个国家/地区（含中国大陆）、手动发布、元数据、隐私和截图设置不视为已自动迁移。

隐私/支持页已公开发布；旧记录的 App Privacy 已按用户确认发布“不收集数据”。旧 App ICP 栏为空且自动校验未阻断原提交，不代表备案豁免或已批准中国大陆上线。现有商店截图来自旧标识 `1.0.0 (1)`，本次只改应用标识、构建号，界面未变，可复用素材但不冒称新包截图。当前迁移及历史提交证据见 [Apple 发布记录](app-store/README.md)，验证范围见 [验证记录](VALIDATION.md)。

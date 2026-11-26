# iOS 儿童类别审核补充说明 · 2026-11-26

状态：已核对代码与实际提交的 build 2 归档，以下回复待用户授权发送；尚未回复或重新提交。

## 拒审原因

[iOS 审核提交](https://appstoreconnect.apple.com/apps/6836774748/distribution/reviewsubmissions/details/a198cc45-3460-4ce3-adb9-f9ab97e63323) 的 Apple 消息时间为 2026-11-20 17:02。页面状态为“已拒绝”，列出 `2.1.0 Performance: App Completeness`；消息实际要求补充 Kids Category 对 Guideline 1.3 的说明，逐项回答第三方分析、广告、数据共享及其他用户/设备数据收集。消息没有列出崩溃或功能故障，也没有要求替换构建或提供 iOS 录屏。

对应 iOS `1.0.0 (2)`，Bundle ID `com.feiwenchao.kid-sprout`，App Store Connect build UUID `b36c2e1f-908b-4a0e-95d7-7706b0572742`。Mac 当前显示“正在等待审核”，本次不修改 Mac 提交。

## 核对依据

- 归档 `native/artifacts/app-store/KidSprout-iOS-1.0.0-2b.xcarchive` 的动态链接依赖只有 Apple 系统库及自有 `KidSproutCore.framework`，未包含第三方统计或广告 SDK。
- 主 App 与 Core 的隐私清单均声明不跟踪、无收集数据类型、UserDefaults 自身数据用途 `CA92.1`。
- `native/ios/Sources/KidSproutCore/Models.swift` 保存本地课程进度、打卡日期、游戏完成与奖励、声音设置；`native/ios/App/DrawingView.swift` 保存沙盒内的画稿并按家长操作生成分享文件。
- `native/ios/App/ParentsView.swift`、`CourseViews.swift` 与 `DrawingView.swift` 的邮箱、资料外链和作品分享均经过家长算术验证；外部目标由系统浏览器、邮件或分享面板处理。
- 点读使用 `AVSpeechSynthesizer`，文本来自课程内容，不使用麦克风录音。
- 当前代码新增的最近游戏记录同样仅在本地 UserDefaults 中；不把它声称为提交的 build 2 已有功能。
- 本轮为静态代码和归档核对，未启动应用、模拟器或执行网络抓包，不把静态检查声称为动态隐私流量测试。

## 待发送英文回复

```text
Hello App Review,

Thank you for your message. The following responses apply to 萌呀启蒙, iOS version 1.0.0 (2), bundle ID com.feiwenchao.kid-sprout, submitted to the Kids Category.

1. Third-party analytics
No. The app does not integrate third-party analytics, crash-reporting, attribution, tracking or social SDKs. It does not send usage events, learning progress, drawings, advertising identifiers or other user/device data to an analytics provider or to the developer. The app uses Apple system frameworks and our own bundled KidSproutCore framework.

2. Third-party advertising
No. The app contains no third-party advertising or ad-network SDKs. There are no ads, in-app purchases, subscriptions or paid unlocks. Therefore, there is no ad network policy to provide.

3. Sharing data with third parties
The app does not automatically upload or share user/device data with the developer or third-party services. There is no app backend, online account, cloud synchronization, public upload or social feed.

Optional external actions require a parental gate: the parent must correctly answer the randomly displayed addition question before opening a public curriculum-reference website, opening the system email app, or exporting a drawing through the iOS share sheet. The email action only opens a mail composer addressed to hi@feiwenchao.com; it does not automatically attach learning records or drawings, and it does not send a message. The parent controls whether to compose/send an email or select a share destination. Any resulting email or shared image is handled by the parent's chosen external service. External reference sites are opened in the system browser and are governed by their operators' privacy policies. These optional actions are not required for lessons or games.

4. Other collection or use of user/device data
The app does not collect user or device information for other purposes. No registration or login is required, and the app does not request access to the microphone, camera, location, contacts, photo library or advertising identifier.

To restore the family's activity on the same device, the app stores learning progress, completed-game/reward records, visit dates and sound preferences in its own local UserDefaults, and drawing drafts in its local app sandbox. These records are processed locally, are not transmitted by the app and are not accessible to the developer. The privacy manifests in both the app and its own framework declare UserDefaults reason CA92.1, no tracking and no collected data types. Deleting the iOS app removes its local app data.

All lessons, game questions and illustrations are bundled and can be used offline. Speech uses Apple's AVSpeechSynthesizer to read preset course text using system voices; the app does not record a child's voice or send audio to a developer-operated or third-party speech service.

The privacy policy is available offline from “给爸爸妈妈的话” (For Parents) or “关于作者” (About the Author) → “隐私政策” (Privacy Policy), and publicly at https://kid.feiwenchao.com/privacy.html.

Please let us know if any further clarification is needed to continue the review under Guideline 1.3.

Thank you.
```

补充资料问题优先使用现有 build 2 回复，不因这条消息自动上传尚未完成真机验收的 UI 更新。回复后按后台实际状态决定是否需要“更新审核／重新提交”；回复已发送不等于重新提交成功或审核通过。

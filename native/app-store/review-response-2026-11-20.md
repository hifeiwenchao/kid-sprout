# Mac 审核补充材料 · 2026-11-20

状态：本地草稿，实体 Mac 录屏已完成；尚未回复 Apple、保存新审核备注或重新提交。

## Apple 实际要求

- App：萌呀启蒙，`com.feiwenchao.kid-sprout`，macOS `1.0.0 (2)`。
- [Mac 审核提交](https://appstoreconnect.apple.com/apps/6836774748/distribution/reviewsubmissions/details/d20238f9-2c11-4871-9bde-bf90db8d18fc)：2026-11-20 07:25，已拒绝／问题未解决。
- 消息标题：`Guideline 2.1 - Information Needed - New App Submission`。Apple 要求进一步了解应用，并未在此消息中给出具体崩溃、失效按钮或复现步骤。
- [审核列表](https://appstoreconnect.apple.com/apps/6836774748/distribution/reviewsubmissions)：本次查看时，iOS `1.0.0` 仍为“等待审核”。Mac 的结果不能代替 iOS 的结果。
- 必须在回复及 `App Review Information → Notes` 同时提供六项材料：实体设备最新版系统录屏、用途与目标用户、主要功能访问说明、外部依赖、地区差异、受监管业务／第三方受保护内容的相关说明。

## 实体 Mac 录屏步骤

Apple 要求录屏从启动应用开始并覆盖典型使用流程，没有指定视频时长。建议 3–5 分钟，按下列顺序录制。必须使用实体 Mac；不要用网页、模拟器或首页静态截图替代。

1. 确认该 Mac 运行 Apple 当前提供的最新正式 macOS，记录机型、芯片、系统版本与构建号。本机本次只读检查为 macOS `26.5 (25F71)`，没有据此确认它是最新正式系统，也没有自动升级系统。
2. 优先使用 TestFlight 中本次提交的 `1.0.0 (2)`；本地对应归档为 `native/artifacts/app-store/KidSprout-macOS-1.0.0-2.xcarchive/Products/Applications/KidSproutMac.app`。核对应用标识与版本，勿混用旧标识 build `1`。
3. 先退出应用，按 `⇧⌘5` 开始录制适当的屏幕区域，再启动“萌呀启蒙”，展示探索首页与六个主要入口。录制区域需包含随后弹出的应用窗口与保存面板。
4. **数字乐园**：打开一个数字，点击不同水果演示累计数数；展示记忆小剧场、课程临摹和学习完成／进度变化。
5. **拼音天地**：打开一课，展示声韵母、口型与例字点读；展开资料说明，说明点读是系统合成的例字参考。
6. **字母森林**：打开 Aa 等课程，分别点读字母与单词，展示大小写同纸临摹。
7. **游戏大厅**：按学科筛选，进入一个游戏，演示答错可重试、答对进入下一关；完成一局更能说明奖励与返回流程。
8. **小小画板**：画几笔，切换工具／颜色，撤销与重做，选择底稿；点击保存，通过“请家长来帮忙”的随机加法题后展示 PNG 保存面板并保存示例作品。
9. **关于作者／给爸爸妈妈的话**：打开离线隐私政策，演示邮箱或资料外链的家长验证；取消外部操作即可，无需发邮件。
10. 停止录制并播放检查，确认开头是启动、本次构建可识别、主要流程完整、画面清晰。可录系统声音以展示点读；不要把未录到的声音当成已演示。

不需要演示注册、登录、账号删除、付费解锁或社区举报／拉黑：本应用没有这些在线功能。画板作品是本地用户创作，需展示本地保存；应用没有公开上传或其他用户内容列表。

本次实体 Mac 录屏已完成：Mac 型号标识 `Mac17,2`（arm64），macOS `26.5 (25F71)`，应用 `1.0.0 (2)`，录制日期 2026-11-21，时长 315 秒。有效视频为 `native/artifacts/app-store/kidsprout-macos-build2-review.mp4`，使用应用窗口录制，覆盖启动首页、数字课程与计数、拼音课程与例字点读、字母课程与单词点读、游戏筛选与答题重试、画板工具与临摹、家长算术验证和关于作者。视频与测试记录放在 Git 忽略的 `native/artifacts/app-store/`。本次录制中保存 PNG 按钮显示“暂时无法打开保存窗口”，因此没有把系统保存面板或实际 PNG 文件声称为已展示；提交 Apple 前应决定是否先修复并递增 build。

## 英文回复与 Notes 草稿

以下文本可同时用作回复和 Notes 补充。发送前将视频作为 Apple 后台可访问的附件或链接提供，并保留实际设备信息。不要把不存在的附件提交给 Apple。保留原有审核联系方式与隐私政策信息。

```text
Hello App Review,

Thank you for your feedback under Guideline 2.1. This information concerns 萌呀启蒙, macOS version 1.0.0 (2), bundle ID com.feiwenchao.kid-sprout.

1. Physical-device recording
Recording: kidsprout-macos-build2-review.mp4. Tested on a physical Mac (model identifier Mac17,2, arm64) running macOS 26.5 (build 25F71), app version 1.0.0 (2), on 2026-11-21. The recording begins with launching the app and shows the Explore home, numbers, pinyin, alphabet, games, drawing, parent verification and About the Author. The Save PNG button was also tested; in this build it displayed “暂时无法打开保存窗口”, so no system save panel is claimed as demonstrated.

2. Purpose and audience
This is a free parent-accompanied early-learning app for children, including the selected Kids age group of 6–8. It helps families practise number recognition (0–10), introductory Mandarin pinyin and English letters through short lessons, 60 games, visual memory scenes and drawing. Parents can choose suitable activities at the child's pace. It does not offer formal schooling, tutoring bookings or certified educational services.

3. Setup and main features
No account, password, invitation, payment or sample file is required. All lessons, questions and illustrations are included in the installation and work offline.

From the left sidebar:
- 探索首页 (Explore): open subject cards and continue learning.
- 数字乐园 (Numbers): select a number; click objects to count, play speech, view a memory scene and practise tracing.
- 拼音天地 (Pinyin): select a lesson to view symbols, mouth-position guidance and example words. Speech is a system-synthesized example-word reference, not a separate phoneme recording.
- 字母森林 (Alphabet): select a letter to hear its name and example word, and trace uppercase/lowercase letters.
- 游戏大厅 (Games): filter by subject or practice goal and open a game. Incorrect answers can be retried; use the next-round button after a correct answer.
- 小小画板 (Drawing): draw with the mouse/trackpad, choose tools, undo/redo and select tracing guides. Saving a PNG requires answering the displayed random addition question, then choosing a destination in the system save panel.

给爸爸妈妈的话 (For Parents) and 关于作者 (About the Author) are at the bottom of the sidebar. They provide the offline privacy policy. Email and optional source links also require the arithmetic parental gate; there is no fixed bypass answer. No email is automatically sent.

There is no registration/login/account-deletion flow, paid content, subscription, advertising or social/community feature. Drawings are created and stored locally; the app has no user-upload server, public content feed or interactions between users. Progress is local to the current device.

4. External services, tools and platforms
Core features use native SwiftUI/AppKit, bundled JSON/PNG content, local files/UserDefaults and Apple's AVSpeechSynthesizer for speech. They do not require an external data provider, authentication server, payment processor, analytics service or AI service. Voice availability depends on installed system voices.

Optional parental-gated actions open the system browser for public pinyin references at shimengyuan.com and pep.com.cn, or the system email app for hi@feiwenchao.com. Our public privacy/support pages are https://kid.feiwenchao.com/privacy.html and https://kid.feiwenchao.com/support.html. These websites are not required to load lessons or games. There is no embedded WebView.

5. Regional availability
The app provides the same features and bundled content in all selected regions, including mainland China. There are no region-based feature gates. Interface and course content are primarily Simplified Chinese, with English letters/words. System voices and handlers for optional browser/email actions can differ by device configuration.

6. Regulated services and third-party material
The app provides basic offline practice, not financial, medical or other highly regulated services. It is an independent auxiliary learning app and is not affiliated with or endorsed by a textbook publisher. Pinyin lesson order references publicly available 2024 textbook catalog information. The app does not reproduce textbook page scans, publisher illustrations or textbook audio recordings. Optional reference links open the source websites in the user's browser after the parental gate.

Thank you for reviewing the app.
```

## 核对与提交边界

- 第 1 项实体设备录屏与 QA 已完成；第 2–5 项已按当前代码核对。保存 PNG 的系统面板仍未通过本次 build 验证。
- 第 6 项只描述可核对的内容，不无条件声称“全部文本原创”或已有第三方授权书。仓库含常见数字儿歌短句，来源／授权没有单独记录；若需进一步作版权保证，先核实来源或替换相关文本，不能编造证明文件。
- 补齐视频后，将完整六项说明放入 Mac 的审核备注，并在此 Mac 提交中回复 Apple，再按后台流程处理重新提交。仅回复空泛说明或重复上传同一个包，不能替代 Apple 要求的材料。
- 本次消息没有指定必须换构建；资料补齐后以后台允许的处理方式继续。若实体测试发现问题并修改程序，再递增 build、归档、上传和关联新构建。

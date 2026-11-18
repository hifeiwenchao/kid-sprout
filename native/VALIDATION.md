# 原生首版验证记录

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

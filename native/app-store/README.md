# 萌呀启蒙 · Apple 商店发布记录

本目录记录 iPhone/iPad 与 Mac 的首发提审情况。更新日期：2026-11-19。两端 `1.0.0`（build `1`）均已实际提交成功，App Store Connect 页面均显示 **“正在等待审核”**。两端均选择手动发布，**尚未审核通过、尚未上线**。定价免费，供应范围为全部 175 个国家/地区，中国大陆（CHN）显示“App 发布时供应”。App ICP 栏仍为空，自动校验未阻断提交；这不表示已获备案豁免或已批准中国大陆上线。

## 发布标识

| 项目 | 当前工程值 / 后台状态 |
| --- | --- |
| 显示名称 | 萌呀启蒙 |
| iPhone/iPad scheme | `KidSprout`，最低 iOS 17 |
| Mac scheme | `KidSproutMac`，最低 macOS 14 |
| 两端应用 Bundle ID | `com.feiwenchao.mengya` |
| App Store Connect Apple ID | `6836726939`，iOS 与 macOS 统一记录 |
| 商店后台 | [App Store Connect 分发页面](https://appstoreconnect.apple.com/apps/6836726939/distribution) |
| 首发版本 / 构建号 | `1.0.0` / `1` |
| 开发团队 | `5A9Z4D7HV3`（wenchao fei） |
| 定价与业务 | 免费，无账号、广告、打赏、内购或订阅 |
| 供应范围 | 全部 175 个国家/地区，包含中国大陆（CHN：“App 发布时供应”） |
| 发布方式 | iOS 与 macOS 均为手动发布 |
| 当前审核状态 | iOS 与 macOS 均“正在等待审核”，未上线 |
| 分类 / 年龄设置 | 教育；内容分级 `4+`；儿童年龄组 `6–8 岁`，后台均已完成 |
| 隐私政策 URL | [https://kid.feiwenchao.com/privacy.html](https://kid.feiwenchao.com/privacy.html) |
| 支持 URL | [https://kid.feiwenchao.com/support.html](https://kid.feiwenchao.com/support.html) |
| 公开支持邮箱 | `hi@feiwenchao.com` |

隐私政策和支持页面均已公开发布，本轮通过公网 HTTPS 请求确认两者返回 HTTP `200`；源码分别在 `public/privacy.html` 和 `public/support.html`。App Privacy 的“不收集数据”回答已按用户确认发布。两端版本元数据、审核联系资料、构建、截图与手动发布设置已保存并用于本次提交；私人审核联系资料只保存在 Apple 后台。中文文案与提交信息见 [metadata.zh-Hans.md](metadata.zh-Hans.md)。

旧应用标识 `com.feiwenchao.kidsprout` 已被另一款产品占用，不得把本应用构建上传到该旧记录。本轮已建立新的统一记录 `6836726939`，两端使用 `com.feiwenchao.mengya`。新标识与旧测试包使用不同应用容器，本轮没有实现跨 Bundle ID 的学习记录或画稿迁移。

## 本轮完成的提审与验证

| 检查 | 实际状态 / 证据 |
| --- | --- |
| iOS 签名归档 | `ARCHIVE SUCCEEDED`；`native/artifacts/app-store/Mengya-iOS-1.0.0-1.xcarchive`；日志 `/tmp/mengya-ios-archive.log` |
| Mac 签名归档 | `ARCHIVE SUCCEEDED`；`native/artifacts/app-store/Mengya-macOS-1.0.0-1.xcarchive`；日志 `/tmp/mengya-macos-archive.log` |
| iOS 导出上传 | `Upload succeeded`、`EXPORT SUCCEEDED`；日志 `/tmp/mengya-ios-upload.log` |
| Mac 导出上传 | `Upload succeeded`、`EXPORT SUCCEEDED`；日志 `/tmp/mengya-macos-upload.log` |
| iOS 审核提交 | 提交成功，“正在等待审核”；提交 ID `7c3e17f1-1197-4576-a6c7-febe2e305494` |
| Mac 审核提交 | 提交成功，“正在等待审核”；提交 ID `529d3f28-7a86-4807-9f30-3e85a58cbf53` |
| 构建关联 | 两端版本均已选择并保存 build `1` |
| 归档标识 | 直接读取两份应用 Info.plist，均为 `com.feiwenchao.mengya` / `1.0.0` / `1` |
| 公开页面 | 隐私政策与支持页已发布，本轮公网 HTTPS 检查均为 HTTP `200` |
| App Privacy | 已按用户确认发布“不收集数据” |
| 中国大陆声明 | 安全评估与 AIGC 均声明不含适用功能，后台显示有效；App ICP 栏仍空，自动校验未阻断提交，未获得豁免或大陆上线批准结论 |
| 网页回归 | 125/125 测试通过，Vite 生产构建成功；日志 `/tmp/mengya-web-tests.log`、`/tmp/mengya-web-build.log` |
| Apple 共享核心 | 12/12 测试通过；日志 `/tmp/mengya-core-tests.log` |
| 截图保存 | iOS 中屏 iPhone、iPad 与 Mac 截图后台均为 `1/10`；本地另保留大屏 iPhone 图，详见 [截图记录](screenshots/README.md) |
| 定价 / 供应 | 免费；全部 175 个国家/地区，包括 CHN“App 发布时供应” |
| 审核 / 上架 | 两端“正在等待审核”；均选择手动发布，未上线 |

两端等待审核的本地页面凭据位于 `native/artifacts/app-store/proof/both-platforms-waiting-review.jpg`，同一页面下拉同时显示 iOS 与 macOS `1.0.0`“正在等待审核”。该路径位于 Git 忽略目录，截图含后台账户信息，不提交或嵌入公开文档。

Mac 上传有 `Upload Symbols Failed` 警告：归档缺少 `KidSproutMac.app` 的 dSYM。日志仍明确上传与导出成功，本次未被阻断；后续应补齐匹配符号，以便崩溃符号化。iOS 上传提示本次使用 iOS `26.5` SDK；从 **2027 年 4 月**起，上传或提交分发需要 iOS `27` SDK / Xcode `27` 或更高版本。该提示没有阻止本次上传，后续发布需按届时要求升级。完整验证范围见 [验证记录](../VALIDATION.md)。

## 已落实的工程准备

- 应用名称、版本和两端主应用标识已在工程生成器配置，实际归档值已核对。
- iOS 使用自动签名；Mac Release 使用自动签名，Debug 保持本地 ad hoc。本轮两端已完成签名归档与导出上传；后续重建仍需要可用的团队账户、证书、标识权限和描述文件。
- Debug `ENABLE_TESTABILITY=YES`，Release 为 `NO`。Mac Release 不注入 Debug 的基础调试权限。
- `PrivacyInfo.xcprivacy` 声明仅访问应用自身 UserDefaults（`NSPrivacyAccessedAPICategoryUserDefaults` / `CA92.1`）、不跟踪且无数据收集类型。清单加入 iOS app、嵌入的 Core framework 和 Mac app 资源。
- 应用内家长区和关于作者可阅读离线隐私政策；拼音资料外链、邮件以及作品分享/保存经过家长算术验证。实际交互仍需在最终构建验收。
- 课程、题库和插画随包离线提供；学习记录与画稿保存在本机。没有账号系统、广告或分析 SDK。

后台编译、模型测试和历史 UI 验证的范围见 [验证记录](../VALIDATION.md)。历史测试记录属于其注明的版本；本轮截图只验证当前首页显示，不代替完整课程、交互或实机验收。

## 审核期间与发布前

1. **等待审核结果。**两端均已提交成功，当前只确认“正在等待审核”。若 Apple 要求补充资料或修改构建，应按审核反馈处理；后续重新上传需递增构建号，不能重复使用已接受的 `1`。
2. **手动发布。**审核通过后仍须执行手动发布，不能把等待审核、审核通过或“App 发布时供应”当成已经上线。
3. **中国大陆资质边界。**供应设置已包含 CHN，App ICP 栏仍为空，自动校验没有阻断本次提交；仓库没有备案号、备案豁免或中国大陆上线批准结论。安全评估与 AIGC 声明有效不能替代其他适用资质，最终审核与地区上线结果以 Apple 后台为准。
4. **公开资料与后续维护。**维持公开页面可访问，并在功能或依赖改变时同步更新 App Privacy、隐私清单和政策。保留本轮归档、上传日志与审核提交 ID；跟进 Mac 缺少 dSYM 的符号警告以及 2027 年 4 月起的 iOS SDK 要求。
5. **验收边界。**首页截图和后台测试不替代完整课程、语音、家长验证、辅助功能、最低系统、实体触控笔或 Intel 实机验收；这些边界保留在 [验证记录](../VALIDATION.md)。

## 归档命令参考

在仓库根目录执行。命令仅生成归档，不会上传；必须先在本机配置可用的 Apple 团队账户。签名与商店导出由发布流程核对，不要以 `CODE_SIGNING_ALLOWED=NO` 的结果作为可上传产物。

```sh
node native/ios/generate-project.cjs
xcodebuild -project native/ios/KidSprout.xcodeproj -scheme KidSprout \
  -configuration Release -destination 'generic/platform=iOS' \
  -archivePath native/artifacts/app-store/Mengya-iOS-1.0.0-1.xcarchive archive
xcodebuild -project native/ios/KidSprout.xcodeproj -scheme KidSproutMac \
  -configuration Release -destination 'generic/platform=macOS' \
  -archivePath native/artifacts/app-store/Mengya-macOS-1.0.0-1.xcarchive \
  ARCHS='arm64 x86_64' ONLY_ACTIVE_ARCH=NO archive
```

本轮已经完成这两份归档及后续导出上传，具体结果以本页日志记录为准。后续重建应使用新的构建号与归档路径；不要覆盖留作验证的首发归档。归档后的发布验证与上传是独立步骤。`native/artifacts/` 已被 Git 忽略，不提交 archive、导出的安装包、证书、描述文件或账户凭据。

## 专用商店截图

| 目录 | 用途 |
| --- | --- |
| [screenshots/iphone/](screenshots/iphone/) | 2 张 Release 模拟器首页原始 JPG，1320×2868 / 1206×2622 |
| [screenshots/ipad/](screenshots/ipad/) | 1 张 Release 模拟器首页原始 JPG，2064×2752 |
| [screenshots/macos/](screenshots/macos/) | 1 张实际归档 app 的后台窗口捕获图，1440×900 RGB PNG，无 alpha |

新截图均已通过本地图片工具查看。iPhone/iPad 保留直接采集的 JPG；Mac 图去掉 31px 系统标题栏后，将应用内容等比例居中适配到 1440×900，未重绘或改变应用内容。中屏 iPhone、iPad 与 Mac 各 1 张已在后台保存，均显示 `1/10`，并用于本次提交；大屏 iPhone 图仅保留本地。来源、处理与验证范围见 [截图记录](screenshots/README.md)。`native/ios/screenshots/` 与 `native/macos/screenshots/` 是历史开发素材。

建议覆盖真实的探索首页、数字互动、拼音课程、字母学习、游戏和画板；按平台展示实际界面，避免把旧版、调试提示、系统分享面板或其他平台界面当成产品主截图。最终截图验收应记录设备/系统、应用版本/构建号与源图片尺寸。

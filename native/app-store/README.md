# 萌呀启蒙 · Apple 商店发布记录

本目录记录 iPhone/iPad 与 Mac 的发布迁移和历史提审证据。更新日期：2026-11-19。按用户要求，两端主应用 Bundle ID 已由 `com.feiwenchao.mengya` 改为 `com.feiwenchao.kid-sprout`，版本 `1.0.0`、build `2`。新标识已在 Apple Developer 注册，[App Store Connect 新统一记录 `6836774748`](https://appstoreconnect.apple.com/apps/6836774748/distribution) 已创建；iOS 与 Mac 新归档均完成，构建已上传并处理完成。iOS 审核提交 `a198cc45-3460-4ce3-adb9-f9ab97e63323`、macOS 审核提交 `d20238f9-2c11-4871-9bde-bf90db8d18fc` 均显示“等待审核”，版本为手动发布，尚未上线。

旧记录 `6836726939` 已更名“萌呀启蒙旧标识存档”并保留。其两端 build `1` 曾提交成功并等待审核，现原提交均已撤回，两端显示“被开发者拒绝”。旧记录的等待审核截图仅为历史凭据，不代表当前状态。

## 当前发布标识与迁移状态

| 项目 | 当前工程值 / 实际状态 |
| --- | --- |
| 显示名称 | 萌呀启蒙 |
| iPhone/iPad scheme | `KidSprout`，最低 iOS 17 |
| Mac scheme | `KidSproutMac`，最低 macOS 14 |
| 两端应用 Bundle ID | `com.feiwenchao.kid-sprout`；已在 Apple Developer 注册 |
| App Store Connect 新记录 | [`6836774748`](https://appstoreconnect.apple.com/apps/6836774748/distribution)，iOS 与 macOS 统一记录 |
| 新记录 SKU | `KID-SPROUT-2026-001` |
| 当前版本 / 构建号 | `1.0.0` / `2` |
| 开发团队 | `5A9Z4D7HV3`（wenchao fei） |
| 定价与业务 | 免费，无账号、广告、打赏、内购或订阅 |
| 供应范围 / 发布方式 | 全球 175 个国家/地区（含中国大陆）；手动发布 |
| 当前上传 / 审核状态 | iOS/macOS build `2` 已上传并处理完成；两端提交均显示“等待审核”，尚未上线 |
| 隐私政策 URL | [https://kid.feiwenchao.com/privacy.html](https://kid.feiwenchao.com/privacy.html) |
| 支持 URL | [https://kid.feiwenchao.com/support.html](https://kid.feiwenchao.com/support.html) |
| 公开支持邮箱 | `hi@feiwenchao.com` |

隐私政策和支持页面已公开发布，此前公网 HTTPS 检查均返回 HTTP `200`；源码分别在 `public/privacy.html` 和 `public/support.html`。中文商店文案见 [metadata.zh-Hans.md](metadata.zh-Hans.md)。私人审核联系资料只保存在 Apple 后台，不写入仓库。

更换标识会使用独立的应用容器，本轮没有实现跨 Bundle ID 的学习记录或画稿迁移。另一款产品使用的 `com.feiwenchao.kidsprout` 不得用于本应用构建。

## 本轮 Bundle ID 迁移证据

| 检查 | 实际状态 / 证据 |
| --- | --- |
| 工程与生成器 | 两端主标识 `com.feiwenchao.kid-sprout`，`1.0.0 (2)` |
| Apple Developer 标识 | 已注册新主应用标识 |
| 新商店记录 | `6836774748`，SKU `KID-SPROUT-2026-001`，两端共用新 Bundle ID |
| 新 iOS 版本资料 | `1.0.0` 元数据、审核联系资料、手动发布与构建已保存；已加入审核提交 |
| iOS build 2 签名归档 | `ARCHIVE SUCCEEDED`；`native/artifacts/app-store/KidSprout-iOS-1.0.0-2b.xcarchive`；实际标识/版本/build 2 校验通过 |
| iOS build 2 上传 | 已处理完成并关联版本；build UUID `b36c2e1f-908b-4a0e-95d7-7706b0572742`；日志 `/tmp/kidsprout-ios-export-2.log` |
| Mac build 2 签名归档 | `ARCHIVE SUCCEEDED`；`native/artifacts/app-store/KidSprout-macOS-1.0.0-2.xcarchive`；日志 `/tmp/kidsprout-macos-archive-2.log`；实际标识/版本/build 2、arm64/x86_64 双架构及严格 codesign 校验通过 |
| Mac build 2 上传 | 已处理完成并关联版本；build UUID `5d57ebfa-5008-48a5-8c64-d66d44287bf9`；日志 `/tmp/kidsprout-macos-export-2b.log` |
| 新年龄分级 | App Store Connect 显示 `4+`，儿童年龄组 `6–8 岁` |
| App Privacy | 隐私政策已发布；已发布“不收集数据”答复 |
| 价格与供应范围 | 免费；全球 175 个国家/地区，含中国大陆 |
| iOS 审核提交 | `a198cc45-3460-4ce3-adb9-f9ab97e63323`；提交后显示“等待审核” |
| macOS 审核提交 | `d20238f9-2c11-4871-9bde-bf90db8d18fc`；提交后显示“等待审核” |
| 旧 Mac 提交撤回 | 已撤回，旧版本显示“被开发者拒绝”；原提交 `529d3f28-7a86-4807-9f30-3e85a58cbf53` |
| 旧 iOS 提交撤回 | 已撤回，旧版本显示“被开发者拒绝”；原提交 `7c3e17f1-1197-4576-a6c7-febe2e305494` |
| 素材复用 | 界面未改，可复用旧标识 `1.0.0 (1)` 首页截图；不是 build 2 新采集图 |

新记录的版本元数据、私人审核联系资料、App Privacy、分类/年龄、免费定价、地区、截图和手动发布设置已完成逐项核对；审核通过与实际发布仍需等待 Apple 后续结果。完整证据与未验证项见 [验证记录](../VALIDATION.md)。

## 历史：旧标识 build 1 上传与提审

旧 [App Store Connect 统一记录 `6836726939`“萌呀启蒙旧标识存档”](https://appstoreconnect.apple.com/apps/6836726939/distribution) 使用 `com.feiwenchao.mengya`。两份实际应用 Info.plist 均确认 `1.0.0 (1)`。两端曾实际提交成功并显示“正在等待审核”，均为手动发布，无审核通过或上线结果；现已因迁移执行撤回。

| 检查 | 历史结果 / 证据 |
| --- | --- |
| iOS 签名归档 | `ARCHIVE SUCCEEDED`；`native/artifacts/app-store/Mengya-iOS-1.0.0-1.xcarchive`；日志 `/tmp/mengya-ios-archive.log` |
| Mac 签名归档 | `ARCHIVE SUCCEEDED`；`native/artifacts/app-store/Mengya-macOS-1.0.0-1.xcarchive`；日志 `/tmp/mengya-macos-archive.log` |
| iOS 导出上传 | `Upload succeeded`、`EXPORT SUCCEEDED`；日志 `/tmp/mengya-ios-upload.log` |
| Mac 导出上传 | `Upload succeeded`、`EXPORT SUCCEEDED`；日志 `/tmp/mengya-macos-upload.log` |
| iOS 历史审核提交 | `7c3e17f1-1197-4576-a6c7-febe2e305494`；迁移前等待审核，现已撤回、显示“被开发者拒绝” |
| Mac 历史审核提交 | `529d3f28-7a86-4807-9f30-3e85a58cbf53`；迁移前等待审核，现已撤回、显示“被开发者拒绝” |
| 构建 / 版本资料 | 两端均保存 build `1`、元数据、审核联系资料及手动发布设置 |
| App Privacy | 旧记录已按用户确认发布“不收集数据” |
| 中国大陆声明 | 安全评估与 AIGC 均声明不含适用功能，后台显示有效；App ICP 栏仍空，自动校验未阻断原提交 |
| 截图保存 | 旧后台中屏 iPhone、iPad 与 Mac 各为 `1/10`；大屏 iPhone 图保留本地 |
| 定价 / 供应 | 旧记录免费、全部 175 个国家/地区，包括 CHN“App 发布时供应” |
| 分类 / 年龄 | 旧记录教育、内容分级 `4+`、儿童年龄组 `6–8 岁` |
| 网页回归 | 125/125 测试通过，Vite 生产构建成功；日志 `/tmp/mengya-web-tests.log`、`/tmp/mengya-web-build.log` |
| Apple 共享核心 | 12/12 测试通过；日志 `/tmp/mengya-core-tests.log` |

历史状态凭据 `native/artifacts/app-store/proof/both-platforms-waiting-review.jpg` 曾在同一页面显示两端等待审核。它位于 Git 忽略目录且含后台账户信息，仅保留本地，不提交或嵌入公开文档，不能作为迁移后的状态证据。

旧 Mac 上传有 `Upload Symbols Failed` 警告：归档缺少 `KidSproutMac.app` 的 dSYM；日志仍明确上传和导出成功，未阻断旧上传，会影响对应构建崩溃符号化。旧 iOS 上传提示使用 iOS `26.5` SDK；从 **2027 年 4 月**起上传或提交分发需要 iOS `27` SDK / Xcode `27` 或更高版本。以上均为旧 build `1` 的日志，不能推定新构建上传结果。App ICP 为空且旧自动校验未阻断，不表示备案豁免或已批准中国大陆上线。

## 工程准备与后续步骤

- iOS 使用自动签名；Mac Release 使用自动签名，Debug 保持本地 ad hoc。build `2` 两端归档、导出上传、版本关联和审核提交已完成。
- Debug `ENABLE_TESTABILITY=YES`，Release 为 `NO`。Mac Release 不注入 Debug 的基础调试权限。
- `PrivacyInfo.xcprivacy` 在 iOS app、嵌入的 Core framework 和 Mac app 中声明自身 UserDefaults（`NSPrivacyAccessedAPICategoryUserDefaults` / `CA92.1`）、不跟踪且无数据收集类型。
- 应用内提供离线隐私政策；拼音资料外链、邮件、作品分享/保存经过家长算术验证。课程、题库与插画随包离线提供，无账号、广告或分析 SDK。
- 审核提交已记录；审核通过、手动发布和实际上架仍分别记录，不能把“等待审核”写成审核通过或已上线。
- 首页截图和后台测试不能代替完整课程、语音、家长验证、辅助功能、最低系统、实体触控笔或 Intel 实机验收。保留现有归档和日志，避免覆盖历史证据。

## 归档命令参考

在仓库根目录执行。命令仅生成归档，不会上传；需要可用的 Apple 团队账户、证书及描述文件。无签名编译不是商店交付物。

```sh
node native/ios/generate-project.cjs
xcodebuild -project native/ios/KidSprout.xcodeproj -scheme KidSprout \
  -configuration Release -destination 'generic/platform=iOS' \
  -archivePath native/artifacts/app-store/KidSprout-iOS-1.0.0-2.xcarchive archive
xcodebuild -project native/ios/KidSprout.xcodeproj -scheme KidSproutMac \
  -configuration Release -destination 'generic/platform=macOS' \
  -archivePath native/artifacts/app-store/KidSprout-macOS-1.0.0-2.xcarchive \
  ARCHS='arm64 x86_64' ONLY_ACTIVE_ARCH=NO archive
```

上述 iOS 与 Mac development 签名归档均已完成，导出上传和 App Store Connect 处理均已完成。`native/artifacts/` 已被 Git 忽略，不提交 archive、安装包、证书、描述文件或账户凭据。

## 专用商店截图

| 目录 | 真实来源 / 用途 |
| --- | --- |
| [screenshots/iphone/](screenshots/iphone/) | 旧标识 build `1` 的 2 张 Release 模拟器首页原始 JPG，1320×2868 / 1206×2622 |
| [screenshots/ipad/](screenshots/ipad/) | 旧标识 build `1` 的 1 张 Release 模拟器首页原始 JPG，2064×2752 |
| [screenshots/macos/](screenshots/macos/) | 旧标识 build `1` 实际归档 app 的后台窗口捕获，1440×900 RGB PNG，无 alpha |

素材均已通过本地图片工具查看。iPhone/iPad 保留直接采集 JPG；Mac 图去掉 31px 系统标题栏后等比例居中适配，未改变应用内容。本轮界面未改，可在新记录复用，但不改写采集 Bundle ID 或构建号。来源、处理和旧后台保存情况见 [截图记录](screenshots/README.md)。`native/ios/screenshots/` 与 `native/macos/screenshots/` 为更早开发素材。

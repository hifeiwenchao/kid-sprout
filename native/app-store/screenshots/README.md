# App Store 原生截图

采集日期：2026-11-19。现有专用素材包括 iPhone 2 张、iPad 1 张和 Mac 1 张，Bundle ID 均为 `com.feiwenchao.mengya`，版本 `1.0.0`（build `1`）。移动端来自原生 `Release` 模拟器构建；Mac 来自实际签名归档 app 的后台窗口捕获。截图展示真实应用首页，不是设计稿或网页。素材已经查看，中屏 iPhone、iPad 和 Mac 图曾分别在旧记录 `6836726939` 保存 1 张（各 `1/10`）并用于旧 build `1` 提交；大屏 iPhone 图保留本地。

当前工程已迁移为 `com.feiwenchao.kid-sprout` / `1.0.0 (2)`，旧记录两端均已撤回。以上素材的真实来源仍是 `com.feiwenchao.mengya` / `1.0.0 (1)`，不能改写为新标识截图。本轮只改标识及构建号，界面未变，已在新记录复用；新 build `2` 的上传、处理和审核提交状态见[发布记录](../README.md)。

## iPhone / iPad 原始 JPG

| 文件 | 设备 / iOS | 原始像素 | App Store 槽位 |
| --- | --- | --- | --- |
| [iphone/01-home-iphone17-pro-max.jpg](iphone/01-home-iphone17-pro-max.jpg) | iPhone 17 Pro Max / iOS 26.5 | 1320 × 2868 | iPhone with Dynamic Island，large display |
| [iphone/02-home-iphone17-pro.jpg](iphone/02-home-iphone17-pro.jpg) | iPhone 17 Pro / iOS 26.5 | 1206 × 2622 | iPhone with Dynamic Island，medium display |
| [ipad/01-home-ipad-pro13-m5.jpg](ipad/01-home-ipad-pro13-m5.jpg) | iPad Pro 13-inch (M5) / iOS 26.5 | 2064 × 2752 | iPad 13-inch |

旧后台曾保存中屏 iPhone `1206×2622` 和 iPad `2064×2752` 各 1 张，各显示 `1/10`；大屏 iPhone `1320×2868` 仅保留本地素材。

尺寸与格式依据 [Apple 官方截图规格](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/)。三张均为 JPG、无透明通道，已通过 `sips` 读取实际尺寸和 `hasAlpha: no`。没有缩放、裁剪、拼接、覆盖文字、设备边框或其他图像后处理。

使用 `simctl io <UDID> screenshot --type=jpeg <path>` 直接保存模拟器显示帧。选择直接 JPEG 采集是因为默认 PNG 含 alpha 通道，而 App Store 规格不允许透明通道；未转换或编辑已有截图。

移动端采集通过后台 `xcodebuild` 与 `simctl boot/bootstatus/install/launch/io screenshot/shutdown` 完成，没有启动 Simulator.app 窗口、没有操作用户鼠标键盘，也没有运行 Mac GUI 测试。截图时未出现首次启动系统弹窗。每张截图均已用本地图片查看工具肉眼检查。没有修改产品代码、系统状态栏时间或模拟器语言/外观设置。

采集结束已关闭本次启动的 iPhone 17 Pro Max、iPhone 17 Pro 和 iPad Pro 13-inch (M5)；`simctl list devices booted` 最终为空，未发现 Simulator.app 进程。

后台构建日志：`/tmp/kid-sprout-appstore-simulator-build.log`。

## Mac 实际归档 app 窗口

| 文件 | 来源 | 最终像素 / 格式 |
| --- | --- | --- |
| [macos/01-explore.png](macos/01-explore.png) | `Mengya-macOS-1.0.0-1.xcarchive` 内实际应用的后台窗口捕获 | 1440 × 900，RGB PNG，`hasAlpha: no` |

Mac 商店截图曾上传并保存到旧记录，后台显示 `1/10`，用于旧 build `1` 提交。

Mac 源图去掉顶部 31px 系统标题栏后，将剩余应用内容等比例缩放、居中适配至 1440×900。没有重绘、替换或改变应用内容，没有覆盖宣传文字或设备边框。该图由主任务使用 `view_image` 查看通过；本轮又通过 `sips` 确认尺寸、RGB 色彩空间与无透明通道。

移动端三张图是直接采集的原始 JPG，Mac 图有上述明确记录的适配处理，二者不能混写为“全部未经后处理”。每个平台的尺寸与槽位要求仍按 [Apple 官方截图规格](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/) 和当前 App Store Connect 上传界面核对。

## 验证范围

旧 `com.feiwenchao.mengya` / `1.0.0 (1)` 两端曾实际提交至 [旧统一记录 `6836726939`](https://appstoreconnect.apple.com/apps/6836726939/distribution) 并等待审核，均为手动发布，未上线。iOS 历史提交 ID 为 `7c3e17f1-1197-4576-a6c7-febe2e305494`，Mac 为 `529d3f28-7a86-4807-9f30-3e85a58cbf53`。迁移时两端原提交均已撤回，旧版本显示“被开发者拒绝”，记录更名“萌呀启蒙旧标识存档”并保留。新标识 build `2` 已完成上传并提交审核：iOS 提交 `a198cc45-3460-4ce3-adb9-f9ab97e63323`、macOS 提交 `d20238f9-2c11-4871-9bde-bf90db8d18fc`，当前均显示“等待审核”。

截图查看仅证明旧 build `1` 首页的实际显示，不代表新构建已完成 UI 验收，也不代表全课程、交互或真机体验已完成验收。历史 `native/ios/screenshots/` 与 `native/macos/screenshots/` 不属于这次专用素材。完整迁移、历史上传、警告与测试记录见 [原生验证记录](../../VALIDATION.md)。

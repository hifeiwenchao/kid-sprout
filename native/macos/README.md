# 萌呀启蒙 · Mac

macOS14+，SwiftUI/AppKit原生实现，离线免费，无WebView。与网页采用同一学习地图、配色、插画、三科课程与60款游戏，完整范围见[原生说明](../README.md)。Mac画板支持鼠标/触控板、原生快捷键及系统PNG保存面板。

## 运行

在Finder双击`native/ios/KidSprout.xcodeproj`，或从仓库根目录执行：

```sh
open native/ios/KidSprout.xcodeproj
```

选择 **KidSproutMac + My Mac** 运行；**KidSprout + iPhone / iPad Simulator**用于移动端。`Package.swift`只含KidSproutCore共享库，没有App入口，不能用它运行客户端。

## 不操作桌面的后台构建

```sh
swift test --package-path native/ios
npm run native:test:mac-drawing
node native/ios/generate-project.cjs
xcodebuild -project native/ios/KidSprout.xcodeproj -scheme KidSproutMac \
  -configuration Release -destination 'generic/platform=macOS' \
  -derivedDataPath /tmp/kid-sprout-macos-release \
  ARCHS='arm64 x86_64' ONLY_ACTIVE_ARCH=NO \
  build CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO
```

产物在`/tmp/kid-sprout-macos-release/Build/Products/Release/KidSproutMac.app`。上述命令显式关闭签名，仅用于后台编译验证，不能作为商店上传物或跨机器分发包。仅编译测试时改用 `-configuration Debug` 和 `build-for-testing`；Release 已关闭 testability。`xcodebuild test` 会启动宿主 App 与 UI 测试、操作当前桌面，应在专用机器/CI运行。上述后台构建命令不启动 Xcode 或 App；发布素材的后台窗口截图另见 [专用截图记录](../app-store/screenshots/README.md)。

历史本地交付包为 `native/artifacts/萌呀启蒙-macOS.zip`，不能视作商店版本；artifacts 目录已被 Git 忽略，其他电脑需重新构建。当前工程 Debug 保持本地 ad hoc，Release 使用团队 `5A9Z4D7HV3` 自动签名，当前已改为 `com.feiwenchao.kid-sprout` / `1.0.0`（build `2`），新标识签名归档成功：`native/artifacts/app-store/KidSprout-macOS-1.0.0-2.xcarchive`（日志 `/tmp/kidsprout-macos-archive-2.log`）。归档实际为 development 签名，标识/版本/build 2、arm64/x86_64 双架构和严格 codesign 校验通过；商店导出上传失败，两端均等待本机 Xcode 账户重新登录，尚未上传成功或重新提审，未上线。通用构建目标包含 Apple 芯片和 Intel 架构，Intel 未实机验收。

`native:test:mac-drawing`将实际画板模型及测试复制到临时SwiftPM包，直接运行XCTest，结束后清理临时文件；不编译或启动App入口，也不操作鼠标、键盘或窗口。

## 桌面交互与数据

- 单窗口、可滚动学习地图侧栏与完整六入口；默认1200×850，最小760×600。内容随窗口变化滚动/重排，支持深浅外观和减少动态。
- 完整数字/拼音/字母课程、原生记忆场景和课内练写；共享游戏题库，保留翻牌、气球、火车、胡萝卜比较、装点心、听鼓的专用玩法。详情见统一原生说明。
- 画板与网页相同工具/12色/自选/荧光笔/网格/37底稿，1000×700固定坐标等比显示。支持⌘Z/⇧⌘Z、可撤销清空和底稿切换；历史不跨进程重启保存。新笔迹上限10,000，旧有效超限稿完整保留。
- 每笔和历史操作原子保存。旧v1六色及橡皮按原外观迁移到v2，坏稿不因打开页面而覆盖，首次编辑前备份原文件。
- 保存PNG先经过家长验证，再打开系统保存面板；等待验证sheet在主窗口结束后呈现，避免挂到临时验证窗口。导出2000×1400白底、含底稿，无网格/辅助线。取消不写外部文件。
- 主应用 Bundle ID 已由 `com.feiwenchao.mengya` 改为 `com.feiwenchao.kid-sprout`，记录保存在此标识对应的沙盒及本机偏好；草稿位于私有 Application Support 子目录的 `drawing-v1.json`（文件内容版本2）。旧 `com.feiwenchao.mengya` 和 `com.feiwenchao.kidsprout.mac` 包的数据不会因更名自动迁移，本轮未实现跨 Bundle ID 迁移。移除 `.app` 不会自动移除数据，与网页/其他客户端不联网同步。
- 邮箱经家长确认后打开系统邮件，不自动发送；沙盒仅启用用户所选文件读写，不申请网络/相机/麦克风权限。

## Mac App Store 迁移

当前 `com.feiwenchao.kid-sprout` / `1.0.0 (2)` 的 [App Store Connect 新统一记录 `6836774748`](https://appstoreconnect.apple.com/apps/6836774748/distribution) 已创建，正在迁移资料准备重新提交。Mac development 签名归档成功；`xcodebuild -exportArchive -allowProvisioningUpdates` 导出上传失败（exit `70`），日志 `/tmp/kidsprout-macos-upload-2.log` 显示 `Failed to Use Accounts` 和缺少 `Xcode-Token`。iOS 归档也受本机账户凭据及描述文件问题阻断。两端均等待 Xcode 重新登录，尚未上传成功或重新提审，未上线。

旧 [统一记录 `6836726939`“萌呀启蒙旧标识存档”](https://appstoreconnect.apple.com/apps/6836726939/distribution) 曾以 `com.feiwenchao.mengya` / `1.0.0 (1)` 完成两端提交并等待审核。迁移时已执行撤回；旧两端均显示“被开发者拒绝”，Mac 提交 `529d3f28-7a86-4807-9f30-3e85a58cbf53` 和 iOS 原提交均已撤回。旧记录的元数据、审核联系资料、免费定价、全部 175 个国家/地区（含 CHN）和手动发布设置不能代表新记录已配置。

Release 已关闭 testability，并打包声明自身 UserDefaults `CA92.1` 用途的隐私清单。公开的隐私/支持页仍可使用；旧记录的 App Privacy 已发布“不收集数据”，旧 App ICP 栏为空且自动校验未阻断原提交，不表示备案豁免或中国大陆上线已获批准。当前迁移、旧上传日志与归档参考命令见 [Apple 发布记录](../app-store/README.md)；旧 build `1` 上传缺少 app dSYM 的警告见 [验证记录](../VALIDATION.md)，不据此推定新构建上传结果。Mac App Store 分发与 Developer ID 网站分发是不同流程，本轮没有完成 Developer ID 公证。

`screenshots/` 保留历史首版截图；[专用 Mac 目录](../app-store/screenshots/macos/) 的 `01-explore.png`（1440×900、RGB、无 alpha）来自旧标识 `com.feiwenchao.mengya` / `1.0.0 (1)` 实际归档 app 的后台窗口捕获，曾在旧后台保存 `1/10` 并用于原提交。图像仅去掉 31px 系统标题栏后等比例居中适配，没有改变应用内容。本轮界面未变，可复用，但不是 build `2` 新截图；来源见 [截图记录](../app-store/screenshots/README.md)。该图不代表完整交互或实机验收。

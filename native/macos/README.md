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
  ARCHS='arm64 x86_64' ONLY_ACTIVE_ARCH=NO build
```

产物在`/tmp/kid-sprout-macos-release/Build/Products/Release/KidSproutMac.app`，可自行双击运行。仅编译测试用`build-for-testing`；`xcodebuild test`会启动宿主App与UI测试、操作当前桌面，应在专用机器/CI运行。本轮默认只进行CLI模型测试与后台构建，不自动打开Xcode或App。

本地交付包为`native/artifacts/萌呀启蒙-macOS.zip`，解压后双击`KidSproutMac.app`。artifacts目录已被Git忽略，其他电脑需重新构建。当前为ad hoc本地签名，无需开发者团队；向其他用户正式分发仍需Developer ID签名/公证或Mac App Store发布。通用包含Apple芯片和Intel架构，Intel未实机验收。

`native:test:mac-drawing`将实际画板模型及测试复制到临时SwiftPM包，直接运行XCTest，结束后清理临时文件；不编译或启动App入口，也不操作鼠标、键盘或窗口。

## 桌面交互与数据

- 单窗口、可滚动学习地图侧栏与完整六入口；默认1200×850，最小760×600。内容随窗口变化滚动/重排，支持深浅外观和减少动态。
- 完整数字/拼音/字母课程、原生记忆场景和课内练写；共享游戏题库，保留翻牌、气球、火车、胡萝卜比较、装点心、听鼓的专用玩法。详情见统一原生说明。
- 画板与网页相同工具/12色/自选/荧光笔/网格/37底稿，1000×700固定坐标等比显示。支持⌘Z/⇧⌘Z、可撤销清空和底稿切换；历史不跨进程重启保存。新笔迹上限10,000，旧有效超限稿完整保留。
- 每笔和历史操作原子保存。旧v1六色及橡皮按原外观迁移到v2，坏稿不因打开页面而覆盖，首次编辑前备份原文件。
- 保存PNG先经过家长验证，再打开系统保存面板；等待验证sheet在主窗口结束后呈现，避免挂到临时验证窗口。导出2000×1400白底、含底稿，无网格/辅助线。取消不写外部文件。
- 记录保存在`com.feiwenchao.kidsprout.mac`沙盒及本机偏好；草稿位于私有Application Support子目录的`drawing-v1.json`（文件内容版本2）。移除`.app`不会自动移除数据，与网页/其他客户端不联网同步。
- 邮箱经家长确认后打开系统邮件，不自动发送；沙盒仅启用用户所选文件读写，不申请网络/相机/麦克风权限。

`screenshots/`保留扩展前的历史首版截图，本轮没有执行新UI截图验收。后台测试和验证边界见[验证记录](../VALIDATION.md)。

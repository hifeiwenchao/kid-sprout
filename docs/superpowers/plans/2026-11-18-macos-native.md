# macOS Native Implementation Plan

> **For agentic workers:** Use subagent-driven-development for the independent AppKit drawing subsystem and code review. Shared UI and Xcode integration are owned by the root agent.

**Goal:** 为萌呀启蒙增加可运行的 macOS 原生客户端。

**Architecture:** 复用现有 SwiftUI 数字课程与游戏，并通过条件编译适配平台颜色、导航与家长输入。AppKit 画板单独实现，和核心模型一起编译进 Mac target。

**Tech Stack:** SwiftUI、AppKit、AVFoundation、XCTest、现有 Node 项目生成脚本。

**Spec:** `docs/superpowers/specs/2026-11-18-macos-native.md`

## Global Constraints

- macOS 14+，原生 SwiftUI / AppKit，无 WebView、广告、收费、账号或网络依赖。
- 复用现有数字0–10、三游戏、家长邮箱及课程；不扩展至未迁移的拼音/字母。
- 固定1000×700画纸，导出2000×1400白底PNG；导出/邮箱经过家长验证。
- 单窗口，画稿新增10,000笔上限可见，旧有效超限数据仍可读；坏数据安全回退，原子保存。
- 保持现有iOS17、Android和网页行为，测试适度覆盖受影响代码。

### Task 1: AppKit 画板

**Files:** `native/ios/MacApp/*.swift`, `native/ios/MacTests/MacDrawingTests.swift`。

**Interfaces:** `@MainActor DrawingModel: ObservableObject`，静态 `paper=CGSize(1000,700)`；`init(storageURL: URL?=nil)`；颜色/width/erasing工具状态，`canUndo`, `canRedo`, `undo()`, `redo()`, `clear()`, `save()`；`DrawingView` 作为SwiftUI入口。共享`ParentGate(onSuccess: ()->Void)`和`Page`/`Panel`/`Sprout`由root提供。

- [x] 先写笔迹历史、坏稿/归一化边界、超过上限不丢稿、重启恢复和PNG尺寸/白底测试，记录RED。
- [x] 实现AppKit鼠标/触控板绘画、比例换算、六色/粗细/橡皮、历史与原子保存；读写边界一致。
- [x] 接入父母确认后NSSavePanel导出，保存成功/失败可读，取消不落文件；界面适配窗口尺寸，Cmd-Z/Shift-Cmd-Z。
- [x] 运行Mac测试并报告结果，界面截屏与操作由root协调。

### Task 2: 共用Apple界面与Mac工程

**Files:** `native/ios/App/KidSproutApp.swift`, `LearningViews.swift`, `ParentsView.swift`, `DrawingView.swift`, `generate-project.cjs`, `.xcodeproj/**`, `native/ios/MacUITests/**`。

- [x] 新增Mac UI冒烟测试：导航、去重计数、学过重启、完整五关奖励一次、画板实际绘画/撤销/重做/清空与恢复、家长取消/错误答案、保存面板及PNG。
- [x] 将平台颜色统一为Sprout背景属性；Mac使用单Window+侧栏、iOS保留原导航；iOS专用画板条件编译隔离；家长输入在Mac可用。
- [x] 生成KidSproutMac应用、测试target/scheme，使用同一离线JSON与AppIcon；支持arm64/x86_64构建。
- [x] 运行Mac单元与界面测试、独立启动；回归iPhone/iPad测试或构建。

### Task 3: 文档、验证与交付

**Files:** `native/macos/README.md`, `native/README.md`, `native/VALIDATION.md`, `README.md`。

- [x] 独立审查Mac画板/工程/平台分支，修复重要问题，保留验证证据。
- [x] 运行网页测试/构建/内容校验、Swift核心、Mac测试与Release构建，打包本地.app.zip。
- [x] 按项目git-commit-message约定提交，与后续全端设计对齐工作一起集成原项目main并推送已授权origin/main；交付路径见Mac说明。

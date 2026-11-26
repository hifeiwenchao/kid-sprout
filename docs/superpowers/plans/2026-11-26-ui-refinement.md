# 全端 UI 优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 落实用户已选定的六项 UI 优化并保持各端设计一致。
**Architecture:** 网页保留原生 JS/CSS；Apple 保留 SwiftUI；Android 保留 Compose。三个平台独立实现相同的首页层级、分组游戏大厅、最近游戏与可读性规则。
**Tech Stack:** Vite/JavaScript/CSS、SwiftUI、Kotlin/Compose。
**Spec:** docs/superpowers/specs/2026-11-26-ui-refinement-design.md

## Global Constraints
- 原生不使用 WebView，保持 iOS17+/macOS14+/Android8+。
- 保留60个游戏、既有存档、计分逻辑、插画和主配色。
- 最近游戏最多3个且去重，不计为课程/游戏完成。
- 不运行影响桌面的 UI 自动化，不改版本签名/审核状态。

## Review Focus
- 最近记录损坏、过期ID、重复项、不可写存储时继续正常使用。
- 筛选零结果、清除筛选时分组和推荐正确恢复。
- 小屏横屏和大字体时按钮及正文不被挤出。
- 弹窗关闭与键盘焦点可达。
- 选中状态、辅助文字与减少动态效果可辨识。

### Task 1: 网页布局与游戏入口
- [x] src/learning-hub.js 将继续学习提至学科卡前，题库按学科和目标分组。
- [x] src/hub-state.js 和 tests/hub-state.test.js 添加最近游戏数据兼容、去重与上限验证；src/main.js 记录打开游戏，委托处理动态入口，维护空分组/筛选。
- [x] CSS 优化宽度、字体、焦点、弹窗、画板与手机触摸区域。
- [x] npm test 与 npm run build；后台浏览器检查首页/筛选/最近记录。

### Task 2: Apple UI 对齐
- [x] Branding/CourseViews/KidSproutApp/GameViews/DrawingView 优化首页、弹窗、游戏分组、最近记录和交互。
- [x] 后台编译 Mac/iOS，运行共享核心测试；记录未完成的真机验收。

### Task 3: Android UI 对齐
- [x] HomePage/GameLibrary/CoursePages/DrawingWorkspace/SproutDesign 和 AppState 调整同一套布局与本地最近记录。
- [x] 后台 unit test/lint/assembleDebug；记录未完成的真机验收。

### Task 4: 集成验收
- [x] 核对差异与全端功能保留，更新文档与验证记录。
- [x] 检查通过后中文提交信息提交并推送 origin main。

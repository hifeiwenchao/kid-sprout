# Apple Bundle ID Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 iPhone/iPad 与 Mac 的主 Bundle ID 改为 `com.feiwenchao.kid-sprout`，重新提交 Apple 审核。

**Architecture:** 保留现有原生功能、商店文案、免费定价和手动发布方式。根据 Apple 后台对标识的限制迁移商店记录，撤下旧标识的审核，再使用新标识重新签名归档、上传与提审。

**Tech Stack:** SwiftUI、Xcode、App Store Connect。

**Spec:** 用户本轮明确要求更换 Bundle ID 并重新发布；沿用此前两端提交、中国大陆首发及后台自动化要求。

## Global Constraints

- 主应用标识为 `com.feiwenchao.kid-sprout`，团队 `5A9Z4D7HV3`。
- 版本 `1.0.0`，新归档使用 build `2`；保留旧归档。
- iOS 17+、macOS 14+，Mac 同时含 arm64 与 x86_64。
- 保留免费、无数据收集、包含中国大陆、审核通过后手动发布的设置。
- 不操作用户桌面；私人审核联系电话和凭据不进 Git。

## Review Focus

- 已上传的商店记录可能禁止改 Bundle ID：以后台状态决定迁移方式。
- 旧提交需撤回，避免两个标识并行审核同一产品。
- 两端归档标识、签名团队、版本与上传目标必须一致。
- 更换标识会使用新的设备数据容器，不声称自动迁移存档。
- 不把上传或草稿提交误报为实际提交审核。

## Task 1: 工程标识与签名归档

**Files:** `native/ios/generate-project.cjs`、生成的 Xcode 工程与 schemes。

- [x] 更改两端主标识与 build，重新生成工程。
- [x] 检查 plist、生成设置及现有硬编码依赖。
- [x] 分别签名归档 iOS 和双架构 Mac，核对实际包内值与 codesign。iOS archive 为 `KidSprout-iOS-1.0.0-2b.xcarchive`，Mac archive 为 `KidSprout-macOS-1.0.0-2.xcarchive`。

## Task 2: Apple 后台迁移与重新提审

**Interfaces:** 输入 Task 1 的新归档，输出新商店身份、上传和审核状态。

- [x] 核对旧记录标识编辑限制，注册新标识。
- [x] 撤回旧标识两端审核，迁移至允许使用新标识的商店记录。
- [x] 上传并关联两端新构建，保存原有元数据、截图、隐私、年龄、价格与地区。iOS build UUID 为 `b36c2e1f-908b-4a0e-95d7-7706b0572742`，Mac build UUID 为 `5d57ebfa-5008-48a5-8c64-d66d44287bf9`。
- [x] 实际提交两端审核，保存最终后台状态凭据。iOS 提交 `a198cc45-3460-4ce3-adb9-f9ab97e63323`、macOS 提交 `d20238f9-2c11-4871-9bde-bf90db8d18fc`，均显示“等待审核”。

## Task 3: 发布记录与 Git

**Files:** `native/app-store/`、`native/VALIDATION.md`、各 Apple README。

- [x] 记录新旧商店身份与实际状态，保留历史证据。
- [x] 检查 diff、私密资料及文档一致性。
- [x] 提交并推送 `origin/main`，验证成功结果。

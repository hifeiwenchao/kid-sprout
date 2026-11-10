# 小芽学习乐园实施计划

> **For agentic workers:** 使用独立模块并行实施，完成后统一审查与回归。

**Goal:** 增加 2024 新版人教拼音和英文字母教学、各三个游戏，重新组织全站导航和布局。

**Architecture:** main.js 保留数字活动与共享弹窗。learning-hub.js 负责页面框架，hub-state.js 校验新增进度。pinyin/alphabet 各自持有课程、出题与交互，环境回调负责语音、进度和通关。

**Tech Stack:** Vite、原生 JavaScript/CSS、SVG、node:test。

**Spec:** docs/superpowers/specs/2026-11-10-learning-hub-design.md

## Global Constraints

- 保留旧数字学习记录和全部原有数字活动。
- 拼音课程使用 2024 新版人教版一年级上册顺序，并记录查证来源。
- 不引入前端框架或后端；教学界面提供无声提示、键盘操作、触屏布局。

## 1. 拼音学习区

- [x] 在 tests/pinyin.test.js 定义课程覆盖、课次、声调和出题答案测试，先运行失败。
- [x] 新增 src/courses/pinyin-data.js、pinyin.js、pinyin.css，实现课程与三个五关游戏。
- [x] 提供 renderPinyinPage()、createPinyinCourse(env) 以及合法进度标识；运行测试。

## 2. 英文字母学习区

- [x] 在 tests/alphabet.test.js 验证 26 字母、大小写、分组、干扰项与顺序边界，先运行失败。
- [x] 新增 src/courses/alphabet-data.js、alphabet.js、alphabet.css，实现课程与三个五关游戏。
- [x] 提供 renderAlphabetPage()、createAlphabetCourse(env) 以及合法进度标识；运行测试。

## 3. 学习大厅与进度

- [x] 先写 tests/hub-state.test.js 覆盖非法存储、去重、已学项过滤与视图解析，再实现 hub-state.js。
- [x] 新增 learning-hub.js、learning-hub.css；首页只展示三科入口与精选活动，独立游戏大厅支持筛选。
- [x] main.js 接入新模块、en-US 语音、通用奖励、全部学科进度与 hash 导航；保留数字行为。
- [x] 更新 index.html、README.md、package.json 的名称、内容说明、测试命令与课程来源。

## 4. 集成验证

- [x] `npm test` 与 `npm run build`。
- [x] 浏览器验证课程切换、三科游戏、错误重试、下一关与奖励、声音开关、刷新进度、返回导航。
- [x] 检查桌面与 390px 移动端，无横向溢出、焦点可见、弹窗可关闭。
- [x] 独立代码审查后修复键盘跳转和成就文案问题。
- [x] 提交、推送；远端部署后检查主页与资源。

## 验证记录

- 17 项 Node 测试通过，生产与 Docker 构建通过，本地容器 healthy。
- 浏览器完成原数字数数五关、全部九个数字活动入口；新增六个游戏各五关奖励、错误重试和静音提示通过。
- 390px 手机首页、课程与模态无横向溢出；键盘跳过导航保留当前学科并聚焦主内容。
- 独立审查提出的键盘跳转与成就文案问题均修复，没有遗留阻断问题。
- 远端已快进更新并重建容器，healthy；服务器内 HTTPS 新主页/JS/CSS/SVG 均 200，HTTP 301 保留查询参数。
- 旧手动复制的三个部署文件已保存到远端 Git stash `before-learning-hub-deploy`，未重新应用，因为内容已进入 main。
- 重新检查公网：DNS 正常；HTTP 返回 Beaver 403，HTTPS 在握手阶段被重置。此为当前交付限制，本机与服务器内代理验证正常。

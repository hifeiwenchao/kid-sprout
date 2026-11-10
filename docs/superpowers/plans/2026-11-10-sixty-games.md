# 每科20个小游戏 Implementation Plan

**Goal:** 三科各20个可玩的游戏，入口清晰并保留学习记录。

**Architecture:** 独立学科题库使用共享活动播放器，原有游戏保留。目录驱动所有页面，提供学科、目标、搜索组合筛选。

**Tech Stack:** 原生 JavaScript/CSS、Vite、Node test、Docker/Nginx。

**Spec:** `docs/superpowers/specs/2026-11-10-sixty-games-design.md`

## Global Constraints

- 不增加运行依赖；拼音保持2024新版人教14课顺序。
- 三科各20个；新游戏每次5关；答错重试且奖励只结算一次。
- 语音遵守静音设置；拼音例字参考不得宣称标准独立音素发音。
- 本机完成修改，推送 origin/main 后更新远端Docker。

## Tasks

- [x] 1. 数字题库：`number-extras.js` 导出 `NUMBER_EXTRA_GAMES`、`buildNumberExtraRounds(type, random)`；测试0–10运算、边界和答案可达性。
- [x] 2. 拼音题库：`pinyin-extras.js` 导出 `PINYIN_EXTRA_GAMES`、`buildPinyinExtraRounds(type, random)`；测试拼读、分类、标调规则。
- [x] 3. 字母题库：`alphabet-extras.js` 导出 `ALPHABET_EXTRA_GAMES`、`buildAlphabetExtraRounds(type, random)`；测试字母顺序、大小写和单词。
- [x] 4. 播放器：先运行 `node --test tests/activity-session.test.js` 见失败；实现 `createActivitySession(rounds)` 的 submit/advance 和四种交互，运行测试见通过。
- [x] 5. 目录及页面：统一元数据，每科20；`filterGames({subject,category,query})` 纯函数组合筛选，测试目录与题库覆盖，页面统一分组。
- [x] 6. 全量测试、构建与浏览器交互验收；独立审查改动，修复有证据的问题。
- 发布流程： 更新说明、提交push main、Docker重建及Nginx重载，验证内部HTTPS200及HTTP301，检查公网状态。


## 本机验收记录

- Node测试60/60，包含全部45个新增生成器与随机边界、每科20个唯一入口、拼读拼写及数学规则、会话防重复结算。
- 浏览器逐一打开60个入口；11个新增数字游戏、拼音和字母各4种交互完成五关；选择重试、多选清空、排序撤回、键盘操作、重开及静音提示通过。
- 手机390×844检查各科卡片和弹窗，三拼四次翻关滚动位置为0、题目可见且无横向溢出。修复翻关保留滚动和长拼音图标折行。
- 游戏大厅组合筛选、无结果与重置通过；独立审查无剩余可操作问题。Docker本机容器健康，生产构建通过。

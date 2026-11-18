# 萌芽启蒙 · Android

真正的 Kotlin / Jetpack Compose 原生应用，支持 Android 8.0（API 26）及以上的手机和平板，无 WebView。第一阶段包含数字 0–10、三款五关小游戏、自由画板和家长区；未实现的学科或游戏不显示入口。

## 构建

需要 JDK 17 或 21、Android SDK 35（Android Studio 可以安装）。仓库提供 Gradle 8.11.1 wrapper，并固定官方分发包 SHA-256。

1. 在 Android Studio 中打开此目录，或安装 Android command-line tools。
2. 在本目录创建被 Git 忽略的 `local.properties`，写入本机 SDK 的绝对路径：

   ```properties
   sdk.dir=/your/path/to/android-sdk
   ```

3. 使用 JDK 运行：

   ```sh
   ./gradlew testDebugUnitTest assembleDebug lintDebug
   ```

产物为 `app/build/outputs/apk/debug/app-debug.apk`，使用开发签名，可以安装测试；这不是商店发布包。首次构建需要网络下载 Google / Maven Central 的工具与依赖，安装后的学习内容离线可用。

```sh
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.feiwenchao.kidsprout/.MainActivity
```

`app` 的 assets 来源指向 `../../shared`（即 Gradle 工程旁的 `../shared`），直接打包 `native/shared/curriculum.json`。没有复制第二份题库。应用读取 `schemaVersion: 1` 与数字列表，未知或损坏内容安全退回数字 0–10。

## 已实现的行为

- 宽度小于 720dp 或可用高度小于 520dp 时采用底部导航，其余平板窗口采用侧栏；支持系统深色设置。无持续动画。
- 数字点读、任意顺序点击不同苹果计数、0 的空篮子与放入/拿走苹果、手动学过标记和继续学习。重复点同一个苹果不重复计数。
- 数一数水果、寻找数字、比比多少：每局五关，答错可重试，答对锁定，显式下一关，第五关完成后仅增加一颗星星。课程进度与游戏奖励独立。切换学习页面会保留当前局；点击本局中的“返回游戏”会结束本局并回到游戏列表，通关后的“选择其他游戏”也会清除当前局。应用进程结束后不保存未完成的游戏。
- 原生 Canvas 画板：画笔、六种颜色、连续粗细、橡皮擦、撤销/重做、可撤销的清空；支持手指/触控笔。笔迹采用 0–1 归一化坐标，画纸始终为正方形，窗口变化不挤坏画作。撤销记录保留最近 100 个动作；重启恢复当前画作，历史撤销栈不跨重启保存。
- 每张画纸最多新增 10,000 笔；到达上限会明确提示，保留已有画作，可先分享或撤销/清空再继续。恢复旧版超限的有效草稿也不会整幅清空。
- 短窗口的画板采用左右布局，工具区宽为窗口45%且不超过260dp，左侧独立滚动，右侧保持可绘画的正方形纸面；已验证800×360、360×360和320×480dp。
- PNG 由原生 Bitmap / Canvas 导出为白底 1400×1400，通过限定 cache 路径的 FileProvider 调用系统分享。不申请存储权限。
- 家长算术验证保护作者介绍、邮件和系统分享；算术验证是简单的儿童误触保护。邮箱为 `hi@feiwenchao.com`，无邮件应用时显示可读邮箱。
- 中文点读仅选择设备已安装的离线中文声音；家长可以关闭。没有离线中文声音时仍可看文字、看图、玩游戏。
- 没有 INTERNET、存储、相机或麦克风权限；没有账号、广告或分析 SDK。已禁用系统备份和设备迁移，记录与当前安装绑定。

## 本地数据

应用使用私有 SharedPreferences `sprout-native-v1` 保存版本化的数字学过集合、最后数字、语音开关和通关星星。未知数字、非法奖励和未来存档版本会被过滤或安全回退。画作通过后台串行写入与 `AtomicFile` 保存为私有文件 `drawing-v1.json`；每一笔完成以及撤销、重做和清空都会保存。保存完成后界面显示状态。网页的 localStorage 与这个应用独立。

PNG 暂存在 `cache/artwork/萌芽小画家.png`，用于用户主动分享；系统可以清理缓存。卸载应用会移除进度和草稿。

## 验证

单元测试覆盖水果去重、答错重试、答对锁定、五关和奖励一次、题目唯一性、损坏/未来存档和归一化画笔历史。报告在 `app/build/reports/tests/testDebugUnitTest/`；lint 报告在 `app/build/reports/lint-results-debug.html`。

提供原生 UI 自动冒烟脚本。它会**清空此 debug 应用的数据**，然后检查手机/平板导航、三局全部 15 关、答错重试、课程和画作重启恢复、橡皮擦/历史、家长验证和 PNG 分享。脚本通过 adb 读取实际辅助功能节点，不使用网页或隐藏接口。

```sh
# 先启动一个 Android 模拟器并安装 APK，仅连接一个设备。
ANDROID_SDK_ROOT=/your/path/to/android-sdk node scripts/emulator-smoke.mjs
```

截图写入被忽略的 `build/reports/qa/`。模拟器不能代替实际手机上的触控笔手感、系统中文声音和各邮件/分享接收应用的兼容性检查。

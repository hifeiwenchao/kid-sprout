# 离线课程契约

`curriculum.json` 为两端打包使用的 UTF-8 JSON，不包含联网地址加载或执行脚本。由仓库根目录运行 `npm run native:content` 从网页课程生成，不手动修改。

- `schemaVersion: 1`：客户端读取内容前检查版本；不支持的版本应显示可理解的提示。
- `brand: String`：萌芽启蒙。
- `numbers: [{ value: Int, name: String }]`：按 0–10 顺序排列，包含中文名称。
- `pinyin: { edition, sources, lessons, items, tones }`：2024 新版人教版课程内容，保留网页课程字段。
- `alphabet: { letters, groups }`：26 个字母及分组，保留网页课程字段。

第一阶段客户端读取数字部分。拼音、字母作为后续迁移的数据基础，当前不提供未完成的学习入口。iOS 将本文件作为 bundle resource；Android 直接将本目录作为 Gradle assets 来源，因此不产生容易过期的第二份拷贝。

修改网页课程后运行 `npm run native:content`，再运行 `npm run native:content -- --check` 和 `npm test`。导出不包含时间戳，多次运行内容一致。

进度与画板分别使用平台本地存储，不写入课程文件，也不会自动导入网页 localStorage。

# 数字小乐园

一个面向 3–6 岁儿童的中文数字启蒙网页。使用原生 JavaScript、CSS 和 SVG 绘制，Vite 负责本地开发与打包。

## 运行

```sh
npm install
npm run dev
```

打开终端输出的本地网址。生产构建：`npm run build`；预览构建：`npm run preview`。

## Docker 运行

安装并启动 Docker（需包含 Docker Compose），在项目目录执行：

```sh
docker network create depends_proxy 2>/dev/null || true
docker compose up -d --build
```

打开 [http://localhost:8080](http://localhost:8080)。镜像使用 Node.js 22 构建页面，再由 Nginx 提供静态文件，无需在本机安装 Node.js。

如需更换端口，例如使用 `3000`：

```sh
KID_SPROUT_PORT=3000 docker compose up -d --build
```

查看日志与停止服务：

```sh
docker compose logs -f
docker compose down
```

修改源码后，重新执行启动命令即可构建并更新容器。学习记录仍保存在浏览器中；更换访问地址或端口会使用独立的浏览器存储。

项目服务同时加入 `depends_proxy` Docker 网络，供外部 Nginx 容器通过 `kid-sprout-web:80` 代理访问。使用项目自带的 [deploy/nginx/kid-sprout.conf](deploy/nginx/kid-sprout.conf) 时，将配置复制到 Nginx 的 `conf.d` 目录并重载 Nginx。

也可以直接使用 Docker：

```sh
docker build -t kid-sprout:local .
docker run -d --name kid-sprout -p 8080:80 kid-sprout:local
```

## 功能

- 1–10 数字卡片：中文点读、数量对应、逐个点击数数。
- 水果数数、数字捉迷藏：随机出题，每次 5 关，鼓励反馈与通关奖励。
- 数字描画：支持鼠标与触屏，切换数字、清空重画。
- 数字小火车：补齐连续数字里的空车厢，5 关练习数字顺序。
- 小兔分胡萝卜：比较两篮实际数量，选择更多的一篮，5 关趣味挑战。
- 记忆翻翻乐：数字与相同数量的星星配对，3 关从小数字逐步过渡到 10。
- 数字气球派对：按数字顺序点气球，3 关依次练习 1–5、6–10 和 1–10。
- 小熊点心铺：按照小熊的订单装饼干，支持放入与取出，5 关练习数字对应数量。
- 小耳朵听听：听真实合成的小鼓声并数一数，5 关练习 1–5；可重复播放或展开圆点提示，无声环境也能玩。
- 数字儿歌：按句播放，突出显示当前歌词。
- 数字学习进度、成就与打卡记录保存在当前浏览器的 localStorage。
- 桌面、平板、手机自适应；键盘可操作，支持减少动态效果偏好。

中文点读由浏览器的 Web Speech API 提供，语音可用性取决于浏览器及系统安装的中文语音。页面图形均为本地 SVG；字体包含系统回退。无账号、无后端服务。

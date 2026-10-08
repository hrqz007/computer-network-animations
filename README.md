# 计算机网络原理实验室

面向大学《计算机网络》课程的科普动画与交互实验室。按**物理层、数据链路层、网络层、运输层、应用层**组织统一主页，让学生先看到过程，再修改条件验证原理。

**43 个独立演示 · 145 道课堂题 · 36 张独立教学插画 · 支持离线单文件 · 源码 MIT**

An interactive computer networking lab for undergraduate teaching, organized around the five-layer Internet model. Chinese narration, visual experiments, and Packet Tracer practice guides. Built with React, TypeScript, Vite, and SVG.

[下载离线版](https://github.com/hrqz007/computer-network-animations/releases/latest) · [报告问题或建议](https://github.com/hrqz007/computer-network-animations/issues) · [素材来源与许可](THIRD_PARTY_NOTICES.md) · [参与贡献](CONTRIBUTING.md)

## 用来怎么上课

每节课采用“**科普故事 → 自由实验 / Packet Tracer → 课堂提问**”的结构。故事支持分幕讲解、重播、调速；自由实验通过改变输入观察结果；每节至少三道课堂题并附解析。IPv4 地址、掩码、AND、同网判断、地址范围、子网划分与默认网关已拆分为七节，便于逐步教学。

无需账户、后端或 API 密钥。核心动画、图片和练习可离线使用；外部资料链接需要联网。

## 已完成的内容

| 网络层次 | 独立演示 | 已实现内容 |
| --- | ---: | --- |
| 物理层 | 30 | 双绞线 A/B 线序、水晶头制作、测线、差分抗干扰；同轴结构与反射；光纤全反射、单模/多模、脉冲与色散、海缆结构/铺设/跨洋通信；无线传播、遮挡干扰、星链与飞机上网；编码调制、比特率与波特率；FDM/TDM/WDM/CDM；发送/传播时延；单工双工、串并行与到达偏差 |
| 数据链路层 | 6 | 帧封装与拆解、CRC 逐位演算、MAC 学习与转发、VLAN/Trunk、STP 防环与恢复、EtherChannel 聚合与分担 |
| 网络层 | 7 | IPv4 地址与二进制、子网掩码、AND 求网络地址、同网判断、网络/广播/主机地址、子网划分、默认网关 |
| 运输层 | 待建设 | 端口、TCP 连接、可靠传输、流量与拥塞控制 |
| 应用层 | 待建设 | DHCP、DNS、HTTP、FTP 与电子邮件 |

后续优先完成五层主要原理，再扩展物理层的同步异步、信道容量、PON 等内容。主页中的规划内容不代表已经实现。

## 直接使用离线版

1. 打开 [Releases](https://github.com/hrqz007/computer-network-animations/releases/latest)，下载 `computer-network-animations-v0.1.0-offline.zip`。
2. 解压后，用较新的 Chrome、Edge 或 Firefox 打开 `计算机网络原理实验室.html`。
3. 在统一主页按层次选择演示。单个 HTML 已嵌入运行所需的脚本、样式与教学插画。

## 从源码运行

需要 **Node.js 22.12 或更新版本**和 npm。

```sh
git clone https://github.com/hrqz007/computer-network-animations.git
cd computer-network-animations
npm ci
npm run dev
```

浏览器打开终端显示的地址，默认 `http://127.0.0.1:5186/`。如果该端口被占用，以终端实际地址为准。

```sh
npm test          # 教学模型与课程完整性验证
npm run build     # TypeScript 检查、网页构建、离线文件生成
npm run data:build # 从自有教学通道与公共领域底图重新生成地图数据
```

网页构建结果在 `dist/`；可独立打开的成品在 `release/计算机网络原理实验室.html`。这两个目录不提交到源码仓库。项目使用 Hash 路由与相对资源路径，可以部署 `dist/` 到静态网站。

## 开源版中的第三方资料

- **全球海缆**：本地地图的十条通道由本项目自行绘制，仅解释洲际通信关系；它们不是实际海缆路线、数量、容量或状态。界面提供 [TeleGeography 真实海缆地图](https://www.submarinecablemap.com/)链接。未将其另需许可的海缆数据库打包公开。
- **星链与航空通信**：真实照片和 V2 Mini 官方渲染通过官方原图与来源页面链接查看。离线版使用明确标注的教学插画，不将通用卫星插画当作星链真实外观。
- **地图底图**：Natural Earth 公共领域陆地轮廓；教学光点均不是实时数据流量。

详细的范围、来源与使用条件见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。原始课程课件、学生资料、第三方下载缓存、Packet Tracer 软件均未包含在仓库中。

## 教学边界与验证

模型会放慢时间、简化设备和工程结构，用于解释原理。真实协议时序、光波模式、工程施工、卫星轨道与实际路由，应以专业资料及设备行为为准。课程页面给出了相应边界和参考资料日期。

Packet Tracer 指引包含拓扑、命令和观察任务，但**尚未在授课机房实际安装的版本中逐项运行验证**。使用前需按版本、设备型号和接口名调整。项目不内置或自动操作 Packet Tracer。

本版本包含 82 项自动测试，覆盖 IPv4 计算、CRC、交换转发、VLAN、STP、链路聚合、物理层模型及课程题目完整性。GitHub Actions 在推送与 Pull Request 时运行测试和构建，并保留离线构建产物。

## 项目结构

```text
src/
  course.ts, catalogModel.ts   五层目录和课程入口
  lessonStories.ts             科普故事分镜
  *Scene.tsx, Story*Visuals.tsx  动画场景
  *Model.ts, model.ts          可验证的教学模型
  *Notes.tsx                  原理说明与 Packet Tracer 指引
  quizBank.ts                 课堂题库
  assets/story/objects/       独立透明教学插画
  data/                      公共领域底图与自有教学路线
tests/model.test.ts          模型与课程测试
scripts/portable.mjs         离线单文件打包
scripts/build-teaching-map.mjs  教学地图生成
```

## 许可证

源码采用 [MIT](LICENSE)。项目自有文案、程序绘图与可许可的教学插画权利一并按 MIT 提供；第三方数据、软件及外链资料适用各自许可，详见[素材与数据来源](THIRD_PARTY_NOTICES.md)。

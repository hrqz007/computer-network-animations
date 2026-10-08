# 素材与数据来源

## 项目代码、教学内容与插画

本项目自行编写的代码、教学文案、程序绘图和教学通道数据采用根目录的 MIT 许可证。`src/assets/story/objects/` 中 36 张独立透明 PNG 使用生成式图像工具制作，其提示词保存在同级上层目录的 JSON 文件中。对项目作者可许可的相关权利，同样采用 MIT；不对生成式图片的独占性作承诺。插画只用于教学，不作为实物照片或工程图。

## Natural Earth 地图底图

`src/data/land.json` 的陆地轮廓来自 Natural Earth 的 `ne_110m_land`，采用公共领域数据。坐标经等距经纬投影转换并取两位小数；投影公式记录于文件中。`src/data/cables.json` 由它与本项目教学通道合成。

- [数据源](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson)
- [Natural Earth 使用条款](https://www.naturalearthdata.com/about/terms-of-use/)

## 仅通过外部链接提供的资料

以下第三方内容**未包含在仓库、离线版或构建产物中**，不受本项目 MIT 许可覆盖。查看外链需联网，相关内容及商标的权利归原权利人。

| 资料 | 在本项目中的处理 |
| --- | --- |
| [TeleGeography 全球海缆地图](https://www.submarinecablemap.com/) | 提供外部地图链接。本地动画使用自行绘制的教学通道，不使用其海缆数据库。 |
| [SpaceX 历史在轨照片](https://sxcontent9668.azureedge.us/cms-assets/assets/Delivering_Highspeed_Mobile_86f0698604.jpg) | 原图链接；本地以明确标注的通用卫星插画辅助说明。历史照片不用于确认 V2 Mini 代际。 |
| [Starlink V2 Mini 官方渲染](https://starlink.com/assets-new/images/marketing/technology/technology_v2mini_antennas_carousel_d.webp) | 原图及[技术页面](https://starlink.com/technology)链接；不复制图片文件。 |
| [Starlink 机顶天线罩照片](https://starlink.com/assets-new/images/landing/field/aviation_jet_top_closeup.webp) | 原图及[航空服务页面](https://starlink.com/business/aviation)链接；本地使用客机教学插画。 |

TeleGeography 的[引用说明](https://www2.telegeography.com/cite-telegeography-map)区分可引用的地图图片与另行许可的底层数据库。不要把第三方地图下载结果直接以本项目 MIT 许可证发布。

课堂原始课件、教材、Packet Tracer 软件、第三方网站下载缓存与未获确认许可的照片均不在本仓库。课程中的厂商与产品名称仅用于说明教学场景，不表示厂商参与或认可本项目。

## 软件依赖

React、React DOM、Vite、TypeScript、tsx、Node.js 类型声明及其间接依赖按各自软件包随附的许可证分发。版本由 `package-lock.json` 锁定；安装后可在 `node_modules` 中查看各包许可文件。

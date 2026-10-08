import {media,physicalTopics,ethernetSuite,switchingSuite,vlanSuite,stpSuite,channelSuite,ipv4Suite,layers} from './course';
import {lessonStories} from './lessonStories';
type SuiteInfo={title:string;intro:string;lessons:readonly {id:string;title:string}[]};
export type CatalogTopic={id:string;layer:number;group:string;info:SuiteInfo};
export type CatalogLesson={key:string;layer:number;topic:string;topicTitle:string;title:string;description:string;href:string;searchText:string};
export type CatalogSelection={layer:number;topic:string};
export const catalogTopics:CatalogTopic[]=[
 ...Object.entries(media).map(([id,info])=>({id,layer:0,group:'传输介质',info})),
 ...physicalTopics.map(({id,info})=>({id,layer:0,group:'通信原理',info})),
 {id:'ethernet',layer:1,group:'数据链路原理',info:ethernetSuite},
 {id:'switching',layer:1,group:'数据链路原理',info:switchingSuite},
 {id:'vlan',layer:1,group:'数据链路原理',info:vlanSuite},
 {id:'stp',layer:1,group:'数据链路原理',info:stpSuite},
 {id:'etherchannel',layer:1,group:'数据链路原理',info:channelSuite},
 {id:'ipv4',layer:2,group:'寻址与转发',info:ipv4Suite}
];
const aliases:Record<string,string>={
 'twisted/wiring':'T568A T568B RJ45 直通 交叉',
 'twisted/crimp':'RJ45 8P8C 压线钳 制作网线',
 'twisted/tester':'测线仪 开路 短路 错接 拆对',
 'twisted/signal':'差分 共模 双绞线 抗干扰',
 'fiber/global-map':'全球 海底光缆 分布 地图 海缆',
 'fiber/sea-structure':'海底光缆 铠装 组成',
 'fiber/sea-laying':'海底光缆 铺设 铺缆船',
 'radio/satellite':'Starlink 星链 卫星 实拍 V2 Mini',
 'radio/starlink':'Starlink 星链 低轨 网关 激光',
 'radio/aviation':'Starlink 星链 飞机 航空 Wi-Fi 微信',
 'radio/propagation':'Wi-Fi WiFi 无线 传播',
 'radio/interference':'Wi-Fi WiFi 无线 遮挡 干扰',
 'ethernet/frame':'MAC 帧头 FCS 封装 解封装 MTU',
 'ethernet/crc':'CRC 检错 校验 异或 模2 除法',
 'switching/learning':'MAC 地址表 交换机 学习 泛洪 转发',
 'vlan/isolation':'VLAN Trunk 802.1Q Access 广播域 隔离 标签 native allowed SVI',
 'stp/tree':'STP 生成树 根桥 BPDU 环路 广播风暴 阻塞 冗余 收敛 故障恢复',
 'etherchannel/bundle':'链路聚合 EtherChannel Port-channel Po1 LACP 哈希 负载分担 带宽 active passive mode on 冗余',
 'ipv4/address':'IPv4 IP地址 点分十进制 二进制 位权 32位 8位',
 'ipv4/mask':'IPv4 子网掩码 CIDR 前缀 网络位 主机位',
 'ipv4/and':'IPv4 按位与 AND 网络地址 计算 151.188.5.42 192.168.10.108',
 'ipv4/same-network':'IPv4 同网判断 本地 远端 发送端 子网掩码',
 'ipv4/range':'IPv4 网络地址 广播地址 可用主机 范围 首尾',
 'ipv4/division':'IPv4 子网划分 借位 主机数 地址规划 切割 容量',
 'ipv4/gateway':'IPv4 默认网关 下一跳 路由口 三层交换 ping'
};
const descriptions:Record<string,string>={'twisted/signal':'两根线一起受干扰，为什么还能听清？','switching/learning':'跟着三次送信，看懂交换机怎样认路。'};
const normalize=(value:string)=>value.toLowerCase().replace(/[\s\u3000]+/g,'');
export const catalogLessons:CatalogLesson[]=catalogTopics.flatMap(topic=>topic.info.lessons.map(lesson=>{
 const key=`${topic.id}/${lesson.id}`,story=lessonStories[key];
 const description=descriptions[key]??story?.title??lesson.title;
 return {key,layer:topic.layer,topic:topic.id,topicTitle:topic.info.title,title:lesson.title,description,
  href:`#/${['physical','datalink','network','transport','application'][topic.layer]}/${key}`,
  searchText:normalize([lesson.title,description,story?.lead,layers[topic.layer].name,topic.info.title,aliases[key]].join(' '))};
}));
export function searchCatalog(query:string){
 const terms=query.trim().toLowerCase().split(/\s+/).filter(Boolean).map(normalize);
 return terms.length?catalogLessons.filter(lesson=>terms.every(term=>lesson.searchText.includes(term))):[];
}
export function validCatalogSelection(value:unknown):CatalogSelection{
 const candidate=value as Partial<CatalogSelection>|null;
 const layer=Number.isInteger(candidate?.layer)&&candidate!.layer!>=0&&candidate!.layer!<layers.length?candidate!.layer!:0;
 const topics=catalogTopics.filter(topic=>topic.layer===layer);
 return {layer,topic:topics.find(topic=>topic.id===candidate?.topic)?.id??topics[0]?.id??''};
}

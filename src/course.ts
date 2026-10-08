import type {Medium} from './model';
import {ipLessons} from './ipLesson';
export const media:Record<Medium,{title:string;heading:string;intro:string;lessons:{id:string;title:string}[];source:string}>={
 twisted:{title:'双绞线',heading:'双绞线：从线序到接通',intro:'先认清 A/B 标准，再亲手排线、压接和检测。',lessons:[{id:'wiring',title:'A/B 线序'},{id:'crimp',title:'水晶头制作'},{id:'tester',title:'接线检测'},{id:'signal',title:'差分抗干扰'}],source:'1-4. 常用网络设备和传输介质 → 双绞线、线序标准、跳线类型；2-3. 组建基础局域网'},
 coax:{title:'同轴电缆',heading:'同轴电缆：屏蔽与反射',intro:'从同心结构出发，观察信号如何传播、反射与被接收。',lessons:[{id:'structure',title:'结构剖面'},{id:'signal',title:'端接与反射'}],source:'1-4. 常用网络设备和传输介质 → 有线传输介质；结构与端接为本课补充'},
 fiber:{title:'光纤',heading:'光纤：从一束光，到全球互联',intro:'观察全反射与传播模式，拆解海底光缆，追踪连接各大洲的数据通道。',lessons:[{id:'reflection',title:'光的全反射'},{id:'structure',title:'单模与多模'},{id:'signal',title:'脉冲与色散'},{id:'sea-structure',title:'海缆组成'},{id:'sea-laying',title:'海缆铺设'},{id:'global-map',title:'全球海缆'}],source:'1-4. 常用网络设备和传输介质 → 光纤结构、单模与多模；1-2. 数据通信原理；海缆工程为拓展'},
 radio:{title:'无线电与卫星',heading:'无线通信：从教室，走向太空',intro:'从无线传播出发，认识真实星链卫星，观察飞机上的互联网如何接通。',lessons:[{id:'propagation',title:'空间传播'},{id:'interference',title:'遮挡与干扰'},{id:'satellite',title:'卫星实物'},{id:'starlink',title:'星链网络'},{id:'aviation',title:'飞机上网'}],source:'1-4. 常用网络设备和传输介质 → 无线介质；4-1. AccessPoint → 覆盖与部署；星链与航空通信为拓展'}
};
export const encodingSuite={title:'信号与编码',heading:'信号与编码：让比特成为波形',intro:'同一串数据，比较不同的编码方式与传输含义。',lessons:[{id:'baseband',title:'基带编码'},{id:'modulation',title:'载波调制'},{id:'rates',title:'比特率与波特率'}],source:'1-2. 数据通信原理 → 信号、基带 / 频带传输、数据传输率；具体线码、调制和 PAM 为补充'};
export const multiplexSuite={title:'信道复用',heading:'信道复用：一条链路，多路同行',intro:'分别观察频率、时间、波长和码，怎样把多路通信分开。',lessons:[{id:'fdm',title:'频分复用 FDM'},{id:'tdm',title:'时分复用 TDM'},{id:'wdm',title:'波分复用 WDM'},{id:'cdm',title:'码分复用 CDM'}],source:'1-2. 数据通信原理 → 信道复用技术；保护带、统计复用与码片相关计算为补充'};
export const delaySuite={title:'发送与传播时延',heading:'时延：比特何时发完，何时到达',intro:'把发送与传播分开观察，再沿时间轴追踪首尾比特。',lessons:[{id:'transmission',title:'发送时延'},{id:'propagation',title:'传播时延'},{id:'arrival',title:'首尾到达'}],source:'1-2. 数据通信原理 → 数据传输率；1-4. 传输介质；发送与传播时延模型为教学补充'};
export const communicationSuite={title:'数据通信方式',heading:'通信方式：方向、通路与同时性',intro:'比较单工与双工、串行与并行，观察多条通路的到达偏差。',lessons:[{id:'directions',title:'单工与双工'},{id:'serial',title:'串行与并行'},{id:'skew',title:'并行到达偏差'}],source:'1-2. 数据通信原理 → 数据通信方式；2-3. 组建基础局域网；通路偏差与采样为补充对照'};
export const physicalTopics=[{id:'encoding',info:encodingSuite,desc:'把比特变成波形，分清编码、调制与传输速率。'},{id:'multiplex',info:multiplexSuite,desc:'按频率、时间、波长和码，让多路通信共享物理信道。'},{id:'delay',info:delaySuite,desc:'调节数据长度、速率与距离，观察发送和传播怎样重叠。'},{id:'communication',info:communicationSuite,desc:'比较通信方向、串行与并行，判断多路数据是否同时到达。'}];
export const physicalLessonCount=Object.values(media).reduce((sum,m)=>sum+m.lessons.length,physicalTopics.reduce((sum,t)=>sum+t.info.lessons.length,0));
export const ethernetSuite={title:'以太网基础',heading:'以太网：从数据封装，到差错检测',intro:'两个独立动画：先拆开一帧认识字段，再逐位演算 CRC。',lessons:[{id:'frame',title:'以太网帧封装与拆解'},{id:'crc',title:'CRC 检错'}],source:'2-1. 以太网 → 帧结构、MTU、抓帧实验；1-2. 数据通信原理 → CRC；2-3. 组建基础局域网'};
export const switchingSuite={title:'交换机学习与转发',heading:'交换机怎么认路？',intro:'跟着小安和小白送三次信，看懂交换机怎样学会把消息送对人。',lessons:[{id:'learning',title:'MAC 学习与帧转发'}],source:'2-3. 组建基础局域网 → 交换机、MAC 表构建与老化；附录 MAC地址表；故事比喻、同端口过滤为教学补充'};
export const vlanSuite={title:'VLAN 与 Trunk',heading:'同一台交换机，怎样分成不同的“班级”？',intro:'用一封广播看懂逻辑分组，再让带标签的帧跨过交换机。',lessons:[{id:'isolation',title:'VLAN 隔离与 Trunk 传输'}],source:'5-3. VLAN → 广播域、端口分组、二层交换机；附录 配置VLAN / VLAN-1 / VLAN-2；Trunk 为衔接补充'};
export const stpSuite={title:'STP 生成树',heading:'多接一条网线，为什么反而会出问题？',intro:'从广播环路到备用路径，观察根桥、阻塞端口与故障恢复。',lessons:[{id:'tree',title:'STP 防环与故障恢复'}],source:'5-5. 网络冗余和信息保护 → 广播风暴、多重帧复制、MAC 表不稳定、生成树与冗余链路'};
export const channelSuite={title:'链路聚合 EtherChannel',heading:'两根网线，怎样一起干活？',intro:'把物理成员组成逻辑通道，比较多组分担、单组上限与故障备份。',lessons:[{id:'bundle',title:'链路聚合与负载分担'}],source:'5-5. 网络冗余和信息保护 → 链路聚合；附录 配置聚合链路 / PortChannel-1；LACP 与哈希边界为补充'};
export const ipv4Suite={title:'IPv4 地址与子网',heading:'一步一个问题，学会网络层寻址',intro:'按 7 个独立动画逐步学习：地址 → 掩码 → AND → 同网判断 → 地址范围 → 子网划分 → 默认网关。每节都有自己的实验与课堂题。',lessons:ipLessons,source:'2-2. IP地址；附录 IP计算 / IP地址的切割；5-1. 三层交换基础；5-2. 路由口'};
export const totalLessonCount=physicalLessonCount+ethernetSuite.lessons.length+switchingSuite.lessons.length+vlanSuite.lessons.length+stpSuite.lessons.length+channelSuite.lessons.length+ipv4Suite.lessons.length;
export const deferredPhysicalTopics=['同步与异步通信','带宽、噪声与信道容量','信号再生与集线器','物理链路建立与故障定位','QAM / OFDM','光纤入户与 PON'];
export const layers=[
 {name:'物理层',question:'比特如何经过介质，成为可接收的信号',topics:['传输介质','信号与编码','信道复用','发送与传播时延','数据通信方式']},
 {name:'数据链路层',question:'在相邻节点之间组织和传送帧',topics:['以太网帧封装与拆解','CRC 检错','交换机学习与转发','VLAN 与 Trunk','STP 与链路聚合']},
 {name:'网络层',question:'让数据报跨越网络，找到目的地',topics:['IP 地址与子网','ARP 与下一跳','路由与 ICMP','NAT / PAT']},
 {name:'运输层',question:'在应用进程之间建立通信',topics:['端口与复用','TCP 连接','可靠传输','流量与拥塞控制']},
 {name:'应用层',question:'让网络成为可以使用的服务',topics:['DHCP','DNS','HTTP','FTP 与电子邮件']}
];
export const wires={wo:{name:'白橙',color:'#dc741e',stripe:true},o:{name:'橙',color:'#dc741e',stripe:false},wg:{name:'白绿',color:'#228447',stripe:true},g:{name:'绿',color:'#228447',stripe:false},b:{name:'蓝',color:'#2869c5',stripe:false},wb:{name:'白蓝',color:'#2869c5',stripe:true},wbr:{name:'白棕',color:'#805139',stripe:true},br:{name:'棕',color:'#805139',stripe:false}};
export type Wire=keyof typeof wires;
export type Standard='A'|'B';
export const orders:Record<Standard,Wire[]>={A:['wg','g','wo','b','wb','o','wbr','br'],B:['wo','o','wg','b','wb','g','wbr','br']};
export const pinMapping=(a:Standard,b:Standard)=>orders[a].map(w=>orders[b].indexOf(w)+1);
export type Fault='none'|'open'|'swap'|'short'|'split';
export function testMapping(a:Standard,b:Standard,fault:Fault):number[][]{
 const map=pinMapping(a,b).map(v=>[v]);
 if(fault==='open')map[2]=[];
 if(fault==='swap')[map[0],map[1]]=[map[1],map[0]];
 if(fault==='short'){const joint=[...map[2],...map[3]];map[2]=joint;map[3]=joint;}
 return map;
}
export const crimpSteps=[
 {title:'准备材料',detail:'选择与线缆类别、线径和实心 / 多股导体相匹配的 8P8C 插头与压线钳。先确定两端使用的标准。',check:'本动画采用普通非贯通式插头，其他插头按厂商工艺操作。'},
 {title:'剥除外护套',detail:'只去除必要长度的外护套，露出四对绝缘线芯；保留线芯绝缘，不割伤铜芯。',check:'这是剥外护套，不是剥掉八根线芯的绝缘层。'},
 {title:'按标准排线',detail:'按 1—8 号位理顺线芯，只在端接所需范围解绞。蓝色线对占 4、5，棕色线对占 7、8。',check:'排线时保持观察方向一致；A/B 的区别是橙、绿两对的位置。'},
 {title:'剪齐线端',detail:'八根线芯的前端剪齐，长度与插头内部结构匹配，避免为方便操作过度解绞。',check:'剥线与剪线长度以实际插头说明为准，动画不按实物尺寸绘制。'},
 {title:'插入到底',detail:'保持线序，把八根线芯送入各自导槽；检查每根线端均到达插头前端。',check:'从透明外壳检查，不可只检查最长的一根线是否到位。'},
 {title:'压接固定',detail:'外护套进入压线部位后，用配套压线钳完成压接。触点接触导体，压线结构固定护套。',check:'护套应被固定，不能只压住八根散开的线芯。'},
 {title:'测线与复查',detail:'制作另一端后连接测线仪，检查通断、错接和短路；必要时进一步做线缆认证测试。',check:'简单测线仪的导通结果不能证明带宽性能，也可能识别不了拆对。'}
];

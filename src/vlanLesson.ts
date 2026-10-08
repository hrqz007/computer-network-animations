import type {LessonStory} from './lessonStories';
import type {Question} from './quizBank';
export const vlanStory:LessonStory={
 title:'同一台交换机，怎样分成不同的“班级”？',
 lead:'跟着一封广播信，先看 VLAN 分组，再看 Trunk 怎样跨交换机送信。',
 scenes:[
  {title:'还没分组，一封广播会到所有其他电脑。',body:'四台设备先接在同一台交换机的 VLAN 1 中。小安 A 发出一帧广播，交换机给 B、C、D 各转发一份，不从入端口发回 A。',cue:'先看共同广播域：B、C、D 都收到'},
  {title:'给端口分组，相当于分成两个班。',body:'把 A、B 的接入口划到 VLAN 10，把 C、D 的接入口划到 VLAN 20。设备仍可插在同一台交换机上，分组由配置决定。',cue:'同一台设备，也能划出不同的广播域'},
  {title:'A 再广播，这次只到同班的 B。',body:'A 发来的普通未带标签帧从接入口进入，交换机根据这个端口把它归入 VLAN 10。广播只在 VLAN 10 内转发，C、D 收不到。',cue:'看端口所属 VLAN，不按人的身份分组'},
  {title:'同班搬到另一台交换机，还需要一条通路。',body:'现在 A、C 在 S1，B、D 在 S2。两边都创建 VLAN 10 和 20，但交换机之间还没有接通；VLAN 号相同不会自动产生连接。',cue:'同 VLAN + 实际连通的二层路径'},
  {title:'经过 Trunk，先带上“我是 10 班”的标记。',body:'两端配置好的 Trunk 共用一条链路。VLAN 10 的帧在这段链路上携带 802.1Q 标签；到 S2 后仍只走 VLAN 10，发给 B 的普通接入口时不带标签。',cue:'主机侧不带标签 → Trunk 带 VID 10 → 主机侧不带标签'},
  {title:'20 班也能借同一条 Trunk 走。',body:'换成 C 发送广播，交换机识别为 VLAN 20，在 Trunk 上使用 VID 20。S2 将它送给 D，不会因为共用一条线就送给 VLAN 10 的 B。',cue:'共用物理链路，仍保持各自的广播域'},
  {title:'只放行 10 班，20 班的帧就过不去了。',body:'如果 S1 的 Trunk 允许列表里漏了 VLAN 20，C 的帧不能从这条 Trunk 发出。线还连着，VLAN 10 也可能正常，故障可以只影响一个 VLAN。',cue:'检查两端的 allowed VLAN 列表'},
  {title:'Trunk 把同班接起来，不会替两班做路由。',body:'恢复放行后，A 的广播仍只到 B，C、D 仍收不到。不同 VLAN 间的 IP 通信需要路由器或三层交换功能，本节先停在二层边界。',cue:'VLAN 隔离广播域；Trunk 承载多个 VLAN'}
 ],
 question:{title:'S1 与 S2 的 Trunk 正常，A 在 VLAN 10、D 在 VLAN 20。A 的广播会到 D 吗？',choices:['不会，Trunk 仍保持 VLAN 隔离','会，接通 Trunk 就合成一个广播域','会，只要给它们填写相同的 IP 网段'],correct:0,why:'Trunk 扩展各 VLAN 的二层连接，不合并它们。修改 IP 地址也不会改变交换机接入口的 VLAN 归属。'},
 terms:[['VLAN / 广播域','按逻辑划分的二层网络；本例广播只在源端口所属 VLAN 内传播。'],['Access 接入口','本例连接普通电脑，一个接入口属于一个数据 VLAN，主机侧的帧不带 802.1Q 标签。'],['Trunk / 802.1Q','在一条链路上传递多个 VLAN 的流量；标签内的 VID 用来辨认 VLAN。'],['VLAN 与 SVI','VLAN 是二层广播域；interface vlan 创建的 SVI 是三层逻辑接口。仅创建 VLAN 不要求给它配置 IP。']],
 boundary:'班级和信封是教学比喻，彩色区域不是物理隔墙。只演示数据广播、静态接入口与无环拓扑；端口已就绪。Trunk 两端 native VLAN 均为 1，VLAN 10/20 使用标签。native VLAN 默认通常不带标签，不能概括为所有 Trunk 帧都有标签。未模拟语音 VLAN、VTP、STP 收敛或跨 VLAN 路由。'
};
export const vlanQuestions:Question[]=[
 {q:'同一台交换机上，A 在 VLAN 10，C 在 VLAN 20。A 的广播怎样转发？',answers:['只在 VLAN 10 的其他可转发端口内传播','所有端口都收到','先比较 A 和 C 的 IP 是否同网段'],correct:0,why:'二层 VLAN 限定广播域，入端口不会收到自己的转发副本。IP 地址不是本例广播转发的分组依据。'},
 {q:'普通电脑向 Access 接入口发出未带 VLAN 标签的帧，交换机怎样确定本例所属 VLAN？',answers:['按电脑的外观颜色','按接入口的 Access VLAN 配置','必须让电脑先填写 VLAN 号'],correct:1,why:'本例使用基于端口的静态 VLAN，交换机由接入口配置判断归属。颜色只是教学标记。'},
 {q:'本例一帧从 A 经 Trunk 到 B，802.1Q 标签出现在哪里？',answers:['在每一段上都必须保留','只在本例 S1—S2 的 Trunk 段携带 VID 10','只在 A—S1 上携带'],correct:1,why:'本例 native VLAN 是 1，VLAN 10 在 Trunk 段带标签；两端连接普通主机的 Access 段不带标签。native VLAN 默认通常不带标签。'},
 {q:'VLAN 10 跨交换机正常，VLAN 20 不通，首先可对照检查什么？',answers:['只换电脑 IP，不看交换机','认为网线只允许一个 VLAN','两端 VLAN 是否创建、端口归属与 Trunk 允许列表'],correct:2,why:'Trunk 可承载多个 VLAN，但两端都要允许相应 VLAN，接入口归属也要正确。物理连通不代表每个 VLAN 都可通过。'},
 {q:'配置好 Trunk，是否就能让 VLAN 10 与 VLAN 20 的主机互相进行 IP 通信？',answers:['能，Trunk 等同路由器','不能，仍需要正确的三层接口、地址与路由等配置','能，只要两台交换机同一品牌'],correct:1,why:'Trunk 是二层承载，不执行跨 VLAN 路由。SVI 是三层逻辑接口，不能与 VLAN 广播域本身混为一谈。'}
];

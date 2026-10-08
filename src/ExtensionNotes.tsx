import {useState} from 'react';
import {Fact,Source} from './AdvancedUI';
import ClassroomQuiz from './ClassroomQuiz';
type Notes={concepts:[string,string][];sources:[string,string][]};
const foa:[string,string]=['FOA：全反射与光纤导引','https://foa.org/tech/ref/basic/total_internal_reflection.html'];
const star:[string,string]=['Starlink：卫星技术','https://starlink.com/technology'];
const notes:Record<string,Notes>={
 reflection:{concepts:[['从边界条件理解导引','纤芯折射率大于包层。入射角从法线计算，满足 θ₁ > arcsin(n₂/n₁) 时发生全反射；等于临界角时是临界状态。'],['光线模型与波导模型','“来回反射”是很有用的几何近似。进一步学习时，需要用波导模式描述光场分布；包层中的场不简单等于零。']],sources:[foa,['FOA：光纤基础','https://foa.org/tech/ref/basic/fiber.html']]},
 structure:{concepts:[['单模与多模由波导条件决定','模式数量与纤芯尺寸、折射率分布、工作波长有关。不能仅由“看到了几条射线”定义真实模式，也不能只说单模就是光线直走。'],['模式、纤芯与波长不是一回事','一根单模光纤可用 WDM 承载多个波长。多芯光纤有多个空间分离的纤芯；多模光纤则在同一纤芯中支持多个空间模式。']],sources:[['FOA：单模与多模','https://foa.org/tech/ref/basic/fiber.html'],['FOA：色散与偏振模色散','https://foa.org/tech/ref/testing/test/CD_PMD.html']]},
 'sea-structure':{concepts:[['海缆是传输系统','海底部分包括光缆、中继器与分支单元，岸上还需要终端设备、登陆设施、馈电与地面网络连接。单独一根玻璃丝并不能构成完整跨洋通信系统。'],['深海与浅海保护策略不同','按水深、海床和外力风险选择缆型。铠装加强机械保护，但会增加重量；绝缘、抗拉、阻水和光传输分别由相应结构承担。']],sources:[['NEC / OCC：SC300 海缆结构（代表性产品，2010）','https://www.nec.com/en/global/techrep/journal/g10/n01/pdf/100105.pdf'],['NEC：海底中继器与分支单元','https://www.nec.com/en/global/techrep/journal/g10/n01/pdf/100102.pdf']]},
 'sea-laying':{concepts:[['从勘测到运维','路由工程、制造、装船、岸端作业、海上铺设、按需埋设和测试交付共同构成工程。施工可能分段进行，流程图不是一项项目的完整施工方案。'],['风险与保护方式匹配','近岸捕鱼、锚泊等活动可能影响线缆。埋深、铠装、路线回避和保护规则需结合环境选择，并不是所有海底都能或都要挖沟。']],sources:[['Global Marine：海缆安装','https://globalmarine.co.uk/services/cable-installation/'],['Global Marine：北海项目施工流程','https://globalmarine.co.uk/projects/tampnet-north-sea/']]},
 'global-map':{concepts:[['全球骨干与末端接入相互连接','海缆连接洲际与沿海网络，陆地光纤连接城市、数据中心和登陆站。无线、铜缆及光纤接入又把用户连接到这些骨干网络。'],['线路分布不等于实时流量分布','本地地图是自主绘制的教学通道，真实路线请查看外链地图。即使是真实地图，也不能仅凭线路粗细或数量判断容量、利用率、路由策略与网络韧性。教学光点不表示真实用户数据。']],sources:[['TeleGeography：全球海底光缆地图','https://www.submarinecablemap.com/'],['ITU：2025 年国际海缆韧性峰会','https://www.itu.int/en/mediacentre/Pages/PR-2025-02-27-submarine-cables-summit-nigeria.aspx'],['NEC：Petal 多芯海缆公告（2026-09-22）','https://www.nec.com/en/press/202609/global_20260922_01.html']]},
 satellite:{concepts:[['先区分代际，再讨论外形','外链实拍中的发射堆栈、V2 Mini 官方结构图和本地教学矢量图分别回答不同问题。不能把发射收拢状态当作在轨展开形态，也不能混用不同代际的尺寸和结构。'],['网络功能分布在多种部件上','射频相控阵面向用户和地面站；光学终端构成星间链路；太阳能、电推进与姿态控制支持卫星持续运行。']],sources:[star,['SpaceX：官方在轨影像来源','https://www.spacex.com/'],['Starlink：2025 Progress Report','https://starlink.com/public-files/starlinkProgressReport_2025.pdf']]},
 starlink:{concepts:[['低轨意味着持续移动与切换','相较远距离轨道，低轨缩短传播距离，但要靠星座、波束跟踪与切换维持服务。端到端时延还受到路由、排队、地面网络与服务器影响。'],['星间链路没有取消地面互联网','激光链路可以在太空转发数据，但访问地面互联网服务器仍需要合适的地面出口与网络互联。轨道图不能证明任何位置均可获准接入。']],sources:[star,['Starlink：2025 年系统进展','https://starlink.com/public-files/starlinkProgressReport_2025.pdf']]},
 aviation:{concepts:[['旅客接入的是机舱局域网','手机经 Wi-Fi 到机内接入点和路由系统，机外航空终端再与卫星通信。微信只是运行于这个网络之上的一个应用。'],['把关联与互联网可达性分开','连上机舱 Wi-Fi 仅证明本地连接的一部分。上游卫星、地面出口、IP 配置或门户授权异常，都可能导致无法访问互联网。']],sources:[['Starlink：航空服务','https://starlink.com/business/aviation'],['Qatar Airways：2026-01-07 航空应用案例','https://www.qatarairways.com/press-releases/en-WW/259315-qatar-airways-launches-world-s-first-starlink-equipped-boeing-787-and-completes-airbus-a350-starlink-rollout-connecting-over-11-millio/']]}
};
const commands=`R1> enable
R1# configure terminal
R1(config)# interface gigabitEthernet 0/0
R1(config-if)# ip address 192.168.10.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)# interface gigabitEthernet 0/1
R1(config-if)# ip address 10.0.0.1 255.255.255.252
R1(config-if)# no shutdown
R1(config-if)# exit
R1(config)# ip route 192.168.20.0 255.255.255.0 10.0.0.2
R1(config)# end

R2> enable
R2# configure terminal
R2(config)# interface gigabitEthernet 0/0
R2(config-if)# ip address 192.168.20.1 255.255.255.0
R2(config-if)# no shutdown
R2(config-if)# interface gigabitEthernet 0/1
R2(config-if)# ip address 10.0.0.2 255.255.255.252
R2(config-if)# no shutdown
R2(config-if)# exit
R2(config)# ip route 192.168.10.0 255.255.255.0 10.0.0.1
R2(config)# end

PC0> ipconfig
PC0> ping 192.168.20.10
PC0> tracert 192.168.20.10
R1# show ip interface brief
R1# show ip route
R1# show interfaces gigabitEthernet 0/1`;
export default function ExtensionNotes({lesson,medium}:{lesson:string;medium:'fiber'|'radio'}){
 const [tab,setTab]=useState('concepts'),[copy,setCopy]=useState('');const n=notes[lesson];
 if(!n)return null;
 return <section className="lesson-notes"><div className="notes-tabs" role="tablist" aria-label="本节学习资料">{[['concepts','原理与资料'],['pt','Packet Tracer 衔接'],['quiz','课堂提问']].map(([id,name])=><button role="tab" id={`extension-tab-${id}`} aria-selected={tab===id} aria-controls={`extension-panel-${id}`} key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{name}</button>)}</div><div className="notes-content" role="tabpanel" id={`extension-panel-${tab}`} aria-labelledby={`extension-tab-${tab}`}>
 {tab==='concepts'?<><div className="principle-grid">{n.concepts.map(([title,text])=><article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>{lesson==='global-map'&&<Fact title="前沿追踪 · 已公告，尚未投运">2026 年 9 月，NEC、Meta 与 Sumitomo 公告 Petal 多芯光纤跨大西洋项目，计划 2029 年投入服务。这是空间复用的发展案例；“多芯”与前一节讲的“多模”不同，不把计划容量当成今天已经可用的容量。</Fact>}<div className="source-note"><strong>课程对应</strong><span>{medium==='fiber'?'1-4 常用网络设备和传输介质 · 光纤；1-2 数据通信原理。':'1-4 无线介质；4-1 AccessPoint · 无线接入。'}{['sea-structure','sea-laying','global-map','satellite','starlink','aviation'].includes(lesson)?'本节是基础课知识的工程与前沿拓展。':''}</span><p>资料核对日期：2026-10-03。现行服务、项目计划与历史示例均以页面所标日期和来源为准。</p><ul className="source-links">{n.sources.map(([title,url])=><li key={url}><Source href={url}>{title}</Source></li>)}</ul></div></>:
 tab==='pt'?<div className="pt-layout"><div><h3>{medium==='radio'?'把“接入”与“上游网络”分开验证':'把“物理介质”与“网络连通”分开验证'}</h3><p>{medium==='radio'?'用机舱 Wi-Fi 和一条代表回传链路的路由连接，验证手机接入后的数据转发。':'先在原有光口实验中验证两台交换机的光纤连接，再用下面的两路由器实验理解跨网络连通。'}</p><ol><li>准备 2 台 2911 路由器 R1 / R2、1 台 PC、1 台 Server。无线扩展可用 AP-PT + 带无线网卡的终端代替 PC 的有线接入。</li><li>PC → R1 G0/0；R1 G0/1 ↔ R2 G0/1；R2 G0/0 → Server。选择兼容线缆；接口名按机房设备调整。</li><li>PC：192.168.10.10/24，网关 192.168.10.1；Server：192.168.20.10/24，网关 192.168.20.1。AP 与无线终端设置匹配的 SSID 和认证。</li><li>分别配置右侧两台路由器，确认链路就绪。在 PC 上 ping、tracert，再在 Simulation 模式观察 ARP / ICMP。</li><li>在 R1 的 G0/1 执行 shutdown，比较“局域网仍接通，但服务器不可达”；观察后 no shutdown 恢复。</li></ol><Fact title="PT 与本动画的分工">这条路由器间连接仅代表上游承载。PT 不能据此真实仿真全反射、海缆施工、轨道运动或星链激光路由。本页没有自动操作 PT，命令示例尚未在你的机房安装中实测。</Fact>{medium==='fiber'&&<a href="#/physical/fiber/signal">打开已有光口连接实验步骤 →</a>}</div><div><div className="code-actions"><button onClick={async()=>{try{await navigator.clipboard.writeText(commands);setCopy('已复制。输入时去掉设备提示符。');}catch{setCopy('可直接选中下方命令手动复制。');}}}>复制命令示例</button></div><p className="hint">R1 / R2 表示操作设备，提示符无须输入。真实设备名、端口与命令支持以 PT 版本为准。</p><pre><code>{commands}</code></pre><p role="status">{copy}</p><pre><code>{'R1# configure terminal\nR1(config)# interface gigabitEthernet 0/1\nR1(config-if)# shutdown\n! 此时先观察 PC 的连通性，再恢复\nR1(config-if)# no shutdown'}</code></pre></div></div>:
 null}<div hidden={tab!=='quiz'}><ClassroomQuiz lessonKey={`${medium}/${lesson}`}/></div>
 </div></section>
}

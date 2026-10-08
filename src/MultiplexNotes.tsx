import {useState} from 'react';
import {Fact,Source} from './AdvancedUI';
import ClassroomQuiz from './ClassroomQuiz';
const notes:Record<string,{concepts:[string,string][];sources:[string,string][]}>={
 fdm:{concepts:[['共用介质，各占一段频带','频分复用把不同信号放在不同频带，可在同一时间共同传输。接收端按频带选择，而不是等待轮到自己。'],['占用带宽、间隔与保护带','本例每路占 16 kHz，保护间隔为 8 kHz 时，三个频道跨度为 3×16+2×8=64 kHz。实际滤波器的过渡区域、信道特性与频谱规划必须一起考虑。'],['不同复用方式可以组合','复用描述如何共享资源，不限定某一种物理介质。实际网络常组合频率、时间等维度；本节先分别观察单个机制。']],sources:[['Cisco：时间与频率资源复用的工程应用','https://www.cisco.com/c/en/us/td/docs/cable/cbr/configuration/guide/b_docsis_31_layer2_cbr_xe16_9/time_and_frequency_division_multiplexing_configuration.html'],['Keysight：OFDM 子载波正交与频谱重叠','https://helpfiles.keysight.com/csg/89600B/Webhelp/Subsystems/wlan-ofdm/content/ofdm_basicprinciplesoverview.htm']]},
 tdm:{concepts:[['固定位置，还是按需分配','同步 TDM 按固定次序分配时隙，接收端依靠位置和同步识别用户。统计复用利用数据到达的不均匀性，按需求共享链路，需要相应标识与调度。'],['比较时必须使用同一条链路','本页两种方案使用相同载荷发送时间。统计复用的标识额外占用时间，不能只删除空位却忽略开销；所有用户繁忙时结果可能反过来。'],['排队与拥塞留给后续深入','本演示是一批数据同时就绪的简化模型。真实流量会不断到达；到达速率、服务速率与突发性会决定队列长度和等待时延。']],sources:[]},
 wdm:{concepts:[['把光学频率当作不同信道','合波器把多个波长的信号耦合到一根光纤，分波器再按波长分离。这个维度与空间模式、纤芯数不同。'],['与前面的单模和海缆联系起来','工作在相应单模波长范围的光纤可以同时承载多个波长。多波长共享物理段，因此需要同时考虑容量利用与公共故障风险。'],['从示意走向实际系统','工程中的 CWDM、DWDM 在波长 / 频率间隔和系统要求上不同。图中 1530/1550/1570 nm 仅是容易辨认的教学例子，不声称是某台设备的可配通道表。']],sources:[['Cisco：DWDM 技术概述','https://www.cisco.com/c/en/us/tech/optical/dense-wavelength-division-multiplexing-dwdm/index.html'],['Cisco：光学系统中合波器与分波器','https://www.cisco.com/c/en/us/td/docs/optical/15000r7_0/dwdm/planning/guide/70epg/d7ovw.html']]},
 cdm:{concepts:[['一个数据位变成多个码片','在本例中，用户发送 1 时使用分配码，发送 0 时使用反码；每位有四个更细的码片。码片速率与用户比特率不能混淆。'],['从叠加到相关','共享信道中逐码片相加。接收端用目标码逐片相乘，再求和除以码长。理想同步正交条件下，目标项保留、其他用户项抵消。'],['正交与同步是条件，不是万能保证','错用同一码破坏了用户区分。实际失步、多径和非理想码相关也可能影响分离；真实系统还要处理功率控制和信道估计。码序列不是密码学意义的加密密钥。']],sources:[['NI：扩频、解扩与 Walsh-Hadamard 码','https://www.ni.com/en/solutions/aerospace-defense/communications-navigation/understanding-spread-spectrum-for-communications.html']]}
};
const commands=`在两台 2960 交换机的 CLI 中分别查看：
enable
show interfaces status
show interfaces fastEthernet 0/24
show mac address-table

在 PC-A 的 Desktop → Command Prompt 中：
ipconfig
ping 192.168.50.21

在 PC-B 的 Desktop → Command Prompt 中：
ipconfig
ping 192.168.50.22`;
export default function MultiplexNotes({lesson}:{lesson:string}){
 const [tab,setTab]=useState('concepts'),[copy,setCopy]=useState('');const n=notes[lesson];
 return <section className="lesson-notes"><div className="notes-tabs" role="tablist" aria-label="本节学习资料">{[['concepts','原理与资料'],['pt','Packet Tracer 衔接'],['quiz','课堂提问']].map(([id,name])=><button role="tab" id={`mux-tab-${id}`} aria-selected={tab===id} aria-controls={`mux-panel-${id}`} className={tab===id?'active':''} onClick={()=>setTab(id)} key={id}>{name}</button>)}</div><div className="notes-content" role="tabpanel" id={`mux-panel-${tab}`} aria-labelledby={`mux-tab-${tab}`}>
 {tab==='concepts'?<><div className="principle-grid">{n.concepts.map(([title,text])=><article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div><div className="source-note"><strong>课程对应 · 1-2 数据通信原理 → 信道复用技术</strong><span>课件分别介绍频分、波分、时分和码分复用。本页按这四项展开；保护带实验、统计复用对照、四码片相关计算为补充。</span><p>资料核对：2026-10-03。动画放慢时间并简化物理过程；具体系统还需要满足带宽、同步、功率与器件条件。</p><ul className="source-links">{n.sources.map(([title,url])=><li key={url}><Source href={url}>{title}</Source></li>)}</ul></div></>:
 tab==='pt'?<div className="pt-layout"><div><h3>观察两路通信如何共享一条上联</h3><ol><li>放置两台 2960：S1、S2，各接两台 PC。PC-A / PC-B 接 S1 的 Fa0/1、Fa0/2；PC-A′ / PC-B′ 接 S2 的 Fa0/1、Fa0/2。</li><li>S1 Fa0/24 ↔ S2 Fa0/24 使用铜交叉线。PC 与交换机之间使用铜直通线；保留默认 VLAN。</li><li>四台 PC 依次设置 192.168.50.11、.12、.21、.22，掩码均为 255.255.255.0。同子网实验不需要网关。</li><li>等待链路与生成树就绪，执行右侧命令确认状态。先分别 ping 一次，完成 ARP 学习。</li><li>切到 Simulation，用 Add Simple PDU 分别创建 A → A′ 与 B → B′ 的 ICMP 流程。过滤 ARP / ICMP，逐步观察两路帧都经过 Fa0/24 上联。</li></ol><Fact title="共享上联，不等于模拟了四种物理复用">这里观察的是以太网帧对共享输出链路的使用，不把交换机调度冒充固定 TDM，也不把 MAC 地址、VLAN 或 TCP 端口当成 FDM / WDM / CDM。波长、频带和码片相关由上方动画展示。</Fact><p className="hint">PT 指引尚未在你的机房版本实测。端口名称及命令支持以实际型号为准；本页没有生成 .pkt 或自动操作 PT。</p></div><div><div className="code-actions"><button onClick={async()=>{try{await navigator.clipboard.writeText(commands);setCopy('已复制。中文标题只用于区分设备，不输入 CLI。');}catch{setCopy('可选中下方文字手动复制。');}}}>复制操作指引</button></div><pre><code>{commands}</code></pre><p role="status">{copy}</p><p className="hint">记录两路数据经过的端口。讨论：共享物理路径、逻辑通信关系、物理层复用，分别描述什么？</p></div></div>:
 null}<div hidden={tab!=='quiz'}><ClassroomQuiz lessonKey={`multiplex/${lesson}`}/></div>
 </div></section>;
}

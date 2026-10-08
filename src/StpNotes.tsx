import {useState} from 'react';
import ClassroomQuiz from './ClassroomQuiz';
import {Source} from './AdvancedUI';
import {STP_LINKS,STP_PRIORITIES,STP_SWITCHES} from './stpModel';
import type {StpSwitch} from './stpModel';
export const stpCommands=(sw:StpSwitch)=>`enable
configure terminal
hostname ${sw}
spanning-tree mode pvst
spanning-tree vlan 1 priority ${STP_PRIORITIES[sw]}
interface range fastEthernet 0/1 - 2
 switchport mode trunk
 switchport trunk native vlan 1
 switchport trunk allowed vlan 1
 spanning-tree vlan 1 cost 19
 no shutdown
exit
interface fastEthernet 0/10
 switchport mode access
 switchport access vlan 1
 spanning-tree portfast
 no shutdown
end
show spanning-tree vlan 1`;
const fault=`enable
configure terminal
interface fastEthernet 0/2
 shutdown
end
show spanning-tree vlan 1`;
const restore=`enable
configure terminal
interface fastEthernet 0/2
 no shutdown
end
show spanning-tree vlan 1`;
const changeRoot=`enable
configure terminal
spanning-tree vlan 1 priority 0
end
show spanning-tree vlan 1`;
function Commands({title,text}:{title:string;text:string}){const [status,setStatus]=useState('');return <div className="stp-command"><div className="code-actions"><strong>{title}</strong><button onClick={async()=>{try{await navigator.clipboard.writeText(text);setStatus('已复制这一段命令');}catch{setStatus('请选中命令手动复制');}}}>复制命令</button></div><pre><code>{text}</code></pre><small role="status">{status}</small></div>;}
export default function StpNotes(){const [tab,setTab]=useState('concepts'),[device,setDevice]=useState<StpSwitch>('S1');return <section className="lesson-notes"><div className="notes-tabs" role="tablist" aria-label="STP 学习资料">{[['concepts','原理与课程对应'],['pt','Packet Tracer 衔接'],['quiz','课堂提问']].map(([id,label])=><button key={id} id={`stp-tab-${id}`} role="tab" aria-controls={`stp-panel-${id}`} aria-selected={tab===id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}</button>)}</div><div className="notes-content" role="tabpanel" id={`stp-panel-${tab}`} aria-labelledby={`stp-tab-${tab}`}>
 {tab==='concepts'?<><div className="principle-grid"><article><h3>先找出环路的三个后果</h3><p>广播循环占用链路；目的主机可能收到重复帧；同一源 MAC 从不同端口返回会使学习位置反复变化。这里用广播做主线，未知单播的泛洪也可能受环路影响。</p></article><article><h3>物理连接保留，逻辑转发成树</h3><p>本例所有设备处于同一 VLAN 1。S3 Fa0/2 阻塞时不转发普通数据，但物理线路仍通，仍处理 BPDU。生成树控制的是相应实例的端口状态，不是关闭整台交换机。</p></article><article><h3>选根与选端口分开看</h3><p>先选最小桥 ID 为根，再比较到根的累计路径代价。本例 S2、S3 都直连 S1，代价均为 19；下方网段再比较桥 ID，S2 胜出。更复杂拓扑还可能比较端口 ID，本动画未设置那种平局。</p></article><article><h3>STP、RSTP、链路聚合各有作用</h3><p>本节采用传统 STP 状态过程。RSTP 将部分状态归为 Discarding，并通过不同机制加快收敛，不能把本节等待过程直接当成它的定时器。链路聚合会把多条物理链路组成逻辑链路，可在五层目录的“链路聚合 EtherChannel”中继续学习。</p></article></div><div className="source-note"><strong>课程对应</strong><p>《计算机网络2026.3》课件与阅读材料“5-5. 网络冗余和信息保护”：生成树协议、路径回环的三个问题、环路消除和冗余链路。选根优先级、代价 19 和具体端口状态是为理解课件补充的可验证实验。</p><ul className="source-links"><li><Source href="https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960/software/release/15-0_2_se/configuration/guide/scg2960/swstp.html">Cisco Catalyst 2960：STP、端口状态、路径代价与配置命令</Source></li></ul><p>资料核对：2026-10-05。模型的 MAC 地址仅用于解释规则；PT 设备 MAC 由软件分配，实验用不同优先级确保选根与端口选择可复现。</p></div></>:tab==='pt'?<div className="pt-layout"><div><h3>三台 2960：亲眼看到橙色端口接班</h3><ol className="flow-procedure"><li>放置 S1、S2、S3 三台 2960，按下表连成三角形。A 接 S2 Fa0/10，B 接 S3 Fa0/10。主机用直通线，交换机之间用交叉线或 PT 自动选线。</li><li>A 设置 192.168.1.11，B 设置 192.168.1.12，掩码均为 255.255.255.0，默认网关留空。两台主机在 VLAN 1，不需要三层路由。</li><li>切换右侧设备选项，在每台交换机分别粘贴对应基础配置。只在连接普通主机的 Fa0/10 使用 PortFast，交换机之间的接口保留正常生成树处理。</li></ol><table className="stp-port-table"><thead><tr><th>连线</th><th>一端</th><th>另一端</th></tr></thead><tbody>{STP_LINKS.map(l=><tr key={l.id}><td>{l.a}—{l.b}</td><td>{l.a} {l.ap}</td><td>{l.b} {l.bp}</td></tr>)}</tbody></table><ol className="flow-procedure" start={4}><li>等待收敛后，用 <code>show spanning-tree vlan 1</code> 核对：S1 为根；S2 Fa0/1、S3 Fa0/1 为 Root FWD；S2 Fa0/2 为 Desg FWD；S3 Fa0/2 应为 Altn BLK。根桥的这两个连接端口均为 Desg FWD。</li><li>A 的命令行运行 <code>ping 192.168.1.12</code>，等待 ARP 完成后应可通信。第一次 ping 可能受 ARP 或收敛影响，可再次测试。</li><li>只在 S1 执行“断开 S1—S3”，然后在 S3 反复查看 <code>show spanning-tree vlan 1</code>。观察 Fa0/2 从不转发，经过侦听、学习，最终成为 Root FWD；到根代价从 19 变为 38。</li><li>收敛过程中重复 ping 对照中断和恢复。在 Simulation 模式选择 STP、ARP、ICMP 过滤，用 Capture/Forward 观察控制消息和数据。网页的秒数经过压缩，不用于预测实际丢包次数。</li><li>在 S1 恢复接口，等待原树稳定；再只在 S2 执行“改由 S2 当根”。稳定后 S3 Fa0/1 阻塞，Fa0/2 为 Root FWD。检查根桥变化与实际数据路径。</li></ol><div className="teaching-note"><strong>为什么输出的 Priority 可能是 4097？</strong><div>本例配置优先级为 4096，扩展系统 ID 为 VLAN 1，所以输出可显示 4096 + 1 = 4097。S2、S3 同理；所有设备属于同一 VLAN，比较顺序不变。</div></div><p className="hint">按 Cisco 2960 文档编写，尚未在你的 Packet Tracer 版本中实测。若版本不支持 interface range，可分别配置 Fa0/1、Fa0/2。PortFast 提示与端口状态显示文字可能因版本不同而变化。</p></div><div><label className="stp-device-select">准备配置哪台设备？<select aria-label="PT 配置设备" value={device} onChange={e=>setDevice(e.target.value as StpSwitch)}>{STP_SWITCHES.map(sw=><option key={sw}>{sw}</option>)}</select></label><Commands key={device} title={`${device}：基础配置`} text={stpCommands(device)}/><Commands title="只在 S1：断开 S1—S3" text={fault}/><Commands title="只在 S1：恢复 S1—S3" text={restore}/><Commands title="恢复原拓扑后，只在 S2：改由 S2 当根" text={changeRoot}/></div></div>:<ClassroomQuiz lessonKey="stp/tree"/>}
 </div></section>;}

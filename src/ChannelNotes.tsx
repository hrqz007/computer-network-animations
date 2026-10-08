import {useState} from 'react';
import ClassroomQuiz from './ClassroomQuiz';
import {Source} from './AdvancedUI';
export function channelCommands(device:'S1'|'S2',scheme:'static'|'lacp'){
 const mode=scheme==='static'?'on':device==='S1'?'active':'passive';
 return `enable
configure terminal
hostname ${device}
spanning-tree mode pvst
spanning-tree vlan 1 priority ${device==='S1'?4096:8192}
port-channel load-balance src-mac
interface range fastEthernet 0/1 - 2
 shutdown
 switchport mode trunk
 switchport trunk native vlan 1
 switchport trunk allowed vlan 1
 speed 100
 duplex full
 channel-group 1 mode ${mode}
exit
interface port-channel 1
 switchport mode trunk
 switchport trunk native vlan 1
 switchport trunk allowed vlan 1
 no shutdown
exit
interface range fastEthernet 0/1 - 2
 no shutdown
exit
interface range fastEthernet 0/10 - 12
 switchport mode access
 switchport access vlan 1
 spanning-tree portfast
 no shutdown
end
show etherchannel summary
show interfaces port-channel 1
show interfaces trunk
show spanning-tree vlan 1
show etherchannel load-balance`;
}
const memberFault=`enable
configure terminal
interface fastEthernet 0/1
 shutdown
end
show etherchannel summary
show interfaces port-channel 1`;
const memberRestore=`enable
configure terminal
interface fastEthernet 0/1
 no shutdown
end
show etherchannel summary`;
function Commands({title,text}:{title:string;text:string}){const [status,setStatus]=useState('');return <div className="channel-command"><div className="code-actions"><strong>{title}</strong><button onClick={async()=>{try{await navigator.clipboard.writeText(text);setStatus('已复制这一段命令');}catch{setStatus('请选中命令手动复制');}}}>复制命令</button></div><pre><code>{text}</code></pre><small role="status">{status}</small></div>;}
export default function ChannelNotes(){const [tab,setTab]=useState('concepts'),[device,setDevice]=useState<'S1'|'S2'>('S1'),[scheme,setScheme]=useState<'static'|'lacp'>('static');return <section className="lesson-notes"><div className="notes-tabs" role="tablist" aria-label="链路聚合学习资料">{[['concepts','原理与课程对应'],['pt','Packet Tracer 衔接'],['quiz','课堂提问']].map(([id,label])=><button key={id} role="tab" id={`channel-tab-${id}`} aria-controls={`channel-panel-${id}`} aria-selected={tab===id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}</button>)}</div><div className="notes-content" role="tabpanel" id={`channel-panel-${tab}`} aria-labelledby={`channel-tab-${tab}`}>
 {tab==='concepts'?<><div className="principle-grid"><article><h3>“带宽增加”指什么？</h3><p>两条百兆成员的理想单向总容量为 200 Mbit/s，需要多组流量分布到不同成员才能充分利用。同一组固定选择字段的流量通常只走一条成员，不能直接把容量总和当作单次下载速度。</p></article><article><h3>“分担”不保证恰好平均</h3><p>按源 MAC、目的 MAC 或其他支持字段选择成员，会影响分配结果。同一个目的 MAC 在只按目的地址选择时落入同一成员；不同输入也可能碰巧选择同一成员。LACP 负责协商成员，不负责按每条线的实时繁忙程度逐包轮流发。</p></article><article><h3>与 STP 合作，仍然需要防环</h3><p>正确形成二层 EtherChannel 后，STP 把 Po1 视为一个逻辑接口，成员共同服务于该接口。如果整个网络还有其他冗余路径，STP 仍可能阻塞整个逻辑接口。本例仅有两台交换机间的一组聚合。</p></article><article><h3>断线后还有条件</h3><p>这里至少一条成员正常且没有最小成员数限制，因此故障处理后通道可继续工作。检测、成员重选或网络收敛可能带来中断、丢帧。剩余成员的容量也下降，协议本身不补发已丢失的数据。</p></article></div><div className="source-note"><strong>课程对应</strong><p>《计算机网络2026.3》课件“5-5. 网络冗余和信息保护”及附录“配置聚合链路”“PortChannel-1”：成员加入 channel-group、逻辑 Port-channel、带宽与冗余。本节先做二层聚合；附录里的 no switchport、IP 地址和三层通道口留在网络层衔接。通道数量、成员上限依设备型号和软件而定，不把课件示例范围当作通用标准。</p><p>教学模型为了便于复算，使用 MAC 末字节数值对当前有效成员数取余；A、B、C 为人为选择的示例地址。真实设备的哈希、成员故障后的重映射和具体吞吐量可能不同。算例只解释容量与分配的关系。</p><ul className="source-links"><li><Source href="https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960/software/release/15-0_2_se/configuration/guide/scg2960/swethchl.html">Cisco Catalyst 2960：EtherChannel、LACP、配置与负载分担</Source></li></ul><p>文档核对：2026-10-06。具体 Packet Tracer 设备支持的命令，以本机版本的 ? 帮助和实际输出为准。</p></div></>:tab==='pt'?<div className="pt-layout"><div><h3>两台 2960，先看到 Po1，再断一条成员</h3><ol className="flow-procedure"><li>新建两台 2960，命名为 S1、S2。Fa0/1 ↔ Fa0/1、Fa0/2 ↔ Fa0/2，形成两条百兆链路；交换机间使用交叉线或 PT 自动选线。A/B/C 接 S1 Fa0/10、11、12，D 接 S2 Fa0/10。</li><li>通过主机 Desktop → IP Configuration 设置下表地址，掩码均为 255.255.255.0，网关留空。D 可用服务器或 PC；本次 PT 实验验证成员、逻辑口与连通性，网页容量算例忽略主机接入瓶颈。</li></ol><table className="channel-table"><thead><tr><th>设备</th><th>接入口</th><th>IPv4</th></tr></thead><tbody>{[['A','S1 Fa0/10','192.168.1.11'],['B','S1 Fa0/11','192.168.1.12'],['C','S1 Fa0/12','192.168.1.13'],['D','S2 Fa0/10','192.168.1.100']].map(row=><tr key={row[0]}>{row.map(cell=><td key={cell}>{cell}</td>)}</tr>)}</tbody></table><ol className="flow-procedure" start={3}><li>先选择“课件方案：静态 on”，分别在 S1、S2 执行对应基础配置。配置过程中先暂时 shutdown 成员，完成后重新开启；等待两端配置完成和端口收敛。</li><li>在两端查看 <code>show etherchannel summary</code>：常见结果为 <code>Po1(SU)</code>，Fa0/1、Fa0/2 都带 <code>(P)</code>。再看 Trunk 与 STP 输出，关注逻辑口 Po1，而不只数绿色的物理连线。</li><li>A、B、C 分别执行 <code>ping 192.168.1.100</code>。首次可能需要 ARP，等待就绪后重试。一次 ping 不能测出聚合带宽，也不能证明两条成员分担得均匀。</li><li>只在 S1 执行“断开成员 1”，重复查看两端成员与 Po1 状态，重新 ping D。故障处理后只剩 Fa0/2 在组内转发，Po1 通常保持可用；故障瞬间可能丢包。</li><li>在 S1 执行“恢复成员 1”，等待重新加入，再检查两条成员是否都显示 (P)。</li><li>补充 LACP 时，新建一个同拓扑实验副本，选择“补充方案：LACP”，分别配置 S1 active 和 S2 passive。基础配置用于新建实验，不能直接混贴到已建立的静态通道上。summary 的 Protocol 应出现 LACP。</li></ol><div className="channel-expected"><strong>读懂常见标记</strong><br/><code>S</code>：二层通道；<code>U</code>：通道在使用；<code>P</code>：该物理端口已捆绑入通道。断线成员可能显示 Down / D；实际文字依版本而定。这是预期结果说明，页面未伪造 PT 执行输出。</div><div className="teaching-note"><strong>把网页分配与真实设备区分开</strong><div><code>show etherchannel load-balance</code> 查看设备使用哪些字段。PT 中主机的实际 MAC 不同，不能照搬网页里“A 一定走成员 1”。网页算例和 PT 的成员状态各自验证不同问题。</div></div><p className="hint">命令依据 Cisco 2960 文档整理，尚未在你的 Packet Tracer 版本实测。若不支持 interface range，分别配置两个接口。PortFast 仅用于本实验连接普通主机的接入口。三层聚合的 no switchport 不用于本节。</p></div><div><label className="channel-device">选择新建实验的配置方案<select aria-label="聚合配置方案" value={scheme} onChange={e=>setScheme(e.target.value as 'static'|'lacp')}><option value="static">课件方案：静态 on</option><option value="lacp">补充方案：LACP</option></select></label><label className="channel-device">准备配置哪台交换机？<select aria-label="聚合配置设备" value={device} onChange={e=>setDevice(e.target.value as 'S1'|'S2')}><option>S1</option><option>S2</option></select></label><Commands key={`${scheme}-${device}`} title={`${device} · ${scheme==='static'?'静态 on':device==='S1'?'LACP active':'LACP passive'}`} text={channelCommands(device,scheme)}/><Commands title="只在 S1：断开成员 1" text={memberFault}/><Commands title="只在 S1：恢复成员 1" text={memberRestore}/></div></div>:<ClassroomQuiz lessonKey="etherchannel/bundle"/>}
 </div></section>;}

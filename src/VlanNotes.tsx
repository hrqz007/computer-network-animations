import {useState} from 'react';
import ClassroomQuiz from './ClassroomQuiz';
import {Source} from './AdvancedUI';
export const VLAN_COMMANDS=`enable
configure terminal
vlan 10
 name CLASS10
exit
vlan 20
 name CLASS20
exit
interface fastEthernet 0/1
 switchport mode access
 switchport access vlan 10
 no shutdown
exit
interface fastEthernet 0/5
 switchport mode access
 switchport access vlan 20
 no shutdown
exit
interface fastEthernet 0/24
 switchport mode trunk
 switchport trunk native vlan 1
 switchport trunk allowed vlan 10,20
 no shutdown
end
show vlan brief
show interfaces trunk
show interfaces fastEthernet 0/24 switchport
show mac address-table dynamic`;
const fault=`enable
configure terminal
interface fastEthernet 0/24
 switchport trunk allowed vlan remove 20
end
show interfaces trunk`;
const fix=`enable
configure terminal
interface fastEthernet 0/24
 switchport trunk allowed vlan add 20
end
show interfaces trunk`;
function Commands({title,text}:{title:string;text:string}){const [status,setStatus]=useState('');return <div className="vlan-command"><div className="code-actions"><strong>{title}</strong><button onClick={async()=>{try{await navigator.clipboard.writeText(text);setStatus('已复制这一段命令');}catch{setStatus('请选中命令手动复制');}}}>复制命令</button></div><pre><code>{text}</code></pre><small role="status">{status}</small></div>;}
export default function VlanNotes(){const [tab,setTab]=useState('concepts');return <section className="lesson-notes"><div className="notes-tabs" role="tablist" aria-label="本节学习资料">{[['concepts','原理与课程对应'],['pt','Packet Tracer 衔接'],['quiz','课堂提问']].map(([id,title])=><button key={id} id={`vlan-tab-${id}`} role="tab" aria-controls={`vlan-panel-${id}`} aria-selected={tab===id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{title}</button>)}</div><div className="notes-content" role="tabpanel" id={`vlan-panel-${tab}`} aria-labelledby={`vlan-tab-${tab}`}>
 {tab==='concepts'?<><div className="principle-grid"><article><h3>广播不会因共用 Trunk 而串组</h3><p>交换机在 VLAN 内转发广播。802.1Q 标签帮助对端识别 VLAN，目的 MAC 仍是广播地址。标签不是加密，也不会替主机生成路由。</p></article><article><h3>VLAN 和 interface vlan 要分清</h3><p>课程《5-3. VLAN》同时讲二层分组与三层交换。本节先演示二层 VLAN；课件中配置 IP 的 interface vlan 对应 SVI。创建二层 VLAN、把接入口加入 VLAN，不要求先给 SVI 配置 IP。</p></article><article><h3>接入口、允许列表都要对照</h3><p>两端创建 VLAN、设置正确的 Access VLAN、配置 Trunk 并放行相应 VLAN，才能形成所需路径。show vlan brief 主要看 VLAN 和接入口；Trunk 状态与允许列表另用 show interfaces trunk 核对。</p></article><article><h3>标签有适用条件</h3><p>本例 native VLAN 两端都为 1，因此 10 和 20 在 Trunk 上带标签。传统默认情况下 native VLAN 的流量通常不带标签；本课不演示 native VLAN 不匹配或语音 VLAN。</p></article></div><div className="source-note"><strong>课程对应</strong><p>《计算机网络2026.3》课件“5-3. VLAN”：VLAN 的广播隔离、端口分配、二层交换机配置；附录“配置 VLAN”“VLAN-1”“VLAN-2”：vlan、switchport access vlan、show vlan brief。跨交换机 Trunk 是衔接这些内容的补充实验。沿用 VLAN 10/20；三层 SVI 与路由留到网络层。</p><ul className="source-links"><li><Source href="https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960/software/release/15-0_2_ez/configuration/guide/scg_2960/swvlan.html">Cisco Catalyst 2960：VLAN、Access、Trunk 与 native VLAN</Source></li></ul><p>命令资料核对：2026-10-05。动画为教学模型，不会自动操作 Packet Tracer。</p></div></>:tab==='pt'?<div className="pt-layout"><div><h3>两台 2960，验证同 VLAN 跨交换机通信</h3><ol className="flow-procedure"><li>新建 S1、S2 两台 2960。A 接 S1 Fa0/1，C 接 S1 Fa0/5；B 接 S2 Fa0/1，D 接 S2 Fa0/5。S1 Fa0/24 连接 S2 Fa0/24；主机用直通线，交换机间可用交叉线或 PT 自动选线。等待端口就绪。</li><li>在两台交换机上分别执行同一份“基础配置”。本实验不配置 SVI 地址、不启用路由，也不把 Trunk 当成三层口。</li><li>主机通过 Desktop → IP Configuration 设置下表地址，掩码均为 255.255.255.0，默认网关留空。D 可以使用 PC 代替图片中的服务器。</li></ol><table className="vlan-ip-table"><thead><tr><th>主机</th><th>VLAN</th><th>IPv4</th></tr></thead><tbody>{[['A','10','192.168.10.11'],['B','10','192.168.10.12'],['C','20','192.168.20.21'],['D','20','192.168.20.22']].map(row=><tr key={row[0]}>{row.map(value=><td key={value}>{value}</td>)}</tr>)}</tbody></table><ol className="flow-procedure" start={4}><li>A 的命令行执行 <code>ping 192.168.10.12</code>；C 执行 <code>ping 192.168.20.22</code>。等待 ARP 与端口就绪后，两组应能各自通信。</li><li>为了看到广播，可从尚未发起通信的主机开始，或在主机命令行用受支持的 <code>arp -d</code> 清 ARP 表。进入 Simulation，保留 ARP/ICMP 过滤，用 Capture/Forward 逐步观察 ARP 请求：A 的请求到 B，不到 C、D；C 的请求到 D，不到 A、B。ARP 请求是广播，随后 ICMP 通常是单播。</li><li>在 S1 执行“只挡住 VLAN 20”。A→B 应仍通，C→D 失败。执行“恢复 VLAN 20”再比较；也可以在 S2 做同样的对照。不要只用 show vlan brief 判断 Trunk。</li><li>端口分错组对照：把 S2 Fa0/1 的 Access VLAN 改为 20。A→B 不通；若要用 ping 验证 B 加入 20 后的通信，还要把 B 的 IP 改到 192.168.20.0/24 中不重复的地址。网页动画只跟踪二层广播，不模拟主机 IP 协议栈。</li></ol><div className="teaching-note"><strong>标签不一定在所有 PT 视图都可见</strong><div>在 PDU Details 中检查进出帧与 802.1Q 信息；具体字段展示取决于 PT 版本。若未显示标签，用两端 Trunk 输出和广播出口共同验证，不把“没有显示”当成没有标签。</div></div><p className="hint">按 Cisco 2960 命令编写，未在你的机房 PT 版本实测。2960 使用 802.1Q，不需要 switchport trunk encapsulation dot1q。若命令不支持，使用设备的 ? 帮助；本页不提供虚构的 PT 执行截图或 .pkt 文件。</p></div><div><Commands title="S1、S2 分别执行：基础配置" text={VLAN_COMMANDS}/><Commands title="只在 S1 执行：挡住 VLAN 20" text={fault}/><Commands title="只在 S1 执行：恢复 VLAN 20" text={fix}/></div></div>:<ClassroomQuiz lessonKey="vlan/isolation"/>}
 </div></section>;}

import {useState} from 'react';


import {ArtSprite} from './StoryArt';
import {Label} from './StoryVisuals';
const gatewayCommands=`enable
configure terminal
hostname G
ip routing
interface fastEthernet 0/1
 no switchport
 ip address 192.168.1.126 255.255.255.128
 no ip proxy-arp
 no shutdown
exit
interface fastEthernet 0/2
 no switchport
 ip address 192.168.1.254 255.255.255.128
 no ip proxy-arp
 no shutdown
end
show ip interface brief
show ip route
show ip interface fastEthernet 0/1`;
const hostCommands=`ipconfig
ping 192.168.1.20
ping 192.168.1.126
ping 192.168.1.200`;
const accessCommands=(device:string)=>`enable
configure terminal
hostname ${device}
interface range fastEthernet 0/1 - 2
 switchport mode access
 switchport access vlan 1
 spanning-tree portfast
 no shutdown
exit
interface fastEthernet 0/24
 switchport mode access
 switchport access vlan 1
 no shutdown
end
show interfaces status`;
function CommandBox({title,code}:{title:string;code:string}){const [status,setStatus]=useState('');return <div className="ip-command"><div><strong>{title}</strong><button onClick={async()=>{try{await navigator.clipboard.writeText(code);setStatus('已复制命令');}catch{setStatus('请选中下方命令手动复制');}}}>复制命令</button></div><pre><code>{code}</code></pre><small role="status">{status}</small></div>;}
function PtTopology(){return <div className="ip-pt-topology"><svg viewBox="0 0 1060 290" role="img" aria-label="Packet Tracer 物理接线：A、B 连接 S1，S1 与 S2 分别连接三层交换机 G 的 Fa0/1 和 Fa0/2，D 连接 S2"><rect x="12" y="12" width="420" height="260" rx="22" fill="#e7f1e7"/><rect x="671" y="12" width="377" height="260" rx="22" fill="#f7efde"/><Label x={223} y={42} size={20}>192.168.1.0/25</Label><Label x={865} y={42} size={20}>192.168.1.128/25</Label><path d="M130 103H207L268 155M130 221H207L268 155M356 155H462M600 155H716M810 155H920" stroke="#83a796" strokeWidth="4" fill="none"/><ArtSprite art="studentA" x={30} y={60} w={105} h={80}/><Label x={81} y={158} size={15}>A · .10</Label><ArtSprite art="studentB" x={30} y={164} w={105} h={80}/><Label x={81} y={262} size={15}>B · .20</Label><ArtSprite art="switch" x={244} y={113} w={122} h={80}/><Label x={303} y={220} size={17}>S1 · 2960</Label><ArtSprite art="switch" x={461} y={109} w={148} h={91}/><Label x={535} y={230} size={18}>G · 3560</Label><Label x={535} y={255} size={15}>启用三层转发</Label><ArtSprite art="switch" x={709} y={115} w={122} h={80}/><Label x={771} y={220} size={17}>S2 · 2960</Label><ArtSprite art="server" x={917} y={98} w={88} h={101}/><Label x={962} y={225} size={15}>D · .200</Label><Label x={414} y={92} size={13}>Fa0/24 ↔ G Fa0/1</Label><Label x={659} y={92} size={13}>G Fa0/2 ↔ Fa0/24</Label><Label x={420} y={186} size={13}>网关 .126</Label><Label x={658} y={186} size={13}>网关 .254</Label></svg></div>;}
export default function IpGatewayPt(){const [device,setDevice]=useState('G');const commands=device==='G'?gatewayCommands:device==='A'?hostCommands:accessCommands(device);return <><h3>本节实验：用课件的三层路由口连接两个 /25</h3><PtTopology/><p>另建上图拓扑：2 台 2960（S1、S2）与 1 台 3560（三层交换机 G）。A、B 接 S1 Fa0/1、Fa0/2；D 接 S2 Fa0/1；S1 Fa0/24 接 G Fa0/1，S2 Fa0/24 接 G Fa0/2。PC 到交换机可用直通线，交换机间可用 PT 自动选线。S1 与 S2 不直接相连；两个 VLAN 1 属于被三层接口分开的二层网络。</p>
 <div className="pt-layout"><div><table className="ip-table"><thead><tr><th>主机</th><th>IPv4 / 掩码</th><th>默认网关</th></tr></thead><tbody>{[['A','192.168.1.10','192.168.1.126'],['B','192.168.1.20','192.168.1.126'],['D','192.168.1.200','192.168.1.254']].map(([name,address,gateway])=><tr key={name}><td>{name}</td><td>{address}<br/><small>255.255.255.128</small></td><td>{gateway}</td></tr>)}</tbody></table><ol className="flow-procedure"><li>在三台交换机分别执行下拉列表中的配置。G 必须是支持三层路由的 3560；2960 用作 S1/S2 接入交换机。</li><li>执行 <code>show ip interface brief</code>，G 的两个接口应为 up/up，地址分别为 .126 和 .254。<code>show ip route</code> 应能看到两个 /25 的直连路由；这两个网络不需要再写静态路由。</li><li>按表配置主机，在 A 依次 ping B、左侧网关、D。等待接口收敛，第一次可能因 ARP 未完成超时，应重试并结合 Simulation 查看。</li><li>只清空 A 的默认网关：同网的 B 仍应可达，异网 D 在本实验条件下不可达。恢复 A 的网关 .126 后重试。</li><li>再只把 A 的网关错填为 .254，它不在 A 的 .0/25 内。若 PT 拒绝保存，这就是配置错误的证据；若允许保存，结合 ARP 与 ping 观察，随后恢复 .126。</li><li>可用 Simulation 筛选 ARP 与 ICMP，观察同网请求和异网请求的差别。下一节会单独展开“下一跳 IP 如何对应到 MAC”。</li></ol><p className="hint">命令按课件及 Cisco 文档整理，尚未在你的 PT 版本实测。为使实验条件明确，G 两个路由口关闭代理 ARP；若该版本不支持此命令，请记录差异，不用“错误配置竟然能 ping 通”反推地址规划正确。若 interface range 不支持，分别配置接口。以下描述是预期现象，并非已运行的 PT 输出。</p></div><div><label className="ip-command-select">准备配置或检查的设备<select aria-label="IP 实验命令设备" value={device} onChange={e=>setDevice(e.target.value)}><option value="G">G · 三层交换机 3560</option><option value="S1">S1 · 接入交换机 2960</option><option value="S2">S2 · 接入交换机 2960</option><option value="A">A · PC 命令提示符</option></select></label><CommandBox key={device} title={device==='A'?'A · 查看与测试':`${device} · 新建实验配置`} code={commands}/></div></div>
 </>;}
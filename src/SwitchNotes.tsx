import {useState} from 'react';
import {Fact,Source} from './AdvancedUI';
import ClassroomQuiz from './ClassroomQuiz';
const commands=`PC-A：Desktop → Command Prompt（先做连通与 ARP 预热）
ipconfig /all
ping 192.168.1.2
arp -a

PC-B、PC-C：记录各自实际 MAC 地址
ipconfig /all

S1：CLI（新建实验拓扑）
enable
show mac address-table dynamic
show interfaces status
clear mac address-table dynamic
show mac address-table dynamic

在 Simulation 里发送一次 A → B 的 Simple PDU，逐事件观察。
每次帧进入 S1 后，在 CLI 查看：
show mac address-table dynamic

观察老化参数（命令支持取决于 PT 版本）：
show mac address-table aging-time`;
export default function SwitchNotes(){
 const [tab,setTab]=useState('concepts'),[copy,setCopy]=useState('');
 return <section className="lesson-notes"><div className="notes-tabs" role="tablist" aria-label="本节学习资料">{[['concepts','原理与资料'],['pt','Packet Tracer 衔接'],['quiz','课堂提问']].map(([id,title])=><button role="tab" key={id} id={`switch-tab-${id}`} aria-controls={`switch-panel-${id}`} aria-selected={tab===id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{title}</button>)}</div><div className="notes-content" role="tabpanel" id={`switch-panel-${tab}`} aria-labelledby={`switch-tab-${tab}`}>
 {tab==='concepts'?<><div className="principle-grid"><article><h3>学源地址，按目的地址转发</h3><p>帧从哪个端口进入，就说明源 MAC 可以从该端口到达。目的 MAC 用来查表决定出口；它不能证明目的主机也在入端口一侧。表项属于特定 VLAN，不是 IP 路由，也不是主机的 ARP 缓存。</p></article><article><h3>泛洪不会改写目的 MAC</h3><p>未知单播发往同一 VLAN 中除入端口外的可转发端口。复制的是同一帧，目的 MAC 保持不变。广播帧的目的地址才是 FF:FF:FF:FF:FF:FF。普通网卡收到其他主机的单播副本会丢弃。</p></article><article><h3>一个端口可以学到多个 MAC</h3><p>同端口场景用 Hub 表示共享网段。A 和 B 的帧都可从 Fa0/1 进入 S1，所以两个 MAC 能映射到同一个端口。目的也在入端口一侧时，S1 不必把帧转发回来；A、B 已经在共享网段内通信。</p></article><article><h3>表项需要持续更新</h3><p>本例收到源主机的新帧时刷新对应动态项，静默达到 300 s 后删除。老化后目的项缺失，下一帧可能再次泛洪。教学时钟只在帧之间推进，播放速度不表示设备计时；真实设备还可能有控制或静态表项。</p></article></div><div className="source-note"><strong>课程对应</strong><span>2-3. 组建基础局域网 → 交换机组网、MAC 地址表、自学习、生存期及组网实验；附录《MAC 地址表》→ A/B/C 发帧和接收判断。沿用附录 Fa0/1、Fa0/2、Fa0/5；同端口与老化对照为补充。</span><ul className="source-links"><li><Source href="https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960/software/release/15-0_2_se/configuration/guide/scg2960/swadmin.html">Cisco Catalyst 2960：MAC 表学习、同端口过滤、老化和命令</Source></li></ul></div></>:tab==='pt'?<div className="pt-layout"><div><h3>先保留 ARP，再清交换机表，观察未知单播</h3><ol className="flow-procedure"><li>新建 1 台 2960（S1）和 3 台 PC，直通线连接 A → Fa0/1、B → Fa0/2、C → Fa0/5。保持默认 VLAN 1，等待链路就绪。</li><li>分别配置 192.168.1.1、192.168.1.2、192.168.1.3，掩码均为 255.255.255.0。同子网实验不需要默认网关。用 ipconfig /all 记录真实 MAC，不能照抄动画中的示例地址。</li><li>先从 A ping B，使主机完成 ARP；用 arp -a 检查。然后只在 S1 清除动态 MAC 表，不清主机的 ARP 缓存。</li><li>切到 Simulation，保留 ARP / ICMP 事件过滤，发送 A → B 的 Simple PDU。用 Capture/Forward 逐事件前进，先观察回显请求进入 S1，再检查表项。</li><li>若请求帧到达 S1 时 B 尚未学习，应看到未知单播向 B、C 的端口泛洪；C 丢弃不属于自己的副本。待 B 的回应进入，S1 学到 B，并查到 A 的端口。后续 A → B 可定向转发。</li><li>若首先看到 ARP 请求，它本来就是广播帧：说明主机缓存未命中。先完成预热再清 S1 的表，不把 ARP 广播当成未知单播。其他背景帧也可能影响实验表项，逐项核对 PC 的 MAC。</li><li>同端口拓展：把 A、B 接在一个 Hub 上，Hub 上联 S1 的 Fa0/1，C 保留 Fa0/5。先让 B 发帧供 S1 学习，再观察 A → B 在共享网段内到达，S1 不向 C 转发。</li></ol><Fact title="观察帧的顺序比一次 ping 的结果更重要">ping 成功只能说明相应通信成功。要理解学习与转发，需要记录帧进入前后的 MAC 表，并检查这一帧的源、目的地址和实际出端口。</Fact><p className="hint">课件使用 show mac-address-table / clear mac-address-table 等写法。此处给出 Cisco 文档中的 show mac address-table dynamic / clear mac address-table dynamic；具体写法与 aging-time 支持以 PT 内的 ? 帮助为准。未在你的机房 PT 版本实测，本页没有自动执行命令或生成 .pkt 文件。中文分段说明不输入 CLI。</p></div><div><div className="code-actions"><button onClick={async()=>{try{await navigator.clipboard.writeText(commands);setCopy('已复制。按设备分段执行，中文说明不输入 CLI。');}catch{setCopy('请选中下方文字手动复制。');}}}>复制实验指引</button></div><pre><code>{commands}</code></pre><p role="status">{copy}</p></div></div>:null}
 <div hidden={tab!=='quiz'}><ClassroomQuiz lessonKey="switching/learning"/></div></div></section>;
}

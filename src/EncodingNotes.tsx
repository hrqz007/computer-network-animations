import {useState} from 'react';
import {Fact,Source} from './AdvancedUI';
import ClassroomQuiz from './ClassroomQuiz';
type Notes={concepts:[string,string][];sources:[string,string][]};
const notes:Record<string,Notes>={
 baseband:{concepts:[['电平约定与跳变约定','本例 NRZ-L 用 +1 表示 1，−1 表示 0。曼彻斯特按位中跳变方向判读；两种相反约定都存在，收发双方必须一致。差分曼彻斯特按位开始处是否跳变判读。'],['长串数据与同步','试试全 0 或全 1：NRZ-L 可长时间没有边沿，曼彻斯特类每位中间都有跳变。这为恢复位时钟提供线索，但仍需前导、同步与判决电路。图中直接给定了位边界。'],['线码不是任意的网卡设置','编码把比特映射为物理信号。具体以太网 PHY 使用由相应标准规定的编码、调制及处理链，不能把本页三种线码任意切换到同一个实际端口。']],sources:[['Microchip：曼彻斯特编码与可配置极性','https://onlinedocs.microchip.com/oxy/GUID-EDB1839B-8CB3-4792-92DA-B3964E0885C3-en-US-4/GUID-F24F7A89-DE78-4C00-89AE-99F77E361AC6.html'],['Microchip：差分曼彻斯特编码规则','https://onlinedocs.microchip.com/oxy/GUID-B822915F-C375-4172-91BD-AB6F326EB783-en-US-1/GUID-98860B4D-1868-47A4-A497-5C9F3373692C.html']]},
 modulation:{concepts:[['基带与频带','基带编码直接构造传输脉冲；载波调制则让载波的幅度、频率或相位随数据改变。数字数据与连续载波并不矛盾。'],['先固定其他因素，再比较','分别观察 ASK / OOK 的有无载波、BFSK 的疏密和 BPSK 相对参考的正反相。为了看清机制，本图省略脉冲成形与信道，不能用于测量实际占用带宽。'],['一段正弦波不等于一个码元','这里每位对应一个二进制码元。一个码元可包含多个载波周期；周期数随载频和码元时长变化，不能通过数波峰计算比特率。']],sources:[['NI：二进制相移键控教学实验','https://education.ni.com/teach/resources/67/lab-9-binary-phase-shift-keying'],['NI：通信系统仿真手册（ASK / FSK / PSK）','https://download.ni.com/support/manuals/371584a.pdf']]},
 rates:{concepts:[['比特率与波特率','波特率 Rs 是每秒发送的码元数。M 为 2 的整数次幂、采用固定长度映射时，每码元 k = log₂M bit，原始比特率 Rb = Rs × k。码元速率不等于每秒跳变次数。'],['更密集的电平带来权衡','固定总幅度范围，电平数越多，间隔越小。点击“相同扰动 +0.20”并比较 4-PAM 与 8-PAM：相同偏移可能越过更密集的判决门限。此实验不代表统计误码率。'],['联系高速通信','PAM4 用 4 个电平携带每码元 2 bit，是高速数字链路的重要技术之一。本页采用自然二进制映射方便读图；实际系统还要考虑映射选择、均衡、纠错、脉冲成形及协议开销。']],sources:[['Keysight：比特与码元的区别','https://helpfiles.keysight.com/scopes/FlexDCA-PG/Content/Topics/Quick-Start/theory_bits_vs_symbols.htm'],['Keysight：PAM4 原理与高速链路','https://www.keysight.com/in/en/learn/hubs/high-speed-digital-system-design/pulse-amplitude-modulation-pam4.html']]}
};
const commands=`在交换机 Switch0 的 CLI 中输入：
enable
show interfaces status
show interfaces fastEthernet 0/1
show interfaces fastEthernet 0/2

在 PC0 → Desktop → Command Prompt 中输入：
ipconfig
ping 192.168.40.12

在 PC1 → Desktop → Command Prompt 中输入：
ipconfig
ping 192.168.40.11`;
export default function EncodingNotes({lesson}:{lesson:string}){
 const [tab,setTab]=useState('concepts'),[copy,setCopy]=useState('');const n=notes[lesson];
 return <section className="lesson-notes"><div className="notes-tabs" role="tablist" aria-label="本节学习资料">{[['concepts','原理与资料'],['pt','Packet Tracer 衔接'],['quiz','课堂提问']].map(([id,name])=><button role="tab" id={`encoding-tab-${id}`} aria-selected={tab===id} aria-controls={`encoding-panel-${id}`} key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{name}</button>)}</div><div className="notes-content" role="tabpanel" id={`encoding-panel-${tab}`} aria-labelledby={`encoding-tab-${tab}`}>
 {tab==='concepts'?<><div className="principle-grid">{n.concepts.map(([title,text])=><article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div><div className="source-note"><strong>课程对应 · 1-2 数据通信原理</strong><span>对应“模拟 / 数字信号、基带 / 频带传输、数据传输率”。本节的具体线码、调制方式及 PAM 电平实验是帮助理解这些概念的补充内容。</span><p>速率单位使用十进制：1 kbit/s = 1,000 bit/s；1 byte = 8 bit。Hz、Baud、bit/s 分别描述频率、码元速率和比特率，含义不同。资料核对：2026-10-03。</p><ul className="source-links">{n.sources.map(([title,url])=><li key={url}><Source href={url}>{title}</Source></li>)}</ul></div></>:
 tab==='pt'?<div className="pt-layout"><div><h3>读懂端口速率，再验证比特传输后的连通</h3><ol><li>放置一台 2960 交换机和两台 PC，用铜质直通线把 PC0 / PC1 接到 Fa0/1 / Fa0/2。保留交换机默认 VLAN 和端口自动协商。</li><li>在 PC 的 Desktop → IP Configuration 配置：PC0 为 192.168.40.11，PC1 为 192.168.40.12；掩码均为 255.255.255.0。同一子网实验可留空网关。</li><li>待链路指示变绿，分别执行右侧命令。记录状态、Speed 和 Duplex；将显示的 Mb/s 换算为 bit/s。</li><li>切到 Simulation，只保留 ARP / ICMP，观察 ping 触发的帧传输。如果首次 ping 因 ARP 学习而超时，可再试一次。</li><li>把动画中的“原始比特率”和命令中看到的“端口速率”联系起来，再讨论：为什么应用实际吞吐量通常不同？</li></ol><Fact title="动画与 Packet Tracer 各验证什么">本动画展示理想波形、编码和判决。PT 用于查看端口状态、链路速率及数据包转发，不能通过此实验观测真实模拟波形，也没有用来任意切换这三种线码的通用 IOS 命令。</Fact><p className="hint">IOS 的 bandwidth 参数供上层功能参考，并不直接改变接口物理速率；不要用它来“调整波特率”。具体接口和命令支持依 PT 版本，以下指引尚未在你的机房版本中实测。</p><Source href="https://www.cisco.com/c/en/us/td/docs/ios-xml/ios/interface/command/ir-cr-book/ir-a1.html">Cisco IOS：bandwidth 接口命令说明</Source></div><div><div className="code-actions"><button onClick={async()=>{try{await navigator.clipboard.writeText(commands);setCopy('已复制操作指引。请按设备分别输入命令，不输入中文标题。');}catch{setCopy('可选中下方文字手动复制。');}}}>复制操作指引</button></div><p className="hint">中文行用于区分设备，不是 CLI 命令。Fa0/1 与 Fa0/2 必须对应实际连接的端口。</p><pre><code>{commands}</code></pre><p role="status">{copy}</p><a href="#/physical/twisted/tester">回到双绞线接线检测 →</a></div></div>:
 null}<div hidden={tab!=='quiz'}><ClassroomQuiz lessonKey={`encoding/${lesson}`}/></div>
 </div></section>
}

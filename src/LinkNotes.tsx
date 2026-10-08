import {useState} from 'react';
import {Fact,Source} from './AdvancedUI';
import ClassroomQuiz from './ClassroomQuiz';
const concepts={
 frame:[['先分清数据报和帧','IP 数据报作为以太网的载荷。发送端添加 MAC 帧头、必要填充和 FCS；接收端按协议解释载荷。本例只展示普通 Ethernet II，不混入 802.1Q 标签或巨帧。'],['帧长、载荷与 MTU','本例 MAC 帧长度从目的地址算到 FCS，为 64—1518 B。数据加填充为 46—1500 B；28 B 数据报需 18 B 填充，最终帧长 64 B。超过 MTU 的数据不能靠以太网自动切成多个 IP 分片。'],['字段各司其职','源 / 目的 MAC 用于链路上的接口标识，EtherType 标识载荷协议，FCS 用于差错检测。前导码、SFD 不计入本页帧长，帧间隙也不是帧内字段。']],
 crc:[['模 2 除法，就是逐位异或','生成多项式次数为 r，先在数据后补 r 个 0，再按对齐位置做异或除法，最后取 r 位余数。相同位相消，没有十进制除法中的进位或借位。'],['接收端检查实际收到的码字','本教学模型直接用收到的数据与校验位整体除以 G，不再补零。非零余数表示检出差错；零余数只表示未检出差错。若错误多项式是 G 的倍数，就会漏检。'],['把数学模型与真实以太网区分','本页使用短多项式，便于课堂手算。以太网使用 CRC-32，并规定初始值、反射和最终处理。FCS 出错通常丢弃帧，CRC 本身不会纠错或触发以太网逐帧自动重传。']]
};
const commands=`PC-A：Desktop → Command Prompt
ipconfig /all
ping 192.168.1.2

PC-B：Desktop → Command Prompt
ipconfig /all

交换机 CLI：
enable
show interfaces fastEthernet 0/1
show interfaces fastEthernet 0/2
show mac address-table`;
export default function LinkNotes({lesson}:{lesson:'frame'|'crc'}){
 const [tab,setTab]=useState('concepts'),[copy,setCopy]=useState('');
 return <section className="lesson-notes"><div className="notes-tabs" role="tablist" aria-label="本节学习资料">{[['concepts','原理与资料'],['pt','Packet Tracer 衔接'],['quiz','课堂提问']].map(([id,title])=><button key={id} role="tab" id={`link-tab-${id}`} aria-controls={`link-panel-${id}`} aria-selected={tab===id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{title}</button>)}</div><div className="notes-content" role="tabpanel" id={`link-panel-${tab}`} aria-labelledby={`link-tab-${tab}`}>
 {tab==='concepts'?<><div className="principle-grid">{concepts[lesson].map(([title,body])=><article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div><div className="source-note"><strong>课程对应</strong><span>{lesson==='frame'?'2-1 以太网 → 帧结构、帧长度与 MTU、MAC 地址、抓帧实验；2-3 组建基础局域网。':'1-2 数据通信原理 → 差错控制技术、循环冗余校验；2-1 以太网 → FCS。逐位运算和漏检对照是补充。'}</span><ul className="source-links"><li><Source href="https://ww1.microchip.com/downloads/en/DeviceDoc/DS-61155A.pdf">Microchip：以太网帧格式与 FCS 覆盖范围</Source></li>{lesson==='crc'&&<li><Source href="https://www.cs.williams.edu/~tom/courses/336/outlines/lect7_2.html">Williams College：CRC 多项式与漏检原理</Source></li>}</ul></div></>:tab==='pt'?<div className="pt-layout"><div><h3>{lesson==='frame'?'沿用课件中的抓帧实验':'在抓帧中定位 FCS，再用动画演算'}</h3><ol className="flow-procedure"><li>放置 1 台 2960 和 2 台 PC，以铜直通线接到 Fa0/1、Fa0/2。</li><li>PC-A 设置 192.168.1.1，PC-B 设置 192.168.1.2，掩码都为 255.255.255.0。同子网实验不需要网关。</li><li>通过 ipconfig /all 记录实际 MAC。等待端口就绪，先 ping 一次，完成连通性检查和 ARP 学习。</li><li>切换 Simulation，保留 ARP / ICMP 过滤；再次发送 Simple PDU 或 ping。点击事件信封，打开 Inbound / Outbound PDU Details。</li><li>{lesson==='frame'?'观察 ICMP 所在帧：把目的 MAC、源 MAC、EtherType 与记录对应。再查看响应帧，核对两个 MAC 角色互换；不要把先出现的 ARP 帧当成 IPv4 帧。':'查看帧尾 FCS 字段（若当前版本展示），联系其覆盖范围。上方动画负责逐位除法与注错；不要把 PT 字段占位值当成真实 CRC 计算结果。'}</li><li>{lesson==='frame'?'将看到的字段顺序与动画逐项对应。PT 可能省略底层字段，不以界面显示字节数代替本页完整帧长度。':'show interfaces 可用于认识接口统计。模拟器未必实现真实 CRC 错误计数，不能把一次 ping 失败直接解释为 FCS 错误。'}</li></ol><Fact title="两个动画各自对应一个学习任务">帧动画重点是封装、字段和长度；CRC 动画重点是生成、验证和检错边界。PT 用来观察协议数据单元，短多项式的逐位计算在此完成。</Fact><p className="hint">具体界面与命令支持以 PT 版本为准；本指引尚未在你的机房版本中实测，没有生成 .pkt 文件或自动执行命令。CLI 中文分段说明不用输入。</p></div><div><div className="code-actions"><button onClick={async()=>{try{await navigator.clipboard.writeText(commands);setCopy('已复制。请按设备逐段执行命令，中文标题不输入 CLI。');}catch{setCopy('请选中下方文字手动复制。');}}}>复制操作指引</button></div><pre><code>{commands}</code></pre><p role="status">{copy}</p></div></div>:null}
 <div hidden={tab!=='quiz'}><ClassroomQuiz lessonKey={`ethernet/${lesson}`}/></div></div></section>;
}

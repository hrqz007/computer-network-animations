import {useState} from 'react';
import {Fact,Source} from './AdvancedUI';
import ClassroomQuiz from './ClassroomQuiz';
type Note={concepts:[string,string][];source:string;activity:string};
const notes:Record<string,Note>={
 'delay/transmission':{concepts:[['发送时间由 L 和 R 决定','L 用 bit、R 用 bit/s 时，L/R 的单位是秒。发送完成指最后一位完整送入链路，并不等于接收方已经收完。'],['0 也要占用时间','数据位 0 和 1 都必须按规定占用一个比特时间。发送时延由位数与速率决定，不取决于其中有多少个 1。'],['速率与播放速度分开','R 是模型中的物理参数；0.5×、1×、2×只是课堂播放速度，不改动计算结果。下方发送条使用固定的毫秒刻度。']],source:'1-2 数据通信原理 → 数据传输率；L/R 与逐位时间条为教学补充。',activity:'根据 show interfaces 显示的接口速率，计算 12000 bit 的理想发送时间：10 Mbit/s 为 1.2 ms，100 Mbit/s 为 0.12 ms。实际以太网还有前导码、帧间隙等开销。'},
 'delay/propagation':{concepts:[['信号需要时间经过距离','d 与 v 使用一致的距离单位，d/v 才得到秒。演示中的 600 km、200000 km/s 对应 3 ms。'],['观察的是前沿到达','光点表示信号前沿，不表示整个数据包。第一位完整到达还要比前沿晚一个比特时间；本页单独考察传播过程。'],['距离刻度保持一致','改变链路距离后，接收端在固定距离尺上移动。若传播速度不变，前沿每单位时间走过的距离也保持不变。']],source:'1-4 常用网络设备和传输介质 → 信号经过介质；d/v 为补充实验。',activity:'在 PT 画布上拖远两台设备，不能把图标间距解释成真实线路长度。用上方距离参数做定量实验；PT 用于确认接口与连通状态。'},
 'delay/arrival':{concepts:[['各比特的发送和传播可以重叠','前面的比特在传播时，发送端还可以继续送出后面的比特。最后一个比特的后沿到达，才代表全部数据完整接收。'],['三个关键时刻','从 t=0 开始发送：首比特前沿在 d/v 到达，发送端在 L/R 发完，末比特后沿在 L/R+d/v 到达。前两个事件谁先发生取决于参数。'],['公式有明确边界','本例为单条理想链路，无中间设备、排队、处理、往返响应和协议开销。ping 显示的是包含其他因素的往返测量，不能拿来直接验证本页单程公式。']],source:'1-2 数据通信原理 → 数据传输率；结合 1-4 传输介质补充发送与传播的区别。',activity:'将交换机上联由 10 改为 100 Mbit/s，计算同样长度数据的发送时间如何变化。不要把 ping 往返值当成纯发送时间或纯传播时间。'},
 'communication/directions':{concepts:[['从能力区分三种方式','单工只允许一个方向；半双工允许双向但不能同时；全双工允许同时双向。一个支持全双工的链路也可能暂时只承载单向流量。'],['方向不等于导线数量','图中上下两条箭头表示逻辑方向。如何实现双向通信取决于物理接口，不能用一根线或两根线直接判断双工方式。'],['轮流发送不意味着必然冲突','半双工可以安排发送次序。本页人为安排 A 先、B 后，并留换向间隔；以太网竞争、冲突检测及退避将在数据链路层讲解。']],source:'1-2 数据通信原理 → 单工通信和双工通信。按工作能力解释，避免把课件中的设备使用比例当作普遍结论。',activity:'两端同时配置为 half 或 full，再用 show interfaces 检查双工状态。重点是理解并核对接口能力；PT 的模拟流量不作为真实硬件吞吐量测量。'},
 'communication/serial':{concepts:[['串行与并行描述位的组织方式','串行沿一条数据通路逐位发送；本例并行把每组四位分到四条通路同时发送。一条数据通路不必对应一根物理导线。'],['比较快慢要列明条件','每路速率相同且没有额外开销时，多路并行提高总原始速率；若串行每路速率更高，完成时间可能相同或更短。'],['本例只比较发送用时','并行各路理想对齐，未计算编码、同步和协议开销。真实方案还需考虑距离、信号质量、成本与引脚数量。']],source:'1-2 数据通信原理 → 并行通信和串行通信；通过可调每路速率补充比较条件。',activity:'用 show interfaces 观察以太网口的总标称速率。不要按网线八根芯线直接推断“八路并行”；PT 不提供这类逐位串并转换示波。'},
 'communication/skew':{concepts:[['多路同时发出，不保证同时更新','图中已扣除共同传播时间，只保留各通路的相对偏差。较慢的通路可能还保持上一组数据。'],['采样太早可能混合两组数据','接收方按同一采样时刻读取四路。若某一路尚未更新，拼出的四位字可能既不等于上一组，也不等于本组。'],['理想阶跃不等于真实时序保证','真实接收器还需要建立时间、保持时间以及抖动余量。本模型只做理想逻辑判读，不模拟亚稳态；一次读对不能证明采样点始终可靠。']],source:'1-2 数据通信原理 → 串行与并行传输的补充对照；不扩展为完整时钟同步专题。',activity:'先在上方动画固定 0.60T 偏差，对照 0.50T 与 0.90T 采样。PT 可核对链路状态，但无法直接注入此处的逐通路偏差，也不显示建立/保持时间。'}
};
const baseCommands=`在 S1、S2 上分别查看：
enable
show interfaces fastEthernet 0/24
show interfaces status

在 PC-A 的命令提示符中：
ipconfig
ping 192.168.60.12`;
const speedCommands=`在 S1 和 S2 的 Fa0/24 上都执行：
enable
configure terminal
interface fastEthernet 0/24
speed 10
duplex full
end
show interfaces fastEthernet 0/24

然后在两端分别改为：
configure terminal
interface fastEthernet 0/24
speed 100
end
show interfaces fastEthernet 0/24

实验结束，两端都恢复自动协商：
configure terminal
interface fastEthernet 0/24
speed auto
duplex auto
end`;
const duplexCommands=`在 S1 和 S2 的 Fa0/24 上都执行：
enable
configure terminal
interface fastEthernet 0/24
speed 100
duplex half
end
show interfaces fastEthernet 0/24

然后在两端分别切换全双工：
configure terminal
interface fastEthernet 0/24
duplex full
end
show interfaces fastEthernet 0/24

实验结束，两端都恢复自动协商：
configure terminal
interface fastEthernet 0/24
speed auto
duplex auto
end`;
export default function FlowNotes({suite,lesson}:{suite:'delay'|'communication';lesson:string}){
 const [tab,setTab]=useState('concepts'),[copy,setCopy]=useState(''),key=`${suite}/${lesson}`,note=notes[key],commands=suite==='delay'&&lesson!=='propagation'?`${baseCommands}\n\n${speedCommands}`:lesson==='directions'?`${baseCommands}\n\n${duplexCommands}`:baseCommands;
 return <section className="lesson-notes"><div className="notes-tabs" role="tablist" aria-label="本节学习资料">{[['concepts','原理与资料'],['pt','Packet Tracer 衔接'],['quiz','课堂提问']].map(([id,title])=><button key={id} role="tab" id={`flow-tab-${id}`} aria-controls={`flow-panel-${id}`} aria-selected={tab===id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{title}</button>)}</div>
 <div className="notes-content" role="tabpanel" id={`flow-panel-${tab}`} aria-labelledby={`flow-tab-${tab}`}>
 {tab==='concepts'?<><div className="principle-grid">{note.concepts.map(([title,body])=><article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div><div className="source-note"><strong>课程对应</strong><span>{note.source}</span><ul className="source-links"><li><Source href="https://www.cs.umd.edu/~shankar/417-F01/Slides/chapter1a-aus/tsld026.htm">马里兰大学课程：发送与传播时延</Source></li><li><Source href="https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960/software/release/15-0_2_se/configuration/guide/scg2960/swint.html">Cisco：2960 接口速率与双工配置</Source></li></ul></div></>:tab==='pt'?<div className="pt-layout"><div><h3>从动画中的条件，回到设备上的状态</h3><ol className="flow-procedure"><li>放置两台 2960 交换机 S1、S2，两台 PC 分别接各交换机 Fa0/1，使用铜直通线。</li><li>S1 Fa0/24 与 S2 Fa0/24 用铜交叉线连接，保留默认 VLAN。</li><li>PC-A 配置 192.168.60.11，PC-B 配置 192.168.60.12，掩码均为 255.255.255.0；同子网无需配置网关。</li><li>等待链路和生成树就绪，先 ping 验证连通，再查看接口速率和双工状态。</li><li>{note.activity}</li></ol><Fact title="先核对两端，再解释实验结果">修改上联时，两台交换机都按相同设置操作；完成两端配置后再观察。不要只改一端制造意外的速率或双工不匹配。IOS 的 bandwidth 参数也不能代替 speed 来改变物理速率。</Fact><p className="hint">具体命令支持以 PT 版本和设备为准；本指引尚未在你的机房版本实测。没有生成 .pkt 文件或自动执行命令。仿真播放时间、图标间距和 ping 往返测量，都不直接代表本页物理模型参数。</p></div><div><div className="code-actions"><button onClick={async()=>{try{await navigator.clipboard.writeText(commands);setCopy('已复制；中文分段说明不输入 CLI，命令需在对应设备逐段执行。');}catch{setCopy('请选中下方命令手动复制。');}}}>复制操作指引</button></div><pre><code>{commands}</code></pre><p role="status">{copy}</p></div></div>:null}
 <div hidden={tab!=='quiz'}><ClassroomQuiz lessonKey={key}/></div></div></section>;
}

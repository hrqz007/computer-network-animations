import {useState} from 'react';
import {Stage,Fact,Dot} from './AdvancedUI';
import {useSignalClock} from './EncodingControls';
import {FlowDrawing,FlowPlayback,FlowSelect,FlowResult} from './FlowUI';
import {clamp,directionSchedule,serialization,PARALLEL_WORDS,captureWord,laneValue} from './flowModel';
import type {DirectionMode} from './flowModel';
import FlowNotes from './FlowNotes';
const colors=['#087f8c','#cd913d','#517fb2'];
export default function CommunicationLab({lesson}:{lesson:string}){return <><div key={`communication-${lesson}`}>{lesson==='directions'?<Directions/>:lesson==='serial'?<SerialParallel/>:<ParallelSkew/>}</div><FlowNotes key={`communication-notes-${lesson}`} suite="communication" lesson={lesson}/></>}
function Directions(){
 const [mode,setMode]=useState<DirectionMode>('half'),[bPending,setBPending]=useState(true),clock=useSignalClock(9),t=clock.position,schedule=directionSchedule(mode,bPending);
 const aDone=Math.floor(clamp(t,0,4)+1e-8),bDone=schedule.b?Math.floor(clamp(t-schedule.b.start,0,4)+1e-8):0,end=schedule.b?.end??4;
 const names={simplex:'单工',half:'半双工',full:'全双工'};
 function changeMode(m:DirectionMode){setMode(m);clock.reset();}
 return <div className="lesson-layout flow-layout"><Stage title="能双向，和能同时双向，有什么不同？" tag="通信方向 · 共享同一时间刻度">
 <div className="flow-switches">{(['simplex','half','full'] as const).map(m=><button key={m} aria-pressed={mode===m} className={mode===m?'selected':''} onClick={()=>changeMode(m)}>{names[m]}</button>)}</div>
 <FlowDrawing label={`${names[mode]}，A 发往 B 已完成 ${aDone} 个单元，B 发往 A 已完成 ${bDone} 个单元`} height={368}>
 <rect x="35" y="66" width="99" height="127" rx="10" fill="#eef5f8" stroke="#b9ccd9"/><text x="85" y="98" textAnchor="middle" className="flow-title">终端 A</text><text x="85" y="129" textAnchor="middle">收到 B：{bDone}</text><text x="85" y="157" textAnchor="middle">待发：{4-aDone}</text>
 <rect x="666" y="66" width="99" height="127" rx="10" fill="#eef5f8" stroke="#b9ccd9"/><text x="715" y="98" textAnchor="middle" className="flow-title">终端 B</text><text x="715" y="129" textAnchor="middle">收到 A：{aDone}</text><text x="715" y="157" textAnchor="middle">待发：{bPending?4-bDone:0}</text>
 <path d="M145 102H655m-12-6 12 6-12 6" stroke="#087f8c" strokeWidth="2" fill="none"/><text x="400" y="78" textAnchor="middle">A → B</text>
 <path d="M655 163H145m12-6-12 6 12 6" stroke={mode==='simplex'?'#bac7d0':'#cd913d'} strokeDasharray={mode==='simplex'?'5 5':undefined} strokeWidth="2" fill="none"/><text x="400" y="195" textAnchor="middle">{mode==='simplex'?'B → A：本链路不支持':mode==='half'?'B → A：等待 A 完成，再换向':'B → A：可以同时发送'}</text>
 {t<4&&<><Dot x={150+t%1*500} y={102} color="#087f8c"/><text x="400" y="124" textAnchor="middle" className="flow-small">A{Math.floor(t)+1} 传送中</text></>}
 {schedule.b&&t>=schedule.b.start&&t<schedule.b.end&&<><Dot x={650-(t-schedule.b.start)%1*500} y={163} color="#cd913d"/><text x="400" y="147" textAnchor="middle" className="flow-small">B{Math.floor(t-schedule.b.start)+1} 传送中</text></>}
 <text x="35" y="249">A → B</text><text x="35" y="294">B → A</text>
 {[schedule.a,schedule.b].map((range,i)=><g key={i}><rect x="130" y={228+i*45} width="600" height="30" rx="4" fill="#f0f4f7"/>{range?<><rect x={130+range.start/9*600} y={228+i*45} width={(range.end-range.start)/9*600} height="30" rx="4" fill={i?'#f0debf':'#c5e2e4'}/>{Array.from({length:4},(_,j)=><text key={j} x={130+(range.start+j+.5)/9*600} y={248+i*45} textAnchor="middle" className="flow-small">{i?'B':'A'}{j+1}</text>)}</>:<text x="430" y={248+i*45} textAnchor="middle" className="flow-small">{!bPending?'B 暂时没有数据':'反方向不可用'}</text>}</g>)}
 {mode==='half'&&bPending&&<rect x={130+4/9*600} y="228" width={600/9} height="75" fill="#fcf4e5" fillOpacity=".8"/>}
 <path d={`M${130+t/9*600} 223V309`} stroke="#2e6580" strokeWidth="2"/>{[0,1,2,3,4,5,6,7,8,9].map(n=><text key={n} x={130+n/9*600} y="334" textAnchor="middle" className="flow-small">{n}</text>)}<text x="730" y="361" textAnchor="end">教学时间单位 →</text>
 </FlowDrawing><FlowResult title={mode==='simplex'&&bPending?'B 的数据仍在等待：此单工链路没有反向能力':t>=end?'本轮可发送的数据已传完':mode==='full'&&bPending&&t<4?'A 与 B 同时传送':mode==='half'&&bPending&&t>=4&&t<5?'A 已结束，进入换向间隔':'按当前方向传送'}>{mode==='simplex'?'单工限制的是通信方向；不能只因为一次只观察到单向流量，就认定链路是单工。':mode==='half'?'本例明确安排 A 先发、B 后发，保留 1 个单位换向间隔。半双工不意味着一定发生冲突。':'全双工允许两个方向同时工作。只有 A 有数据时，反向仍可能空闲。'}</FlowResult>
 <FlowPlayback clock={clock} events={[1,2,3,4,5,6,7,8,9]} end={end} label={`${t.toFixed(2)} 单位`}/><p className="model-caption">每个数据单元占 1 个教学时间单位；移动光点表示该单元的传送过程，未分别计算发送和传播时延。两条箭头表示逻辑方向，不要求使用两根物理线。半双工换向间隔为教学设定。</p>
 </Stage><aside className="inspector"><h2>两端都想发数据时</h2><label className="check-control"><input type="checkbox" checked={bPending} onChange={e=>{setBPending(e.target.checked);clock.reset();}}/>B 也有 4 个数据单元待发送</label><Fact title={names[mode]}>{mode==='simplex'?'本例只允许 A → B，例如只承担下行发送的广播通道。':mode==='half'?'两个方向都可以使用，但同一时刻只能有一个方向工作，可类比对讲机的轮流讲话。':'两个方向可以同时工作。这里 A 发 A1—A4 的同时，B 可以发 B1—B4。'}</Fact><table className="flow-table"><thead><tr><th>方式</th><th>可反向</th><th>可同时双向</th></tr></thead><tbody><tr><td>单工</td><td>否</td><td>否</td></tr><tr><td>半双工</td><td>是</td><td>否</td></tr><tr><td>全双工</td><td>是</td><td>是</td></tr></tbody></table><div className="flow-proof">先保持两端都有数据，对照半双工和全双工；再关闭 B 的数据，观察“能力”和“实际流量”的区别。</div><p className="hint">具体如何实现同时双向，取决于物理接口。介质数量与双工方式之间不能简单一一对应。</p></aside></div>;
}
function SerialParallel(){
 const [serialRate,setSerialRate]=useState(1),clock=useSignalClock(12),t=clock.position,bits=PARALLEL_WORDS.join(''),serial=serialization(12,1,serialRate),parallel=serialization(12,4,1),sentS=Math.floor(clamp(t*serialRate+1e-8,0,12)),sentP=Math.min(12,Math.floor(t+1e-8)*4);
 const x=(us:number)=>120+us/12*620;
 return <div className="lesson-layout flow-layout"><Stage title="一次一位，还是多路同时送出？" tag="相同比特串 · 固定时间刻度">
 <div className="rate-metrics flow-metrics"><div><span>总数据长度</span><strong>12<small> bit</small></strong></div><div><span>串行发送时间</span><strong>{serial.durationUs}<small> μs</small></strong></div><div><span>4 路并行发送时间</span><strong>{parallel.durationUs}<small> μs</small></strong></div></div>
 <FlowDrawing label={`串行每路 ${serialRate} Mbit/s，耗时 ${serial.durationUs} 微秒；四路并行每路 1 Mbit/s，耗时 3 微秒`} height={365}>
 <text x="24" y="35" className="flow-title">串行：一条数据通路逐位送出</text><text x="24" y="84">通路 1</text>
 {bits.split('').map((bit,i)=>{const start=i/serialRate,width=620/12/serialRate,f=clamp(t*serialRate-i);return <g key={i}><rect x={x(start)} y="56" width={width} height="43" fill="#eff3f6" stroke="white"/><rect x={x(start)} y="56" width={width*f} height="43" fill={colors[Math.floor(i/4)]} stroke="white"/>{width>19&&<text x={x(start)+width/2} y="83" textAnchor="middle" className={`flow-bit ${f>.8?'flow-white':''}`}>{bit}</text>}</g>;})}
 <text x="24" y="148" className="flow-title">并行：4 条数据通路，每路 1 Mbit/s</text>
 {[0,1,2,3].map(lane=><g key={lane}><text x="24" y={183+lane*34}>通路 {lane+1}</text>{PARALLEL_WORDS.map((word,w)=>{const f=clamp(t-w);return <g key={w}><rect x={x(w)} y={163+lane*34} width={620/12} height="29" fill="#eef3f6" stroke="white"/><rect x={x(w)} y={163+lane*34} width={620/12*f} height="29" fill={colors[w]} stroke="white"/><text x={x(w+.5)} y={183+lane*34} textAnchor="middle" className={`flow-bit ${f>.8?'flow-white':''}`}>{word[lane]}</text></g>;})}</g>)}
 <path d={`M${x(t)} 47V303`} stroke="#c48d31" strokeWidth="2"/><path d="M120 305H740" stroke="#b8cbd7"/>{[0,1,2,3,4,6,8,10,12].map(n=><text key={n} x={x(n)} y="329" textAnchor="middle" className="flow-small">{n}</text>)}<text x="740" y="358" textAnchor="end">发送端时间 / μs</text><text x="120" y="358">同色代表同一组 4 bit</text>
 </FlowDrawing><div className="flow-counts"><span>串行已送出 <strong>{sentS} / 12 bit</strong></span><span>并行已送出 <strong>{sentP} / 12 bit</strong></span></div>
 <FlowResult title={serialRate===1?'每路速率相同：4 路并行用时为串行的 1/4':serialRate===4?'串行每路提高到 4 Mbit/s：两种方案用时相同':serialRate>4?'本组参数下，串行方案先完成':'提高串行速率后，差距缩小'}>比较结果取决于数据通路数量、每路速率和开销，不能只凭“串行”“并行”两个名称判断快慢。</FlowResult>
 <FlowPlayback clock={clock} events={[...Array.from({length:12},(_,i)=>(i+1)/serialRate),1,2,3]} end={Math.max(serial.durationUs,parallel.durationUs)} label={`${t.toFixed(2)} μs`}/><p className="model-caption">本节只计算发送用时，忽略传播、编码、同步及控制开销。4 路并行理想对齐；一条数据通路可能由差分线对等实现，并不等于一根铜导线。</p>
 </Stage><aside className="inspector"><h2>给“并行更快”加上比较条件</h2><FlowSelect label="串行每路速率" value={serialRate} onChange={v=>{setSerialRate(v);clock.reset();}} options={[[1,'1 Mbit/s · 与并行每路相同'],[2,'2 Mbit/s'],[4,'4 Mbit/s · 总速率相同'],[8,'8 Mbit/s · 高速串行']]}/><div className="flow-formula">串行：12 / {serialRate} = {serial.durationUs} μs<br/>并行：3 / 1 = 3 μs<br/>并行总原始速率：4 × 1 = 4 Mbit/s</div><Fact title="比较的是条件，不是名称">保持并行方案每路 1 Mbit/s，只提高串行方案每路速率。固定时间轴能直接看到发送过程如何缩短。</Fact><div className="flow-proof">发送数据：1010 → 0101 → 1100。串行按位排列；并行把每组四位分别交给四条通路。</div><p className="hint">下一节加入通路之间的到达偏差，观察并行传输还需要解决什么问题。</p></aside></div>;
}
function ParallelSkew(){
 const [skew,setSkew]=useState(.6),[phase,setPhase]=useState(.5),clock=useSignalClock(3),t=clock.position,delays=[0,skew/3,skew*2/3,skew];
 const captured=PARALLEL_WORDS.map((word,i)=>({word,value:captureWord(i,phase,delays),ready:t>=i+phase-1e-8})),latest=captured.filter(c=>c.ready).at(-1),risk=phase<=skew+.05;
 const x=(time:number)=>140+time/3.8*595;
 return <div className="lesson-layout flow-layout"><Stage title="同一组四位，没有同时到达" tag="并行通路偏差 · 固定采样时刻">
 <FlowDrawing label={`最大到达偏差 ${skew.toFixed(2)} T，采样在每组开始后 ${phase.toFixed(2)} T`} height={346}>
 <text x="25" y="29" className="flow-title">接收端各数据通路的理想电平</text><text x="730" y="29" textAnchor="end">0：低电平　1：高电平</text>
 {[0,1,2,3].map(lane=>{const y=75+lane*58,points=[`M${x(0)},${y+22}`];PARALLEL_WORDS.forEach((word,i)=>{const at=i+delays[lane];points.push(`H${x(at)}`,`V${y+(word[lane]==='1'?0:22)}`);});points.push(`H${x(3.65)}`);return <g key={lane}><text x="24" y={y+6}>通路 {lane+1}</text><text x="24" y={y+24} className="flow-small">偏差 {delays[lane].toFixed(2)} T</text><path d={points.join(' ')} fill="none" stroke={colors[lane%3]} strokeWidth="2.5"/><text x="750" y={y+16} textAnchor="middle" className="flow-bit">{laneValue(t,lane,delays[lane])}</text></g>;})}
 {[0,1,2,3].map(i=><g key={i}><path d={`M${x(i)} 46V284`} stroke="#dfe8ee" strokeDasharray="3 4"/><text x={x(i)} y="307" textAnchor="middle">{i}T</text></g>)}
 {PARALLEL_WORDS.map((_,i)=><g key={i}><path d={`M${x(i+phase)} 46V284`} stroke="#c18330" strokeWidth="1.5" strokeDasharray="6 3"/><text x={x(i+phase)} y="331" textAnchor="middle" className="flow-small">采样 {i+1}</text></g>)}<path d={`M${x(t)} 42V286`} stroke="#264f68" strokeWidth="2"/>
 </FlowDrawing><table className="flow-table"><thead><tr><th>发送组</th><th>期望值</th><th>已采样结果</th><th>对照</th></tr></thead><tbody>{captured.map((c,i)=><tr key={i}><td>第 {i+1} 组</td><td>{c.word}</td><td>{c.ready?c.value:'尚未采样'}</td><td className={!c.ready?'':c.word===c.value?'match':'mismatch'}>{!c.ready?'等待':c.word===c.value?'一致':'新旧位混合'}</td></tr>)}</tbody></table>
 <FlowResult title={latest?(latest.word===latest.value?'最近一次采样与期望一致':'最近一次采样读到了混合数据'):'接收端等待第一次采样'} warn={!!latest&&latest.word!==latest.value}>{risk?'采样位置接近或早于最慢通路的更新。本例采用理想电平，恰逢跳变也不能作为真实硬件的可靠采样保证。':'本例采样位置晚于最慢通路到达，并给后续采样留出了一定余量。真实系统还要检查建立时间、保持时间和抖动。'}</FlowResult>
 <FlowPlayback clock={clock} events={[phase,1+phase,2+phase,3]} label={`${t.toFixed(2)} T`}/><p className="model-caption">T 是一组数据的发送周期；起始空闲值为 0000。已扣除所有通路共同的传播时间，只画相对到达偏差；电平为理想阶跃。相同前后比特可能掩盖错误采样位置，不能只看一次成功。</p>
 </Stage><aside className="inspector"><h2>让接收端等到四位都稳定</h2><FlowSelect label="最大通路到达偏差" value={skew} onChange={v=>{setSkew(v);clock.reset();}} options={[[0,'0 T · 完全对齐'],[.3,'0.30 T · 小偏差'],[.6,'0.60 T · 明显偏差'],[.8,'0.80 T · 较大偏差']]}/><FlowSelect label="组内采样时刻" value={phase} onChange={v=>{setPhase(v);clock.reset();}} options={[[.25,'0.25 T · 较早'],[.5,'0.50 T · 中间'],[.9,'0.90 T · 较晚']]}/><div className="flow-events"><button onClick={()=>{setSkew(0);setPhase(.5);clock.reset();}}>对照：四路对齐</button><button onClick={()=>{setSkew(.6);setPhase(.5);clock.reset();}}>对照：混入旧数据</button><button onClick={()=>{setSkew(.6);setPhase(.9);clock.reset();}}>对照：推迟采样</button></div><Fact title="位数对了，不代表这一组就对了">例如发送 0101 时，最慢通路如果还保持上一组的 0，接收方就可能组合出 0100。每根线都有信号，仍可能把组内数据读错。</Fact><div className="flow-proof">这是串行与并行对照中的一个补充实验。并行接口可以用时序预算、延迟校准等方法处理偏差；本页只演示偏差与采样位置的关系。</div><p className="hint">串行传输也需要处理时钟恢复和信号质量。这里没有把“串行”当成无需同步的传输。</p></aside></div>;
}

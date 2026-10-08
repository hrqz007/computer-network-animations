import {useState} from 'react';
import {Stage,Fact,Dot} from './AdvancedUI';
import {useSignalClock} from './EncodingControls';
import {FlowDrawing,FlowPlayback,FlowSelect,FlowResult} from './FlowUI';
import {clamp,linkTimes,completeBits,signalSegment} from './flowModel';
import FlowNotes from './FlowNotes';
const bitSequence='1011001010110010';
const fmt=(v:number)=>Number(v.toFixed(2)).toString();
export default function DelayLab({lesson}:{lesson:string}){return <><DelayExperiment key={`delay-${lesson}`} lesson={lesson}/><FlowNotes key={`delay-notes-${lesson}`} suite="delay" lesson={lesson}/></>}
function DelayExperiment({lesson}:{lesson:string}){
 const sending=lesson==='transmission',propagation=lesson==='propagation';
 const [bits,setBits]=useState(sending?8:12000),[rate,setRate]=useState(sending?1000:1000000),[distance,setDistance]=useState(propagation?600:1200),[speed,setSpeed]=useState(200000);
 const scale=sending||propagation?1:2,clock=useSignalClock(sending?16:12),time=clock.position*scale;
 const {sendMs,propMs,totalMs}=linkTimes(bits,rate,distance,speed),end=sending?sendMs:propagation?propMs:totalMs;
 const sent=completeBits(time,bits,rate),received=completeBits(time,bits,rate,propMs);
 function update(set:(v:number)=>void,v:number){set(v);clock.reset();}
 const marks=sending?Array.from({length:bits},(_,i)=>(i+1)*1000/rate):propagation?[propMs/2,propMs]:[propMs,sendMs,totalMs];
 return <div className="lesson-layout flow-layout"><Stage title={sending?'把比特逐个送进线路':propagation?'跟着信号前沿，走过这段距离':'发完了，不等于已经收完'} tag={sending?'发送时延 · L / R':propagation?'传播时延 · d / v':'单条链路 · 首尾到达对照'}>
 <div className="rate-metrics flow-metrics"><div><span>{sending?'数据长度 L':'链路距离 d'}</span><strong>{sending?bits:distance}<small> {sending?'bit':'km'}</small></strong></div><div><span>{propagation?'传播速度 v':'发送速率 R'}</span><strong>{propagation?speed/1000:sending?rate/1000:rate/1000000}<small> {propagation?'× 10³ km/s':sending?'kbit/s':'Mbit/s'}</small></strong></div><div><span>{sending?'发送时延':propagation?'传播时延':'末比特完整到达'}</span><strong>{fmt(end)}<small> ms</small></strong></div></div>
 {sending?<FlowDrawing label={`发送 ${bits} 位，速率 ${rate} bit/s，发送时延 ${fmt(sendMs)} ms`} height={335}>
 <text x="40" y="30" className="flow-title">待发送序列 · 从左到右</text>
 {bitSequence.slice(0,bits).split('').map((b,i)=>{const x=40+i*720/bits,w=720/bits-5,f=clamp(time*rate/1000-i);return <g key={i}><rect x={x} y="49" width={w} height="45" rx="5" fill="#edf2f6"/><rect x={x} y="49" width={w*f} height="45" rx="5" fill="#087f8c"/><text x={x+w/2} y="78" textAnchor="middle" className={`flow-bit ${f>.8?'flow-white':''}`}>{b}</text><text x={x+w/2} y="115" textAnchor="middle" className="flow-small">{i+1}</text></g>;})}
 <text x="40" y="163" className="flow-title">发送端占用线路的时间</text><path d="M60 250H740" stroke="#b8cbd7"/>
 {Array.from({length:bits},(_,i)=>{const x=60+i*(1000/rate)/16*680,w=1000/rate/16*680;return <g key={i}><rect x={x} y="191" width={w-1} height="41" fill={i<sent?'#b5d9dc':'#e8eef3'} stroke="white"/><text x={x+w/2} y="217" textAnchor="middle" className="flow-small">{bitSequence[i]}</text></g>;})}
 {[0,4,8,12,16].map(t=><g key={t}><path d={`M${60+t/16*680} 248v7`} stroke="#b8cbd7"/><text x={60+t/16*680} y="277" textAnchor="middle">{t}</text></g>)}<path d={`M${60+clamp(time/16)*680} 183V255`} stroke="#cb8a32" strokeWidth="2"/><text x="740" y="311" textAnchor="end">固定时间刻度 / ms</text><text x="60" y="311">一位占 {fmt(1000/rate)} ms；0 和 1 都占一个比特时间</text>
 </FlowDrawing>:propagation?<FlowDrawing label={`距离 ${distance} km，传播速度 ${speed} km/s，传播时延 ${fmt(propMs)} ms`} height={315}>
 <text x="60" y="35" className="flow-title">固定距离刻度 · 只跟踪信号前沿</text><path d="M90 244H730" stroke="#d6e1e8"/>
 {[0,600,1200,1800,2400].map(d=><g key={d}><path d={`M${90+d/2400*640} 241v7`} stroke="#a9bdcb"/><text x={90+d/2400*640} y="274" textAnchor="middle">{d} km</text></g>)}
 <path d={`M90 151H${90+distance/2400*640}`} stroke="#dbe8ec" strokeWidth="24" strokeLinecap="round"/><path d={`M90 151H${90+clamp(time/propMs)*distance/2400*640}`} stroke="#66aab2" strokeWidth="6"/><Dot x={90+clamp(time/propMs)*distance/2400*640} y={151}/>
 <rect x="62" y="112" width="56" height="78" rx="8" fill="#e7f1f5" stroke="#a8c4d1"/><text x="90" y="104" textAnchor="middle">发送端</text><text x="90" y="159" textAnchor="middle">A</text>
 <rect x={90+distance/2400*640-27} y="112" width="54" height="78" rx="8" fill={time>=propMs?'#d5eee6':'#eef3f7'} stroke="#9bbbc8"/><text x={90+distance/2400*640} y="104" textAnchor="middle">接收端</text><text x={90+distance/2400*640} y="159" textAnchor="middle">B</text>
 <text x="400" y="218" textAnchor="middle">{time>=propMs?'信号前沿已经到达 B':`信号前沿已走过 ${fmt(Math.min(distance,time/1000*speed))} km`}</text>
 </FlowDrawing>:<FlowDrawing label={`发送需 ${fmt(sendMs)} ms，传播需 ${fmt(propMs)} ms，末比特完整到达需 ${fmt(totalMs)} ms`} height={443}>
 <text x="75" y="28" className="flow-title">发送端 A</text><text x="725" y="28" textAnchor="end" className="flow-title">接收端 B</text><text x="400" y="28" textAnchor="middle">{distance} km · v = {speed/1000} × 10³ km/s</text>
 <path d="M85 98H715" stroke="#e7eff3" strokeWidth="42" strokeLinecap="round"/>
 {Array.from({length:12},(_,i)=>{const seg=signalSegment(time,i,12,sendMs,propMs);return seg?<rect key={i} x={85+seg.left*630} y="80" width={(seg.right-seg.left)*630} height="36" fill={i===0?'#d79739':i===11?'#417bb5':'#73b8be'} stroke="#ffffff" strokeWidth="1"/>:null;})}
 <path d="M85 69V128M715 69V128" stroke="#426b80" strokeWidth="3"/><text x="85" y="151">已完整送出 {sent} bit</text><text x="715" y="151" textAnchor="end">已完整收到 {received} bit</text>
 <text x="40" y="190" className="flow-title">时空图</text><text x="400" y="190" textAnchor="middle">纵轴时间向下；斜线是信号边界的行程</text>
 <path d="M85 213V405M715 213V405" stroke="#bdcfd9" strokeDasharray="4 4"/>
 {[0,6,12,18,24].map(t=><g key={t}><path d={`M80 ${215+t*7.5}H730`} stroke="#edf1f5"/><text x="73" y={220+t*7.5} textAnchor="end" className="flow-small">{t}</text></g>)}
 <path d={`M85 215L715 ${215+propMs*7.5}L715 ${215+totalMs*7.5}L85 ${215+sendMs*7.5}Z`} fill="#087f8c" fillOpacity=".08"/>
 <path d={`M85 215L715 ${215+propMs*7.5}`} stroke="#d79739" strokeWidth="2.5"/><path d={`M85 ${215+sendMs*7.5}L715 ${215+totalMs*7.5}`} stroke="#417bb5" strokeWidth="2.5"/>
 <path d={`M80 ${215+Math.min(time,24)*7.5}H730`} stroke="#267f7f" strokeDasharray="5 4"/><text x="40" y="432" className="flow-small">ms</text><text x="170" y="432">金线：首比特前沿</text><text x="432" y="432">蓝线：末比特后沿</text>
 </FlowDrawing>}
 <FlowResult title={sending?(sent===bits?'所有比特已送入线路':`已完整送出 ${sent} / ${bits} 位`):propagation?(time>=propMs?'信号前沿到达接收端':'信号仍在传播'):received===bits?'全部数据已完整到达':time>=sendMs?'发送端已发完，仍有数据在路上':time>=propMs?'接收与发送正在重叠进行':'发送已开始，接收端仍在等待'}>
 {sending?'本节只观察发送端：把最后一位送入介质才算发送完成，不代表对方已经收到。':propagation?'传播时间由距离和介质中的传播速度决定。本节的光点标记信号前沿，不是一个完整数据包。':`首比特前沿在 ${fmt(propMs)} ms 到达；末比特后沿在 ${fmt(sendMs)} + ${fmt(propMs)} = ${fmt(totalMs)} ms 到达。`}
 </FlowResult>
 {!sending&&!propagation&&<div className="flow-events">{[[propMs,'首比特前沿到达'],[sendMs,'发送端发完'],[totalMs,'全部接收完成']].map(([t,title])=><button key={title} className={time>=Number(t)?'event-past':''} onClick={()=>clock.seek(Number(t)/scale)}>{title} · {fmt(Number(t))} ms</button>)}</div>}
 <FlowPlayback clock={clock} events={marks.map(t=>t/scale)} end={end/scale} label={`${time.toFixed(2)} ms`}/><p className="model-caption">{sending?'低速、短序列用于放大逐位发送；1 kbit/s = 1000 bit/s。':propagation?'线路按固定距离刻度绘制，传播过程已放慢。速度为选定的教学近似值。':'单向、单条理想链路，无排队、处理及协议开销。12 个色段各代表一段数据，非 12 个比特；段宽随发送速率变化。首比特完整到达比前沿晚 1/R。'}播放速度只改变课堂播放节奏，不改变计算结果。</p>
 </Stage><aside className="inspector"><h2>{sending?'长度和速率，分别改变一次':propagation?'距离越长，需要走得越久':'同一条链路，分清两个时延'}</h2>
 {!propagation&&<><FlowSelect label="数据长度 L" value={bits} onChange={v=>update(setBits,v)} options={sending?[[8,'8 bit'],[12,'12 bit'],[16,'16 bit']]:[[6000,'6000 bit（750 B）'],[12000,'12000 bit（1500 B）']]}/><FlowSelect label="发送速率 R" value={rate} onChange={v=>update(setRate,v)} options={sending?[[1000,'1 kbit/s'],[2000,'2 kbit/s'],[4000,'4 kbit/s']]:[[1000000,'1 Mbit/s'],[2000000,'2 Mbit/s'],[4000000,'4 Mbit/s']]}/></>}
 {!sending&&<><FlowSelect label="链路距离 d" value={distance} onChange={v=>update(setDistance,v)} options={[[600,'600 km'],[1200,'1200 km'],[2400,'2400 km']]}/>{propagation&&<FlowSelect label="传播速度 v" value={speed} onChange={v=>update(setSpeed,v)} options={[[200000,'200 000 km/s · 介质近似'],[300000,'300 000 km/s · 真空近似']]}/>}</>}
 <div className="flow-formula">{sending?<>t发送 = L / R<br/>{bits} ÷ {rate} s = {fmt(sendMs)} ms</>:propagation?<>t传播 = d / v<br/>{distance} ÷ {speed} s = {fmt(propMs)} ms</>:<>t发送 = {fmt(sendMs)} ms<br/>t传播 = {fmt(propMs)} ms<br/>t完整到达 = {fmt(totalMs)} ms</>}</div>
 <Fact title={sending?'提高 R，是更密集地送出比特':propagation?'传播速度与比特率不是同一量':'可以边发送，边传播，边接收'}>{sending?'把速率加倍，同样长度的数据只需要一半发送时间。注意下方时间刻度保持不变。':propagation?'R 用 bit/s 表示每秒送出多少比特；v 用 km/s 表示信号每秒前进多远。这里单独观察后者。':'发送端不必等所有比特到达才发送下一位。最后一位也需要走完这段距离，所以完成接收的时刻是 L/R + d/v。'}</Fact>
 <div className="flow-proof">{sending?'课堂对照：8 bit、1 kbit/s → 8 ms；改成 2 kbit/s → 4 ms。':propagation?'课堂对照：固定 200 000 km/s，600 km → 3 ms；1200 km → 6 ms。':'课堂对照：12000 bit、1200 km。把 R 从 1 改成 2 Mbit/s：发送 12 → 6 ms，传播仍为 6 ms。'}</div>
 {!sending&&!propagation&&<button className="flow-preset" onClick={()=>{setBits(6000);setRate(4000000);setDistance(2400);clock.reset();}}>对照：发完时还没到达</button>}
 <p className="hint">改变参数会从头开始。先预测，再点“下一关键时刻”核对；也可以拖动进度条回看。</p>
 </aside></div>;
}

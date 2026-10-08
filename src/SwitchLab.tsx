import {useMemo,useState,useRef} from 'react';
import {Stage,Fact} from './AdvancedUI';
import {useSignalClock} from './EncodingControls';
import {FlowResult} from './FlowUI';
import {SWITCH_HOSTS,SWITCH_MAC,SWITCH_AGING,destinationMac,processLearningFrame,seedMacTable} from './switchModel';
import type {SwitchHost,SwitchDestination,SwitchTopology,MacEntry,LearningFrame,SwitchResult} from './switchModel';
import SwitchDiagram from './SwitchDiagram';
import SwitchNotes from './SwitchNotes';
import SwitchStory from './SwitchStory';

const steps=['准备一帧','进入交换机','学习源 MAC','查询目的 MAC','选择出口','转发帧','主机判断'];
const decisionNames={unknown:'未知单播 → 泛洪',known:'已知单播 → 定向转发',broadcast:'广播帧 → 泛洪',filter:'目的也在入端口 → 过滤'};
const portList=(ports:number[])=>ports.map(p=>`Fa0/${p}`).join('、');
type Preset='empty'|'known'|'broadcast'|'filter';
type Session={table:MacEntry[];frame:LearningFrame;topology:SwitchTopology;now:number;note:string};
function presetSession(preset:Preset):Session{
 const topology:SwitchTopology=preset==='filter'?'shared':'direct';
 const hosts:SwitchHost[]=preset==='filter'?['B']:preset==='broadcast'?['A','B','C']:preset==='known'?['A','B']:[];
 return {table:seedMacTable(hosts,topology),frame:{source:'A',destination:preset==='broadcast'?'broadcast':'B'},topology,now:1,note:preset==='empty'?'从空的动态表开始。先看 A 发给 B，再让 B 回一帧，观察表怎样建立。':preset==='known'?'预置前情：A、B 已分别发过帧，S1 已学到两者的入口。现在观察 A 再发给 B。':preset==='broadcast'?'预置前情：A、B、C 都已被学习。即使表项齐全，广播帧仍需送往同一 VLAN 的其他端口。':'预置前情：A、B 接在同一个 Hub 上，B 先前发过帧，因此 S1 已学到 B → Fa0/1。现在 A 发给 B。'};
}
function learningText(result:SwitchResult,frame:LearningFrame){
 const action=result.learning==='new'?'新增':result.learning==='move'?'更新端口':'刷新';
 return `${action}：${frame.source}（${result.sourceMac}）→ Fa0/${result.ingress}，重新计 ${SWITCH_AGING} s。依据是源 MAC 与实际入端口，不能靠目的 MAC 学到接收方的位置。`;
}
function decisionText(result:SwitchResult){
 if(result.decision==='filter')return `目的 MAC 已对应入端口 Fa0/${result.ingress}，S1 不向其他端口转发，也不把帧送回入端口。`;
 if(result.decision==='known')return `目的 MAC 命中 Fa0/${result.egress[0]}，只从该端口发送。源、目的 MAC 均保持原值。`;
 return `${result.decision==='broadcast'?'目的地址为广播地址。':'表中没有目的 MAC，这仍然是一帧单播帧。'}向同一 VLAN 中除入端口外的可转发端口 ${portList(result.egress)} 各送一份；不会改写目的 MAC。`;
}
function SwitchExperiment(){
 const [session,setSession]=useState<Session>(()=>presetSession('empty'));
 const [source,setSource]=useState<SwitchHost>('A'),[destination,setDestination]=useState<SwitchDestination>('B');
 const clock=useSignalClock(6),step=Math.min(6,Math.floor(clock.position+1e-8)),finished=step===6;
 const {frame,topology,now}=session,result=useMemo(()=>processLearningFrame(session.table,frame,topology,now),[session.table,frame,topology,now]);
 const shownTable=step>=2?result.learned:result.before;
 function choosePreset(preset:Preset){const next=presetSession(preset);setSession(next);setSource(next.frame.source);setDestination(next.frame.destination);clock.reset();}
 function sendNext(src:SwitchHost,dst:SwitchDestination){if(!finished||src===dst)return;setSession({...session,table:result.learned,frame:{source:src,destination:dst},now:now+1,note:'保留上一帧建立的地址表，准备发送另一帧。请再次观察：先学习源 MAC，再查询目的 MAC。'});setSource(src);setDestination(dst);clock.reset();}
 function clearTable(){setSession({...session,table:[],note:'已手工清空本实验的动态表项，当前帧从头重演。连线和主机的目的 MAC 知识不变。'});clock.reset();}
 function ageThenRepeat(){if(!finished)return;setSession({...session,table:result.learned,now:now+301,note:'模拟没有任何主机发帧的 301 s。动态项已到老化阈值；现在重发同一帧，观察重新学习与查表。'});clock.reset();}
 const explanations=[
  `主机 ${frame.source} 已准备好目的 MAC。这里只研究一帧到达交换机后的处理，不自动运行 ARP。`,
  `帧从 Fa0/${result.ingress} 进入 S1。先辨认源 MAC ${result.sourceMac} 和目的 MAC ${result.targetMac}。本例假定帧有效。`,
  learningText(result,frame),
  frame.destination==='broadcast'?'目的 MAC 是 FF:FF:FF:FF:FF:FF，识别为广播地址；不会把它作为源地址学习进动态表。':result.target?`查找目的 ${frame.destination}，命中 Fa0/${result.target.port}。这里只读取目的表项；不会因为帧发给它，就刷新它的老化计时。`:`查找目的 ${frame.destination}：未命中。交换机目前只知道已发送过帧的主机从哪个端口可达。`,
  decisionText(result),
  result.decision==='filter'?'本帧在 S1 处过滤，没有出端口。共享网段内的接收方已从 Hub 获得信号。':`帧正沿 ${portList(result.egress)} 转发。复制帧不等于把目的地址改成广播地址。`,
  result.decision==='filter'?`${frame.destination} 在共享网段中收到 ${frame.source} 的帧；S1 过滤的是额外的转发副本，不妨碍网段内部通信。`:`二层接收：${result.accepted.join('、')||'无'}。${result.discarded.length?`${result.discarded.join('、')} 虽然收到了副本，但目的 MAC 不匹配，丢弃。`:'其余未涉及端口没有得到此帧。'}${frame.destination==='broadcast'?'广播被网卡接受不等于所有应用都会处理它。':''}`
 ];
 return <div className="lesson-layout flow-layout switch-layout"><Stage title="一帧进入交换机后，会发生什么？" tag="二层交换 · VLAN 1">
  <div className="switch-case-note">{session.note}</div>
  <div className="switch-stepper" aria-label="交换机处理步骤">{steps.map((name,i)=><button key={name} className={step===i?'selected':''} aria-current={step===i?'step':undefined} onClick={()=>clock.seek(i)}><span>{i+1}</span>{name}</button>)}</div>
  <div className="switch-frame" aria-label="本帧 MAC 地址"><div className={step===2?'focus-source':''}><span>源 MAC · 用来学习</span><strong>{frame.source}</strong><code>{SWITCH_MAC[frame.source]}</code></div><div className={step===3?'focus-target':''}><span>目的 MAC · 用来查表</span><strong>{frame.destination==='broadcast'?'广播':frame.destination}</strong><code>{destinationMac(frame.destination)}</code></div></div>
  <div className="switch-playback"><div className="playback"><button className="primary" onClick={clock.toggle}>{clock.running?'暂停动画':'播放动画'}</button><button onClick={()=>clock.seek(step-1)} disabled={step===0}>上一步</button><button onClick={()=>clock.seek(step+1)} disabled={finished}>下一步</button><button onClick={clock.reset}>重演本帧</button><button onClick={()=>clock.seek(6)}>看完成状态</button><label className="speed-label">速度<select aria-label="播放速度" value={clock.speed} onChange={e=>clock.setSpeed(+e.target.value)}><option value=".5">0.5×</option><option value="1">1×</option><option value="2">2×</option></select></label></div><label className="timeline flow-timeline"><span>演示进度</span><input aria-label="演示进度" type="range" min="0" max="6" step=".01" value={clock.position} onChange={e=>clock.seek(+e.target.value)}/><output>{step+1} / 7 步</output></label></div>
  <SwitchDiagram frame={frame} topology={topology} result={result} position={clock.position}/>
  <FlowResult title={`第 ${step+1} 步 · ${steps[step]}`}>{explanations[step]}</FlowResult>
  <div className="switch-decision"><span>本帧决策</span><strong>{step>=4?decisionNames[result.decision]:'等待查表与选择出口'}</strong><span>{step>=4?`入端口 Fa0/${result.ingress} · 出端口 ${portList(result.egress)||'无'}`:'跟随步骤观察，先学习，再决定去向。'}</span></div>
  <div className="switch-next"><h3>保留地址表，再观察另一帧</h3>{frame.destination!=='broadcast'&&<button className="primary" disabled={!finished} onClick={()=>sendNext(frame.destination as SwitchHost,frame.source)}>让 {frame.destination} 回一帧给 {frame.source}</button>}<div className="switch-compose"><label>发送主机<select aria-label="发送主机" value={source} onChange={e=>{const src=e.target.value as SwitchHost;setSource(src);if(destination===src)setDestination(SWITCH_HOSTS.find(h=>h!==src)!);}}>{SWITCH_HOSTS.map(h=><option key={h}>{h}</option>)}</select></label><label>目的主机 / 广播<select aria-label="目的主机或广播" value={destination} onChange={e=>setDestination(e.target.value as SwitchDestination)}>{SWITCH_HOSTS.filter(h=>h!==source).map(h=><option key={h}>{h}</option>)}<option value="broadcast">广播 FF:FF:FF:FF:FF:FF</option></select></label><button onClick={()=>sendNext(source,destination)} disabled={!finished}>发送下一帧</button></div><p className="hint">{finished?'可以保留当前表项继续实验。回应是主机主动发送的另一帧，并非交换机的自动确认。':'先走完本帧的 7 步，或点击“看完成状态”，再发送下一帧。'}</p></div>
  <p className="model-caption">本例为无环路、同一 VLAN、端口正常且允许转发的简化网络。按步骤展示逻辑，不代表硬件处理耗时；不模拟组播、拥塞和端口安全策略。</p>
 </Stage><aside className="inspector switch-inspector"><h2>S1 的动态 MAC 地址表</h2><p className="hint">同一 VLAN 内记录“MAC → 可达端口”；从源地址学习。图中地址用末尾字节缩写。</p><div className="switch-table-scroll"><table className="switch-mac-table" aria-label="动态 MAC 地址表"><thead><tr><th>VLAN</th><th>MAC 地址</th><th>端口</th><th>剩余</th></tr></thead><tbody>{shownTable.length?shownTable.map(entry=><tr key={`${entry.vlan}-${entry.mac}`} className={`${step>=2&&entry.mac===result.sourceMac?'source-row':''} ${step>=3&&entry.mac===result.targetMac?'target-row':''}`}><td>{entry.vlan}</td><td><code>{entry.mac}</code><small>{SWITCH_HOSTS.find(host=>SWITCH_MAC[host]===entry.mac)} · DYNAMIC</small></td><td>Fa0/{entry.port}</td><td>{Math.max(0,SWITCH_AGING-(now-entry.lastSeen))} s</td></tr>):<tr><td colSpan={4} className="switch-table-empty">动态表为空：还没有学到主机的位置。</td></tr>}</tbody></table></div>
  <div className="switch-table-key"><span>青色：本帧学习 / 刷新的源</span><span>金色：本帧查到的目的</span></div>
  <div className="switch-table-event" role="status">{step>=2?learningText(result,frame):'尚未执行本帧的源地址学习。'}</div>
  {result.expired.length>0&&<p className="switch-aged">本帧开始前已老化移除：{result.expired.map(e=>e.mac).join('、')}。</p>}
  <div className="switch-table-actions"><button onClick={clearTable}>清空动态表并重演</button><button onClick={ageThenRepeat} disabled={!finished}>模拟静默 301 s 后重演</button></div><p className="hint">教学时钟 t = {now} s；老化阈值取 300 s。播放快慢只控制画面，计时由下一帧或“静默”按钮推进。</p>
  <h3>选择场景（重新开始）</h3><div className="stack-buttons"><button onClick={()=>choosePreset('empty')}>从空表开始：A → B</button><button onClick={()=>choosePreset('known')}>已知单播：只走一个出口</button><button onClick={()=>choosePreset('broadcast')}>广播帧：有表项也要泛洪</button><button onClick={()=>choosePreset('filter')}>同端口过滤：A、B 共用网段</button></div>
  <Fact title="交换机学源地址，不学目的地址">A 发给 B，只能说明 A 在入端口一侧。即便这一帧成功到达 B，也要等 B 发出帧，S1 才能从源地址学到 B。</Fact><Fact title="未知单播与广播不是同一件事">二者都可能被送往多个出口，但未知单播的目的 MAC 仍是某一台主机。普通网卡会丢弃不属于自己的单播副本。</Fact>
 </aside></div>;
}
export default function SwitchLab(){
 const [mode,setMode]=useState<'story'|'lab'>('story'),start=useRef<HTMLDivElement>(null);
 function changeMode(next:'story'|'lab'){setMode(next);start.current?.scrollIntoView({behavior:'smooth',block:'start'});}
 return <><div className="switch-mode" ref={start} aria-label="学习方式"><button aria-pressed={mode==='story'} className={mode==='story'?'active':''} onClick={()=>changeMode('story')}>先看送信故事</button><button aria-pressed={mode==='lab'} className={mode==='lab'?'active':''} onClick={()=>changeMode('lab')}>自由实验（进阶）</button><span>第一次学，从左边开始就好。</span></div>{mode==='story'?<SwitchStory onPractice={()=>changeMode('lab')}/>:<SwitchExperiment/>}<SwitchNotes/></>;
}

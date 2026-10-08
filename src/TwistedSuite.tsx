import {useEffect,useId,useState} from 'react';
import {orders,wires,crimpSteps,testMapping,type Wire,type Standard,type Fault} from './course';
import Icon from './Icon';
import {WireDefs,wireFill} from './diagrams';
import SignalLab from './SignalLab';

export default function TwistedSuite({lesson}:{lesson:string}){
 const [standard,setStandard]=useState<Standard>('B');const [order,setOrder]=useState<Wire[]>([...orders.B]);
 const changeStandard=(v:Standard)=>{setStandard(v);setOrder([...orders[v]]);};
 return lesson==='signal'?<SignalLab medium="twisted" lesson="signal"/>:lesson==='tester'?<CableTester/>:lesson==='crimp'?<Crimp standard={standard} setStandard={changeStandard}/>:<Wiring standard={standard} setStandard={changeStandard} order={order} setOrder={setOrder}/>;
}
function StandardSelector({value,onChange,label='选择接线标准'}:{value:Standard;onChange:(v:Standard)=>void;label?:string}){return <fieldset className="selector"><legend>{label}</legend><div className="segmented">{(['A','B'] as const).map(v=><button type="button" key={v} aria-pressed={value===v} className={value===v?'selected':''} onClick={()=>onChange(v)}>T568{v}</button>)}</div></fieldset>}
function WireSwatch({wire}:{wire:Wire}){const w=wires[wire];return <span className="wire-swatch" style={{background:w.stripe?`repeating-linear-gradient(135deg,#fff 0px,#fff 7px,${w.color} 7px,${w.color} 12px)`:w.color}}/>;}
function ReferenceRows(){return <div className="reference-rows">{(['A','B'] as const).map(v=><div key={v}><strong>T568{v}</strong><div className="mini-wires">{orders[v].map((w,i)=><div key={w}><span>{i+1}</span><WireSwatch wire={w}/><span>{wires[w].name}</span></div>)}</div></div>)}</div>}
function Wiring({standard,setStandard,order,setOrder}:{standard:Standard;setStandard:(v:Standard)=>void;order:Wire[];setOrder:(v:Wire[])=>void}){
 const [selected,setSelected]=useState<number|null>(null);const [checked,setChecked]=useState(false);const [practice,setPractice]=useState(false);const [hideReference,setHideReference]=useState(false);const uid=useId().replaceAll(':','');
 const errors=order.map((w,i)=>w!==orders[standard][i]?i:-1).filter(i=>i>=0);
 const swap=(i:number)=>{setChecked(false);if(selected===null){setSelected(i);}else{const next=[...order];[next[i],next[selected]]=[next[selected],next[i]];setOrder(next);setSelected(null);}};
 function shuffle(){setPractice(true);setChecked(false);setSelected(null);setOrder([order[2],order[4],order[0],order[7],order[1],order[5],order[3],order[6]]);}
 return <div className="lesson-layout wiring-layout"><section className="experiment"><div className="experiment-heading"><h2>固定方向，认清 1—8 号引脚</h2><span>{practice?'排线练习':'线序观察'}</span></div>
 <p className="orientation">金属触点朝向你 · 卡扣背向你 · 线缆向下</p>
 <div className="connector-zone"><svg viewBox="0 0 620 395" className="connector-svg" role="img" aria-label={`T568${standard}水晶头正面，左到右1至8号，当前线序${order.map(w=>wires[w].name).join('、')}`}><WireDefs prefix={uid}/><defs><linearGradient id={`${uid}-glass`}><stop stopColor="#d4e2eb" stopOpacity=".8"/><stop offset=".5" stopColor="#faffff" stopOpacity=".4"/><stop offset="1" stopColor="#c9d8e1" stopOpacity=".85"/></linearGradient><linearGradient id={`${uid}-gold`}><stop stopColor="#a7802e"/><stop offset=".5" stopColor="#f8dfa0"/><stop offset="1" stopColor="#bd9136"/></linearGradient></defs>
 <path d="M122 55 137 39H485l14 16v226l-29 24H151l-29-24Z" fill={`url(#${uid}-glass)`} stroke="#9dafbd" strokeWidth="2"/>
 <path d="M147 49h326v216H147zM153 293h319" fill="none" stroke="#fff" strokeWidth="4"/>
 {order.map((w,i)=><g key={w} style={{transform:`translateX(${i*40}px)`,transition:'transform .45s ease'}}><rect x="152" y="79" width="34" height="187" rx="5" fill="#eef5f8" stroke="#b6c8d4"/><path d="M169 275V79" fill="none" stroke={wireFill(w,uid)} strokeWidth="23"/><rect x="160" y="51" width="18" height="47" rx="3" fill={`url(#${uid}-gold)`} stroke="#b49044"/></g>)}
 {order.map((_,i)=><g key={i}><text x={169+i*40} y="26" textAnchor="middle" className="pin-number">{i+1}</text>{checked&&errors.includes(i)&&<rect x={153+i*40} y="44" width="32" height="242" rx="6" fill="none" stroke="#c64d48" strokeWidth="3"/>}{selected===i&&<rect x={151+i*40} y="44" width="36" height="242" rx="6" fill="none" stroke="#087f8c" strokeWidth="4"/>}</g>)}
 <path d="M220 294v92h181v-92" fill="#9eafbd"/><path d="M231 295v90M390 295v90" stroke="#d1dce4" strokeWidth="4"/>
 <path d="M141 254h339v39H141z" fill="#c2d1ddbb" stroke="#8ea4b5"/><text x="312" y="345" textAnchor="middle" className="jacket-label">外护套</text>
 </svg><div className="direction-note"><strong>观察方向始终固定</strong><p>请勿把插头翻面后直接照抄线序。</p><svg viewBox="0 0 150 120" aria-hidden="true"><path d="M31 18h64v61H31z" fill="#edf3f7" stroke="#90a8b9" strokeWidth="2"/><path d="M94 37 116 49v35l-8-8V55l-14-5" fill="#d5e2eb" stroke="#90a8b9" strokeWidth="2"/><path d="M53 79v27h27V79" fill="#a4b8c7"/><path d="M105 31h34M24 14H10v52h14" fill="none" stroke="#087f8c"/><text x="10" y="118" fontSize="13" fill="#536982">侧视：卡扣位于背面</text></svg><p>1 号在左，8 号在右。</p></div></div>
 <div className="wire-buttons" aria-label="点击两根线交换位置">{order.map((w,i)=><button key={i} aria-label={`第${i+1}位 ${wires[w].name}，点击选择交换`} aria-pressed={selected===i} className={`${selected===i?'selected':''} ${checked&&errors.includes(i)?'wrong':''}`} onClick={()=>swap(i)}><span className="wire-index">{i+1}</span><WireSwatch wire={w}/><span>{wires[w].name}</span></button>)}</div>
 <p className="hint">依次点击两根线可交换位置；白色条纹线与同色实线是不同线芯。</p>
 </section><aside className="inspector"><StandardSelector value={standard} onChange={v=>{setStandard(v);setChecked(false);setPractice(false);setSelected(null);}}/>
 <p>橙、绿两对交换位置；蓝、棕两对保持不变。变化发生在 <strong>1、2、3、6</strong> 号位。</p>
 <label className="check-control"><input type="checkbox" checked={hideReference} onChange={e=>setHideReference(e.target.checked)}/>隐藏参考线序，凭记忆练习</label>
 {!hideReference?<ReferenceRows/>:<div className="reference-hidden">参考线序已隐藏。可随时取消勾选查看。</div>}
 <div className="button-row"><button onClick={shuffle}><Icon name="shuffle"/>打乱练习</button><button className="primary" onClick={()=>{setChecked(true);setSelected(null);}}><Icon name="check"/>检查线序</button></div>
 <div className={`feedback ${checked?(errors.length?'error':'success'):''}`} role="status">{checked?(errors.length?`还需调整：第 ${errors.map(i=>i+1).join('、')} 位。请对照目标 T568${standard} 检查。`:`线序正确：符合 T568${standard}。接下来可以制作水晶头。`):selected!==null?`已选第 ${selected+1} 位，再点击另一根线交换。`:'先选标准，观察线序；再打乱并尝试恢复。'}</div>
 <a className="next-lesson" href="#/physical/twisted/crimp"><Icon name="arrow"/>下一步：水晶头制作</a>
 </aside></div>;
}

function Crimp({standard,setStandard}:{standard:Standard;setStandard:(v:Standard)=>void}){
 const [step,setStep]=useState(0);const [playing,setPlaying]=useState(false);const [fault,setFault]=useState<'none'|'short'|'jacket'>('none');const uid=useId().replaceAll(':','');
 useEffect(()=>{if(!playing)return;const id=setInterval(()=>setStep(v=>{if(v>=5){setPlaying(false);return 6;}return v+1;}),2600);return()=>clearInterval(id);},[playing]);
 const inserted=step>=4;const jacketTop=step===0?108:inserted?(fault==='jacket'?308:251):292;
 return <div className="lesson-layout"><section className="experiment"><div className="experiment-heading"><h2>从线缆到水晶头</h2><span>{step+1} / {crimpSteps.length}</span></div>
 <ol className="stepper">{crimpSteps.map((s,i)=><li key={s.title}><button className={i===step?'active':i<step?'done':''} onClick={()=>{setStep(i);setPlaying(false);}} aria-current={i===step?'step':undefined}><span>{i+1}</span>{s.title}</button></li>)}</ol>
 <div className="wide-diagram"><svg className="crimp-svg" viewBox="0 0 800 405" role="img" aria-label={`制作步骤${step+1}：${crimpSteps[step].title}`}><WireDefs prefix={uid}/>
 <g className="animated-svg" style={{transform:`translateX(${inserted?0:180}px)`,opacity:step===0?.8:1}}><path d="M222 38h349v240l-18 18H241l-19-18z" fill="#dfeaf155" stroke="#9fb3c1" strokeWidth="2"/><path d="M238 252h317v31H238z" fill="#b3c5d355" stroke="#9aafbf"/><text x="398" y="24" textAnchor="middle">插头前端</text></g>
 {orders[standard].map((w,i)=>{const x=253+i*38;const top=step===0?100:step===1?87+(i%3)*19:step===2?66+(i%4)*12:inserted?(fault==='short'&&i===7?112:59):79;
 return <g key={w} className="animated-svg"><path d={step<2?`M${x} 337Q${x+(i%2?20:-20)} 195 ${x} ${top}`:`M${x} 337V${top}`} stroke={wireFill(w,uid)} strokeWidth="20" fill="none" className="animated-svg"/><text x={x} y="371" textAnchor="middle" fontSize="17">{wires[w].name}</text></g>;})}
 <g className="animated-svg" style={{transform:`translateX(${inserted?0:180}px)`}}>{orders[standard].map((_,i)=><rect key={i} x={245+i*38} y={step>=5?57:44} width="14" height="40" rx="3" fill="#d6b054" className="animated-svg"/>)}</g>
 <rect x="223" y={jacketTop} width="329" height={350-jacketTop} rx="10" fill="#9bafc0" className="animated-svg"/><path d={`M234 ${jacketTop+8}v${335-jacketTop}`} stroke="#c9d6e0" strokeWidth="5"/>
 {step===1&&<><path d="M182 289h388" stroke="#d18a40" strokeDasharray="6 5" strokeWidth="2"/><text x="20" y="315">只剥外护套</text><path d="M138 309 221 298" className="callout"/></>}
 {step===3&&<><path d="M209 80h365" stroke="#c65b4c" strokeDasharray="5 4" strokeWidth="2"/><text x="30" y="77">剪齐，不去掉线芯绝缘</text></>}
 {step===4&&<><text x="24" y="140">逐根检查是否到底</text><path d="M160 135 537 65" className="callout"/></>}
 {step===5&&<g><path d="M235 2h321v32H235z" fill="#526a7d"/><path d="M310 0v-8M480 0v-8" stroke="#526a7d"/><path d="M398 13v33m-7-8 7 8 7-8" stroke="#fff" fill="none" strokeWidth="2"/><text x="28" y="210">触点压入并接触导体</text><path d="M180 203 250 77" className="callout"/></g>}
 {step>=4&&<><path d={`M560 ${jacketTop+12}h110`} className="callout"/><text x="590" y={Math.min(340,jacketTop+38)}>护套位置</text></>}
 {step===6&&<text x="399" y="399" textAnchor="middle" fill={fault==='none'?'#087f8c':'#b7453d'}>{fault==='none'?'制作完成，进入接线检测':fault==='short'?'第 8 根线未到底，可能开路':'护套未进入压线部位，机械固定不合格'}</text>}
 </svg></div><p className="diagram-hint">可左右滑动查看完整图示。</p>
 <div className="playback"><button className="primary" onClick={()=>{if(step===6)setStep(0);setPlaying(v=>!v);}}><Icon name={playing?'pause':'play'}/>{playing?'暂停':'播放步骤'}</button><button disabled={step===0} onClick={()=>{setPlaying(false);setStep(v=>v-1);}}>上一步</button><button disabled={step===6} onClick={()=>{setPlaying(false);setStep(v=>v+1);}}>下一步</button><button onClick={()=>{setPlaying(false);setStep(0);setFault('none');}}><Icon name="reset"/>重置</button></div>
 </section><aside className="inspector"><StandardSelector value={standard} onChange={setStandard}/><h3>第 {step+1} 步 · {crimpSteps[step].title}</h3><p>{crimpSteps[step].detail}</p><div className="teaching-note">{crimpSteps[step].check}</div><label className="field-label">对比制作错误<select value={fault} onChange={e=>{setFault(e.target.value as typeof fault);setStep(4);setPlaying(false);}}><option value="none">正确插入与固定</option><option value="short">一根线芯没有插到底</option><option value="jacket">外护套没有进入压线部位</option></select></label><p className="hint">图形为普通非贯通式插头的工序示意，不按实物尺寸。透明视图用于看清内部。</p><a className="next-lesson" href="#/physical/twisted/tester"><Icon name="arrow"/>下一步：接线检测</a></aside></div>;
}

function CableTester(){
 const [a,setA]=useState<Standard>('B');const [b,setB]=useState<Standard>('B');const [fault,setFault]=useState<Fault>('none');const [index,setIndex]=useState(-1);const [running,setRunning]=useState(false);const map=testMapping(a,b,fault);
 const reset=()=>{setRunning(false);setIndex(-1);};
 useEffect(()=>{if(!running)return;const id=setInterval(()=>setIndex(v=>{if(v>=6){setRunning(false);return 7;}return v+1;}),600);return()=>clearInterval(id);},[running]);
 const hasFault=fault==='open'||fault==='swap'||fault==='short';
 const result=fault==='split'?'8 根线均能导通，但这是拆对示例。普通通断测试无法确认线对性能，应使用能够检测拆对与传输参数的测试仪。':fault==='open'?'第 3 根线开路：主机发送测试脉冲，远端没有对应指示。':fault==='swap'?'第 1、2 根线错接：对应的远端指示位置交换了。':fault==='short'?'第 3、4 根线短路：测试其中一根时，远端出现两个响应。':a===b?'两端采用相同标准，形成直通线：A—A 和 B—B 都可以。':'两端分别采用 A/B：1→3、2→6、3→1、6→2。这是常见 10/100BASE-T 交叉接线示例。';
 return <div className="lesson-layout"><section className="experiment"><div className="experiment-heading"><h2>测线仪：逐根追踪连接</h2><span>已扫描 {index+1} / 8</span></div><p className="orientation">两端各自按“触点朝你、线缆向下”编号</p><div className="tester-headings"><strong>本端 · T568{a}</strong><strong>远端 · T568{b}</strong></div><div className="tester-map">{Array.from({length:8},(_,i)=><div className={`test-row ${index===i?'scanning':''}`} key={i}><div className={`led ${index===i?'on':''}`}>{i+1}</div><span className="test-color"><WireSwatch wire={orders[a][i]}/>{wires[orders[a][i]].name}</span><div className={`test-line ${i<=index?'tested':''} ${hasFault&&((fault==='open'&&i===2)||(fault==='swap'&&i<2)||(fault==='short'&&(i===2||i===3)))?'fault':''}`}><span>{i<=index?(map[i].length?`${i+1} → ${map[i].join('、')}`:'无响应 / 开路'):'等待测试'}</span></div><span className="test-destination">{i<=index?(map[i].length?map[i].map(n=><span className="destination-pin" key={n}>{n}</span>):'—'):'·'}</span><div className={`led ${index>=0&&map[index]?.includes(i+1)?'on':''}`}>{i+1}</div></div>)}</div>
 <div className="playback"><button className="primary" onClick={()=>{if(index===7)setIndex(-1);setRunning(v=>!v);}}><Icon name={running?'pause':'play'}/>{running?'暂停扫描':'开始扫描'}</button><button disabled={index===7} onClick={()=>{setRunning(false);setIndex(v=>v+1);}}><Icon name="step"/>下一根</button><button onClick={reset}><Icon name="reset"/>重置</button></div></section>
 <aside className="inspector"><StandardSelector label="本端标准" value={a} onChange={v=>{setA(v);reset();}}/><StandardSelector label="远端标准" value={b} onChange={v=>{setB(v);reset();}}/><label className="field-label">故障场景<select value={fault} onChange={e=>{setFault(e.target.value as Fault);reset();}}><option value="none">无故障</option><option value="open">第 3 根线开路</option><option value="swap">第 1、2 根线错接</option><option value="short">第 3、4 根线短路</option><option value="split">拆对：通断正常，线对错误</option></select></label><div className={`feedback ${index===7?(hasFault?'error':'success'):''}`} role="status">{index===7?result:'选择两端标准和故障条件，再开始扫描。先预测远端哪一个灯会亮。'}</div><h3>导通 ≠ 性能合格</h3><p>简单测线仪不能证明千兆能力、串扰或衰减合格。拆对是破坏物理线对关系，即使两端同样错接也可能显示 1—8 全通。</p><p className="hint">现代设备常支持 Auto-MDI-X，自动适配直通 / 交叉关系；这不意味着错误线序或拆对可以忽略。</p></aside></div>;
}

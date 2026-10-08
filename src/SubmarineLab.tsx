import {useState} from 'react';
import {ArtSprite} from './StoryArt';
import {Diagram,Dot,Fact,Playback,Stage,usePlayback} from './AdvancedUI';
const layers=[
 {name:'外部铠装',color:'#61727e',detail:'浅海、近岸可能增加一层或两层钢丝铠装及外被，抵抗机械损伤。深海轻型段通常不采用相同的外部铠装。'},
 {name:'聚乙烯绝缘护套',color:'#253f54',detail:'隔离海水，提供电绝缘与外部保护。外护套不是用来传输数据的。'},
 {name:'铜导电层',color:'#cc8f55',detail:'长距离有中继海缆由岸站馈电。铜层承担供电导体功能；用户数据主要以光信号在玻璃光纤中传送。'},
 {name:'抗拉钢丝',color:'#aebecb',detail:'承受铺设、回收过程的张力并提供机械保护；与浅海额外添加的外部铠装区分开。'},
 {name:'保护钢管',color:'#74899b',detail:'金属管保护中心光纤单元。本图以 OCC 的一种海缆结构为参考，厂商和型号的层次、材料会有差异。'},
 {name:'阻水材料',color:'#b4d9d8',detail:'填充中心单元，限制水沿缆芯纵向扩散；并非整个海缆内部都能被海水自由灌入。'},
 {name:'光纤',color:'#e3a543',detail:'一根海缆可容纳多根光纤，每根纤芯中可使用波分复用同时传输多个波长信道。这里的彩色小点表示独立光纤。'}
];
export default function SubmarineLab({lesson}:{lesson:string}){return lesson==='sea-structure'?<Construction/>:<Laying/>;}
function Construction(){
 const [active,setActive]=useState(6),[shallow,setShallow]=useState(true),[explode,setExplode]=useState(false);const clock=usePlayback(10);
 const radii=[147,129,105,94,60,44,20];
 return <div className="lesson-layout"><Stage title="数据在玻璃里，电力走铜层" tag="海缆横截面 + 水下系统">
 <div className="button-row compact-row"><button className={shallow?'selected':''} onClick={()=>{setShallow(true);}}>近岸铠装段</button><button className={!shallow?'selected':''} onClick={()=>{setShallow(false);if(active===0)setActive(1);}}>深海轻型段</button><button onClick={()=>setExplode(!explode)}>{explode?'合拢剖面':'展开各层'}</button></div>
 <Diagram label="海底光缆各层结构及岸站、中继器和分支单元"><g transform="translate(211 175)">{layers.map((l,i)=>i===0&&!shallow?null:<g key={l.name} transform={`translate(${explode?(6-i)*-13:0} ${explode?(6-i)*-3:0})`} className="layer-transition"><circle r={radii[i]} fill={l.color} stroke={active===i?'#eeb743':'#fff'} strokeWidth={active===i?4:1}/>{i===0&&Array.from({length:45},(_,j)=><circle key={j} cx={137*Math.cos(j*2*Math.PI/45)} cy={137*Math.sin(j*2*Math.PI/45)} r="4" fill="#b2bec5"/>)}{i===3&&Array.from({length:20},(_,j)=><circle key={j} cx={77*Math.cos(j*2*Math.PI/20)} cy={77*Math.sin(j*2*Math.PI/20)} r="8" fill="#e2e8ec" stroke="#8b9aaa"/>)}{i===6&&<><circle r="21" fill="#a9d6d7"/>{Array.from({length:8},(_,j)=><circle key={j} cx={14*Math.cos(j*2*Math.PI/8)} cy={14*Math.sin(j*2*Math.PI/8)} r="4.5" fill={['#e3943c','#50939c','#688ec5','#b58ba9'][j%4]}/>)}</>}</g>)}</g>
 <text x="402" y="60" className="svg-title">{shallow?'近岸：加强机械保护':'深海：减轻外部铠装'}</text>{layers.map((l,i)=>i===0&&!shallow?null:<g key={l.name}><circle cx="416" cy={89+i*29} r="5" fill={l.color}/><text x="434" y={95+i*29} fontWeight={active===i?700:400}>{l.name}{active===i?' ← 当前观察':''}</text></g>)}
 <path d="M65 378H735" stroke="#257d8b" strokeWidth="3"/><path d="M470 378L530 329H680" stroke="#257d8b" fill="none" strokeWidth="3"/><rect x="40" y="352" width="69" height="47" rx="6" fill="#e1edf0" stroke="#6da8af"/><text x="74" y="381" textAnchor="middle">岸站</text>{[260,620].map(x=><g key={x}><rect x={x-29} y="365" width="58" height="26" rx="12" fill="#66879d"/><text x={x} y="418" textAnchor="middle">光放大中继器</text></g>)}<circle cx="470" cy="378" r="13" fill="#dfa957"/><text x="450" y="418" textAnchor="middle">分支单元</text><text x="545" y="318">支路通向其他登陆站</text><Dot x={110+clock.time/10*625} y={378}/></Diagram>
 <Playback clock={clock}/><p className="model-caption">结构为代表性示意，尺寸不按比例；光纤数目和铠装层数随系统而异。图中只展示少量中继器，不表示实际间距。</p></Stage><aside className="inspector"><h2>逐层认识海缆</h2><div className="stack-buttons">{layers.map((l,i)=><button key={l.name} disabled={i===0&&!shallow} className={active===i?'selected':''} onClick={()=>setActive(i)}><span style={{background:l.color}}/>{i+1}. {l.name}</button>)}</div><Fact title={layers[active].name}>{layers[active].detail}</Fact><p>在长距离有中继系统中，中继器补偿光信号损耗。它通常是光放大设备，不能把它理解成每隔一段就把 IP 包路由一次。</p></aside></div>
}
const stages=[
 ['海床勘测','调查水深、海床地形与地质，避开高风险区域，设计登陆点与路由。不是在地图上画一条直线就开工。'],
 ['制造与装船','制造、测试海缆，把不同保护等级的缆段及中继器按铺设顺序装入缆舱，并记录连接与测试结果。'],
 ['近岸登陆','将岸端引入登陆设施，按场地条件采用牵引、浮筒辅助或管道等方法，连接陆地光纤与供电设备。'],
 ['深海放缆','船沿勘测路线前进，按船速、水深与张力控制放缆。缆从船尾形成弯曲悬垂段，逐步落到海床。'],
 ['浅海埋设','在可埋设且风险较高的海域，使用海犁或遥控潜水器开沟埋缆，减少渔具、船锚等外力风险。'],
 ['检测与交付','进行连接、系统测试和铺设后检查，记录实际路由；投运后持续监测，故障时定位并由维修船修复。']
];
function Laying(){
 const clock=usePlayback(36),stage=Math.min(5,Math.floor(clock.time/6)),p=clock.time/6-stage;
 const shipX=stage===3?420+p*315:510;
 const seabed=[{x:20,y:160},{x:120,y:170},{x:220,y:230},{x:300,y:322},{x:460,y:355},{x:610,y:365},{x:780,y:346}];
 const touchX=shipX-165;const section=seabed.findIndex((v,i)=>i>0&&v.x>=touchX);const a=seabed[section-1],b=seabed[section];const touchY=a.y+(touchX-a.x)/(b.x-a.x)*(b.y-a.y);
 const seabedD=seabed.map((v,i)=>`${i?'L':'M'}${v.x} ${v.y}`).join('');
 const laidD=seabed.filter(v=>v.x<touchX).map((v,i)=>`${i?'L':'M'}${v.x} ${v.y}`).join('')+`L${touchX} ${touchY}`;
 return <div className="lesson-layout"><Stage title="一条跨洋光缆怎样落到海底？" tag={`步骤 ${stage+1} / 6`}>
 <ol className="laying-steps">{stages.map((s,i)=><li key={s[0]}><button className={stage===i?'selected':''} onClick={()=>{clock.setPlaying(false);clock.setTime(i*6);}}><span>0{i+1}</span>{s[0]}</button></li>)}</ol>
 <Diagram label={`海底光缆铺设第${stage+1}步：${stages[stage][0]}`}><defs><linearGradient id="sea-water" x2="0" y2="1"><stop stopColor="#e8f7fb"/><stop offset="1" stopColor="#b7d4e4"/></linearGradient></defs><rect x="20" y="112" width="760" height="281" rx="12" fill="url(#sea-water)"/><path d="M20 109Q47 100 80 109T140 109T200 109T260 109T320 109T380 109T440 109T500 109T560 109T620 109T680 109T740 109H780" stroke="#7bbbcf" strokeWidth="2" fill="none"/><path d={seabedD+"V410H20Z"} fill="#ccd0c5"/><path d={seabedD} stroke="#99a793" strokeWidth="2" fill="none"/><text x="31" y="146">近岸</text><text x="689" y="397">深海海床</text>
 <g transform={`translate(${shipX} 82)`}><ArtSprite art="ship" x={-94} y={-86} w={188} h={125}/><text x="122" y="-12">{stage===0?'勘测船':'专业铺缆船'} →</text></g>
 {stage===0&&<><path d={`M510 112L${355+p*40} 345M510 112L${670-p*30} 366`} stroke="#5da6b2" strokeDasharray="6 5"/><path d="M335 345Q493 390 680 363" fill="none" stroke="#d2943d" strokeWidth="4"/><text x="355" y="230">声学勘测 / 路由调查</text></>}
 {stage===1&&<g transform="translate(290 228)"><rect x="-180" y="-52" width="345" height="130" rx="12" fill="#f5f8fa" stroke="#8ba9b9"/><ArtSprite art="cableReel" x={-110} y={-56} w={155} h={136}/><text x="-24" y="106" textAnchor="middle">顺序储缆：卷盘 / 船内缆舱（示意）</text></g>}
 {stage===2&&<><ArtSprite art="landing" x={20} y={45} w={145} h={118}/><text x="87" y="43" textAnchor="middle">登陆站</text><path d="M87 139L159 158L475 121" fill="none" stroke="#df9b39" strokeWidth="4"/>{[200,260,320,380,440].map(x=><ellipse key={x} cx={x} cy={147-(x-200)*.12} rx="11" ry="7" fill="#de9142"/>)}<text x="196" y="211">浮筒辅助牵引（方法之一）</text></>}
 {stage===3&&<><path d={`M${shipX-65} 107C${shipX-67} 203 ${touchX+55} ${touchY} ${touchX} ${touchY}`} stroke="#d18a30" strokeWidth="4" fill="none"/><path d={laidD} fill="none" stroke="#d18a30" strokeWidth="3"/><text x={Math.min(510,shipX-38)} y="213">控制张力与放缆速度</text><text x="76" y="376">深海通常直接铺在海床上</text></>}
 {stage===4&&<><path d="M445 112L212 207" stroke="#7397ac" strokeWidth="2"/><path d="M40 172L138 182L207 212" fill="none" stroke="#d58d36" strokeWidth="4"/><g transform={`translate(${160+p*50} ${196+p*30}) rotate(31)`}><g transform="scale(-1 1)"><ArtSprite art="burialRobot" x={-64} y={-89} w={128} h={90}/></g></g><text x="319" y="220">履带式埋缆机器人（设备之一）</text><text x="324" y="252">在合适海床埋设，不是把全程挖沟</text></>}
 {stage===5&&<><path d={seabedD} fill="none" stroke="#168d94" strokeWidth="4"/><g transform="translate(431 226)"><rect x="-135" y="-42" width="270" height="105" rx="10" fill="#f6fbfc" stroke="#8dbbc3"/><text x="-111" y="-9">✓ 光学与系统测试</text><text x="-111" y="21">✓ 路由记录与验收</text><text x="-111" y="49">✓ 投运后的持续监测</text></g></>}
 </Diagram><Playback clock={clock} label="施工流程进度"/><p className="model-caption">施工顺序与作业方法的教学概括。水深、船速、张力和缆形均非工程计算；岸端作业、深海铺设和埋设施工可交错实施。</p></Stage><aside className="inspector"><h2>{stage+1}. {stages[stage][0]}</h2><p className="stage-explanation">{stages[stage][1]}</p><Fact title="为什么不是拉得越紧越好？">必须兼顾张力、弯曲半径与适当余量。过紧可能损伤，余量失控也会给铺设与后续维护带来问题。</Fact><p>课堂提问：为什么浅海段往往需要更强保护，而水更深的海域反而常采用轻型缆？</p><a className="next-lesson" href="#/physical/fiber/global-map">再看全球线路如何连接各大洲 →</a></aside></div>
}

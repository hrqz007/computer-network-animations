import {ArtSprite} from './StoryArt';
import {storyState} from './switchStoryModel';
import type {SwitchHost} from './switchModel';
type Point=[number,number];
const paths={A:[[190,240],[275,240],[350,240]],B:[[645,105],[585,105],[585,195],[520,195]],C:[[645,350],[585,350],[585,265],[520,265]]} satisfies Record<SwitchHost,Point[]>;
const colors={A:'#447bb4',B:'#39977c',C:'#bd8656'};
const names={A:'小安',B:'小白',C:'小陈'};
function along(path:Point[],p:number):Point{
 const lengths=path.slice(1).map((point,i)=>Math.hypot(point[0]-path[i][0],point[1]-path[i][1]));
 let distance=lengths.reduce((a,b)=>a+b,0)*Math.max(0,Math.min(1,p));
 for(let i=0;i<lengths.length;i++){if(distance<=lengths[i])return [path[i][0]+(path[i+1][0]-path[i][0])*distance/lengths[i],path[i][1]+(path[i+1][1]-path[i][1])*distance/lengths[i]];distance-=lengths[i];}return path[path.length-1];
}
function Envelope({point,source,target,opacity=1}:{point:Point;source:SwitchHost;target:SwitchHost;opacity?:number}){return <g transform={`translate(${point[0]},${point[1]})`} opacity={opacity} className="story-envelope"><ArtSprite art="envelope" x={-65} y={-59} w={130} h={116}/><text x="0" y="13" textAnchor="middle" className="letter-from">来自 {source}</text><text x="0" y="40" textAnchor="middle" className="letter-to">给 {target}</text></g>;}
function Computer({host,x,y,status,active=false,muted=false}:{host:SwitchHost;x:number;y:number;status?:string;active?:boolean;muted?:boolean}){return <g transform={`translate(${x},${y})`} opacity={muted?.55:1}>
 <ellipse cx="75" cy="118" rx="85" ry="10" fill={colors[host]} opacity={active?.18:.06}/><ArtSprite art={host==='A'?'studentA':host==='B'?'studentB':'studentC'} x={-15} y={-32} w={180} h={169}/><circle cx="3" cy="99" r="17" fill={colors[host]}/><text x="3" y="106" textAnchor="middle" style={{fill:"white",fontSize:20,fontWeight:700}}>{host}</text>
 <text x="75" y="144" textAnchor="middle" className="story-host-name">电脑 {host} · {names[host]}</text>
 {status&&<g className="story-host-bubble"><rect x="-5" y="-48" width="160" height="35" rx="12" fill="white" stroke={colors[host]}/><path d="M70-13L79-4 88-13" fill="white" stroke={colors[host]}/><text x="75" y="-25" textAnchor="middle">{status}</text></g>}
 </g>;}

export default function SwitchStoryScene({index,progress}:{index:number;progress:number}){
 const {scene,frame,known}=storyState(index,progress),action=scene.action;
 const movement=Math.max(0,Math.min(1,(progress-.08)/.78));
 const firstReceived=action==='receive',replyReceived=action==='deliver'&&movement>.9,lastReceived=(action==='again'&&progress>.94)||action==='finish';
 const output=action==='flood'||firstReceived?['B','C']:action==='deliver'?['A']:action==='again'&&progress>.45||action==='finish'?['B']:[];
 const input=action==='send'||action==='learn'&&scene.frame===0?'A':action==='reply'||action==='learn'&&scene.frame===1?'B':action==='again'&&progress<.45?'A':null;
 const hold=['learn','lookup'].includes(action);
 return <div className="story-canvas"><svg viewBox="0 0 1160 455" role="img" aria-label={`${scene.title} 当前认路本：${known.length?known.map(h=>`${h} 在 ${h==='A'?1:2} 号口`).join('，'):'还没有记录'}。`}>
  <rect width="1160" height="455" rx="18" fill="#f7faf9"/>
  <path d="M26 399C225 366 432 440 638 414S985 422 1133 392" fill="none" stroke="#e9efec" strokeWidth="2"/>
  {(Object.entries(paths) as [SwitchHost,Point[]][]).map(([host,path])=><g key={host}><polyline points={path.map(p=>p.join(',')).join(' ')} fill="none" stroke="#d5e0e4" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>{(input===host||output.includes(host))&&<polyline points={path.map(p=>p.join(',')).join(' ')} fill="none" stroke={input===host?'#86a9cb':output.length>1?'#d6ab64':'#62a995'} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>}</g>)}
  <Computer host="A" x={40} y={193} active={input==='A'||replyReceived} status={replyReceived?'回信收到了！':action==='send'?'给 B 发条消息':undefined}/>
  <Computer host="B" x={645} y={58} active={input==='B'||firstReceived||lastReceived} status={firstReceived||lastReceived?'给 B 的，是我的！':action==='reply'?'我来回一封信':undefined}/>
  <Computer host="C" x={645} y={298} muted={replyReceived||lastReceived} status={firstReceived?'不是给我的，忽略':replyReceived||lastReceived?'这次没收到副本':undefined}/>
  <g className="story-switch"><rect x="350" y="156" width="170" height="142" rx="24" fill="#e9f3ed" stroke="#b4d0c2"/><ArtSprite art="switch" x={345} y={183} w={180} h={83}/><text x="435" y="182" textAnchor="middle" className="story-switch-title">交换机</text>
   <text x="435" y="279" textAnchor="middle" className="story-switch-sub">负责转交消息</text>
  </g>
  {[[1,350,240],[2,520,195],[5,520,265]].map(([n,x,y])=><g key={n}><rect x={x-11} y={y-9} width="22" height="18" rx="4" fill="#3f7469"/><text x={n===1?x-18:x+20} y={y-17} textAnchor={n===1?'end':'start'} className="story-port">{n} 号口</text></g>)}
  <g className="story-dialogue"><rect x="246" y="23" width="369" height="76" rx="18" fill="white" stroke="#b2cebf" strokeWidth="2"/><path d="M417 98L432 118 447 98" fill="white" stroke="#b2cebf" strokeWidth="2"/><text x="430" y="55" textAnchor="middle" className="story-dialogue-who">交换机心里想</text><text x="430" y="82" textAnchor="middle" className="story-dialogue-text">{scene.says}</text></g>
  <g className="story-notebook"><ArtSprite art="notebook" x={812} y={35} w={340} h={340}/>
   <text x="990" y="103" textAnchor="middle" className="story-book-title">交换机的「认路本」</text><text x="990" y="130" textAnchor="middle" className="story-book-sub">谁从哪个口来，就记住谁</text>
   <path d="M876 143H1105M876 209H1105M876 275H1105" stroke="#eadfc9"/>
   {known.map((host,i)=><g key={host} className="story-book-entry"><rect x="877" y={153+i*66} width="225" height="47" rx="8" fill={host==='A'?'#e9f1fc':'#e8f5ed'} stroke={scene.action==='learn'&&host===frame.source?colors[host]:'none'} strokeWidth="2"/><text x="892" y={183+i*66} className="story-book-row" fill={colors[host]}>{host} → {host==='A'?1:2} 号口</text></g>)}
   {known.length===0&&<><text x="990" y="195" textAnchor="middle" className="story-book-empty">还是空白的</text><text x="990" y="225" textAnchor="middle" className="story-book-sub">等有信进来，再慢慢记</text></>}
   {action==='lookup'&&<g><rect x="877" y="219" width="225" height="47" rx="8" fill="#fff0cf" stroke="#d0a34e" strokeDasharray="5 4"/><text x="989" y="249" textAnchor="middle" className="story-book-row">B → ？</text></g>}
   <text x="990" y="325" textAnchor="middle" className="story-book-sub">{index>=5?'收到了信 ≠ 学到了收件人':'只记信从哪个口进来'}</text>
  </g>
  {action==='meet'&&<g><path d="M221 267Q245 312 302 313" fill="none" stroke="#bf9460" strokeWidth="2" strokeDasharray="5 5"/><text x="194" y="355" className="story-gentle-label">网线就像送信的通道</text></g>}
  {(action==='send'||action==='reply')&&<Envelope point={along(paths[frame.source],movement)} source={frame.source} target={frame.destination as SwitchHost}/>}
  {hold&&<Envelope point={[435,371]} source={frame.source} target={frame.destination as SwitchHost}/>}
  {action==='learn'&&progress>.14&&progress<.78&&(()=>{const t=(progress-.14)/.64;return <g transform={`translate(${530+460*t},${(1-t)**2*345+2*(1-t)*t*165+t*t*(scene.frame===0?177:243)})`}><rect x="-78" y="-23" width="156" height="46" rx="9" fill={frame.source==='A'?'#e9f1fc':'#e8f5ed'} stroke={colors[frame.source]} strokeWidth="2"/><text textAnchor="middle" y="7" className="story-book-row">{frame.source} → {scene.frame===0?1:2} 号口</text></g>;})()}
  {action==='flood'&&(['B','C'] as SwitchHost[]).map((host,i)=><Envelope key={host} source="A" target="B" point={along([...paths[host]].reverse(),Math.max(0,(movement-i*.12)/(1-i*.12)))}/>)}
  {action==='deliver'&&<Envelope source="B" target="A" point={along([...paths.A].reverse(),movement)} opacity={movement>.94?.25:1}/>}
  {action==='again'&&<Envelope source="A" target="B" point={progress<.45?along(paths.A,progress/.45):along([...paths.B].reverse(),(progress-.45)/.55)} opacity={progress>.97?.25:1}/>}
  {(action==='finish'||action==='receive')&&<g><rect x="339" y="344" width="204" height="56" rx="12" fill={action==='finish'?'#e1f1e8':'#fff0d6'}/><text x="441" y="369" textAnchor="middle" className="story-recap-line">{action==='finish'?'认识路：只走目标出口':'不知道路：其他口各一份'}</text><text x="441" y="391" textAnchor="middle" className="story-book-sub">{action==='finish'?'小陈没有收到这一帧':'信封上仍然写着「给 B」'}</text></g>}
 </svg></div>;
}

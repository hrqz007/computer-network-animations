import {ArtSprite} from './StoryArt';
import {Label,mix} from './StoryVisuals';
import type {SceneProps} from './StoryVisuals';
import {STP_LINKS,STP_PRIORITIES,STP_SWITCHES,stpTree,stpPath,stpPriorities,stpRecovery,stpFloodRounds} from './stpModel';
import type {StpSwitch,StpEdge,StpPhase} from './stpModel';
type Point=[number,number];
const centers:Record<StpSwitch,Point>={S1:[540,88],S2:[300,263],S3:[780,263]};
const lines:Record<StpEdge,[Point,Point]>={'12':[[483,114],[341,228]],'13':[[597,114],[739,228]],'23':[[375,263],[705,263]]};
function pointOn(path:Point[],p:number):Point{const lens=path.slice(1).map((pt,i)=>Math.hypot(pt[0]-path[i][0],pt[1]-path[i][1]));let rest=lens.reduce((a,b)=>a+b,0)*Math.max(0,Math.min(1,p));for(let i=0;i<lens.length;i++){if(rest<=lens[i])return [mix(path[i][0],path[i+1][0],rest/lens[i]),mix(path[i][1],path[i+1][1],rest/lens[i])];rest-=lens[i];}return path[path.length-1];}
function Frame({point,control=false}:{point:Point;control?:boolean}){return control?<g transform={`translate(${point.join(' ')})`}><rect x="-27" y="-12" width="54" height="24" rx="7" fill="#537fb0"/><Label x={0} y={5} size={12} color="white">BPDU</Label></g>:<ArtSprite art="envelope" x={point[0]-23} y={point[1]-24} w={46} h={46}/>;}
export type StpDiagramProps={p?:number;down?:StpEdge|null;root?:StpSwitch;loop?:boolean;recovery?:boolean;phase?:StpPhase;election?:boolean;showFrame?:boolean;caption?:string;baseline?:boolean};
export function StpDiagram({p=0,down=null,root='S1',loop=false,recovery=false,phase=4,election=false,showFrame=true,caption,baseline=false}:StpDiagramProps){
 const priorities=root==='S1'?STP_PRIORITIES:stpPriorities(root),tree=stpTree(priorities,down),recover=recovery&&down?stpRecovery(priorities,down,phase):null;
 const active=loop?STP_LINKS.filter(l=>l.id!==down).map(l=>l.id):recover?.active??tree.active;
 const route=stpPath(active),pending=recover?.opening??[];
 const hops=stpFloodRounds(active),round=Math.min(hops.length-1,Math.floor(p*hops.length)),fraction=p>=1?1:p*hops.length-round;
 const copies=loop?hops.slice(0,round+(fraction>=.99?1:0)).flat().filter(h=>h.from==='S3').length:0;
 const waiting=recovery&&phase<4&&pending.length>0;
 const status=loop?(copies?`B 收到 ${copies} 份副本`:'B 等待广播'):!route.length?'B 暂时收不到':!showFrame?'':p>=.99?'B 收到这一帧':'B 等待消息';
 const text=caption??(loop?'广播不会自行倒数消失；动画只展示前 6 跳':waiting?'备用端口正在收敛，尚不能转发用户数据':`可转发路径：A → ${route.join(' → ')} → B`);
 return <>
  <rect x="20" y="14" width="1040" height="343" rx="24" fill="#f2f7f2"/>
  <g><rect x="40" y="34" width="220" height="111" rx="14" fill="#fffdf6" stroke="#e1e6da"/><Label x={58} y={61} size={16} anchor="start" color="#536a62">{election?'先比较桥 ID':'三台交换机 · VLAN 1'}</Label>{election?STP_SWITCHES.map((sw,i)=><Label key={sw} x={58} y={86+i*22} size={14} anchor="start">{sw}：优先级 {priorities[sw]}</Label>):<><Label x={58} y={88} size={15} anchor="start">{loop?'红色：形成转发环路':'绿色：可以转发数据'}</Label><Label x={58} y={115} size={15} anchor="start">{loop?'信封：同一广播的副本':'橙色：端口暂不放行'}</Label></>}</g>
  <Label x={894} y={65} size={18} color={loop?'#b85147':'#277765'}>{baseline?'现在，还没有备用路':loop?'备用线，也可能带来环路':recovery&&phase<4?'断线后，先等收敛':election?'由 BPDU 传递信息':'物理有冗余 · 转发无环'}</Label>
  <Label x={895} y={93} size={14}>{baseline?'下方链路尚未连接':election?'本例同为 VLAN 1':loop?'没有 STP 保护的对照':`每段链路代价 19 · 根桥 ${tree.root}`}</Label>
  <path d="M148 263H224 M856 263H932" fill="none" stroke="#77a69b" strokeWidth="5"/>
  {STP_LINKS.map(l=>{const [a,b]=lines[l.id],failed=l.id===down,on=active.includes(l.id);return <g key={l.id} data-link={l.id} data-forwarding={on}><path d={`M${a}L${b}`} stroke={failed?'#b7bfbe':loop?'#d37b5b':on?'#479885':'#9aada8'} strokeWidth="7" strokeLinecap="round" strokeDasharray={failed?'9 10':undefined}/>{failed&&<g transform={`translate(${mix(a[0],b[0],.5)} ${mix(a[1],b[1],.5)})`}><circle r="15" fill="#c6665d"/><Label x={0} y={7} size={26} color="white">×</Label></g>}</g>;})}
  <ArtSprite art="studentA" x={30} y={190} w={130} h={118}/><Label x={95} y={335} size={17}>A · 小安</Label>
  <ArtSprite art="studentB" x={920} y={190} w={130} h={118}/><Label x={985} y={335} size={17}>B · 小白</Label>
  <Label x={985} y={178} size={15} color={loop?'#ad5847':'#237d66'}>{status}</Label>
  {STP_SWITCHES.map(sw=>{const [x,y]=centers[sw],isRoot=tree.root===sw&&!loop&&!baseline;return <g key={sw}><ArtSprite art="switch" x={x-87} y={y-36} w={174} h={82}/><Label x={x} y={y+63} size={18}>{sw}{isRoot?' · 根桥':''}</Label>{!loop&&!election&&!baseline&&<Label x={x} y={y+84} size={14} color="#647d74">{recovery&&phase<4?'目标代价':'到根代价'} {tree.costs[sw]}</Label>}{isRoot&&<g><rect x={x-43} y={y-65} width="86" height="24" rx="12" fill="#f3deb0"/><Label x={x} y={y-48} size={14} color="#826225">计算参照点</Label></g>}</g>;})}
  {!loop&&!election&&tree.ports.filter(port=>port.role==='Altn'||pending.some(o=>o.switch===port.switch&&o.edge===port.edge)&&phase<4).map(port=>{const link=STP_LINKS.find(l=>l.id===port.edge)!,ends=lines[port.edge],atA=link.a===port.switch,t=atA?.1:.9,x=mix(ends[0][0],ends[1][0],t),y=mix(ends[0][1],ends[1][1],t),opening=pending.some(o=>o.switch===port.switch&&o.edge===port.edge),label=opening&&phase===2?'侦听':opening&&phase===3?'学习':'阻塞',labelX=port.edge==='23'?x:x+(port.edge==='13'?118:-118),labelY=port.edge==='23'?y+22:y-48;return <g key={port.switch+port.edge} data-blocked-port={`${port.switch} ${port.port}`}><circle cx={x} cy={y} r="15" fill="#c89238" stroke="#fffdf5" strokeWidth="3"/><path d={`M${x-6} ${y}h12`} stroke="white" strokeWidth="3"/><rect x={labelX-68} y={labelY} width="136" height="25" rx="8" fill="#fff4d9"/><Label x={labelX} y={labelY+17} size={14} color="#886125">{port.switch} {port.port} · {label}</Label></g>;})}
  {showFrame&&loop&&hops[round].filter(h=>h.from==='S3').map((_,i)=><Frame key={`copy-${i}`} point={pointOn([centers.S3,[929,263]],fraction)}/>)}
  {election&&STP_LINKS.map((l,i)=><Frame key={l.id} control point={pointOn(lines[l.id],i===1?1-p:p)}/>)}
  {showFrame&&!election&&(loop?hops[round].map((hop,i)=><Frame key={i} point={pointOn([centers[hop.from],centers[hop.to]],fraction)}/>):route.length?<Frame point={pointOn([[151,263],...route.map(sw=>centers[sw]),[929,263]],p)}/>:<Frame point={pointOn([[151,263],centers.S2,centers.S1,[659,164]],p)}/>)}
  <rect x="20" y="368" width="1040" height="32" rx="12" fill={loop?'#f8e9df':'#e6f0e8'}/><Label x={540} y={390} size={16} color={loop?'#9e5b41':'#386856'}>{text}</Label>
 </>;
}
export default function StpStoryScene({step,p}:SceneProps){
 const props:StpDiagramProps=step===0?{down:'23',baseline:true}:step===1?{loop:true}:step===2?{election:true,showFrame:false}:step===3?{showFrame:false}:step===5?{down:'13',recovery:true,phase:0}:step===6?{down:'13',recovery:true,phase:p<.5?2:3,showFrame:false}:step===7?{down:'13',recovery:true,phase:4}:step===8?{root:'S2'}:{};
 const captions=['只有上方两条链路：任何一条断开，A 与 B 就不通了','同一广播的副本在环中反复传播；不会因为本幕暂停而自动消失','本例优先级：4096 < 8192 < 12288，所以 S1 当选根桥','到根代价相同，再比较桥 ID：S2 更小，S3 的 Fa0/2 阻塞','已知单播只走树上的路径，B 收到一份','S1—S3 已断开；S3 Fa0/2 仍暂不转发数据','正在打开的是 S3 Fa0/2：侦听 → 学习 → 转发（时间压缩）','收敛后发出的新帧，改走 S2—S3 到达 B','将 S2 优先级改为 0 后的稳定结果：S3 Fa0/1 阻塞'];
 return <StpDiagram {...props} p={p} caption={captions[step]}/>;
}

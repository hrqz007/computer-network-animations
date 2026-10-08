import {ArtSprite} from './StoryArt';
import {Label,part,mix} from './StoryVisuals';
import type {SceneProps} from './StoryVisuals';
import type {ArtId} from './storyArtData';
import {VLAN_HOSTS,hostVlan,hostSwitch,vlanBroadcast,vlanStoryState} from './vlanModel';
import type {VlanHost,VlanId,VlanConfig} from './vlanModel';
type Point=[number,number];
const colors:Record<VlanId,string>={1:'#557e9f',10:'#168478',20:'#bd7829'};
const hosts:Record<VlanHost,{x:number;y:number;art:ArtId;name:string}>={A:{x:110,y:106,art:'studentA',name:'小安'},B:{x:970,y:106,art:'studentB',name:'小白'},C:{x:110,y:286,art:'studentC',name:'小陈'},D:{x:970,y:286,art:'server',name:'资料服务器'}};
function position(points:Point[],p:number):Point{
 const lengths=points.slice(1).map((point,i)=>Math.hypot(point[0]-points[i][0],point[1]-points[i][1]));let remaining=lengths.reduce((a,b)=>a+b,0)*Math.max(0,Math.min(1,p));
 for(let i=0;i<lengths.length;i++){if(remaining<=lengths[i])return [mix(points[i][0],points[i+1][0],remaining/lengths[i]),mix(points[i][1],points[i+1][1],remaining/lengths[i])];remaining-=lengths[i];}return points[points.length-1];
}
function Letter({point,vlan,tag=false}:{point:Point;vlan:VlanId;tag?:boolean}){return <g data-moving="vlan-frame" transform={`translate(${point[0]} ${point[1]})`}><ArtSprite art="envelope" x={-28} y={-32} w={56} h={57}/><Label x={0} y={15} size={12} color={colors[vlan]}>广播</Label>{tag&&<g data-vlan-tag={vlan}><rect x="-38" y="-53" width="76" height="25" rx="7" fill={colors[vlan]}/><Label x={0} y={-35} size={13} color="white">VID {vlan}</Label></g>}</g>;}
export function VlanDiagram({config,source,p=1,showFrame=true}:{config:VlanConfig;source:'A'|'C';p?:number;showFrame?:boolean}){
 const state=vlanBroadcast(source,config),sw1=config.dual?350:540,sw2=730;
 const paths=Object.fromEntries(VLAN_HOSTS.map(h=>{const left=h==='A'||h==='C',upper=h==='A'||h==='B',y=upper?106:286,x=left?185:895,portY=upper?194:217,center=left?sw1:config.dual?sw2:sw1,joint=left?(config.dual?235:340):(config.dual?845:740);return [h,[[x,y],[joint,y],[joint,portY],[center+(left?-80:80),portY]]];})) as Record<VlanHost,Point[]>;
 const trunk:Point[]=[[430,205],[650,205]];
 const recipientStart=config.dual?.74:.36,done=showFrame&&p>=.99;
 const caption=!showFrame?'接入口分组已经改变：广播转发按端口所属 VLAN 进行':p<.27?'① 主机发出广播：目的 MAC 为 FF:FF:FF:FF:FF:FF':!config.dual?`② 在 VLAN ${state.vlan} 中转发；不送回源端口`:p<.33?`② S1 根据接入口，归入 VLAN ${state.vlan}`:state.stop==='link-down'?'③ 上联未接通：相同 VLAN 号也不能隔空通信':state.stop==='s1-filter'?'③ S1 允许列表没有这个 VLAN：不从 Trunk 发出':state.stop==='s2-filter'&&p>=.68?'③ S2 允许列表没有这个 VLAN：收到后不能继续转发':p<.74?`③ Trunk 段：${state.tag?`携带 802.1Q 标签 VID ${state.tag}`:'本例 native VLAN 1 不带标签'}`:`④ S2 只转发给同 VLAN 的主机，Access 段不带标签`;
 return <>
  <rect x="22" y="27" width="1036" height="326" rx="22" fill="#f5f8f5"/>
  {config.divided?<><rect x="32" y="37" width="1016" height="133" rx="18" fill="#e4f2e9"/><rect x="32" y="218" width="1016" height="126" rx="18" fill="#faf0de"/><Label x={540} y={64} size={20} color={colors[10]}>VLAN 10 · 绿色组</Label><Label x={540} y={330} size={20} color={colors[20]}>VLAN 20 · 橙色组</Label></>:<Label x={540} y={62} size={22} color={colors[1]}>还没分组 · 全部在 VLAN 1</Label>}
  {config.divided&&config.bVlan===20&&<rect x="855" y="37" width="193" height="133" rx="18" fill="#faf0de"/>}
  {VLAN_HOSTS.map(h=><polyline key={h} points={paths[h].map(p=>p.join(',')).join(' ')} fill="none" stroke={colors[hostVlan(h,config)]} strokeOpacity=".4" strokeWidth="4" strokeLinejoin="round"/>)}
  {config.dual&&<><path d="M430 205H650" fill="none" stroke={config.linkUp?'#8b9eaa':'#c0c9cd'} strokeWidth="8" strokeDasharray={config.linkUp?undefined:'10 9'}/><Label x={540} y={135} size={17}>{config.linkUp?'一条 Trunk · 两端 Fa0/24':'上联尚未接通'}</Label><Label x={540} y={270} size={14}>{config.linkUp?`放行：S1 ${config.allowS1.filter(v=>v!==1).join('/')||'无'} · S2 ${config.allowS2.filter(v=>v!==1).join('/')||'无'}`:'VLAN 号相同 ≠ 已经连通'}</Label></>}
  {[sw1,...(config.dual?[sw2]:[])].map((x,i)=><g key={x}><rect x={x-89} y="151" width="178" height="100" rx="14" fill="#fdfefd" stroke="#d2dfd8"/><ArtSprite art="switch" x={x-82} y={170} w={164} h={76}/><Label x={x} y={166} size={16}>交换机 S{i+1}</Label></g>)}
  {VLAN_HOSTS.map(h=>{const host=hosts[h],vlan=hostVlan(h,config),receives=done&&state.recipients.includes(h),status=h===source?'发出广播':done?(receives?'收到广播':'没有收到'):hostSwitch(h,config);return <g key={h}><ArtSprite art={host.art} x={host.x-65} y={host.y-62} w={130} h={105}/><rect x={host.x-72} y={host.y+42} width="144" height="25" rx="8" fill={colors[vlan]}/><Label x={host.x} y={host.y+60} size={14} color="white">{h} · {host.name} · V{vlan}</Label><Label x={host.x} y={host.y-67} size={14} color={h===source||receives?colors[vlan]:'#697b86'}>{status}</Label>{config.divided&&h==='B'&&config.bVlan===20&&<Label x={host.x} y={host.y+87} size={13} color={colors[20]}>B 已改到 VLAN 20</Label>}</g>;})}
  {showFrame&&p<.27&&<Letter point={position(paths[source],part(p,0,.27))} vlan={state.vlan}/>}
  {showFrame&&config.dual&&p>=.27&&p<.74&&(state.leavesS1?<Letter point={position(trunk,part(p,.33,.68))} vlan={state.vlan} tag={!!state.tag}/>:<Letter point={[438,205]} vlan={state.vlan}/>)}
  {showFrame&&state.local.map(h=>p>=.36?<Letter key={h} point={position([...paths[h]].reverse(),part(p,.36,1))} vlan={state.vlan}/>:null)}
  {showFrame&&state.remote.map(h=>p>=recipientStart?<Letter key={h} point={position([...paths[h]].reverse(),part(p,recipientStart,1))} vlan={state.vlan}/>:null)}
  {showFrame&&state.stop&&p>=.68&&<g><circle cx={state.stop==='s2-filter'?647:440} cy="205" r="18" fill="#c75d63"/><Label x={state.stop==='s2-filter'?647:440} y={211} color="white" size={24}>×</Label></g>}
  <rect x="22" y="365" width="1036" height="33" rx="13" fill="#eaf1ed"/><Label x={540} y={387} size={16}>{caption}</Label>
 </>;
}
export default function VlanStoryScene({step,p}:SceneProps){const {config,source}=vlanStoryState(step);return <VlanDiagram config={config} source={source} p={step===4?p*.6:p} showFrame={step!==1}/>;}

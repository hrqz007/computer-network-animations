import {ArtSprite} from './StoryArt';
import {Label,mix} from './StoryVisuals';
import type {SceneProps} from './StoryVisuals';
import type {ArtId} from './storyArtData';
import {CHANNEL_FLOWS,channelModel,channelStoryConfig} from './channelModel';
import type {ChannelConfig,ChannelMember,ChannelFlowId} from './channelModel';
type Point=[number,number];
const hostY:Record<ChannelFlowId,number>={A:90,B:200,C:310};
const hostArt:Record<ChannelFlowId,ArtId>={A:'studentA',B:'studentB',C:'studentC'};
const memberY:Record<ChannelMember,number>={1:153,2:250};
const memberPoints=(member:ChannelMember):Point[]=>[[390,207],[424,memberY[member]],[656,memberY[member]],[690,207]];
function position(path:Point[],p:number):Point{const lengths=path.slice(1).map((pt,i)=>Math.hypot(pt[0]-path[i][0],pt[1]-path[i][1]));let remaining=lengths.reduce((a,b)=>a+b,0)*Math.max(0,Math.min(1,p));for(let i=0;i<lengths.length;i++){if(remaining<=lengths[i])return [mix(path[i][0],path[i+1][0],remaining/lengths[i]),mix(path[i][1],path[i+1][1],remaining/lengths[i])];remaining-=lengths[i];}return path[path.length-1];}
function Envelope({at,color,label}:{at:Point;color:string;label:string}){return <g transform={`translate(${at[0]} ${at[1]})`} data-channel-frame={label}><ArtSprite art="envelope" x={-22} y={-19} w={44} h={40}/><rect x="-18" y="-32" width="36" height="20" rx="7" fill={color}/><Label x={0} y={-18} size={12} color="white">{label}</Label></g>;}
export function ChannelDiagram({config,p=0,showFrames=true,train=false,negotiate=false,caption}:{config:ChannelConfig;p?:number;showFrames?:boolean;train?:boolean;negotiate?:boolean;caption?:string}){
 const state=channelModel(config),unformed=state.status==='unformed',grouped=config.bundle&&!unformed,ready=grouped&&(!negotiate||p>=.97),sent=showFrames&&p>=.99;
 const description=caption??(unformed?'聚合未形成：实际独立端口的转发状态，请结合设备输出判断':state.status==='down'?'两个成员都已断开：本例没有可用的交换机间通路':!config.bundle?`独立链路由 STP 防环；稳定后本例使用成员 ${state.active[0]} 转发`:`稳定分配示意：${state.flows.map(f=>`${f.id} → ${f.member?`成员 ${f.member}`:'等待重选'}`).join('　')}`);
 return <>
  <rect x="18" y="18" width="1044" height="338" rx="23" fill="#f1f7f2"/>
  {config.bundle&&<rect x="405" y="96" width="270" height="212" rx="28" fill={ready?'#e5f0e6':'#f0f0e9'} stroke={ready?'#82af91':'#b7c0b3'} strokeWidth="2" strokeDasharray="7 6"/>}
  <rect x="348" y="34" width="384" height="41" rx="14" fill={unformed?'#faecd9':'#e0eee3'}/><Label x={540} y={61} size={19} color={unformed?'#9b6b25':'#2c705c'}>{!config.bundle?'两根普通线 · 还没有聚合':unformed?'Po1 尚未形成':negotiate&&!ready?'LACP 协商过程（压缩示意）':state.status==='down'?'Po1 无可用成员':'Port-channel 1 · 一个逻辑接口'}</Label>
  {CHANNEL_FLOWS.map((flow,i)=>{const y=hostY[flow.id],enabled=i<config.flowCount;return <g key={flow.id} opacity={enabled?1:.25}><polyline points={`146,${y} 195,${y} 224,207 245,207`} fill="none" stroke={flow.color} strokeWidth="3" opacity=".4"/><ArtSprite art={hostArt[flow.id]} x={31} y={y-47} w={116} h={88}/><rect x="44" y={y+37} width="90" height="24" rx="9" fill={flow.color}/><Label x={89} y={y+54} size={14} color="white">{flow.id} → D{enabled?'':' · 暂停'}</Label></g>;})}
  <path d="M835 207H926" fill="none" stroke="#77a99b" strokeWidth="5"/>
  {state.lanes.map(lane=><g key={lane.member} data-channel-member={lane.member} data-member-active={lane.active}>
   <polyline points={memberPoints(lane.member).map(pt=>pt.join(',')).join(' ')} fill="none" stroke={!lane.up?'#b7c1bc':lane.active?'#579c86':'#9eaead'} strokeWidth="7" strokeDasharray={!lane.up?'8 8':undefined} strokeLinejoin="round"/>
   <Label x={540} y={lane.member===1?111:322} size={15} color="#566f64">{lane.member===1?'Fa0/1':'Fa0/2'} · {lane.up?'100 Mbit/s':'已断开'}</Label>
   {!lane.up&&<g><circle cx="540" cy={memberY[lane.member]} r="16" fill="#c66a5a"/><Label x={540} y={memberY[lane.member]+7} size={24} color="white">×</Label></g>}
   {!config.bundle&&lane.up&&!lane.active&&<g><circle cx="659" cy={memberY[lane.member]} r="14" fill="#c68f36"/><Label x={659} y={memberY[lane.member]+5} size={20} color="white">−</Label><Label x={716} y={302} size={14} color="#9a6d26">STP 阻塞</Label></g>}
   {ready&&lane.active&&<Label x={540} y={memberY[lane.member]+31} size={15} color="#36755e">{lane.flows.length?`${lane.flows.join('、')} 选中这条`:'可用 · 暂无数据组选中'}</Label>}
  </g>)}
  {[320,760].map((x,i)=><g key={x}><ArtSprite art="switch" x={x-86} y={166} w={172} h={84}/><Label x={x} y={275} size={19}>交换机 S{i+1}</Label><Label x={x} y={301} size={14} color="#718579">{config.bundle?`模式：${i===0?config.left:config.right}`:'独立物理端口'}</Label></g>)}
  <ArtSprite art="server" x={919} y={134} w={111} h={139}/><Label x={974} y={291} size={17}>服务器 D</Label><Label x={974} y={315} size={13} color="#63796b">{unformed?'检查实际端口状态':sent?`收到 ${state.flows.filter(f=>f.member).length} 组新帧`:'相同的目的 MAC'}</Label>
  {unformed&&<><Label x={540} y={193} size={18} color="#9c692b">{config.left==='passive'&&config.right==='passive'?'双方都在等对方发起':'静态与 LACP 不匹配'}</Label><Label x={540} y={219} size={14} color="#8c7554">本模型不推断独立端口是否可转发</Label></>}
  {negotiate&&!unformed&&p<.97&&<g transform={`translate(${p<.5?mix(336,741,p*2):mix(741,336,(p-.5)*2)} 92)`}><rect x="-47" y="-13" width="94" height="26" rx="9" fill="#567fa8"/><Label x={0} y={5} size={14} color="white">{p<.5?'发起 LACP →':'← 响应 LACP'}</Label></g>}
  {showFrames&&!unformed&&state.flows.flatMap((flow,flowIndex)=>{
   if(!flow.member)return [];
   const accessPath:Point[]=[[149,hostY[flow.id]],[196,hostY[flow.id]],[244,207],[320,207]];
   const sharedPath:Point[]=[[320,207],...memberPoints(flow.member),[760,207],[925,207]];
   return Array.from({length:train?3:1},(_,index)=>{const start=flowIndex*.2+index*.18,progress=(p-start)/(1-start);const at=progress<.3?position(accessPath,progress/.3):position(sharedPath,(progress-.3)/.7);return progress>=0&&progress<.995?<Envelope key={flow.id+index} at={at} color={flow.color} label={`${flow.id}${train?index+1:''}`}/>:null;});
  })}
  <rect x="18" y="366" width="1044" height="34" rx="13" fill={unformed?'#f9eddb':'#e6f0e6'}/><Label x={540} y={389} size={15} color={unformed?'#96662e':'#366b55'}>{description}</Label>
 </>;
}
const captions=[
 '本例先固定 STP 稳定结果：上方成员转发，下方一端阻塞',
 '两端配置匹配后，STP 把 Po1 当成一个逻辑接口；成员仍是两根网线',
 '同一组沿选定成员前进；不同组可以分担链路，不逐帧轮流换线',
 'A1、A2、A3 仍走同一成员：一组上限 100，聚合总容量上限 200 Mbit/s',
 '目的 MAC 都是 D → 教学哈希结果相同 → 三组挤在成员 1',
 '故障尚未完成重选：A 受影响，B 的成员 2 仍可用（不保证无丢帧）',
 '故障处理后的新帧改走成员 2；本例容量降为 100 Mbit/s',
 'active 主动发起，passive 响应；两端兼容才能加入同一聚合通道',
 '没有发起者，LACP 未成组；再看设备输出，不能直接断言所有通信都中断'
];
export default function ChannelStoryScene({step,p}:SceneProps){return <ChannelDiagram config={channelStoryConfig(step)} p={p} showFrames={![1,5,7,8].includes(step)} train={step===3} negotiate={step===7} caption={captions[step]}/>;}

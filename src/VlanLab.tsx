import {useState} from 'react';
import {useSignalClock} from './EncodingControls';
import {VlanDiagram} from './VlanScene';
import {VLAN_DEFAULT,vlanBroadcast} from './vlanModel';
import type {VlanConfig,VlanId} from './vlanModel';
import VlanNotes from './VlanNotes';
export default function VlanLab(){
 const [config,setConfig]=useState<VlanConfig>(VLAN_DEFAULT),[source,setSource]=useState<'A'|'C'>('A'),clock=useSignalClock(4);
 const result=vlanBroadcast(source,config),finished=clock.position>=4;
 function configure(next:VlanConfig){setConfig(next);clock.reset();}
 function preset(id:string){configure({...VLAN_DEFAULT,...(id==='s1-block'?{allowS1:[1,10]}:id==='s2-block'?{allowS2:[1,10]}:id==='wrong-port'?{bVlan:20}:id==='unplugged'?{linkUp:false}:{})});setSource(id.includes('block')?'C':'A');}
 function allow(side:'allowS1'|'allowS2',vlan:VlanId,on:boolean){configure({...config,[side]:on?[...config[side],vlan].sort((a,b)=>a-b):config[side].filter(v=>v!==vlan)});}
 return <><div className="vlan-presets" role="group" aria-label="VLAN 实验预设">{[['normal','两组都畅通'],['s1-block','S1 漏放 VLAN 20'],['s2-block','S2 漏放 VLAN 20'],['wrong-port','B 接入口分错组'],['unplugged','上联断开']].map(([id,title])=><button key={id} onClick={()=>preset(id)}>{title}</button>)}</div>
 <div className="vlan-layout"><section className="experiment vlan-experiment"><div className="experiment-heading"><h2>发出一封广播，看看谁能收到</h2><span>两台二层交换机 · 无路由</span></div>
 <div className="vlan-diagram"><svg viewBox="0 0 1080 407" role="img" aria-label={`VLAN 广播实验：${source} 发送，属于 VLAN ${result.vlan}；${finished?`接收者 ${result.recipients.join('、')||'无'}`:'尚未完成发送'}`}><VlanDiagram config={config} source={source} p={clock.position/4} showFrame={clock.position>0}/></svg></div>
 <div className="vlan-playback"><button className="primary" onClick={clock.toggle}>{clock.running?'暂停动画':'播放这一帧'}</button><button onClick={()=>clock.seek(1.2)}>到达 S1</button><button onClick={()=>clock.seek(2)}>观察 Trunk</button><button onClick={()=>clock.seek(4)}>查看最终结果</button><button onClick={clock.reset}>重新开始</button></div>
 <label className="timeline"><span>这一帧的进度</span><input type="range" aria-label="VLAN 帧进度" min="0" max="4" step=".01" value={clock.position} onChange={e=>clock.seek(+e.target.value)}/><span>{Math.round(clock.position/4*100)}%</span></label>
 <div className="vlan-result" role="status"><strong>{finished?`收到广播：${result.recipients.join('、')||'没有其他主机'}`:'先预测接收者，再播放验证'}</strong><p>{finished?(result.stop==='s1-filter'?'VLAN 未被 S1 上联放行，帧没有进入 Trunk。':result.stop==='s2-filter'?'帧带着正确标签到达 S2，但 S2 的允许列表把这个 VLAN 挡住了。':result.stop==='link-down'?'两台交换机的上联未接通，跨交换机的帧无法到达。':result.recipients.length?`只到 VLAN ${result.vlan} 的其他主机，另一组没有收到。`:'帧可以通过 Trunk，但远端没有这个 VLAN 的主机接入口。'): '可以比较两端允许列表、B 的接入口归属与上联状态；每次修改都会重置进度。'}</p></div>
 <p className="model-caption">信封表示一个广播帧。实际串行传输按位进行；本图放大了逐跳处理过程。本例 VLAN 10/20 在 Trunk 上带标签，普通主机侧不带标签。</p></section>
 <aside className="inspector vlan-inspector"><h2>只改一个条件</h2><label>谁发出广播？<select aria-label="广播发送者" value={source} onChange={e=>{setSource(e.target.value as 'A'|'C');clock.reset();}}><option value="A">A · VLAN 10</option><option value="C">C · VLAN 20</option></select></label><label>B 的接入口属于<select aria-label="B 的 Access VLAN" value={config.bVlan} onChange={e=>configure({...config,bVlan:+e.target.value as 10|20})}><option value="10">VLAN 10</option><option value="20">VLAN 20</option></select></label>
 <label className="vlan-check"><input type="checkbox" checked={config.linkUp} onChange={e=>configure({...config,linkUp:e.target.checked})}/>接通 S1—S2 上联</label>
 {(['allowS1','allowS2'] as const).map((side,i)=><fieldset key={side}><legend>S{i+1} Trunk 放行哪些组？</legend>{([10,20] as const).map(vlan=><label className="vlan-check" key={vlan}><input type="checkbox" aria-label={`S${i+1} 放行 VLAN ${vlan}`} checked={config[side].includes(vlan)} onChange={e=>allow(side,vlan,e.target.checked)}/>VLAN {vlan}</label>)}</fieldset>)}
 <p>固定条件：A 在 S1 的 VLAN 10，C 在 S1 的 VLAN 20，D 在 S2 的 VLAN 20；native VLAN 两端均为 1。</p><div className="teaching-note"><strong>颜色跟着配置走</strong><div>把 B 改到 VLAN 20 后，试着分别让 A、C 广播。Trunk 没有改变，接收者却会改变。</div></div></aside></div><VlanNotes/></>;
}

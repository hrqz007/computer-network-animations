import {useState} from 'react';
import {useSignalClock} from './EncodingControls';
import {StpDiagram} from './StpScene';
import {STP_PHASES,STP_PRIORITIES,STP_SWITCHES,stpTree,stpPath,stpPriorities,stpRecovery} from './stpModel';
import type {StpSwitch,StpPhase} from './stpModel';
import StpNotes from './StpNotes';
type Scenario='normal'|'loop'|'failure'|'new-root';
export default function StpLab(){
 const [scenario,setScenario]=useState<Scenario>('normal'),[root,setRoot]=useState<StpSwitch>('S1'),clock=useSignalClock(5);
 const failure=scenario==='failure',loop=scenario==='loop',priorities=root==='S1'?STP_PRIORITIES:stpPriorities(root),phase=Math.min(4,Math.floor(clock.position)) as StpPhase;
 const tree=stpTree(priorities,failure?'13':null),recovery=failure?stpRecovery(priorities,'13',phase):null,path=recovery?.path??stpPath(tree.active),done=clock.position>=5;
 const ports=recovery?.states??tree.ports.map(port=>({...port,state:port.role==='Altn'?'BLK':'FWD'}));
 function choose(next:Scenario){setScenario(next);setRoot(next==='new-root'?'S2':'S1');clock.reset();}
 const result=loop?(done?'广播副本仍可继续循环':'观察广播怎样绕回出发点'):failure&&phase<4?(path.length?'A 到 B 的现有路径仍可用':'A 到 B 的路径暂时中断'):done?`B 已收到：A → ${path.join(' → ')} → B`:'先预测路径，再播放一帧';
 return <><div className="stp-presets" role="group" aria-label="STP 实验情景">{([['normal','① STP 正常保护'],['loop','② 没有 STP 的环路'],['failure','③ S1—S3 断线'],['new-root','④ 改由 S2 当根']] as [Scenario,string][]).map(([key,label])=><button key={key} aria-pressed={scenario===key} className={scenario===key?'selected':''} onClick={()=>choose(key)}>{label}</button>)}</div>
 <div className="stp-layout"><section className="experiment stp-experiment"><div className="experiment-heading"><h2>{loop?'同一封广播，为什么又回来了？':failure?'一条链路断了，备用路怎样接班？':'保留网线，让数据走一棵树'}</h2><span>一个 VLAN · 三台交换机</span></div>
 <div className="stp-diagram"><svg viewBox="0 0 1080 407" role="img" aria-label={`${loop?'无 STP 广播环路':`根桥 ${tree.root}`}，${failure?STP_PHASES[phase]:'稳定拓扑'}`}><StpDiagram root={root} down={failure?'13':null} loop={loop} recovery={failure} phase={phase} p={failure?phase===4?clock.position-4:0:clock.position/5} showFrame={!failure||phase===4}/></svg></div>
 {failure&&<div className="stp-phases" role="group" aria-label="故障恢复步骤">{STP_PHASES.map((label,i)=><button key={label} aria-current={phase===i?'step':undefined} className={phase===i?'active':''} onClick={()=>clock.seek(i)}><span>{i+1}</span>{label}</button>)}</div>}
 <div className="stp-playback"><button className="primary" onClick={clock.toggle}>{clock.running?'暂停动画':failure?'播放恢复过程':loop?'播放广播循环':'播放这一帧'}</button><button onClick={()=>clock.seek(5)}>查看最终画面</button><button onClick={clock.reset}>重新开始</button></div>
 <label className="timeline"><span>{failure?'恢复过程':'动画进度'}</span><input type="range" aria-label="STP 动画进度" min="0" max="5" step=".01" value={clock.position} onChange={e=>clock.seek(+e.target.value)}/><span>{Math.round(clock.position/5*100)}%</span></label>
 <div className={`stp-result${loop?' caution':''}`} role="status"><strong>{result}</strong><p>{loop?'这里只画出前 6 跳，并主动暂停；实际以太网广播没有 TTL，不会自行按这个次数消失。反复出现的副本会占用链路，还可能让源 MAC 的学习位置来回改变。':failure?phase===2?'侦听：处理 BPDU，确认拓扑；新启用端口还不学习源 MAC，也不转发用户数据。':phase===3?'学习：新启用端口开始学习收到帧的源 MAC，但仍不转发用户数据。':phase===4?'收敛完成后再发送新帧。旧帧不会被 STP 自动补发；图中动画时间不是实际收敛秒数。':'故障和重新计算期间，已经可用的其他路径不必全部停机。请比较“实际可转发路径”和备用端口状态。':`本例根桥为 ${tree.root}；普通数据按转发表沿树转发，并非每一帧都必须到根桥。已知单播只画实际传送路径。`}</p></div>
 <p className="model-caption">蓝色 BPDU 与信封数据帧作用不同。动画采用传统 STP 的侦听、学习与转发过程；Packet Tracer 的真实计时与端口灯变化要在软件中观察。</p></section>
 <aside className="inspector stp-inspector"><h2>读懂这棵树</h2><label>指定本例根桥<select aria-label="STP 根桥" value={root} disabled={loop} onChange={e=>{setRoot(e.target.value as StpSwitch);clock.reset();}}>{STP_SWITCHES.map(sw=><option key={sw} value={sw}>{sw}{sw==='S1'?' · 优先级 4096':' · 将优先级设为 0'}</option>)}</select></label><p>其余设备保持 S1 / S2 / S3 = 4096 / 8192 / 12288。VLAN 均为 1，每段代价 19。</p>
 {loop?<div className="teaching-note"><strong>对照情景</strong><div>三条链路都转发广播，没有生成树端口角色。沿着两个信封走一圈，注意 B 收到的是同一帧的副本。</div></div>:<><div className="stp-route"><small>当前 A 到 B 的可转发路径</small><strong>{path.length?path.join(' → '):'暂未连通'}</strong></div><table className="stp-port-table"><caption>交换机之间的端口</caption><thead><tr><th>接口</th><th>角色</th><th>状态</th></tr></thead><tbody>{ports.map(port=><tr key={port.switch+port.port}><td>{port.switch} {port.port}</td><td>{port.role}</td><td className={port.state==='FWD'?'stp-fwd':'stp-wait'}>{port.state}</td></tr>)}</tbody></table><p>Root 根端口 · Desg 指定 · Altn 备用<br/>FWD 转发 · BLK 阻塞<br/>LIS 侦听 · LRN 学习 · Down 断开</p>{failure&&phase<4&&<p>角色列表示重新计算的目标角色；状态列显示端口当前是否已能转发。</p>}</>}
 <div className="teaching-note"><strong>小挑战</strong><div>先让 S1 当根再断线；再让 S2 当根观察同一处断线。为什么后一种情况下 A 到 B 仍可直接通信？</div></div></aside></div><StpNotes/></>;
}

import {useState} from 'react';
import {useSignalClock} from './EncodingControls';
import {ChannelDiagram} from './ChannelScene';
import {channelModel,channelPreset} from './channelModel';
import type {ChannelConfig,ChannelPreset,ChannelMode,ChannelRule} from './channelModel';
import ChannelNotes from './ChannelNotes';
const presets:[ChannelPreset,string][]=[['separate','两根普通线'],['multi','两组一起发'],['single','一组大流量'],['collision','都按目的地址选'],['failure','成员 1 断线'],['lacp','LACP 主动＋被动'],['silent','两端都被动']];
const number=(n:number|null)=>n===null?'未成组':`${Math.round(n*10)/10}`;
export default function ChannelLab(){
 const [config,setConfig]=useState<ChannelConfig>(()=>channelPreset('multi')),[preset,setPreset]=useState<ChannelPreset|null>('multi'),clock=useSignalClock(5);
 const state=channelModel(config),done=clock.position>=5,unformed=state.status==='unformed';
 function update(next:ChannelConfig){setConfig(next);setPreset(null);clock.reset();}
 function choose(id:ChannelPreset){setConfig(channelPreset(id));setPreset(id);clock.reset();}
 const result=unformed?'Po1 未形成，先核对协商模式':state.status==='down'?'两条线都断开，本例无法送到 D':done?`${state.flows.filter(f=>f.member).length} 组新帧已到达 D`:'先预测每组走哪条线，再播放验证';
 return <><div className="channel-presets" role="group" aria-label="链路聚合实验预设">{presets.map(([id,label])=><button key={id} aria-pressed={preset===id} className={preset===id?'selected':''} onClick={()=>choose(id)}>{label}</button>)}</div>
 <div className="channel-layout"><section className="experiment channel-experiment"><div className="experiment-heading"><h2>让两条网线分工合作</h2><span>VLAN 1 · 每条 100 Mbit/s</span></div>
 <div className="channel-diagram"><svg viewBox="0 0 1080 407" role="img" aria-label={`链路聚合实验：${unformed?'未形成聚合':config.bundle?'Po1 成员分配':'独立链路 STP 对照'}，${state.flows.map(f=>`${f.id} ${f.member?`走成员 ${f.member}`:'无聚合路径'}`).join('；')}`}><ChannelDiagram config={config} p={clock.position/5} showFrames={clock.position>0}/></svg></div>
 <div className="channel-playback"><button className="primary" disabled={unformed||state.status==='down'} onClick={clock.toggle}>{clock.running?'暂停动画':'播放新帧'}</button><button onClick={()=>clock.seek(5)}>查看最终分工</button><button onClick={clock.reset}>重新开始</button><label>速度<select aria-label="聚合动画速度" value={clock.speed} onChange={e=>clock.setSpeed(+e.target.value)}><option value=".5">慢一点</option><option value="1">正常</option></select></label></div>
 <label className="timeline"><span>新帧发送进度</span><input type="range" aria-label="聚合动画进度" min="0" max="5" step=".01" value={clock.position} onChange={e=>clock.seek(+e.target.value)}/><span>{Math.round(clock.position/5*100)}%</span></label>
 <div className="channel-result" role="status"><strong>{result}</strong><p>{unformed?`${state.agreement.reason} 这里只判断聚合通道；独立端口的连通性需要在设备上检查。`:state.status==='down'?'两条成员都不可用；逻辑接口不能凭空产生新的物理路径。':!config.bundle?'当前为已经稳定的 STP 对照，本例仅一条独立链路转发。':config.up.some(up=>!up)?'这里展示故障检测与成员重选完成后的新帧；剩余成员可以继续工作，容量下降，故障时丢失的旧帧不会由聚合协议自动补发。':'相同字段和成员集合下，选择保持稳定。信封速度仅用于看清路径，不是吞吐量测量。'}</p></div>
 <div className="channel-metrics" aria-label="理想容量算例"><div><span>各组请求总量</span><strong>{config.flowCount*config.demand}<small> Mbit/s</small></strong></div><div><span>{config.bundle?'聚合可用总容量':'STP 稳定后可用容量'}</span><strong>{number(state.capacity)}{state.capacity!==null&&<small> Mbit/s</small>}</strong></div><div><span>当前分配的理想吞吐上限</span><strong>{number(state.total)}{state.total!==null&&<small> Mbit/s</small>}</strong></div></div>
 <div className="channel-loads">{state.lanes.map(lane=><div key={lane.member} className="channel-load"><div><strong>成员 {lane.member}</strong><span>{!lane.up?'断开':unformed?'未聚合':!lane.active?'STP 阻塞':lane.flows.length?`${lane.flows.join('、')} → 这里`:'可用但闲置'}</span></div><div className="channel-load-track"><span style={{width:`${lane.rate}%`}}/></div><small>{unformed?'不计算未成组时的吞吐量':`请求 ${lane.requested} / 可承载 ${lane.rate} Mbit/s`}</small></div>)}</div>
 <p className="model-caption">以上只计算一个方向、聚合段的理想上限，忽略主机接入速率、协议开销及其他瓶颈；同一成员内按请求比例分配仅用于算例，不模拟实际排队或 TCP。200 Mbit/s 不是一次 ping 的测速结果。</p></section>
 <aside className="inspector channel-inspector"><h2>只改一个条件</h2><label className="channel-check"><input type="checkbox" checked={config.bundle} onChange={e=>update({...config,bundle:e.target.checked})}/>将两条链路组合成 Po1</label>
 <label>同时发送的数据组<select aria-label="发送数据组数" value={config.flowCount} onChange={e=>update({...config,flowCount:+e.target.value as 1|2|3})}><option value="1">只有 A → D</option><option value="2">A、B → D</option><option value="3">A、B、C → D</option></select></label>
 <label>每组希望发送<select aria-label="每组请求速率" value={config.demand} onChange={e=>update({...config,demand:+e.target.value})}>{[50,80,160].map(rate=><option key={rate} value={rate}>{rate} Mbit/s</option>)}</select></label>
 <label>按哪个字段选择成员？<select aria-label="聚合分配规则" value={config.rule} disabled={!config.bundle} onChange={e=>update({...config,rule:e.target.value as ChannelRule})}><option value="source">源 MAC · A、B、C 不同</option><option value="destination">目的 MAC · 都是 D</option></select></label>
 <fieldset><legend>两端通道模式</legend>{(['left','right'] as const).map((side,i)=><label key={side}>S{i+1}<select aria-label={`S${i+1} 聚合模式`} value={config[side]} disabled={!config.bundle} onChange={e=>update({...config,[side]:e.target.value as ChannelMode})}><option value="on">on · 静态</option><option value="active">active · LACP 主动</option><option value="passive">passive · LACP 被动</option></select></label>)}</fieldset>
 <fieldset><legend>物理成员是否接通？</legend>{([0,1] as const).map(i=><label className="channel-check" key={i}><input aria-label={`接通成员 ${i+1}`} type="checkbox" checked={config.up[i]} onChange={e=>{const up:[boolean,boolean]=[...config.up];up[i]=e.target.checked;update({...config,up});}}/>成员 {i+1} · Fa0/{i+1}</label>)}</fieldset>
 <p>模型前提：两端速率、双工、VLAN、Trunk 等参数兼容；无最小成员数限制。分配采用教学哈希，真实设备不保证 A/B 恰好选到不同线。</p><div className="teaching-note"><strong>先做一个预测</strong><div>两条线都正常，把规则改成“目的 MAC”。为什么人数增加了，理想吞吐上限却可能只剩 100？</div></div></aside></div><ChannelNotes/></>;
}

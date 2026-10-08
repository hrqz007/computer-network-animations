import {SWITCH_HOSTS,switchPort} from './switchModel';
import type {LearningFrame,SwitchHost,SwitchTopology,SwitchResult} from './switchModel';
type Point=[number,number];
const positions:Record<SwitchHost,Point>={A:[90,90],B:[90,330],C:[710,210]};
const direct:Record<SwitchHost,Point[]>={A:[[160,90],[255,90],[255,175],[315,175]],B:[[160,330],[255,330],[255,245],[315,245]],C:[[640,210],[485,210]]};
const shared:Record<SwitchHost,Point[]>={A:[[160,90],[220,90],[220,210],[285,210],[285,175],[315,175]],B:[[160,330],[220,330],[220,210],[285,210],[285,175],[315,175]],C:direct.C};
function pointOnPath(points:Point[],fraction:number):Point{
 const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));
 let distance=lengths.reduce((sum,n)=>sum+n,0)*Math.max(0,Math.min(1,fraction));
 for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]){const t=distance/lengths[i];return [points[i][0]+(points[i+1][0]-points[i][0])*t,points[i][1]+(points[i+1][1]-points[i][1])*t];}distance-=lengths[i];}
 return points[points.length-1];
}
function Token({point,color}:{point:Point;color:string}){return <g transform={`translate(${point[0]},${point[1]})`}><rect x="-16" y="-10" width="32" height="20" rx="5" fill={color} stroke="white" strokeWidth="2"/><path d="M-9-4L0 2 9-4" stroke="white" fill="none" strokeWidth="1.5"/></g>;}
export default function SwitchDiagram({frame,topology,result,position}:{frame:LearningFrame;topology:SwitchTopology;result:SwitchResult;position:number}){
 const step=Math.min(6,Math.floor(position+1e-8)),paths=topology==='shared'?shared:direct;
 const color=result.decision==='unknown'||result.decision==='broadcast'?'#c3872e':'#228a8a';
 const localPath:Point[]=frame.source==='A'?[[220,210],[220,330],[160,330]]:[[220,210],[220,90],[160,90]];
 return <div className="switch-topology"><svg viewBox="0 0 800 420" role="img" aria-label={`${frame.source} 发往 ${frame.destination==='broadcast'?'广播地址':frame.destination}；入端口 Fa0/${result.ingress}；${step>=4?`出端口 ${result.egress.map(p=>`Fa0/${p}`).join('、')||'无，过滤'}`:'正在逐步处理'}`}>
  {SWITCH_HOSTS.map(host=><polyline key={host} points={paths[host].map(p=>p.join(',')).join(' ')} fill="none" stroke={host===frame.source?'#7aabc0':step>=4&&result.viaSwitch.includes(host)?color:'#c9d8e1'} strokeWidth={step>=4&&result.viaSwitch.includes(host)?4:3}/>) }
  {topology==='shared'&&<><rect x="175" y="180" width="90" height="60" rx="9" fill="#f9f0df" stroke="#c9a977"/><text x="220" y="204" textAnchor="middle">共享网段</text><text x="220" y="225" textAnchor="middle" className="switch-svg-small">Hub / 集线器</text><path d="M285 245H315" stroke="#d6dfe5" strokeDasharray="4 4"/></>}
  <rect x="315" y="140" width="170" height="140" rx="14" fill="#edf5f8" stroke="#9bbdc9" strokeWidth="2"/><text x="400" y="185" textAnchor="middle" className="switch-svg-title">交换机 S1</text><text x="400" y="208" textAnchor="middle">VLAN 1</text><text x="400" y="235" textAnchor="middle" className="switch-svg-small">学习源 · 查询目的</text>
  {([[1,315,175],[2,315,245],[5,485,210]] as number[][]).map(([port,x,y])=>{const unused=topology==='shared'&&port===2;return <g key={port}><rect x={x-8} y={y-7} width="16" height="14" rx="3" fill={step>=4&&result.egress.includes(port)?color:port===result.ingress?'#438aa7':'#b7c9d4'}/><text x={unused?315:port===5?x+18:x-18} y={unused?300:y-13} textAnchor={unused||port===5?'start':'end'} className="switch-svg-small">Fa0/{port}{unused?'（未接）':''}</text></g>;})}
  {step>=1&&step<5&&<Token point={[400,260]} color="#448da7"/>}
  {step===0&&<Token point={pointOnPath(paths[frame.source],position)} color="#448da7"/>}
  {step===0&&topology==='shared'&&result.local.length>0&&position>180/310&&<Token point={pointOnPath(localPath,(position-180/310)/(130/310))} color="#b9914d"/>}
  {step===5&&result.viaSwitch.map(host=><Token key={host} point={pointOnPath([...paths[host]].reverse(),position-5)} color={color}/>)}
  {step>=4&&result.decision==='filter'&&<g><circle cx="400" cy="260" r="14" fill="#f7e7df" stroke="#b97857"/><path d="M393 253L407 267M393 267L407 253" stroke="#aa6346" strokeWidth="2"/></g>}
  {SWITCH_HOSTS.map(host=>{const [x,y]=positions[host],localReceived=step>=1&&result.local.includes(host),finished=step===6&&result.reached.includes(host),hasFrame=localReceived||finished,accepts=result.accepted.includes(host),isSource=host===frame.source;
   const status=isSource?'发送方':hasFrame?(accepts?(localReceived?'共享网段已接收':'MAC 检查通过'):'目的不符，丢弃'):step===6?'未收到此帧':'等待帧';
   return <g key={host}><rect x={x-70} y={y-46} width="140" height="92" rx="12" fill={isSource?'#eaf2f9':hasFrame?(accepts?'#e7f5ef':'#fff0e9'):'#f6f8fa'} stroke={hasFrame?(accepts?'#72b29a':'#d8a285'):'#b9ccd7'} strokeWidth="1.5"/><text x={x} y={y-19} textAnchor="middle" className="switch-svg-title">PC-{host}</text><text x={x} y={y+3} textAnchor="middle" className="switch-svg-small">MAC …:0{host}</text><text x={x} y={y+24} textAnchor="middle" className="switch-svg-small">{status}</text><text x={x} y={y+66} textAnchor="middle" className="switch-svg-small">接入 Fa0/{switchPort(host,topology)}</text></g>;
  })}
  <text x="400" y="393" textAnchor="middle" className="switch-svg-small">{topology==='shared'?'A、B 共用一个网段；Hub 复制信号，S1 不把帧送回入端口。':'三台主机同属 VLAN 1；这里只显示三个已连接、可转发端口。'}</text>
 </svg></div>;
}

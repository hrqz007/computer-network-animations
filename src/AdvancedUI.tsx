import {useEffect,useState} from 'react';
import type {ReactNode} from 'react';
export function usePlayback(duration=12){
 const [time,setTime]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1);
 useEffect(()=>{if(!playing)return;let last=performance.now();const id=window.setInterval(()=>{const now=performance.now();const delta=Math.min((now-last)/1000,.15);last=now;setTime(t=>(t+delta*speed)%duration);},40);return()=>clearInterval(id);},[playing,speed,duration]);
 return {time,playing,speed,duration,setTime,setPlaying,setSpeed};
}
export type Clock=ReturnType<typeof usePlayback>;
export function Playback({clock,label='演示进度'}:{clock:Clock;label?:string}){return <><div className="playback"><button className="primary" onClick={()=>clock.setPlaying(!clock.playing)}>{clock.playing?'暂停动画':'播放动画'}</button><button onClick={()=>{clock.setPlaying(false);clock.setTime(Math.min(clock.duration-.001,clock.time+clock.duration/12));}}>前进一步</button><button onClick={()=>{clock.setPlaying(false);clock.setTime(0);}}>重新开始</button><label className="speed-label">速度<select aria-label="播放速度" value={clock.speed} onChange={e=>clock.setSpeed(Number(e.target.value))}><option value={.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select></label></div><label className="timeline"><span>{label}</span><input aria-label={label} type="range" min="0" max={clock.duration-.001} step=".01" value={clock.time} onChange={e=>{clock.setPlaying(false);clock.setTime(Number(e.target.value));}}/><span>{Math.round(clock.time/clock.duration*100)}%</span></label></>}
export function Stage({title,tag,children}:{title:string;tag?:string;children:ReactNode}){return <section className="experiment advanced-stage"><div className="experiment-heading"><h2>{title}</h2>{tag&&<span>{tag}</span>}</div>{children}</section>}
export function Diagram({children,label}:{children:ReactNode;label:string}){return <><div className="wide-diagram"><svg className="science-svg" viewBox="0 0 800 430" role="img" aria-label={label}>{children}</svg></div><p className="diagram-hint">可左右滑动查看完整图示。</p></>}
export function Fact({title,children}:{title:string;children:ReactNode}){return <div className="teaching-note"><strong>{title}</strong><div>{children}</div></div>}
export function Source({href,children}:{href:string;children:ReactNode}){return <a href={href} target="_blank" rel="noreferrer">{children} ↗</a>}
export function SourceLine({children}:{children:ReactNode}){return <p className="asset-credit">{children}</p>}
export function Dot({x,y,color='#de862c'}:{x:number;y:number;color?:string}){return <g><circle cx={x} cy={y} r="10" fill={color} opacity=".14"/><circle cx={x} cy={y} r="4.5" fill={color} stroke="white" strokeWidth="1.2"/></g>}

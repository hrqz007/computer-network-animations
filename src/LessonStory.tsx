import {useEffect,useRef,useState} from 'react';
import type {ReactNode} from 'react';
import ClassroomQuiz from './ClassroomQuiz';
import {advanceLesson,lessonClockStart,lessonStories,LESSON_MOTION_MS} from './lessonStories';
import {CoaxScene,FiberScene,RadioScene,TwistedScene} from './StoryVisuals';
import {CommunicationScene,DelayScene,EncodingScene,EthernetStoryScene,MultiplexScene} from './StoryTopicVisuals';
import type {SceneProps} from './StoryVisuals';
import StoryArtCaption from './StoryArt';
import VlanStoryScene from './VlanScene';
import StpStoryScene from './StpScene';
import ChannelStoryScene from './ChannelScene';
import IpStoryScene from './IpScene';
const renderers:Record<string,(props:SceneProps)=>ReactNode>={twisted:TwistedScene,coax:CoaxScene,fiber:FiberScene,radio:RadioScene,encoding:EncodingScene,multiplex:MultiplexScene,delay:DelayScene,communication:CommunicationScene,ethernet:EthernetStoryScene,vlan:VlanStoryScene,stp:StpStoryScene,etherchannel:ChannelStoryScene,ipv4:IpStoryScene};
export default function LessonStory({lessonKey,children}:{lessonKey:string;children:ReactNode}){
 const story=lessonStories[lessonKey],ref=useRef<HTMLDivElement>(null);
 const [mode,setMode]=useState<'story'|'lab'>('story'),[clock,setClock]=useState(lessonClockStart),[speed,setSpeed]=useState(1),[answer,setAnswer]=useState<number|null>(null);
 if(!story)throw new Error(`缺少科普分镜：${lessonKey}`);
 const count=story.scenes.length,current=story.scenes[clock.scene],last=clock.scene===count-1,[family,id]=lessonKey.split('/'),Scene=renderers[family];
 useEffect(()=>{
  if(!clock.running||mode!=='story')return;
  let frame=0,previous:number|undefined;
  const tick=(time:number)=>{const delta=previous===undefined?0:Math.min(100,time-previous);previous=time;setClock(v=>advanceLesson(v,delta*speed,count));frame=requestAnimationFrame(tick);};
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[clock.running,mode,count,speed]);
 function go(scene:number){setClock({scene,elapsed:0,running:true,auto:false});}
 function changeMode(next:'story'|'lab'){setMode(next);setClock(v=>({...v,running:false}));requestAnimationFrame(()=>ref.current?.scrollIntoView({block:'start',behavior:'instant'}));}
 function toggle(){setClock(v=>v.running?{...v,running:false}:{scene:last?0:v.scene,elapsed:last||!v.auto&&v.elapsed>=LESSON_MOTION_MS?0:v.elapsed,running:true,auto:true});if(last)setAnswer(null);}
 return <div ref={ref} className="lesson-story-host"><div className="switch-mode lesson-mode" role="group" aria-label="学习模式"><button aria-pressed={mode==='story'} className={mode==='story'?'active':''} onClick={()=>changeMode('story')}>先看科普故事</button><button aria-pressed={mode==='lab'} className={mode==='lab'?'active':''} onClick={()=>changeMode('lab')}>自由实验与 Packet Tracer</button><span>先理解过程，再改变条件验证</span></div>
 {mode==='lab'?children:<><section className="popular-story" aria-label={`${story.title}科普故事`}><div className="popular-top"><span>科普分镜 · {clock.scene+1} / {count}</span><span>{story.lead}</span></div><StoryArtCaption lessonKey={lessonKey} step={clock.scene}><h2>{current.title}</h2><p>{current.body}</p></StoryArtCaption><div className="popular-stage"><svg viewBox="0 0 1080 407" role="img" aria-label={`${current.title} ${current.cue}`}><title>{current.title}</title><desc>{current.body}</desc><Scene id={id} step={clock.scene} p={Math.min(1,clock.elapsed/LESSON_MOTION_MS)}/></svg></div><div className="popular-cue"><span>这一幕看什么</span><strong>{current.cue}</strong></div><div className="popular-controls"><div><button disabled={clock.scene===0} onClick={()=>go(clock.scene-1)}>← 上一幕</button><button className="primary" onClick={()=>{if(last){setAnswer(null);go(0);}else go(clock.scene+1);}}>{last?'从头再看':'下一幕 →'}</button><button onClick={()=>go(clock.scene)}>重看这一幕</button></div><div><button aria-pressed={clock.running&&clock.auto} onClick={toggle}>{clock.running?'暂停':clock.auto?'继续播放':'自动播放故事'}</button><label>速度 <select aria-label="科普故事播放速度" value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value={.65}>慢一点</option><option value={1}>正常</option><option value={1.35}>快一点</option></select></label></div></div><nav className="popular-track" aria-label="科普分镜选择">{story.scenes.map((scene,i)=><button key={scene.title} title={scene.title} aria-label={`第 ${i+1} 幕：${scene.title}`} aria-current={clock.scene===i?'step':undefined} className={clock.scene===i?'active':''} onClick={()=>go(i)}><span>{i+1}</span>{scene.title}</button>)}</nav><p className="popular-help">点击“下一幕”逐步讲解；每幕动作结束会停住。自动播放会留出阅读时间，故事结束停在提问处。</p></section>
 {last&&<section className="story-question popular-question" aria-label="科普故事停顿提问"><span>先预测，再解释</span><h3>{story.question.title}</h3><div className="popular-answers">{story.question.choices.map((choice,i)=><button key={choice} aria-pressed={answer===i} className={answer===i?'selected':''} onClick={()=>setAnswer(i)}>{choice}</button>)}</div>{answer!==null&&<p role="status" className={answer===story.question.correct?'answer-correct':'text-error'}>{answer===story.question.correct?'想对了。':'再回想一下刚才的过程。'} {story.question.why}</p>}</section>}
 {(lessonKey==='radio/satellite'||lessonKey==='radio/aviation'||lessonKey==='fiber/global-map')&&<p className="popular-source">{lessonKey==='fiber/global-map'?<>本地路线为自主绘制的教学通道，不是实际海缆分布。<a href="https://www.submarinecablemap.com/" target="_blank" rel="noreferrer">打开 TeleGeography 全球真实海缆地图 ↗</a>；陆地轮廓 Natural Earth（公共领域）。</>:<>外部真实影像：<a href={id==='aviation'?'https://starlink.com/business/aviation':'https://starlink.com/technology'} target="_blank" rel="noreferrer">SpaceX / Starlink</a>。开源包使用明确标注的教学插画；官方照片与渲染请通过链接在线查看，原图链接见自由实验。</>}</p>}
 <details className="popular-details"><summary>看懂以后，再认识专业名称</summary><div className="popular-terms">{story.terms.map(([term,meaning])=><div key={term}><strong>{term}</strong><p>{meaning}</p></div>)}</div><p className="popular-boundary"><strong>这幅图怎样理解：</strong>{story.boundary}</p></details>
 <details className="popular-details"><summary>课堂提问 · 本节至少 3 题（含解析）</summary><ClassroomQuiz key={lessonKey} lessonKey={lessonKey}/></details>
 <div className="popular-practice"><div><h3>原理看懂了，亲自改一个条件</h3><p>进入本节的自由实验，查看课程对照、Packet Tracer 操作与教学边界。</p></div><button className="primary" onClick={()=>changeMode('lab')}>进入自由实验 →</button></div></>}
 </div>;
}

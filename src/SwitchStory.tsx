import {useEffect,useState} from 'react';
import {SWITCH_STORY,STORY_CHAPTERS,STORY_START,STORY_MOTION_MS,advanceStory} from './switchStoryModel';
import type {StoryPlayback} from './switchStoryModel';
import SwitchStoryScene from './SwitchStoryScene';
import StoryArtCaption from './StoryArt';

export default function SwitchStory({onPractice}:{onPractice:()=>void}){
 const [playback,setPlayback]=useState<StoryPlayback>(STORY_START),[speed,setSpeed]=useState(1),[answers,setAnswers]=useState<Record<number,number>>({});
 const {index,running,auto,elapsed}=playback,scene=SWITCH_STORY[index];
 // Motion explains the mechanism and starts only after an explicit playback or step action.
 const progress=Math.min(1,elapsed/STORY_MOTION_MS),last=index===SWITCH_STORY.length-1;
 useEffect(()=>{
  if(!running)return;
  let id=0,lastTime=performance.now();
  const tick=(now:number)=>{const delta=Math.min(100,now-lastTime)*speed;lastTime=now;setPlayback(state=>advanceStory(state,delta));id=requestAnimationFrame(tick);};
  id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id);
 },[running,speed]);
 function go(next:number){setPlayback({index:next,elapsed:0,running:true,auto:false});}
 function next(){if(last){setAnswers({});go(0);}else go(index+1);}
 function toggleAuto(){if(running){setPlayback(p=>({...p,running:false}));return;}if(last)setAnswers({});setPlayback(p=>({index:last?0:p.index,elapsed:last||!p.auto&&p.elapsed>=STORY_MOTION_MS?0:p.elapsed,running:true,auto:true}));}
 const answer=answers[index];
 return <section className="switch-story" aria-label="交换机送信故事">
  <div className="story-topline"><nav className="story-chapters" aria-label="故事章节">{STORY_CHAPTERS.map((chapter,i)=><button key={chapter.start} className={scene.chapter===i?'current':''} aria-current={scene.chapter===i?'step':undefined} onClick={()=>go(chapter.start)}><span>{i+1}</span>{chapter.title}</button>)}</nav><span className="story-count">第 {index+1} / {SWITCH_STORY.length} 幕</span></div>
  <StoryArtCaption lessonKey="switching/learning" step={index}><h2>{scene.title}</h2><p>{scene.body}</p></StoryArtCaption>
  <SwitchStoryScene index={index} progress={progress}/>
  <div className="story-controls"><div><button onClick={()=>go(index-1)} disabled={index===0}>← 上一幕</button><button className="primary story-next" onClick={next}>{last?'从头再看':scene.question?'看小白怎样回信 →':'下一幕 →'}</button><button onClick={()=>go(index)}>重看这一幕</button></div><div><button onClick={toggleAuto}>{running?'暂停':auto?'继续播放':'自动播放故事'}</button><label>速度<select aria-label="故事播放速度" value={speed} onChange={e=>setSpeed(+e.target.value)}><option value={.7}>慢一点</option><option value={1}>正常</option><option value={1.4}>快一点</option></select></label></div></div>
  <div className="story-track" aria-label="选择故事分镜">{SWITCH_STORY.map((item,i)=><button key={item.title} className={index===i?'current':i<index?'past':''} aria-label={`第 ${i+1} 幕：${item.title}`} aria-current={index===i?'step':undefined} onClick={()=>go(i)}><span>{i+1}</span></button>)}</div>
  <p className="story-help">{scene.question?'这里停一停，先让学生猜一猜，再继续。':'每幕只讲一件事。可点“下一幕”由老师讲解，也可自动播放；思考题处会停下。'}</p>
  {scene.question&&<div className="story-question"><h3>{scene.question.title}</h3><div>{scene.question.choices.map((choice,i)=><button key={choice} aria-pressed={answer===i} className={answer===i?'chosen':''} onClick={()=>setAnswers(a=>({...a,[index]:i}))}>{choice}</button>)}</div>{answer!==undefined&&<p role="status"><strong>{answer===scene.question.correct?'猜对了。':'再看看认路本。'}</strong>{scene.question.why}</p>}</div>}
  <details className="story-terms"><summary>看懂故事后，再认识网络术语</summary><p>这是帮助理解的比喻。交换机实际读取帧头中的地址，不读取人名，也不理解信件内容。</p><div className="story-term-grid"><div><strong>信封 → 以太网帧</strong><p>信封里装的消息，相当于帧承载的数据。</p></div><div><strong>寄信人 / 收信人 → 源 / 目的 MAC</strong><p>A、B、C 是网卡 MAC 地址的简写，不是 IP 地址。</p></div><div><strong>插口 → 交换机端口</strong><p>图中 1、2、5 号口，对应课件的 Fa0/1、Fa0/2、Fa0/5。</p></div><div><strong>认路本 → MAC 地址表</strong><p>从源地址学习“MAC → 端口”。目的地址用来查表。</p></div><div><strong>其他口各送一份 → 未知单播泛洪</strong><p>仍然是发给 B 的单播，目的地址没有变成广播地址；范围是同一 VLAN 中除入端口外的可转发端口。</p></div><div><strong>只走目标出口 → 已知单播转发</strong><p>本故事假设目的在另一个端口。广播、同端口过滤和表项老化，在自由实验里继续观察。</p></div></div><p className="hint">B 的回信代表主机另发的一帧，不是每个以太网帧都有自动回信。这里假设主机已知道对方的 MAC、帧有效且网络没有环路；ARP 留到对应专题。</p></details>
  <div className="story-practice"><div><strong>看懂了，再试着改变条件</strong><p>清空认路本、发给所有人，或等旧记录过期，会发生什么？</p></div><button onClick={onPractice}>进入自由实验 →</button></div>
 </section>;
}

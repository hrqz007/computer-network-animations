import {useState} from 'react';
import {layers,totalLessonCount,deferredPhysicalTopics} from './course';
import {catalogLessons,catalogTopics,searchCatalog,validCatalogSelection} from './catalogModel';
import type {CatalogLesson,CatalogSelection} from './catalogModel';
import Icon from './Icon';
const storageKey='network-course-directory-v2';
function initialSelection(){
 try{return validCatalogSelection(JSON.parse(sessionStorage.getItem(storageKey)??'null'));}
 catch{return validCatalogSelection(null);}
}
function LessonRow({lesson,index,search,onEnter}:{lesson:CatalogLesson;index:number;search?:boolean;onEnter:(lesson:CatalogLesson)=>void}){
 return <li><a className="catalog-lesson" href={lesson.href} onClick={()=>onEnter(lesson)}>
  <span className="catalog-lesson-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span>
  <span className="catalog-lesson-copy"><strong>{lesson.title}</strong><span>{lesson.description}</span>{search&&<small>{layers[lesson.layer].name} / {lesson.topicTitle}</small>}</span>
  <span className="catalog-lesson-open">开始演示<Icon name="arrow" size={20}/></span>
 </a></li>;
}
export default function Home(){
 const [selection,setSelection]=useState<CatalogSelection>(initialSelection),[query,setQuery]=useState('');
 const searching=!!query.trim(),layer=layers[selection.layer],topics=catalogTopics.filter(t=>t.layer===selection.layer);
 const topic=topics.find(t=>t.id===selection.topic)??topics[0];
 const layerLessons=catalogLessons.filter(lesson=>lesson.layer===selection.layer);
 const visibleLessons=searching?searchCatalog(query):layerLessons.filter(lesson=>lesson.topic===topic?.id);
 const groups=[...new Set(topics.map(topic=>topic.group))];
 function choose(next:CatalogSelection){
  const value=validCatalogSelection(next);setSelection(value);setQuery('');
  try{sessionStorage.setItem(storageKey,JSON.stringify(value));}catch{/* Selection works even if storage is unavailable. */}
 }
 function enter(lesson:CatalogLesson){choose({layer:lesson.layer,topic:lesson.topic});}
 return <main className="catalog-home">
  <div className="catalog-top"><div><h1>课堂演示目录</h1><p>按五层结构，选择今天要讲的原理。</p></div>
   <div className="catalog-search" role="search"><Icon name="search" size={24}/><input type="search" aria-label="搜索全部演示" placeholder="搜索演示，如 CRC、海缆、星链" value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={event=>{if(event.key==='Escape')setQuery('');}}/>{query&&<button aria-label="清除搜索" onClick={()=>setQuery('')}><Icon name="close" size={18}/></button>}</div>
  </div>
  <div className="catalog-workspace">
   <nav className="catalog-layers" aria-label="五层课程目录"><h2>五层目录</h2>{layers.map((item,index)=>{
    const count=catalogLessons.filter(lesson=>lesson.layer===index).length;
    return <button key={item.name} aria-pressed={!searching&&selection.layer===index} onClick={()=>choose({layer:index,topic:selection.topic})} className={!searching&&selection.layer===index?'is-active':''}><span className="catalog-layer-number">{String(index+1).padStart(2,'0')}</span><span><strong>{item.name}</strong><small>{count?`${count} 个演示`:'待建设'}</small></span></button>;
   })}</nav>
   <section className="catalog-content" aria-label={searching?'演示搜索结果':`${layer.name}演示目录`}>
    <header className="catalog-layer-heading"><h2>{searching?'搜索结果':layer.name}</h2><p>{searching?`在全部 ${totalLessonCount} 个演示中查找“${query.trim()}”`:layer.question}</p><span role="status" aria-live="polite">{searching?`${visibleLessons.length} 个结果`:layerLessons.length?`${layerLessons.length} 个演示`:'待建设'}</span></header>
    {searching?<div className="catalog-results">{visibleLessons.length?<ol className="catalog-lessons">{visibleLessons.map((lesson,index)=><LessonRow key={lesson.key} lesson={lesson} index={index} search onEnter={enter}/>)}</ol>:<div className="catalog-empty"><Icon name="search" size={32}/><h3>没有找到相关演示</h3><p>可以试试“光纤”“CRC”或“星链”，也可以从左侧选择课程层级。</p><button onClick={()=>setQuery('')}>返回课程目录<Icon name="back" size={18}/></button></div>}</div>:
     topic?<div className="catalog-topic-layout">
      <nav className="catalog-topics" aria-label={`${layer.name}专题选择`}>{groups.map(group=><div className="catalog-topic-group" key={group}><h3>{group}</h3>{topics.filter(item=>item.group===group).map(item=><button className={item.id===topic.id?'is-active':''} key={item.id} aria-pressed={item.id===topic.id} onClick={()=>choose({layer:selection.layer,topic:item.id})}><span>{item.info.title}</span><small>{item.info.lessons.length}</small></button>)}</div>)}</nav>
      <label className="catalog-mobile-topic">选择专题<select value={topic.id} onChange={event=>choose({layer:selection.layer,topic:event.target.value})}>{groups.map(group=><optgroup key={group} label={group}>{topics.filter(item=>item.group===group).map(item=><option key={item.id} value={item.id}>{item.info.title} · {item.info.lessons.length} 个演示</option>)}</optgroup>)}</select></label>
      <div className="catalog-topic-content"><div className="catalog-topic-heading"><h3>{topic.info.title}</h3><p>{topic.info.intro}</p></div><ol className="catalog-lessons">{visibleLessons.map((lesson,index)=><LessonRow key={lesson.key} lesson={lesson} index={index} onEnter={enter}/>)}</ol><p className="catalog-lesson-note">每节包含科普故事、自由实验、课堂提问与 Packet Tracer 指引。</p></div>
     </div>:<div className="catalog-planned"><h3>这一层，接下来一起探索</h3><p>以下是课程建设计划，演示尚未开放。</p><ol>{layer.topics.map((title,index)=><li key={title}><span>{String(index+1).padStart(2,'0')}</span><strong>{title}</strong><small>待建设</small></li>)}</ol><button onClick={()=>choose({layer:1,topic:'ethernet'})}>查看已开放的演示<Icon name="arrow" size={19}/></button></div>}
   </section>
  </div>
  <footer className="catalog-footer"><details><summary><Icon name="chevron" size={20}/>后续建设与拓展计划</summary><div className="catalog-plans"><p><strong>数据链路层</strong>　本阶段规划的 6 个主要演示已开放，包含链路聚合。</p><p><strong>网络层与后续</strong>　IPv4 已拆为 7 个独立动画，从地址、掩码逐步学到默认网关；接下来讲 ARP 与下一跳，再继续路由、运输层和应用层。</p><p><strong>物理层拓展</strong>　{deferredPhysicalTopics.join('、')}。待五层主要演示完成后再安排。</p></div></details><span>{totalLessonCount} 个演示 · 支持离线使用</span></footer>
 </main>;
}

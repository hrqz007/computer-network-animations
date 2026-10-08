import {memo,useRef,useId} from 'react';
import type {ReactNode} from 'react';
import {artSources} from './storyArtSources';
import {artForScene,artItems,storyArtDescriptions} from './storyArtData';
import type {ArtId} from './storyArtData';
export const ArtSprite=memo(function ArtSprite({art,x=0,y=0,w=160,h=w,label=false}:{art:ArtId;x?:number;y?:number;w?:number;h?:number;label?:boolean}){
 const title=artItems[art][2];
 return <svg className="story-art-sprite" data-art={art} x={x} y={y} width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" role={label?'img':undefined} aria-label={label?title:undefined} aria-hidden={label?undefined:true}>
  <image href={artSources[art]} x="0" y="0" width={w} height={h} preserveAspectRatio="xMidYMid meet"/>
 </svg>;
});
export default function StoryArtCaption({lessonKey,step,children}:{lessonKey:string;step:number;children:ReactNode}){
 const art=artForScene(lessonKey,step),[sheet,,baseTitle,baseDetail]=artItems[art],override=(storyArtDescriptions[lessonKey]??storyArtDescriptions[lessonKey.split('/')[0]])?.[art],title=override?.title??baseTitle,detail=override?.detail??baseDetail,dialog=useRef<HTMLDialogElement>(null),headingId=useId();
 const kind=sheet==='reference'?'教学插画 · 官方影像见链接':'教学插画';
 return <div className="illustrated-caption">
  <button className="story-art-preview" onClick={()=>dialog.current?.showModal()} aria-label={`放大图片：${title}`} title="点击看大图与说明"><ArtSprite art={art} w={196} h={150}/><span>{title}</span><small>{kind} · 点击放大 <span aria-hidden="true">↗</span></small></button>
  <div className="illustrated-caption-copy" aria-live="polite">{children}</div>
  <dialog ref={dialog} className="story-art-dialog" aria-labelledby={headingId} onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}}>
   <div className="story-art-dialog-heading"><div><small>{kind}</small><h2 id={headingId}>{title}</h2></div><button autoFocus aria-label="关闭图片" onClick={()=>dialog.current?.close()}>关闭 ×</button></div>
   <div className="story-art-large"><ArtSprite art={art} w={600} h={470} label/></div><p>{detail}</p><small>AI 生成的教学插画，用于认识物件和理解比喻，不是设备照片、接线规范或测量结果。</small>{sheet==='reference'&&<p><a href={art==='aircraftPhoto'?'https://starlink.com/business/aviation':'https://starlink.com/technology'} target="_blank" rel="noreferrer">打开 Starlink 官方资料与影像 ↗</a></p>}
  </dialog>
 </div>;
}

import {useEffect,useRef,useState} from 'react';
import Home from './Home';
import Icon from './Icon';
import {media,encodingSuite,multiplexSuite,delaySuite,communicationSuite,physicalLessonCount,ethernetSuite,switchingSuite,vlanSuite,stpSuite,channelSuite,ipv4Suite,totalLessonCount} from './course';
import EncodingLab from './EncodingLab';
import MultiplexLab from './MultiplexLab';
import DelayLab from './DelayLab';
import CommunicationLab from './CommunicationLab';
import EthernetLab from './EthernetLab';
import CrcLab from './CrcLab';
import SwitchLab from './SwitchLab';
import VlanLab from './VlanLab';
import StpLab from './StpLab';
import ChannelLab from './ChannelLab';
import IpLab,{IpLearningPath,IpNextLesson} from './IpLab';
import type {IpLessonId} from './ipLesson';
import LessonStory from './LessonStory';
import {lessonStories} from './lessonStories';
import type {Medium} from './model';
import TwistedSuite from './TwistedSuite';
import SignalLab from './SignalLab';
import StructureLab from './StructureLab';
import LessonNotes from './LessonNotes';
import FiberOptics from './FiberOptics';
import SubmarineLab from './SubmarineLab';
import CableMap from './CableMap';
import SpaceNetwork from './SpaceNetwork';
import ExtensionNotes from './ExtensionNotes';
function readRoute(){if(location.hash==='#/network/ipv4/subnet')history.replaceState(null,'','#/network/ipv4/address');return location.hash;}
function useRoute(){const [hash,setHash]=useState(readRoute);useEffect(()=>{const cb=()=>{setHash(readRoute());window.scrollTo(0,0);};window.addEventListener('hashchange',cb);return()=>window.removeEventListener('hashchange',cb);},[]);return hash;}
export default function App(){
 const hash=useRoute();const parts=hash.replace(/^#\/?/,'').split('/');
 const validMedia=parts[0]==='physical'&&Object.hasOwn(media,parts[1]??'');const isEncoding=parts[0]==='physical'&&parts[1]==='encoding';
 const isMultiplex=parts[0]==='physical'&&parts[1]==='multiplex',isDelay=parts[0]==='physical'&&parts[1]==='delay',isCommunication=parts[0]==='physical'&&parts[1]==='communication',isLink=parts[0]==='datalink'&&parts[1]==='ethernet',isSwitch=parts[0]==='datalink'&&parts[1]==='switching';const isVlan=parts[0]==='datalink'&&parts[1]==='vlan';const isStp=parts[0]==='datalink'&&parts[1]==='stp';const isChannel=parts[0]==='datalink'&&parts[1]==='etherchannel';const isNetwork=parts[0]==='network'&&parts[1]==='ipv4';const isDatalink=isLink||isSwitch||isVlan||isStp||isChannel;const valid=validMedia||isEncoding||isMultiplex||isDelay||isCommunication||isDatalink||isNetwork;const medium=(validMedia?parts[1]:'twisted') as Medium;const section=isEncoding?'encoding':isMultiplex?'multiplex':isDelay?'delay':isCommunication?'communication':isLink?'ethernet':isSwitch?'switching':isVlan?'vlan':isStp?'stp':isChannel?'etherchannel':isNetwork?'ipv4':medium;
 const info=isEncoding?encodingSuite:isMultiplex?multiplexSuite:isDelay?delaySuite:isCommunication?communicationSuite:isLink?ethernetSuite:isSwitch?switchingSuite:isVlan?vlanSuite:isStp?stpSuite:isChannel?channelSuite:isNetwork?ipv4Suite:media[medium];const lesson=info.lessons.some(l=>l.id===parts[2])?parts[2]:info.lessons[0].id;
 const extension=(medium==='fiber'&&lesson!=='signal')||(medium==='radio'&&['satellite','starlink','aviation'].includes(lesson));
 const [about,setAbout]=useState(false);const dialogRef=useRef<HTMLDialogElement>(null);const [full,setFull]=useState(false);const [notice,setNotice]=useState('');
 useEffect(()=>{if(about)dialogRef.current?.showModal();else dialogRef.current?.close();},[about]);
 useEffect(()=>{document.title=valid?`${info.title} · ${info.lessons.find(l=>l.id===lesson)?.title} | 计算机网络原理实验室`:'五层课程主页 | 计算机网络原理实验室';},[valid,info,lesson]);
 useEffect(()=>{const cb=()=>setFull(!!document.fullscreenElement);document.addEventListener('fullscreenchange',cb);return()=>document.removeEventListener('fullscreenchange',cb);},[]);
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{setNotice('当前窗口不支持全屏，请在浏览器中打开演示，或按 F11。');}}
 return <><header className={`site-header${!valid?' directory-header':''}`}><a href="#/" className="brand"><Icon name="network" size={28}/><span>计算机网络 · 原理实验室</span></a><div className="header-actions"><button onClick={()=>setAbout(true)}><Icon name="book"/>课程说明</button>{valid&&<button onClick={fullscreen}><Icon name="full"/>{full?'退出全屏':'全屏演示'}</button>}</div></header>
 {notice&&<p className="notice" role="status">{notice}<button onClick={()=>setNotice('')}>关闭</button></p>}
 {!valid?<Home/>:<main className={`wrap suite popular-suite${isSwitch?' switch-suite':''}`}><nav className="breadcrumb"><a href="#/"><Icon name="back"/>五层目录</a><span>/</span><span>{isDatalink?'数据链路层':isNetwork?'网络层':'物理层'}</span><span>/</span><span>{info.title}</span></nav>
  <div className="suite-intro"><h1>{lessonStories[`${section}/${lesson}`]?.title??info.heading}</h1><p>{lessonStories[`${section}/${lesson}`]?.lead??info.intro}</p></div>
  {!isSwitch&&<nav className="lesson-nav" aria-label={`${info.title}演示选择`}>{info.lessons.map((l,i)=><a href={`#/${isDatalink?'datalink':isNetwork?'network':'physical'}/${section}/${l.id}`} className={lesson===l.id?'active':''} aria-current={lesson===l.id?'page':undefined} key={l.id}><span>0{i+1}</span>{l.title}</a>)}</nav>}
  {isNetwork&&<IpLearningPath lesson={lesson as IpLessonId}/>} {isSwitch?<SwitchLab/>:<LessonStory key={`${section}/${lesson}`} lessonKey={`${section}/${lesson}`}>
  {isNetwork?<IpLab key={lesson} lesson={lesson as IpLessonId}/>:isChannel?<ChannelLab/>:isStp?<StpLab/>:isVlan?<VlanLab/>:isLink?(lesson==='frame'?<EthernetLab/>:<CrcLab/>):isEncoding?<EncodingLab lesson={lesson}/>:isMultiplex?<MultiplexLab lesson={lesson}/>:isDelay?<DelayLab lesson={lesson}/>:isCommunication?<CommunicationLab lesson={lesson}/>:medium==='twisted'?<TwistedSuite lesson={lesson}/>:medium==='fiber'&&['reflection','structure'].includes(lesson)?<FiberOptics key={`optics-${lesson}`} lesson={lesson}/>:medium==='fiber'&&lesson.startsWith('sea-')?<SubmarineLab key={`subsea-${lesson}`} lesson={lesson}/>:medium==='fiber'&&lesson==='global-map'?<CableMap/>:medium==='radio'&&extension?<SpaceNetwork key={`space-${lesson}`} lesson={lesson}/>:lesson==='structure'?<StructureLab key={`structure-${medium}`} medium={medium}/>:<SignalLab key={`signal-${medium}-${lesson}`} medium={medium} lesson={lesson}/>}
  {!isDatalink&&!isNetwork&&!isEncoding&&!isMultiplex&&!isDelay&&!isCommunication&&(extension?<ExtensionNotes key={`extension-${medium}-${lesson}`} medium={medium as 'fiber'|'radio'} lesson={lesson}/>:<LessonNotes key={`notes-${medium}-${lesson}`} medium={medium} lesson={lesson}/>)}
  </LessonStory>}
  {isNetwork&&<IpNextLesson lesson={lesson as IpLessonId}/>}<footer><span>课件对应：{info.source}</span><a href="#/">返回五层目录</a></footer>
 </main>}
 <dialog ref={dialogRef} onCancel={()=>setAbout(false)} onClick={e=>{if(e.target===dialogRef.current)setAbout(false);}}><div className="dialog-heading"><h2>这套演示怎样使用</h2><button aria-label="关闭课程说明" onClick={()=>setAbout(false)}><Icon name="close"/></button></div>
 <p>所有知识点按物理层、数据链路层、网络层、运输层、应用层组织。当前开放物理层 {physicalLessonCount} 个演示，以及数据链路层的帧封装与拆解、CRC 检错、交换机学习与转发、VLAN 与 Trunk、STP 生成树、链路聚合六个独立动画，以及网络层 IPv4 专题的 7 个独立动画，共 {totalLessonCount} 个。每节至少 3 道课堂题，后续继续建设其余主要内容。其余物理层拓展待五层主要演示完成后再安排。</p><p>光纤新增全反射、单模与多模、海缆组成、铺设及全球分布；无线部分新增卫星实物、星链网络与飞机上网。开源版内置自主绘制的跨洋通信教学通道，并提供真实海缆地图与星链官方影像的外部链接；教学通道和光点不代表实际海缆分布或实时流量。</p>
 <ol><li>从五层主页选择一个独立演示；当前 {totalLessonCount} 节均默认进入科普故事。</li><li>点击“下一幕”逐步讲解，或自动播放；故事结束后先回答停顿提问。</li><li>看懂以后展开专业名称与课堂题，再进入自由实验改变条件。</li><li>Packet Tracer 指引保留在自由实验中；实际操作在 PT 中完成。</li></ol>
 <h3>资料与教学模型</h3><p>依据本课程《计算机网络2026.3》中的第 1、2、4、5 章及相关附录制作。模型采用放大的时间与几何比例。波形为机制示意，不预测某型号线缆的速率、距离或误码率。</p>
 <p>线序依据 T568A/B；本例水晶头为非贯通式 8P8C 插头。具体剥线长度、线径匹配和压接工艺按所用插头厂商说明。教学模型、实物制作和 PT 验证各有边界。</p><button className="primary" onClick={()=>setAbout(false)}>开始学习</button></dialog>
 </>;
}

import {processLearningFrame,SWITCH_MAC} from './switchModel';
import type {MacEntry,LearningFrame,SwitchHost} from './switchModel';

export type StoryAction='meet'|'send'|'learn'|'lookup'|'flood'|'receive'|'reply'|'deliver'|'again'|'finish';
export type StoryScene={chapter:number;title:string;body:string;says:string;action:StoryAction;frame:0|1|2;question?:{title:string;choices:string[];correct:number;why:string}};
export const SWITCH_STORY:StoryScene[]=[
 {chapter:0,title:'三台电脑，怎样把消息送对人？',body:'小安用电脑 A，小白用电脑 B，小陈用电脑 C。中间的交换机负责转交消息，我们把一帧画成一封信。',says:'我来帮大家转交！',action:'meet',frame:0},
 {chapter:0,title:'小安：这封信，请交给小白。',body:'信封上有两个标记：谁寄的、给谁的。A 已知道收件人是 B，信先沿网线来到交换机。',says:'收到一封 A 寄给 B 的信',action:'send',frame:0},
 {chapter:0,title:'先记住：A 的信从 1 号口进来。',body:'交换机先看“谁寄的”，记下 A 在 1 号口那一边。它还不能只看收件人，就知道 B 在哪里。',says:'A → 1 号口，记下了！',action:'learn',frame:0},
 {chapter:0,title:'再找一找：B 应该走哪个口？',body:'认路本上目前只有 A，没有 B。交换机知道这封信给 B，却还不知道通往 B 的出口。',says:'B 在哪个口？还没学到。',action:'lookup',frame:0},
 {chapter:0,title:'还不认识路，就向其他出口各送一份。',body:'给 2 号口、5 号口各送一个副本，不送回刚进来的 1 号口。每份信封上仍写着“给 B”。',says:'其他口各送一份，收件人仍是 B',action:'flood',frame:0},
 {chapter:0,title:'小白收下，小陈发现不是给自己的。',body:'B 看到“给 B”，收下消息；C 也收到副本，但发现不是给自己的，就忽略它。交换机此时仍只记住了 A。',says:'送到了，但我还没学到 B 的位置。',action:'receive',frame:0,question:{title:'停一下：现在认路本上记住了谁？',choices:['只有 A','A 和 B 都有了'],correct:0,why:'只记住 A。B 收到信，不等于交换机看到了 B 发信；要等 B 的帧进入交换机，才会学到 B。'}},
 {chapter:1,title:'这次，小白主动回一封信。',body:'B 寄给 A 的回信从 2 号口来到交换机。现在寄信人变成了 B，收件人变成了 A。',says:'这封是 B 寄给 A 的！',action:'reply',frame:1},
 {chapter:1,title:'又学会一条路：B 在 2 号口那一边。',body:'还是先看“谁寄的”。把 B → 2 号口写进本子，先前记住的 A → 1 号口继续保留。',says:'B → 2 号口，也记下了！',action:'learn',frame:1},
 {chapter:1,title:'认识 A 的路了，回信直接送过去。',body:'收件人是 A，本子上写着 A → 1 号口。交换机只向 1 号口转发，小陈这次不会收到副本。',says:'给 A 的信，只走 1 号口',action:'deliver',frame:1},
 {chapter:2,title:'小安再发一次，这次就不绕路了。',body:'A 再给 B 发信：先确认 A 从 1 号口来，再查到 B 在 2 号口。这次只向 2 号口转发。',says:'已经认识 B：只走 2 号口',action:'again',frame:2},
 {chapter:2,title:'交换机就是这样，越转交，越认路。',body:'这种给单个收件人的信：先记寄信人，再找收信人。知道出口就直接送；还不知道，就向其他出口各送一份。',says:'先记寄信人，再找收信人。',action:'finish',frame:2,question:{title:'最后想一想：如果 C 从来没有发过信呢？',choices:['收到副本就会被记住','交换机还学不到 C 的位置'],correct:1,why:'从源地址学习，必须看到 C 发出的帧进入交换机。让 C 收到信，不能证明 C 在哪个入口。'}}
];
export const STORY_CHAPTERS=[{title:'第一次送信',start:0},{title:'收到回信',start:6},{title:'再送一次',start:9}];
const frames:LearningFrame[]=[{source:'A',destination:'B'},{source:'B',destination:'A'},{source:'A',destination:'B'}];
let table:MacEntry[]=[];
export const STORY_TRANSACTIONS=frames.map((frame,i)=>{const result=processLearningFrame(table,frame,'direct',i+1);table=result.learned;return result;});
export function storyState(index:number,progress=1){
 const scene=SWITCH_STORY[index];
 const result=STORY_TRANSACTIONS[scene.frame];
 const before=['meet','send','reply'].includes(scene.action)||(scene.action==='learn'&&progress<.78)||(scene.action==='again'&&progress<.45);
 const entries=before?result.before:result.learned;
 return {scene,result,frame:frames[scene.frame],entries,known:entries.map(entry=>Object.entries(SWITCH_MAC).find(([,mac])=>mac===entry.mac)![0] as SwitchHost)};
}

export const STORY_MOTION_MS=3000;
export const STORY_READ_MS=7800;
export type StoryPlayback={index:number;elapsed:number;running:boolean;auto:boolean};
export const STORY_START:StoryPlayback={index:0,elapsed:STORY_MOTION_MS,running:false,auto:false};
export function advanceStory(state:StoryPlayback,delta:number):StoryPlayback{
 if(!state.running)return state;
 const elapsed=state.elapsed+Math.max(0,delta),limit=state.auto?STORY_READ_MS:STORY_MOTION_MS;
 if(elapsed<limit)return {...state,elapsed};
 if(!state.auto||SWITCH_STORY[state.index].question||state.index===SWITCH_STORY.length-1)return {...state,elapsed:limit,running:false,auto:false};
 return {...state,index:state.index+1,elapsed:0};
}

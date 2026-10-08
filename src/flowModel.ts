export const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
export function linkTimes(bits:number,rateBps:number,distanceKm:number,speedKmS:number){
 return {sendMs:bits/rateBps*1000,propMs:distanceKm/speedKmS*1000,totalMs:bits/rateBps*1000+distanceKm/speedKmS*1000};
}
export function completeBits(timeMs:number,bits:number,rateBps:number,propMs=0){return Math.floor(clamp((timeMs-propMs)*rateBps/1000+1e-8,0,bits));}
// A cell represents a time interval of the serialized signal, not a particle.
export function signalSegment(timeMs:number,index:number,cells:number,sendMs:number,propMs:number){
 if(propMs<=0)return null;
 const front=(timeMs-index*sendMs/cells)/propMs,tail=(timeMs-(index+1)*sendMs/cells)/propMs;
 if(front<=0||tail>=1)return null;
 return {left:clamp(tail),right:clamp(front)};
}
export type DirectionMode='simplex'|'half'|'full';
export function directionSchedule(mode:DirectionMode,bPending:boolean){
 return {a:{start:0,end:4},b:!bPending||mode==='simplex'?null:mode==='half'?{start:5,end:9}:{start:0,end:4}};
}
export const PARALLEL_WORDS=['1010','0101','1100'] as const;
export function serialization(bits:number,lanes:number,perLaneMbps:number){return {durationUs:Math.ceil(bits/lanes)/perLaneMbps,aggregateMbps:lanes*perLaneMbps};}
export function laneValue(time:number,lane:number,delay:number){
 const word=Math.floor(time-delay+1e-9);
 return word<0?'0':PARALLEL_WORDS[Math.min(word,PARALLEL_WORDS.length-1)][lane];
}
export function captureWord(word:number,phase:number,delays:readonly number[]){return delays.map((d,lane)=>laneValue(word+phase,lane,d)).join('');}

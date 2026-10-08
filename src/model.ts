export type Medium='twisted'|'coax'|'fiber'|'radio';
export type Decision='0'|'1'|'?';
export interface Settings {
 noise:number; balanced:boolean; shield:boolean; termination:'matched'|'open'|'short';
 fiberMode:'single'|'multi'; length:number; bend:number; distance:number; walls:number; interference:number;
}
export const INITIAL_BITS='10110010';
export const DEFAULTS:Settings={noise:0.2,balanced:true,shield:true,termination:'matched',fiberMode:'single',length:1000,bend:0,distance:10,walls:0,interference:0.1};
export const DELAY=1.6; // Time is measured in educational bit periods, not real network seconds.
export const bitAt=(bits:string,t:number)=>t<0||t>=bits.length?null:Number(bits[Math.floor(t)]);
export function source(bits:string,t:number,optical=false):number {
 const bit=bitAt(bits,t);return bit===null?0:optical?bit:bit*2-1;
}
export const noiseAt=(t:number)=>0.8*Math.sin(2.7*t+2)+0.45*Math.sin(9.1*t+0.3);
export function wireVoltages(bits:string,t:number,s:Settings):[number,number] {
 const signal=source(bits,t); const common=noiseAt(t)*s.noise*4;
 const coupling=s.balanced?0.96:0;
 return [signal+common,-signal+coupling*common];
}
export const reflectionCoefficient=(termination:Settings['termination'])=>termination==='matched'?0:termination==='open'?1:-1;
export function opticalSample(bits:string,t:number,s:Settings):number {
 if(t<0)return 0;
 // Causal exponential pulse-spreading model, normalized to unit DC gain.
 // Coefficients are illustrative, not fiber specifications or link-budget predictions.
 const tau=s.fiberMode==='single'?0.04+s.length/200000:0.06+s.length/2600;
 let total=0,weight=0;
 const du=tau/30;
 for(let j=0;j<180;j++) {const u=j*du;const w=Math.exp(-u/tau);total+=source(bits,t-u,true)*w;weight+=w;}
 const gain=Math.exp(-s.length/24000-s.bend/65);
 return total/weight*gain;
}
export function received(m:Medium,bits:string,t:number,s:Settings):number {
 if(t<0)return 0;
 if(m==='twisted'){const [a,b]=wireVoltages(bits,t,s);return (a-b)/2;}
 if(m==='coax'){
  // Endpoint voltage = incident voltage * (1 + Gamma). Source is matched.
  // An open load doubles ideal endpoint voltage; a short forces it to zero.
  const gain=1+reflectionCoefficient(s.termination);
  return gain*(0.82*source(bits,t)+noiseAt(t)*s.noise*(s.shield?0.06:1.4));
 }
 if(m==='fiber')return opticalSample(bits,t,s);
 const gain=Math.min(1,10/s.distance)*Math.pow(0.65,s.walls);
 const echo=s.walls?0.24*gain*source(bits,t-0.65):0;
 return gain*source(bits,t)+echo+s.interference*1.3*noiseAt(t);
}
export const threshold=(m:Medium)=>m==='fiber'?0.45:0;
export function decide(m:Medium,value:number):Decision {
 if(m==='fiber')return value>=threshold(m)?'1':'0';
 if(Math.abs(value)<0.08)return '?';
 return value>0?'1':'0';
}
export function decisions(m:Medium,bits:string,s:Settings):Decision[]{return [...bits].map((_,i)=>decide(m,received(m,bits,i+0.5,s)));}
export function receivedCount(time:number,n:number){return Math.min(n,Math.max(0,Math.floor(time-DELAY-0.5)+1));}
export function formatResult(m:Medium,bits:string,s:Settings,time:number){
 const count=receivedCount(time,bits.length);const output=decisions(m,bits,s).slice(0,count);
 const errors=output.filter((v,i)=>v!==bits[i]).length;
 return {count,errors,output};
}
export function validateBits(value:string){return /^[01]{4,16}$/.test(value);}

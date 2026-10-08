export type LineCode='nrz'|'manchester'|'differential';
export type ManchesterRule='rising-one'|'falling-one';
export type Modulation='ask'|'fsk'|'psk';
export type Level=-1|1;
export const LINE_CODES:LineCode[]=['nrz','manchester','differential'];
export const LINE_NAMES:Record<LineCode,string>={nrz:'NRZ-L',manchester:'曼彻斯特',differential:'差分曼彻斯特'};
export const LINE_COLORS:Record<LineCode,string>={nrz:'#087f8c',manchester:'#3977b4',differential:'#b87725'};
export function validSequence(bits:string,min=4,max=12){return new RegExp(`^[01]{${min},${max}}$`).test(bits);}
export function encodeLine(bits:string,code:LineCode,rule:ManchesterRule='rising-one',initial:Level=1):Level[]{
 let previous:Level=initial;const levels:Level[]=[];
 for(const bit of bits){
  if(code==='nrz'){const a=bit==='1'?1:-1;levels.push(a,a);}
  else if(code==='manchester'){const a:Level=(bit==='1')===(rule==='rising-one')?-1:1;levels.push(a,-a as Level);}
  else{const a:Level=bit==='0'?-previous as Level:previous;previous=-a as Level;levels.push(a,previous);}
 }
 return levels;
}
export function decodeLine(levels:number[],code:LineCode,rule:ManchesterRule='rising-one',initial=1):string{
 let previous=initial,out='';
 for(let i=0;i<levels.length;i+=2){const a=levels[i],b=levels[i+1];
  if(b===undefined){out+='?';break;}
  if(code==='nrz')out+=a===b?(a>0?'1':'0'):'?';
  else if(a===b)out+='?';
  else if(code==='manchester')out+=((a<b)===(rule==='rising-one'))?'1':'0';
  else out+=a===previous?'1':'0';
  previous=b;
 }
 return out;
}
export function transitions(levels:number[]){return levels.slice(1).filter((v,i)=>v!==levels[i]).length;}
export function levelPath(levels:number[],x:number,y:number,width:number,amplitude:number):string{
 if(!levels.length)return '';const unit=width/levels.length;let d=`M${x} ${y-levels[0]*amplitude}`;
 levels.forEach((v,i)=>{if(i)d+=`V${y-v*amplitude}`;d+=`H${(x+(i+1)*unit).toFixed(3)}`;});return d;
}
// Each binary symbol is one bit here. Integer cycles make the FSK example phase-continuous.
export function carrierValue(time:number,cycles=3){return Math.cos(2*Math.PI*cycles*time);}
export function modulatedValue(bits:string,time:number,type:Modulation){
 const t=Math.max(0,Math.min(bits.length-1e-8,time));const bit=bits[Math.floor(t)];
 if(type==='ask')return bit==='1'?carrierValue(t):0;
 if(type==='fsk')return carrierValue(t,bit==='1'?5:2);
 return carrierValue(t)*(bit==='1'?1:-1);
}
export function analogPath(length:number,value:(t:number)=>number,x:number,y:number,width:number,amplitude:number){
 const points=Math.ceil(length*90);return Array.from({length:points+1},(_,i)=>{const t=i/points*length;return `${i?'L':'M'}${(x+t/length*width).toFixed(2)} ${(y-value(t)*amplitude).toFixed(2)}`;}).join('');
}
export function pamLevels(order:number){return Array.from({length:order},(_,i)=>-1+2*i/(order-1));}
export function pamSymbols(bits:string,order:number){
 const k=Math.log2(order);if(![2,4,8].includes(order)||bits.length%k!==0)throw new Error('序列长度必须是每码元比特数的整数倍。');
 return Array.from({length:bits.length/k},(_,i)=>{const group=bits.slice(i*k,(i+1)*k);const index=parseInt(group,2);return {bits:group,index,level:pamLevels(order)[index]};});
}
export function nearestPam(value:number,order:number){const levels=pamLevels(order);let index=0;for(let i=1;i<levels.length;i++)if(Math.abs(value-levels[i])<Math.abs(value-levels[index]))index=i;return index;}
export function rates(order:number,baud:number,bitCount:number){const bitsPerSymbol=Math.log2(order);return {bitsPerSymbol,bitRate:baud*bitsPerSymbol,symbolCount:bitCount/bitsPerSymbol,durationMs:1000*bitCount/(baud*bitsPerSymbol),spacing:2/(order-1)};}

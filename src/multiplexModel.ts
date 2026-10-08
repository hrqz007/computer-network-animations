export const USERS=['A','B','C'] as const;
export type User=typeof USERS[number];
export const USER_COLORS:Record<User,string>={A:'#087f8c',B:'#3977b4',C:'#b87725'};
export const USER_CODES:Record<User,number[]>={A:[1,1,-1,-1],B:[1,-1,1,-1],C:[1,-1,-1,1]};
export const WAVELENGTHS:Record<User,number>={A:1530,B:1550,C:1570};
export function frequencyBands(gap:number){return USERS.map((user,i)=>{const center=14+i*(16+gap);return {user,center,low:center-8,high:center+8};});}
export function overlapWidth(a:{low:number;high:number},b:{low:number;high:number}){return Math.max(0,Math.min(a.high,b.high)-Math.max(a.low,b.low));}
export type Slot={user:User;payload:string|null;round:number};
export function tdmSlots(activeB:boolean,statistical:boolean):Slot[]{
 const slots:Slot[]=[];for(let i=0;i<4;i++)for(const user of USERS){const payload=user==='B'&&!activeB?null:`${user}${i+1}`;if(!statistical||payload)slots.push({user,payload,round:i});}return slots;
}
export function tdmMetrics(slots:Slot[],statistical:boolean){const payloads=slots.filter(s=>s.payload!==null).length;const duration=slots.length*(statistical?1.25:1);return {payloads,duration,utilization:payloads/duration,overhead:statistical?slots.length*.25:0,idle:slots.length-payloads};}
export function receivedSlots(slots:Slot[],completed:number,user:User){return slots.slice(0,Math.floor(completed)).filter(s=>s.user===user&&s.payload!==null).map(s=>s.payload!);}
export function selectWavelength(wavelength:number,bEnabled:boolean,broken:boolean):User|null{if(broken)return null;return USERS.find(u=>WAVELENGTHS[u]===wavelength&&(u!=='B'||bEnabled))??null;}
export function dot(a:number[],b:number[]){if(a.length!==b.length)throw new Error('码长不一致');return a.reduce((sum,x,i)=>sum+x*b[i],0);}
export function cdmChannels(bits:Record<User,number>,collision=false){return USERS.map(user=>{const code=USER_CODES[collision&&user==='B'?'A':user];const symbol=bits[user]===1?1:-1;return {user,code,symbol,chips:code.map(v=>v*symbol)};});}
export function cdmSum(channels:ReturnType<typeof cdmChannels>){return USER_CODES.A.map((_,i)=>channels.reduce((sum,c)=>sum+c.chips[i],0));}
export function cdmDecision(value:number){return Math.abs(value)<1e-9?'?':value>0?'1':'0';}

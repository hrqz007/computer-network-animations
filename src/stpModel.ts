export const STP_SWITCHES=['S1','S2','S3'] as const;
export type StpSwitch=typeof STP_SWITCHES[number];
export type StpEdge='12'|'13'|'23';
export const STP_LINKS:{id:StpEdge;a:StpSwitch;b:StpSwitch;ap:string;bp:string}[]=[
 {id:'12',a:'S1',b:'S2',ap:'Fa0/1',bp:'Fa0/1'},
 {id:'13',a:'S1',b:'S3',ap:'Fa0/2',bp:'Fa0/1'},
 {id:'23',a:'S2',b:'S3',ap:'Fa0/2',bp:'Fa0/2'}
];
export const STP_PRIORITIES:Record<StpSwitch,number>={S1:4096,S2:8192,S3:12288};
export const STP_MAC:Record<StpSwitch,string>={S1:'0000.0000.0001',S2:'0000.0000.0002',S3:'0000.0000.0003'};
export type StpRole='Root'|'Desg'|'Altn'|'Down';
export type StpPort={switch:StpSwitch;port:string;edge:StpEdge;role:StpRole};
export type StpTree={root:StpSwitch;costs:Record<StpSwitch,number>;ports:StpPort[];active:StpEdge[]};
export function stpPriorities(root:StpSwitch):Record<StpSwitch,number>{return {...STP_PRIORITIES,[root]:0};}
// Teaching topology: one VLAN, three point-to-point 100 Mb/s links, short path cost 19.
// At most one failed link; hence all three bridges remain in the same component.
export function stpTree(priorities=STP_PRIORITIES,down:StpEdge|null=null):StpTree{
 const compare=(a:StpSwitch,b:StpSwitch)=>priorities[a]-priorities[b]||STP_MAC[a].localeCompare(STP_MAC[b]);
 const root=[...STP_SWITCHES].sort(compare)[0],costs:Record<StpSwitch,number>={S1:Infinity,S2:Infinity,S3:Infinity};costs[root]=0;
 const links=STP_LINKS.filter(l=>l.id!==down);
 for(let n=0;n<STP_SWITCHES.length;n++)for(const l of links){costs[l.a]=Math.min(costs[l.a],costs[l.b]+19);costs[l.b]=Math.min(costs[l.b],costs[l.a]+19);}
 const rootPorts=new Map<StpSwitch,StpEdge>();
 for(const sw of STP_SWITCHES){if(sw===root)continue;const candidates=links.filter(l=>l.a===sw||l.b===sw).map(l=>({edge:l.id,peer:l.a===sw?l.b:l.a}));candidates.sort((a,b)=>costs[a.peer]-costs[b.peer]||compare(a.peer,b.peer));rootPorts.set(sw,candidates[0].edge);}
 const ports:StpPort[]=STP_LINKS.flatMap(l=>{
  const designated=(costs[l.a]-costs[l.b]||compare(l.a,l.b))<0?l.a:l.b;
  return ([l.a,l.b] as const).map((sw,i)=>({switch:sw,port:i===0?l.ap:l.bp,edge:l.id,role:l.id===down?'Down':rootPorts.get(sw)===l.id?'Root':sw===designated?'Desg':'Altn'}));
 });
 return {root,costs,ports,active:links.filter(l=>ports.filter(p=>p.edge===l.id).every(p=>p.role==='Root'||p.role==='Desg')).map(l=>l.id)};
}
export function stpPath(edges:StpEdge[],from:StpSwitch='S2',to:StpSwitch='S3'):StpSwitch[]{
 const queue:StpSwitch[][]=[[from]],seen=new Set<StpSwitch>([from]);
 while(queue.length){const path=queue.shift()!,last=path[path.length-1];if(last===to)return path;for(const l of STP_LINKS.filter(l=>edges.includes(l.id))){const next=l.a===last?l.b:l.b===last?l.a:null;if(next&&!seen.has(next)){seen.add(next);queue.push([...path,next]);}}}return [];
}
export type StpPhase=0|1|2|3|4;
export const STP_PHASES=['发现断线','重新计算','侦听 Listening','学习 Learning','恢复转发'] as const;
export function stpRecovery(priorities:Record<StpSwitch,number>,down:StpEdge,phase:StpPhase){
 const before=stpTree(priorities),after=stpTree(priorities,down);
 const opening=after.ports.filter(p=>p.role!=='Down'&&p.role!=='Altn'&&before.ports.some(b=>b.switch===p.switch&&b.edge===p.edge&&b.role==='Altn'));
 const active=phase===4?after.active:after.active.filter(edge=>before.active.includes(edge));
 const states=after.ports.map(port=>({...port,state:port.role==='Down'?'Down':port.role==='Altn'?'BLK':opening.some(o=>o.switch===port.switch&&o.edge===port.edge)?(['BLK','BLK','LIS','LRN','FWD'] as const)[phase]:'FWD'}));
 return {before,after,opening,active,states,path:stpPath(active)};
}
// Bound the display, not the Ethernet frame lifetime: no TTL is invented for L2 frames.
export function stpFloodRounds(active:StpEdge[],rounds=6){
 let pending:{at:StpSwitch;from:StpSwitch|null}[]=[{at:'S2',from:null}];
 const result:{from:StpSwitch;to:StpSwitch}[][]=[];
 for(let i=0;i<rounds;i++){const hops=pending.flatMap(item=>STP_LINKS.filter(l=>active.includes(l.id)).flatMap(l=>{const to=l.a===item.at?l.b:l.b===item.at?l.a:null;return to&&to!==item.from?[{from:item.at,to}]:[];}));result.push(hops);pending=hops.map(h=>({at:h.to,from:h.from}));}return result;
}

export const SWITCH_HOSTS=['A','B','C'] as const;
export type SwitchHost=typeof SWITCH_HOSTS[number];
export type SwitchDestination=SwitchHost|'broadcast';
export type SwitchTopology='direct'|'shared';
export const SWITCH_MAC:Record<SwitchHost,string>={A:'02:00:00:00:00:0A',B:'02:00:00:00:00:0B',C:'02:00:00:00:00:0C'};
export const BROADCAST_MAC='FF:FF:FF:FF:FF:FF';
export const SWITCH_AGING=300;
export type MacEntry={mac:string;port:number;vlan:number;lastSeen:number};
export type LearningFrame={source:SwitchHost;destination:SwitchDestination};
export type SwitchDecision='unknown'|'known'|'broadcast'|'filter';
export function switchPort(host:SwitchHost,topology:SwitchTopology){return host==='A'?1:host==='B'?(topology==='shared'?1:2):5;}
export function switchPorts(topology:SwitchTopology){return topology==='shared'?[1,5]:[1,2,5];}
export function destinationMac(destination:SwitchDestination){return destination==='broadcast'?BROADCAST_MAC:SWITCH_MAC[destination];}
export function ageMacTable(table:readonly MacEntry[],now:number,aging=SWITCH_AGING){return table.filter(e=>now-e.lastSeen<aging);}
export function seedMacTable(hosts:SwitchHost[],topology:SwitchTopology,now=0):MacEntry[]{return hosts.map(host=>({mac:SWITCH_MAC[host],port:switchPort(host,topology),vlan:1,lastSeen:now}));}

// A pure frame transaction makes stepping backward restore exactly the same table.
export function processLearningFrame(table:readonly MacEntry[],frame:LearningFrame,topology:SwitchTopology,now:number){
 if(frame.source===frame.destination)throw new Error('请选择不同的发送与接收主机');
 const before=ageMacTable(table,now),expired=table.filter(e=>!before.includes(e));
 const ingress=switchPort(frame.source,topology),sourceMac=SWITCH_MAC[frame.source],targetMac=destinationMac(frame.destination);
 const previous=before.find(e=>e.vlan===1&&e.mac===sourceMac);
 const learned=[...before.filter(e=>!(e.vlan===1&&e.mac===sourceMac)),{mac:sourceMac,port:ingress,vlan:1,lastSeen:now}].sort((a,b)=>a.vlan-b.vlan||a.mac.localeCompare(b.mac));
 const target=learned.find(e=>e.vlan===1&&e.mac===targetMac);
 const decision:SwitchDecision=frame.destination==='broadcast'?'broadcast':!target?'unknown':target.port===ingress?'filter':'known';
 const egress=decision==='filter'?[]:decision==='known'?[target!.port]:switchPorts(topology).filter(port=>port!==ingress);
 const local=SWITCH_HOSTS.filter(host=>host!==frame.source&&switchPort(host,topology)===ingress);
 const viaSwitch=SWITCH_HOSTS.filter(host=>egress.includes(switchPort(host,topology)));
 const reached=SWITCH_HOSTS.filter(host=>local.includes(host)||viaSwitch.includes(host));
 const accepted=reached.filter(host=>frame.destination==='broadcast'||host===frame.destination);
 const discarded=reached.filter(host=>!accepted.includes(host));
 return {before,expired,learned,ingress,sourceMac,targetMac,previous,target,decision,egress,local,viaSwitch,reached,accepted,discarded,learning:!previous?'new':previous.port===ingress?'refresh':'move'};
}
export type SwitchResult=ReturnType<typeof processLearningFrame>;

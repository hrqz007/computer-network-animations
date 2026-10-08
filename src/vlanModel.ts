export type VlanHost='A'|'B'|'C'|'D';
export type VlanId=1|10|20;
export type VlanConfig={dual:boolean;divided:boolean;linkUp:boolean;allowS1:readonly VlanId[];allowS2:readonly VlanId[];bVlan:10|20};
export const VLAN_HOSTS:readonly VlanHost[]=['A','B','C','D'];
export const VLAN_DEFAULT:VlanConfig={dual:true,divided:true,linkUp:true,allowS1:[1,10,20],allowS2:[1,10,20],bVlan:10};
export function hostVlan(host:VlanHost,config:VlanConfig):VlanId{return !config.divided?1:host==='A'?10:host==='B'?config.bVlan:20;}
export function hostSwitch(host:VlanHost,config:VlanConfig){return config.dual&&(host==='B'||host==='D')?'S2':'S1';}
// A single broadcast, injected by one of the two left-hand hosts. No routing, loops or MAC-table shortcuts.
export function vlanBroadcast(source:'A'|'C',config:VlanConfig){
 const vlan=hostVlan(source,config);
 const local=VLAN_HOSTS.filter(h=>h!==source&&hostSwitch(h,config)==='S1'&&hostVlan(h,config)===vlan);
 const stop=!config.dual?null:!config.linkUp?'link-down':!config.allowS1.includes(vlan)?'s1-filter':!config.allowS2.includes(vlan)?'s2-filter':null;
 const crosses=config.dual&&!stop;
 const remote=crosses?VLAN_HOSTS.filter(h=>hostSwitch(h,config)==='S2'&&hostVlan(h,config)===vlan):[];
 const leavesS1=config.dual&&config.linkUp&&config.allowS1.includes(vlan);
 return {source,vlan,local,remote,recipients:[...local,...remote],stop,crosses,leavesS1,tag:leavesS1&&vlan!==1?vlan:null};
}
export function vlanStoryState(step:number):{config:VlanConfig;source:'A'|'C'}{
 const config={...VLAN_DEFAULT,dual:step>=3,divided:step!==0,linkUp:step!==3,allowS1:step===6?[1,10] as const:VLAN_DEFAULT.allowS1};
 return {config,source:step===5||step===6?'C':'A'};
}

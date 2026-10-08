export type ChannelMode='on'|'active'|'passive';
export type ChannelRule='source'|'destination';
export type ChannelMember=1|2;
export type ChannelFlowId='A'|'B'|'C';
export type ChannelConfig={bundle:boolean;left:ChannelMode;right:ChannelMode;rule:ChannelRule;flowCount:1|2|3;demand:number;up:[boolean,boolean];reselect:boolean};
export const CHANNEL_DEFAULT:ChannelConfig={bundle:true,left:'on',right:'on',rule:'source',flowCount:2,demand:80,up:[true,true],reselect:true};
export const CHANNEL_FLOWS=[
 {id:'A',source:'0200.0000.0010',destination:'0200.0000.00f0',color:'#188878'},
 {id:'B',source:'0200.0000.0011',destination:'0200.0000.00f0',color:'#477cba'},
 {id:'C',source:'0200.0000.0012',destination:'0200.0000.00f0',color:'#b57c27'}
] as const;
export function channelAgreement(left:ChannelMode,right:ChannelMode){
 if(left==='on'&&right==='on')return {compatible:true,protocol:'静态 on',reason:'两端手动聚合；不发送 LACP 协商消息。'};
 if(left==='on'||right==='on')return {compatible:false,protocol:'模式不匹配',reason:'静态 on 与 LACP 不能组成同一个可用聚合通道。'};
 if(left==='passive'&&right==='passive')return {compatible:false,protocol:'LACP',reason:'双方都只响应，没有一方主动发起协商。'};
 return {compatible:true,protocol:'LACP',reason:'至少一端 active，且两端成员参数兼容时可协商聚合。'};
}
// Deliberately transparent classroom hash; it does not reproduce Cisco's hardware hash.
export function channelHash(mac:string,members:ChannelMember[]):ChannelMember|null{
 if(!members.length)return null;
 const byte=parseInt(mac.replaceAll('.','').slice(-2),16);
 return members[byte%members.length];
}
export function channelModel(config:ChannelConfig){
 const agreement=channelAgreement(config.left,config.right),up=([1,2] as const).filter(m=>config.up[m-1]);
 const unformed=config.bundle&&!agreement.compatible;
 const active=unformed?[]:config.bundle?up:up.slice(0,1);
 const status=unformed?'unformed':!active.length?'down':!config.bundle?'separate':!config.reselect&&up.length<2?'reselecting':'formed';
 const flows=CHANNEL_FLOWS.slice(0,config.flowCount).map(flow=>{
  const candidates=config.bundle&&!config.reselect?([1,2] as ChannelMember[]):active;
  const selected=unformed?null:config.bundle?channelHash(flow[config.rule],candidates):active[0]??null;
  const member=selected&&active.includes(selected)?selected:null;
  return {...flow,member,requested:config.demand,rate:0};
 });
 const lanes=([1,2] as const).map(member=>{
  const selected=flows.filter(f=>f.member===member),requested=selected.reduce((sum,f)=>sum+f.requested,0);
  const rate=active.includes(member)?Math.min(100,requested):0;
  for(const flow of selected)flow.rate=requested?flow.requested*rate/requested:0;
  return {member,up:config.up[member-1],active:active.includes(member),requested,rate,flows:selected.map(f=>f.id)};
 });
 // No EtherChannel formed does not prove that the independent physical ports cannot forward.
 return {agreement,status,active,flows,lanes,capacity:unformed?null:active.length*100,total:unformed?null:lanes.reduce((sum,l)=>sum+l.rate,0)};
}
export type ChannelPreset='separate'|'multi'|'single'|'collision'|'failure'|'lacp'|'silent';
export function channelPreset(id:ChannelPreset):ChannelConfig{
 const config={...CHANNEL_DEFAULT,up:[true,true] as [boolean,boolean]};
 if(id==='separate')config.bundle=false;
 if(id==='single'){config.flowCount=1;config.demand=160;}
 if(id==='collision'){config.flowCount=3;config.rule='destination';}
 if(id==='failure')config.up=[false,true];
 if(id==='lacp'){config.left='active';config.right='passive';}
 if(id==='silent'){config.left='passive';config.right='passive';}
 return config;
}
export function channelStoryConfig(step:number):ChannelConfig{
 if(step===0)return channelPreset('separate');
 if(step===3)return channelPreset('single');
 if(step===4)return channelPreset('collision');
 if(step===5)return {...channelPreset('failure'),reselect:false};
 if(step===6)return channelPreset('failure');
 if(step===7)return channelPreset('lacp');
 if(step===8)return channelPreset('silent');
 return channelPreset('multi');
}

export function parseIPv4(text:string):number|null{
 const parts=text.trim().split('.');
 if(parts.length!==4||parts.some(part=>!/^(0|[1-9]\d{0,2})$/.test(part)||Number(part)>255))return null;
 return parts.reduce((value,part)=>value*256+Number(part),0);
}
export function formatIPv4(value:number){return [24,16,8,0].map(shift=>(value>>>shift)&255).join('.');}
export function ipBits(value:number){return (value>>>0).toString(2).padStart(32,'0');}
export function prefixMask(prefix:number){if(!Number.isInteger(prefix)||prefix<0||prefix>32)throw new RangeError('前缀须为 0—32 的整数');return prefix===0?0:(0xffffffff<<(32-prefix))>>>0;}
export function subnetInfo(text:string,prefix:number){
 const value=parseIPv4(text);if(value===null)return null;
 const mask=prefixMask(prefix),network=(value&mask)>>>0,size=2**(32-prefix),last=network+size-1;
 const ordinary=prefix<=30;
 return {value,prefix,mask,network,last,size,hostBits:32-prefix,hostPart:value-network,
  broadcast:ordinary?last:null,firstHost:ordinary?network+1:network,lastHost:ordinary?last-1:last,
  usable:ordinary?size-2:size,kind:prefix===31?'point-to-point':prefix===32?'single':'ordinary'} as const;
}
export type IpConfig={source:string;destination:string;prefix:number;gateway:string};
export type IpPreset='same'|'split'|'remote'|'missing'|'bad-gateway'|'course';
export function ipPreset(id:IpPreset):IpConfig{
 const base={source:'192.168.1.10',destination:'192.168.1.200',prefix:24,gateway:'192.168.1.126'};
 if(id==='split')return {...base,prefix:25};
 if(id==='remote')return {...base,destination:'192.168.2.20',gateway:'192.168.1.254'};
 if(id==='missing')return {...base,prefix:25,gateway:''};
 if(id==='bad-gateway')return {...base,prefix:25,gateway:'192.168.1.254'};
 if(id==='course')return {source:'151.188.5.42',destination:'151.200.8.9',prefix:9,gateway:'151.128.0.1'};
 return base;
}
const ordinaryUnicast=(value:number)=>{const first=value>>>24;return first>0&&first<224&&first!==127&&(value>>>16)!==0xa9fe;};
export function nextHop(config:IpConfig){
 const source=subnetInfo(config.source,config.prefix),destination=parseIPv4(config.destination);
 const base={source,destination,destinationNetwork:destination===null?null:(destination&prefixMask(config.prefix))>>>0,hop:null as string|null};
 const result=(status:'invalid'|'self'|'direct'|'gateway'|'missing-gateway'|'invalid-gateway',title:string,reason:string,hop:string|null=null)=>({...base,status,title,reason,hop});
 if(!source||destination===null)return result('invalid','先填写完整的 IPv4 地址','每段为 0—255 的十进制整数，共四段；不使用前导零。');
 if(config.prefix<1||config.prefix>30)return result('invalid','本实验演示普通广播子网','/31 点到点与 /32 单地址用途另见原理说明，不套用本图。');
 if(!ordinaryUnicast(source.value)||!ordinaryUnicast(destination))return result('invalid','请使用普通单播地址','本图不模拟 0/8、环回、多播、保留地址以及 169.254/16 链路本地地址的特殊处理。');
 if(source.value===source.network||source.value===source.last)return result('invalid','A 不能使用本子网的首尾地址','普通广播子网中，主机位全 0 表示网络，全 1 表示广播；请改用中间的主机地址。');
 if(destination===source.value)return result('self','目的地就是本机','交给本机协议栈，不在网络中寻找下一跳。');
 if(base.destinationNetwork===source.network){
  if(destination===source.network||destination===source.last)return result('invalid','这里选到的是网络或广播地址','本实验只演示普通主机单播，请将目的地址改为本子网的可用主机地址。');
  return result('direct','判断为同网：下一跳就是 D','使用 A 自己的掩码比较两个网络前缀。在二层可达的前提下直接交付，不需要默认网关。',formatIPv4(destination));
 }
 if(!config.gateway.trim())return result('missing-gateway','判断为异网：缺少默认网关','本例没有其他路由，无法选择外发下一跳；这不影响本机与同网主机的直接通信。');
 const gateway=parseIPv4(config.gateway);
 if(gateway===null||!ordinaryUnicast(gateway)||(gateway&source.mask)>>>0!==source.network||gateway===source.network||gateway===source.last||gateway===source.value)return result('invalid-gateway','默认网关不适用于 A 的本地子网','本例网关应为同网、不同于 A 的可用主机地址，并对应真实的三层设备接口。不能只看前三段相同。');
 return result('gateway','判断为异网：下一跳先选网关','IP 目的地址仍是 D。选中了网关并不证明 D 已可达，后续还取决于路由、回程、链路与策略。',formatIPv4(gateway));
}
export function split24(text:string,childPrefix:number){
 if(!Number.isInteger(childPrefix)||childPrefix<24||childPrefix>28)throw new RangeError('地址块展示支持 /24—/28');
 const parent=subnetInfo(text,24);if(!parent)return [];
 return Array.from({length:2**(childPrefix-24)},(_,index)=>subnetInfo(formatIPv4(parent.network+index*2**(32-childPrefix)),childPrefix)!);
}

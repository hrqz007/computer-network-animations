import {formatIPv4,parseIPv4,prefixMask,subnetInfo} from './ipModel';
export const OCTET_WEIGHTS=[128,64,32,16,8,4,2,1] as const;
export function octetBits(value:number){return value.toString(2).padStart(8,'0');}
export function andColumns(address:string,prefix:number,group:number){
 const value=parseIPv4(address);if(value===null||!Number.isInteger(group)||group<0||group>3)return [];
 const a=(value>>>(24-group*8))&255,m=(prefixMask(prefix)>>>(24-group*8))&255;
 return OCTET_WEIGHTS.map((weight,i)=>({weight,a:(a>>(7-i))&1,mask:(m>>(7-i))&1,result:((a&m)>>(7-i))&1,network:group*8+i<prefix}));
}
export function compareNetworks(a:string,d:string,prefix:number){
 const source=subnetInfo(a,prefix),destination=parseIPv4(d);if(!source||destination===null)return null;
 const target=(destination&source.mask)>>>0;
 return {source:formatIPv4(source.network),destination:formatIPv4(target),same:source.network===target,mask:formatIPv4(source.mask)};
}
export function addressRole(address:string,prefix:number){
 const info=subnetInfo(address,prefix);if(!info)return null;
 const role=info.kind==='point-to-point'?'点到点端点':info.kind==='single'?'单地址':info.value===info.network?'网络地址':info.value===info.last?'广播地址':'可用主机地址';
 return {...info,role};
}

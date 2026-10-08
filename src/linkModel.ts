export const MAC_A='02:00:00:00:00:0A',MAC_B='02:00:00:00:00:0B';
export function ethernetLengths(payload:number){
 if(!Number.isInteger(payload)||payload<0||payload>1500)throw new Error('本例未标记以太网载荷须为 0—1500 字节');
 const padding=Math.max(0,46-payload);
 return {payload,padding,body:payload+padding,header:14,fcs:4,frame:18+payload+padding,onWire:26+payload+padding};
}
export function crc32(bytes:readonly number[]|Uint8Array){
 let crc=0xffffffff;
 for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
 return (crc^0xffffffff)>>>0;
}
export function internetChecksum(bytes:readonly number[]){let sum=0;for(let i=0;i<bytes.length;i+=2)sum+=(bytes[i]<<8)+(bytes[i+1]??0);while(sum>>>16)sum=(sum&0xffff)+(sum>>>16);return (~sum)&0xffff;}
export function ipv4Sample(length:number,reverse=false){
 if(!Number.isInteger(length)||length<28||length>1500)throw new Error('本演示 IP 数据报长度须为 28—1500 字节');
 const src=reverse?2:1,dst=reverse?1:2,bytes=Array.from({length},(_,i)=>i<28?0:(i-28)%256);
 const header=[0x45,0,length>>>8,length&255,0x12,0x34,0,0,64,1,0,0,192,168,1,src,192,168,1,dst];
 bytes.splice(0,20,...header);bytes[20]=reverse?0:8;bytes[24]=0x12;bytes[25]=0x34;bytes[27]=1;
 const icmp=internetChecksum(bytes.slice(20));bytes[22]=icmp>>>8;bytes[23]=icmp&255;
 const ip=internetChecksum(bytes.slice(0,20));bytes[10]=ip>>>8;bytes[11]=ip&255;
 return bytes;
}
export const hexByte=(b:number)=>b.toString(16).padStart(2,'0').toUpperCase();
export function ethernetSample(length:number,reverse=false){
 const lengths=ethernetLengths(length),source=reverse?MAC_B:MAC_A,destination=reverse?MAC_A:MAC_B;
 const header=[...destination.split(':'),...source.split(':')].map(s=>parseInt(s,16)).concat([8,0]);
 const payload=ipv4Sample(length,reverse),padding=Array(lengths.padding).fill(0),covered=[...header,...payload,...padding],fcs=crc32(covered);
 return {...lengths,source,destination,headerBytes:header,payloadBytes:payload,paddingBytes:padding,covered,fcs,fcsHex:fcs.toString(16).padStart(8,'0').toUpperCase()};
}
export type DivisionStep={offset:number;before:string;operand:string;after:string;active:boolean};
export function binaryDivision(dividend:string,generator:string){
 if(!/^[01]+$/.test(dividend)||!/^1[01]*1$/.test(generator)||generator.length<3||dividend.length<generator.length)throw new Error('无效的模 2 除法输入');
 const work=dividend.split('').map(Number),g=generator.split('').map(Number),steps:DivisionStep[]=[];
 for(let offset=0;offset<=dividend.length-generator.length;offset++){
  const before=work.join(''),active=work[offset]===1;
  const operand='0'.repeat(offset)+(active?generator:'0'.repeat(generator.length))+'0'.repeat(dividend.length-offset-generator.length);
  if(active)for(let j=0;j<g.length;j++)work[offset+j]^=g[j];
  steps.push({offset,before,operand,after:work.join(''),active});
 }
 return {remainder:work.slice(-(generator.length-1)).join(''),steps};
}
export function crcCodeword(data:string,generator:string){const padded=data+'0'.repeat(generator.length-1),division=binaryDivision(padded,generator);return {padded,...division,codeword:data+division.remainder};}
export function xorBits(a:string,b:string){if(a.length!==b.length||!/^[01]+$/.test(a+b))throw new Error('异或需要等长比特串');return [...a].map((bit,i)=>bit===b[i]?'0':'1').join('');}
export function polynomial(bits:string){return [...bits].flatMap((b,i)=>b==='0'?[]:[bits.length-1-i===0?'1':bits.length-1-i===1?'x':`x^${bits.length-1-i}`]).join(' + ')||'0';}
export function undetectedMask(length:number,generator:string){return generator+'0'.repeat(length-generator.length);}

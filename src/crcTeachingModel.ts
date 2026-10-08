import type {DivisionStep} from './linkModel';

export type CrcScene = {
 kind:'degree'|'append'|'received'|'align'|'xor'|'shift'|'remainder'|'codeword';
 round:number;
 completedRounds:number;
};

export function crcTeachingScenes(rounds:number,sender:boolean):CrcScene[]{
 const scenes:CrcScene[]=sender
  ?[{kind:'degree',round:0,completedRounds:0},{kind:'append',round:0,completedRounds:0}]
  :[{kind:'received',round:0,completedRounds:0}];
 for(let round=0;round<rounds;round++){
  scenes.push({kind:'align',round,completedRounds:round});
  scenes.push({kind:'xor',round,completedRounds:round});
  scenes.push({kind:'shift',round,completedRounds:round+1});
 }
 scenes.push({kind:'remainder',round:rounds-1,completedRounds:rounds});
 if(sender)scenes.push({kind:'codeword',round:rounds-1,completedRounds:rounds});
 return scenes;
}

export function crcWindow(step:DivisionStep,width:number){
 const end=step.offset+width,before=step.before.slice(step.offset,end),operand=step.operand.slice(step.offset,end),after=step.after.slice(step.offset,end);
 const nextBit=end<step.before.length?step.before[end]:null;
 return {before,operand,after,tail:after.slice(1),nextBit,next:after.slice(1)+(nextBit??''),nextPosition:nextBit===null?null:end+1};
}

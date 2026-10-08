import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,DELAY,INITIAL_BITS,decisions,received,wireVoltages,receivedCount,validateBits,reflectionCoefficient} from '../src/model.ts';
import {orders,pinMapping,testMapping,media,physicalTopics,ethernetSuite,switchingSuite,vlanSuite,stpSuite,channelSuite,ipv4Suite,totalLessonCount} from '../src/course.ts';
import {criticalAngle,refraction,reflectedRay,pathLength,pointAt} from '../src/advancedModel.ts';
import cableData from '../src/data/cables.json';
import {LINE_CODES,encodeLine,decodeLine,transitions,modulatedValue,pamSymbols,pamLevels,nearestPam,rates,validSequence} from '../src/encodingModel.ts';
import {quizBank} from '../src/quizBank.ts';
import {USERS,USER_CODES,frequencyBands,overlapWidth,tdmSlots,tdmMetrics,receivedSlots,selectWavelength,dot,cdmChannels,cdmSum,cdmDecision} from '../src/multiplexModel.ts';
import {linkTimes,completeBits,signalSegment,directionSchedule,serialization,captureWord,laneValue,PARALLEL_WORDS} from '../src/flowModel.ts';
import {ethernetLengths,ethernetSample,crc32,ipv4Sample,internetChecksum,binaryDivision,crcCodeword,xorBits,undetectedMask} from '../src/linkModel.ts';
import {crcTeachingScenes,crcWindow} from '../src/crcTeachingModel.ts';
import {SWITCH_HOSTS,SWITCH_MAC,BROADCAST_MAC,ageMacTable,seedMacTable,processLearningFrame,switchPorts,switchPort} from '../src/switchModel.ts';
import {SWITCH_STORY,STORY_TRANSACTIONS,STORY_MOTION_MS,STORY_READ_MS,STORY_START,storyState,advanceStory} from '../src/switchStoryModel.ts';
import {lessonStories,advanceLesson,lessonClockStart,LESSON_MOTION_MS,LESSON_READ_MS} from '../src/lessonStories.ts';
import {catalogLessons,searchCatalog,validCatalogSelection} from '../src/catalogModel.ts';
import {VLAN_DEFAULT,VLAN_HOSTS,hostVlan,vlanBroadcast,vlanStoryState} from '../src/vlanModel.ts';
import {STP_PRIORITIES,STP_SWITCHES,STP_LINKS,stpTree,stpPath,stpPriorities,stpRecovery,stpFloodRounds} from '../src/stpModel.ts';
import {channelAgreement,channelHash,channelModel,channelPreset,channelStoryConfig} from '../src/channelModel.ts';
import type {ChannelConfig} from '../src/channelModel.ts';
import {parseIPv4,formatIPv4,ipBits,prefixMask,subnetInfo,nextHop,ipPreset,split24} from '../src/ipModel.ts';
import {ipLessons,ipStories,ipQuestionSets} from '../src/ipLesson.ts';
import {OCTET_WEIGHTS,octetBits,andColumns,compareNetworks,addressRole} from '../src/ipTeachingModel.ts';

test('IPv4 parser is strict and round trips all byte positions without signed integer errors',()=>{
 for(const value of ['0.0.0.0','255.255.255.255','192.168.1.10','151.188.5.42','128.0.0.1'])assert.equal(formatIPv4(parseIPv4(value)!),value);
 for(const value of ['256.1.1.1','192.168.1','192.168.1.01','1e2.0.0.1','-1.0.0.1','1..0.1','1.2.3.4.5','abc',''])assert.equal(parseIPv4(value),null,value);
 assert.equal(parseIPv4('255.255.255.255'),4294967295);
});
test('every CIDR mask has exactly the requested contiguous leading one bits',()=>{
 for(let prefix=0;prefix<=32;prefix++)assert.equal(ipBits(prefixMask(prefix)),'1'.repeat(prefix)+'0'.repeat(32-prefix));
 for(const prefix of [-1,33,1.5])assert.throws(()=>prefixMask(prefix),RangeError);
 assert.equal(formatIPv4(prefixMask(25)),'255.255.255.128');
});
test('course examples match independently known /9 and /27 network boundaries',()=>{
 const example=subnetInfo('151.188.5.42',9)!;assert.equal(formatIPv4(example.network),'151.128.0.0');assert.equal(formatIPv4(example.hostPart),'0.60.5.42');
 const exercise=subnetInfo('192.168.10.108',27)!;assert.equal(formatIPv4(exercise.network),'192.168.10.96');assert.equal(formatIPv4(exercise.last),'192.168.10.127');assert.equal(exercise.usable,30);assert.equal(formatIPv4(exercise.firstHost),'192.168.10.97');
});
test('address membership stays within prefix boundaries and only ordinary subnets subtract two',()=>{
 for(let prefix=0;prefix<=32;prefix++)for(const ip of ['0.0.0.0','192.168.1.127','151.188.5.42','255.255.255.255']){
  const s=subnetInfo(ip,prefix)!;assert.ok(s.network<=s.value&&s.value<=s.last);assert.equal(s.last-s.network+1,2**(32-prefix));assert.equal(s.network%s.size,0);
  assert.equal(s.usable,s.size-(prefix<=30?2:0));
 }
 assert.equal(subnetInfo('192.168.1.127',25)!.value,subnetInfo('192.168.1.127',25)!.broadcast);
 assert.equal(subnetInfo('192.168.1.128',25)!.value,subnetInfo('192.168.1.128',25)!.network);
 assert.equal(subnetInfo('192.168.1.10',31)!.broadcast,null);assert.equal(subnetInfo('192.168.1.10',31)!.usable,2);
 assert.equal(subnetInfo('192.168.1.10',32)!.usable,1);
});
test('same source and destination change next hop when only the sending prefix changes',()=>{
 const same=nextHop(ipPreset('same')),split=nextHop(ipPreset('split'));
 assert.equal(same.status,'direct');assert.equal(same.hop,'192.168.1.200');
 assert.equal(split.status,'gateway');assert.equal(split.hop,'192.168.1.126');assert.equal(formatIPv4(split.destinationNetwork!),'192.168.1.128');
 assert.equal(ipPreset('same').destination,ipPreset('split').destination);
 assert.equal(nextHop(ipPreset('remote')).hop,'192.168.1.254');
});
test('gateway errors do not break on-link delivery and gateway validity is checked against the full mask',()=>{
 assert.equal(nextHop(ipPreset('missing')).status,'missing-gateway');assert.equal(nextHop(ipPreset('bad-gateway')).status,'invalid-gateway');
 assert.equal(nextHop({...ipPreset('same'),gateway:''}).status,'direct');
 assert.equal(nextHop({...ipPreset('same'),gateway:'broken'}).status,'direct');
 for(const gateway of ['192.168.1.0','192.168.1.127','192.168.1.10','192.168.2.1','300.1.1.1'])assert.equal(nextHop({...ipPreset('split'),gateway}).status,'invalid-gateway',gateway);
});
test('invalid, reserved and local destinations do not animate ordinary unicast to a fictitious next hop',()=>{
 for(const source of ['bad','192.168.1.0','192.168.1.255','127.0.0.1','224.0.0.1','169.254.1.1'])assert.equal(nextHop({...ipPreset('same'),source}).status,'invalid',source);
 for(const destination of ['192.168.1.0','192.168.1.255','255.255.255.255'])assert.equal(nextHop({...ipPreset('same'),destination}).status,'invalid',destination);
 assert.equal(nextHop({...ipPreset('same'),destination:'192.168.1.10'}).status,'self');
 assert.equal(nextHop({...ipPreset('same'),prefix:31}).status,'invalid');
});
test('splitting /24 covers every address once with contiguous and aligned child ranges',()=>{
 for(let prefix=24;prefix<=28;prefix++){
  const blocks=split24('192.168.1.99',prefix),parent=subnetInfo('192.168.1.0',24)!;
  assert.equal(blocks.length,2**(prefix-24));assert.equal(blocks[0].network,parent.network);assert.equal(blocks.at(-1)!.last,parent.last);
  assert.equal(blocks.reduce((sum,b)=>sum+b.size,0),256);
  blocks.forEach((b,i)=>{assert.equal(b.network%b.size,0);if(i)assert.equal(blocks[i-1].last+1,b.network);});
 }
 assert.deepEqual(split24('192.168.1.0',26).map(b=>b.network%256),[0,64,128,192]);
 assert.throws(()=>split24('192.168.1.0',23),RangeError);
});
test('IPv4 curriculum exposes seven independently addressable lessons with their own story and questions',()=>{
 assert.equal(ipLessons.length,7);assert.equal(catalogLessons.filter(l=>l.layer===2).length,7);
 for(const {id} of ipLessons){
  const key=`ipv4/${id}`;assert.equal(catalogLessons.find(l=>l.key===key)?.href,`#/network/${key}`);
  assert.ok(ipStories[key].scenes.length>=6);assert.equal(quizBank[key].length,4);assert.equal(ipQuestionSets[id].length,4);
 }
 assert.equal(Object.values(ipStories).reduce((n,s)=>n+s.scenes.length,0),44);
 assert.ok(!catalogLessons.some(l=>l.key==='ipv4/subnet'));
 assert.equal(searchCatalog('AND')[0]?.href,'#/network/ipv4/and');
 assert.ok(searchCatalog('默认网关').some(l=>l.href==='#/network/ipv4/gateway'));
});
test('each octet bit switch reconstructs the decimal value and toggles exactly its own weight',()=>{
 for(let value=0;value<256;value++){
  const bits=octetBits(value);assert.equal(bits.length,8);
  assert.equal(OCTET_WEIGHTS.reduce((sum,w,i)=>sum+Number(bits[i])*w,0),value);
  OCTET_WEIGHTS.forEach((w,i)=>{const changed=octetBits(value^w);assert.equal(changed.split('').filter((b,j)=>b!==bits[j]).length,1);assert.notEqual(changed[i],bits[i]);});
 }
});
test('progressive AND columns preserve input bits and reproduce both course examples',()=>{
 for(const [address,prefix,group,expected] of [['192.168.10.108',27,3,96],['151.188.5.42',9,1,128]] as const){
  const cols=andColumns(address,prefix,group);assert.equal(cols.length,8);
  assert.equal(cols.reduce((sum,c)=>sum+c.result*c.weight,0),expected);
  cols.forEach(c=>assert.equal(c.result,c.a&&c.mask?1:0));
 }
 assert.deepEqual(andColumns('192.168.10.108',27,3).map(c=>c.result),[0,1,1,0,0,0,0,0]);
 assert.deepEqual(andColumns('invalid',27,3),[]);
});
test('same-network lesson uses the same sending mask for both comparisons without requiring a gateway',()=>{
 assert.deepEqual(compareNetworks('192.168.1.10','192.168.1.200',24),{source:'192.168.1.0',destination:'192.168.1.0',same:true,mask:'255.255.255.0'});
 assert.equal(compareNetworks('192.168.1.10','192.168.1.200',25)?.same,false);
 assert.equal(compareNetworks('192.168.1.10','192.168.1.200',25)?.destination,'192.168.1.128');
 assert.equal(compareNetworks('invalid','192.168.1.200',25),null);
});
test('address roles change with the subnet boundary rather than with an octet suffix rule',()=>{
 assert.equal(addressRole('192.168.1.127',24)?.role,'可用主机地址');
 assert.equal(addressRole('192.168.1.127',25)?.role,'广播地址');
 assert.equal(addressRole('192.168.10.96',27)?.role,'网络地址');
 assert.equal(addressRole('192.168.10.126',27)?.role,'可用主机地址');
 assert.equal(addressRole('192.168.10.127',27)?.role,'广播地址');
 assert.equal(addressRole('192.168.10.128',27)?.role,'网络地址');
 assert.equal(addressRole('192.168.1.10',31)?.role,'点到点端点');
 assert.equal(addressRole('192.168.1.10',32)?.role,'单地址');
});

test('EtherChannel distinguishes static mode from all LACP mode combinations',()=>{
 for(const left of ['on','active','passive'] as const)for(const right of ['on','active','passive'] as const){
  const expected=(left==='on'&&right==='on')||(left!=='on'&&right!=='on'&&(left==='active'||right==='active'));
  assert.equal(channelAgreement(left,right).compatible,expected,`${left}/${right}`);
 }
});
test('aggregated capacity grows while one fixed flow remains limited to one physical member',()=>{
 const single=channelModel(channelPreset('single'));assert.equal(single.capacity,200);assert.equal(single.total,100);assert.deepEqual(single.flows.map(f=>f.member),[1]);
 const multi=channelModel(channelPreset('multi'));assert.equal(multi.capacity,200);assert.equal(multi.total,160);assert.deepEqual(multi.flows.map(f=>f.member),[1,2]);
 const separate=channelModel(channelPreset('separate'));assert.equal(separate.capacity,100);assert.equal(separate.total,100);assert.deepEqual(separate.flows.map(f=>f.member),[1,1]);
});
test('identical destination hash keys collide rather than creating perfect load balance',()=>{
 const collision=channelModel(channelPreset('collision'));assert.equal(collision.capacity,200);assert.equal(collision.total,100);
 assert.deepEqual(collision.lanes.map(l=>l.requested),[240,0]);assert.deepEqual(collision.flows.map(f=>f.member),[1,1,1]);
 assert.equal(channelHash('0200.0000.0010',[1,2]),channelHash('0200.0000.0010',[1,2]));
 assert.equal(channelHash('0200.0000.0010',[]),null);
});
test('member failure remaps only subsequent traffic and never invents capacity or a usable dead member',()=>{
 const before=channelModel(channelStoryConfig(5));assert.deepEqual(before.flows.map(f=>f.member),[null,2]);assert.equal(before.status,'reselecting');
 const after=channelModel(channelStoryConfig(6));assert.deepEqual(after.flows.map(f=>f.member),[2,2]);assert.equal(after.capacity,100);assert.equal(after.total,100);
 const down=channelModel({...channelPreset('multi'),up:[false,false]});assert.equal(down.status,'down');assert.equal(down.total,0);assert.ok(down.flows.every(f=>f.member===null));
 assert.deepEqual(channelModel(channelStoryConfig(5)),before,'rewinding must not retain the remapped path');
});
test('failed negotiation is not misreported as zero total network connectivity',()=>{
 const silent=channelModel(channelPreset('silent'));assert.equal(silent.status,'unformed');assert.equal(silent.capacity,null);assert.equal(silent.total,null);assert.deepEqual(silent.active,[]);
 const mismatch=channelModel({...channelPreset('multi'),right:'active'});assert.equal(mismatch.status,'unformed');assert.equal(mismatch.total,null);
 assert.equal(channelModel(channelPreset('lacp')).status,'formed');
});
test('all classroom allocations obey requested rates and per-member capacity bounds',()=>{
 for(const flowCount of [1,2,3] as const)for(const demand of [50,80,160])for(const rule of ['source','destination'] as const)for(let mask=0;mask<4;mask++){
  const config:ChannelConfig={...channelPreset('multi'),flowCount,demand,rule,up:[!!(mask&1),!!(mask&2)]};
  const state=channelModel(config);assert.ok(state.total!<=state.capacity!);assert.ok(state.total!<=flowCount*demand);
  assert.ok(Math.abs(state.flows.reduce((sum,f)=>sum+f.rate,0)-state.total!)<1e-8);
  for(const flow of state.flows){assert.ok(flow.rate>=0&&flow.rate<=demand);assert.ok(flow.member===null||config.up[flow.member-1]);}
  for(const lane of state.lanes)assert.ok(lane.rate<=100&&lane.rate<=lane.requested);
 }
});
test('EtherChannel story and searchable catalog cover the same nine teaching cases',()=>{
 assert.deepEqual(Array.from({length:9},(_,step)=>channelModel(channelStoryConfig(step)).status),['separate','formed','formed','formed','formed','reselecting','formed','formed','unformed']);
 assert.equal(searchCatalog('LACP 负载分担')[0]?.key,'etherchannel/bundle');
});

test('STP selects minimum bridge ID and blocks only the losing port on the redundant segment',()=>{
 const tree=stpTree();assert.equal(tree.root,'S1');assert.deepEqual(tree.costs,{S1:0,S2:19,S3:19});
 assert.deepEqual(tree.active,['12','13']);assert.deepEqual(stpPath(tree.active),['S2','S1','S3']);
 assert.deepEqual(tree.ports.filter(p=>p.role==='Altn'),[{switch:'S3',port:'Fa0/2',edge:'23',role:'Altn'}]);
 assert.equal(tree.ports.find(p=>p.switch==='S2'&&p.edge==='23')?.role,'Desg');
 assert.equal(stpTree({S1:4096,S2:4096,S3:4096}).root,'S1','equal priorities use MAC ordering');
 assert.equal(stpTree({S1:4096,S2:4096,S3:0}).root,'S3','priority precedes MAC ordering');
});
test('every root and single-link failure leaves a connected acyclic two-edge forwarding tree',()=>{
 for(const root of STP_SWITCHES)for(const down of [null,...STP_LINKS.map(l=>l.id)]){
  const tree=stpTree(stpPriorities(root),down);assert.equal(tree.root,root);assert.equal(tree.active.length,2);
  if(down)assert.ok(!tree.active.includes(down));
  for(const from of STP_SWITCHES)for(const to of STP_SWITCHES)assert.ok(stpPath(tree.active,from,to).length>0);
  for(const sw of STP_SWITCHES)assert.equal(tree.ports.filter(p=>p.switch===sw&&p.role==='Root').length,sw===root?0:1);
 }
});
test('recovering STP port cannot forward in blocking, listening, or learning; completed recovery uses new route',()=>{
 for(const phase of [0,1,2,3] as const){const s=stpRecovery(STP_PRIORITIES,'13',phase);assert.deepEqual(s.path,[]);assert.ok(!s.active.includes('23'));assert.equal(s.states.find(p=>p.switch==='S3'&&p.edge==='23')?.state,['BLK','BLK','LIS','LRN'][phase]);}
 const done=stpRecovery(STP_PRIORITIES,'13',4);assert.deepEqual(done.path,['S2','S3']);assert.equal(done.after.costs.S3,38);
 assert.equal(done.states.find(p=>p.switch==='S3'&&p.edge==='23')?.state,'FWD');
 assert.deepEqual(stpRecovery(STP_PRIORITIES,'13',0).path,[],'rewinding must remove newly enabled data path');
});
test('a failure on the redundant segment does not interrupt a surviving data path',()=>{
 for(const phase of [0,1,2,3,4] as const){const s=stpRecovery(stpPriorities('S2'),'13',phase);assert.deepEqual(s.opening,[]);assert.deepEqual(s.path,['S2','S3']);}
});
test('broadcast traversal dies out in the forwarding tree but persists around the unprotected triangle',()=>{
 const tree=stpFloodRounds(stpTree().active,9),loop=stpFloodRounds(['12','13','23'],9);
 assert.equal(tree[0].length,1);assert.equal(tree[1].length,1);assert.ok(tree.slice(2).every(round=>round.length===0));
 assert.ok(loop.every(round=>round.length===2));assert.ok(loop.flat().filter(h=>h.to==='S3').length>1);
 assert.equal(searchCatalog('STP 根桥')[0]?.key,'stp/tree');
});

test('VLAN division changes the broadcast domain without changing physical single-switch connectivity',()=>{
 assert.deepEqual(vlanBroadcast('A',{...VLAN_DEFAULT,dual:false,divided:false}).recipients,['B','C','D']);
 assert.deepEqual(vlanBroadcast('A',{...VLAN_DEFAULT,dual:false}).recipients,['B']);
 assert.deepEqual(vlanBroadcast('C',{...VLAN_DEFAULT,dual:false}).recipients,['D']);
 assert.deepEqual(vlanBroadcast('A',VLAN_DEFAULT).recipients,['B']);
 assert.deepEqual(vlanBroadcast('C',VLAN_DEFAULT).recipients,['D']);
});
test('both trunk allowed lists and the physical link can independently stop a VLAN',()=>{
 const first=vlanBroadcast('C',{...VLAN_DEFAULT,allowS1:[1,10]});assert.equal(first.stop,'s1-filter');assert.equal(first.leavesS1,false);assert.equal(first.tag,null);assert.deepEqual(first.recipients,[]);
 const second=vlanBroadcast('C',{...VLAN_DEFAULT,allowS2:[1,10]});assert.equal(second.stop,'s2-filter');assert.equal(second.leavesS1,true);assert.equal(second.tag,20);assert.deepEqual(second.recipients,[]);
 assert.deepEqual(vlanBroadcast('A',{...VLAN_DEFAULT,allowS1:[1,10],allowS2:[1,10]}).recipients,['B']);
 assert.equal(vlanBroadcast('A',{...VLAN_DEFAULT,linkUp:false}).stop,'link-down');
 assert.equal(vlanBroadcast('A',{...VLAN_DEFAULT,divided:false}).tag,null);
});
test('access-port reassignment changes membership and never turns a trunk into a router',()=>{
 const reassigned={...VLAN_DEFAULT,bVlan:20 as const};
 assert.deepEqual(vlanBroadcast('A',reassigned).recipients,[]);
 assert.deepEqual(vlanBroadcast('C',reassigned).recipients,['B','D']);
 for(let flags=0;flags<16;flags++)for(const bVlan of [10,20] as const)for(const source of ['A','C'] as const){
  const config={...VLAN_DEFAULT,bVlan,allowS1:([1,...(flags&1?[10]:[]),...(flags&2?[20]:[])] as (1|10|20)[]),allowS2:([1,...(flags&4?[10]:[]),...(flags&8?[20]:[])] as (1|10|20)[])};
  const result=vlanBroadcast(source,config);
  assert.ok(!result.recipients.includes(source));assert.equal(new Set(result.recipients).size,result.recipients.length);
  for(const h of VLAN_HOSTS)assert.equal(result.recipients.includes(h),h!==source&&hostVlan(h,config)===result.vlan&&config.allowS1.includes(result.vlan)&&config.allowS2.includes(result.vlan));
 }
});
test('the eight VLAN story scenes use the same forwarding rules as the interactive lab',()=>{
 const recipients=[['B','C','D'],['B'],['B'],[],['B'],['D'],[],['B']];
 for(let step=0;step<recipients.length;step++){const {source,config}=vlanStoryState(step);assert.deepEqual(vlanBroadcast(source,config).recipients,recipients[step]);}
 assert.equal(searchCatalog('802.1Q Trunk')[0]?.key,'vlan/isolation');
});

test('directory reaches every published lesson once and preserves layer routes',()=>{
 assert.deepEqual(catalogLessons.map(item=>item.key).sort(),Object.keys(quizBank).sort());
 assert.equal(new Set(catalogLessons.map(item=>item.href)).size,totalLessonCount);
 assert.deepEqual([0,1,2,3,4].map(layer=>catalogLessons.filter(item=>item.layer===layer).length),[30,6,7,0,0]);
 for(const item of catalogLessons)assert.equal(item.href,`#/${['physical','datalink','network','transport','application'][item.layer]}/${item.key}`);
});

test('directory search accepts classroom terms, aliases, case and combined terms',()=>{
 assert.deepEqual(searchCatalog('  cRc  ').map(item=>item.key),['ethernet/crc']);
 assert.deepEqual(searchCatalog('星链 飞机').map(item=>item.key),['radio/aviation']);
 assert.ok(searchCatalog('海缆').some(item=>item.key==='fiber/global-map'));
 assert.ok(searchCatalog('t568b').some(item=>item.key==='twisted/wiring'));
 assert.deepEqual(searchCatalog('不存在的课堂演示'),[]);assert.deepEqual(searchCatalog('  '),[]);
});

test('directory restores valid choices and recovers malformed or outdated saved choices',()=>{
 assert.deepEqual(validCatalogSelection({layer:0,topic:'fiber'}),{layer:0,topic:'fiber'});
 assert.deepEqual(validCatalogSelection({layer:1,topic:'twisted'}),{layer:1,topic:'ethernet'});
 assert.deepEqual(validCatalogSelection({layer:4,topic:'fiber'}),{layer:4,topic:''});
 for(const value of [null,undefined,42,'broken',{layer:99},{layer:-1},{layer:0.5},{layer:'1'}])assert.deepEqual(validCatalogSelection(value),{layer:0,topic:'twisted'});
});

test('every published non-switch lesson has its own complete beginner story and question',()=>{
 const expected=Object.keys(quizBank).filter(key=>key!=='switching/learning');
 assert.deepEqual(Object.keys(lessonStories).sort(),expected.sort());
 for(const [key,story] of Object.entries(lessonStories)){
  assert.ok(story.scenes.length>=5,key);assert.equal(new Set(story.scenes.map(s=>s.title)).size,story.scenes.length,key);
  assert.ok(story.terms.length>0&&story.boundary.length>20,key);
  const question=story.question;assert.ok(question.choices.length>=2);assert.ok(question.correct>=0&&question.correct<question.choices.length);assert.ok(question.why.length>10);
  for(const scene of story.scenes)assert.ok(scene.title&&scene.body.length>=20&&scene.cue,key);
 }
});
test('beginner playback waits for reading, supports pause, and stops at the final question',()=>{
 const start={...lessonClockStart,elapsed:0,running:true,auto:true};
 assert.equal(advanceLesson(start,LESSON_MOTION_MS,5).scene,0);
 assert.equal(advanceLesson(start,LESSON_READ_MS-1,5).scene,0);
 assert.deepEqual(advanceLesson(start,LESSON_READ_MS,5),{scene:1,elapsed:0,running:true,auto:true});
 const final={...start,scene:4};assert.deepEqual(advanceLesson(final,LESSON_READ_MS,5),{scene:4,elapsed:LESSON_READ_MS,running:false,auto:false});
 const paused={...start,running:false,elapsed:600};assert.deepEqual(advanceLesson(paused,99999,5),paused);
 assert.equal(advanceLesson(start,-10,5).elapsed,0);
});
test('manual beginner scenes freeze after motion and do not advance without a click',()=>{
 for(const story of Object.values(lessonStories)){
  const state={scene:2,elapsed:0,running:true,auto:false};
  const stopped=advanceLesson(state,LESSON_MOTION_MS,story.scenes.length);
  assert.deepEqual(stopped,{...state,elapsed:LESSON_MOTION_MS,running:false});
  assert.deepEqual(advanceLesson(stopped,100000,story.scenes.length),stopped);
 }
});
test('beginner CRC uses the same polynomial calculation and preserves the leading remainder zeros',()=>{
 const example=crcCodeword('1101','1011');assert.equal(example.padded,'1101000');assert.equal(example.remainder,'001');assert.equal(example.codeword,'1101001');
 assert.deepEqual(example.steps.map(s=>[s.before.slice(s.offset,s.offset+4),s.after.slice(s.offset,s.offset+4)]),[['1101','0110'],['1100','0111'],['1110','0101'],['1010','0001']]);
 assert.equal(binaryDivision(example.codeword,'1011').remainder,'000');assert.equal(binaryDivision(example.padded,'1011').remainder,'001');
});

test('every published lesson has at least three valid, distinct questions with explanations',()=>{
 const suites={...media,...Object.fromEntries(physicalTopics.map(t=>[t.id,t.info])),ethernet:ethernetSuite,switching:switchingSuite,vlan:vlanSuite,stp:stpSuite,etherchannel:channelSuite,ipv4:ipv4Suite};
 const keys=Object.entries(suites).flatMap(([section,suite])=>suite.lessons.map(l=>`${section}/${l.id}`));
 assert.deepEqual(Object.keys(quizBank).sort(),keys.sort());
 assert.equal(keys.length,totalLessonCount);
 for(const key of keys){const questions=quizBank[key];assert.ok(questions.length>=3,key);assert.equal(new Set(questions.map(q=>q.q)).size,questions.length,key);
  for(const q of questions){assert.ok(q.q.length>5&&q.why.length>10);assert.ok(q.answers.length>=2);assert.equal(new Set(q.answers).size,q.answers.length);assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.answers.length);}
 }
});

test('an unknown unicast learns only the source and retains its destination while flooding',()=>{
 const table=Object.freeze([]),frame={source:'A',destination:'B'} as const;
 const result=processLearningFrame(table,frame,'direct',1);
 assert.equal(result.decision,'unknown');assert.deepEqual(result.egress,[2,5]);assert.equal(result.targetMac,SWITCH_MAC.B);
 assert.deepEqual(result.learned,[{mac:SWITCH_MAC.A,port:1,vlan:1,lastSeen:1}]);
 assert.deepEqual(result.accepted,['B']);assert.deepEqual(result.discarded,['C']);assert.deepEqual(result.before,[]);
 assert.deepEqual(processLearningFrame(table,frame,'direct',1),result,'replay and rewind must not accumulate entries');
});
test('a reply teaches B and unicasts to A; only the new source refreshes its timer',()=>{
 const first=processLearningFrame([],{source:'A',destination:'B'},'direct',1);
 const saved=structuredClone(first.learned);
 const reply=processLearningFrame(first.learned,{source:'B',destination:'A'},'direct',2);
 assert.equal(reply.decision,'known');assert.deepEqual(reply.egress,[1]);assert.deepEqual(reply.accepted,['A']);assert.deepEqual(reply.discarded,[]);
 assert.deepEqual(first.learned,saved);assert.equal(reply.learned.length,2);
 const third=processLearningFrame(reply.learned,{source:'A',destination:'B'},'direct',80);
 assert.deepEqual(third.egress,[2]);assert.equal(third.learning,'refresh');
 assert.equal(third.learned.find(e=>e.mac===SWITCH_MAC.A)!.lastSeen,80);
 assert.equal(third.learned.find(e=>e.mac===SWITCH_MAC.B)!.lastSeen,2);
});
test('broadcast floods even with a complete table and is never learned as a source',()=>{
 const result=processLearningFrame(seedMacTable(['A','B','C'],'direct'),{source:'A',destination:'broadcast'},'direct',1);
 assert.equal(result.decision,'broadcast');assert.equal(result.targetMac,BROADCAST_MAC);assert.deepEqual(result.egress,[2,5]);
 assert.deepEqual(result.accepted,['B','C']);assert.deepEqual(result.discarded,[]);assert.equal(result.learned.length,3);
 assert.ok(result.learned.every(e=>e.mac!==BROADCAST_MAC));
});
test('same-port filtering preserves local Hub delivery and one port may reach several MACs',()=>{
 const result=processLearningFrame(seedMacTable(['B'],'shared'),{source:'A',destination:'B'},'shared',1);
 assert.equal(result.decision,'filter');assert.deepEqual(result.egress,[]);assert.deepEqual(result.local,['B']);assert.deepEqual(result.accepted,['B']);
 assert.deepEqual(result.learned.map(e=>e.port),[1,1]);
 const incoming=processLearningFrame(result.learned,{source:'C',destination:'A'},'shared',2);
 assert.deepEqual(incoming.egress,[1]);assert.deepEqual(incoming.viaSwitch,['A','B']);assert.deepEqual(incoming.accepted,['A']);assert.deepEqual(incoming.discarded,['B']);
});
test('aging removes an inactive destination at the threshold and the current source relearns',()=>{
 const table=seedMacTable(['A','B'],'direct',1),saved=structuredClone(table);
 assert.equal(ageMacTable(table,300).length,2);assert.equal(ageMacTable(table,301).length,0);assert.deepEqual(table,saved);
 const result=processLearningFrame(table,{source:'A',destination:'B'},'direct',302);
 assert.equal(result.expired.length,2);assert.deepEqual(result.before,[]);assert.equal(result.learned.length,1);
 assert.equal(result.learning,'new');assert.equal(result.decision,'unknown');assert.deepEqual(result.egress,[2,5]);
});
test('source movement updates one VLAN entry while another VLAN cannot resolve the destination',()=>{
 const table=[{mac:SWITCH_MAC.A,port:5,vlan:1,lastSeen:0},{mac:SWITCH_MAC.A,port:5,vlan:2,lastSeen:0},{mac:SWITCH_MAC.B,port:2,vlan:2,lastSeen:0}];
 const result=processLearningFrame(table,{source:'A',destination:'B'},'direct',1);
 assert.equal(result.learning,'move');assert.equal(result.learned.length,3);assert.equal(result.learned.find(e=>e.mac===SWITCH_MAC.A&&e.vlan===1)!.port,1);
 assert.equal(result.learned.find(e=>e.mac===SWITCH_MAC.A&&e.vlan===2)!.port,5);assert.equal(result.decision,'unknown');assert.equal(result.target,undefined);
});
test('all valid classroom frames exclude ingress and disconnected ports from forwarding',()=>{
 for(const topology of ['direct','shared'] as const)for(const source of SWITCH_HOSTS)for(const destination of [...SWITCH_HOSTS,'broadcast'] as const){
  if(source===destination)continue;
  for(const table of [[],seedMacTable([...SWITCH_HOSTS],topology)]){
   const result=processLearningFrame(table,{source,destination},topology,1);
   assert.ok(result.egress.every(port=>port!==switchPort(source,topology)&&switchPorts(topology).includes(port)));
   assert.equal(new Set(result.reached).size,result.reached.length);assert.ok(!result.reached.includes(source));
   if(destination!=='broadcast')assert.deepEqual(result.accepted,[destination]);
   else assert.deepEqual(result.accepted,SWITCH_HOSTS.filter(host=>host!==source));
  }
 }
 assert.throws(()=>processLearningFrame([],{source:'A',destination:'A'},'direct',1));
});

test('beginner story never learns the recipient merely because its frame was delivered',()=>{
 assert.deepEqual(storyState(0).known,[]);assert.deepEqual(storyState(1).known,[]);
 assert.deepEqual(storyState(2,0).known,[]);assert.deepEqual(storyState(2,.8).known,['A']);
 for(const index of [3,4,5,6])assert.deepEqual(storyState(index).known,['A']);
 assert.deepEqual(storyState(7,0).known,['A']);assert.deepEqual(storyState(7,1).known,['A','B']);
 assert.deepEqual(storyState(10).known,['A','B']);assert.deepEqual(storyState(2,0).known,[],'rewind must restore the story state');
 assert.ok(SWITCH_STORY.every((_,index)=>!storyState(index).known.includes('C')));
});
test('all three story deliveries use real switch decisions and carry unchanged destinations',()=>{
 assert.deepEqual(STORY_TRANSACTIONS.map(r=>r.egress),[[2,5],[1],[2]]);
 assert.deepEqual(STORY_TRANSACTIONS.map(r=>r.targetMac),[SWITCH_MAC.B,SWITCH_MAC.A,SWITCH_MAC.B]);
 assert.deepEqual(STORY_TRANSACTIONS[0].discarded,['C']);assert.deepEqual(STORY_TRANSACTIONS[1].discarded,[]);
 assert.equal(STORY_TRANSACTIONS[2].learned.find(e=>e.mac===SWITCH_MAC.B)!.lastSeen,2);
});
test('story playback holds each manual scene and stops automatically at thought questions',()=>{
 assert.equal(advanceStory(STORY_START,500),STORY_START);
 const manual={index:1,elapsed:0,running:true,auto:false};
 assert.equal(advanceStory(manual,STORY_MOTION_MS-1).running,true);
 assert.deepEqual(advanceStory(manual,STORY_MOTION_MS),{...manual,elapsed:STORY_MOTION_MS,running:false});
 const auto={...manual,auto:true};
 assert.equal(advanceStory(auto,STORY_MOTION_MS+1000).index,1,'leave time to read after motion finishes');
 assert.deepEqual(advanceStory(auto,STORY_READ_MS),{...auto,index:2,elapsed:0});
 for(const index of [5,10])assert.deepEqual(advanceStory({...auto,index},STORY_READ_MS),{index,elapsed:STORY_READ_MS,running:false,auto:false});
});

test('untagged Ethernet length boundaries include FCS and exclude preamble/SFD',()=>{
 assert.deepEqual(ethernetLengths(28),{payload:28,padding:18,body:46,header:14,fcs:4,frame:64,onWire:72});
 for(const size of [0,1,28,45,46])assert.equal(ethernetLengths(size).frame,64);
 assert.equal(ethernetLengths(47).frame,65);assert.equal(ethernetLengths(1500).frame,1518);
 assert.throws(()=>ethernetLengths(1501));assert.throws(()=>ethernetLengths(-1));assert.throws(()=>ethernetLengths(28.5));
});
test('Ethernet CRC-32 uses the standard check vector and includes padding',()=>{
 assert.equal(crc32(new TextEncoder().encode('123456789')),0xcbf43926);assert.equal(crc32([]),0);
 const frame=ethernetSample(28),back=ethernetSample(28,true);
 assert.deepEqual(frame.headerBytes,[2,0,0,0,0,11,2,0,0,0,0,10,8,0]);assert.equal(frame.covered.length,60);
 assert.notEqual(frame.fcs,crc32(frame.covered.slice(0,42)));assert.notEqual(frame.fcs,back.fcs);
 assert.equal(frame.source,back.destination);assert.equal(frame.destination,back.source);
 assert.equal(ethernetSample(1500).covered.length,1514);
});
test('frame samples contain internally valid IPv4 and ICMP lengths and checksums',()=>{
 for(const size of [28,46,100,1500])for(const reverse of [false,true]){
  const bytes=ipv4Sample(size,reverse);assert.equal(bytes.length,size);assert.equal((bytes[2]<<8)+bytes[3],size);
  assert.equal(bytes[9],1);assert.equal(bytes[20],reverse?0:8);
  assert.equal(internetChecksum(bytes.slice(0,20)),0);assert.equal(internetChecksum(bytes.slice(20)),0);
 }
});
test('polynomial division matches independent published and classroom examples',()=>{
 const lecture=crcCodeword('11010111','1101');assert.equal(lecture.remainder,'001');assert.equal(lecture.codeword,'11010111001');
 const classroom=crcCodeword('1101011011','10011');assert.equal(classroom.remainder,'1110');assert.equal(classroom.codeword,'11010110111110');
 assert.equal(binaryDivision(classroom.codeword,'10011').remainder,'0000');
 assert.equal(crcCodeword('00000000','10011').remainder,'0000');
 assert.throws(()=>binaryDivision('10x01','1011'));assert.throws(()=>binaryDivision('101010','0011'));
});
test('every 8-bit data word round-trips and every single-bit error is detected for each offered generator',()=>{
 for(const g of ['1011','1101','10011'])for(let n=0;n<256;n++){
  const data=n.toString(2).padStart(8,'0'),encoded=crcCodeword(data,g);
  assert.equal(encoded.codeword.slice(0,8),data);assert.equal(encoded.remainder.length,g.length-1);
  assert.equal(binaryDivision(encoded.codeword,g).remainder,'0'.repeat(g.length-1));
  for(let i=0;i<encoded.codeword.length;i++){
   const error='0'.repeat(i)+'1'+'0'.repeat(encoded.codeword.length-i-1);
   assert.ok(binaryDivision(xorBits(encoded.codeword,error),g).remainder.includes('1'));
  }
 }
});
test('division traces preserve leading zeros and a generator-multiple error demonstrates undetected corruption',()=>{
 for(const g of ['1011','1101','10011']){
  const encoded=crcCodeword('1101011011',g),mask=undetectedMask(encoded.codeword.length,g),received=xorBits(encoded.codeword,mask);
  assert.notEqual(received,encoded.codeword);assert.notEqual(received.slice(0,10),encoded.codeword.slice(0,10));
  assert.equal(binaryDivision(received,g).remainder,'0'.repeat(g.length-1));
  let current=encoded.padded;
  for(const s of encoded.steps){assert.equal(s.before,current);assert.equal(xorBits(s.before,s.operand),s.after);assert.equal(s.after.slice(0,s.offset+1),'0'.repeat(s.offset+1));current=s.after;}
  assert.equal(current.slice(-(g.length-1)),encoded.remainder);
 }
});

test('CRC teaching windows explain the first XOR, zero-leading rounds, and the last remainder without inventing bits',()=>{
 const encoded=crcCodeword('1101011011','10011');
 assert.deepEqual(crcWindow(encoded.steps[0],5),{before:'11010',operand:'10011',after:'01001',tail:'1001',nextBit:'1',next:'10011',nextPosition:6});
 assert.deepEqual(crcWindow(encoded.steps[1],5),{before:'10011',operand:'10011',after:'00000',tail:'0000',nextBit:'1',next:'00001',nextPosition:7});
 assert.deepEqual(crcWindow(encoded.steps[2],5),{before:'00001',operand:'00000',after:'00001',tail:'0001',nextBit:'0',next:'00010',nextPosition:8});
 assert.deepEqual(crcWindow(encoded.steps[9],5),{before:'01110',operand:'00000',after:'01110',tail:'1110',nextBit:null,next:'1110',nextPosition:null});
 assert.equal(crcCodeword('1101','1011').codeword,'1101001');
 for(const g of ['10011','1011','1101'])for(let length=4;length<=12;length++)for(const data of ['0'.repeat(length),'1'.repeat(length),'101100101100'.slice(0,length)]){
  const code=crcCodeword(data,g);
  for(const division of [code,binaryDivision(code.codeword,g)])for(let i=0;i<division.steps.length;i++){
   const w=crcWindow(division.steps[i],g.length);
   assert.equal(w.after[0],'0');assert.equal(xorBits(w.before,w.operand),w.after);
   if(i+1<division.steps.length)assert.equal(w.next,crcWindow(division.steps[i+1],g.length).before);
   else{assert.equal(w.nextBit,null);assert.equal(w.tail,division.remainder);}
  }
 }
});

test('CRC teaching progresses through preparation, align/XOR/bring-down, remainder and codeword, with rewind-safe history',()=>{
 for(let rounds=4;rounds<=12;rounds++)for(const sender of [true,false]){
  const scenes=crcTeachingScenes(rounds,sender),roundScenes=scenes.filter(s=>['align','xor','shift'].includes(s.kind));
  assert.deepEqual(scenes.slice(0,sender?2:1).map(s=>s.kind),sender?['degree','append']:['received']);
  assert.equal(roundScenes.length,rounds*3);
  for(let i=0;i<rounds;i++){
   const group=roundScenes.slice(i*3,i*3+3);
   assert.deepEqual(group.map(s=>s.kind),['align','xor','shift']);
   assert.deepEqual(group.map(s=>s.round),[i,i,i]);
   assert.deepEqual(group.map(s=>s.completedRounds),[i,i,i+1]);
  }
  assert.equal(scenes.at(-1)!.kind,sender?'codeword':'remainder');
  assert.equal(scenes.at(-1)!.completedRounds,rounds);
  assert.ok(sender||!scenes.some(s=>s.kind==='append'||s.kind==='codeword'));
 }
});

test('link delay units and independent parameters give correct first and last arrival times',()=>{
 assert.deepEqual(linkTimes(12000,1e6,1200,200000),{sendMs:12,propMs:6,totalMs:18});
 assert.deepEqual(linkTimes(12000,2e6,1200,200000),{sendMs:6,propMs:6,totalMs:12});
 assert.deepEqual(linkTimes(8,2000,600,200000),{sendMs:4,propMs:3,totalMs:7});
 const fast=linkTimes(6000,4e6,2400,200000);assert.ok(fast.sendMs<fast.propMs);assert.equal(fast.totalMs,13.5);
});
test('receiver reveals only complete bits, with deterministic backward seeking',()=>{
 assert.equal(completeBits(6,12000,1e6,6),0);
 assert.equal(completeBits(6.0009,12000,1e6,6),0);
 assert.equal(completeBits(6.001,12000,1e6,6),1);
 assert.equal(completeBits(17.999,12000,1e6,6),11999);
 assert.equal(completeBits(18,12000,1e6,6),12000);
 assert.equal(completeBits(200,12000,1e6,6),12000);
 assert.equal(completeBits(0,12000,1e6,6),0);
});
test('signal segments preserve front/tail propagation and leave the link at completion',()=>{
 assert.equal(signalSegment(0,0,12,12,6),null);
 assert.deepEqual(signalSegment(3,0,12,12,6),{left:1/3,right:.5});
 assert.equal(signalSegment(7,0,12,12,6),null);
 for(const [send,prop] of [[12,6],[1.5,12],[12,3]])for(let i=0;i<12;i++){
  assert.equal(signalSegment(send+prop,i,12,send,prop),null);
  for(let t=0;t<send+prop;t+=.125){const segment=signalSegment(t,i,12,send,prop);if(segment){assert.ok(segment.left>=0&&segment.right<=1);assert.ok(segment.left<segment.right);}}
 }
});
test('direction schedules enforce simplex, half-duplex exclusion and full-duplex overlap',()=>{
 assert.equal(directionSchedule('simplex',true).b,null);
 const half=directionSchedule('half',true),full=directionSchedule('full',true);
 assert.ok(half.b!.start>=half.a.end);assert.equal(half.b!.end-half.b!.start,4);
 assert.deepEqual(full.a,full.b);
 for(const mode of ['simplex','half','full'] as const)assert.equal(directionSchedule(mode,false).b,null);
});
test('serial/parallel comparison depends on lane rate, counts and complete groups',()=>{
 assert.equal(serialization(12,1,1).durationUs,12);assert.equal(serialization(12,4,1).durationUs,3);
 assert.equal(serialization(12,1,4).durationUs,serialization(12,4,1).durationUs);
 assert.ok(serialization(12,1,8).durationUs<serialization(12,4,1).durationUs);
 assert.equal(serialization(13,4,1).durationUs,4);
});
test('parallel skew can mix old and new data; aligned or sufficiently late samples recover words',()=>{
 const delays=[0,.2,.4,.6];
 assert.equal(captureWord(1,.5,delays),'0100');
 assert.equal(captureWord(0,.25,[0,.8/3,1.6/3,.8]),'1000');
 for(let i=0;i<3;i++){
  assert.equal(captureWord(i,.9,delays),PARALLEL_WORDS[i]);
  assert.equal(captureWord(i,.25,[0,0,0,0]),PARALLEL_WORDS[i]);
 }
 assert.equal(laneValue(0,3,.6),'0');assert.equal(laneValue(1.599,3,.6),'0');assert.equal(laneValue(1.601,3,.6),'1');
});
test('FDM frequency intervals preserve width and expose overlap without fabricated error rates',()=>{
 const bands=frequencyBands(8);assert.equal(bands[2].high-bands[0].low,64);
 for(let gap=-8;gap<=16;gap+=2){const b=frequencyBands(gap);for(const c of b)assert.equal(c.high-c.low,16);assert.equal(overlapWidth(b[0],b[1]),Math.max(0,-gap));}
});
test('TDM and statistical multiplexing preserve payload order, account for idle time and headers',()=>{
 for(const active of [true,false])for(const statistical of [true,false]){
  const slots=tdmSlots(active,statistical),m=tdmMetrics(slots,statistical);
  assert.equal(m.payloads,active?12:8);assert.equal(m.duration,m.payloads+m.idle+m.overhead);
  for(const u of USERS){assert.deepEqual(receivedSlots(slots,0,u),[]);assert.deepEqual(receivedSlots(slots,slots.length,u),u==='B'&&!active?[]:[`${u}1`,`${u}2`,`${u}3`,`${u}4`]);}
 }
 assert.equal(tdmMetrics(tdmSlots(false,false),false).duration,12);
 assert.equal(tdmMetrics(tdmSlots(false,true),true).duration,10);
 assert.equal(tdmMetrics(tdmSlots(true,true),true).duration,15);
 assert.deepEqual(receivedSlots(tdmSlots(false,false),.99,'A'),[]);
 assert.deepEqual(receivedSlots(tdmSlots(false,false),1,'A'),['A1']);
});
test('WDM distinguishes wrong wavelength, an idle laser and a shared-fiber failure',()=>{
 assert.equal(selectWavelength(1550,true,false),'B');assert.equal(selectWavelength(1530,true,false),'A');assert.equal(selectWavelength(1590,true,false),null);
 assert.equal(selectWavelength(1550,false,false),null);assert.equal(selectWavelength(1530,false,false),'A');assert.equal(selectWavelength(1570,false,false),'C');
 for(const lambda of [1530,1550,1570])assert.equal(selectWavelength(lambda,true,true),null);
});
test('synchronous CDM recovers all users for all data combinations and exposes code collision',()=>{
 for(const a of USERS)for(const b of USERS)assert.equal(dot(USER_CODES[a],USER_CODES[b]),a===b?4:0);
 for(let n=0;n<8;n++){
  const bits={A:(n>>2)&1,B:(n>>1)&1,C:n&1},sum=cdmSum(cdmChannels(bits));
  for(const u of USERS)assert.equal(cdmDecision(dot(sum,USER_CODES[u])/4),String(bits[u]));
 }
 const channels=cdmChannels({A:1,B:0,C:1},true),sum=cdmSum(channels);
 assert.equal(dot(sum,USER_CODES.A),0);assert.equal(cdmDecision(0),'?');
 assert.equal(cdmDecision(dot(sum,USER_CODES.C)/4),'1');
 assert.deepEqual(cdmChannels({A:0,B:0,C:0})[0].chips,USER_CODES.A.map(v=>-v));
});

test('all 8-bit sequences round-trip under both Manchester conventions and differential references',()=>{
 for(let n=0;n<256;n++){
  const bits=n.toString(2).padStart(8,'0');
  for(const code of LINE_CODES)for(const rule of ['rising-one','falling-one'] as const)for(const initial of [-1,1] as const){
   const levels=encodeLine(bits,code,rule,initial);
   assert.equal(decodeLine(levels,code,rule,initial),bits);
   const reversed=levels.map(v=>-v);
   assert.equal(decodeLine(reversed,code,rule,-initial),code==='differential'?bits:bits.replace(/[01]/g,b=>b==='0'?'1':'0'));
  }
 }
});
test('line codes implement stated boundary and midpoint rules, not just round-trip symmetry',()=>{
 assert.deepEqual(encodeLine('10','nrz'),[1,1,-1,-1]);
 assert.deepEqual(encodeLine('10','manchester'),[-1,1,1,-1]);
 assert.deepEqual(encodeLine('10','manchester','falling-one'),[1,-1,-1,1]);
 assert.deepEqual(encodeLine('0011','differential'),[-1,1,-1,1,1,-1,-1,1]);
 for(const bit of ['0','1']){
  assert.equal(transitions(encodeLine(bit.repeat(8),'nrz')),0);
  for(const code of ['manchester','differential'] as const){const levels=encodeLine(bit.repeat(8),code);for(let i=0;i<16;i+=2)assert.equal(levels[i],-levels[i+1]);}
 }
 assert.equal(decodeLine([1,1],'manchester'),'?');
 assert.equal(decodeLine([1],'differential'),'?');
});
test('OOK suppresses zero bits; BFSK changes frequency; BPSK changes only phase',()=>{
 for(let i=0;i<20;i++){
  const t=i/20;
  assert.equal(modulatedValue('0',t,'ask'),0);
  assert.ok(Math.abs(modulatedValue('1',t,'ask')-Math.cos(6*Math.PI*t))<1e-12);
  assert.ok(Math.abs(modulatedValue('0',t,'psk')+modulatedValue('1',t,'psk'))<1e-12);
  assert.ok(Math.abs(modulatedValue('0',t,'fsk')-Math.cos(4*Math.PI*t))<1e-12);
  assert.ok(Math.abs(modulatedValue('1',t,'fsk')-Math.cos(10*Math.PI*t))<1e-12);
 }
 for(const bits of ['01','10'])assert.ok(Math.abs(modulatedValue(bits,1-1e-8,'fsk')-modulatedValue(bits,1+1e-8,'fsk'))<1e-10);
});
test('PAM grouping, symbol rate, duration and decision margins agree',()=>{
 const bits='001011011100';
 for(const order of [2,4,8]){
  const r=rates(order,1000,12),symbols=pamSymbols(bits,order);
  assert.equal(symbols.length,12/Math.log2(order));
  assert.equal(symbols.map(s=>s.bits).join(''),bits);
  assert.equal(r.bitRate,1000*Math.log2(order));
  assert.equal(r.durationMs,symbols.length);
  for(const s of symbols)assert.equal(nearestPam(s.level,order),s.index);
  assert.deepEqual([pamLevels(order)[0],pamLevels(order).at(-1)],[-1,1]);
 }
 assert.deepEqual(pamSymbols('00011011',4).map(s=>s.index),[0,1,2,3]);
 assert.ok(pamSymbols(bits,4).every(s=>nearestPam(s.level+.2,4)===s.index));
 assert.ok(pamSymbols(bits,8).some(s=>nearestPam(s.level+.2,8)!==s.index));
 assert.equal(rates(4,2000,12).durationMs,3);
 assert.throws(()=>pamSymbols('101',4));
});
test('encoding inputs reject nonbinary data and incomplete classroom sequences',()=>{
 assert.equal(validSequence('1010'),true);assert.equal(validSequence('101'),false);
 assert.equal(validSequence('10a011'),false);assert.equal(validSequence('1'.repeat(13)),false);
 assert.equal(validSequence('001011011100',12,12),true);assert.equal(validSequence('0010',12,12),false);
});
test('A/B pin assignments and pair mappings are correct',()=>{
 assert.deepEqual(orders.B,['wo','o','wg','b','wb','g','wbr','br']);
 assert.deepEqual(orders.A,['wg','g','wo','b','wb','o','wbr','br']);
 assert.deepEqual(pinMapping('A','A'),[1,2,3,4,5,6,7,8]);
 assert.deepEqual(pinMapping('B','B'),[1,2,3,4,5,6,7,8]);
 assert.deepEqual(pinMapping('A','B'),[3,6,1,4,5,2,7,8]);
});
test('continuity faults preserve the distinction between open, short, swap and split pair',()=>{
 assert.deepEqual(testMapping('B','B','open')[2],[]);
 assert.deepEqual(testMapping('B','B','short')[2],[3,4]);
 assert.deepEqual(testMapping('B','B','short')[3],[3,4]);
 assert.deepEqual(testMapping('B','B','swap').slice(0,2),[[2],[1]]);
 assert.deepEqual(testMapping('B','B','split'),testMapping('B','B','none'));
});
test('default channels recover the entire sequence',()=>{for(const m of ['twisted','coax','fiber','radio'] as const)assert.equal(decisions(m,INITIAL_BITS,DEFAULTS).join(''),INITIAL_BITS,m);});
test('balanced differential detection rejects nearly common noise',()=>{
 const s={...DEFAULTS,noise:1};const [a,b]=wireVoltages(INITIAL_BITS,0.5,s);
 assert.equal(received('twisted',INITIAL_BITS,.5,s),(a-b)/2);
 assert.equal(decisions('twisted',INITIAL_BITS,s).join(''),INITIAL_BITS);
 assert.notEqual(decisions('twisted',INITIAL_BITS,{...s,balanced:false}).join(''),INITIAL_BITS);
});
test('coax load boundary conditions do not invent bit errors for an ideal open load',()=>{
 const m=received('coax',INITIAL_BITS,.5,{...DEFAULTS,noise:0});
 assert.equal(reflectionCoefficient('matched'),0);
 assert.equal(received('coax',INITIAL_BITS,.5,{...DEFAULTS,noise:0,termination:'open'}),2*m);
 assert.equal(received('coax',INITIAL_BITS,.5,{...DEFAULTS,termination:'short'}),0);
 assert.equal(decisions('coax',INITIAL_BITS,{...DEFAULTS,termination:'short'}).join(''),'????????');
});
test('loss and interference create reproducible teaching counterexamples',()=>{
 assert.notEqual(decisions('fiber',INITIAL_BITS,{...DEFAULTS,length:5000,fiberMode:'multi',bend:75}).join(''),INITIAL_BITS);
 assert.notEqual(decisions('radio',INITIAL_BITS,{...DEFAULTS,distance:45,walls:2,interference:.8}).join(''),INITIAL_BITS);
});
test('no receiver sample is exposed before its arrival; rewind is deterministic',()=>{
 assert.equal(receivedCount(DELAY+.49,8),0);assert.equal(receivedCount(DELAY+.5,8),1);
 assert.equal(receivedCount(8+DELAY,8),8);assert.equal(receivedCount(0,8),0);
});
test('user input is constrained to a readable binary sequence',()=>{
 assert.equal(validateBits('1011'),true);assert.equal(validateBits('10x1'),false);assert.equal(validateBits('101'),false);assert.equal(validateBits('1'.repeat(17)),false);
});
test('Snell refraction, critical angle and total reflection obey boundary conditions',()=>{
 const theta=criticalAngle(1.48,1.46)!;
 assert.ok(Math.abs(theta-80.569876)<.001);
 assert.equal(refraction(1.48,1.46,84),null);
 assert.ok(refraction(1.48,1.46,75)!>75);
 assert.ok(Math.abs(refraction(1.48,1.46,theta)!-90)<1e-6);
 assert.equal(criticalAngle(1.46,1.48),null);
 assert.equal(refraction(1.48,1.46,0),0);
});
test('guided rays reflect only on core boundaries and retain reflection angle',()=>{
 const ray=reflectedRay({x:85,y:281},680,242,321,.62);
 assert.ok(ray.length>4);
 for(let i=1;i<ray.length;i++){
  assert.ok(ray[i].x>ray[i-1].x);
  assert.ok(ray[i].y>=242-1e-9&&ray[i].y<=321+1e-9);
  assert.ok(Math.abs(Math.abs((ray[i].y-ray[i-1].y)/(ray[i].x-ray[i-1].x))-.62)<1e-9);
  if(i<ray.length-1)assert.ok(ray[i].y===242||ray[i].y===321);
 }
 assert.equal(ray.at(-1)!.x,680);
 assert.ok(Math.abs(pathLength(ray)-595*Math.sqrt(1+.62**2))<1e-8);
});
test('a pulse travels by path length and never arrives earlier on the longer ray',()=>{
 const lengths=[0,.24,.43,.62].map(s=>pathLength(reflectedRay({x:85,y:281},680,242,321,s)));
 for(let i=1;i<lengths.length;i++)assert.ok(lengths[i]>lengths[i-1]);
 const points=[{x:0,y:0},{x:3,y:0},{x:3,y:4}];
 assert.deepEqual(pointAt(points,0),points[0]);assert.deepEqual(pointAt(points,1),points[2]);
 assert.deepEqual(pointAt(points,.5),{x:3,y:.5});
});
test('teaching map clearly labels synthetic routes and has finite geographic paths',()=>{
 assert.equal(cableData.kind,'synthetic-teaching-routes');
 assert.match(cableData.geometryNote,/不代表实际/);
 assert.equal(cableData.failedMetadata.length,0);
 assert.equal(new Set(cableData.cables.map(c=>c.id)).size,cableData.cables.length);
 for(const c of cableData.cables){assert.equal(typeof c.planned,'boolean');assert.ok(c.paths.length>0);for(const p of c.paths)assert.ok(/^M[-\d.,\sLM]+$/.test(p),c.id);}
 assert.equal(cableData.cables.find(c=>c.id==='teaching-atlantic')!.landings.length,2);
});

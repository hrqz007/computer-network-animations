// Self-authored teaching corridors. No commercial cable database is used.
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root = new URL('../', import.meta.url);
const land = JSON.parse(readFileSync(new URL('src/data/land.json', root), 'utf8'));
const xy = ([lon,lat]) => [(lon+180)*3,(82-lat)*3];
const path = points => points.map((p,i)=>(i?'L':'M')+xy(p).join(' ')).join('');
const routes = [
 {id:'atlantic',name:'跨大西洋：北美 — 欧洲',ends:[['北美东岸（示意）',[-74,40]],['西欧（示意）',[-9,39]]],lines:[[[-74,40],[-60,37],[-42,40],[-25,43],[-9,39]]]},
 {id:'pacific',name:'跨太平洋：东亚 — 北美',ends:[['东亚（示意）',[140,35]],['北美西岸（示意）',[-122,38]]],lines:[[[140,35],[160,30],[180,30]],[[-180,30],[-155,31],[-135,34],[-122,38]]]},
 {id:'asia-europe',name:'亚欧：印度洋 — 红海 — 地中海',ends:[['东南亚（示意）',[103,1]],['西欧（示意）',[-9,39]]],lines:[[[103,1],[85,5],[60,10],[45,12],[33,29],[32,32],[17,34],[-6,36],[-9,39]]]},
 {id:'asia-australia',name:'东南亚 — 澳大利亚',ends:[['东南亚（示意）',[103,1]],['澳大利亚西岸（示意）',[115,-32]]],lines:[[[103,1],[101,-10],[106,-23],[115,-32]]]},
 {id:'europe-africa',name:'欧洲 — 非洲西岸',ends:[['西欧（示意）',[-9,39]],['非洲南端（示意）',[18,-34]]],lines:[[[-9,39],[-18,20],[-21,0],[-5,-10],[7,-25],[18,-34]]]},
 {id:'south-atlantic',name:'南大西洋：南美 — 非洲',ends:[['南美东岸（示意）',[-35,-6]],['非洲西岸（示意）',[13,-9]]],lines:[[[-35,-6],[-22,-12],[-5,-15],[13,-9]]]},
 {id:'americas',name:'美洲：北美 — 南美',ends:[['北美东南岸（示意）',[-80,26]],['南美东岸（示意）',[-35,-6]]],lines:[[[-80,26],[-65,23],[-46,7],[-35,-6]]]},
 {id:'east-asia',name:'东亚 — 东南亚',ends:[['东亚（示意）',[140,35]],['东南亚（示意）',[103,1]]],lines:[[[140,35],[134,26],[125,20],[113,9],[103,1]]]},
 {id:'indian-ocean',name:'印度洋：非洲 — 南亚',ends:[['非洲东岸（示意）',[40,-6]],['南亚（示意）',[73,19]]],lines:[[[40,-6],[52,-2],[63,9],[73,19]]]},
 {id:'future',name:'假设备用通道：南太平洋（未建成）',planned:true,ends:[['澳大利亚东岸（示意）',[151,-34]],['南美西岸（示意）',[-72,-33]]],lines:[[[151,-34],[170,-36],[180,-36]],[[-180,-36],[-145,-39],[-105,-37],[-72,-33]]]}
];
const cables=routes.map(r=>({id:`teaching-${r.id}`,name:r.name,planned:!!r.planned,rfs:'教学假设，无实际投运时间',length:'非工程路线，不计算长度',owners:'无实际运营商',paths:r.lines.map(path),landings:r.ends.map(([name,coords],i)=>({id:`${r.id}-${i}`,name,xy:xy(coords)}))}));
const data={kind:'synthetic-teaching-routes',retrieved:'2026-10-08',source:'自主绘制的跨洋通信教学示意',sourceUrl:'https://github.com/hrqz007/computer-network-animations',licenseUrl:'https://github.com/hrqz007/computer-network-animations/blob/main/LICENSE',geometryNote:'本项目自主绘制的教学通道，不代表实际海缆位置、数量、容量、状态或路由。海岸线为 Natural Earth 公共领域数据；光点不是实时流量。',coast:land.coast,cables,failedMetadata:[]};
writeFileSync(new URL('src/data/cables.json',root),JSON.stringify(data)+'\n');
console.log(`Generated ${cables.length} synthetic teaching corridors: ${fileURLToPath(new URL('src/data/cables.json',root))}`);

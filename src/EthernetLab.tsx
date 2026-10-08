import {useMemo,useState} from 'react';
import {Stage,Fact} from './AdvancedUI';
import {useSignalClock} from './EncodingControls';
import {FlowDrawing,FlowPlayback,FlowResult,FlowSelect} from './FlowUI';
import {ethernetSample,hexByte} from './linkModel';
import LinkNotes from './LinkNotes';
const steps=[['上层交付','网络层交给网卡一份 IPv4 数据报，其中包含 ICMP 报文。'],['添加帧头','在前面添加目的 MAC、源 MAC 和 EtherType。数据报本身仍在载荷中。'],['补齐载荷','数据不足 46 B 时填充到 46 B；填充不属于 IP 数据报。'],['追加 FCS','对目的 MAC 到数据及填充部分计算 CRC-32，并把 4 B FCS 放在帧尾。'],['链路传送','按先后顺序发送。前导码与 SFD 在帧前，帮助接收端同步和识别起点。'],['接收检查','本例帧完整且 FCS 匹配，接收端继续按地址、类型等条件处理。'],['解封装交付','接收端交给 IPv4 层原始 IP 数据报；本例按 IP 总长度分清数据与填充。']];
type Field='destination'|'source'|'type'|'payload'|'padding'|'fcs'|'preamble';
function FrameExperiment(){
 const [length,setLength]=useState(28),[reverse,setReverse]=useState(false),[selected,setSelected]=useState<Field>('payload');
 const frame=useMemo(()=>ethernetSample(length,reverse),[length,reverse]),clock=useSignalClock(6),step=Math.min(6,Math.floor(clock.position)),progress=clock.position-step;
 const fields:{id:Field;name:string;size:number;value:string;explain:string;start:number;color:string}[]=[
  {id:'destination',name:'目的 MAC',size:6,value:frame.destination,explain:'指出本链路上的目标接收接口。本例两台主机同一子网，目的 MAC 是另一台主机；跨子网时通常会使用下一跳的 MAC。',start:1,color:'#347e9b'},
  {id:'source',name:'源 MAC',size:6,value:frame.source,explain:'标识发送此帧的接口。这里使用本地管理的单播示例地址；MAC 不等于 IP，也不一定是永远不能修改的出厂值。',start:1,color:'#547daa'},
  {id:'type',name:'EtherType',size:2,value:'0x0800 · IPv4',explain:'Ethernet II 中此字段标识载荷协议，不是帧长或端口号。0x0800 表示 IPv4，0x0806 表示 ARP，0x86DD 表示 IPv6。',start:1,color:'#8a72ab'},
  {id:'payload',name:'IP 数据报',size:length,value:`${length} B · IPv4 + ICMP`,explain:'这是网络层交付的数据报，包含自己的 IP 首部。1500 B MTU 指本例最大上层载荷，不包含以太网帧头和 FCS。',start:0,color:'#087f8c'},
  {id:'padding',name:'填充',size:frame.padding,value:frame.padding?`${frame.padding} B · 本例填 00`:'本帧无需填充',explain:'未带 VLAN 标签的普通以太网帧，数据加填充至少 46 B。填充值不应当被应用程序误认为用户数据。',start:2,color:'#c98f3c'},
  {id:'fcs',name:'FCS',size:4,value:`CRC-32 = 0x${frame.fcsHex}`,explain:'由当前帧字节实际计算出的 32 位校验值。覆盖目的地址、源地址、类型、数据和填充，不包括前导码、SFD，也不把自身作为生成时输入。此处显示数值，不展开线上逐位顺序。',start:3,color:'#b56d70'}
 ];
 const selectedField=fields.find(f=>f.id===selected),packetX=step<4?160:step===4?160+progress*480:640;
 function changeLength(v:number){setLength(v);clock.reset();}
 const hexPreview=frame.covered.slice(0,Math.min(frame.covered.length,64)).map(hexByte).join(' ');
 return <div className="lesson-layout flow-layout link-layout"><Stage title="一份数据报，怎样成为以太网帧？" tag="Ethernet II · 无 VLAN 标签">
 <div className="rate-metrics flow-metrics"><div><span>上层数据</span><strong>{length}<small> B</small></strong></div><div><span>需要填充</span><strong>{frame.padding}<small> B</small></strong></div><div><span>完整 MAC 帧</span><strong>{frame.frame}<small> B</small></strong></div></div>
 <div className="link-stepper" aria-label="封装过程步骤">{steps.map(([title],i)=><button key={title} aria-current={step===i?'step':undefined} className={step===i?'selected':''} onClick={()=>clock.seek(i)}><span>{i+1}</span>{title}</button>)}</div>
 <FlowDrawing label={`第 ${step+1} 步：${steps[step][0]}，${length} 字节 IP 数据报封装成 ${frame.frame} 字节帧`} height={235}>
 <rect x="40" y="25" width="210" height="180" rx="12" fill="#f1f6f9" stroke="#c6d9e2"/><rect x="550" y="25" width="210" height="180" rx="12" fill="#f1f6f9" stroke="#c6d9e2"/>
 <text x="145" y="54" textAnchor="middle" className="flow-title">发送端 {reverse?'B':'A'}</text><text x="655" y="54" textAnchor="middle" className="flow-title">接收端 {reverse?'A':'B'}</text>
 <text x="145" y="182" textAnchor="middle">网络层 ↓ 数据链路层</text><text x="655" y="182" textAnchor="middle">数据链路层 ↑ 网络层</text>
 <path d="M245 118H555m-12-6 12 6-12 6" stroke="#9bbbc8" strokeWidth="3" fill="none"/>
 <text x="400" y="156" textAnchor="middle" className="flow-small">一个链路传送过程 · 时间已放慢</text>
 <g className="frame-packet" transform={`translate(${step===6?650:packetX},${step===6?92:112})`}><rect x="-73" y="-28" width="146" height="56" rx="8" fill={step===0||step===6?'#e1f2ec':'#e0eff2'} stroke="#539ca5" strokeWidth="2"/>{step>0&&step<6&&<><rect x="-73" y="-28" width="23" height="56" rx="4" fill="#79a9c3"/>{step>=3&&<rect x="50" y="-28" width="23" height="56" rx="4" fill="#d7adb0"/>}</>}<text x="0" y="-2" textAnchor="middle" className="flow-title">{step===0||step===6?'IP 数据报':'以太网帧'}</text><text x="0" y="19" textAnchor="middle" className="flow-small">{step===0||step===6?length:step===1?14+length:step===2?frame.frame-4:frame.frame} B</text></g>
 <text x="400" y="216" textAnchor="middle">{step===6?`已交付 ${length} B；帧头、FCS 和填充不作为 IP 数据报交付`:step>=5?'帧已到达；检查后再解封装':step===4?'前导码 / SFD → 目的 MAC → 源 MAC → 类型 → 数据 / 填充 → FCS':'先封装，再交给下层发送'}</text>
 </FlowDrawing>
 <div className="frame-strip-heading"><strong>{step===6?'拆解前的完整帧结构':'按发送顺序查看字段'}</strong><span>色块宽度不按字节比例</span></div>
 <div className="frame-strip" aria-label="以太网帧字段">{fields.map(f=><button key={f.id} className={`frame-field ${selected===f.id?'field-selected':''} ${step<f.start?'field-pending':''} ${f.id==='padding'&&!frame.padding?'field-empty':''}`} style={{borderTopColor:f.color}} onClick={()=>setSelected(f.id)} aria-pressed={selected===f.id} aria-label={`查看${f.name}`}><strong>{f.name}</strong><span>{f.size} B</span><small>{step<f.start?'尚未添加':f.id==='padding'&&!frame.padding?'本帧省略':step===6&&f.id!=='payload'?'不交付 IPv4':'点击拆解'}</small></button>)}</div>
 <div className="frame-bracket">目的 MAC 至 FCS：6 + 6 + 2 + {length} + {frame.padding} + 4 = <strong>{frame.frame} B</strong></div>
 <button className={`preamble-button ${selected==='preamble'?'field-selected':''}`} onClick={()=>setSelected('preamble')}>查看帧外部分：前导码 7 B + SFD 1 B；帧间隙另计</button>
 <FlowResult title={`第 ${step+1} 步 · ${steps[step][0]}`}>{steps[step][1]}</FlowResult>
 <FlowPlayback clock={clock} events={[1,2,3,4,5,6]} label={`${step+1} / 7 步`}/><p className="model-caption">本例限于普通、未带 VLAN 标签的 Ethernet II 帧，标准长度 64—1518 B。无差错单次传送；以太网 FCS 不提供逐帧确认或自动重传。CRC 运算过程见独立动画。</p>
 </Stage><aside className="inspector"><h2>拆开一帧，看清每个字段</h2><FlowSelect label="IP 数据报长度" value={length} onChange={changeLength} options={[[28,'28 B · 观察最短帧填充'],[46,'46 B · 恰好不用填充'],[100,'100 B · 普通数据报'],[1500,'1500 B · 标准 MTU']]}/><label className="check-control"><input type="checkbox" checked={reverse} onChange={e=>{setReverse(e.target.checked);clock.reset();}}/>切换为 B → A 的响应</label>
 <div className="field-inspection"><span className="topic-label">当前查看</span><h3>{selected==='preamble'?'前导码、SFD 与帧间隙':selectedField!.name}</h3><code>{selected==='preamble'?'55 × 7，随后 D5':selectedField!.value}</code><p>{selected==='preamble'?'这里按字节数值表示前导码与 SFD，位的实际发送顺序另有约定。两者合计 8 B，不计入本页 64—1518 B 帧长；帧间隙是时间间隔，也不是帧字段。':selectedField!.explain}</p>{selectedField&&step<selectedField.start&&<p className="hint">此字段在后续步骤加入；这里可提前查看它的作用。</p>}</div>
 <Fact title="帧长不是 MTU">本例帧长 = 14 B 帧头 + 数据 / 填充 + 4 B FCS。前导码与 SFD 加上后，占用 {frame.onWire} 个字节时间；帧间隙仍须另计。</Fact>
 <details className="frame-bytes"><summary>查看用于 FCS 计算的字节</summary><p>按字节序列显示目的 MAC 至填充，最多展示前 64 B。样本含完整 IPv4 / ICMP 首部及校验和。</p><code>{hexPreview}{frame.covered.length>64?' …':''}</code><p>覆盖长度 {frame.covered.length} B；CRC-32 数值 0x{frame.fcsHex}。</p></details>
 <a className="link-next" href="#/datalink/ethernet/crc">进入独立的 CRC 检错动画 →</a>
 </aside></div>;
}
export default function EthernetLab(){return <><FrameExperiment/><LinkNotes lesson="frame"/></>}

import {useMemo,useState} from 'react';
import {Stage,Fact} from './AdvancedUI';
import {useSignalClock} from './EncodingControls';
import {FlowResult} from './FlowUI';
import CrcCalculation,{CrcPlayback,CrcHistory} from './CrcCalculation';
import {crcTeachingScenes} from './crcTeachingModel';
import {binaryDivision,crcCodeword,polynomial,xorBits,undetectedMask} from './linkModel';
import LinkNotes from './LinkNotes';
type Phase='send'|'channel'|'receive';
function Bits({label,bits,split,mask,onFlip}:{label:string;bits:string;split:number;mask?:string;onFlip?:(i:number)=>void}){return <div className="crc-bitline"><span>{label}</span>{[...bits].map((b,i)=>{const cn=`${i>=split?'crc-cell':''} ${mask?.[i]==='1'?'bit-flipped':''}`;return onFlip?<button type="button" className={cn} key={i} aria-label={`翻转第 ${i+1} 位，当前 ${b}`} aria-pressed={mask?.[i]==='1'} onClick={()=>onFlip(i)}>{b}</button>:<i className={cn} key={i}>{b}</i>;})}</div>}
function CrcExperiment(){
 const [data,setData]=useState('1101011011'),[draft,setDraft]=useState('1101011011'),[generator,setGenerator]=useState('10011'),[phase,setPhase]=useState<Phase>('send'),[mask,setMask]=useState('0'.repeat(14)),[error,setError]=useState('');
 const encoded=useMemo(()=>crcCodeword(data,generator),[data,generator]),received=xorBits(encoded.codeword,mask),verified=useMemo(()=>binaryDivision(received,generator),[received,generator]),scenes=useMemo(()=>crcTeachingScenes(data.length,phase==='send'),[data.length,phase]),clock=useSignalClock(scenes.length-1),sceneIndex=Math.min(scenes.length-1,Math.floor(clock.position+1e-8)),scene=scenes[sceneIndex],finished=sceneIndex===scenes.length-1,degree=generator.length-1;
 const division=phase==='receive'?verified:encoded,flips=[...mask].filter(b=>b==='1').length,detected=verified.remainder.includes('1');
 function move(p:Phase){setPhase(p);clock.reset();}
 function setup(d:string,g:string){setData(d);setDraft(d);setGenerator(g);setMask('0'.repeat(d.length+g.length-1));setError('');move('send');}
 function inject(kind:'none'|'data'|'crc'|'miss'){
  const n=encoded.codeword.length;
  setMask(kind==='none'?'0'.repeat(n):kind==='data'?'1'+'0'.repeat(n-1):kind==='crc'?'0'.repeat(n-1)+'1':undetectedMask(n,generator));move('channel');
 }
 function flip(i:number){setMask(m=>[...m].map((b,j)=>j===i?b==='1'?'0':'1':b).join(''));clock.reset();}
 return <div className="lesson-layout flow-layout link-layout"><Stage title="CRC：从生成校验位，到接收端检错" tag={`教学用 ${degree} 位 CRC · 非以太网 CRC-32`}>
 <div className="crc-phases" aria-label="CRC 演示阶段">{([['send','1 发送端计算'],['channel','2 链路翻转比特'],['receive','3 接收端验算']] as [Phase,string][]).map(([id,title])=><button key={id} className={phase===id?'selected':''} aria-pressed={phase===id} onClick={()=>move(id)}>{title}</button>)}</div>
 <div className="crc-note">本页先用短生成多项式展示模 2 除法。真实以太网使用 32 位 CRC，并有初始化、位序与最终异或等约定，不能直接照搬本页短例。</div>
 {phase==='channel'?<><div className="crc-bits-box"><Bits label="发送码字" bits={encoded.codeword} split={data.length}/><Bits label="错误掩码" bits={mask} split={data.length}/><Bits label="接收码字" bits={received} split={data.length} mask={mask} onFlip={flip}/></div><div className="crc-legend"><span><b>青色区域</b> 原数据部分</span><span>浅黄色区域：校验位</span><span>红色：已翻转的位；再次点击可还原</span></div>
 <FlowResult title={`共翻转 ${flips} 位；接收码字 = 发送码字 ⊕ 错误掩码`} warn={flips>0}>{flips?'发送端的 CRC 不会因传输途中发生翻转而自动重新生成。接收端必须检查它实际收到的整串比特。':'当前没有注入错误，先观察正常接收，再尝试翻转原数据或 CRC 中的一位。'}</FlowResult>
 <div className="crc-action-row"><button onClick={()=>inject('none')}>清除所有翻转</button><button className="primary" onClick={()=>move('receive')}>用这份接收码字验算 →</button></div>
 <p className="model-caption">这里显示发送原文和错误掩码是为了教学对照；真实接收方通常并不知道原文及错误位置。翻转按钮可修改原数据位，也可修改校验位。</p></>:<>
 <div className="crc-calculation-jumps" aria-label="计算步骤导航">{(phase==='send'?[['degree','① 确定次数'],['append','② 补零'],['align','③ 逐轮计算'],['remainder','④ 取余数'],['codeword','⑤ 拼接码字']]:[['received','① 收到码字'],['align','② 逐轮验算'],['remainder','③ 查看余数']]).map(([kind,label])=><button key={kind} className={scene.kind===kind||(kind==='align'&&['xor','shift'].includes(scene.kind))?'selected':''} onClick={()=>clock.seek(scenes.findIndex(s=>s.kind===kind))}>{label}</button>)}</div>
 <CrcPlayback clock={clock} sceneIndex={sceneIndex}/>
 <div className="crc-round-picker"><label>跳到第几轮<select aria-label="跳到第几轮" value={scene.round} onChange={e=>clock.seek(scenes.findIndex(s=>s.kind==='align'&&s.round===+e.target.value))}>{division.steps.map((_,i)=><option key={i} value={i}>第 {i+1} 轮</option>)}</select></label><span>本次 G = {generator}；每次看 {generator.length} 位</span></div>
 <CrcCalculation scene={scene} data={data} generator={generator} dividend={phase==='send'?encoded.padded:received} division={division} sender={phase==='send'}/>
 {finished&&phase==='send'&&<div className="crc-action-row"><button className="primary" onClick={()=>move('channel')}>将码字送入链路 →</button></div>}
 {finished&&phase==='receive'&&<div className={`crc-outcome ${flips?'failed':''}`}><strong>{flips===0?'本次对照：未注入错误':detected?'本次注入的差错已被发现':'本次发生漏检：数据已改变，余数仍为零'}</strong><p>{flips===0?'正常码字可被同一个 G 整除。':detected?'以太网通常丢弃 FCS 错误帧，CRC 本身不会发出重传请求。是否重传由相应协议处理。':`错误多项式 E(x) 恰好可以被 G(x) 整除。已知翻转 ${flips} 位，但接收端单凭零余数无法发现。`}</p></div>}
 <CrcHistory division={division} completed={scene.completedRounds} generator={generator}/>
 </>}
 </Stage><aside className="inspector"><h2>先算校验位，再主动制造差错</h2><form className="crc-input" onSubmit={e=>{e.preventDefault();const d=draft.trim();if(!/^[01]{4,12}$/.test(d)){setError('请输入 4—12 位，只能包含 0 和 1。');return;}setup(d,generator);}}><label htmlFor="crc-data">发送数据 D</label><div><input id="crc-data" value={draft} onChange={e=>setDraft(e.target.value)} maxLength={24} spellCheck={false} inputMode="numeric" aria-invalid={!!error} aria-describedby="crc-data-hint"/><button type="submit">应用</button></div><p id="crc-data-hint" className={error?'input-error':'hint'} role={error?'alert':undefined}>{error||'可输入 4—12 位，方便投影逐步演算。'}</p></form>
 <label className="field-label">生成多项式 G<select aria-label="生成多项式 G" value={generator} onChange={e=>setup(data,e.target.value)}><option value="10011">10011 · x⁴ + x + 1</option><option value="1011">1011 · x³ + x + 1</option><option value="1101">1101 · x³ + x² + 1</option></select></label><p className="crc-caption">G(x) = {polynomial(generator)}。最高次为 {degree}，所以附加 {degree} 位；不是附加 {generator.length} 位。</p>
 <div className="crc-action-row"><button onClick={()=>setup('1101','1011')}>入门短例（4 位数据）</button><button onClick={()=>setup('1101011011','10011')}>恢复默认算例</button><button onClick={()=>setup('00000000',generator)}>全 0 数据</button></div>
 <div className="crc-xor-rules"><h3>模 2 减法 = 异或</h3><div><code>0 ⊕ 0 = 0</code><code>1 ⊕ 1 = 0</code><code>0 ⊕ 1 = 1</code><code>1 ⊕ 0 = 1</code></div><p>相同为 0，不同为 1。逐列独立计算，没有借位。</p></div><h3>链路差错预设</h3><div className="stack-buttons"><button onClick={()=>inject('none')}>无差错传送</button><button onClick={()=>inject('data')}>翻转一个数据位</button><button onClick={()=>inject('crc')}>翻转一个 CRC 位</button><button onClick={()=>inject('miss')}>构造一个漏检例子</button></div>
 <Fact title="检错能力有条件">本例的单比特翻转都能检出。如果错误多项式恰好是 G(x) 的倍数，就可能漏检。零余数表示“未检出差错”，也不代表经过了加密或身份认证。</Fact><div className="crc-note">发送端与接收端使用同一生成多项式。这里采用零初值、不反射、不额外取反的教学多项式模型；不将它命名为某种标准 CRC-3/CRC-4 实现。</div>
 <a className="link-next" href="#/datalink/ethernet/frame">回看以太网帧中的 4 B FCS →</a></aside></div>;
}
export default function CrcLab(){return <><CrcExperiment/><LinkNotes lesson="crc"/></>}

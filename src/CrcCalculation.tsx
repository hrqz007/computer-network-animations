import type {CSSProperties} from 'react';
import type {DivisionStep} from './linkModel';
import {polynomial} from './linkModel';
import {crcWindow} from './crcTeachingModel';
import type {CrcScene} from './crcTeachingModel';
import type {SignalClock} from './EncodingControls';

type Division={steps:DivisionStep[];remainder:string};
export function CrcPlayback({clock,sceneIndex}:{clock:SignalClock;sceneIndex:number}){
 return <div className="crc-teaching-controls"><p>建议先点“下一步”：每次只看一个动作；也可以自动播放。</p><div className="playback">
  <button className="primary" onClick={clock.toggle}>{clock.running?'暂停动画':'播放动画'}</button>
  <button onClick={()=>clock.seek(sceneIndex-1)} disabled={sceneIndex===0}>上一步</button>
  <button onClick={()=>clock.seek(sceneIndex+1)} disabled={sceneIndex===clock.units}>下一步</button>
  <button onClick={clock.reset}>重新开始</button><button onClick={()=>clock.seek(clock.units)}>看最终结果</button>
  <label className="speed-label">播放速度<select aria-label="播放速度" value={clock.speed} onChange={e=>clock.setSpeed(+e.target.value)}><option value=".5">0.5×</option><option value="1">1×</option><option value="2">2×</option></select></label>
 </div><label className="timeline flow-timeline"><span>演示进度</span><input aria-label="演示进度" type="range" min="0" max={clock.units} step="1" value={sceneIndex} onChange={e=>clock.seek(+e.target.value)}/><output>{sceneIndex+1} / {clock.units+1} 画面</output></label></div>;
}

function LocalRow({label,bits,width,result=false}:{label:string;bits:string;width:number;result?:boolean}){
 return <div className={`crc-local-row ${result?'crc-local-result':''}`} style={{'--crc-width':width} as CSSProperties}><span>{label}</span>{[...bits].map((bit,i)=><b key={i}>{bit}</b>)}</div>;
}

export default function CrcCalculation({scene,data,generator,dividend,division,sender}:{scene:CrcScene;data:string;generator:string;dividend:string;division:Division;sender:boolean}){
 const degree=generator.length-1,step=division.steps[scene.round],window=crcWindow(step,generator.length);
 const inRound=['align','xor','shift'].includes(scene.kind),showResult=scene.kind!=='align',isShift=scene.kind==='shift';
 const working=isShift||scene.kind==='xor'?step.after:step.before;
 const windowStart=isShift?step.offset+1:step.offset,windowEnd=isShift?step.offset+1+generator.length:step.offset+generator.length;
 const kindLabel={align:'对齐',xor:'逐位异或',shift:window.nextBit===null?'不再落位':'右移并落下一位'};
 return <section className="crc-teaching" aria-label="CRC 逐步讲解">
 {scene.kind==='degree'?<><h3>① 先确定：为什么要补 {degree} 个 0？</h3><p>生成多项式由通信双方约定。把 <code>{generator}</code> 的每一位，与从高到低的幂次对应：</p>
  <div className="crc-polynomial">{[...generator].map((b,i)=><div key={i} className={b==='1'?'term-present':''}><span>x<sup>{degree-i}</sup></span><strong>{b}</strong><small>{b==='1'?'保留这一项':'这一项为 0'}</small></div>)}</div>
  <div className="crc-teaching-callout"><strong>G(x) = {polynomial(generator)}，最高次数 r = {degree}</strong><p>它写成二进制有 {generator.length} 位，但次数是 {degree}。因此 CRC 余数固定写 {degree} 位，计算前在数据后补 {degree} 个 0。</p></div><p className="crc-caption">本页是模 2 多项式除法，符号 ⊕ 表示异或。这里只求校验余数，不把除法的商发送出去。</p>
 </>:scene.kind==='append'?<><h3>② 在原数据后补 {degree} 个 0，留出余数的位置</h3><div className="crc-original"><span>原数据 D · 始终保留</span><code>{data}</code></div><div className="crc-join"><code>{data}</code><span>拼接</span><code className="crc-gold">{'0'.repeat(degree)}</code><span>→</span><code>{dividend}</code></div><div className="crc-teaching-callout"><strong>接下来计算：{dividend} ÷ {generator}</strong><p>这等价于 D(x) 乘 x<sup>{degree}</sup> 后除以 G(x)。下面改动的是计算草稿；原数据 D 不会被覆盖。</p></div><p className="crc-caption">末尾这些 0 是计算时的占位。算出余数后，真正发送的是“原数据 + 余数”。</p>
 </>:scene.kind==='received'?<><h3>接收端：检查收到的整串比特，不再补零</h3><div className="crc-original"><span>实际接收码字</span><code>{dividend}</code></div><div className="crc-teaching-callout"><strong>计算：{dividend} ÷ {generator}</strong><p>后 {degree} 位已经是收到的校验位。仍然按“对齐 → 异或 → 落下一位”的过程求余数。</p></div><p>余数非零说明检出了差错；余数为零只能说明这次未检出差错。</p>
 </>:inRound?<>
  <div className="crc-round-title"><h3>{sender?'③':'②'} 第 {scene.round+1} / {division.steps.length} 轮 · {kindLabel[scene.kind as keyof typeof kindLabel]}</h3><div className="crc-round-phases">{['align','xor','shift'].map((kind,i)=><span key={kind} className={scene.kind===kind?'active':''}>{['对齐','异或','右移 / 落位'][i]}</span>)}</div></div>
  <p className="crc-round-instruction">{scene.kind==='align'?`当前窗口取草稿第 ${step.offset+1}—${step.offset+generator.length} 位：${window.before}。看最左边的 ${window.before[0]}，决定本轮与谁异或。`:scene.kind==='xor'?step.active?`首位是 1，用 ${generator} 逐列异或，把本轮最高位消成 0。`:`首位已经是 0，本轮不需要消去最高项；与 ${'0'.repeat(generator.length)} 异或，结果不变。`:window.nextBit===null?`本轮最左位已经为 0，右侧也没有比特可落下了。余下 ${degree} 位就是最终余数。`:`略去已消成的最左侧 0，再从原被除数落下第 ${window.nextPosition} 位 ${window.nextBit}。不是重新补一个 0。`}</p>
  <div className="crc-local-division" aria-label="本轮局部算式">
   <LocalRow label="本轮窗口" bits={window.before} width={generator.length}/>
   <LocalRow label={step.active?'⊕ G':'⊕ 全 0'} bits={window.operand} width={generator.length}/>
   <LocalRow label="本轮结果" bits={showResult?window.after:'·'.repeat(generator.length)} width={generator.length} result/>
  </div>
  <div className="crc-column-proof">{showResult?[...window.before].map((bit,i)=><code key={i}>{bit} ⊕ {window.operand[i]} = {window.after[i]}</code>):<span>异或规则：相同为 0，不同为 1。下一步再揭示结果。</span>}</div>
  <div className={`crc-bring-down ${isShift?'revealed':''}`} aria-label="右移与落位">{isShift?<><span>略去最左侧 0：</span><code><s>0</s>{window.tail}</code>{window.nextBit!==null?<><span>落下第 {window.nextPosition} 位</span><code className="crc-incoming">{window.nextBit}</code><span>→ 下轮窗口</span><code>{window.next}</code></>:<><span>→ 最终余数</span><code className="crc-gold">{window.tail}</code></>}</>:<span>完成异或后，下一步会显示“略去最左侧 0，再落下一位”。</span>}</div>
  <div className="crc-work-label"><strong>{isShift?'右移后的草稿窗口':'整串计算草稿中的位置'}</strong><span>青色：当前窗口 · 灰色：已消去的前缀</span></div>
  <div className="crc-work-scroll"><div className="crc-work-strip">{[...working].map((b,i)=><div key={i} className={`${i<windowStart?'processed':''} ${i>=windowStart&&i<windowEnd?'in-window':''} ${isShift&&i===window.nextPosition!-1?'incoming':''}`}><small>{i+1}</small><b>{b}</b></div>)}</div></div>
  <p className="crc-caption">{sender?`原数据 D = ${data} 始终另存；这里的草稿不是要发送的数据。`:'这里的草稿来自实际收到的完整码字，只用于验算。'}</p>
 </>:scene.kind==='remainder'?<><h3>{sender?'④':'③'} 没有下一位可落下：取最后 {degree} 位</h3><div className="crc-remainder-line"><span>最终草稿</span><code><span>{'0'.repeat(division.steps.length)}</span><b>{division.remainder}</b></code></div><div className="crc-teaching-callout"><strong>余数 R = {division.remainder}</strong><p>前面已经全部消成 0，剩下的多项式次数小于 {degree}，所以除法停止。余数不足 {degree} 位时，左侧补 0 写满。</p></div>{sender?<p>下一步把这个余数接到<strong>原始数据 D</strong> 后面。不要发送上面已经变成许多 0 的计算草稿。</p>:<p>{division.remainder.includes('1')?'余数非零：检出差错。CRC 本身不能定位或修复错误位。':'余数全零：未检出差错，仍存在特定错误漏检的可能。'}</p>}
 </>:<><h3>⑤ 取回原数据，再附加余数</h3><div className="crc-original"><span>原数据 D · 没有被修改</span><code>{data}</code></div><div className="crc-join"><code>{data}</code><span>拼接</span><code className="crc-gold">{division.remainder}</code><span>→</span><code>{data+division.remainder}</code></div><div className="crc-teaching-callout"><strong>发送码字：{data} | {division.remainder}</strong><p>共 {data.length+degree} 位。计算时补的 {degree} 个 0 被余数替代；原数据位保持不变。</p></div><details className="crc-why"><summary>为什么拼上余数后可以整除？</summary><p>补零的数据 ÷ G，余数为 R。再把 R 异或进预留的低位，余数就变成 R ⊕ R = 0。因此，本教学模型的“原数据 + R”可被 G 整除。</p></details>
 </>}
 </section>;
}

export function CrcHistory({division,completed,generator}:{division:Division;completed:number;generator:string}){
 return <details className="crc-history"><summary>逐轮计算记录 · 已完成 {completed} / {division.steps.length} 轮</summary>{completed===0?<p>完成一轮“对齐、异或、落位”后，这里会保留对应算式。</p>:<div className="crc-history-scroll"><table><thead><tr><th>轮次</th><th>本轮窗口 ⊕ 异或数 = 结果</th><th>略去最左 0，再落下一位</th></tr></thead><tbody>{division.steps.slice(0,completed).map((s,i)=>{const w=crcWindow(s,generator.length);return <tr key={i}><td>{i+1}{!s.active&&<small>首位 0</small>}</td><td><code>{w.before} ⊕ {w.operand} = {w.after}</code></td><td><code>{w.tail}{w.nextBit===null?` → 余数 ${w.tail}`:` | ${w.nextBit} → ${w.next}`}</code></td></tr>;})}</tbody></table></div>}</details>;
}

import {useState} from 'react';
import {quizBank} from './quizBank';
export default function ClassroomQuiz({lessonKey}:{lessonKey:string}){
 const questions=quizBank[lessonKey];
 const [answers,setAnswers]=useState<Record<number,number>>({}),[checked,setChecked]=useState<Record<number,boolean>>({});
 const answered=Object.keys(answers).length;
 if(!questions)throw new Error(`缺少本节课堂提问：${lessonKey}`);
 return <div className="classroom-quiz"><div className="quiz-summary"><strong>本节课堂提问 · {questions.length} 题</strong><span>已作答 {answered} / {questions.length}</span><button onClick={()=>{setAnswers({});setChecked({});}}>重新作答</button></div><p className="hint">先预测，再回到动画中验证。每题可单独检查答案。</p>{questions.map((question,i)=><form className="quiz quiz-question" key={question.q} onSubmit={e=>{e.preventDefault();setChecked(v=>({...v,[i]:true}));}}><fieldset><legend>{i+1}. {question.q}</legend>{question.answers.map((a,j)=><label key={a}><input type="radio" name={`${lessonKey}-question-${i}`} required checked={answers[i]===j} onChange={()=>{setAnswers(v=>({...v,[i]:j}));setChecked(v=>({...v,[i]:false}));}}/>{a}</label>)}</fieldset><button type="submit" className="primary">检查第 {i+1} 题</button>{checked[i]&&<div className={`quiz-feedback ${answers[i]===question.correct?'answer-correct':'text-error'}`} role="status"><strong>{answers[i]===question.correct?'回答正确。':'这题还需要调整。'}</strong><p>正确答案：{question.answers[question.correct]}</p><p>{question.why}</p></div>}</form>)}</div>;
}

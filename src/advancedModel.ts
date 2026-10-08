export type Point = {x:number;y:number};
export const criticalAngle=(core:number,clad:number)=>core>clad?Math.asin(clad/core)*180/Math.PI:null;
export function refraction(core:number,clad:number,angle:number){
 const s=core/clad*Math.sin(angle*Math.PI/180);
 return s>1+1e-12?null:Math.asin(Math.min(1,s))*180/Math.PI;
}
export function reflectedRay(start:Point,endX:number,top:number,bottom:number,slope:number):Point[]{
 const points=[start];let {x,y}=start;let m=slope;
 for(let i=0;i<100&&x<endX;i++){
  if(Math.abs(m)<1e-9){points.push({x:endX,y});break;}
  const edge=m>0?bottom:top;const nextX=x+(edge-y)/m;
  if(nextX>=endX){points.push({x:endX,y:y+(endX-x)*m});break;}
  points.push({x:nextX,y:edge});x=nextX;y=edge;m=-m;
 }
 return points;
}
export function pathLength(points:Point[]){return points.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-points[i].x,p.y-points[i].y),0);}
export function pointAt(points:Point[],fraction:number):Point{
 let left=pathLength(points)*Math.max(0,Math.min(1,fraction));
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],d=Math.hypot(b.x-a.x,b.y-a.y);if(left<=d&&d>0)return{x:a.x+(b.x-a.x)*left/d,y:a.y+(b.y-a.y)*left/d};left-=d;}
 return points.at(-1)??{x:0,y:0};
}
export const pathD=(p:Point[])=>p.map((v,i)=>`${i?'L':'M'}${v.x.toFixed(2)} ${v.y.toFixed(2)}`).join('');

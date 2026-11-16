(function(root,f){if(typeof module==='object'&&module.exports)module.exports=f();else root.G2048=f()})(this,function(){
 const rng=seed=>{let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}};
 const spawn=(b,r)=>{const e=[];b.forEach((v,i)=>{if(!v)e.push(i)});if(e.length)b[e[Math.floor(r()*e.length)]]=r()<.9?2:4};
 const slide=row=>{const a=row.filter(x=>x);let sc=0;for(let i=0;i<a.length-1;i++)if(a[i]===a[i+1]){a[i]*=2;sc+=a[i];a.splice(i+1,1)}while(a.length<4)a.push(0);return[a,sc]};
 const can=b=>{if(b.includes(0))return true;for(let i=0;i<16;i++){if(i%4<3&&b[i]===b[i+1])return true;if(i<12&&b[i]===b[i+4])return true}return false};
 const sim=(b,d)=>{
  const nb=b.slice();let sc=0;
  for(let k=0;k<4;k++){
   const idx=[0,1,2,3].map(j=>d==='l'?k*4+j:d==='r'?k*4+3-j:d==='u'?j*4+k:(3-j)*4+k);
   const[r,s]=slide(idx.map(i=>b[i]));sc+=s;idx.forEach((i,j)=>nb[i]=r[j]);
  }
  return{nb,sc,moved:nb.some((v,i)=>v!==b[i])};
 };
 const init=seed=>{const r=rng(seed),b=Array(16).fill(0);spawn(b,r);spawn(b,r);return{b,r,s:0,over:false}};
 const move=(g,d)=>{const m=sim(g.b,d);if(!m.moved)return false;g.b=m.nb;g.s+=m.sc;spawn(g.b,g.r);g.over=!can(g.b);return true};
 return{init,move,sim,can};
});

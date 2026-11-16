module.exports=(io,rooms,push)=>{
 const games={},pg={},inv={},LV=['easy','normal','hard'],TY=['ttt','rps','2048'];
 const L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]],WIN={r:'p',p:'s',s:'r'};
 const rnd=a=>a[Math.floor(Math.random()*a.length)],rid=()=>Math.random().toString(36).slice(2,9);
 const win=b=>{for(const[a,c,d]of L)if(b[a]&&b[a]===b[c]&&b[a]===b[d])return b[a];return b.every(x=>x)?'d':null};
 const mm=(b,t,me)=>{const w=win(b);if(w)return w==='d'?0:w===me?1:-1;let best=t===me?-2:2;for(let i=0;i<9;i++)if(!b[i]){b[i]=t;const v=mm(b,t==='X'?'O':'X',me);b[i]=0;best=t===me?Math.max(best,v):Math.min(best,v)}return best};
 const tbot=(b,me,lv)=>{
  const e=[0,1,2,3,4,5,6,7,8].filter(i=>!b[i]),op=me==='X'?'O':'X',pick=()=>rnd(e);
  const fin=s=>e.find(i=>{b[i]=s;const w=win(b)===s;b[i]=0;return w});
  if(lv==='easy')return pick();
  if(lv==='normal'){const w=fin(me);if(w!==undefined)return w;const x=fin(op);if(x!==undefined)return x;return b[4]?pick():4}
  let bi=e[0],bv=-2;for(const i of e){b[i]=me;const v=mm(b,op,me);b[i]=0;if(v>bv){bv=v;bi=i}}return bi};
 const cnt=a=>{const c={r:0,p:0,s:0};a.forEach(x=>c[x]++);return Object.keys(c).sort((x,y)=>c[y]-c[x])[0]};
 const rbot=g=>{
  const h=g.hist;if(g.lv==='easy'||!h.length)return rnd('rps');
  if(g.lv==='normal')return Math.random()<.7?WIN[cnt(h)]:rnd('rps');
  const lm=h[h.length-1],nx=[];for(let i=0;i<h.length-1;i++)if(h[i]===lm)nx.push(h[i+1]);
  return WIN[nx.length>1?cnt(nx):cnt(h)]};
 const resolve=g=>{
  const[a,b]=g.ch,w=a===b?'d':WIN[b]===a?0:1;
  g.hist.push(a);if(w!=='d')g.sc[w]++;g.last={ch:[a,b],w};g.rd++;g.ch=[null,null];
  const need=Math.ceil(g.bo/2);
  if(g.sc[0]>=need||g.sc[1]>=need||g.rd>g.bo)g.o=g.sc[0]===g.sc[1]?'d':g.sc[0]>g.sc[1]?0:1};
const G=require('./public/g2048.js'),HW=[16,15,14,13,9,10,11,12,8,7,6,5,1,2,3,4];
 const heu=b=>b.reduce((s,v,i)=>s+v*HW[i],0)+b.filter(x=>!x).length*40;
 const botScore=(seed,lv)=>{
  const g=G.init(seed),cap={easy:120,normal:300,hard:500}[lv],D=['l','r','u','d'];
  for(let n=0;n<cap&&!g.over;n++){
   let d=null;
   if(lv==='easy'){const ok=D.filter(x=>G.sim(g.b,x).moved);d=ok.length?rnd(ok):null}
   else{let bv=-1;for(const x of D){const m=G.sim(g.b,x);if(!m.moved)continue;let v;
    if(lv==='normal')v=m.sc*3+heu(m.nb);
    else{const S=[];m.nb.forEach((c,i)=>{if(!c)S.push(i)});const T=S.slice(0,6);v=0;
     for(const i of T){const c=m.nb.slice();c[i]=2;let best=0;for(const y of D){const q=G.sim(c,y);if(q.moved)best=Math.max(best,q.sc*3+heu(q.nb))}v+=best}
     v=T.length?v/T.length:m.sc}
    if(v>bv){bv=v;d=x}}}
   if(!d||!G.move(g,d))break;
  }
  return g.s};
 const fin=g=>{if(g.o!==null)return;clearTimeout(g.tm);const a=g.e[0].s,b=g.p[1]==='bot'?g.tgt:g.e[1].s;g.o=a===b?'d':a>b?0:1;send(g)};
 const gv=(g,pid)=>{
  const i=g.p[0]===pid?0:1,j=1-i;
  if(g.type==='2048')return{id:g.id,type:'2048',seed:g.seed,mv:g.mv[i],you:g.e[i].s,opp:g.p[j]==='bot'?g.tgt:g.e[j].s,oppBot:g.p[j]==='bot',end:g.end,over:g.o===null?null:g.o==='d'?'d':g.o===i?'you':'opp',level:g.lv,vs:g.n[j]};
  if(g.type==='ttt')return{id:g.id,type:'ttt',board:g.b,you:i?'O':'X',turn:g.t,over:g.o,level:g.lv,vs:g.n[j]};
  const l=g.last;
  return{id:g.id,type:'rps',bo:g.bo,sc:[g.sc[i],g.sc[j]],rd:Math.min(g.rd,g.bo),picked:!!g.ch[i],last:l&&{you:l.ch[i],opp:l.ch[j],w:l.w==='d'?'d':l.w===i?'you':'opp'},over:g.o===null?null:g.o==='d'?'d':g.o===i?'you':'opp',level:g.lv,vs:g.n[j]}};
 const send=g=>{const r=rooms[g.room];if(!r)return;g.p.forEach(x=>{const p=r.pl[x];if(x!=='bot'&&p&&p.sid)io.to(p.sid).emit('arc:game',gv(g,x))})};
 const mk=(r,type,pa,pb,o)=>{
  const g={id:rid(),type,room:r.code,p:[pa,pb],n:[r.pl[pa].n,pb==='bot'?'Bot':r.pl[pb].n],lv:o.level,o:null};
  if(type==='ttt'){g.b=Array(9).fill(0);g.t='X'}else if(type==='2048'){g.seed=Math.floor(Math.random()*4294967296);g.e=[G.init(g.seed),pb==='bot'?null:G.init(g.seed)];g.mv=['',''];g.end=Date.now()+180000;if(pb==='bot')g.tgt=botScore(g.seed,g.lv);g.tm=setTimeout(()=>fin(g),181000)}else{g.bo=o.bo===5?5:3;g.sc=[0,0];g.rd=1;g.ch=[null,null];g.hist=[];g.last=null}
  games[g.id]=g;g.p.forEach(x=>{if(x!=='bot')pg[x]=g.id});send(g)};
 const step=(g,i)=>{const s=g.t;g.b[i]=s;g.o=win(g.b);if(!g.o)g.t=s==='X'?'O':'X'};
 const to=(p,e,d)=>{if(p&&p.sid)io.to(p.sid).emit(e,d)};
 return{
  attach(s,E,get){
   E('arc:enter',()=>{const{r,id}=get();if(r&&r.pl[id]){r.pl[id].arc=true;push(r)}});
   E('arc:back',()=>{const{r,id}=get();if(r&&r.pl[id]){r.pl[id].arc=false;push(r)}});
   E('arc:bot',d=>{
    const{r,id}=get(),p=r&&r.pl[id];if(!p||pg[id]||!TY.includes(d.type))return;
    mk(r,d.type,id,'bot',{level:LV.includes(d.level)?d.level:'easy',bo:d.bo});
   });
   E('arc:list',(d,cb)=>{
    const{r,id}=get();if(!r)return cb({list:[]});
    cb({list:Object.entries(r.pl).filter(([i,p])=>i!==id&&p.arc&&p.sid&&!pg[i]).map(([i,p])=>({id:i,n:p.n,a:p.a}))});
   });
   E('arc:invite',(d,cb)=>{
    const{r,id}=get(),me=r&&r.pl[id],t=r&&r.pl[d.to];
    if(!me||!t||d.to===id||!t.arc||!t.sid||pg[id]||pg[d.to]||!TY.includes(d.type))return cb({err:'Bu o‘yinchiga hozir taklif yuborib bo‘lmaydi'});
    if(Object.values(inv).some(v=>v.from===id&&v.to===d.to))return cb({err:'Taklif allaqachon yuborilgan'});
    const v={id:rid(),from:id,to:d.to,type:d.type,bo:d.bo};inv[v.id]=v;
    to(t,'arc:inv',{id:v.id,from:me.n,type:v.type,bo:v.bo});
    setTimeout(()=>{if(inv[v.id]){delete inv[v.id];to(me,'arc:invr',{id:v.id,st:'expired',n:t.n});to(t,'arc:invr',{id:v.id,st:'expired',n:me.n})}},30000);
    cb({ok:1});
   });
   E('arc:reply',d=>{
    const{r,id}=get(),v=inv[d.id];if(!r||!v||v.to!==id)return;delete inv[v.id];
    const a=r.pl[v.from],b=r.pl[id];
    if(!d.ok)return to(a,'arc:invr',{id:v.id,st:'declined',n:b.n});
    if(!a||!a.arc||!b.arc||pg[v.from]||pg[id])return to(a,'arc:invr',{id:v.id,st:'expired',n:b.n});
    mk(r,v.type,v.from,id,{bo:v.bo,level:'-'});
   });
   E('arc:move',d=>{
    const{id}=get(),g=games[pg[id]];if(!g||g.type!=='ttt'||g.o)return;
    const i=d.cell|0;if(i<0||i>8||g.b[i]||g.p[g.t==='X'?0:1]!==id)return;
    step(g,i);send(g);
    if(!g.o&&g.p[g.t==='X'?0:1]==='bot')setTimeout(()=>{if(games[g.id]&&!g.o){step(g,tbot(g.b,g.t,g.lv));send(g)}},500);
   });
   E('arc:pick',d=>{
    const{id}=get(),g=games[pg[id]];if(!g||g.type!=='rps'||g.o!==null)return;
    const i=g.p[0]===id?0:1;if(g.ch[i]||typeof d.c!=='string'||d.c.length!==1||!'rps'.includes(d.c))return;
    g.ch[i]=d.c;if(g.p[1]==='bot')g.ch[1]=rbot(g);
    if(g.ch[0]&&g.ch[1])resolve(g);
    send(g);
   });
   E('arc:mv',d=>{
    const{r,id}=get(),g=games[pg[id]];
    if(!g||g.type!=='2048'||g.o!==null||Date.now()>g.end+500||typeof d.d!=='string'||d.d.length!==1||!'lrud'.includes(d.d))return;
    const i=g.p[0]===id?0:1;
    if(G.move(g.e[i],d.d)){g.mv[i]+=d.d;const o=g.p[1-i];if(o!=='bot'&&r)to(r.pl[o],'arc:game',gv(g,o))}
    if(g.e.every(x=>!x||x.over))fin(g);
   });
   E('arc:quit',()=>{
    const{r,id}=get(),g=games[pg[id]];
    if(g){clearTimeout(g.tm);delete games[g.id];g.p.forEach(x=>{delete pg[x];if(x!==id&&x!=='bot'&&r){const p=r.pl[x];to(p,'arc:game',null);to(p,'arc:invr',{st:'left',n:r.pl[id].n})}})}
    s.emit('arc:game',null);
   });
  },
  resend(pid,s){const g=games[pg[pid]];if(g)s.emit('arc:game',gv(g,pid))}
 };
};

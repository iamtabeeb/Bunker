module.exports=(io,rooms,push)=>{
 const games={},pg={},L=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
 const win=b=>{for(const[a,c,d]of L)if(b[a]&&b[a]===b[c]&&b[a]===b[d])return b[a];return b.every(x=>x)?'d':null};
 const mm=(b,t,me)=>{const w=win(b);if(w)return w==='d'?0:w===me?1:-1;let best=t===me?-2:2;for(let i=0;i<9;i++)if(!b[i]){b[i]=t;const v=mm(b,t==='X'?'O':'X',me);b[i]=0;best=t===me?Math.max(best,v):Math.min(best,v)}return best};
 const bot=(b,me,lv)=>{
  const e=[0,1,2,3,4,5,6,7,8].filter(i=>!b[i]),op=me==='X'?'O':'X',rnd=()=>e[Math.floor(Math.random()*e.length)];
  const fin=s=>e.find(i=>{b[i]=s;const w=win(b)===s;b[i]=0;return w});
  if(lv==='easy')return rnd();
  if(lv==='normal'){const w=fin(me);if(w!==undefined)return w;const x=fin(op);if(x!==undefined)return x;return b[4]?rnd():4}
  let bi=e[0],bv=-2;for(const i of e){b[i]=me;const v=mm(b,op,me);b[i]=0;if(v>bv){bv=v;bi=i}}return bi};
 const gv=(g,pid)=>({id:g.id,board:g.b,you:g.p[0]===pid?'X':'O',turn:g.t,over:g.o,level:g.lv,vs:g.n[g.p[0]===pid?1:0]});
 const send=g=>{const r=rooms[g.room];if(!r)return;g.p.forEach(pid=>{const p=r.pl[pid];if(pid!=='bot'&&p&&p.sid)io.to(p.sid).emit('arc:game',gv(g,pid))})};
 const step=(g,i)=>{const sym=g.t;g.b[i]=sym;g.o=win(g.b);if(!g.o)g.t=sym==='X'?'O':'X'};
 return{
  attach(s,E,get){
   E('arc:enter',()=>{const{r,id}=get();if(r&&r.pl[id]){r.pl[id].arc=true;push(r)}});
   E('arc:back',()=>{const{r,id}=get();if(r&&r.pl[id]){r.pl[id].arc=false;push(r)}});
   E('arc:bot',d=>{
    const{r,id}=get(),p=r&&r.pl[id];if(!p||pg[id])return;
    const g={id:Math.random().toString(36).slice(2,9),room:r.code,p:[id,'bot'],n:[p.n,'Bot'],b:Array(9).fill(0),t:'X',o:null,lv:['easy','normal','hard'].includes(d.level)?d.level:'easy'};
    games[g.id]=g;pg[id]=g.id;send(g);
   });
   E('arc:move',d=>{
    const{id}=get(),g=games[pg[id]];if(!g||g.o)return;
    const i=d.cell|0;if(i<0||i>8||g.b[i]||g.p[g.t==='X'?0:1]!==id)return;
    step(g,i);send(g);
    if(!g.o&&g.p[g.t==='X'?0:1]==='bot')setTimeout(()=>{if(games[g.id]&&!g.o){step(g,bot(g.b,g.t,g.lv));send(g)}},500);
   });
   E('arc:quit',()=>{
    const{id}=get(),g=games[pg[id]];
    if(g){delete games[g.id];g.p.forEach(x=>delete pg[x])}
    s.emit('arc:game',null);
   });
  },
  resend(pid,s){const g=games[pg[pid]];if(g)s.emit('arc:game',gv(g,pid))}
 };
};

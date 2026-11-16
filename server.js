const express=require('express'),http=require('http'),{Server}=require('socket.io'),C=require('./cards');
const app=express();app.use(express.static(__dirname+'/public'));
const srv=http.createServer(app),io=new Server(srv),rooms={};
const now=()=>Date.now(),shuf=a=>[...a].sort(()=>Math.random()-.5);
const al=r=>Object.keys(r.pl).filter(i=>r.pl[i].al),nc=p=>Object.keys(p.cards).length;
const can=(r,id)=>{const p=r.pl[id];return !!p&&p.al&&p.p&&(r.phase==='reveal'?nc(p)<r.round:r.phase==='tie'&&r.cand.includes(id)&&p.tx!==r.round&&nc(p)<6)};
const ghost=(r,id)=>r.phase!=='lobby'&&r.phase!=='end'&&!(r.pl[id]&&r.pl[id].al);

const where={};
const voices=new Map(),VMAX=500*1024;
const vevict=id=>{const v=voices.get(id);if(v){v.m.gone=true;voices.delete(id)}};
const vtrim=r=>{const mine=[...voices].filter(([,v])=>v.room===r.code);while(mine.length>15)vevict(mine.shift()[0]);let tot=0;for(const[,v]of voices)tot+=v.b.length;for(const[id]of voices){if(tot<=120e6)break;tot-=voices.get(id).b.length;vevict(id)}};
app.get('/v/:id',(q,res)=>{
 const v=voices.get(q.params.id);if(!v)return res.sendStatus(404);
 const b=v.b,m=/bytes=(\d*)-(\d*)/.exec(q.headers.range||'');let a=0,e=b.length-1;
 if(m){a=m[1]?+m[1]:0;e=m[2]?Math.min(+m[2],b.length-1):e;if(a>e)return res.sendStatus(416);res.status(206).set('Content-Range','bytes '+a+'-'+e+'/'+b.length)}
 res.set({'Content-Type':'audio/wav','Accept-Ranges':'bytes','Content-Length':e-a+1,'Cache-Control':'private, max-age=3600','X-Content-Type-Options':'nosniff'});
 res.end(b.subarray(a,e+1));
});
const open=m=>Object.values(rooms).filter(r=>r.pub&&r.phase==='lobby'&&Object.keys(r.pl).length<20&&(!m||r.mode===m));
const view=(r,id)=>{const m=r.pl[id];return{code:r.code,host:r.host,pk:r.pk,mode:r.mode,pub:r.pub,auto:r.auto,hostName:(r.pl[r.host]||{}).n||'',ts:r.ts,phase:r.phase,round:r.round,plan:r.plan,sc:r.sc,bk:r.bk,out:r.out,cand:r.cand,need:r.need,end:r.end,srv:now(),can:can(r,id),
 hand:m&&m.p&&r.phase!=='lobby'?m.hand:null,
 players:Object.entries(r.pl).map(([i,p])=>({id:i,n:p.n,a:p.a,p:p.p,al:p.al,cards:p.cards,vt:p.vt,rd:p.rd,arc:p.arc})),
 chat:r.chat.filter(x=>x.c==='main'||ghost(r,id))}};
const push=r=>{r.t=now();for(const i in r.pl){const p=r.pl[i];if(p.sid)io.to(p.sid).emit('state',view(r,i))}};
const go=(r,ph,sec,x)=>Object.assign(r,{phase:ph,end:sec?now()+sec*1000:0},x);
const drop=(q,id)=>{delete where[id];delete q.pl[id];if(q.host===id){const n=Object.keys(q.pl)[0];if(n)q.host=n}if(!Object.keys(q.pl).length)delete rooms[q.code];else push(q)};

const reveal=(r,id,c)=>{const p=r.pl[id];if(!can(r,id)||!p.hand[c]||p.cards[c])return;p.cards[c]=p.hand[c];if(r.phase==='tie')p.tx=r.round};
const auto=(r,id)=>{const p=r.pl[id],k=C.CATS.map(x=>x[0]).filter(x=>!p.cards[x]);if(k.length)reveal(r,id,C.pick(k))};
const vote=(r,sec)=>{al(r).forEach(i=>r.pl[i].vt=null);go(r,'vote',sec)};

const start=r=>{
 const ids=Object.keys(r.pl).filter(i=>r.pl[i].p),N=ids.length,K=r.pk;
 if(N<3)return 'Kamida 3 o‘yinchi kerak';
 if(K<1||K>=N)return 'Bunker joylari o‘yinchilar sonidan kam bo‘lishi kerak';
 const E=N-K,Rn=Math.min(6,E),b=Math.floor(E/Rn),x=E%Rn,pools={};
 C.CATS.forEach(([c])=>pools[c]=shuf(C.P[c].filter(x=>r.mode==='adult'||!C.ADULT.includes(x))));
 ids.forEach((i,n)=>{const p=r.pl[i];p.cards={};p.vt=null;p.hand={};C.CATS.forEach(([c])=>p.hand[c]=pools[c][n%pools[c].length])});
 go(r,'reveal',r.ts[0],{plan:Array.from({length:Rn},(_,i)=>b+(i<x?1:0)),sc:C.pick(C.SC),bk:C.mkB(),round:1,out:[],cand:null,need:null,tb:0});
};
const tally=r=>{
 const cand=r.cand||al(r),cnt={};cand.forEach(i=>cnt[i]=0);
 al(r).forEach(i=>{const v=r.pl[i].vt;if(v in cnt)cnt[v]++});
 const s=[...cand].sort((a,b)=>cnt[b]-cnt[a]),need=Math.min(r.need??r.plan[r.round-1],s.length);
 let die=s.slice(0,need);
 if(need<s.length&&cnt[s[need-1]]===cnt[s[need]]){
  const t=cnt[s[need-1]],grp=s.filter(i=>cnt[i]===t),sure=s.filter(i=>cnt[i]>t),m=need-sure.length;
  if(!r.tb){sure.forEach(i=>{r.pl[i].al=false;r.pl[i].vt=null});return go(r,'tie',r.ts[0],{out:[...r.out,...sure],cand:grp,need:m,tb:1})}
  die=[...sure,...shuf(grp).slice(0,m)];
 }
 die.forEach(i=>r.pl[i].al=false);
 go(r,'result',12,{out:[...r.out,...die],cand:null,need:null,tb:0});
};
const adv=r=>{
 const[tr,td,tv]=r.ts,ph=r.phase;
 if(ph==='reveal'){for(const i in r.pl)if(can(r,i))auto(r,i);go(r,'discuss',td)}
 else if(ph==='tie'){for(const i of r.cand)if(can(r,i))auto(r,i);vote(r,tv)}
 else if(ph==='discuss')vote(r,tv);
 else if(ph==='vote')tally(r);
 else if(ph==='result'){
  if(al(r).length<=r.pk||r.round>=r.plan.length)go(r,'end',0);
  else{for(const i in r.pl)r.pl[i].vt=null;go(r,'reveal',tr,{round:r.round+1,out:[],cand:null,need:null,tb:0})}
 }
 push(r);
};

const ARC=require('./arcade')(io,rooms,push);
io.on('connection',s=>{
 let r=null,id=null,lv=0;
 const E=(ev,f)=>s.on(ev,(d,cb)=>{cb=typeof cb==='function'?cb:()=>{};try{f(d==null?{}:d,cb)}catch(e){cb({err:'Xatolik'})}});
 ARC.attach(s,E,()=>({r,id}));
 E('join',(d,cb)=>{
  const pid=String(d.pid||'').slice(0,12);if(!pid)return cb({err:'Xatolik'});
  const old=where[pid],oq=old&&rooms[old]&&rooms[old].pl[pid]?rooms[old]:null,mode=d.mode==='adult'?'adult':'normal';
  if(oq&&oq.phase!=='lobby'&&!d.re&&String(d.code||'').toUpperCase()!==oq.code)return cb({err:'Siz boshqa xonada o‘ynayapsiz. Avval undan chiqing.'});
  let q;
  if(d.create||(d.quick&&!open(mode).length)){
   if(mode==='adult'&&!d.adultOk)return cb({err:'18+ xona uchun yosh va rozilikni tasdiqlang'});
   if(Object.keys(rooms).length>2000)return cb({err:'Serverda joy qolmadi, birozdan keyin urinib ko‘ring'});
   let c;do c=Array.from({length:5},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[C.rnd(0,31)]).join('');while(rooms[c]);
   q=rooms[c]={code:c,host:pid,mode,pub:!!d.quick,pkm:false,auto:0,pk:3,ts:[30,120,45],phase:'lobby',round:0,plan:null,sc:null,bk:null,out:[],cand:null,need:null,tb:0,end:0,pl:{},chat:[],t:now()};
  }else{
   q=d.quick?open(mode).sort((a,b)=>Object.keys(b.pl).length-Object.keys(a.pl).length)[0]:rooms[String(d.code||'').toUpperCase()];
   if(!q)return cb({err:'Xona topilmadi'});
   if(q.mode==='adult'&&!d.adultOk&&!(d.re&&q.pl[pid]))return cb({err:'Bu 18+ xona',adult:true});
  }
  if(oq&&oq!==q&&oq.phase==='lobby')drop(oq,pid);
  let p=q.pl[pid];
  if(!p){
   if(q.phase!=='lobby')return cb({err:'O‘yin allaqachon boshlangan'});
   if(Object.keys(q.pl).length>=20)return cb({err:'Xona to‘la (20 kishi)'});
   p=q.pl[pid]={n:'',a:'😎',p:true,al:true,cards:{},hand:{},vt:null,sid:null};
  }
  if(!d.re||!p.n){p.n=String(d.name||'Mehmon').trim().slice(0,14)||'Mehmon';p.a=String(d.avatar||'😎').slice(0,8)}
  r=q;id=pid;where[pid]=q.code;p.sid=s.id;cb({code:q.code});push(q);ARC.resend(pid,s);
 });
 E('set',d=>{
  if(!r||r.phase!=='lobby'||r.host!==id)return;
  if(d.pk){r.pk=Math.max(1,Math.min(19,d.pk|0));r.pkm=true}
  if('pub' in d){r.pub=!!d.pub;if(!r.pub)r.auto=0}
  if(Array.isArray(d.ts))r.ts=d.ts.slice(0,3).map(x=>Math.max(5,Math.min(600,x|0||30)));
  if('play' in d){const p=r.pl[id];p.p=!!d.play;p.al=!!d.play}
  push(r);
 });
 E('start',(d,cb)=>{if(!r||r.host!==id||r.phase!=='lobby')return;const e=start(r);if(e)return cb({err:e});push(r)});
 E('ready',d=>{if(!r||r.phase!=='lobby'||!r.pl[id])return;r.pl[id].rd=!!d;push(r)});
 E('reveal',d=>{if(!r||!r.pl[id])return;reveal(r,id,d);push(r)});
 E('vote',d=>{
  if(!r||r.phase!=='vote')return;
  const p=r.pl[id],t=typeof d==='string'?d:null;
  if(!p||!p.al||(t&&!(r.cand||al(r)).includes(t)))return;
  p.vt=t;push(r);
 });
 E('skip',()=>{if(r&&r.host===id&&r.phase!=='lobby'&&r.phase!=='end')adv(r)});
 E('chat',d=>{
  if(!r||!r.pl[id])return;
  const p=r.pl[id],x=String(d.x||'').trim().slice(0,200),g=ghost(r,id);
  if(!x||(d.c==='ghost'?!g:g))return;
  r.chat.push({c:g?'ghost':'main',n:p.n,a:p.a,x,t:now()});if(r.chat.length>100)r.chat.shift();push(r);
 });
 E('rooms',(d,cb)=>cb({list:open().map(r=>({code:r.code,mode:r.mode,host:(r.pl[r.host]||{}).n||'',n:Object.keys(r.pl).length}))}));
 E('voice',(d,cb)=>{
  if(!r||!r.pl[id])return;
  const p=r.pl[id],g=ghost(r,id),b=d.buf;
  if(d.c==='ghost'?!g:g)return cb({err:'Bu kanalda yozib bo‘lmaydi'});
  if(!Buffer.isBuffer(b)||b.length<1000||b.length>VMAX||b.toString('latin1',0,4)!=='RIFF'||b.toString('latin1',8,12)!=='WAVE')return cb({err:'Ovoz fayli noto‘g‘ri yoki juda katta'});
  if(now()-lv<2000)return cb({err:'Juda tez yuboryapsiz, biroz kuting'});
  lv=now();
  const vid=Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2),m={c:g?'ghost':'main',n:p.n,a:p.a,x:'',vid,dur:Math.max(1,Math.min(20,d.dur|0)),t:now()};
  voices.set(vid,{b,room:r.code,t:now(),m});
  r.chat.push(m);if(r.chat.length>100)r.chat.shift();
  vtrim(r);push(r);cb({ok:1});
 });
 E('leave',()=>{
  if(!r)return;const q=r;r=null;s.emit('gone');
  if(q.phase==='lobby')drop(q,id);else{delete where[id];if(q.pl[id])q.pl[id].sid=null}
 });
 s.on('disconnect',()=>{
  if(!r||!r.pl[id])return;const q=r,pid=id;q.pl[pid].sid=null;
  setTimeout(()=>{const p=q.pl[pid];if(p&&!p.sid&&q.phase==='lobby')drop(q,pid)},30000);
 });
});

setInterval(()=>{
 for(const[vi,v]of voices)if(now()-v.t>864e5||!rooms[v.room])vevict(vi);
 for(const c in rooms){
  const r=rooms[c];
  if(now()-r.t>3*3600e3&&!Object.values(r.pl).some(p=>p.sid)){delete rooms[c];continue}
  if(r.pub&&r.phase==='lobby'){
   const n=Object.values(r.pl).filter(p=>p.p).length;
   if(n>=6&&!r.auto){r.auto=now()+30000;push(r)}
   else if(n<6&&r.auto){r.auto=0;push(r)}
   else if(r.auto&&now()>=r.auto){if(!r.pkm||r.pk>=n)r.pk=Math.max(1,n>>1);r.auto=0;start(r);push(r)}
  }
  if(r.end&&now()>=r.end)adv(r);
  else if(r.phase==='reveal'&&!Object.keys(r.pl).some(i=>can(r,i)))adv(r);
  else if(r.phase==='tie'&&!r.cand.some(i=>can(r,i)))adv(r);
 }
},1000);

srv.listen(process.env.PORT||3000,()=>console.log('BUNKER server ishga tushdi'));


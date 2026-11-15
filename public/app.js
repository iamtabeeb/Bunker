const $=s=>document.querySelector(s);
const h=(t,a,...c)=>{const e=document.createElement(t);for(const k in a||{}){const v=a[k];if(k[0]==='o'&&k[1]==='n')e[k]=v;else if(k==='class')e.className=v;else if(v!==false&&v!=null)e.setAttribute(k,v)}c.flat(9).forEach(x=>{if(x!=null&&x!==false)e.append(x.nodeType?x:String(x))});return e};
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[rnd(0,a.length-1)];
const sv={},ST={get(k){try{return localStorage.getItem(k)}catch(e){return sv[k]}},set(k,v){try{localStorage.setItem(k,v)}catch(e){sv[k]=v}}};
const CATS=[["kasb","Kasb"],["gen","Genetika"],["sog","Sog‘liq"],["bag","Bagaj"],["xar","Xarakter"],["fob","Fobiya"]],LB=Object.fromEntries(CATS);
const AV=["😎","🧔","👩","🧓","👨‍⚕️","🥷","🧙","🤠","👷","🕵️","🧑‍🚀","🦊"];
const PH={reveal:'Karta ochish',discuss:'Muhokama',vote:'Ovoz berish',tie:'Teng ovoz',result:'Natija',end:'Yakun'};
let db=1,code,room=null,pl={},ch=[],tab='main',hand=null,err='',S=null,skew=0,pend=null,nm=ST.get('bk_n')||'',av0=ST.get('bk_a')||'😎';
let uid=ST.get('bk_uid');if(!uid){uid=Math.random().toString(36).slice(2,10);ST.set('bk_uid',uid)}
const socket=io();
const mp=()=>pl[uid],alive=()=>Object.keys(pl).filter(i=>pl[i].al),playing=()=>Object.keys(pl).filter(i=>pl[i].p),isHost=()=>room&&room.host===uid,nc=p=>Object.keys(p.cards||{}).length;
const canRev=()=>S&&S.can,fail=m=>{err=m;render()};
const em=(e,d)=>socket.emit(e,d,r=>{if(r&&r.err)fail(r.err)});
const R=()=>({update:x=>em('set',x)}),PL=()=>({update:x=>'vt' in x?em('vote',x.vt):em('set',{play:x.p})});
const ack=r=>{if(r&&r.err)fail(r.err);else{err='';ST.set('bk_c',r.code)}};
const askAdult=f=>{pend=f;render()};
const create=m=>{if(!nm.trim())return fail('Avval ismingizni yozing');const go=ok=>socket.emit('join',{create:1,mode:m,adultOk:ok,pid:uid,name:nm,avatar:av0},ack);m==='adult'?askAdult(()=>go(true)):go(false)};
const join=(c,ok)=>{if(!nm.trim())return fail('Avval ismingizni yozing');if(c.length<5)return fail('Xona kodini kiriting');socket.emit('join',{code:c,adultOk:ok,pid:uid,name:nm,avatar:av0},r=>{if(r&&r.adult)askAdult(()=>join(c,true));else ack(r)})};
const start=()=>{err='';em('start')},rev=k=>em('reveal',k),adv=()=>em('skip');
const leave=()=>{S=room=null;pl={};ch=[];hand=null;code=null;ST.set('bk_c','');render()};
const bye=()=>{socket.emit('leave');leave()};
socket.on('state',s=>{S=s;skew=s.srv-Date.now();room=s;room.phaseEnd=s.end?s.end-skew:0;pl=Object.fromEntries(s.players.map(p=>[p.id,p]));hand=s.hand;ch=s.chat;code=s.code;render()});
socket.on('gone',leave);
socket.on('connect',()=>{const c=ST.get('bk_c');if(c)socket.emit('join',{code:c,pid:uid,name:nm,avatar:av0,re:1},r=>{if(r&&r.err)leave()})});
setInterval(()=>{if(!room)return;const l=room.phaseEnd?Math.max(0,Math.ceil((room.phaseEnd-Date.now())/1000)):0;$('#tm').textContent=PH[room.phase]?PH[room.phase]+(l?' · '+l+' s':''):''},1000);
const gateV=()=>h('div',{class:'c'},h('h2',{style:'margin:0 0 6px'},'🔞 18+ ogohlantirish'),h('p',{},'Bu o‘yinda qorong‘i va kattalar uchun mavzular bor: kasalliklar, jinoyat, jinsiy mavzular, fobiyalar. Faqat 18 yoshdan oshganlar uchun.'),h('button',{onclick:()=>{ST.set('bk_18','1');ok18=1;render()}},'Men 18 yoshdaman'));
function homeV(){
 const ci=h('input',{placeholder:'Xona kodi',maxlength:5,style:'text-transform:uppercase'});
 return h('div',{},
  h('div',{class:'c'},h('b',{},'Ismingiz va avatar'),
   h('input',{value:nm,maxlength:14,placeholder:'Ism',style:'margin-top:6px',oninput:e=>{nm=e.target.value;ST.set('bk_n',nm)}}),
   h('div',{class:'row',style:'margin-top:8px'},AV.map(a=>h('span',{class:'av'+(a===av0?' sel':''),onclick:()=>{av0=a;ST.set('bk_a',a);render()}},a)))),
  h('div',{class:'c'},h('div',{class:'row'},h('button',{onclick:()=>create('normal')},'Oddiy xona yaratish'),h('button',{class:'g',onclick:()=>create('adult')},'🔞 18+ xona yaratish')),
   h('div',{class:'row',style:'margin-top:10px'},ci,h('button',{class:'g',onclick:()=>join(ci.value.trim().toUpperCase()),disabled:!db},'Kirish'))),
  err&&h('div',{class:'c',style:'color:var(--rd)'},err));
}
const sett=(i,v)=>{const t=[...room.ts];t[i]=v;return R().update({ts:t})};
const num=(l,val,cb)=>h('label',{class:'mu',style:'flex:1;min-width:100px'},l,h('input',{type:'number',min:1,value:val,disabled:!isHost(),onchange:e=>cb(Math.max(1,+e.target.value||1))}));
const RULES=['Maqsad: apokalipsisdan keyin bunkerda joy olish. Joylar cheklangan, kim kirishini ovoz berish hal qiladi.','Bunker joylari sonini xona egasi belgilaydi. Raundlar soni (6 tagacha) va har raundda necha kishi chiqishi avtomatik hisoblanadi.','Boshida har o‘yinchiga 6 ta yopiq karta beriladi: kasb, genetika, sog‘liq, bagaj, xarakter, fobiya. Senariy va bunker tavsifi tasodifiy.','Har raundda har o‘yinchi o‘zi xohlagan 1 ta kartani ochadi. Vaqt tugasa, tasodifiy karta ochiladi.','Keyin muhokama: ochilgan kartalar haqida chatda gaplashasiz.','Ovoz berish ochiq, o‘zingizga ham ovoz berish mumkin, vaqt tugaguncha ovozni o‘zgartirsa bo‘ladi.','Eng ko‘p ovoz olgan o‘yinchi(lar) bunkerdan chiqariladi.','Ovozlar teng bo‘lsa, teng bo‘lganlar yana bittadan karta ochadi va qayta ovoz beriladi. Yana teng bo‘lsa, tasodifiy tanlanadi.','Bunkerdagi joylar soniga teng o‘yinchi qolganda o‘yin tugaydi, qolganlar g‘olib. Chiqarilganlar “Arvohlar” chatida yoza oladi.'];
function adultV(){
 const b=h('button',{disabled:true,onclick:()=>{const f=pend;pend=null;f()}},'Davom etish');
 return h('div',{class:'c'},h('h2',{style:'margin:0 0 6px'},'🔞 18+ rejim'),h('p',{},'Bu xonada kasalliklar, jinsiy mavzular va fobiyalar kabi kattalar uchun kartalar bor. Faqat 18 yoshdan oshganlar kirishi mumkin.'),
  h('label',{style:'display:block;margin:8px 0'},h('input',{type:'checkbox',onchange:e=>{b.disabled=!e.target.checked}}),' Men 18 yoshdan kattaman va 18+ rejimga roziman'),b,' ',h('button',{class:'g',onclick:()=>{pend=null;render()}},'Bekor qilish'));
}
function lobby(){
 const n=playing().length,rd=playing().filter(i=>pl[i].rd).length,m=mp();
 return h('div',{},
  h('div',{class:'c'},h('div',{class:'mu'},'Xona kodi, do‘stlaringizga yuboring'),h('div',{class:'code'},code),
   h('div',{class:'mu'},`Xona egasi: ${room.hostName} · Holat: kutish jarayonida · ${n} / 20 o‘yinchi`),
   h('div',{style:'margin-top:6px'},room.mode==='adult'?'🔞 18+ rejim: kasalliklar, jinsiy mavzular va fobiyalar kartalari ishlatiladi.':'Oddiy rejim: 18+ kartalarsiz.')),
  h('div',{class:'c'},h('b',{},'Vaqt va sozlamalar'),
   h('div',{class:'row',style:'margin-top:6px'},num('Bunker joylari',room.pk,v=>R().update({pk:v})),num('Karta ochish (s)',room.ts[0],v=>sett(0,v)),num('Muhokama (s)',room.ts[1],v=>sett(1,v)),num('Ovoz berish (s)',room.ts[2],v=>sett(2,v))),
   isHost()&&h('label',{class:'mu',style:'display:block;margin-top:8px'},h('input',{type:'checkbox',checked:m&&m.p,onchange:e=>PL(uid).update({p:e.target.checked,al:e.target.checked})}),' Men ham o‘ynayman')),
  h('details',{class:'c',open:true},h('summary',{},h('b',{},'Qoidalar')),h('ol',{style:'padding-left:18px;margin:6px 0'},RULES.map(x=>h('li',{},x)))),
  h('div',{class:'c'},h('div',{class:'mu',style:'margin-bottom:8px'},`Tayyor: ${rd} / ${n}`),
   m&&m.p&&h('button',{class:m.rd?'g':'',style:'margin-right:8px',onclick:()=>em('ready',!m.rd)},m.rd?'Tayyor emasman':'Tayyorman'),
   isHost()?h('button',{onclick:start},'O‘yinni boshlash'):h('span',{class:'mu'},'Xona egasi boshlashini kuting...')));
}
function info(){
 const b=room.bk;
 return h('div',{class:'c'},h('b',{},'Apokalipsis: '+room.sc+(room.mode==='adult'?' · 🔞 18+':'')),
  h('div',{class:'mu'},`🏚️ Bunker: ${b.m2} m², zaxira ${b.oy} oyga yetadi, jihozlar: ${b.jh.join(', ')}. Tashqarida xavf ${b.yil} yil davom etadi.`),
  h('div',{class:'mu'},`Raund ${room.round}/${room.plan.length} · bunkerda ${room.pk} joy · bu raundda ${room.need??room.plan[room.round-1]} kishi chiqariladi`),
  isHost()&&room.phase!=='end'&&h('button',{class:'g',style:'margin-top:8px',onclick:adv},'Keyingi bosqichga o‘tish'));
}
function players(){
 const ph=room.phase,m=mp(),vt=ph==='vote'&&m&&m.al;
 return h('div',{class:'c'},h('b',{},'O‘yinchilar'),Object.keys(pl).filter(i=>pl[i].p).map(i=>{
  const p=pl[i],can=vt&&p.al&&(!room.cand||room.cand.includes(i)),vs=Object.keys(pl).filter(j=>pl[j].vt===i);
  return h('div',{class:'p'+(p.al||ph==='lobby'?'':' out')},h('span',{class:'av'},p.a),
   h('div',{style:'flex:1'},h('div',{},p.n+(i===room.host?' 👑':'')+(i===uid?' (siz)':'')+(ph==='lobby'?(p.rd?' ✅':' ⏳'):'')+(p.al||ph==='lobby'?'':' ❌')),
    h('div',{},Object.entries(p.cards||{}).map(([k,v])=>h('span',{class:'chip'},LB[k]+': '+v))),
    vs.length>0&&['vote','tie','result'].includes(ph)&&h('div',{class:'mu'},'Ovoz berganlar: '+vs.map(j=>pl[j].a+' '+pl[j].n).join(', '))),
   can&&h('button',{class:m.vt===i?'':'g',onclick:()=>PL(uid).update({vt:i})},m.vt===i?'Tanlandi':'Ovoz'))}));
}
function handV(){
 const m=mp(),can=canRev(m);
 return h('div',{class:'c'},h('b',{},'Sizning kartalaringiz (boshqalar ko‘rmaydi)'),
  CATS.map(([k,l])=>h('div',{class:'hand'},h('div',{},h('span',{class:'mu'},l+': '),hand[k]),m.cards[k]?h('span',{class:'mu'},'Ochilgan'):h('button',{disabled:!can,onclick:()=>rev(k)},'Ochish'))),
  can&&h('div',{class:'mu',style:'margin-top:6px'},room.phase==='tie'?'Ovozlar teng: yana bitta karta oching':'Shu raundda bitta karta oching'));
}
function roomV(){
 const m=mp(),ph=room.phase,v=h('div');
 if(err)v.append(h('div',{class:'c',style:'color:var(--rd)'},err));
 v.append(ph==='lobby'?lobby():info());
 if(ph==='tie')v.append(h('div',{class:'c'},'⚖️ Ovozlar teng: '+room.cand.map(i=>pl[i].a+' '+pl[i].n).join(', ')+'. Ular yana bittadan karta ochadi, keyin qayta ovoz beriladi.'));
 if(ph==='result')v.append(h('div',{class:'c'},h('b',{},'Bunkerdan chiqarildi: '+(room.out.length?room.out.map(i=>pl[i].a+' '+pl[i].n).join(', '):'hech kim'))));
 if(ph==='end')v.append(h('div',{class:'c'},h('b',{},'🏚️ Bunkerga kirganlar'),alive().map(i=>h('div',{},pl[i].a+' '+pl[i].n))));
 v.append(players());
 if(hand&&m&&m.al&&ph!=='end'&&ph!=='lobby')v.append(handV());
 v.append(h('button',{class:'g',onclick:bye},ph==='end'?'Bosh sahifa':'Chiqish'));
 return v;
}
function render(){
 $('#scr').replaceChildren(pend?adultV():!room?homeV():roomV());
 $('#chat').hidden=!room;renderChat();
}
function renderChat(){
 if(!room)return;
 const m=mp(),g=room.phase!=='lobby'&&room.phase!=='end'&&(!m||!m.al);
 if(!g)tab='main';
 $('#tabs').replaceChildren(...[h('button',{class:tab==='main'?'':'g',onclick:()=>{tab='main';renderChat()}},'💬 Umumiy'),g&&h('button',{class:tab==='ghost'?'':'g',onclick:()=>{tab='ghost';renderChat()}},'👻 Arvohlar')].filter(Boolean));
 const box=$('#msgs'),atEnd=box.scrollTop+box.clientHeight>=box.scrollHeight-40;
 box.replaceChildren(...ch.filter(x=>x.c===tab).map(x=>h('div',{},h('span',{class:'mu'},x.a+' '+x.n+': '),x.x)));
 if(atEnd)box.scrollTop=box.scrollHeight;
 const w=tab==='ghost'?g:(room.phase==='lobby'||room.phase==='end'||(m&&m.al));
 $('#ci').disabled=!w;$('#cs').disabled=!w;
}
function send(){const i=$('#ci'),x=i.value.trim();if(!x||!room)return;i.value='';em('chat',{c:tab,x})}
$('#cs').onclick=send;$('#ci').onkeydown=e=>{if(e.key==='Enter')send()};
render();

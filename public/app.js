const $=s=>document.querySelector(s);
const h=(t,a,...c)=>{const e=document.createElement(t);for(const k in a||{}){const v=a[k];if(k[0]==='o'&&k[1]==='n')e[k]=v;else if(k==='class')e.className=v;else if(v!==false&&v!=null)e.setAttribute(k,v)}c.flat(9).forEach(x=>{if(x!=null&&x!==false)e.append(x.nodeType?x:String(x))});return e};
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[rnd(0,a.length-1)];
const sv={},ST={get(k){try{return localStorage.getItem(k)}catch(e){return sv[k]}},set(k,v){try{localStorage.setItem(k,v)}catch(e){sv[k]=v}}};
const CATS=[["kasb","Kasb"],["gen","Genetika"],["sog","Sog‘liq"],["bag","Bagaj"],["xar","Xarakter"],["fob","Fobiya"]],LB=Object.fromEntries(CATS);
const AV=["😎","🧔","👩","🧓","👨‍⚕️","🥷","🧙","🤠","👷","🕵️","🧑‍🚀","🦊"];
const PH={reveal:'Karta ochish',discuss:'Muhokama',vote:'Ovoz berish',tie:'Teng ovoz',result:'Natija',end:'Yakun'};
let db=1,code,room=null,pl={},ch=[],tab='main',hand=null,err='',S=null,skew=0,pend=null,view='room',ag=null,elim=0,elimSeen=false,inv=null,note='',pv=null,plist=[],bo=3,nm=ST.get('bk_n')||'',av0=ST.get('bk_a')||'😎';
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
let rl=[];
const rlV=()=>rl.length?rl.map(r=>h('div',{class:'row',style:'justify-content:space-between;padding:6px 0;border-top:1px solid var(--bd)'},h('span',{},(r.mode==='adult'?'🔞 ':'')+(r.host||'Xona')+' · '+r.n+' / 20'),h('button',{class:'g',onclick:()=>join(r.code)},'Kirish'))):[h('div',{class:'mu'},'Hozircha ochiq xona yo‘q')];
const loadRooms=()=>socket.emit('rooms',null,r=>{rl=(r&&r.list)||[];const x=$('#rl');if(x)x.replaceChildren(...rlV())});
setInterval(()=>{if(!room)loadRooms()},5000);
const quick=m=>{if(!nm.trim())return fail('Avval ismingizni yozing');const go=ok=>socket.emit('join',{quick:1,mode:m,adultOk:ok,pid:uid,name:nm,avatar:av0},ack);m==='adult'?askAdult(()=>go(true)):go(false)};
const start=()=>{err='';em('start')},rev=k=>em('reveal',k),adv=()=>em('skip');
const leave=()=>{view='room';ag=null;inv=null;note='';pv=null;elim=0;elimSeen=false;S=room=null;pl={};ch=[];hand=null;code=null;ST.set('bk_c','');render();loadRooms()};
const bye=()=>{socket.emit('leave');leave()};
socket.on('state',s=>{S=s;skew=s.srv-Date.now();room=s;room.phaseEnd=s.end?s.end-skew:0;pl=Object.fromEntries(s.players.map(p=>[p.id,p]));hand=s.hand;ch=s.chat;code=s.code;chkElim();render()});
socket.on('gone',leave);
socket.on('connect',()=>{loadRooms();const c=ST.get('bk_c');if(c)socket.emit('join',{code:c,pid:uid,name:nm,avatar:av0,re:1},r=>{if(r&&r.err)leave()})});
setInterval(()=>{if(!room)return;const l=room.phaseEnd?Math.max(0,Math.ceil((room.phaseEnd-Date.now())/1000)):0;$('#tm').textContent=room.phase==='lobby'&&room.auto?'Boshlanishiga '+Math.max(0,Math.ceil((room.auto-Date.now()-skew)/1000))+' s':PH[room.phase]?PH[room.phase]+(l?' · '+l+' s':''):''},1000);
const gateV=()=>h('div',{class:'c'},h('h2',{style:'margin:0 0 6px'},'🔞 18+ ogohlantirish'),h('p',{},'Bu o‘yinda qorong‘i va kattalar uchun mavzular bor: kasalliklar, jinoyat, jinsiy mavzular, fobiyalar. Faqat 18 yoshdan oshganlar uchun.'),h('button',{onclick:()=>{ST.set('bk_18','1');ok18=1;render()}},'Men 18 yoshdaman'));
function homeV(){
 const ci=h('input',{placeholder:'Xona kodi',maxlength:5,style:'text-transform:uppercase'});
 return h('div',{},
  h('div',{class:'c'},h('b',{},'Ismingiz va avatar'),
   h('input',{value:nm,maxlength:14,placeholder:'Ism',style:'margin-top:6px',oninput:e=>{nm=e.target.value;ST.set('bk_n',nm)}}),
   h('div',{class:'row',style:'margin-top:8px'},AV.map(a=>h('span',{class:'av'+(a===av0?' sel':''),onclick:()=>{av0=a;ST.set('bk_a',a);render()}},a)))),
  h('div',{class:'c'},h('b',{},'⚡ Tezkor o‘yin'),h('div',{class:'row',style:'margin:6px 0'},h('button',{onclick:()=>quick('normal')},'Oddiy'),h('button',{class:'g',onclick:()=>quick('adult')},'🔞 18+')),h('div',{class:'mu',style:'margin-top:8px'},'Ochiq xonalar'),h('div',{id:'rl'},rlV())),
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
   isHost()&&h('label',{class:'mu',style:'display:block;margin-top:8px'},h('input',{type:'checkbox',checked:room.pub,onchange:e=>R().update({pub:e.target.checked})}),' Ochiq xona (tezkor o‘yinda ko‘rinadi, 6 kishi to‘lsa o‘zi boshlanadi)'),
   isHost()&&h('label',{class:'mu',style:'display:block;margin-top:8px'},h('input',{type:'checkbox',checked:m&&m.p,onchange:e=>PL(uid).update({p:e.target.checked,al:e.target.checked})}),' Men ham o‘ynayman')),
  h('details',{class:'c',open:true},h('summary',{},h('b',{},'Qoidalar')),h('ol',{style:'padding-left:18px;margin:6px 0'},RULES.map(x=>h('li',{},x)))),
  h('div',{class:'c'},h('div',{class:'mu',style:'margin-bottom:8px'},`Tayyor: ${rd} / ${n}`),
   m&&m.p&&h('button',{class:m.rd?'g':'',style:'margin-right:8px',onclick:()=>em('ready',!m.rd)},m.rd?'Tayyor emasman':'Tayyorman'),
   isHost()?h('button',{onclick:start},'O‘yinni boshlash'):h('span',{class:'mu'},'Xona egasi boshlashini kuting...')));
}
socket.on('arc:game',g=>{ag=g;sync48();if(g){note='';err=''}render()});
function chkElim(){const m=mp();if(!room||room.phase==='lobby'){elimSeen=false;return}if(m&&m.p&&!m.al&&room.phase!=='end'&&!elimSeen){elimSeen=true;elim=1}}
const elimV=()=>h('div',{class:'c'},h('b',{},'Siz o‘yindan chiqdingiz!'),h('div',{style:'margin:6px 0'},'Mini-o‘yinlarga o‘tasizmi?'),h('button',{onclick:()=>{elim=0;view='arcade';em('arc:enter');render()}},'Mini-o‘yinlarga o‘tish'),' ',h('button',{class:'g',onclick:()=>{elim=0;render()}},'Xonada qolish'));
socket.on('arc:inv',v=>{inv=v;render()});
socket.on('arc:invr',v=>{note=v.st==='declined'?v.n+' taklifni rad etdi':v.st==='expired'?'Taklif muddati tugadi':v.n+' o‘yindan chiqdi';if(inv&&(v.st==='expired'&&v.id===inv.id))inv=null;render()});
const loadP=()=>socket.emit('arc:list',null,r=>{plist=(r&&r.list)||[];render()});
setInterval(()=>{if(view==='arcade'&&pv&&!ag)loadP()},4000);
const sendInv=(to,type)=>socket.emit('arc:invite',{to,type,bo},r=>{if(r&&r.err)fail(r.err);else{err='';note='Taklif yuborildi, javob kutilmoqda...';render()}});
const GN={ttt:'X va O',rps:'Tosh-Qaychi-Qog‘oz','2048':'2048'};
const gcard=(type,title,desc)=>h('div',{class:'c'},h('b',{},title),h('div',{class:'mu',style:'margin:4px 0 8px'},desc),
 type==='rps'&&h('div',{class:'row',style:'margin-bottom:8px'},h('span',{class:'mu'},'Raundlar:'),[3,5].map(n=>h('button',{class:bo===n?'':'g',onclick:()=>{bo=n;render()}},String(n)))),
 h('div',{class:'mu'},'Bot bilan:'),
 h('div',{class:'row',style:'margin:6px 0'},['easy','normal','hard'].map(l=>h('button',{class:'g',onclick:()=>{err='';em('arc:bot',{type,level:l,bo})}},{easy:'Easy',normal:'Normal',hard:'Hard'}[l]))),
 h('button',{onclick:()=>{pv=pv===type?null:type;if(pv)loadP();else render()}},'👥 Do‘st bilan'),
 pv===type&&h('div',{style:'margin-top:8px'},plist.length?plist.map(p=>h('div',{class:'row',style:'justify-content:space-between;padding:6px 0;border-top:1px solid var(--bd)'},h('span',{},p.a+' '+p.n),h('button',{class:'g',onclick:()=>sendInv(p.id,type)},'Taklif yuborish'))):h('div',{class:'mu'},'Hozir arkadada boshqa o‘yinchi yo‘q')));
function arcV(){
 const back=()=>{view='room';em('arc:back');render()};
 return h('div',{},
  h('div',{class:'c'},h('button',{onclick:back},'↩ Asosiy xonaga qaytish'),h('div',{class:'mu',style:'margin-top:6px'},room.phase==='end'?'Asosiy o‘yin yakunlandi.':'Asosiy o‘yin davom etmoqda: '+(PH[room.phase]||''))),
  room.phase==='end'&&h('div',{class:'c'},h('b',{},'Asosiy o‘yin yakunlandi!'),h('div',{style:'margin-top:8px'},h('button',{onclick:back},'Natijalarni ko‘rish'),' ',h('button',{class:'g',onclick:back},'Xonaga qaytish'))),
  inv&&h('div',{class:'c'},h('b',{},inv.from+' sizni '+GN[inv.type]+' o‘ynashga taklif qilmoqda'),h('div',{style:'margin-top:8px'},h('button',{onclick:()=>{socket.emit('arc:reply',{id:inv.id,ok:true});inv=null;render()}},'Qabul qilish'),' ',h('button',{class:'g',onclick:()=>{socket.emit('arc:reply',{id:inv.id,ok:false});inv=null;render()}},'Rad etish'))),
  note&&h('div',{class:'c',onclick:()=>{note='';render()}},note),
  err&&h('div',{class:'c',style:'color:var(--rd)'},err),
  ag?gameV():[gcard('ttt','❌⭕ X va O','3×3 maydon. Bir qatorga uchta belgi qo‘ysangiz yutasiz.'),gcard('rps','🪨✂️📄 Tosh-Qaychi-Qog‘oz','Tosh qaychini, qaychi qog‘ozni, qog‘oz toshni yutadi.'),gcard('2048','🔢 2048','Plitkalarni suring, bir xil sonlarni qo‘shing. 3 daqiqa ichida ko‘proq ball to‘plang.')]);
}
function rpsV(){
 const g=ag,N={r:'🪨 Tosh',s:'✂️ Qaychi',p:'📄 Qog‘oz'},l=g.last;
 const st=g.over?(g.over==='d'?'Durang!':g.over==='you'?'Siz yutdingiz! 🎉':g.vs+' yutdi'):(g.picked?'Raqib tanlovini kutyapsiz...':'Tanlang');
 return h('div',{class:'c'},h('b',{},'Tosh-Qaychi-Qog‘oz · '+g.vs+(g.level==='-'?'':' ('+g.level+')')),
  h('div',{class:'mu',style:'margin:4px 0'},`${g.bo} raundli · Raund ${g.rd}/${g.bo} · Hisob: siz ${g.sc[0]} - ${g.sc[1]} ${g.vs}`),
  l&&h('div',{style:'margin:6px 0'},`Oxirgi raund: siz ${N[l.you]}, ${g.vs} ${N[l.opp]} → ${l.w==='d'?'durang':l.w==='you'?'siz yutdingiz':g.vs+' yutdi'}`),
  h('div',{style:'margin:6px 0'},st),
  !g.over&&h('div',{class:'row'},['r','s','p'].map(c=>h('button',{class:'g',disabled:g.picked,onclick:()=>em('arc:pick',{c})},N[c]))),
  h('div',{style:'margin-top:10px'},g.over&&g.level!=='-'&&h('button',{onclick:()=>{em('arc:quit');em('arc:bot',{type:'rps',level:g.level,bo:g.bo})}},'Qayta o‘ynash'),' ',h('button',{class:'g',onclick:()=>em('arc:quit')},'Chiqish')));
}
const G=window.G2048;let ge=null,gid48=null;
function sync48(){if(ag&&ag.type==='2048'){if(gid48!==ag.id){gid48=ag.id;ge=G.init(ag.seed);for(const c of ag.mv)G.move(ge,c)}}else{ge=null;gid48=null}}
function mv48(d){if(!ge||!ag||ag.over||ge.over||Date.now()+skew>=ag.end)return;if(G.move(ge,d)){socket.emit('arc:mv',{d});render()}}
addEventListener('keydown',e=>{const d={ArrowLeft:'l',ArrowRight:'r',ArrowUp:'u',ArrowDown:'d'}[e.key];if(d&&ag&&ag.type==='2048'&&view==='arcade'){e.preventDefault();mv48(d)}});
setInterval(()=>{const x=$('#t48');if(x&&ag&&ag.type==='2048'&&!ag.over)x.textContent=Math.max(0,Math.ceil((ag.end-Date.now()-skew)/1000))+' s'},500);
function g48V(){
 const g=ag;
 const st=g.over?(g.over==='d'?'Durang!':g.over==='you'?'Siz yutdingiz! 🎉':g.vs+' yutdi'):(ge.over?'Yurishlar tugadi, vaqt tugashini kuting':'Barmoq bilan suring (yoki klaviatura strelkalari)');
 const board=h('div',{style:'display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-width:300px;touch-action:none;user-select:none'},ge.b.map(v=>h('div',{style:`height:64px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${v>=1024?18:v>=128?22:26}px;background:${v?`hsl(${200-Math.log2(v)*14},45%,${62-Math.log2(v)*2.5}%)`:'var(--bg)'};color:#111;border:1px solid var(--bd)`},v||'')));
 let sx=0,sy=0;
 board.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
 board.addEventListener('touchend',e=>{const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;mv48(Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u'))});
 return h('div',{class:'c'},h('b',{},'2048 · '+g.vs+(g.level==='-'?'':' ('+g.level+')')),
  h('div',{class:'mu',style:'margin:4px 0'},'Vaqt: ',h('span',{id:'t48'},Math.max(0,Math.ceil((g.end-Date.now()-skew)/1000))+' s')),
  h('div',{style:'margin:4px 0'},`Ballingiz: ${ge.s} · ${g.oppBot?'Bot balli (maqsad)':g.vs+' balli'}: ${g.opp}`),
  h('div',{style:'margin:6px 0'},st),board,
  h('div',{style:'margin-top:10px'},g.over&&g.level!=='-'&&h('button',{onclick:()=>{em('arc:quit');em('arc:bot',{type:'2048',level:g.level})}},'Qayta o‘ynash'),' ',h('button',{class:'g',onclick:()=>em('arc:quit')},'Chiqish')));
}
function gameV(){if(ag.type==='rps')return rpsV();if(ag.type==='2048')return g48V();
 const g=ag,mine=g.turn===g.you&&!g.over;
 const st=g.over?(g.over==='d'?'Durang!':g.over===g.you?'Siz yutdingiz! 🎉':g.vs+' yutdi'):(mine?'Sizning yurishingiz ('+g.you+')':g.vs+' o‘ylayapti...');
 return h('div',{class:'c'},h('b',{},'X va O · '+g.vs+(g.level==='-'?'':' ('+g.level+')')),h('div',{style:'margin:6px 0'},st),
  h('div',{style:'display:grid;grid-template-columns:repeat(3,1fr);gap:6px;max-width:260px'},g.board.map((c,i)=>h('button',{class:'g',style:'height:70px;font-size:30px',disabled:!mine||!!c,onclick:()=>em('arc:move',{cell:i})},c||''))),
  h('div',{style:'margin-top:10px'},g.over&&g.level!=='-'&&h('button',{onclick:()=>{em('arc:quit');em('arc:bot',{type:'ttt',level:g.level})}},'Qayta o‘ynash'),' ',h('button',{class:'g',onclick:()=>em('arc:quit')},'Chiqish')));
}
let rec=null,vs=null,verr='',vbusy=0,ck='';const vcache={};
function wav(ch,sr){
 const n=ch.reduce((s,a)=>s+a.length,0),all=new Float32Array(n);let o=0;ch.forEach(a=>{all.set(a,o);o+=a.length});
 const R=11025,k=sr/R,len=Math.floor(n/k),pcm=new Int16Array(len);
 for(let i=0;i<len;i++){const a=Math.floor(i*k),e=Math.max(a+1,Math.floor((i+1)*k));let s=0;for(let j=a;j<e;j++)s+=all[j];s=Math.max(-1,Math.min(1,s/(e-a)));pcm[i]=s<0?s*32768:s*32767}
 const b=new ArrayBuffer(44+len*2),v=new DataView(b),W=(p,t)=>[...t].forEach((c,i)=>v.setUint8(p+i,c.charCodeAt(0)));
 W(0,'RIFF');v.setUint32(4,36+len*2,true);W(8,'WAVE');W(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,R,true);v.setUint32(28,R*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);W(36,'data');v.setUint32(40,len*2,true);
 new Int16Array(b,44).set(pcm);
 return{blob:new Blob([b],{type:'audio/wav'}),dur:len/R};
}
function vrender(){
 const b=$('#vbox');if(!b)return;let c=null;
 if(rec)c=h('div',{class:'row'},h('span',{},'🔴 Yozilmoqda '+Math.min(20,Math.floor((Date.now()-rec.t0)/1000))+' / 20 s'),h('button',{onclick:recStop},'⏹ To‘xtatish'),h('button',{class:'g',onclick:vcancel},'Bekor qilish'));
 else if(vs)c=h('div',{},h('audio',{controls:true,src:vs.url,style:'width:100%'}),h('div',{class:'row',style:'margin-top:6px'},h('span',{class:'mu'},Math.round(vs.dur)+' s'),h('button',{disabled:vbusy,onclick:vsend},vbusy?'Yuborilmoqda...':'📤 Yuborish'),h('button',{class:'g',onclick:vcancel},'Bekor qilish')));
 if(verr)c=h('div',{},c,h('div',{style:'color:var(--rd);margin-top:4px'},verr));
 b.replaceChildren(...(c?[c]:[]));
}
async function recStart(){
 try{
  const st=await navigator.mediaDevices.getUserMedia({audio:true}),ac=new(window.AudioContext||window.webkitAudioContext)(),src=ac.createMediaStreamSource(st),pr=ac.createScriptProcessor(4096,1,1),ch=[];
  pr.onaudioprocess=e=>{ch.push(new Float32Array(e.inputBuffer.getChannelData(0)))};
  src.connect(pr);pr.connect(ac.destination);
  rec={st,ac,pr,src,ch,t0:Date.now(),tm:setInterval(()=>{if(Date.now()-rec.t0>=20000)recStop();else vrender()},250)};
  vrender();
 }catch(e){verr='Mikrofon ruxsati berilmadi yoki mavjud emas';vrender()}
}
function recClean(r){clearInterval(r.tm);try{r.pr.disconnect();r.src.disconnect()}catch(e){}r.st.getTracks().forEach(t=>t.stop());r.ac.close()}
function recStop(){
 if(!rec)return;const r=rec;rec=null;recClean(r);
 const w=wav(r.ch,r.ac.sampleRate);
 if(w.dur<1){verr='Yozuv juda qisqa';vrender();return}
 vs={blob:w.blob,url:URL.createObjectURL(w.blob),dur:w.dur};vrender();
}
function vcancel(){if(rec){const r=rec;rec=null;recClean(r)}if(vs){URL.revokeObjectURL(vs.url);vs=null}verr='';vrender()}
async function vsend(){
 if(!vs||vbusy)return;vbusy=1;vrender();
 const buf=await vs.blob.arrayBuffer();
 socket.emit('voice',{c:tab,dur:vs.dur,buf},r=>{vbusy=0;if(r&&r.err)verr=r.err;else{URL.revokeObjectURL(vs.url);vs=null;verr=''}vrender()});
}
$('#cs').before(h('button',{id:'cm',class:'g',onclick:()=>{verr='';if(rec)recStop();else if(!vs)recStart();else vrender()}},'🎤'));
$('#msgs').after(h('div',{id:'vbox'}));
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
 if(elim)v.append(elimV());
 if(m&&m.p&&!m.al&&ph!=='lobby'&&ph!=='end'&&!elim)v.append(h('button',{style:'margin-bottom:10px',onclick:()=>{view='arcade';em('arc:enter');render()}},'🎮 Bunker Arcade'));
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
 $('#scr').replaceChildren(pend?adultV():!room?homeV():view==='arcade'?arcV():roomV());
 $('#chat').hidden=!room;renderChat();
}
function renderChat(){
 if(!room)return;
 const m=mp(),g=room.phase!=='lobby'&&room.phase!=='end'&&(!m||!m.al);
 if(!g)tab='main';
 $('#tabs').replaceChildren(...[h('button',{class:tab==='main'?'':'g',onclick:()=>{tab='main';renderChat()}},'💬 Umumiy'),g&&h('button',{class:tab==='ghost'?'':'g',onclick:()=>{tab='ghost';renderChat()}},'👻 Arvohlar')].filter(Boolean));
 const box=$('#msgs'),atEnd=box.scrollTop+box.clientHeight>=box.scrollHeight-40;
 const ck2=tab+':'+ch.length+':'+(ch.length?ch[ch.length-1].t:0);
 if(ck2!==ck){ck=ck2;box.replaceChildren(...ch.filter(x=>x.c===tab).map(x=>h('div',{style:'margin:2px 0'},h('span',{class:'mu'},x.a+' '+x.n+' · '+new Date(x.t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+': '),x.vid?(x.gone?h('span',{class:'mu'},'🎤 ovozli xabar o‘chirilgan'):vcache[x.vid]||(vcache[x.vid]=h('audio',{controls:true,preload:'metadata',src:'/v/'+x.vid,style:'height:36px;max-width:100%;vertical-align:middle'}))):x.x)));if(atEnd)box.scrollTop=box.scrollHeight}
 const w=tab==='ghost'?g:(room.phase==='lobby'||room.phase==='end'||(m&&m.al));
 $('#ci').disabled=!w;$('#cs').disabled=!w;const cm=$('#cm');if(cm)cm.disabled=!w;
}
function send(){const i=$('#ci'),x=i.value.trim();if(!x||!room)return;i.value='';em('chat',{c:tab,x})}
$('#cs').onclick=send;$('#ci').onkeydown=e=>{if(e.key==='Enter')send()};
render();


const KEYS={fire:['#7a1f10','#e2552e','#ffd9c2'],water:['#12407a','#3b8be0','#d4ecff'],grass:['#1d5a2a','#4cb05a','#dcf5d8'],elec:['#7a5a00','#e8b923','#fff3b8'],psy:['#58246e','#b05cd0','#f3dcfa'],dark:['#231c4a','#5b4fa8','#d9d4f2']};
const NAMES=['fire','water','grass','elec','psy','dark'];
const S={cards:Array.from({length:14},(_,i)=>({name:'card_'+String(i+1).padStart(2,'0'),key:NAMES[i%6],holo:i%3!=1,bad:i%5==3,v:i<7?(i%5==3?'fail':'pass'):(i==7?'pass':undefined)})),sel:'card_08'};
S.cur=()=>S.cards.find(c=>c.name===S.sel);
S.cnt=()=>({n:S.cards.length,p:S.cards.filter(c=>c.v==='pass').length,f:S.cards.filter(c=>c.v==='fail').length,u:S.cards.filter(c=>!c.v).length});
function card(c,w){const k=KEYS[c.key];return `<div class="mc ${c.holo?'h':''} ${c.bad?'d':''} ${c.v||''}" style="--w:${w}px;width:${w}px;--c1:${k[0]};--c2:${k[1]};--c3:${k[2]}"><b>${c.key.toUpperCase()}</b><i></i><u></u><u></u><u></u>${c.v?`<span class="st">${c.v==='pass'?'합격':'불량'}</span>`:''}</div>`}
function judge(v){const c=S.cur();if(c&&!c.v){c.v=v;const nx=S.cards.find(x=>!x.v);if(nx)S.sel=nx.name;render()}}
function pick(n){S.sel=n;render()}

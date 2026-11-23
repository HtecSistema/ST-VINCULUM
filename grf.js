// ===== GRAFICOS DENTRO DO ACOMPANHAMENTO - ARQUIVO SEPARADO =====
const G_BASE = "https://script.google.com/macros/s/AKfycbz2phEY97FZOsloQriNH9i0cWQ0Qex0PAr02jbL18qZHjHwnTtOB4tRcwJRIQbHjMYC/exec?action=getRelTodosRaw";
let G_ALUNOS=[], G_MAP={}, G_TOTAL_LANC=0, G_TOTAL_API=0, G_ULTIMA='', G_CACHE_CONG=[], G_CACHE_CIDADE=[], G_JA_CARREGOU=false;

function gNormMat(v){ return String(v||'').replace(/\D/g,'').replace(/^0+/,'') || '0'; }
function gPadMat(v){ return String(v||'').replace(/\D/g,'').padStart(5,'0'); }
function gSemAcento(s){ return (s||"").toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase(); }
function gFormatDataBR(v){ if(!v) return v; const s=String(v).trim(); const m=s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/); if(m) return `${m[3]}/${m[2]}/${m[1]} - ${m[4]}:${m[5]}`; return v; }

function gParseCong(raw){
  const original = String(raw||'').trim() || 'SEM CONGREGAÇÃO';
  let estado='', cidade='', congNome=''; let resto = original;
  if(original.includes('|')){ const partes = original.split('|'); estado = partes[0].trim(); resto = partes.slice(1).join('|').trim(); }
  if(resto.includes(' - ')){ const p = resto.split(' - '); cidade = p[0].trim(); congNome = p.slice(1).join(' - ').trim(); }
  else if(resto.includes('-')){ const p = resto.split('-'); cidade = p[0].trim(); congNome = p.slice(1).join('-').trim(); }
  else { cidade = resto; congNome = resto; }
  const cidadeKey = gSemAcento(cidade||'SEM CIDADE').replace(/\s+/g,' ').trim();
  const congKey = gSemAcento(original).replace(/\s+/g,' ').trim();
  return { original, estado: estado||'SEM ESTADO', cidade: cidade||'SEM CIDADE', cidadeKey, congNome: congNome||original, congKey, cidadeExibir: cidade||'SEM CIDADE' };
}

function gBarra(label, valor, max, cor){
  const pct=max?Math.round(valor/max*100):0;
  return '<div style="display:flex;justify-content:space-between;font-size:11px"><b>'+label+'</b><span>'+valor+'</span></div><div style="background:#e5e7eb;border-radius:99px;height:10px;overflow:hidden;margin:2px 0 8px"><div style="width:'+pct+'%;background:'+cor+';height:100%"></div></div>';
}

function abrirGraficos(){
  const m=document.getElementById('modalGraficos'); if(!m) return;
  m.style.display='flex'; document.body.style.overflow='hidden';
  if(!G_JA_CARREGOU) gLoadAll();
}
function fecharGraficos(){
  const m=document.getElementById('modalGraficos'); if(m) m.style.display='none';
  document.body.style.overflow='';
}

async function gLoadAll(){
  document.getElementById('gStatus').textContent="Buscando todos...";
  let start=1, limit=1000, ALL=[], TOTAL=0, tentativas=0;
  G_MAP={}; G_TOTAL_LANC=0;
  while(true){
    const url=`${G_BASE}&start=${start}&limit=${limit}&_=${Date.now()}`;
    const res=await fetch(url); const j=await res.json();
    TOTAL=j.total || TOTAL; G_TOTAL_API=TOTAL;
    let dados=(j.data||[]);
    dados=dados.filter(r=> String(r[0]||'').toLowerCase().trim()!=='item' && String(r[8]||'').toLowerCase().trim()!=='matricula');
    if(dados.length===0) break;
    ALL=ALL.concat(dados); G_TOTAL_LANC=ALL.length;
    const pct=TOTAL?Math.round(ALL.length/TOTAL*100):0;
    document.getElementById('gPbar').style.width=Math.min(pct,100)+"%";
    document.getElementById('gStatus').textContent=`Carregando ${ALL.length} / ${TOTAL||'?'}`;
    if(TOTAL && ALL.length >= TOTAL) break;
    if(!TOTAL && dados.length < limit) break;
    start = start + dados.length; tentativas++; if(tentativas>50) break;
  }
  G_JA_CARREGOU=true;
  gAgrupar(ALL, true); gAtualizar();
}

function gAgrupar(ALL, reset){
  if(reset) G_MAP={};
  ALL.forEach(r=>{
    const matKey = gNormMat(r[8]); if(!matKey || matKey==='0') return;
    if(!G_MAP[matKey]){
      const p = gParseCong(r[5]);
      G_MAP[matKey]={ mat: gPadMat(r[8]), matKey, nome: r[6], cong: p.original, estado: p.estado, cidade: p.cidadeExibir, cidadeKey: p.cidadeKey, congNome: p.congNome, congKey: p.congKey, whats: r[7], sexo: r[9], bat: r[10], funcEcles: r[11], funcCong: r[12], testes: [], itens: new Set() };
    }
    const item = String(r[0]);
    if(!G_MAP[matKey].itens.has(item)){ G_MAP[matKey].itens.add(item); G_MAP[matKey].testes.push({ item, ciclo: r[1], teste: r[2], data: r[3], pont: r[4] }); }
  });
  G_ALUNOS = Object.values(G_MAP).map(a=>{
    const notas = a.testes.map(t=> parseFloat(String(t.pont||'').replace(',','.'))).filter(n=>!isNaN(n));
    const menor = notas.length? Math.min(...notas): null;
    const temMenor70 = menor!==null && menor < 70; const qtd = a.testes.length;
    let status='EM CURSO'; if(qtd>=52 && !temMenor70) status='APROVADO'; else if(qtd>=52 && temMenor70) status='PENDENTE';
    const c1=a.testes.filter(t=> gSemAcento(t.ciclo).includes('CICLO1')).length;
    const c2=a.testes.filter(t=> gSemAcento(t.ciclo).includes('CICLO2')).length;
    const c3=a.testes.filter(t=> gSemAcento(t.ciclo).includes('CICLO3')).length;
    const c4=a.testes.filter(t=> gSemAcento(t.ciclo).includes('CICLO4')).length;
    return {...a, qtd, menor, temMenor70, status, c1,c2,c3,c4, media: notas.length? (notas.reduce((s,n)=>s+n,0)/notas.length):0 };
  });
  G_ALUNOS.sort((a,b)=> gSemAcento(a.nome).localeCompare(gSemAcento(b.nome)));
}

function gAtualizar(){
  document.getElementById('gCount').textContent = G_ALUNOS.length + " alunos únicos";
  document.getElementById('gFoot').textContent = `Última atualização: ${new Date().toLocaleString()} | Lançamentos: ${G_TOTAL_LANC} | API total: ${G_TOTAL_API}`;
  const aprov = G_ALUNOS.filter(a=>a.status==='APROVADO').length;
  const pend = G_ALUNOS.filter(a=>a.status==='PENDENTE').length;
  const curso = G_ALUNOS.filter(a=>a.status==='EM CURSO').length;
  document.getElementById('gDebug').innerHTML = `<b>CONFERÊNCIA:</b> Lançamentos: <b>${G_TOTAL_LANC}</b> | Matrículas únicas: <b>${G_ALUNOS.length}</b> | Aprovado: <b>${aprov}</b> + Pendente: <b>${pend}</b> + Em curso: <b>${curso}</b> = <b>${aprov+pend+curso}</b> | Regra: Aprovado = 52 testes e todas >=70`;
  gDesenhar();
}

function gDesenhar(){
  const wrap=document.getElementById('gWrap'); if(!wrap) return; if(!G_ALUNOS.length){ wrap.innerHTML=''; return; }
  const total=G_ALUNOS.length; const aprov=G_ALUNOS.filter(a=>a.status==='APROVADO').length; const pend=G_ALUNOS.filter(a=>a.status==='PENDENTE').length; const emCurso=G_ALUNOS.filter(a=>a.status==='EM CURSO').length; const concluidos52=G_ALUNOS.filter(a=>a.qtd>=52).length;
  const porCong={}; const nomeCong={}; G_ALUNOS.forEach(a=>{ porCong[a.congKey]=(porCong[a.congKey]||0)+1; if(!nomeCong[a.congKey]) nomeCong[a.congKey]=a.cong; });
  const todasCong=Object.entries(porCong).map(([k,q])=>[nomeCong[k],q]).sort((a,b)=>b[1]-a[1]); G_CACHE_CONG=todasCong;
  const porCidade={}; const nomeCidade={}; G_ALUNOS.forEach(a=>{ porCidade[a.cidadeKey]=(porCidade[a.cidadeKey]||0)+1; if(!nomeCidade[a.cidadeKey]) nomeCidade[a.cidadeKey]=a.cidade; });
  const todasCidades=Object.entries(porCidade).map(([k,q])=>[nomeCidade[k],q]).sort((a,b)=>b[1]-a[1]); G_CACHE_CIDADE=todasCidades;
  const temC1=G_ALUNOS.filter(a=>a.c1>0).length; const temC2=G_ALUNOS.filter(a=>a.c2>0).length; const temC3=G_ALUNOS.filter(a=>a.c3>0).length; const temC4=G_ALUNOS.filter(a=>a.c4>0).length;
  const masc=G_ALUNOS.filter(a=> gSemAcento(a.sexo).includes('MASC')).length; const fem=G_ALUNOS.filter(a=> gSemAcento(a.sexo).includes('FEM')).length;
  const porFuncao={};
  G_ALUNOS.forEach(a=>{ let f = String(a.funcEcles||'').trim().toUpperCase() || 'SEM FUNÇÃO'; porFuncao[f]=(porFuncao[f]||0)+1; });
  const todasFuncao=Object.entries(porFuncao).sort((a,b)=>b[1]-a[1]);
  const fCong=document.getElementById('gBuscaCong')?document.getElementById('gBuscaCong').value:''; const fCidade=document.getElementById('gBuscaCidade')?document.getElementById('gBuscaCidade').value:'';
  const card='background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:10px 12px';
  const mini='width:100%;border:1px solid #e2e8f0;background:#f8fafc;border-radius:8px;padding:7px 10px;font-size:12px;outline:0;margin:8px 0';
  wrap.innerHTML=
  `<div style="${card}"><div style="font-size:11px;font-weight:800;color:#64748b">INSCRITOS</div><div style="font-size:32px;font-weight:900">${total} <span style="font-size:12px;color:#64748b">matrículas únicas</span></div>${gBarra('Concluíram os Testes',concluidos52,total,'#0f172a')}${gBarra('Em Andamento',emCurso,total,'#c9a86a')}</div>`
  +`<div style="${card}"><div style="font-size:11px;font-weight:800;color:#64748b">POR CICLO</div>${gBarra('Ciclo 01',temC1,total,'#0f172a')}${gBarra('Ciclo 02',temC2,total,'#1e4a7a')}${gBarra('Ciclo 03',temC3,total,'#c9a86a')}${gBarra('Ciclo 04',temC4,total,'#059669')}</div>`
  +`<div style="${card}"><div style="font-size:11px;font-weight:800;color:#64748b">APROVADO x PENDENTE x EM CURSO</div><div style="font-size:11px;color:#64748b">APROVADO = 52 testes e todas >= 70</div>${gBarra('Aprovado',aprov,total,'#16a34a')}${gBarra('Pendente',pend,total,'#dc2626')}${gBarra('Em curso',emCurso,total,'#d97706')}</div>`
  +`<div style="${card}"><div style="font-size:11px;font-weight:800;color:#64748b">POR SEXO</div>${gBarra('Masculino',masc,total,'#0f172a')}${gBarra('Feminino',fem,total,'#c9a86a')}</div>`
  +`<div style="${card}"><div style="font-size:11px;font-weight:800;color:#64748b">POR FUNÇÃO</div><div style="font-size:11px;color:#64748b">${todasFuncao.length} funções | TOTAL: <b>${total}</b> alunos</div>${todasFuncao.map(([n,q])=> gBarra(n,q,todasFuncao[0][1],'#059669')).join('')}</div>`
  +`<div id="cardCidade" style="${card}"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:11px;font-weight:800;color:#64748b">POR CIDADE</div><button onclick="baixarPNGCidade(event)" style="background:none;border:none;cursor:pointer;font-size:11px;color:#94a3b8">#Imp</button></div><div style="font-size:11px;color:#64748b">${todasCidades.length} cidades</div><input id="gBuscaCidade" style="${mini}" placeholder="🔍 Informe a cidade" oninput="gFiltrarCidade()"><div id="gListaCidade" style="max-height:150px;overflow:auto">${todasCidades.map(([n,q])=> gBarra(n,q,todasCidades[0][1],'#1e4a7a')).join('')}</div></div>`
  +`<div id="cardCong" style="${card}"><div style="font-size:11px;font-weight:800;color:#64748b">POR CONGREGAÇÃO</div><div style="display:flex;justify-content:space-between;align-items:center"><div></div><button onclick="baixarPNGCongregacao(event)" style="background:none;border:none;cursor:pointer;font-size:11px;color:#94a3b8">#Imp</button></div><div style="font-size:11px;color:#64748b">${todasCong.length} congregações</div><input id="gBuscaCong" style="${mini}" placeholder="🔍 Informe a congregação" oninput="gFiltrarCong()"><div id="gListaCong" style="max-height:150px;overflow:auto">${todasCong.map(([n,q])=> gBarra(n,q,todasCong[0][1],'#0f172a')).join('')}</div></div>`;
  if(fCong){ document.getElementById('gBuscaCong').value=fCong; gFiltrarCong(); } if(fCidade){ document.getElementById('gBuscaCidade').value=fCidade; gFiltrarCidade(); }
}

function gLimpar(){
  document.getElementById('gMat').value='';
  G_ULTIMA='';
  document.getElementById('gDetalhe').innerHTML='';
  document.getElementById('gInfo').textContent='';
  const bc = document.getElementById('gBuscaCidade'); if(bc) bc.value = '';
  const bg = document.getElementById('gBuscaCong'); if(bg) bg.value = '';
  gDesenhar();
}
function gFiltrarCong(){ const termo=gSemAcento(document.getElementById('gBuscaCong').value); const box=document.getElementById('gListaCong'); const f=G_CACHE_CONG.filter(([n])=> gSemAcento(n).includes(termo)); if(!f.length){ box.innerHTML='<div style="font-size:12px;color:#64748b">Nenhuma congregação encontrada</div>'; return; } box.innerHTML=f.map(([n,q])=> gBarra(n,q,G_CACHE_CONG[0][1],'#0f172a')).join(''); }
function gFiltrarCidade(){ const termo=gSemAcento(document.getElementById('gBuscaCidade').value); const box=document.getElementById('gListaCidade'); const f=G_CACHE_CIDADE.filter(([n])=> gSemAcento(n).includes(termo)); if(!f.length){ box.innerHTML='<div style="font-size:12px;color:#64748b">Nenhuma cidade encontrada</div>'; return; } box.innerHTML=f.map(([n,q])=> gBarra(n,q,G_CACHE_CIDADE[0][1],'#1e4a7a')).join(''); }
function gRecarregarTudo(){
  G_JA_CARREGOU = false;
  document.getElementById('gPbar').style.width = "0%";
  gLoadAll();
}
function gBuscar(){
  const v = document.getElementById('gMat').value.trim();
  if(!v) return gLimpar();
  G_ULTIMA = gNormMat(v);
  gRender(G_ULTIMA, false);
}
function gRender(matKey, sozinho){
  const a = G_ALUNOS.find(x => x.matKey === matKey);
  const box = document.getElementById('gDetalhe');
  const info = document.getElementById('gInfo');
  if(!a){
    if(box) box.innerHTML = '<div style="font-size:12px;color:#dc2626">Matrícula não encontrada</div>';
    if(info) info.textContent = '';
    return;
  }
  if(info) info.textContent = a.nome + ' - ' + a.cong + ' | ' + a.qtd + ' testes';
  if(box) box.innerHTML = `
    <div style="font-size:13px"><b>${a.nome}</b> (${a.mat})</div>
    <div style="font-size:12px;color:#64748b">${a.cong} | ${a.cidade}</div>
    <div style="font-size:12px">Testes: <b>${a.qtd}</b> | Status: <b>${a.status}</b> | Média: <b>${a.media.toFixed(1)}</b></div>
  `;
}

document.addEventListener('input', e=>{ if(e.target && e.target.id==='gMat'){ clearTimeout(window._gDeb); window._gDeb=setTimeout(()=>{ const v=e.target.value.trim(); if(v.length>=2){ G_ULTIMA=gNormMat(v); gRender(G_ULTIMA,false); } if(!v) gLimpar(); },150); } });
document.addEventListener('keydown', e=>{ if(e.target && e.target.id==='gMat' && e.key==='Enter') gBuscar(); });
document.addEventListener('click', e=>{ if(e.target && e.target.id==='modalGraficos') fecharGraficos(); });

function imprimirGraficos(){
  document.body.classList.remove('print-tabela');
  document.body.classList.add('print-graficos');
  setTimeout(()=>window.print(), 100);
}
window.addEventListener('afterprint', ()=>{
  document.body.classList.remove('print-tabela','print-graficos');
});

async function baixarPNGCidade(e){
  e.stopPropagation();
  const btn = e.currentTarget;
  const card = document.getElementById('cardCidade');
  if(!card) return;
  btn.style.display = 'none';
  try{
    if(typeof html2canvas === 'undefined'){ alert('Biblioteca html2canvas não carregou. Verifique a internet e o script no grf.html'); return; }
    const clone = card.cloneNode(true);
    clone.style.position = 'fixed'; clone.style.left = '-9999px'; clone.style.top = '0';
    clone.style.width = card.offsetWidth + 'px'; clone.style.height = 'auto'; clone.style.maxHeight = 'none'; clone.style.overflow = 'visible';
    const listaClone = clone.querySelector('#gListaCidade');
    if(listaClone){
      listaClone.style.maxHeight = 'none'; listaClone.style.overflow = 'visible'; listaClone.style.height = 'auto';
      if(G_CACHE_CIDADE && G_CACHE_CIDADE.length){
        const max = G_CACHE_CIDADE[0][1];
        listaClone.innerHTML = G_CACHE_CIDADE.map(([n,q]) => gBarra(n,q,max,'#1e4a7a')).join('');
      }
    }
    const btnClone = clone.querySelector('button'); if(btnClone) btnClone.style.display = 'none';
    document.body.appendChild(clone);
    await new Promise(r => setTimeout(r, 200));
    const canvas = await html2canvas(clone, {scale:2, backgroundColor:'#ffffff'});
    clone.remove();
    const a = document.createElement('a'); a.download = 'por-cidade.png'; a.href = canvas.toDataURL('image/png'); a.click();
  }catch(err){ console.log(err); alert('Erro ao gerar imagem: ' + err.message); }
  btn.style.display = '';
}

async function baixarPNGCongregacao(e){
  e.stopPropagation();
  const btn = e.currentTarget;
  const card = document.getElementById('cardCong');
  if(!card) return;
  btn.style.display = 'none';
  try{
    if(typeof html2canvas === 'undefined'){ alert('Biblioteca html2canvas não carregou. Verifique a internet e o script no grf.html'); return; }
    const clone = card.cloneNode(true);
    clone.style.position = 'fixed'; clone.style.left = '-9999px'; clone.style.top = '0';
    clone.style.width = card.offsetWidth + 'px'; clone.style.height = 'auto'; clone.style.maxHeight = 'none'; clone.style.overflow = 'visible';
    const listaClone = clone.querySelector('#gListaCong');
    if(listaClone){
      listaClone.style.maxHeight = 'none'; listaClone.style.overflow = 'visible'; listaClone.style.height = 'auto';
      if(G_CACHE_CONG && G_CACHE_CONG.length){
        const max = G_CACHE_CONG[0][1];
        listaClone.innerHTML = G_CACHE_CONG.map(([n,q]) => gBarra(n,q,max,'#0f172a')).join('');
      }
    }
    const btnClone = clone.querySelector('button'); if(btnClone) btnClone.style.display = 'none';
    document.body.appendChild(clone);
    await new Promise(r => setTimeout(r, 200));
    const canvas = await html2canvas(clone, {scale:2, backgroundColor:'#ffffff'});
    clone.remove();
    const a = document.createElement('a'); a.download = 'por-congregacao.png'; a.href = canvas.toDataURL('image/png'); a.click();
  }catch(err){ console.log(err); alert('Erro ao gerar imagem: ' + err.message); }
  btn.style.display = '';
}

if(!document.getElementById('tbody')){
  window.addEventListener('DOMContentLoaded', ()=>{
    setTimeout(()=> abrirGraficos(), 100);
  });
}
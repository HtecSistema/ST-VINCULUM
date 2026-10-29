// RELATORIO.JS COMPLETO - FINAL - FILTRO + PDF 100% - 03/10/2026 - ORGANIZADO - CORRIGIDO toFixed + MASTER 05722
const API_URL = "https://script.google.com/macros/s/AKfycbz2phEY97FZOsloQriNH9i0cWQ0Qex0PAr02jbL18qZHjHwnTtOB4tRcwJRIQbHjMYC/exec";

if(typeof google === 'undefined' ||!google.script ||!google.script.run){
  window.google = { script: { run: {
    _s:null,_f:null,
    withSuccessHandler:function(cb){this._s=cb; return this;},
    withFailureHandler:function(cb){this._f=cb; return this;},
    limparCache:function(){var s=this; fetch(API_URL+"?action=limparCache&t="+Date.now()).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(e=>s._f&&s._f(e));},
    getProgressoAtual:function(){var s=this; fetch(API_URL+"?action=getProgressoAtual&t="+Date.now()).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(()=>s._s&&s._s({pct:"100",etapa:"Fim"}));},
    getQtdPorAmbito:function(){var s=this; fetch(API_URL+"?action=getQtdPorAmbito&t="+Date.now()).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(()=>s._s&&s._s({c1:0,c2:0,c3:0,c4:0,total:0}));},
    getDadosFiltrados:function(a,b,c){var s=this; fetch(API_URL+"?action=getDadosFiltrados&fCong="+encodeURIComponent(a||"")+"&fNome="+encodeURIComponent(b||"")+"&fMat="+encodeURIComponent(c||"")+"&t="+Date.now()).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(e=>s._f&&s._f(e));},
    getDetalheAluno:function(m){var s=this; fetch(API_URL+"?action=getDetalheAluno&mat="+encodeURIComponent(m||"")+"&t="+Date.now()).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(e=>s._f&&s._f(e));},
    getListaIgrejas:function(){var s=this; fetch(API_URL+"?action=getListaIgrejas&t="+Date.now()).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(e=>s._f&&s._f(e));},
    listarAcessosPendentes:function(){var s=this; fetch(API_URL+"?action=listarAcessosPendentes&t="+Date.now()).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(e=>s._f&&s._f(e));},
    checkAcessoGeral:function(n,sn){var s=this; fetch(API_URL+"?action=checkAcessoGeral&nome="+encodeURIComponent(n||"")+"&senha="+encodeURIComponent(sn||"")+"&t="+Date.now()).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(e=>s._f&&s._f(e));},
    cadastrarUsuario:function(dados){var s=this; fetch(API_URL+"?action=cadastrarUsuario",{method:"POST",body:JSON.stringify(dados)}).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(e=>s._f&&s._f(e));},
    gerarCertificadoWordDrive:function(m){var s=this; fetch(API_URL+"?action=gerarCertificadoWordDrive&mat="+encodeURIComponent(m||"")+"&t="+Date.now()).then(r=>r.json()).then(d=>s._s&&s._s(d)).catch(e=>s._f&&s._f(e));}
  }}};
}
window.CACHE_DETALHES = window.CACHE_DETALHES || {};
var TOTAL=[]; var ATUAL=[]; var SELECIONADO=null; var DETALHE=null; var idxSelecionado=-1;
var LIBERADO=false; var USUARIO_NOME="";
var CACHE_EDICAO=[]; var LINHA_EDICAO_ATUAL=null;
var LISTA_IGREJAS_CACHE=[]; 
var LISTA_ACESSO_CACHE = window.LISTA_ACESSO_CACHE || [];
var idxIgrejaSel=-1; var idxAcessoSel=-1;
var API_DUSUARIO = "https://script.google.com/macros/s/AKfycbxLXw-nu5oXXtjE8HKik_W_bbT9CGjTNJWw-dUm4wWYv-hjcz1dOhMHLxoUTRHGJA3D0A/exec";

function semAcentoJS(s){return (s||"").toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim().toUpperCase();}
function sf(v){ return (parseFloat(v)||0).toFixed(2); }
function ensureHtml2pdf(cb){ if(typeof html2pdf!== 'undefined'){ cb(); return; } var s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'; s.onload=function(){ setTimeout(cb, 400); }; document.head.appendChild(s); }
function salvarCacheB(lista){ try{ localStorage.setItem('cache_dusuario_b', JSON.stringify({t:Date.now(), lista})) }catch(e){} }
function carregarCacheB(){ try{ const c = JSON.parse(localStorage.getItem('cache_dusuario_b')||'null'); if(c && c.lista && c.lista.length>0){ LISTA_ACESSO_CACHE = c.lista; window.LISTA_ACESSO_CACHE = c.lista; return true; } }catch(e){} return false; }
carregarCacheB();

(function carregaDUsuario(){
  fetch(API_DUSUARIO+"?action=getDUsuario&t="+Date.now(), {cache:'no-store'})
  .then(r=>r.json())
  .then(d=>{
    var lista = Array.isArray(d) ? d : (d.dados||d.data||[]);
    LISTA_ACESSO_CACHE = lista.map(row=>{
      if(Array.isArray(row)) return {Matricula: row[3], Status: row[7], nome: row[1]};
      return {Matricula: row.matricula, Status: row.status, nome: row.nome};
    });
    window.LISTA_ACESSO_CACHE = LISTA_ACESSO_CACHE;
    var matRaw = String(localStorage.getItem('mat_logada')||'').replace(/\D/g,'').padStart(5,'0');
    var ach = LISTA_ACESSO_CACHE.find(u=> String(u.Matricula||'').replace(/\D/g,'').padStart(5,'0')===matRaw);
    if(ach && ach.Status) localStorage.setItem('status_logado', ach.Status);
    console.log('DUsuario carregada:', LISTA_ACESSO_CACHE.length);
  })
  .catch(e=> console.log('Erro DUsuario:', e));
})();

function isMasterLiberado(){
  var matRaw = String(localStorage.getItem('mat_logada')||'').replace(/\D/g,'').padStart(5,'0');
  if(!matRaw) return false;
  if(!LISTA_ACESSO_CACHE || LISTA_ACESSO_CACHE.length==0){
    return String(localStorage.getItem('status_logado')||'').toUpperCase()==="APROVADO";
  }
  var ach = LISTA_ACESSO_CACHE.find(u=> String(u.Matricula||'').replace(/\D/g,'').padStart(5,'0')===matRaw);
  return ach && String(ach.Status||'').toUpperCase()==="APROVADO";
}
function isMasterMat(mat){ 
  var m = String(mat||"").replace(/\D/g,"").padStart(5,'0'); 
  if(m==="00425" || m==="00001" || m==="05722") return true;
  return isMasterLiberado();
}
function isMasterNome(nome){ 
  var n = semAcentoJS(nome||""); 
  if(n.indexOf("HELIO SOUZA SILVA")!==-1 || n.indexOf("ELIEZER MIRANDA BARBOSA")!==-1 || n.indexOf("HAYERK")!==-1 || n.indexOf("HAYERKSLEY")!==-1) return true;
  return isMasterLiberado();
}

function travarPosMenu(matricula){ 
  if(isMasterLiberado()) return;
  var matFinal = String(matricula || localStorage.getItem('mat_logada') || "").replace(/\D/g,"").padStart(5,'0'); 
  var nomeFinal = USUARIO_NOME || localStorage.getItem('nome_logado') || ""; 
  if(isMasterMat(matFinal) || isMasterNome(nomeFinal)) return; 
  var fNome = document.getElementById('fNome'); 
  var fMat = document.getElementById('fMatr'); 
  if(fNome){ fNome.value = nomeFinal; fNome.readOnly = true; fNome.disabled = true; fNome.style.backgroundColor='#e5e7eb'; fNome.style.opacity='0.6'; fNome.style.pointerEvents='none'; } 
  if(fMat){ fMat.value = matFinal; fMat.readOnly = true; fMat.disabled = true; fMat.style.backgroundColor='#e5e7eb'; fMat.style.opacity='0.6'; fMat.style.pointerEvents='none'; } 
}

function entrarAcessoGeral(){ 
  var nome=document.getElementById('acessoNome').value.trim().toUpperCase(); 
  var senha=document.getElementById('acessoSenha').value.trim().toUpperCase(); 
  var msg=document.getElementById('msgAcesso'); 
  if(!nome ||!senha){ msg.style.color="#c00"; msg.innerText="Informe nome e senha"; return; } 
  if(LISTA_ACESSO_CACHE.length==0){ msg.style.color="#0d6efd"; msg.innerText="Carregando lista..."; carregarListaAcessoNomes(); setTimeout(entrarAcessoGeral, 1000); return; } 
  var usuario = LISTA_ACESSO_CACHE.find(u => semAcentoJS(u.nome||u.NomeUsuario||u.B||'') === semAcentoJS(nome)); 
  if(!usuario){ msg.style.color="#c00"; msg.innerText="❌ Nome não encontrado"; return; } 
  if(String(usuario.senha||'').toUpperCase().trim()!== senha){ msg.style.color="#c00"; msg.innerText="❌ Senha não compatível"; return; } 
  var statusUsuario = semAcentoJS(usuario.status || usuario.Status || usuario.H || '');
  if(statusUsuario !== "APROVADO"){
    var matCheck = String(usuario.matricula||usuario.Matricula||'').replace(/\D/g,'').padStart(5,'0');
    if(!isMasterMat(matCheck) && !isMasterNome(nome)){
      msg.style.color="#c00";
      msg.innerText="❌ Cadastro "+(usuario.status||'EM ANALISE')+" - Aguarde aprovação";
      return;
    }
  }
 LIBERADO=true; 
  USUARIO_NOME=usuario.nome||usuario.NomeUsuario||usuario.B||''; 
  localStorage.setItem('mat_logada', usuario.matricula||usuario.Matricula||''); 
  localStorage.setItem('nome_logado', USUARIO_NOME); 
  localStorage.setItem('status_logado', statusUsuario);
  var inp=document.getElementById('inputMatricula'); 
  if(inp) inp.value=usuario.matricula||usuario.Matricula||''; 
  msg.style.color="#198754"; 
  msg.innerText="✅ Liberado "+USUARIO_NOME; 
  try{
    var agora = new Date();
    var dataHoje = agora.toLocaleDateString('pt-BR');
    var horaHoje = agora.toLocaleTimeString('pt-BR');
    var matLogada = localStorage.getItem('mat_logada')||usuario.matricula||usuario.Matricula||'';
    var API_MOVADM = 'https://script.google.com/macros/s/AKfycbz94-3iCkeVDD7Za2XAYzYL7BtCM3rWWMxGc_9kL-xtpnRoog91IR4KmqgWzLXYHIsb/exec';
    fetch(API_MOVADM+"?action=registrarLogAcesso&adm="+encodeURIComponent(USUARIO_NOME)+"&mat="+encodeURIComponent(matLogada)+"&data="+encodeURIComponent(dataHoje)+"&hora="+encodeURIComponent(horaHoje)+"&t="+Date.now(), {mode:'no-cors'});
  }catch(e){ console.log("Erro log MovAdm", e); }
  if(statusUsuario === "APROVADO" || isMasterLiberado() || isMasterMat(usuario.matricula||usuario.Matricula||'') || isMasterNome(nome)){
    ['fNome','fMatr','buscar','fCong'].forEach(id=>{
      const el=document.getElementById(id);
      if(el){ el.disabled=false; el.readOnly=false; el.style.background=''; el.style.opacity='1'; el.style.pointerEvents='auto'; el.value=''; }
    });
  }else{
    destravarAposLogin(usuario.matricula||usuario.Matricula||'');
  }
}

function carregarListaAcessoNomes(){ if(LISTA_ACESSO_CACHE.length>0) return; google.script.run.withSuccessHandler(function(lista){ LISTA_ACESSO_CACHE=lista; window.LISTA_ACESSO_CACHE=lista; salvarCacheB(lista); }).listarAcessosPendentes(); }
function renderDropdownAcessoNomes(lista){ var drop=document.getElementById('dropdownAcessoNome'); if(!drop) return; drop.innerHTML=''; var termo = (document.getElementById('acessoNome').value||'').trim(); if(!termo){ drop.style.display='none'; return; } if(!lista || lista.length==0){ drop.style.display='none'; return; } lista.slice(0,50).forEach(function(a){ var nome=(a.nome||a.NomeUsuario||a.B||"").toString().trim(); if(!nome) return; var st=(a.status||a.Status||"APROVADO").toUpperCase(); var cor=st=="APROVADO"?"#198754":"#dc3545"; var mat=(a.matricula||a.Matricula||a.D||"").toString(); var div=document.createElement('div'); div.className='dropdown-item'; div.innerHTML='<b>'+nome+'</b><small style="color:'+cor+'">Mat: '+mat+' - '+st+'</small>'; div.onclick=function(){ document.getElementById('acessoNome').value=nome; esconderAcessoNomes(); document.getElementById('acessoSenha').focus(); }; drop.appendChild(div); }); drop.style.display='block'; idxAcessoSel=-1; }
function mostrarAcessoNomes(){ var input = document.getElementById('acessoNome'); var termo = (input.value||'').trim(); if(!termo){ var drop=document.getElementById('dropdownAcessoNome'); if(drop){ drop.style.display='none'; drop.innerHTML=''; } return; } if(LISTA_ACESSO_CACHE.length==0){ if(!carregarCacheB()){ carregarListaAcessoNomes(); return; } } var termoSem = semAcentoJS(termo); var lista=LISTA_ACESSO_CACHE.filter(function(a){ var n=a.nome||a.NomeUsuario||a.B||""; return semAcentoJS(n).indexOf(termoSem)!=-1; }); renderDropdownAcessoNomes(lista); }
function filtrarAcessoNome(){ mostrarAcessoNomes(); }
function esconderAcessoNomes(){ var drop=document.getElementById('dropdownAcessoNome'); if(drop) drop.style.display='none'; }
function selecionarAcessoNome(nome){ document.getElementById('acessoNome').value=nome; esconderAcessoNomes(); document.getElementById('acessoSenha').focus(); }
function navegarAcessoNome(e){var drop=document.getElementById('dropdownAcessoNome'); var itens=drop?drop.querySelectorAll('.dropdown-item'):[]; if(!itens.length) return; if(e.key==='ArrowDown'){ e.preventDefault(); idxAcessoSel=Math.min(idxAcessoSel+1, itens.length-1); itens.forEach(it=>it.classList.remove('selecionado')); if(itens[idxAcessoSel]){itens[idxAcessoSel].classList.add('selecionado'); itens[idxAcessoSel].scrollIntoView({block:'nearest'});} } else if(e.key==='ArrowUp'){ e.preventDefault(); idxAcessoSel=Math.max(idxAcessoSel-1, 0); itens.forEach(it=>it.classList.remove('selecionado')); if(itens[idxAcessoSel]){itens[idxAcessoSel].classList.add('selecionado');} } else if(e.key==='Enter'){ e.preventDefault(); if(idxAcessoSel>=0 && itens[idxAcessoSel]) itens[idxAcessoSel].click(); } else if(e.key==='Escape'){ esconderAcessoNomes(); }}
window.addEventListener('message', function(e){ if(e.data && e.data.tipo==='LOGIN_DADOS'){ const mat = e.data.matricula||''; const nome = e.data.nome||''; if(mat){ localStorage.setItem('mat_logada', mat); } if(nome){ localStorage.setItem('nome_logado', nome); USUARIO_NOME=nome; } if(mat){ travarPosMenu(mat); } } });
document.addEventListener('DOMContentLoaded', function(){ carregarListaAcessoNomes(); const matLogada = localStorage.getItem('mat_logada') || ""; const nomeLogado = localStorage.getItem('nome_logado') || ""; if(matLogada){ USUARIO_NOME = nomeLogado || USUARIO_NOME; setTimeout(()=>travarPosMenu(matLogada), 300); } var inp = document.getElementById('acessoNome'); if(inp){ inp.addEventListener('input', filtrarAcessoNome); inp.addEventListener('keyup', navegarAcessoNome); inp.addEventListener('blur', function(){ setTimeout(esconderAcessoNomes, 200); }); } });
document.getElementById('tabWrap')?.addEventListener('keydown', function(e){ if(!ATUAL.length || ATUAL.length<2) return; if(document.activeElement && document.activeElement.tagName==='INPUT' && document.activeElement.id!=='tabWrap'){ if(e.key==='ArrowDown' || e.key==='ArrowUp') return; } if(e.key==='ArrowDown'){ e.preventDefault(); var novoIdx=idxSelecionado+1; if(novoIdx<1) novoIdx=1; if(novoIdx>=ATUAL.length) novoIdx=ATUAL.length-1; selecionar(novoIdx); } else if(e.key==='ArrowUp'){ e.preventDefault(); var novoIdx=idxSelecionado-1; if(novoIdx<1) novoIdx=1; selecionar(novoIdx); } });

function selecionar(idx){
  if(idx<1 || idx>=ATUAL.length) return;
  var row=ATUAL[idx]; idxSelecionado=idx;
  document.querySelectorAll('#tab tbody tr').forEach(function(tr){tr.classList.remove('selecionado');});
  var el=document.getElementById('row-'+idx); if(el){ el.classList.add('selecionado'); el.scrollIntoView({block:'nearest'}); }
  var qtd=parseInt(row[5]||0); var mat = (row[4]||'').toString().trim(); var nome = (row[2]||'').toString().trim();
  SELECIONADO={cong:row[1], nome:nome, mat:mat, zap:row[3], qtd:qtd, row:row};
  var detalhesJson = row[17]||row[row.length-1]||'';
  if(detalhesJson && typeof detalhesJson==='string' && detalhesJson.indexOf('{')!=-1){
    try{
      var parsed = JSON.parse(detalhesJson);
      DETALHE = { cong: row[1], congOrig: row[1], nome: nome, mat: mat, zap: row[3], c1: parsed.c1||{}, c2: parsed.c2||{}, c3: parsed.c3||{}, c4: parsed.c4||{}, r1: parsed.r1||{media:0,nas:0,qtd:parseInt(row[6]||0),soma:0}, r2: parsed.r2||{media:0,nas:0,qtd:parseInt(row[8]||0),soma:0}, r3: parsed.r3||{media:0,nas:0,qtd:parseInt(row[10]||0),soma:0}, r4: parsed.r4||{media:0,nas:0,qtd:parseInt(row[12]||0),soma:0}, totalFeitos: parsed.totalFeitos||qtd, totalPend: parsed.totalPend||(52-qtd), mediaGeral: parsed.mediaGeral||0, totalNA: parsed.totalNA||0, totalSoma: parsed.totalSoma||0, status: parsed.status||row[15]||'', daPlanilha: true };
      document.getElementById('msg').innerText='✅ REAL DA PLANILHA - Selecionado: '+nome+' | Mat: '+mat+' | Média: '+sf(DETALHE.mediaGeral)+' | Feitos: '+DETALHE.totalFeitos+'/52';
      document.getElementById('acoes-extra').style.display='flex'; document.getElementById('boletim').style.display='none';
      window.CACHE_DETALHES[mat]=DETALHE; window.CACHE_DETALHES[nome]=DETALHE; return;
    }catch(eJson){}
  }
  if(window.CACHE_DETALHES && (window.CACHE_DETALHES[mat] || window.CACHE_DETALHES[nome])){
    DETALHE = window.CACHE_DETALHES[mat] || window.CACHE_DETALHES[nome];
    document.getElementById('msg').innerText='✅ CACHE - Selecionado: '+DETALHE.nome+' | Média: '+sf(DETALHE.mediaGeral);
    document.getElementById('acoes-extra').style.display='flex'; return;
  }
  DETALHE=null; document.getElementById('msg').innerText='⚠ Clique em PESQUISAR para carregar 100% da planilha';
}

function pesquisar(){
  // --- MASTER LIBERADO - LIMPA COLUNA B=Matricula e COLUNA D=Nome ---
  if(isMasterLiberado()){
    var elNome = document.getElementById('fNome');
    var elMat = document.getElementById('fMatr');
    if(elNome) elNome.value = '';
    if(elMat) elMat.value = '';
  }
  // --- FIM MASTER ---

  var fCong=document.getElementById('buscar')?.value||document.getElementById('fCong')?.value||'';
  var fNome=document.getElementById('fNome')?.value||'';
  var fMat=document.getElementById('fMatr')?.value||'';
  try{ setTimeout(function(){ try{ google.script.run.limparCache(); }catch(e){} }, 100); }catch(e){}
  var progCont=document.getElementById('progressContainer');
  var progBar=document.getElementById('progressBar');
  var labelQtd=document.getElementById('labelQtdAmbito');
  progCont.style.display='block';
  progBar.style.width='0%'; progBar.innerText='0%';
  if(labelQtd){ labelQtd.style.display='block'; labelQtd.innerText='Encontrados | Ciclo 01 - 0 | Ciclo 02 - 0 | Ciclo 03 - 0 | Ciclo 04 - 0 | Total: 0'; }
  document.getElementById('tabWrap').style.display='block';
  document.querySelector('#tab tbody').innerHTML='<tr><td colspan="18" style="text-align:center;">Carregando...</td></tr>';
  var pct=0;
  document.getElementById('msg').innerText='Buscando dados no Ciclo 01 - 0%';
  var intervalo = setInterval(function(){
    if(pct==0) pct=25; else if(pct==25) pct=50; else if(pct==50) pct=75; else if(pct==75) pct=95;
    var ciclo = pct>=95?4:pct>=75?3:pct>=50?2:1;
    document.getElementById('msg').innerText = 'Buscando dados no Ciclo 0'+ciclo+' - '+pct+'%';
    progBar.style.width = pct+'%';
    progBar.innerText = pct+'%';
    if(labelQtd){
      var est = Math.floor(pct*2.4);
      labelQtd.innerText = 'Encontrados | Ciclo 01 - '+est+' | Ciclo 02 - '+Math.floor(est*0.8)+' | Ciclo 03 - '+Math.floor(est*0.6)+' | Ciclo 04 - '+Math.floor(est*0.5)+' | Total: '+est;
    }
    if(pct>=95) clearInterval(intervalo);
  }, 150);
  var url = API_URL+"?action=getDadosFiltrados&fCong="+encodeURIComponent(fCong)+"&fNome="+encodeURIComponent(fNome)+"&fMat="+encodeURIComponent(fMat)+"&t="+Date.now();
  fetch(url, {cache:'no-store'}).then(r=>r.json()).then(d=>{
    clearInterval(intervalo);
    var total = d.length-1; var c1=0,c2=0,c3=0,c4=0;
    for(var i=1;i<d.length;i++){
      if(parseInt(d[i][6]||0)>0) c1++;
      if(parseInt(d[i][8]||0)>0) c2++;
      if(parseInt(d[i][10]||0)>0) c3++;
      if(parseInt(d[i][12]||0)>0) c4++;
    }
    document.getElementById('msg').innerText='Buscando dados no Ciclo 04 - 100%';
    progBar.style.width='100%'; progBar.innerText='100%';
    if(labelQtd){ labelQtd.innerText = 'Encontrados | Ciclo 01 - '+c1+' | Ciclo 02 - '+c2+' | Ciclo 03 - '+c3+' | Ciclo 04 - '+c4+' | Total: '+total; }
    TOTAL=d; ATUAL=d; window.TOTAL_ORIGINAL=d.slice(); window.ATUAL=d; window.TOTAL=d;
    render(d);
    document.getElementById('msg').innerText='Dados 100% Localizados - '+total+' alunos';
    setTimeout(function(){ progCont.style.display='none'; if(labelQtd) labelQtd.style.display='none'; }, 1000);
  }).catch(e=>{
    clearInterval(intervalo);
    document.getElementById('msg').innerText='Erro: '+e.message;
    progCont.style.display='none';
  });
}

function render(listaComCab){
  var thead=document.querySelector('#tab thead'); 
  var tbody=document.querySelector('#tab tbody'); 
  thead.innerHTML=''; tbody.innerHTML='';
  if(!listaComCab || listaComCab.length<2){ 
    document.getElementById('tabWrap').style.display='none'; 
    ATUAL=listaComCab||[]; window.ATUAL=ATUAL;
    return; 
  }
  var cab=listaComCab[0].slice(); 
  cab[6]="C1"; cab[8]="C2"; cab[10]="C3"; cab[12]="C4"; 
  if(cab.length>17) cab=cab.slice(0,16);
  var htmlHead='<tr>'; 
  cab.forEach(function(h,i){ 
    var cls=(i==7||i==9||i==11||i==13||i==14||i==16)?' class="col-pend"':''; 
    htmlHead+='<th'+cls+'>'+h+'</th>'; 
  }); 
  htmlHead+='</tr>'; 
  thead.innerHTML=htmlHead;
  var corpo=listaComCab.slice(1);
  corpo.forEach(function(r,i){
    var tr=document.createElement('tr'); 
    tr.id='row-'+(i+1);
    var statusLinha = semAcentoJS(r[15]||'');
    if(statusLinha.indexOf('APROVADO')!==-1){
      tr.style.backgroundColor = '#d1fae5';
      tr.style.fontWeight = '600';
    }
    var htmlRow=''; 
    r.slice(0,16).forEach(function(c,j){ 
      if(j==0){ c = String(c||i+1).padStart(4,'0'); }
      if(j==2){ c = semAcentoJS(c); }
      var cls=(j==7||j==9||j==11||j==13||j==14)?' class="col-pend"':''; 
      var ehDireita = (j==4||j==5||j==6||j==8||j==10||j==12);
      var ehCentro = (j==3);
      var estilo = '';
      if(ehDireita) estilo = 'text-align:right; font-weight:700;';
      if(ehCentro) estilo = 'text-align:center; font-weight:700;';
      if(cls && estilo){ htmlRow+='<td'+cls+' style="'+estilo+'">'+c+'</td>'; }else if(cls){ htmlRow+='<td'+cls+'>'+c+'</td>'; }else if(estilo){ htmlRow+='<td style="'+estilo+'">'+c+'</td>'; }else{ htmlRow+='<td>'+c+'</td>'; }
    });
    tr.innerHTML=htmlRow; 
    tr.onclick=function(){ selecionar(i+1); }; 
    tbody.appendChild(tr);
  });
  document.getElementById('tabWrap').style.display='block'; 
  ATUAL=listaComCab; window.ATUAL=listaComCab; idxSelecionado=-1;
}

function filtrar(){
  var termo=semAcentoJS(document.getElementById('buscar').value);
  var fCong=semAcentoJS(document.getElementById('fCong').value);
  var fNome=semAcentoJS(document.getElementById('fNome').value);
  var fMat=semAcentoJS(document.getElementById('fMatr').value);
  var matCert=semAcentoJS(document.getElementById('inputMatricula').value);
  var lista = window.TOTAL_ORIGINAL || TOTAL || ATUAL;
  if(!lista || lista.length<2){ lista = ATUAL; if(!lista || lista.length<2) return; }
  var cab=lista[0]; var corpo=lista.slice(1);
  if(termo) corpo=corpo.filter(function(r){ return semAcentoJS(r[1]).indexOf(termo)!=-1 || semAcentoJS(r[2]).indexOf(termo)!=-1; });
  if(fCong) corpo=corpo.filter(function(r){ return semAcentoJS(r[15]||'').indexOf(fCong)!=-1 || semAcentoJS(r[1]).indexOf(fCong)!=-1; });
  if(fNome) corpo=corpo.filter(function(r){ var nome=semAcentoJS(r[2]); return nome.indexOf(fNome)!=-1 || nome.split(' ').some(function(p){return p.startsWith(fNome)}); });
  if(fMat) corpo=corpo.filter(function(r){ var mat=semAcentoJS(r[4]); var mat5=("00000"+(r[4]||"").replace(/\D/g,'')).slice(-5); return mat.indexOf(fMat)!=-1 || mat5.indexOf(fMat)!=-1 || semAcentoJS(r[2]).indexOf(fMat)!=-1; });
  if(matCert) corpo=corpo.filter(function(r){ var mat=semAcentoJS(r[4]); var mat5=("00000"+(r[4]||"").replace(/\D/g,'')).slice(-5); return mat.indexOf(matCert)!=-1 || mat5.indexOf(matCert)!=-1; });
  ATUAL = [cab].concat(corpo); window.ATUAL=ATUAL; render(ATUAL); document.getElementById('msg').innerText=corpo.length+' Localizados de '+(lista.length-1);
}

window.limpar = function(){
  try{
    var matLogada = (localStorage.getItem('mat_logada') || '').toString().trim();
    var nomeLogado = (localStorage.getItem('nome_logado') || '').toString().trim().toUpperCase();
    var ehMaster = isMasterLiberado() || isMasterMat(matLogada) || isMasterNome(nomeLogado);
    var elBuscar = document.getElementById('buscar');
    var elFStatus = document.getElementById('fCong');
    var elFNome = document.getElementById('fNome');
    var elFMat = document.getElementById('fMatr');
    if(elBuscar) elBuscar.value = '';
    if(elFStatus) elFStatus.value = '';
    if(ehMaster){
      if(elFNome){ elFNome.value=''; elFNome.disabled=false; elFNome.readOnly=false; elFNome.style.background=''; elFNome.style.opacity='1'; elFNome.style.pointerEvents='auto'; }
      if(elFMat){ elFMat.value=''; elFMat.disabled=false; elFMat.readOnly=false; elFMat.style.background=''; elFMat.style.opacity='1'; elFMat.style.pointerEvents='auto'; }
    }else{
      if(elFNome){ elFNome.value = nomeLogado; elFNome.readOnly=true; elFNome.disabled=true; elFNome.style.backgroundColor='#e5e7eb'; elFNome.style.opacity='0.6'; elFNome.style.pointerEvents='none'; }
      if(elFMat){ elFMat.value = matLogada; elFMat.readOnly=true; elFMat.disabled=true; elFMat.style.backgroundColor='#e5e7eb'; elFMat.style.opacity='0.6'; elFMat.style.pointerEvents='none'; }
    }
    var tabHead = document.querySelector('#tab thead');
    var tabBody = document.querySelector('#tab tbody');
    var tabWrap = document.getElementById('tabWrap');
    if(tabHead) tabHead.innerHTML = '';
    if(tabBody) tabBody.innerHTML = '';
    if(tabWrap) tabWrap.style.display = 'none';
    window.TOTAL_ORIGINAL = [];
    TOTAL = []; ATUAL = []; window.ATUAL=[]; window.TOTAL=[];
    window.CACHE_DETALHES = {};
    SELECIONADO = null; DETALHE = null; idxSelecionado = -1;
    var msg = document.getElementById('msg'); if(msg) msg.innerText = ehMaster ? 'Filtro limpo - cache limpo - Master liberado' : 'Lista e cache limpos - Mantido '+matLogada;
    var progCont = document.getElementById('progressContainer'); if(progCont) progCont.style.display='none';
    var labelQtd = document.getElementById('labelQtdAmbito'); if(labelQtd) labelQtd.style.display='none';
    var acoes = document.getElementById('acoes-extra'); if(acoes) acoes.style.display='none';
    var bol = document.getElementById('boletim'); if(bol){ bol.style.display='none'; bol.innerHTML=''; }
    try{ localStorage.removeItem('cache_dusuario_b'); localStorage.removeItem('cache_relatorio'); }catch(e){}
  }catch(e){ console.log('Erro limpar:', e); }
};

function exportarExcel(){ var dados=ATUAL; if(!dados||dados.length<2){alert('Pesquise primeiro'); return;} var csv=dados.map(function(r){return r.join(';');}).join('\n'); var blob=new Blob([csv],{type:'text/csv'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='RELATORIO.csv'; a.click(); }

function gerarBoletim(){
  if(!SELECIONADO){ alert("Clique em um nome na lista primeiro"); return; }
  if(!DETALHE){ alert("Clique na lista primeiro"); return; }
  if(document.getElementById('modalBoletim')) document.getElementById('modalBoletim').remove();
  var a=DETALHE;
  var ano = new Date().getFullYear();
  var totalFeitosReal = parseInt(a.totalFeitos||0);
  var totalNAReal = parseInt(a.totalNA||0);
  var mediaReal = parseFloat(a.mediaGeral||0);
  var statusReal = (a.status||'').toString().toUpperCase();
  var ehAprovado = statusReal.indexOf('APROVADO')!=-1;
  var bloqueado = false;
  if(!ehAprovado){ if(totalNAReal>0) bloqueado=true; else if(totalFeitosReal<52) bloqueado=true; else if(mediaReal>0 && mediaReal<70) bloqueado=true; }
  if(totalNAReal==0 && totalFeitosReal>=52 && mediaReal>=70) bloqueado=false;
  function formatNota(n){ if(n===undefined) return {nota:'', obs:''}; if(n<70) return {nota:n, obs:'<span style="color:#c00; font-weight:900">NA</span>'}; return {nota:n, obs:''}; }
  var AZUL_CLARINHO = '#8ab4f8';
  var BORDA = '#d1d5db';
  var html='<div id="boletimPrint" style="background:#fff; padding:0; font-family:Arial, sans-serif; font-size:11px; color:#000; border:1px solid '+BORDA+'">'
  +'<div id="dragHandle" style="display:flex; align-items:center; gap:10px; padding:8px 10px; border-bottom:1px solid '+BORDA+'; cursor:move; touch-action:none; user-select:none">'
  +'<img src="https://i.postimg.cc/KKy4nMGY/igreja.jpg" style="width:auto; height:58px; object-fit:contain; display:block; object-fit:contain">'
  +'<div style="text-align:left; line-height:1.15"><b style="font-size:11px">Igreja Evangélica Assembleia de Deus Missões</b><br><span style="font-size:14px; font-weight:900">Curso <i>Discipulado</i></span><br><span style="font-size:10px">Pr. Eliezer Miranda Barbosa – Presidente</span></div></div>'
  +'<div style="background:'+AZUL_CLARINHO+'; color:#000; font-weight:900; padding:6px; font-size:13px; text-align:center;">BOLETIM DO ALUNO</div>'
  +'<div style="padding:10px">'
  +'<div style="display:flex; justify-content:space-between; font-size:11px; margin-top:6px"><div><b>Congregação:</b> '+(a.congOrig||a.cong||'')+'</div><div><b>Ano Curso:</b> '+ano+'</div></div>'
  +'<div style="display:flex; justify-content:space-between; font-size:11px; margin-top:2px"><div><b>Nome:</b> <span style="text-transform:uppercase; font-weight:900">'+(a.nome||'').toString().toUpperCase()+'</span></div><div><b>Matrícula:</b> '+a.mat+'</div></div>';
  // AJUSTE SÓ AQUI - MEDIA DE CADA CICLO IGUAL O %
  var calcMedia = function(total, qtd){ if(!qtd || qtd==0) return '0.00'; return (total / qtd).toFixed(2); };
  var calcPerc = function(total, qtd){ if(!qtd || qtd==0) return '0%'; return Math.round((total / (qtd*100) * 100))+'%'; };
  var media1 = calcMedia(a.r1?a.r1.soma:0, a.r1?a.r1.qtd:0); var media2 = calcMedia(a.r2?a.r2.soma:0, a.r2?a.r2.qtd:0); var media3 = calcMedia(a.r3?a.r3.soma:0, a.r3?a.r3.qtd:0); var media4 = calcMedia(a.r4?a.r4.soma:0, a.r4?a.r4.qtd:0);
  var perc1 = calcPerc(a.r1?a.r1.soma:0, a.r1?a.r1.qtd:0); var perc2 = calcPerc(a.r2?a.r2.soma:0, a.r2?a.r2.qtd:0); var perc3 = calcPerc(a.r3?a.r3.soma:0, a.r3?a.r3.qtd:0); var perc4 = calcPerc(a.r4?a.r4.soma:0, a.r4?a.r4.qtd:0);

  html+='<table style="width:100%; border-collapse:collapse; margin-top:8px; font-size:10px; border:1px solid '+BORDA+'" border="0">'
  +'<tr style="background:'+AZUL_CLARINHO+'; color:#000; font-weight:900"><th style="text-align:left; padding:4px; background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Ciclos Temas</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Média</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">NA</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">%</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Media Geral</th></tr>'
  +'<tr><td style="padding:4px; background:#fff; border:1px solid '+BORDA+'">Ciclo 01: Conhecendo Jesus e o seu Reino</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+media1+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+(a.r1?a.r1.nas:0)+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+perc1+'</td><td rowspan="4" style="text-align:center; font-weight:900; font-size:14px; vertical-align:middle; background:#fff; border:1px solid '+BORDA+'">'+sf(a.mediaGeral)+'</td></tr>'
  +'<tr><td style="padding:4px; background:#fff; border:1px solid '+BORDA+'">Ciclo 02: Conhecendo as Doutrinas Cristã</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+media2+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+(a.r2?a.r2.nas:0)+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+perc2+'</td></tr>'
  +'<tr><td style="padding:4px; background:#fff; border:1px solid '+BORDA+'">Ciclo 03: Vivendo as Verdades Bíblicas</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+media3+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+(a.r3?a.r3.nas:0)+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+perc3+'</td></tr>'
  +'<tr><td style="padding:4px; background:#fff; border:1px solid '+BORDA+'">Ciclo 04: Portando uma Nova Identidade</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+media4+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+(a.r4?a.r4.nas:0)+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+perc4+'</td></tr>'
  +'</table>';
  html+='<table style="width:100%; border-collapse:collapse; margin-top:8px; font-size:9px; border:1px solid '+BORDA+'" border="0">'
  +'<tr style="background:'+AZUL_CLARINHO+'; color:#000; font-weight:900"><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Item</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Ciclo 01</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Nota</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Obs</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Ciclo 02</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Nota</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Obs</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Ciclo 03</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Nota</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Obs</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Ciclo 04</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Nota</th><th style="background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Obs</th></tr>';
  var totalC1=0, totalC2=0, totalC3=0, totalC4=0;
  for(var i=1;i<=13;i++){ var n1 = a.c1[i]; var n2 = a.c2[i]; var n3 = a.c3[i]; var n4 = a.c4[i]; if(n1!==undefined) totalC1+=parseFloat(n1)||0; if(n2!==undefined) totalC2+=parseFloat(n2)||0; if(n3!==undefined) totalC3+=parseFloat(n3)||0; if(n4!==undefined) totalC4+=parseFloat(n4)||0; var f1 = formatNota(n1); var f2 = formatNota(n2); var f3 = formatNota(n3); var f4 = formatNota(n4); html+='<tr style="height:14px; line-height:1"><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+(i<10?'0'+i:i)+'</td><td style="background:#fff; border:1px solid '+BORDA+'">Teste '+(i<10?'0'+i:i)+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+f1.nota+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+f1.obs+'</td><td style="background:#fff; border:1px solid '+BORDA+'">Teste '+(i<10?'0'+i:i)+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+f2.nota+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+f2.obs+'</td><td style="background:#fff; border:1px solid '+BORDA+'">Teste '+(i<10?'0'+i:i)+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+f3.nota+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+f3.obs+'</td><td style="background:#fff; border:1px solid '+BORDA+'">Teste '+(i<10?'0'+i:i)+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+f4.nota+'</td><td style="text-align:center; background:#fff; border:1px solid '+BORDA+'">'+f4.obs+'</td></tr>'; }
  html+='<tr style="background:'+AZUL_CLARINHO+'; font-weight:900; color:#000"><td colspan="2" style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">Total Pontos</td><td style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">'+totalC1+'</td><td style="background:'+AZUL_CLARINHO+'; border:1px solid '+BORDA+'"></td><td style="background:'+AZUL_CLARINHO+'; border:1px solid '+BORDA+'"></td><td style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">'+totalC2+'</td><td style="background:'+AZUL_CLARINHO+'; border:1px solid '+BORDA+'"></td><td style="background:'+AZUL_CLARINHO+'; border:1px solid '+BORDA+'"></td><td style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">'+totalC3+'</td><td style="background:'+AZUL_CLARINHO+'; border:1px solid '+BORDA+'"></td><td style="background:'+AZUL_CLARINHO+'; border:1px solid '+BORDA+'"></td><td style="text-align:center; background:'+AZUL_CLARINHO+'; color:#000; border:1px solid '+BORDA+'">'+totalC4+'</td><td style="background:'+AZUL_CLARINHO+'; border:1px solid '+BORDA+'"></td></tr></table>';
  html+='<div style="font-size:8px; margin-top:4px"><b>Legenda:</b> NA -> Nota não Atingida | Total: '+a.totalFeitos+'/52 | Pend: '+a.totalPend+' | 100% Real</div>';
  if(bloqueado){ html+='<div style="margin-top:8px; background:#f8d7da; color:#721c24; padding:8px; border:1px solid #f5c6cb; text-align:center; font-weight:900">⛔ PENDENTE - '+(a.totalNA>0? a.totalNA+' nota(s) <70 (NA)' : a.totalFeitos<52? 'Faltam '+(52-a.totalFeitos)+' testes' : 'Média <70')+' - NÃO PODE IMPRIMIR CERTIFICADO</div>'; } else { html+='<div style="margin-top:8px; background:#d4edda; color:#155724; padding:8px; border:1px solid #c3e6cb; text-align:center; font-weight:900">✅ APROVADO - Média '+sf(a.mediaGeral)+'</div>'; }
  html+='</div></div>';
  var botoes = `<div class="no-print" style="display:flex; gap:8px; flex-wrap:nowrap; justify-content:center"><button onclick="window.print()" style="flex:1; min-width:0; height:44px; background:#0d6efd; color:#fff; border:0; border-radius:8px; font-weight:900; font-size:11px">🖨 IMPRIMIR</button><button onclick="enviarPdfZap()" style="flex:1; min-width:0; height:44px; background:#25D366; color:#fff; border:0; border-radius:8px; font-weight:900; font-size:11px">📄 PDF + ZAP</button><button onclick="enviarBoletimZap()" style="flex:1; min-width:0; height:44px; background:#128C7E; color:#fff; border:0; border-radius:8px; font-weight:900; font-size:11px">📱 TEXTO ZAP</button><button onclick="document.getElementById('modalBoletim').remove()" style="flex:1; min-width:0; height:44px; background:#6c757d; color:#fff; border:0; border-radius:8px; font-weight:900; font-size:11px">FECHAR</button></div>`;

var modalHtml = `<div id="modalBoletim" style="position:fixed;inset:0;background:rgba(15,23,42,.65);backdrop-filter:blur(3px);z-index:9999999;display:flex;align-items:center;justify-content:center;padding:12px"><div id="modalBoletimBox" style="background:#fff;width:100%;max-width:1080px;max-height:98vh;overflow:auto;border-radius:16px;padding:14px 14px 10px 14px;box-shadow:0 20px 60px rgba(0,0,0,.35);border:1px solid #e2e8f0;animation:pop .18s ease;scrollbar-width:none;-ms-overflow-style:none">${botoes}<div style="height:10px"></div>${html}</div></div><style>@keyframes pop{from{transform:scale(.92);opacity:0}to{transform:scale(1);opacity:1}}#modalBoletimBox::-webkit-scrollbar{display:none;width:0;height:0}#dragHandle{cursor:grab}#dragHandle:active{cursor:grabbing} #boletimWrap::-webkit-scrollbar{height:8px} #boletimWrap::-webkit-scrollbar-thumb{background:#94a3b8; border-radius:4px}</style>`;
  var modalHtml = `<div id="modalBoletim" style="position:fixed;inset:0;background:rgba(15,23,42,.65);backdrop-filter:blur(3px);z-index:9999999;display:flex;align-items:center;justify-content:center;padding:12px"><div id="modalBoletimBox" style="background:#fff;width:100%;max-width:1080px;max-height:98vh;overflow:auto;border-radius:16px;padding:14px 14px 10px 14px;box-shadow:0 20px 60px rgba(0,0,0,.35);border:1px solid #e2e8f0;animation:pop .18s ease;overflow-x:hidden;scrollbar-width:none;-ms-overflow-style:none">${botoes}<div style="height:10px"></div>${html}</div></div><style>@keyframes pop{from{transform:scale(.92);opacity:0}to{transform:scale(1);opacity:1}}#modalBoletimBox::-webkit-scrollbar{display:none;width:0;height:0}#dragHandle{cursor:grab}#dragHandle:active{cursor:grabbing}</style>`;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  (function(){ var box=document.getElementById('modalBoletimBox'); var handle=document.getElementById('dragHandle'); var overlay=document.getElementById('modalBoletim'); if(!box||!handle) return; var startX,startY,initLeft,initTop,dragging=false; function getPos(e){ var t=e.touches?e.touches[0]:e; return {x:t.clientX, y:t.clientY}; } function startDrag(e){ var p=getPos(e); dragging=true; startX=p.x; startY=p.y; var r=box.getBoundingClientRect(); initLeft=r.left; initTop=r.top; box.style.position='fixed'; box.style.left=initLeft+'px'; box.style.top=initTop+'px'; box.style.margin='0'; box.style.width=r.width+'px'; if(e.cancelable) e.preventDefault(); } function moveDrag(e){ if(!dragging) return; var p=getPos(e); box.style.left=(initLeft + p.x - startX)+'px'; box.style.top=(initTop + p.y - startY)+'px'; if(e.cancelable) e.preventDefault(); } function endDrag(){ dragging=false; } handle.addEventListener('mousedown', startDrag); handle.addEventListener('touchstart', startDrag, {passive:false}); window.addEventListener('mousemove', moveDrag); window.addEventListener('touchmove', moveDrag, {passive:false}); window.addEventListener('mouseup', endDrag); window.addEventListener('touchend', endDrag); overlay.addEventListener('click', function(e){ if(e.target===overlay) document.getElementById('modalBoletim').remove(); }); })();
}


function listarPendentesNA(a){ var lista=[]; for(var ciclo=1;ciclo<=4;ciclo++){ var chave='c'+ciclo; var obj = a[chave] || {}; for(var i=1;i<=13;i++){ var v = obj[i]; var teste = (i<10?'0'+i:i); if(v===undefined || v==='' || v===null){ lista.push('C'+ciclo+'-Teste '+teste+' - Pendente'); }else{ var num=parseFloat(v); if(!isNaN(num) && num<70){ lista.push('C'+ciclo+'-Teste '+teste+' - Nota abaixo de 70 (Nota: '+num+')'); } } } } return lista; }

function gerarCertificado(){ 
  if(!SELECIONADO && !DETALHE){ 
    var mat = document.getElementById("inputMatricula").value.trim(); 
    if(mat){ pesquisar(); return; } 
    alert("Selecione aluno"); return; 
  } 
  var a=DETALHE; 

  if(a.totalNA>0 || a.totalFeitos<52 || a.mediaGeral<70){ 
    var motivo='';
    var partes=[];
    if(a.totalNA>0) partes.push(a.totalNA+' nota(s) <70');
    if(a.totalFeitos<52) partes.push((52-a.totalFeitos)+' teste(s) faltando');
    if(partes.length>0) motivo = partes.join(' e ');
    else motivo='Média '+a.mediaGeral.toFixed(2)+' <70';
    modalCertificado(motivo, a.nome);
    return; 
  } 

 var meses=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']; 
  var dataHoje=new Date(); 
  var dataExtenso='Paragominas-PA, '+dataHoje.getDate()+' de '+meses[dataHoje.getMonth()]+' de '+dataHoje.getFullYear();

var assinatura = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEQAAAAkCAYAAAAw55zoAAAHgklEQVR4nN3ZeYzdVRUH8M97M52FLtGIRlxqVJJKKQkgWsGICypEBQVEjaQsCgTFRE0NikQlmooxhpjiEjCBqNVKJiKCG5YqgmirLNYQWYoF91aW1kLpTDtvnn+ce3Pve/NaO7W0HU5yM3d+dz/3+z3n3POYmjRTgRPQrkoLr+zRb1rJ7m66gVGsx5Op3sBinI6+1K///93gdJEhoYAZ+JVAyPb09wdVv1l7f2v7RvqEQuDN+IZCnXvwFTwntfebpvSZqjQVpTwDZ2OtopgVOLPqP2Nvbm5fygFV/Wv4K7YpSpkvqDOsKPBpLwMYTPW3Kl6nLQzu/NQ2aD+nz57YXFMgYgyHCIN7Kf6GidR+Jc5JfSYU5T2tJNuQPhwt6LFFoGIbxoXnGU/fHsUInp3GD5omFGqKQzar0p9KX9Wv9jSnKsZ0i86ArS1ilVz/IOZ2rTetpZFKv/AcTZwo0DAhbMcoFuE9+Hn6XscqP8VxwtjmOfYrqeF/qOD7Lbgd14no81S8bgfjT9aJiFEcU7V/HncJhWQEPYGDU/t+R5/ayH3TZMjX5W6swQ04Dc8Trnc+fqHQ5hhFyXBWNcfj2Ir7cEG19n4Tq+Q3R1Mc8jpl8/ficwIxvRT0GP4oEPAfgYKWiEcuTfMOCmO6UChhu1BIG5uxUii2Tyh3d9DSp9i6HZUpzVvf5kx8SRx0TOF/thFn4XBcLqBfK2i8qn+3xyZeiC9XfbJi/p7mJS5mn7jmXhqbKSBPxA/nCkU8gTnp+yIsS/UzhX05MfWbELexXdiSh3ENbsYv0/cj8QG8U8Qt+QZvFJRdnuYeFBeyI+kXF9BIe3qxQOxE+tZK7YNC6d8XL/Rm6rNLkqE1kA66LE2cvUcLm3CtCMfhjUKJYyYjpi4P4TKBrkHcmebbmubOSFyCl6W5+/S2LQ1FmXAGrt/J2uN4leIhp0yfvNBLBZxb6cA5JL8ptTeFYg7EHdXiuV9LodvOjHVbiWTbIq1wdrWn4aSY7ngot71FeXU/KRD5GXwa78bsNK577JRkWNzkHFwhkJGj0JVJCcMCTUTcMVIdcLvOG8rK+QOWCiT8LM1b98to2SYQdUiPvc0RNqdeby0uxmGeQhuUodWvPNzyxrfgNak9a/4N2CBuqaZPvvlR4VluU6iwQKBra9V/tKrfii+mshQ/rNruxSeF0rppMCOVvh5tuy0NJZx/rgi9MzXa+BHel/oOCrTMFh6qmz61FxrH94SSCaRdLOzMmEBHRlRNq81YhU8or+ha9lrkO1zVrxIHyre+Wlj4fAt9OCn163WwbVX9ahxUzX2cOHT9Lsqv6VFB1fO79jXDPoh0cx61Hz/ReWNZOe8XKMpyRtWvpkOmUDaim/BtBVVrFbuSY5+adluFaz40rdPL0D7lknnYEGH5EuX268OuSBsdxEtwHtYpMUG3t6nRco1wjTAPFynKyP3Gqv6/w0erPQ7t6UP/L6l/bznW5Od9bQgvEEEeAfNxobjannSXNfis4vJfkMau15lWaOlU5IgSt+xVtGSEDAlqnCTsR0uBdq7nQOxGnYqq3fGEoN8l6e+G9H1lmjvL1YoiajTemtZvi0fn4mrMXkXLzKq+XDlc/Y6py2rhGt8hUouZAhkxd6a5TlGUeQWOEo+9BYIaNc0mROD2aqHAsbT+jwXd6MzZ7HHJmbMMxyEcL+KJHMHmmx8Xr+PsnleJnAkRR6yrDjAhKPcbPJD+z4i6X8nqDwjblVMMmXrXp/bzlJ9B7sGFXfufcrjeS3L80T3RAnzKZCRsUQK2Zwl3ukLc6OZq86dUY7rplNG2VeRNfi/C8ixzhX3KfTemPnPTmjcoCrtFPCLreGW3cy7dSng5PqxwNpfbhSFcKJCQPcGSaiM3K1BfLLzQkSI3kt1vzqP08j5X4fVKON4UD8Sbqj6X4xWp/eOKC2/jt3ibgu5diltyjFH/QH1UOsAdOm/y1yJptKBrjg+lTWbqfCd9P0g8tPIhvyVQ8oDJb55uT5KN6J90/ihG0PbtwgvlcXfjiHSeI3RG1ZcosUv+bbqn5Cx7lnnitmuf/6iA/MFdY48XOZNzhKd4pDrQI8IOPNg111RLS9BwLf4ich4bheG9MP19sOr/sEhCEZHsufh3arsN71IQMlCfPbvRdvr/dJHoOVpwMkeSQ8J6PyZyH7PE7T2OF1UTrkoKGE+LzlLc6Fpx26fh+fin8BLrlERPMx2+KRLaJwj7kR9pBGXvS/uerbyOj03z5gRVQ6Q0l+Ff4sf3k0XGjqD0iIh9pDEaSYMLUueL9JaW8AJ/TvVGqo+Im2ukjW2oxpyP94rX8EPC2K3BxwTK2sIFX4av7mBdIt7JNJ4Qiuwls/FMJWt3mMjIHSByOgurvecLXI2vC+RvzBOt1xk/jIp3xKZ0iI+IiHFXpCEMXz7APHHgf9gxHZZWmxxSouGdJXMyYvp1omdncqCwZW8SdLq/ax8r8IVMlwnBu2uFtu5SbEB92Nrg5nG6vmX6zRDGkri9gTR+kchgHS6M7nJhiFtCAa2uObuDqnqNWjL96//z2O2Tu5slgrrXCpYMYfi/P4zqKG6Ar5EAAAAASUVORK5CYII=";

  var html=`
  <style>
    @media print{
      @page{ size:A4 landscape; margin:0; }
      body *{ visibility:hidden; }
      #boletim, #boletim *{ visibility:visible; }
      #boletim{ position:absolute; left:0; top:0; width:100%; margin:0; padding:0; }
      .no-print{ display:none !important; }
      #certWrap{ overflow:visible !important; }
      #certPrint{ transform:none !important; width:100% !important; max-width:100% !important; }
    }
  </style>

  <div id="certWrap" style="width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; display:flex; justify-content:center; background:#e5e7eb; padding:8px 0;">
    <div id="certPrint" style="background:#fff; width:800px; min-width:800px; font-family:'Segoe UI', Arial, sans-serif; border:8px solid #0f2a4a; position:relative; padding:0; box-shadow:0 0 0 2px #c9a86a inset;">
      <div style="border:1px solid #c9a86a; margin:6px; padding:0; position:relative; background: linear-gradient(180deg, #ffffff 0%, #f8f9fc 100%);">
        <div style="height:8px; background: linear-gradient(90deg, #0f2a4a 0%, #1e4a7a 50%, #c9a86a 100%);"></div>
        <div id="dragHandleCert" style="display:flex; justify-content:space-between; align-items:center; padding:18px 28px 10px 28px; cursor:move; touch-action:none; user-select:none;">
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="https://i.postimg.cc/KKy4nMGY/igreja.jpg" style="width:auto; height:58px; object-fit:contain; display:block;">
            <div style="line-height:1.2;">
              <div style="font-size:11px; font-weight:900; color:#0f2a4a; letter-spacing:1px;">ADEMIP</div>
              <div style="font-size:8px; color:#555; max-width:180px;">Igreja Evangélica Assembleia de Deus Missões</div>
              <div style="font-size:8px; color:#0f2a4a; font-weight:700;">Pr. Eliezer Miranda Barbosa – Presidente</div>
            </div>
          </div>
          <div style="text-align:right; font-size:9px; color:#666;">
            <div>Matrícula: <b style="color:#0f2a4a;">${a.mat}</b></div>
            <div>Média: <b style="color:#198754;">${a.mediaGeral.toFixed(2)}</b></div>
            <div style="font-size:7px; margin-top:2px; background:#f1f5f9; padding:2px 6px; border-radius:4px; display:inline-block;">${a.totalFeitos||52}/52 Testes Concluídos</div>
          </div>
        </div>
        <div style="text-align:center; padding:8px 20px 0 20px;">
          <div style="font-size:9px; letter-spacing:4px; color:#c9a86a; font-weight:800;">CERTIFICADO DE CONCLUSÃO</div>
          <div style="font-family:Georgia, serif; font-size:42px; font-weight:900; color:#0f2a4a; letter-spacing:2px; margin:4px 0; line-height:1;">CERTIFICADO</div>
          <div style="width:80px; height:3px; background: linear-gradient(90deg, #c9a86a, #0f2a4a); margin:0 auto 10px auto; border-radius:2px;"></div>
        </div>
        <div style="text-align:center; padding:10px 50px 10px 50px; line-height:1.6;">
          <div style="font-size:12px; color:#333;">Certificamos que</div>
          <div style="font-size:20px; font-weight:900; color:#0f2a4a; text-transform:uppercase; margin:8px 0; letter-spacing:0.5px; border-bottom:2px solid #e8dcc0; display:inline-block; padding-bottom:4px;">${a.nome.toUpperCase()}</div>
          <div style="font-size:14px; color:#444; margin-top:10px; text-align:justify; text-align-last:left;">
            Concluiu com êxito o <b>Curso de Discipulado – Ciclos 01 ao 04 com 52 Lições</b>, 
            ministrado pela Igreja Evangélica Assembleia de Deus Missões – ADEMIP. 
            Demonstrando dedicação, esforço, persistência, aproveitamento 
            e aptidão no exercício da Fé Cristã.
          </div>
          <div style="display:flex; justify-content:center; gap:20px; margin-top:14px;">
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:6px 14px; font-size:10px;"><b>Congregação:</b> ${a.congOrig||a.cong||''}</div>
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:6px 14px; font-size:10px;"><b>Status:</b> <span style="color:#16a34a; font-weight:900;">APROVADO</span></div>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:flex-end; padding:18px 40px 22px 40px;">
          <div style="text-align:center;">
            <div style="width:80px; height:80px; border-radius:50%; background: radial-gradient(circle at 30% 30%, #f9e7a0, #c9a86a); border:2px solid #a88b4a; display:flex; align-items:center; justify-content:center; margin:0 auto 6px auto; box-shadow:0 2px 8px rgba(0,0,0,0.15);">
              <div style="font-size:10px; font-weight:900; color:#0f2a4a; line-height:1;">ADEMIP<br><span style="font-size:14px;">★</span><br>2026</div>
            </div>
            <div style="font-size:7px; color:#888;">Selo Oficial</div>
          </div>
          <div style="text-align:center;">
            <img src="${assinatura}" style="height:36px; width:auto; display:block; margin:0 auto 2px auto;">
            <div style="width:180px; border-top:1px solid #0f2a4a; padding-top:6px;">
              <div style="font-size:10px; font-weight:800; color:#0f2a4a;">Pr. Eliezer Miranda Barbosa</div>
              <div style="font-size:8px; color:#555;">Presidente ADEMIP</div>
            </div>
          </div>
        </div>
        <div style="background:#0f2a4a; color:#c9a86a; text-align:center; padding:8px; font-size:8px; letter-spacing:0.5px;">
          ${dataExtenso} • ADEMIP Paragominas-PA • Documento válido com média ${a.mediaGeral.toFixed(2)}
        </div>
      </div>
    </div>
  </div>
  <div class="no-print" style="max-width:800px; margin:12px auto; padding:0 12px; display:flex; gap:8px;">
    <button onclick="window.print()" style="flex:1; height:44px; background:#0f2a4a; color:#fff; border:0; border-radius:8px; font-weight:900;">🖨 IMPRIMIR</button>
    <button onclick="enviarZapPDF()" style="flex:1; height:44px; background:#25D366; color:#fff; border:0; border-radius:8px; font-weight:900;">📲 ENVIAR ZAP</button>
    <button onclick="document.getElementById('boletim').style.display='none'; var m=document.getElementById('modalCert'); if(m) m.remove();" style="flex:1; height:44px; background:#e5e7eb; color:#111; border:0; border-radius:8px; font-weight:700;">FECHAR</button>
  </div>`;

  if(document.getElementById('modalBoletim')) document.getElementById('modalBoletim').remove();
  if(document.getElementById('modalCert')) document.getElementById('modalCert').remove();

  var modalCert = `
  <div id="modalCert" style="position:fixed;inset:0;background:rgba(15,23,42,.65);backdrop-filter:blur(3px);z-index:9999999;display:flex;align-items:center;justify-content:center;padding:12px">
    <div id="modalCertBox" style="background:#fff;width:100%;max-width:1080px;max-height:96vh;overflow:auto;border-radius:16px;padding:14px;box-shadow:0 20px 60px rgba(0,0,0,.35);border:1px solid #e2e8f0;animation:pop .18s ease;scrollbar-width:none;-ms-overflow-style:none">
      <div id="boletim" style="display:block">${html}</div>
    </div>
  </div>
  <style>
    @keyframes pop{from{transform:scale(.92);opacity:0}to{transform:scale(1);opacity:1}}
    #modalCertBox::-webkit-scrollbar{display:none;width:0;height:0}
    #dragHandleCert{cursor:grab} #dragHandleCert:active{cursor:grabbing}
  </style>`;

  document.body.insertAdjacentHTML('beforeend', modalCert);

  // ARRASTAR COM MOUSE + FECHAR CLICANDO FORA - SÓ ISSO
  (function(){
    var box=document.getElementById('modalCertBox');
    var handle=document.getElementById('dragHandleCert');
    var overlay=document.getElementById('modalCert');
    if(!box||!handle||!overlay) return;
    var sX,sY,iL,iT,d=false;
    function g(e){var t=e.touches?e.touches[0]:e;return{x:t.clientX,y:t.clientY}}
    function sd(e){var p=g(e);d=true;sX=p.x;sY=p.y;var r=box.getBoundingClientRect();iL=r.left;iT=r.top;box.style.position='fixed';box.style.left=iL+'px';box.style.top=iT+'px';box.style.margin='0';box.style.width=r.width+'px';box.style.maxWidth='1080px';if(e.cancelable)e.preventDefault()}
    function md(e){if(!d)return;var p=g(e);box.style.left=(iL+p.x-sX)+'px';box.style.top=(iT+p.y-sY)+'px';if(e.cancelable)e.preventDefault()}
    function ed(){d=false}
    handle.addEventListener('mousedown',sd);
    handle.addEventListener('touchstart',sd,{passive:false});
    window.addEventListener('mousemove',md);
    window.addEventListener('touchmove',md,{passive:false});
    window.addEventListener('mouseup',ed);
    window.addEventListener('touchend',ed);
    overlay.addEventListener('click',function(e){if(e.target===overlay) overlay.remove()});
  })();
}

function modalCertificado(motivo, nomeAluno){
  if(document.getElementById('modalCert')) document.getElementById('modalCert').remove();
  let m = String(motivo||'');
  m = m.replace(/(\d+)\s*nota\(s\)\s*<\s*70/gi, '$1 Teste(s) com notas insuficiente');
  m = m.replace(/(\d+)\s*nota\(s\)\s*menor do que 70/gi, '$1 Teste(s) com notas insuficiente');
  m = m.replace(/nota\(s\)\s*<\s*70/gi, 'Teste(s) com notas insuficiente');
  m = m.replace(/nota\(s\)\s*menor do que 70/gi, 'Teste(s) com notas insuficiente');
  document.body.insertAdjacentHTML('beforeend', `
  <div id="modalCert" style="position:fixed;inset:0;background:rgba(15,23,42,.65);backdrop-filter:blur(3px);z-index:9999999;display:flex;align-items:center;justify-content:center;padding:16px">
    <div style="background:#fff;width:100%;max-width:420px;border-radius:16px;padding:26px 24px;text-align:left;box-shadow:0 20px 60px rgba(0,0,0,.35);border:1px solid #e2e8f0;animation:pop .18s ease">
      <div style="color:#dc3545;font-weight:900;font-size:19px;margin-bottom:12px;text-align:center">Atenção</div>
      <div style="font-weight:800;font-size:15px;color:#111827;margin-bottom:10px;text-align:center">Desculpe, certificado indisponível</div>
      <div style="background:#fef2f2;border-left:4px solid #dc3545;padding:10px 12px;border-radius:8px;margin-bottom:12px;font-size:13px;color:#7f1d1d">
        Motivo: <b style="color:#991b1b">${m}</b>
      </div>
      <div style="font-size:13.5px;color:#334155;line-height:1.5;text-align:left">
        Caríssimo aluno, <b style="color:#111827">${String(nomeAluno||'').toUpperCase()}</b>, por gentileza, finalize seu curso.<br><br>
        Para acesso ao certificado é necessário que todos os dados cadastrais e testes sejam completos.
      </div>
      <div style="margin-top:20px;display:flex;justify-content:center;gap:12px">
        <button onclick="gerarBoletim();document.getElementById('modalCert').remove()" style="background:#1e3a8a;color:#fff;border:0;border-radius:22px;padding:11px 0;width:125px;font-weight:800;font-size:10px;cursor:pointer">Ver Boletim</button>
        <button onclick="document.getElementById('modalCert').remove(); enviarBoletimZap()" style="background:#059669;color:#fff;border:0;border-radius:22px;padding:11px 0;width:125px;font-weight:800;font-size:12px;cursor:pointer">Gerar Relatorio</button>
        <button onclick="document.getElementById('modalCert').remove()" style="background:#334155;color:#fff;border:0;border-radius:22px;padding:11px 0;width:125px;font-weight:800;font-size:12px;cursor:pointer">Fechar</button>
      </div>
    </div>
  </div>
  <style>@keyframes pop{from{transform:scale(.92);opacity:0}to{transform:scale(1);opacity:1}}</style>`);
}

function enviarZapPDF(){
  var a=DETALHE; if(!a) return;
  var btn = document.querySelector('button[onclick="enviarZapPDF()"]');
  var textoOriginal = btn? btn.innerHTML : '';
  if(btn){ btn.innerHTML = '⏳ GERANDO PDF...'; btn.disabled = true; }
  function carregarScript(src){
    return new Promise((res, rej)=>{
      if(document.querySelector('script[src="'+src+'"]')) return res();
      var s=document.createElement('script');
      s.src=src; s.onload=res; s.onerror=rej;
      document.head.appendChild(s);
    });
  }
  Promise.all([
    carregarScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
    carregarScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
  ]).then(()=>{
    var elemento = document.getElementById('certPrint');
    if(!elemento){ alert('Certificado não encontrado'); return; }
    var escala = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)? 2.5 : 4;
    return html2canvas(elemento, {scale:escala, useCORS:true, backgroundColor:'#ffffff', logging:false, letterRendering:true}).then(canvas=>{
      var imgData = canvas.toDataURL('image/jpeg', 0.95);
      var { jsPDF } = window.jspdf;
      var pdf = new jsPDF('landscape', 'mm', 'a4');
      var pdfWidth = pdf.internal.pageSize.getWidth();
      var pdfHeight = pdf.internal.pageSize.getHeight();
      var imgWidth = pdfWidth;
      var imgHeight = canvas.height * imgWidth / canvas.width;
      var x = 0; var y = 0;
      if(imgHeight > pdfHeight){
        imgHeight = pdfHeight;
        imgWidth = canvas.width * imgHeight / canvas.height;
        x = (pdfWidth - imgWidth)/2;
      }
      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight, undefined, 'SLOW');
      var nomeArquivo = 'Certificado-'+a.nome.replace(/[^a-zA-Z0-9]/g,'_')+'.pdf';
      var pdfBlob = pdf.output('blob');
      var pdfFile = new File([pdfBlob], nomeArquivo, {type:'application/pdf'});
      if(navigator.canShare && navigator.canShare({files:[pdfFile]})){
        return navigator.share({ files: [pdfFile], title: 'Certificado ADEMIP', text: `Certificado de ${a.nome} - Curso de Discipulado ADEMIP` }).catch(()=>{});
      } else {
        pdf.save(nomeArquivo);
        setTimeout(()=>{
          var msg = `*ADEMIP - CERTIFICADO*%0A%0A`+`Parabéns *${encodeURIComponent(a.nome.toUpperCase())}*! 🎓%0A`+`Seu Certificado foi gerado em PDF!%0A`+`*Matrícula:* ${a.mat}%0A`+`*Média:* ${sf(a.mediaGeral)}%0A%0A`+`Acabei de baixar o PDF. Agora é só anexar aqui no WhatsApp.`;
          window.open('https://wa.me/?text='+msg, '_blank');
        }, 800);
      }
    });
  }).catch(err=>{
    console.error(err);
    alert('Erro ao gerar PDF. Tente clicar em IMPRIMIR e salvar como PDF.');
    window.print();
  }).finally(()=>{
    if(btn){ btn.innerHTML = textoOriginal || '📲 ENVIAR ZAP'; btn.disabled = false; }
  });
}

function carregarIgrejas(){ google.script.run.withSuccessHandler(function(lista){ LISTA_IGREJAS_CACHE=lista; }).getListaIgrejas(); }
function filtrarIgrejas(){ var termo=semAcentoJS(document.getElementById('cadIgreja').value); var lista=LISTA_IGREJAS_CACHE.filter(function(n){ return!termo || semAcentoJS(n).indexOf(termo)!=-1; }); renderDropdownIgrejas(lista); mostrarIgrejas(); }
function renderDropdownIgrejas(lista){ var drop=document.getElementById('dropdownIgrejas'); if(!drop) return; drop.innerHTML=''; lista.slice(0,50).forEach(function(nome){ var div=document.createElement('div'); div.className='dropdown-item'; div.innerHTML='<b>'+nome+'</b>'; div.onclick=function(){ document.getElementById('cadIgreja').value=nome; esconderIgrejas(); }; drop.appendChild(div); }); }
function mostrarIgrejas(){ var d=document.getElementById('dropdownIgrejas'); if(d) d.style.display='block'; }
function esconderIgrejas(){ var d=document.getElementById('dropdownIgrejas'); if(d) d.style.display='none'; }
function navegarIgrejas(e){ var drop=document.getElementById('dropdownIgrejas'); var itens=drop?drop.querySelectorAll('.dropdown-item'):[]; if(!itens.length) return; if(e.key==='ArrowDown'){ e.preventDefault(); idxIgrejaSel=Math.min(idxIgrejaSel+1, itens.length-1); itens.forEach(it=>it.classList.remove('selecionado')); if(itens[idxIgrejaSel]){itens[idxIgrejaSel].classList.add('selecionado');} } else if(e.key==='Enter'){ e.preventDefault(); if(idxIgrejaSel>=0 && itens[idxIgrejaSel]) itens[idxIgrejaSel].click(); } else if(e.key==='Escape'){ esconderIgrejas(); } }
document.addEventListener('click', function(e){ var w1=document.querySelector('#modalCadastro.dropdown-wrapper'); var i1=document.getElementById('cadIgreja'); if(w1 &&!w1.contains(e.target) && e.target!==i1){ esconderIgrejas(); } var w2=document.getElementById('dropdownAcessoNome'); var i2=document.getElementById('acessoNome'); if(w2 &&!w2.parentElement.contains(e.target) && e.target!==i2){ esconderAcessoNomes(); } });
function abrirCadastro(){ document.getElementById('modalCadastro').style.display='flex'; carregarIgrejas(); }
function fecharCadastro(){ document.getElementById('modalCadastro').style.display='none'; }
function limparCadastro(){ ['cadNomeUsuario','cadCPF','cadMatricula','cadContato','cadIgreja','cadSenha'].forEach(id=>{var el=document.getElementById(id); if(el) el.value='';}); }
function fazerCadastroNovo(){ var msg=document.getElementById('msgCadastro'); var dados={ nomeUsuario: document.getElementById('cadNomeUsuario').value.trim(), cpf: document.getElementById('cadCPF').value, matricula: document.getElementById('cadMatricula').value, contato: document.getElementById('cadContato').value, sexo: document.getElementById('cadSexo').value, igreja: document.getElementById('cadIgreja').value, senha: document.getElementById('cadSenha').value, status: document.getElementById('cadStatus')? document.getElementById('cadStatus').value : 'EM ANALISE', linha: LINHA_EDICAO_ATUAL }; msg.style.color="#0d6efd"; msg.innerText="Salvando..."; google.script.run.withSuccessHandler(function(r){ msg.style.color=r.ok?"#198754":"#c00"; msg.innerText=r.msg; if(r.ok){ carregarListaAcessoNomes(); } }).cadastrarUsuario(dados); }
function carregarEdicaoCadastro(){ var div=document.getElementById('listaEdicaoCadastro'); if(!div) return; div.innerHTML='Carregando...'; fetch(API_URL + "?action=getlistaedicaocadastro").then(r=>r.json()).then(lista=>{ CACHE_EDICAO=lista; renderEdicaoCadastro(lista); }); }
function renderEdicaoCadastro(lista){ var div=document.getElementById('listaEdicaoCadastro'); if(!div) return; if(!lista || lista.length==0){ div.innerHTML='Nenhum cadastro'; return; } var html='<table style="width:100%;border-collapse:collapse;font-size:12px"><tr style="background:#000;color:#fff"><th>NOME</th><th>STATUS</th><th>MAT</th><th>ACAO</th></tr>'; lista.forEach(function(it){ var cor=it.status=='APROVADO'?'#16a34a':'#dc2626'; html+='<tr><td>'+it.nome.toUpperCase()+'</td><td style="text-align:center"><span style="background:'+cor+';color:#fff;padding:2px 6px;border-radius:4px">'+it.status+'</span></td><td style="text-align:center">'+it.matricula+'</td><td style="text-align:center"><button onclick="editarCadastro(\''+it.matricula+'\')" style="background:#0d6efd;color:#fff;border:0;border-radius:6px;padding:4px 8px">EDITAR</button></td></tr>'; }); html+='</table>'; div.innerHTML=html; }
function filtrarEdicaoCadastro(){ var termo=semAcentoJS(document.getElementById('pesqEdicao').value.toUpperCase()); var lista=CACHE_EDICAO.filter(function(a){ return!termo || semAcentoJS(a.nome).indexOf(termo)!=-1 || String(a.matricula).indexOf(termo)!=-1; }); renderEdicaoCadastro(lista); }
function editarCadastro(linha){ var item=CACHE_EDICAO.find(function(a){return a.linha==linha}); if(!item) return; document.getElementById('cadNomeUsuario').value=item.nome; document.getElementById('cadMatricula').value=item.matricula||''; document.getElementById('cadIgreja').value=item.igreja||''; document.getElementById('cadSenha').value=item.senha||''; var st=document.getElementById('cadStatus'); if(st) st.value=item.status||'EM ANALISE'; LINHA_EDICAO_ATUAL=linha; }
function enviarBoletimZap(){ if(!DETALHE){ alert('Gere o boletim primeiro'); return; } var pend = listarPendentesNA(DETALHE); var blocoPend = pend.length>0? '\n\nPENDÊNCIAS:\n'+pend.join('\n') : '\n\nNenhuma pendência - Tudo OK'; var relatorio = `BOLETIM DISCIPULADO - ADEMIP\n\nAluno: ${DETALHE.nome.toUpperCase()}\nCongregação: ${DETALHE.congOrig||DETALHE.cong||''}\nMatrícula: ${DETALHE.mat}\nTotal Pontos: ${DETALHE.totalSoma||0}\nFeitos: ${(DETALHE.totalFeitos||0)}/52\nMédia Geral: ${sf(DETALHE.mediaGeral)}\nStatus: ${DETALHE.status||''}${blocoPend}`; var zapRaw = (DETALHE.zap || SELECIONADO?.zap || '').toString().replace(/\D/g,''); if(zapRaw.length>=10){ if(zapRaw.length==10||zapRaw.length==11) zapRaw='55'+zapRaw; window.open('https://wa.me/'+zapRaw+'?text='+encodeURIComponent(relatorio), '_blank'); } else { window.open('https://wa.me/?text='+encodeURIComponent(relatorio), '_blank'); } }
async function enviarPdfZap(){
  if(!DETALHE){ alert('Clique em BOLETIM primeiro'); return; }
  var el = document.getElementById('boletimPrint');
  if(!el){ alert('Gere o boletim primeiro'); return; }
  var nomeArquivo = 'BOLETIM_'+(DETALHE.nome||'aluno').replace(/\s+/g,'_')+'_'+(DETALHE.mat||'')+'.pdf';
  document.getElementById('boletim').style.display='block';
  el.style.display='block';
  ensureHtml2pdf(async function(){
    try{
      var opt = { margin: [2,2,2,2], filename: nomeArquivo, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false, scrollY: 0 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
      var pdfBlob = await html2pdf().set(opt).from(el).outputPdf('blob');
      var file = new File([pdfBlob], nomeArquivo, {type:'application/pdf'});
      if(navigator.canShare && navigator.canShare({files:[file]})){
        await navigator.share({ files:[file], title: nomeArquivo, text: 'Boletim '+DETALHE.nome.toUpperCase() });
      }else{
        await html2pdf().set(opt).from(el).save();
        setTimeout(function(){
          var pend = listarPendentesNA(DETALHE);
          var bloco = pend.length? '\n\nPENDÊNCIAS:\n'+pend.join('\n') : '\n\nTudo OK - APROVADO';
          var txt = `BOLETIM DISCIPULADO - ADEMIP\nAluno: ${DETALHE.nome.toUpperCase()}\nMat: ${DETALHE.mat}\nMédia: ${sf(DETALHE.mediaGeral)}\nStatus: ${DETALHE.status}${bloco}\n\nPDF baixado - envie em anexo`;
          var zap = (DETALHE.zap||'').replace(/\D/g,'');
          if(zap.length==10||zap.length==11) zap='55'+zap;
          window.open(zap? 'https://wa.me/'+zap+'?text='+encodeURIComponent(txt) : 'https://wa.me/?text='+encodeURIComponent(txt), '_blank');
        }, 1500);
      }
    }catch(e){
      var opt2 = { margin: 2, filename: nomeArquivo, image: {type:'jpeg',quality:0.98}, html2canvas: {scale:2,useCORS:true,backgroundColor:'#fff'}, jsPDF: {unit:'mm',format:'a4',orientation:'portrait'} };
      await html2pdf().set(opt2).from(el).save();
    }
  });
}

function exportarRelatorio(){
  if(!ATUAL || ATUAL.length < 2){
    alert("Nada para gerar! Clique em PESQUISAR primeiro.");
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'mm', 'a4');
  var totalFiltrado = ATUAL.length - 1;
  var cidade = document.getElementById('fCidade') ? document.getElementById('fCidade').value : '';
  var nome = document.getElementById('fNome') ? document.getElementById('fNome').value : '';
  var statusFiltro = document.getElementById('fStatus') ? document.getElementById('fStatus').value : 'APRO';
  var titulo = "Relatorio de Alunos - "+ totalFiltrado +" Localizados";
  var subTitulo = "Filtros: Cidade=["+ (cidade||"TODAS") +"]  Status=["+statusFiltro+"]  Nome=["+(nome||"-")+"]  Data: "+ new Date().toLocaleString();
  var corpo = ATUAL.slice(1).map(function(r, idx){
    return [ String(idx+1).padStart(4,'0'), semAcentoJS(r[1]||''), semAcentoJS(r[2]||''), r[3]||'', r[4]||'', r[5]||'', r[6]||'', r[8]||'', r[10]||'', r[12]||'', semAcentoJS(r[15]||'') ];
  });
  doc.autoTable({
    head: [['ITEM','CONGREGACAO','NOME','WHATSAPP','MATRICULA','QTD','C1','C2','C3','C4','STATUS']],
    body: corpo,
    startY: 22,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [0,0,0], textColor: [255,255,255], fontStyle: 'bold' },
    columnStyles: { 0: { halign: 'left', cellWidth: 10 }, 3: { halign: 'center' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' }, 7: { halign: 'right' }, 8: { halign: 'right' }, 9: { halign: 'right' } },
    didParseCell: function(data){ if(data.section === 'body' && data.row.raw[10].indexOf('APROVADO') !== -1){ data.cell.styles.fillColor = [240, 240, 240]; data.cell.styles.fontStyle = 'bold'; } },
    didDrawPage: function(data){ doc.setFontSize(14); doc.setFont("helvetica","bold"); doc.text(titulo, 14, 12); doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.text(subTitulo, 14, 18); }
  });
  var totalPages = doc.internal.getNumberOfPages();
  var totalStr = String(totalPages).padStart(2, '0');
  for(var i = 1; i <= totalPages; i++){
    doc.setPage(i);
    var pagAtualStr = String(i).padStart(2, '0');
    doc.setFontSize(8);
    doc.setFont("helvetica","normal");
    var pageHeight = doc.internal.pageSize.height;
    var pageWidth = doc.internal.pageSize.width;
    doc.setFillColor(255,255,255);
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
    doc.text("Relatorio de Alunos", 14, pageHeight - 8);
    doc.text("Pagina " + pagAtualStr + "/" + totalStr, pageWidth - 20, pageHeight - 8, { align: 'right' });
  }
  doc.save('relatorio_'+ totalFiltrado +'_alunos_'+ new Date().toISOString().slice(0,10) +'.pdf');
}

function VBoletimZap(){
  if(!window.TOTAL_ORIGINAL || TOTAL_ORIGINAL.length < 2){ alert("Clique em PESQUISAR primeiro"); return; }
  var listaTotal = window.TOTAL_ORIGINAL;
  var listaFiltro = window.ATUAL;
  var totalAlunos = listaFiltro.length - 1;
  var concluintes = 0;
  var emConclusao = 0;
  var testeRealizado = 0;
  for(var j=1; j<listaTotal.length; j++){ testeRealizado += parseInt(listaTotal[j][5] || 0); }
  for(var i=1; i<listaFiltro.length; i++){
    var status = (listaFiltro[i][15] || "").toUpperCase();
    if(status.indexOf("APROVADO") !== -1) concluintes++;
    if(status.indexOf("PENDENTE") !== -1) emConclusao++;
  }
  var texto = "-- Boletim Informativo --\n---------------------------------------------\nPovo de Deus\nTotal de alunos no curso: " + totalAlunos + "\nTeste Realizado: " + testeRealizado + "\nConcluintes: " + concluintes + " Alunos\nEm conclusao: " + emConclusao + " Alunos\n---------------------------------------------\nSe anime povo!\n---------------------------------------------\nOutros cursos serao disponibilizados por aqui.\nAguardando nosso Pastor deliberar";
  window.open("https://wa.me/?text="+encodeURIComponent(texto),"_blank");
}

const URL_WEBAPP = "https://script.google.com/macros/s/AKfycbxLXw-nu5oXXtjE8HKik_W_bbT9CGjTNJWw-dUm4wWYv-hjcz1dOhMHLxoUTRHGJA3D0A/exec"; // PRINCIPAL - DADOS
const URL_LOG = "https://script.google.com/macros/s/AKfycbxAwYpt5cBWB3IMmQ1nfZUKew4WUhP2DFGc_bPdFOqoxQlqqM2c9CQBR2XoS8ku0ORSBg/exec"; // NOVA - LibC
let allDados=[]; let dadosVisiveis=[]; let progressoInterval=null; let progresso=0;
let idxSelecionado=-1;

const KEY_FILTRO = "filtroLiberacao70";
const KEY_DADOS = "dadosLiberacao70";
const KEY_CICLO = "cicloLiberacao70";

function normalizar(t){ return String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim(); }
function salvarPersistencia(){
  try{
    let fMat = document.getElementById('fMat')?.value || "";
    let fNome = document.getElementById('fNome')?.value || "";
    let fCong = document.getElementById('fCong')?.value || "";
    let ciclo = document.getElementById('ciclo')?.value || "";
    localStorage.setItem(KEY_FILTRO, JSON.stringify({fMat, fNome, fCong}));
    localStorage.setItem(KEY_CICLO, ciclo);
    if(allDados && allDados.length) localStorage.setItem(KEY_DADOS, JSON.stringify(allDados));
  }catch(e){}
}

function restaurarPersistencia(){
  try{
    let cicloSalvo = localStorage.getItem(KEY_CICLO);
    if(cicloSalvo && document.getElementById('ciclo')) document.getElementById('ciclo').value = cicloSalvo;
    let fRaw = localStorage.getItem(KEY_FILTRO);
    if(fRaw){
      let f = JSON.parse(fRaw);
      if(document.getElementById('fMat')) document.getElementById('fMat').value = f.fMat || "";
      if(document.getElementById('fNome')) document.getElementById('fNome').value = f.fNome || "";
      if(document.getElementById('fCong')) document.getElementById('fCong').value = f.fCong || "";
    }
    let dRaw = localStorage.getItem(KEY_DADOS);
    if(dRaw){
      let dados = JSON.parse(dRaw);
      if(Array.isArray(dados) && dados.length){
        allDados = dados;
        render(allDados);
        document.querySelector('.list-wrap').style.display='block';
        document.getElementById('btnEnviar').style.display='block';
        let cicloSel = document.getElementById('ciclo').value;
        let cicloTxt = cicloSel==='TODOS'? 'TODOS' : 'CICLO '+String(cicloSel).padStart(2,'0');
        document.getElementById('msg').innerText = allDados.length+' <70 | '+cicloTxt+' | Restaurado';
        filtrar();
      }
    }
  }catch(e){}
}

function setProgresso(v,txt){
  document.getElementById('pWrap').style.display='block';
  document.getElementById('pBar').style.width=v+'%';
  document.getElementById('pBar').innerText=txt?txt:v+'%';
}
function iniciarProgressoFake(ciclo){
  document.querySelector('.list-wrap').style.display='none';
  progresso=0; setProgresso(0,'INICIANDO CICLO '+ciclo+'...');
  document.getElementById('msg').innerText='Buscando dados no Ciclo '+ciclo+' - 0%';
  progressoInterval=setInterval(()=>{
    if(progresso<85){
      progresso+=Math.random()*8;
      let p=Math.floor(progresso);
      setProgresso(p,'BUSCANDO CICLO '+ciclo+' '+p+'%');
      document.getElementById('msg').innerText='Buscando dados no Ciclo '+ciclo+' - '+p+'%';
    }
  },400);
}
function finalizarProgresso(){clearInterval(progressoInterval);setProgresso(100,'FINALIZADO 100%');setTimeout(()=>{document.getElementById('pWrap').style.display='none';},1500);}

function mostraResultado(retorno){
  clearInterval(progressoInterval);
  setProgresso(90,'PROCESSANDO...');
  let dados = retorno;
  if(typeof retorno==='string'){
    try{ dados = JSON.parse(retorno); }catch(e){ dados=[]; }
  }
  if(dados && dados.data) dados = dados.data;
  if(dados && dados.length>0 && typeof dados[0]==='object' &&!Array.isArray(dados[0])){
    dados = dados.map(it=>[it.MATRICULA||it.A||it[0]||'', it.CONGREGACAO||it.D||it[1]||'', it.CONTATO||it.C||it[2]||'', it.NOME||it.B||it[3]||'', it.CICLO||it.E||it[4]||'', it.TESTE||it.F||it[5]||'', it.NOTA||it.G||it[6]||'']);
  }
  mostraTabela(dados);
}

function buscarTabela(){
  setProgresso(95,'CARREGANDO LIBERACAO...');let s=document.createElement('script');s.src=URL_WEBAPP+"?action=getliberacao&callback=mostraTabela&t="+Date.now();document.body.appendChild(s);
}

function mostraTabela(dados){
  document.querySelector('.list-wrap').style.display='block';
  document.getElementById('btn').disabled=false;
  let arr = dados;
  if(dados && dados.data) arr = dados.data;
  if(!Array.isArray(arr)) arr=[];
  if(arr.length>0 && typeof arr[0]==='object' &&!Array.isArray(arr[0])){
    arr = arr.map(it=>[it.MATRICULA||it.A||it[0]||'', it.CONGREGACAO||it.D||it[1]||'', it.CONTATO||it.C||it[2]||'', it.NOME||it.B||it[3]||'', it.CICLO||it.E||it[4]||'', it.TESTE||it.F||it[5]||'', it.NOTA||it.G||it[6]||'']);
  }
  allDados=arr||[];
  idxSelecionado=-1;
  render(allDados);
  finalizarProgresso();
  salvarPersistencia();
  let cicloSel = document.getElementById('ciclo').value;
  let cicloTxt = cicloSel==='TODOS'? 'TODOS' : 'CICLO '+String(cicloSel).padStart(2,'0');
  document.getElementById('msg').innerText=allDados.length+' <70 | '+cicloTxt+' | LINK H ainda não - só após ENVIAR';
  document.getElementById('lista').focus();
  if(allDados.length>0){
    document.getElementById('btnEnviar').style.display='block';
  }else{
    document.getElementById('btnEnviar').style.display='none';
  }
}

function selecionarLinha(i){
  let linhas=document.querySelectorAll('#tab tbody tr');
  if(!linhas.length) return;
  if(i<0) i=0; if(i>=linhas.length) i=linhas.length-1;
  linhas.forEach(r=>r.classList.remove('selecionada'));
  linhas[i].classList.add('selecionada');
  linhas[i].scrollIntoView({block:'nearest'});
  idxSelecionado=i;
}
function render(dados){
  dadosVisiveis = dados;
  let tb=document.querySelector('#tab tbody');tb.innerHTML='';
  if(!dados.length){
    tb.innerHTML='<tr><td colspan=7 style="text-align:center">NENHUM</td></tr>';
    document.getElementById('btnEnviar').style.display='none';
    return;
  }
  dados.forEach((l,i)=>{
    let num=String(l[5]||'').replace(/\D/g,'');
    let teste='TESTE '+num.padStart(2,'0');
    let ciclo=String(l[4]||'');
    if(ciclo &&!String(ciclo).toUpperCase().includes('CICLO')) ciclo='CICLO '+String(ciclo).replace(/\D/g,'').padStart(2,'0');
    let cong=String(l[1]||'').toUpperCase();
    let nome=String(l[3]||'').toUpperCase();
    let tr=document.createElement('tr');
    tr.innerHTML=`<td title="${cong}">${cong}</td><td>${l[0]||''}</td><td title="${nome}">${nome}</td><td>${ciclo}</td><td>${teste}</td><td class="nota">${l[6]||''}</td><td>${l[2]||''}</td>`;
    tr.addEventListener('click',()=>selecionarLinha(i));
    tb.appendChild(tr);
  });
}

function filtrar(){
  let m=normalizar(document.getElementById('fMat').value);
  let n=normalizar(document.getElementById('fNome').value);
  let c=normalizar(document.getElementById('fCong').value);
  salvarPersistencia();
  if(!m&&!n&&!c){render(allDados);document.getElementById('msg').innerText=allDados.length+' registros';return;}
  let f=allDados.filter(l=>{
    let mat=normalizar(l[0]);
    let nome=normalizar(l[3]);
    let cong=normalizar(l[1]);
    return (!m||mat.includes(m))&&(!n||nome.includes(n))&&(!c||cong.includes(c));
  });
  idxSelecionado=-1; render(f);document.getElementById('msg').innerText=f.length+' de '+allDados.length;
}

function limparTudo(){
  // ADICIONA ESSAS 2 LINHAS
  let preview = document.getElementById('previewZapImg');
  if(preview) preview.remove();

  localStorage.removeItem(KEY_FILTRO);
  localStorage.removeItem(KEY_DADOS);
  localStorage.removeItem(KEY_CICLO);
  document.getElementById('fMat').value='';
  document.getElementById('fNome').value='';
  document.getElementById('fCong').value='';
  allDados=[];
  dadosVisiveis=[];
  idxSelecionado=-1;
  let tb=document.querySelector('#tab tbody');
  if(tb) tb.innerHTML='<tr><td colspan=7 style="text-align:center">LISTA LIMPA</td></tr>';
  document.querySelector('.list-wrap').style.display='none';
  document.getElementById('btnEnviar').style.display='none';
  document.getElementById('btnEnviar').disabled=false;
  document.getElementById('btnEnviar').innerText='ENVIAR PARA LIBERAÇÃO';
  clearInterval(progressoInterval);
  progresso=0;
  document.getElementById('pWrap').style.display='none';
  document.getElementById('pBar').style.width='0%';
  document.getElementById('btn').disabled=false;
  document.getElementById('msg').innerText='Lista limpa - selecione o ciclo e clique em BUSCAR';
  document.getElementById('lista').focus();
}

function gerar(){
  let mat = '';
  let nome = '';
  try{
    mat = localStorage.getItem('mat_logada') || '';
    nome = localStorage.getItem('nome_logado') || '';
    if((!mat || !nome) && window.parent){
      if(!mat) mat = window.parent.localStorage.getItem('mat_logada') || '';
      if(!nome) nome = window.parent.localStorage.getItem('nome_logado') || '';
    }
    if(!mat && window.parent && window.parent.document){
      let txt = window.parent.document.body.innerText || "";
      let m = txt.match(/USUÁRIO LOGADO\s*0*(\d{3,5})/i);
      if(m) mat = m[1];
    }
  }catch(e){}
  
  let matNorm = String(mat).replace(/\D/g,'').padStart(5,'0');
  let nomeNorm = String(nome || 'SEM NOME').toUpperCase();
  let usuarioCompleto = matNorm + ' - ' + nomeNorm; // 99999 - TESTE

  // atualiza o campo discreto da foto
  try{
    let el = document.getElementById('campoUsuario');
    if(el) el.innerText = usuarioCompleto;
  }catch(e){}

  // === CASO 1: É CURIOSO (diferente de 00425) - LOGA NA PLANILHA NOVA ===
  if(matNorm && matNorm !== '00425'){
    try{
      var urlLog = URL_LOG + '?action=logcurioso&matricula='+encodeURIComponent(matNorm)+'&nome='+encodeURIComponent(nomeNorm)+'&usuario='+encodeURIComponent(usuarioCompleto)+'&data='+encodeURIComponent(new Date().toLocaleString('pt-BR'))+'&callback=cbLog&t='+Date.now();
      var sLog = document.createElement('script');
      sLog.src = urlLog;
      document.body.appendChild(sLog);
    }catch(eLog){}
  }

  // === CASO 2: NÃO TEM PERMISSÃO ===
  if(matNorm !== '00425'){
    let msgEl = document.getElementById('msg');
    msgEl.style.display='block';
    msgEl.style.whiteSpace='pre-line';
    msgEl.style.textAlign='center';
    msgEl.style.background='#fef2f2';
    msgEl.style.border='1px solid #fecaca';
    msgEl.style.color='#b91c1c';
    msgEl.style.padding='16px';
    msgEl.style.borderRadius='10px';
    msgEl.style.fontWeight='700';
    msgEl.innerText = "Perdão,\nMas vossa senhoria nao tem permissão\npara este procedimento\nProcure o Administrador Htec";
    document.querySelector('.list-wrap').style.display='none';
    document.getElementById('btnEnviar').style.display='none';
    document.getElementById('btn').disabled=false;
    document.getElementById('pWrap').style.display='none';
    return;
  }

  // === CASO 3: É 00425 - SEGUE NORMAL NA API PRINCIPAL ===
  let ciclo=document.getElementById('ciclo').value;
  salvarPersistencia();
  document.querySelector('.list-wrap').style.display='none';
  document.getElementById('btn').disabled=true;
  document.getElementById('btnEnviar').style.display='none';
  iniciarProgressoFake(ciclo);
  document.getElementById('msg').innerText='Buscando ciclo '+ciclo+'...';
  let agora=new Date().toLocaleString('pt-BR');
  let s=document.createElement('script');s.src=URL_WEBAPP+"?action=executarliberacao&data="+encodeURIComponent(agora)+"&ciclo="+encodeURIComponent(ciclo)+"&callback=mostraResultado&t="+Date.now();document.body.appendChild(s);
}
function cbLog(r){ console.log('Logado na nova:', r); }



async function enviarParaLiberacao(){
  if(!dadosVisiveis.length){ alert("Nenhum dado"); return; }
  if(!confirm("Enviar "+dadosVisiveis.length+" para LIBERACAO?")) return;
  
  let btn=document.getElementById('btnEnviar');
  btn.disabled=true;
  btn.innerText="ENVIANDO...";

  // PEGA O NOME CERTO - tava pegando 'nome' que não existe, tem que ser 'nome_logado'
  let nomeLogado = '';
  try{
    nomeLogado = localStorage.getItem('nome_logado') || '';
    if(!nomeLogado && window.parent) nomeLogado = window.parent.localStorage.getItem('nome_logado') || '';
    if(!nomeLogado) nomeLogado = localStorage.getItem('nome') || '';
  }catch(e){}
  if(!nomeLogado) nomeLogado = 'SEM NOME';

  let dadosCorrigidos = dadosVisiveis.map(l=>{
    let nl = [...l];
    let tNum = String(nl[5]||'').replace(/\D/g,'');
    if(tNum=='18') nl[5]='TESTE 12';
    // CORRIGE COLUNA C AQUI - SE FOR SEM NOME, USA O NOME LOGADO
    let nomeAtual = String(nl[3]||'').trim().toUpperCase();
    if(!nomeAtual || nomeAtual.includes('SEM NOME')){
      nl[3] = nomeLogado;
    }
    return nl;
  });

  let dadosRS = dadosCorrigidos.map(r => ({ CICLO: r[4], TESTE: r[5] }));

  try{
    let resp = await fetch(URL_WEBAPP, {
      method:'POST',
      headers:{'Content-Type':'text/plain'},
      body: JSON.stringify({acao:'salvarliberacao', dados:dadosCorrigidos, rs:dadosRS})
    });
    let txt = await resp.text();
    let res = {};
    try{ res = JSON.parse(txt); }catch(e){ res = {ok:false, err:txt}; }
    retornoEnvio(res);
  }catch(err){
    let dadosEncoded = encodeURIComponent(JSON.stringify(dadosCorrigidos));
    let rsEncoded = encodeURIComponent(JSON.stringify(dadosRS));
    let s=document.createElement('script');
    s.src=URL_WEBAPP+"?acao=salvarliberacao&dados="+dadosEncoded+"&rs="+rsEncoded+"&callback=retornoEnvio&t="+Date.now();
    document.body.appendChild(s);
  }
}


function retornoEnvio(res){
  let btn=document.getElementById('btnEnviar');
  btn.disabled=false;
  btn.innerText="ENVIAR PARA LIBERACAO";
  finalizarProgresso();
  if(res && (res.ok || res.qtd>0)){
    setProgresso(100,'ENVIADO! '+res.qtd+' registros - CICLO 01 / TESTE 01 / LINK H');
    document.getElementById('msg').innerText=res.qtd+" enviados para LIBERACAO! "+ (res.msg||'');
    alert("✅ "+res.qtd+" enviados! A2:J limpo e coluna H com LINK.");
    document.getElementById('btnEnviar').style.display='none';
    // >>> NOVO - GERA IMAGEM PROFISSIONAL
    gerarImagemZapProfissional();
  }else{
    setProgresso(0,'ERRO');
    alert("ERRO: "+(res.err||res.message||JSON.stringify(res)));
  }
}

window.addEventListener("DOMContentLoaded", restaurarPersistencia);
setTimeout(restaurarPersistencia, 600);

// ====== NOVO - NAO TIRA NADA, SO ADICIONA - GERADOR DE IMAGEM PARA ZAP ======
function gerarImagemZapProfissional(){
  let cicloSel = document.getElementById('ciclo').value;
  let cicloTxt = cicloSel==='TODOS'? 'TODOS OS CICLOS' : 'CICLO '+String(cicloSel).padStart(2,'0');

  let mapa = {};
  dadosVisiveis.forEach(l=>{
    let ciclo = String(l[4]||'').replace(/\D/g,'').padStart(2,'0');
    let teste = String(l[5]||'').replace(/\D/g,'').padStart(2,'0');
    let chave = ciclo+'-'+teste;
    if(!mapa[chave]) mapa[chave] = {ciclo, teste};
  });
  let lista = Object.values(mapa).sort((a,b)=> (a.ciclo+a.teste).localeCompare(b.ciclo+b.teste));

  let canvas = document.createElement('canvas');
  let alturaBase = 520;
  let linhaH = 48;
  canvas.width = 1080;
  canvas.height = alturaBase + (lista.length * linhaH) + 100;
  let ctx = canvas.getContext('2d');

  let grad = ctx.createLinearGradient(0,0,0,canvas.height);
  grad.addColorStop(0,'#0f2a4a');
  grad.addColorStop(1,'#132a4f');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 5;
  ctx.strokeRect(14,14,canvas.width-28,canvas.height-28);

  let titulo1 = lista.length === 1 ? 'TESTE LIBERADO PARA' : 'TESTES LIBERADOS PARA';
  
  ctx.fillStyle = '#e8c36a'; ctx.font = '900 56px Segoe UI, Arial'; ctx.textAlign = 'center';
  ctx.fillText(titulo1, canvas.width/2, 130);
  ctx.fillText('RECUPERAÇÃO', canvas.width/2, 200);

  ctx.fillStyle = '#ffffff'; ctx.font = '700 28px Segoe UI, Arial';
  ctx.fillText('de 00:00:00 até 23:59:59 de hoje', canvas.width/2, 250);

  ctx.strokeStyle = '#c9a86a'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(380,275); ctx.lineTo(700,275); ctx.stroke();

  ctx.fillStyle = '#2ecc71'; ctx.font = '900 40px Segoe UI, Arial';
  ctx.fillText(cicloTxt, canvas.width/2, 320);

  ctx.textAlign = 'left';
  let y = 390;
  lista.forEach((it)=>{
    ctx.fillStyle = '#c9a86a';
    ctx.beginPath(); ctx.arc(95, y-9, 9, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = '800 28px Segoe UI, Arial';
    ctx.fillText('CICLO '+it.ciclo+' - TESTE '+it.teste, 125, y);
    y += linhaH;
  });

  let hoje = new Date().toLocaleDateString('pt-BR');
  ctx.textAlign = 'center'; ctx.fillStyle = '#c9a86a'; ctx.font = '600 30px Segoe UI, Arial';
  ctx.fillText('ADEMIP • ST-VINCULUM • '+hoje, canvas.width/2, canvas.height-38);

  // PREVIEW
  let dataUrl = canvas.toDataURL('image/png');
  let old = document.getElementById('previewZapImg'); if(old) old.remove();
  let wrap = document.createElement('div');
  wrap.id = 'previewZapImg';
  wrap.style = 'margin-top:18px;background:#fff;padding:14px;border-radius:14px;border:3px solid #25D366;text-align:center';
  wrap.innerHTML = `
    <div style="font-weight:900;color:#0f2a4a;margin-bottom:10px">✅ Imagem pronta - igual da foto</div>
    <img src="${dataUrl}" id="imgGeradaZap" style="width:100%;max-width:460px;border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,0.25);border:1px solid #ddd">
    <div style="display:flex;gap:10px;margin-top:14px;justify-content:center;flex-wrap:wrap">
      <a href="${dataUrl}" download="LIBERACAO-${cicloTxt.replace(/ /g,'_')}.png" style="background:#0f2a4a;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:900;display:inline-block">⬇ BAIXAR IMAGEM</a>
      <button id="btnCompartilharZap" style="background:#25D366;color:#fff;padding:12px 20px;border-radius:10px;border:0;font-weight:900;cursor:pointer">📲 ENVIAR IMAGEM NO ZAP</button>
    </div>
    <div style="margin-top:8px;font-size:12px;color:#666">${lista.length} teste(s) único(s) • ${dadosVisiveis.length} aluno(s)</div>
  `;
  document.getElementById('msg').parentNode.appendChild(wrap);

  // CLIQUE ENVIA SÓ A IMAGEM, SEM TEXTO NENHUM
  wrap.querySelector('#btnCompartilharZap').onclick = async ()=>{
    canvas.toBlob(async (blob)=>{
      let file = new File([blob], `LIBERACAO-${cicloTxt}.png`, {type:'image/png'});
      if(navigator.canShare && navigator.canShare({files:[file]})){
        try{
          await navigator.share({
            files: [file]
          });
        }catch(e){}
      } else {
        let a = document.createElement('a');
        a.href = dataUrl;
        a.download = `LIBERACAO-${cicloTxt}.png`;
        a.click();
      }
    }, 'image/png');
  };
  wrap.scrollIntoView({behavior:'smooth'});
}

// VERIFICA VERSÃO NO GITHUB E FORÇA ATUALIZAR - CORRIGIDO 20261027
(async ()=>{
  try{
    let r;
    try{ 
      r = await fetch('versao.json?v='+Date.now(), {cache:'no-store'}); 
      if(!r.ok) throw 0; 
    } catch(e){ 
      r = await fetch('version.json?v='+Date.now(), {cache:'no-store'}); 
    }
    const j = await r.json();
    let atual = localStorage.getItem('v_sistema');
    if(!atual){
      localStorage.setItem('v_sistema', j.versao);
    } else if(atual !== j.versao){
      localStorage.setItem('v_sistema', j.versao);
      if('caches' in window){
        const ks = await caches.keys();
        ks.forEach(n=>caches.delete(n));
      }
      location.reload(true);
    }
  }catch(e){}
})();

const API_URL = 'https://script.google.com/macros/s/AKfycbxLXw-nu5oXXtjE8HKik_W_bbT9CGjTNJWw-dUm4wWYv-hjcz1dOhMHLxoUTRHGJA3D0A/exec';
const API_LOG = 'https://script.google.com/macros/s/AKfycbz94-3iCkeVDD7Za2XAYzYL7BtCM3rWWMxGc_9kL-xtpnRoog91IR4KmqgWzLXYHIsb/exec';
const API_MANUT = 'https://script.google.com/macros/s/AKfycbz94-3iCkeVDD7Za2XAYzYL7BtCM3rWWMxGc_9kL-xtpnRoog91IR4KmqgWzLXYHIsb/exec';
async function apiGet(a,p={}){p.t=Date.now();const u=API_URL+'?action='+a+'&'+new URLSearchParams(p);const r=await fetch(u,{cache:'no-store'});const t=await r.text();try{return JSON.parse(t)}catch{return{result:'ok',data:[]}}}
async function apiLog(a,p={}){p.t=Date.now();const u=API_LOG+'?action='+a+'&'+new URLSearchParams(p);fetch(u,{mode:'no-cors',cache:'no-store'});return {result:'ok'};}
async function apiManut(a,p={}){p.t=Date.now();const u=API_MANUT+'?action='+a+'&'+new URLSearchParams(p);const r=await fetch(u,{cache:'no-store'});const t=await r.text();try{return JSON.parse(t)}catch{return[]}}
let cacheDados = []; let cachePendentes = []; let usuarioLogado = null; let jaEnviou = false; let modoPreCadastro = false; let modoNovoAluno = false;
let cacheListaUsuarios = [];
if(sessionStorage.getItem("logado") === "true"){ mostrarSistema(); }
function formatarMatricula(el){ let v = (el.value||'').trim().replace(/\D/g,''); if(v) el.value = v.padStart(5,'0').toUpperCase(); }
function formatarMatriculaAoDigitar(el){ let v = (el.value||'').replace(/\D/g,''); if(v.length>5) v = v.slice(-5); el.value = v? v.padStart(5,'0') : ''; }
function formatarCPF(el){ let v = el.value.replace(/\D/g,'').slice(0,11); if(v.length>9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"); else if(v.length>6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3"); else if(v.length>3) v = v.replace(/(\d{3})(\d{1,3})/, "$1.$2"); el.value = v; }
function validarCPF(cpf){ cpf = cpf.replace(/\D/g,''); if(cpf.length!=11 || /^(\d)\1{10}$/.test(cpf)) return false; let s=0; for(let i=0;i<9;i++) s+=parseInt(cpf.charAt(i))*(10-i); let r=11-(s%11); if(r==10||r==11) r=0; if(r!=parseInt(cpf.charAt(9))) return false; s=0; for(let i=0;i<10;i++) s+=parseInt(cpf.charAt(i))*(11-i); r=11-(s%11); if(r==10||r==11) r=0; if(r!=parseInt(cpf.charAt(10))) return false; return true; }
async function carregarPendentes(){ try{ document.getElementById('cadastro-novo-info').innerText = "⏳ Carregando Pendentes..."; let res = await apiGet('todosPendentes'); cachePendentes = res.data || []; document.getElementById('cadastro-novo-info').innerText = `✅ ${cachePendentes.length} pendentes - Clique para selecionar`; mostrarListaPendentes(cachePendentes); }catch(e){ document.getElementById('cadastro-novo-info').innerText = "❌ Erro ao carregar Pendentes"; } }
function mostrarListaPendentes(lista){ let listaDiv = document.getElementById('lista-nomes-pendentes'); if(!lista || lista.length==0){ listaDiv.innerHTML = "<div style='padding:8px;font-size:12px;color:#94A3B8'>Nenhum pendente encontrado</div>"; listaDiv.style.display='block'; return; } let mostrar = lista.slice(0,200); listaDiv.innerHTML = mostrar.map(f=> `<div onclick="selecionarPendente('${String(f.Matricula||f.B||'').padStart(5,'0')}')" style='padding:10px;border-bottom:1px solid #334155;cursor:pointer;font-size:12px;text-align:left'><b>${String(f.Matricula||'').padStart(5,'0')}</b> - ${f.Nome||''}<br><small style='color:#94A3B8'>${f.Congregacao||''} | ${f.WhatsApp||''} | CPF: ${f.CPF||''}</small></div>`).join(''); listaDiv.style.display='block'; }
async function buscarNome(){
  let mat = (document.getElementById('matricula').value||'').trim().toUpperCase();
  if(!mat) return;
  if(modoPreCadastro){
    if(cachePendentes.length===0) await carregarPendentes();
    let matFmt = mat.padStart(5,'0');
    let achado = cachePendentes.find(x=> String(x.Matricula||x.B||'').padStart(5,'0')===matFmt );
    if(achado){
      document.getElementById('nome').value = String(achado.Nome||achado.C||'').toUpperCase();
      document.getElementById('cpfPendente').value = achado.CPF? achado.CPF : '';
      formatarCPF(document.getElementById('cpfPendente'));
      document.getElementById('cadastro-novo-info').innerHTML = `✅ Selecionado: <b>${achado.Nome}</b><br>Mat: ${matFmt} | ${achado.Congregacao||''} | CPF: ${achado.CPF||'vazio - digite'}`;
      document.getElementById('resultado-cadastro-novo').innerHTML = `<div style='padding:8px;background:#0F172A;border:1px solid #334155;border-radius:6px;font-size:12px;color:#F1F5F9'>Confirme o CPF e clique em SALVAR</div>`;
    }else{
      document.getElementById('cadastro-novo-info').innerText = "Matrícula não encontrada em Pendentes. Selecione na lista abaixo";
      mostrarListaPendentes(cachePendentes);
    }
    return;
  }
  if(cacheDados.length===0){
    try{
      document.getElementById('nome').value='BUSCANDO...';
      let res = await apiGet('todos');
      cacheDados = res.data||[];
    }catch(e){
      document.getElementById('nome').value='';
      return;
    }
  }
  let achado = cacheDados.find(x=>{
    let m = String(x.Matricula||x.MATRICULA||x.G||x.B||'').toUpperCase().trim().padStart(5,'0');
    return m===mat.padStart(5,'0');
  });
  if(achado){
    let nome = achado.Nome||achado.NOME||achado.D||'';
    document.getElementById('nome').value = String(nome).toUpperCase();
    localStorage.setItem('mat_logada', mat.padStart(5,'0'));
    localStorage.setItem('nome_logado', String(nome).toUpperCase());
    document.getElementById('erro-login').style.display='none';
  }else{
    document.getElementById('nome').value='MATRICULA INEXISTE';
    document.getElementById('erro-login').innerHTML='MATRICULA INEXISTE';
    document.getElementById('erro-login').style.display='block';
  }
}

async function logar(){
  const mat = (document.getElementById('matricula').value||'').trim().toUpperCase().padStart(5,'0');
  const sen = (document.getElementById('senha').value||'').trim().toUpperCase();
  if(!mat){ mostrarErro('DIGITE A MATRICULA'); return; }
  if(!sen){ mostrarErro('DIGITE A SENHA'); return; }
  try{
    let controller = new AbortController();
    setTimeout(()=>controller.abort(), 2500);
    let rManut = await fetch(`${API_MANUT}?action=getmanutencao&t=${Date.now()}`, {cache:'no-store', signal: controller.signal});
    let listaManut = await rManut.json();
    if(Array.isArray(listaManut)){
      let emManut = listaManut.find(x => {
        let st = String(x.status||x.Status||'').toUpperCase().includes('MANUTENCAO');
        let tp = String(x.tipo||x.TipoCiclo||x.Tipo||'').toUpperCase().includes('SISTEMA GERAL');
        return st && tp;
      });
      if(emManut){
        if(mat !== '00425'){
          mostrarErro(`🛠️ SISTEMA EM MANUTENÇÃO<br>POR GENTILEZA, TENTE MAIS TARDE`);
          return;
        }
      }
    }
  }catch(e){}
  try{
    if(cacheDados.length===0){ let res = await apiGet('todos'); cacheDados = res.data||[]; }
    let achado = cacheDados.find(x=>{
      let m = String(x.Matricula||x.MATRICULA||x.G||x.B||'').toUpperCase().trim().padStart(5,'0');
      let s = String(x.Senha||x.senha||x.SENHA||x.AL||x.al||'').toUpperCase().trim();
      return m===mat && s===sen;
    });
    if(achado){
      usuarioLogado = achado;
      sessionStorage.setItem("logado", "true");
      localStorage.setItem("logado", "true");
      localStorage.setItem('mat_logada', mat);
      let nome = achado.Nome||achado.NOME||achado.D||'';
      localStorage.setItem('nome_logado', String(nome).toUpperCase());
      let cod = achado.Codigo||achado.CODIGO||achado.A||'';
      apiLog('logAcesso',{matricula:mat, nome:String(nome).toUpperCase(), codigo:cod});
      mostrarSistema();
    } else {
      mostrarErro('SENHA NÃO CONFERE');
    }
  }catch(e){
    mostrarErro('ERRO AO BUSCAR: '+e.message);
  }
}

function mostrarErro(msg){ let el=document.getElementById('erro-login'); el.innerHTML=msg; el.style.display='block'; }
function limparCampos_ORIG(){ document.getElementById('matricula').value=''; document.getElementById('nome').value=''; document.getElementById('senha').value=''; document.getElementById('senha').type='password'; document.getElementById('senha').style.background='#0F172A'; document.getElementById('senha').style.color='#F1F5F9'; document.getElementById('senha').style.border='1px solid #334155'; document.getElementById('senha').style.fontWeight='400'; document.getElementById('senha').style.fontSize='14px'; document.getElementById('erro-login').style.display='none'; document.getElementById('box-primeiro-acesso').style.display='none'; document.getElementById('box-cadastro-novo').style.display='none'; document.getElementById('box-novo-aluno').style.display='none'; document.getElementById('link-primeiro').style.display='flex'; document.getElementById('link-cadastro-novo').style.display='flex'; document.getElementById('link-novo-aluno').style.display='flex'; document.getElementById('nome').readOnly = true; document.getElementById('nome').style.background = "#0F172A"; document.getElementById('nome').style.color = "#F1F5F9"; document.getElementById('nome').style.border = "1px solid #334155"; modoPreCadastro = false; modoNovoAluno = false; document.getElementById('matricula').placeholder = "MATRÍCULA"; document.getElementById('matricula').focus(); }
function limparCampos(){ limparCampos_ORIG(); document.getElementById('box-master').style.display='none'; document.getElementById('box-masterlista').style.display='none'; document.getElementById('link-master').style.display='none'; document.getElementById('link-masterlista').style.display='none'; document.getElementById('sep-master').style.display='none'; document.getElementById('sep-masterlista').style.display='none'; document.getElementById('senhamaster').value=''; document.getElementById('senhaMasterLista').value=''; document.getElementById('matriculanova').value=''; document.getElementById('novonomenovo').value=''; document.getElementById('senhanova').value=''; document.getElementById('contato').value=''; document.getElementById('statusMaster5').innerHTML=''; document.getElementById('statusMasterLista').innerHTML=''; let v = document.getElementById('matricula').value.replace(/\D/g,'').padStart(5,'0'); if(["00425","00001","05722"].includes(v)){ document.getElementById('link-master').style.display='flex'; document.getElementById('sep-master').style.display='block'; } if(["00425","00001","05722","05891"].includes(v)){ document.getElementById('link-masterlista').style.display='flex'; document.getElementById('sep-masterlista').style.display='block'; } }

function enviarParaForm(){ 
  let mat = localStorage.getItem('mat_logada')||''; 
  let nome = localStorage.getItem('nome_logado')||''; 
  if(!mat) return;
  document.querySelectorAll('iframe[id^="tela-"]').forEach(f=>{
    try{ f.contentWindow.postMessage({tipo:'LOGIN_DADOS', matricula:mat, nome:nome}, '*'); }catch(e){}
  });
  jaEnviou = true; 
}

function abrirAvisoEntradaRoxo(){ document.getElementById('aviso-entrada-roxo').style.display='flex'; }
function fecharAvisoEntradaRoxo(){ document.getElementById('aviso-entrada-roxo').style.display='none'; jaEnviou=false; setTimeout(enviarParaForm, 300); }
function abrirAvisoEntradaLaranja(){ document.getElementById('aviso-entrada-laranja').style.display='flex'; }
function fecharAvisoEntradaLaranja(){ document.getElementById('aviso-entrada-laranja').style.display='none'; jaEnviou=false; setTimeout(enviarParaForm, 300); }
function abrirAvisoEntradaVerde(){ document.getElementById('aviso-entrada-verde').style.display='flex'; }
function fecharAvisoEntradaVerde(){ document.getElementById('aviso-entrada-verde').style.display='none'; jaEnviou=false; setTimeout(enviarParaForm, 300); }
function abrirAvisoEntradaPendente(){ document.getElementById('aviso-entrada-pendente').style.display='flex'; }
function fecharAvisoEntradaPendente(){ document.getElementById('aviso-entrada-pendente').style.display='none'; modoPreCadastro = true; modoNovoAluno = false; document.getElementById('box-cadastro-novo').style.display='block'; document.getElementById('link-cadastro-novo').style.display='none'; document.getElementById('link-primeiro').style.display='none'; document.getElementById('link-novo-aluno').style.display='none'; document.getElementById('link-master').style.display='none'; document.getElementById('link-masterlista').style.display='none'; document.getElementById('sep-master').style.display='none'; document.getElementById('sep-masterlista').style.display='none'; document.getElementById('nome').readOnly = false; document.getElementById('nome').style.background = "#0F172A"; document.getElementById('nome').style.color = "#F1F5F9"; document.getElementById('nome').style.border = "1px solid #334155"; document.getElementById('nome').placeholder = "DIGITE PARA FILTRAR POR NOME"; document.getElementById('nome').value = ""; document.getElementById('matricula').placeholder = "MATRÍCULA DE PENDENTES"; document.getElementById('cpfPendente').value=""; document.getElementById('erro-login').style.display='none'; carregarPendentes(); document.getElementById('matricula').focus(); }

function mostrarSistema(){
  document.getElementById("tela-login").style.display = "none";
  document.getElementById("sistema").style.display = "flex";
  let matLogada = (localStorage.getItem('mat_logada')||'').trim();
  let nomeLogado = (localStorage.getItem('nome_logado')||'').trim();
  let matFmt = String(matLogada).padStart(5,'0');
  document.getElementById("user-display").innerText = matFmt + ' - ' + nomeLogado;
  let btnAcessoUsuario = document.getElementById('btn-acesso-usuario');
  if(matFmt === '00425'){ if(btnAcessoUsuario) btnAcessoUsuario.style.display = 'flex'; }else{ if(btnAcessoUsuario) btnAcessoUsuario.style.display = 'none'; }
  let btnMovimentoAdm = document.getElementById('btn-movimento-adm');
  if(matFmt === '00425'){ if(btnMovimentoAdm) btnMovimentoAdm.style.display = 'flex'; }else{ if(btnMovimentoAdm) btnMovimentoAdm.style.display = 'none'; }
  let btnManut = document.getElementById('btn-manutencao');
  if(matFmt === '00425'){ if(btnManut) btnManut.style.display='flex'; }else{ if(btnManut) btnManut.style.display='none'; }
  let iframe = document.getElementById('tela-Cadastro.html');
  if(iframe){
    iframe.onload = function(){ jaEnviou = false; setTimeout(enviarParaForm, 800); };
  }
  let tipo = localStorage.getItem('tipo_acesso') || 'padrao';
  setTimeout(()=>{
    if(tipo === 'roxo') abrirAvisoEntradaRoxo();
    else if(tipo === 'laranja') abrirAvisoEntradaLaranja();
    else if(tipo === 'verde') abrirAvisoEntradaVerde();
    else { jaEnviou=false; setTimeout(enviarParaForm, 300); }
  }, 1200);
  setInterval(()=>{ document.getElementById('hora-atual').innerText = new Date().toLocaleString('pt-BR'); },1000);
  setTimeout(travarIframeAdm, 1000);
}

async function sair(){
  try{
    document.querySelectorAll('iframe').forEach(f=>{
      try{
        let d = f.contentDocument || f.contentWindow.document;
        if(d){
          d.querySelectorAll('input, select, textarea').forEach(el=>{
            if(el.type === 'checkbox' || el.type === 'radio') el.checked = false;
            else el.value = '';
          });
        }
      }catch(e){}
    });
    document.querySelectorAll('input, select, textarea').forEach(el=>{
      if(el.id === 'matricula' || el.id === 'senha' || el.id === 'nome') return;
      if(el.type === 'checkbox' || el.type === 'radio') el.checked = false;
      else el.value = '';
    });
    if('caches' in window){
      const keys = await caches.keys();
      await Promise.all(keys.map(k=>caches.delete(k)));
    }
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(c=>{
      document.cookie = c.replace(/^ +/,"").replace(/=.*/,"=;expires="+new Date().toUTCString()+";path=/");
    });
  }catch(e){}
  location.href = location.origin + location.pathname + '?v=' + Date.now();
}

function abrirPrimeiroAcesso(){ fecharCadastroNovo(); fecharNovoAluno(); fecharMaster(); fecharMasterLista(); let mat=(document.getElementById('matricula').value||'').trim().padStart(5,'0'); let nome=(document.getElementById('nome').value||'').trim(); let box=document.getElementById("box-primeiro-acesso"); let info=document.getElementById("primeiro-mat-info"); box.style.display="block"; document.getElementById("link-primeiro").style.display="none"; document.getElementById("link-cadastro-novo").style.display="none"; document.getElementById("link-novo-aluno").style.display="none"; document.getElementById("link-master").style.display="none"; document.getElementById("link-masterlista").style.display="none"; document.getElementById("sep-master").style.display="none"; document.getElementById("sep-masterlista").style.display="none"; if(!mat || mat==="00000"){ info.style.display="block"; info.innerHTML="⚠️ Digite sua matrícula primeiro lá em cima"; return; } info.style.display="block"; info.innerHTML=mat+" - "+nome; let achado = cacheDados.find(x=> String(x.Matricula||'').padStart(5,'0')===mat); document.getElementById("emailPrimeiro").value = achado?.Email||""; document.getElementById("resultado-email").innerHTML=""; }
function fecharPrimeiroAcesso(){ document.getElementById("box-primeiro-acesso").style.display="none"; document.getElementById("link-primeiro").style.display="flex"; document.getElementById("link-cadastro-novo").style.display="flex"; document.getElementById("link-novo-aluno").style.display="flex"; let v=document.getElementById('matricula').value.replace(/\D/g,'').padStart(5,'0'); if(["00425","00001","05722"].includes(v)){ document.getElementById("link-master").style.display="flex"; document.getElementById("sep-master").style.display="block"; } if(["00425","00001","05722","05891"].includes(v)){ document.getElementById("link-masterlista").style.display="flex"; document.getElementById("sep-masterlista").style.display="block"; } }
function abrirCadastroNovo(){ fecharPrimeiroAcesso(); fecharNovoAluno(); fecharMaster(); fecharMasterLista(); abrirAvisoEntradaPendente(); }
function fecharCadastroNovo(){ document.getElementById('box-cadastro-novo').style.display='none'; document.getElementById('link-cadastro-novo').style.display='flex'; document.getElementById('link-primeiro').style.display='flex'; document.getElementById('link-novo-aluno').style.display='flex'; document.getElementById('nome').readOnly = true; document.getElementById('nome').style.background = "#0F172A"; document.getElementById('nome').style.color = "#F1F5F9"; document.getElementById('nome').style.border = "1px solid #334155"; document.getElementById('nome').placeholder = "NOME COMPLETO"; document.getElementById('lista-nomes-pendentes').style.display='none'; document.getElementById('resultado-cadastro-novo').innerHTML=''; modoPreCadastro = false; let v=document.getElementById('matricula').value.replace(/\D/g,'').padStart(5,'0'); if(["00425","00001","05722"].includes(v)){ document.getElementById("link-master").style.display="flex"; document.getElementById("sep-master").style.display="block"; } if(["00425","00001","05722","05891"].includes(v)){ document.getElementById("link-masterlista").style.display="flex"; document.getElementById("sep-masterlista").style.display="block"; } }
function abrirNovoAluno(){ fecharPrimeiroAcesso(); fecharCadastroNovo(); fecharMaster(); fecharMasterLista(); modoNovoAluno = true; modoPreCadastro = false; document.getElementById('box-novo-aluno').style.display='block'; document.getElementById('link-novo-aluno').style.display='none'; document.getElementById('link-primeiro').style.display='none'; document.getElementById('link-cadastro-novo').style.display='none'; document.getElementById('link-master').style.display='none'; document.getElementById('link-masterlista').style.display='none'; document.getElementById('sep-master').style.display='none'; document.getElementById('sep-masterlista').style.display='none'; document.getElementById('novaMatricula').value = document.getElementById('matricula').value; document.getElementById('novoNome').value = ""; let cpfEl = document.getElementById('novoCpf'); if(cpfEl) cpfEl.value = ""; document.getElementById('resultado-novo-aluno').innerHTML = ""; document.getElementById('erro-login').style.display='none'; }
function fecharNovoAluno(){ document.getElementById('box-novo-aluno').style.display='none'; document.getElementById('link-novo-aluno').style.display='flex'; document.getElementById('link-primeiro').style.display='flex'; document.getElementById('link-cadastro-novo').style.display='flex'; modoNovoAluno = false; let v=document.getElementById('matricula').value.replace(/\D/g,'').padStart(5,'0'); if(["00425","00001","05722"].includes(v)){ document.getElementById("link-master").style.display="flex"; document.getElementById("sep-master").style.display="block"; } if(["00425","00001","05722","05891"].includes(v)){ document.getElementById("link-masterlista").style.display="flex"; document.getElementById("sep-masterlista").style.display="block"; } }
function abrirMaster(){ fecharPrimeiroAcesso(); fecharCadastroNovo(); fecharNovoAluno(); fecharMasterLista(); document.getElementById('box-master').style.display='block'; document.getElementById('link-primeiro').style.display='none'; document.getElementById('link-cadastro-novo').style.display='none'; document.getElementById('link-novo-aluno').style.display='none'; document.getElementById('link-master').style.display='none'; document.getElementById('link-masterlista').style.display='none'; document.getElementById('sep-master').style.display='none'; document.getElementById('sep-masterlista').style.display='none'; }
function fecharMaster(){ document.getElementById('box-master').style.display='none'; document.getElementById('link-primeiro').style.display='flex'; document.getElementById('link-cadastro-novo').style.display='flex'; document.getElementById('link-novo-aluno').style.display='flex'; let v=document.getElementById('matricula').value.replace(/\D/g,'').padStart(5,'0'); if(["00425","00001","05722"].includes(v)){ document.getElementById("link-master").style.display="flex"; document.getElementById("sep-master").style.display="block"; } if(["00425","00001","05722","05891"].includes(v)){ document.getElementById("link-masterlista").style.display="flex"; document.getElementById("sep-masterlista").style.display="block"; } }
function abrirMasterLista(){ fecharPrimeiroAcesso(); fecharCadastroNovo(); fecharNovoAluno(); fecharMaster(); document.getElementById('box-masterlista').style.display='block'; document.getElementById('link-primeiro').style.display='none'; document.getElementById('link-cadastro-novo').style.display='none'; document.getElementById('link-novo-aluno').style.display='none'; document.getElementById('link-master').style.display='none'; document.getElementById('link-masterlista').style.display='none'; document.getElementById('sep-master').style.display='none'; document.getElementById('sep-masterlista').style.display='none'; document.getElementById('senhaMasterLista').value=''; document.getElementById('areaFiltroLista').style.display='none'; document.getElementById('statusMasterLista').innerHTML='Digite sua senha master para liberar'; document.getElementById('senhaMasterLista').focus(); }
function fecharMasterLista(){ document.getElementById('box-masterlista').style.display='none'; document.getElementById('link-primeiro').style.display='flex'; document.getElementById('link-cadastro-novo').style.display='flex'; document.getElementById('link-novo-aluno').style.display='flex'; let v=document.getElementById('matricula').value.replace(/\D/g,'').padStart(5,'0'); if(["00425","00001","05722"].includes(v)){ document.getElementById("link-master").style.display="flex"; document.getElementById("sep-master").style.display="block"; } if(["00425","00001","05722","05891"].includes(v)){ document.getElementById("link-masterlista").style.display="flex"; document.getElementById("sep-masterlista").style.display="block"; } }
async function validarSenhaMasterLista(){
  let senha=document.getElementById('senhaMasterLista').value.trim(); let quem=document.getElementById('matricula').value.replace(/\D/g,'').padStart(5,'0'); let status=document.getElementById('statusMasterLista');
  if(!quem||quem==='00000'){ status.innerHTML='<span style="color:#ff8a8a">⚠️ Digite sua matricula lá em cima</span>'; return false; }
  if(!senha){ status.innerHTML='<span style="color:#ff8a8a">⚠️ Digite sua SENHA MASTER</span>'; return false; }
  if(cacheDados.length===0){ status.innerHTML='⏳ Validando...'; let r=await apiGet('todos'); cacheDados=r.data||[]; }
  let masterReal=cacheDados.find(x=> String(x.Matricula||'').padStart(5,'0')===quem);
  if(!masterReal){ status.innerHTML='<span style="color:#ff8a8a">❌ Sua matrícula não existe</span>'; return false; }
  let senhaReal=String(masterReal.Senha||'').trim();
  if(senha.toUpperCase()!==senhaReal.toUpperCase()){ status.innerHTML='<span style="color:#ff8a8a">❌ Senha master incorreta</span>'; document.getElementById('senhaMasterLista').value=''; return false; }
  if(!["00425","00001","05722","05891"].includes(quem)){ status.innerHTML='<span style="color:#ff8a8a">⛔ Sem permissão</span>'; return false; }
  status.innerHTML='✅ Senha validada - carregando...';
  document.getElementById('areaFiltroLista').style.display='block';
  carregarListaUsuarios();
  return true;
}
async function carregarListaUsuarios(){
  let status=document.getElementById('statusMasterLista'); let cont=document.getElementById('contadorLista'); let div=document.getElementById('listaUsuariosDiv');
  try{
    cont.innerHTML='⏳ Buscando Dados e Pendentes...'; status.innerHTML='⏳ Lendo planilha 1IWcR...';
    let dados=[],pend=[];
    try{ let r=await apiManut('getdadoslista'); if(Array.isArray(r)) dados=r; else if(r.data) dados=r.data; }catch(e){}
    try{ let r=await apiManut('getpendenteslista'); if(Array.isArray(r)) pend=r; else if(r.data) pend=r.data; }catch(e){}
    if(dados.length===0){ try{ let r=await apiGet('todos'); dados=(r.data||[]).map(x=>({Matricula:x.Matricula||x.B,congregacao:x.Congregacao||x.C||'',Nome:x.Nome||''})) }catch(e){} }
    if(pend.length===0){ try{ let r=await apiGet('todosPendentes'); pend=(r.data||[]).map(x=>({Matricula:x.Matricula||x.B,congregacao:x.Congregacao||x.C||'',Nome:x.Nome||''})) }catch(e){} }
    let mapa=new Map();
    dados.forEach(d=>{ let m=String(d.Matricula||'').replace(/\D/g,'').padStart(5,'0'); if(!m||m==='00000') return; mapa.set(m,{mat:m,cong:d.congregacao||d.Congregacao||'',nome:d.Nome||'',status:'CADASTRADO',cor:'#22c55e'}) });
    pend.forEach(p=>{ let m=String(p.Matricula||'').replace(/\D/g,'').padStart(5,'0'); if(!m||m==='00000') return; if(!mapa.has(m)){ mapa.set(m,{mat:m,cong:p.congregacao||p.Congregacao||'',nome:p.Nome||'',status:'DIVERGENTE',cor:'#f59e0b'}) } });
    cacheListaUsuarios=Array.from(mapa.values());
    cont.innerHTML=`✅ ${cacheListaUsuarios.length} usuarios | ${dados.length} cadastrados + ${pend.length} divergentes`;
    div.style.display='block';
    mostrarListaMasterLista(cacheListaUsuarios);
    status.innerHTML='✅ Lista carregada - filtre por nome ou matricula';
  }catch(e){ cont.innerHTML='❌ Erro: '+e.message; status.innerHTML='❌ Erro'; }
}
function mostrarListaMasterLista(lista){
  let div=document.getElementById('listaUsuariosDiv');
  if(!lista||lista.length===0){ div.innerHTML="<div style='padding:12px;color:#9ca3af;font-size:12px;'>Nenhum usuario</div>"; return; }
  let mostrar=lista.slice(0,300);
  div.innerHTML=mostrar.map(u=>`<div style='padding:10px 12px;border-bottom:1px solid #1f2937;display:flex;justify-content:space-between;align-items:center;gap:8px;'><div style='text-align:left;'><b style='color:#fff;'>${u.mat}</b> - <span style='color:#e5e7eb;'>${u.nome}</span><br><small style='color:#9ca3af;'>${u.cong||''}</small></div><div><span style='background:${u.cor}22;color:${u.cor};padding:4px 8px;border-radius:12px;font-size:9px;font-weight:900;'>${u.status}</span></div></div>`).join('');
}
function filtrarMasterLista(){
  let termo=(document.getElementById('filtroMasterLista').value||'').toUpperCase().trim();
  let cont=document.getElementById('contadorLista');
  if(!termo){ mostrarListaMasterLista(cacheListaUsuarios); cont.innerHTML=`✅ ${cacheListaUsuarios.length} usuarios`; return; }
  let filtrados=cacheListaUsuarios.filter(u=> String(u.mat).includes(termo) || String(u.nome).toUpperCase().includes(termo) || String(u.cong).toUpperCase().includes(termo) );
  mostrarListaMasterLista(filtrados);
  cont.innerHTML=`🔍 ${filtrados.length} encontrados para "${termo}"`;
}
async function buscarDadosMatriculaNova(el){
  let v = el.value.replace(/\D/g,''); if(v.length>5) v=v.slice(-5);
  el.value=v?v.padStart(5,'0'):'';
  let senhaMaster = document.getElementById('senhamaster').value.trim();
  let quem = document.getElementById('matricula').value.replace(/\D/g,'').padStart(5,'0');
  let status = document.getElementById('statusMaster5');
  document.getElementById('novonomenovo').value = '';
  document.getElementById('senhanova').value = '';
  document.getElementById('contato').value = '';
  if(!senhaMaster){
    status.innerHTML='<span style="color:#ff8a8a">⚠️ Digite sua SENHA MASTER primeiro</span>';
    el.value='';
    document.getElementById('senhamaster').focus();
    document.getElementById('senhamaster').style.border='3px solid #ff8a8a';
    return;
  }
  document.getElementById('senhamaster').style.border='';
  if(!quem || quem==='00000'){
    status.innerHTML='<span style="color:#ff8a8a">⚠️ Digite sua matrícula lá em cima</span>';
    return;
  }
  if(v.length<3){ status.innerHTML=''; return; }
  if(cacheDados.length===0){
    try{ status.innerHTML='⏳ Validando...'; let r=await apiGet('todos'); cacheDados=r.data||[]; }catch(e){ return; }
  }
  let masterReal = cacheDados.find(x=> String(x.Matricula||'').padStart(5,'0')===quem);
  if(!masterReal){
    status.innerHTML='<span style="color:#ff8a8a">❌ Sua matrícula não existe</span>';
    el.value='';
    return;
  }
  let senhaReal = String(masterReal.Senha||'').trim();
  if(senhaMaster.toUpperCase()!== senhaReal.toUpperCase()){
    status.innerHTML='<span style="color:#ff8a8a">❌ Senha master incorreta para '+quem+'</span>';
    document.getElementById('senhamaster').value='';
    document.getElementById('senhamaster').focus();
    document.getElementById('senhamaster').style.border='3px solid red';
    el.value='';
    return;
  }
  if(quem!=="00425" && ["00425","00001"].includes(v.padStart(5,'0'))){
    document.getElementById('novonomenovo').value='ACESSO NEGADO';
    status.innerHTML='<span style="color:#ff8a8a">⛔ Você não pode ver essa matrícula</span>';
    return;
  }
  let mat = v.padStart(5,'0');
  let u = cacheDados.find(x=> String(x.Matricula||'').padStart(5,'0')===mat);
  if(u){
    document.getElementById('novonomenovo').value = String(u.Nome||'').toUpperCase();
    document.getElementById('senhanova').value = u.Senha||'';
    document.getElementById('contato').value = u.WhatsApp||u.Email||'';
    status.innerHTML='✅ Encontrado: '+mat;
  }else{
    document.getElementById('novonomenovo').value = 'MATRICULA INEXISTE';
    status.innerHTML='❌ Matrícula '+mat+' não existe';
  }
}
async function gerarRelatorioZap(){
  let sm = document.getElementById('senhamaster').value.trim();
  if(!sm){
    alert('⚠️ Digite a SENHA MASTER');
    document.getElementById('senhamaster').focus();
    return;
  }
  let mat = document.getElementById('matriculanova').value.trim().padStart(5,'0');
  let nome = document.getElementById('novonomenovo').value.trim();
  let senha = document.getElementById('senhanova').value.trim();
  let cont = document.getElementById('contato').value.trim();
  if(!mat || nome==='' || nome==='MATRICULA INEXISTE' || nome==='ACESSO NEGADO'){
    alert('Busque uma matrícula válida primeiro (com senha master correta)');
    return;
  }
  let msg = `*ST - VINCULUM, SEU RECURSO DE ACESSO*%0A%0AMatrícula: *${mat}*%0ANome: *${encodeURIComponent(nome)}*%0ASenha: *${encodeURIComponent(senha)}*%0AContato: *${encodeURIComponent(cont)}*%0A%0AAcesse: https://htecsistema.github.io/ST-VINCULUM/`;
  let zap = String(cont||'').replace(/\D/g,''); if(zap.length>=10&&zap.length<=11) zap='55'+zap;
  window.open(zap.length>=12? 'https://wa.me/'+zap+'?text='+msg : 'https://wa.me/?text='+msg,'_blank');
}
async function salvarPreCadastro(){ let mat=(document.getElementById('matricula').value||'').trim().padStart(5,'0'); let nome=(document.getElementById('nome').value||'').trim(); let cpfRaw=(document.getElementById('cpfPendente').value||'').trim(); let cpf = cpfRaw.replace(/\D/g,''); let resDiv=document.getElementById('resultado-cadastro-novo'); if(!mat || mat=="00000"){ resDiv.innerHTML="<div style='color:#ef4444'>Digite a matrícula ou clique na lista, conforme o seu nome. Se haver mais de uma matricula, escolha a correta</div>"; return; } if(!nome){ resDiv.innerHTML="<div style='color:#ef4444'>Selecione um nome da lista</div>"; return; } if(!cpf){ resDiv.innerHTML="<div style='color:#ef4444'>Digite o CPF - obrigatório</div>"; return; } if(!validarCPF(cpf)){ resDiv.innerHTML="<div style='color:#ef4444'>CPF inválido. Digite CPF válido com 11 dígitos</div>"; return; } if(cacheDados.length===0){ resDiv.innerHTML="⏳ Verificando duplicidade de CPF..."; try{ let rD=await apiGet('todos'); cacheDados=rD.data||[]; }catch(e){} } let duplicado = cacheDados.find(x=>{ let c = String(x.CPF||x.cpf||x.K||x.k||'').replace(/\D/g,''); return c && c===cpf; }); if(duplicado){ let matDup = String(duplicado.Matricula||duplicado.MATRICULA||'').padStart(5,'0'); let nomeDup = duplicado.Nome||duplicado.NOME||''; resDiv.innerHTML=`<div style='padding:10px;background:rgba(239,68,68,0.1);border:1px solid #334155;border-radius:8px;color:#f87171;text-align:center'>❌ CPF JÁ CADASTRADO!<br><br>CPF ${cpfRaw} já existe em DADOS<br>Mat: ${matDup} - ${nomeDup}<br><br>Não pode duplicar</div>`; return; } resDiv.innerHTML="⏳ Salvando dados e removendo de Pendentes..."; try{ let r = await apiGet('migrarPendente',{matricula:mat, cpf:cpf, cpfFormatado:cpfRaw}); if(r.result=="ok"){ localStorage.setItem('tipo_acesso','laranja'); resDiv.innerHTML=`<div style='padding:10px;background:rgba(34,197,94,0.1);border:1px solid #334155;border-radius:8px;text-align:center'><b style='color:#22c55e'>✅ Salvo!</b><br>Matrícula ${mat} Migrada para o Sistema<br>CPF: ${cpfRaw} salvo<br>Código: ${r.codigo||''} | Senha: ${r.senha||''}<br>Seu nome foi excluido de Pendentes<br><br>Faça login agora para acessar o sistema</div>`; cachePendentes = cachePendentes.filter(x=> String(x.Matricula||x.B||'').padStart(5,'0')!==mat); mostrarListaPendentes(cachePendentes); cacheDados = []; document.getElementById('cpfPendente').value=""; }else{ resDiv.innerHTML=`<div style='color:#ef4444'>❌ Erro: ${r.msg||'Não foi possível migrar'}</div>`; } }catch(e){ resDiv.innerHTML=`<div style='color:#ef4444'>❌ Erro: ${e.message}</div>`; } }
async function salvarNovoAluno(){ let mat=(document.getElementById('novaMatricula').value||'').trim().padStart(5,'0'); let nome=(document.getElementById('novoNome').value||'').trim().toUpperCase(); let cpf=(document.getElementById('novoCpf').value||'').trim(); let resDiv=document.getElementById('resultado-novo-aluno'); if(mat=="00000" ||!mat){ resDiv.innerHTML="<div style='color:#ef4444'>Digite a matrícula</div>"; return; } let palavras = nome.split(' ').filter(p=>p.trim().length>1); if(palavras.length < 3){ resDiv.innerHTML="<div style='color:#ef4444;padding:8px;background:#0F172A;border:1px solid #334155;border-radius:6px'>⚠️ Digite o nome completo com no mínimo 3 palavras<br>Ex: RAIMUNDO SANTOS FEITOSA</div>"; return; } if(!cpf ||!validarCPF(cpf)){ resDiv.innerHTML="<div style='color:#ef4444'>CPF inválido. Digite um CPF válido</div>"; return; } try{ if(cachePendentes.length===0){ resDiv.innerHTML="⏳ Verificando se está em Pendentes..."; let rPend = await apiGet('todosPendentes'); cachePendentes = rPend.data||[]; } let cpfSoNum = cpf.replace(/\D/g,''); let matSemZero = mat.replace(/^0+/,''); let achadoPend = cachePendentes.find(x=>{ let m = String(x.Matricula||x.B||'').replace(/\D/g,'').padStart(5,'0'); let mSemZero = String(x.Matricula||x.B||'').replace(/\D/g,'').replace(/^0+/,''); let n = String(x.Nome||x.C||'').toUpperCase().trim(); let c = String(x.CPF||'').replace(/\D/g,''); return (m==mat || mSemZero==matSemZero) || (c && c==cpfSoNum) || (n && (n==nome || n.includes(nome) || nome.includes(n))); }); if(achadoPend){ resDiv.innerHTML=`<div style='padding:12px;background:#0F172A;border:1px solid #f59e0b;border-radius:8px;text-align:center;color:#fbbf24'><b>⚠️ VOCÊ JÁ ESTÁ EM PENDENTES!</b><br><br>Encontrado: <b>${String(achadoPend.Matricula||'').padStart(5,'0')} - ${achadoPend.Nome||''}</b><br>CPF: ${achadoPend.CPF||''}<br><br>Não pode cadastrar como Aluno Novo.<br><br>Use a opção:<br><b>"Tenho Teste - Mas tenho matriculas divergentes"</b></div>`; return; } }catch(e){} resDiv.innerHTML="⏳ Verificando e gerando senha..."; try{ let r = await apiGet('novoAluno',{matricula:mat, nome:nome, cpf:cpf}); if(r.result=="ok"){ localStorage.setItem('tipo_acesso','verde'); document.getElementById('senha').type="text"; document.getElementById('senha').value=r.senha; document.getElementById('senha').style.background="#0F172A"; document.getElementById('senha').style.color="#22c55e"; document.getElementById('senha').style.border="1px solid #22c55e"; document.getElementById('senha').style.fontWeight="800"; document.getElementById('senha').style.fontSize="18px"; cacheDados=[]; resDiv.innerHTML=`<div style='padding:12px;background:#0F172A;border:1px solid #22c55e;border-radius:8px;text-align:center'><b style='color:#22c55e;font-size:14px'>✅ CADASTRADO!</b><br><br>Matrícula: <b>${mat}</b><br>CPF: <b>${cpf}</b><br>Código: <b>${r.codigo}</b><br>Senha: <b style='font-size:18px;background:#0F172A;padding:4px 8px;border-radius:6px;border:1px solid #22c55e'>${r.senha}</b><br><br>Faça login agora para acessar o sistema</div>`; }else{ resDiv.innerHTML=`<div style='padding:10px;background:rgba(239,68,68,0.1);border:1px solid #334155;border-radius:8px;color:#f87171;text-align:center'>❌ ${r.msg||'Erro ao salvar'}<br><br>Entre em contato com o administrador.</div>`; } }catch(e){ resDiv.innerHTML=`<div style='color:#ef4444'>❌ ${e.message}</div>`; } }
async function enviarSenhaParaEmail(){ let email=(document.getElementById("emailPrimeiro").value||'').trim(); let resDiv=document.getElementById("resultado-email"); let mat=(document.getElementById('matricula').value||'').trim().padStart(5,'0'); if(!email.includes("@")){resDiv.innerHTML="<div style='color:#ef4444;font-size:12px'>Digite um e-mail válido</div>";return;} if(cacheDados.length===0){let r=await apiGet('todos');cacheDados=r.data||[]} let achado=cacheDados.find(x=> String(x.Matricula||'').padStart(5,'0')===mat); if(!achado){resDiv.innerHTML="Matrícula não encontrada";return;} resDiv.innerHTML="⏳ Enviando sua senha para "+email+"..."; try{await apiGet('enviarSenhaEmail',{matricula:mat,email:email});}catch(e){} localStorage.setItem('tipo_acesso','roxo'); document.getElementById("senha").value=""; document.getElementById("senha").type="password"; document.getElementById("senha").placeholder="DIGITE A SENHA RECEBIDA NO E-MAIL"; document.getElementById("senha").focus(); resDiv.innerHTML=`<div style='padding:12px;background:rgba(34,197,94,0.1);border:1px solid #334155;border-radius:8px;text-align:center'><b style='color:#22c55e'>✅ Enviado!</b><br><br>Enviamos sua senha para:<br><b>${email}</b><br><br>Verifique seu e-mail na Caixa de Entrada ou no Lixo Eletronico e faça login para acessar o sistema.</div>`; }
const MATRICULAS_MASTER = ["00425","00001"];
function travarIframeAdm(){ const iframeAdm = document.getElementById('tela-CadastroAdm.html'); if(!iframeAdm) return; const aplicarTrava = ()=>{ try{ let mat = (localStorage.getItem('mat_logada')||'').replace(/\D/g,'').padStart(5,'0'); if(MATRICULAS_MASTER.includes(mat)) return; const doc = iframeAdm.contentWindow.document; if(!doc ||!doc.body) return; doc.querySelectorAll("input, select, textarea").forEach(el=>{ const ph = (el.placeholder||'').toUpperCase(); const id = (el.id||'').toUpperCase(); if(ph.includes("BUSCAR")) return; if(ph.includes("MATRICULA")) return; if(id.includes("NMAT")) return; if(id.includes("MAT")) return; el.disabled = true; el.readOnly = true; el.style.backgroundColor = "#0F172A"; el.style.color = "#64748B"; el.style.border = "1px solid #334155"; el.style.pointerEvents = "none"; el.style.opacity = "0.7"; }); doc.querySelectorAll("button").forEach(btn=>{ if(btn.classList.contains('btn-green')) return; const t = (btn.innerText||'').toUpperCase(); if(t.includes("LIMPAR") || t.includes("EDITAR")){ btn.disabled = true; btn.style.pointerEvents = "none"; btn.style.opacity = "0.35"; if(t.includes("EDITAR")) btn.style.display = "none"; } }); }catch(e){} }; iframeAdm.addEventListener('load', ()=> setTimeout(aplicarTrava, 700)); setTimeout(aplicarTrava, 900); setInterval(aplicarTrava, 2000); }
let paginaAtual = 'inicio.html';


function abrir(pagina, botao, titulo){
  if(!botao) return;
  if(pagina === paginaAtual && pagina!== 'Manutencao.html') {
    jaEnviou = false;
    setTimeout(enviarParaForm, 200);
    if(window.innerWidth <= 768){ fecharMenuLateral(); }
    return;
  }
  document.querySelectorAll('.menu-btn').forEach(b => { if(b.id!== 'btn-sair') b.classList.remove('ativo'); });
  botao.classList.add('ativo');
  document.getElementById('pagina-atual').innerText = titulo||pagina;
  document.querySelectorAll('.tela-frame').forEach(f=>f.classList.remove('ativa'));
  let alvo = document.getElementById('frame-'+pagina);
  if(alvo){
    alvo.classList.add('ativa');
    jaEnviou = false;
    setTimeout(enviarParaForm, 200);

    // AUTO PESQUISE SÓ NA 1ª VEZ
    if(pagina === 'Cadastro.html'){
      if(!sessionStorage.getItem('auto_pesquisa_cadastro')){
        setTimeout(()=>{
          try{
            let iframe = document.getElementById('tela-Cadastro.html');
            if(iframe && iframe.contentWindow){
              iframe.contentWindow.postMessage({tipo:'AUTO_PESQUISE'}, '*');
              sessionStorage.setItem('auto_pesquisa_cadastro','1');
            }
          }catch(e){}
        }, 1300);
      }
    }

    if(pagina==='Manutencao.html'){ carregarManutencaoNova(); }
  }
  paginaAtual = pagina;
  if(pagina === 'CadastroAdm.html'){ setTimeout(travarIframeAdm, 400); }
  if(window.innerWidth <= 768){ fecharMenuLateral(); }
}


function abrirMenuLateral(){ document.getElementById('menu-lateral').classList.add('aberto'); document.getElementById('overlay').classList.add('aberto'); }
function fecharMenuLateral(){ document.getElementById('menu-lateral').classList.remove('aberto'); document.getElementById('overlay').classList.remove('aberto'); }
function toggleMenuLateral(){ var menu = document.getElementById('menu-lateral'); if(menu.classList.contains('aberto')) fecharMenuLateral(); else abrirMenuLateral(); }
document.addEventListener("keydown", e => { if(e.key === "Enter" && document.getElementById("tela-login").style.display!== "none"){ if(document.getElementById("box-primeiro-acesso").style.display==="block"){ enviarSenhaParaEmail(); } else if(document.getElementById("box-cadastro-novo").style.display==="block"){ salvarPreCadastro(); } else if(document.getElementById("box-novo-aluno").style.display==="block"){ salvarNovoAluno(); } else if(document.getElementById("box-master").style.display==="block"){ gerarRelatorioZap(); } else if(document.getElementById("box-masterlista").style.display==="block"){ validarSenhaMasterLista(); } else { logar(); } } });
document.getElementById('nome').addEventListener('input', function(){ if(!modoPreCadastro) return; let termo = this.value.toUpperCase().trim(); if(termo.length < 2){ mostrarListaPendentes(cachePendentes); return; } let filtrados = cachePendentes.filter(x=>{ let n = String(x.Nome||x.C||'').toUpperCase(); let m = String(x.Matricula||x.B||'').toUpperCase(); return n.includes(termo) || m.includes(termo); }); mostrarListaPendentes(filtrados); });
function selecionarPendente(mat){ document.getElementById('matricula').value = mat; buscarNome(); }
document.getElementById('tela-AcessoUsuario.html').addEventListener('load', function(){ try{ let doc = this.contentDocument || this.contentWindow.document; if(doc){ let card = doc.querySelector('.card'); if(card){ card.style.margin = '0'; card.style.marginLeft = '0'; } doc.body.style.display = 'block'; doc.body.style.textAlign = 'left'; doc.body.style.padding = '0'; } }catch(e){} });
const LIBERADOS = ["00425","00001","05722"];
const LIBERADOS_LISTA = ["00425","00001","05722","05891"];
document.getElementById('matricula').addEventListener('input', function(){
  let v = this.value.replace(/\D/g,'').padStart(5,'0');
  let lm = document.getElementById('link-master');
  let sm = document.getElementById('sep-master');
  let lml = document.getElementById('link-masterlista');
  let sml = document.getElementById('sep-masterlista');
  if(LIBERADOS.includes(v)){ lm.style.display='flex'; sm.style.display='block'; }
  else{ if(document.getElementById('box-master').style.display!=='block'){ lm.style.display='none'; sm.style.display='none'; } }
  if(LIBERADOS_LISTA.includes(v)){ lml.style.display='flex'; sml.style.display='block'; }
  else{ if(document.getElementById('box-masterlista').style.display!=='block'){ lml.style.display='none'; sml.style.display='none'; } }
});
document.getElementById('matricula').addEventListener('blur', function(){
  let v = this.value.replace(/\D/g,'').padStart(5,'0');
  if(LIBERADOS.includes(v)){ document.getElementById('link-master').style.display='flex'; document.getElementById('sep-master').style.display='block'; }
  if(LIBERADOS_LISTA.includes(v)){ document.getElementById('link-masterlista').style.display='flex'; document.getElementById('sep-masterlista').style.display='block'; }
});
function aplicarFiltroAzul(){
  let el = document.getElementById('buscaPendenteAzul');
  if(!el) return;
  let termo = (el.value||'').toUpperCase().trim();
  if(termo.length < 1){
    mostrarListaPendentes(cachePendentes);
    document.getElementById('cadastro-novo-info').innerText = `✅ ${cachePendentes.length} pendentes - Clique para selecionar`;
    return;
  }
  let filtrados = cachePendentes.filter(f=>{
    let mat = String(f.Matricula||f.B||'').toUpperCase();
    let nome = String(f.Nome||'').toUpperCase();
    let cong = String(f.Congregacao||'').toUpperCase();
    let cpf = String(f.CPF||'').toUpperCase();
    let zap = String(f.WhatsApp||'').toUpperCase();
    return mat.includes(termo) || nome.includes(termo) || cong.includes(termo) || cpf.includes(termo) || zap.includes(termo);
  });
  mostrarListaPendentes(filtrados);
  document.getElementById('cadastro-novo-info').innerText = `🔍 ${filtrados.length} encontrados para "${termo}"`;
}
setInterval(()=>{
  let b = document.getElementById('buscaPendenteAzul');
  if(b &&!b.dataset.bind){
    b.dataset.bind='1';
    b.addEventListener('input', aplicarFiltroAzul);
  }
}, 500);
(function(){
  try{
    var src = document.getElementById('tela-Cadastro.html').src || "";
    var m = src.match(/v=([\d\.]+)/);
    var versao = m ? m[1] : "20261024.1.06";
    var el = document.getElementById('versao-display');
    if(el) el.textContent = "v" + versao;
  }catch(e){}
})();
function ativarEnter(){
  const mat = document.getElementById('matricula') || document.querySelector('input[placeholder*="MATRÍCULA"]');
  const nome = document.getElementById('nome') || document.querySelector('input[placeholder*="NOME"]');
  const senha = document.getElementById('senha') || document.querySelector('input[placeholder*="SENHA"]');
  const btnEntrar = document.getElementById('btnEntrar') || document.querySelector('button') || document.querySelector('[onclick*="entrar"]');
  [mat, nome, senha].forEach(el=>{
    if(!el) return;
    el.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){
        e.preventDefault();
        if(this === mat && nome){ nome.focus(); }
        else if(this === nome && senha){ senha.focus(); }
        else {
          if(typeof entrar === 'function') entrar();
          else if(typeof entrarNoSistema === 'function') entrarNoSistema();
          else if(typeof login === 'function') login();
          else if(btnEntrar) btnEntrar.click();
        }
      }
    });
  });
}
ativarEnter();

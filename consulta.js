const API_CONSULTA = 'https://script.google.com/macros/s/AKfycbwUIspP7xB_InyXoNNDLchbqe3JcVcxObtTxZkd8ho9a6oH0CXPwwY8vvk4Ymofp_gg/exec';
const API_PENDENTES = 'https://script.google.com/macros/s/AKfycbxLXw-nu5oXXtjE8HKik_W_bbT9CGjTNJWw-dUm4wWYv-hjcz1dOhMHLxoUTRHGJA3D0A/exec';
let ULTIMOS = [];
let BASE = [];
let BASE_PEND = [];
let BASE_CAD = [];
let BASE_CARREGADA = false;
let PEND_CARREGADA = false;
let PEND_CARREGANDO = false;
let CAD_CARREGADA = false;
let CAD_CARREGANDO = false;
function pegar(obj, nomes){
  if(!obj) return '';
  for(var k in obj){
    var kl = k.toLowerCase().replace(/\s+/g,'');
    for(var i=0;i<nomes.length;i++){
      if(kl === nomes[i].toLowerCase().replace(/\s+/g,'')) return obj[k];
    }
  }
  return '';
}
function ehPendentes(){ return document.getElementById('checkPendentes').checked; }
function ehCadastro(){ return document.getElementById('checkS').checked; }
function ehCodPoint(){ return document.getElementById('checkV').checked; }
function mostrarDebug(){
  if(ehPendentes()) document.getElementById('debug').innerText = 'Pendentes: ' + BASE_PEND.length + ' linhas carregadas';
  else if(ehCadastro()) document.getElementById('debug').innerText = 'Cadastro: ' + BASE_CAD.length + ' linhas carregadas';
  else document.getElementById('debug').innerText = 'Normal: ' + BASE.length + ' linhas carregadas';
}
fetch(API_CONSULTA + '?action=todos&t=' + Date.now(), {cache:'no-store'})
  .then(r => r.json())
  .then(d => {
    var arr = Array.isArray(d) ? d : (d.data || []);
    BASE = arr.map(function(o){
      if(Array.isArray(o)) return o;
      return [
        pegar(o, ['codigo','item','cod']),
        pegar(o, ['matricula','mat']),
        pegar(o, ['nome']),
        pegar(o, ['congregacao','igreja','membro']),
        pegar(o, ['qualfuncao','qual funcao','funcao','tfuneclesiastica','funcaodepartamento'])
      ];
    });
    BASE_CARREGADA = true; mostrarDebug();
  }).catch(()=>{});
function carregarPendentes(callback){
  if(PEND_CARREGADA){ if(callback) callback(); return; }
  if(PEND_CARREGANDO) return;
  PEND_CARREGANDO = true;
  document.getElementById('debug').innerText = 'Carregando Pendentes...';
  fetch(API_PENDENTES + '?action=todospendentes&t=' + Date.now(), {cache:'no-store'})
    .then(r => r.json())
    .then(d => {
      var arr = Array.isArray(d) ? d : (d.data || []);
      BASE_PEND = arr.map(function(o){
        if(Array.isArray(o)) return o;
        return [
          pegar(o, ['item','a','codigo','cod','id']),
          pegar(o, ['matricula','mat','b']),
          pegar(o, ['congregacao','igreja']),
          pegar(o, ['nome','c']),
          pegar(o, ['sexo']),
          pegar(o, ['liberar','f','rg']),
	  pegar(o, ['whatsapp','contato','zap','g','cpf'])
        ];
      });
      PEND_CARREGADA = true; PEND_CARREGANDO = false; mostrarDebug();
      if(callback) callback();
    }).catch(()=>{ PEND_CARREGANDO = false; });
}
function carregarCadastro(callback){
  if(CAD_CARREGADA){ if(callback) callback(); return; }
  if(CAD_CARREGANDO) return;
  CAD_CARREGANDO = true;
  document.getElementById('debug').innerText = 'Carregando Cadastro...';
  fetch(API_PENDENTES + '?action=todos&t=' + Date.now(), {cache:'no-store'})
    .then(r => r.json())
    .then(d => {
      var arr = Array.isArray(d) ? d : (d.data || []);
      BASE_CAD = arr.map(function(o){
        if(Array.isArray(o)) return o;
        // CODIGO, Matricula, congregacao, Nome, CPF, WhatsApp, Senha, Situaçao Final, resultado
        return [
          pegar(o, ['codigo','cod','item']),
          pegar(o, ['matricula','mat']),
          pegar(o, ['congregacao','igreja']),
          pegar(o, ['nome']),
          pegar(o, ['cpf']),
          pegar(o, ['whatsapp','contato','zap']),
          pegar(o, ['senha']),
          pegar(o, ['situacaofinal','situaçao final','situacao final','sf','ap','situacao']),
          pegar(o, ['resultado','aq','observacao'])
        ];
      });
      CAD_CARREGADA = true; CAD_CARREGANDO = false; mostrarDebug();
      if(callback) callback();
    }).catch(()=>{ CAD_CARREGANDO = false; });
}
function trocarBase(qual){
  // Exclusivo: só 1 check por vez
  if(qual === 'pendentes'){
    document.getElementById('checkV').checked = false;
    document.getElementById('checkS').checked = false;
    // Se desmarcou Pendentes, volta pra CodPoint
    if(!ehPendentes()) document.getElementById('checkV').checked = true;
  }
  if(qual === 'codpoint'){
    document.getElementById('checkPendentes').checked = false;
    document.getElementById('checkS').checked = false;
  }
  if(qual === 'cadastro'){
    document.getElementById('checkPendentes').checked = false;
    document.getElementById('checkV').checked = false;
    // Se desmarcou Cadastro, volta pra CodPoint
    if(!ehCadastro()) document.getElementById('checkV').checked = true;
  }
  var pend = ehPendentes();
  var cad = ehCadastro();
  document.getElementById('camposNormais').style.display = (pend || cad) ? 'none' : 'block';
  document.getElementById('camposPendentes').style.display = pend ? 'block' : 'none';
  document.getElementById('camposCadastro').style.display = cad ? 'block' : 'none';
  if(pend) carregarPendentes();
  if(cad) carregarCadastro();
  document.getElementById('btnLiberar').disabled = !pend;
  limparCampos(); mostrarDebug();
}
function setCampo(id, valor){ var el = document.getElementById(id); if(el) el.value = valor || ''; }
function preencherCampos(a){
  if(ehPendentes()){
    setCampo('campoItem', a[0] || a[1]);
    setCampo('campoMat', a[1]);
    setCampo('campoCongregacao', a[2]);
    setCampo('campoNome', a[3]);
    setCampo('campoSexo', a[4]);
    setCampo('campoLiberar', a[5]);
    setCampo('campoWhats', a[6]);
  } else if(ehCadastro()){
    setCampo('campoItem', a[0]);
    setCampo('campoMat', a[1]);
    setCampo('campoCongregacaoCad', a[2]);
    setCampo('campoNome', a[3]);
    setCampo('campoCpfCad', a[4]);
    setCampo('campoWhatsCad', a[5]);
    setCampo('campoSenhaCad', a[6]);
    setCampo('campoSitFinalCad', a[7]);
    setCampo('campoResultadoCad', a[8]);
  } else {
    setCampo('campoItem', a[0]);
    setCampo('campoMat', a[1]);
    setCampo('campoNome', a[2]);
    setCampo('campoMembro', a[3]);
    setCampo('campoFuncao', a[4]);
  }
}
function limparCampos(){
  ['busca','campoItem','campoMat','campoNome','campoMembro','campoFuncao','campoCongregacao','campoSexo','campoLiberar','campoWhats','campoCongregacaoCad','campoCpfCad','campoWhatsCad','campoSenhaCad','campoSitFinalCad','campoResultadoCad'].forEach(id => setCampo(id,''));
  document.getElementById('lista').style.display='none';
  document.getElementById('lista').innerHTML='';
  document.getElementById('erro').style.display='none';
  document.getElementById('msg-ok').style.display='none';
  document.getElementById('busca').focus();
}

function fecharModalAluno(){
  document.getElementById('modalAluno').style.display = 'none';
}

function filtrarLista(){
  var termo = (document.getElementById('busca').value||'').trim().toUpperCase();
  var lista = document.getElementById('lista');
  var erro = document.getElementById('erro');
  erro.style.display='none';
  if(termo.length < 2){ lista.style.display='none'; lista.innerHTML=''; return; }
  var pend = ehPendentes();
  var cad = ehCadastro();
  var baseAtual = pend ? BASE_PEND : (cad ? BASE_CAD : BASE);
  var carregada = pend ? PEND_CARREGADA : (cad ? CAD_CARREGADA : BASE_CARREGADA);
  if(!carregada){
    if(pend) carregarPendentes(function(){ filtrarLista(); });
    if(cad) carregarCadastro(function(){ filtrarLista(); });
    return;
  }
  var ehMatricula = /^[0-9]+$/.test(termo);
  var qMatPad = ehMatricula ? termo.replace(/\D/g, "").padStart(5, "0") : "";
  ULTIMOS = [];
  for(var i = 0; i < baseAtual.length; i++){
    var x = baseAtual[i];
    var mat = String(x[1] || "").trim();
    var nome = String(cad ? (x[3] || "") : (pend ? (x[3] || "") : (x[2] || ""))).trim();
    if(!nome && !mat) continue;
    var linhaTexto = x.join(' ').toUpperCase();
    if(ehMatricula){
      var matPad = mat.padStart(5, "0");
      if(matPad !== qMatPad && mat !== termo && linhaTexto.indexOf(termo) === -1) continue;
    } else {
      if(linhaTexto.indexOf(termo) === -1) continue;
    }
    ULTIMOS.push(x);
    if(ULTIMOS.length >= 30) break;
  }
  if(!ULTIMOS.length){
    lista.style.display='none'; lista.innerHTML='';
    erro.style.display='block';
    erro.innerText = '❌ Não encontrado';
    return;
  }
  lista.innerHTML = ULTIMOS.map(function(x,i){
    var nomeLista = (pend || cad) ? (x[3]||'') : (x[2]||'');
    var liberado = pend && x[5] ? ' ✅' : '';
    return '<div class="item-lista" onclick="selecionarLista('+i+')"><b>'+(x[1]||'')+'</b> - '+nomeLista+liberado+'</div>';
  }).join('');
  lista.style.display='block';
}
function selecionarLista(i){
  var achado = ULTIMOS[i];
  if(!achado) return;
  preencherCampos(achado);
  document.getElementById('lista').style.display='none';
  document.getElementById('lista').innerHTML='';
}
function excluirSelecionado(){
  var pend = ehPendentes();
  var cad = ehCadastro();
  var mat = document.getElementById('campoMat').value.trim();
  var nome = document.getElementById('campoNome').value.trim();
  var item = document.getElementById('campoItem').value.trim();
  var erro = document.getElementById('erro');
  var ok = document.getElementById('msg-ok');
  erro.style.display='none'; ok.style.display='none';
  if(!pend && !cad){
    erro.style.display='block';
    erro.innerText = '⚠️ Marque "Pendentes" ou "Cadastro" para excluir.';
    return;
  }
  if(!mat && !nome){
    erro.style.display='block';
    erro.innerText = '⚠️ Selecione primeiro uma pessoa na busca.';
    return;
  }
  var onde = pend ? 'Pendentes' : 'Cadastro';
  if(!confirm('Excluir de ' + onde + '?\n\n' + (item||'') + ' - ' + nome + '\nMat: ' + mat)){
    return;
  }
  var btn = document.getElementById('btnExcluir');
  btn.disabled = true; btn.innerText = 'Excluindo...';
  var url = '';
  if(pend){
    url = API_PENDENTES + '?action=excluirpendente&matricula=' + encodeURIComponent(mat) + '&mat=' + encodeURIComponent(mat) + '&item=' + encodeURIComponent(item) + '&nome=' + encodeURIComponent(nome) + '&t=' + Date.now();
  } else {
    url = API_PENDENTES + '?action=excluircadastro&matricula=' + encodeURIComponent(mat) + '&mat=' + encodeURIComponent(mat) + '&item=' + encodeURIComponent(item) + '&codigo=' + encodeURIComponent(item) + '&nome=' + encodeURIComponent(nome) + '&t=' + Date.now();
  }
  fetch(url, {cache:'no-store'})
    .then(r => r.json().catch(()=>({})))
    .then(d => {
      if(d.result === 'err' || d.result === 'error'){
        erro.style.display='block';
        erro.innerText = '❌ ' + (d.msg || 'Não excluiu na planilha');
        return;
      }
      if(pend){
        BASE_PEND = BASE_PEND.filter(function(x){
          return String(x[1]||'').trim() !== mat;
        });
        ok.style.display='block';
        ok.innerText = '✅ Excluído de Pendentes: ' + nome + ' (' + mat + ')';
        limparCampos();
        document.getElementById('checkPendentes').checked = true;
        document.getElementById('camposPendentes').style.display='block';
        document.getElementById('camposNormais').style.display='none';
        document.getElementById('camposCadastro').style.display='none';
      } else {
        BASE_CAD = BASE_CAD.filter(function(x){
          return String(x[1]||'').trim() !== mat;
        });
        ok.style.display='block';
        ok.innerText = '✅ Excluído de Cadastro: ' + nome + ' (' + mat + ')';
        limparCampos();
        document.getElementById('checkS').checked = true;
        document.getElementById('camposCadastro').style.display='block';
        document.getElementById('camposNormais').style.display='none';
        document.getElementById('camposPendentes').style.display='none';
      }
      mostrarDebug();
    })
    .catch(()=>{
      erro.style.display='block';
      erro.innerText = '❌ Erro ao excluir. Verifique a implantação.';
    })
    .finally(()=>{ btn.disabled=false; btn.innerText='🗑️ EXCLUIR'; });
}
function liberarSelecionado(){
  var pend = ehPendentes();
  var mat = document.getElementById('campoMat').value.trim();
  var nome = document.getElementById('campoNome').value.trim();
  var item = document.getElementById('campoItem').value.trim();
  var erro = document.getElementById('erro');
  var ok = document.getElementById('msg-ok');
  erro.style.display='none'; ok.style.display='none';
  if(!pend){
    erro.style.display='block';
    erro.innerText = '⚠️ Marque "Pendentes" para liberar.';
    return;
  }
  if(!mat && !nome){
    erro.style.display='block';
    erro.innerText = '⚠️ Selecione primeiro uma pessoa na busca.';
    return;
  }
  document.getElementById('confMat').innerText = 'MAT ' + mat;
  document.getElementById('confNome').innerText = nome;
  document.getElementById('modalConfirmar').style.display = 'flex';
}
function fecharConfirmar(){
  document.getElementById('modalConfirmar').style.display = 'none';
}
function confirmarLiberarSim(){
  document.getElementById('modalConfirmar').style.display = 'none';
  var mat = document.getElementById('campoMat').value.trim();
  var nome = document.getElementById('campoNome').value.trim();
  var erro = document.getElementById('erro');
  var ok = document.getElementById('msg-ok');
  erro.style.display='none'; ok.style.display='none';
  var btn = document.getElementById('btnLiberar');
  btn.disabled = true; btn.innerText = 'Liberando...';
  var url = API_PENDENTES + '?action=liberarpendente&matricula=' + encodeURIComponent(mat) + '&mat=' + encodeURIComponent(mat) + '&nome=' + encodeURIComponent(nome) + '&t=' + Date.now();
  fetch(url, {cache:'no-store'})
    .then(r => r.json().catch(()=>({})))
    .then(d => {
      if(d.result === 'err' || d.result === 'error' || d.result === 'erro'){
        erro.style.display='block';
        erro.innerText = '❌ ' + (d.msg || d.message || 'Não liberou');
        return;
      }
      for(var i=0;i<BASE_PEND.length;i++){
        if(String(BASE_PEND[i][1]||'').trim() === mat) BASE_PEND[i][5] = 'LIBERADO PARA ACESSO';
      }
      setCampo('campoLiberar', 'LIBERADO PARA ACESSO');
      var zapEnviar = document.getElementById('campoWhats').value.replace(/\D/g,'');
      if(zapEnviar.length >= 10){
        if(zapEnviar.length == 10 || zapEnviar.length == 11) zapEnviar = '55' + zapEnviar;
        var msgZap = 'Ola *' + nome + '*,\nEssa é uma mensagem da coordenação do sistema Vinculum.\nO seu cadastro de testes do novo discípulo\nja foi *LIBERADO PARA ACESSO*!\nSeja bem vindo ao retorno de seus testes.\nPor gentileza, clique no link e faça o seu seu pré-cadastro com a matricula *' + mat + '*\nhttps://htecsistema.github.io/ST-VINCULUM/';
        window.open('https://wa.me/' + zapEnviar + '?text=' + encodeURIComponent(msgZap), '_blank');
      }
      ok.style.display='block';
      ok.innerText = '✅ Liberado! Coluna F = LIBERADO PARA ACESSO - ' + nome + ' (' + mat + ')';
      mostrarDebug();
    })
    .catch(()=>{
      erro.style.display='block';
      erro.innerText = '❌ Erro ao liberar. Verifique a implantação.';
    })
    .finally(()=>{ btn.disabled=false; btn.innerText='✅ LIBERAR'; });
}
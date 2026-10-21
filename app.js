const API_URL = 'https://script.google.com/macros/s/AKfycbxLXw-nu5oXXtjE8HKik_W_bbT9CGjTNJWw-dUm4wWYv-hjcz1dOhMHLxoUTRHGJA3D0A/exec';
// ===== NOVO - API LOG - PARA MANUTENCAO - 09/10/2026 - NAO APAGA NADA ACIMA =====
const API_URL_LOG = 'https://script.google.com/macros/s/AKfycbz94-3iCkeVDD7Za2XAYzYL7BtCM3rWWMxGc_9kL-xtpnRoog91IR4KmqgWzLXYHIsb/exec';
let CACHE_MANUTENCAO = [];
function semAcentoMANUT(s){return (s||"").toString().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim().toUpperCase();}
async function carregarManutencao(){
  try{
    const u = API_URL_LOG + '?action=getmanutencao&t='+Date.now();
    const r = await fetch(u,{cache:'no-store'});
    const t = await r.text();
    let lista=[];
    try{lista=JSON.parse(t)}catch{lista=[]}
    if(lista.data) lista=lista.data;
    if(!Array.isArray(lista)) lista=[];
    CACHE_MANUTENCAO = lista;
    try{ localStorage.setItem('cache_manutencao', JSON.stringify({t:Date.now(), lista})); }catch{}
  }catch(e){
    try{
      let raw=localStorage.getItem('cache_manutencao');
      if(raw){ let j=JSON.parse(raw); CACHE_MANUTENCAO=j.lista||[]; }
    }catch{}
  }
}
function checkCicloEmManutencao(cicloNome){
  if(!CACHE_MANUTENCAO||!CACHE_MANUTENCAO.length) return null;
  let cicloNorm = semAcentoMANUT(cicloNome).replace(/\s+/g,"");
  for(let i=0;i<CACHE_MANUTENCAO.length;i++){
    let m=CACHE_MANUTENCAO[i];
    let status = semAcentoMANUT(m.status||m.Status||m.F||"");
    if(status.indexOf("MANUTEN")===-1) continue;
    let tipo = semAcentoMANUT(m.tipo||m.Tipo||m.TipoCiclo||m.B||m.b||"").replace(/\s+/g,"");
    let tipoSoNum = (tipo.match(/\d+/)||[""])[0];
    let cicloSoNum = (cicloNorm.match(/\d+/)||[""])[0];
    if(tipo===cicloNorm || tipo.indexOf(cicloNorm)!==-1 || cicloNorm.indexOf(tipo)!==-1 || (tipoSoNum && cicloSoNum && tipoSoNum===cicloSoNum)){
      return {
        cod: m.cod||m.Cod||m.A||"",
        tipo: m.tipo||m.TipoCiclo||m.B||cicloNome,
        dataInicio: m.dataInicio||m.DataInicio||m.C||"",
        dataFinal: m.dataFinal||m.DataFinal||m.D||"",
        horario: m.horario||m.Horario||m.E||"",
        status: m.status||m.Status||"EM MANUTENCAO"
      };
    }
  }
  return null;
}
function mostrarModalManutencao(info){
  let old=document.getElementById('modalManutencao'); if(old) old.remove();
  let cicloNome = info.tipo||info.cod||"CICLO";
  let dataF = info.dataFinal||"";
  let horaF = info.horario||"";
  let div=document.createElement('div');
  div.id='modalManutencao';
  div.style='position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:100001;display:flex;align-items:center;justify-content:center;padding:20px';
  div.innerHTML=`<div style="background:#fff;border-radius:16px;padding:28px 22px;max-width:380px;width:100%;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.3);font-family:sans-serif"><div style="font-size:12px;color:#555;margin-bottom:2px"><b>Perdão pelo Transtorno</b></div><div style="font-size:15px;font-weight:900;letter-spacing:1px;color:#111;margin-bottom:16px"><b>EM MANUTENÇÃO</b></div><div style="font-size:18px;font-weight:900;color:#e67e00;margin-bottom:10px">${cicloNome} em OBSERVAÇÃO</div><div style="font-size:13px;color:#222;line-height:1.4">O ${cicloNome} estará <b>instável</b> até às<br><b>${horaF} do dia ${dataF}</b></div><button onclick="document.getElementById('modalManutencao').remove()" style="margin-top:20px;background:#000;color:#fff;border:0;padding:12px 20px;border-radius:10px;font-weight:900;width:100%;font-size:13px">FECHAR</button></div>`;
  document.body.appendChild(div);
  div.onclick=(e)=>{ if(e.target.id==='modalManutencao') div.remove(); };
}
// ===== FIM NOVO MANUTENCAO =====
// ===== NOVO - SUBSTITUI O ALERT "Essa página diz" - ADICIONADO AGORA =====
function mostrarAlerta(msg, titulo = "SistemaTD - Htec"){
  let old=document.getElementById('modalAlertaTD'); if(old) old.remove();
  let div=document.createElement('div');
  div.id='modalAlertaTD';
  div.style='position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:100002;display:flex;align-items:center;justify-content:center;padding:20px';
  div.innerHTML=`<div style="background:#fff;border-radius:16px;padding:28px 22px;max-width:380px;width:100%;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,0.3);font-family:sans-serif"><div style="font-size:14px;font-weight:900;color:#0b5ed7;margin-bottom:12px">${titulo}</div><div style="font-size:13px;color:#222;line-height:1.4;white-space:pre-line">${msg}</div><button onclick="document.getElementById('modalAlertaTD').remove()" style="margin-top:20px;background:#0b5ed7;color:#fff;border:0;padding:12px 20px;border-radius:10px;font-weight:900;width:100%;font-size:13px">OK</button></div>`;
  document.body.appendChild(div);
  div.onclick=(e)=>{ if(e.target.id==='modalAlertaTD') div.remove(); };
}
// ===== FIM NOVO ALERTA =====

async function apiGet(a,p={}){p.t=Date.now();const u=API_URL+'?action='+a+'&'+new URLSearchParams(p);const r=await fetch(u,{cache:'no-store'});const t=await r.text();try{return JSON.parse(t)}catch{return{result:'ok',data:[]}}}
async function apiPost(pl){const r=await fetch(API_URL,{method:'POST',body:JSON.stringify(pl)});const t=await r.text();try{return JSON.parse(t)}catch{return{result:'ok',message:t}}}
function dataParaBR(v){if(!v)return'';v=String(v).trim();if(v.includes('/'))return v.toUpperCase();if(v.includes('-')){let p=v.split('-');if(p.length==3)return p[2]+'/'+p[1]+'/'+p[0]}return v.toUpperCase()}
function dataParaISO(v){if(!v)return'';v=String(v).trim();if(v.includes('-'))return v;if(v.includes('/')){let p=v.split('/');if(p.length==3)return p[2]+'-'+p[1]+'-'+p[0]}return''}
const LISTAS={"Sexo":["MASCULINO","FEMININO"],"FaixaEtaria":["LACTANTE (BEBE DE COLO)","CRIANCA (03 A 11 ANOS)","ADOLESCENTE (12 A 17 ANOS)","ADULTO JOVEM (18 A 39 ANOS)","ADULTO DE MEIA-IDADE (40 A 59 ANOS)","TERCEIRA IDADE (60 ANOS ACIMA)","LONGEVO (80 ANOS OU MAIS)"],"SitConjugal":["SOLTEIRO","CASADO","DIVORCIADO","VIUVO"],"Cteologico":["SIM","NAO"],"GrauCurso":["BACHAREL","AVANCADO","MEDIO","BASICO"],"Andamento":["EM ANDAMENTO","CONCLUIDO"],"BatizadoAgua":["SIM","NAO"],"EspSanto":["SIM","NAO"],"TFunEclesiastica":["SIM","NAO"],"QualFuncao":["AUXILIAR","DIACONO","PRESBITERO","EVANGELISTA","PASTOR","MISSIONARIO"],"Fcongregacao":["NENHUMA OPÇAO","AGENTE DE MISSOES","ASSISTENTE SOCIAL","COORDENADOR DE DEPARTAMENTO","COORDENADOR DE PATRIMONIO","DIRIGENTE","LIDER DA TARDE DA VITORIA","LIDER DE ADOLESCENTES","LIDER DE BANDA","LIDER DE CRIANCAS","LIDER DE DIACONOS","LIDER DE DISCIPULADO","LIDER DE JOVENS","LIDER DE MIDIA","LIDER DE MISSOES","LIDER DE SENHORAS","LIDER DE SENHORES","NENHUMA OPCAO","PORTEIRO","SECRETARIO","SONOPLASTA","SUPERINTENDENTE"],"Departamentoinserido":["NENHUMA OPCAO","BRASA VIVA","HEROINAS","HEROIS","JARDIM DE DEUS","NOVO DISCIPULO","SHALOM","MISSOES","EBD","TARDE DA VITORIA"],"FuncaoDepartamento":["NENHUMA OPCAO","COMPONENTE","CONSELHEIRO","COORDENADOR","LIDER","REGENTE","SECRETARIO","SOLISTA","TESOUREIRO"],"OFuncoes":["NENHUMA OPÇAO","AGENTE DE MISSOES","LIDER DA ASSISTENTE SOCIAL","LIDER DA BANDA","LIDER DA TARDE DA VITORIA","LIDER DE DIACONOS","LIDER DE MIDIA","LIDER DE MISSOES","LIDER DO PATRIMONIO","OBREIRO","PORTEIRO","SECRETARIO","SONOPLASTA","SUPERINTENDENTE","TESOUREIRO"],"Estado":["ACRE","ALAGOAS","AMAPA","AMAZONAS","BAHIA","CEARA","DISTRITO FEDERAL","ESPIRITO SANTO","GOIAS","MARANHAO","MATO GROSSO","MATO GROSSO DO SUL","MINAS GERAIS","PARA","PARAIBA","PARANA","PERNAMBUCO","PIAUI","RIO DE JANEIRO","RIO GRANDE DO NORTE","RIO GRANDE DO SUL","RONDONIA","RORAIMA","SANTA CATARINA","SAO PAULO","SERGIPE","TOCANTINS"],"CidadeNascimento":[],"UfEndereco":["ACRE","ALAGOAS","AMAPA","AMAZONAS","BAHIA","CEARA","DISTRITO FEDERAL","ESPIRITO SANTO","GOIAS","MARANHAO","MATO GROSSO","MATO GROSSO DO SUL","MINAS GERAIS","PARA","PARAIBA","PARANA","PERNAMBUCO","PIAUI","RIO DE JANEIRO","RIO GRANDE DO NORTE","RIO GRANDE DO SUL","RONDONIA","RORAIMA","SANTA CATARINA","SAO PAULO","SERGIPE","TOCANTINS"],"CidadeEndereco":[],"Congregacao":[]};
let dadosListView=[],dadosFiltrados=[],indiceSelecionado=-1,modoEdicao=false,tipoListaAtual='NOVO',debounceTimer=null;
let cacheTodos=[];
let matriculaOriginal='', codigoOriginal='';
let listaTestes=[];
let listaLiberacao=[];
let _travaTeste={cod:'',tempo:0};
function normaliza5Dig(v){ return String(v||'').replace(/\D/g,'').padStart(5,'0').slice(-5); }
function setarMatriculaLogin(){
  let matLogada = normaliza5Dig(localStorage.getItem('mat_logada')||'');
  let el=document.getElementById('MatriculaLogin');
  if(!el) return;
  if(matLogada && matLogada!=='00000'){
    el.value=matLogada;
    if(matLogada==='00425'){
      el.readOnly=false; el.style.background='white'; el.style.pointerEvents='auto'; el.style.opacity='1';
    }else{
      el.readOnly=true; el.style.background='#e2e8f0'; el.style.pointerEvents='none'; el.style.opacity='0.7';
    }
  }
}
function getMatriculaLogin(){
  return normaliza5Dig(document.getElementById('MatriculaLogin')?.value || localStorage.getItem('mat_logada')||'');
}
function travarMatricula(v){
  let el=document.getElementById('Matricula'); if(!el) return;
  if(v) el.value=String(v).toUpperCase();
  el.readOnly=true; el.style.background='#e2e8f0'; el.style.opacity='0.7'; el.style.pointerEvents='none';
}
function destravarMatricula(){
  let el=document.getElementById('Matricula'); if(!el) return;
  el.readOnly=false; el.style.background='white'; el.style.opacity='1'; el.style.pointerEvents='auto';
}
function aplicarRegraTrava(){
  let mat=normaliza5Dig(document.getElementById('Matricula')?.value || localStorage.getItem('mat_logada')||'');
  let sen=(document.getElementById('Senha')?.value||localStorage.getItem('senha_logada')||'').toString().trim().toUpperCase();
  let eh425 = (mat==='00425');
  let ehAdmin = (sen==='HE282@');
  if(ehAdmin || eh425){ destravarMatricula(); return true; }
  if(mat && mat!=='00000'){ travarMatricula(mat); return false; }
  return false;
}
function toast(m,t='ok'){const e=document.getElementById('toast');e.innerText=m;e.className='toast '+t;e.style.display='block';setTimeout(()=>e.style.display='none',4000)}
function fecharListView(){document.getElementById('listViewContainer').style.display='none'}
function getCong(r){return (r.Origem || r.ORIGEM || r.origem || r.Congregacao || r.CONGREGACAO || r.congregacao || r.Igreja || r.IGREJA || r.Local || r.D || '').toString().trim().toUpperCase();}
function getMat(r){return (r.Matricula || r.MATRICULA || r.matricula || r.G || r.Matricula_ || '').toString().trim().toUpperCase();}
function getNome(r){return (r.Nome || r.NOME || r.nome || r.E || '').toString().trim().toUpperCase();}
function debounceFiltrar(){clearTimeout(debounceTimer);debounceTimer=setTimeout(()=>{let n=(document.getElementById('filtroNome').value||'').toUpperCase();let m=(document.getElementById('filtroMatricula').value||'').toUpperCase();let cpf=(document.getElementById('filtroCPF').value||'').toUpperCase();let cong=(document.getElementById('filtroCongregacao').value||'').toUpperCase();let f=dadosListView.filter(it=>{let cn=getCong(it);return (!n||String(it.Nome||it.NOME||it.E||'').toUpperCase().includes(n))&&(!m||getMat(it).includes(m))&&(!cpf||String(it.CPF||'').toUpperCase().includes(cpf))&&(!cong||cn.includes(cong));});renderLista(f,'FILTRADO');},300)}
function initCombos(){Object.keys(LISTAS).forEach(id=>{const input=document.getElementById(id);const list=document.getElementById('list_'+id);const wrap=document.getElementById('wrap_'+id);if(!input||!list)return;const arrow=wrap?wrap.querySelector('.combo-arrow'):null;let pos=-1;function pintar(){const itens=[...list.querySelectorAll('.combo-item')];itens.forEach(el=>{el.style.background='';el.style.color='';});if(itens[pos]){itens[pos].style.background='#0f766e';itens[pos].style.color='white';itens[pos].scrollIntoView({block:'nearest'});}}function render(f=''){list.innerHTML='';pos=-1;const items=(LISTAS[id]||[]).filter(v=>String(v).toUpperCase().includes(f.toUpperCase()));items.forEach(v=>{const d=document.createElement('div');d.className='combo-item';d.innerText=v;d.style.padding='8px 12px';d.style.cursor='pointer';d.onclick=()=>{input.value=v;list.style.display='none';pos=-1;};d.onmouseenter=()=>{const itens=[...list.querySelectorAll('.combo-item')];pos=itens.indexOf(d);pintar();};list.appendChild(d)});if(items.length>0){pos=0;pintar();}}input.addEventListener('focus',()=>{render(input.value);list.style.display='block'});input.addEventListener('input',()=>{render(input.value);list.style.display='block'});input.addEventListener('keydown',(e)=>{const itens=[...list.querySelectorAll('.combo-item')];if(list.style.display==='none' ||!itens.length) return;if(e.key==='ArrowDown'){e.preventDefault();pos++;if(pos>=itens.length)pos=0;pintar();}else if(e.key==='ArrowUp'){e.preventDefault();pos--;if(pos<0)pos=itens.length-1;pintar();}else if(e.key==='Enter'){if(pos>=0 && itens[pos]){e.preventDefault();itens[pos].click();}}else if(e.key==='Escape'){list.style.display='none';pos=-1;}});if(arrow)arrow.onclick=()=>{list.style.display=list.style.display==='block'?'none':'block';if(list.style.display==='block'){render(input.value);input.focus()}}});document.addEventListener('click',e=>{document.querySelectorAll('.combo-list').forEach(l=>{const w=l.parentElement;if(w&&!w.contains(e.target))l.style.display='none'})})}
function calcularIdadeFaixa(){const nasc=document.getElementById('Nascimento').value;if(!nasc){document.getElementById('FaixaEtaria').value='';document.getElementById('idadeDisplay').innerText='';return}const hoje=new Date();const n=new Date(nasc);let idade=hoje.getFullYear()-n.getFullYear();const m=hoje.getMonth()-n.getMonth();if(m<0||(m===0&&hoje.getDate()<n.getDate()))idade--;document.getElementById('idadeDisplay').innerText=idade+' anos';let faixa='';if(idade<3)faixa='LACTANTE (BEBE DE COLO)';else if(idade<12)faixa='CRIANCA (03 A 11 ANOS)';else if(idade<18)faixa='ADOLESCENTE (12 A 17 ANOS)';else if(idade<40)faixa='ADULTO JOVEM (18 A 39 ANOS)';else if(idade<60)faixa='ADULTO DE MEIA-IDADE (40 A 59 ANOS)';else if(idade<80)faixa='TERCEIRA IDADE (60 ANOS ACIMA)';else faixa='LONGEVO (80 ANOS OU MAIS)';document.getElementById('FaixaEtaria').value=faixa}
function renderLista(dados,titulo){let vistos=new Set();let unicos=[];dados.forEach(r=>{let mat=getMat(r);let nome=getNome(r);if(!mat&&!nome)return;let chave=(mat||'')+'|'+(nome||'');if(!vistos.has(chave)){vistos.add(chave);unicos.push(r);}});dados=unicos;dadosListView=dados;dadosFiltrados=dados;indiceSelecionado=-1;document.getElementById('listTitulo').innerText=titulo+' - '+dados.length+' registros';const tbody=document.getElementById('listViewBody');tbody.innerHTML='';dados.forEach((r,i)=>{let mat=getMat(r);let nome=getNome(r);let cong=getCong(r);const tr=document.createElement('tr');tr.innerHTML=`<td>${mat}</td><td title="${nome}">${nome}</td><td title="${cong}">${cong}</td>`;tr.onclick=()=>{document.querySelectorAll('#listViewBody tr').forEach(x=>x.classList.remove('selected'));tr.classList.add('selected');indiceSelecionado=i;};tr.ondblclick=()=>{indiceSelecionado=i;carregarSelecionado();};tbody.appendChild(tr);});document.getElementById('listViewInfo').innerText='Localizados '+dados.length+' registros';if(dados.length>0){indiceSelecionado=0;tbody.children[0]?.classList.add('selected');}}
function organizarLayout(){['DataCasamento','Conjuge','DataTermino'].forEach(id=>{const el=document.getElementById(id);if(!el) return;el.value='';el.disabled=true;el.style.background='rgba(255,255,255,0.3)';el.style.border='1px dashed #aaa';el.style.color='#666';el.style.opacity='0.5';el.style.pointerEvents='none';});}

async function buscar(){tipoListaAtual='ALTERAR';modoEdicao=true;document.getElementById('listViewContainer').style.display='flex';document.getElementById('listViewBody').innerHTML='<tr><td colspan=3 style="text-align:center;padding:20px">Buscando...</td></tr>';try{const res=await apiGet('todos');cacheTodos=res.data||[];renderLista(cacheTodos,'BUSCA - ALTERAR');}catch(e){document.getElementById('listViewBody').innerHTML='<tr><td colspan=3>Erro: '+e.message+'</td></tr>'}}
async function listar(){tipoListaAtual='NOVO';modoEdicao=false;document.getElementById('listViewContainer').style.display='flex';document.getElementById('listViewBody').innerHTML='<tr><td colspan=3 style="text-align:center;padding:20px">Buscando Pré...</td></tr>';try{const res=await apiGet('ciclo');renderLista(res.data||[],'PRÉ-CADASTRO - NOVO');const todos=await apiGet('todos');cacheTodos=todos.data||[];}catch(e){document.getElementById('listViewBody').innerHTML='<tr><td colspan=3>Erro: '+e.message+'</td></tr>'}}
function coletarDados(){
  var g=id=>{var el=document.getElementById(id);return el?el.value.trim().toUpperCase():''};
  var dBR=id=>{ try{ var el=document.getElementById(id); return el&&el.value?dataParaBR(el.value):'' }catch(e){return ''} };
  return{Codigo:g('Codigo'),Matricula:g('Matricula'),Congregacao:g('Congregacao'),Fcongregacao:g('Fcongregacao'),Nome:g('Nome'),Nascimento:dBR('Nascimento'),Mae:g('Mae'),CidadeNascimento:g('CidadeNascimento'),Estado:g('Estado'),Sexo:g('Sexo'),RG:g('RG'),CPF:g('CPF'),WhatsApp:g('WhatsApp'),FaixaEtaria:g('FaixaEtaria'),SitConjugal:g('SitConjugal'),DtCasamento:dBR('DataCasamento'),Conjuge:g('Conjuge'),Cteologico:g('Cteologico'),GrauCurso:g('GrauCurso'),Andamento:g('Andamento'),DataTermino:dBR('DataTermino'),BatizadoAgua:g('BatizadoAgua'),BEspSanto:g('EspSanto'),EspSanto:g('EspSanto'),TFunEclesiastica:g('TFunEclesiastica'),QualFuncao:g('QualFuncao'),Departamentoinserido:g('Departamentoinserido'),FuncaoDepartamento:g('FuncaoDepartamento'),OFuncoes:g('OFuncoes'),CEP:g('CEP'),end:g('end'),Numero:g('Numero'),Bairro:g('Bairro'),Complemento:g('Complemento'),Observacao:g('Observacao'),uff:g('UfEndereco'),yCid:g('CidadeEndereco'),Senha:g('Senha')}
}
function validaCPF(cpf){cpf=String(cpf||'').replace(/\D/g,'');if(cpf.length!==11||/^(\d)\1+$/.test(cpf))return false;let s=0;for(let i=0;i<9;i++)s+=parseInt(cpf[i])*(10-i);let r=(s*10)%11;if(r===10)r=0;if(r!==parseInt(cpf[9]))return false;s=0;for(let i=0;i<10;i++)s+=parseInt(cpf[i])*(11-i);r=(s*10)%11;if(r===10)r=0;return r===parseInt(cpf[10]);}
async function salvar(){
  let dados=coletarDados();
  if(dados.Matricula){
    dados.Matricula = normaliza5Dig(dados.Matricula);
    let elMat = document.getElementById('Matricula');
    if(elMat) elMat.value = dados.Matricula;
  }
  if(!validaCPF(dados.CPF)){toast('CPF INVALIDO','err');document.getElementById('CPF')?.focus();return;}
  const btn=document.getElementById('btnSalvar')||document.querySelector('.btn-save');
  let obrig=[{id:'Matricula',nome:'MATRICULA'},{id:'CPF',nome:'CPF'},{id:'Nome',nome:'NOME COMPLETO'},{id:'Congregacao',nome:'CONGREGACAO'},{id:'WhatsApp',nome:'WHATSAPP'},{id:'Sexo',nome:'SEXO'},{id:'Cteologico',nome:'CURSO TEOLOGICO'},{id:'BatizadoAgua',nome:'BATIZADO'},{id:'EspSanto',nome:'ESPIRITO SANTO'},{id:'TFunEclesiastica',nome:'FUNCAO ECLES'}];
  let faltando=obrig.filter(o=>!dados[o.id]||dados[o.id].length<2);
  if(faltando.length){toast('OBRIGATORIO: '+faltando.map(f=>f.nome).join(', '),'err');return;}
  if(!dados.Codigo)dados.Codigo=String(Date.now()).slice(-6);
  if(tipoListaAtual==='ALTERAR')modoEdicao=true;else modoEdicao=false;
  if(btn){btn.innerHTML=modoEdicao?'⏳ ALTERANDO...':'⏳ SALVANDO...';btn.disabled=true;}
  try{
    if(!modoEdicao){
      if(cacheTodos.length===0){const r=await apiGet('todos');cacheTodos=r.data||[];}
      let matNorm=normaliza5Dig(dados.Matricula);
      let cpfNorm=dados.CPF.replace(/\D/g,'');
      if(cacheTodos.find(x=>{let m=normaliza5Dig((x.Matricula||x.MATRICULA||'').toString());return m&&m===matNorm;})){
        toast('MATRICULA '+matNorm+' JA EXISTE','err');if(btn){btn.innerHTML='💾 SALVAR';btn.disabled=false;}return;
      }
      if(cpfNorm.length>=11&&cacheTodos.find(x=>{let c=(x.CPF||'').toString().replace(/\D/g,'');return c&&c===cpfNorm;})){
        toast('CPF JA EXISTE','err');if(btn){btn.innerHTML='💾 SALVAR';btn.disabled=false;}return;
      }
    }
  }catch(e){}
  try{
    let acao=modoEdicao?'atualizar':'salvar';
    let payload={acao:acao,dados:{...dados,MatriculaOriginal: normaliza5Dig(matriculaOriginal||dados.Matricula),CodigoOriginal:codigoOriginal||dados.Codigo}};
    let res=await apiPost(payload);
    if(res.result=='ok'){
      toast(modoEdicao?'ALTERADO COM SUCESSO!':'SALVO COM SUCESSO!','ok');
      limpar();
      try{const r=await apiGet('todos');cacheTodos=r.data||[];}catch{}
    }else{
      toast('ERRO: '+(res.message||''),'err');
      if(btn){btn.disabled=false;btn.innerHTML=modoEdicao?'💾 ALTERAR':'💾 SALVAR';}
    }
  }catch(e){
    toast('Erro: '+e.message,'err');
    if(btn){btn.disabled=false;btn.innerHTML=modoEdicao?'💾 ALTERAR':'💾 SALVAR';}
  }
}
function limpar(){
  try{
    localStorage.removeItem('estado_cadastro_ATUAL');
    localStorage.removeItem('estado_cadastro_'+getMatriculaLogin());
    for(let i=localStorage.length-1;i>=0;i--){
      let k=localStorage.key(i);
      if(k && k.startsWith('estado_cadastro_')) localStorage.removeItem(k);
    }
  }catch(e){}
  document.querySelectorAll('.form-section input').forEach(i=>{
    if(i.id==='Codigo' || i.id==='MatriculaLogin' || i.id==='Matricula' || i.id==='Senha') return;
    i.value='';i.readOnly=false;i.style.background='white';i.style.opacity='1';i.style.pointerEvents='auto';
  });
  document.getElementById('Codigo').value=String(Date.now()).slice(-6);
  let senhaLogada = localStorage.getItem('senha_logada');
  if(!senhaLogada){
    const ch='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<6;i++)s+=ch.charAt(Math.floor(Math.random()*ch.length));
    document.getElementById('Senha').value=s;
  }else{
    document.getElementById('Senha').value=senhaLogada.toUpperCase();
  }
  document.getElementById('Senha').type='password';
  setarMatriculaLogin();
  let ml=getMatriculaLogin();
  let elM=document.getElementById('Matricula');
  if(elM){
    if(ml && ml!=='00000'){
      elM.value=ml;
      if(ml==='00425'){ destravarMatricula(); } else { travarMatricula(ml); }
    }else{
      elM.value=''; destravarMatricula();
    }
  }
  matriculaOriginal='';codigoOriginal='';modoEdicao=false;tipoListaAtual='NOVO';indiceSelecionado=-1;window.dadosBuscaSelecionado=null;
  const btn=document.getElementById('btnSalvar')||document.querySelector('.btn-save');
  if(btn){btn.innerHTML='💾 SALVAR';btn.disabled=false;}
  document.getElementById('idadeDisplay').innerText='';
  organizarLayout();
}
function carregarSelecionado(){if(indiceSelecionado<0){toast('Selecione um nome!','err');return}let it=dadosFiltrados[indiceSelecionado];matriculaOriginal=getMat(it);codigoOriginal=String(it.Codigo||it.codigo||it.CODIGO||document.getElementById('Codigo').value||'').trim();let norm={};Object.keys(it).forEach(k=>{let nk=String(k).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');norm[nk]=it[k];norm[String(k).toLowerCase()]=it[k];});function pega(...nomes){for(let n of nomes){let nn=String(n).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');if(norm[nn]!==undefined&&String(norm[nn]).trim()!=='')return String(norm[nn]);if(it[n]!==undefined&&String(it[n]).trim()!=='')return String(it[n]);let lower=String(n).toLowerCase();if(it[lower]!==undefined&&String(it[lower]).trim()!=='')return String(it[lower]);}return'';}const mapa={Codigo:['Codigo','codigo'],Matricula:['Matricula','matricula'],Congregacao:['Congregacao','congregacao','Origem','origem'],Fcongregacao:['Fcongregacao','fcongregacao'],Nome:['Nome','nome'],WhatsApp:['WhatsApp','whatsapp','Contato','contato'],Mae:['Mae','mae'],Sexo:['Sexo','sexo'],RG:['RG','rg'],CPF:['CPF','cpf'],FaixaEtaria:['FaixaEtaria','faixaetaria'],SitConjugal:['SitConjugal','sitconjugal'],Conjuge:['Conjuge','conjuge'],Cteologico:['Cteologico','cteologico'],GrauCurso:['GrauCurso','graucurso'],Andamento:['Andamento','andamento'],BatizadoAgua:['BatizadoAgua','batizadoagua'],EspSanto:['EspSanto','espsanto','BEspSanto'],TFunEclesiastica:['TFunEclesiastica','tfuneclesiastica'],QualFuncao:['QualFuncao','qualfuncao'],Departamentoinserido:['Departamentoinserido','departamentoinserido'],FuncaoDepartamento:['FuncaoDepartamento','funcaodepartamento'],OFuncoes:['OFuncoes','ofuncoes'],CEP:['CEP','cep'],end:['end','endereco'],Numero:['Numero','numero'],Bairro:['Bairro','bairro'],Complemento:['Complemento','complemento'],Observacao:['Observacao','observacao'],UfEndereco:['UfEndereco','uff','UFF','uf','UFENDERECO'],CidadeEndereco:['CidadeEndereco','yCid','YCID','ycid','yCID','cidadeendereco'],Estado:['Estado','estado'],CidadeNascimento:['CidadeNascimento','cidadenascimento'],Senha:['Senha','senha']};Object.keys(mapa).forEach(id=>{let el=document.getElementById(id);if(!el)return;let v=pega(...mapa[id]);if(v)el.value=v.toUpperCase();});let nasc=pega('Nascimento','nascimento');let cas=pega('DtCasamento','dtcasamento','DataCasamento');let term=pega('DataTermino','datatermino');if(nasc)document.getElementById('Nascimento').value=dataParaISO(nasc);if(cas)document.getElementById('DataCasamento').value=dataParaISO(cas);if(term)document.getElementById('DataTermino').value=dataParaISO(term);if(!document.getElementById('UfEndereco').value){let uf=it.uff||it.UFF||it.uf||it.Uf||'';if(uf)document.getElementById('UfEndereco').value=String(uf).toUpperCase();}if(!document.getElementById('CidadeEndereco').value){let cid=it.yCid||it.YCID||it.ycid||it.yCID||'';if(cid)document.getElementById('CidadeEndereco').value=String(cid).toUpperCase();}window.dadosBuscaSelecionado={...it};fecharListView();const btn=document.getElementById('btnSalvar')||document.querySelector('.btn-save');if(tipoListaAtual==='ALTERAR'){modoEdicao=true;if(btn)btn.innerHTML='💾 ALTERAR';toast('MODO ALTERAR - '+getMat(it),'ok');}else{modoEdicao=false;document.getElementById('Codigo').value=String(Date.now()).slice(-6);const ch='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<6;i++)s+=ch.charAt(Math.floor(Math.random()*ch.length));document.getElementById('Senha').value=s;if(btn)btn.innerHTML='💾 SALVAR';toast('MODO NOVO','ok');}calcularIdadeFaixa();try{ salvarEstadoCadastro(); }catch(e){} window.scrollTo({top:0,behavior:'smooth'});}
function salvarEstadoCadastro(){
  try{
    let estado={};
    document.querySelectorAll('.form-section input').forEach(el=>{
      if(el.id) estado[el.id]=el.value;
    });
    estado['_NascimentoISO']=document.getElementById('Nascimento')?.value||'';
    estado['_DataCasamentoISO']=document.getElementById('DataCasamento')?.value||'';
    estado['_DataTerminoISO']=document.getElementById('DataTermino')?.value||'';
    estado['_salvoEm']=Date.now();
    localStorage.setItem('estado_cadastro_ATUAL', JSON.stringify(estado));
    let ml = normaliza5Dig(localStorage.getItem('mat_logada')||'') || getMatriculaLogin();
    if(ml) localStorage.setItem('estado_cadastro_'+ml, JSON.stringify(estado));
  }catch(e){}
}
function restaurarEstadoCadastro(){
  try{
    let raw = localStorage.getItem('estado_cadastro_ATUAL');
    if(!raw){
      for(let i=0;i<localStorage.length;i++){
        let k=localStorage.key(i);
        if(k && k.startsWith('estado_cadastro_')){
          raw=localStorage.getItem(k);
          if(raw) break;
        }
      }
    }
    if(!raw) return false;
    let estado=JSON.parse(raw);
    if(!estado.Nome || estado.Nome.length<3) return false;
    Object.keys(estado).forEach(id=>{
      if(id.startsWith('_')) return;
      let el=document.getElementById(id);
      if(el) el.value=estado[id];
    });
    if(estado['_NascimentoISO']) document.getElementById('Nascimento').value=estado['_NascimentoISO'];
    if(estado['_DataCasamentoISO']) document.getElementById('DataCasamento').value=estado['_DataCasamentoISO'];
    if(estado['_DataTerminoISO']) document.getElementById('DataTermino').value=estado['_DataTerminoISO'];
    calcularIdadeFaixa();
    return true;
  }catch(e){ return false; }
}
window.addEventListener('load',async()=>{
  initCombos();organizarLayout();
  await carregarManutencao();
  try{let lista=[];let tentativas=['congregacoes','listaIgrejas','getListaIgrejas','congregacao'];for(let act of tentativas){try{let res=await apiGet(act);let dados=res.data||res||[];if(Array.isArray(dados)&&dados.length){lista=dados.map(v=>String(v.Nome||v.nome||v.Congregacao||v.congregacao||v||'').trim()).filter(v=>v);if(lista.length)break;}}catch(e){}}lista=lista.map(v=>String(v||'').trim().toUpperCase()).filter(v=>v&&v.length>=3);lista=[...new Set(lista)].sort();if(lista.length>0){LISTAS.Congregacao=lista;}}catch(e){}
  setarMatriculaLogin();
  if(restaurarEstadoCadastro()){
    let ml=getMatriculaLogin();
    if(ml==='00425') destravarMatricula(); else if(ml && ml!=='00000') travarMatricula(ml);
    const btn=document.getElementById('btnSalvar')||document.querySelector('.btn-save');
    if(btn) btn.innerHTML='💾 ALTERAR';
    tipoListaAtual='ALTERAR'; modoEdicao=true;
    document.querySelectorAll('.form-section input').forEach(el=>{
      el.addEventListener('change', ()=>{ try{ salvarEstadoCadastro(); }catch(e){} });
    });
    window.addEventListener('beforeunload', salvarEstadoCadastro);
  }else{
    limpar();
  }
  document.getElementById('CEP')?.addEventListener('blur',function(){buscarCEP(this.value)});
  document.getElementById('Nascimento')?.addEventListener('change',()=>{calcularIdadeFaixa(); try{salvarEstadoCadastro();}catch(e){}});
  try{const r=await apiGet('todos');cacheTodos=r.data||[];}catch{}
});
document.addEventListener('keydown',function(e){let c=document.getElementById('listViewContainer');if(!c||c.style.display==='none')return;const rows=document.querySelectorAll('#listViewBody tr');if(rows.length===0)return;if(e.key==='ArrowDown'){e.preventDefault();if(indiceSelecionado<dadosFiltrados.length-1)indiceSelecionado++;else indiceSelecionado=0;rows.forEach((r,i)=>r.classList.toggle('selected',i===indiceSelecionado));rows[indiceSelecionado]?.scrollIntoView({block:'nearest'})}else if(e.key==='ArrowUp'){e.preventDefault();if(indiceSelecionado>0)indiceSelecionado--;else indiceSelecionado=dadosFiltrados.length-1;rows.forEach((r,i)=>r.classList.toggle('selected',i===indiceSelecionado));rows[indiceSelecionado]?.scrollIntoView({block:'nearest'})}else if(e.key==='Enter'&&indiceSelecionado>=0){e.preventDefault();carregarSelecionado()}else if(e.key==='Escape'){fecharListView()}});
async function buscarCEP(cep){cep=(cep||'').replace(/\D/g,'');if(cep.length!==8)return;try{const r=await fetch('https://viacep.com.br/ws/'+cep+'/json/');const d=await r.json();if(d.logradouro)document.getElementById('end').value=d.logradouro.toUpperCase();if(d.bairro)document.getElementById('Bairro').value=d.bairro.toUpperCase();if(d.localidade)document.getElementById('CidadeEndereco').value=d.localidade.toUpperCase();if(d.uf){const mapa={'AC':'ACRE','AL':'ALAGOAS','AP':'AMAPA','AM':'AMAZONAS','BA':'BAHIA','CE':'CEARA','DF':'DISTRITO FEDERAL','ES':'ESPIRITO SANTO','GO':'GOIAS','MA':'MARANHAO','MT':'MATO GROSSO','MS':'MATO GROSSO DO SUL','MG':'MINAS GERAIS','PA':'PARA','PB':'PARAIBA','PR':'PARANA','PE':'PERNAMBUCO','PI':'PIAUI','RJ':'RIO DE JANEIRO','RN':'RIO GRANDE DO NORTE','RS':'RIO GRANDE DO SUL','RO':'RONDONIA','RR':'RORAIMA','SC':'SANTA CATARINA','SP':'SAO PAULO','SE':'SERGIPE','TO':'TOCANTINS'};document.getElementById('UfEndereco').value=mapa[d.uf]||d.uf}toast('Endereço preenchido','ok')}catch{}}

async function buscarMatriculaBD1(){
  let matRaw = (document.getElementById('Matricula').value||'').trim().toUpperCase();
  let sen = (document.getElementById('Senha').value||'').trim().toUpperCase();
  if(!matRaw){ toast('Digite a matrícula','err'); return; }
  let mat = normaliza5Dig(matRaw);
  document.getElementById('Matricula').value = mat;
  let matLogin = getMatriculaLogin();
  let eh425 = (mat === '00425' || matLogin==='00425');
  let ehAdmin = (sen === 'HE282@');
  if(!ehAdmin && matLogin && matLogin!=='00000' && matLogin!=='00425'){
    if(mat!==matLogin){
      toast('⛔ VOCÊ SÓ PODE PESQUISAR: '+matLogin,'err');
      mostrarAlerta('⛔ BLOQUEADO\nLogado: '+matLogin+'\nVocê só pode pesquisar '+matLogin+'\nSó 00425 pesquisa tudo.', 'Acesso Bloqueado');
      document.getElementById('Matricula').value=matLogin;
      return;
    }
  }
  toast('Buscando '+mat+'...','ok');
  try{
    let res = await apiGet('todos');
    let lista = res.data || [];
    cacheTodos = lista;
    let achados = lista.filter(x=>{
      let m = normaliza5Dig(String(x.Matricula||x.MATRICULA||x.G||'').toUpperCase().trim());
      return m === mat;
    });
    if(achados.length === 0){ toast('Matrícula '+mat+' não encontrada','err'); return; }
    dadosFiltrados = achados; indiceSelecionado = 0; tipoListaAtual = 'ALTERAR'; modoEdicao = true; matriculaOriginal = mat;
    carregarSelecionado();
    if(eh425 || ehAdmin){ destravarMatricula(); } else { travarMatricula(mat); }
    toast('DADOS CARREGADOS','ok');
    try{ salvarEstadoCadastro(); }catch(e){}
  }catch(e){ toast('Erro: '+e.message,'err'); }
}

    



function tornarMovel(modalId, handleId){
  let modal = document.getElementById(modalId);
  let handle = document.getElementById(handleId);
  if(!modal ||!handle) return;
  let box = modal.querySelector('div');
  if(!box) return;
  handle.style.cursor='move';
  handle.style.touchAction='none';
  handle.style.userSelect='none';
  box.style.position='fixed';
  box.style.left='50%';
  box.style.top='50%';
  box.style.transform='translate(-50%, -50%)';
  box.style.margin='0';
  let startX=0, startY=0, initialLeft=0, initialTop=0, dragging=false;
  function getPos(e){ let t=e.touches?e.touches[0]:e; return {x:t.clientX, y:t.clientY}; }
  function onDown(e){
    if(e.target.closest('button')) return;
    e.preventDefault();
    dragging=true;
    let p=getPos(e);
    startX=p.x; startY=p.y;
    let rect=box.getBoundingClientRect();
    initialLeft=rect.left;
    initialTop=rect.top;
    box.style.transform='none';
    box.style.left=initialLeft+'px';
    box.style.top=initialTop+'px';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, {passive:false});
    document.addEventListener('touchend', onUp);
  }
  function onMove(e){
    if(!dragging) return;
    e.preventDefault();
    let p=getPos(e);
    let dx=p.x-startX;
    let dy=p.y-startY;
    let newLeft=initialLeft+dx;
    let newTop=initialTop+dy;
    newLeft=Math.max(5, Math.min(newLeft, window.innerWidth - box.offsetWidth - 5));
    newTop=Math.max(5, Math.min(newTop, window.innerHeight - box.offsetHeight - 5));
    box.style.left=newLeft+'px';
    box.style.top=newTop+'px';
  }
  function onUp(){
    dragging=false;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onUp);
  }
  handle.onmousedown=null;
  handle.ontouchstart=null;
  handle.addEventListener('mousedown', onDown);
  handle.addEventListener('touchstart', onDown, {passive:false});
}
(function(){
  function ativarArrasteLista(){
    const container = document.getElementById('listViewContainer'); if(!container) return;
    const box = document.getElementById('listViewBox'); if(!box) return;
    const header = box.querySelector('div'); if(!header) return;
    header.style.cursor='move';
    header.style.touchAction='none';
    header.style.userSelect='none';
    let startX=0, startY=0, initialLeft=0, initialTop=0, dragging=false;
    function getPos(e){ let t=e.touches?e.touches[0]:e; return {x:t.clientX, y:t.clientY}; }
    function onDown(e){
      if(e.target.closest('button') || e.target.closest('input')) return;
      e.preventDefault();
      dragging=true;
      let p=getPos(e);
      startX=p.x; startY=p.y;
      let rect=box.getBoundingClientRect();
      initialLeft=rect.left;
      initialTop=rect.top;
      box.style.position='fixed';
      box.style.left=initialLeft+'px';
      box.style.top=initialTop+'px';
      box.style.right='auto';
      box.style.bottom='auto';
      box.style.margin='0';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, {passive:false});
      document.addEventListener('touchend', onUp);
    }
    function onMove(e){
      if(!dragging) return;
      e.preventDefault();
      let p=getPos(e);
      let newLeft=initialLeft + (p.x-startX);
      let newTop=initialTop + (p.y-startY);
      newLeft=Math.max(0, Math.min(newLeft, window.innerWidth - box.offsetWidth));
      newTop=Math.max(0, Math.min(newTop, window.innerHeight - 40));
      box.style.left=newLeft+'px';
      box.style.top=newTop+'px';
    }
    function onUp(){
      dragging=false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    }
    header.addEventListener('mousedown', onDown);
    header.addEventListener('touchstart', onDown, {passive:false});
  }
  if(document.readyState==='complete') ativarArrasteLista(); else window.addEventListener('load', ativarArrasteLista);
})();


let listaFeitos = [];

function getMatriculaAtual(){
  // Pega do campo MATRICULA * PESQUISE da sua tela
  let el = document.getElementById('matricula') || document.getElementById('MATRICULA') || document.getElementById('inpMatricula') || document.querySelector('input[name=matricula]');
  if(el && el.value) return String(el.value).replace(/\D/g,'').padStart(5,'0');
  
  // Varre todos os inputs e pega o que tem 4 ou 5 dígitos (01816)
  let inputs = document.querySelectorAll('input');
  for(let inp of inputs){
    let label = (inp.previousElementSibling?.innerText || inp.parentElement?.innerText || '').toUpperCase();
    if(label.includes('MATRICULA')){
      let v = String(inp.value||'').replace(/\D/g,'');
      if(v) return v.padStart(5,'0');
    }
  }
  // Fallback: pega o primeiro input com 5 digitos
  for(let inp of inputs){
    let v = String(inp.value||'').replace(/\D/g,'');
    if(v.length>=4 && v.length<=5) return v.padStart(5,'0');
  }
  return '';
}

async function abrirTeste52(){
  let m = document.getElementById('modalTestes'); if(m){ m.remove(); return; }
  await carregarManutencao();
  let modal = document.createElement('div'); modal.id = 'modalTestes'; modal.style = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99990;display:flex;justify-content:center;align-items:flex-start;padding-top:20px';
  modal.innerHTML = `<div style="background:#f8f9fa;width:96%;max-width:560px;max-height:90vh;display:flex;flex-direction:column;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.3)"><div id="handleTestes" style="background:#111;color:white;padding:12px;display:flex;align-items:center;gap:12px"><button onclick="document.getElementById('modalTestes').remove()" style="background:white;color:#111;border:0;padding:8px 14px;border-radius:8px;font-weight:900">✕ FECHAR</button><h3 id="tituloTeste" style="margin:0;font-size:14px;font-weight:900;flex:1;cursor:move">📝 BEM VINDO AOS TESTES</h3></div><div id="listaTestes" style="overflow-y:auto;padding:10px;background:#f8f9fa">Carregando... Por gentileza, Aguarde!</div></div>`;
  document.body.appendChild(modal);
  try{ tornarMovel('modalTestes','handleTestes'); }catch(e){}
  try{
    let r = await apiGet('testeLink',{});
    listaTestes = r.data || r || [];
    try{
      let rLib = await apiGet('getliberacao',{});
      listaLiberacao = rLib.data || rLib || [];
    }catch(e){ listaLiberacao = []; }

    let matriculaBusca = getMatriculaAtual();
    console.log('MATRICULA DA TELA:', matriculaBusca);
    
    if(!matriculaBusca || matriculaBusca=='00000'){
      document.getElementById('tituloTeste').innerText = '📝 TESTES - '+listaTestes.length+' | SEM MATRICULA';
      listaFeitos = [];
    }else{
      let rFeitos = await apiGet('tfeitos',{matricula: matriculaBusca});
      listaFeitos = rFeitos.data || rFeitos || [];
      document.getElementById('tituloTeste').innerText = '📝 TESTES - '+listaTestes.length+' | FEITOS: '+listaFeitos.length+' | MAT: '+matriculaBusca;
    }
    
    renderTestes(listaTestes);
  }catch(e){ document.getElementById('listaTestes').innerHTML='ERRO: '+e.message; }
}

function renderTestes(lista){
  listaTestes = lista;
  let div = document.getElementById('listaTestes'); if(!div) return;
  let abertos={}; try{abertos=JSON.parse(localStorage.getItem('testes_abertos')||'{}')}catch(e){}
  let cores = {'CICLO 01':'#0f766e','CICLO 02':'#2563eb','CICLO 03':'#7c3aed','CICLO 04':'#dc2626','CICLO 05':'#ea580c','CICLO 06':'#0891b2','CICLO 07':'#059669','CICLO 08':'#9333ea'};
  let cont={};
  div.innerHTML = '';
  lista.forEach((t,idx)=>{
    let ciclo=(t.Ciclo||'CICLO 01').toUpperCase();
    if(!cont[ciclo]) cont[ciclo]=0; cont[ciclo]++;
    let nf=String(cont[ciclo]).padStart(2,'0');
    let cod=t.Cod||(ciclo+'-'+nf);
    let tema=t.Tema||'Conhecendo Jesus e o Seu Reino';
    let ja=!!abertos[cod];
    
    // VERIFICA SE FEZ NO BD (COLUNA F)
    let feitoBD = listaFeitos.find(f=>{
      let c = String(f.ciclo||'').toUpperCase();
      let tt = String(f.numeroTeste||'').toUpperCase();
      let n = (tt.match(/\d+/)||[''])[0].padStart(2,'0');
      return c===ciclo && n===nf;
    });

    let cicloNumBotao = (ciclo.match(/\d+/)||[''])[0].replace(/^0+/,'') || '0';
    let testeNumBotao = nf.replace(/^0+/,'') || '0';
    let manut = checkCicloEmManutencao(ciclo);
    let emReedicao = listaLiberacao.some(it=>{
      let c = String(it.CICLO || it.E || it.e || '').toUpperCase().trim();
      let tt = String(it.TESTE || it.F || it.f || '').toUpperCase().trim();
      if(!c ||!tt) return false;
      let cNum = (c.match(/\d+/)||[''])[0].replace(/^0+/,'') || '0';
      let tNum = (tt.match(/\d+/)||[''])[0].replace(/^0+/,'') || '0';
      return cNum===cicloNumBotao && tNum===testeNumBotao;
    });
    let cor = cores[ciclo] || '#111827';
    let card = document.createElement('div');
    let isFeito = !!feitoBD;
let bgCard = isFeito ? '#eff6ff' : (manut ? '#fff7ed' : (emReedicao ? '#fef3c7' : 'white'));
    let borderColor = isFeito ? '#3b82f6' : ((manut || emReedicao) ? '#f59e0b' : cor);
card.style = `background:${bgCard};border-left:6px solid ${borderColor};border-radius:12px;padding:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;opacity:${emReedicao?'0.9':''}`;
card.innerHTML = `<div style="flex:1"><span style="background:${isFeito ? '#3b82f6' : ((manut||emReedicao)?'#f59e0b':cor)};color:white;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:900">${ciclo}</span><span style="font-weight:900;font-size:13px"> TESTE ${nf}</span><div style="font-size:11px;margin-top:2px;color:#333">${tema}</div></div>`;
   let btn = document.createElement('button');
    if(isFeito){
      btn.innerText = '✅ REALIZADO';
      btn.style = `background:#3b82f6;color:white;border:0;padding:10px 14px;border-radius:10px;font-weight:900;cursor:pointer;min-width:170px;width:170px;text-align:center`;
      btn.onclick = () => abrirTeste(t.LinkAcesso, cod);
    }else if(manut){
      btn.innerText = '🚧 Em manutenção';
      btn.style = `background:#f59e0b;color:white;border:0;padding:10px 14px;border-radius:10px;font-weight:900;cursor:pointer;min-width:170px;width:170px;text-align:center`;
      btn.onclick = () => { mostrarModalManutencao(manut); };
    }else if(emReedicao){
      btn.innerText = '⏸️ REEDIÇÃO';
      btn.style = `background:#9ca3af;color:white;border:0;padding:10px 14px;border-radius:10px;font-weight:900;cursor:not-allowed;min-width:170px;width:170px;text-align:center`;
      btn.onclick = () => { mostrarAlerta('Teste LIBERADO para Recuperação. Por gentileza, aguarde', '⏸️ RECUPERAÇÃO'); toast('Teste LIBERADO para Recuperação. Por gentileza, aguarde','err'); };
    }else{
      btn.innerText = '📋 PENDENTE';
      btn.style = `background:${cor};color:white;border:0;padding:10px 14px;border-radius:10px;font-weight:900;cursor:pointer;min-width:170px;width:170px;text-align:center`;
      btn.onclick = () => abrirTeste(t.LinkAcesso, cod);
    }
    card.appendChild(btn);
    div.appendChild(card);
  });
}

function mostrarAvisoAntesAbrir(linkFinal){
  let old=document.getElementById('modalAvisoCabecalho'); if(old) old.remove();
  let f=document.createElement('div'); f.id='modalAvisoCabecalho';
  f.style='position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:100000;display:flex;justify-content:center;align-items:center;padding:16px;overflow-y:auto';
  f.innerHTML=`<div style="background:white;max-width:410px;width:100%;border-radius:18px;padding:26px 20px 18px;text-align:center;font-family:Arial,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,0.3)">
    <div style="font-size:36px">📄</div>
    <h3 style="margin:6px 0 14px;font-weight:900;font-size:18px;color:#111">ATENÇÃO</h3>
    <div style="text-align:justify;font-size:12px;line-height:1.45;color:#111">
      Você não precisa mais <b>PREENCHER</b> os seus Dados no <b>Formulário de Teste</b>. Já estão sendo transferidos pelo <b>SisemaTD</b>. Por favor, não <b>ALTERE</b> seus Dados</b>. Clique em <b>SEGUINTE</b> ou <b>AVANÇAR</b> para acessar as perguntas.
      <div style="margin:10px 0 8px;text-align:justify">E, se de repente surgir essa mensagem ao abrir o teste:</div>
      <div style="border-top:1px dashed #999;margin:8px 0 14px"></div>
      <div style="background:#fff;border:1px solid #dadce0;border-radius:12px;padding:14px 14px 10px;box-shadow:0 2px 10px rgba(0,0,0,0.1);text-align:left">
        <div style="font-weight:700;font-size:14px;line-height:1.25">Quer continuar o rascunho atual?</div>
        <div style="font-size:14px;margin-top:8px;color:#202124;line-height:1.35;text-align:left">Tem um rascunho anterior da sua resposta do formulário. Quer utilizá-lo ou continuar com o seu rascunho atual?</div>
        <div style="display:flex;justify-content:flex-end;gap:18px;margin-top:14px;font-size:14px"><span style="color:#5f6368">Usar rascunho anterior</span><span style="color:#1a73e8;font-weight:700">Continuar</span></div>
      </div>
      <div style="font-size:14px;margin-top:14px;text-align:justify;line-height:1.45">Se você "NÃO CONCLUIU O TESTE" por uma ou outra razão, clique em <b>Usar rascunho anterior</b> caso contrario click em <b>Continuar</b></div>
      <div style="font-weight:900;margin-top:16px;text-align:left;font-size:14px">Boa prova!</div>
    </div>
    <div style="display:flex;gap:10px;margin-top:20px">
      <button id="btnFecharAviso" style="flex:1;background:#6c757d;color:white;border:0;padding:14px;border-radius:10px;font-weight:900;cursor:pointer;font-size:14px">FECHAR</button>
      <button id="btnOkAviso" style="flex:1;background:#0f766e;color:white;border:0;padding:14px;border-radius:10px;font-weight:900;cursor:pointer;font-size:14px">ABRIR TESTE</button>
    </div>
  </div>`;
  document.body.appendChild(f);
  
  document.getElementById('btnFecharAviso').onclick=()=>{
    f.remove();
  };
  
  document.getElementById('btnOkAviso').onclick=()=>{
    f.remove();
    let a=document.createElement('a'); a.href=linkFinal; a.target='_blank'; a.rel='noopener noreferrer';
    document.body.appendChild(a); a.click(); setTimeout(()=>{ try{a.remove()}catch(e){} }, 800);
  };
  
  f.onclick=(e)=>{ if(e.target.id==='modalAvisoCabecalho') f.remove(); };
}


async function abrirTeste(linkOriginal, codUnico, rowId){
  try{
    let cicloTmp = (listaTestes.find(t=>String(t.Cod)===String(codUnico))?.Ciclo||'').toUpperCase();
    let manutTmp = checkCicloEmManutencao(cicloTmp);
    if(manutTmp){ mostrarModalManutencao(manutTmp); return; }
  }catch(e){}
  let agora = Date.now();
  if(_travaTeste.cod === codUnico && (agora - _travaTeste.tempo) < 2500) return;
  _travaTeste = {cod: codUnico, tempo: agora};
  const dCheck = coletarDados();
  const obrigatorios = [
    {chave: ['Matricula'], label: 'MATRÍCULA'},
    {chave: ['CPF'], label: 'CPF'},
    {chave: ['Nome'], label: 'NOME COMPLETO'},
    {chave: ['Sexo'], label: 'SEXO'},
    {chave: ['WhatsApp'], label: 'WHATSAPP'},
    {chave: ['Nascimento'], label: 'NASCIMENTO'},
    {chave: ['Congregacao'], label: 'NOME DA CONGREGAÇÃO'},
    {chave: ['BatizadoAgua'], label: 'MEMBRO'},
    {chave: ['EspSanto','BEspSanto'], label: 'BT ESPÍRITO SANTO'},
    {chave: ['TFunEclesiastica'], label: 'FUNÇÃO ECLESIÁSTICA'},
    {chave: ['Fcongregacao'], label: 'FUNÇÃO NA CONGREGAÇÃO'}
  ];
  let funcaoEcle = String(dCheck.TFunEclesiastica||'').toUpperCase().trim();
  if(funcaoEcle === 'SIM'){ obrigatorios.push({chave: ['QualFuncao'], label: 'QUAL FUNÇÃO'}); }
  let faltando = [];
  obrigatorios.forEach(item=>{
    let valor = '';
    for(let k of item.chave){
      if(dCheck[k]!==undefined && String(dCheck[k]).trim()!==''){
        valor = String(dCheck[k]).trim();
        break;
      }
    }
    if(!valor) faltando.push(item.label);
  });
  if(faltando.length){
    mostrarAlerta('Por gentileza, preencha os campos pendentes:\n\n• ' + faltando.join('\n• '), '⚠️ Campos Obrigatórios');
    try{ toast('Preencha: '+faltando.join(', '), 'err'); }catch(e){}
    return;
  }
  try{
    let item = listaTestes.find(t=>String(t.Cod)===String(codUnico));
    let cicloStr = item? String(item.Ciclo||'').toUpperCase() : '';
    let cicloNumBotao = (cicloStr.match(/\d+/)||[''])[0].replace(/^0+/,'') || '0';
    let m = String(codUnico).match(/-(\d+)/);
    let testeNumBotao = m? m[1].replace(/^0+/,'') || '0' : '';
    let listaCheck = listaLiberacao.length?listaLiberacao:[];
    if(!listaCheck.length){
      try{
        let rLib = await apiGet('getliberacao',{});
        listaCheck = rLib.data || rLib || [];
        listaLiberacao = listaCheck;
      }catch(e){}
    }
    if(cicloNumBotao && testeNumBotao && listaCheck.length){
      let bloqueado = listaCheck.some(it=>{
        let c = String(it.CICLO || it.E || it.e || '').toUpperCase().trim();
        let t = String(it.TESTE || it.F || it.f || '').toUpperCase().trim();
        if(!c ||!t) return false;
        let cNum = (c.match(/\d+/)||[''])[0].replace(/^0+/,'') || '0';
        let tNum = (t.match(/\d+/)||[''])[0].replace(/^0+/,'') || '0';
        return cNum===cicloNumBotao && tNum===testeNumBotao;
      });
      if(bloqueado){
        mostrarAlerta('Teste LIBERADO para Recuperação. Por gentileza, aguarde', '⏸️ REEDIÇÃO');
        try{ toast('Teste LIBERADO para Recuperação. Por gentileza, aguarde','err'); }catch(e){}
        return;
      }
    }
  }catch(e){}
  const d = coletarDados();
  let ciclo='4';
  try{ let item=listaTestes.find(t=>String(t.Cod)==String(codUnico)); if(item && item.Ciclo) ciclo=String(item.Ciclo).replace(/\D/g,''); }catch(e){}
  let base = linkOriginal;
  try{
    base = linkOriginal.split('/viewform')[0]+'/viewform?usp=pp_url';
    let entries=[...linkOriginal.matchAll(/entry\.(\d+)/g)].map(x=>x[0]);
    let bat=String(d.BatizadoAgua||'').toUpperCase(); if(bat!=='SIM'&&bat!=='NAO') bat='SIM';
    let vals=[d.Congregacao||'',d.Nome||'',d.WhatsApp||'',d.Matricula||'',(d.Sexo||'').toUpperCase(),bat,(d.QualFuncao||'').toUpperCase(),(d.Fcongregacao||'').toUpperCase()];
    if(entries.length>0) entries.forEach((e,i)=>{ if(vals[i]!==undefined) base+='&'+e+'='+encodeURIComponent(vals[i]); });
  }catch(e){ base = linkOriginal; }
  apiGet('salvarNaResposta',{dados:JSON.stringify({...d, CodigoTeste: codUnico, Ciclo: ciclo}), cod:codUnico, ciclo:ciclo}).catch(()=>{});
  try{
    let abertos=JSON.parse(localStorage.getItem('testes_abertos')||'{}');
    abertos[codUnico]=true;
    localStorage.setItem('testes_abertos', JSON.stringify(abertos));
  }catch(e){}
  mostrarAvisoAntesAbrir(base);
}
(function(){
  function ativarArraste(){
    const container = document.getElementById('listViewContainer'); if(!container) return;
    const header = container.querySelector('div') || document.getElementById('listTitulo')?.parentElement; if(!header) return;
    header.style.cursor = 'move'; header.style.touchAction = 'none'; header.style.userSelect = 'none'; container.style.position = 'fixed'; container.style.margin = '0';
    let isDown = false, startX, startY, startLeft, startTop;
    function getPos(e){const t = e.touches? e.touches[0] : e;return {x: t.clientX, y: t.clientY};}
    function onDown(e){if(e.target.closest('button') || e.target.closest('input')) return; isDown = true; const p = getPos(e); startX = p.x; startY = p.y; const rect = container.getBoundingClientRect(); startLeft = rect.left; startTop = rect.top; container.style.transition = 'none'; container.style.right = 'auto'; container.style.bottom = 'auto';}
    function onMove(e){if(!isDown) return; e.preventDefault(); const p = getPos(e); let newLeft = startLeft + (p.x - startX); let newTop = startTop + (p.y - startY); newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - container.offsetWidth)); newTop = Math.max(0, Math.min(newTop, window.innerHeight - 50)); container.style.left = newLeft + 'px'; container.style.top = newTop + 'px';}
    function onUp(){isDown = false; container.style.transition = '';}
    header.addEventListener('mousedown', onDown); header.addEventListener('touchstart', onDown, {passive:false});
    window.addEventListener('mousemove', onMove); window.addEventListener('touchmove', onMove, {passive:false});
    window.addEventListener('mouseup', onUp); window.addEventListener('touchend', onUp);
  }
  if(document.readyState==='complete') ativarArraste(); else window.addEventListener('load', ativarArraste);
})();
window.addEventListener('message', function(e){
  if(e.data && e.data.tipo==='LOGIN_DADOS'){
    let mat = String(e.data.matricula||'').toUpperCase().trim();
    let sen = String(e.data.senha||'').toUpperCase().trim();
    let elMat=document.getElementById('Matricula');
    let elSen=document.getElementById('Senha');
    if(elMat && mat) elMat.value=normaliza5Dig(mat);
    if(elSen && sen){ elSen.value=sen; elSen.type='password'; }
    localStorage.setItem('mat_logada', normaliza5Dig(mat));
    localStorage.setItem('senha_logada', sen);
    setarMatriculaLogin();
    aplicarRegraTrava();
  }
});
window.addEventListener('load', function(){
  setTimeout(()=>{
    setarMatriculaLogin();
    let mat=localStorage.getItem('mat_logada');
    let sen=localStorage.getItem('senha_logada');
    if(mat) document.getElementById('Matricula').value=normaliza5Dig(mat);
    if(sen) document.getElementById('Senha').value=sen.toUpperCase();
    if(mat||sen){ aplicarRegraTrava(); }
  }, 700);
});
async function recuperar(){
  let m = document.getElementById('modalRecuperar'); if(m){ m.remove(); return; }
  let matAtual = getMatriculaLogin();
  if(!matAtual || matAtual==='00000'){
    matAtual = normaliza5Dig(document.getElementById('Matricula')?.value || '');
  }
  let nomeAtual = (document.getElementById('Nome')?.value || '').toUpperCase();
  let modal = document.createElement('div');
  modal.id = 'modalRecuperar';
  modal.style = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99990;display:flex;justify-content:center;align-items:flex-start;padding-top:20px';
  modal.innerHTML = `<div style="background:#f8f9fa;width:96%;max-width:560px;max-height:90vh;display:flex;flex-direction:column;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.3)"><div id="handleRecup" style="background:#111;color:white;padding:12px;display:flex;align-items:center;gap:12px"><button onclick="document.getElementById('modalRecuperar').remove()" style="background:white;color:#111;border:0;padding:8px 14px;border-radius:8px;font-weight:900">✕ FECHAR</button><h3 id="tituloRecup" style="margin:0;font-size:13px;font-weight:900;flex:1;cursor:move">📝 REEDIÇÃO - ${matAtual}</h3></div><div id="listaRecup" style="overflow-y:auto;padding:10px;background:#f8f9fa">Buscando ${matAtual}...</div></div>`;
  document.body.appendChild(modal);
  tornarMovel('modalRecuperar','handleRecup');
  try{
    let res = await apiGet('getliberacao',{});
    let lista = res.data || res || [];
    listaLiberacao = lista;
    let filtrados = lista.filter(it=>{
      let mat = normaliza5Dig(String(it.MATRICULA||it.Matricula||it.A||it.a||'').trim());
      return mat && mat===matAtual;
    });
    let div = document.getElementById('listaRecup');
    let tit = document.getElementById('tituloRecup');
    if(filtrados.length===0){
      tit.innerText = `📝 REEDIÇÃO - ${matAtual} - 0`;
      div.innerHTML = `<div style="text-align:center;padding:20px">Nenhuma recuperação liberada para<br><b>${matAtual} - ${nomeAtual}</b><br><br>Só para alunos com nota inferior a 70.</div>`;
      return;
    }
    tit.innerText = `📝 REEDIÇÃO - ${matAtual} - ${filtrados.length}`;
    let abertosRecup={}; try{abertosRecup=JSON.parse(localStorage.getItem('recuperacoes_abertas')||'{}')}catch(e){}
    div.innerHTML = filtrados.map((it)=>{
      let ciclo = String(it.CICLO||it.E||'').toUpperCase();
      let teste = String(it.TESTE||it.F||'').toUpperCase();
      let nome = String(it.NOME||it.B||'').toUpperCase();
      let nota = it.NOTA||it.G||'';
      let link = String(it.LINK||it.H||it.h||'').trim();
      let codRecup = (ciclo+'-'+teste+'-'+(it.MATRICULA||matAtual)).replace(/\s+/g,'');
      let jaFeito =!!abertosRecup[codRecup];
      return `<div style="background:${jaFeito?'#ecfdf5':(nota<70?'#f59e0b':'white')};border:1px solid #e5e7eb;border-radius:10px;padding:10px 12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
        <div style="flex:1"><div style="font-weight:900;font-size:12px;color:#111">${ciclo} | ${teste} | NOTA ${nota} ${jaFeito?'✅':''}</div><div style="font-size:10px;color:#333">${it.MATRICULA||''} - ${nome}</div><div style="font-size:9px;color:#666">${it.CONGREGACAO||it.D||''}</div></div>
        <button onclick="abrirLinkRecuperacao('${link.replace(/'/g,"%27")}','${codRecup}')" style="background:${jaFeito?'#16a34a':'#0f766e'};color:white;border:0;padding:8px 14px;border-radius:8px;font-weight:900;font-size:11px">${jaFeito?'✅ VISTO':'ABRIR'}</button></div>`;
    }).join('');
  }catch(e){
    document.getElementById('listaRecup').innerHTML = 'ERRO: '+e.message;
  }
}
function abrirLinkRecuperacao(linkOriginal, codUnico){
  if(!linkOriginal){ toast('Link vazio','err'); return; }
  const d = coletarDados();
  let base = linkOriginal;
  try{
    if(linkOriginal.includes('/viewform')){
      base = linkOriginal.split('/viewform')[0]+'/viewform?usp=pp_url';
      let entries=[...linkOriginal.matchAll(/entry\.(\d+)/g)].map(x=>x[0]);
      let bat=String(d.BatizadoAgua||'').toUpperCase(); if(bat!=='SIM'&&bat!=='NAO') bat='SIM';
      let vals=[d.Congregacao||'',d.Nome||'',d.WhatsApp||'',d.Matricula||'',(d.Sexo||'').toUpperCase(),bat,(d.QualFuncao||'').toUpperCase(),(d.Fcongregacao||'').toUpperCase()];
      if(entries.length>0) entries.forEach((e,i)=>{ if(vals[i]!==undefined) base+='&'+e+'='+encodeURIComponent(vals[i]); });
    }
  }catch(e){ base = linkOriginal; }
  try{
    let abertos=JSON.parse(localStorage.getItem('recuperacoes_abertas')||'{}');
    abertos[codUnico]=true;
    localStorage.setItem('recuperacoes_abertas', JSON.stringify(abertos));
    let btn = document.querySelector(`button[onclick*="${codUnico}"]`);
    if(btn){ btn.innerText='✅ VISTO'; btn.style.background='#16a34a'; }
  }catch(e){}
  apiGet('salvarNaResposta',{dados:JSON.stringify({...d, tipo:'RECUPERACAO', CodigoTeste: codUnico}), cod:codUnico||('RECUP-'+Date.now()), ciclo:'RECUP'}).catch(()=>{});
  mostrarAvisoAntesAbrir(base);
}
(function(){
  function norm(v){ return (v||'').toString().trim().toUpperCase(); }
  function travarCampos(){
    let curso = norm(document.getElementById('Cteologico')?.value);
    let temFuncao = norm(document.getElementById('TFunEclesiastica')?.value);
    let grau = document.getElementById('GrauCurso');
    let andam = document.getElementById('Andamento');
    let funcaoEcle = document.getElementById('QualFuncao');
    let ehNaoCurso = (curso === 'NAO' || curso === 'NÃO');
    if(ehNaoCurso){
      if(grau){ grau.value=''; grau.disabled=true; grau.readOnly=true; }
      if(andam){ andam.value=''; andam.disabled=true; andam.readOnly=true; }
      document.getElementById('wrap_GrauCurso').style.pointerEvents='none';
      document.getElementById('wrap_GrauCurso').style.opacity='0.4';
      document.getElementById('wrap_Andamento').style.pointerEvents='none';
      document.getElementById('wrap_Andamento').style.opacity='0.4';
    } else {
      if(grau){ grau.disabled=false; grau.readOnly=false; }
      if(andam){ andam.disabled=false; andam.readOnly=false; }
      document.getElementById('wrap_GrauCurso').style.pointerEvents='';
      document.getElementById('wrap_GrauCurso').style.opacity='';
      document.getElementById('wrap_Andamento').style.pointerEvents='';
      document.getElementById('wrap_Andamento').style.opacity='';
    }
    let ehNaoFuncao = (temFuncao === 'NAO' || temFuncao === 'NÃO');
    if(ehNaoFuncao){
      if(funcaoEcle){ funcaoEcle.value=''; funcaoEcle.disabled=true; funcaoEcle.readOnly=true; }
      document.getElementById('wrap_QualFuncao').style.pointerEvents='none';
      document.getElementById('wrap_QualFuncao').style.opacity='0.4';
    } else {
      if(funcaoEcle){ funcaoEcle.disabled=false; funcaoEcle.readOnly=false; }
      document.getElementById('wrap_QualFuncao').style.pointerEvents='';
      document.getElementById('wrap_QualFuncao').style.opacity='';
    }
  }
  ['Cteologico','TFunEclesiastica'].forEach(id=>{
    let el=document.getElementById(id);
    if(el){
      el.addEventListener('change', travarCampos);
      el.addEventListener('input', travarCampos);
    }
  });
  setInterval(travarCampos, 700);
  window.addEventListener('load', ()=>setTimeout(travarCampos, 1200));
})();


// ===== STATUS DADOS COMPLETOS / INCOMPLETOS - 00425 =====
function verificarDadosCompletos(){
  var obrig = ['Matricula','CPF','Nome','Sexo','WhatsApp','Nascimento','Congregacao','SitConjugal','Cteologico','BatizadoAgua','EspSanto','TFunEclesiastica'];
  for(var i=0;i<obrig.length;i++){
    var el = document.getElementById(obrig[i]);
    if(!el) continue;
    var v = (el.value||'').toString().trim();
    if(!v) return false;
  }
  return true;
}

function atualizarStatusDados(){
  var box = document.getElementById('statusDados');
  if(!box) return false;
  var ok = verificarDadosCompletos();
  if(ok){
    box.textContent = '✅ Dados completos';
    box.className = 'status-completo';
  }else{
    box.textContent = '⚠️ Dados incompletos';
    box.className = 'status-incompleto';
  }
  return ok;
}

// Atualiza em tempo real
document.addEventListener('input', function(e){
  if(e.target && e.target.closest && e.target.closest('.form-section')){
    setTimeout(atualizarStatusDados,150);
  }
});
setInterval(atualizarStatusDados, 1000);
window.addEventListener('load', function(){ setTimeout(atualizarStatusDados,1300); });

// Salvar também atualiza
if(window.salvar &&!window.salvar._comStatus){
  var _origSalvarStatus = window.salvar;
  window.salvar = function(){
    var r = _origSalvarStatus.apply(this, arguments);
    setTimeout(atualizarStatusDados, 900);
    return r;
  };
  window.salvar._comStatus = true;
}


// === LEVA INFO PRO CERTIFICADO SEM MUDAR NADA ACIMA ===
(function(){
  var _originalStatus = atualizarStatusDados;
  window.atualizarStatusDados = function(){
    var ok = _originalStatus.apply(this, arguments);
    try{
      var mat = (document.getElementById('Matricula')?.value||'').toString().trim().toUpperCase().replace(/\D/g,'').padStart(5,'0').slice(-5);
      if(mat && mat!=='00000'){
        localStorage.setItem('IEADMI_BLOQUEIO_'+mat, ok? 'COMPLETO' : 'INCOMPLETO');
        localStorage.setItem('IEADMI_ULTIMO_BLOQUEIO', mat+'|'+(ok? 'COMPLETO' : 'INCOMPLETO'));
      }
    }catch(e){}
    return ok;
  };
})();

// TRAVA O TESTE - SE INCOMPLETO NAO ABRE
(function(){
  var t=0;
  var iv=setInterval(function(){
    t++;
    if(typeof window.abrirTeste52==='function' &&!window.abrirTeste52._travadoStatus){
      var orig52 = window.abrirTeste52;
      window.abrirTeste52 = function(){
        var ok = atualizarStatusDados();
        if(!ok){
          mostrarAlerta('Os dados estão incompletos','⚠️ Dados incompletos');
          return false;
        }
        return orig52.apply(this, arguments);
      };
      window.abrirTeste52._travadoStatus = true;
      clearInterval(iv);
    }
    if(t>200) clearInterval(iv);
  },300);
})();

// TRAVA abrirTeste também
if(window.abrirTeste &&!window.abrirTeste._travadoStatus){
  var _origAbrirTeste = window.abrirTeste;
  window.abrirTeste = function(link,cod,row){
    var ok = verificarDadosCompletos();
    atualizarStatusDados();
    if(!ok){
      mostrarAlerta('Os dados estão incompletos','⚠️ Dados incompletos');
      return false;
    }
    return _origAbrirTeste.apply(this, arguments);
  };
  window.abrirTeste._travadoStatus = true;
}

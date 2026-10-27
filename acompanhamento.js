const BASE = "https://script.google.com/macros/s/AKfycbz2phEY97FZOsloQriNH9i0cWQ0Qex0PAr02jbL18qZHjHwnTtOB4tRcwJRIQbHjMYC/exec?action=getRelTodosRaw";
let ALL = []; let TOTAL = 0;
// NOVA ORDEM: item CONGREGAÇÃO MATRICULA NOME WHATSAPP Func Ecles Teste PONTUAÇÃO Ciclo Sexo BatAgua Func Cong Data
const ORDEM = [0,5,8,6,7,11,2,4,1,9,10,12,3];

function formatDataBR(v){
  if(!v) return v;
  const s = String(v).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if(m) return `${m[3]}/${m[2]}/${m[1]} - ${m[4]}:${m[5]}:${m[6]}`;
  return v;
}

async function loadAll(force){
  if(force) ALL = [];
  document.getElementById('status').textContent = "Buscando todos...";
  let start = 1; let limit = 1000; ALL = [];
  while(true){
    const url = `${BASE}&start=${start}&limit=${limit}&_=${Date.now()}`;
    const res = await fetch(url); const j = await res.json();
    TOTAL = j.total;
    let clean = (j.data||[]).filter((r,i)=> !(start===1 && i===0 && String(r[0]).toLowerCase().includes('item')));
    ALL = ALL.concat(clean);
    const pct = TOTAL ? Math.round(ALL.length/TOTAL*100) : 0;
    document.getElementById('pbar').style.width = pct + "%";
    document.getElementById('count').textContent = `${ALL.length} / ${TOTAL}`;
    document.getElementById('status').textContent = pct<100 ? `Carregando ${pct}%` : `Ao vivo - ${TOTAL} lançamentos`;
    document.getElementById('foot').textContent = `Última atualização: ${new Date().toLocaleString()}`;
    if(!j.hasMore || clean.length < limit) break;
    start += limit;
  }
  render();
}

async function checarNovos(){
  if(ALL.length===0) return loadAll(true);
  const start = ALL.length + 1;
  const url = `${BASE}&start=${start}&limit=1000&_=${Date.now()}`;
  try{
    const res = await fetch(url); const j = await res.json();
    const novos = (j.data||[]).filter(r=> r.join('').trim() !== '' && String(r[0]).toLowerCase() !== 'item');
    if(novos.length > 0){
      TOTAL = j.total; ALL = ALL.concat(novos);
      document.getElementById('count').textContent = `${ALL.length} / ${TOTAL}`;
      document.getElementById('status').textContent = `+${novos.length} novo(s)`;
      render();
    }
  }catch(e){}
}

function getFiltros(){
  return {
    nome: document.getElementById('fNome').value.toLowerCase().trim(),
    mat: document.getElementById('fMat').value.replace(/\D/g,'').trim(), // só números
    teste: document.getElementById('fTeste').value.toLowerCase().trim(),
    sexo: document.getElementById('fSexo').value.toLowerCase().trim(),
    funcao: document.getElementById('fFuncao').value.toLowerCase().trim(),
    geral: document.getElementById('q').value.toLowerCase().trim()
  };
}

function render(){
  const f = getFiltros();
  let filtered = ALL.filter(r=>{
    if(f.nome && !String(r[6]||'').toLowerCase().includes(f.nome)) return false;
    if(f.mat){
      let filtroNum = String(f.mat).replace(/\D/g,'').replace(/^0+/,'') || '0';
      let bancoNum = String(r[8]||'').replace(/\D/g,'').replace(/^0+/,'') || '0';
      if(filtroNum !== bancoNum && !bancoNum.includes(filtroNum)) return false;
    }
    if(f.teste && !String(r[2]||'').toLowerCase().includes(f.teste)) return false;
    if(f.sexo && !String(r[9]||'').toLowerCase().includes(f.sexo)) return false;
    if(f.funcao && !String(r[11]||'').toLowerCase().includes(f.funcao)) return false;
    if(f.geral && !r.join(' ').toLowerCase().includes(f.geral)) return false;
    return true;
  });


  document.getElementById('info').textContent = `- ${filtered.length} exibidos de ${ALL.length}`;
  const tbody = document.getElementById('tbody');
  const toShow = filtered.slice(-1000);
  
  tbody.innerHTML = toShow.map(r=> `<tr>${ORDEM.map(idx=>{
    const v = r[idx];
    if(!v) return `<td>—</td>`;
    if(idx===3) return `<td>${formatDataBR(v)}</td>`;
    
    // MATRICULA 5 digitos 00000 + direita
    if(idx===8){
      let m = String(v).replace(/\D/g,'').padStart(5,'0');
      return `<td style="text-align:right;padding-right:20px">${m}</td>`;
    }
    // NOTA na direita
    if(idx===4){
      return `<td style="text-align:right;padding-right:20px">${v}</td>`;
    }
    
    return `<td>${v}</td>`;
  }).join('')}</tr>`).join('');
}


function limparFiltros(){
  document.getElementById('fNome').value='';
  const fMatEl = document.getElementById('fMat');
  if(!fMatEl.classList.contains('travado')){
    fMatEl.value='';
  }
  document.getElementById('fTeste').value='';
  document.getElementById('fSexo').value='';
  document.getElementById('fFuncao').value='';
  document.getElementById('q').value='';
  render();
}

['fNome','fMat','fTeste','fSexo','fFuncao','q'].forEach(id=>{
  const el = document.getElementById(id);
  if(el){
    el.addEventListener('input', render);
    el.addEventListener('change', render);
  }
});

// Formata matrícula para 5 dígitos ao digitar - TEM QUE FICAR FORA DO FOREACH
const fMatInput = document.getElementById('fMat');
if(fMatInput){
  fMatInput.addEventListener('input', function(){
    if(this.classList.contains('travado')) return;
    let v = this.value.replace(/\D/g,'').slice(-5);
    if(v){
      this.value = v.padStart(5,'0');
    }
  });
  fMatInput.addEventListener('blur', function(){
    if(this.classList.contains('travado')) return;
    let v = this.value.replace(/\D/g,'').slice(-5);
    if(v){
      this.value = v.padStart(5,'0');
    }
  });
}


function getMatriculaLogada(){
  let m = localStorage.getItem('mat_logada') || localStorage.getItem('matricula') || localStorage.getItem('MATRICULA') || sessionStorage.getItem('mat_logada');
  if(m) return String(m).replace(/\D/g,'').padStart(5,'0');
  try{
    let user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('usuario') || 'null');
    if(user){
      let mat = user.matricula || user.MATRICULA || user.mat || user.id;
      if(mat) return String(mat).replace(/\D/g,'').padStart(5,'0');
    }
  }catch(e){}
  const urlParams = new URLSearchParams(window.location.search);
  let matUrl = urlParams.get('mat') || urlParams.get('matricula') || urlParams.get('mat_logada');
  if(matUrl) return String(matUrl).replace(/\D/g,'').padStart(5,'0');
  return null;
}

function travarMatricula(){
  const ADMINS = ["00425","00001","05722","425","1","5722"];
  const matricula = getMatriculaLogada();
  const campo = document.getElementById('fMat');
  if(!campo) return;
  
  if(!matricula){
    // sem login, deixa livre pra não quebrar
    campo.value = "";
    campo.readOnly = false;
    campo.classList.remove('travado');
    return;
  }

  let mat5 = matricula.padStart(5,'0');
  let matSemZero = matricula.replace(/^0+/,'');
  let ehAdm = ADMINS.includes(matricula) || ADMINS.includes(matSemZero) || ADMINS.includes(mat5);

  if(ehAdm){
    campo.value = mat5; // ADM VEM com matrícula mas pode editar
    campo.readOnly = false;
    campo.classList.remove('travado');
    campo.title = "ADM - liberado";
  } else {
    campo.value = mat5; // usuário comum
    campo.readOnly = true; // SÓ readOnly, sem disabled
    campo.classList.add('travado');
    campo.title = "Travado: " + mat5;
  }
  render();
}

travarMatricula();
loadAll(true);
setInterval(()=> { if(document.getElementById('auto').checked) checarNovos(); }, 3000);
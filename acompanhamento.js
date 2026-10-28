const BASE = "https://script.google.com/macros/s/AKfycbz2phEY97FZOsloQriNH9i0cWQ0Qex0PAr02jbL18qZHjHwnTtOB4tRcwJRIQbHjMYC/exec?action=getRelTodosRaw";

// === PEGA USUARIO LOGADO DE QUALQUER LUGAR ===
function getUsuarioLogado() {
  let nome = '';
  let mat = '';
  const chaves = ['nome_logado','usuario_nome','nome','NOME','user_nome','logado_nome'];
  for(let k of chaves){
    let v = localStorage.getItem(k);
    if(v && v.length > 2){ nome = v; break; }
  }
  try{
    let u = JSON.parse(localStorage.getItem('usuario') || localStorage.getItem('user') || localStorage.getItem('dadosUsuario') || 'null');
    if(u){
      nome = u.nome || u.NOME || u.name || u.usuario || nome;
      mat = u.matricula || u.MATRICULA || mat;
    }
  }catch(e){}
  if(!mat) mat = localStorage.getItem('matricula_logada') || localStorage.getItem('matricula') || '';
  if(!nome && mat) nome = 'MAT ' + mat;
  if(!nome) nome = 'USUARIO DESCONHECIDO';
  return { nome: nome.toUpperCase(), mat: mat };
}

const USER = getUsuarioLogado();
setTimeout(()=>{
  const el = document.getElementById('userLogado');
  if(el) el.textContent = '👤 ' + USER.nome + (USER.mat ? ' ('+USER.mat+')' : '');
}, 500);

let ALL = []; let TOTAL = 0;
let SELECIONADOS = new Map();
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
    mat: document.getElementById('fMat').value.replace(/\D/g,'').trim(),
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
  
  tbody.innerHTML = toShow.map(r=> {
    const itemId = String(r[0]||'');
    const checked = SELECIONADOS.has(itemId) ? 'checked' : '';
    return `<tr data-item="${itemId}">
      <td style="text-align:center"><input type="checkbox" class="chk-item" data-item="${itemId}" ${checked}></td>
      ${ORDEM.map(idx=>{
        const v = r[idx];
        if(!v && v!==0) return `<td>—</td>`;
        if(idx===3) return `<td>${formatDataBR(v)}</td>`;
        if(idx===8){ let m = String(v).replace(/\D/g,'').padStart(5,'0'); return `<td style="text-align:right;padding-right:20px">${m}</td>`; }
        if(idx===4){ return `<td style="text-align:right;padding-right:20px">${v}</td>`; }
        return `<td>${v}</td>`;
      }).join('')}
    </tr>`
  }).join('');

  tbody.querySelectorAll('tr').forEach(tr=>{
    const id = tr.dataset.item;
    const linha = ALL.find(row=> String(row[0])===id);
    tr.ondblclick = () => abrirFormTop(linha);
  });

  tbody.querySelectorAll('.chk-item').forEach(chk=>{
    chk.addEventListener('change', (e)=>{
      const id = e.target.dataset.item;
      const linha = ALL.find(row=> String(row[0])===id);
      if(e.target.checked){ SELECIONADOS.set(id, linha); }
      else{ SELECIONADOS.delete(id); }
      atualizarContador();
    });
  });
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
  const urlParams = new URLSearchParams(window.location.search);
  let matUrl = urlParams.get('mat') || urlParams.get('matricula') || urlParams.get('mat_logada');
  if(matUrl) return String(matUrl).replace(/\D/g,'').padStart(5,'0');
  let m = localStorage.getItem('mat_logada') || localStorage.getItem('matricula') || localStorage.getItem('MATRICULA') || sessionStorage.getItem('mat_logada');
  if(m) return String(m).replace(/\D/g,'').padStart(5,'0');
  try{
    if(window.parent && window.parent !== window){
      let pm = window.parent.localStorage.getItem('mat_logada');
      if(pm) return String(pm).replace(/\D/g,'').padStart(5,'0');
    }
  }catch(e){}
  try{
    let user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('usuario') || 'null');
    if(user){
      let mat = user.matricula || user.MATRICULA || user.mat || user.id;
      if(mat) return String(mat).replace(/\D/g,'').padStart(5,'0');
    }
  }catch(e){}
  return null;
}

function travarMatricula(){
  const ADMINS = ["00425","00001","05722","425","1","5722"];
  const matricula = getMatriculaLogada();
  const campo = document.getElementById('fMat');
  if(!campo) return false;
  if(!matricula) return false;
  let mat5 = matricula.padStart(5,'0');
  let matSemZero = mat5.replace(/^0+/,'');
  let ehAdm = ADMINS.includes(matricula) || ADMINS.includes(matSemZero) || ADMINS.includes(mat5);
  campo.value = mat5;
  if(ehAdm){
    campo.readOnly = false;
    campo.classList.remove('travado');
    campo.title = "ADM - liberado";
    campo.style.background = "";
    campo.style.cursor = "";
  } else {
    campo.readOnly = true;
    campo.classList.add('travado');
    campo.title = "Travado: " + mat5;
    campo.style.background = "#e5e7eb";
    campo.style.cursor = "not-allowed";
  }
  render();
  return true;
}

window.addEventListener('message', function(e){
  if(e.data && (e.data.tipo === 'LOGIN_DADOS' || e.data.matricula)){
    let mat = e.data.matricula || e.data.mat;
    if(mat){
      localStorage.setItem('mat_logada', mat);
      travarMatricula();
    }
  }
});

function atualizarContador(){
  const el = document.getElementById('selCount');
  if(el) el.textContent = SELECIONADOS.size;
}

document.getElementById('selAll')?.addEventListener('change', (e)=>{
  const checks = document.querySelectorAll('.chk-item');
  checks.forEach(c=>{
    c.checked = e.target.checked;
    const id = c.dataset.item;
    const linha = ALL.find(row=> String(row[0])===id);
    if(e.target.checked){ SELECIONADOS.set(id, linha); } 
    else { SELECIONADOS.delete(id); }
  });
  atualizarContador();
});

document.getElementById('btnRelatorio')?.addEventListener('click', ()=>{
  if(SELECIONADOS.size===0){ alert('Selecione pelo menos 1 item'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l','mm','a4');
  const matLogada = getMatriculaLogada() || '';
  doc.setFont('helvetica','bold'); doc.setFontSize(12);
  doc.text('RELATORIO VINCULUM - ACOMPANHAMENTO', 14, 10);
  doc.setFontSize(9); doc.setFont('helvetica','normal');
  const dataHora = new Date().toLocaleString();
  function pegarMatFiltro(){
    const ids = ['filtroMatricula','matriculaFiltro','filtroMat','inputMatricula','matricula','filtroMAT'];
    for(const id of ids){
      const el = document.getElementById(id);
      if(el && el.value.trim() !== '') return el.value;
    }
    const todos = [...document.querySelectorAll('input')];
    const achado = todos.find(i => /^\d{3,6}$/.test((i.value||'').trim()));
    return achado ? achado.value : '';
  }
  const matFiltroRaw = pegarMatFiltro();
  const matFiltro = matFiltroRaw.replace(/\D/g,'').trim();
  const matFiltroPad = matFiltro ? matFiltro.padStart(5,'0') : '';
  let dados = Array.from(SELECIONADOS.values());
  if(matFiltroPad){
    dados = dados.filter(r => String(r[8]||'').replace(/\D/g,'').padStart(5,'0') === matFiltroPad);
  }
  const tabela = document.querySelector('table');
  if(tabela){
    const checksVisiveis = [...tabela.querySelectorAll('tbody input[type="checkbox"]:checked')];
    if(checksVisiveis.length > 0 && checksVisiveis.length < dados.length + 20){
      const itensMarcados = new Set(checksVisiveis.map(cb => {
        const tr = cb.closest('tr');
        const tds = tr ? [...tr.querySelectorAll('td')] : [];
        return tds[1] ? tds[1].textContent.trim() : '';
      }));
      const filtradoPorCheck = dados.filter(r => itensMarcados.has(String(r[0]||'').trim()));
      if(filtradoPorCheck.length > 0) dados = filtradoPorCheck;
    }
  }
  if(dados.length === 0){ alert('Nenhum dado com o filtro atual'); return; }
  let linhaInfo = `Relatorio | Data: ${dataHora} | Total: ${dados.length}`;
  if(matFiltro !== '') linhaInfo = `Matricula: ${matFiltroPad} | Data: ${dataHora} | Total: ${dados.length}`;
  doc.text(linhaInfo, 14, 16);
  const head = [['ITEM','MAT','NOME','CONGREGACAO','CICLO','TESTE','PONT','WHATS','DATA']];
  const body = dados.map((r, i)=>{
    const num = (String(r[2]||'').match(/(\d+)\s*$/)||['','0'])[1];
    return [
      String(i+1).padStart(5,'0'),
      String(r[8]||'').replace(/\D/g,'').padStart(5,'0'),
      String(r[6]||'').toUpperCase(),
      String(r[5]||''),
      String(r[1]||'').toUpperCase(),
      `TESTE ${String(num).padStart(2,'0')}`,
      String(r[4]||''),
      String(r[7]||''),
      formatDataBR(r[3]||'')
    ];
  });
  doc.autoTable({
    head: head, body: body, startY: 20,
    margin: { left: 14, right: 10, bottom: 15 },
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [15,23,42], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248,250,252] },
    columnStyles: {
      0: { halign: 'right', cellWidth: 15 },
      1: { halign: 'right', cellWidth: 15 },
      4: { halign: 'left', cellWidth: 22 },
      5: { halign: 'left', cellWidth: 20 },
      6: { halign: 'right', cellWidth: 12 },
    },
    didParseCell: function(data){
      if(data.column.index === 0 || data.column.index === 1 || data.column.index === 6) data.cell.styles.halign = 'right';
      if(data.column.index === 4 || data.column.index === 5) data.cell.styles.halign = 'left';
    },
    didDrawPage: function(data){
      const pageW = doc.internal.pageSize.width; const pageH = doc.internal.pageSize.height;
      doc.setFontSize(7); doc.setFont('helvetica','normal');
      doc.text('Htec Sistemas - Uma forma simples e eficiente em produzir', 10, pageH - 6);
      doc.text(`Pag ${String(data.pageNumber).padStart(2,'0')}/${String(doc.internal.getNumberOfPages()).padStart(2,'0')}`, pageW - 10, pageH - 6, {align:'right'});
    }
  });
  const total = doc.internal.getNumberOfPages();
  for(let i=1; i<=total; i++){
    doc.setPage(i); const pageW = doc.internal.pageSize.width; const pageH = doc.internal.pageSize.height;
    doc.setFontSize(7); doc.text('Htec Sistemas - Uma forma simples e eficiente em produzir', 10, pageH - 6);
    doc.text(`Pag ${String(i).padStart(2,'0')}/${String(total).padStart(2,'0')}`, pageW - 10, pageH - 6, {align:'right'});
  }
  let finalY = doc.lastAutoTable.finalY + 15;
  if(finalY > 185){ doc.addPage(); finalY = 20; }
  else doc.setPage(total);
  doc.line(100, finalY, 190, finalY);
  doc.setFont('helvetica','bold'); doc.setFontSize(9);
  doc.text('Assinatura', 145, finalY+6, {align:'center'});
  doc.save(`relatorio_vinculum_${matFiltroPad || matLogada}_${new Date().toISOString().slice(0,10)}.pdf`);
});

travarMatricula();
loadAll(true);

let tentativas = 0;
let intervaloTrava = setInterval(()=>{
  tentativas++;
  if(travarMatricula() || tentativas > 20){
    clearInterval(intervaloTrava);
  }
}, 500);

setInterval(()=> { 
  if(document.getElementById('auto') && document.getElementById('auto').checked) checarNovos(); 
}, 3000);

// ===== FORM QUE ABRE NO DUPLO CLIQUE =====
// ===== FORM CHIQUE + TRAVADO + ARRASTÁVEL =====
function abrirFormTop(r){
  if(!r) return;
  if(document.getElementById('modalForm')) document.getElementById('modalForm').remove();
  
  let dataBr = '';
  if(r[3]){
    try{
      let d = new Date(r[3]);
      if(!isNaN(d)) dataBr = d.toLocaleDateString('pt-BR')+' '+d.toLocaleTimeString('pt-BR');
      else dataBr = String(r[3]);
    }catch(e){ dataBr = String(r[3]); }
  }

 const html = `
<div id="modalForm" style="display:flex;position:fixed;inset:0;background:rgba(15,23,42,.65);backdrop-filter:blur(6px);z-index:99999;align-items:center;justify-content:center;padding:12px">
    <div id="modalBox" style="background:#fff;width:100%;max-width:800px;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.35);overflow:hidden;transform:translate(0,0);font-family:Inter,sans-serif;border:1px solid #e2e8f0">
      <div id="modalHeader" style="background:#0f172a;color:#fff;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;cursor:grab;user-select:none">
        <b style="font-size:12px;display:flex;gap:8px;align-items:center">✏️ ALTERAR <span style="background:#fff;color:#0f172a;padding:2px 8px;border-radius:6px;font-weight:900">${r[0]}</span> - ${String(r[6]).toUpperCase()}</b>
        <button onclick="document.getElementById('modalForm').remove()" style="background:#fff;border:none;border-radius:7px;cursor:pointer;font-weight:800;color:#0f172a;width:26px;height:26px">✕</button>
      </div>
      <div style="padding:20px 22px;display:grid;grid-template-columns:82px 82px 1.4fr 1fr 158px;gap:14px 12px;background:#fff">
        
        <label style="font-size:10px;font-weight:700;color:#334155;display:flex;flex-direction:column;gap:5px">Item 🔒<input id="mt0" disabled style="width:100%;padding:10px 12px;border:none;border-radius:8px;background:#f1f5f9;font-weight:700;color:#334155;font-size:12px"></label>
        <label style="font-size:10px;font-weight:700;color:#334155;display:flex;flex-direction:column;gap:5px">Matrícula 🔒<input id="mt8" disabled style="width:100%;padding:10px 12px;border:none;border-radius:8px;background:#f1f5f9;font-weight:700;color:#334155;font-size:12px"></label>
        <label style="font-size:10px;font-weight:700;color:#334155;display:flex;flex-direction:column;gap:5px">Teste 🔒<input id="mt2" disabled style="width:100%;padding:10px 12px;border:none;border-radius:8px;background:#f1f5f9;font-weight:700;color:#334155;font-size:12px"></label>
        <label style="font-size:10px;font-weight:700;color:#334155;display:flex;flex-direction:column;gap:5px">Ciclo 🔒<input id="mt1" disabled style="width:100%;padding:10px 12px;border:none;border-radius:8px;background:#f1f5f9;font-weight:700;color:#334155;font-size:12px"></label>
        <label style="font-size:10px;font-weight:700;color:#334155;display:flex;flex-direction:column;gap:5px">Data 🔒<input id="mt3" disabled style="width:100%;padding:10px 12px;border:none;border-radius:8px;background:#e0e7ff;font-weight:700;color:#334155;font-size:11px"></label>

        <div style="grid-column:1/-1;display:flex;flex-direction:column;gap:5px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <label style="font-size:10px;font-weight:700;color:#334155">Congregação</label>
            <label style="display:flex;align-items:center;gap:5px;cursor:pointer;background:#f1f5f9;padding:3px 8px;border-radius:6px;border:1px solid #e2e8f0">
              <input type="checkbox" id="chkCong" onchange="let i=document.getElementById('mt5'); i.disabled=!this.checked; if(this.checked){ i.style.background='#fff'; i.style.border='1.5px solid #0f172a'; i.style.boxShadow='0 0 0 3px rgba(15,23,42,.12)'; i.focus(); } else { i.style.background='#f1f5f9'; i.style.border='none'; i.style.boxShadow='none'; }" style="width:14px;height:14px;accent-color:#0f172a">
              <span style="font-size:9px;font-weight:800;color:#0f172a">🔓 DESTRAVAR</span>
            </label>
          </div>
          <input id="mt5" disabled oninput="this.value=this.value.toUpperCase()" style="width:100%;padding:11px 13px;border:none;border-radius:8px;background:#f1f5f9;font-size:13px;font-weight:600;text-transform:uppercase;color:#64748b">
        </div>

        <label style="font-size:10px;font-weight:700;color:#334155;grid-column:1/5;display:flex;flex-direction:column;gap:5px">Nome<input id="mt6" oninput="this.value=this.value.toUpperCase()" style="width:100%;padding:11px 13px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;font-size:13px;font-weight:600;text-transform:uppercase"></label>
        <label style="font-size:10px;font-weight:700;color:#b45309;display:flex;flex-direction:column;gap:5px">Pontuação Nota 🔒<input id="mt4" disabled style="width:100%;padding:11px 13px;border-radius:8px;background:#fef9c3;font-weight:800;color:#92400e;border:1px solid #fde68a;font-size:13px"></label>

        <label style="font-size:10px;font-weight:700;color:#334155;grid-column:1/3;display:flex;flex-direction:column;gap:5px">WhatsApp<input id="mt7" style="width:100%;padding:11px 13px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;font-size:13px"></label>

        <!-- SEXO - DIGITAVEL MAS SO ACEITA LISTA -->
        <label style="font-size:10px;font-weight:700;color:#334155;grid-column:3/5;display:flex;flex-direction:column;gap:5px">Sexo
          <input id="mt9" list="listSexo" oninput="this.value=this.value.toUpperCase()" style="width:100%;padding:11px 13px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;font-size:13px;font-weight:600">
          <datalist id="listSexo"><option value="MASCULINO"><option value="FEMININO"></datalist>
        </label>

        <!-- BATISMO - DIGITAVEL MAS SO ACEITA LISTA -->
        <label style="font-size:10px;font-weight:700;color:#334155;display:flex;flex-direction:column;gap:5px">Batismo Água
          <input id="mt10" list="listAgua" oninput="this.value=this.value.toUpperCase()" style="width:100%;padding:11px 13px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;font-size:13px;font-weight:600">
          <datalist id="listAgua"><option value="SIM"><option value="NÃO"></datalist>
        </label>

        <!-- FUNCAO ECLESIASTICA - IGUAL DA FOTO -->
        <label style="font-size:10px;font-weight:700;color:#334155;grid-column:1/4;display:flex;flex-direction:column;gap:5px">Função Eclesiástica
          <input id="mt11" list="listEcles" oninput="this.value=this.value.toUpperCase()" style="width:100%;padding:11px 13px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;font-size:13px;font-weight:600">
          <datalist id="listEcles">
            <option value="AUXILIAR"><option value="DIACONO"><option value="PRESBITERO"><option value="EVANGELISTA"><option value="PASTOR"><option value="MISSIONARIO">
          </datalist>
        </label>

        <!-- FUNCAO CONGREGACAO - DIGITAVEL MAS SO ACEITA LISTA -->
        <label style="font-size:10px;font-weight:700;color:#334155;grid-column:4/-1;display:flex;flex-direction:column;gap:5px">Função Congregação
          <input id="mt12" list="listCong" oninput="this.value=this.value.toUpperCase()" style="width:100%;padding:11px 13px;border:1px solid #e2e8f0;border-radius:8px;background:#fff;font-size:13px;font-weight:600">
          <datalist id="listCong">
            <option value="AGENTE DE MISSOES"><option value="ASSISTENTE SOCIAL"><option value="COORDENADOR DE DEPARTAMENTO"><option value="COORDENADOR DE PATRIMONIO"><option value="DIRIGENTE"><option value="LIDER DA TARDE DA VITORIA"><option value="LIDER DE ADOLESCENTES"><option value="LIDER DE BANDA"><option value="LIDER DE CRIANÇAS"><option value="LIDER DE DIACONOS"><option value="LIDER DE DISCIPULADO"><option value="LIDER DE JOVENS"><option value="LIDER DE MIDIA"><option value="LIDER DE MISSOES"><option value="LIDER DE SENHORAS"><option value="LIDER DE SENHORES"><option value="NENHUMA OPÇÃO"><option value="PORTEIRO"><option value="SECRETARIO"><option value="SONOPLASTA"><option value="SUPERINTENDENTE"><option value="TESOUREIRO">
          </datalist>
        </label>

      </div>
      <div style="display:flex;gap:10px;padding:14px 22px;background:#f8fafc;border-top:1px solid #e2e8f0">
        <button onclick="salvarTop()" style="padding:10px 20px;border-radius:8px;background:#0f172a;color:#fff;font-weight:800;cursor:pointer;font-size:11px;border:none">✏️ ALTERAR</button>
        <button onclick="document.getElementById('modalForm').remove()" style="padding:10px 16px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;font-weight:700;color:#475569;font-size:11px">X FECHAR</button>
      </div>
    </div>
  </div>`;
  
  document.body.insertAdjacentHTML('beforeend', html);

  // PREENCHE - TRAVADOS E EDITAVEIS
  document.getElementById('mt0').value = r[0]||'';
  document.getElementById('mt8').value = r[8]||'';
  document.getElementById('mt3').value = dataBr;
  document.getElementById('mt1').value = r[1]||'';
  document.getElementById('mt2').value = r[2]||'';
  document.getElementById('mt4').value = (r[4]!==undefined && r[4]!==null) ? String(r[4]) : '';
  document.getElementById('mt5').value = r[5]||'';
  document.getElementById('mt6').value = r[6]||'';
  document.getElementById('mt7').value = r[7]||'';
  document.getElementById('mt9').value = (r[9]||'').toUpperCase();
  document.getElementById('mt10').value = (r[10]||'').toUpperCase();
  document.getElementById('mt11').value = (r[11]||'').toUpperCase();
  document.getElementById('mt12').value = (r[12]||'').toUpperCase();
  setTimeout(()=>document.getElementById('mt12').focus(),100);

  // === VALIDAÇÃO DIGITÁVEL IGUAL DA FOTO - NÃO ACEITA FORA DA LISTA ===
  const LISTAS_VALID = {
    mt9: ["MASCULINO","FEMININO"],
    mt10: ["SIM","NÃO","NAO"],
    mt11: ["AUXILIAR","DIACONO","PRESBITERO","EVANGELISTA","PASTOR","MISSIONARIO"],
    mt12: ["AGENTE DE MISSOES","ASSISTENTE SOCIAL","COORDENADOR DE DEPARTAMENTO","COORDENADOR DE PATRIMONIO","DIRIGENTE","LIDER DA TARDE DA VITORIA","LIDER DE ADOLESCENTES","LIDER DE BANDA","LIDER DE CRIANÇAS","LIDER DE DIACONOS","LIDER DE DISCIPULADO","LIDER DE JOVENS","LIDER DE MIDIA","LIDER DE MISSOES","LIDER DE SENHORAS","LIDER DE SENHORES","NENHUMA OPÇÃO","PORTEIRO","SECRETARIO","SONOPLASTA","SUPERINTENDENTE","TESOUREIRO"]
  };

  function validaCampo(id){
    let el = document.getElementById(id);
    if(!el) return true;
    let v = el.value.trim().toUpperCase();
    if(v==="") { el.style.border="1px solid #e2e8f0"; el.style.background="#fff"; return true; }
    let vNorm = v==="NAO" ? "NÃO" : v;
    let lista = LISTAS_VALID[id];
    let ok = lista.includes(vNorm) || lista.includes(v);
    if(!ok){
      el.style.border="2px solid #ef4444";
      el.style.background="#fee2e2";
    }else{
      el.style.border="1px solid #16a34a";
      el.style.background="#f0fdf4";
      el.value = vNorm;
    }
    return ok;
  }

  // valida ao digitar e ao sair
  ["mt9","mt10","mt11","mt12"].forEach(id=>{
    let el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('input', ()=> validaCampo(id));
    el.addEventListener('blur', ()=> {
      let v = el.value.trim().toUpperCase();
      if(v && !validaCampo(id)){
        setTimeout(()=>{
          if(!validaCampo(id)){
            el.value = "";
            el.style.border="1px solid #e2e8f0";
            el.style.background="#fff";
          }
        }, 1000);
      }
    });
  });

  // === ARRASTAR PELO HEADER PRETO ===
  const box = document.getElementById('modalBox');
  const header = document.getElementById('modalHeader');
  let isDrag=false, startX, startY, origX=0, origY=0;
  header.addEventListener('mousedown', (e)=>{
    isDrag=true; header.style.cursor='grabbing';
    startX=e.clientX; startY=e.clientY;
    const tr = box.style.transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
    origX = tr?parseFloat(tr[1]):0; origY = tr?parseFloat(tr[2]):0;
    e.preventDefault();
  });
  window.addEventListener('mousemove', (e)=>{
    if(!isDrag) return;
    const dx = e.clientX-startX, dy = e.clientY-startY;
    box.style.transform = `translate(${origX+dx}px, ${origY+dy}px)`;
  });
  window.addEventListener('mouseup', ()=>{ isDrag=false; header.style.cursor='grab'; });
  // touch
  header.addEventListener('touchstart', (e)=>{
    const t=e.touches[0]; isDrag=true; startX=t.clientX; startY=t.clientY;
    const tr = box.style.transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
    origX = tr?parseFloat(tr[1]):0; origY = tr?parseFloat(tr[2]):0;
  },{passive:false});
  window.addEventListener('touchmove', (e)=>{
    if(!isDrag) return; const t=e.touches[0];
    const dx = t.clientX-startX, dy = t.clientY-startY;
    box.style.transform = `translate(${origX+dx}px, ${origY+dy}px)`;
    e.preventDefault();
  },{passive:false});
  window.addEventListener('touchend', ()=>isDrag=false);
}

function salvarTop(){
  const LISTAS = {
    mt9: ["MASCULINO","FEMININO"],
    mt10: ["SIM","NÃO","NAO"],
    mt11: ["AUXILIAR","DIACONO","PRESBITERO","EVANGELISTA","PASTOR","MISSIONARIO"],
    mt12: ["AGENTE DE MISSOES","ASSISTENTE SOCIAL","COORDENADOR DE DEPARTAMENTO","COORDENADOR DE PATRIMONIO","DIRIGENTE","LIDER DA TARDE DA VITORIA","LIDER DE ADOLESCENTES","LIDER DE BANDA","LIDER DE CRIANÇAS","LIDER DE DIACONOS","LIDER DE DISCIPULADO","LIDER DE JOVENS","LIDER DE MIDIA","LIDER DE MISSOES","LIDER DE SENHORAS","LIDER DE SENHORES","NENHUMA OPÇÃO","PORTEIRO","SECRETARIO","SONOPLASTA","SUPERINTENDENTE","TESOUREIRO"]
  };

  // VALIDA SE ESTÁ NA LISTA - BLOQUEIA SE NÃO ESTIVER
  for(let id in LISTAS){
    let el = document.getElementById(id);
    if(!el) continue;
    let v = el.value.trim().toUpperCase();
    if(v === "") continue;
    let vNorm = v === "NAO" ? "NÃO" : v;
    if(!LISTAS[id].includes(v) && !LISTAS[id].includes(vNorm)){
      alert(`❌ VALOR INVÁLIDO!\n\nCampo: ${id}\nValor digitado: "${v}"\n\nEsse valor NÃO existe na lista suspensa.\nEscolha apenas valores da lista.`);
      el.style.border = "2px solid #ef4444";
      el.style.background = "#fee2e2";
      el.focus();
      return;
    }
    el.value = LISTAS[id].includes(vNorm) ? vNorm : v;
  }

  // SÓ ENVIA O QUE PODE ALTERAR - TRAVADOS NÃO ENVIA
  const p = {
    item: document.getElementById('mt0').value,
    matricula: document.getElementById('mt8').value,
    congregacao: document.getElementById('mt5').value,
    nome: document.getElementById('mt6').value,
    whatsapp: document.getElementById('mt7').value,
    sexo: document.getElementById('mt9').value,
    batagua: document.getElementById('mt10').value,
    funcaoEcles: document.getElementById('mt11').value,
    funcaoCong: document.getElementById('mt12').value,
    usuario: USER.nome + ' | MAT ' + (USER.mat || document.getElementById('mt8').value)
  };
  const baseExec = BASE.split('?')[0];
  const qs = '?action=update&' + Object.entries(p).map(([k,v])=>k+'='+encodeURIComponent(v??'')).join('&');
  fetch(baseExec+qs).then(r=>r.text()).then(t=>{
    try{
      const res=JSON.parse(t);
      if(res.result==='ok'){ 
        document.getElementById('modalForm').remove(); 
        atualizarItemNaLista(p);
      }
      else alert('Erro: '+(res.msg||t));
    }catch(e){ alert('Erro: '+t); }
  });
}

function atualizarItemNaLista(p){
  let linha = document.querySelector(`tr[data-item="${p.item}"]`) 
           || [...document.querySelectorAll('tr')].find(tr => tr.cells[0]?.innerText.trim() == p.item);

  if(!linha) return;

  try{
    if(linha.cells.length >= 13){
      linha.cells[5].innerText = p.congregacao;
      linha.cells[6].innerText = p.nome;
      linha.cells[7].innerText = p.whatsapp;
      linha.cells[9].innerText = p.sexo;
      linha.cells[10].innerText = p.batagua;
      linha.cells[11].innerText = p.funcaoEcles;
      linha.cells[12].innerText = p.funcaoCong;
    }
  }catch(e){}

  linha.style.transition = 'all .4s';
  linha.style.background = '#fef9c3';
  linha.style.boxShadow = 'inset 0 0 0 2px #facc15';
  linha.scrollIntoView({behavior:'smooth', block:'center'});
  setTimeout(()=>{ linha.style.background=''; linha.style.boxShadow=''; }, 2500);
  
  if(typeof DADOS !== 'undefined' && Array.isArray(DADOS)){
    let idx = DADOS.findIndex(x => String(x[0]) === String(p.item));
    if(idx > -1){
      DADOS[idx][5] = p.congregacao;
      DADOS[idx][6] = p.nome;
      DADOS[idx][7] = p.whatsapp;
      DADOS[idx][9] = p.sexo;
      DADOS[idx][10] = p.batagua;
      DADOS[idx][11] = p.funcaoEcles;
      DADOS[idx][12] = p.funcaoCong;
    }
  }
}

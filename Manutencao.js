const API_MANUT = 'https://script.google.com/macros/s/AKfycbz94-3iCkeVDD7Za2XAYzYL7BtCM3rWWMxGc_9kL-xtpnRoog91IR4KmqgWzLXYHIsb/exec';

let MANUT_CACHE_NOVO = []; let selectedManutIdx = -1;
function limparFormManutNovo(){
  document.getElementById('mCodNovo').value=''; document.getElementById('mInicioNovo').value=''; document.getElementById('mFinalNovo').value=''; document.getElementById('mHoraNovo').value='';
  document.getElementById('msgManutNovo').innerHTML='🧹 Limpo'; selectedManutIdx=-1;
  document.querySelectorAll('#tbodyManutNovo tr').forEach(tr=>{ tr.style.background='transparent'; tr.style.borderLeft='3px solid transparent'; });
}
function excluirTudoManutNovo(){
  if(!confirm('Apagar TUDO da Manutencao? Isso vai excluir linha por linha na planilha Manutencao.')) return;
  document.getElementById('msgManutNovo').innerHTML='⏳ Excluindo...';
  MANUT_CACHE_NOVO.forEach(i=>{ new Image().src=`${API_MANUT}?action=excluirmanutencao&cod=${encodeURIComponent(i.cod||i.Cod)}&t=${Date.now()}`; });
  setTimeout(()=>{ document.getElementById('msgManutNovo').innerHTML='🗑️ Enviado'; carregarManutencaoNova(); },1200);
}
function lancarManutencaoNova(){
  let btn=document.getElementById('btnLancarManut'); let msg=document.getElementById('msgManutNovo');
  let cod=document.getElementById('mCodNovo').value.trim()||String(MANUT_CACHE_NOVO.length+1).padStart(3,'0');
  let tipo=document.getElementById('mTipoNovo').value; let ini=document.getElementById('mInicioNovo').value; let fim=document.getElementById('mFinalNovo').value;
  if(ini) ini=ini.split('-').reverse().join('/'); if(fim) fim=fim.split('-').reverse().join('/');
  let hora=document.getElementById('mHoraNovo').value; let status=document.getElementById('mStatusNovo').value;
  btn.innerHTML='⏳ SALVANDO...'; msg.innerHTML='Enviando pra planilha Manutencao...';
  let url=`${API_MANUT}?action=salvarmanutencao&cod=${encodeURIComponent(cod)}&tipo=${encodeURIComponent(tipo)}&ini=${encodeURIComponent(ini)}&fim=${encodeURIComponent(fim)}&hora=${encodeURIComponent(hora)}&status=${encodeURIComponent(status)}&t=${Date.now()}`;
  let img=new Image(); img.onload=img.onerror=()=>{ msg.innerHTML=`✅ Cod ${cod} salvo na Manutencao!`; btn.innerHTML='🚀 SALVAR NA PLANILHA'; limparFormManutNovo(); setTimeout(carregarManutencaoNova,800); }; img.src=url;
}
async function carregarManutencaoNova(){
  try{
    let r=await fetch(`${API_MANUT}?action=getmanutencao&t=${Date.now()}`); let d=await r.json();
    MANUT_CACHE_NOVO=Array.isArray(d)?d:[]; renderManutNova(MANUT_CACHE_NOVO);
  }catch(e){ document.getElementById('tbodyManutNovo').innerHTML=`<tr><td colspan=7 style="padding:20px; text-align:center; color:#ef4444">${e.message}</td></tr>`; }
}
function renderManutNova(lista){
  let tbody=document.getElementById('tbodyManutNovo'); document.getElementById('totalManutNovo').innerHTML=`${lista.length} REGISTROS`;
  if(!lista.length){ tbody.innerHTML=`<tr><td colspan=7 style="padding:30px; text-align:center; color:#52525b">Nenhum registro - lança nessa que você mostrou no print</td></tr>`; return; }
  tbody.innerHTML=''; lista.forEach((item,idx)=>{
    let tr=document.createElement('tr'); tr.tabIndex=0;
    tr.style.cssText='cursor:pointer; border-bottom:1px solid #1f1f28; border-left:3px solid transparent; outline:none';
    tr.innerHTML=`<td style="padding:10px; font-weight:800; color:#f59e0b">${item.cod||item.Cod}</td><td style="padding:10px">${item.tipo||item.TipoCiclo}</td><td style="padding:10px">${item.dataInicio||item.DataInicio}</td><td style="padding:10px">${item.dataFinal||item.DataFinal}</td><td style="padding:10px">${item.horario||item.Horario}</td><td style="padding:10px"><span style="background:${(item.status||'').includes('MANUTENCAO')?'#f59e0b22':'#22c55e22'}; color:${(item.status||'').includes('MANUTENCAO')?'#f59e0b':'#22c55e'}; padding:3px 8px; border-radius:20px; font-size:9px; font-weight:800">${item.status||item.Status}</span></td><td style="padding:10px"><button onclick="excluirUmManut('${item.cod||item.Cod}')" style="background:#1f1f28; border:1px solid #333; border-radius:6px; padding:4px 8px; color:#f87171; font-size:10px; cursor:pointer">Excluir</button></td>`;
    tr.addEventListener('mouseenter',()=>{ if(selectedManutIdx!==idx) tr.style.background='#1a1a24'; });
    tr.addEventListener('mouseleave',()=>{ if(selectedManutIdx!==idx) tr.style.background='transparent'; });
    tr.addEventListener('click',()=>selecionarLinhaNova(idx));
    tbody.appendChild(tr);
  });
}
function selecionarLinhaNova(idx){
  document.querySelectorAll('#tbodyManutNovo tr').forEach((tr,i)=>{ tr.style.background=i===idx?'#f59e0b18':'transparent'; tr.style.borderLeft=i===idx?'3px solid #f59e0b':'3px solid transparent'; });
  selectedManutIdx=idx; preencherFormNovo(idx);
}
function preencherFormNovo(idx){
  let item=MANUT_CACHE_NOVO[idx]; if(!item) return;
  document.getElementById('mCodNovo').value=item.cod||item.Cod||'';
  document.getElementById('mTipoNovo').value=item.tipo||item.TipoCiclo||'CICLO 01';
  try{
    let di=item.dataInicio||item.DataInicio||''; if(di.includes('/')){ let p=di.split('/'); document.getElementById('mInicioNovo').value=`${p[2]}-${p[1]}-${p[0]}`; }
    let df=item.dataFinal||item.DataFinal||''; if(df.includes('/')){ let p=df.split('/'); document.getElementById('mFinalNovo').value=`${p[2]}-${p[1]}-${p[0]}`; }
  }catch(e){}
  document.getElementById('mHoraNovo').value=item.horario||item.Horario||'';
  document.getElementById('mStatusNovo').value=item.status||item.Status||'EM MANUTENCAO';
  document.getElementById('msgManutNovo').innerHTML=`📝 Editando ${item.cod||item.Cod}`;
}
function excluirUmManut(cod){
  if(!confirm(`Excluir Cod ${cod} da Manutencao?`)) return;
  new Image().src=`${API_MANUT}?action=excluirmanutencao&cod=${encodeURIComponent(cod)}&t=${Date.now()}`;
  setTimeout(carregarManutencaoNova,800);
}
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbw_3Qob30GIuK6kVH0dy-AyzhjoPxGt8wvoNkKJ53YPk8jmss4FUEoU6MHw1-GmiUCl/exec';

function mostrarAlerta(msg){
  const m = document.getElementById('modalTexto');
  const box = document.getElementById('modalAlerta');
  if(m && box){ m.innerText = msg; box.style.display = 'grid'; }
}
function fecharAlerta(){ document.getElementById('modalAlerta').style.display = 'none'; }

function setDataAutomatica(){
  const el = document.getElementById('data');
  if(!el) return;
  const hoje = new Date();
  el.valueAsDate = hoje; // preenche automático
  
  // se quiser salvar como dd/mm/aaaa na planilha também:
  el.dataset.br = hoje.toLocaleDateString('pt-BR'); // 04/11/2026
}
document.addEventListener('DOMContentLoaded', setDataAutomatica);
setDataAutomatica(); // chama na hora também

// MATA QUALQUER alert/prompt PERDIDO QUE DÁ "Essa página diz"
window.alert = mostrarAlerta;
window.prompt = () => { mostrarAlerta('Função bloqueada. Use o modal.'); return null; };

async function buscarDadosAluno(){
  const mat = document.getElementById('matricula').value.trim().padStart(5,'0');
  if(!mat){ mostrarAlerta('Digite a matrícula para buscar'); return; }
  const btn = document.getElementById('btnFinalizar');
  btn.innerText = 'Buscando...';
  try{
    const resp = await fetch(SHEET_URL + '?matricula=' + encodeURIComponent(mat));
    const json = await resp.json();
    if(json.erro){ mostrarAlerta('Matrícula não encontrada na planilha Dados'); btn.innerText = 'Salvar'; return; }
    document.getElementById('congregacao').value = json.Congregacao || '';
    document.getElementById('ciclo').value = json.Ciclo || '2026.1';
    document.getElementById('nome').value = json.Nome || '';
    document.getElementById('whatsapp').value = json.WhatsApp || '';
    document.getElementById('sexo').value = json.Sexo || '';
    document.getElementById('batagua').value = json.BatAgua || '';
    document.getElementById('funcaoEcles').value = json.FuncaoEclesiastica || '';
    document.getElementById('funcaoCong').value = json.FuncaoCongregacao || '';
    document.getElementById('data').value = json.Data || new Date().toISOString().split('T')[0];
    if(json.Respostas && json.Respostas.length){
      json.Respostas.forEach((letra, idx)=>{
        if(!letra) return;
        const val = letra.charCodeAt(0) - 65;
        const input = document.querySelector(`input[name="q${idx}"][value="${val}"]`);
        if(input){ input.checked = true; }
      });
      form.dispatchEvent(new Event('change'));
      showView('teste');
      mostrarAlerta(`Dados carregados! Pontuação anterior: ${json.Pontuacao} pts.`);
    }
  }catch(err){ mostrarAlerta('Erro ao buscar: ' + err); }
  btn.innerText = 'Salvar'; btn.disabled = false;
}

document.getElementById('data').valueAsDate = new Date();

function showView(view){
  const btnSalvar = document.getElementById('btnFinalizar');
  const btnPdf = document.getElementById('btnPdf');
  const btnBuscar = document.getElementById('btnBuscar');
  const btnLimpar = document.getElementById('btnLimpar');
  document.getElementById('viewTexto').style.display = view==='texto' ? 'block' : 'none';
  document.getElementById('viewTeste').style.display = view==='teste' ? 'block' : 'none';
  document.getElementById('blocoDados').style.display = view==='teste' ? 'block' : 'none';
  document.getElementById('btnTexto').className = view==='texto' ? 'btn-top active' : 'btn-top inactive';
  document.getElementById('btnTeste').className = view==='teste' ? 'btn-top active' : 'btn-top inactive';
  btnSalvar.style.display = 'grid'; btnPdf.style.display = 'grid';

  function travar(btn, travar){
    if(!btn) return;
    btn.disabled = travar;
    btn.style.opacity = travar ? '0.4' : '1';
    btn.style.pointerEvents = travar ? 'none' : 'auto';
  }

  if(view==='texto'){
    travar(btnSalvar, true);
    travar(btnBuscar, true);
    travar(btnLimpar, true);
    travar(btnPdf, false);
  } else {
    travar(btnSalvar, false);
    travar(btnBuscar, false);
    travar(btnLimpar, false);
    travar(btnPdf, true);
  }
  window.scrollTo({top:0,behavior:'smooth'});
}


function toggleDados(){document.getElementById('blocoDados').classList.toggle('collapsed');}
const gabarito = [1,0,2,1,3,1,0,2,3,1,2,0,3,1,2,3,1,0,2,3,1,2,3,0,1];
const perguntas = [
["Qual é o texto bíblico principal deste sermão?",["João 3:16-18","Romanos 12:1-2","Salmos 23:1-6","Atos 2:1-4"]],
["Segundo Romanos 12:1, como devemos apresentar nossa vida a Deus?",["Como sacrifício vivo, santo e agradável","Como uma oferta para comprar bênçãos","Como uma obrigação sem amor","Como uma demonstração de superioridade"]],
["O que significa, neste sermão, a lei do acordo?",["Concordar com todas as opiniões alheias","Ignorar os próprios sentimentos","Alimentar pensamentos e atitudes contrários à Palavra","Evitar toda conversa difícil"]],
["Segundo 2 Coríntios 10:5, o que devemos fazer com os pensamentos?",["Aceitar todos sem exame","Levá-los cativos à obediência de Cristo","Escondê-los de todas as pessoas","Considerá-los sempre verdadeiros"]],
["Qual é a advertência de Efésios 4:26-27?",["Nunca demonstrar qualquer emoção","Responder à ira com vingança","Guardar ressentimento até obter reparação","Não pecar na ira nem dar lugar ao Diabo"]],
["Qual atitude pode contribuir para enfraquecer um relacionamento?",["Dialogar com sinceridade","Alimentar ressentimentos e orgulho","Reconhecer os próprios erros","Buscar reconciliação responsável"]],
["O que Jesus denuncia em Marcos 7:6?",["A diferença entre honrar com os lábios e ter o coração distante","A importância de trabalhar honestamente","A necessidade de ensinar crianças","A prática da hospitalidade"]],
["Qual pergunta ajuda a examinar o acordo interior?",["Como posso provar que sempre tenho razão?","Quem devo culpar pelos meus problemas?","O que tenho alimentado em meus pensamentos?","Como posso evitar qualquer correção?"]],
["O que significa a lei da substituição na estrutura deste sermão?",["Trocar de congregação sempre que houver dificuldades","Abandonar todas as responsabilidades","Esperar que os problemas desapareçam sozinhos","Permitir que outras prioridades ocupem o lugar de Deus"]],
["Segundo Mateus 6:33, o que devemos buscar primeiro?",["A aprovação das pessoas","O Reino de Deus e a sua justiça","A riqueza acima de tudo","Uma vida sem responsabilidades"]],
["Como devemos interpretar contratempos financeiros repetidos?",["Como prova de que alguém tomou nossas bênçãos","Como evidência certa de uma maldição","Com oração, prudência e análise das circunstâncias","Como motivo para abandonar o trabalho"]],
["O que significa consagrar a vida a Deus?",["Dedicar a Ele a vida, as decisões e as prioridades","Realizar rituais para controlar o futuro","Evitar toda responsabilidade familiar","Esperar resultados sem agir"]],
["Qual é o sentido da lei do território neste sermão?",["Afirmar que todo lugar difícil está amaldiçoado","Evitar entrar em casas de outras pessoas","Considerar apenas a aparência dos ambientes","Dedicar os ambientes cotidianos ao Senhor e praticar princípios bíblicos"]],
["O que Josué 24:15 expressa?",["Uma promessa de ausência de conflitos","Uma decisão de servir ao Senhor","Uma garantia de riqueza imediata","Uma ordem para nunca mudar de residência"]],
["Qual prática contribui para um ambiente familiar saudável?",["Usar o silêncio para punir","Evitar reconhecer os próprios erros","Dialogar, respeitar e buscar reconciliação","Impor obediência por meio de humilhação"]],
["Como uma liderança cristã deve promover a unidade?",["Impedindo qualquer prestação de contas","Permitindo competição entre departamentos","Evitando corrigir erros graves","Promovendo verdade, serviço, transparência e responsabilidade"]],
["O que significa a lei do sacrifício neste sermão?",["Sofrer para obrigar Deus a abençoar","Priorizar Deus e viver em consagração","Abandonar o descanso e os cuidados pessoais","Comprar o favor divino com boas obras"]],
["Segundo Lucas 9:23, seguir Jesus envolve:",["Negar a si mesmo, tomar a cruz e segui-lo","Nunca enfrentar dificuldades","Buscar reconhecimento público","Fazer apenas o que proporciona prazer"]],
["Qual prática favorece a constância espiritual?",["Orar somente nas crises","Depender exclusivamente de emoções","Manter oração, leitura bíblica, comunhão e obediência","Comparar a própria vida com a dos outros"]],
["Qual é a relação entre oração e responsabilidade?",["Orar dispensa qualquer planejamento","A fé elimina a necessidade de aprender","A oração garante sucesso imediato","Orar e agir com sabedoria são atitudes compatíveis"]],
["O que Romanos 12:2 ensina sobre a transformação?",["Que devemos copiar todos os padrões do mundo","Que a renovação da mente nos ajuda a discernir a vontade de Deus","Que a mudança depende apenas das circunstâncias","Que não precisamos examinar nossas atitudes"]],
["É correto afirmar que toda dificuldade é resultado de pecado pessoal?",["Sim, sem exceção","Sim, quando a pessoa ora pouco","Não; existem diversas causas para o sofrimento","Sim, quando o problema demora a passar"]],
["Como devemos entender o perdão cristão?",["Como abandonar toda busca por justiça","Como tolerar violência em silêncio","Como fingir que nada aconteceu","Como buscar libertação do ressentimento sem negar a verdade ou a segurança"]],
["Qual é uma responsabilidade importante dos obreiros?",["Dar exemplo de humildade, fidelidade e serviço","Buscar reconhecimento acima do serviço","Evitar transparência nas decisões","Exigir dos outros aquilo que não praticam"]],
["Qual é a mensagem central do sermão?",["Existem fórmulas que obrigam Deus a agir","A renovação da mente, a reorganização das prioridades, a consagração e a perseverança fortalecem a vida cristã","Quem tem fé nunca enfrenta sofrimento","Toda dificuldade decorre de forças ocultas"]]
];
const form=document.getElementById('form');
perguntas.forEach((p,i)=>{
  const card=document.createElement('div');card.className='card';card.id=`card${i}`;
  card.innerHTML=`<div class="q-num">QUESTÃO ${i+1} • 4 PONTOS</div><div class="q-text">${p[0]}</div>`+p[1].map((opt,j)=>`<label class="opt" id="opt${i}_${j}"><input type="radio" name="q${i}" value="${j}"><span>${String.fromCharCode(65+j)}) ${opt}</span></label>`).join('');
  form.appendChild(card);
});
form.addEventListener('change',()=>{
  const total=perguntas.length;
  const resp=[...Array(total)].filter((_,i)=>document.querySelector(`input[name="q${i}"]:checked`)).length;
  document.getElementById('bar').style.width=(resp/total*100)+'%';
  document.getElementById('chipProg').innerText=`${resp} / ${total} respondidas`;
  document.querySelectorAll('.opt').forEach(el=>{el.classList.toggle('selected',el.querySelector('input').checked);});
});
document.getElementById('btnFinalizar').onclick = async (e)=>{
  e.preventDefault();
  const btnSalvar = document.getElementById('btnFinalizar');
  if(btnSalvar.disabled) return;
  if(!document.getElementById('nome').value){mostrarAlerta('Digite o Nome completo!');return;}

  let faltando = [];
  perguntas.forEach((_,i)=>{
    if(!document.querySelector(`input[name="q${i}"]:checked`)){
      faltando.push(i+1);
    }
  });
  if(faltando.length > 0){
    mostrarAlerta(`Falta responder a questão ${faltando.join(', ')}.\nResponda todas as 25 questões para salvar.`);
    const primeira = faltando[0]-1;
    document.getElementById(`card${primeira}`).scrollIntoView({behavior:'smooth', block:'center'});
    document.getElementById(`card${primeira}`).style.outline = '2px solid #ef4444';
    setTimeout(()=>{ document.getElementById(`card${primeira}`).style.outline = ''; }, 2000);
    return;
  }

  btnSalvar.innerText = 'Salvando...';
  let acertos=0;
  let respostasLetras = [];
  perguntas.forEach((_,i)=>{
    const sel=document.querySelector(`input[name="q${i}"]:checked`);
    const card=document.getElementById(`card${i}`);
    card.classList.remove('correct','wrong');
    document.getElementById(`opt${i}_${gabarito[i]}`)?.classList.remove('correct-opt','wrong-opt');
    if(sel) document.getElementById(`opt${i}_${sel.value}`)?.classList.remove('correct-opt','wrong-opt');
    const val=parseInt(sel.value);
    respostasLetras.push(String.fromCharCode(65+val));
    if(val===gabarito[i]){acertos++;card.classList.add('correct');}else{card.classList.add('wrong');}
    document.getElementById(`opt${i}_${gabarito[i]}`).classList.add('correct-opt');
    if(val!==gabarito[i]) document.getElementById(`opt${i}_${val}`).classList.add('wrong-opt');
  });
  const pontos=acertos*4;
  document.getElementById('pts').innerText=`${pontos} / 100`;
  document.getElementById('chipScore').innerText=`${pontos} / 100`;
  document.getElementById('result').style.display='block';
  document.getElementById('breakdown').innerHTML=`<b>${acertos} acertos</b> de 25`;
  try{
    const matCheck = document.getElementById('matricula').value.trim().padStart(5,'0');
    const cicloCheck = document.getElementById('ciclo').value.trim();
    const checkResp = await fetch(SHEET_URL + '?matricula=' + encodeURIComponent(matCheck));
    const checkJson = await checkResp.json();
    if(!checkJson.erro && checkJson.Teste == '4 LEIS ESPIRITUAIS' && String(checkJson.Ciclo).trim() == String(cicloCheck).trim()){
      mostrarAlerta(`TESTE JÁ FEITO com ${checkJson.Pontuacao} pts no ciclo ${cicloCheck}.\nNão é possível fazer novamente.`);
      btnSalvar.innerText = 'Salvar';
      return;
    }
  }catch(e){}
  const payload = {
    Ciclo: document.getElementById('ciclo').value || '2026.1',
    Teste: '4 LEIS ESPIRITUAIS',
    Data: document.getElementById('data').value,
    Pontuacao: pontos,
    Congregacao: document.getElementById('congregacao').value.toUpperCase(),
    Nome: document.getElementById('nome').value,
    WhatsApp: document.getElementById('whatsapp').value,
    Matricula: document.getElementById('matricula').value.trim().padStart(5,'0'),
    Sexo: document.getElementById('sexo').value,
    BatAgua: document.getElementById('batagua').value,
    FuncaoEclesiastica: document.getElementById('funcaoEcles').value,
    FuncaoCongregacao: document.getElementById('funcaoCong').value,
    Alteracao: '',
    Recuperacao: '',
    Respostas: respostasLetras
  };
  try{
    await fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
    document.getElementById('msg').innerText = 'Salvo na planilha Dados!';
  }catch(err){ document.getElementById('msg').innerText = 'Erro ao salvar: ' + err; }
  window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});
  btnSalvar.innerText = 'Salvar'; btnSalvar.disabled = true;
};
document.getElementById('matricula').addEventListener('input',function(){document.getElementById('headMatTxt').textContent = this.value ? '• ' + this.value : '';});
document.getElementById('nome').addEventListener('input',function(){document.getElementById('headNomeTxt').textContent = this.value ? '• ' + this.value : '';});
document.getElementById('congregacao').addEventListener('input',function(){document.getElementById('headCongTxt').textContent = this.value ? '• ' + this.value.toUpperCase() : '';});
showView('texto');

// quando carregar a página
const API = 'https://script.google.com/macros/s/AKfycbxLXw-nu5oXXtjE8HKik_W_bbT9CGjTNJWw-dUm4wWYv-hjcz1dOhMHLxoUTRHGJA3D0A/exec';

async function puxarETravar(){
  let mat = '';
  try{ mat = localStorage.getItem('mat_logada') || window.parent.localStorage.getItem('mat_logada') || ''; }catch(e){}
  if(!mat) return;
  mat = mat.trim().padStart(5,'0').toUpperCase();

  try{
    let r = await fetch(API+'?action=todos&t='+Date.now(), {cache:'no-store'});
    let j = await r.json();
    let dados = j.data || [];
    let u = dados.find(x=> String(x.Matricula||'').padStart(5,'0').toUpperCase() === mat);
    if(!u) return;

    // AGORA COM SUAS COLUNAS
    document.getElementById('matricula').value = String(u.Matricula||mat).toUpperCase();
    document.getElementById('nome').value = String(u.Nome||'').toUpperCase();
    document.getElementById('congregacao').value = String(u.congregacao||'').toUpperCase();
    document.getElementById('sexo').value = String(u.Sexo||'').toUpperCase();
    document.getElementById('batagua').value = String(u.BatizadoAgua||'').toUpperCase();
    document.getElementById('funcaoEcles').value = String(u['Qual Funcao']||'').toUpperCase();
    document.getElementById('funcaoCong').value = String(u.fcongregacao||'').toUpperCase();
    document.getElementById('whatsapp').value = String(u.WhatsApp||'');

    // TRAVA OS 9
    ['ciclo','matricula','nome','congregacao','sexo','batagua','funcaoEcles','funcaoCong','whatsapp'].forEach(id=>{
      let el = document.getElementById(id);
      if(el){ el.readOnly=true; el.disabled=true; el.style.background='#0F172A'; el.style.opacity='0.6'; el.style.pointerEvents='none'; }
    });

    // cabeçalho
    try{
      document.getElementById('headMatTxt').textContent = '• ' + mat;
      document.getElementById('headNomeTxt').textContent = '• ' + (u.Nome||'');
      document.getElementById('headCongTxt').textContent = '• ' + (u.congregacao||'');
    }catch(e){}

  }catch(e){ console.log(e); }
}

setTimeout(puxarETravar, 500);
document.addEventListener('DOMContentLoaded', puxarETravar);

// ===== SEPARADO - SÓ SITUAÇÃO - NÃO MEXER NO DE CIMA =====
// Lê Cadastro_Total: procura matrícula, pega resultado na coluna AN, joga no campo situação
async function puxarSituacao(){
  let elSit = document.getElementById('situacao');

  // 1. LER A MATRÍCULA QUE ESTÁ NA TELA - 00425 na foto
  let mat = '';
  try{
    mat = document.getElementById('matricula').value || localStorage.getItem('mat_logada') || window.parent.localStorage.getItem('mat_logada') || '';
  }catch(e){}
  if(!mat){
    if(elSit) elSit.value = 'PENDENTE';
    return;
  }
  mat = mat.trim().padStart(5,'0').toUpperCase();

  try{
    // 2. BUSCAR NA GUIA Dados
    let url = "https://script.google.com/macros/s/AKfycbxLXw-nu5oXXtjE8HKik_W_bbT9CGjTNJWw-dUm4wWYv-hjcz1dOhMHLxoUTRHGJA3D0A/exec";
    let r2 = await fetch(url + '?action=todos&t=' + Date.now(), {cache:'no-store'});
    let j2 = await r2.json();
    let dados2 = j2.data || [];

    // 3. ACHAR PELA COLUNA B = Matrícula
    let u2 = dados2.find(x=>{
      if(Array.isArray(x)){
        return String(x[1] || '').trim().padStart(5,'0').toUpperCase() === mat; // x[1] = coluna B
      } else {
        return String(x.Matricula || x.matricula || '').trim().padStart(5,'0').toUpperCase() === mat;
      }
    });
    if(!u2){
      if(elSit) elSit.value = 'PENDENTE';
      return;
    }

    // 4. PEGAR COLUNA AN = Situação Final
    let status = '';
    if(Array.isArray(u2)){
      status = String(u2[39] || '').trim(); // 39 = coluna AN
    } else {
      status = String(u2['Situação Final'] || u2['Situacao Final'] || u2['Situaçao Final'] || u2.AN || '').trim();
    }

    // 5. SE NÃO FOR DISCIPULADO REALIZADO, COLOCA PENDENTE
    if(status.toUpperCase() !== 'DISCIPULADO REALIZADO'){
      status = 'PENDENTE';
    }

    // 6. LANÇAR NO CAMPO SITUAÇÃO
    if(elSit){ elSit.value = status; }

  }catch(e){
    console.log('Erro Situacao AN:', e);
    if(elSit) elSit.value = 'PENDENTE';
  }
}

setTimeout(puxarSituacao, 600);
document.addEventListener('DOMContentLoaded', puxarSituacao);

// COLAR NO FINAL DO JS
setInterval(()=>{
  let sit = document.getElementById('situacao');
  if(!sit) return;
  let linha = document.getElementById('linhaDiscreta');
  let msg = document.getElementById('msgPendente');
  if(!msg && linha){
    msg = document.createElement('span');
    msg.id = 'msgPendente';
    msg.style.color = '#FFD700'; // '#f87171' VERMELHO
    msg.style.fontWeight = '800';
    msg.style.fontSize = '11px';
    linha.appendChild(msg);
  }
  let salvar = document.getElementById('btnFinalizar');
  let pesq = document.getElementById('btnBuscar');
  if(sit.value.toUpperCase() === 'PENDENTE'){
    if(salvar) salvar.disabled = true;
    if(pesq) pesq.disabled = true;
    if(msg) msg.textContent = '• NÃO HÁ COMO PROSSEGUIR - FALTA FINALIZAR O DISCIPULADO';

} else {
    // só libera Pesquisar se estiver no Teste, se estiver no Texto continua travado
    let noTeste = document.getElementById('viewTeste') && document.getElementById('viewTeste').style.display !== 'none';
    if(pesq){ pesq.disabled = !noTeste; pesq.style.opacity = noTeste ? '1' : '0.4'; pesq.style.pointerEvents = noTeste ? 'auto' : 'none'; }
    if(msg) msg.textContent = '';
  }
}, 500);

// COLAR NO FINAL DO JS DO TESTE - MARCA COMO FEITO AO SALVAR
(function(){
  let m = (window.location.pathname || '').match(/teste_(\d+)\.html/i);
  let num = m ? parseInt(m[1]) : 0;
  if(!num) return;
  setInterval(()=>{
    let msg = document.getElementById('msg');
    if(msg && msg.innerText.includes('Salvo na planilha')){
      try{
        localStorage.setItem('teste_'+num+'_feito','1');
        if(window.parent) window.parent.localStorage.setItem('teste_'+num+'_feito','1');
      }catch(e){}
    }
  }, 500);
})();

// COLAR NO FINAL - MATRICULA SEMPRE 5 DIGITOS - COLUNA I
(function(){
  function fmt(v){ v = String(v||'').replace(/\D/g,''); if(!v) return v; return v.padStart(5,'0'); }
  setInterval(()=>{
    let el = document.getElementById('matricula');
    if(el && el.value && /^\d{1,5}$/.test(el.value.trim())){
      let f = fmt(el.value.trim());
      if(el.value !== f) el.value = f;
    }
  }, 500);
})();

function pedirConfirmarLimpar(msg){
  return new Promise((resolve)=>{
    let box = document.getElementById('modalConfirmLimpar');
    if(!box){
      box = document.createElement('div');
      box.id = 'modalConfirmLimpar';
      box.style.cssText = 'display:grid;position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99999;place-items:center;';
      box.innerHTML = `<div style="background:#111B2F;border:1px solid #1E293B;border-radius:16px;padding:20px;max-width:320px;width:90%;text-align:center;">
        <div id="modalConfirmLimparTexto" style="color:#F1F5F9;font-size:14px;line-height:1.5;margin-bottom:16px;white-space:pre-line;"></div>
        <div style="display:flex;gap:8px;"><button id="btnConfirmLimparNao" style="flex:1;background:#334155;color:#fff;border:none;border-radius:8px;padding:10px;font-weight:800;cursor:pointer;">Não</button><button id="btnConfirmLimparSim" style="flex:1;background:#7c3aed;color:#fff;border:none;border-radius:8px;padding:10px;font-weight:800;cursor:pointer;">Sim</button></div>
      </div>`;
      document.body.appendChild(box);
    }
    document.getElementById('modalConfirmLimparTexto').innerText = msg;
    box.style.display = 'grid';
    const fechar = (v)=>{ box.style.display='none'; resolve(v); };
    document.getElementById('btnConfirmLimparNao').onclick = ()=> fechar(false);
    document.getElementById('btnConfirmLimparSim').onclick = ()=> fechar(true);
  });
}

async function limparTeste(){
  const quer = await pedirConfirmarLimpar('Quer limpar mesmo?\nTodas as 25 respostas serão apagadas.');
  if(!quer) return;
  // se estiver no Texto, não faz nada
  if(document.getElementById('viewTexto') && document.getElementById('viewTexto').style.display !== 'none') return;
  document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
  document.querySelectorAll('.card').forEach(c => c.classList.remove('correct','wrong'));
  document.querySelectorAll('.opt').forEach(o => o.classList.remove('selected','correct-opt','wrong-opt'));
  document.getElementById('bar').style.width = '0%';
  document.getElementById('chipProg').innerText = '0 / 25 respondidas';
  document.getElementById('chipScore').innerText = '0 / 100';
  document.getElementById('result').style.display = 'none';
  document.getElementById('msg').innerText = '';
  document.getElementById('breakdown').innerHTML = '';
  let btnSalvar = document.getElementById('btnFinalizar');
  if(btnSalvar){ btnSalvar.innerText = 'Salvar'; btnSalvar.disabled = false; }
  window.scrollTo({top:0, behavior:'smooth'});
}


// BAIXA DIRETO O PDF - SEM JANELA DE IMPRIMIR
document.getElementById('btnPdf').onclick = function(e){
  e.preventDefault();
  const el = document.getElementById('viewTexto');
  if(!el || !el.innerText.trim()) return mostrarAlerta('Não há texto para gerar o PDF.');
  const blob = criarPdf(el);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Texto-4-Leis-Espirituais.pdf';
  a.click();
};

function criarPdf(el){
  const ctx = document.createElement('canvas').getContext('2d');
  const esc = s => s.replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/—/g,'-').replace(/–/g,'-').replace(/…/g,'...').replace(/\u00A0/g,' ')
    .split('').map(c=>{ const k=c.charCodeAt(0); return c==='\\'?'\\\\':c==='('?'\\(':c===')'?'\\\\)':(k<32||k>126)?'\\'+k.toString(8).padStart(3,'0'):c; }).join('');
  // CORREÇÃO 1: mede negrito como negrito, senão estoura a direita
  const medir = (t,s,bold=false)=>{ ctx.font = (bold?'bold ':'')+s+'px Helvetica'; return ctx.measureText(t).width; };

  // CORREÇÃO 2: pega o <p> inteiro, não o <strong> sozinho
  // Por isso "Verdade central:" ficava vazio e "Romanos 12:1-2" sumia
  let blocos = [...el.querySelectorAll('p, h1, h2, h3, h4, blockquote, li')];
  // Se tem <p> dentro de <blockquote>, fica só com o <blockquote> pra não duplicar
  blocos = blocos.filter(b => !blocos.some(o => o !== b && o.contains(b) && o.tagName === 'BLOCKQUOTE'));
  if(!blocos.length) blocos = [...el.querySelectorAll('div')].filter(d => d.innerText?.trim() && !d.querySelector('p, blockquote'));
  if(!blocos.length) blocos = [el];

  // 2. QUEBRA POR LARGURA REAL
  let paragrafos = [];
  blocos.forEach(n=>{
    const txt = n.innerText.trim().replace(/\s+/g,' ');
    if(!txt) return;
    const st = getComputedStyle(n);
    let tipo = 'normal';
    if(txt.startsWith('4 LEIS')) tipo='titulo';
    else if(n.tagName==='BLOCKQUOTE' || txt.startsWith('Verdade central:') || txt.startsWith('Precisamos, porém')) tipo='citacao';
    else if(/^(\d+\.|[A-D]\.)\s/.test(txt)) tipo='secao'; // sem limite de 140, pega "1. Introdução..." inteiro
    else if(txt.startsWith('Texto base:') || txt.startsWith('Objetivo:')) tipo='sub';
    else if(st.fontStyle==='italic') tipo='italico';

    const size = tipo==='titulo'?18:tipo==='secao'?13:11.5;
    const largMax = tipo==='citacao'?465:515; // 515 = 595 - 40 - 40, usa a página toda
    const isBold = tipo==='titulo' || tipo==='secao' || tipo==='sub';
    const palavras = txt.split(' ');
    let linhas = [], atual = '';
    palavras.forEach(p=>{
      const teste = atual ? atual+' '+p : p;
      if(medir(teste, size, isBold) > largMax && atual){ linhas.push(atual); atual = p; }
      else atual = teste;
    });
    if(atual) linhas.push(atual);
    paragrafos.push({tipo, linhas, size, isBold});
  });

  // 3. PAGINAÇÃO - RODAPÉ MÍNIMO
  const TOPO = 785, LIMITE = 55; // texto vai até 55, rodapé só em 28
  let pags = [], pagAtual = [], y = TOPO;
  paragrafos.forEach(p=>{
    const altura = p.linhas.length * 17 + 14;
    if(y - altura < LIMITE && pagAtual.length){ pags.push(pagAtual); pagAtual = []; y = TOPO; }
    if(p.tipo==='secao') y -= 14;
    else if(p.tipo==='citacao') y -= 6;
    else y -= 5;
    p.linhas.forEach((linha, idx)=>{
      if(y < LIMITE){ pags.push(pagAtual); pagAtual = []; y = TOPO; }
      pagAtual.push({t:linha, tipo:p.tipo, size:p.size, isBold:p.isBold, y, primeira:idx===0, ultima:idx===p.linhas.length-1});
      y -= 17;
    });
    y -= p.tipo==='citacao'?12:8;
  });
  if(pagAtual.length) pags.push(pagAtual);

  // 4. DESENHA
  let objs = []; objs[1]='<< /Type /Catalog /Pages 2 0 R >>';
  objs[3]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
  objs[4]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
  objs[5]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>';
  let kids=[], num=6;

  pags.forEach((pg,pi)=>{
    const idC=num++, idP=num++; kids.push(idP+' 0 R');
    let s='1 1 1 rg 0 0 595 842 re f\n';

    let cit = null;
    pg.forEach(it=>{
      if(it.tipo==='citacao'){
        if(it.primeira) cit = {topo: it.y+9, fim: it.y-9};
        cit.fim = it.y-9;
        if(it.ultima){
          s+=`0.97 0.96 1.00 rg 40 ${cit.fim} 515 ${(cit.topo-cit.fim).toFixed(0)} re f\n`;
          s+=`1 J 2 w 0.42 0.30 0.85 RG 43 ${cit.fim} m 43 ${cit.topo} l S\n`;
          cit = null;
        }
      }
    });

    pg.forEach(it=>{
      const c = it.tipo==='citacao';
      const x = c?58:40, larg = c?465:515;
      let f='F1', cor='0.15 0.15 0.15 rg';
      if(it.tipo==='titulo'){ f='F2'; cor='0.08 0.10 0.28 rg'; }
      else if(it.tipo==='secao'){ f='F2'; cor='0.15 0.17 0.36 rg'; }
      else if(it.tipo==='sub'){ f='F2'; }
      else if(c || it.tipo==='italico'){ f='F3'; cor='0.22 0.22 0.22 rg'; }

      let tw=0;
      if((it.tipo==='normal'||c||it.tipo==='italico') && !it.ultima){
        const esp=(it.t.match(/ /g)||[]).length||1;
        tw=Math.max(0, Math.min(5, (larg - medir(it.t, it.size, it.isBold))/esp));
      }
      s+=`${tw.toFixed(2)} Tw\nBT /${f} ${it.size} Tf ${cor} ${x} ${it.y} Td (${esc(it.t)}) Tj ET\n0 Tw\n`;
    });

    // CORREÇÃO 3: RODAPÉ MÍNIMO - sem linha grossa, sem "4 Leis", só o número
    s+=`BT /F1 7.5 Tf 0.65 0.65 0.65 rg 275 28 Td (${pi+1} / ${pags.length}) Tj ET\n`;

    objs[idC]=`<< /Length ${s.length} >>\nstream\n${s}\nendstream`;
    objs[idP]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${idC} 0 R >>`;
  });

  objs[2]=`<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pags.length} >>`;
  let pdf='%PDF-1.4\n', off=[];
  for(let i=1;i<num;i++){ off[i]=pdf.length; pdf+=i+' 0 obj\n'+objs[i]+'\nendobj\n'; }
  const xref=pdf.length;
  pdf+='xref\n0 '+num+'\n0000000000 65535 f \n';
  for(let i=1;i<num;i++) pdf+=String(off[i]).padStart(10,'0')+' 00000 n \n';
  pdf+=`trailer\n<< /Size ${num} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([new Uint8Array([...pdf].map(c=>c.charCodeAt(0)&255))],{type:'application/pdf'});
}
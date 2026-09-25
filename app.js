
const data = window.COURSE_DATA.modules;
const cfg = window.COURSE_CONFIG;
const nav = document.querySelector('#nav');
const lesson = document.querySelector('#lesson');
const sidebar = document.querySelector('#sidebar');
const key = 'rag-acmecloud-progress-v1';
let progress = JSON.parse(localStorage.getItem(key) || '{}');
let current = location.hash.replace('#','') || '00';

function save(){ localStorage.setItem(key, JSON.stringify(progress)); updateProgress(); }
function completedReady(){
  const ready=data.filter(m=>m.status==='ready');
  return ready.filter(m=>progress[m.id]).length;
}
function updateProgress(){
  const ready=data.filter(m=>m.status==='ready').length;
  const pct = ready ? Math.round(completedReady()/ready*100) : 0;
  document.querySelector('#progressLabel').textContent=pct+'%';
  document.querySelector('#progressBar').style.width=pct+'%';
}
function drawNav(){
  nav.innerHTML='';
  data.forEach(m=>{
    const b=document.createElement('button');
    b.className=m.id===current?'active':'';
    const mark=progress[m.id]?'✓ ': '';
    b.innerHTML=`<span class="num">${m.id}</span><span>${mark}${m.name}${m.status==='planned'?'<small>Próximamente</small>':''}</span>`;
    b.onclick=()=>{location.hash=m.id; sidebar.classList.remove('open');};
    nav.appendChild(b);
  });
}
function colabUrl(nb){
  let owner=cfg.githubOwner, repo=cfg.githubRepo;
  if(owner==='TU_USUARIO' && location.hostname.endsWith('.github.io')){
    owner=location.hostname.split('.')[0];
    repo=location.pathname.split('/').filter(Boolean)[0] || repo;
  }
  return `https://colab.research.google.com/github/${owner}/${repo}/blob/${cfg.githubBranch}/notebooks/${nb}`;
}
function quizHtml(qs, mid){
  if(!qs?.length) return '';
  return `<section class="quiz"><h2>Comprobá que quedó claro</h2>${qs.map((q,qi)=>`
  <div class="question" data-answer="${q[1]}"><p>${q[0]}</p>
    ${q.slice(1).map((a,ai)=>`<label><input type="radio" name="${mid}-${qi}" value="${a}"> ${a}</label>`).join('')}
    <div class="feedback"></div>
  </div>`).join('')}</section>`;
}
function render(){
  let idx=data.findIndex(m=>m.id===current); if(idx<0){current='00'; idx=0}
  const m=data[idx];
  const planned=m.status==='planned';
  lesson.innerHTML=`
    <div class="kicker">Módulo ${m.id}${planned?'<span class="statusPill">Pendiente</span>':''}</div>
    <h1>${m.title}</h1>
    <p class="lead">${m.lead}</p>
    ${m.body}
    ${quizHtml(m.quiz,m.id)}
    <div class="actions">
      ${m.notebook?`<a class="btn primary" target="_blank" rel="noopener" href="${colabUrl(m.notebook)}">Abrir ejercicio en Colab ↗</a>`:''}
      ${!planned?`<button class="btn" id="completeBtn">${progress[m.id]?'✓ Completado':'Marcar como completado'}</button>`:''}
      <a class="btn" href="corpus/catalogo_sistemas.txt" target="_blank">Ver corpus</a>
    </div>
    <div class="pager">
      ${idx>0?`<button class="btn" id="prevBtn">← ${data[idx-1].name}</button>`:'<span></span>'}
      ${idx<data.length-1?`<button class="btn" id="nextBtn">${data[idx+1].name} →</button>`:'<span></span>'}
    </div>`;
  document.querySelectorAll('pre').forEach(pre=>{
    const b=document.createElement('button'); b.className='copyBtn'; b.textContent='Copiar';
    b.onclick=()=>navigator.clipboard.writeText(pre.innerText.replace('Copiar','')).then(()=>{b.textContent='Copiado';setTimeout(()=>b.textContent='Copiar',900)});
    pre.appendChild(b);
  });
  document.querySelectorAll('.question input').forEach(inp=>{
    inp.addEventListener('change', e=>{
      const box=e.target.closest('.question'); const fb=box.querySelector('.feedback');
      if(e.target.value===box.dataset.answer){fb.textContent='Correcto ✓';fb.className='feedback correct'}
      else{fb.textContent='No todavía. Releé la explicación y probá de nuevo.';fb.className='feedback wrong'}
    });
  });
  const cb=document.querySelector('#completeBtn');
  if(cb) cb.onclick=()=>{progress[m.id]=!progress[m.id];save();render();drawNav()};
  const pb=document.querySelector('#prevBtn'); if(pb)pb.onclick=()=>location.hash=data[idx-1].id;
  const nb=document.querySelector('#nextBtn'); if(nb)nb.onclick=()=>location.hash=data[idx+1].id;
  drawNav(); updateProgress(); window.scrollTo({top:0,behavior:'smooth'});
}
window.addEventListener('hashchange',()=>{current=location.hash.replace('#','')||'00';render()});
document.querySelector('#menuBtn').onclick=()=>sidebar.classList.toggle('open');
document.querySelector('#themeBtn').onclick=()=>{
  const dark=document.documentElement.dataset.theme==='dark';
  document.documentElement.dataset.theme=dark?'light':'dark';
  localStorage.setItem('rag-theme', dark?'light':'dark');
};
document.documentElement.dataset.theme=localStorage.getItem('rag-theme')||'light';
render();

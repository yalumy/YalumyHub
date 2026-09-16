const STORAGE_KEY='yalumy-memory-map-v1';
const DAY=86400000;
let store=loadStore();
let currentReviewId=null;
let reviewRatings={};
let availableMinutes=5;
const $=id=>document.getElementById(id);

function loadStore(){
  try{
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));
    if(saved&&Array.isArray(saved.topics))return saved;
  }catch(error){}
  return{topics:[],examDate:'',version:1};
}
function saveStore(){localStorage.setItem(STORAGE_KEY,JSON.stringify(store))}
function startOfToday(){const d=new Date();d.setHours(0,0,0,0);return d.getTime()}
function daysBetween(a,b){return Math.ceil((b-a)/DAY)}
function intervalFor(score,difficulty,reviewCount){
  const base=[1,2,4,7,12,20,35,60][Math.min(reviewCount,7)];
  const quality=.55+(score/6)*.9;
  const difficultyFactor={1:1.25,2:1,3:.72}[difficulty]||1;
  return Math.max(1,Math.round(base*quality*difficultyFactor));
}
function topicState(topic){
  if(!topic.lastReviewed)return{status:'new',strength:12,dueText:'Start your first review',daysUntil:0};
  const elapsed=Math.max(0,(Date.now()-topic.lastReviewed)/DAY);
  const interval=Math.max(1,topic.interval||1);
  const ratio=elapsed/interval;
  const strength=Math.max(4,Math.round(100*Math.exp(-.78*ratio)));
  const dueAt=topic.lastReviewed+interval*DAY;
  const days=daysBetween(startOfToday(),dueAt);
  if(days<=0)return{status:'urgent',strength,dueText:days<0?`${Math.abs(days)} day${Math.abs(days)===1?'':'s'} overdue`:'Review today',daysUntil:days};
  if(ratio>=.68||days<=2)return{status:'fading',strength,dueText:days===1?'Review tomorrow':`Review in ${days} days`,daysUntil:days};
  return{status:'strong',strength,dueText:`Strong for ${days} more days`,daysUntil:days};
}
function priority(topic){
  const state=topicState(topic);
  const examBoost=store.examDate?Math.max(0,20-daysBetween(startOfToday(),new Date(`${store.examDate}T00:00:00`).getTime())):0;
  return({urgent:100,fading:65,new:55,strong:15}[state.status]||0)+(3-topic.difficulty)*-2+examBoost-state.daysUntil;
}
function formatDate(timestamp){return new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric'}).format(new Date(timestamp))}
function escapeHTML(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

function render(){
  const enriched=store.topics.map(topic=>({topic,state:topicState(topic)}));
  const reviewed=enriched.filter(x=>x.topic.lastReviewed);
  const readiness=reviewed.length?Math.round(reviewed.reduce((sum,x)=>sum+x.state.strength,0)/reviewed.length):0;
  $('readinessScore').textContent=`${readiness}%`;
  $('readinessRing').style.setProperty('--score',readiness);
  $('readinessMessage').textContent=!store.topics.length?'Add your first topic to begin your map.':readiness>=75?'Your memory is in good shape. Keep the rhythm.':readiness>=45?'A few timely reviews will strengthen your map.':'Start with the topics marked for review.';
  $('dueCount').textContent=enriched.filter(x=>x.state.status==='urgent'||x.state.status==='new').length;
  $('fadingCount').textContent=enriched.filter(x=>x.state.status==='fading').length;
  $('strongCount').textContent=enriched.filter(x=>x.state.status==='strong').length;
  renderFilters();renderQueue();renderTopics();renderExam();
}
function renderFilters(){
  const current=$('subjectFilter').value||'all';
  const subjects=[...new Set(store.topics.map(t=>t.subject))].sort((a,b)=>a.localeCompare(b));
  $('subjectFilter').innerHTML='<option value="all">All subjects</option>'+subjects.map(s=>`<option value="${escapeHTML(s)}">${escapeHTML(s)}</option>`).join('');
  $('subjectFilter').value=subjects.includes(current)?current:'all';
}
function renderQueue(){
  const sorted=[...store.topics].sort((a,b)=>priority(b)-priority(a));
  let used=0;const selected=[];
  for(const topic of sorted){if(used+topic.minutes<=availableMinutes||!selected.length){selected.push(topic);used+=topic.minutes}if(used>=availableMinutes)break}
  const queue=$('reviewQueue');
  if(!selected.length){queue.innerHTML='<div class="queue-empty">Your review queue will appear here after you add a topic.</div>';return}
  queue.innerHTML=selected.map((topic,index)=>{const state=topicState(topic);return`<article class="queue-card"><i class="priority ${state.status}"></i><small>${index===0?'Highest priority':escapeHTML(topic.subject)} · ${topic.minutes} min</small><h3>${escapeHTML(topic.name)}</h3><p>${escapeHTML(state.dueText)}</p><button type="button" data-review="${topic.id}">Review now →</button></article>`}).join('');
}
function renderTopics(){
  const filter=$('subjectFilter').value||'all';
  const topics=store.topics.filter(t=>filter==='all'||t.subject===filter).sort((a,b)=>priority(b)-priority(a));
  $('emptyMap').hidden=store.topics.length>0;
  $('topicGrid').hidden=store.topics.length===0;
  $('topicGrid').innerHTML=topics.map(topic=>{const state=topicState(topic);return`<article class="topic-card" data-status="${state.status}"><div class="topic-meta"><span class="subject-pill">${escapeHTML(topic.subject)}</span><button class="topic-menu" type="button" data-delete="${topic.id}" aria-label="Delete ${escapeHTML(topic.name)}">×</button></div><h3>${escapeHTML(topic.name)}</h3><p>${escapeHTML(state.dueText)}${topic.lastReviewed?` · Last checked ${formatDate(topic.lastReviewed)}`:''}</p><div class="memory-bar" title="Estimated memory strength ${state.strength}%"><span style="width:${state.strength}%"></span></div><div class="topic-bottom"><small>${state.strength}% strength</small><button type="button" data-review="${topic.id}">${topic.lastReviewed?'Check memory':'First review'} →</button></div></article>`}).join('');
}
function renderExam(){
  $('examDate').value=store.examDate||'';
  if(!store.examDate){$('examNote').textContent='';return}
  const days=daysBetween(startOfToday(),new Date(`${store.examDate}T00:00:00`).getTime());
  $('examNote').textContent=days<0?'This exam date has passed. Choose a new date.':days===0?'Your exam is today. Focus on urgent topics only.':`${days} day${days===1?'':'s'} until your exam. Your queue now gives extra weight to weak topics.`;
}
function openAdd(){
  $('topicForm').reset();$('topicDifficulty').value='2';$('topicMinutes').value='10';$('topicDialog').showModal();setTimeout(()=>$('topicName').focus(),50)
}
function openReview(id){
  const topic=store.topics.find(t=>t.id===id);if(!topic)return;
  currentReviewId=id;reviewRatings={};$('reviewTitle').textContent=topic.name;
  document.querySelectorAll('.rating-row button').forEach(b=>b.classList.remove('selected'));
  $('saveReview').disabled=true;$('reviewDialog').showModal();
}
function closeDialog(dialog){if(dialog.open)dialog.close()}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2600)}

['addTopicTop','addTopicButton','emptyAddButton'].forEach(id=>$(id).addEventListener('click',openAdd));
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>closeDialog(button.closest('dialog'))));
[$('topicDialog'),$('reviewDialog')].forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog(dialog)}));
$('topicForm').addEventListener('submit',event=>{
  event.preventDefault();
  const name=$('topicName').value.trim(),subject=$('topicSubject').value.trim();if(!name||!subject)return;
  store.topics.push({id:crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`,name,subject,difficulty:+$('topicDifficulty').value,minutes:+$('topicMinutes').value,createdAt:Date.now(),lastReviewed:null,interval:1,reviewCount:0,score:0});
  saveStore();closeDialog($('topicDialog'));render();toast('Topic added to your memory map');
});
document.querySelectorAll('.rating-row').forEach(row=>row.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  row.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b===button));
  reviewRatings[row.dataset.field]=+button.dataset.value;$('saveReview').disabled=Object.keys(reviewRatings).length<3;
}));
$('reviewForm').addEventListener('submit',event=>{
  event.preventDefault();if(Object.keys(reviewRatings).length<3)return;
  const topic=store.topics.find(t=>t.id===currentReviewId);if(!topic)return;
  const score=reviewRatings.recall+reviewRatings.explain+reviewRatings.apply;
  topic.reviewCount=(topic.reviewCount||0)+1;topic.score=score;topic.lastReviewed=Date.now();topic.interval=intervalFor(score,topic.difficulty,topic.reviewCount);
  saveStore();closeDialog($('reviewDialog'));render();toast(score>=5?`Strong review — next check in ${topic.interval} days`:`Good check-in — review again in ${topic.interval} day${topic.interval===1?'':'s'}`);
});
document.addEventListener('click',event=>{
  const review=event.target.closest('[data-review]');if(review)openReview(review.dataset.review);
  const remove=event.target.closest('[data-delete]');if(remove){const topic=store.topics.find(t=>t.id===remove.dataset.delete);if(topic&&confirm(`Remove “${topic.name}” from your map?`)){store.topics=store.topics.filter(t=>t.id!==topic.id);saveStore();render();toast('Topic removed')}}
});
document.querySelectorAll('.time-filter button').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.time-filter button').forEach(b=>b.classList.toggle('active',b===button));availableMinutes=+button.dataset.minutes;renderQueue()}));
$('subjectFilter').addEventListener('change',renderTopics);
$('saveExam').addEventListener('click',()=>{store.examDate=$('examDate').value;saveStore();render();toast(store.examDate?'Exam date saved':'Choose an exam date first')});
$('clearExam').addEventListener('click',()=>{store.examDate='';saveStore();render();toast('Exam date cleared')});
$('exportData').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(store,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`yalumy-memory-map-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);toast('Backup downloaded')});
$('importData').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!data||!Array.isArray(data.topics))throw new Error('Invalid');store={topics:data.topics,examDate:data.examDate||'',version:1};saveStore();render();toast('Memory map restored')}catch(error){toast('This backup could not be read')}event.target.value=''});
render();

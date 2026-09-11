import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';

const lessons={
  before:{title:'9bal el Bac',pdf:'../assets/pdfs/9bal-el-bac/verbes%20(29.7%20x%2029%20cm).pdf',back:'../lessons/9bal-el-bac.html',flash:'../flashcards/9bal-el-bac.html',quiz:'../games/9bal-el-bac-quiz.html',game:'../games/9bal-el-bac-match.html'},
  homme:{title:"L’Homme — Study Notes",pdf:'../assets/pdfs/homme/resumer-l-homme.pdf',back:'../lessons/reproduction-homme.html',flash:'../flashcards/homme.html',quiz:'../games/homme-quiz.html',game:'../games/homme-match.html'}
};
const lessonKey=new URLSearchParams(location.search).get('lesson')||'homme';
const lesson=lessons[lessonKey]||lessons.homme;
const pages=document.getElementById('pages');
const toast=document.getElementById('toast');
const state={tool:'pen',color:'#dc756b',size:4,opacity:1,noteShape:'square',noteColor:'#fff0a8',zoom:1,baseScale:null,pdf:null,canvasStates:new Map(),dirty:false};

document.getElementById('lessonTitle').textContent=lesson.title;
document.title=lesson.title+' | YalumyHub';
document.getElementById('lessonBack').href=lesson.back;
document.getElementById('flashcardsLink').href=lesson.flash;
document.getElementById('quizLink').href=lesson.quiz;
document.getElementById('gameLink').href=lesson.game;

function notify(text){toast.textContent=text;toast.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>toast.classList.remove('show'),2200)}
function storageKey(){return'yalumy-reader-'+lessonKey}
function setDirty(){state.dirty=true;document.getElementById('saveState').innerHTML='<i></i> Unsaved changes'}
function hexToRgba(hex,alpha){const n=parseInt(hex.slice(1),16);return `rgba(${n>>16},${n>>8&255},${n&255},${alpha})`}

async function render(){
  document.getElementById('loading').style.display='block';
  pages.innerHTML='';
  state.canvasStates.clear();
  state.pdf=state.pdf||await pdfjsLib.getDocument(lesson.pdf).promise;
  if(!state.baseScale){
    const sample=await state.pdf.getPage(1);
    const natural=sample.getViewport({scale:1});
    const available=document.querySelector('.lesson-stage').clientWidth-44;
    state.baseScale=Math.min(1.15,available/natural.width);
  }
  const renderScale=state.baseScale*state.zoom;
  for(let number=1;number<=state.pdf.numPages;number++){
    const page=await state.pdf.getPage(number);
    const view=page.getViewport({scale:renderScale});
    const wrap=document.createElement('article');
    const base=document.createElement('canvas');
    const draw=document.createElement('canvas');
    const notes=document.createElement('div');
    wrap.className='pdf-page';base.className='pdf-canvas';draw.className='draw-layer';notes.className='note-layer';notes.dataset.page=number;
    wrap.style.width=view.width+'px';wrap.style.height=view.height+'px';
    const ratio=devicePixelRatio||1;
    base.width=draw.width=Math.floor(view.width*ratio);base.height=draw.height=Math.floor(view.height*ratio);
    base.style.width=draw.style.width=view.width+'px';base.style.height=draw.style.height=view.height+'px';
    wrap.append(base,draw,notes);pages.append(wrap);
    await page.render({canvasContext:base.getContext('2d'),viewport:view,transform:ratio===1?null:[ratio,0,0,ratio,0,0]}).promise;
    setupDrawing(draw,number);
  }
  document.getElementById('loading').style.display='none';
  restore();
}

function setupDrawing(canvas,pageNumber){
  const ctx=canvas.getContext('2d');
  const ratio=devicePixelRatio||1;
  ctx.scale(ratio,ratio);
  let drawing=false,last=null;
  const history=[];
  const point=e=>{const rect=canvas.getBoundingClientRect();return{x:(e.clientX-rect.left)*canvas.clientWidth/rect.width,y:(e.clientY-rect.top)*canvas.clientHeight/rect.height}};
  canvas.addEventListener('pointerdown',e=>{
    if(state.tool==='note'){addNote(e,canvas,pageNumber);return}
    drawing=true;last=point(e);history.push(canvas.toDataURL());state.canvasStates.set(pageNumber,{canvas,history});canvas.setPointerCapture(e.pointerId);setDirty()
  });
  canvas.addEventListener('pointermove',e=>{if(!drawing)return;const next=point(e);drawStroke(ctx,last,next);last=next});
  const stop=()=>{drawing=false;last=null};
  canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);
}

function drawStroke(ctx,a,b){
  const tool=state.tool;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.setLineDash([]);ctx.globalCompositeOperation=tool==='eraser'?'destination-out':'source-over';
  if(tool==='highlighter'){
    ctx.strokeStyle=hexToRgba(state.color,state.opacity*.28);ctx.lineWidth=Math.max(12,state.size*4.5);ctx.lineCap='square';line(ctx,a,b);
  }else if(tool==='pencil'){
    ctx.strokeStyle=hexToRgba(state.color,state.opacity*.52);ctx.lineWidth=Math.max(1,state.size*.75);
    for(let i=0;i<3;i++)line(ctx,{x:a.x+(Math.random()-.5)*1.5,y:a.y+(Math.random()-.5)*1.5},{x:b.x+(Math.random()-.5)*1.5,y:b.y+(Math.random()-.5)*1.5});
  }else if(tool==='chalk'){
    ctx.strokeStyle=hexToRgba(state.color,state.opacity*.42);ctx.lineWidth=Math.max(4,state.size*1.8);ctx.setLineDash([2,2]);line(ctx,a,b);
    const distance=Math.hypot(b.x-a.x,b.y-a.y);ctx.fillStyle=hexToRgba(state.color,state.opacity*.34);
    for(let i=0;i<distance/2;i++){const t=Math.random();ctx.fillRect(a.x+(b.x-a.x)*t+(Math.random()-.5)*state.size*2,a.y+(b.y-a.y)*t+(Math.random()-.5)*state.size*2,Math.random()*2+.5,Math.random()*2+.5)}
  }else if(tool==='glitter'){
    ctx.strokeStyle=hexToRgba(state.color,state.opacity*.32);ctx.lineWidth=Math.max(2,state.size*.8);line(ctx,a,b);
    const distance=Math.hypot(b.x-a.x,b.y-a.y);
    for(let i=0;i<distance/3;i++){const t=Math.random(),x=a.x+(b.x-a.x)*t+(Math.random()-.5)*state.size*4,y=a.y+(b.y-a.y)*t+(Math.random()-.5)*state.size*4,r=Math.random()*2.5+1;ctx.fillStyle=Math.random()>.45?hexToRgba(state.color,state.opacity):Math.random()>.5?'rgba(255,205,91,.9)':'rgba(255,255,255,.95)';spark(ctx,x,y,r)}
  }else{
    ctx.strokeStyle=state.color;ctx.globalAlpha=state.opacity;ctx.lineWidth=tool==='eraser'?Math.max(12,state.size*2.5):state.size;line(ctx,a,b);
  }
  ctx.restore()
}
function line(ctx,a,b){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
function spark(ctx,x,y,r){ctx.beginPath();ctx.moveTo(x,y-r*2);ctx.lineTo(x+r*.55,y-r*.55);ctx.lineTo(x+r*2,y);ctx.lineTo(x+r*.55,y+r*.55);ctx.lineTo(x,y+r*2);ctx.lineTo(x-r*.55,y+r*.55);ctx.lineTo(x-r*2,y);ctx.lineTo(x-r*.55,y-r*.55);ctx.closePath();ctx.fill()}

function addNote(event,canvas,pageNumber,stored){
  const layer=document.querySelector(`[data-page="${pageNumber}"]`);
  const rect=canvas.getBoundingClientRect();
  const note=document.createElement('div');
  const shape=stored?.shape||state.noteShape;
  note.className='page-note '+shape;note.style.setProperty('--note',stored?.color||state.noteColor);
  note.style.left=stored?.left||Math.max(5,Math.min(event.clientX-rect.left,canvas.clientWidth-170))+'px';
  note.style.top=stored?.top||Math.max(5,Math.min(event.clientY-rect.top,canvas.clientHeight-145))+'px';
  if(stored?.width)note.style.width=stored.width;if(stored?.height)note.style.height=stored.height;
  note.innerHTML='<button class="note-delete" aria-label="Delete note">×</button><span class="note-grip"></span><textarea aria-label="Sticky note" placeholder="Write a note…"></textarea>';
  note.querySelector('textarea').value=stored?.text||'';
  note.querySelector('.note-delete').onclick=()=>{note.remove();setDirty()};
  note.querySelector('textarea').oninput=setDirty;
  makeDraggable(note,layer);
  layer.append(note);
  if(!stored){note.querySelector('textarea').focus();setDirty()}
}
function makeDraggable(note,layer){
  const grip=note.querySelector('.note-grip');let start=null;
  grip.addEventListener('pointerdown',e=>{e.preventDefault();const box=note.getBoundingClientRect();start={x:e.clientX,y:e.clientY,left:note.offsetLeft,top:note.offsetTop,w:box.width,h:box.height};grip.setPointerCapture(e.pointerId)});
  grip.addEventListener('pointermove',e=>{if(!start)return;note.style.left=Math.max(0,Math.min(start.left+e.clientX-start.x,layer.clientWidth-start.w))+'px';note.style.top=Math.max(0,Math.min(start.top+e.clientY-start.y,layer.clientHeight-start.h))+'px'});
  grip.addEventListener('pointerup',()=>{if(start)setDirty();start=null});grip.addEventListener('pointercancel',()=>start=null)
}

document.querySelectorAll('[data-tool]').forEach(button=>button.onclick=()=>{
  state.tool=button.dataset.tool;
  const defaults={pen:4,pencil:2,highlighter:6,chalk:5,glitter:4,eraser:10,note:4};
  state.size=defaults[state.tool];
  document.getElementById('brushSize').value=state.size;
  document.getElementById('sizeValue').value=state.size;
  document.querySelectorAll('[data-tool]').forEach(x=>x.classList.toggle('active',x===button));
  document.getElementById('noteDesigner').hidden=state.tool!=='note';
  notify(button.dataset.name)
});
document.getElementById('color').oninput=e=>{state.color=e.target.value;document.getElementById('colorSwatch').style.background=state.color};
document.getElementById('brushSize').oninput=e=>{state.size=+e.target.value;document.getElementById('sizeValue').value=state.size};
document.getElementById('brushOpacity').oninput=e=>{state.opacity=+e.target.value/100;document.getElementById('opacityValue').value=e.target.value+'%'};
document.querySelectorAll('[data-shape]').forEach(button=>button.onclick=()=>{state.noteShape=button.dataset.shape;document.querySelectorAll('[data-shape]').forEach(x=>x.classList.toggle('active',x===button))});
document.querySelectorAll('[data-note-color]').forEach(button=>button.onclick=()=>{state.noteColor=button.dataset.noteColor;document.querySelectorAll('[data-note-color]').forEach(x=>x.classList.toggle('active',x===button))});
document.getElementById('undo').onclick=()=>{const current=[...state.canvasStates.values()].at(-1);if(!current||!current.history.length)return notify('Nothing to undo');const image=new Image(),source=current.history.pop(),ctx=current.canvas.getContext('2d');image.onload=()=>{ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,current.canvas.width,current.canvas.height);ctx.drawImage(image,0,0,current.canvas.width,current.canvas.height);ctx.restore();setDirty()};image.src=source};

function collect(){
  return[...document.querySelectorAll('.pdf-page')].map(w=>({drawing:w.querySelector('.draw-layer').toDataURL(),notes:[...w.querySelectorAll('.page-note')].map(n=>({text:n.querySelector('textarea').value,left:n.style.left,top:n.style.top,width:n.style.width,height:n.style.height,shape:[...n.classList].find(c=>['square','rectangle','circle','oval','heart','star'].includes(c))||'square',color:n.style.getPropertyValue('--note')}))}))
}
function save(silent=false){localStorage.setItem(storageKey(),JSON.stringify(collect()));state.dirty=false;document.getElementById('saveState').innerHTML='<i></i> Saved on this device';if(!silent)notify('Your lesson has been saved')}
document.getElementById('save').onclick=()=>save();
function restore(){try{const data=JSON.parse(localStorage.getItem(storageKey()));if(!data)return;document.querySelectorAll('.pdf-page').forEach((w,index)=>{const item=data[index];if(!item)return;const canvas=w.querySelector('.draw-layer'),ctx=canvas.getContext('2d'),image=new Image;image.onload=()=>{ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(image,0,0,canvas.width,canvas.height);ctx.restore()};image.src=item.drawing;(item.notes||[]).forEach(note=>addNote({clientX:0,clientY:0},canvas,index+1,note))});state.dirty=false}catch{notify('Saved notes could not be restored')}}

async function changeZoom(amount){if(state.dirty)save(true);state.zoom=Math.max(.65,Math.min(1.9,state.zoom+amount));document.getElementById('zoomValue').textContent=Math.round(state.zoom*100)+'%';await render()}
document.getElementById('zoomIn').onclick=()=>changeZoom(.1);document.getElementById('zoomOut').onclick=()=>changeZoom(-.1);
if(localStorage.getItem('yalumy-theme')==='dark')document.body.classList.add('dark');
document.getElementById('theme').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('yalumy-theme',document.body.classList.contains('dark')?'dark':'light')};
document.querySelectorAll('.difficulty button').forEach(b=>b.onclick=()=>document.querySelectorAll('.difficulty button').forEach(x=>x.classList.toggle('active',x===b)));
document.querySelectorAll('[data-ai]').forEach(b=>b.onclick=()=>notify('Available with Yalumy Plus after accounts are connected'));

let duration=25*60,remaining=duration,timer=null;
const timerDisplay=document.getElementById('timerDisplay'),timerProgress=document.getElementById('timerProgress'),timerStart=document.getElementById('timerStart'),focusStatus=document.getElementById('focusStatus');
function paintTimer(){timerDisplay.textContent=String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0');timerProgress.style.strokeDashoffset=333*(1-remaining/duration)}
document.querySelectorAll('[data-minutes]').forEach(b=>b.onclick=()=>{clearInterval(timer);timer=null;duration=+b.dataset.minutes*60;remaining=duration;document.querySelectorAll('[data-minutes]').forEach(x=>x.classList.toggle('active',x===b));timerStart.textContent='▶ Start';focusStatus.textContent='Ready';paintTimer()});
timerStart.onclick=()=>{if(timer){clearInterval(timer);timer=null;timerStart.textContent='▶ Continue';focusStatus.textContent='Paused';return}if(remaining===0)remaining=duration;timerStart.textContent='Ⅱ Pause';focusStatus.textContent='Focusing';timer=setInterval(()=>{remaining--;paintTimer();if(remaining<=0){clearInterval(timer);timer=null;remaining=0;paintTimer();timerStart.textContent='▶ Start again';focusStatus.textContent='Complete';notify('Focus session complete ✦')}},1000)};
document.getElementById('timerReset').onclick=()=>{clearInterval(timer);timer=null;remaining=duration;timerStart.textContent='▶ Start';focusStatus.textContent='Ready';paintTimer()};

const audio={
  rain:document.getElementById('rainAudio'),
  lofi:document.getElementById('lofiAudio')
};
document.querySelectorAll('[data-audio]').forEach(button=>button.onclick=async()=>{
  const player=audio[button.dataset.audio];
  if(player.paused){try{await player.play();button.classList.add('playing');button.setAttribute('aria-label','Pause '+button.dataset.audio)}catch{notify('Tap again to start the sound')}}else{player.pause();button.classList.remove('playing')}
});
document.querySelectorAll('[data-volume]').forEach(slider=>{const player=audio[slider.dataset.volume];player.volume=slider.value/100;slider.oninput=()=>player.volume=slider.value/100});
document.getElementById('muteAll').onclick=()=>{const anyPlaying=Object.values(audio).some(x=>!x.paused);Object.values(audio).forEach(x=>anyPlaying?x.pause():x.play().catch(()=>{}));document.querySelectorAll('[data-audio]').forEach(x=>x.classList.toggle('playing',!anyPlaying));notify(anyPlaying?'Ambient sounds paused':'Ambient mix started')};
window.addEventListener('beforeunload',()=>{if(state.dirty)save(true)});
paintTimer();
render().catch(()=>{document.getElementById('loading').innerHTML='We could not open this lesson.<br><small>Please refresh and try again.</small>'});

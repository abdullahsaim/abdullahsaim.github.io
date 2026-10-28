import * as pdfjs from './vendor/pdfjs/pdf.mjs';
pdfjs.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdfjs/pdf.worker.mjs',import.meta.url).href;
const C=FolioCore,$=id=>document.getElementById(id),sources=new Map(),palette=['#E5BA98','#B6D6C7','#C4B4DF','#A9C7DE','#DCC995'];
let entries=[],selected=new Set(),past=[],future=[],serial=0,busy=false,dragId=null,toastTimer,observer,queue=[],queueRunning=false,generation=0,activeThumb=null,previewId=null,previewTask=null,previewVersion=0;
let pointerDrag=null;
const id=prefix=>prefix+(++serial);
const node=(tag,text,className)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;};
const size=bytes=>bytes<1024*1024?(bytes/1024).toFixed(bytes?1:0)+' KB':(bytes/1024/1024).toFixed(1)+' MB';
const snapshot=()=>({entries:entries.map(p=>({...p})),selected:[...selected]});
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3800);}
function remember(){past.push(snapshot());if(past.length>30)past.shift();future=[];}
function commit(next,message,nextSelected){remember();entries=next;selected=new Set((nextSelected||[...selected]).filter(x=>entries.some(p=>p.id===x)));render();if(message)$('status').textContent=message;}
function setBusy(value){busy=value;document.querySelectorAll('main button,main input,main select').forEach(e=>e.disabled=value);if(!value)updateControls();$('drop-zone').setAttribute('aria-busy',String(value));}
function updateControls(){
  const n=entries.length,s=selected.size;
  $('board').hidden=!n;$('empty-state').hidden=!!n;
  $('clear-open').hidden=!sources.size;
  for(const key of ['rotate-left','rotate-right','duplicate','remove'])$(key).disabled=busy||!s;
  $('undo').disabled=busy||!past.length;$('redo').disabled=busy||!future.length;$('reverse').disabled=busy||n<2;$('apply-range').disabled=busy||!n;
  $('select-all').disabled=busy||!n;$('select-all').checked=!!n&&s===n;$('select-all').indeterminate=s>0&&s<n;
  $('selection-count').textContent=s+' selected';$('page-count').textContent=String(n).padStart(2,'0');
  const active=[...new Set(entries.map(p=>p.sourceId))];$('file-count').textContent=String(active.length).padStart(2,'0');$('input-size').textContent=size(active.reduce((sum,key)=>sum+sources.get(key).size,0));
  [...$('page-grid').children].forEach((card,index)=>{const on=selected.has(card.dataset.id);card.classList.toggle('selected',on);card.querySelector('input').checked=on;const buttons=card.querySelectorAll('.page-controls button');buttons[0].disabled=busy||index===0;buttons[1].disabled=busy;buttons[2].disabled=busy||index===entries.length-1;});
  const mode=$('export-mode').value,count=mode==='selected'?s:n;
  $('file-extension').textContent=mode==='split'?'.zip':'.pdf';$('export-pages').textContent=count+' '+(count===1?'page':'pages');
  $('export-kind').textContent=mode==='split'?n+' INDIVIDUAL PDF'+(n===1?'':'S'):'ONE FRESH PDF ↗';
  $('export-description').textContent=mode==='all'?'All pages in your current order, combined into one PDF.':mode==='selected'?'Only your selected pages, kept in their current board order.':'Every workspace page becomes a separate PDF, bundled into one ZIP.';
  $('download').replaceChildren(node('span',busy?'Working on it…':mode==='split'?'Download your ZIP':'Download your PDF'),node('span','↓'));
  $('download').disabled=busy||!count;
}
function getRenderer(source){if(!source.renderPromise)source.renderPromise=pdfjs.getDocument({data:source.bytes.slice(),isEvalSupported:false,useSystemFonts:true,cMapUrl:new URL('./vendor/pdfjs/cmaps/',import.meta.url).href,cMapPacked:true,standardFontDataUrl:new URL('./vendor/pdfjs/standard_fonts/',import.meta.url).href,wasmUrl:new URL('./vendor/pdfjs/wasm/',import.meta.url).href,iccUrl:new URL('./vendor/pdfjs/iccs/',import.meta.url).href}).promise;return source.renderPromise;}
function sourceRotation(entry){return C.rotation(sources.get(entry.sourceId).doc.getPage(entry.index).getRotation().angle+entry.rotation);}
function render(){
  generation++;observer?.disconnect();activeThumb?.cancel();queue=[];
  const active=[...new Set(entries.map(p=>p.sourceId))];$('source-strip').replaceChildren(...active.map(key=>{const source=sources.get(key),chip=node('span',undefined,'source-chip'),dot=node('i');dot.style.background=source.color;const label=node('span',source.name);chip.title=source.name;chip.append(dot,label,node('small',entries.filter(p=>p.sourceId===key).length+'p'));return chip;}));
  $('page-grid').replaceChildren(...entries.map((entry,index)=>{
    const source=sources.get(entry.sourceId),card=node('article',undefined,'page-card');card.dataset.id=entry.id;card.draggable=true;card.setAttribute('aria-label','Page '+(index+1)+' from '+source.name);card.style.setProperty('--source',source.color);
    const top=node('div',undefined,'page-top'),label=node('label',undefined,'page-selection'),check=node('input');check.type='checkbox';check.checked=selected.has(entry.id);check.setAttribute('aria-label','Select page '+(index+1));check.addEventListener('change',()=>{if(check.checked)selected.add(entry.id);else selected.delete(entry.id);updateControls();});label.append(check,node('span',String(index+1).padStart(2,'0')));top.append(label,node('span','⠿','drag-handle'));
    const handle=top.querySelector('.drag-handle');handle.draggable=false;handle.title='Drag to reorder; use the arrow buttons for keyboard control';handle.addEventListener('pointerdown',event=>{if(busy||event.button!==0)return;event.preventDefault();pointerDrag={id:entry.id,x:event.clientX,y:event.clientY,moved:false,target:null};handle.setPointerCapture(event.pointerId);card.classList.add('pointer-dragging');});
    const open=node('button',undefined,'page-open');open.setAttribute('aria-label','Preview page '+(index+1));const canvas=node('canvas');canvas.width=160;canvas.height=210;canvas.setAttribute('aria-label','Thumbnail for page '+(index+1));const loading=node('span','Preparing preview…','thumb-status');open.append(canvas,loading);open.addEventListener('click',()=>openPreview(entry.id));
    const info=node('div',undefined,'page-info');const name=node('strong',source.name);name.title=source.name;info.append(name,node('small','Source page '+(entry.index+1)+(entry.rotation?' · '+entry.rotation+'° turn':'')));
    const controls=node('div',undefined,'page-controls');
    const left=node('button','←'),right=node('button','→'),rotate=node('button','↻');left.setAttribute('aria-label','Move page '+(index+1)+' earlier');right.setAttribute('aria-label','Move page '+(index+1)+' later');rotate.setAttribute('aria-label','Rotate page '+(index+1)+' clockwise');left.disabled=index===0;right.disabled=index===entries.length-1;
    const move=delta=>{if(busy)return;const target=entries[index+delta];if(target){commit(C.move(entries,entry.id,target.id),'Page moved to position '+(index+1+delta)+'.');$('page-grid').querySelector('[data-id="'+entry.id+'"] .page-open')?.focus();}};
    left.addEventListener('click',()=>move(-1));right.addEventListener('click',()=>move(1));rotate.addEventListener('click',()=>{if(!busy)commit(entries.map(p=>p.id===entry.id?{...p,rotation:C.rotation(p.rotation+90)}:p),'Page rotated clockwise.');});controls.append(left,rotate,right);
    card.append(top,open,info,controls);
    card.addEventListener('dragstart',event=>{if(busy){event.preventDefault();return;}dragId=entry.id;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/x-folio-page',entry.id);card.classList.add('dragging');});
    card.addEventListener('dragover',event=>{if(dragId&&!busy){event.preventDefault();card.classList.add('drop-target');}});card.addEventListener('dragleave',event=>{if(!card.contains(event.relatedTarget))card.classList.remove('drop-target');});
    card.addEventListener('drop',event=>{if(!dragId||busy)return;event.preventDefault();event.stopPropagation();const from=dragId;dragId=null;if(from!==entry.id)commit(C.move(entries,from,entry.id),'Page order updated.');card.classList.remove('drop-target');});
    card.addEventListener('dragend',()=>{dragId=null;document.querySelectorAll('.dragging,.drop-target').forEach(e=>e.classList.remove('dragging','drop-target'));});return card;
  }));
  if('IntersectionObserver' in window){observer=new IntersectionObserver(items=>{for(const item of items)if(item.isIntersecting){observer.unobserve(item.target);enqueue(item.target);}}, {rootMargin:'250px'});for(const card of $('page-grid').children)observer.observe(card);}else for(const card of $('page-grid').children)enqueue(card);
  updateControls();$('render-status').textContent=entries.length?'Previews load as you scroll.':'';
}
function enqueue(card){const entry=entries.find(p=>p.id===card.dataset.id);if(entry){queue.push({card,entry,generation});runQueue();}}
async function runQueue(){
  if(queueRunning)return;queueRunning=true;
  while(queue.length){const job=queue.shift();if(job.generation!==generation||!job.card.isConnected)continue;
    try{const source=sources.get(job.entry.sourceId),doc=await getRenderer(source),page=await doc.getPage(job.entry.index+1);if(job.generation!==generation)continue;
      const base=page.getViewport({scale:1,rotation:sourceRotation(job.entry)}),scale=Math.min(190/base.width,240/base.height),viewport=page.getViewport({scale,rotation:sourceRotation(job.entry)}),canvas=job.card.querySelector('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
      activeThumb=page.render({canvasContext:canvas.getContext('2d'),viewport,background:'rgb(255,255,255)'});await activeThumb.promise;
      if(job.generation===generation){job.card.querySelector('.thumb-status').hidden=true;canvas.dataset.ready='true';$('render-status').textContent=document.querySelectorAll('#page-grid canvas[data-ready]').length+' / '+entries.length+' previews';}
    }catch(error){if(error.name!=='RenderingCancelledException'&&job.generation===generation){job.card.querySelector('.thumb-status').textContent='Preview unavailable · Export still available';job.card.classList.add('preview-failed');}}
    finally{activeThumb=null;}
  }
  queueRunning=false;
}
async function openPreview(key){previewId=key;if(!$('preview-dialog').open)$('preview-dialog').showModal();await drawPreview();}
async function drawPreview(){
  const index=entries.findIndex(p=>p.id===previewId);if(index<0)return;
  const entry=entries[index],source=sources.get(entry.sourceId),version=++previewVersion;previewTask?.cancel();$('preview-title').textContent='Page '+(index+1);$('preview-source').textContent=source.name+' · Source page '+(entry.index+1);$('preview-position').textContent=(index+1)+' / '+entries.length;$('previous-preview').disabled=index===0;$('next-preview').disabled=index===entries.length-1;$('preview-status').textContent='Preparing your closer look…';$('preview-canvas').hidden=true;
  try{const doc=await getRenderer(source),page=await doc.getPage(entry.index+1);if(version!==previewVersion)return;const base=page.getViewport({scale:1,rotation:sourceRotation(entry)}),viewport=page.getViewport({scale:Math.min(1000/base.width,1200/base.height,2),rotation:sourceRotation(entry)}),canvas=$('preview-canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);previewTask=page.render({canvasContext:canvas.getContext('2d'),viewport,background:'rgb(255,255,255)'});await previewTask.promise;if(version===previewVersion){canvas.hidden=false;$('preview-status').textContent='';}}
  catch(error){if(error.name!=='RenderingCancelledException'&&version===previewVersion)$('preview-status').textContent='This page cannot be previewed here. You can still export it.';}
}
async function imagePdf(file){
  const url=URL.createObjectURL(file);try{const image=new Image();image.src=url;await image.decode();const width=image.naturalWidth,height=image.naturalHeight;if(width*height>C.LIMITS.imagePixels)throw Error('Image exceeds 24 megapixels. Resize it in Canvas first.');
    // Draw the browser-decoded orientation consistently, including JPEG EXIF rotation.
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d').drawImage(image,0,0);const blob=await new Promise(resolve=>canvas.toBlob(resolve,file.type==='image/jpeg'?'image/jpeg':'image/png',.95));if(!blob)throw Error('This image could not be converted.');const bytes=new Uint8Array(await blob.arrayBuffer());return C.imageDocument(bytes,file.type==='image/jpeg'?'image/jpeg':'image/png',width,height);
  }finally{URL.revokeObjectURL(url);}
}
async function addFiles(files){
  if(busy||!files?.length)return;setBusy(true);$('file-errors').replaceChildren();$('file-errors').hidden=true;$('import-progress').hidden=false;$('progress').max=files.length;let imported=0,added=[];
  try{for(let index=0;index<files.length;index++){
    const file=files[index];$('progress').value=index;$('progress-text').textContent='Reading file '+(index+1)+' of '+files.length;$('status').textContent='Opening '+file.name+'…';
    try{
      if(sources.size>=C.LIMITS.files)throw Error('The workspace holds up to 20 source files. Clear it to start fresh.');
      if(file.size>C.LIMITS.fileBytes)throw Error('File exceeds the 25 MB limit.');
      if([...sources.values()].reduce((n,s)=>n+s.size,0)+file.size>C.LIMITS.totalBytes)throw Error('Workspace input exceeds 60 MB, including undo history. Clear it to start fresh.');
      const isPdf=file.type==='application/pdf'||/\.pdf$/i.test(file.name),isImage=/^image\/(png|jpeg|webp)$/.test(file.type);if(!isPdf&&!isImage)throw Error('Choose a PDF, PNG, JPEG or WebP file.');
      const bytes=isPdf?new Uint8Array(await file.arrayBuffer()):null,doc=isPdf?await C.load(bytes):await imagePdf(file),count=doc.getPageCount();
      if(entries.length+added.length+count>C.LIMITS.pages)throw Error('This would exceed the 200-page workspace limit.');
      const key=id('s'),source={id:key,name:file.name,size:file.size,doc,bytes:isPdf?bytes:await doc.save(),kind:isPdf?'pdf':'image',color:palette[sources.size%palette.length]};sources.set(key,source);
      for(let page=0;page<count;page++)added.push({id:id('p'),sourceId:key,index:page,rotation:0});imported++;
    }catch(error){$('file-errors').hidden=false;$('file-errors').append(node('li',file.name+': '+error.message));}
  }
  if(added.length)commit([...entries,...added],imported+' '+(imported===1?'file':'files')+' added. Your page board is ready.');else $('status').textContent='No files were added. Check the messages below.';
  }finally{$('progress').value=files.length;$('import-progress').hidden=true;setBusy(false);}
}
async function demo(){
  if(busy)return;setBusy(true);
  try{const files=[];for(const [name,count,theme] of [['Field notes',3,[.88,.71,.57]],['A fresh perspective',2,[.66,.8,.74]]]){
    const doc=await PDFLib.PDFDocument.create(),font=await doc.embedFont(PDFLib.StandardFonts.Helvetica),bold=await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    for(let i=0;i<count;i++){const p=doc.addPage([595.28,841.89]);p.drawRectangle({x:0,y:0,width:595.28,height:841.89,color:PDFLib.rgb(.98,.97,.94)});p.drawRectangle({x:40,y:535,width:515,height:265,color:PDFLib.rgb(...theme)});p.drawText('FOLIO / A LITTLE ROOM FOR IDEAS',{x:62,y:760,size:10,font,color:PDFLib.rgb(.25,.24,.23)});p.drawText(i===0?name:'A new chapter.',{x:62,y:675,size:32,font:bold,color:PDFLib.rgb(.2,.22,.22)});p.drawText('Good things begin with a fresh page.',{x:62,y:635,size:14,font,color:PDFLib.rgb(.25,.24,.23)});p.drawText('A small idea. A clearer perspective.',{x:50,y:470,size:21,font:bold,color:PDFLib.rgb(.2,.24,.25)});for(let j=0;j<7;j++)p.drawRectangle({x:50,y:430-j*24,width:j===6?300:495,height:6,color:PDFLib.rgb(.82,.83,.8)});p.drawText('Made for your next good idea.',{x:50,y:125,size:12,font,color:PDFLib.rgb(.36,.41,.4)});p.drawText(String(i+1).padStart(2,'0'),{x:515,y:48,size:13,font:bold,color:PDFLib.rgb(.36,.41,.4)});}
    files.push(new File([await doc.save()],name+'.pdf',{type:'application/pdf'}));}
    setBusy(false);await addFiles(files);
  }catch(error){setBusy(false);$('status').textContent='The demo could not be prepared. Add your own files to begin.';}
}
function rotateSelected(delta){if(!selected.size||busy)return;commit(entries.map(p=>selected.has(p.id)?{...p,rotation:C.rotation(p.rotation+delta)}:p),'Selected pages rotated.');}
function download(bytes,type,name){const url=URL.createObjectURL(new Blob([bytes],{type})),link=node('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
async function exportFiles(){
  if(busy)return;const mode=$('export-mode').value,pages=mode==='selected'?entries.filter(p=>selected.has(p.id)):entries.slice();if(!pages.length)return;
  const name=C.filename($('filename').value);$('filename').value=name;$('export-error').textContent='';setBusy(true);
  try{if(mode==='split'){const zip=new JSZip();for(let i=0;i<pages.length;i++){$('status').textContent='Preparing individual PDF '+(i+1)+' of '+pages.length+'…';zip.file(name+'-'+String(i+1).padStart(3,'0')+'.pdf',await C.build([pages[i]],sources,name+' - Page '+(i+1)));}const bytes=await zip.generateAsync({type:'uint8array',compression:'STORE'});download(bytes,'application/zip',name+'.zip');$('status').textContent=pages.length+' individual PDFs are ready in your ZIP.';}
    else{const bytes=await C.build(pages,sources,name);download(bytes,'application/pdf',name+'.pdf');$('status').textContent='Your '+pages.length+'-page PDF is ready. Original files are unchanged.';}toast('Your download is ready. A fresh page awaits.');
  }catch(error){$('export-error').textContent='The export could not be completed. '+error.message;$('status').textContent='Export did not complete. Your workspace is still here.';}
  finally{setBusy(false);}
}
for(const key of ['add-files','browse'])$(key).addEventListener('click',()=>$('file-input').click());for(const key of ['demo','empty-demo'])$(key).addEventListener('click',demo);
$('file-input').addEventListener('change',e=>{const files=[...e.target.files];e.target.value='';addFiles(files);});
$('select-all').addEventListener('change',()=>{selected=new Set($('select-all').checked?entries.map(p=>p.id):[]);updateControls();});
$('apply-range').addEventListener('click',()=>{try{selected=new Set(C.parseRange($('range').value,entries.length).map(i=>entries[i].id));$('range-error').textContent='';$('range').removeAttribute('aria-invalid');updateControls();$('status').textContent=selected.size+' pages selected.';}catch(error){$('range-error').textContent=error.message;$('range').setAttribute('aria-invalid','true');}});$('range').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('apply-range').click();}});
$('rotate-left').addEventListener('click',()=>rotateSelected(-90));$('rotate-right').addEventListener('click',()=>rotateSelected(90));
$('duplicate').addEventListener('click',()=>{if(busy)return;if(entries.length+selected.size>C.LIMITS.pages){toast('Duplicating this selection would exceed 200 pages.');return;}const added=[];const next=entries.flatMap(p=>{if(!selected.has(p.id))return [p];const copy={...p,id:id('p')};added.push(copy.id);return [p,copy];});commit(next,'Selected pages duplicated immediately after their originals.',added);});
$('remove').addEventListener('click',()=>{if(!busy)commit(entries.filter(p=>!selected.has(p.id)),'Selected pages removed. Undo brings them back.',[]);});
$('reverse').addEventListener('click',()=>{if(!busy)commit(entries.slice().reverse(),'Page order reversed.');});
$('undo').addEventListener('click',()=>{if(busy||!past.length)return;future.push(snapshot());const previous=past.pop();entries=previous.entries;selected=new Set(previous.selected);render();$('status').textContent='Previous page arrangement restored.';});
$('redo').addEventListener('click',()=>{if(busy||!future.length)return;past.push(snapshot());const next=future.pop();entries=next.entries;selected=new Set(next.selected);render();$('status').textContent='Page change reapplied.';});
$('export-mode').addEventListener('change',()=>{$('export-error').textContent='';updateControls();});$('download').addEventListener('click',exportFiles);
$('clear-open').addEventListener('click',()=>$('clear-dialog').showModal());$('cancel-clear').addEventListener('click',()=>$('clear-dialog').close());
$('confirm-clear').addEventListener('click',async()=>{generation++;observer?.disconnect();activeThumb?.cancel();queue=[];for(const source of sources.values())source.renderPromise?.then(doc=>doc.destroy()).catch(()=>{});sources.clear();entries=[];selected.clear();past=[];future=[];$('range').value='';$('range-error').textContent='';$('range').removeAttribute('aria-invalid');$('file-errors').replaceChildren();$('file-errors').hidden=true;$('export-error').textContent='';render();$('clear-dialog').close();$('status').textContent='A fresh workspace. Ready when you are.';});
$('close-preview').addEventListener('click',()=>$('preview-dialog').close());$('preview-dialog').addEventListener('close',()=>{previewVersion++;previewTask?.cancel();previewId=null;});
for(const [key,delta] of [['previous-preview',-1],['next-preview',1]])$(key).addEventListener('click',()=>{const index=entries.findIndex(p=>p.id===previewId)+delta;if(entries[index]){previewId=entries[index].id;drawPreview();}});
$('preview-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();$(e.key==='ArrowLeft'?'previous-preview':'next-preview').click();}});
document.addEventListener('keydown',e=>{if(busy||document.querySelector('dialog[open]')||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();$(e.shiftKey?'redo':'undo').click();}});
document.addEventListener('pointermove',event=>{if(!pointerDrag)return;if(Math.hypot(event.clientX-pointerDrag.x,event.clientY-pointerDrag.y)<6&&!pointerDrag.moved)return;pointerDrag.moved=true;const card=document.elementFromPoint(event.clientX,event.clientY)?.closest('.page-card');pointerDrag.target=card?.dataset.id||null;document.querySelectorAll('.drop-target').forEach(e=>e.classList.remove('drop-target'));if(card&&card.dataset.id!==pointerDrag.id)card.classList.add('drop-target');const grid=$('page-grid'),rect=grid.getBoundingClientRect();if(event.clientX>rect.left&&event.clientX<rect.right){if(event.clientY<rect.top+35)grid.scrollTop-=12;else if(event.clientY>rect.bottom-35)grid.scrollTop+=12;}});
function endPointerDrag(cancel=false){if(!pointerDrag)return;const drag=pointerDrag;pointerDrag=null;document.querySelectorAll('.pointer-dragging,.drop-target').forEach(e=>e.classList.remove('pointer-dragging','drop-target'));if(!cancel&&drag.moved&&drag.target&&drag.id!==drag.target&&!busy)commit(C.move(entries,drag.id,drag.target),'Page order updated.');}
document.addEventListener('pointerup',()=>endPointerDrag());document.addEventListener('pointercancel',()=>endPointerDrag(true));
document.addEventListener('dragover',e=>{if(Array.from(e.dataTransfer.types).includes('Files')){e.preventDefault();if(!busy)$('drop-zone').classList.add('file-dragging');}});
document.addEventListener('dragleave',e=>{if(!e.relatedTarget)$('drop-zone').classList.remove('file-dragging');});
document.addEventListener('drop',e=>{if(Array.from(e.dataTransfer.types).includes('Files')){e.preventDefault();$('drop-zone').classList.remove('file-dragging');addFiles([...e.dataTransfer.files]);}});
window.addEventListener('beforeunload',e=>{if(entries.length){e.preventDefault();e.returnValue='';}});
render();

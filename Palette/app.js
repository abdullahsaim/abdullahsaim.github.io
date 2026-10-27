/* Palette runs entirely in the browser. Images are sampled locally, never uploaded. */
(() => {
  const C=PaletteColor,$=id=>document.getElementById(id),KEY='palette-studio-v1',LIBRARY='palette-library-v1';
  const presets=[
    ['Lavender days',['#49365C','#8564A0','#B6A0D2','#D9C9DF','#F4E4D5']],
    ['Golden hour',['#563A45','#A05B58','#DC9470','#EDC397','#FAE8CB']],
    ['After midnight',['#15263C','#37546C','#668A9C','#AAD1CA','#E8EFDF']],
    ['Tidal pool',['#164C4E','#367C75','#76A89A','#BFCFB1','#F0E9D1']],
    ['Electric bloom',['#312050','#62449C','#A87BE0','#E9B6D5','#F5D86E']],
    ['Spiced earth',['#44372E','#85604C','#B98765','#D2B493','#EDE1CF']]
  ];
  let colors=presets[0][1].map(hex=>({hex,locked:false})),history=[],future=[],library=[],extracted=[],imageToken=0,toastTimer,storageWarning=false;
  let previewBg=4,previewAccent=1;
  const el=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
  const validColors=value=>Array.isArray(value)&&value.length>=1&&value.length<=8&&value.every(c=>typeof c==='string'&&C.hex(c));
  const snapshot=()=>colors.map(c=>({...c}));
  function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3300);}
  function storageError(){storageWarning=true;$('storage-note').textContent='Browser storage is unavailable or full. This session still works; export JSON to keep a copy.';}
  function persist(){try{localStorage.setItem(KEY,JSON.stringify({version:1,colors}));}catch{storageError();}}
  function remember(){history.push(snapshot());if(history.length>60)history.shift();future=[];}
  function change(next,message){remember();colors=next;render();persist();if(message)$('palette-status').textContent=message;}
  function load(){
    try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved?.version===1&&Array.isArray(saved.colors)&&validColors(saved.colors.map(c=>c?.hex)))colors=saved.colors.map(c=>({hex:C.hex(c.hex),locked:c.locked===true}));}catch{/* Invalid saved work is ignored. */}
    try{const saved=JSON.parse(localStorage.getItem(LIBRARY)||'[]');if(Array.isArray(saved))library=saved.filter(p=>p&&typeof p.id==='string'&&typeof p.name==='string'&&validColors(p.colors)).slice(0,50).map(p=>({id:p.id,name:p.name.slice(0,60),colors:p.colors.map(C.hex)}));}catch{storageError();}
  }
  function readRoute(){const raw=new URLSearchParams(location.hash.slice(1)).get('colors');if(!raw)return;const list=raw.split('-').map(s=>C.hex(s));if(!validColors(list)){toast('That palette link is invalid. Your existing palette is unchanged.');return;}colors=list.map(hex=>({hex,locked:false}));history=[];future=[];}
  async function copy(text,message='Copied. Ready for your next idea.'){
    try{await navigator.clipboard.writeText(text);toast(message);}catch{
      const field=el('textarea');field.value=text;field.className='clipboard-fallback';document.body.append(field);field.select();let ok=false;try{ok=document.execCommand('copy');}catch{}field.remove();toast(ok?message:'Clipboard unavailable. Open Export and select the code to copy it.');
    }
  }
  function render(){
    $('swatches').style.setProperty('--count',colors.length);$('swatches').replaceChildren(...colors.map((color,index)=>{
      const card=el('article',undefined,'swatch');card.style.background=color.hex;card.style.color=C.ink(color.hex);card.style.setProperty('--swatch-ink',C.ink(color.hex));
      const top=el('div',undefined,'swatch-top'),number=el('span',String(index+1).padStart(2,'0'),'swatch-number');
      const lock=el('button',color.locked?'◆ Locked':'◇ Lock','swatch-lock');lock.type='button';lock.setAttribute('aria-label',(color.locked?'Unlock':'Lock')+' color '+(index+1));lock.setAttribute('aria-pressed',String(color.locked));lock.addEventListener('click',()=>{change(colors.map((c,i)=>i===index?{...c,locked:!c.locked}:c),color.locked?'Color unlocked.':'Color locked. It will stay when you shuffle.');$('swatches').querySelectorAll('.swatch-lock')[index].focus();});
      top.append(number,lock);const bottom=el('div',undefined,'swatch-bottom');
      const value=el('button',C.format(color.hex,$('display-format').value),'swatch-value');value.setAttribute('aria-label','Copy color '+(index+1)+' '+C.format(color.hex,$('display-format').value));value.title='Copy color';value.addEventListener('click',()=>copy(C.format(color.hex,$('display-format').value),'Color copied.'));
      const detail=el('span',C.format(color.hex,'hsl'),'swatch-detail');
      const tools=el('div',undefined,'swatch-tools'),picker=el('input');picker.type='color';picker.value=color.hex;picker.setAttribute('aria-label','Pick color '+(index+1));picker.addEventListener('change',()=>change(colors.map((c,i)=>i===index?{...c,hex:C.hex(picker.value)}:c),'Color updated.'));
      const hex=el('input');hex.value=color.hex;hex.maxLength=7;hex.spellcheck=false;hex.setAttribute('aria-label','Hex for color '+(index+1));hex.title='Edit HEX, then press Enter';
      const commit=()=>{const value=C.hex(hex.value);if(!value){hex.setAttribute('aria-invalid','true');$('palette-status').textContent='Use a 3- or 6-digit HEX color, such as #B6A0D2.';return;}hex.removeAttribute('aria-invalid');if(value!==color.hex)change(colors.map((c,i)=>i===index?{...c,hex:value}:c),'Color updated.');else hex.value=value;};
      hex.addEventListener('change',commit);hex.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();commit();}});
      const remove=el('button','×','remove-color');remove.setAttribute('aria-label','Remove color '+(index+1));remove.disabled=colors.length<=2;remove.addEventListener('click',()=>change(colors.filter((_,i)=>i!==index),'Color removed.'));
      tools.append(picker,hex,remove);bottom.append(value,detail,tools);card.append(top,bottom);return card;
    }));
    $('studio').querySelector('h2').replaceChildren(document.createTextNode('A mood in '+(['zero','one','two','three','four','five','six','seven','eight'][colors.length])+' '+(colors.length===1?'color':'colors')),el('span','.'));
    $('undo').disabled=!history.length;$('redo').disabled=!future.length;$('add-color').disabled=colors.length>=8;
    paletteSelects();updatePreview();updateGradient();if($('export-dialog').open)updateExport();
  }
  function paletteSelects(){
    previewBg=Math.min(previewBg,colors.length-1);previewAccent=Math.min(previewAccent,colors.length-1);
    for(const id of ['preview-bg','preview-accent','fg-palette','bg-palette']){
      const select=$(id),isContrast=id.endsWith('palette');select.replaceChildren();
      if(isContrast){const option=el('option','Choose from your palette…');option.value='';select.append(option);}
      colors.forEach((c,i)=>{const option=el('option',String(i+1).padStart(2,'0')+' · '+c.hex);option.value=String(i);select.append(option);});
      select.value=isContrast?'':String(id==='preview-bg'?previewBg:previewAccent);
    }
  }
  function shuffle(useBase=false){
    if(colors.every(c=>c.locked)){toast('All colors are locked. Unlock one to explore a new combination.');return;}
    const anchor=colors.find(c=>c.locked)?.hex;
    const base=useBase?$('base-color').value:(anchor||C.fromHsl(Math.random()*360,45+Math.random()*25,55));
    $('base-color').value=base;$('base-hex').value=base;
    const generated=C.generate(base,$('harmony').value,colors.length);
    change(colors.map((c,i)=>c.locked?c:{hex:generated[i],locked:false}),'A fresh combination. Your locked colors stayed in place.');
  }
  function updatePreview(){
    const bg=colors[previewBg].hex,accent=colors[previewAccent].hex,site=$('mock-site');site.style.setProperty('--paper',bg);site.style.setProperty('--paper-ink',C.ink(bg));site.style.setProperty('--paint',accent);site.style.setProperty('--paint-ink',C.ink(accent));site.style.setProperty('--shape',colors[2%colors.length].hex);site.style.setProperty('--shape-alt',colors[3%colors.length].hex);
    $('preview-note').textContent='Preview text automatically switches to a readable dark or light color. Check your own pair in Contrast check.';
  }
  const gradient=()=>`linear-gradient(${$('angle').value}deg, ${colors.map(c=>c.hex).join(', ')})`;
  function updateGradient(){$('gradient-preview').style.background=gradient();$('angle-value').textContent=$('angle').value+'°';}
  function setTab(name,focus=false){
    for(const tab of document.querySelectorAll('[data-tab]')){const active=tab.dataset.tab===name;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;$('view-'+tab.dataset.tab).hidden=!active;if(active&&focus)tab.focus();}
    if(name==='library')renderLibrary();
  }
  function paletteCard(name,values,apply,remove){const card=el('article',undefined,'palette-card'),button=el('button');button.className='palette-card-open';button.setAttribute('aria-label','Use palette '+name);const strip=el('span',undefined,'mini-palette');for(const hex of values){const chip=el('i');chip.style.background=hex;strip.append(chip);}const label=el('span',undefined,'palette-card-label');label.append(el('strong',name),el('span',values.length+' COLORS ↗'));button.append(strip,label);button.addEventListener('click',apply);card.append(button);if(remove){const del=el('button','×','delete-palette');del.setAttribute('aria-label','Delete saved palette '+name);del.addEventListener('click',remove);card.append(del);}return card;}
  function usePalette(values,name){change(values.map(hex=>({hex,locked:false})),'Now exploring “'+name+'”.');setTab('preview');$('studio').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
  function writeLibrary(){try{localStorage.setItem(LIBRARY,JSON.stringify(library));return true;}catch{storageError();return false;}}
  function renderLibrary(){
    $('presets').replaceChildren(...presets.map(([name,values])=>paletteCard(name,values,()=>usePalette(values,name))));
    $('saved-count').textContent=library.length;
    $('saved-palettes').replaceChildren(...library.map(p=>paletteCard(p.name,p.colors,()=>usePalette(p.colors,p.name),()=>{
      const old=library.slice();library=library.filter(x=>x.id!==p.id);if(!writeLibrary()){library=old;toast('Could not update browser storage. Your palette remains saved.');return;}renderLibrary();toast('Saved palette removed. Your working palette is unchanged.');
    })));
    if(!library.length)$('saved-palettes').append(el('p','Nothing saved just yet. Find a combination you love, then make it a keeper.','empty-library'));
  }
  function saveOpen(){$('save-error').textContent='';$('palette-name').value='';$('save-dialog').showModal();}
  $('save-open').addEventListener('click',saveOpen);$('save-library').addEventListener('click',saveOpen);
  $('save-form').addEventListener('submit',e=>{e.preventDefault();const name=$('palette-name').value.trim();if(!name){$('save-error').textContent='Give your palette a name first.';return;}if(library.length>=50){$('save-error').textContent='Your collection has 50 palettes. Export or remove one to make room.';return;}const saved={id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),name:name.slice(0,60),colors:colors.map(c=>c.hex)};library.unshift(saved);if(!writeLibrary()){library.shift();$('save-error').textContent='Browser storage is unavailable or full. Export JSON to keep this palette.';return;}$('save-dialog').close();renderLibrary();toast('“'+saved.name+'” saved to your collection.');});
  function updateContrast(){
    const fg=$('fg-color').value,bg=$('bg-color').value,ratio=C.contrast(fg,bg);$('contrast-ratio').textContent=ratio.toFixed(2)+':1';$('contrast-sample').style.color=fg;$('contrast-sample').style.background=bg;
    $('contrast-checks').replaceChildren(...[['AA · Regular text',4.5],['AA · Large text',3],['AAA · Regular text',7],['AAA · Large text',4.5],['UI / graphical elements',3]].map(([label,threshold])=>{const row=el('div'),pass=ratio>=threshold;row.append(el('span',label),el('span',(pass?'✓ Pass':'× Fail')+' · '+threshold+':1',pass?'pass':'fail'));return row;}));
  }
  for(const prefix of ['fg','bg']){
    $(prefix+'-color').addEventListener('input',()=>{$(prefix+'-hex').value=$(prefix+'-color').value.toUpperCase();$(prefix+'-hex').removeAttribute('aria-invalid');updateContrast();});
    $(prefix+'-hex').addEventListener('input',()=>{const value=C.hex($(prefix+'-hex').value);$(prefix+'-hex').setAttribute('aria-invalid',String(!value));if(value){$(prefix+'-color').value=value;updateContrast();}});
    $(prefix+'-hex').addEventListener('change',()=>{const value=C.hex($(prefix+'-hex').value);if(value)$(prefix+'-hex').value=value;else toast('Enter a valid 3- or 6-digit HEX color. Contrast still uses the last valid color.');});
    $(prefix+'-palette').addEventListener('change',()=>{const value=$(prefix+'-palette').value;if(value==='')return;$(prefix+'-color').value=colors[Number(value)].hex;$(prefix+'-hex').value=colors[Number(value)].hex;$(prefix+'-hex').removeAttribute('aria-invalid');updateContrast();});
  }
  $('swap').addEventListener('click',()=>{const fg=$('fg-color').value;$('fg-color').value=$('bg-color').value;$('bg-color').value=fg;for(const p of ['fg','bg']){$(p+'-hex').value=$(p+'-color').value.toUpperCase();$(p+'-hex').removeAttribute('aria-invalid');}updateContrast();});
  $('fix-contrast').addEventListener('click',()=>{const bg=$('bg-color').value,value=C.contrast(bg,'#000000')>C.contrast(bg,'#FFFFFF')?'#000000':'#FFFFFF';$('fg-color').value=value;$('fg-hex').value=value;$('fg-hex').removeAttribute('aria-invalid');updateContrast();toast('Readable text suggested. Check the updated contrast results.');});
  function exportText(){const type=$('export-format').value;if(type==='css')return ':root {\n'+colors.map((c,i)=>'  --color-'+(i+1)+': '+c.hex+';').join('\n')+'\n}\n\n.palette-gradient {\n  background: '+gradient()+';\n}';if(type==='json')return JSON.stringify({version:1,name:'My Palette',colors:colors.map(c=>c.hex)},null,2);if(type==='svg'){const width=240*colors.length;return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="360" viewBox="0 0 ${width} 360"><title>Palette color swatches</title>${colors.map((c,i)=>`<rect x="${i*240}" width="240" height="360" fill="${c.hex}"/><text x="${i*240+24}" y="325" fill="${C.ink(c.hex)}" font-family="Arial,sans-serif" font-size="22">${c.hex}</text>`).join('')}</svg>`;}return 'PNG swatch sheet · '+(240*colors.length)+' × 360 px\n\n'+colors.map(c=>c.hex).join('  ');}
  function updateExport(){const png=$('export-format').value==='png';$('export-code').value=exportText();$('copy-export').disabled=png;$('export-note').textContent=png?'Download a rendered image of your palette.':'Select and copy the code, or download a file.';}
  function download(blob,name){const url=URL.createObjectURL(blob),link=el('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  $('export-open').addEventListener('click',()=>{updateExport();$('export-dialog').showModal();});$('export-format').addEventListener('change',updateExport);$('copy-export').addEventListener('click',()=>copy(exportText()));
  $('download-export').addEventListener('click',()=>{const type=$('export-format').value;if(type==='png'){const canvas=document.createElement('canvas');canvas.width=240*colors.length;canvas.height=360;const ctx=canvas.getContext('2d');colors.forEach((c,i)=>{ctx.fillStyle=c.hex;ctx.fillRect(i*240,0,240,360);ctx.fillStyle=C.ink(c.hex);ctx.font='22px Arial';ctx.fillText(c.hex,i*240+24,325);});canvas.toBlob(blob=>{if(blob){download(blob,'palette.png');toast('Palette PNG ready.');}else toast('Image export failed. Try SVG instead.');},'image/png');return;}download(new Blob([exportText()],{type:{css:'text/css',json:'application/json',svg:'image/svg+xml'}[type]}),'palette.'+type);toast('Your palette is ready to go.');});
  $('import-file').addEventListener('change',async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;if(file.size>100000){toast('Choose a palette JSON file smaller than 100 KB.');return;}try{const data=JSON.parse(await file.text());if(data.version!==1||!validColors(data.colors))throw Error();usePalette(data.colors.map(C.hex),typeof data.name==='string'?data.name.slice(0,60):'Imported palette');toast('Palette imported. Save it to keep it in your collection.');}catch{toast('This file is not a supported palette. Export Palette JSON, then import that file.');}});
  function drawImage(source,name){
    const canvas=$('image-preview'),scale=Math.min(1,800/source.width,500/source.height);canvas.width=Math.max(1,Math.round(source.width*scale));canvas.height=Math.max(1,Math.round(source.height*scale));const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(source,0,0,canvas.width,canvas.height);
    const sample=document.createElement('canvas'),factor=Math.min(1,160/source.width,160/source.height);sample.width=Math.max(1,Math.round(source.width*factor));sample.height=Math.max(1,Math.round(source.height*factor));const sampleCtx=sample.getContext('2d',{willReadFrequently:true});sampleCtx.drawImage(source,0,0,sample.width,sample.height);extracted=C.extract(sampleCtx.getImageData(0,0,sample.width,sample.height).data,5);
    $('image-name').textContent=name;$('image-count').textContent=extracted.length+' COLORS';$('extracted-colors').replaceChildren(...extracted.map(hex=>{const b=el('button',hex);b.style.background=hex;b.style.color=C.ink(hex);b.setAttribute('aria-label','Copy extracted color '+hex);b.addEventListener('click',()=>copy(hex));return b;}));$('use-image').disabled=!extracted.length;$('image-status').textContent=extracted.length?'Dominant colors, sampled from your image. Click a color to copy it.':'This image has no sufficiently opaque pixels to extract.';
  }
  async function openImage(file){
    if(!file)return;const token=++imageToken;
    if(!/^image\/(png|jpeg|webp|avif|gif)$/.test(file.type)){toast('Choose a PNG, JPEG, WebP, AVIF or GIF image.');return;}
    if(file.size>20*1024*1024){toast('Choose an image up to 20 MB.');return;}
    $('image-status').textContent='Finding the colors in your image…';const url=URL.createObjectURL(file);
    try{const image=new Image();image.src=url;await image.decode();if(token!==imageToken)return;if(image.naturalWidth*image.naturalHeight>24000000)throw Error('That image is larger than 24 megapixels. Resize it in Canvas first.');drawImage(image,file.name);}catch(error){if(token===imageToken){$('image-status').textContent=error.message?.startsWith('That image')?error.message:'This image could not be opened. Try another image or format.';toast($('image-status').textContent);}}finally{URL.revokeObjectURL(url);}
  }
  $('choose-image').addEventListener('click',()=>$('image-file').click());$('image-file').addEventListener('change',e=>{openImage(e.target.files[0]);e.target.value='';});
  $('sample-image').addEventListener('click',()=>{imageToken++;const canvas=document.createElement('canvas');canvas.width=800;canvas.height=500;const ctx=canvas.getContext('2d');ctx.fillStyle='#F0DBC4';ctx.fillRect(0,0,800,500);ctx.fillStyle='#BA7864';ctx.fillRect(80,160,340,340);ctx.fillStyle='#506C63';ctx.beginPath();ctx.arc(600,250,180,0,Math.PI*2);ctx.fill();ctx.fillStyle='#E4AD72';ctx.beginPath();ctx.arc(410,90,95,0,Math.PI*2);ctx.fill();ctx.fillStyle='#473C51';ctx.fillRect(210,300,120,200);drawImage(canvas,'Still life · A local sample');});
  $('use-image').addEventListener('click',()=>{if(extracted.length)usePalette(extracted,'Image colors');});
  for(const event of ['dragenter','dragover'])$('drop-zone').addEventListener(event,e=>{e.preventDefault();$('drop-zone').classList.add('dragging');});
  $('drop-zone').addEventListener('dragleave',e=>{if(!$('drop-zone').contains(e.relatedTarget))$('drop-zone').classList.remove('dragging');});$('drop-zone').addEventListener('drop',e=>{e.preventDefault();$('drop-zone').classList.remove('dragging');openImage(e.dataTransfer.files[0]);});
  $('generate').addEventListener('click',()=>shuffle());$('harmony').addEventListener('change',()=>shuffle(true));
  $('base-color').addEventListener('change',()=>{$('base-hex').value=$('base-color').value.toUpperCase();$('base-hex').removeAttribute('aria-invalid');shuffle(true);});
  $('base-hex').addEventListener('change',()=>{const color=C.hex($('base-hex').value);if(!color){$('base-hex').setAttribute('aria-invalid','true');toast('Use a 3- or 6-digit HEX color.');return;}$('base-hex').removeAttribute('aria-invalid');$('base-hex').value=color;$('base-color').value=color;shuffle(true);});
  $('undo').addEventListener('click',()=>{if(!history.length)return;future.push(snapshot());colors=history.pop();render();persist();$('palette-status').textContent='Previous palette restored.';});$('redo').addEventListener('click',()=>{if(!future.length)return;history.push(snapshot());colors=future.pop();render();persist();$('palette-status').textContent='Palette change reapplied.';});
  $('add-color').addEventListener('click',()=>{if(colors.length<8)change([...colors,{hex:C.fromHsl(Math.random()*360,50,65),locked:false}],'A new color joins the combination.');});
  $('display-format').addEventListener('change',render);$('angle').addEventListener('input',updateGradient);$('copy-gradient').addEventListener('click',()=>copy('background: '+gradient()+';','Gradient CSS copied.'));
  $('preview-bg').addEventListener('change',()=>{previewBg=Number($('preview-bg').value);updatePreview();});$('preview-accent').addEventListener('change',()=>{previewAccent=Number($('preview-accent').value);updatePreview();});
  $('share').addEventListener('click',()=>{const url=new URL(location.href);url.hash='colors='+colors.map(c=>c.hex.slice(1)).join('-');historyReplace(url);copy(url.href,'Palette link copied. Anyone with it can open these colors.');});
  function historyReplace(url){window.history.replaceState(null,'',url);}
  for(const tab of document.querySelectorAll('[data-tab]')){tab.addEventListener('click',()=>setTab(tab.dataset.tab));tab.addEventListener('keydown',e=>{const tabs=[...document.querySelectorAll('[data-tab]')],index=tabs.indexOf(tab);if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowLeft'?-1:1)+tabs.length)%tabs.length;setTab(tabs[next].dataset.tab,true);}});}
  for(const button of document.querySelectorAll('[data-close]'))button.addEventListener('click',()=>$(button.dataset.close).close());
  document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||e.altKey||/INPUT|TEXTAREA|SELECT|BUTTON|SUMMARY|A/.test(document.activeElement.tagName)||document.activeElement.isContentEditable)return;if(e.code==='Space'&&!e.ctrlKey&&!e.metaKey){e.preventDefault();shuffle();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();$(e.shiftKey?'redo':'undo').click();}});
  window.addEventListener('hashchange',()=>{readRoute();render();});
  load();readRoute();render();renderLibrary();updateContrast();if(storageWarning)storageError();
})();

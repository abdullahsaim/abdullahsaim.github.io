const $=id=>document.getElementById(id);
let current='Length';
const selections={};
const format=value=>new Intl.NumberFormat('en-US',{maximumSignificantDigits:10}).format(value);
const compact=value=>value!==0&&(Math.abs(value)<.000001||Math.abs(value)>=1e12)?value.toExponential(7).replace(/\.?0+e/,'e'):format(value);
function notify(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('toast').hidden=true,2500)}
function render(){
  const raw=$('amount').value;
  let result;
  try{if(raw.trim()==='')throw Error('Enter a value to start converting.');result=convert(Number(raw),$('from').value,$('to').value,current);$('input-error').textContent='';$('amount').removeAttribute('aria-invalid')}
  catch(error){$('result').textContent='—';$('equation').textContent='Your conversion will appear here.';$('input-error').textContent=error.message;$('amount').setAttribute('aria-invalid','true');$('copy').disabled=true;$('unit-list').replaceChildren();return}
  $('result').textContent=compact(result);$('copy').disabled=false;
  $('equation').textContent=`${compact(Number(raw))} ${$('from').value} = ${compact(result)} ${$('to').value}`;
  selections[current]=[$('from').value,$('to').value];
  $('unit-list').replaceChildren(...categories[current].units.map(unit=>{const row=document.createElement('div');row.className='unit-row';const label=document.createElement('span');label.textContent=unit[1];const value=document.createElement('strong');try{value.textContent=`${compact(convert(Number(raw),$('from').value,unit[0],current))} ${unit[0]}`}catch{value.textContent='Out of range'}row.append(label,value);return row}));
}
function selectCategory(name){
  current=name;const category=categories[name];$('category-title').textContent=name;$('category-icon').textContent=category.icon;
  document.querySelectorAll('[data-category]').forEach(button=>{const active=button.dataset.category===name;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
  for(const id of ['from','to'])$(''+id).replaceChildren(...category.units.map(unit=>{const option=document.createElement('option');option.value=unit[0];option.textContent=`${unit[1]} (${unit[0]})`;return option}));
  const pair=selections[name]||category.defaults;$('from').value=pair[0];$('to').value=pair[1];
  $('presets').replaceChildren(...category.presets.map(([label,from,to])=>{const button=document.createElement('button');button.textContent=label;button.addEventListener('click',()=>{$('from').value=from;$('to').value=to;render()});return button}));render();
}
$('categories').replaceChildren(...Object.entries(categories).map(([name,category])=>{const button=document.createElement('button');button.dataset.category=name;button.innerHTML=`<span aria-hidden="true">${category.icon}</span>${name}<span class="nav-arrow" aria-hidden="true">↗</span>`;button.addEventListener('click',()=>selectCategory(name));return button}));
$('amount').addEventListener('input',render);for(const id of ['from','to'])$(id).addEventListener('change',render);
$('swap').addEventListener('click',()=>{const from=$('from').value;$('from').value=$('to').value;$('to').value=from;render()});
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('result').textContent+' '+$('to').value);notify('Result copied.')}catch{notify('Copy unavailable. Select the result to copy it.')}});
selectCategory(current);

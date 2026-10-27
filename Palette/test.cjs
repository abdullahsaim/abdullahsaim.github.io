const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const context=vm.createContext({});vm.runInContext(fs.readFileSync(path.join(__dirname,'color.js'),'utf8')+';this.C=PaletteColor',context);const C=context.C;
assert.equal(C.hex('abc'),'#AABBCC');assert.equal(C.hex(' #a0b1c2 '),'#A0B1C2');
for(const input of ['#abcd','red','#00000000','fff000;','',null,'<script>'])assert.equal(C.hex(input),null);
assert.equal(C.contrast('#000000','#FFFFFF'),21);assert.equal(C.contrast('#ABCDEF','#ABCDEF'),1);
assert.ok(C.contrast('#777777','#FFFFFF')<4.5);assert.ok(C.contrast('#767676','#FFFFFF')>=4.5);
for(let r=0;r<=255;r+=17)for(let g=0;g<=255;g+=17)for(let b=0;b<=255;b+=17){const color=C.fromRgb([r,g,b]);assert.equal(C.fromHsl(...C.hsl(color)),color);assert.ok(C.contrast(color,C.ink(color))>=4.5);assert.equal(C.contrast(color,'#123456'),C.contrast('#123456',color));}
for(const scheme of ['analogous','complementary','triadic','split','monochrome'])for(let count=1;count<=8;count++){const colors=C.generate('#9270DB',scheme,count,()=>.5);assert.equal(colors.length,count);assert.ok(colors.every(c=>C.hex(c)===c));}
assert.equal(C.extract(new Uint8ClampedArray([255,0,0,0,0,255,0,0])).length,0);
assert.equal(C.extract(new Uint8ClampedArray([255,0,0,255,255,0,0,255]))[0],'#FF0000');
const pixels=new Uint8ClampedArray(400);for(let i=0;i<100;i++)pixels.set(i<70?[255,0,0,255]:[0,0,255,255],i*4);
const extracted=C.extract(pixels);assert.equal(extracted.length,2);assert.equal(extracted[0],'#FF0000');assert.equal(extracted[1],'#0000FF');
assert.equal(C.extract(new Uint8ClampedArray([0,0,255,0,255,0,0,255]))[0],'#FF0000');
for(const file of ['app.js','color.js'])new vm.Script(fs.readFileSync(path.join(__dirname,file),'utf8'),{filename:file});
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),app=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));for(const match of app.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.has(match[1]),'Missing DOM ID: '+match[1]);
const css=fs.readFileSync(path.join(__dirname,'style.css'),'utf8');assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length);
console.log('Passed: 4,096 RGB/HSL round trips and readable ink pairs, known contrast boundaries, five harmony schemes, alpha handling, dominant-color extraction, script syntax, UI hooks and CSS structure.');

const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=__dirname,context=vm.createContext({console,setTimeout,clearTimeout,setImmediate,clearImmediate,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer,assert});
for(const file of ['vendor/pdf-lib.min.js','vendor/jszip.min.js','core.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
vm.runInContext(`this.tests=(async()=>{
  const C=FolioCore,eq=(a,b)=>assert.equal(JSON.stringify(a),JSON.stringify(b));
  eq(C.parseRange('1-3, 5, 3',5),[0,1,2,4]);
  for(const text of ['','0','2-1','1-6','1,,2','1.5','x','1-999999999999999999999'])assert.throws(()=>C.parseRange(text,5));
  assert.equal(C.rotation(-90),270);assert.equal(C.rotation(450),90);
  assert.equal(C.filename('../../test.pdf'),'..-..-test');assert.equal(C.filename('   '),'folio-document');
  eq(C.move([{id:'a'},{id:'b'},{id:'c'}],'a','c').map(x=>x.id),['b','c','a']);
  const make=async(letter,count,width,height)=>{const doc=await PDFLib.PDFDocument.create(),font=await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);for(let i=0;i<count;i++){const page=doc.addPage([width+i*10,height+i*20]);page.drawRectangle({x:0,y:0,width:page.getWidth(),height:page.getHeight(),color:PDFLib.rgb(.96,.93,.87)});page.drawText(letter+' / PAGE '+(i+1),{x:40,y:height-90,size:28,font,color:PDFLib.rgb(.24,.28,.3)});page.drawText('Folio verification document',{x:40,y:height-135,size:12,font,color:PDFLib.rgb(.4,.4,.4)});if(letter==='A'&&i===1)page.setRotation(PDFLib.degrees(90));}return {doc,bytes:await doc.save()};};
  const a=await make('A',3,400,600),b=await make('B',2,500,700),sources=new Map([['a',a],['b',b]]);
  const entries=[{id:'1',sourceId:'b',index:0,rotation:0},{id:'2',sourceId:'a',index:1,rotation:90},{id:'3',sourceId:'a',index:0,rotation:0},{id:'4',sourceId:'a',index:1,rotation:180}];
  const merged=await C.build(entries,sources,'Verification'),out=await PDFLib.PDFDocument.load(merged);assert.equal(out.getPageCount(),4);eq(out.getPages().map(p=>p.getWidth()),[500,410,400,410]);eq(out.getPages().map(p=>p.getRotation().angle),[0,180,0,270]);assert.equal(a.doc.getPage(1).getRotation().angle,90);
  const extracted=await C.build([entries[1],entries[3]],sources),extractDoc=await PDFLib.PDFDocument.load(extracted);assert.equal(extractDoc.getPageCount(),2);eq(extractDoc.getPages().map(p=>p.getRotation().angle),[180,270]);
  const zip=new JSZip();for(let i=0;i<entries.length;i++)zip.file('page-'+i+'.pdf',await C.build([entries[i]],sources));const zipBytes=await zip.generateAsync({type:'uint8array'}),reopened=await JSZip.loadAsync(zipBytes);assert.equal(Object.keys(reopened.files).length,4);for(const file of Object.values(reopened.files)){const doc=await PDFLib.PDFDocument.load(await file.async('uint8array'));assert.equal(doc.getPageCount(),1);}
  const form=await PDFLib.PDFDocument.create(),page=form.addPage();form.getForm().createTextField('name').addToPage(page);const formBytes=await form.save();await assert.rejects(()=>C.load(formBytes),/Interactive forms/);
  await assert.rejects(()=>C.load(new Uint8Array([1,2,3])),/could not be read/);await assert.rejects(()=>C.build([],sources),/at least one/);

  return {merged,extracted,zipBytes,a:a.bytes,b:b.bytes,form:formBytes};
})();`,context);
(async()=>{
  const result=await context.tests;
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),app=fs.readFileSync(path.join(root,'app.js'),'utf8'),ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
  for(const match of app.matchAll(/\$\('([^']+)'\)/g))if(match[1]!=='studio-busy')assert.ok(ids.has(match[1]),'Missing UI hook '+match[1]);
  new vm.Script(app.replace(/^import .*?;\n/,'').replace(/import\.meta\.url/g,'"http://localhost/PDF/app.js"'));
  const css=fs.readFileSync(path.join(root,'style.css'),'utf8');assert.equal((css.match(/{/g)||[]).length,(css.match(/}/g)||[]).length);
  if(process.env.FOLIO_TEST_OUTPUT){const out=path.resolve(process.env.FOLIO_TEST_OUTPUT);fs.mkdirSync(out,{recursive:true});for(const [key,name] of [['a','source-a.pdf'],['b','source-b.pdf'],['merged','merged.pdf'],['extracted','extracted.pdf'],['zipBytes','split.zip'],['form','form.pdf']])fs.writeFileSync(path.join(out,name),result[key]);}
  console.log('Passed range validation, reorder, merge order, cumulative rotation, original preservation, selection extraction, split ZIP contents, form/corrupt-file rejection, UI hooks and CSS structure.');
})().catch(error=>{console.error(error);process.exitCode=1;});

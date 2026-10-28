/* Document operations are separate from the page board and never upload bytes. */
const FolioCore = (() => {
  const LIMITS={fileBytes:25*1024*1024,totalBytes:60*1024*1024,pages:200,files:20,imagePixels:24000000};
  function parseRange(text,count){
    if(!String(text).trim())throw Error('Enter page numbers, for example 1-3, 5, 8.');
    const found=new Set();
    for(const part of String(text).split(',')){
      const token=part.trim(),match=token.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if(!match)throw Error('Use page numbers and ascending ranges, such as 1-3, 5.');
      const start=Number(match[1]),end=Number(match[2]||match[1]);
      if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<1||end<start||end>count)throw Error('Page numbers must be between 1 and '+count+', with ranges in ascending order.');
      for(let i=start;i<=end;i++)found.add(i-1);
    }
    return [...found].sort((a,b)=>a-b);
  }
  const rotation=value=>((value%360)+360)%360;
  const filename=value=>String(value||'folio-document').normalize('NFKC').replace(/\.pdf$/i,'').replace(/[<>:"/\\|?*\x00-\x1f]/g,'-').replace(/[. ]+$/g,'').trim().slice(0,90)||'folio-document';
  function move(entries,id,targetId){const from=entries.findIndex(p=>p.id===id),to=entries.findIndex(p=>p.id===targetId);if(from<0||to<0||from===to)return entries.slice();const result=entries.slice(),[entry]=result.splice(from,1);result.splice(to,0,entry);return result;}
  async function load(bytes){
    let doc;
    try{doc=await PDFLib.PDFDocument.load(bytes,{updateMetadata:false});}
    catch(error){if(/encrypt|password/i.test(error.message))throw Error('Password-protected PDFs are not supported. Add an unprotected copy.');throw Error('This PDF could not be read. It may be damaged or unsupported.');}
    try{if(doc.getForm().getFields().length)throw Error('Interactive forms and signature fields are not supported. Add a flattened copy made in your PDF editor.');}
    catch(error){if(error.message.startsWith('Interactive'))throw error;throw Error('This PDF has an unsupported form structure.');}
    if(!doc.getPageCount())throw Error('This PDF has no pages.');
    return doc;
  }
  async function imageDocument(bytes,mime,width,height){
    const doc=await PDFLib.PDFDocument.create(),image=mime==='image/jpeg'?await doc.embedJpg(bytes):await doc.embedPng(bytes);
    const landscape=width>height,[w,h]=landscape?[841.89,595.28]:[595.28,841.89],margin=28.35;
    const scale=Math.min((w-margin*2)/image.width,(h-margin*2)/image.height),page=doc.addPage([w,h]);
    page.drawRectangle({x:0,y:0,width:w,height:h,color:PDFLib.rgb(1,1,1)});
    page.drawImage(image,{x:(w-image.width*scale)/2,y:(h-image.height*scale)/2,width:image.width*scale,height:image.height*scale});
    return doc;
  }
  async function build(entries,sources,title='Folio document'){
    if(!entries.length)throw Error('Choose at least one page to export.');
    const output=await PDFLib.PDFDocument.create();
    for(const entry of entries){
      const source=sources.get(entry.sourceId);if(!source)throw Error('A source document is unavailable. Add it again.');
      const [page]=await output.copyPages(source.doc,[entry.index]);
      page.setRotation(PDFLib.degrees(rotation(page.getRotation().angle+entry.rotation)));
      output.addPage(page);
    }
    output.setTitle(String(title).slice(0,150));output.setCreator('Folio - PDF Studio');
    return output.save();
  }
  return {LIMITS,parseRange,rotation,filename,move,load,imageDocument,build};
})();

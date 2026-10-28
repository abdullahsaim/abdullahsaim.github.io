/* Shared validation for browser-local batch image conversion. */
const CanvasConversion=(()=>{
  const formats={'image/png':{extension:'png',label:'PNG'},'image/jpeg':{extension:'jpg',label:'JPG'},'image/webp':{extension:'webp',label:'WebP'}};
  const limits={files:20,fileBytes:30*1024*1024,totalBytes:60*1024*1024,outputBytes:100*1024*1024,pixels:24000000,side:8192};
  function dimensions(width,height,resize,edge){
    if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width*height>limits.pixels)throw Error('Choose an image up to 24 megapixels.');
    let scale=1;if(resize==='fit'){if(!Number.isInteger(edge)||edge<1||edge>limits.side)throw Error('Use a whole-number longest edge between 1 and 8192 pixels.');scale=Math.min(1,edge/Math.max(width,height));}
    const w=Math.max(1,Math.round(width*scale)),h=Math.max(1,Math.round(height*scale));
    if(Math.max(w,h)>limits.side)throw Error('This image has an edge over 8192 px. Choose “Fit longest edge” to resize it.');
    return {width:w,height:h};
  }
  function basename(name){return String(name).replace(/\.[^.]+$/,'').normalize('NFKC').replace(/[<>:"/\\|?*\x00-\x1f]/g,'-').replace(/[. ]+$/g,'').trim().slice(0,90)||'image';}
  function outputName(name,type,used=new Set()){
    if(!formats[type])throw Error('Choose PNG, JPG or WebP.');const base=basename(name)+'-converted',extension=formats[type].extension;let value=base+'.'+extension,index=2;
    while(used.has(value.toLowerCase()))value=base+'-'+(index++)+'.'+extension;
    used.add(value.toLowerCase());return value;
  }
  function accepted(file){return /^image\/(png|jpeg|webp|avif|gif|bmp|x-ms-bmp)$/i.test(file.type)||/\.(png|jpe?g|webp|avif|gif|bmp)$/i.test(file.name);}
  return {formats,limits,dimensions,basename,outputName,accepted};
})();

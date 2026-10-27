/* Pure sRGB color math. Contrast follows WCAG relative luminance. */
const PaletteColor = (() => {
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  function hex(value){const s=String(value).trim().replace(/^#/,'');return /^[a-f\d]{6}$/i.test(s)?'#'+s.toUpperCase():/^[a-f\d]{3}$/i.test(s)?'#'+[...s].map(c=>c+c).join('').toUpperCase():null;}
  function rgb(value){const s=hex(value);if(!s)throw Error('Invalid color');return [1,3,5].map(i=>parseInt(s.slice(i,i+2),16));}
  const fromRgb=values=>'#'+values.map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('').toUpperCase();
  function hsl(value){let [r,g,b]=rgb(value).map(v=>v/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min,l=(max+min)/2,h=0,s=0;if(d){s=d/(1-Math.abs(2*l-1));h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;h=((h*60)%360+360)%360;}return [h,s*100,l*100];}
  function fromHsl(h,s,l){h=((h%360)+360)%360;s=clamp(s,0,100)/100;l=clamp(l,0,100)/100;const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;const v=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return fromRgb(v.map(n=>(n+m)*255));}
  function luminance(value){return rgb(value).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);}
  function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
  const ink=color=>contrast(color,'#FFFFFF')>contrast(color,'#000000')?'#FFFFFF':'#000000';
  function format(color,type){return type==='rgb'?'rgb('+rgb(color).join(', ')+')':type==='hsl'?'hsl('+hsl(color).map(v=>Math.round(v)).map((v,i)=>v+(i?'%':'')).join(', ')+')':hex(color);}
  function generate(base,mode,count=5,rng=Math.random){const [h,s]=hsl(base),offsets={analogous:[-36,-18,0,18,36,54,72,90],complementary:[0,180,0,180,0,180,0,180],triadic:[0,120,240,0,120,240,0,120],split:[0,150,210,0,150,210,0,150],monochrome:[0,0,0,0,0,0,0,0]};return Array.from({length:count},(_,i)=>fromHsl(h+(offsets[mode]||offsets.analogous)[i],clamp(s+(rng()-.5)*20,28,88),clamp(23+i*(61/Math.max(1,count-1))+(rng()-.5)*7,15,90)));}
  function extract(pixels,count=5){
    // Alpha-weighted color bins followed by deterministic weighted k-means.
    const bins=new Map();
    for(let i=0;i<pixels.length;i+=4){const weight=pixels[i+3]/255;if(weight<.1)continue;const key=(pixels[i]>>4)*256+(pixels[i+1]>>4)*16+(pixels[i+2]>>4);let bin=bins.get(key);if(!bin){bin={sum:[0,0,0],weight:0};bins.set(key,bin);}bin.weight+=weight;for(let j=0;j<3;j++)bin.sum[j]+=pixels[i+j]*weight;}
    const points=[...bins.values()].map(b=>({rgb:b.sum.map(x=>x/b.weight),weight:b.weight})).sort((a,b)=>b.weight-a.weight);
    if(!points.length)return [];
    const distance=(a,b)=>a.reduce((n,v,i)=>n+(v-b[i])**2,0),centers=[points[0].rgb.slice()];
    while(centers.length<Math.min(count,points.length)){let best=null,score=-1;for(const p of points){const d=Math.min(...centers.map(c=>distance(p.rgb,c)));const next=d*Math.sqrt(p.weight);if(next>score){score=next;best=p;}}if(score<=0)break;centers.push(best.rgb.slice());}
    let weights=[];
    for(let step=0;step<14;step++){const sums=centers.map(()=>[0,0,0]);weights=centers.map(()=>0);for(const p of points){let nearest=0;for(let i=1;i<centers.length;i++)if(distance(p.rgb,centers[i])<distance(p.rgb,centers[nearest]))nearest=i;weights[nearest]+=p.weight;for(let j=0;j<3;j++)sums[nearest][j]+=p.rgb[j]*p.weight;}centers.forEach((c,i)=>{if(weights[i])centers[i]=sums[i].map(n=>n/weights[i]);});}
    return [...new Set(centers.map((c,i)=>({color:fromRgb(c),weight:weights[i]})).sort((a,b)=>b.weight-a.weight).map(x=>x.color))];
  }
  return {hex,rgb,fromRgb,hsl,fromHsl,luminance,contrast,ink,format,generate,extract};
})();

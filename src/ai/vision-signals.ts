import {validateDimensions} from './images';

export interface VisualSignalProfile{
 width:number;height:number;sampledWidth:number;sampledHeight:number;
 luminance:number;contrast:number;edgeDensity:number;ocrReadiness:number;
 exposure:'underexposed'|'balanced'|'overexposed';dominantTone:string;notes:string[];
}

const clamp=(value:number)=>Math.max(0,Math.min(100,Math.round(value)));

export function analyzeVisualSignal(data:Uint8ClampedArray,width:number,height:number):VisualSignalProfile{
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||data.length!==width*height*4)throw new Error('Pixel buffer dimensions do not match the supplied image.');
 const pixels=width*height;let sum=0,squares=0,red=0,green=0,blue=0,edges=0,comparisons=0;
 const luma=new Float32Array(pixels);
 for(let index=0;index<pixels;index++){
  const offset=index*4;const r=data[offset],g=data[offset+1],b=data[offset+2];const value=.2126*r+.7152*g+.0722*b;
  luma[index]=value;sum+=value;squares+=value*value;red+=r;green+=g;blue+=b;
  const x=index%width;if(x>0){comparisons++;if(Math.abs(value-luma[index-1])>=24)edges++}
  if(index>=width){comparisons++;if(Math.abs(value-luma[index-width])>=24)edges++}
 }
 const mean=sum/pixels;const deviation=Math.sqrt(Math.max(0,squares/pixels-mean*mean));const luminance=clamp(mean/2.55);const contrast=clamp(deviation/1.275);const edgeDensity=clamp(edges/Math.max(1,comparisons)*100);
 const averages=[red/pixels,green/pixels,blue/pixels];const spread=Math.max(...averages)-Math.min(...averages);const dominantTone=spread<14?'neutral':averages[0]===Math.max(...averages)?(averages[1]>averages[2]?'warm':'magenta'):averages[1]===Math.max(...averages)?(averages[0]>.75*averages[2]?'yellow-green':'green'):'cool';
 const exposure=luminance<28?'underexposed':luminance>82?'overexposed':'balanced';
 const exposurePenalty=Math.abs(luminance-55)*.72;const ocrReadiness=clamp(46+contrast*.72+Math.min(edgeDensity,28)*.72-exposurePenalty);
 const notes:string[]=[];
 if(exposure==='underexposed')notes.push('Low luminance may hide character strokes.');
 if(exposure==='overexposed')notes.push('Bright regions may clip fine lettering.');
 if(contrast<18)notes.push('Low tonal separation may reduce OCR confidence.');
 if(edgeDensity<3)notes.push('Few strong local edges were detected.');
 if(!notes.length)notes.push('Pixel signal is balanced for a local OCR attempt.');
 return{width,height,sampledWidth:width,sampledHeight:height,luminance,contrast,edgeDensity,ocrReadiness,exposure,dominantTone,notes};
}

export async function analyzeImageBlob(blob:Blob):Promise<VisualSignalProfile>{
 let source:CanvasImageSource;let sourceWidth:number;let sourceHeight:number;let release:()=>void;
 if(typeof createImageBitmap==='function'){
  const bitmap=await createImageBitmap(blob);source=bitmap;sourceWidth=bitmap.width;sourceHeight=bitmap.height;release=()=>bitmap.close();
 }else{
  const url=URL.createObjectURL(blob);const image=new Image();image.src=url;
  try{await image.decode()}catch(cause){URL.revokeObjectURL(url);throw new Error('Pixel analysis could not decode this image.',{cause})}
  source=image;sourceWidth=image.naturalWidth;sourceHeight=image.naturalHeight;release=()=>{image.src='';URL.revokeObjectURL(url)};
 }
 validateDimensions(sourceWidth,sourceHeight);
 try{
  const scale=Math.min(1,320/Math.max(sourceWidth,sourceHeight));const width=Math.max(1,Math.round(sourceWidth*scale));const height=Math.max(1,Math.round(sourceHeight*scale));
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const context=canvas.getContext('2d',{willReadFrequently:true});
  if(!context)throw new Error('Pixel analysis is unavailable in this browser.');
  context.drawImage(source,0,0,width,height);const profile=analyzeVisualSignal(context.getImageData(0,0,width,height).data,width,height);
  return{...profile,width:sourceWidth,height:sourceHeight};
 }finally{release()}
}

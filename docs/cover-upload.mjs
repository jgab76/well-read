export const UPLOAD_URL = 'https://github.com/jgab76/well-read/upload/main/docs/covers';
export function coverFilename(id) {
 if (!/^[a-zA-Z0-9_-]+$/.test(String(id))) throw new Error('This book needs a Goodreads ID before a custom cover can be added.');
 return `${id}.jpg`;
}
export function imageSize(width,height) {
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<1||height<1||width*height>40000000) throw new Error('Please choose an image smaller than 40 megapixels.');
 const scale=Math.min(1,1200/Math.max(width,height));
 return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};
}
export async function prepareCover(file) {
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose a JPEG, PNG, or WebP image.');
 if(file.size>10*1024*1024) throw new Error('Choose an image smaller than 10 MB.');
 const url=URL.createObjectURL(file);
 try {
  const img=new Image(); img.src=url; await img.decode().catch(()=>{throw new Error('This image could not be opened. Try a different file.');});
  const size=imageSize(img.naturalWidth,img.naturalHeight);
  const canvas=document.createElement('canvas'); Object.assign(canvas,size);
  const ctx=canvas.getContext('2d'); if(!ctx)throw new Error('Your browser could not prepare this image. Please try another browser.');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,size.width,size.height);ctx.drawImage(img,0,0,size.width,size.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.9));
  if(!blob)throw new Error('The cover could not be prepared. Try a different image.');
  return blob;
 } finally {URL.revokeObjectURL(url);}
}
export function mountCoverUpload(container,book,onRefresh) {
 let previewURL=null,preparedBlob=null,selection=0,disposed=false;
 let filename;
 try{filename=coverFilename(book.id);}catch{return ()=>{};}
 container.innerHTML=`<details class="cover-editor"><summary>Upload or replace cover <span>Owner tools</span></summary><p>Choose a cover, then save it through your GitHub account. Only the repository owner or a collaborator can update the shared shelf.</p><label class="cover-file">Choose cover image<input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choose cover image"></label><p class="fine">JPEG, PNG, or WebP · up to 10 MB</p><p class="upload-status" role="status" aria-live="polite"></p><div class="cover-ready" hidden><img class="upload-preview" alt="New cover preview"><p><b>1. Download the prepared cover.</b><br>Keep its filename: <code></code></p><a class="primary download-cover">Download cover</a><p><b>2. Save it on GitHub.</b><br>Open the upload page, choose the downloaded file, and click <b>Commit changes</b>. GitHub may ask you to sign in.</p><a class="github-upload" target="_blank" rel="noopener noreferrer">Open GitHub upload ↗</a><p class="fine">Uploading makes this image public. Publication usually takes a minute or two. If your browser adds “(1)” to the filename, rename it to the exact name above before uploading.</p><button class="refresh-cover" type="button">I’ve committed it — check cover</button><p class="check-status" role="status" aria-live="polite"></p><p class="fine">Selecting or downloading an image here does not publish it.</p></div></details>`;
 const input=container.querySelector('input'),status=container.querySelector('.upload-status'),ready=container.querySelector('.cover-ready');
 const download=container.querySelector('.download-cover'),github=container.querySelector('.github-upload');
 github.href=UPLOAD_URL;container.querySelector('code').textContent=filename;
 input.onchange=async()=>{
  const seq=++selection;ready.hidden=true;preparedBlob=null;if(previewURL){URL.revokeObjectURL(previewURL);previewURL=null;}
  const file=input.files[0];if(!file){status.textContent='';return;}
  status.textContent='Preparing your cover…';
  try{
   const blob=await prepareCover(file);if(disposed||seq!==selection)return;
   preparedBlob=blob;previewURL=URL.createObjectURL(blob);container.querySelector('.upload-preview').src=previewURL;
   download.href=previewURL;download.download=filename;ready.hidden=false;status.textContent='Cover ready. Follow the two steps below to publish it.';
  }catch(error){if(!disposed&&seq===selection)status.textContent=error.message;}
 };
 const refresh=container.querySelector('.refresh-cover'),checkStatus=container.querySelector('.check-status');
 refresh.onclick=async()=>{
  refresh.disabled=true;refresh.textContent='Checking…';checkStatus.textContent='Checking for the published cover…';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{
   const url=`./covers/${filename}?v=${Date.now()}`;
   const response=await fetch(url,{cache:'no-store',signal:controller.signal});
   if(!response.ok||!response.headers.get('content-type')?.startsWith('image/'))throw new Error(`No published cover found at docs/covers/${filename}. Upload the downloaded cover with this exact filename, click Commit changes, then wait a minute and check again.`);
   const blob=await response.blob();

   const test=URL.createObjectURL(blob);
   try{const img=new Image();img.src=test;await img.decode();}finally{URL.revokeObjectURL(test);}
   if(disposed)return;
   onRefresh(url);checkStatus.textContent='Your uploaded cover is live and visible to everyone.';
  }catch(error){if(!disposed)checkStatus.textContent=error.name==='AbortError'?'The check timed out. Please try again.':error.message;}
  finally{clearTimeout(timer);if(!disposed){refresh.disabled=false;refresh.textContent='I’ve committed it — check cover';}}
 };
 return ()=>{disposed=true;selection++;if(previewURL)URL.revokeObjectURL(previewURL);};
}

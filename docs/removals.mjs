export function validateExclusions(data){
 if(!data||!Array.isArray(data.books)||!data.books.every(b=>b&&typeof b.id==='string'&&b.id.length>0))throw Error('The saved removal list could not be read. No changes were made.');
 return data.books;
}
export function excludeBooks(books,removed){const ids=new Set(removed.map(b=>b.id));return books.filter(b=>!ids.has(b.id));}
export async function loadExclusions(){
 const response=await fetch('./exclusions.json',{cache:'no-store',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Could not load saved removals. Please refresh and try again.');
 return validateExclusions(await response.json());
}
export function mountRemoval(container,book,onRemoved){
 let url=null,disposed=false;
 container.innerHTML='<section class="cover-editor"><button type="button" class="refresh-cover remove-book">Remove from library</button><div class="removal-steps" hidden><p>To remove this book for everyone and keep it out of future imports:</p><ol><li><a class="removal-download">Download removal list</a>.</li><li><a class="removal-upload" target="_blank" rel="noopener noreferrer">Open GitHub upload ↗</a>, upload <b>exclusions.json</b>, and click <b>Commit changes</b>.</li></ol><p class="fine">Keep the filename exactly exclusions.json. Save one removal at a time. Only the repository owner or a collaborator can publish changes. This does not change Goodreads.</p><button type="button" class="refresh-cover check-removal">I’ve committed it — check removal</button></div><p class="removal-status" role="status" aria-live="polite"></p></section>';
 const button=container.querySelector('.remove-book'),status=container.querySelector('.removal-status'),check=container.querySelector('.check-removal');
 container.querySelector('.removal-upload').href='https://github.com/jgab76/well-read/upload/main/docs';
 button.onclick=async()=>{
  button.disabled=true;status.textContent='Preparing removal…';
  try{
   const removed=await loadExclusions();if(disposed)return;
   if(removed.some(b=>b.id===book.id)){onRemoved(removed);return;}
   removed.push({id:book.id,title:book.title,author:book.author});
   if(url)URL.revokeObjectURL(url);
   url=URL.createObjectURL(new Blob([JSON.stringify({books:removed},null,2)+'\n'],{type:'application/json'}));
   const link=container.querySelector('.removal-download');link.href=url;link.download='exclusions.json';
   container.querySelector('.removal-steps').hidden=false;
   status.textContent='Ready to save. The book stays in the shared library until you commit this file on GitHub.';
  }catch(error){if(!disposed)status.textContent=error.message;}
  finally{if(!disposed)button.disabled=false;}
 };
 check.onclick=async()=>{
  check.disabled=true;status.textContent='Checking published removals…';
  try{const removed=await loadExclusions();if(disposed)return;if(!removed.some(b=>b.id===book.id))throw Error('Removal is not published yet. Confirm you committed exclusions.json, wait a minute, then check again.');onRemoved(removed);}
  catch(error){if(!disposed)status.textContent=error.message;}
  finally{if(!disposed)check.disabled=false;}
 };
 return ()=>{disposed=true;if(url)URL.revokeObjectURL(url);};
}

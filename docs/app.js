import {sortBooks} from './library.mjs';
import {coverFilename,mountCoverUpload} from './cover-upload.mjs?v=20260918b';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let books=[],category='All books',query='',cleanupUpload=()=>{};
const missingCustom=new Set(),publishedCustom=new Map(),coverVersion=Date.now();
function categories(){return [...new Set(books.flatMap(b=>b.categories))].sort((a,b)=>a.localeCompare(b))}
function catalogCover(b){return b.cover || (b.isbn?`https://covers.openlibrary.org/b/isbn/${encodeURIComponent(b.isbn)}-M.jpg?default=false`:(/^\d+$/.test(b.id)?`https://covers.openlibrary.org/b/goodreads/${b.id}-M.jpg?default=false`:''))}
function cover(b){
 if(publishedCustom.has(b.id))return publishedCustom.get(b.id);
 try{if(!missingCustom.has(b.id))return `./covers/${coverFilename(b.id)}?v=${coverVersion}`;}catch{}
 return catalogCover(b);
}
function bindCover(img,b,onFailure){
 let triedCatalog=missingCustom.has(b.id);
 const fail=()=>{
  if(!triedCatalog){triedCatalog=true;missingCustom.add(b.id);publishedCustom.delete(b.id);const next=catalogCover(b);if(next){img.src=next;return;}}
  img.removeEventListener('error',fail);onFailure();
 };
 img.addEventListener('error',fail);
 if(img.complete&&img.naturalWidth===0)fail();
}
function fallback(b){return `<div class="cover-fallback"><span>${esc(b.title)}</span><small>${esc(b.author)}</small></div>`}
function render(){
 const cats=categories();$('#total').textContent=books.length;$('#count').textContent=books.length;
 $('#heading').innerHTML=category==='All books'?'Jeremy’s bookshelf<span>.</span>':esc(category);
 $('#summary').textContent=books.length?`${books.length} read books, organized into ${cats.length} ${cats.length===1?'category':'categories'}.`:'A collection of stories, ideas, and worlds worth keeping.';
 $('#all').classList.toggle('active',category==='All books');
 $('#categories').innerHTML=cats.map(c=>`<button class="nav ${category===c?'active':''}" data-category="${esc(c)}">${esc(c)} <span>${books.filter(b=>b.categories.includes(c)).length}</span></button>`).join('');
 const filtered=sortBooks(books.filter(b=>(category==='All books'||b.categories.includes(category))&&`${b.title} ${b.author}`.toLowerCase().includes(query)));
 $('#shelves').innerHTML=(category==='All books'?cats:[category]).map(c=>{
  const group=filtered.filter(b=>b.categories.includes(c));
  return group.length?`<section class="shelf-section"><div class="shelf-heading"><h2>${esc(c.replace(/-/g,' '))}</h2><span>${group.length} ${group.length===1?'book':'books'}</span></div><div class="books">${group.map(b=>`<button class="book" data-id="${esc(b.id)}" aria-label="View ${esc(b.title)} by ${esc(b.author)}"><div class="cover">${cover(b)?`<img src="${esc(cover(b))}" alt="${esc(b.title)} cover" loading="lazy" data-cover-id="${esc(b.id)}">`:fallback(b)}</div><p class="book-title">${esc(b.title)}</p><span class="author">${esc(b.author)}</span></button>`).join('')}</div></section>`:'';
 }).join('')||`<div class="empty">${books.length?'No books match your search.':'The first books will be added soon.'}</div>`;
 $('#shelves').querySelectorAll('img').forEach(img=>{const b=books.find(b=>b.id===img.dataset.coverId);bindCover(img,b,()=>{img.parentElement.innerHTML=fallback(b)});});
}
$('#all').onclick=()=>{category='All books';render()};
$('#categories').onclick=e=>{const b=e.target.closest('[data-category]');if(b){category=b.dataset.category;render()}};
$('#search').oninput=e=>{query=e.target.value.toLowerCase();render()};
$('.close').onclick=()=>$('#detail-dialog').close();
$('#detail-dialog').addEventListener('close',()=>cleanupUpload());
$('#shelves').onclick=e=>{
 const button=e.target.closest('[data-id]');if(!button)return;const b=books.find(b=>b.id===button.dataset.id);cleanupUpload();
 $('#detail').innerHTML=`${cover(b)?`<div class="detail-cover"><img src="${esc(cover(b))}" alt="${esc(b.title)} cover"></div>`:''}<p class="eyebrow">JEREMY’S COLLECTION</p><h2>${esc(b.title)}</h2><p>by ${esc(b.author)}</p><p class="category-tags">${b.categories.map(esc).join(' · ')}</p>${/^\d+$/.test(b.id)?`<a href="https://www.goodreads.com/book/show/${b.id}" target="_blank" rel="noreferrer">View on Goodreads ↗</a>`:''}`;
 const detailImg=$('#detail img');if(detailImg)bindCover(detailImg,b,()=>{detailImg.parentElement.innerHTML=fallback(b);});
 const editor=document.createElement('div');$('#detail').append(editor);
 cleanupUpload=mountCoverUpload(editor,b,url=>{
  missingCustom.delete(b.id);publishedCustom.set(b.id,url);render();
  const holder=$('#detail .detail-cover');if(holder){holder.innerHTML=`<img src="${esc(url)}" alt="${esc(b.title)} cover">`;}
 });
 $('#detail-dialog').showModal();
};
$('#status').textContent='Loading the bookshelf…';
try{
 const response=await fetch('./books.json',{cache:'no-cache'});if(!response.ok)throw Error('Library unavailable');
 const data=await response.json();
 if(!Array.isArray(data.books)||!data.books.every(b=>typeof b.id==='string'&&typeof b.title==='string'&&typeof b.author==='string'&&Array.isArray(b.categories)&&b.categories.every(c=>typeof c==='string')&&(!b.cover||/^https:\/\/covers\.openlibrary\.org\/b\/(?:id|isbn|goodreads)\/[\w-]+\.jpg(?:\?default=false)?$/.test(b.cover))))throw Error('Invalid collection');
 books=data.books;render();$('#status').textContent='';
}catch{$('#status').textContent='The bookshelf could not be loaded. Please refresh to try again.'}

import {validateExclusions,excludeBooks} from '../docs/removals.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {importCSV,sortBooks} from '../docs/library.mjs';
export function publicBooks(text,existing=[],categoryOverrides={},removed=[]){
 const old=new Map(existing.map(b=>[b.id,b]));
 return sortBooks(excludeBooks(importCSV(text),removed).map(b=>{
  const previous=old.get(b.id);
  const author=b.author.replace(/\s+/g,' ').trim();
  const hasSuffix=/(?:,?\s+)(?:Jr\.?|Sr\.?|II|III|IV)$/i.test(author);
  const name=author.replace(/(?:,?\s+)(?:Jr\.?|Sr\.?|II|III|IV)$/i,'');
  const parts=name.split(/\s+/);
  const sort=hasSuffix?`${parts.pop()}, ${parts.join(' ')}`:b.sort.replace(/\s+/g,' ').trim();
  const result={id:b.id,title:b.title,author,sort,isbn:b.isbn,categories:b.categories};
  if(previous?.categories?.length&&b.categories.length===1&&b.categories[0]==='Uncategorized')result.categories=previous.categories;
  if(previous?.cover&&/^https:\/\/covers\.openlibrary\.org\/b\/(?:id|isbn|goodreads)\/[\w-]+\.jpg(?:\?default=false)?$/.test(previous.cover))result.cover=previous.cover;
  if(categoryOverrides[b.id])result.categories=categoryOverrides[b.id];
  if(author==='Augustine of Hippo')result.sort='Augustine';
  return result;
 }));
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const input=process.argv[2];if(!input){console.error('Usage: node scripts/import-goodreads.mjs /path/to/goodreads_library_export.csv');process.exitCode=1}
 else{
  const output=new URL('../docs/books.json',import.meta.url);let existing=[];
  try{existing=JSON.parse(await readFile(output,'utf8')).books||[]}catch{}
  let overrides={};
  try{overrides=JSON.parse(await readFile(new URL('../data/category-overrides.json',import.meta.url),'utf8'))}catch{}
  const removed=validateExclusions(JSON.parse(await readFile(new URL('../docs/exclusions.json',import.meta.url),'utf8')));
  const books=publicBooks(await readFile(input,'utf8'),existing,overrides,removed);
  await writeFile(output,JSON.stringify({updatedAt:new Date().toISOString(),books},null,2)+'\n');
  console.log(`Prepared ${books.length} read books. Only titles, authors, categories, book identifiers and cover URLs are included. Commit docs/books.json to update the shared shelf.`);
 }
}

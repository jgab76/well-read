import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {importCSV,sortBooks} from '../docs/library.mjs';
export function publicBooks(text,existing=[]){
 const old=new Map(existing.map(b=>[b.id,b]));
 return sortBooks(importCSV(text).map(b=>{
  const previous=old.get(b.id);
  const result={id:b.id,title:b.title,author:b.author,sort:b.sort,isbn:b.isbn,categories:b.categories};
  if(previous?.categories?.length&&b.categories.length===1&&b.categories[0]==='Uncategorized')result.categories=previous.categories;
  if(previous?.cover&&/^https:\/\/covers\.openlibrary\.org\/b\/(?:id|isbn|goodreads)\/[\w-]+\.jpg(?:\?default=false)?$/.test(previous.cover))result.cover=previous.cover;
  return result;
 }));
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const input=process.argv[2];if(!input){console.error('Usage: node scripts/import-goodreads.mjs /path/to/goodreads_library_export.csv');process.exitCode=1}
 else{
  const output=new URL('../docs/books.json',import.meta.url);let existing=[];
  try{existing=JSON.parse(await readFile(output,'utf8')).books||[]}catch{}
  const books=publicBooks(await readFile(input,'utf8'),existing);
  await writeFile(output,JSON.stringify({updatedAt:new Date().toISOString(),books},null,2)+'\n');
  console.log(`Prepared ${books.length} read books. Only titles, authors, categories, book identifiers and cover URLs are included. Commit docs/books.json to update the shared shelf.`);
 }
}

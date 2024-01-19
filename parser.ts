import util from 'util';
import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

function getSHA256Hash(input: string, len: number = 32): string {
  const hash = crypto.createHash('sha256');
  hash.update(input);
  return hash.digest('hex').slice(0, len);
}


function readJsonFile(filePath: string) {
    const data = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(data);
    return json;
}
const filePath = 'json/anf01.json';
const json = readJsonFile(filePath);
const baseName = path.basename(filePath, '.json');

const authors = json.ThML[`ThML.body`].div1.map(e => e.h1.span).filter(Boolean);
const books = json.ThML[`ThML.body`].div1.map(e => e.div2);





const bookTitle = (n: number) => books[n]
                                .map(e => e.div3 && Array.isArray(e.div3) ? ({
                                    book: (typeof e.h2 === 'object') ? e.h2['#text'] : e.h2
                                    ,author: authors[ n - 1 ]
                                    ,chapters: [...e.div3.map(e => ({
                                        title: (typeof e.h3 === 'object') ? e.h3['#text'] : e.h3
                                        ,body: Array.isArray(e.p) ? e.p.map(e => (e['#text'])).filter(Boolean) : e.p['#text']
                                    }))]
  
                                }): null)
                                .filter(Boolean)
                                .flat()
                                
// authors.forEach((e, i) => 
//     console.log(author(i), titles(i), body(i)));


// console.log(author(n), titles(n), body(n));

// console.log(util.inspect(bookTitle(1), { depth: null, colors: true }));
// console.log(authors);


const formatted = bookTitle(3).map(e => (e.chapters.map(f => ({
    pageContent: (Array.isArray(f.body)) ? f.body.join(' ') : f.body
    ,metadata: {Author: e.author, Book: e.book, Chapter: f.title, Volume: baseName }
})))).flat();

const ids = { ids: formatted.map(e => getSHA256Hash(e.pageContent))};

const res = [formatted, ids];

await Bun.write('text.json', JSON.stringify(res, null, 2));
console.log(util.inspect(res, { depth: null, colors: true }));
console.log(util.inspect(ids, { depth: null, colors: true }));
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

const hTag = new RegExp('h[1-9]');
const divTag = new RegExp('div[1-9]');

const testKey = (pattern: RegExp) => (key: string) => pattern.test(key) && key;

const H = testKey(hTag);
const DIV = testKey(divTag);

const chapterRecur = (section: object[]) => ([...section[DIV('div3')].map(f => ({
                                        chapter: (typeof f.h3 === 'object') 
                                            ? f.h3['#text'] 
                                            : f.h3
                                        ,body: Array.isArray(f.p) 
                                            ? f.p.map(e => (e['#text'])).filter(Boolean) 
                                            : f.p['#text']
                                    }))]);


const bookTitle = (n: number) => books[n]
                                .map(e => e.div3 && Array.isArray(e.div3) 
                                    ? ({
                                        book: (typeof e.h2 === 'object') 
                                        ? e.h2['#text'] 
                                        : e.h2
                                        ,author: authors[ n - 1 ]
                                        ,chapters: chapterRecur(e)
    
                                    })
                                    : null)
                                .filter(Boolean)
                                .flat()
                                
// authors.forEach((e, i) => 
//     console.log(author(i), titles(i), body(i)));


// console.log(author(n), titles(n), body(n));

// console.log(util.inspect(bookTitle(1), { depth: null, colors: true }));
// console.log(authors);


const formatted = bookTitle(3).map(e => (e.chapters.map(f => ({
    pageContent: (Array.isArray(f.body)) ? f.body.join(' ') : f.body
    ,metadata: {Author: e.author, Book: e.book, Chapter: f.chapter, Volume: baseName }
})))).flat();

const ids = { ids: formatted.map(e => e.pageContent ? getSHA256Hash(e.pageContent) : "no content")};

const res = [formatted, ids];

await Bun.write('text.json', JSON.stringify(res, null, 2));
console.log(util.inspect(res, { depth: null, colors: true }));
console.log(util.inspect(authors, { depth: null, colors: true }));

console.log(H('hr'));
console.log(DIV('div'));
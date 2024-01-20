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
const filePath = 'json/anf02.json';
const json = readJsonFile(filePath);
const baseName = path.basename(filePath, '.json');

// const authors = json.ThML[`ThML.body`].div1.map(e => e.h1.span).filter(Boolean);
// const books = json.ThML[`ThML.body`].div1.map(e => e.div2);

const hTag = new RegExp('h[1-9]');
const divTag = new RegExp('div[1-9]');

const testKey = (pattern: RegExp) => (key: string) => pattern.test(key) && key;

const H = testKey(hTag);
const DIV = testKey(divTag);

const hasDIV = (section: object) => {
    return Object.keys(section).filter(DIV)[0];
};

const hasH = (section: object) => {
    return Object.keys(section).filter(H)[0];
};

// const chapterR = (section: object[]) => ([...section[hasDIV(section)].map(f => ({
//     chapter: (typeof f.h3 === 'object') 
//     ? f.h3['#text'] 
//     : f.h3
//     ,body: Array.isArray(f.p) 
//     ? f.p.map(e => (e['#text'])).filter(Boolean) 
//     : f.p['#text']
// }))]);




// const bookTitle = (n: number) => books[n]
// .map(e => hasDIV(e) && Array.isArray(hasDIV(e)) 
// ? ({
//     book: (typeof e.h2 === 'object') 
//     ? e.h2['#text'] 
//     : e.h2
//     ,author: authors[ n - 1 ]
//     ,chapters: chapterTest(e)
    
// })
// : null)
// .filter(Boolean)
// .flat()

let result: any[] = [];
const viewKeyTree = (result: string[], obj: object, max: number, count:number = 0) => {
    if (max === count) return result;
        for (let key in obj) {
            //if (typeof obj[key] !== 'object' || obj[key] === null) {return result}
            if (obj.hasOwnProperty(key)) {
                result.push(`${Array(count).fill('_').join('')} ${key}`); // print the key
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    extractHandDIVs(result, obj[key], max, count + 1); // recursive call
                }
        }
    }
    // }
}

const extractHandDIVs = (result: any[], obj: object, max: number, count:number = 0) => {
    if (max === count) return result;
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
               if(DIV(key) || H(key)) result.push({ depth: count, content: obj[key]}); // print the key
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    extractHandDIVs(result, obj[key], max, count + 1); // recursive call
                }
        }
    }
 



const formatted = result.map(e => (e.chapters.map(f => ({
    pageContent: (Array.isArray(f.body)) ? f.body.join(' ') : f.body
    ,metadata: {Author: e.author, Book: e.book, Chapter: f.chapter, Volume: baseName }
})))).flat();

// const ids = { ids: formatted.map(e => e.pageContent ? getSHA256Hash(e.pageContent) : "no content")};

// const res = [formatted, ids];

// await Bun.write('text.json', JSON.stringify(res, null, 2));
// console.log(util.inspect(res, { depth: null, colors: true }));
// console.log(util.inspect(authors, { depth: null, colors: true }));


// chapterTest(json, 7);
extractHandDIVs(result, json, 50)
console.log('text.json', result.map(e => `${e.depth} ${e.content}`).join('\n'));
// console.log(util.inspect(result, { depth: null, colors: true }));
// await Bun.write('text.json', result.join('\n'));
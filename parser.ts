import fs from 'fs';

function readJsonFile(filePath: string) {
    const data = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(data);
    return json;
}

const json = readJsonFile('json/anf01.json');
// console.log(json.ThML[`ThML.body`].div1.length);

for (let e in json.ThML[`ThML.body`].div1[1].div2[0]) {
    
    console.log(JSON.stringify(e));
    console.log(`fart`);
} 
// console.log(json.ThML[`ThML.body`].div1[1].div2[0].p[2]['#text'], "\n\n\n");  
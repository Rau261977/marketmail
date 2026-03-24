
import fs from 'fs';

let content = fs.readFileSync('tmp/lazy-out.txt', 'utf16le');
if (!content.includes('[API SUCCESS]')) {
    content = fs.readFileSync('tmp/lazy-out.txt', 'utf8');
}

const lines = content.split('\n');
let currentId = null;
let currentJson = '';
let parsingJson = false;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('[API SUCCESS]')) {
        currentId = line.split('[API SUCCESS] ')[1].split(':')[0].trim();
        parsingJson = true;
        currentJson = line.substring(line.indexOf('{'));
    } else if (parsingJson) {
        currentJson += '\n' + line;
        if (line.trim() === '}') {
            parsingJson = false;
            try {
                const data = JSON.parse(currentJson);
                console.log(`ID: ${currentId} | last_event: ${data.last_event} | status: ${data.status}`);
            } catch (e) {
                console.log(`ID: ${currentId} | Error parsing JSON`);
            }
        }
    }
}

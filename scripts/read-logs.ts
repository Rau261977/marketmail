
import fs from 'fs';
import path from 'path';

const logPath = path.join(process.cwd(), 'tmp', 'sync_debug.log');
if (fs.existsSync(logPath)) {
    const content = fs.readFileSync(logPath, 'utf8');
    console.log(content.split('\n').slice(-20).join('\n'));
} else {
    console.log('Log file not found');
}

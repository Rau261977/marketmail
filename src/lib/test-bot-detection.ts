import { isBot } from './bot-detection';

// Mock Request object
function createMockRequest(userAgent: string, headers: Record<string, string> = {}): any {
    const allHeaders = new Map<string, string>();
    allHeaders.set('user-agent', userAgent);
    for (const [key, value] of Object.entries(headers)) {
        allHeaders.set(key.toLowerCase(), value);
    }
    
    return {
        headers: {
            get: (name: string) => allHeaders.get(name.toLowerCase()) || null
        }
    };
}

interface TestCase {
    name: string;
    ua: string;
    headers?: Record<string, string>;
    shouldBeBot: boolean;
}

const testCases: TestCase[] = [
    { 
        name: 'Standard Chrome (Windows)', 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        shouldBeBot: false 
    },
    { 
        name: 'Standard Safari (iPhone)', 
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
        shouldBeBot: false 
    },
    { 
        name: 'Gmail Image Proxy', 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246 Mozilla/5.0 Google-Plus-Photos/1.0 (Google-Plus-Photos-Image-Proxy; +http://www.google.com/+/about/photos/imageproxy.html)',
        shouldBeBot: true 
    },
    { 
        name: 'Outlook Image Proxy', 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0 Office365-ImageProxy/1.0',
        shouldBeBot: true 
    },
    { 
        name: 'Empty User-Agent', 
        ua: '',
        shouldBeBot: true 
    },
    { 
        name: 'Short User-Agent', 
        ua: 'curl/7.64.1',
        shouldBeBot: true 
    },
    { 
        name: 'X-Purpose: preview header', 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        headers: { 'X-Purpose': 'preview' },
        shouldBeBot: true 
    },
    { 
        name: 'Purpose: prefetch header', 
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        headers: { 'Purpose': 'prefetch' },
        shouldBeBot: true 
    }
];

let passed = 0;
let failed = 0;

console.log('--- Bot Detection Test Suite ---');

for (const tc of testCases) {
    const req = createMockRequest(tc.ua, tc.headers);
    const result = isBot(req);
    const status = result === tc.shouldBeBot ? 'PASSED' : 'FAILED';
    
    if (result === tc.shouldBeBot) passed++;
    else failed++;
    
    console.log(`[${status}] ${tc.name}`);
    if (result !== tc.shouldBeBot) {
        console.log(`  UA: ${tc.ua}`);
        console.log(`  Expected: ${tc.shouldBeBot}, Got: ${result}`);
    }
}

console.log('\n--- Results ---');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
    process.exit(1);
}

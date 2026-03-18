/**
 * Bot detection utility for email tracking.
 * 
 * Filters out common automated email scanners, link previews, and image proxies
 * to reduce false positive "open" and "click" events.
 */

const BOT_USER_AGENTS = [
    // Google/Gmail
    'gmailimageproxy',
    'google-apps-viewer',
    'googlebot',
    'google-image-proxy',
    'google-plus-photos',
    'google-plus-photos-image-proxy',
    
    // Microsoft/Outlook/Office 365
    'outlook-android',
    'office365-imageproxy',
    'microsoft office',
    'outlook-ios',
    'exchange web services',
    'atlas-image-proxy',
    
    // Yahoo/AOL
    'yahoo! slurp',
    'yahoo! link preview',
    
    // Apple
    'apple-mail-client',
    'cloud-image-proxy',
    
    // Common bots/scanners/previewers
    'bot',
    'crawler',
    'spider',
    'whatsapp',
    'slackbot',
    'telegrambot',
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot',
    'discordbot',
    'preview',
    'headless',
    'phantomjs',
    'puppeteer',
    'selenium',
    'pingdom',
    'uptrack',
];

const BOT_HEADERS = [
    { name: 'x-purpose', value: 'preview' },
    { name: 'purpose', value: 'prefetch' },
    { name: 'x-fb-http-engine', value: 'ghost' },
];

/**
 * Checks if a request likely comes from a bot or automated scanner.
 * 
 * @param request The incoming Next.js Request object
 * @returns boolean True if it's likely a bot, false otherwise
 */
export function isBot(request: Request): boolean {
    const ua = request.headers.get('user-agent')?.toLowerCase() || '';
    
    // Check User-Agent
    if (BOT_USER_AGENTS.some(botUA => ua.includes(botUA))) {
        return true;
    }
    
    // Check specific bot headers
    for (const header of BOT_HEADERS) {
        if (request.headers.get(header.name)?.toLowerCase() === header.value) {
            return true;
        }
    }
    
    // Check for empty User-Agent (often bots)
    if (!ua || ua.length < 20) {
        return true;
    }

    // Check for common command line tools disguised as browsers
    if (ua.includes('curl/')) {
        return true;
    }

    return false;
}

/**
 * Comprehensive utility to detect device type from User-Agent.
 */
export function getDeviceType(userAgent: string | null): string {
    if (!userAgent) return "other";
    
    const ua = userAgent.toLowerCase();
    
    // Yahoo specific detection (can be proxy or client)
    if (ua.includes("yahoo") || ua.includes("ymail") || ua.includes("yahoomail")) {
        // If it's a proxy, we still want to try to find mobile/desktop keywords
        // Yahoo proxies often have "YahooMailProxy"
    }

    // 1. Mobile & Tablet detection
    const mobileKeywords = [
        "mobile", "android", "iphone", "ipod", "windows phone", 
        "opera mini", "mobi", "blackberry", "iemobile", "fennec",
        "kindle", "silk", "playbook", "bb10", "yphone"
    ];
    
    const tabletKeywords = [
        "ipad", "tablet", "tab", "playbook"
    ];

    if (mobileKeywords.some(kw => ua.includes(kw))) {
        if (ua.includes("android") && !ua.includes("mobile")) {
            return "tablet";
        }
        return "mobile";
    }

    if (tabletKeywords.some(kw => ua.includes(kw))) {
        return "tablet";
    }
    
    // 2. Desktop detection
    const desktopKeywords = [
        "windows", "macintosh", "linux", "x11", "bsd", "solaris", "cros"
    ];

    if (desktopKeywords.some(kw => ua.includes(kw))) {
        return "desktop";
    }
    
    // 3. Fallback for common browser engines on desktop
    if (
        ua.includes("mozilla/") && 
        (ua.includes("applewebkit") || ua.includes("gecko/") || ua.includes("trident/") || ua.includes("edge/"))
    ) {
        return "desktop";
    }
    
    // Case for common browser names
    if (ua.includes("chrome") || ua.includes("safari") || ua.includes("firefox") || ua.includes("opera")) {
        return "desktop";
    }

    return "other";
}

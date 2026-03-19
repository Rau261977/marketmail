/**
 * Comprehensive utility to detect device type from User-Agent.
 */
export function getDeviceType(userAgent: string | null): string {
    if (!userAgent) return "other";
    
    const ua = userAgent.toLowerCase();
    
    // 1. Mobile & Tablet detection (more comprehensive)
    const mobileKeywords = [
        "mobile", "android", "iphone", "ipod", "windows phone", 
        "opera mini", "mobi", "blackberry", "iemobile", "fennec"
    ];
    
    const tabletKeywords = [
        "ipad", "playbook", "kindle", "silk", "tablet"
    ];

    if (mobileKeywords.some(kw => ua.includes(kw))) {
        // Special case for Android tablets (which often have "Android" but not always "Mobile")
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
        "windows", "macintosh", "linux", "x11", "bsd", "solaris"
    ];

    if (desktopKeywords.some(kw => ua.includes(kw))) {
        return "desktop";
    }
    
    // 3. Fallback for common browser engines on desktop
    if (ua.includes("mozilla") || ua.includes("chrome") || ua.includes("safari")) {
        return "desktop";
    }

    return "other";
}

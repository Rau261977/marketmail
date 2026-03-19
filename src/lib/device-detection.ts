/**
 * Comprehensive utility to detect device type from User-Agent.
 */
export function getDeviceType(userAgent: string | null): string {
    if (!userAgent) return "other";
    
    const ua = userAgent.toLowerCase();
    
    // 1. Mobile & Tablet detection (more comprehensive)
    const mobileKeywords = [
        "mobile", "android", "iphone", "ipod", "windows phone", 
        "opera mini", "mobi", "blackberry", "iemobile", "fennec",
        "kindle", "silk", "playbook", "bb10"
    ];
    
    const tabletKeywords = [
        "ipad", "tablet", "tab", "playbook"
    ];

    // Special case for certain mail clients/proxies that don't have typical mobile UA but are mobile
    if (ua.includes("gmailimageproxy") || ua.includes("office365-imageproxy")) {
        // We can't know for sure, so we stay in "other" or "proxy" but we'll try to guess
        // but for now let's keep it as "desktop" or "other" if unknown.
        // Actually, if it's proxied, we might want to label it as "Proxy/Cloud".
    }

    if (mobileKeywords.some(kw => ua.includes(kw))) {
        // Special case for Android tablets
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

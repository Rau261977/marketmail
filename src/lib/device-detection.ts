/**
 * Simple utility to detect device type from User-Agent.
 */
export function getDeviceType(userAgent: string | null): string {
    if (!userAgent) return "unknown";
    
    const ua = userAgent.toLowerCase();
    
    // Mobile detection
    if (
        ua.includes("mobile") ||
        ua.includes("android") ||
        ua.includes("iphone") ||
        ua.includes("ipad") ||
        ua.includes("ipod") ||
        ua.includes("windows phone")
    ) {
        return "mobile";
    }
    
    // Tablet detection (optional, could be categorized as mobile or desktop)
    // For now, categorization as "mobile" if it contains the above keywords is fine.
    
    // Desktop detection
    if (
        ua.includes("windows") ||
        ua.includes("macintosh") ||
        ua.includes("linux") ||
        ua.includes("x11")
    ) {
        return "desktop";
    }
    
    return "other";
}

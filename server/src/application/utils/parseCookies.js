export const parseCookies = (cookieHeader) => {
    if (!cookieHeader) return Object.create(null);
    return cookieHeader.split(';').reduce((acc, cookie) => {
        const [rawName, ...rawValue] = cookie.trim().split('=');
        if (rawName) {
            try {
                const name = decodeURIComponent(rawName.trim());
                const value = decodeURIComponent(rawValue.join('='));
                acc[name] = value;
            } catch {
                acc[rawName.trim()] = rawValue.join('=');
            }
        }
        return acc;
    }, Object.create(null));
};

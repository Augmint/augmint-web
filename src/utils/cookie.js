const cookieDelimiter = "=";

export function getCookie(name) {
    const cookies = document.cookie
        .split(";")
        .map(cookie => cookie.trim())
        .reduce((cookies, cookie) => {
            const parts = cookie.split(cookieDelimiter);
            const key = parts.shift();
            cookies[key] = parts.join(cookieDelimiter);
            return cookies;
        }, {});

    if (!cookies.hasOwnProperty(name)) {
        return;
    }

    return JSON.parse(cookies[name]);
}

export function setCookie(name, value) {
    document.cookie = name + cookieDelimiter + JSON.stringify(value) + ";path=/";
}

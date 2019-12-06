import { NETWORKS } from "./constants";

export function promiseTimeout(ms, promise) {
    return new Promise(async (resolve, reject) => {
        // create a timeout to reject promise if not resolved
        const timer = setTimeout(() => {
            reject(new Error("promise timeout"));
        }, ms);

        try {
            const res = await promise;
            clearTimeout(timer);
            resolve(res);
        } catch (err) {
            clearTimeout(timer);
            reject(err);
        }
    });
}

export function getNetworkName(networkId) {
    return NETWORKS[networkId] || `Unknown (id: ${networkId})`;
}

export function createUrl(url, params) {
    const i = url.indexOf("?");
    const origSearch = i >= 0 ? url.slice(i + 1) : "";
    const origPath = i >= 0 ? url.slice(0, i) : url;
    const qs = new URLSearchParams(origSearch);

    if (params) {
        for (const key in params) {
            if (params[key] !== null && params[key] !== "") {
                qs.set(key, params[key]);
            }
        }
    }

    const search = qs.toString();
    return origPath + (search ? "?" + search : "");
}

export function fixAmount(amount) {
    return parseFloat(amount.split(",").join("."));
}

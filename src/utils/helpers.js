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

export function getMobilePlatform() {
    const platform = navigator.platform;
    let ios;
    let android;

    if (platform) {
        ios = /iPad|iPhone|iPod/.test(platform);
        android = /Android/.test(platform);
    }

    return { ios: ios, android: android };
}

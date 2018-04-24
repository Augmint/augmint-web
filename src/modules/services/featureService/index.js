import React from "react";

const FEATURE_PREFIX = "f_";

// set deterministic flags
const systemFeatures = {};

function setFeatureCookie(param) {
    // validate
    const flag = param.split('=');
    document.cookie = `${flag[0]}=${flag[1]}`;
}

function getFeaturesFromUrl() {
    const urlParams = window.location.search.substr(1);

    if (urlParams.includes(FEATURE_PREFIX)) {
        if (urlParams.includes("&")) {
            urlParams
                .split("&")
                .filter(param => param.includes(FEATURE_PREFIX))
                .map(param => setFeatureCookie(param));
        } else {
            setFeatureCookie(urlParams);
        }
    }
}

function getFeaturesFromCookie() {
    return document.cookie
        .split(";")
        .map(cookie => cookie.trim())
        .map(cookie => cookie.split("="))
        .reduce(function(acc, val) {
            const currKey = val[0].substr(2);
            acc[currKey] = val[1] === "false" ? false : val[1] === "true" ? true : val[1];
            return acc;
        }, {});
}

function getCombinedFeatures() {
    getFeaturesFromUrl();
    return Object.assign({}, systemFeatures, getFeaturesFromCookie());
}

export const FeatureContext = React.createContext(getCombinedFeatures());

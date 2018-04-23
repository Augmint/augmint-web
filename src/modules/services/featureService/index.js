import React from "react";

const FEATURE_PREFIX = 'f_';

// set deterministic flags
const systemFeatures = {};

function addFeatureFlag(param) {
    // validate
    const flag = param.split('=');
    const flagKey = flag[0].substr(2);
    const flagVal = flag[1] === 'false' ? false : flag[1] === 'true' ? true : flag[1];

    return {
        [flagKey]: flagVal
    };
}

function getFeaturesFromUrl() {
    const urlParams = window.location.search.substr(1);
    let userFeatures = {};

    if (urlParams.includes(FEATURE_PREFIX)) {
        if (urlParams.includes('&')) {
            userFeatures = urlParams.split('&')
                .filter(param => param.includes(FEATURE_PREFIX))
                .map(param => addFeatureFlag(param))
                .reduce(function(acc, val) {
                    const currKey = Object.keys(val)[0];
                    acc[currKey] = val[currKey];
                    return acc;
                }, {});
        } else {
            userFeatures = addFeatureFlag(urlParams);
        }
    }
    return userFeatures;
}

function getCombinedFeatures() {
    return Object.assign({}, systemFeatures, getFeaturesFromUrl());
}

export const FeatureContext = React.createContext(getCombinedFeatures());

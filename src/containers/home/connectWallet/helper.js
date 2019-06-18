import React from "react";
import chrome from "assets/images/chrome.svg";
import firefox from "assets/images/firefox.svg";
import opera from "assets/images/opera.svg";
import trust from "assets/images/trust.png";
import coinbase from "assets/images/coinbase.png";

const desktop = {
    name: "Desktop",
    text: [
        <span key="0">Install </span>,
        <a key="1" rel="noopener noreferrer" target="_blank" href="https://metamask.io/">
            Metamask
        </a>,
        <span key="2"> plugin for your browser</span>
    ],
    list: [
        {
            browser: "chrome",
            image: chrome,
            url: "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
        },
        {
            browser: "firefox",
            image: firefox,
            url: "https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/"
        },
        {
            browser: "opera",
            image: opera,
            url: "https://addons.opera.com/en/extensions/details/metamask/"
        }
    ]
};

const ios = {
    name: "iOS",
    text: "Install an Ethereum capable mobile browser for your iOS device",
    list: [
        {
            browser: "Coinbase wallet",
            os: "IOS",
            image: coinbase,
            url: "https://itunes.apple.com/app/coinbase-wallet/id1278383455?ls=1&mt=8"
        },
        {
            browser: "Trust wallet",
            os: "IOS",
            image: trust,
            url: "https://itunes.apple.com/us/app/trust-ethereum-wallet/id1288339409"
        }
    ]
};

const android = {
    name: "Android",
    text: "Install an Ethereum capable mobile browser for your Android device",
    list: [
        {
            browser: "Coinbase wallet",
            os: "android",
            image: coinbase,
            url: "https://play.google.com/store/apps/details?id=org.toshi"
        },
        {
            browser: "Trust wallet",
            os: "android",
            image: trust,
            url: "https://play.google.com/store/apps/details?id=com.wallet.crypto.trustapp"
        }
    ]
};

export { desktop, ios, android };

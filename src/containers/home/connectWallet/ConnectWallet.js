import React from "react";
import { DiscordButton, TelegramButton } from "components/LinkButtons";
import { browserLinks } from "./helper.js";

import "./styles.css";

function ConnectWallet(props) {
    const showHedaer = props.landingPage;

    let onMobile = [];
    browserLinks.mobile.forEach((b, i) => {
        onMobile.push(
            <li key={i}>
                <img src={b.image} alt={b.browser} />
                <a os={b.os} href={b.url} target="_blank">
                    {b.browser}
                </a>
            </li>
        );
    });

    let onDesktop = [];
    browserLinks.desktop.forEach((b, i) => {
        onDesktop.push(
            <li key={i}>
                <img src={b.image} alt={b.browser} />
                <a href={b.url} target="_blank">
                    {b.browser}
                </a>
            </li>
        );
    });

    return (
        <div className="connect-wallet" style={props.styles}>
            {showHedaer && <header>Connect wallet</header>}
            <section>
                <p>
                    To use <span style={{ fontWeight: "bold" }}>Augmint</span> you need an Ethereum capable browser.
                </p>
                <div className="content">
                    <div className="column">
                        <header>On desktop</header>
                        <div>
                            <p>
                                Install <a href="">Metamask</a> plugin for your browser
                            </p>
                            <ul>{onDesktop}</ul>
                        </div>
                    </div>
                    <div className="column">
                        <header>On mobile</header>
                        <div>
                            <p>Install Ethereum capable mobile browser</p>
                            <ul>{onMobile}</ul>
                        </div>
                    </div>
                </div>

                <DiscordButton />
                <TelegramButton />
            </section>
        </div>
    );
}

export default ConnectWallet;

import React from "react";
import { DiscordButton, TelegramButton } from "components/LinkButtons";
import { ios, desktop, android } from "./helper.js";
import { getMobilePlatform } from "utils/platformHelper.js";

import "./styles.css";

function ConnectWallet(props) {
    const showHedaer = props.landingPage;

    const platform = getMobilePlatform();
    let orderedList = [desktop, ios, android];

    if (platform.ios) {
        orderedList = [ios, android, desktop];
    } else if (platform.android) {
        orderedList = [android, ios, desktop];
    }

    function renderList(list) {
        return list.map((l, i) => {
            return (
                <li key={i}>
                    <img src={l.image} alt={l.browser} />
                    <a os={platform} href={l.url} rel="noopener noreferrer" target="_blank">
                        {l.browser}
                    </a>
                </li>
            );
        });
    }

    return (
        <div className="connect-wallet" style={props.styles}>
            {showHedaer && <header>Connect wallet</header>}

            <section>
                <p>
                    To use <span style={{ fontWeight: "bold" }}>Augmint</span> you need an Ethereum capable browser.
                </p>

                <div className="content">
                    {orderedList.map((card, i) => {
                        return (
                            <div key={i} className="column">
                                <header className={card.name}>{card.name}</header>
                                <div>
                                    <p>{card.text}</p>
                                    <ul>{renderList(card.list)}</ul>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <DiscordButton />
                <TelegramButton />
            </section>
        </div>
    );
}

export default ConnectWallet;

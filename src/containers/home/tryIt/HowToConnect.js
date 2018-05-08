import React from "react";

import { Tsegment } from "components/TextContent";
import { Link } from "react-router-dom";
import { DiscordButton } from "components/LinkButtons";

export function HowToConnect(props) {
    return (
        <Tsegment>
            <Tsegment.Row columns={1}>
                <Tsegment.Column>
                    <p>To use Augmint you need an Ethereum capable browser.</p>
                    <h4>
                        1. Install{" "}
                        <Link to="https://metamask.io/" target="_blank">
                            <strong>MetaMask Chrome plugin</strong>
                        </Link>
                    </h4>
                    <h4>2. Connect to Rinkeby test network</h4>
                    <iframe
                        title="connect to rinkeby"
                        width="100%"
                        height="100%"
                        style={{ "max-width": "640px", "max-height": "360px", height: "calc(100vw * 3/4 - 100px" }}
                        src="https://www.youtube.com/embed/0APcMesrZ_U"
                        frameborder="0"
                        allow="autoplay; encrypted-media"
                        allowfullscreen
                    />
                </Tsegment.Column>
            </Tsegment.Row>
            <Tsegment.Row columns={1}>
                <Tsegment.Column>
                    <DiscordButton />
                </Tsegment.Column>
            </Tsegment.Row>
        </Tsegment>
    );
}

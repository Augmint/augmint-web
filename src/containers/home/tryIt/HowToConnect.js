import React from "react";

import { Tsegment } from "components/TextContent";
import { Link } from "react-router-dom";
import { DiscordButton } from "components/LinkButtons";
import Video from "components/augmint-ui/video";

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
                    <Video title="connect to rinkeby" src="https://www.youtube.com/embed/0APcMesrZ_U" />
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

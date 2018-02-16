import React from "react";

import { Tsegment } from "components/TextContent";
import { Link } from "react-router-dom";
import { DiscordButton } from "components/LinkButtons";

export function HowToConnect(props) {
    return (
        <Tsegment>
            <Tsegment.Row centered columns={1}>
                <Tsegment.Column textAlign="center">
                    <p>To use Augmint you need an Ethereum capable browser:</p>
                    <p>
                        Install{" "}
                        <Link to="https://metamask.io/" target="_blank">
                            Metamask Chrome plugin
                        </Link>{" "}
                        <br />or<br />
                        <Link to="https://github.com/ethereum/mist/releases" target="_blank">
                            Mist browser
                        </Link>
                    </p>
                    <p>then connect to Rinkeby test network</p>
                </Tsegment.Column>
            </Tsegment.Row>
            <Tsegment.Row centered columns={1}>
                <Tsegment.Column textAlign="center">
                    <DiscordButton />
                    <p>
                        If you feel geeky you can{" "}
                        <Link
                            to="https://github.com/Augmint/augmint-web/blob/master/docs/developmentEnvironment.md"
                            target="_blank"
                        >
                            install it locally
                        </Link>.
                    </p>
                </Tsegment.Column>
            </Tsegment.Row>
        </Tsegment>
    );
}

import React from "react";

import { Tsegment, Tblock } from "components/TextContent";
import { Link } from "react-router-dom";
import { Button } from "semantic-ui-react";

export function DcmOverview(props) {
    return (
        <Tsegment>
            <Tblock header="Stable tokens">
                <p>Augmint offers digital tokens, value of each token pegged to a fiat currency.</p>
                <p>The first Augmint token will be Augmint Crypto Euro (ACE), pegged to Euro.</p>
                <p>The value of 1 ACE is expected closely around 1 EUR.</p>
                <p>
                    Augmint tokens are cryptocurrency tokens with all the benefits of cryptocurrencies: stored securely
                    in a decentralised manner and instantly transferable worldwide.
                </p>
            </Tblock>

            <Tblock header="Why?">
                <p>Cryptocurrencies are amazing for storing and transferring digital value in a decentralised way.</p>
                <p>
                    Their limited supply makes them a potential investment target but it also makes them less compelling
                    to use for ordinary payments.{" "}
                </p>
                <p>
                    Would you spend your Bitcoins to buy a laptop if you strongly believe the BTC price will go up?{" "}
                    <br />Would you agree to get your salary in a fixed Ethereum amount if you are unsure of the future
                    price of ETH?
                </p>
            </Tblock>

            <Tsegment.Row centered>
                <Button
                    content="Read more about the concept"
                    as={Link}
                    to="/concept#"
                    icon="right chevron"
                    labelPosition="right"
                    size="large"
                />
            </Tsegment.Row>
        </Tsegment>
    );
}

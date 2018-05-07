import React from "react";
import { Link } from "react-router-dom";
import { Tsegment } from "components/TextContent";
import decentLogo from "assets/images/decent-logo.svg";

const decentImg = (
    <a href="http://decent.org" target="_blank" rel="noopener noreferrer">
        <img src={decentLogo} style={{ maxWidth: "100%" }} alt="dacent logo" />
    </a>
);
export default () => (
    <Tsegment header="About us">
        <Tsegment.Row>
            <Tsegment.Column>{decentImg}</Tsegment.Column>
        </Tsegment.Row>
        <Tsegment.Row>
            <Tsegment.Column>
                <p>
                    Augmint is being built by people at{" "}
                    <Link to="http://decent.org" target="_blank">
                        Decent Labs
                    </Link>.
                </p>
            </Tsegment.Column>
        </Tsegment.Row>
    </Tsegment>
);

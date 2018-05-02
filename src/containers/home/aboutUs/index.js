import React from "react";
import { Link } from "react-router-dom";
import { Tsegment } from "components/TextContent";
import { Image } from "semantic-ui-react";
import decentLogo from "assets/images/decent-logo.svg";

const decentImg = <Image src={decentLogo} as="a" size="small" href="http://decent.org" target="_blank" />;
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

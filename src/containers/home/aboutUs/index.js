import React from "react";
import { Link } from "react-router-dom";
import { Tsegment } from "components/TextContent";
import { Image } from "semantic-ui-react";
import decentLogo from "assets/images/decent-logo.svg";

const decentImg = (
    <Image
        src={decentLogo}
        as="a"
        size="small"
        href="http://decent.org"
        target="_blank"
    />
);
export default () => (
    <Tsegment header="About us">
        <Tsegment.Row textAlign="centered">{decentImg}</Tsegment.Row>
        <Tsegment.Row textAlign="centered">
            <p>
                DCM is being built by people at{" "}
                <Link to="http://decent.org" target="_blank">
                    Decent Labs
                </Link>.
            </p>
        </Tsegment.Row>
    </Tsegment>
);

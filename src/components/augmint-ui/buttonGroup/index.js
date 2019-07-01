import React from "react";
import styled from "styled-components";
import WatchAssetButton from "components/watchAssetButton";
import Button from "components/augmint-ui/button";
import { media } from "styles/media";

const Container = styled.div`
    width: 100%;
    min-width: 250px;
    padding-top: 10px;
    margin: auto;
    display: flex;
    text-align: center;
    justify-content: space-between;

    a {
        flex: 1;
        margin: 0 0.2rem;
        padding: 0 0 10px;
        ${media.tabletMin`
            font-size: 1rem;
        `};
    }
`;

export default class ButtonGroup extends React.Component {
    render() {
        return (
            <Container>
                <Button
                    to="/exchange"
                    icon="reserves"
                    circleicon="true"
                    className="naked circle icon top"
                    labelposition="top"
                >
                    Exchange fiat
                </Button>
                <Button
                    to="/exchange"
                    icon="exchange"
                    circleicon="true"
                    className="naked circle icon top"
                    labelposition="top"
                >
                    Exchange crypto
                </Button>
                <Button
                    to="/transfer"
                    className="naked circle icon top"
                    icon="send"
                    circleicon="true"
                    data-testid="transferButton"
                    labelposition="top"
                >
                    Send
                </Button>
                <WatchAssetButton
                    className="naked icon top"
                    icon="wallet"
                    circleicon="true"
                    labelposition="top"
                    // style={{ flex: "1", margin: "0 .2rem", alignSelf: "auto", padding: "0 0 10px" }}
                    btn
                />
            </Container>
        );
    }
}

import React from "react";
import styled from "styled-components";
import { default as theme, remCalc } from "styles/theme";
import WatchAssetButton from "components/watchAssetButton";
import Button from "components/augmint-ui/button";

const Container = styled.div`
    width: 100%;
    text-align: center;
    display: flex;
    justify-content: space-between;
`;

export default class ButtonGroup extends React.Component {
    render() {
        return (
            <Container style={{ paddingTop: "10px", minWidth: "250px", width: "100%", margin: "auto" }}>
                <Button
                    to="/exchange"
                    icon="reserves"
                    circleicon="true"
                    className="naked circle icon top"
                    labelposition="top"
                    style={{ flex: "1", margin: "0 5px 0 0", padding: "0 0 10px" }}
                >
                    Exchange fiat
                </Button>
                <Button
                    to="/exchange"
                    icon="exchange"
                    circleicon="true"
                    className="naked circle icon top"
                    labelposition="top"
                    style={{ flex: "1", margin: "0 5px", padding: "0 0 10px" }}
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
                    style={{ flex: "1", margin: "0 5px", padding: "0 0 10px" }}
                >
                    Send
                </Button>
                <WatchAssetButton
                    className="naked icon top"
                    icon="wallet"
                    circleicon="true"
                    labelposition="top"
                    style={{ flex: "1", margin: "0 0 0 5px", alignSelf: "auto", padding: "0 0 10px" }}
                    breakToLines
                />
            </Container>
        );
    }
}

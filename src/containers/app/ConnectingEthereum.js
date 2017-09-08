import React from "react";
import { Container, Message, Icon } from "semantic-ui-react";

export function ConnectingEthereum(props) {
    return (
        <Container style={{ margin: "1em" }}>
            <Message icon info>
                <Icon name="circle notched" loading />
                <Message.Header>
                    Connecting to Ethereum network...
                </Message.Header>
            </Message>
        </Container>
    );
}

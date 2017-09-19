import React from "react";

import { Tsegment } from "components/TextContent";
import { Link } from "react-router-dom";
import { Button, Header } from "semantic-ui-react";
import SubscribeForm from "./SubscribeForm";

export function ProjectStatus(props) {
    return (
        <Tsegment header="Project status">
            <Tsegment.Row
                columns={1}
                verticalAlign="middle"
                textAlign="center"
                centered
            >
                <Header as="h3">
                    Working proof-of-concept implementation on Ethereum
                </Header>
            </Tsegment.Row>
            <Tsegment.Row
                columns={2}
                verticalAlign="middle"
                textAlign="center"
                centered
            >
                <Tsegment.Column textAlign="center">
                    <Button
                        content="Try it out"
                        as={Link}
                        to="/tryit"
                        icon="right chevron"
                        labelPosition="right"
                        primary
                        size="large"
                    />
                </Tsegment.Column>
                <Tsegment.Column textAlign="center">
                    <Button
                        content="Check it on GitHub"
                        as={Link}
                        to="https://github.com/DecentLabs/dcm-poc"
                        icon="github"
                        labelPosition="left"
                        target="_blank"
                        size="large"
                    />
                </Tsegment.Column>
            </Tsegment.Row>
            <Tsegment.Row
                columns={1}
                verticalAlign="middle"
                textAlign="center"
                centered
            >
                <p>
                    We're clarifying the details of{" "}
                    <Link to="/concept">the concept</Link> , expanding our team
                    and fleshing out the roadmap.
                </p>
            </Tsegment.Row>

            <Tsegment.Row
                columns={2}
                divided
                verticalAlign="middle"
                textAlign="center"
                centered
            >
                <Tsegment.Column textAlign="center">
                    <Button
                        content="Say hello on our gitter channel"
                        as={Link}
                        to="https://gitter.im/digital-credit-money/Lobby?utm_source=ProjectStatus&utm_medium=web&utm_campaign=init"
                        icon="chat"
                        labelPosition="left"
                        target="_blank"
                        size="large"
                    />
                </Tsegment.Column>
                <Tsegment.Column textAlign="center">
                    <SubscribeForm />
                </Tsegment.Column>
            </Tsegment.Row>
        </Tsegment>
    );
}

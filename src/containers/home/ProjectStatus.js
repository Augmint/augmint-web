import React from "react";

import { Tsegment } from "components/TextContent";
import { Link } from "react-router-dom";
import { Button, Divider } from "semantic-ui-react";
import SubscribeForm from "./SubscribeForm";

export function ProjectStatus(props) {
    return (
        <Tsegment header="Project status">
            <Tsegment.Row>
                <p>
                    We're clarifying the details of our concept, expanding our
                    team and fleshing out the roadmap.
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
                        to="https://gitter.im/digital-credit-money/Lobby?utm_source=mainpage&utm_medium=web&utm_campaign=init"
                        icon="chat"
                        labelPosition="left"
                        target="_blank"
                        size="large"
                    />
                    <Divider hidden />
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
                <Tsegment.Column textAlign="center">
                    <SubscribeForm />
                </Tsegment.Column>
            </Tsegment.Row>
        </Tsegment>
    );
}

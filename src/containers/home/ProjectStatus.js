import React from "react";

import { Tsegment } from "components/TextContent";
import { Link } from "react-router-dom";
import { Button } from "semantic-ui-react";

export function ProjectStatus(props) {
    return (
        <Tsegment header="Project status">
            <Tsegment.Row>
                <p>
                    We're clarifying the details of our concept, expanding our
                    team and fleshing out the roadmap.
                </p>
            </Tsegment.Row>

            <Tsegment.Row centered>
                <Button
                    content="Say hello on our gitter channel"
                    as={Link}
                    to="https://gitter.im/digital-credit-money/Lobby?utm_source=mainpage&utm_medium=web&utm_campaign=init"
                    icon="chat"
                    labelPosition="left"
                    target="_blank"
                    size="large"
                />

                {/* <Divider as="h4" horizontal style={{ margin: "2em 0em" }}>
                    Or
                </Divider>
                <Button
                    content="Say hello on our gitter channel"
                    as={Link}
                    to="https://gitter.im/digital-credit-money/Lobby?utm_source=share-link&utm_medium=link&utm_campaign=share-link"
                    icon="right chevron"
                    labelPosition="right"
                    basic
                    target="_blank"
                    size="large"
                /> */}
            </Tsegment.Row>
        </Tsegment>
    );
}

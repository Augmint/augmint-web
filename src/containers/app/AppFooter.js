import React from "react";
import { Segment, Container, List } from "semantic-ui-react";
import { NavLink } from "react-router-dom";

export function AppFooter(props) {
    return (
        <Segment inverted>
            <Container>
                <List horizontal inverted divided link>
                    <List.Item
                        as={NavLink}
                        to="/under-the-hood"
                        content="Under the hood"
                    />
                </List>
            </Container>
        </Segment>
    );
}

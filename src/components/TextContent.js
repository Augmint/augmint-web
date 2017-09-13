import React from "react";
import { Container, Header, Segment, Grid } from "semantic-ui-react";

export function Tsegment(props) {
    const {
        children,
        header,
        textAlign = "center",
        style = { padding: "2em 0em" },
        ...other
    } = props;
    return (
        <Segment vertical textAlign={textAlign} style={style} {...other}>
            <Container text>
                {header && (
                    <Header
                        as="h2"
                        content={header}
                        style={{
                            fontSize: "2em",
                            padding: "0.5em"
                        }}
                    />
                )}
                <Grid container stackable>
                    {children}
                </Grid>
            </Container>
        </Segment>
    );
}

Tsegment.Row = Grid.Row;

export function SubHeader(props) {
    const { children, header, ...other } = props;
    return (
        <Header as="h4" content={header} {...other}>
            {children}
        </Header>
    );
}

export function Tblock(props) {
    const { children, header } = props;
    return (
        <Grid.Row columns={2}>
            <Grid.Column textAlign="left" width={6}>
                <Header
                    as="h3"
                    content={header}
                    style={{
                        fontSize: "1.4em"
                    }}
                />
            </Grid.Column>
            <Grid.Column width={10} textAlign="justified">
                {children}
            </Grid.Column>
        </Grid.Row>
    );
}

Tblock.SubHeader = SubHeader;

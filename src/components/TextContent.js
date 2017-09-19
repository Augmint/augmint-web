import React from "react";
import { Container, Header, Segment, Grid } from "semantic-ui-react";

export function Theader(props) {
    // TODO: this doesn't align the header container to center when embedded in children (and not from Tsegment header prop)
    const {
        as = "h2",
        style = {
            fontSize: "2em",
            padding: "0.5em"
        },
        children,
        header,
        subheader,
        ...other
    } = props;
    return (
        <Header as={as} style={style} {...other}>
            {header}
            {subheader && (
                <Header.Subheader
                    content={subheader}
                    style={{
                        fontSize: "1em",
                        marginTop: "0.5em"
                    }}
                />
            )}
            {children}
        </Header>
    );
}

export function Tsegment(props) {
    const {
        children,
        header,
        subheader,
        textAlign = "center",
        vertical = true,
        style = { padding: "2em 0em" },
        ...other
    } = props;
    return (
        <Segment
            vertical={vertical}
            textAlign={textAlign}
            style={style}
            {...other}
        >
            <Container text>
                {header && <Theader header={header} subheader={subheader} />}
                <Grid container stackable>
                    {children}
                </Grid>
            </Container>
        </Segment>
    );
}

Tsegment.Row = Grid.Row;
Tsegment.Column = Grid.Column;
Tsegment.Header = Theader;

export function TblockSubHeader(props) {
    const { children, header, ...other } = props;
    return (
        <Header as="h4" content={header} {...other}>
            {children}
        </Header>
    );
}

export function Tblock(props) {
    const { children, header, textAlign = "justified" } = props;
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
            <Grid.Column width={10} textAlign={textAlign}>
                {children}
            </Grid.Column>
        </Grid.Row>
    );
}

Tblock.SubHeader = TblockSubHeader;

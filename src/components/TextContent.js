import React from "react";
import Grid from "styled-components-grid";
import Container from "./augmint-ui/container";
import Header from "./augmint-ui/header";

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
    const { children, header, subheader, style = { padding: "28px 0em", textAlign: "center" }, ...other } = props;
    return (
        <div style={style} {...other}>
            <Container text="true">
                {header && <Theader header={header} subheader={subheader} />}
                <div>{children}</div>
            </Container>
        </div>
    );
}

export function TsegmentRow(props) {
    const { children, style, ...other } = props;
    return (
        <Grid style={{ padding: "14px 0", style }} wrap={false} {...other}>
            {children}
        </Grid>
    );
}

Tsegment.Row = TsegmentRow;
Tsegment.Column = Grid.Unit;
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
    const { children, header } = props;
    return (
        <Grid wrap={false} style={{ padding: "14px 0" }} columns={2}>
            <Grid.Unit style={{ textAlign: "left" }} width={6}>
                <Header
                    as="h3"
                    content={header}
                    style={{
                        fontSize: "1.4em"
                    }}
                />
            </Grid.Unit>
            <Grid.Unit width={10} style={{ textAlign: "left" }}>
                {children}
            </Grid.Unit>
        </Grid>
    );
}

Tblock.SubHeader = TblockSubHeader;

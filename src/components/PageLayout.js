import React from "react";
import { Container, Header, Segment, Grid } from "semantic-ui-react";

export function Pheader(props) {
    const { children, header, ...other } = props;
    return (
        <Container {...other}>
            <Header as="h1">{header}</Header>
            {children}
        </Container>
    );
}

export class Psegment extends React.Component {
    render() {
        const { children, style, vertical, ...other } = this.props;

        return (
            <Segment style={style} vertical={vertical} {...other}>
                {children}
            </Segment>
        );
    }
}

Psegment.defaultProps = {
    style: { padding: "2em 2em" },
    vertical: true
};

export class Pgrid extends React.Component {
    render() {
        const { children, container, stackable, ...other } = this.props;

        return (
            <Grid container={container} stackable={stackable} {...other}>
                {children}
            </Grid>
        );
    }
}

Pgrid.Column = Grid.Column;
Pgrid.Row = Grid.Row;

Pgrid.defaultProps = {
    stackable: true,
    container: true
};

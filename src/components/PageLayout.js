import React from "react";
import { Divider, Segment, Grid } from "semantic-ui-react";
import Container from "../components/augmint-ui/container";
import Header from "../components/augmint-ui/header";

export function Pheader(props) {
    const { children, header, ...other } = props;
    return (
        <Container {...other}>
            {header && <Header as="h1">{header}</Header>}
            {children}
            <Divider />
        </Container>
    );
}

Pheader.defaultProps = {
    style: { margin: "1em 0" }
};

export function Pcontainer(props) {
    const { children, ...other } = props;
    return <Container {...other}>{children}</Container>;
}

Pcontainer.defaultProps = {
    style: { margin: "2em 0" }
};

export class Psegment extends React.Component {
    render() {
        const { children, ...other } = this.props;
        return <Segment {...other}>{children}</Segment>;
    }
}

Psegment.defaultProps = {
    style: { padding: "2em 2em" },
    vertical: true
};

export class Pgrid extends React.Component {
    render() {
        const { children, ...other } = this.props;
        return <Grid {...other}>{children}</Grid>;
    }
}

Pgrid.defaultProps = {
    stackable: true,
    container: true
};

export class Pcolumn extends React.Component {
    render() {
        const { children, ...other } = this.props;
        return <Grid.Column {...other}>{children}</Grid.Column>;
    }
}

Pcolumn.defaultProps = {
    style: {
        paddingBottom: "1em",
        paddingTop: "1em"
    }
};

Pgrid.Column = Pcolumn;
Pgrid.Row = Grid.Row;

export function Pblock(props) {
    const { children, header, ...other } = props;
    return (
        <Segment basic {...other}>
            <Header as="h2" content={header} />
            {children}
        </Segment>
    );
}

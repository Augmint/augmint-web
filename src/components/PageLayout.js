import React from "react";
import Grid from "styled-components-grid";
import Container from "components/augmint-ui/container";
import Header from "components/augmint-ui/header";
import Divider from "components/augmint-ui/divider";
import Segment from "components/augmint-ui/segment";

import theme from "styles/theme";

import { FeatureContext } from "modules/services/featureService";

export function Pheader(props) {
    const { children, header, className, ...other } = props;
    return <Container {...other}>
        {header && <Header className={className} as="h1">{header}</Header>}
        {children}
        <FeatureContext.Consumer>
            {features => (features.dashboard ? null : <Divider />)}
        </FeatureContext.Consumer>

    </Container>;
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
    style: { margin: "0 auto", padding: "2em 2em", maxWidth: theme.pageSize.maxSize },
    vertical: true
};

export class Pgrid extends React.Component {
    render() {
        const { children, ...other } = this.props;
        return <div {...other}>{children}</div>;
    }
}

export class Pcolumn extends React.Component {
    render() {
        const { children, ...other } = this.props;
        return <Grid.Unit {...other}>{children}</Grid.Unit>;
    }
}

Pcolumn.defaultProps = {
    style: {
        padding: "1rem"
    }
};

Pgrid.Column = Pcolumn;
Pgrid.Row = Grid;

export function Pblock(props) {
    return (
        <FeatureContext.Consumer>
            {
                features => {
                    const BlockEl = features.dashboard ? DashBlock : LegacyPblock;
                    return (
                        <BlockEl {...props} />
                    );
                }
            }
        </FeatureContext.Consumer>
    );
}

function LegacyPblock(props) {
    const { children, header, ...other } = props;
    return (
        <Segment {...other}>
            <Header as="h2" content={header} />
            {children}
        </Segment>
    );
}

function DashBlock(props) {
    const { children, header, className, ...other } = props;
    const newClassName = className ? `${className} dashblock` : `dashblock`;
    const rest = Object.assign({}, { ...other }, { className: newClassName });

    return (
        <Segment basic {...rest} >
            {(header) ?
                <div className="dashblock__head">
                    <Header as="h2" content={header} />
                </div> : null
            }
            <div className="dashblock__content">
                {children}
            </div>
        </Segment>
    );
}

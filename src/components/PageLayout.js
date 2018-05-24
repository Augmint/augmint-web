import React from "react";
import { Container, Divider, Header, Segment, Grid } from "semantic-ui-react";

import { FeatureContext } from "modules/services/featureService";

export function Pheader(props) {
    const { children, header, className, ...other } = props;
    return <FeatureContext.Consumer>
            {features => {
                if (features.dashboard) {
                    return <Container {...Object.assign({}, { ...other }, { className: `${className} dashhead` })}>
                            {header && <Header as="h1">{header}</Header>}
                            {children}
                        </Container>;
                } else {
                    return <Container {...other}>
                            {header && <Header as="h1">{header}</Header>}
                            {children}
                            <Divider />
                        </Container>;
                }
            }}
        </FeatureContext.Consumer>;
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
        <Segment basic {...other}>
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

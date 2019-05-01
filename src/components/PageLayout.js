import React from "react";
import Grid from "styled-components-grid";
import Container from "components/augmint-ui/container";
import Header from "components/augmint-ui/header";
import Segment from "components/augmint-ui/segment";

import theme from "styles/theme";

export function Pheader(props) {
    const { children, header, className, ...other } = props;
    const _className = (className ? className + " " : "") + "mediumGrey";
    return (
        <Container {...other}>
            {header && (
                <Header className={_className} as="h1">
                    {header}
                </Header>
            )}
            {children}
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
        const { children, left, ...other } = this.props;
        return <Segment {...other}>{children}</Segment>;
    }
}

Psegment.defaultProps = {
    style: { margin: "0 auto", padding: "1em 0", maxWidth: theme.pageSize.maxSize },
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

Pgrid.Column = Pcolumn;
Pgrid.Row = Grid;

export function Pblock(props) {
    return <DashBlock {...props} />;
}

function DashBlock(props) {
    const { children, header, style, className, noMargin, ...other } = props;
    const newClassName = className ? `${className} dashblock` : `dashblock`;
    const rest = Object.assign({}, { ...other }, { className: newClassName });

    const contentStyles = header
        ? { overflow: "auto", borderRadius: "0 0 4px 4px" }
        : { overflow: "auto", borderRadius: "4px" };

    const _style = style ? style : { borderRadius: "4px" };

    return (
        <Segment basic {...rest} style={_style}>
            {header ? (
                <div className="dashblock__head" style={{ borderRadius: "4px 4px 0 0" }}>
                    <Header as="h2" content={header} />
                </div>
            ) : null}
            <div className="dashblock__content" style={contentStyles}>
                {children}
            </div>
        </Segment>
    );
}

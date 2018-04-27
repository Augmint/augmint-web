import React from "react";
import Grid from "styled-components-grid";
import Header from "./augmint-ui/header";

export function MyListGroup(props) {
    const { children, container = "false", style = { margin: "0em 0em" }, ...other } = props;
    return (
        <div style={style} container={container} {...other}>
            {children}
        </div>
    );
}

export function MyListGroupRow(props) {
    const { children, header, style /*= { margin: "0em 0em" }*/, ...other } = props;
    return (
        <Grid style={style} wrap={false} {...other}>
            {header && <h3>{header}</h3>}
            {children}
        </Grid>
    );
}
MyListGroup.Row = MyListGroupRow;

export function MyListGroupColumn(props) {
    const { children, header, style = { padding: "0.5em 0", margin: "0em 0" }, width, ...other } = props;
    return (
        <Grid.Unit style={style} size={width} {...other}>
            {header && <Header as="h3">{header}</Header>}
            {children}
        </Grid.Unit>
    );
}
MyListGroup.Col = MyListGroupColumn;

export function MyGridTable(props) {
    const { children, header, style = { margin: "0.5em 0em" }, ...other } = props;
    return (
        <div style={style} {...other}>
            {header && <h4>{header}</h4>}
            {children}
        </div>
    );
}

export function MyGridTableRow(props) {
    const { children, style = { padding: "0 0.5em" }, ...other } = props;
    return (
        <Grid style={style} wrap={false} {...other}>
            {children}
        </Grid>
    );
}
MyGridTable.Row = MyGridTableRow;

export function MyGridTableColumn(props) {
    const { children, header, style = { padding: "0.5em 0", margin: "0em 0" }, width, ...other } = props;
    return (
        <Grid.Unit style={style} size={width} {...other}>
            {header && <Header as="h3">{header}</Header>}
            {children}
        </Grid.Unit>
    );
}
MyGridTable.Column = MyGridTableColumn;
MyGridTable.Col = MyGridTableColumn;

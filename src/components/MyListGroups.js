import React from "react";
import { Grid, Header } from "semantic-ui-react";

export function MyListGroup(props) {
    const { children, divided = "vertically", container = false, style = { margin: "0em 0em" }, ...other } = props;
    return (
        <Grid stackable divided={divided} style={style} container={container} {...other}>
            {children}
        </Grid>
    );
}

export function MyListGroupRow(props) {
    const { children, header, style /*= { margin: "0em 0em" }*/, ...other } = props;
    return (
        <Grid.Row style={style} {...other}>
            {header && <h3>{header}</h3>}
            {children}
        </Grid.Row>
    );
}

MyListGroup.Row = MyListGroupRow;

export function MyGridTable(props) {
    const {
        children,
        header,
        divided = "vertically",
        style = { margin: "0.5em 0em" },
        stackable = true,
        container = false,
        ...other
    } = props;
    return (
        <Grid divided={divided} stackable={stackable} style={style} container={container} {...other}>
            {header && <h4>{header}</h4>}
            {children}
        </Grid>
    );
}

export function MyGridTableRow(props) {
    const { children, columns = 2, style = { padding: "0 0.5em" }, ...other } = props;
    return (
        <Grid.Row columns={columns} style={style} {...other}>
            {children}
        </Grid.Row>
    );
}
MyGridTable.Row = MyGridTableRow;

export function MyGridTableColumn(props) {
    const { children, header, style = { padding: "0.5em 0", margin: "0em 0" }, ...other } = props;
    return (
        <Grid.Column style={style} {...other}>
            {header && <Header as="h3">{header}</Header>}
            {children}
        </Grid.Column>
    );
}
MyGridTable.Column = MyGridTableColumn;

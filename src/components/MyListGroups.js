/* TODO: remove shadows and borders 
 */

import React from "react";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import "./MyListGroups.css";

export function MyListGroup(props) {
    const { children, ...other } = props;
    return (
        <ListGroup {...other}>
            {children}
        </ListGroup>
    );
}

export function MyListGroupItem(props) {
    const { children, ...other } = props;
    return (
        <ListGroupItem {...other}>
            {children}
        </ListGroupItem>
    );
}

/* TODO: this is somehow not working: component renders but none of these props / children are being used.
        Altough it seems the same as MsgPanels
 */

import React from "react";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import "./mListGroups.css";

export function mListGroup(props) {
    const { children, ...other } = props;
    return (
        <ListGroup {...other}>
            {children}
        </ListGroup>
    );
}

export function mListGroupItem(props) {
    const { children, ...other } = props;
    return (
        <ListGroupItem {...other}>
            {children}
        </ListGroupItem>
    );
}

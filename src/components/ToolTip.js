import React from "react";
import { Popover, Glyphicon, OverlayTrigger } from "react-bootstrap";

export default function ToolTip(props) {
    const pop = (
        <Popover id="popover-basic" title={props.title}>
            <small>
                {props.children}
            </small>
        </Popover>
    );

    return (
        <OverlayTrigger
            rootClose={true}
            trigger="click"
            placement="right"
            overlay={pop}
        >
            <span>
                &nbsp;<Glyphicon glyph="question-sign" />
            </span>
        </OverlayTrigger>
    );
}

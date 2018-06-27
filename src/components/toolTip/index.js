import React from "react";
import Icon from "components/augmint-ui/icon";
import Header from "components/augmint-ui/header";

import { StyledToolTip, StyledContent } from "./styles";

export default function ToolTip(props) {
    const { id, children, header, icon, html, ...other } = props;
    return (
        <div style={{ display: "inline-block", marginRight: 5 }}>
            <Icon color="grey" name={icon ? icon : "help circle"} data-tip data-for={id} />
            <StyledToolTip
                id={id}
                place="right"
                effect="solid"
                type="info"
                multiline={true}
                html={html}
                className="customeTheme"
                delayHide={200}
            >
                {header && <div>{header}</div>}
                <StyledContent>{children}</StyledContent>
            </StyledToolTip>
        </div>
    );
}

export function MoreInfoTip(props) {
    const { ...other } = props;
    return <ToolTip icon="zoom" {...other} />;
}

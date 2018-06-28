import React from "react";
import Icon from "components/augmint-ui/icon";

import { StyledToolTip, StyledContent, StyledHeader } from "./styles";

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
                className="customTheme"
                delayHide={200}
            >
                {header && <StyledHeader as="h5">{header}</StyledHeader>}
                <StyledContent>{children}</StyledContent>
            </StyledToolTip>
        </div>
    );
}

export function MoreInfoTip(props) {
    const { ...other } = props;
    return <ToolTip icon="zoom" {...other} />;
}

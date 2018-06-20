import React from "react";
import Icon from "components/augmint-ui/icon";
import ToolTip from "components/ToolTip";

import { shortAccountAddresConverter } from "utils/converter";
import { StyledContainer, StyledClicked, StyledHint } from "./styles";

export default function AccountAddress(props) {
    const { account, showCopyIcon, title } = props;
    const _title = title != undefined ? title : "Account: ";

    function copyAddress(e) {
        let element = e.target;
        element.classList.add("clicked");
        const el = document.createElement("textarea");
        el.value = account.address;
        el.setAttribute("readonly", "");
        el.style.position = "absolute";
        el.style.left = "-9999px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
    }

    function removeClicked(e) {
        let element = e.target;
        element.classList.remove("clicked");
    }

    return (
        <StyledContainer onClick={copyAddress} onMouseLeave={removeClicked}>
            {_title + shortAccountAddresConverter(account.address)}
            {showCopyIcon && <Icon name="copy" style={{ paddingLeft: 5 }} />}
            <StyledHint>
                <StyledClicked>
                    <Icon name="check" />
                </StyledClicked>
            </StyledHint>
        </StyledContainer>
    );
}

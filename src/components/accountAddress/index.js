import React from "react";
import Icon from "components/augmint-ui/icon";

import { shortAccountAddresConverter } from "utils/converter";
import { StyledContainer, StyledClicked, StyledHint } from "./styles";

export default function AccountAddress(props) {
    const { address, showCopyIcon, title, shortAddress } = props;
    const _title = title !== undefined ? title : "Account: ";

    function copyAddress(e) {
        let element = e.target;
        if (element.attributes.name && element.attributes.name.nodeValue === "copy") {
            element = element.parentElement;
        }
        element.classList.add("clicked");
        const el = document.createElement("textarea");
        el.value = address;
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
        if (element.attributes.name && element.attributes.name.nodeValue === "copy") {
            element = element.parentElement;
        }
        element.classList.remove("clicked");
    }

    return (
        <StyledContainer onClick={copyAddress} onMouseLeave={removeClicked}>
            {_title + (shortAddress === true ? shortAccountAddresConverter(address) : address)}
            {showCopyIcon && (
                <Icon name="copy" style={{ paddingLeft: 5 }} onClick={copyAddress} onMouseLeave={removeClicked} />
            )}
            <StyledHint>
                <StyledClicked>
                    <Icon name="check" />
                </StyledClicked>
            </StyledHint>
        </StyledContainer>
    );
}

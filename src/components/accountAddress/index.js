import React from "react";
import Icon from "components/augmint-ui/icon";
import styled from "styled-components";
import theme from "styles/theme";

import { shortAccountAddresConverter } from "utils/converter";
// import { StyledContainer, StyledClicked, StyledHint } from "./styles";

const StyledClicked = styled.span`
    color: ${theme.colors.darkGreen};
    display: none;
`;

const StyledHint = styled.span`
    -webkit-font-smoothing: antialiased;
    color: ${theme.colors.white};
    display: none;
    position: absolute;
    background-color: ${theme.colors.primary};
    font-weight: lighter;
    padding: 5px 10px;
    border-radius: 5px;

    &::after {
        content: "Click to copy!";
    }
`;

const StyledContainer = styled.div`
    cursor: pointer;
    display: inline-block;
    font-weight: 400;

    &.clicked ${StyledClicked} {
        display: inline-block;
        padding-right: 5px;
    }

    &:hover ${StyledHint} {
        display: block;
    }

    &.clicked:hover ${StyledHint} {
        display: block;

        &::after {
            color: ${theme.colors.lightGreen};
            content: "Copied!";
        }
    }

    &.breakToLines {
        .onMobile {
            @media (max-width: 600px) {
                display: block;
                max-width: 260px;
            }
        }
    }

    &.bold {
        font-weight: 700;
    }
`;

export default function AccountAddress(props) {
    const { address, showCopyIcon, title, shortAddress, className } = props;
    const _title = title !== undefined ? title : "Account: ";
    // const _className = breakToLines ? (bold ? "breakToLines bold" : "breakToLines") : bold ? "bold" : "";

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
        <StyledContainer onClick={copyAddress} onMouseLeave={removeClicked} className={className}>
            {_title + (shortAddress === true ? shortAccountAddresConverter(address) : address)}
            {showCopyIcon && (
                <Icon name="copy" style={{ paddingLeft: 5 }} onClick={copyAddress} onMouseLeave={removeClicked} />
            )}
            {/* {showCopyLink && 
            } */}
            <StyledHint>
                <StyledClicked>
                    <Icon name="check" />
                </StyledClicked>
            </StyledHint>
        </StyledContainer>
    );
}

import React from "react";

import Icon from "components/augmint-ui/icon";

import { StyledTopNav, StyledTopNavUl, StyledTopNavLi, StyledTopNavLinkRight, StyledPrice } from "./styles";

export default props => (
    <StyledTopNav>
        <StyledTopNavUl>
            <StyledTopNavLi>
                <StyledPrice>
                    <span className="price">€/ETH 573.08</span>
                    <span className="last-update">(14:30 22/04/18)</span>
                </StyledPrice>
            </StyledTopNavLi>
            <StyledTopNavLi>
                <StyledTopNavLinkRight title="Your account" to="account">
                    <Icon name="account" />
                    <span>0x23423</span>
                </StyledTopNavLinkRight>
            </StyledTopNavLi>
            <StyledTopNavLi>
                <StyledTopNavLinkRight title="Under the hood" to="under-the-hood">
                    <Icon name="connect" />
                    <span>{props.web3Connect.network.name}</span>
                </StyledTopNavLinkRight>
            </StyledTopNavLi>
        </StyledTopNavUl>
    </StyledTopNav>
);

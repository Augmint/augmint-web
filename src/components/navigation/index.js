import React from "react";
import { Button } from "semantic-ui-react";

import {StyleNavLink, StyleNavItem, StyleNavList, StyledLogoContainer, StyledNavContainer, StyledLogo} from './styles';


import augmintLogo from "assets/images/logo/logo.png";
import augmintLogo2x from "assets/images/logo/logo@2x.png";
import augmintLogo3x from "assets/images/logo/logo@3x.png";

function AppMenuItem(props) {
    return (
        <StyleNavItem>
            <StyleNavLink {...props}>
                {props.children}
            </StyleNavLink>
        </StyleNavItem>
    )
}

export function AppMenu(props) {
    const { isConnected, network } = props.web3Connect;
    const { location } = props;

    const currentLocation = location.pathname;

    return (
        <div>
            <StyledNavContainer>
                <StyleNavList>
                    <AppMenuItem active={currentLocation === "/"} to="/">Home</AppMenuItem>

                    <AppMenuItem active={currentLocation === "/concept"} to="/concept">Concept</AppMenuItem>
                    {isConnected && (
                        <AppMenuItem active={currentLocation === "/account"} to="/account">My Account</AppMenuItem>
                    )}
                    {isConnected && (
                        <AppMenuItem active={currentLocation === "/exchange"} to="/exchange">Buy/Sell A-EUR</AppMenuItem>
                    )
                    }
                    {isConnected && (
                        <AppMenuItem active={currentLocation === "/loan/new"} to="/loan/new">Get A-EUR Loan</AppMenuItem>
                    )
                    }
                    {isConnected && (
                        <AppMenuItem active={currentLocation === "/reserves"} to="/reserves">Reserves</AppMenuItem>
                    )
                    }
                </StyleNavList>
                <Button id="useAEurButton" to="/tryit">
                    Use A-EUR
                </Button>
            </StyledNavContainer>
            <StyledLogoContainer>

                <StyledLogo src={augmintLogo} srcSet={`${augmintLogo2x} 2x, ${augmintLogo3x} 3x,`} alt="Augmint logo" />
            </StyledLogoContainer>
            {/* to="/under-the-hood" */}
        </div>
    );
}

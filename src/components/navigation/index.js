import React from "react";
import Button from "../button";

import {
    StyleNavLink,
    StyleNavItem,
    StyleNavList,
    StyledLogoContainer,
    StyledNavContainer,
    StyledLogo
} from './styles';


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
                    <AppMenuItem isActive={() => currentLocation === "/"} to="/">Home</AppMenuItem>

                    <AppMenuItem isActive={() => currentLocation === "/concept"} to="/concept">Concept</AppMenuItem>
                    {isConnected && (
                        <AppMenuItem isActive={() => currentLocation === "/account"} to="/account">My Account</AppMenuItem>
                    )}
                    {isConnected && (
                        <AppMenuItem isActive={() => currentLocation === "/exchange"} to="/exchange">Buy/Sell A-EUR</AppMenuItem>
                    )
                    }
                    {isConnected && (
                        <AppMenuItem isActive={() => currentLocation === "/loan/new"} to="/loan/new">Get A-EUR Loan</AppMenuItem>
                    )
                    }
                    {isConnected && (
                        <AppMenuItem isActive={() => currentLocation === "/reserves"} to="/reserves">Reserves</AppMenuItem>
                    )
                    }
                </StyleNavList>
                <Button type="a" tid="useAEurButton" to="/tryit" color="primary">
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

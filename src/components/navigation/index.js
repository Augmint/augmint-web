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
    const isNotTryItPage = currentLocation !== "/tryit";
    const showConnection = (["/account", "/exchange", "/loan/new", "/reserves", "/tryit"].indexOf(currentLocation) > -1);

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
                {(!showConnection && !isConnected ) && (
                    <Button type="a" tid="useAEurButton" to="/tryit" color="primary">
                        Use A-EUR
                    </Button>
                )}
                {isConnected && (
                  <div>
                      Connected on {network.name}
                  </div>
                )}
                {( showConnection && !isConnected ) && (
                    <div>
                        Not connected
                    </div>
                )}
            </StyledNavContainer>
            <StyledLogoContainer>

                <StyledLogo src={augmintLogo} srcSet={`${augmintLogo2x} 2x, ${augmintLogo3x} 3x,`} alt="Augmint logo" />
            </StyledLogoContainer>
            {/* to="/under-the-hood" */}
        </div>
    );
}

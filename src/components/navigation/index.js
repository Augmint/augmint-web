import React from "react";
import Button from "../button";

import {
    StyleNavLink,
    StyleNavItem,
    StyleNavList,
    StyledLogoContainer,
    StyledNavContainer,
    StyledLogo,
    HamburgerMenu
} from "./styles";

import augmintLogo from "assets/images/logo/logo.png";
import augmintLogo2x from "assets/images/logo/logo@2x.png";
import augmintLogo3x from "assets/images/logo/logo@3x.png";
import hamburgerMenu from "assets/images/menu.svg";
import close from "assets/images/close.svg";

function AppMenuItem(props) {
    return (
        <StyleNavItem>
            <StyleNavLink {...props}>{props.children}</StyleNavLink>
        </StyleNavItem>
    );
}

export default class AppMenu extends React.Component {
    constructor(props) {
        super(props);
        this.toggleMenu = this.toggleMenu.bind(this);
    }
    toggleMenu() {
        this.props.toggleMenu();
    }

    render() {
        const { isConnected, network } = this.props.web3Connect;
        const { location } = this.props;

        const currentLocation = location.pathname;
        const showConnection =
            ["/account", "/exchange", "/loan/new", "/reserves", "/lock", "/tryit"].indexOf(currentLocation) > -1;

        return (
            <div>
                <StyledNavContainer className={this.props.showMenu ? "opened" : ""}>
                    <div>
                        <HamburgerMenu
                            src={this.props.showMenu ? close : hamburgerMenu}
                            onClick={this.toggleMenu}
                            id="hamburgerMenu"
                            className={this.props.showMenu ? "opened" : ""}
                        />
                        <StyleNavList className={this.props.showMenu ? "show" : "hidden"}>
                            <AppMenuItem isActive={() => currentLocation === "/"} to="/">
                                Home
                            </AppMenuItem>
                            <AppMenuItem isActive={() => currentLocation === "/concept"} to="/concept">
                                Concept
                            </AppMenuItem>
                            <AppMenuItem isActive={() => currentLocation === "/roadmap"} to="/roadmap">
                                Roadmap
                            </AppMenuItem>
                            {isConnected && (
                                <AppMenuItem
                                    isActive={() => currentLocation === "/account"}
                                    to="/account"
                                    data-testid="myAccountMenuLink"
                                >
                                    My Account
                                </AppMenuItem>
                            )}
                            {isConnected && (
                                <AppMenuItem
                                    isActive={() => currentLocation === "/exchange"}
                                    to="/exchange"
                                    data-testid="exchangeMenuLink"
                                >
                                    Buy/Sell A-EUR
                                </AppMenuItem>
                            )}
                            {isConnected && (
                                <AppMenuItem
                                    isActive={() => currentLocation === "/lock"}
                                    to="/lock"
                                    data-testid="lockMenuLink"
                                >
                                    Lock A-Euro
                                </AppMenuItem>
                            )}
                            {isConnected && (
                                <AppMenuItem
                                    isActive={() => currentLocation === "/loan/new"}
                                    to="/loan/new"
                                    data-testid="getLoanMenuLink"
                                >
                                    Get A-EUR Loan
                                </AppMenuItem>
                            )}
                            {isConnected && (
                                <AppMenuItem
                                    isActive={() => currentLocation === "/reserves"}
                                    to="/reserves"
                                    data-testid="reservesMenuLink"
                                >
                                    Reserves
                                </AppMenuItem>
                            )}
                        </StyleNavList>
                    </div>
                    {!showConnection &&
                        !isConnected && (
                            <Button type="a" data-testid="useAEurButton" to="/tryit" color="primary">
                                Use A-EUR
                            </Button>
                        )}
                    {isConnected && <div>Connected on {network.name}</div>}
                    {showConnection && !isConnected && <div>Not connected</div>}
                </StyledNavContainer>
                <StyledLogoContainer>
                    <StyledLogo
                        src={augmintLogo}
                        srcSet={`${augmintLogo2x} 2x, ${augmintLogo3x} 3x,`}
                        alt="Augmint logo"
                    />
                </StyledLogoContainer>
                {/* to="/under-the-hood" */}
            </div>
        );
    }
}

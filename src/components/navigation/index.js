import React from "react";
import Button from "components/augmint-ui/button";

import {
    StyleNavLink,
    StyleNavItem,
    StyleNavList,
    StyledLogoContainer,
    StyledNavContainer,
    StyledNavLeftSide,
    StyledLogo,
    HamburgerMenu
} from "./styles";

import { AugmintIcon } from "components/Icons";

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
                    <StyledNavLeftSide>
                        <HamburgerMenu
                            src={this.props.showMenu ? close : hamburgerMenu}
                            onClick={this.toggleMenu}
                            id="hamburgerMenu"
                            className={this.props.showMenu ? "opened" : ""}
                        />
                        {showConnection && <AugmintIcon className="augmint" />}
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
                        </StyleNavList>
                    </StyledNavLeftSide>
                    <Button type="a" data-testid="useAEurButton" to="/account" color="primary">
                        { !showConnection && isConnected ? "Account" : "Use A-EUR" }
                    </Button>
                    {showConnection && !isConnected && <div>Not connected</div>}
                </StyledNavContainer>
                <StyledLogoContainer>
                    {!showConnection && (
                        <StyledLogo
                            src={augmintLogo}
                            srcSet={`${augmintLogo2x} 2x, ${augmintLogo3x} 3x,`}
                            alt="Augmint logo"
                        />
                    )}
                </StyledLogoContainer>
            </div>
        );
    }
}

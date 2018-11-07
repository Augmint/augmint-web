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

function SiteMenuItem(props) {
    return (
        <StyleNavItem>
            <StyleNavLink {...props}>{props.children}</StyleNavLink>
        </StyleNavItem>
    );
}

export default class SiteMenu extends React.Component {
    constructor(props) {
        super(props);
        this.toggleMenu = this.toggleMenu.bind(this);
    }
    toggleMenu(e, noScroll) {
        this.props.toggleMenu();
        let siteBody = document.body;
        noScroll ? siteBody.classList.add("noScroll") : siteBody.classList.remove("noScroll");
    }

    render() {
        const { isConnected } = this.props.web3Connect;
        const { location } = this.props;

        const currentLocation = location.pathname;
        const showConnection =
            ["/account", "/exchange", "/loan/new", "/stability", "/lock", "/tryit"].indexOf(currentLocation) > -1;

        return (
            <div>
                <StyledNavContainer className={this.props.showMenu ? "opened" : ""}>
                    <StyledNavLeftSide>
                        <HamburgerMenu
                            src={this.props.showMenu ? close : hamburgerMenu}
                            onClick={e => this.toggleMenu(e, this.props.showMenu ? false : true)}
                            id="hamburgerMenu"
                            className={this.props.showMenu ? "opened" : ""}
                        />
                        {showConnection && <AugmintIcon className="augmint" />}
                        <StyleNavList className={this.props.showMenu ? "show" : "hidden"}>
                            <SiteMenuItem isActive={() => currentLocation === "/"} to="/">
                                Home
                            </SiteMenuItem>
                            <SiteMenuItem isActive={() => currentLocation === "/concept"} to="/concept">
                                Concept
                            </SiteMenuItem>
                            <SiteMenuItem isActive={() => currentLocation === "/roadmap"} to="/roadmap">
                                Roadmap
                            </SiteMenuItem>
                        </StyleNavList>
                    </StyledNavLeftSide>
                    <Button
                        type="a"
                        data-testid="useAEurButton"
                        to={!showConnection && isConnected ? "/account" : "/tryit"}
                        color="primary"
                        style={{ margin: "0", position: "absolute", top: "9px", right: "8px" }}
                    >
                        My Account
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

import React from "react";
import Button from "components/augmint-ui/button";

import {
    StyleNavLink,
    StyleNavItem,
    StyleNavList,
    StyledLogoContainer,
    StyledNavContainer,
    StyledNavLeftSide,
    StyledNavRightSide,
    StyledLogo,
    HamburgerMenu
} from "./styles";

import { AugmintIcon } from "components/Icons";

import augmintLogo from "assets/images/logo/logo.png";
import augmintLogo2x from "assets/images/logo/logo@2x.png";
import augmintLogo3x from "assets/images/logo/logo@3x.png";
import hamburgerMenu from "assets/images/menu.svg";
import close from "assets/images/close.svg";
import { toggleScroll } from "utils/bodyHelper";

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
        toggleScroll(noScroll);
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
                            <SiteMenuItem
                                onClick={e => toggleScroll(false)}
                                isActive={() => currentLocation === "/"}
                                to="/"
                            >
                                Home
                            </SiteMenuItem>
                            <SiteMenuItem
                                onClick={e => toggleScroll(false)}
                                isActive={() => currentLocation === "/concept"}
                                to="/concept"
                            >
                                Concept
                            </SiteMenuItem>
                            <SiteMenuItem
                                onClick={e => toggleScroll(false)}
                                isActive={() => currentLocation === "/roadmap"}
                                to="/roadmap"
                            >
                                Roadmap
                            </SiteMenuItem>
                            <SiteMenuItem
                                onClick={e => toggleScroll(false)}
                                isActive={() => currentLocation === "/team"}
                                to="/team"
                            >
                                Team
                            </SiteMenuItem>
                            <div className="segment" style={{ margin: "15px 0 140px 0", textAlign: "center" }}>
                                <Button
                                    onClick={e => toggleScroll(false)}
                                    type="a"
                                    to="/tryit"
                                    color="primary"
                                    className="try-now"
                                >
                                    Try now
                                </Button>
                            </div>
                        </StyleNavList>
                    </StyledNavLeftSide>

                    <StyledNavRightSide>
                        <Button type="a" to="/tryit" color="primary" className="try-now" data-testid="tryItButton">
                            Try now
                        </Button>
                        <Button
                            type="a"
                            data-testid="myAccountButton"
                            to="/account"
                            color="primary"
                            style={{ marginLeft: "15px" }}
                            onClick={e => toggleScroll(false)}
                        >
                            My Account
                        </Button>
                    </StyledNavRightSide>

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

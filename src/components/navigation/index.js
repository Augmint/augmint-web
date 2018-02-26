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
} from './styles';


import augmintLogo from "assets/images/logo/logo.png";
import augmintLogo2x from "assets/images/logo/logo@2x.png";
import augmintLogo3x from "assets/images/logo/logo@3x.png";
import hamburgerMenu from "assets/images/menu.png";

function AppMenuItem(props) {
    return (
        <StyleNavItem>
            <StyleNavLink {...props}>
                {props.children}
            </StyleNavLink>
        </StyleNavItem>
    )
}

export default class AppMenu extends React.Component {
    constructor(props) {
      super(props);
      this.openMenu = this.openMenu.bind(this);
    }
    openMenu() {
      if(!this.props.showMenu) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
        document.body.style = {'overflow-x': 'hidden'};
      }
      this.props.openMenu();
    }
    closeMenu() {
      if(this.props.showMenu) {
        document.body.style.overflow = 'auto';
        document.body.style = {'overflow-x': 'hidden'};
      }
      this.props.openMenu();
    }
    render() {
        const { isConnected, network } = this.props.web3Connect;
        const { location } = this.props;

        const currentLocation = location.pathname;
        const showConnection = (["/account", "/exchange", "/loan/new", "/reserves", "/tryit"].indexOf(currentLocation) > -1);

        return (
            <div>
                <StyledNavContainer className={this.props.showMenu ? 'opened' : ''}>
                    <div>
                        <HamburgerMenu src={hamburgerMenu} onClick={this.openMenu} id="hamburgerMenu" className={this.props.showMenu ? 'opened' : ''} />
                        <StyleNavList className={this.props.showMenu ? 'show' : 'hidden'}>
                            <AppMenuItem onClick={this.closeMenu} isActive={() => currentLocation === "/"} to="/">Home</AppMenuItem>
                            <AppMenuItem onClick={this.closeMenu} isActive={() => currentLocation === "/concept"} to="/concept">Concept</AppMenuItem>
                            <AppMenuItem onClick={this.closeMenu} isActive={() => currentLocation === "/roadmap"} to="/roadmap">Roadmap</AppMenuItem>
                            {isConnected && (
                                <AppMenuItem onClick={this.closeMenu} isActive={() => currentLocation === "/account"} to="/account">My Account</AppMenuItem>
                            )}
                            {isConnected && (
                                <AppMenuItem onClick={this.closeMenu} isActive={() => currentLocation === "/exchange"} to="/exchange">Buy/Sell A-EUR</AppMenuItem>
                            )
                            }
                            {isConnected && (
                                <AppMenuItem onClick={this.closeMenu} isActive={() => currentLocation === "/loan/new"} to="/loan/new">Get A-EUR Loan</AppMenuItem>
                            )
                            }
                            {isConnected && (
                                <AppMenuItem onClick={this.closeMenu} isActive={() => currentLocation === "/reserves"} to="/reserves">Reserves</AppMenuItem>
                            )
                            }
                        </StyleNavList>
                    </div>
                    {(!showConnection && !isConnected ) && (
                        <Button type="a" tid="useAEurButton" to="/tryit" color="primary" onClick={this.openMenu}>
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
}

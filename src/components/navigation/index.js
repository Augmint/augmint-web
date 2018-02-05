import React from "react";
import { Menu, Image, Segment, Button, Dropdown } from "semantic-ui-react";

import {StyleNavLink, StyleNavItem, StyleNavList, StyledLogoContainer} from './styles';


import augmintLogo from "assets/images/logo/logo.png";
import augmintLogo2x from "assets/images/logo/logo@2x.png";
import augmintLogo3x from "assets/images/logo/logo@3x.png";

function AppMenuItem(props) {
    console.log(props)
    return (
        <StyleNavItem>
            <StyleNavLink {...props}>
                {props.children}
            </StyleNavLink>
        </StyleNavItem>
    )
}

export function AppMenu(props) {
    const { isConnected, network, isLoading } = props.web3Connect;
    const { location } = props;

    const currentLocation = location.pathname;

    let connectionStatus;
    if (isLoading) {
        connectionStatus = "connecting...";
    } else if (isConnected) {
        connectionStatus = "on " + network.name;
    } else {
        connectionStatus = "not connected";
    }
    return (
        <div>
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
            <StyledLogoContainer>
                <img src={augmintLogo} srcSet={`${augmintLogo2x} 2x, ${augmintLogo3x} 3x,`} alt="Augmint logo" />
            </StyledLogoContainer>
        </div>
        // <div>
        //     <Menu size="large" style={{ margin: "0" }}>
        //         <Menu.Item active={currentLocation === "/"} as={Link} to="/">
        //             Home
        //         </Menu.Item>

        //         <Menu.Item active={currentLocation === "/concept"} as={Link} to="/concept">
        //             Concept
        //         </Menu.Item>

        //         {isConnected && (
        //             <Menu.Item as={NavLink} to="/account">
        //                 My Account
        //             </Menu.Item>
        //         )}
        //         {isConnected && (
        //             <Menu.Item as={NavLink} to="/exchange">
        //                 Buy/Sell A-EUR
        //             </Menu.Item>
        //         )}
        //         {isConnected && (
        //             <Menu.Item as={NavLink} to="/loan/new">
        //                 Get A-EUR Loan
        //             </Menu.Item>
        //         )}
        //         {isConnected && (
        //             <Menu.Item as={NavLink} to="/reserves">
        //                 Reserves
        //             </Menu.Item>
        //         )}

        //         <Menu.Menu position="right">
        //             <Menu.Item>
        //                 {isConnected ? (
        //                     <small>
        //                         <Dropdown text={connectionStatus}>
        //                             <Dropdown.Menu>
        //                                 <Dropdown.Item
        //                                     icon="settings"
        //                                     as={NavLink}
        //                                     to="/under-the-hood"
        //                                     text="Under the hood"
        //                                 />
        //                             </Dropdown.Menu>
        //                         </Dropdown>
        //                     </small>
        //                 ) : (
        //                     <Button as={NavLink} id="useAEurButton" to="/tryit">
        //                         Use A-EUR
        //                     </Button>
        //                 )}
        //             </Menu.Item>
        //         </Menu.Menu>
        //     </Menu>
        //     <Segment
        //         basic
        //         textAlign="center"
        //         style={{ display: "flex", justifyContent: "center", marginTop: "0", padding: "0" }}
        //     >
        //         <Image src={augmintLogo} srcSet={`${augmintLogo2x} 2x, ${augmintLogo3x} 3x,`} />
        //     </Segment>
        // </div>
    );
}

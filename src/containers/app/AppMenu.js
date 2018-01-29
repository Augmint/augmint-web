import React from "react";
import { Menu, Dropdown, Image, Segment, Button } from "semantic-ui-react";
import { Link, NavLink } from "react-router-dom";

import augmintLogo from "assets/images/logo/logo.png";
import augmintLogo2x from "assets/images/logo/logo@2x.png";
import augmintLogo3x from "assets/images/logo/logo@3x.png";

export function AppMenu(props) {
    const { isConnected, network, isLoading } = props.web3Connect;
    const { location } = props;
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
            <Menu size="large" style={{margin: '0'}}>
                    <Menu.Item
                        active={location.pathname === "/"}
                        as={Link}
                        to="/"
                    >
                        Home
                    </Menu.Item>

                    <Menu.Item
                        active={location.pathname === "/concept"}
                        as={Link}
                        to="/concept"
                    >
                        Concept
                    </Menu.Item>

                    {isConnected && (
                        <Menu.Item as={NavLink} to="/account">
                            My Account
                        </Menu.Item>
                    )}
                    {isConnected && (
                        <Menu.Item as={NavLink} to="/exchange">
                            Buy/Sell ACD
                        </Menu.Item>
                    )}
                    {isConnected && (
                        <Menu.Item as={NavLink} to="/loan/new">
                            Get ACD Loan
                        </Menu.Item>
                    )}
                    {isConnected && (
                        <Menu.Item as={NavLink} to="/reserves">
                            Reserves
                        </Menu.Item>
                    )}

                    <Menu.Menu position="right">
                        <Menu.Item>
                            <Button
                                as={NavLink}
                                to="/tryit"
                                >
                                Use A-EUro
                            </Button>
                        </Menu.Item>
                    </Menu.Menu>
            </Menu>
            <Segment basic textAlign="center" style={{display: 'flex', justifyContent: 'center', marginTop: '0', padding: '0', padding: '0'}}>
                <Image src={augmintLogo} srcSet={`${augmintLogo2x} 2x, ${augmintLogo3x} 3x,`}/>
            </Segment>
        </div>
    );
}

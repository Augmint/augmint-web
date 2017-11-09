import React from "react";
import { Segment, Container, Menu, Dropdown } from "semantic-ui-react";
import { Link, NavLink } from "react-router-dom";

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
        <Segment inverted style={{ margin: 0 }}>
            <Menu inverted pointing secondary stackable size="large">
                <Container>
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

                    <Menu.Item
                        active={location.pathname === "/tryit"}
                        as={Link}
                        to="/tryit"
                    >
                        Try it
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
                        <Menu.Item as={NavLink} to="/aboutUs">
                            About Us
                        </Menu.Item>

                        <Menu.Item>
                            <small>
                                <Dropdown text={connectionStatus}>
                                    <Dropdown.Menu>
                                        <Dropdown.Item
                                            icon="settings"
                                            as={NavLink}
                                            to="/under-the-hood"
                                            text="Under the hood"
                                        />
                                    </Dropdown.Menu>
                                </Dropdown>
                            </small>
                        </Menu.Item>
                    </Menu.Menu>
                </Container>
            </Menu>
        </Segment>
    );
}

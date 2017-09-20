import React from "react";
import { Segment, Container, Menu, Dropdown } from "semantic-ui-react";
import { Link, NavLink } from "react-router-dom";

export function AppMenu(props) {
    const { isConnected, network, isLoading } = props.web3Connect;
    const { location } = props;
    let connectionStatus;
    if (isLoading) {
        connectionStatus = <small>connecting...</small>;
    } else if (isConnected) {
        connectionStatus = <small>on {network.name}</small>;
    } else {
        connectionStatus = <small>not connected</small>;
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
                            Buy/Sell UCD
                        </Menu.Item>
                    )}
                    {isConnected && (
                        <Menu.Item as={NavLink} to="/loan/new">
                            Get UCD Loan
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

                        <Menu.Item as={Dropdown} text={connectionStatus}>
                            <Dropdown.Menu>
                                <Dropdown.Item
                                    icon="settings"
                                    as={NavLink}
                                    to="/under-the-hood"
                                    text="Under the hood"
                                />
                            </Dropdown.Menu>
                        </Menu.Item>
                    </Menu.Menu>
                </Container>
            </Menu>
        </Segment>
    );
}

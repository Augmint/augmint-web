import React from "react";
import { Segment, Container, Menu } from "semantic-ui-react";
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
                        <Menu.Item as={NavLink} to="/tokenUcd">
                            TokenUcd
                        </Menu.Item>
                    )}

                    <Menu.Menu position="right">
                        {/* <Menu.Item as={NavLink} to="/about-us">
                            About
                        </Menu.Item> */}
                        <Menu.Item as={NavLink} to="/under-the-hood">
                            Under the hood
                        </Menu.Item>
                        <Menu.Item as="p">{connectionStatus}</Menu.Item>
                    </Menu.Menu>
                </Container>
            </Menu>
        </Segment>
    );
}

import React from "react";

import Grid from "styled-components-grid";
import { ThemeProvider } from "styled-components";
import Container from "components/augmint-ui/container";
import Header from "components/augmint-ui/header";
import Button from "components/augmint-ui/button";
import Rail from "components/augmint-ui/rail";

import { InterchangeIcon } from "components/Icons";
import Convertible from "./../convertible.js";

import { keyFeatures, howItWorks } from "./helpers.js";

import { theme } from "styles/media";
import "./styles.css";
import * as styles from "./styles.js";

import { StyledLogo, StyledLogoContainer } from "components/navigation/styles";
import augmintLogo from "assets/images/logo/augmint.svg";

export default class NotConnectedHome extends React.Component {
    render() {
        return (
            <article>
                <Container className="homePage">
                    <section style={{ textAlign: "center" }} className="key-features segment">
                        <StyledLogoContainer>
                            <StyledLogo src={augmintLogo} alt="Augmint logo" />
                        </StyledLogoContainer>
                        <header className="key-features__header">
                            <Header textAlign="center" as="h1" size="large">
                                Modern money, beyond states.
                            </Header>
                            <Header
                                textAlign="center"
                                as="h5"
                                size="large"
                                style={{ fontSize: 20, lineHeight: "120%", margin: "14px 0" }}
                            >
                                Borderless, secure, transparent.
                                <br />
                                  Decentralized cryptocurrency without the volatility.
                            </Header>
                            <Header
                                textAlign="center"
                                as="h5"
                                size="large"
                                style={{ fontSize: 20, lineHeight: "120%", margin: "14px 0" }}
                            >
                                Our first token is A-EUR.
                            </Header>

                            <Convertible from="A-EUR" to="EUR" />

                            <a style={{ textDecoration: "underline" }} href="">
                                Learn more about the Augmint concept
                            </a>
                        </header>
                    </section>
                </Container>

                <section className="how-to-use segment">
                    <Rail className="noSmallScreen">
                        <a href="/tryit" tid="useAEurLinkSticky" style={styles.useAEurButton}>
                            <div style={styles.howItWorksRail}>
                                <div style={styles.howItWorksRailBox}>
                                    <div>1</div>
                                    <div style={styles.howItWorksRailBoxSpan}>Euro</div>
                                </div>
                                <InterchangeIcon />
                                <div style={styles.howItWorksRailBox}>
                                    <div>1</div>
                                    <div style={styles.howItWorksRailBoxSpan}>A-EUR</div>
                                </div>
                            </div>
                        </a>
                    </Rail>
                    <Container className="homePage">
                        <Header as="h2">Actually convertible</Header>

                        <ThemeProvider theme={theme}>
                            <Grid className="grid" style={{ justifyContent: "space-around" }}>
                                <Grid.Unit
                                    className="column"
                                    size={{ tablet: 1, desktop: 1 / 2 }}
                                    style={{ textAlign: "left", padding: "0 50px 0 0" }}
                                >
                                    <Convertible from="A-EUR" to="EUR" left simple />

                                    <p className="opac">
                                        Next-day conversion to and from SEPA
                                        <br />
                                        bank accounts via exchange partners.
                                    </p>
                                    <Button type="a" href="https://www.mrcoin.eu/en/buy/aeur" className="ghost">
                                        Buy A-EUR via partner
                                    </Button>
                                </Grid.Unit>

                                <Grid.Unit
                                    className="column"
                                    size={{ tablet: 1, desktop: 1 / 2 }}
                                    style={{ textAlign: "left", padding: 0 }}
                                >
                                    <Convertible from="A-EUR" to="ETH" left simple />

                                    <p className="opac">
                                        Buy or sell A-EUR instantly on our
                                        <br />
                                        decentralized crypto exchange.
                                    </p>

                                    <Button type="a" to="/exchange" className="ghost">
                                        Exchange crypto
                                    </Button>
                                </Grid.Unit>
                            </Grid>
                        </ThemeProvider>
                    </Container>
                </section>
            </article>
        );
    }
}

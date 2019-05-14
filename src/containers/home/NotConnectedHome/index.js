import React from "react";

import Grid from "styled-components-grid";
import { ThemeProvider } from "styled-components";
import Container from "components/augmint-ui/container";
import Header from "components/augmint-ui/header";
import Button from "components/augmint-ui/button";
import Rail from "components/augmint-ui/rail";

import { InterchangeIcon } from "components/Icons";
import Convertible from "./../convertible.js";

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
                    <section style={{ textAlign: "center", marginBottom: 50 }} className="key-features segment">
                        <StyledLogoContainer>
                            <StyledLogo src={augmintLogo} alt="Augmint logo" />
                        </StyledLogoContainer>

                        <header>
                            <Header textAlign="center" as="h1" size="large" className="homePage-header">
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
                                Decentralized cryptocurrency without the volatility. <br />
                                Our first token is A-EUR.
                            </Header>

                            <Convertible from="A-EUR" to="EUR" style={{ margin: "20px 0", justifyContent: "center" }} />

                            <a className="more-link" href="">
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
                        <ThemeProvider theme={theme}>
                            <div>
                                <Grid className="grid homePage-grid">
                                    <Grid.Unit className="row">
                                        <Header className="homePage-row-header" as="h3">
                                            Actually convertible
                                        </Header>
                                    </Grid.Unit>

                                    <Grid.Unit className="column homePage-column" size={{ tablet: 1, desktop: 1 / 2 }}>
                                        <Convertible from="A-EUR" to="EUR" left simple />

                                        <p className="opac">
                                            Next-day conversion to and from SEPA
                                            <br />
                                            bank accounts via exchange partners.
                                        </p>
                                        <Button
                                            style={{ marginTop: 10 }}
                                            type="a"
                                            href="https://www.mrcoin.eu/en/buy/aeur"
                                            className="ghost cta"
                                        >
                                            Buy A-EUR via partner
                                        </Button>
                                    </Grid.Unit>

                                    <Grid.Unit className="column homePage-column" size={{ tablet: 1, desktop: 1 / 2 }}>
                                        <Convertible from="A-EUR" to="ETH" left simple />

                                        <p className="opac">
                                            Buy or sell A-EUR instantly on our
                                            <br />
                                            decentralized crypto exchange.
                                        </p>

                                        <Button style={{ marginTop: 10 }} type="a" to="/exchange" className="ghost cta">
                                            Exchange crypto
                                        </Button>
                                    </Grid.Unit>
                                </Grid>

                                <Grid className="grid homePage-grid left">
                                    <Grid.Unit
                                        className="column homePage-column desc"
                                        size={{ tablet: 1, desktop: 1 / 2 }}
                                    >
                                        <Header className="homepage-column-header" as="h3">
                                            Have your crypto and <br />
                                            spend it too
                                        </Header>
                                        <p className="opac" style={{ marginBottom: 8 }}>
                                            Borrow A-EUR against your ETH collateral.
                                            <br />
                                             No waiting for approval.
                                        </p>
                                        <a className="more-link">Learn more</a>
                                        <Button
                                            style={{ marginTop: 26 }}
                                            type="a"
                                            className="cta"
                                            href="https://www.mrcoin.eu/en/buy/aeur"
                                        >
                                            Start a loan process
                                        </Button>
                                    </Grid.Unit>

                                    <Grid.Unit
                                        className="column homePage-column box"
                                        size={{ tablet: 1, desktop: 1 / 2 }}
                                    >
                                        <div className="product-box">
                                            <div>
                                                <Header className="box-header" as="h4">
                                                    Crypto-backed loans
                                                </Header>
                                                <ul>
                                                    <li className="list-item">
                                                        for up to <span>6 months</span> at
                                                    </li>
                                                    <li className="list-item">
                                                        <span>4.9%</span> per year (APR) and
                                                    </li>
                                                    <li className="list-item">
                                                        <span>60%</span> loan-to-value.
                                                    </li>
                                                </ul>
                                                <Button
                                                    style={{ marginTop: 26 }}
                                                    type="a"
                                                    className="cta"
                                                    href="https://www.mrcoin.eu/en/buy/aeur"
                                                >
                                                    Start a loan process
                                                </Button>
                                            </div>
                                        </div>
                                    </Grid.Unit>
                                </Grid>

                                <Grid className="grid homePage-grid right">
                                    <Grid.Unit
                                        className="column homePage-column box"
                                        size={{ tablet: 1, desktop: 1 / 2 }}
                                    >
                                        <div className="product-box">
                                            <div>
                                                <Header className="box-header" as="h4">
                                                    Premium on A-EUR
                                                </Header>
                                                <ul>
                                                    <li className="list-item">
                                                        for up to <span>6 months</span> at
                                                    </li>
                                                    <li className="list-item">
                                                        <span>4.9%</span> per year (APR).
                                                    </li>
                                                </ul>
                                                <Button
                                                    style={{ marginTop: 10 }}
                                                    className="cta"
                                                    type="a"
                                                    href="https://www.mrcoin.eu/en/buy/aeur"
                                                >
                                                    Calculate your bonus
                                                </Button>
                                            </div>
                                        </div>
                                    </Grid.Unit>

                                    <Grid.Unit
                                        className="column homePage-column desc"
                                        size={{ tablet: 1, desktop: 1 / 2 }}
                                    >
                                        <Header className="homepage-column-header" as="h3">
                                            Earn by doing nothing
                                        </Header>
                                        <p className="opac">
                                            Park your A-EUR and get a reward.
                                            <br />
                                             Your bonus earning is immediately
                                            <br />
                                             accounted - not just a promise. 
                                            <br /> It’s still yours, locked in a smart contract.
                                            <br />  Nobody can play with your money.
                                        </p>
                                        <Button
                                            style={{ marginTop: 10 }}
                                            type="a"
                                            className="cta"
                                            href="https://www.mrcoin.eu/en/buy/aeur"
                                        >
                                            Calculate your bonus
                                        </Button>
                                    </Grid.Unit>
                                </Grid>
                            </div>
                        </ThemeProvider>
                    </Container>
                </section>
            </article>
        );
    }
}

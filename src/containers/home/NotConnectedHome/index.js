import React from "react";

import Grid from "styled-components-grid";
import { ThemeProvider } from "styled-components";
import Container from "components/augmint-ui/container";
import Button from "components/augmint-ui/button";
import { keyFeatures } from "./helpers.js";
import Convertible from "./../convertible.js";
import { StyledLogo, StyledLogoContainer } from "components/navigation/styles";
import augmintLogo from "assets/images/logo/logo.png";
import augmintLogo2x from "assets/images/logo/logo@2x.png";
import augmintLogo3x from "assets/images/logo/logo@3x.png";

import * as styles from "./styles.js";
import "./styles.css";

const theme = {
    breakpoints: {
        giant: 1285,
        desktop: 992,
        tablet: 769,
        mobile: 376
    }
};

export default class NotConnectedHome extends React.Component {
    render() {
        return (
            <article>
                <Container className="homePage">
                    <section style={{ textAlign: "center", marginBottom: 50 }} className="key-features segment">
                        <StyledLogoContainer>
                            <StyledLogo
                                src={augmintLogo}
                                srcSet={`${augmintLogo2x} 2x, ${augmintLogo3x} 3x,`}
                                alt="Augmint logo"
                            />
                        </StyledLogoContainer>

                        <header>
                            <h1 className="homePage-header">Our money, beyond states.</h1>
                            <h5>
                                Decentralized cryptocurrency without the volatility. <br />
                                Borderless, secure, transparent.
                                <br />
                                Our first token is A-EUR.
                            </h5>

                            <Convertible from="A-EUR" to="EUR" style={{ margin: "20px 0", justifyContent: "center" }} />

                            <a className="more-link" href="">
                                Learn more about the Augmint concept
                            </a>
                        </header>
                    </section>
                </Container>

                <section className="how-to-use segment">
                    <Container className="homePage">
                        <ThemeProvider theme={theme}>
                            <div>
                                <Grid className="grid homePage-grid">
                                    <Grid.Unit className="row">
                                        <h3 className="homePage-row-header">Actually convertible</h3>
                                    </Grid.Unit>

                                    <Grid.Unit
                                        className="column homePage-column"
                                        size={{ mobile: 1, tablet: 1 / 2, desktop: 1 / 2 }}
                                    >
                                        <div className="grid-cont">
                                            <Convertible from="A-EUR" to="EUR" left simple />

                                            <p className="opac">
                                                Next-day conversion to and from SEPA <br />
                                                bank accounts via exchange partners.
                                            </p>
                                            <Button
                                                style={{ marginTop: 10 }}
                                                type="a"
                                                href="https://www.mrcoin.eu/en/buy/aeur"
                                                className="ghost orange cta"
                                            >
                                                Buy A-EUR via partner
                                            </Button>
                                        </div>
                                    </Grid.Unit>

                                    <Grid.Unit
                                        className="column homePage-column"
                                        size={{ mobile: 1, tablet: 1 / 2, desktop: 1 / 2 }}
                                    >
                                        <div className="grid-cont">
                                            <Convertible from="A-EUR" to="ETH" left simple />

                                            <p className="opac">
                                                Buy or sell A-EUR instantly on our <br />
                                                decentralized crypto exchange.
                                            </p>

                                            <Button
                                                style={{ marginTop: 10 }}
                                                type="a"
                                                to="/exchange"
                                                className="ghost orange cta"
                                            >
                                                Buy A-EUR with ETH
                                            </Button>
                                        </div>
                                    </Grid.Unit>
                                </Grid>

                                <Grid className="grid homePage-grid left">
                                    <Grid.Unit
                                        className="column homePage-column desc"
                                        size={{ mobile: 1, tablet: 1 / 2, desktop: 1 / 2 }}
                                    >
                                        <div className="grid-cont">
                                            <h3 className="homePage-column-header">
                                                Have your crypto <br />
                                                and spend it too
                                            </h3>
                                            <p className="opac" style={{ marginBottom: 8 }}>
                                                Borrow A-EUR against your <br />
                                                ETH collateral. No waiting for approval.
                                            </p>
                                            <a className="more-link" href="">
                                                Learn more
                                            </a>
                                            <Button style={{ marginTop: 26 }} type="a" className="cta" to="/loan/new">
                                                Start a loan process
                                            </Button>
                                        </div>
                                    </Grid.Unit>

                                    <Grid.Unit
                                        className="column homePage-column box"
                                        size={{ mobile: 1, tablet: 1 / 2, desktop: 1 / 2 }}
                                    >
                                        <div className="product-box">
                                            <div>
                                                <h4 className="box-header">Crypto-backed loans</h4>
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
                                                    to="/loan/new"
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
                                        size={{ mobile: 1, tablet: 1 / 2, desktop: 1 / 2 }}
                                    >
                                        <div className="product-box">
                                            <div>
                                                <h4 className="box-header">Premium on A-EUR</h4>
                                                <ul>
                                                    <li className="list-item">
                                                        for up to <span>6 months</span> at
                                                    </li>
                                                    <li className="list-item">
                                                        <span>4.5%</span> per year (APR).
                                                    </li>
                                                </ul>
                                                <Button
                                                    style={{ marginTop: 10 }}
                                                    className="cta"
                                                    type="a"
                                                    to="/lock/new"
                                                >
                                                    Calculate your bonus
                                                </Button>
                                            </div>
                                        </div>
                                    </Grid.Unit>

                                    <Grid.Unit
                                        className="column homePage-column desc"
                                        size={{ mobile: 1, tablet: 1 / 2, desktop: 1 / 2 }}
                                    >
                                        <div className="grid-cont">
                                            <h3 className="homePage-column-header">Time is Money</h3>
                                            <p className="opac">
                                                Get rewarded for parking your A-EUR. <br />
                                                Earn a bonus instantly <br />
                                                while your funds remain safely locked <br />
                                                in a smart contract.
                                            </p>
                                            <Button style={{ marginTop: 10 }} type="a" className="cta" to="/lock/new">
                                                Calculate your bonus
                                            </Button>
                                        </div>
                                    </Grid.Unit>
                                </Grid>

                                <Grid
                                    className="grid homePage-grid features"
                                    style={{ justifyContent: "space-evenly" }}
                                >
                                    {keyFeatures.map(feature => (
                                        <Grid.Unit
                                            className="column"
                                            size={{ mobile: 1, tablet: 1 / 2, desktop: 5 / 16 }}
                                            style={{ textAlign: "center" }}
                                            key={feature.title}
                                        >
                                            <div style={styles.keyFeaturesSegment} className="segment">
                                                {feature.image}
                                            </div>
                                            <h3 style={styles.keyFeaturesHeader}>{feature.title}</h3>
                                            <p className="opac">{feature.text}</p>
                                        </Grid.Unit>
                                    ))}
                                </Grid>
                            </div>
                        </ThemeProvider>
                    </Container>
                </section>
            </article>
        );
    }
}

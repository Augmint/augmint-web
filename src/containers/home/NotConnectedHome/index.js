import React from "react";

import Grid from "styled-components-grid";
import { ThemeProvider } from "styled-components";
import Container from "components/augmint-ui/container";
import Header from "components/augmint-ui/header";
import Button from "components/augmint-ui/button";
import Rail from "components/augmint-ui/rail";

import { BalanceIcon, InterchangeIcon } from "components/Icons";

import { keyFeatures, keyBenefits, howItWorks, founders, teamMembers, contributors, partners } from "./helpers.js";
import { Member } from "./member.js";

import { theme } from "styles/media";
import "./styles.css";
import * as styles from "./styles.js";

export default class NotConnectedHome extends React.Component {
    constructor() {
        super();
        const byLastName = (a, b) => a.lastName.localeCompare(b.lastName);
        teamMembers.sort(byLastName);
    }

    render() {
        return (
            <article>
                <Container className="homePage">
                    <section style={{ textAlign: "center" }} className="key-features large-gap segment">
                        <header className="key-features__header">
                            <Header textAlign="center" as="h4" size="large" style={{ lineHeight: "31px" }}>
                                Augmint offers digital tokens targeted to a fiat currency.
                                <br />
                                The first Augmint token is <nobr>A-Euro</nobr>, targeted to Euro.
                                <br />
                                Stored securely and decentralised stable crypto tokens are instantly transferable
                                worldwide.
                            </Header>
                            <div className="segment" style={{ margin: "30px 0 140px 0", textAlign: "center" }}>
                                <Button type="a" to="/tryit" color="primary" className="try-now">
                                    Try now
                                </Button>
                            </div>
                        </header>

                        <div className="balance-image">
                            <BalanceIcon />
                        </div>

                        <ThemeProvider theme={theme}>
                            <Grid className="grid" style={{ justifyContent: "space-evenly" }}>
                                {keyFeatures.map(feature => (
                                    <Grid.Unit
                                        className="column"
                                        size={{ tablet: 1, desktop: 5 / 16 }}
                                        style={{ textAlign: "center" }}
                                        key={feature.title}
                                    >
                                        <div style={styles.keyFeaturesSegment} className="segment">
                                            {feature.image}
                                        </div>
                                        <Header as="h3" style={styles.keyFeaturesHeader}>
                                            {feature.title}
                                        </Header>
                                        <p className="opac">{feature.text}</p>
                                    </Grid.Unit>
                                ))}
                            </Grid>
                        </ThemeProvider>
                    </section>
                    <section style={{ textAlign: "center" }} className="advantages segment">
                        <Header style={{ textAlign: "left" }} as="h2">
                            Great for business
                        </Header>

                        <ThemeProvider theme={theme}>
                            <Grid className="grid" style={{ justifyContent: "space-evenly" }}>
                                {keyBenefits
                                    .filter(item => item.type === "business")
                                    .map(item => (
                                        <Grid.Unit
                                            className="column"
                                            size={{ tablet: 1, desktop: 5 / 16 }}
                                            style={{ textAlign: "left" }}
                                            key={item.pk}
                                        >
                                            <div className="list-item">
                                                <p className="opac">{item.text}</p>
                                            </div>
                                        </Grid.Unit>
                                    ))}
                            </Grid>
                        </ThemeProvider>

                        <Header as="h2" style={{ marginTop: "100px", textAlign: "left" }}>
                            And for individuals
                        </Header>

                        <ThemeProvider theme={theme}>
                            <Grid className="grid" style={{ justifyContent: "space-evenly" }}>
                                {keyBenefits
                                    .filter(item => item.type === "individual")
                                    .map(item => (
                                        <Grid.Unit
                                            className="column"
                                            size={{ tablet: 1, desktop: 5 / 16 }}
                                            style={{ textAlign: "left" }}
                                            key={item.pk}
                                        >
                                            <div className="list-item">
                                                <p className="opac">{item.text}</p>
                                            </div>
                                        </Grid.Unit>
                                    ))}
                            </Grid>
                        </ThemeProvider>
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
                        <Header as="h2">Augmint loans</Header>
                        <p className="opac loans">
                            Use your cryptocurrencies without
                            <br />
                            losing them. Get a loan and spend easily.
                        </p>

                        <ThemeProvider theme={theme}>
                            <Grid className="grid" style={{ justifyContent: "space-around" }}>
                                {howItWorks
                                    .filter(feature => feature.type === "loan")
                                    .map(feature => (
                                        <Grid.Unit
                                            className="column"
                                            size={{ tablet: 1, desktop: 5 / 16 }}
                                            key={feature.pk}
                                            style={{ padding: 50, paddingBottom: 0, textAlign: "left" }}
                                        >
                                            <div className="home-image segment" style={styles.howItWorksImage}>
                                                {feature.image}
                                            </div>
                                            <Header as="h4" style={styles.howToUseHeader}>
                                                {feature.title}
                                            </Header>
                                            <p className="opac">{feature.text}</p>
                                        </Grid.Unit>
                                    ))}
                            </Grid>
                        </ThemeProvider>

                        <div className="segment" style={{ margin: "15px 0 140px 0", textAlign: "center" }}>
                            <Button type="a" to="/tryit" color="primary" className="try-now">
                                Try now
                            </Button>
                        </div>
                        <Header as="h2">Buy and sell A-Euro</Header>

                        <ThemeProvider theme={theme}>
                            <Grid className="grid" style={{ justifyContent: "space-around" }}>
                                {howItWorks
                                    .filter(feature => feature.type === "exchange")
                                    .map(feature => (
                                        <Grid.Unit
                                            className="column"
                                            size={{ tablet: 1, desktop: 5 / 16 }}
                                            key={feature.pk}
                                            style={{ padding: 50, paddingBottom: 0, textAlign: "left" }}
                                        >
                                            <div className="home-image segment" style={styles.howItWorksImage}>
                                                {feature.image}
                                            </div>
                                            <Header as="h4" style={styles.howToUseHeader}>
                                                {feature.title}
                                            </Header>
                                            <p className="opac">{feature.text}</p>
                                        </Grid.Unit>
                                    ))}
                            </Grid>
                        </ThemeProvider>

                        <div className="segment" style={{ margin: "15px 0 140px 0", textAlign: "center" }}>
                            <Button type="a" to="/tryit" color="primary" className="try-now">
                                Try now
                            </Button>
                        </div>
                        <Header as="h2">How to use your A-Euro</Header>

                        <ThemeProvider theme={theme}>
                            <Grid className="margin grid">
                                {howItWorks
                                    .filter(feature => feature.type === "use")
                                    .map(feature => (
                                        <Grid.Unit
                                            className="column"
                                            size={{ tablet: 1, desktop: 5 / 16 }}
                                            key={feature.pk}
                                            style={{ padding: 50, paddingBottom: 0, textAlign: "left" }}
                                        >
                                            <div className="home-image segment" style={styles.howItWorksImage}>
                                                {feature.image}
                                            </div>
                                            <Header as="h4" style={styles.howToUseHeader}>
                                                {feature.title}
                                            </Header>
                                            <p className="opac">{feature.text}</p>
                                        </Grid.Unit>
                                    ))}
                            </Grid>
                        </ThemeProvider>

                        <Header as="h2">Earn more with A-Euro, get premium by locking</Header>

                        <ThemeProvider theme={theme}>
                            <Grid className="grid" style={{ justifyContent: "space-around" }}>
                                {howItWorks
                                    .filter(feature => feature.type === "lock")
                                    .map(feature => (
                                        <Grid.Unit
                                            className="column"
                                            size={{ tablet: 1, desktop: 5 / 16 }}
                                            key={feature.pk}
                                            style={{ padding: 50, paddingBottom: 0, textAlign: "left" }}
                                        >
                                            <div className="home-image segment" style={styles.howItWorksImage}>
                                                {feature.image}
                                            </div>
                                            <Header as="h4" style={styles.howToUseHeader}>
                                                {feature.title}
                                            </Header>
                                            <p className="opac">{feature.text}</p>
                                        </Grid.Unit>
                                    ))}
                            </Grid>
                        </ThemeProvider>

                        <div className="segment" style={{ margin: "15px 0 70px 0", textAlign: "center" }}>
                            <Button type="a" to="/tryit" color="primary" className="try-now">
                                Try now
                            </Button>
                        </div>
                    </Container>
                </section>
                <section style={{ textAlign: "left" }} className="team segment">
                    <Container className="homePage wider">
                        <Header as="h2">Team</Header>

                        <ThemeProvider theme={theme}>
                            <Grid className="grid" style={{ marginBottom: 75 }}>
                                {founders.map(member => (
                                    <Member member={member} key={member.pk} />
                                ))}
                            </Grid>
                        </ThemeProvider>
                        <ThemeProvider theme={theme}>
                            <Grid className="grid">
                                {teamMembers.map(member => (
                                    <Member member={member} key={member.pk} />
                                ))}
                            </Grid>
                        </ThemeProvider>

                        <Header as="h4">Contributors</Header>
                        <ThemeProvider theme={theme}>
                            <Grid className="grid">
                                {contributors.map(e => (
                                    <Grid.Unit
                                        className="column"
                                        size={{ tablet: 1, desktop: 5 / 16 }}
                                        key={e.pk}
                                        style={{ padding: 50, paddingBottom: 0, textAlign: "left" }}
                                    >
                                        <img
                                            src={e.imgSrc}
                                            style={{ width: "60px", height: "60px", marginBottom: "30px" }}
                                            alt={e.pk}
                                        />
                                        <strong>
                                            {e.firstName} {e.lastName}
                                        </strong>
                                        <br />
                                        <small>{e.title}</small>
                                    </Grid.Unit>
                                ))}
                            </Grid>
                        </ThemeProvider>
                    </Container>
                </section>
                <section className="partner segment" style={{ marginTop: 50, textAlign: "center" }}>
                    <Container className="homePage wider">
                        <ThemeProvider theme={theme}>
                            <Grid className="grid">
                                {partners.map(partner => (
                                    <Grid.Unit
                                        className="column"
                                        size={{ tablet: 1, desktop: 1 / 2 }}
                                        style={{ textAlign: "left" }}
                                        key={partner.pk}
                                    >
                                        <img src={partner.imgSrc} alt={partner.pk} />
                                        <Header as="h3">{partner.name}</Header>
                                        {partner.description && (
                                            <p
                                                className="description"
                                                dangerouslySetInnerHTML={{ __html: partner.description }}
                                                style={{ marginBottom: 3 }}
                                            />
                                        )}
                                    </Grid.Unit>
                                ))}
                            </Grid>
                        </ThemeProvider>
                    </Container>
                </section>
            </article>
        );
    }
}

import React from "react";
import { Link } from "react-router-dom";
import Grid from "styled-components-grid";
import { ThemeProvider } from "styled-components";
import Button from "components/augmint-ui/button";
import List from "components/augmint-ui/list";
import Scrollchor from "react-scrollchor";

import "./style.css";
import { theme } from "styles/media";
import whitePaper from "assets/images/white-paper.png";
import manifesto from "assets/images/manifesto.png";

export default () => (
    <article style={{ textAlign: "center" }} className="concept segment">
        <List>
            <List.Item>
                <Scrollchor to="#overview">OVERVIEW</Scrollchor>
            </List.Item>
            <List.Item>
                <Scrollchor to="#how-it-works">HOW IT WORKS</Scrollchor>
            </List.Item>
            <List.Item>
                <Scrollchor to="#governance">GOVERNANCE</Scrollchor>
            </List.Item>
        </List>
        <section className="segment">
            <h2 className="header segment" id={"overview"} style={{ padding: "0 1rem" }}>
                Overview
            </h2>
            <ThemeProvider theme={theme}>
                <Grid>
                    <Grid.Unit size={{ phone: 1, tablet: 1 / 2 }} style={{ padding: "0 1rem" }}>
                        <div className="custom-column segment">
                            <h5 className="segment">MODERN MONEY</h5>
                            <p>
                                Modern currencies are credit based. In layman's terms the amount of money in circulation
                                (supply) is automatically adjusted by market participants (i.e. banks). Banks are
                                creating money when issuing loans and burning money when a loan is repaid.
                            </p>
                            <p>
                                The stability is secured or fortified by central banks, adjusting certain base
                                parameters and by the market via the banks adjusting their loan conditions.
                            </p>
                            <p>
                                This system has its flaws and it can be corrupted by governments and banks but in
                                general that's how the monetary system ensures there is always as much money available
                                in the economy as needed.
                            </p>
                        </div>
                    </Grid.Unit>
                    <Grid.Unit
                        className="second-column"
                        size={{ phone: 1, tablet: 1 / 2 }}
                        style={{ padding: "0 1rem" }}
                    >
                        <div className="custom-column segment">
                            <h5 className="segment">AUGMINT</h5>
                            <p>
                                Augmint is built on the concept of automatically adjusting the supply of each Augmint
                                token in a similar way as modern fiat money but in a transparent, decentralised and
                                secure fashion.
                            </p>
                            <p>
                                Augmint tokens are only issued when a new, collateral based loan is created. Tokens are
                                burnt on repayment. In case of loan default the collateral goes to Augmint stability
                                reserves, managed by smart contracts. It all happens in an automated, cryptographically
                                secure and decentralised way.{" "}
                            </p>
                            <p>
                                Parameters for the new loans, the use of the reserves for market interventions are
                                decided by transparent and open governance processes.
                            </p>
                            <p>A-EUR is the first Augmint token to be implemented. A-EUR will be targeted to EUR.</p>
                        </div>
                    </Grid.Unit>
                </Grid>
            </ThemeProvider>
            <div className="segment" style={{ textAlign: "center" }}>
                <Button content="TRY NOW" to="/tryit" className="try-now" />
            </div>
        </section>
        <section className="green-gradient segment">
            <h2 className="header segment" id={"how-it-works"}>
                How it works
            </h2>
            <h5 className="segment">STABILITY</h5>
            <p>
                There are multiple mechanisms to ensure the market expectation and the actual price is around parity to
                the targeted currency.
            </p>
            <h5 className="segment">MARKET MECHANICS</h5>
            <p>
                The primary foundation of stability is the continuous supply of Augmint tokens via loan originations and
                a corresponding demand for paying back loans on maturity.
            </p>
            <p>
                Further specific features of the Augmint system will work towards maintaining stability by smoothing the
                demand & supply peaks and troughs.
            </p>
            <h5 className="segment">LOAN PARAMETERS</h5>
            <p>
                If A-EUR price deviating from parity then loan parameters are adjusted to make it more or less
                compelling to get A-EUR loan for a certain digital asset. This has an effect on A-EUR demand/supply.
            </p>
            <h5 className="segment">MARKET INTERVENTION</h5>
            <p>
                Augmint can intervene from its reserves accumulated from fees, defaults and interests. Augmint reserves
                can be used on held only for market intervention.
            </p>
            <p>
                Check out our{" "}
                <Link to="http://bit.ly/augmint-wp" target="_blank">
                    white paper
                </Link>{" "}
                for additional tools and more scenarios.
            </p>
            <h5 className="segment">GET A-EUR</h5>
            <p>
                You can always buy or sell your A-EUR for cryptocurrencies (ETH, BTC etc.) on a decentralised exchange.
                Secondary exchanges will offer direct fiat conversions to/from A-EUR as well. As the Augmint ecosystem
                grows you will need less and less to exchange Augmint tokens to fiat money.
            </p>
            <div style={{ textAlign: "left" }} className="custom-buttonsegment segment">
                <Button content="TRY NOW" to="/tryit" className="try-now" />
            </div>
            <h2 className="header segment" id={"governance"}>
                Governance
            </h2>
            <p>
                The fundamental rules, agreements and funds are maintained and enforced by smart contracts -
                cryptographically immutable algorithms running on the blockchain.
            </p>
            <p>
                We aim to handle as many "decisions" as possible with smart contracts but it's not feasible to prepare
                for every case with automated smart contracts, such as financial parameters, trusted price oracles, new
                digital assets, contract releases.
            </p>
            <p>
                These decisions are made by stakeholders - governance token (GDC) holders. Augmint's governance model
                ensures that all decisions are democratic and transparent.
            </p>
            <p>
                Access to GDC is open to anyone who is willing to deposit A-EUR tokens. To incentify holding and voting
                with GDCs the profit from fees is distributed among GDC holders.
            </p>
        </section>
        <section className="segment">
            <ThemeProvider theme={theme}>
                <Grid className="whitepaper-manifesto">
                    <Grid.Unit size={{ phone: 1, tablet: 1 / 2 }}>
                        <a
                            href="https://docs.google.com/document/d/1IQwGEsImpAv2Nlz5IgU_iCJkEqlM2VUHf5SFkcvb80A/edit"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <h5>WHITEPAPER</h5>
                            <img src={whitePaper} alt="whitepaper" />
                        </a>
                    </Grid.Unit>
                    <Grid.Unit size={{ phone: 1, tablet: 1 / 2 }}>
                        <a href="/manifesto">
                            <h5>MANIFESTO</h5>
                            <img src={manifesto} alt="manifesto" />
                        </a>
                    </Grid.Unit>
                </Grid>
            </ThemeProvider>
        </section>
    </article>
);

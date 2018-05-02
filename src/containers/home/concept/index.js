import React from "react";
import { Link } from "react-router-dom";
import { List, Segment, Image, Grid } from "semantic-ui-react";
import Button from "../../../components/augmint-ui/button";
import Scrollchor from "react-scrollchor";

import "./style.css";
import whitePaper from "assets/images/white-paper.png";
import manifesto from "assets/images/manifesto.png";

export default () => (
    <Segment basic textAlign="center" as="article" className="concept">
        <List horizontal inverted divided link>
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
        <Segment basic as="section">
            <Segment basic as="h2" className="header" content="Overview" id={"overview"} />
            <Grid divided="vertically">
                <Grid.Row columns={2}>
                    <Grid.Column>
                        <Segment basic className="custom-column">
                            <Segment basic as="h5" content="MODERN MONEY" />
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
                        </Segment>
                    </Grid.Column>
                    <Grid.Column className="second-column">
                        <Segment basic className="custom-column">
                            <Segment basic as="h5" content="AUGMINT" />
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
                            <p>A-EUR is the first Augmint token to be implemented. A-EUR will be pegged to EUR.</p>
                        </Segment>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <Segment basic textAlign="center">
                <Button content="TRY NOW" to="/tryit" className="try-now" />
            </Segment>
        </Segment>
        <Segment basic as="section" className="green-gradient">
            <Segment basic as="h2" className="header" content="How it works" id={"how-it-works"} />
            <Segment basic as="h5" content="STABILITY" />
            <p>
                There are multiple mechanisms to ensure the market expectation and the actual price is around parity to
                the pegged currency.
            </p>
            <Segment basic as="h5" content="MARKET MECHANICS" />
            <p>
                The primary foundation of stability is the continuous supply of Augmint tokens via loan originations and
                a corresponding demand for paying back loans on maturity.
            </p>
            <p>
                Further specific features of the Augmint system will work towards maintaining stability by smoothing the
                demand & supply peaks and troughs.
            </p>
            <Segment basic as="h5" content="LOAN PARAMETERS" />
            <p>
                If A-EUR price deviating from parity then loan parameters are adjusted to make it more or less
                compelling to get A-EUR loan for a certain digital asset. This has an effect on A-EUR demand/supply.
            </p>
            <Segment basic as="h5" content="MARKET INTERVENTION" />
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
            <Segment basic as="h5" content="GET A-EUR" />
            <p>
                You can always buy or sell your A-EUR for cryptocurrencies (ETH, BTC etc.) on a decentralised exchange.
                Secondary exchanges will offer direct fiat conversions to/from A-EUR as well. As the Augmint ecosystem
                grows you will need less and less to exchange Augmint tokens to fiat money.
            </p>
            <Segment basic textAlign="center" className="custom-button">
                <Button content="TRY NOW" to="/tryit" className="try-now" />
            </Segment>
            <Segment basic as="h2" className="header" content="Governance" id={"governance"} />
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
        </Segment>
        <Grid divided="vertically" className="whitepaper-manifesto">
            <Grid.Row columns={2}>
                <Grid.Column>
                    <Segment
                        basic
                        as="a"
                        href="https://docs.google.com/document/d/1IQwGEsImpAv2Nlz5IgU_iCJkEqlM2VUHf5SFkcvb80A/edit"
                        target="_blank"
                    >
                        <h5>WHITEPAPER</h5>
                        <Image src={whitePaper} />
                    </Segment>
                </Grid.Column>
                <Grid.Column>
                    <Segment basic as="a" href="/manifesto">
                        <h5>MANIFESTO</h5>
                        <Image src={manifesto} />
                    </Segment>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    </Segment>
);

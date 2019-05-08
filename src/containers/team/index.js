import React from "react";
import styled from "styled-components";
import Container from "components/augmint-ui/container";
import Header from "components/augmint-ui/header";
import Grid from "styled-components-grid";
import { ThemeProvider } from "styled-components";
import { theme } from "styles/media";

import { management, teamMembers, contributors, partners } from "./helpers.js";
import { Member } from "./member.js";

const StyleTeamTitle = styled.h1`
    font-size: 42px;
    text-align: center;
    text-transform: uppercase;
    margin-bottom: 80px;
    margin-top: 75px;
`;

export default class Team extends React.Component {
    constructor() {
        super();
        const byLastName = (a, b) => a.lastName.localeCompare(b.lastName);
        teamMembers.sort(byLastName);
    }

    render() {
        return (
            <div>
                <StyleTeamTitle id="team">Team</StyleTeamTitle>
                <section style={{ textAlign: "left" }} className="team segment">
                    <Container className="homePage wider">
                        <ThemeProvider theme={theme}>
                            <Grid className="grid" style={{ marginBottom: 75 }}>
                                {management.map(member => (
                                    <Member member={member} key={member.pk} />
                                ))}
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
                                        style={{ padding: 40, paddingBottom: 0, textAlign: "left" }}
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
            </div>
        );
    }
}

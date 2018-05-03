import React from "react";

import { Grid, Image } from "semantic-ui-react";
import Header from "../../../components/augmint-ui/header";

import linkedinLogo from "assets/images/linkedin.png";
import githubLogo from "assets/images/GitHub.png";

export class Member extends React.Component {
    render() {
        return (
            <Grid.Column mobile="16" computer="8" textAlign="left" key={this.props.member.pk}>
                <Image src={this.props.member.imgSrc} avatar floated="left" />
                <Header as="h3">
                    {this.props.member.firstName} {this.props.member.lastName}
                </Header>
                <Header as="h5" style={{ margin: "10px 0 0" }}>
                    {this.props.member.title}
                    {this.props.member.portfolio && (
                        <a href={this.props.member.portfolio} target="_blank" style={{ fontSize: 12 }}>
                            , PORTFOLIO
                        </a>
                    )}
                    {this.props.member.linkedinUrl && (
                        <a href={this.props.member.linkedinUrl} target="_blank" className="social">
                            <Image
                                basic="true"
                                src={linkedinLogo}
                                style={{ display: "inline-block", margin: 0, width: 14 }}
                            />
                        </a>
                    )}
                    {this.props.member.githubUrl && (
                        <a href={this.props.member.githubUrl} target="_blank" className="social">
                            <Image
                                basic="true"
                                src={githubLogo}
                                style={{ display: "inline-block", margin: 0, width: 14 }}
                            />
                        </a>
                    )}
                </Header>
                {this.props.member.description && (
                    <p className="description" dangerouslySetInnerHTML={{ __html: this.props.member.description }} />
                )}
            </Grid.Column>
        );
    }
}

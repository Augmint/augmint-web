import React from "react";

import { Header, Grid, Image } from "semantic-ui-react";

import linkedinLogo from "assets/images/linkedin.png";
import githubLogo from "assets/images/GitHub.png";


export class Member extends React.Component {
    render() {
        return (
          <Grid.Column mobile="16" computer="8" textAlign="left" key={this.props.member.pk}>
              <Image
                  src={this.props.member.imgSrc}
                  avatar
                  floated="left"
              />
              <Header as="h3">
                  {this.props.member.firstName} {this.props.member.lastName}
              </Header>
              <Header as="h5" style={{ margin: "10px 0 0" }}>
                  {this.props.member.title}{this.props.member.portfolio && <Header as="a" href={this.props.member.portfolio} target="_blank" content=', PORTFOLIO' style={{ fontSize: 12 }} />}
                  {this.props.member.linedinUrl && <Header as="a" href={this.props.member.linedinUrl} target="_blank" className="social" >
                    <Image basic src={linkedinLogo} style={{ margin: 0, width: 14 }}/>
                  </Header>}
                  {this.props.member.githubUrl && <Header as="a" href={this.props.member.githubUrl} target="_blank" className="social" >
                    <Image basic src={githubLogo} style={{ margin: 0, width: 14 }}/>
                  </Header>}
              </Header>
              {this.props.member.description && <p className="description"> {this.props.member.description} </p>}
          </Grid.Column>
        );
    }
}

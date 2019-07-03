import React from "react";
import styled from "styled-components";
import WatchAssetButton from "components/watchAssetButton";
import Button from "components/augmint-ui/button";
import { media } from "styles/media";

const Container = styled.div`
    width: 100%;
    min-width: 250px;
    padding-top: 10px;
    margin: auto;
    display: flex;
    text-align: center;
    justify-content: space-between;

    a {
        flex: 1;
        margin: 0 0.2rem;
        padding: 0 0 10px;
        ${media.tabletMin`
            font-size: 1rem;
        `};
    }
`;

export default class ButtonGroup extends React.Component {
    render() {
        const buttons = this.props.buttons;

        return (
            <Container>
                {buttons.map((button, index) =>
                    button.type === "watchAssetButton" ? (
                        <WatchAssetButton
                            key={index}
                            icon={button.icon}
                            circleicon={button.circleicon}
                            className={button.className}
                            labelposition={button.labelposition}
                        >
                            {button.content}
                        </WatchAssetButton>
                    ) : (
                        <Button
                            key={index}
                            to={button.to}
                            icon={button.icon}
                            circleicon={button.circleicon}
                            className={button.className}
                            labelposition={button.labelposition}
                        >
                            {button.content}
                        </Button>
                    )
                )}
            </Container>
        );
    }
}

import React from "react";

import { default as Modal, ModalActions, ModalContent, ModalHeader } from "./augmint-ui/modal";
import Button from "./augmint-ui/button";
import styled from "styled-components";
import theme from "styles/theme";

const dismissedCookie = "disclaimerDismissed=true";

const StyledDiv = styled.div`
    overflow: scroll;

    > p {
        font-size: 0.9rem;
        line-height: 1.1rem;
    }

    p:first-of-type {
        margin-top: 0;
    }

    p:last-of-type {
        margin-bottom: 0;
    }
`;

const StyledSection = styled.div`
    display: flex;
    flex-direction: column;
    padding: 10px;
    border-radius: 4px;
    background-color: ${theme.colors.secondaryLight};
    margin-bottom: 5px;
    text-align: left;

    &.error {
        background-color: ${theme.colors.mediumRed};
    }

    > div {
        display: flex;
    }

    > p {
        display: none;
        margin: 10px 25px 0;

        &.error {
            display: inline;
            color: ${theme.colors.darkRed};
        }
    }
`;

const StyledInput = styled.input`
    margin-right: 10px;
    margin-top: 5px;
`;

const Styledlabel = styled.label`
    display: inline-block;
`;

let _className = "";

export default class Disclaimer extends React.Component {
    constructor(props) {
        super(props);

        const dismissed = document.cookie
            .split(";")
            .map(cookie => cookie.trim())
            .includes(dismissedCookie);

        this.state = {
            dismissed,
            checkbox: ""
        };
        this.validate = this.validate.bind(this);
        this.close = this.close.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    validate() {
        const checkbox = document.getElementById("disclaimer-chcekbox");
        if (checkbox.checked) {
            this.setState({ checkbox: "checked" });
            return true;
        } else {
            this.setState({ checkbox: "unchecked" });
            _className = "error";
            return false;
        }
    }

    close() {
        document.cookie = dismissedCookie;
        this.setState({ dismissed: true });
    }

    handleClick() {
        if (this.validate() === true) {
            this.close();
        }
    }

    render() {
        return (
            !this.state.dismissed && (
                <Modal onCloseRequest={this.close} noEsc={true} className="disclaimer-modal">
                    {/* <ModalContent style={{ height: "calc(100% - 112px)" }}> */}
                    <ModalContent className="disclaimer-modal">
                        <ModalHeader>
                            <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Augmint Disclaimer</h3>
                        </ModalHeader>
                        <StyledDiv>
                            <p>
                                The tokens issued by Augmint contracts are not legal tender. Use them at your own risk.
                                To be used to replace, substitute or imitate any existing fiat currency might be subject
                                to regulatory regimes. Augmint tokens are not to be issued to entities residing under
                                regulatory regimes prohibiting ownership or usage. Use of Augmint contracts is at the
                                owner's risk.
                            </p>
                            <p>
                                Augmint project or any party who is contributing to the project cannot be held
                                responsible for any damages, costs, expenses, anticipated savings, losses, errors,
                                taxes, third party transactions, fees or delays encountered when interacting with
                                Augmint contracts. Augmint Project is not responsible for any problems that may result
                                from the use of your internet connection, our website, the Ethereum platform, any
                                contributors website, or any problems arising from the Ethereum code. Dissatisfaction
                                with any goods or services purchased from, or sold to, a third party must be resolved
                                directly with that third party. The Augmint contracts are provided as is and without any
                                representation of warranty, whether express, implied, or statutory. The limitations of
                                liability of these contracts are agreed by the parties on the basis that the user is
                                aware of the volatility of the foreign currency and Cryptocurrency markets.
                            </p>
                            <p>
                                Augmint Project reserves the right to amend, change, add, remove, or alter parts of the
                                above text.
                            </p>
                        </StyledDiv>
                    </ModalContent>
                    <ModalActions>
                        <StyledSection className={_className}>
                            <div>
                                <StyledInput
                                    type="checkbox"
                                    id="disclaimer-chcekbox"
                                    name="disclaimer"
                                    data-testid="disclaimer-chcekbox"
                                    className={_className}
                                />
                                <Styledlabel htmlFor="disclaimer-chcekbox" className={_className}>
                                    I have read and accept Augmint's Disclaimer.
                                </Styledlabel>
                            </div>
                            <p className={_className}>
                                Please indicate that you have read and accepted Augmint's Disclaimer.
                            </p>
                        </StyledSection>
                        <Button onClick={this.handleClick} data-testid="disclaimerCloseButton">
                            Continue
                        </Button>
                    </ModalActions>
                </Modal>
            )
        );
    }
}

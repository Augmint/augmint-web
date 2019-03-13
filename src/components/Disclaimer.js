import React from "react";

import { Link } from "react-router-dom";
import { default as Modal, ModalActions, ModalContent, ModalHeader } from "./augmint-ui/modal";
import Button from "./augmint-ui/button";
import styled from "styled-components";

// import { reduxForm, SubmissionError, Field } from "redux-form";
// import { Form, Validations, Normalizations, Parsers } from "components/BaseComponents";

const dismissedCookie = "disclaimerDismissed=true";

const StyledInput = styled.input``;

const Styledlabel = styled.label`
    display: inline-block;
    margin-bottom: 5px;
`;

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
                <Modal onCloseRequest={this.close}>
                    <ModalContent>
                        <ModalHeader>
                            <h3 style={{ marginTop: 0 }}>Augmint Disclaimer</h3>
                        </ModalHeader>
                        <input type="checkbox" id="disclaimer-chcekbox" name="disclaimer" />
                        <Styledlabel for="disclaimer-chcekbox">
                            I have read and agree to Augmint's <Link to="/disclaimer">Disclaimer</Link>.
                        </Styledlabel>
                    </ModalContent>
                    <ModalActions>
                        <Button onClick={this.handleClick} data-testid="disclaimerCloseButton">
                            Continue
                        </Button>
                    </ModalActions>
                </Modal>
            )
        );
    }
}

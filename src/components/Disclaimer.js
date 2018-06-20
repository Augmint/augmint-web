import React from "react";

import { Link } from "react-router-dom";
import { default as Modal, ModalActions, ModalContent, ModalHeader } from "./augmint-ui/modal";
import Button from "./augmint-ui/button";

const dismissedCookie = 'disclaimerDismissed=true';

export default class Disclaimer extends React.Component {
    constructor(props) {
        super(props);

        const dismissed = document.cookie
          .split(";")
          .map(cookie => cookie.trim())
          .includes(dismissedCookie);

        this.state = { dismissed };
        this.close = this.close.bind(this);
    }

    close() {
        document.cookie = dismissedCookie;
        this.setState({ dismissed: true });
    }

    render() {
        return (
            !this.state.dismissed && (
                <Modal showClose={true} onCloseRequest={this.close}>
                    <ModalContent>
                        <ModalHeader>
                            <h3 style={{marginTop: 0}}>
                                Augmint beta test
                            </h3>
                        </ModalHeader>
                        Augmint is in beta test. The tokens issued by Augmint contracts are not legal tender. Use them at your own risk. Do not participate unless you have read their <Link to="/disclaimer" onClick={this.close}>disclaimer</Link>.
                    </ModalContent>
                    <ModalActions>
                        <Button onClick={this.close} data-testid="disclaimerCloseButton">
                            Got it
                        </Button>
                    </ModalActions>
                </Modal>
            )
        );
    }
}

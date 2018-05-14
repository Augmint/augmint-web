import React from "react";
import isNil from "lodash/fp/isNil";
import Icon from "components/augmint-ui/icon";

import { StyledOverlay, StyledModal, StyledModalContent, StyledModalActions, StyledCloseButton } from "./styles";

export default class Modal extends React.Component {
    constructor(props) {
        super(props);

        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    componentDidMount() {
        window.addEventListener("keyup", this.handleKeyUp, false);
    }

    componentWillUnmount() {
        window.removeEventListener("keyup", this.handleKeyUp, false);
    }

    handleKeyUp(e) {
        const { onCloseRequest } = this.props;
        const keys = {
            27: () => {
                e.preventDefault();
                onCloseRequest();
                window.removeEventListener("keyup", this.handleKeyUp, false);
            }
        };

        if (keys[e.keyCode]) {
            keys[e.keyCode]();
        }
    }

    render() {
        const { onCloseRequest, children, classes, showClose } = this.props;

        return (
            <StyledOverlay className="overlay">
                <StyledModal className="modal">
                    {children}
                    {showClose && (
                        <StyledCloseButton type="button" className="{classes.closeButton}" onClick={onCloseRequest}>
                            <Icon name="close" style={{}} />
                        </StyledCloseButton>
                    )}
                </StyledModal>
            </StyledOverlay>
        );
    }
}

export function ModalHeader(props) {
    const { children, ...other } = props;
    return <div {...other}>{children}</div>;
}

Modal.Header = ModalHeader;

export function ModalContent(props) {
    const { children, ...other } = props;
    return <StyledModalContent {...other}>{children}</StyledModalContent>;
}

Modal.Content = ModalContent;

export function ModalActions(props) {
    const { children, ...other } = props;
    return <StyledModalActions {...other}>{children}</StyledModalActions>;
}

Modal.Actions = ModalActions;

import React from "react";
import Icon from "components/augmint-ui/icon";

import { StyledOverlay, StyledModal, StyledModalContent, StyledModalActions, StyledCloseButton } from "./styles";

export default class Modal extends React.Component {
    constructor(props) {
        super(props);

        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.body = document.getElementById("fakebody");
    }

    componentDidMount() {
        window.addEventListener("keyup", this.handleKeyUp, false);
        this.body.classList.add("noScroll");
    }

    componentWillUnmount() {
        window.removeEventListener("keyup", this.handleKeyUp, false);
        this.body.classList.remove("noScroll");
    }

    handleKeyUp(e) {
        const { onCloseRequest } = this.props;
        const keys = {
            27: () => {
                e.preventDefault();
                onCloseRequest();
                window.removeEventListener("keyup", this.handleKeyUp, false);
                this.body.classList.remove("noScroll");
            }
        };

        if (keys[e.keyCode]) {
            keys[e.keyCode]();
        }
    }

    render() {
        const { onCloseRequest, children, showClose } = this.props;

        return (
            <StyledOverlay className="overlay">
                <StyledModal className="modal">
                    {children}
                    {showClose && (
                        <StyledCloseButton type="button" className="close" onClick={onCloseRequest}>
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

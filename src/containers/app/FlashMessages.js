import React from "react";
import { connect } from "react-redux";
import { getLatestMessage, removeMessage } from "redux-flash";
import { Modal, Header, Icon, Button } from "semantic-ui-react";
import { EthSubmissionSuccessPanel } from "components/MsgPanels";

class FlashMessages extends React.Component {
    constructor(props) {
        super(props);
        this.handleClose = this.handleClose.bind(this);
    }

    handleClose() {
        console.log(this.props.flash.id);
        this.props.removeMessage(this.props.flash.id);
    }

    render() {
        const { flash } = this.props;
        return !flash ? null : (
            <Modal open={true}>
                >
                <Header icon="checkmark" content="Successful Ethereum transaction" onClose={this.handleClose} />
                <Modal.Content>
                    {flash.props.result ? (
                        <EthSubmissionSuccessPanel header={<h3>{flash.message}</h3>} eth={flash.props.result.eth} />
                    ) : (
                        flash.message
                    )}
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        primary
                        className="AcknowledgeFlashButton"
                        id={`AcknowledgeFlashButton`}
                        onClick={this.handleClose}
                    >
                        <Icon name="checkmark" />
                        OK
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

function mapStateToProps(state) {
    return {
        flash: getLatestMessage(state)
    };
}

const mapDispatchToProps = { removeMessage };

export default (FlashMessages = connect(mapStateToProps, mapDispatchToProps)(FlashMessages));

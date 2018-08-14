import React from "react";
// import { connect } from "react-redux";
// import { ConnectionStatus } from "components/MsgPanels";
import { StyledNotificationPanel } from "./styles";

export class NotificationPanel extends React.Component {
    render() {
        const { className, children } = this.props;
        return <StyledNotificationPanel className={className}>{children}</StyledNotificationPanel>;
    }
}

// export default connect(mapStateToProps)(NotificationPanel);

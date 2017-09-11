import React from "react";
import { Popup, Icon } from "semantic-ui-react";

export default function ToolTip(props) {
    const {
        on = ["hover", "click"],
        children,
        trigger = <Icon color="grey" name="help circle" />,
        header,
        ...other
    } = props;
    return (
        <Popup trigger={trigger} on={on} {...other}>
            <Popup.Header children={header} />
            <Popup.Content children={children} />
        </Popup>
    );
}

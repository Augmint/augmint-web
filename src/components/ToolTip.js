import React from "react";
import { Popup } from "semantic-ui-react";
import Icon from "../components/augmint-ui/icon";

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

export function MoreInfoTip(props) {
    const {
        trigger = <Icon color="grey" name="zoom" style={{ marginRight: "6px" }} />,
        hoverable = true,
        ...other
    } = props;
    return <ToolTip hoverable={hoverable} trigger={trigger} {...other} />;
}

import React from "react";
import Icon from "../icon";

import { StyledLink, StyledA, StyledButton } from "./styles";
import { FeatureContext } from "modules/services/featureService";

export default function Button(props) {
    const { children, to, type, content, icon, className } = props;

    let elementType = StyledA,
        _icon;

    if (type === "submit") {
        elementType = StyledButton;
    } else if (to) {
        elementType = StyledLink;
    }
    if (icon) {
        _icon = <Icon name={icon} />;
    }

    return (
        <FeatureContext.Consumer>
            {features => {
                const dashboard = features.dashboard;
                let _className = className;
                if (dashboard) {
                    _className += " dashboardColors";
                }
                return React.createElement(elementType, {...props, className: _className }, children, content, _icon)
            }}
        </FeatureContext.Consumer>
    );
}

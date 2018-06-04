import React from 'react';
import ReactDOM from 'react-dom';

import { FeatureContext } from "modules/services/featureService";

export default function TopNavTitlePortal(props) {
    return (
        <FeatureContext.Consumer>
            {
                features => {
                return (features.dashboard)
                    ? ReactDOM.createPortal(
                        props.children,
                        document.querySelector('#page-title')
                    ) : props.children;
                }
            }
        </FeatureContext.Consumer>
    );

}

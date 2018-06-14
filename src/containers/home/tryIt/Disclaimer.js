import React from "react";

import { Link } from "react-router-dom";
import { FeatureContext } from "modules/services/featureService";
import { StyledP } from "components/augmint-ui/paragraph/styles";

export function Disclaimer(props) {
    return (
        <FeatureContext>
            {features => {
                const dashboard = features.dashboard;
                return (
                    <div style={{ margin: "auto" }}>
                        <StyledP className={ dashboard ? "primaryColor" : "" }>
                            The tokens issued by Augmint contracts are not legal tender. Use them at your own risk...
                            <br />
                            <Link to="/disclaimer">
                            For more details click here.
                        </Link>
                        </StyledP>
                    </div>
                );
            }}
        </FeatureContext>
    );
}

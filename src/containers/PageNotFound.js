import React from "react";
import { Psegment } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";

export const PageNotFound = props => {
    return (
        <Psegment>
            <ErrorPanel header="Page not found" style={{ margin: "1em" }}>
                <p>Where's {props.location.pathname} ?</p>
                <p> Not sure.</p>
            </ErrorPanel>
        </Psegment>
    );
};

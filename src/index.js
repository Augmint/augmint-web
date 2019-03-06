import React from "react";
import { render } from "react-dom";
import { Provider, ReactReduxContext } from "react-redux";
import { ConnectedRouter } from "connected-react-router";
import store, { history } from "modules/store";
import App from "./containers/app";

const target = document.querySelector("#root");

render(
    <Provider store={store} context={ReactReduxContext}>
        <ConnectedRouter history={history} context={ReactReduxContext}>
            <div>
                <App />
            </div>
        </ConnectedRouter>
    </Provider>,
    target
);

import React from "react";
import { render } from "react-dom";
import { Provider, ReactReduxContext } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import store from "modules/store";
import App from "./containers/app";

it("renders without crashing", () => {
    const target = document.createElement("div");
    render(
        <Provider store={store} context={ReactReduxContext}>
            <Router context={ReactReduxContext}>
                <div>
                    <App />
                </div>
            </Router>
        </Provider>,
        target
    );
});

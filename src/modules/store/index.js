import { createStore, applyMiddleware, compose } from "redux";
import { routerMiddleware } from "connected-react-router";
import thunk from "redux-thunk";
import { createBrowserHistory } from "history";
import rootReducer from "modules/reducers/rootReducer";
import { createLogger } from "redux-logger";

export const history = createBrowserHistory(); //{ basename: '/dcm' });

const initialState = {};
const enhancers = [];
const middleware = [thunk, routerMiddleware(history)];

if (process.env.NODE_ENV === "development") {
    const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

    if (typeof devToolsExtension === "function") {
        enhancers.push(devToolsExtension());
    }

    const logger = createLogger({
        collapsed: true
    });
    middleware.push(logger);
}

const composedEnhancers = compose(
    applyMiddleware(...middleware),
    ...enhancers
);

const store = createStore(rootReducer(history), initialState, composedEnhancers);

export default store;

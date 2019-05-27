import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import rootReducer from "modules/reducers/rootReducer";
import { createLogger } from "redux-logger";
import { startWatches } from "modules/setupWatches.js";

const initialState = {};
const enhancers = [];
const middleware = [thunk];

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

const store = createStore(rootReducer, initialState, composedEnhancers);
export default store;

startWatches();

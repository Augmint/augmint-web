export const SUBSCRIBE_REQUESTED = "subscriptions/SUBSCRIBE_REQUESTED";
export const SUBSCRIBE_SUCCESS = "subscriptions/SUBSCRIBE_SUCCESS";
export const SUBSCRIBE_ERROR = "subscriptions/SUBSCRIBE_ERROR";

var Parse = require("parse");
Parse.serverURL = "https://parseapi.back4app.com";
Parse.initialize(
    "hRJh9HuWN8an0VjQGgKMuF2lv914yYgrSMLvP4E5",
    "IMKlkv7rVi3KoaDDHo8QTBPs2Y6yLc3tFXb8ekc4"
);

const initialState = {
    error: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SUBSCRIBE_REQUESTED:
            return {
                ...state,
                email: action.email
            };

        case SUBSCRIBE_SUCCESS:
            return {
                ...state,
                result: action.result
            };

        case SUBSCRIBE_ERROR:
            return {
                ...state,
                error: action.error
            };

        default:
            return state;
    }
};

export function subscribe(email, account, networkId) {
    return async dispatch => {
        dispatch({
            type: SUBSCRIBE_REQUESTED,
            email: email
        });

        let Subscription = Parse.Object.extend("Subscription");
        let subscription = new Subscription();

        subscription.set("email", email);
        subscription.set("account", account);
        subscription.set("networkId", networkId);
        let result = await subscription.save(null).then((result, error) => {
            if (error) {
                throw new Error("subscribe error: ", error);
            } else {
                return result;
            }
        });

        try {
            return dispatch({
                type: SUBSCRIBE_SUCCESS,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: SUBSCRIBE_ERROR,
                error: error
            });
        }
    };
}

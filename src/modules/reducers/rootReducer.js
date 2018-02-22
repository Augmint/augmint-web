import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";
import web3Connect from "modules/reducers/web3Connect";
import rates from "modules/reducers/rates";
import augmintToken from "modules/reducers/augmintToken";
import monetarySupervisor from "modules/reducers/monetarySupervisor";
import loanManager from "modules/reducers/loanManager";
import loanTransactions from "modules/reducers/loanTransactions";
import userBalances from "modules/reducers/userBalances";
import userTransfers from "modules/reducers/userTransfers";
import loans from "modules/reducers/loans";
import exchange from "modules/reducers/exchange";
import orders from "modules/reducers/orders";
import subscriptions from "modules/reducers/subscriptions";
import { reducer as formReducer } from "redux-form";
import { reducer as flashReducer } from "redux-flash";

export default combineReducers({
    routing: routerReducer,
    web3Connect,
    rates,
    augmintToken,
    monetarySupervisor,
    loanManager,
    loanTransactions,
    userBalances,
    userTransfers,
    exchange,
    orders,
    loans,
    subscriptions,
    flash: flashReducer,
    form: formReducer
});

import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";
import web3Connect from "modules/reducers/web3Connect";
import rates from "modules/reducers/rates";
import augmintToken from "modules/reducers/augmintToken";
import monetarySupervisor from "modules/reducers/monetarySupervisor";
import loanManager from "modules/reducers/loanManager";
import loanTransactions from "modules/reducers/loanTransactions";
import lockManager from "modules/reducers/lockManager";
import userBalances from "modules/reducers/userBalances";
import userTransfers from "modules/reducers/userTransfers";
import loans from "modules/reducers/loans";
import exchange from "modules/reducers/exchange";
import orders from "modules/reducers/orders";
import trades from "modules/reducers/trades";
import subscriptions from "modules/reducers/subscriptions";
import { reducer as formReducer } from "redux-form";
import submittedTransactions from "modules/reducers/submittedTransactions";

export default combineReducers({
    routing: routerReducer,
    web3Connect,
    rates,
    augmintToken,
    monetarySupervisor,
    loanManager,
    loanTransactions,
    lockManager,
    userBalances,
    userTransfers,
    exchange,
    orders,
    trades,
    loans,
    subscriptions,
    submittedTransactions,
    form: formReducer
});

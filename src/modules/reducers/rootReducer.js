import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";
import web3Connect from "modules/reducers/web3Connect";
import rates from "modules/reducers/rates";
import tokenUcd from "modules/reducers/tokenUcd";
import loanManager from "modules/reducers/loanManager";
import userBalances from "modules/reducers/userBalances";
import userTransfers from "modules/reducers/userTransfers";
import loans from "modules/reducers/loans";
import exchange from "modules/reducers/exchange";
import orders from "modules/reducers/orders";
import { reducer as formReducer } from "redux-form";

export default combineReducers({
    routing: routerReducer,
    web3Connect,
    rates,
    tokenUcd,
    loanManager,
    userBalances,
    userTransfers,
    exchange,
    orders,
    loans,
    form: formReducer
});

import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";
import ethBase from "./ethBase";
import rates from "./rates";
import tokenUcd from "./tokenUcd";
import loanManager from "./loanManager";
import userBalances from "./userBalances";
import userTransfers from "./userTransfers";
import loans from "./loans";
import { reducer as formReducer } from "redux-form";

export default combineReducers({
    routing: routerReducer,
    ethBase,
    rates,
    tokenUcd,
    loanManager,
    userBalances,
    userTransfers,
    loans,
    form: formReducer
});

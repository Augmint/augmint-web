import { combineReducers } from "redux";
import { routerReducer } from "react-router-redux";
import web3Connect from "modules/reducers/web3Connect";
import contracts from "modules/reducers/contracts";
import rates from "modules/reducers/rates";
import augmintToken from "modules/reducers/augmintToken";
import monetarySupervisor from "modules/reducers/monetarySupervisor";
import loanManager from "modules/reducers/loanManager";
import loanTransactions from "modules/reducers/loanTransactions";
import lockManager from "modules/reducers/lockManager";
import userBalances from "modules/reducers/userBalances";
import userTransfers from "modules/reducers/userTransfers";
import loans from "modules/reducers/loans";
import locks from "modules/reducers/locks";
import exchange from "modules/reducers/exchange";
import orders from "modules/reducers/orders";
import trades from "modules/reducers/trades";
import subscriptions from "modules/reducers/subscriptions";
import legacyBalances from "modules/reducers/legacyBalances";
import legacyExchanges from "modules/reducers/legacyExchanges";
import legacyLockers from "modules/reducers/legacyLockers";
import legacyLoanManagers from "modules/reducers/legacyLoanManagers";
import stabilityBoardProxy from "modules/reducers/stabilityBoardProxy";
import preToken from "modules/reducers/preToken";
import metrics from "modules/reducers/metrics";
import payeeEthBalance from "modules/reducers/payeeEthBalance";
import ethTransfer from "modules/reducers/ethTransfer";

import { reducer as formReducer } from "redux-form";
import submittedTransactions from "modules/reducers/submittedTransactions";

export default combineReducers({
    routing: routerReducer,
    web3Connect,
    contracts,
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
    locks,
    subscriptions,
    submittedTransactions,
    legacyBalances,
    legacyExchanges,
    legacyLockers,
    legacyLoanManagers,
    stabilityBoardProxy,
    preToken,
    metrics,
    payeeEthBalance,
    ethTransfer,
    form: formReducer
});

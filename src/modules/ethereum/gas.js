export const cost = {
    NEW_LOAN_GAS: 350000, // As of now it's on testRPC: first for account = 296983  additional =  287467 first for user: testrpc: 320528
    NEW_FIRST_LOAN_GAS: 3600000, // on test rpc: 347467 rinkeby: ??
    REPAY_GAS: 1300000, // AugmintToken.repayLoan, as of now on testRpc: 108373 - 108461, 2nd from same AC: ?. on rinkeby: ???
    COLLECT_BASE_GAS: 90000, // as of now on testRpc: 1 loan = first: 72639, 2nd: 63989
    COLLECT_ONE_GAS: 40000, // as of now: ???

    TRANSFER_AUGMINT_TOKEN_GAS: 100000, // on testrpc: first: 75189 - 75405, rinkeby first: 76629
    //consecutive : no narr: 45405 - 60405 (higher when sent to account which never received)
    // w narrative: 46733 - 56693

    PLACE_ORDER_GAS: 4000000 // tx going to be replaced
};

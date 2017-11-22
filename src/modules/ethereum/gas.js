export const cost = {
    NEW_LOAN_GAS: 1000000, // As of now it's on testRPC: first= 865435 - 892077 additional = 835435 - 847058
    NEW_FIRST_LOAN_GAS: 1000000, // on ropsten: 892077
    REPAY_GAS: 150000, // as of now on testRpc: 113188, 2nd from same AC: ?. on rinkeby: 126251
    COLLECT_BASE_GAS: 90000, // as of now on testRpc: 1 loan = 89419
    COLLECT_ONE_GAS: 40000,

    TRANSFER_UCD_GAS: 100000, // on testrpc: first: 75189 - 75405, rinkeby first: 76629
    //consecutive : no narr: 45405 - 60405 (higher when sent to account which never received)
    // w narrative: 46733 - 56693

    PLACE_ORDER_GAS: 4000000 // tx going to be replaced
};

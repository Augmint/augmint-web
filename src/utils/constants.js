export const ONE_ETH_IN_WEI = 1e18;

/* augmintToken decimals. used when AugmintToken contract is not yet isConnected
    otherwise available as: store.getState().augmintToken.info.decimalsDiv
 */
export const DECIMALS_DIV = 100;
export const DECIMALS = 2;

export const PPM_DIV = 1000000;

/* also available via contracts getters  */
export const EXCHANGE_CHUNK_SIZE = 100;

export const SCRIPT_STATES = ["New", "Approved", "Done", "Cancelled", "Failed"];

// rational: it's to avoid loan tx to fail on min loan amount because of an ETH/EUR rate change
// in the background right when sending the tx from the UI
export const MIN_LOAN_AMOUNT_ADJUSTMENT = 1.25;

export const LOAN_STATES = ["Open", "Repaid", "Defaulted", "Collected"];

/* List of old augmint token deploy addresses by network id */
export const LEGACY_LOANMANAGER_CONTRACTS = {
    // mainnet (no deploy yet)
    1: [],

    // local ganache (migrations deploys it for manual testing)
    999: ["0x5d77f09a3703be84d84810379067a6d9ad759582"],

    // rinkeby
    4: [
        // too old version, no CHUNK_SIZE(), didn't bother to make compatible: "0xfb505462633ae3234760d0ee51c557199ab249df",
        "0xec5e35d8941386c3e08019b0ad1d4a8c40c7bcbc", // (oldToken2?)
        "0xbdb02f82d7ad574f9f549895caf41e23a8981b07", // oldLoanManager1 (oldToken3)
        "0x214919Abe3f2b7CA7a43a799C4FC7132bBf78e8A" // oldLoanManager2 (oldToken4)
    ]
};

export const AVG_BLOCK_TIME = 14; // 14 sec

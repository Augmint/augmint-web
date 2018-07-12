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

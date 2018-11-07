export const ONE_ETH_IN_WEI = 1e18;

/* augmintToken decimals. used when AugmintToken contract is not yet isConnected
    otherwise available as: store.getState().augmintToken.info.decimalsDiv
 */
export const DECIMALS_DIV = 100;
export const DECIMALS = 2;

export const PPM_DIV = 1000000;

/* used for newer contracts where CHUNK_SIZE is a param for query fxs.
    for older contracts CHUNK_SIZE available via contracts getters but we don't use those anymore (won't change chunkSize in legacy contracts)  */
export const LEGACY_CONTRACTS_CHUNK_SIZE = 100; // Chunksize how legacy contracts were deployed (can't be changed here!)
export const CHUNK_SIZE = 100; // New contracts accept chunksize as param for each fx so it can be adjusted with this constant

export const SCRIPT_STATES = ["New", "Approved", "Done", "Cancelled", "Failed"];

// rational: it's to avoid loan tx to fail on min loan amount because of an ETH/EUR rate change
// in the background right when sending the tx from the UI
export const MIN_LOAN_AMOUNT_ADJUSTMENT = 1.25;

export const LOAN_STATES = ["Open", "Repaid", "Defaulted", "Collected"];

/* List of old augmint token deploy addresses by network id */
export const LEGACY_AEUR_CONTRACTS = {
    // mainnet (no deploy yet)
    1: [],

    // local ganache (migrations deploys it for manual testing)
    999: ["0x7f3abcd33ffe83ba7426ee6ec45014364fe1cab4"],

    // rinkeby
    4: ["0x0557183334edc23a666201edc6b0aa2787e2ad3f"]
};

/* List of old augmint token deploy addresses by network id */
export const LEGACY_LOANMANAGER_CONTRACTS = {
    // mainnet (no deploy yet)
    1: [],

    // local ganache (migrations deploys it for manual testing)
    999: ["0x5d77f09a3703be84d84810379067a6d9ad759582"],

    // rinkeby
    4: ["0x6cb7731c78e677f85942b5f1d646b3485e5820c1"]
};

/* List of old Locker deploy addresses by network id */
export const LEGACY_LOCKER_CONTRACTS = {
    // mainnet
    1: ["0x095c0F071Fd75875a6b5a1dEf3f3a993F591080c"], // initial locker, replaced by 0x26438D7c52cE617dFc75A2F02eE816557f01e5Bb

    // local ganache (migrations deploys it for manual testing)
    999: ["0xe6a48098a0a318ccec66bcd8297417e0d74585dc"],

    // rinkeby
    4: ["0x6d84ab6c385b827e58c358d078ac7b1c61b68821"]
};

/* List of old MonetarySupervisor deploy addresses by network id */
export const LEGACY_MONETARY_SUPERVISOR_CONTRACTS = {
    // mainnet
    1: [],

    // local ganache (migrations deploys it for manual testing)
    999: [],

    // rinkeby
    4: ["0xcec3574eca89409b15a8a72a6e737c4171457871"]
};

/* List of old MonetarySupervisor deploy addresses by network id */
export const LEGACY_FEE_CONTRACTS = {
    // mainnet
    1: [],

    // local ganache (migrations deploys it for manual testing)
    999: [],

    // rinkeby
    4: [{ address: "0xb77f9cdda72eec47a57793be088c7b523f6b5014", tokenAddress: "0x0557183334edc23a666201edc6b0aa2787e2ad3f" }]
};

/* List of old MonetarySupervisor deploy addresses by network id */
export const LEGACY_INTEREST_EARNED_CONTRACTS = {
    // mainnet
    1: [],

    // local ganache (migrations deploys it for manual testing)
    999: [],

    // rinkeby
    4: [{ address: "0x489cbf1674b575e6dfcff0a4f2bbc74f7e9dde28", tokenAddress: "0x0557183334edc23a666201edc6b0aa2787e2ad3f" }]
};

/* List of old MonetarySupervisor deploy addresses by network id */
export const LEGACY_RESERVES_CONTRACTS = {
    // mainnet
    1: [],

    // local ganache (migrations deploys it for manual testing)
    999: [],

    // rinkeby
    4: [{ address: "0xc036a1dd59ac55e2fb6b3d7416cb4ecc44605834", tokenAddress: "0x0557183334edc23a666201edc6b0aa2787e2ad3f" }]
};

/* List of old augmint token deploy addresses by network id */
export const LEGACY_EXCHANGE_CONTRACTS = {
    // mainnet
    1: [
        "0x8b52b019d237d0bbe8Baedf219132D5254e0690b", // initial Exchange, replaced by 0xeae7d30bcd44f27d58985b56add007fcee254abd
        "0xeae7d30bcd44f27d58985b56add007fcee254abd" // replaced by 0.6.1 at 0xaFEA54baDf7A68F93C2235B5F4cC8F02a2b55Edd
    ],

    // local ganache (migrations deploys it for manual testing)
    999: ["0x9f5420ec1348df8de8c85dab8d240ace122204c5"],

    // rinkeby
    4: ["0xdf47d51028daff13424f42523fdac73079ab901b"]
};

export const AVG_BLOCK_TIME = 14; // 14 sec

export const NETWORKS = {
    1: "Main",
    2: "Morden",
    3: "Ropsten",
    4: "Rinkeby",
    42: "Kovan",
    999: "Testrpc",
    4447: "TruffleLocal",
    1976: "PrivateChain"
};

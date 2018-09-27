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
export const LEGACY_AEUR_CONTRACTS = {
    // mainnet (no deploy yet)
    1: [],

    // local ganache (migrations deploys it for manual testing)
    999: ["0x7f3abcd33ffe83ba7426ee6ec45014364fe1cab4"],

    // rinkeby
    4: [
        // "0x95aa79d7410eb60f49bfd570b445836d402bd7b1", // oldToken1 - DROPPED support on UI to convert to latest (monetarySupervisor would need to be NoFeeTransferContract on Token instead of latest feeAccount)
        "0xA35D9de06895a3A2E7eCaE26654b88Fe71C179eA", // oldToken2 https://github.com/Augmint/augmint-web/commit/1f66ee910f5186c38733e1196ac5d41260490d24
        "0x135893f1a6b3037bb45182841f18f69327366992", // oldToken3
        "0x6C90c10D7A33815C2BaeeD66eE8b848F1D95268e" // oldToken4
    ]
};

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

/* List of old Locker deploy addresses by network id */
export const LEGACY_LOCKER_CONTRACTS = {
    // mainnet
    1: ["0x095c0F071Fd75875a6b5a1dEf3f3a993F591080c"], // initial locker, replaced by 0x26438D7c52cE617dFc75A2F02eE816557f01e5Bb

    // local ganache (migrations deploys it for manual testing)
    999: ["0xe6a48098a0a318ccec66bcd8297417e0d74585dc"],

    // rinkeby
    4: [
        // too old version, no CHUNK_SIZE(), didn't bother to make compatible: "0x617cf9ba5c9cbecdd66412bc1d073b002aa26426",
        "0xfb6b4803c590e564a3e6810289ab638b353a1367", // (oldToken2?)
        "0xf98ae1fb568b267a7632bf54579a153c892e2ec2", // oldLocker1 (oldToken3)
        "0xd0B6136C2E35c288A903E836feB9535954E4A9e9", // oldLocker2 (oldToken4)
        "0x5B94AaF241E8039ed6d3608760AE9fA7186767d7" // oldLocker3 - tokencontract: 0xe54f61d6EaDF03b658b3354BbD80cF563fEca34c
    ]
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
    4: [
        "0x65d30e5a6191a507fda96341f6ba773c4224c0e1",
        "0x03fe291f8a30e54cd05459f368d554b40784ca78",
        "0x86abc21cbb508fcb303f881d6871e4f870ce041a",
        "0xc5b604f8e046dff26642ca544c9eb3064e02ecd9",
        "0x5e2Be81aB4237c7c08d929c42b9F13cF4f9040D2",
        "0x5c35162dbf91c794f1569c5fe1649f0c5283d2f6"
    ]
};

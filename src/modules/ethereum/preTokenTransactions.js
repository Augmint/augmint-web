import store from "modules/store";

import { PPM_DIV } from "utils/constants";

export async function fetchTransfersForAccountTx(account) {
    const preToken = store.getState().contracts.latest.preToken.web3ContractInstance;
    const fromBlock = store.getState().contracts.latest.preToken.deployedAtBlock;

    const [transfersTo, transfersFrom] = await Promise.all([
        preToken.getPastEvents("Transfer", {
            filter: { to: account },
            fromBlock,
            toBlock: "latest"
        }),
        preToken.getPastEvents("Transfer", {
            filter: { from: account },
            fromBlock,
            toBlock: "latest"
        })
    ]);
    const transfers = transfersTo.concat(transfersFrom);
    return transfers;
}

export async function fetchAccountInfoTx(userAccount) {
    const preToken = store.getState().contracts.latest.preToken.web3ContractInstance;

    // struct Agreement {
    //     uint balance;
    //     bytes32 agreementHash; // SHA-2 (SHA-256) hash of signed agreement.
    //                           // OSX: shasum -a 256 agreement.pdf
    //                           // Windows: certUtil -hashfile agreement.pdf SHA256
    //     uint32 discount; //  discountRate in parts per million , ie. 10,000 = 1%
    //     uint32 valuationCap; // in USD (no decimals)
    // }

    const agreement = await preToken.methods.agreements(userAccount).call();

    const accountInfo = {
        userAccount,
        balance: agreement.balance,
        agreementHash: agreement.agreementHash,
        discount: agreement.discount / PPM_DIV,
        valuationCap: agreement.valuationCap
    };
    console.debug(accountInfo);
    return accountInfo;
}

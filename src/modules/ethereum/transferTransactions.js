/*
 A-EUR transfer ethereum functions
Use only from reducers.

    TODO: tune default gasPrice
    TODO: clean up thrown errors
    TODO: set gasEstimates when it gas consumption has settled.
 */
import store from "modules/store";
import moment from "moment";
import { cost } from "./gas";
import { processTx } from "modules/ethereum/ethHelper";
import { DECIMALS_DIV } from "utils/constants";

export function getTransferFee(amount) {
    const { feePt, feeMin, feeMax } = store.getState().augmintToken.info;
    let fee = Math.round(amount * feePt * DECIMALS_DIV) / DECIMALS_DIV;
    if (fee < feeMin) {
        fee = feeMin;
    } else if (fee > feeMax) {
        fee = feeMax;
    }
    return fee;
}

export function getMaxTransfer(amount) {
    const { feePt, feeMin, feeMax } = store.getState().augmintToken.info;

    const minLimit = Math.floor(feeMin / feePt);
    const maxLimit = Math.floor(feeMax / feePt);

    let maxAmount;
    if (amount < minLimit) {
        maxAmount = amount - feeMin;
    } else if (amount >= maxLimit) {
        // TODO: fix this on edge cases, https://github.com/Augmint/augmint-web/issues/60
        maxAmount = amount - feeMax;
    } else {
        maxAmount = Math.round((amount / (feePt + 1)) * DECIMALS_DIV) / DECIMALS_DIV;
    }

    return maxAmount;
}

export async function transferTokenTx(payload) {
    const { payee, tokenAmount, narrative } = payload;

    const gasEstimate = cost.TRANSFER_AUGMINT_TOKEN_GAS;
    const userAccount = store.getState().web3Connect.userAccount;
    const augmintToken = store.getState().contracts.latest.augmintToken.web3ContractInstance;

    const _narrative = narrative == null || payload.narrative.trim() === "" ? null : payload.narrative.trim();
    const amount = (tokenAmount * DECIMALS_DIV).toFixed(0);

    let tx;
    let txName;
    if (_narrative) {
        txName = "A-EUR transfer (with narrative)";
        tx = augmintToken.methods.transferWithNarrative(payee, amount, _narrative).send({
            from: userAccount,
            gas: gasEstimate
        });
    } else {
        txName = "A-EUR transfer";
        tx = augmintToken.methods.transfer(payee, amount).send({
            from: userAccount,
            gas: gasEstimate
        });
    }

    const transactionHash = await processTx(tx, txName, gasEstimate, null, payload);
    return { txName, transactionHash };
}

export async function fetchTransfersTx(account, fromBlock, toBlock) {
    try {
        const augmintToken = store.getState().contracts.latest.augmintToken.web3ContractInstance;

        const [logsFrom, logsTo] = await Promise.all([
            augmintToken.getPastEvents("AugmintTransfer", { filter: { from: account }, fromBlock, toBlock }),
            augmintToken.getPastEvents("AugmintTransfer", { filter: { to: account }, fromBlock, toBlock })
        ]);
        const logs = [...logsFrom, ...logsTo];
        const transfers = await Promise.all(
            logs.map(async logData => _formatTransferLog(account, logData, logData.returnValues))
        );

        return Array.from(new Set(transfers));
    } catch (error) {
        throw new Error("fetchTransferList failed.\n" + error);
    }
}

// called from augminTokenProvider, arguments are in ethers event listener format
export async function processNewTransferTx(account, eventObject) {
    return _formatTransferLog(account, eventObject, eventObject.args);
}

// get txData in format of logData returned from web3.getPastEvents or with eventObject passed by ethers event listener
async function _formatTransferLog(account, txData, args) {
    let blockData;
    if (typeof txData.getBlock === "function") {
        // called from event - need to use this.getBlock b/c block is available on Infura later than than tx receipt (Infura  node syncing)
        blockData = await txData.getBlock();
    } else {
        // not from event, web3.getBlock  works
        const web3 = store.getState().web3Connect.web3Instance;
        blockData = await web3.eth.getBlock(txData.blockNumber);
    }

    const direction = account.toLowerCase() === args.from.toLowerCase() ? -1 : 1;
    const senderFee = direction === -1 ? args.fee / DECIMALS_DIV : 0;
    const blockTimeStampText = blockData ? moment.unix(await blockData.timestamp).format("D MMM YYYY HH:mm") : "?";

    const logData = Object.assign({ args }, txData, {
        blockData,
        direction,
        directionText: direction === -1 ? "sent" : "received",
        senderFee,
        blockTimeStampText,
        signedAmount: (args.amount / DECIMALS_DIV) * direction
    });

    return logData;
}

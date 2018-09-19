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
import ethers from "ethers";
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

    let tx;
    let txName;
    if (_narrative) {
        txName = "A-EUR transfer (with narrative)";
        tx = augmintToken.methods.transferWithNarrative(payee, tokenAmount * DECIMALS_DIV, _narrative).send({
            from: userAccount,
            gas: gasEstimate
        });
    } else {
        txName = "A-EUR transfer";
        tx = augmintToken.methods.transfer(payee, tokenAmount * DECIMALS_DIV).send({
            from: userAccount,
            gas: gasEstimate
        });
    }

    const transactionHash = await processTx(tx, txName, gasEstimate);
    return { txName, transactionHash };
}

export async function fetchTransfersTx(account, fromBlock, toBlock) {
    try {
        const augmintTokenInstance = store.getState().contracts.latest.augmintToken.ethersInstance;
        const AugmintTransfer = augmintTokenInstance.interface.events.AugmintTransfer;
        const provider = store.getState().web3Connect.ethers.provider;

        const paddedAccount = ethers.utils.hexlify(ethers.utils.padZeros(account, 32));
        const [logsFrom, logsTo] = await Promise.all([
            provider.getLogs({
                fromBlock: fromBlock,
                toBlock: toBlock,
                address: augmintTokenInstance.address,
                topics: [AugmintTransfer.topics[0], paddedAccount]
            }),
            provider.getLogs({
                fromBlock: fromBlock,
                toBlock: toBlock,
                address: augmintTokenInstance.address,
                topics: [AugmintTransfer.topics[0], null, paddedAccount]
            })
        ]);
        const logs = [...logsFrom, ...logsTo];
        const transfers = await Promise.all(
            logs.map(eventLog => _formatTransferLog(AugmintTransfer, account, eventLog))
        );

        return transfers;
    } catch (error) {
        throw new Error("fetchTransferList failed.\n" + error);
    }
}

export async function processNewTransferTx(account, eventLog) {
    const augmintTokenInstance = store.getState().contracts.latest.augmintToken.ethersInstance;
    const AugmintTransfer = augmintTokenInstance.interface.events.AugmintTransfer;
    return _formatTransferLog(AugmintTransfer, account, eventLog);
}

async function _formatTransferLog(AugmintTransfer, account, eventLog) {
    let blockData;
    if (typeof eventLog.getBlock === "function") {
        // called from event - need to use this.getBlock b/c block is available on Infura later than than tx receipt (Infura  node syncing)
        blockData = await eventLog.getBlock();
    } else {
        // not from event, provider.getBlock should work
        const provider = store.getState().web3Connect.ethers.provider;
        blockData = await provider.getBlock(eventLog.blockNumber);
    }

    const parsedData = AugmintTransfer.parse(eventLog.topics, eventLog.data);

    const direction = account.toLowerCase() === parsedData.from.toLowerCase() ? -1 : 1;
    const senderFee = direction === -1 ? parsedData.fee / DECIMALS_DIV : 0;
    const blockTimeStampText = blockData ? moment.unix(await blockData.timestamp).format("D MMM YYYY HH:mm") : "?";

    const logData = Object.assign({ args: parsedData }, eventLog, {
        blockData: blockData,
        direction: direction,
        directionText: direction === -1 ? "sent" : "received",
        senderFee: senderFee,
        blockTimeStampText: blockTimeStampText,
        signedAmount: (parsedData.amount / DECIMALS_DIV) * direction
    });

    return logData;
}

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
import { EthereumTransactionError } from "modules/ethereum/ethHelper";

export function getTransferFee(amount) {
    const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;
    const feePt = store.getState().augmintToken.info.feePt;
    const feeMin = store.getState().augmintToken.info.feeMin;
    const feeMax = store.getState().augmintToken.info.feeMax;

    let fee = Math.round(amount * feePt * decimalsDiv) / decimalsDiv;
    if (fee < feeMin) {
        fee = feeMin;
    } else if (fee > feeMax) {
        fee = feeMax;
    }
    return fee;
}

export function getMaxTransfer(amount) {
    const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;
    const feePt = store.getState().augmintToken.info.feePt;
    const feeMin = store.getState().augmintToken.info.feeMin;
    const feeMax = store.getState().augmintToken.info.feeMax;

    const minLimit = Math.floor(feeMin / feePt);
    const maxLimit = Math.floor(feeMax / feePt);

    let maxAmount;
    if (amount < minLimit) {
        maxAmount = amount - feeMin;
    } else if (amount >= maxLimit) {
        // TODO: fix this on edge cases, https://github.com/Augmint/augmint-web/issues/60
        maxAmount = amount - feeMax;
    } else {
        maxAmount = Math.round(amount / (feePt + 1) * decimalsDiv) / decimalsDiv;
    }

    return maxAmount;
}

export async function transferTokenTx(payload) {
    const { payee, tokenAmount, _narrative } = payload;

    const gasEstimate = cost.TRANSFER_AUGMINT_TOKEN_GAS;
    const userAccount = store.getState().web3Connect.userAccount;
    const augmintToken = store.getState().augmintToken;
    const decimalsDiv = augmintToken.info.decimalsDiv;
    const narrative = _narrative == null ? "" : payload.narrative.trim();
    const result = await augmintToken.contract.instance.transferWithNarrative(
        payee,
        tokenAmount * decimalsDiv, // from truffle-contract 3.0.0 passing bignumber.js BN throws "Invalid number of arguments to Solidity function". should migrate to web3's BigNumber....
        narrative,
        {
            from: userAccount,
            gas: gasEstimate
        }
    );
    if (result.receipt.gasUsed === gasEstimate) {
        // Neeed for testnet behaviour
        throw new EthereumTransactionError(
            "Transfer transaction failed.",
            "All gas provided was used. Check tx.".result,
            gasEstimate
        );
    }

    if (!result.logs || !result.logs[0] || result.logs[0].event !== "Transfer") {
        throw new EthereumTransactionError(
            "Transfer transaction error.",
            "Transfer event wasn't received. Check tx.",
            result,
            gasEstimate
        );
    }

    const bn_amount = result.logs[0].args.amount;
    return {
        to: result.logs[0].args.to,
        from: result.logs[0].args.from,
        bn_amount: bn_amount,
        amount: bn_amount / decimalsDiv,
        narrative: result.logs[0].args.narrative,
        eth: {
            gasEstimate,
            result
        }
    };
}

export async function fetchTransfersTx(account, fromBlock, toBlock) {
    try {
        const augmintTokenInstance = store.getState().augmintToken.contract.ethersInstance;
        const AugmintTransfer = augmintTokenInstance.interface.events.AugmintTransfer();
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
    const augmintTokenInstance = store.getState().augmintToken.contract.ethersInstance;
    const AugmintTransfer = augmintTokenInstance.interface.events.AugmintTransfer();
    return _formatTransferLog(AugmintTransfer, account, eventLog);
}

async function _formatTransferLog(AugmintTransfer, account, eventLog) {
    const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;

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
    const senderFee = direction === -1 ? parsedData.fee / 10000 : 0;
    const blockTimeStampText = blockData ? moment.unix(await blockData.timestamp).format("D MMM YYYY HH:mm") : "?";

    const logData = Object.assign({ args: parsedData }, eventLog, {
        blockData: blockData,
        direction: direction,
        directionText: direction === -1 ? "sent" : "received",
        senderFee: senderFee,
        blockTimeStampText: blockTimeStampText,
        signedAmount: parsedData.amount / decimalsDiv * direction
    });

    return logData;
}

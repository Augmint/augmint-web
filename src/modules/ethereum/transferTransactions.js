/*
 A-EUR transfer ethereum functions
Use only from reducers.

    TODO: tune default gasPrice
    TODO: clean up thrown errors
    TODO: set gasEstimates when it gas consumption has settled.
 */
import store from "modules/store";
import BigNumber from "bignumber.js";
import moment from "moment";
import { cost } from "./gas";
import ethers from "ethers";

export function getTransferFee(amount) {
    const feePt = store.getState().augmintToken.info.feePt;
    const feeMin = store.getState().augmintToken.info.feeMin;
    const feeMax = store.getState().augmintToken.info.feeMax;

    let fee = amount
        .mul(feePt)
        .div(1000000)
        .round(0, BigNumber.ROUND_DOWN);
    if (fee.lt(feeMin)) {
        fee = feeMin;
    } else if (fee.gt(feeMax)) {
        fee = feeMax;
    }
    return fee;
}

export function getMaxTransfer(amount) {
    const feePt = store.getState().augmintToken.info.feePt;
    const feeMin = store.getState().augmintToken.info.feeMin;
    const feeMax = store.getState().augmintToken.info.feeMax;

    const minLimit = feeMin
        .div(feePt)
        .mul(1000000)
        .round(0, BigNumber.ROUND_DOWN);
    const maxLimit = feeMax
        .div(feePt)
        .mul(1000000)
        .round(0, BigNumber.ROUND_DOWN);

    let maxAmount;
    if (amount.lte(minLimit)) {
        maxAmount = amount.sub(feeMin);
    } else if (amount.gte(maxLimit)) {
        // TODO: fix this on edge cases, https://github.com/Augmint/augmint-core/issues/60
        maxAmount = amount.sub(feeMax);
    } else {
        maxAmount = amount
            .div(feePt.plus(1000000))
            .mul(1000000)
            .round(0, BigNumber.ROUND_HALF_UP);
    }

    return maxAmount;
}

export async function transferTokenTx(payload) {
    let { payee, tokenAmount, narrative } = payload;
    try {
        const gasEstimate = cost.TRANSFER_AUGMINT_TOKEN_GAS;
        const userAccount = store.getState().web3Connect.userAccount;
        const augmintToken = store.getState().augmintToken;
        const tokencAmount = tokenAmount.times(augmintToken.info.bn_decimalsDiv);
        narrative = narrative == null ? "" : payload.narrative.trim();
        const result = await augmintToken.contract.instance.transferWithNarrative(
            payee,
            tokencAmount.toString(), // from truffle-contract 3.0.0 passing bignumber.js BN throws "Invalid number of arguments to Solidity function". should migrate to web3's BigNumber....
            narrative,
            {
                from: userAccount,
                gas: gasEstimate
            }
        );
        if (result.receipt.gasUsed === gasEstimate) {
            // Neeed for testnet behaviour (TODO: test it!)
            // TODO: add more tx info
            throw new Error("A-EUR transfer failed. All gas provided was used:  " + result.receipt.gasUsed);
        }

        /* TODO:  display result in confirmation */

        if (!result.logs || !result.logs[0] || result.logs[0].event !== "Transfer") {
            throw new Error("Transfer event wasn't received. Check tx :  " + result.tx);
        }

        const bn_amount = result.logs[0].args.amount.div(new BigNumber(10000));
        return {
            txResult: result,
            to: result.logs[0].args.to,
            from: result.logs[0].args.from,
            bn_amount: bn_amount,
            amount: bn_amount.toString(),
            narrative: result.logs[0].args.narrative,
            eth: {
                gasProvided: gasEstimate,
                gasUsed: result.receipt.gasUsed,
                tx: result.tx
            }
        };
    } catch (error) {
        throw new Error("A-EUR transfer failed.\n" + error);
    }
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
        const transfers = [];
        for (const eventLog of logs) {
            // TODO: make this parallel
            const logData = await _formatTransferLog(AugmintTransfer, augmintTokenInstance, account, eventLog);
            transfers.push(logData);
        }

        return transfers;
    } catch (error) {
        throw new Error("fetchTransferList failed.\n" + error);
    }
}

export async function processNewTransferTx(account, eventLog) {
    const augmintTokenInstance = store.getState().augmintToken.contract.ethersInstance;
    const AugmintTransfer = augmintTokenInstance.interface.events.AugmintTransfer();
    return _formatTransferLog(AugmintTransfer, augmintTokenInstance, account, eventLog);
}

async function _formatTransferLog(AugmintTransfer, augmintTokenInstance, account, eventLog) {
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
    const bn_senderFee = direction === -1 ? parsedData.fee / 10000 : new BigNumber(0);

    const blockTimeStampText = blockData ? moment.unix(await blockData.timestamp).format("D MMM YYYY HH:mm") : "?";

    const logData = Object.assign({ args: parsedData }, eventLog, {
        blockData: blockData,
        direction: direction,
        directionText: direction === -1 ? "sent" : "received",
        bn_senderFee: bn_senderFee,
        senderFee: bn_senderFee.toString(),
        blockTimeStampText: blockTimeStampText,
        signedAmount: parsedData.amount
            .div(10000)
            .mul(direction)
            .toString()
    });
    return logData;
}

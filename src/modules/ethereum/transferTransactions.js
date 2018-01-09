/*
 ACE transfer ethereum functions
Use only from reducers.

    TODO: tune default gasPrice
    TODO: clean up thrown errors
    TODO: set gasEstimates when it gas consumption has settled.
 */
import store from "modules/store";
import BigNumber from "bignumber.js";
import moment from "moment";
import { asyncGetBlock, getEventLogs } from "modules/ethereum/ethHelper";
import { cost } from "./gas";

export function getTransferFee(amount) {
    let feePt = store.getState().tokenUcd.info.feePt;
    let feeMin = store.getState().tokenUcd.info.feeMin;
    let feeMax = store.getState().tokenUcd.info.feeMax;

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
    let feePt = store.getState().tokenUcd.info.feePt;
    let feeMin = store.getState().tokenUcd.info.feeMin;
    let feeMax = store.getState().tokenUcd.info.feeMax;
    let maxAmount;

    let minLimit = feeMin
        .div(feePt)
        .mul(1000000)
        .round(0, BigNumber.ROUND_DOWN);
    let maxLimit = feeMax
        .div(feePt)
        .mul(1000000)
        .round(0, BigNumber.ROUND_DOWN);
    if (amount.lte(minLimit)) {
        maxAmount = amount.sub(feeMin);
    } else if (amount.gte(maxLimit)) {
        // TODO: fix this on edge cases, https://github.com/DecentLabs/dcm-poc/issues/60
        maxAmount = amount.sub(feeMax);
    } else {
        maxAmount = amount
            .div(feePt.plus(1000000))
            .mul(1000000)
            .round(0, BigNumber.ROUND_HALF_UP);
    }

    return maxAmount;
}

export async function transferUcdTx(payload) {
    let { payee, ucdAmount, narrative } = payload;
    try {
        let gasEstimate = cost.TRANSFER_UCD_GAS;
        let userAccount = store.getState().web3Connect.userAccount;
        let tokenUcd = store.getState().tokenUcd;
        let ucdcAmount = ucdAmount.times(tokenUcd.info.bn_decimalsDiv);
        narrative = narrative == null ? "" : payload.narrative.trim();
        let result = await tokenUcd.contract.instance.transferWithNarrative(
            payee,
            ucdcAmount.toString(), // from truffle-contract 3.0.0 passing bignumber.js BN throws "Invalid number of arguments to Solidity function". should migrate to web3's BigNumber....
            narrative,
            {
                from: userAccount,
                gas: gasEstimate
            }
        );
        if (result.receipt.gasUsed === gasEstimate) {
            // Neeed for testnet behaviour (TODO: test it!)
            // TODO: add more tx info
            throw new Error("ACE transfer failed. All gas provided was used:  " + result.receipt.gasUsed);
        }

        /* TODO:  display result in confirmation */

        if (!result.logs || !result.logs[0] || result.logs[0].event !== "Transfer") {
            throw new Error("Transfer event wasn't received. Check tx :  " + result.tx);
        }

        let bn_amount = result.logs[0].args.amount.div(new BigNumber(10000));
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
        throw new Error("ACE transfer failed.\n" + error);
    }
}

export async function fetchTransferListTx(address, fromBlock, toBlock) {
    try {
        let tokenUcd = store.getState().tokenUcd.contract;
        let filterResult = await getEventLogs(
            tokenUcd,
            tokenUcd.instance.AugmintTransfer,
            { from: address, to: address }, // filter with OR!
            fromBlock,
            toBlock
        );
        //console.debug("fetchTransferListTx filterResult", filterResult);
        let transfers = await Promise.all(
            filterResult.map((tx, index) => {
                return formatTransfer(address, tx);
            })
        );

        transfers.sort((a, b) => {
            return b.blockTimeStamp - a.blockTimeStamp;
        });

        return transfers;
    } catch (error) {
        throw new Error("fetchTransferList failed.\n" + error);
    }
}

export async function processTransferTx(address, tx) {
    try {
        let transfers = store.getState().userTransfers.transfers;
        let result = await formatTransfer(address, tx);
        // TODO: sort and look for dupes?

        if (transfers !== null) {
            result = [result, ...transfers];
        } else {
            result = [result];
        }
        return result;
    } catch (error) {
        throw new Error("processTransferTx failed.\n" + error);
    }
}

async function formatTransfer(address, tx) {
    //console.debug("formatTransfer args tx: ", tx);
    let direction = address.toLowerCase() === tx.args.from.toLowerCase() ? -1 : 1;
    let blockTimeStamp, bn_amount, bn_fee;
    let feeTmp, amountTmp;
    if (tx.timeStamp) {
        // when we query from etherscan we get timestamp and args are not BigNumber
        blockTimeStamp = tx.timeStamp;
        amountTmp = new BigNumber(tx.args.amount);
        feeTmp = new BigNumber(tx.args.fee);
    } else {
        blockTimeStamp = (await asyncGetBlock(tx.blockNumber)).timestamp;
        amountTmp = tx.args.amount;
        feeTmp = tx.args.fee;
    }
    bn_amount = amountTmp.div(new BigNumber(10000));
    bn_fee = direction === -1 ? feeTmp.div(new BigNumber(10000)) : new BigNumber(0);

    let result = {
        blockNumber: tx.blockNumber,
        transactionIndex: tx.transactionIndex,
        transactionHash: tx.transactionHash,
        logIndex: tx.logIndex,
        type: tx.type,
        bn_amount: bn_amount,
        direction: direction === -1 ? "out" : "in",
        amount: bn_amount.times(direction).toString(),
        from: tx.args.from,
        to: tx.args.to,
        bn_fee: bn_fee,
        fee: bn_fee.toString(),
        narrative: tx.args.narrative,
        blockTimeStamp: blockTimeStamp,
        blockTimeStampText: moment.unix(blockTimeStamp).format("D MMM YYYY HH:mm")
    };
    //console.debug("formatTransfer result", result);
    return result;
}

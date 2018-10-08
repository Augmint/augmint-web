import { utils as web3Utils } from "web3";
import * as cookie from "utils/cookie";
import { createUrl } from "utils/helpers";
const transferRequestsCookieName = "transferRequests";

function transferRequestEqual(a, b) {
    return (
        a.beneficiary_address === b.beneficiary_address &&
        a.amount === b.amount &&
        a.currency_code === b.currency_code &&
        a.network_id === b.network_id
    );
}

export function getTransferLink(request) {
    return "/transfer/" + request.timestamp;
}

export function getTransferRequests() {
    return cookie.getCookie(transferRequestsCookieName) || [];
}

export function getTransferRequest(timestamp) {
    return getTransferRequests().find(request => parseInt(request.timestamp, 10) === parseInt(timestamp, 10));
}

export function setTransferRequests(transferRequests) {
    cookie.setCookie(transferRequestsCookieName, transferRequests);
}

export function deleteTransferRequest(i) {
    const transferRequests = getTransferRequests();
    transferRequests.splice(i, 1);
    setTransferRequests(transferRequests);
}

export function applyTransferRequestFromUrl(urlParams) {
    const address = urlParams.get("beneficiary_address");
    const amount = urlParams.get("amount");

    if (address && amount) {
        let transferRequests = getTransferRequests();
        const request = {
            order_id: urlParams.get("order_id"),
            token: urlParams.get("token"),
            network_id: parseInt(urlParams.get("network_id") || 1, 10),
            beneficiary_address: address,
            beneficiary_name: urlParams.get("beneficiary_name"),
            amount: parseFloat(amount),
            currency_code: urlParams.get("currency_code") || "AEUR",
            reference: urlParams.get("reference"),
            notify_url: urlParams.get("notify_url"),
            timestamp: Date.now()
        };

        if (!web3Utils.isAddress(request.beneficiary_address)) {
            throw new Error("Invalid 'beneficiary_address' parameter.");
        }

        if (![1, 4].includes(request.network_id)) {
            throw new Error("Invalid 'network_id' parameter. Available values: 1 (mainnet), 4 (rinkeby)");
        }

        if (!["AEUR"].includes(request.currency_code)) {
            throw new Error("Invalid currency_code parameter. Available values: AEUR");
        }

        transferRequests.unshift(request);
        transferRequests = transferRequests.filter(
            (value, index, arr) =>
                arr.findIndex(v => {
                    return transferRequestEqual(value, v);
                }) === index
        );

        setTransferRequests(transferRequests);

        return request;
    }
}

export function callbackAfterTransfer(transaction) {
    const transferRequests = getTransferRequests();

    for (const i in transferRequests) {
        const transferRequest = transferRequests[i];

        if (
            transferRequestEqual(transferRequest, {
                beneficiary_address: transaction.payload.payee,
                amount: transaction.payload.tokenAmount,
                currency_code: transaction.payload.currencyCode,
                network_id: transaction.payload.networkId
            })
        ) {
            deleteTransferRequest(i);

            if (transferRequest.notify_url) {
                const link = createUrl(transferRequest.notify_url, {
                    order_id: transferRequest.order_id,
                    token: transferRequest.token,
                    network_id: transferRequest.network_id,
                    beneficiary_address: transferRequest.beneficiary_address,
                    amount: transferRequest.amount,
                    currency_code: transferRequest.currency_code,
                    tx_hash: transaction.transactionHash
                });

                window.location.replace(link);
            }
        }
    }
}

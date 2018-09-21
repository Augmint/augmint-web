import * as cookie from "utils/cookie";

const transferRequestsCookieName = "transferRequests";

function transferRequestEqual(a, b) {
    return a.beneficiary_address === b.beneficiary_address && a.amount === b.amount;
}

function createUrl(path, params) {
    const qs = new URLSearchParams();

    for (const key in params) {
        qs.set(key, params[key]);
    }

    return path + "?" + qs;
}

export function getTransferLink(request) {
    return createUrl("/transfer", {
        address: request.beneficiary_address,
        amount: request.amount,
        reference: request.reference
    });
}

export function getTransferRequests() {
    return cookie.getCookie(transferRequestsCookieName) || [];
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
            network_id: urlParams.get("network_id"),
            beneficiary_address: address,
            beneficiary_name: urlParams.get("beneficiary_name"),
            amount: parseFloat(amount),
            currency_code: "AEUR", //urlParams.get("currency_code"),
            reference: urlParams.get("reference"),
            notify_url: urlParams.get("notify_url")
        };
        transferRequests.push(request);
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

export function callbackAfterTransfer(beneficiary_address, amount, transactionHash) {
    const transferRequests = getTransferRequests();

    for (const i in transferRequests) {
        const transferRequest = transferRequests[i];

        if (
            transferRequestEqual(transferRequest, {
                beneficiary_address,
                amount
            })
        ) {
            deleteTransferRequest(i);

            const link = createUrl(transferRequest.notify_url, {
                order_id: transferRequest.order_id,
                token: transferRequest.token,
                network_id: transferRequest.network_id,
                beneficiary_address,
                amount,
                currency_code: transferRequest.currency_code,
                tx_hash: transactionHash
            });

            window.location.replace(link);
        }
    }
}

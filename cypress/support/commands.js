import { default as Web3 } from "web3";

import TokenAEur from "../../src/abiniser/abis/TokenAEur_ABI_2ea91d34a7bfefc8f38ef0e8a5ae24a5.json";
import TokenAEurDeploys from "../../src/abiniser/deployments/999/TokenAEur_DEPLOYS.json";

import MonetarySupervisor from "../../src/abiniser/abis/MonetarySupervisor_ABI_7f500b43397413e97de925528187f9cd.json";
import MonetarySupervisorDeploys from "../../src/abiniser/deployments/999/MonetarySupervisor_DEPLOYS.json";

import AugmintReserves from "../../src/abiniser/abis/AugmintReserves_ABI_024b81d1a1f75241167a8a0f6e62326f.json";
import AugmintReservesDeploys from "../../src/abiniser/deployments/999/AugmintReserves_DEPLOYS.json";

let accounts = null;
let snapshotId;

let gasPrice;

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

if (typeof web3.currentProvider.sendAsync !== "function") {
    web3.currentProvider.sendAsync = function() {
        return web3.currentProvider.send.apply(web3.currentProvider, arguments);
    };
}

web3.eth
    .getAccounts()
    .then(res => {
        accounts = res;
        return web3.eth.getGasPrice();
    })
    .then(res => {
        gasPrice = res;
    });

const augmintTokenInstance = new web3.eth.Contract(
    TokenAEur.abi,
    TokenAEurDeploys.deployedAbis[TokenAEur.abiHash].latestDeployedAddress
);

const monetarySupervisorInstance = new web3.eth.Contract(
    MonetarySupervisor.abi,
    MonetarySupervisorDeploys.deployedAbis[MonetarySupervisor.abiHash].latestDeployedAddress
);

const augmintReservesInstance = new web3.eth.Contract(
    AugmintReserves.abi,
    AugmintReservesDeploys.deployedAbis[AugmintReserves.abiHash].latestDeployedAddress
);

Cypress.Commands.add("ganacheTakeSnapshot", (options = {}) => {
    const startTime = new Date().getTime();

    return new Promise(function(resolve, reject) {
        web3.currentProvider.sendAsync(
            {
                method: "evm_snapshot",
                params: [],
                jsonrpc: "2.0",
                id: startTime
            },
            function(error, res) {
                if (error) {
                    reject(new Error("Can't take snapshot with web3\n" + error));
                } else {
                    const t = new Date().getTime();
                    snapshotId = res.result;
                    console["log"](
                        "ganacheTakeSnapshot snapshot ",
                        snapshotId + " was taken in ",
                        t - startTime + "ms"
                    );
                    resolve(res.result);
                }
            }
        );
    });
});

Cypress.Commands.add("ganacheRevertSnapshot", (options = {}) => {
    const startTime = new Date().getTime();
    return new Promise(function(resolve, reject) {
        web3.currentProvider.sendAsync(
            {
                method: "evm_revert",
                params: [snapshotId],
                jsonrpc: "2.0",
                id: startTime
            },
            function(error, res) {
                if (error) {
                    // TODO: this error is not bubbling up to truffle test run :/
                    reject(new Error("Can't revert snapshot with web3. snapshotId: " + snapshotId + "\n" + error));
                } else {
                    const t = new Date().getTime();
                    console["log"](
                        "ganacheRevertSnapshot snapshot ",
                        snapshotId + " reverted in" + (t - startTime) + "ms"
                    );
                    resolve(res);
                }
            }
        );
    });
});

Cypress.Commands.add("getGasPriceInEth", (options = {}) => {
    return parseFloat(web3.utils.fromWei(gasPrice));
});

// get user AEUR balance from ganache. Usage: cy.getUserAEurBalance or this.startingAeurBalance (set in before each)
Cypress.Commands.add("getUserAEurBalance", (account, options = {}) => {
    if (typeof account === "undefined") {
        account = accounts[0];
    }

    return augmintTokenInstance.methods
        .balanceOf(account)
        .call()
        .then(bal => Number(bal) / 100);
});

// get user ETH balance from ganache. Usage: cy.getUserEthBalance or this.startingEthBalance (set in before each)
Cypress.Commands.add("getUserEthBalance", (account, options = {}) => {
    if (typeof account === "undefined") {
        account = accounts[0];
    }

    return web3.eth.getBalance(account).then(bal => web3.utils.fromWei(bal));
});

// assert user balance on UI.
Cypress.Commands.add("assertUserAEurBalanceOnUI", (balance, options = {}) => {
    cy.get("[data-testid=accountInfoBlock]").should("not.have.class", "loading");

    const decimals = 2;
    const fmt = new Intl.NumberFormat("en", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

    cy.get("[data-testid=userAEurBalance]")
        .invoke("text")
        .should("equal", fmt.format(balance) + " A€");
});

// assert user balance on UI.
Cypress.Commands.add("assertUserEthBalanceOnUI", (_expectedEth, decimals = 12, options = {}) => {
    const expectedEth = Number(_expectedEth.toFixed(decimals));
    cy.get("[data-testid=accountInfoBlock]").should("not.have.class", "loading");

    cy.get("[data-testid=userEthBalance]")
        .invoke("text")
        .should(val => {
            // TODO: this throws a lot of console warnings
            expect(Number(val)).to.be.approximately(expectedEth, 1 / 10 ** decimals);
        });
});

// issue AEUR to account
Cypress.Commands.add("issueTo", (tokenAmount, to, options = {}) => {
    if (typeof to === "undefined") {
        to = accounts[0];
    }

    const MONETARY_SUPERVISOR_PERMISSION = web3.utils.asciiToHex("MonetarySupervisor");
    augmintTokenInstance.methods
        .grantPermission(accounts[0], MONETARY_SUPERVISOR_PERMISSION)
        .send({ from: accounts[0] })
        .then(res => {
            return augmintTokenInstance.methods.issueTo(to, tokenAmount).send({ from: accounts[0], gas: 500000 });
        })
        .then(res => {
            return augmintTokenInstance.methods.revokePermission(
                accounts[0],
                web3.utils.asciiToHex("MonetarySupervisor")
            );
        });
});

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import { default as Web3 } from "web3";
import { default as Contract } from "truffle-contract";
import augmintToken_artifacts from "../../src/contractsBuild/TokenAEur.json";
import monetarySupervisor_artifacts from "../../src/contractsBuild/MonetarySupervisor.json";
import augmintReserves_artifacts from "../../src/contractsBuild/AugmintReserves.json";

let augmintTokenInstance = null;
let monetarySupervisorInstance = null;
let augmintReservesInstance = null;

let accounts = null;
let snapshotId;

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

try {
    const augmintTokenContract = Contract(augmintToken_artifacts);
    augmintTokenContract.setProvider(web3.currentProvider);

    const monetarySupervisorContract = Contract(monetarySupervisor_artifacts);
    monetarySupervisorContract.setProvider(web3.currentProvider);

    const augmintReservesContract = Contract(augmintReserves_artifacts);
    augmintReservesContract.setProvider(web3.currentProvider);

    web3.eth.net.getId().then(networkId => {
        augmintTokenContract.setNetwork(networkId);
        augmintTokenInstance = augmintTokenContract.at(
            augmintTokenContract.address
        );

        monetarySupervisorContract.setNetwork(networkId);
        monetarySupervisorInstance = monetarySupervisorContract.at(
            monetarySupervisorContract.address
        );

        augmintReservesContract.setNetwork(networkId);
        augmintReservesInstance = augmintReservesContract.at(
            augmintReservesContract.address
        );
    });

    web3.eth.getAccounts().then(_accounts => {
        accounts = _accounts;
    });

    if (typeof web3.currentProvider.sendAsync !== "function") {
        web3.currentProvider.sendAsync = function() {
            return web3.currentProvider.send.apply(
                web3.currentProvider,
                arguments
            );
        };
    }
    const web3Version = web3.version.api ? web3.version.api : web3.version;
    console["log"]("web3 connected", web3Version);
} catch (error) {
    throw new Error(`Error while connecting to Augmint contracts\n${error}`);
}

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
                    reject(
                        new Error("Can't take snapshot with web3\n" + error)
                    );
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
                    reject(
                        new Error(
                            "Can't revert snapshot with web3. snapshotId: " +
                                snapshotId +
                                "\n" +
                                error
                        )
                    );
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

// get user balance from ganache. Usage: cy.getUserAEurBalance or this.startingAeurBalance (set in before each)
Cypress.Commands.add("getUserAEurBalance", (account, options = {}) => {
    if (typeof account === "undefined") {
        account = accounts[0];
    }

    return augmintTokenInstance.balanceOf(account).then(bal => {
        return Number(bal) / 100;
    });
});

// get user balance from UI.
Cypress.Commands.add("assertUserAEurBalanceOnUI", (balance, options = {}) => {
    cy
        .get("[data-testid=accountInfoBlock]")
        .should("not.have.class", "loading");

    cy
        .get("[data-testid=userAEurBalance]")
        .invoke("text")
        .should("equal", balance.toString());
});

// issue AEUR to account
Cypress.Commands.add("issueTo", (amount, to, options = {}) => {
    if (typeof to === "undefined") {
        to = accounts[0];
    }

    return monetarySupervisorInstance
        .issueToReserve(amount, {
            from: accounts[0],
            gas: 400000
        })
        .then(res => {
            return augmintReservesInstance.withdrawTokens(
                augmintTokenInstance.address,
                to,
                amount,
                "withdrawal for tests",
                { from: accounts[0] }
            );
        });
});

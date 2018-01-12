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
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
let snapshotId;

if (typeof web3.currentProvider.sendAsync !== "function") {
    web3.currentProvider.sendAsync = function() {
        return web3.currentProvider.send.apply(web3.currentProvider, arguments);
    };
}
const web3Version = web3.version.api ? web3.version.api : web3.version;
console["log"]("web3 connected", web3Version);

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

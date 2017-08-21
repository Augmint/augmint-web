var stringifier = require("stringifier");
var gasUseLog = new Array();

module.exports = {
    stringify: stringify,
    logGasUse: logGasUse,
    expectThrow: expectThrow
};
var _stringify = stringifier({ maxDepth: 3, indent: "   " });

function stringify(values) {
    return _stringify(values);
}

function logGasUse(testObj, tx) {
    gasUseLog.push([
        testObj.test.parent.title,
        testObj.test.fullTitle(),
        tx.receipt.gasUsed
    ]);
} //  logGasUse ()

function expectThrow(promise) {
    const onPrivateChain = web3.version.network == 1976 ? true : false; // set by .runprivatechain.sh (geth ...  --networkid 1976 ..)
    return promise
        .then(res => {
            if (!onPrivateChain) {
                console.log(
                    "Received tx instead of throw: \r\n",
                    JSON.stringify(res, null, 4)
                );
                assert.fail("Expected throw not received");
            } // on privatechain we check gasUsed after tx sent
            return;
        })
        .catch(error => {
            // TODO: Check jump destination to destinguish between a throw
            //       and an actual invalid jump.
            const invalidJump = error.message.search("invalid JUMP") >= 0;
            // TODO: When we contract A calls contract B, and B throws, instead
            //       of an 'invalid jump', we get an 'out of gas' error. How do
            //       we distinguish this from an actual out of gas event? (The
            //       testrpc log actually show an 'invalid jump' event.)
            const outOfGas = error.message.search("out of gas") >= 0;
            const outOfGasPrivateChain =
                error.message.search(
                    "The contract code couldn't be stored, please check your gas amount."
                ) >= 0;

            const allGasUsed = error.message.search("All gas used") >= 0; // we throw this manually after tx b/c on privatechain it doesn't throw :/
            const invalidOpcode1 =
                error.message.search(
                    "VM Exception while processing transaction: invalid opcode"
                ) >= 0;
            const invalidOpcode2 =
                error.message.search(
                    "VM Exception while executing eth_call: invalid opcode"
                ) >= 0;

            assert(
                invalidOpcode1 ||
                    invalidOpcode2 ||
                    invalidJump ||
                    outOfGas ||
                    (onPrivateChain && (outOfGasPrivateChain || allGasUsed)),
                "Expected solidity throw, got '" +
                    error +
                    "' instead. onPrivateChain: " +
                    onPrivateChain
            );
            return;
        });
} // expectThrow

after(function() {
    // runs after all tests
    if (gasUseLog.length > 0) {
        // console.log("full title:", this.parent.fullTitle()); // CHECK: why doesn't it work?
        console.log(
            "===================  GAS USAGE STATS " +
                "" +
                " ==================="
        );
        console.log("Test contract", "Test", "Gas used");
        //console.log(gasUseLog);
        var sum = 0;
        for (var i = 0; i < gasUseLog.length; i++) {
            console.log(
                '"' +
                    gasUseLog[i][0] +
                    '", "' +
                    gasUseLog[i][1] +
                    '", ' +
                    gasUseLog[i][2]
            );
            sum += gasUseLog[i][2];
        }

        console.log("=========== Total gas usage : " + sum);
    }
}); // after()

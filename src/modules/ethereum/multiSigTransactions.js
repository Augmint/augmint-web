/* MultiSig ethereum functions for StabilityBoardSigner and PreTokenSigner contracts
Use only from reducers.  */
import store from "modules/store";
import { SCRIPT_STATES } from "utils/constants";

export async function fetchScriptsTx(multiSigInstance) {
    const web3 = store.getState().web3Connect.web3Instance;
    const [chunkSize, scriptCount] = await Promise.all([
        multiSigInstance.methods
            .CHUNK_SIZE()
            .call()
            .then(res => parseInt(res, 10)),
        multiSigInstance.methods
            .getScriptsCount()
            .call()
            .then(res => parseInt(res, 10))
    ]);

    let scripts = [];

    const queryCount = Math.ceil(scriptCount / chunkSize);

    for (let i = 0; i < queryCount; i++) {
        const scriptsArray = await multiSigInstance.methods.getAllScripts(i * chunkSize).call();

        const parsedScripts = scriptsArray.filter(item => item[1] !== "0").map(item => {
            const state = parseInt(item[2], 10);
            const stateText = SCRIPT_STATES[state];
            const addressInt = web3.utils.toBN(item[1]);
            return {
                id: parseInt(item[0], 10),
                address: "0x" + addressInt.toString(16).padStart(40, "0"),
                state,
                stateText,
                signCount: parseInt(item[3], 10)
            };
        });
        scripts = scripts.concat(parsedScripts);
    }

    return scripts;
}

export async function fetchSignersTx(multiSigInstance) {
    const web3 = store.getState().web3Connect.web3Instance;
    const [chunkSize, allSignersCount] = await Promise.all([
        multiSigInstance.methods
            .CHUNK_SIZE()
            .call()
            .then(res => parseInt(res, 10)),
        multiSigInstance.methods
            .getAllSignersCount()
            .call()
            .then(res => parseInt(res, 10))
    ]);

    let signers = [];

    const queryCount = Math.ceil(allSignersCount / chunkSize);

    for (let i = 0; i < queryCount; i++) {
        const signersArray = await multiSigInstance.methods.getAllSigners(i * chunkSize).call();
        const parsedSingers = signersArray.filter(item => item[1] !== "0").map(item => {
            const addressInt = web3.utils.toBN(item[1]);
            return {
                id: parseInt(item[0], 10),
                address: "0x" + addressInt.toString(16).padStart(40, "0"),
                isActive: item[2] === "1"
            };
        });
        signers = signers.concat(parsedSingers);
    }

    return signers;
}

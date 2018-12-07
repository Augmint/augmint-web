/* MultiSig ethereum functions for StabilityBoardProxy and PreTokenProxy contracts
Use only from reducers.  */
import store from "modules/store";
import { SCRIPT_STATES, CHUNK_SIZE } from "utils/constants";

export async function fetchScriptsTx(multiSigInstance) {
    const web3 = store.getState().web3Connect.web3Instance;
    const scriptCount = await multiSigInstance.methods
        .getScriptsCount()
        .call()
        .then(res => parseInt(res, 10));

    let scripts = [];

    const queryCount = Math.ceil(scriptCount / CHUNK_SIZE);

    for (let i = 0; i < queryCount; i++) {
        const scriptsArray = await multiSigInstance.methods.getScripts(i * CHUNK_SIZE, CHUNK_SIZE).call();

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
    const allSignersCount = await multiSigInstance.methods
        .getAllSignersCount()
        .call()
        .then(res => parseInt(res, 10));

    let signers = [];

    const queryCount = Math.ceil(allSignersCount / CHUNK_SIZE);

    for (let i = 0; i < queryCount; i++) {
        const signersArray = await multiSigInstance.methods.getSigners(i * CHUNK_SIZE, CHUNK_SIZE).call();
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

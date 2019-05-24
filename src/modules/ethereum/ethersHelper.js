/**
 * ethers js lib helper functions
 */

/**
 *  patch  event object returned by ethers lib to make it quasi compatible with web3 event format
 * @param {*} ethersEvent
 * @returns {*} event in patched so quasi compatible with web3 event format
 */
export function patchEthersEvent(ethersEvent) {
    return Object.assign({}, ethersEvent, { returnValues: ethersEvent.args });
}

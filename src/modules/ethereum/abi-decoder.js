const state = {
    savedABIs: [],
    methodIDs: {},
    web3: null
};

export function getABIs() {
    return state.savedABIs;
}

export function addABI(web3, abiArray) {
    state.web3 = web3;
    if (Array.isArray(abiArray)) {
        // Iterate new abi to generate method id's
        abiArray.map(abi => {
            if (abi.name) {
                const signature = state.web3.utils.sha3(
                    abi.name +
                        "(" +
                        abi.inputs
                            .map(function(input) {
                                return input.type;
                            })
                            .join(",") +
                        ")"
                );
                if (abi.type === "event") {
                    state.methodIDs[signature.slice(2)] = abi;
                } else {
                    state.methodIDs[signature.slice(2, 10)] = abi;
                }
            }
            return 1;
        });

        state.savedABIs = state.savedABIs.concat(abiArray);
    } else {
        throw new Error("Expected ABI array, got " + typeof abiArray);
    }
}

export function removeABI(abiArray) {
    if (Array.isArray(abiArray)) {
        // Iterate new abi to generate method id's
        abiArray.map(abi => {
            if (abi.name) {
                const signature = state.web3.utils.sha3(
                    abi.name +
                        "(" +
                        abi.inputs
                            .map(function(input) {
                                return input.type;
                            })
                            .join(",") +
                        ")"
                );
                if (abi.type === "event") {
                    if (state.methodIDs[signature.slice(2)]) {
                        delete state.methodIDs[signature.slice(2)];
                    }
                } else {
                    if (state.methodIDs[signature.slice(2, 10)]) {
                        delete state.methodIDs[signature.slice(2, 10)];
                    }
                }
            }
            return 1;
        });
    } else {
        throw new Error("Expected ABI array, got " + typeof abiArray);
    }
}

export function getMethodIDs() {
    return state.methodIDs;
}

export function decodeMethod(data) {
    const methodID = data.slice(2, 10);
    const abiItem = state.methodIDs[methodID];
    if (abiItem) {
        const params = abiItem.inputs.map(item => item.type);
        let decoded = state.web3.eth.abi.decodeParameters(
            params,
            data.slice(10)
        );
        return {
            name: abiItem.name,
            params: decoded.map((param, index) => {
                let parsedParam = param;
                if (abiItem.inputs[index].type.indexOf("uint") !== -1) {
                    parsedParam = state.web3.utils.toBN(param).toString();
                }
                return {
                    name: abiItem.inputs[index].name,
                    value: parsedParam,
                    type: abiItem.inputs[index].type
                };
            })
        };
    }
}

export function padZeros(address) {
    var formatted = address;
    if (address.indexOf("0x") !== -1) {
        formatted = address.slice(2);
    }

    if (formatted.length < 40) {
        while (formatted.length < 40) formatted = "0" + formatted;
    }

    return "0x" + formatted;
}

export function decodeLogs(logs) {
    //console.log("state:", state);
    return logs.map((logItem, index) => {
        const methodID = logItem.topics[0].slice(2);
        const method = state.methodIDs[methodID];
        // console.debug(
        //     "logItem index:",
        //     index,
        //     "method:",
        //     method,
        //     "methodId:",
        //     methodID,
        //     "   \nlogItem"
        // );
        if (method) {
            let logData = logItem.data;
            let inputs = method.inputs;
            let topics = logItem.topics.slice(1); // topic[0] is event name
            // let notIndexTopicsCount = topics.filter(item => {
            //     return (
            //         !item.indexed
            //     );
            // }).length;
            if (
                method.inputs[method.inputs.length - 1].type === "string" &&
                logData.length < 256
            ) {
                // TODO: workaround for web3.eth.abi.decodeLog bug : if last event field is string and
                //       it's not emmitted from event (eg. narrative in ucd trasnfer list events is empty)
                //       then decodeLog throws  "Error: The parameter "0x" must be a valid HEX string."
                //       Not a generic workaround, made specificly for e_transfer events
                // see https://github.com/ethereum/web3.js/issues/1044
                inputs = method.inputs.slice(0, method.inputs.length - 1);
            }
            // console.debug(
            //     "decodeParameters params:\n",
            //     "\n  inputs: ",
            //     inputs,
            //     "\n logData: ",
            //     logData,
            //     "\n topics: ",
            //     topics
            // );

            const decodedData = state.web3.eth.abi.decodeLog(
                inputs,
                logData,
                topics
            );

            let decodedParams;
            decodedParams = JSON.parse(JSON.stringify(decodedData)); // TODO: it's dirty, how to convert Result object ?
            if (inputs.length < method.inputs.length) {
                // TODO: decodeLog bug workaround, see above
                decodedParams[method.inputs[method.inputs.length - 1].name] =
                    "";
            }
            // console.debug(
            //     "decodeParameters res decodedData:",
            //     decodedData,
            //     "  \ndecodedParams: ",
            //     decodedParams
            // );
            return {
                name: method.name,
                args: decodedParams,
                address: logItem.address
            };
        } else {
            return -1; // not a method
        }
    });
}

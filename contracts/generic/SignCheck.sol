// TODO: this is halfbacked and not in use yet.
//        it  should be a lib, used by AugmintToken and some fx should go there from here.
pragma solidity 0.4.19;


contract SignCheck {

    function ecRecovery(bytes32 hash, bytes sig) public pure returns ( address recoveredAddress) {
        bytes32 r;
        bytes32 s;
        uint8 v;

        if (sig.length != 65) {
            return 0;
        }

        assembly { // solhint-disable-line no-inline-assembly
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := and(mload(add(sig, 65)), 255)
        }

        // https://github.com/ethereum/go-ethereum/issues/2053
        if (v < 27) {
            v += 27;
        }

        if (v != 27 && v != 28) {
            return 0;
        }

        return ecrecover(hash, v, r, s);
    }

    function ecVerify( bytes32 _hash, address _signer, bytes _signature) public pure returns (bool valid) {
        return _signer == ecRecovery(_hash, _signature);
    }

    function ecVerifyPrefixed( bytes32 _hash, address _signer, bytes _signature) public pure returns (bool valid) {
        bytes32 prefixedHash = keccak256("\x19Ethereum Signed Message:\n32", _hash);
        return _signer == ecRecovery(prefixedHash, _signature);
    }

    function ecVerifyTx( address _from, address _to, uint _amount, address _signer, bytes _signature) public pure
    returns (bool valid, address) {
        // TODO: this should to the token contract as par
        // TODO: decide what we sign for the transferOnBehalf (hash of params only or a human readable text)
        bytes memory prefix = "\x19Ethereum Signed Message:\n";
        bytes32 prefixedHash = keccak256(prefix, "11", _from, _to, _amount);
        address recoveredAddress = ecRecovery(prefixedHash, _signature);
        return (_signer == recoveredAddress, recoveredAddress);
    }

    function getKeccak256(string message) public pure returns (bytes32 _hash) {
        // for Remix testing
        return keccak256(message);
    }

    function getKeccak256(string m1, string m2) public pure returns (bytes32 _hash1, bytes32 _hash2) {
        // for Remix testing
        return (keccak256(m1, m2), keccak256(keccak256(m1), m2));
    }

    function getEthereumKeccak256(string msgLength, string paramsString, bytes32 nonce, address _from, address _to,
        uint _amount) public pure returns (bytes32 _hash) {
        // for Remix testing
        bytes memory prefix = "\x19Ethereum Signed Message:\n";
        return keccak256(prefix, msgLength, paramsString, nonce, _from, _to, _amount);
    }

    /* Check this gist: https://gist.github.com/axic/5b33912c6f61ae6fd96d6c4a47afde6d if any safer */
}

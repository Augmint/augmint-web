/* Contract to collect fees from system */
pragma solidity ^0.4.18;
import "./Owned.sol";
import "./AugmintToken.sol";


contract SystemAccount is Owned {
    // FIXME: this is only for testing, remove this function
    function withdrawTokens(AugmintToken tokenAddress, address to, uint amount, string narrative) external onlyOwner {
        tokenAddress.transferWithNarrative(to, amount, narrative);
    }
}

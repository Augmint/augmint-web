/* Contract to collect fees from system */
pragma solidity 0.4.19;
import "./Restricted.sol";
import "./AugmintToken.sol";


contract SystemAccount is Restricted {
    /* FIXME: this is only for first pilots to avoid funds stuck in contract due to bugs.
      remove this function for higher volume pilots */
    function withdrawTokens(AugmintToken tokenAddress, address to, uint amount, string narrative)
    external restrict("MonetaryBoard") {
        tokenAddress.transferWithNarrative(to, amount, narrative);
    }
}

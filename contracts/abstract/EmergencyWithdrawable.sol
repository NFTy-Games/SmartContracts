pragma solidity 0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

abstract contract EmergencyRecover is Ownable {
    function emergencyRecoverETH(address payable receiver, uint256 amount) external payable onlyOwner {
        require(receiver != address(0), "Cannot recover ETH to the 0 address");
        receiver.transfer(amount);
    }

    function emergencyRecoverTokens(
        IERC20 token,
        address receiver,
        uint256 amount
    ) external onlyOwner {
        require(receiver != address(0), "Cannot recover tokens to the 0 address");
        token.transfer(receiver, amount);
    }
}

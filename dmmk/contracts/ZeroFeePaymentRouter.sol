// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ZeroFeePaymentRouter
 * @notice Routes retail DMMK (ERC-20) payments directly to merchants with 0% platform fee.
 * @dev Customers must approve this contract before calling processPayment.
 */
contract ZeroFeePaymentRouter is ReentrancyGuard {
    using SafeERC20 for IERC20;

    event PaymentProcessed(
        address indexed customer,
        address indexed merchant,
        address indexed tokenAddress,
        uint256 amount,
        uint256 timestamp
    );

    /**
     * @notice Transfer 100% of `amount` stablecoin from caller to merchant. No platform skim.
     * @param token ERC-20 token address representing DMMK on the L2 network.
     * @param merchant Recipient merchant wallet.
     * @param amount Payment amount in token smallest units.
     */
    function processPayment(
        address token,
        address merchant,
        uint256 amount
    ) external nonReentrant {
        require(token != address(0), "ZeroFee: invalid token");
        require(merchant != address(0), "ZeroFee: invalid merchant");
        require(amount > 0, "ZeroFee: invalid amount");

        IERC20(token).safeTransferFrom(msg.sender, merchant, amount);

        emit PaymentProcessed(
            msg.sender,
            merchant,
            token,
            amount,
            block.timestamp
        );
    }
}

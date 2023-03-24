// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Whitelist {
    address public owner;
    mapping(address => bool) public whitelist;

    uint256 public whitelistStartTime;
    uint256 public whitelistEndTime;

    event WhitelistUpdated(uint256 whitelistStartTime, uint256 whitelistEndTime);
    event AddedToWhitelist(address account);
    event RemovedFromWhitelist(address account);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    function isWhitelisted(address account) public view returns (bool) {
        return whitelist[account];
    }

    function updateWhitelistPeriod(uint256 _whitelistStartTime, uint256 _whitelistEndTime) public onlyOwner {
        require(_whitelistStartTime <= _whitelistEndTime, "Invalid whitelist period");
        whitelistStartTime = _whitelistStartTime;
        whitelistEndTime = _whitelistEndTime;
        emit WhitelistUpdated(_whitelistStartTime, _whitelistEndTime);
    }

    function addToWhitelist(address account) public onlyOwner {
        require(!whitelist[account], "Account is already whitelisted");
        whitelist[account] = true;
        emit AddedToWhitelist(account);
    }

    function removeFromWhitelist(address account) public onlyOwner {
        require(whitelist[account], "Account is not whitelisted");
        whitelist[account] = false;
        emit RemovedFromWhitelist(account);
    }
}
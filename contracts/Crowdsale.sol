//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";
import "./Whitelist.sol";

contract Crowdsale {
    address owner;
    Token public token;
    Whitelist public whitelist;
    uint256 public price;
    uint256 public maxTokens;
    uint256 public tokensSold;
    uint256 public whitelistStartTime;
    uint256 public whitelistEndTime;
    bool public whitelistOpen;

    event Buy(uint256 amount, address buyer);
    event Finalize(uint256 tokensSold, uint256 ethRaised);
    event WhitelistUpdated(bool whitelistOpen);


    constructor(
        Token _token,
        uint256 _price,
        uint256 _maxTokens,
        Whitelist _whitelist,
        uint256 _whitelistStartTime,
        uint256 _whitelistEndTime
    ) {
        owner = msg.sender;
        token = _token;
        price = _price;
        maxTokens = _maxTokens;
        whitelist = _whitelist;
        whitelistEndTime = _whitelistEndTime;
        whitelistOpen = block.timestamp >= _whitelistStartTime && block.timestamp <= _whitelistEndTime;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    // Buy tokens directly by sending Ether
    // --> https://docs.soliditylang.org/en/v0.8.15/contracts.html#receive-ether-function

    receive() external payable {
        uint256 amount = msg.value / price;
        buyTokens(amount * 1e18);
    }

    function buyTokens(uint256 _amount) public payable  onlyDuringWhitelistPeriod {
        require(msg.value == (_amount / 1e18) * price);
        require(token.balanceOf(address(this)) >= _amount);
        require(whitelist.isWhitelisted(msg.sender), "You are not whitelisted");

        tokensSold += _amount;

        require(tokensSold <= maxTokens, "Maximum number of tokens sold");

        require(token.transfer(msg.sender, _amount));

        emit Buy(_amount, msg.sender);
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    // Finalize Sale
    function finalize() public onlyOwner {
        require(token.transfer(owner, token.balanceOf(address(this))));

        uint256 value = address(this).balance;
        (bool sent, ) = owner.call{value: value}("");
        require(sent);

        emit Finalize(tokensSold, value);
    }

    function updateWhitelistPeriod(uint256 _whitelistStartTime, uint256 _whitelistEndTime) external onlyOwner {
        require(_whitelistStartTime <= _whitelistEndTime, "Invalid whitelist period");
        whitelistStartTime = _whitelistStartTime;
        whitelistEndTime = _whitelistEndTime;
        whitelistOpen = block.timestamp >= whitelistStartTime && block.timestamp <= whitelistEndTime;
        emit WhitelistUpdated(whitelistOpen);
    }
    
    function addToWhitelist(address account) external onlyOwner {
        whitelist.addToWhitelist(account);
    }

    function removeFromWhitelist(address account) external onlyOwner {
        whitelist.removeFromWhitelist(account);
    }

    function whitelistPeriod() external view returns (uint256, uint256) {
        return (whitelist.whitelistStartTime(), whitelist.whitelistEndTime());
    }

    function remainingTokens() external view returns (uint256) {
        return maxTokens - tokensSold;
    }

    modifier onlyDuringWhitelistPeriod() {
        require(
            block.timestamp >= whitelist.whitelistStartTime() && block.timestamp <= whitelist.whitelistEndTime(),
            "Whitelist is not open at this time"
        );
        _;
    }
}

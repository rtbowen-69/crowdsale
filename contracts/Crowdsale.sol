//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Crowdsale {
  address public owner;
  Token public token; //Smart contract type
  uint256 public price;
  uint256 public maxTokens;
  uint256 public tokensSold;
  uint256 public openingTime;

  mapping(address => bool) public whitelist;
  uint256 public minContribution;
  uint256 public maxContribution;

  event Buy(uint256 amount, address buyer);
  event Finalize(uint256 tokensSold, uint256 ethRaised);

  constructor(
    Token _token,   //passing address of token contract to _token variable
    uint256 _price,
    uint256 _maxTokens,
    uint256 _openingTime,
    uint256 _minContribution,
    uint256 _maxContribution
  ) {
    owner = msg.sender;// Stores address of person deploying contract
    token = _token; //Saves address stored in _token as the stae variable token
    price = _price;
    maxTokens = _maxTokens;
    openingTime = _openingTime;
    minContribution = _minContribution;
    maxContribution = _maxContribution;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "Caller is not the owner");// modifer can be used across contract
    _;
  }

  modifier onlyWhenOpen() {
    require(block.timestamp >= openingTime, "Crowdsale is not yet open");
    _;
  }

  modifier onlyWhitelisted() {
    require(whitelist[msg.sender], "You are not Whitelisted");
    _;
  }

  // Buy tokens directly by sending Ether
  // --> https://docs.soliditylang.org/en/v0.8.15/contracts.html#receive-ether-function

  receive() external payable onlyWhenOpen {    //only available outside the contract allowa contract to receive ether
    uint256 amount = msg.value / price;
    require(amount >= minContribution, "Below minimum contribution");
    require(amount <= maxContribution, "Exceeds maximum contribution");

    buyTokens(amount * 1e18);
  }

  function buyTokens(uint256 _amount) public payable onlyWhenOpen onlyWhitelisted {
    require(msg.value == (_amount / 1e18) * price); // Calculates that the amount paid is enough
    require(token.balanceOf(address(this)) >= _amount);  // Shows the balance of current smart contratc
    tokensSold += _amount;

    require(token.transfer(msg.sender, _amount)); // Sends tokens to user calling this function

    emit Buy(_amount, msg.sender);
  }

  function setPrice(uint256 _price) public onlyOwner {
    price = _price;
  }

  function addToWhitelist(address[] calldata _addresses) external onlyOwner {
    for (uint256 i = 0; i < _addresses.length; i++) {
      whitelist[_addresses[i]] = true;
    }
  }

  function removeFromWhitelist(address[] calldata _addresses) external onlyOwner {
    for (uint256 i = 0; i < _addresses.length; i++) {
      whitelist[_addresses[i]] = false;
    }
  }  

  // Finalize Sale
  function finalize() public onlyOwner {
    require(block.timestamp >= openingTime, "Crowdsale is not yet open");

    require(token.transfer(owner, token.balanceOf(address(this))));

    uint256 value = address(this).balance; //assigns the balance of this contract to value var
    (bool sent, ) = owner.call{value: value}(""); //verifys balance of account
    require(sent);

    emit Finalize(tokensSold, value);
  }
}

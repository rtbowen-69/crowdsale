// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

contract Whitelist {
    string public name = "Whitelist";

    // mapping(address => bool) public whitelist;
    // address public owner;
    // uint256 public openingTime;
    // uint256 public closingTime;
    // uint256 public minimumTokens = 1000;
    // uint256 public maximumTokens = 10000;

    // constructor(uint256 _openingTime, uint256 _closingTime) {
    //     owner = msg.sender;
    //     openingTime = _openingTime;
    //     closingTime = _closingTime;
    // }

    // function addToWhitelist(address[] memory _addresses) public onlyOwner {
    //     require(block.timestamp >= openingTime && block.timestamp <= closingTime, "Whitelist is not open");
    //     for (uint i = 0; i < _addresses.length; i++) {
    //         whitelist[_addresses[i]] = true;
    //     }
    // }

    // function removeFromWhitelist(address[] memory _addresses) public onlyOwner {
    //     require(block.timestamp >= openingTime && block.timestamp <= closingTime, "Whitelist is not open");
    //     for (uint i = 0; i < _addresses.length; i++) {
    //         whitelist[_addresses[i]] = false;
    //     }
    // }

    // function isWhitelisted(address _address) public view returns (bool) {
    //     return whitelist[_address];
    // }

    // modifier onlyOwner {
    //     require(msg.sender == owner, "Only owner can call this function.");
    //     _;
    // }
}

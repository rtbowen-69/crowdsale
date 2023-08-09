// deploy-config.js
const { ethers } = require("ethers");
const moment = require('moment');

const config = {

  token: {
    name: 'Rodd Token',
    symbol: 'RODD',
    maxSupply: ethers.utils.parseUnits('10000000', 'ether')
  },

  crowdsale: {
    openingTime: moment().add(1, 'hour').unix(),
    minContribution: ethers.utils.parseUnits('1.0', 'ether'),
    maxContribution: ethers.utils.parseUnits('1000.0', 'ether'),
    price: ethers.utils.parseEther('1'),

    whitelist: [
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    ]
  } 
}
module.exports = config;

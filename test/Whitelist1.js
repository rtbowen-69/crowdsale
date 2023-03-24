const { ethers } = require("hardhat");
const { expect } = require("chai");

describe('Whitelist', () => {
  let whitelist;
  let token;

  beforeEach(async () => {
    const Token = await ethers.getContractFactory('Token');
    token = await Token.deploy();
    
    const Whitelist = await ethers.getContractFactory('Whitelist');
    whitelist = await Whitelist.deploy();
    
    await token.transferOwnership(whitelist.address);
  })

  describe('addToWhitelist', () => {
    it('adds a user to the whitelist', async () => {
      const [owner, user] = await ethers.getSigners();
      await whitelist.connect(owner).addToWhitelist(user.address);
      const isWhitelisted = await whitelist.isWhitelisted(user.address);
      expect(isWhitelisted).to.be.true;
    })

    it('only allows the contract owner to add to the whitelist', async () => {
      const [owner, user1, user2] = await ethers.getSigners();
      await expect(whitelist.connect(user1).addToWhitelist(user2.address)).to.be.revertedWith("Caller is not the owner");
    })

  })

  describe('buyTokens', () => {
    it('only allows whitelisted users to buy tokens during the whitelist period', async () => {
      const [owner, user1, user2] = await ethers.getSigners();
      await whitelist.connect(owner).addToWhitelist(user1.address);

      const whitelistStartTime = Math.floor(Date.now() / 1000) + 60;
      const whitelistEndTime = whitelistStartTime + 3600;
      await whitelist.connect(owner).updateWhitelistPeriod(whitelistStartTime, whitelistEndTime);

      await expect(token.connect(user2).buyTokens(ethers.utils.parseEther('1'))).to.be.revertedWith("Whitelist: Account is not whitelisted");

      await ethers.provider.send('evm_setNextBlockTimestamp', [whitelistStartTime]);
      await ethers.provider.send('evm_mine');

      await expect(token.connect(user2).buyTokens(ethers.utils.parseEther('1'))).to.be.revertedWith("Whitelist: Account is not whitelisted");

      await expect(token.connect(user1).buyTokens(ethers.utils.parseEther('1'))).to.emit(token, 'Transfer');

      await ethers.provider.send('evm_setNextBlockTimestamp', [whitelistEndTime]);
      await ethers.provider.send('evm_mine');

      await expect(token.connect(user1).buyTokens(ethers.utils.parseEther('1'))).to.be.revertedWith("Whitelist: Account is not whitelisted");
    })
  })

})

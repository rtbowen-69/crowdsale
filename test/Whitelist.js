const { ethers } = require("hardhat");
const { expect } = require("chai");

describe('Whitelist', function () {
  let whitelist;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Whitelist = await ethers.getContractFactory('Whitelist');
    whitelist = await Whitelist.deploy(
      Math.floor(Date.now() / 1000) - 60, // openDate is 1 minute ago
      Math.floor(Date.now() / 1000) + 60 * 60, // closeDate is 1 hour from now
      1000, // minimumTokens
      10000 // maximumTokens
    );
    await whitelist.deployed();
  });

  it('should add addresses to the whitelist', async function () {
    await whitelist.addToWhitelist([addr1.address]);
    expect(await whitelist.isWhitelisted(addr1.address)).to.equal(true);
  });

  it('should remove addresses from the whitelist', async function () {
    await whitelist.addToWhitelist([addr1.address]);
    await whitelist.removeFromWhitelist([addr1.address]);
    expect(await whitelist.isWhitelisted(addr1.address)).to.equal(false);
  });

  it('should only allow the owner to add addresses to the whitelist', async function () {
    await expect(whitelist.connect(addr1).addToWhitelist([addr2.address])).to.be.revertedWith(
      "Only the contract owner can call this function."
    );
  });

  it('should only allow whitelisted addresses to purchase tokens during the whitelist period', async function () {
    await whitelist.addToWhitelist([addr1.address]);
    await expect(whitelist.connect(addr2).canPurchaseTokens()).to.eventually.equal(false);
    await ethers.provider.send("evm_increaseTime", [61]); // advance 61 seconds
    await expect(whitelist.connect(addr1).canPurchaseTokens()).to.eventually.equal(true);
    await expect(whitelist.connect(addr2).canPurchaseTokens()).to.eventually.equal(false);
    await ethers.provider.send("evm_increaseTime", [60 * 60 + 1]); // advance 1 hour and 1 second
    await expect(whitelist.connect(addr1).canPurchaseTokens()).to.eventually.equal(false);
  });

  it("should enforce a minimum and maximum token purchase amount for whitelisted addresses", async function () {
    await whitelist.addToWhitelist([addr1.address]);
    expect(await whitelist.isValidPurchase(500)).to.equal(false);
    expect(await whitelist.isValidPurchase(15000)).to.equal(false);
    expect(await whitelist.isValidPurchase(1000)).to.equal(true);
    expect(await whitelist.isValidPurchase(5000)).to.equal(true);
    expect(await whitelist.isValidPurchase(10000)).to.equal(true);
  });
});

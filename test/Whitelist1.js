const { ethers } = require("hardhat");
const { expect } = require("chai");

describe('Whitelist', () => {
  let whitelist

  beforeEach(async () => {      
    const Whitelist = await ethers.getContractFactory('Whitelist') // Pulls contract in from hardhat
    whitelist = await Whitelist.deploy()
  })

  describe('Deployment', () => {
    it('has correct name', async () => {

      expect(await whitelist.name()).to.equal('Whitelist')
    })

  })

})
  
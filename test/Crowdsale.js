const { expect } = require('chai');
const { ethers } = require('hardhat');

const minContribution = ethers.utils.parseEther('1.0', 'ether');
const maxContribution = ethers.utils.parseEther('1000.0', 'ether');

const parseEther = (n) => {
  return ethers.utils.parseEther(n.toString())
}

const tokens = (n)=> {
  return ethers.utils.parseEther(n.toString(), 'ether')
}

const ether = tokens

// Helper function to get the current timestamp in seconds
async function getCurrentTimestamp() {
  const latestBlock = await ethers.provider.getBlock('latest')
  return latestBlock.timestamp
}

describe('Crowdsale', () => {
  let crowdsale, token
  let deployer, user1, whitelistAccount1, whitelistAccount2, whitelistAccount3
  
  // Whitelist the specified accounts
  async function addToWhitelist() {
    const whitelistAddresses = [
      whitelistAccount1.address,
      whitelistAccount2.address,
      whitelistAccount3.address,
      user1.address,
      deployer.address // Add user1 and deployer to the whitelist
    ]

    // Call the contracts addToWhitelist function using deployer account
    await crowdsale.addToWhitelist(whitelistAddresses)
  }

  beforeEach(async () => {
    // Load Contracts
    const Crowdsale = await ethers.getContractFactory('Crowdsale')
    const Token = await ethers.getContractFactory('Token')

    // Deploy token
    token = await Token.deploy('Rodd Token', 'RODD', '10000000')

    // Configure Accounts
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    user1 = accounts[1]
    whitelistAccount1 = accounts[2]
    whitelistAccount2 = accounts[3]
    whitelistAccount3 = accounts[4] 

    // Deploy Crowdsale
    const now = Math.floor(Date.now() / 1000)
    const openingTime = now  // sets time to current time stamp
    const minContribution = ethers.utils.parseEther('1.0', 'ether')
    const maxContribution = ethers.utils.parseEther('1000.0', 'ether')

    crowdsale = await Crowdsale.deploy(
      token.address,
      ether('1'),
      '10000000',
      openingTime,
      minContribution,
      maxContribution
    )

    // Send tokens to crowdsale
    let transaction = await token.connect(deployer).transfer(crowdsale.address, tokens(10000000))
    await transaction.wait()

    // Whitelist the specified accounts
    await addToWhitelist();
  })

  describe('Deployment', () => {

    it('sends tokens to the Crowsale contract', async () => {
      expect(await token.balanceOf(crowdsale.address)).to.equal(tokens(10000000))
    })    

    it('returns the price', async () => {
      expect(await crowdsale.price()).to.equal(ether(1))
    })

    it('returns token address', async () => {
      expect(await crowdsale.token()).to.equal(token.address)
    })
  })

  describe('Buying Tokens', () => {
    let transaction, result
    let amount = tokens(10)
    let price =

    describe('Success', () => {

      beforeEach(async() => {

        price = await crowdsale.price()

        const priceWei = ethers.utils.parseUnits(price, 'ether')
        const value = priceWei.div(amount)
        const valueString = value.toString()

        console.log("value", value)
        console.log("value type", typeof value)

        console.log("valueString", valueString) 
        console.log("valueString type", typeof valueString)
        
        console.log('Price:', ethers.utils.formatEther(price))
        console.log('Token Amount:', ethers.utils.formatUnits(amount, 18))
        console.log('Ether Value sent', ethers.utils.formatEther(valueString))

        transaction = await crowdsale.connect(user1).buyTokens(amount,{ value: value })
        result = await transaction.wait()
      })

      it('transfers tokens', async () => {
        expect(await token.balanceOf(crowdsale.address)).to.equal(tokens(9999990))
        expect(await token.balanceOf(user1.address)).to.equal(amount)
      })

      it('updates contracts ether balance', async () => {
        expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(amount)
      }) 

      it('updates tokens sold', async () => {
        expect(await crowdsale.tokensSold()).to.equal(amount)
      }) 

      it('emits a buy event', async () => {
      await expect(transaction).to.emit(crowdsale, 'Buy')
        .withArgs(amount, user1.address)
      })       
    })

    describe('Failure', () => {

      it('rejects insufficient ethers', async () => {
        await expect(crowdsale.connect(user1).buyTokens(tokens(10), { value: 0 })).to.be.reverted
      })

      it('logs the token balance', async () => {
        console.log("Token Balance:", ethers.utils.formatUnits(await token.balanceOf(crowdsale.address)))
      })

      it('fails if contract balance is not enough', async () => {
        // Set the token balance of the contract to a lower value than the amount being requested
        const contractBalanceBefore = await token.balanceOf(crowdsale.address)
        const amountGreaterThanBalance = contractBalanceBefore.add(tokens(1))// Request 1 token more than the contract's balance

        // Ensure the buyTokens function fails due to insufficient contract balance
        await expect(crowdsale.connect(user1).buyTokens(amountGreaterThanBalance, { value: ethers.utils.parseEther('10') })).to.be.reverted
      })

      it('rejects buying tokens above the maximum contribution', async () => {
        const maxContribution = await crowdsale.maxContribution()

        // Attempt to buy tokens with an amount greater than the maximum contribution allowed
        const amountAboveMaxContribution = maxContribution.add(tokens(1)) // Request 1 token more than the maximum contribution

        // Ensure the buyTokens function fails due to exceeding the maximum contribution
        await expect(crowdsale.connect(user1).buyTokens(amountAboveMaxContribution, { value: ethers.utils.parseEther('10') })).to.be.reverted
      })

      it('rejects buying tokens below the minimum contribution', async () => {
        const minContribution = await crowdsale.minContribution()

        // Attempt to buy tokens with an amount less than the minimum contribution allowed
        const amountBelowMinContribution = minContribution.sub(tokens(1)) // Request 1 token less than the minimum contribution

        // Ensure the buyTokens function fails due to being below the minimum contribution
        await expect(crowdsale.connect(user1).buyTokens(amountBelowMinContribution, { value: ethers.utils.parseEther('10') })).to.be.reverted
      })
    })    
  })

  describe('Sending ETH', () => {
    let transaction, result
    let amount = ether(10)

    describe('Success', () => {

      beforeEach(async () => {
        const gasLimit = 3000000
        transaction = await user1.sendTransaction({ 
          to: crowdsale.address,
          value: amount,
          gasLimit: gasLimit
        })
        result = await transaction.wait()
      })

      it('updates contracts ether balance', async () => {

        // Retrieve the current ether balance of contract
        const contractEtherBalance = await ethers.provider.getBalance(crowdsale.address)

        // Ensure that the contracte ether balance is correctly updated
        expect(contractEtherBalance).to.equal(amount)
        console.log('Contracts ether Balance', ethers.utils.formatEther(contractEtherBalance))
      }) 

      it('updates user token balance', async () => {
        expect(await token.balanceOf(user1.address)).to.equal(amount)
      })

      it('updates user token balance', async () => {
        expect(await token.balanceOf(user1.address)).to.equal(amount)
      })

    })  
  })

  describe('Update Price', () => {
    let transaction, result
    let price = ether(2)

    describe('Success', () => {

      beforeEach(async () => {
        transaction = await crowdsale.connect(deployer).setPrice(price)
        result = await transaction.wait()
      })

      it('updates the price', async () => {
        expect(await crowdsale.price()).to.be.equal(price)
      })
    })

    describe('Failure', () => {

      it('prevents a non-owner from updating price', async () => {
        await expect(crowdsale.connect(user1).setPrice(price)).to.be.reverted
      })
    })
  })

  describe('Finializing sale',  () => {
    let transaction, result
    let amount = tokens(10)
    let value = ether(10)

    describe('Success', () => {
      
      beforeEach(async () => {
        transaction = await crowdsale.connect(user1).buyTokens(amount, { value: value })
        result = await transaction.wait()

        transaction = await crowdsale.connect(deployer).finalize()
        result = await transaction.wait()
      })

      it('transfers remaining tokens to owner', async () => {
        expect(await token.balanceOf(crowdsale.address)).to.equal(0)
        expect(await token.balanceOf(deployer.address)).to.equal(tokens(9999990))
      })

      it('transfers ETH balance to owner', async () => {
        expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(0)
      })      

      it('emits Finalize event', async () => {
        await expect(transaction).to.emit(crowdsale, "Finalize")
        .withArgs(amount, value)
      })
    })

    describe('Failure', () => {

      it('prevents a non-owner from finalizing', async () => {
        await expect(crowdsale.connect(user1).finalize()).to.be.reverted
      })
    })  
  })

  describe('Managing Whitelist', () => {
    let deployer, user1, user2
    let Token, token, Crowdsale, crowdsale

    beforeEach(async () => {
      [deployer, user1, user2] = await ethers.getSigners()

      // Deploy Token contract
      Token = await ethers.getContractFactory("Token")
      token = await Token.deploy('Rodd Token', 'RODD', '10000000')
      await token.deployed()

      // Deploy Crowdsale contract and pass token address to it
      Crowdsale = await ethers.getContractFactory("Crowdsale")
      crowdsale = await Crowdsale.deploy(
        token.address,
        tokens(1),
        tokens(10000000),
        Math.floor(Date.now() / 1000) + 0,
        tokens(0.1),
        tokens(100)
      )
      await crowdsale.deployed()
    })

    it('adds addresses to the whitelist successfully', async () => {
      expect(await crowdsale.whitelist(user1.address)).to.equal(false)

      // Deployer (owner) adds user1 to the whitelist
      await crowdsale.connect(deployer).addToWhitelist([user1.address])

      // Now, user1 should be whitelisted
      expect(await crowdsale.whitelist(user1.address)).to.equal(true)
    })

    it('removes addresses from the whitelist successfully', async () => {
      // Add user1 to the whitelist first
      await crowdsale.connect(deployer).addToWhitelist([user1.address])

      expect(await crowdsale.whitelist(user1.address)).to.equal(true)

      // Deployer (owner) removes user1 from the whitelist
      await crowdsale.connect(deployer).removeFromWhitelist([user1.address])

      // Now, user1 should not be whitelisted
      expect(await crowdsale.whitelist(user1.address)).to.equal(false)
    })

    it('fails to add addresses by non-authorized users', async () => {
      await expect(crowdsale.connect(user1).addToWhitelist([user2.address])).to.be.reverted
    })

    it('fails to remove addresses by non-authorized users', async () => {
      // Add user2 to the whitelist first
      await crowdsale.connect(deployer).addToWhitelist([user2.address])

      // Non-authorized user (user1) tries to remove user2 from the whitelist
      await expect(crowdsale.connect(user1).removeFromWhitelist([user2.address])).to.be.reverted
    })
  })

  describe('Changing Min and Max Contribution', () => {
    let transaction, result
    let newMinContribution = tokens(2)
    let newMaxContribution = tokens(200)

    describe('Success', () => {
      beforeEach(async () => {
        // Change min and max contribution values using the owner account
        transaction = await crowdsale.connect(deployer).setMinContribution(newMinContribution)
        result = await transaction.wait()

        transaction = await crowdsale.connect(deployer).setMaxContribution(newMaxContribution)
        result = await transaction.wait()
      })

      it('updates minContribution', async () => {
        expect(await crowdsale.minContribution()).to.equal(newMinContribution)
      })

      it('updates maxContribution', async () => {
        expect(await crowdsale.maxContribution()).to.equal(newMaxContribution)
      })
    })

    describe('Failure', () => {
      it('prevents non-owners from changing minContribution', async () => {
        await expect(crowdsale.connect(user1).setMinContribution(newMinContribution)).to.be.reverted
      })

      it('prevents non-owners from changing maxContribution', async () => {
        await expect(crowdsale.connect(user1).setMaxContribution(newMaxContribution)).to.be.reverted
      })
    })
  })
})

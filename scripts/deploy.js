// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat"); // All of hardhat
let openingTime;

async function main() {
  const NAME = 'Rodd Token'
  const SYMBOL = 'RODD'
  const MAX_SUPPLY = '10000000'
  const PRICE = ethers.utils.parseUnits('0.0025', 'ether')

  const Token = await hre.ethers.getContractFactory('Token')    // Deploy Token
  const token = await Token.deploy(NAME, SYMBOL, MAX_SUPPLY)
  await token.deployed()
  
  console.log(`Token deployed to: ${token.address}\n`)

  const now = Math.floor(Date.now() / 1000) //Get current time stamp
  const openingTime = now + 3600  // Set time to open in one hour

  console.log(`Opening Time :${openingTime}`);

  const minContribution = ethers.utils.parseUnits('1.0', 'ether')//Minimum contribution
  const maxContribution = ethers.utils.parseUnits('1000.0', 'ether')//Maximum contribution


  const Crowdsale = await hre.ethers.getContractFactory('Crowdsale')    // Deploy Crowdsale
  const crowdsale = await Crowdsale.deploy(
    token.address,
    PRICE,
    ethers.utils.parseUnits(MAX_SUPPLY, 'ether'),
    openingTime,
    minContribution,
    maxContribution
  )
  await crowdsale.deployed();

  console.log(`Crowdsale deployed to: ${crowdsale.address}\n`)

  // Send tokens to crowdsale
  const transaction = await token.transfer(crowdsale.address, ethers.utils.parseUnits(MAX_SUPPLY, 'ether'))
  await transaction.wait();

  console.log(`Tokens transferred to Crowdsale\n`)

  // Whitelist the specified accounts
  const whitelistAddresses = [
    ethers.utils.getAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"),
    ethers.utils.getAddress("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"),
    ethers.utils.getAddress("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC")
  ];

    await crowdsale.addToWhitelist(whitelistAddresses)
    console.log(`Address added to the whitelist`)
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat"); // All of hardhat
const config = require('./deploy-config.js');

async function main() {
  const Token = await hre.ethers.getContractFactory('Token')    // Deploy Token
  // Deploy Token
  const token = await Token.deploy(
    config.token.name,
    config.token.symbol,
    config.token.maxSupply
  )
  await token.deployed()
  
  console.log(`Token deployed to: ${token.address}\n`)

  // Log min and max  
  console.log(`Minimum contribution: ${config.crowdsale.minContribution}`);
  console.log(`Maximum contribution: ${config.crowdsale.maxContribution}\n`);

  // Deploy Crowdsale Contract
  const Crowdsale = await hre.ethers.getContractFactory('Crowdsale')    // Deploy Crowdsale
  const crowdsale = await Crowdsale.deploy(    
    token.address,
    config.crowdsale.openingTime,
    config.crowdsale.minContribution,
    config.crowdsale.maxContribution,
    config.crowdsale.price,
    config.token.maxSupply
  )
  
  await crowdsale.deployed();
  console.log(`Opening Time :${config.crowdsale.openingTime}`);

  console.log(`Crowdsale deployed to: ${crowdsale.address}\n`)

  // Transfer tokens to crowdsale
  const transaction = await token.transfer(
    crowdsale.address,
    config.token.maxSupply
  )
  await transaction.wait();

  console.log(`Tokens transferred to Crowdsale\n`)

  // Whitelist the specified accounts


    await crowdsale.addToWhitelist(config.crowdsale.whitelist)
    console.log(`Address added to the whitelist`)
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers'
import Countdown from 'react-countdown'


// Components
import Navigation from './Navigation';
import Buy from './Buy';
import Progress from './Progress';
import Info from './Info';
import Loading from './Loading';

// ABIs
import TOKEN_ABI from '../abis/Token.json';
import CROWDSALE_ABI from '../abis/Crowdsale.json';

// config
import config from '../config.json';


function App() {
  const [openingTime, setOpeningTime] = useState(0)
  const [isPresaleOpen] = useState(null)
  const [provider, setProvider] = useState(null)
  const [crowdsale, setCrowdsale] = useState(null)

  const [account, setAccount] = useState(null)
  const [accountBalance, setAccountBalance] = useState(0)
  const [minContribution, setMinContribution] = useState(0)
  const [maxContribution, setMaxContribution] = useState(0)

  const [price, setPrice] = useState(0)
  const [maxTokens, setMaxTokens] = useState(0)
  const [tokensSold, setTokensSold] = useState(0)
  // const [currentTime, setCurrentTime] = useState(null)

  const [isLoading, setIsLoading] = useState(true)

  const loadBlockchainData = async () => {

    // initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    // Fetch Chain ID
    const { chainId } = await provider.getNetwork()

    // Initiate contracts
    const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider)
    const crowdsale = new ethers.Contract(config[chainId].crowdsale.address, CROWDSALE_ABI, provider)
    setCrowdsale(crowdsale)

    // Fetch Accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)

    // Fetch account balance
    const accountBalance = ethers.utils.formatUnits(await token.balanceOf(account), 18)
    setAccountBalance(accountBalance)

    // Fetch price
    const price = ethers.utils.formatUnits(await crowdsale.price(), 18)
    setPrice(price)

    // Fetch max tokens
    const maxTokens = ethers.utils.formatUnits(await crowdsale.maxTokens(), 18)
    setMaxTokens(maxTokens)

    // Fetch tokens sold
    const tokensSold = ethers.utils.formatUnits(await crowdsale.tokensSold(), 18)
    setTokensSold(tokensSold)

    // Fetch opening time
    const openingTimeInSeconds = await crowdsale.openingTime()
    setOpeningTime(Number(openingTimeInSeconds) * 1000)

    const minContribution = await crowdsale.minContribution()
    const maxContribution = await crowdsale.maxContribution()
    setMinContribution(minContribution)
    setMaxContribution(maxContribution)

    setIsLoading(false)
  } 

  useEffect(() => {   // An event on webpage changes and will rerun after each change rerender the page
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading])

  return(
    <Container>
      <Navigation />
        <div className="my-2 text-center">
          {Number(openingTime) >= Date.now(
          ) ? (
            <span>
              <strong>Time left till Presale :</strong>
              <Countdown date={Number(openingTime)} className="h6" />
            </span>

          ) : (
            <span className={isPresaleOpen ? 'presale-open-msg' : ''}>
              <strong>Presale Minting is now Open!</strong>
            </span>

          )}
        </div>

      <h1 className='my-4 text-center'>Introducing ROdd Token!</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <p className='text-center'><strong>Current Price:</strong> {price} ETH</p>
          <Buy 
            provider={provider}
            price={price}
            crowdsale={crowdsale}
            setIsLoading={setIsLoading}
            openingTime={openingTime}
            maxContribution={maxContribution}
            minContribution={minContribution}
          />
          <Progress
            maxTokens={maxTokens}
            tokensSold={tokensSold}
          />
        </>
      )}
      <hr />
      {account && (
        <Info account={account} accountBalance={accountBalance} />
      )}
    </Container>
  );
}

export default App;

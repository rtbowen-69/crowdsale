import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip'

const Buy = ({ provider, price, crowdsale, openingTime, minContribution, maxContribution }) => {
  const [amount, setAmount] = useState('')
  const [isWaiting, setIsWaiting] = useState(false)
  // const [isLoading, setIsLoading] = useState(false)
  

  // const handleAmountChange = (e) => {
  //   const enteredAmount = e.target.value;

  //   // Ensure the entered amount is a valid number or an empty string
  //   if (enteredAmount === '' || (!isNaN(enteredAmount) && parseFloat(enteredAmount) >= 1)) {
  //     setAmount(enteredAmount);
  //   } else {
  //     // If the entered amount is not a valid number or less than 1, set it to an empty string
  //     setAmount('');
  //   }
  // }

  const buyHandler = async (e) => {
    e.preventDefault()
    console.log('Buy button clicked')
    console.log('Is Presale Open:', isPresaleOpen())
    console.log('Amount:', amount)
    console.log('Minimum Contribution:', ethers.utils.formatEther(minContribution))
    console.log('Maximum Contribution:', ethers.utils.formatEther(maxContribution))


    setIsWaiting(true)

    try {
      const enteredAmount = amount
      const value = ethers.utils.parseUnits((enteredAmount * price).toString(), 'ether')

      // console.log('Amount entered', ethers.utils.formatEther(enteredAmount))  

      // const formattedAmount = ethers.utils.parseUnits(enteredAmount, 18)
      // const value = ethers.utils.parseUnits((enteredAmount * price).toString(), 'ether')

      if (enteredAmount <= 0 || isNaN(value)) { //Check if the entered number is greater than zero
        console.log('Invalid Amount entered:', enteredAmount)
        window.alert('Please enter a valid amount greater that zero')
        setIsWaiting(false)
        return
      }

      console.log('Entered amount:', enteredAmount);
      console.log('Minimum Contribution:', ethers.utils.formatEther(minContribution))
      console.log('Maximum Contribution:', ethers.utils.formatEther(maxContribution))

      if (value <minContribution || value > maxContribution) { //Check if the entered number is greater than zero
        console.log('Amount not within the allowed range:', value)
        window.alert('Please enter an amount greater than 1 Eth and less than 1000 Eth')
        setIsWaiting(false)
        return
      }

      const signer = await provider.getSigner()

      const transaction = await crowdsale.connect(signer).buyTokens(enteredAmount, { value: value })
      await transaction.wait()
    } catch {
      window.alert('User rejected or transaction reverted')
    }

    setIsWaiting(false)
    // setIsLoading(true)

  }

  // const handleTransactionSuccess = async (transaction) => { // Testing for functionality
  //   try {
  //     const receipt = await transaction.wait();
  //     console.log('Transaction Successful!');
  //     console.log('Transaction Receipt:', receipt);
  //   } catch (error) {
  //     console.error('Transaction Failed:', error);
  //   }
  // }

  const isPresaleOpen = () => {
    const currentTime = Math.floor(Date.now() / 1000)
      // disabled={!isPresaleOpen() || amount === '' || +amount < minContribution || +amount > maxContribution}
    return currentTime <= parseInt(openingTime)
  }

  return(
    <Form onSubmit={buyHandler} style={{ maxWidth: '800px', margin: '50px auto' }}>
      <Form.Group as={Row}>
        <Col>
          <Form.Control type="number" placeholder="Enter amount" onChange={(e) => setAmount(e.target.value)}/>
        </Col>
        <Col className='text-center'>
          {isWaiting ? (
            <Spinner animation="border" />
          ) : (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{isPresaleOpen() ? '' : 'Presale has not opened yet'}</Tooltip>}
            >
              <span>
                <Button 
                  variant="primary"
                  type="submit"
                  style={{ width: '100%' }}
                >
                  Buy Tokens
                </Button>
              </span>
            </OverlayTrigger>
          )}
        </Col>
      </Form.Group>
    </Form>
  );
}

export default Buy;

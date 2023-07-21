import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import logo from '../logo.png';
import Countdown from 'react-countdown';

const Navigation = ({ openingTime }) => {
  const renderer = ([ days, hours, minutes, seconds, completed ]) => {
    if (completed) {
      return <span>Sale is open</span>
    } else {
      return (
        <span>
          Sale is open in {days}d {hours}h {minutes}m {seconds}s
        </span>
      );
    }
  };

  return(
    <Navbar className='my-3'>
      <img 
        alt ="logo" 
        src={logo} 
        width="40" 
        height="40"
        className="d-inlins-block align-top mx-3"
      />
      <Navbar.Brand href="#">ROdd ICO Crowdsale</Navbar.Brand>
      <div className="ml-auto">
        <Countdown date={openingTime * 1000} renderer={renderer} />
      </div>
    </Navbar>
  );
}

export default Navigation;

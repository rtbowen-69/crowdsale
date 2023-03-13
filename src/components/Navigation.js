import Navbar from 'react-bootstrap/Navbar';

import logo from '../logo.png';

const Navigation = () => {
	return(
		<Navbar>
			<img 
				alt ="logo" 
				src={logo} 
				width="40" 
				height="40"
				className="d-inlins-block align-top mx-3"
			/>
			<Navbar.Brand href="#">ROdd ICO Crowdsale</Navbar.Brand>
		</Navbar>
	)
}

export default Navigation;

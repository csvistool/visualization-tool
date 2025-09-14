import '../css/AlgoScreen.css';
import '../css/App.css';

import { BsFillSunFill, BsMoonFill } from 'react-icons/bs';
import { Link, useLocation } from 'react-router-dom';
import AlgoSection from '../components/AlgoScreen/AlgoSection';
import AlgorithmNotFound404 from '../components/AlgorithmNotFound404';
import PropTypes from 'prop-types';
import React from 'react';
import { algoMap } from '../AlgoList';
const AlgoScreen = ({ theme, toggleTheme }) => {
	const location = useLocation();
	const algoName = location.pathname.slice(1);
	const algoDetails = algoMap[algoName];

	if (!algoDetails) {
		return <AlgorithmNotFound404 />;
	}

	// eslint-disable-next-line no-unused-vars
	const [menuDisplayName, _algoClass, _hasPseudocode, verboseDisplayName] = algoDetails;
	const isQuickselect = menuDisplayName === 'Quickselect / kᵗʰ Select';
	const header = verboseDisplayName || menuDisplayName;

	const AlgoFooter = () => {
		return (
			<div id="footer">
				<p>
					<Link to="/">Return to Home Page</Link>
				</p>
			</div>
		);
	};

	const AlgoHeader = () => {
		return (
			<div id="header">
				<h1>
					<Link to="/">&#x3008;</Link>&nbsp;&nbsp;
					{isQuickselect ? (
						<>
							Quickselect / k<sup>th</sup> Select
						</>
					) : (
						<>{header}</>
					)}
					<div id="toggle">
						{theme === 'light' ? (
							<BsFillSunFill
								size={31}
								onClick={toggleTheme}
								color="#f9c333"
								className="rotate-effect"
							/>
						) : (
							<BsMoonFill
								size={29}
								onClick={toggleTheme}
								color="#d4f1f1"
								className="rotate-effect"
							/>
						)}
					</div>
				</h1>
			</div>
		);
	};

	return (
		<div className="VisualizationMainPage">
			<div id="container">
				<AlgoHeader />
				<AlgoSection theme={theme} />
				<AlgoFooter />
			</div>
		</div>
	);
};

AlgoScreen.propTypes = {
	theme: PropTypes.string.isRequired,
	toggleTheme: PropTypes.func.isRequired,
};

export default AlgoScreen;

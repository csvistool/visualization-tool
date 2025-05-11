import '../css/AlgoScreen.css';
import '../css/App.css';

import {
	BsBookHalf,
	BsClock,
	BsCodeSlash,
	BsFillSunFill,
	BsInfoCircle,
	BsMoonFill,
	BsTranslate,
} from 'react-icons/bs';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import AlgorithmNotFound404 from '../components/AlgorithmNotFound404';
import AnimationManager from '../anim/AnimationMain';
import BigOModal from '../modals/BigOModal';
import ModalSidebarSectionTab from '../components/AlgoScreen/ModalSidebarSectionTab';
import PropTypes from 'prop-types';
import Pseudocode from '../components/AlgoScreen/Pseudocode';
import ReactGA from 'react-ga4';
import { algoMap } from '../AlgoList';
import infoModals from '../modals/InfoModals';
import pseudocodeText from '../pseudocode.json';
import timeComplexities from '../time_complexities.json';

const AlgoScreen = ({ theme, toggleTheme }) => {
	const [searchParams] = useSearchParams();
	const location = useLocation();
	const algoName = location.pathname.slice(1);
	const algoDetails = algoMap[algoName];
	const canvasRef = useRef(null);
	const animBarRef = useRef(null);
	const animManagRef = useRef(null);

	const [infoModalEnabled, setInfoModalEnabled] = useState(false);
	const [infoModalTab, setInfoModalTab] = useState('about'); // 'about' or 'code' or 'bigo'
	const [pseudocodeType, setPseudocodeType] = useState('english');
	const [pseudocodeData, setPseudocodeData] = useState(null);

	// This was originally handled via a memoized state, but the rapid state changes
	// were incredibly hard on the performance, especially for construction of a random
	// data structure (e.g. random BST). As it was already purely CSS modification,
	// this was moved to directly editing
	const getCodeElementByMethodLine = (method, line) => {
		// each line is IDed by methodname-linenumber
		return document.getElementById(`${method}-${line}`);
	};

	const setHighlightedLine = useCallback((methodName, line) => {
		const lineElement = getCodeElementByMethodLine(methodName, line);

		// edge case: psuedocode isn't open
		if (!lineElement) return;

		lineElement.classList.add('pseudocode-line-highlighted');
	}, []);

	const unhighlightLine = useCallback((methodName, line) => {
		const lineElement = getCodeElementByMethodLine(methodName, line);

		// edge case: psuedocode isn't open
		if (!lineElement) return;

		lineElement.classList.remove('pseudocode-line-highlighted');
	}, []);

	// Handle page view and animation setup
	useEffect(() => {
		ReactGA.send({ hitType: 'pageview', page: algoName });

		if (algoDetails) {
			// eslint-disable-next-line no-unused-vars
			const [menuDisplayName, AlgoClass, hasPseudoCode, verboseDisplayName] = algoDetails;

			animManagRef.current = new AnimationManager(
				canvasRef,
				animBarRef,
				setHighlightedLine,
				unhighlightLine,
			);

			const curAlgo = new AlgoClass(
				animManagRef.current,
				canvasRef.current.width,
				canvasRef.current.height,
			);
			if (searchParams.toString()) {
				try {
					curAlgo.setURLData(searchParams);
				} catch (error) {
					console.error(error);
				}
			}

			// Check for pseudocode parameter
			if (searchParams.has('pseudocode') && hasPseudoCode) {
				setPseudocodeType('english');
				setInfoModalEnabled(true);
				setInfoModalTab('code');
			}

			const updateDimensions = () => {
				animManagRef.current.changeSize(document.body.clientWidth);
			};

			window.addEventListener('resize', updateDimensions);

			return () => {
				window.removeEventListener('resize', updateDimensions);
			};
		}
	}, [algoName, algoDetails, searchParams]);

	useEffect(() => {
		const data = pseudocodeText[algoName];
		setPseudocodeData(data);
	}, [algoName]);

	const toggleInfoModal = () => {
		// When opening the modal, set the appropriate tab
		if (!infoModalEnabled) {
			// Choose the tab based on available content
			if (infoModals[algoName]) {
				setInfoModalTab('about');
			} else if (pseudocodeData) {
				setInfoModalTab('code');
			}
		}

		setInfoModalEnabled(prev => !prev);
	};

	const togglePseudocode = () => {
		const pseudocodeMap = { none: 'english', english: 'code', code: 'none' };
		setPseudocodeType(prev => pseudocodeMap[prev]);
	};

	const togglePseudocodeType = () => {
		setPseudocodeType(prev => (prev === 'english' ? 'code' : 'english'));
	};

	if (!algoDetails) {
		return <AlgorithmNotFound404 />;
	}

	// eslint-disable-next-line no-unused-vars
	const [menuDisplayName, AlgoClass, hasPseudoCode, verboseDisplayName] = algoDetails;
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

	const complexities = timeComplexities[algoName];

	return (
		<div className="VisualizationMainPage">
			<div id="container">
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

				<div id="mainContent">
					<div id="algoControlSection">
						<table id="AlgorithmSpecificControls"></table>
						<div id="toggles">
							{(infoModals[algoName] || pseudocodeData || complexities) && (
								<BsBookHalf
									className="menu-modal"
									size={30}
									onClick={toggleInfoModal}
									opacity={infoModalEnabled ? '100%' : '40%'}
									title="Information & Documentation"
								/>
							)}
						</div>
					</div>

					<div className="viewport">
						<canvas id="canvas" width={0} height="505" ref={canvasRef}></canvas>

						{infoModalEnabled && (
							<div
								className={`modal info-modal ${
									theme === 'dark' ? 'dark-theme' : ''
								}`}
							>
								<div className="modal-content">
									<div className="modal-tabs">
										{infoModals[algoName] && (
											<ModalSidebarSectionTab
												onClick={() => setInfoModalTab('about')}
												currentTab={infoModalTab}
												title={'About'}
												name={'about'}
												icon={BsInfoCircle}
											/>
										)}
										{pseudocodeData && (
											<ModalSidebarSectionTab
												onClick={() => setInfoModalTab('code')}
												currentTab={infoModalTab}
												title={'Pseudocode'}
												name={'code'}
												icon={BsCodeSlash}
											/>
										)}
										{complexities && (
											<ModalSidebarSectionTab
												onClick={() => setInfoModalTab('bigo')}
												currentTab={infoModalTab}
												name={'bigo'}
												icon={BsClock}
												title={'Big O'}
											/>
										)}
									</div>

									{infoModalTab === 'about' && infoModals[algoName] && (
										<div className="tab-content about-content">
											{infoModals[algoName]}
										</div>
									)}

									{infoModalTab === 'code' && pseudocodeData && (
										<div className="tab-content code-content">
											<button
												className="code-toggle-button"
												onClick={togglePseudocodeType}
												title={
													pseudocodeType === 'english'
														? 'Show Code Format'
														: 'Show English Format'
												}
											>
												{pseudocodeType === 'english' ? (
													<BsCodeSlash size={20} />
												) : (
													<BsTranslate size={20} />
												)}
											</button>

											<Pseudocode
												algoName={algoName}
												language={pseudocodeType}
											/>
										</div>
									)}

									{infoModalTab === 'bigo' && (
										<div className="tab-content bigo-content">
											<BigOModal complexities={complexities} />
										</div>
									)}
								</div>
							</div>
						)}
					</div>
					<div id="generalAnimationControlSection">
						<table id="GeneralAnimationControls" ref={animBarRef}></table>
					</div>
				</div>
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

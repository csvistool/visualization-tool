import '../css/AlgoScreen.css';
import '../css/App.css';

import {
	BsBookHalf,
	BsClock,
	BsCodeSlash,
	BsFileEarmarkCodeFill,
	BsFileEarmarkFill,
	BsFileEarmarkFontFill,
	BsFillSunFill,
	BsInfoCircle,
	BsMoonFill,
	BsTranslate,
} from 'react-icons/bs';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import AlgorithmNotFound404 from '../components/AlgorithmNotFound404';
import AnimationManager from '../anim/AnimationMain';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga4';
import { algoMap } from '../AlgoList';
import bigOModals from '../modals/BigOModals';
import infoModals from '../modals/InfoModals';
import pseudocodeText from '../pseudocode.json';

const AlgoScreen = ({ theme, toggleTheme }) => {
	const [searchParams] = useSearchParams();
	const location = useLocation();
	const algoName = location.pathname.slice(1);
	const algoDetails = algoMap[algoName];
	const canvasRef = useRef(null);
	const animBarRef = useRef(null);
	const animManagRef = useRef(null);

	const [infoModalEnabled, setInfoModalEnabled] = useState(false);
	const [infoModalTab, setInfoModalTab] = useState('about'); // 'about' or 'code'
	const [bigOEnabled, setBigOEnabled] = useState(false);
	const [pseudocodeType, setPseudocodeType] = useState('english');
	const [selectedSection, setSelectedSection] = useState(null);
	const [pseudocodeData, setPseudocodeData] = useState(null);

	// Handle page view and animation setup
	useEffect(() => {
		ReactGA.send({ hitType: 'pageview', page: algoName });

		if (algoDetails) {
			// eslint-disable-next-line no-unused-vars
			const [menuDisplayName, AlgoClass, hasPseudoCode, verboseDisplayName] = algoDetails;

			animManagRef.current = new AnimationManager(canvasRef, animBarRef);

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

	// Update pseudocode layers when pseudocode type changes
	useEffect(() => {
		if (animManagRef.current) {
			animManagRef.current.updateLayer(32, false); // Hide English
			animManagRef.current.updateLayer(33, false); // Hide Pseudocode

			if (pseudocodeType === 'english') {
				animManagRef.current.updateLayer(32, true);
			} else if (pseudocodeType === 'code') {
				animManagRef.current.updateLayer(33, true);
			}
		}
	}, [pseudocodeType]);

	// Update pseudocode data when algorithm changes
	useEffect(() => {
		const findPseudocode = () => {
			// Function to normalize and standardize algorithm names for comparison
			const normalizeAlgoName = (name) => {
				return name.toLowerCase()
					.replace(/['\s-]+/g, '') // Remove apostrophes, spaces, hyphens
					.replace(/s$/, '')       // Remove trailing 's' for plurals
					.replace(/^(singly|doubly|circularly)/, ''); // Remove prefixes like "singly", "doubly"
			};
			
			const normalizedAlgoName = normalizeAlgoName(algoName);
			
			// First try exact match
			if (pseudocodeText[algoName]) {
				return pseudocodeText[algoName];
			}
			
			// Then try normalized matching
			const algoKey = Object.keys(pseudocodeText).find(key => {
				return normalizeAlgoName(key) === normalizedAlgoName;
			});
			
			if (algoKey) {
				return pseudocodeText[algoKey];
			}
			
			return null;
		};
		
		const data = findPseudocode();
		setPseudocodeData(data);
		
		if (data) {
			setSelectedSection(Object.keys(data)[0]); // Default to first section
		}
	}, [algoName]);
	
	// Get the appropriate content based on selected section
	const pseudocodeContent = pseudocodeData && selectedSection ? 
		pseudocodeData[selectedSection][pseudocodeType] : null;

	const toggleInfoModal = () => {
		setBigOEnabled(false);
		
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

	const toggleBigO = () => {
		setInfoModalEnabled(false);
		setBigOEnabled(prev => !prev);
	};

	const togglePseudocode = () => {
		const pseudocodeMap = { none: 'english', english: 'code', code: 'none' };
		setPseudocodeType(prev => pseudocodeMap[prev]);
	};

	const togglePseudocodeType = () => {
		setPseudocodeType(prev => (prev === 'english' ? 'code' : 'english'));
	};

	// Function to apply syntax highlighting to pseudocode
	const highlightSyntax = (content) => {
		// Define regex patterns for different code elements
		const keywordPattern = /\b(if|else|for|while|return|end)\b(?!\s*procedure)/g;
		const procedurePattern = /\bprocedure\s+(\w+)/g;
		const endProcedurePattern = /end\s+procedure/g;
		const commentPattern = /\/\/.+$/g;
		const paramPattern = /\(([^)]+)\)/g;
		
		// Apply highlighting by wrapping in span tags
		const highlighted = content
			.replace(procedurePattern, '<span class="pseudocode-procedure">procedure $1</span>')
			.replace(endProcedurePattern, '<span class="pseudocode-end">end procedure</span>')
			.replace(keywordPattern, '<span class="pseudocode-keyword">$1</span>')
			.replace(commentPattern, '<span class="pseudocode-comment">$&</span>')
			.replace(paramPattern, '(<span class="pseudocode-param">$1</span>)');
		
		return { __html: highlighted };
	};

	if (!algoDetails) {
		return <AlgorithmNotFound404 />;
	}

	// eslint-disable-next-line no-unused-vars
	const [menuDisplayName, AlgoClass, hasPseudoCode, verboseDisplayName] = algoDetails;
	const isQuickselect = menuDisplayName === 'Quickselect / kᵗʰ Select';
	const header = verboseDisplayName || menuDisplayName;

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
							{(infoModals[algoName] || pseudocodeData) && (
								<BsBookHalf
									className="menu-modal"
									size={30}
									onClick={toggleInfoModal}
									opacity={infoModalEnabled ? '100%' : '40%'}
									title="Information & Pseudocode"
								/>
							)}
							{hasPseudoCode && pseudocodeType === 'none' && (
								<BsFileEarmarkFill
									className="pseudocode-toggle"
									size={32}
									onClick={togglePseudocode}
									opacity={'40%'}
									title="Code: Hidden"
								/>
							)}
							{hasPseudoCode && pseudocodeType === 'english' && (
								<BsFileEarmarkFontFill
									className="pseudocode-toggle"
									size={32}
									onClick={togglePseudocode}
									title="Code: English"
								/>
							)}
							{hasPseudoCode && pseudocodeType === 'code' && (
								<BsFileEarmarkCodeFill
									className="pseudocode-toggle"
									size={32}
									onClick={togglePseudocode}
									title="Code: Pseudo"
								/>
							)}
							{bigOModals(algoName) && (
								<BsClock
									className="menu-modal"
									size={30}
									onClick={toggleBigO}
									opacity={bigOEnabled ? '100%' : '40%'}
									title="Time Complexities"
								/>
							)}
						</div>
					</div>

					<div className="viewport">
						<canvas id="canvas" width={0} height="505" ref={canvasRef}></canvas>
						{infoModalEnabled && (
							<div className={`modal info-modal ${theme === 'dark' ? 'dark-theme' : ''}`}>
								<div className="modal-content">
									<div className="modal-tabs">
										{infoModals[algoName] && (
											<button 
												className={`tab-button ${infoModalTab === 'about' ? 'active' : ''}`}
												onClick={() => setInfoModalTab('about')}
											>
												<BsInfoCircle size={18} />
												<span className="tab-text">About</span>
											</button>
										)}
										{pseudocodeData && (
											<button 
												className={`tab-button ${infoModalTab === 'code' ? 'active' : ''}`}
												onClick={() => setInfoModalTab('code')}
											>
												<BsCodeSlash size={18} />
												<span className="tab-text">Pseudocode</span>
											</button>
										)}
									</div>
									
									{infoModalTab === 'about' && infoModals[algoName] && (
										<div className="tab-content about-content">
											{infoModals[algoName]}
										</div>
									)}
									
									{infoModalTab === 'code' && pseudocodeData && (
										<div className="tab-content code-content">
											<div className="pseudocode-header">
												<div className="pseudocode-title">
													{Object.keys(pseudocodeData).length > 1 && (
														<select 
															value={selectedSection}
															onChange={(e) => setSelectedSection(e.target.value)}
															className="pseudocode-section-selector"
														>
															{Object.keys(pseudocodeData).map(section => (
																<option key={section} value={section}>
																	{section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1')}
																</option>
															))}
														</select>
													)}
												</div>
												<button 
													className="code-toggle-button" 
													onClick={togglePseudocodeType}
													title={pseudocodeType === 'english' ? 'Show Code Format' : 'Show English Format'}
												>
													{pseudocodeType === 'english' 
														? <BsCodeSlash size={20} />
														: <BsTranslate size={20} />
													}
												</button>
											</div>
											
											{pseudocodeContent && (
												<div className="pseudocode-modal-content">
													{pseudocodeContent.map((line, i) => {
														// Calculate indentation level by counting leading spaces
														const content = line[0];
														const indentMatch = content.match(/^(\s+)/);
														const indentLevel = indentMatch ? indentMatch[0].length / 2 : 0;
														
														return (
															<div 
																key={i} 
																className="pseudocode-line"
																style={{ paddingLeft: `${indentLevel * 20}px` }}
																dangerouslySetInnerHTML={highlightSyntax(content)}
															></div>
														);
													})}
												</div>
											)}
										</div>
									)}
								</div>
							</div>
						)}
						{bigOEnabled && (
							<div className="modal bigo">
								<div className="modal-content">{bigOModals(algoName)}</div>
							</div>
						)}
					</div>

					<div id="generalAnimationControlSection">
						<table id="GeneralAnimationControls" ref={animBarRef}></table>
					</div>
				</div>

				<div id="footer">
					<p>
						<Link to="/">Return to Home Page</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

AlgoScreen.propTypes = {
	theme: PropTypes.string.isRequired,
	toggleTheme: PropTypes.func.isRequired,
};

export default AlgoScreen;

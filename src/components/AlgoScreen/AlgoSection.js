import '../../css/AlgoScreen.css';
import '../../css/App.css';

import { BsBookHalf, BsClock, BsCodeSlash, BsInfoCircle, BsKeyboard, BsTranslate } from 'react-icons/bs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import AlgorithmNotFound404 from '../../components/AlgorithmNotFound404';
import AnimationManager from '../../anim/AnimationMain';
import BigOModal from '../../modals/BigOModal';
import ModalSidebarSectionTab from '../../components/AlgoScreen/ModalSidebarSectionTab';
import Pseudocode from '../../components/AlgoScreen/Pseudocode';
import ReactGA from 'react-ga4';
import { SHORTCUTS_CONFIG } from './ShortcutConfig';
import { algoMap } from '../../AlgoList';
import infoModals from '../../modals/InfoModals';
import pseudocodeText from '../../pseudocode.json';
import timeComplexities from '../../time_complexities.json';

const AlgoSection = ({ theme }) => {
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

		// jumps to whatever line is highlighted
		lineElement.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
		});

	}, []);

	const unhighlightLine = useCallback((methodName, line) => {
		const lineElement = getCodeElementByMethodLine(methodName, line);

		// edge case: psuedocode isn't open
		if (!lineElement) return;

		lineElement.classList.remove('pseudocode-line-highlighted');
	}, []);

	// Get pseudocode
	useEffect(() => {
		const data = pseudocodeText[algoName];
		setPseudocodeData(data);
	}, [algoName]);

	const pseudocodeDataRef = useRef(null);
	const modalOpenedRef = useRef(false);

	useEffect(() => {
		pseudocodeDataRef.current = pseudocodeData;
	}, [pseudocodeData]);

	// Handle page view and animation setup
	useEffect(() => {
		const handleKeyDown = (e) => {
			// Ignore if focus is on an input or textarea
			if (
				['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) ||
				document.activeElement.isContentEditable
			) {
				return;
			}

			const key = e.key;

			// Toggle shortcuts with '?' or 'Ctrl+/'
			if (key === '?' || (e.ctrlKey && key === '/')) {
				e.preventDefault();
				if (!infoModalEnabled) {
					setInfoModalEnabled(true);
					setInfoModalTab('shortcuts');
				} else {
					// If modal is open, verify if it's on shortcuts tab, if so close, else switch
					if (infoModalTab === 'shortcuts') {
						setInfoModalEnabled(false);
					} else {
						setInfoModalTab('shortcuts');
					}
				}
				return;
			}

			// Ignore if modifier keys are pressed (except Shift for ?)
			if (e.ctrlKey || e.altKey || e.metaKey) return;

			const config = SHORTCUTS_CONFIG[algoName];
			if (config && config[key]) {
				e.preventDefault();
				const targetId = config[key].target;
				const element = document.querySelector(`[data-shortcut-target="${targetId}"]`);
				if (element) {
					element.focus();
					if (element.select) {
						element.select();
					}
					// Add a temporary highlight class
					element.classList.add('shortcut-highlight');
					setTimeout(() => element.classList.remove('shortcut-highlight'), 500);
				}
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [algoName, infoModalEnabled, infoModalTab]);

	useEffect(() => {
		ReactGA.send({ hitType: 'pageview', page: algoName });

		if (algoDetails) {
			// eslint-disable-next-line no-unused-vars
			const [_menuDisplayName, AlgoClass, hasPseudoCode, _verboseDisplayName] = algoDetails;

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

			animManagRef.current.addListener("AnimationStarted", null, () => {
				if (pseudocodeDataRef.current && !modalOpenedRef.current) {
					modalOpenedRef.current = true;
					setInfoModalEnabled(true);
					setInfoModalTab('code');
				}
			});

			const updateDimensions = () => {
				animManagRef.current.changeSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);;
			};

			window.addEventListener('resize', updateDimensions);

			updateDimensions();

			return () => {
				window.removeEventListener('resize', updateDimensions);
			};
		}
	}, [algoName, algoDetails, searchParams, setHighlightedLine, unhighlightLine]);

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

	const togglePseudocodeType = () => {
		setPseudocodeType(prev => (prev === 'english' ? 'code' : 'english'));
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (infoModalEnabled && canvasRef.current && canvasRef.current.contains(event.target)) {
				// Clicked on canvas (outside modal)
				setInfoModalEnabled(false);
			}

			// Also check if clicked on the main container but not the modal
			// The modal is absolute positioned, so we might need a specific ref for it if the above isn't enough.
			// However, the modal is inside "viewport" div.
			const modal = document.querySelector('.modal.info-modal');
			if (infoModalEnabled && modal && !modal.contains(event.target) && !event.target.closest('.menu-modal')) {
				setInfoModalEnabled(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [infoModalEnabled]);

	if (!algoDetails) {
		return <AlgorithmNotFound404 />;
	}

	const complexities = timeComplexities[algoName];

	return (
		<div id="mainContent">
			<div id="algoControlSection">
				<table id="AlgorithmSpecificControls"></table>
				<div id="toggles">
					{(infoModals[algoName] || pseudocodeData || complexities) && (
						<BsBookHalf
							className="menu-modal"
							size={30}
							onClick={toggleInfoModal}
							opacity={infoModalEnabled && infoModalTab !== 'shortcuts' ? '100%' : '40%'}
							title="Information & Documentation"
						/>
					)}
					{SHORTCUTS_CONFIG[algoName] && (
						<BsKeyboard
							className="menu-modal"
							size={30}
							onClick={() => {
								if (infoModalEnabled && infoModalTab === 'shortcuts') {
									setInfoModalEnabled(false);
								} else {
									setInfoModalEnabled(true);
									setInfoModalTab('shortcuts');
								}
							}}
							opacity={infoModalEnabled && infoModalTab === 'shortcuts' ? '100%' : '40%'}
							title="Keyboard Shortcuts"
							style={{ marginLeft: '10px' }}
						/>
					)}
				</div>
			</div>

			<div className="viewport">
				<canvas id="canvas" ref={canvasRef}></canvas>

				{infoModalEnabled && (
					<div className={`modal info-modal ${theme === 'dark' ? 'dark-theme' : ''}`}>
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
								{SHORTCUTS_CONFIG[algoName] && (
									<ModalSidebarSectionTab
										onClick={() => setInfoModalTab('shortcuts')}
										currentTab={infoModalTab}
										name={'shortcuts'}
										icon={BsKeyboard}
										title={'Shortcuts'}
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

									<Pseudocode algoName={algoName} language={pseudocodeType} />
								</div>
							)}

							{infoModalTab === 'bigo' && (
								<div className="tab-content bigo-content">
									<BigOModal complexities={complexities} />
								</div>
							)}

							{infoModalTab === 'shortcuts' && SHORTCUTS_CONFIG[algoName] && (
								<div className="tab-content shortcuts-content">
									<h3>Keyboard Shortcuts</h3>
									<div className="shortcuts-list" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 20px', alignItems: 'center' }}>
										{Object.entries(SHORTCUTS_CONFIG[algoName]).map(([key, { label }]) => (
											<React.Fragment key={key}>
												<kbd style={{
													backgroundColor: '#eee',
													border: '1px solid #b4b4b4',
													borderRadius: '3px',
													boxShadow: '0 1px 1px rgba(0,0,0,.2), 0 2px 0 0 rgba(255,255,255,.7) inset',
													color: '#333',
													display: 'inline-block',
													fontSize: '.85em',
													fontWeight: 700,
													lineHeight: 1,
													padding: '2px 4px',
													whiteSpace: 'nowrap'
												}}>{key}</kbd>
												<span>{label}</span>
											</React.Fragment>
										))}
										<React.Fragment>
											<kbd style={{
												backgroundColor: '#eee',
												border: '1px solid #b4b4b4',
												borderRadius: '3px',
												boxShadow: '0 1px 1px rgba(0,0,0,.2), 0 2px 0 0 rgba(255,255,255,.7) inset',
												color: '#333',
												display: 'inline-block',
												fontSize: '.85em',
												fontWeight: 700,
												lineHeight: 1,
												padding: '2px 4px',
												whiteSpace: 'nowrap'
											}}>?</kbd>
											<span>Toggle shortcuts help</span>
										</React.Fragment>
									</div>
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
	);
};

export default AlgoSection;

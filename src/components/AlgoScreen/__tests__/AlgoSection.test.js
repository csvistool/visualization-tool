import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import AlgoSection from '../AlgoSection';
import React from 'react';
import ReactGA from 'react-ga4';
import { algoMap } from '../../../AlgoList';
import timeComplexities from '../../../time_complexities.json';
import userEvent from '@testing-library/user-event';

let lastAnimationManager = null;
jest.mock('../../../anim/AnimationMain', () => {
	const actual = jest.requireActual('../../../anim/AnimationMain');
	return {
		__esModule: true,
		...actual,
		default: class MockAnimationManager extends actual.default {
			constructor(...args) {
				super(...args);
				lastAnimationManager = this;
			}
		},
	};
});

describe('AlgoSection Component', () => {
	beforeEach(() => {
		HTMLCanvasElement.prototype.getContext = jest.fn(
			() =>
				new Proxy(
					{
						measureText: () => ({ width: 10 }),
					},
					{
						get: (target, prop) => {
							if (prop in target) return target[prop];
							return jest.fn();
						},
					},
				),
		);
		Element.prototype.scrollIntoView = jest.fn();
		jest.spyOn(ReactGA, 'send').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('renders AlgorithmNotFound404 when route algorithm does not exist in algoMap', () => {
		render(
			<MemoryRouter initialEntries={['/UnknownAlgorithm']}>
				<Routes>
					<Route path="/:algo" element={<AlgoSection theme="light" />} />
				</Routes>
			</MemoryRouter>,
		);

		expect(screen.getByRole('heading', { level: 1, name: '404!' })).toBeInTheDocument();
	});

	it('renders viewport canvas and control sections for a valid algorithm', () => {
		const { container } = render(
			<MemoryRouter initialEntries={['/ArrayList']}>
				<Routes>
					<Route path="/:algo" element={<AlgoSection theme="light" />} />
				</Routes>
			</MemoryRouter>,
		);

		expect(container.querySelector('#AlgorithmSpecificControls')).toBeInTheDocument();
		expect(container.querySelector('#canvas')).toBeInTheDocument();
		expect(container.querySelector('#GeneralAnimationControls')).toBeInTheDocument();
		expect(screen.getByTitle('Information & Documentation')).toBeInTheDocument();
		expect(ReactGA.send).toHaveBeenCalledWith({ hitType: 'pageview', page: 'ArrayList' });
	});

	it('does not render documentation book icon when algorithm has no info, pseudocode, or complexities', () => {
		render(
			<MemoryRouter initialEntries={['/NonLinearProbing']}>
				<Routes>
					<Route path="/:algo" element={<AlgoSection theme="light" />} />
				</Routes>
			</MemoryRouter>,
		);

		expect(screen.queryByTitle('Information & Documentation')).not.toBeInTheDocument();
	});

	it('toggles info modal via click and keyboard Enter and Space keys, ignoring other keys', () => {
		render(
			<MemoryRouter initialEntries={['/ArrayList']}>
				<Routes>
					<Route path="/:algo" element={<AlgoSection theme="light" />} />
				</Routes>
			</MemoryRouter>,
		);

		const bookIcon = screen.getByTitle('Information & Documentation');

		// Pressing an unrelated key (e.g. 'Escape') does not toggle
		fireEvent.keyDown(bookIcon, { key: 'Escape' });
		expect(screen.queryByRole('button', { name: /about/i })).not.toBeInTheDocument();

		// Pressing Enter opens the modal
		fireEvent.keyDown(bookIcon, { key: 'Enter' });
		expect(screen.getByRole('button', { name: /about/i })).toBeInTheDocument();

		// Pressing Space closes the modal
		fireEvent.keyDown(bookIcon, { key: ' ' });
		expect(screen.queryByRole('button', { name: /about/i })).not.toBeInTheDocument();

		// Clicking the icon toggles it open again
		userEvent.click(bookIcon);
		expect(screen.getByRole('button', { name: /about/i })).toBeInTheDocument();
	});

	it('switches between modal tabs and toggles pseudocode format', () => {
		render(
			<MemoryRouter initialEntries={['/ArrayList']}>
				<Routes>
					<Route path="/:algo" element={<AlgoSection theme="light" />} />
				</Routes>
			</MemoryRouter>,
		);

		const bookIcon = screen.getByTitle('Information & Documentation');
		userEvent.click(bookIcon);

		// Initially opens to 'about' tab
		expect(screen.getByText(/ArrayLists must be contiguous/i)).toBeInTheDocument();

		// Switch to Big O tab
		const bigOTab = screen.getByRole('button', { name: /big o/i });
		userEvent.click(bigOTab);
		expect(
			screen.getByRole('heading', { level: 4, name: /Add to Front/i }),
		).toBeInTheDocument();

		// Switch to Pseudocode tab
		const pseudocodeTab = screen.getByRole('button', { name: /pseudocode/i });
		userEvent.click(pseudocodeTab);

		const formatToggleBtn = screen.getByTitle('Show Code Format');
		expect(formatToggleBtn).toBeInTheDocument();

		// Click format toggle button to switch to Code format
		userEvent.click(formatToggleBtn);
		expect(screen.getByTitle('Show English Format')).toBeInTheDocument();

		// Click format toggle button back to switch to English format
		userEvent.click(screen.getByTitle('Show English Format'));
		expect(screen.getByTitle('Show Code Format')).toBeInTheDocument();

		// Switch back to About tab
		const aboutTab = screen.getByRole('button', { name: /about/i });
		userEvent.click(aboutTab);
		expect(screen.getByText(/ArrayLists must be contiguous/i)).toBeInTheDocument();
	});

	it('defaults to code tab when opening modal for algorithm without about info', () => {
		render(
			<MemoryRouter initialEntries={['/HeapSort']}>
				<Routes>
					<Route path="/:algo" element={<AlgoSection theme="light" />} />
				</Routes>
			</MemoryRouter>,
		);

		const bookIcon = screen.getByTitle('Information & Documentation');
		userEvent.click(bookIcon);

		expect(screen.queryByRole('button', { name: /about/i })).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: /pseudocode/i })).toBeInTheDocument();
		expect(screen.getByTitle('Show Code Format')).toBeInTheDocument();
	});

	it('handles opening modal when algorithm only has time complexities', () => {
		timeComplexities.NonLinearProbing = {
			Probe: {
				average: { big_o: 'O(1)', explanation: 'Test explanation' },
			},
		};

		render(
			<MemoryRouter initialEntries={['/NonLinearProbing']}>
				<Routes>
					<Route path="/:algo" element={<AlgoSection theme="light" />} />
				</Routes>
			</MemoryRouter>,
		);

		const bookIcon = screen.getByTitle('Information & Documentation');
		userEvent.click(bookIcon);

		expect(screen.getByRole('button', { name: /big o/i })).toBeInTheDocument();

		delete timeComplexities.NonLinearProbing;
	});

	it('automatically opens pseudocode tab when ?pseudocode URL query param is present', () => {
		render(
			<MemoryRouter initialEntries={['/ArrayList?pseudocode=true']}>
				<Routes>
					<Route path="/:algo" element={<AlgoSection theme="light" />} />
				</Routes>
			</MemoryRouter>,
		);

		expect(screen.getByRole('button', { name: /pseudocode/i })).toBeInTheDocument();
		expect(screen.getByTitle('Show Code Format')).toBeInTheDocument();
	});

	it('applies dark-theme class to modal when theme is dark', () => {
		const { container } = render(
			<MemoryRouter initialEntries={['/ArrayList']}>
				<Routes>
					<Route path="/:algo" element={<AlgoSection theme="dark" />} />
				</Routes>
			</MemoryRouter>,
		);

		const bookIcon = screen.getByTitle('Information & Documentation');
		userEvent.click(bookIcon);

		const modal = container.querySelector('.modal.info-modal');
		expect(modal).toHaveClass('dark-theme');
	});

	it('automatically opens modal to code tab when AnimationStarted event fires', () => {
		render(
			<MemoryRouter initialEntries={['/ArrayList']}>
				<Routes>
					<Route path="/:algo" element={<AlgoSection theme="light" />} />
				</Routes>
			</MemoryRouter>,
		);

		expect(screen.queryByRole('button', { name: /pseudocode/i })).not.toBeInTheDocument();

		act(() => {
			lastAnimationManager.fireEvent('AnimationStarted', null);
		});

		expect(screen.getByRole('button', { name: /pseudocode/i })).toBeInTheDocument();
		expect(screen.getByTitle('Show Code Format')).toBeInTheDocument();

		// Firing again when modalOpenedRef is already true does not crash or re-toggle
		act(() => {
			lastAnimationManager.fireEvent('AnimationStarted', null);
		});
		expect(screen.getByRole('button', { name: /pseudocode/i })).toBeInTheDocument();
	});

	it('highlights and unhighlights pseudocode line elements correctly', () => {
		render(
			<MemoryRouter initialEntries={['/ArrayList']}>
				<Routes>
					<Route path="/:algo" element={<AlgoSection theme="light" />} />
				</Routes>
			</MemoryRouter>,
		);

		// Edge case: target line element does not exist
		expect(() => {
			lastAnimationManager.setHighlightState('nonExistentMethod', 99);
			lastAnimationManager.unhighlightLine('nonExistentMethod', 99);
		}).not.toThrow();

		// Target line element exists
		const lineElem = document.createElement('div');
		lineElem.id = 'addAtIndex-1';
		lineElem.scrollIntoView = jest.fn();
		document.body.appendChild(lineElem);

		lastAnimationManager.setHighlightState('addAtIndex', 1);
		expect(lineElem.classList.contains('pseudocode-line-highlighted')).toBe(true);
		expect(lineElem.scrollIntoView).toHaveBeenCalledWith({
			behavior: 'smooth',
			block: 'center',
		});

		lastAnimationManager.unhighlightLine('addAtIndex', 1);
		expect(lineElem.classList.contains('pseudocode-line-highlighted')).toBe(false);

		document.body.removeChild(lineElem);
	});

	it('updates canvas dimensions on window resize and cleans up listener on unmount', () => {
		const { unmount } = render(
			<MemoryRouter initialEntries={['/ArrayList']}>
				<Routes>
					<Route path="/:algo" element={<AlgoSection theme="light" />} />
				</Routes>
			</MemoryRouter>,
		);

		const changeSizeSpy = jest.spyOn(lastAnimationManager, 'changeSize');
		fireEvent(window, new Event('resize'));
		expect(changeSizeSpy).toHaveBeenCalled();

		unmount();
		const callCount = changeSizeSpy.mock.calls.length;
		fireEvent(window, new Event('resize'));
		expect(changeSizeSpy).toHaveBeenCalledTimes(callCount);
	});

	it('handles setURLData error gracefully when algorithm throws', () => {
		const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		const originalAlgoClass = algoMap.ArrayList[1];
		class ErrorThrowingAlgo extends originalAlgoClass {
			setURLData() {
				throw new Error('Simulated setURLData failure');
			}
		}
		algoMap.ArrayList[1] = ErrorThrowingAlgo;

		render(
			<MemoryRouter initialEntries={['/ArrayList?data=invalid']}>
				<Routes>
					<Route path="/:algo" element={<AlgoSection theme="light" />} />
				</Routes>
			</MemoryRouter>,
		);

		expect(consoleErrorSpy).toHaveBeenCalled();
		algoMap.ArrayList[1] = originalAlgoClass;
	});
});

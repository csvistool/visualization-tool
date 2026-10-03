import Floyd from '../Floyd.js';
import { act } from '../../anim/AnimationMain';

describe('Floyd', () => {
	let floyd;
	let mockAm;

	beforeEach(() => {
		document.body.innerHTML = `
			<div id="AlgorithmSpecificControls"></div>
			<div id="GeneralAnimationControls"></div>
		`;

		mockAm = {
			addListener: jest.fn(),
			startNewAnimation: jest.fn(),
			clearHistory: jest.fn(),
			skipForward: jest.fn(),
			step: jest.fn(),
			resetAll: jest.fn(),
			setAllLayers: jest.fn(),
			setLayer: jest.fn(),
		};

		floyd = new Floyd(mockAm, 800, 600);
	});

	test('initializes controls, cost table, and path table', () => {
		expect(floyd.startButton).toBeDefined();
		expect(floyd.costTable.length).toBe(floyd.size);
		expect(floyd.pathTable.length).toBe(floyd.size);

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('runs Floyd-Warshall all-pairs shortest paths algorithm', () => {
		floyd.startCallback();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
		const calls = mockAm.startNewAnimation.mock.calls;
		const lastCmds = calls[calls.length - 1][0];

		// Check connects and table updates
		const connections = lastCmds.filter(cmd => cmd[0] === act.connect);
		expect(connections.length).toBeGreaterThan(0);
	});

	test('handles graph callbacks and setup_small', () => {
		floyd.largeGraphCallback();
		floyd.setup_small();
		expect(floyd.size).toBe(8);
	});

	test('formats cost labels with INF for negative distances', () => {
		expect(floyd.getCostLabel(5)).toBe('5');
		expect(floyd.getCostLabel(-1, true)).toBe('INF');
	});

	test('resets cost and path tables via reset', () => {
		floyd.reset();
		expect(floyd.costTable.length).toBe(floyd.size);
		expect(floyd.pathTable.length).toBe(floyd.size);
	});
});

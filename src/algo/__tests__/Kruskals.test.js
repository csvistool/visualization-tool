import Kruskals from '../Kruskals.js';
import { act } from '../../anim/AnimationMain';

describe('Kruskals', () => {
	let kruskals;
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

		kruskals = new Kruskals(mockAm, 800, 600);
	});

	test('initializes controls and default disjoint set', () => {
		expect(kruskals.startButton).toBeDefined();
		expect(kruskals.setData.length).toBe(kruskals.size);

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('runs Kruskals MST algorithm and highlights MST edges', () => {
		kruskals.startCallback();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
		const calls = mockAm.startNewAnimation.mock.calls;
		const lastCmds = calls[calls.length - 1][0];

		// Check MST edge formatting
		const mstEdges = lastCmds.filter(
			cmd =>
				cmd[0] === act.setEdgeColor ||
				cmd[0] === act.setEdgeThickness ||
				cmd[0] === act.setText,
		);
		expect(mstEdges.length).toBeGreaterThan(0);
	});

	test('resets animation state via reset', () => {
		kruskals.startCallback();

		kruskals.reset();
		expect(kruskals.edgesListLeft).toEqual([]);
		expect(kruskals.edgesListRight).toEqual([]);
	});
});

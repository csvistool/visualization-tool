import Prims from '../Prims.js';
import { act } from '../../anim/AnimationMain';

describe('Prims', () => {
	let prims;
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

		prims = new Prims(mockAm, 800, 600);
	});

	test('initializes controls and default graph', () => {
		expect(prims.startField).toBeDefined();
		expect(prims.startButton).toBeDefined();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('validates empty start vertex in startCallback', () => {
		mockAm.startNewAnimation.mockClear();
		prims.startField.value = '';
		prims.startCallback();

		expect(mockAm.startNewAnimation).not.toHaveBeenCalled();
	});

	test('validates out-of-range start vertex in doPrim', () => {
		const cmdsInvalid = prims.doPrim('Z');
		expect(
			cmdsInvalid.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(p => typeof p === 'string' && p.includes('not a vertex')),
			),
		).toBe(true);
	});

	test('runs Prims MST algorithm from valid start vertex', () => {
		prims.startField.value = 'A';
		prims.startCallback();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
		const calls = mockAm.startNewAnimation.mock.calls;
		const lastCmds = calls[calls.length - 1][0];

		// Check MST edge color or edge highlight commands
		const edgeSets = lastCmds.filter(
			cmd =>
				cmd[0] === act.setEdgeColor ||
				cmd[0] === act.setEdgeThickness ||
				cmd[0] === act.setBackgroundColor,
		);
		expect(edgeSets.length).toBeGreaterThan(0);
	});

	test('resets animation state via reset', () => {
		prims.startField.value = 'A';
		prims.startCallback();

		prims.reset();
		expect(prims.visitedID).toEqual([]);
	});

	test('triggers start on Enter key in startField', () => {
		prims.startField.value = 'B';
		const event = new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 });
		prims.startField.dispatchEvent(event);

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});
});

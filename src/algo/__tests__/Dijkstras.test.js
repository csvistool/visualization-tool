import Dijkstras from '../Dijkstras.js';
import { act } from '../../anim/AnimationMain';

describe('Dijkstras', () => {
	let dijkstras;
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

		dijkstras = new Dijkstras(mockAm, 800, 600);
	});

	test('initializes controls and default distance table', () => {
		expect(dijkstras.startField).toBeDefined();
		expect(dijkstras.startButton).toBeDefined();

		expect(dijkstras.distance.length).toBe(dijkstras.size);
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('validates empty start vertex in startCallback', () => {
		mockAm.startNewAnimation.mockClear();
		dijkstras.startField.value = '';
		dijkstras.startCallback();

		expect(mockAm.startNewAnimation).not.toHaveBeenCalled();
	});

	test('validates out-of-range start vertex in doDijkstra', () => {
		const cmdsInvalid = dijkstras.doDijkstra('Z');
		expect(
			cmdsInvalid.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(p => typeof p === 'string' && p.includes('not a vertex')),
			),
		).toBe(true);
	});

	test('runs Dijkstra shortest path algorithm from valid start vertex', () => {
		dijkstras.startField.value = 'A';
		dijkstras.startCallback();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
		const calls = mockAm.startNewAnimation.mock.calls;
		const lastCmds = calls[calls.length - 1][0];

		// Check distance map updates (setText)
		const textUpdates = lastCmds.filter(cmd => cmd[0] === act.setText);
		expect(textUpdates.length).toBeGreaterThan(0);
	});

	test('resets animation state via reset', () => {
		dijkstras.startField.value = 'A';
		dijkstras.startCallback();

		dijkstras.reset();
		expect(dijkstras.visitedID).toEqual([]);
	});

	test('triggers start on Enter key in startField', () => {
		dijkstras.startField.value = 'B';
		const event = new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 });
		dijkstras.startField.dispatchEvent(event);

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});
});

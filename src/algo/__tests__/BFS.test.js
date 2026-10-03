import BFS from '../BFS.js';
import { act } from '../../anim/AnimationMain';

describe('BFS', () => {
	let bfs;
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

		bfs = new BFS(mockAm, 800, 600);
	});

	test('initializes controls and default graph', () => {
		expect(bfs.startField).toBeDefined();
		expect(bfs.startButton).toBeDefined();
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('validates empty start vertex in startCallback', () => {
		mockAm.startNewAnimation.mockClear();
		bfs.startField.value = '';
		bfs.startCallback();

		expect(mockAm.startNewAnimation).not.toHaveBeenCalled();
	});

	test('validates out-of-range start vertex in doBFS', () => {
		const cmdsInvalid = bfs.doBFS('Z');
		expect(
			cmdsInvalid.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(p => typeof p === 'string' && p.includes('not a vertex')),
			),
		).toBe(true);
	});

	test('runs BFS traversal successfully from valid start vertex', () => {
		bfs.startField.value = 'A';
		bfs.startCallback();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
		const calls = mockAm.startNewAnimation.mock.calls;
		const lastCmds = calls[calls.length - 1][0];

		// Check that visited color is set on nodes
		const visitedHighlights = lastCmds.filter(cmd => cmd[0] === act.setBackgroundColor);
		expect(visitedHighlights.length).toBeGreaterThan(0);
	});

	test('resets animation state via reset', () => {
		bfs.startField.value = 'A';
		bfs.startCallback();

		bfs.reset();
		expect(bfs.listID).toEqual([]);
		expect(bfs.visitedID).toEqual([]);
	});

	test('triggers start on Enter key in startField', () => {
		bfs.startField.value = 'B';
		const event = new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 });
		bfs.startField.dispatchEvent(event);

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});
});

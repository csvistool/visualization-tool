import DFS from '../DFS.js';
import { act } from '../../anim/AnimationMain';

describe('DFS', () => {
	let dfs;
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

		dfs = new DFS(mockAm, 800, 600);
	});

	test('initializes controls and default graph', () => {
		expect(dfs.startField).toBeDefined();
		expect(dfs.startButton).toBeDefined();
		expect(dfs.physicalStack).toBe(false);

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('switches stack type between recursion and physical stack', () => {
		dfs.stackCallback(true);
		expect(dfs.physicalStack).toBe(true);

		dfs.stackCallback(false);
		expect(dfs.physicalStack).toBe(false);
	});

	test('validates empty start vertex in startCallback', () => {
		mockAm.startNewAnimation.mockClear();
		dfs.startField.value = '';
		dfs.startCallback();

		expect(mockAm.startNewAnimation).not.toHaveBeenCalled();
	});

	test('validates out-of-range start vertex in doDFSRecursive and doDFSStack', () => {
		const cmdsRec = dfs.doDFSRecursive('Z');
		expect(
			cmdsRec.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(p => typeof p === 'string' && p.includes('not a vertex')),
			),
		).toBe(true);

		const cmdsStack = dfs.doDFSStack('Z');
		expect(
			cmdsStack.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(p => typeof p === 'string' && p.includes('not a vertex')),
			),
		).toBe(true);
	});

	test('runs recursive DFS traversal from valid start vertex', () => {
		dfs.startField.value = 'A';
		dfs.startCallback();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
		const calls = mockAm.startNewAnimation.mock.calls;
		const lastCmds = calls[calls.length - 1][0];

		// Check visited background highlights
		const visitedHighlights = lastCmds.filter(cmd => cmd[0] === act.setBackgroundColor);
		expect(visitedHighlights.length).toBeGreaterThan(0);
	});

	test('runs iterative stack-based DFS traversal from valid start vertex', () => {
		dfs.stackCallback(true);
		dfs.startField.value = 'A';
		dfs.startCallback();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
		const calls = mockAm.startNewAnimation.mock.calls;
		const lastCmds = calls[calls.length - 1][0];

		const visitedHighlights = lastCmds.filter(cmd => cmd[0] === act.setBackgroundColor);
		expect(visitedHighlights.length).toBeGreaterThan(0);
	});

	test('resets animation state via reset', () => {
		dfs.startField.value = 'A';
		dfs.startCallback();

		dfs.reset();
		expect(dfs.listID).toEqual([]);
		expect(dfs.visitedID).toEqual([]);
	});

	test('triggers start on Enter key in startField', () => {
		dfs.startField.value = 'B';
		const event = new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 });
		dfs.startField.dispatchEvent(event);

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});
});

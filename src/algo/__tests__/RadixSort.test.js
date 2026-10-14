import RadixSort from '../RadixSort.js';
import { act } from '../../anim/AnimationMain';

describe('RadixSort', () => {
	let radixSort;
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
		};

		radixSort = new RadixSort(mockAm, 800, 600);
	});

	test('initializes controls and default data structures', () => {
		expect(radixSort.resetButton).toBeDefined();
		expect(radixSort.radixSortButton).toBeDefined();

		expect(radixSort.arrayData.length).toBe(30);
		expect(radixSort.counterData.length).toBe(10);
		expect(radixSort.swapData.length).toBe(30);

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('runs radixSortCallback performing 3 passes of counting sort', () => {
		radixSort.radixSortCallback();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
		const calls = mockAm.startNewAnimation.mock.calls;
		const lastCallCmds = calls[calls.length - 1][0];

		// Check that highlight circles and moves were generated
		const highlights = lastCallCmds.filter(cmd => cmd[0] === act.createHighlightCircle);
		expect(highlights.length).toBeGreaterThan(0);

		const moves = lastCallCmds.filter(cmd => cmd[0] === act.move);
		expect(moves.length).toBeGreaterThan(0);
	});

	test('randomizes array on resetCallback', () => {
		const initialData = [...radixSort.arrayData];
		radixSort.resetCallback();

		expect(initialData.length).toBe(30);
		expect(radixSort.arrayData.length).toBe(30);
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('handles sizeChanged re-layout', () => {
		radixSort.sizeChanged(1024, 768);

		expect(radixSort.COUNTER_ARRAY_ELEM_Y).toBe(Math.floor(768 / 2));
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('resets animation state via reset and resetAll', () => {
		radixSort.reset();
		expect(radixSort.commands).toEqual([]);

		radixSort.resetAll();
		expect(mockAm.resetAll).toHaveBeenCalled();
		expect(radixSort.nextIndex).toBe(0);
	});

	test('disables and enables UI controls', () => {
		radixSort.disableUI();
		expect(radixSort.resetButton.disabled).toBe(true);
		expect(radixSort.radixSortButton.disabled).toBe(true);

		radixSort.enableUI();
		expect(radixSort.resetButton.disabled).toBe(false);
		expect(radixSort.radixSortButton.disabled).toBe(false);
	});
});

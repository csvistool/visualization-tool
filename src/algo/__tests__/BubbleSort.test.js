/* eslint-disable no-extend-native */
import BubbleSort from '../BubbleSort.js';
import { act } from '../../anim/AnimationMain';

describe('BubbleSort', () => {
	let bubbleSort;
	let mockAm;

	beforeEach(() => {
		document.body.innerHTML = `
			<div id="AlgorithmSpecificControls"></div>
			<div id="GeneralAnimationControls"></div>
		`;

		// Mock code/english on String.prototype to prevent crashes in toggleLastSwap
		String.prototype.code = Array.from({ length: 25 }, () => [1]);
		String.prototype.english = Array.from({ length: 25 }, () => [1]);

		mockAm = {
			addListener: jest.fn(),
			startNewAnimation: jest.fn(),
			step: jest.fn(),
			clearAll: jest.fn(),
			skipForward: jest.fn(),
			clearHistory: jest.fn(),
			setAllLayers: jest.fn(),
			registerAnimationCallback: jest.fn(),
		};

		bubbleSort = new BubbleSort(mockAm, 800, 600);
	});

	afterEach(() => {
		delete String.prototype.code;
		delete String.prototype.english;
		document.body.innerHTML = '';
	});

	test('initializes controls correctly', () => {
		expect(bubbleSort.controls).toBeDefined();
		expect(bubbleSort.listField).toBeDefined();
		expect(bubbleSort.sortButton).toBeDefined();
		expect(bubbleSort.exampleDropdown).toBeDefined();
		expect(bubbleSort.clearButton).toBeDefined();
		expect(bubbleSort.lastSwapCheckbox).toBeDefined();
		expect(bubbleSort.compCount).toBe(0);
		expect(bubbleSort.swapCount).toBe(0);
	});

	test('setup and reset initialize and reset state properly', () => {
		bubbleSort.compCount = 10;
		bubbleSort.swapCount = 5;
		bubbleSort.reset();
		expect(bubbleSort.compCount).toBe(0);
		expect(bubbleSort.swapCount).toBe(0);
		expect(bubbleSort.arrayData).toEqual([]);
		expect(bubbleSort.arrayID).toEqual([]);
	});

	test('toggleLastSwap modifies commands and toggles optimization flag', () => {
		const clearSpy = jest.spyOn(bubbleSort, 'implementAction');
		bubbleSort.toggleLastSwap();
		expect(clearSpy).toHaveBeenCalled();
	});

	test('validates invalid inputs in sort', () => {
		// Empty array
		const cmdsEmpty = bubbleSort.sort([]);
		expect(
			cmdsEmpty.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p => typeof p === 'string' && p.includes('Data must contain integers'),
					),
			),
		).toBe(true);

		// > 18 elements
		const largeList = Array.from({ length: 19 }, (_, i) => String(i));
		const cmdsLarge = bubbleSort.sort(largeList);
		expect(
			cmdsLarge.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p => typeof p === 'string' && p.includes('Data cannot contain more than'),
					),
			),
		).toBe(true);

		// Element > 999
		const cmdsOver999 = bubbleSort.sort(['5', '1000', '2']);
		expect(
			cmdsOver999.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p =>
							typeof p === 'string' &&
							p.includes('Data cannot contain non-numeric values or numbers'),
					),
			),
		).toBe(true);

		// Non-numeric element
		const cmdsNaN = bubbleSort.sort(['5', 'abc', '2']);
		expect(
			cmdsNaN.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p =>
							typeof p === 'string' &&
							p.includes('Data cannot contain non-numeric values or numbers'),
					),
			),
		).toBe(true);
	});

	test('sort sorts an unsorted list with comparison and swap counting', () => {
		const cmds = bubbleSort.sort(['4', '3', '2', '1']);
		expect(cmds.length).toBeGreaterThan(0);
		expect(bubbleSort.compCount).toBeGreaterThan(0);
		expect(bubbleSort.swapCount).toBeGreaterThan(0);
		// Check that elements were sorted
		expect(bubbleSort.displayData).toEqual(['1', '2', '3', '4']);
	});

	test('sort handles an already sorted list with early exit', () => {
		const cmds = bubbleSort.sort(['1', '2', '3', '4']);
		expect(cmds.length).toBeGreaterThan(0);
		expect(bubbleSort.swapCount).toBe(0);
		expect(bubbleSort.displayData).toEqual(['1', '2', '3', '4']);
	});

	test('sortCallback splits listField and triggers sort via implementAction', () => {
		const implementActionSpy = jest.spyOn(bubbleSort, 'implementAction');
		bubbleSort.listField.value = '3,1,2';

		bubbleSort.sortCallback();

		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('exampleCallback handles predefined examples and Random', () => {
		bubbleSort.exampleDropdown.value = '9,8,7,6,5,4,3,2,1';
		bubbleSort.exampleCallback();
		expect(bubbleSort.listField.value).toBe('9,8,7,6,5,4,3,2,1');

		bubbleSort.exampleDropdown.value = 'Random';
		bubbleSort.exampleCallback();
		expect(bubbleSort.listField.value.length).toBeGreaterThan(0);

		// Empty value
		bubbleSort.exampleDropdown.value = '';
		bubbleSort.exampleCallback();
	});

	test('clear and clearCallback reset IDs and inputs', () => {
		bubbleSort.listField.value = '3,2,1';
		bubbleSort.arrayID = [1, 2, 3];
		bubbleSort.arrayData = [3, 2, 1];

		const cmds = bubbleSort.clear(false);
		expect(cmds.length).toBeGreaterThan(0);
		expect(bubbleSort.listField.value).toBe('');
		expect(bubbleSort.compCount).toBe(0);
		expect(bubbleSort.swapCount).toBe(0);

		// keepInput preserves listField value
		bubbleSort.listField.value = '5,4';
		bubbleSort.clear(true);
		expect(bubbleSort.listField.value).toBe('5,4');

		const implementActionSpy = jest.spyOn(bubbleSort, 'implementAction');
		bubbleSort.clearCallback();
		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('disableUI and enableUI update controls disabled status', () => {
		bubbleSort.disableUI();
		bubbleSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		bubbleSort.enableUI();
		bubbleSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('setURLData handles lastSwap and data searchParams', () => {
		const toggleLastSwapSpy = jest.spyOn(bubbleSort, 'toggleLastSwap');
		const sortCallbackSpy = jest.spyOn(bubbleSort, 'sortCallback');

		const params = new URLSearchParams('lastSwap=0&data=5,3,1');
		bubbleSort.setURLData(params);

		expect(toggleLastSwapSpy).toHaveBeenCalled();
		expect(bubbleSort.lastSwapCheckbox.checked).toBe(false);
		expect(bubbleSort.listField.value).toBe('5,3,1');
		expect(sortCallbackSpy).toHaveBeenCalled();
	});
});

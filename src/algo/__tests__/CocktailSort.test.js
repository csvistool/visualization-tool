/* eslint-disable no-extend-native */
import CocktailSort from '../CocktailSort.js';
import { act } from '../../anim/AnimationMain';

describe('CocktailSort', () => {
	let cocktailSort;
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

		cocktailSort = new CocktailSort(mockAm, 800, 600);
	});

	afterEach(() => {
		delete String.prototype.code;
		delete String.prototype.english;
		document.body.innerHTML = '';
	});

	test('initializes controls correctly', () => {
		expect(cocktailSort.controls).toBeDefined();
		expect(cocktailSort.listField).toBeDefined();
		expect(cocktailSort.sortButton).toBeDefined();
		expect(cocktailSort.exampleDropdown).toBeDefined();
		expect(cocktailSort.clearButton).toBeDefined();
		expect(cocktailSort.lastSwapCheckbox).toBeDefined();
		expect(cocktailSort.compCount).toBe(0);
		expect(cocktailSort.swapCount).toBe(0);
	});

	test('setup and reset initialize and reset state properly', () => {
		cocktailSort.compCount = 8;
		cocktailSort.swapCount = 4;
		cocktailSort.reset();
		expect(cocktailSort.compCount).toBe(0);
		expect(cocktailSort.swapCount).toBe(0);
		expect(cocktailSort.arrayData).toEqual([]);
		expect(cocktailSort.arrayID).toEqual([]);
	});

	test('toggleLastSwap modifies commands and toggles optimization flag', () => {
		const clearSpy = jest.spyOn(cocktailSort, 'implementAction');
		cocktailSort.toggleLastSwap();
		expect(clearSpy).toHaveBeenCalled();
	});

	test('validates invalid inputs in sort', () => {
		// Empty array
		const cmdsEmpty = cocktailSort.sort([]);
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
		const cmdsLarge = cocktailSort.sort(largeList);
		expect(
			cmdsLarge.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p => typeof p === 'string' && p.includes('Data cannot contain more than'),
					),
			),
		).toBe(true);

		// Element > 999 or NaN
		const cmdsOver999 = cocktailSort.sort(['5', '1000', '2']);
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

		const cmdsNaN = cocktailSort.sort(['5', 'xyz', '2']);
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

	test('sort sorts an unsorted list in both directions', () => {
		const cmds = cocktailSort.sort(['5', '1', '4', '2', '8']);
		expect(cmds.length).toBeGreaterThan(0);
		expect(cocktailSort.compCount).toBeGreaterThan(0);
		expect(cocktailSort.swapCount).toBeGreaterThan(0);
		expect(cocktailSort.displayData).toEqual(['1', '2', '4', '5', '8']);
	});

	test('sort handles an already sorted list with early exit', () => {
		const cmds = cocktailSort.sort(['1', '2', '3', '4']);
		expect(cmds.length).toBeGreaterThan(0);
		expect(cocktailSort.swapCount).toBe(0);
		expect(cocktailSort.displayData).toEqual(['1', '2', '3', '4']);
	});

	test('sortCallback splits listField and triggers sort via implementAction', () => {
		const implementActionSpy = jest.spyOn(cocktailSort, 'implementAction');
		cocktailSort.listField.value = '4,2,3';

		cocktailSort.sortCallback();

		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('exampleCallback handles predefined examples and Random', () => {
		cocktailSort.exampleDropdown.value = '9,8,7,6,5,4,3,2,1';
		cocktailSort.exampleCallback();
		expect(cocktailSort.listField.value).toBe('9,8,7,6,5,4,3,2,1');

		cocktailSort.exampleDropdown.value = 'Random';
		cocktailSort.exampleCallback();
		expect(cocktailSort.listField.value.length).toBeGreaterThan(0);

		// Empty value
		cocktailSort.exampleDropdown.value = '';
		cocktailSort.exampleCallback();
	});

	test('clear and clearCallback reset IDs and inputs', () => {
		cocktailSort.listField.value = '3,2,1';
		cocktailSort.arrayID = [1, 2, 3];
		cocktailSort.arrayData = [3, 2, 1];

		const cmds = cocktailSort.clear(false);
		expect(cmds.length).toBeGreaterThan(0);
		expect(cocktailSort.listField.value).toBe('');
		expect(cocktailSort.compCount).toBe(0);
		expect(cocktailSort.swapCount).toBe(0);

		// keepInput preserves listField value
		cocktailSort.listField.value = '5,4';
		cocktailSort.clear(true);
		expect(cocktailSort.listField.value).toBe('5,4');

		const implementActionSpy = jest.spyOn(cocktailSort, 'implementAction');
		cocktailSort.clearCallback();
		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('disableUI and enableUI update controls disabled status', () => {
		cocktailSort.disableUI();
		cocktailSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		cocktailSort.enableUI();
		cocktailSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('setURLData handles lastSwap and data searchParams', () => {
		const toggleLastSwapSpy = jest.spyOn(cocktailSort, 'toggleLastSwap');
		const sortCallbackSpy = jest.spyOn(cocktailSort, 'sortCallback');

		const params = new URLSearchParams('lastSwap=0&data=3,1,2');
		cocktailSort.setURLData(params);

		expect(toggleLastSwapSpy).toHaveBeenCalled();
		expect(cocktailSort.lastSwapCheckbox.checked).toBe(false);
		expect(cocktailSort.listField.value).toBe('3,1,2');
		expect(sortCallbackSpy).toHaveBeenCalled();
	});
});

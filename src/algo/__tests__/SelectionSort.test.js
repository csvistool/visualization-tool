/* eslint-disable no-extend-native */
import SelectionSort from '../SelectionSort.js';
import { act } from '../../anim/AnimationMain';

describe('SelectionSort', () => {
	let selectionSort;
	let mockAm;

	beforeEach(() => {
		document.body.innerHTML = `
			<div id="AlgorithmSpecificControls"></div>
			<div id="GeneralAnimationControls"></div>
		`;

		// Mock code/english on String.prototype to prevent crashes in minCallback / maxCallback
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

		selectionSort = new SelectionSort(mockAm, 800, 600);
	});

	afterEach(() => {
		delete String.prototype.code;
		delete String.prototype.english;
		document.body.innerHTML = '';
	});

	test('initializes controls correctly', () => {
		expect(selectionSort.controls).toBeDefined();
		expect(selectionSort.listField).toBeDefined();
		expect(selectionSort.sortButton).toBeDefined();
		expect(selectionSort.exampleDropdown).toBeDefined();
		expect(selectionSort.clearButton).toBeDefined();
		expect(selectionSort.minButton).toBeDefined();
		expect(selectionSort.maxButton).toBeDefined();
		expect(selectionSort.isMin).toBe(false);
		expect(selectionSort.compCount).toBe(0);
		expect(selectionSort.swapCount).toBe(0);
	});

	test('setup and reset initialize and reset state properly', () => {
		selectionSort.compCount = 10;
		selectionSort.swapCount = 5;
		selectionSort.reset();
		expect(selectionSort.compCount).toBe(0);
		expect(selectionSort.swapCount).toBe(0);
		expect(selectionSort.arrayData).toEqual([]);
		expect(selectionSort.arrayID).toEqual([]);
	});

	test('minCallback and maxCallback toggle isMin flag', () => {
		selectionSort.minCallback();
		expect(selectionSort.isMin).toBe(true);

		selectionSort.maxCallback();
		expect(selectionSort.isMin).toBe(false);
	});

	test('validates invalid inputs in sort', () => {
		// Empty array
		const cmdsEmpty = selectionSort.sort([]);
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
		const cmdsLarge = selectionSort.sort(largeList);
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
		const cmdsOver999 = selectionSort.sort(['5', '1000', '2']);
		expect(
			cmdsOver999.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p =>
							typeof p === 'string' &&
							p.includes('Data cannot contain non-numeric values or numbers > 999'),
					),
			),
		).toBe(true);

		const cmdsNaN = selectionSort.sort(['5', 'xyz', '2']);
		expect(
			cmdsNaN.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p =>
							typeof p === 'string' &&
							p.includes('Data cannot contain non-numeric values or numbers > 999'),
					),
			),
		).toBe(true);
	});

	test('sort sorts array selecting maximum elements (isMin === false)', () => {
		selectionSort.isMin = false;
		const cmds = selectionSort.sort(['4', '1', '3', '2']);
		expect(cmds.length).toBeGreaterThan(0);
		expect(selectionSort.compCount).toBeGreaterThan(0);
		expect(selectionSort.displayData).toEqual(['1', '2', '3', '4']);
	});

	test('sort sorts array selecting minimum elements (isMin === true)', () => {
		selectionSort.isMin = true;
		const cmds = selectionSort.sort(['4', '1', '3', '2']);
		expect(cmds.length).toBeGreaterThan(0);
		expect(selectionSort.compCount).toBeGreaterThan(0);
		expect(selectionSort.displayData).toEqual(['1', '2', '3', '4']);
	});

	test('sortCallback splits listField and triggers sort via implementAction', () => {
		const implementActionSpy = jest.spyOn(selectionSort, 'implementAction');
		selectionSort.listField.value = '4,1,3';

		selectionSort.sortCallback();

		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('exampleCallback handles predefined examples and Random', () => {
		selectionSort.exampleDropdown.value = '9,8,7,6,5,4,3,2,1';
		selectionSort.exampleCallback();
		expect(selectionSort.listField.value).toBe('9,8,7,6,5,4,3,2,1');

		selectionSort.exampleDropdown.value = 'Random';
		selectionSort.exampleCallback();
		expect(selectionSort.listField.value.length).toBeGreaterThan(0);

		// Empty value
		selectionSort.exampleDropdown.value = '';
		selectionSort.exampleCallback();
	});

	test('clear and clearCallback reset IDs and inputs', () => {
		selectionSort.listField.value = '3,2,1';
		selectionSort.arrayID = [1, 2, 3];
		selectionSort.arrayData = [3, 2, 1];

		const cmds = selectionSort.clear(false);
		expect(cmds.length).toBeGreaterThan(0);
		expect(selectionSort.listField.value).toBe('');
		expect(selectionSort.compCount).toBe(0);
		expect(selectionSort.swapCount).toBe(0);

		// keepInput preserves listField value
		selectionSort.listField.value = '5,4';
		selectionSort.clear(true);
		expect(selectionSort.listField.value).toBe('5,4');

		const implementActionSpy = jest.spyOn(selectionSort, 'implementAction');
		selectionSort.clearCallback();
		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('disableUI and enableUI update controls disabled status', () => {
		selectionSort.disableUI();
		selectionSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		selectionSort.enableUI();
		selectionSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('setURLData handles type and data searchParams', () => {
		const sortCallbackSpy = jest.spyOn(selectionSort, 'sortCallback');

		const paramsMin = new URLSearchParams('type=min&data=3,1,2');
		selectionSort.setURLData(paramsMin);

		expect(selectionSort.isMin).toBe(true);
		expect(selectionSort.minButton.checked).toBe(true);
		expect(selectionSort.listField.value).toBe('3,1,2');
		expect(sortCallbackSpy).toHaveBeenCalled();

		const paramsMax = new URLSearchParams('type=max&data=2,1');
		selectionSort.setURLData(paramsMax);
		expect(selectionSort.isMin).toBe(false);
		expect(selectionSort.maxButton.checked).toBe(true);
	});
});

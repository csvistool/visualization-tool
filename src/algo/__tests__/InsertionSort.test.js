import InsertionSort from '../InsertionSort.js';
import { act } from '../../anim/AnimationMain';

describe('InsertionSort', () => {
	let insertionSort;
	let mockAm;

	beforeEach(() => {
		document.body.innerHTML = `
			<div id="AlgorithmSpecificControls"></div>
			<div id="GeneralAnimationControls"></div>
		`;

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

		insertionSort = new InsertionSort(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls correctly', () => {
		expect(insertionSort.controls).toBeDefined();
		expect(insertionSort.listField).toBeDefined();
		expect(insertionSort.sortButton).toBeDefined();
		expect(insertionSort.exampleDropdown).toBeDefined();
		expect(insertionSort.clearButton).toBeDefined();
		expect(insertionSort.compCount).toBe(0);
		expect(insertionSort.swapCount).toBe(0);
	});

	test('setup and reset initialize and reset state properly', () => {
		insertionSort.compCount = 6;
		insertionSort.swapCount = 3;
		insertionSort.reset();
		expect(insertionSort.compCount).toBe(0);
		expect(insertionSort.swapCount).toBe(0);
		expect(insertionSort.arrayData).toEqual([]);
		expect(insertionSort.arrayID).toEqual([]);
	});

	test('validates invalid inputs in sort', () => {
		// Empty array
		const cmdsEmpty = insertionSort.sort([]);
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
		const cmdsLarge = insertionSort.sort(largeList);
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
		const cmdsOver999 = insertionSort.sort(['5', '1000', '2']);
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

		const cmdsNaN = insertionSort.sort(['5', 'xyz', '2']);
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

	test('sort sorts an unsorted array via insertion into sorted prefix', () => {
		const cmds = insertionSort.sort(['4', '2', '5', '1', '3']);
		expect(cmds.length).toBeGreaterThan(0);
		expect(insertionSort.compCount).toBeGreaterThan(0);
		expect(insertionSort.displayData).toEqual(['1', '2', '3', '4', '5']);
	});

	test('sort handles an already sorted array efficiently', () => {
		const cmds = insertionSort.sort(['1', '2', '3', '4']);
		expect(cmds.length).toBeGreaterThan(0);
		expect(insertionSort.displayData).toEqual(['1', '2', '3', '4']);
	});

	test('sortCallback splits listField and triggers sort via implementAction', () => {
		const implementActionSpy = jest.spyOn(insertionSort, 'implementAction');
		insertionSort.listField.value = '3,1,2';

		insertionSort.sortCallback();

		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('exampleCallback handles predefined examples and Random', () => {
		insertionSort.exampleDropdown.value = '9,8,7,6,5,4,3,2,1';
		insertionSort.exampleCallback();
		expect(insertionSort.listField.value).toBe('9,8,7,6,5,4,3,2,1');

		insertionSort.exampleDropdown.value = 'Random';
		insertionSort.exampleCallback();
		expect(insertionSort.listField.value.length).toBeGreaterThan(0);

		// Empty value
		insertionSort.exampleDropdown.value = '';
		insertionSort.exampleCallback();
	});

	test('clear and clearCallback reset IDs and inputs', () => {
		insertionSort.listField.value = '3,2,1';
		insertionSort.arrayID = [1, 2, 3];
		insertionSort.arrayData = [3, 2, 1];

		const cmds = insertionSort.clear(false);
		expect(cmds.length).toBeGreaterThan(0);
		expect(insertionSort.listField.value).toBe('');
		expect(insertionSort.compCount).toBe(0);
		expect(insertionSort.swapCount).toBe(0);

		// keepInput preserves listField value
		insertionSort.listField.value = '5,4';
		insertionSort.clear(true);
		expect(insertionSort.listField.value).toBe('5,4');

		const implementActionSpy = jest.spyOn(insertionSort, 'implementAction');
		insertionSort.clearCallback();
		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('disableUI and enableUI update controls disabled status', () => {
		insertionSort.disableUI();
		insertionSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		insertionSort.enableUI();
		insertionSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('setURLData populates listField and triggers sort', () => {
		const sortCallbackSpy = jest.spyOn(insertionSort, 'sortCallback');
		const params = new URLSearchParams('data=4,2,6');

		insertionSort.setURLData(params);

		expect(insertionSort.listField.value).toBe('4,2,6');
		expect(sortCallbackSpy).toHaveBeenCalled();
	});
});

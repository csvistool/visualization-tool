import MergeSort from '../MergeSort.js';
import { act } from '../../anim/AnimationMain';

describe('MergeSort', () => {
	let mergeSort;
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

		mergeSort = new MergeSort(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls correctly', () => {
		expect(mergeSort.controls).toBeDefined();
		expect(mergeSort.listField).toBeDefined();
		expect(mergeSort.sortButton).toBeDefined();
		expect(mergeSort.exampleDropdown).toBeDefined();
		expect(mergeSort.clearButton).toBeDefined();
		expect(mergeSort.compCount).toBe(0);
	});

	test('setup and reset initialize and reset state properly', () => {
		mergeSort.compCount = 9;
		mergeSort.reset();
		expect(mergeSort.compCount).toBe(0);
		expect(mergeSort.arrayData).toEqual([]);
		expect(mergeSort.arrayID).toEqual([]);
	});

	test('validates invalid inputs in sort', () => {
		// Empty array
		const cmdsEmpty = mergeSort.sort([]);
		expect(
			cmdsEmpty.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p => typeof p === 'string' && p.includes('Data must contain integers'),
					),
			),
		).toBe(true);

		// > 15 elements (MAX_ARRAY_SIZE is 15 in MergeSort)
		const largeList = Array.from({ length: 16 }, (_, i) => String(i));
		const cmdsLarge = mergeSort.sort(largeList);
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
		const cmdsOver999 = mergeSort.sort(['5', '1000', '2']);
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

		const cmdsNaN = mergeSort.sort(['5', 'xyz', '2']);
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

	test('sort sorts an unsorted list via recursive divide and conquer merge', () => {
		const cmds = mergeSort.sort(['5', '2', '8', '1', '9']);
		expect(cmds.length).toBeGreaterThan(0);
		expect(mergeSort.compCount).toBeGreaterThan(0);
		expect(mergeSort.displayData).toEqual(['1', '2', '5', '8', '9']);
	});

	test('sort handles an already sorted array', () => {
		const cmds = mergeSort.sort(['1', '2', '3', '4']);
		expect(cmds.length).toBeGreaterThan(0);
		expect(mergeSort.displayData).toEqual(['1', '2', '3', '4']);
	});

	test('sortCallback splits listField and triggers sort via implementAction', () => {
		const implementActionSpy = jest.spyOn(mergeSort, 'implementAction');
		mergeSort.listField.value = '4,1,2';

		mergeSort.sortCallback();

		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('exampleCallback handles predefined examples and Random', () => {
		mergeSort.exampleDropdown.value = '9,8,7,6,5,4,3,2,1';
		mergeSort.exampleCallback();
		expect(mergeSort.listField.value).toBe('9,8,7,6,5,4,3,2,1');

		mergeSort.exampleDropdown.value = 'Random';
		mergeSort.exampleCallback();
		expect(mergeSort.listField.value.length).toBeGreaterThan(0);

		// Empty value
		mergeSort.exampleDropdown.value = '';
		mergeSort.exampleCallback();
	});

	test('clear and clearCallback reset IDs and inputs', () => {
		mergeSort.listField.value = '3,2,1';
		mergeSort.arrayID = [1, 2, 3];
		mergeSort.arrayData = [3, 2, 1];

		const cmds = mergeSort.clear(false);
		expect(cmds.length).toBeGreaterThan(0);
		expect(mergeSort.listField.value).toBe('');
		expect(mergeSort.compCount).toBe(0);

		// keepInput preserves listField value
		mergeSort.listField.value = '5,4';
		mergeSort.clear(true);
		expect(mergeSort.listField.value).toBe('5,4');

		const implementActionSpy = jest.spyOn(mergeSort, 'implementAction');
		mergeSort.clearCallback();
		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('disableUI and enableUI update controls disabled status', () => {
		mergeSort.disableUI();
		mergeSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		mergeSort.enableUI();
		mergeSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('setURLData populates listField and triggers sort', () => {
		const sortCallbackSpy = jest.spyOn(mergeSort, 'sortCallback');
		const params = new URLSearchParams('data=5,1,3');

		mergeSort.setURLData(params);

		expect(mergeSort.listField.value).toBe('5,1,3');
		expect(sortCallbackSpy).toHaveBeenCalled();
	});
});

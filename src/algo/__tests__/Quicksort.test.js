import Quicksort from '../Quicksort.js';
import { act } from '../../anim/AnimationMain';

describe('Quicksort', () => {
	let quicksort;
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

		quicksort = new Quicksort(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls correctly', () => {
		expect(quicksort.controls).toBeDefined();
		expect(quicksort.listField).toBeDefined();
		expect(quicksort.sortButton).toBeDefined();
		expect(quicksort.exampleDropdown).toBeDefined();
		expect(quicksort.clearButton).toBeDefined();
		expect(quicksort.randomPivotSelect).toBeDefined();
		expect(quicksort.perfectPivotSelect).toBeDefined();
		expect(quicksort.minPivotSelect).toBeDefined();
		expect(quicksort.setPivotSelect).toBeDefined();
		expect(quicksort.pivotType).toBe('random');
		expect(quicksort.compCount).toBe(0);
		expect(quicksort.swapCount).toBe(0);
	});

	test('setup and reset initialize and reset state properly', () => {
		quicksort.compCount = 10;
		quicksort.swapCount = 5;
		quicksort.reset();
		expect(quicksort.compCount).toBe(0);
		expect(quicksort.swapCount).toBe(0);
		expect(quicksort.arrayData).toEqual([]);
		expect(quicksort.arrayID).toEqual([]);
	});

	test('setPivotType changes pivotType and updates group visibility', () => {
		quicksort.setPivotType('perfect');
		expect(quicksort.pivotType).toBe('perfect');

		quicksort.setPivotType('min');
		expect(quicksort.pivotType).toBe('min');

		quicksort.setPivotType('set');
		expect(quicksort.pivotType).toBe('set');

		quicksort.setPivotType('random');
		expect(quicksort.pivotType).toBe('random');
	});

	test('validates invalid inputs in sort', () => {
		// Empty array
		const cmdsEmpty = quicksort.sort([]);
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
		const cmdsLarge = quicksort.sort(largeList);
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
		const cmdsOver999 = quicksort.sort(['5', '1000', '2']);
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

		const cmdsNaN = quicksort.sort(['5', 'xyz', '2']);
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

	test('sort sorts an unsorted list with random pivot', () => {
		quicksort.setPivotType('random');
		const cmds = quicksort.sort(['5', '2', '8', '1', '9']);
		expect(cmds.length).toBeGreaterThan(0);
		expect(quicksort.compCount).toBeGreaterThan(0);
		expect(quicksort.arrayData).toEqual([1, 2, 5, 8, 9]);
	});

	test('sort sorts an unsorted list with perfect pivot', () => {
		quicksort.setPivotType('perfect');
		const cmds = quicksort.sort(['5', '2', '8', '1', '9']);
		expect(cmds.length).toBeGreaterThan(0);
		expect(quicksort.arrayData).toEqual([1, 2, 5, 8, 9]);
	});

	test('sort sorts an unsorted list with min element pivot', () => {
		quicksort.setPivotType('min');
		const cmds = quicksort.sort(['5', '2', '8', '1', '9']);
		expect(cmds.length).toBeGreaterThan(0);
		expect(quicksort.arrayData).toEqual([1, 2, 5, 8, 9]);
	});

	test('sort sorts an unsorted list with duplicate elements', () => {
		quicksort.setPivotType('min');
		const cmds = quicksort.sort(['3', '1', '3', '2']);
		expect(cmds.length).toBeGreaterThan(0);
		expect(quicksort.arrayData).toEqual([1, 2, 3, 3]);
		// Check that disambiguating suffix was created
		expect(quicksort.displayData.some(d => d.includes('a') || d.includes('b'))).toBe(true);
	});

	test('sortCallback splits listField and triggers sort via implementAction', () => {
		const implementActionSpy = jest.spyOn(quicksort, 'implementAction');
		quicksort.listField.value = '4,1,2';

		quicksort.sortCallback();

		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('exampleCallback handles predefined examples and Random', () => {
		quicksort.exampleDropdown.value = '9,8,7,6,5,4,3,2,1';
		quicksort.exampleCallback();
		expect(quicksort.listField.value).toBe('9,8,7,6,5,4,3,2,1');

		quicksort.exampleDropdown.value = 'Random';
		quicksort.exampleCallback();
		expect(quicksort.listField.value.length).toBeGreaterThan(0);

		// Empty value
		quicksort.exampleDropdown.value = '';
		quicksort.exampleCallback();
	});

	test('clear and clearCallback reset IDs and inputs', () => {
		quicksort.listField.value = '3,2,1';
		quicksort.arrayID = [1, 2, 3];
		quicksort.arrayData = [3, 2, 1];

		const cmds = quicksort.clear(false);
		expect(cmds.length).toBeGreaterThan(0);
		expect(quicksort.listField.value).toBe('');
		expect(quicksort.compCount).toBe(0);
		expect(quicksort.swapCount).toBe(0);

		// keepInput preserves listField value
		quicksort.listField.value = '5,4';
		quicksort.clear(true);
		expect(quicksort.listField.value).toBe('5,4');

		const implementActionSpy = jest.spyOn(quicksort, 'implementAction');
		quicksort.clearCallback();
		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('disableUI and enableUI update controls disabled status', () => {
		quicksort.disableUI();
		quicksort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		quicksort.enableUI();
		quicksort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('setURLData handles pivot and data searchParams', () => {
		const sortCallbackSpy = jest.spyOn(quicksort, 'sortCallback');
		const setPivotTypeSpy = jest.spyOn(quicksort, 'setPivotType');

		const params = new URLSearchParams('pivot=perfect&data=5,1,3');
		quicksort.setURLData(params);

		expect(setPivotTypeSpy).toHaveBeenCalledWith('perfect');
		expect(quicksort.listField.value).toBe('5,1,3');
		expect(sortCallbackSpy).toHaveBeenCalled();
	});
});

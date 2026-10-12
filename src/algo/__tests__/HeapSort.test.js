import HeapSort from '../HeapSort.js';
import { act } from '../../anim/AnimationMain';

describe('HeapSort', () => {
	let heapSort;
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

		heapSort = new HeapSort(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls correctly', () => {
		expect(heapSort.controls).toBeDefined();
		expect(heapSort.listField).toBeDefined();
		expect(heapSort.sortButton).toBeDefined();
		expect(heapSort.exampleDropdown).toBeDefined();
		expect(heapSort.clearButton).toBeDefined();
		expect(heapSort.arrayData).toEqual([]);
	});

	test('setup and reset initialize and reset state properly', () => {
		heapSort.currentHeapSize = 5;
		heapSort.arrayData = [1, 2];
		heapSort.reset();
		expect(heapSort.currentHeapSize).toBe(0);
		expect(heapSort.arrayData).toEqual([]);
		expect(heapSort.arrayID).toEqual([]);
		expect(heapSort.heapArrayData).toEqual([]);
		expect(heapSort.heapTreeObj).toEqual([]);
	});

	test('validates invalid inputs in sort', () => {
		// Empty array
		const cmdsEmpty = heapSort.sort([]);
		expect(
			cmdsEmpty.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p => typeof p === 'string' && p.includes('Data must contain integers'),
					),
			),
		).toBe(true);

		// > 15 elements (MAX_ARRAY_SIZE is 15 in HeapSort)
		const largeList = Array.from({ length: 16 }, (_, i) => String(i));
		const cmdsLarge = heapSort.sort(largeList);
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
		const cmdsOver999 = heapSort.sort(['5', '1000', '2']);
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

		const cmdsNaN = heapSort.sort(['5', 'xyz', '2']);
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

	test('sort builds heap and extracts elements into sorted array', () => {
		const cmds = heapSort.sort(['5', '2', '8', '1', '9']);
		expect(cmds.length).toBeGreaterThan(0);
		// Check that rectangles for heap elements were created
		expect(cmds.some(cmd => cmd[0] === act.createRectangle)).toBe(true);
	});

	test('sort handles an already sorted array', () => {
		const cmds = heapSort.sort(['1', '2', '3', '4']);
		expect(cmds.length).toBeGreaterThan(0);
		expect(cmds.some(cmd => cmd[0] === act.createRectangle)).toBe(true);
	});

	test('sortCallback splits listField and triggers sort via implementAction', () => {
		const implementActionSpy = jest.spyOn(heapSort, 'implementAction');
		heapSort.listField.value = '4,1,2';

		heapSort.sortCallback();

		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('exampleCallback handles predefined examples and Random', () => {
		heapSort.exampleDropdown.value = '1,2,3,4,5,6,7,8,9';
		heapSort.exampleCallback();
		expect(heapSort.listField.value).toBe('1,2,3,4,5,6,7,8,9');

		heapSort.exampleDropdown.value = 'Random';
		heapSort.exampleCallback();
		expect(heapSort.listField.value.length).toBeGreaterThan(0);

		// Empty value
		heapSort.exampleDropdown.value = '';
		heapSort.exampleCallback();
	});

	test('clear and clearCallback reset IDs and inputs', () => {
		heapSort.listField.value = '3,2,1';
		heapSort.arrayID = [1, 2, 3];
		heapSort.arrayData = [3, 2, 1];
		heapSort.heapArrayID = [4, 5];
		heapSort.heapArrayLabelID = [6, 7];
		heapSort.heapTreeObj = [8, 9];

		const cmds = heapSort.clear(false);
		expect(cmds.length).toBeGreaterThan(0);
		expect(heapSort.listField.value).toBe('');
		expect(heapSort.arrayData).toEqual([]);

		// keepInput preserves listField value
		heapSort.listField.value = '5,4';
		heapSort.clear(true);
		expect(heapSort.listField.value).toBe('5,4');

		const implementActionSpy = jest.spyOn(heapSort, 'implementAction');
		heapSort.clearCallback();
		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('disableUI and enableUI update controls disabled status', () => {
		heapSort.disableUI();
		heapSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		heapSort.enableUI();
		heapSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('setURLData populates listField and triggers sort', () => {
		const sortCallbackSpy = jest.spyOn(heapSort, 'sortCallback');
		const params = new URLSearchParams('data=5,1,3');

		heapSort.setURLData(params);

		expect(heapSort.listField.value).toBe('5,1,3');
		expect(sortCallbackSpy).toHaveBeenCalled();
	});
});

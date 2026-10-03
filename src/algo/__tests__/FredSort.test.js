import FredSort from '../FredSort.js';
import { act } from '../../anim/AnimationMain';

describe('FredSort', () => {
	let fredSort;
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
			setInfoText: jest.fn(),
		};

		fredSort = new FredSort(mockAm, 800, 600);
	});

	test('initializes controls and labels', () => {
		expect(fredSort.listField).toBeDefined();
		expect(fredSort.sortButton).toBeDefined();
		expect(fredSort.exampleDropdown).toBeDefined();
		expect(fredSort.clearButton).toBeDefined();
		expect(fredSort.compCount).toBe(0);

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('validates invalid inputs in sort', () => {
		// Empty array
		const cmdsEmpty = fredSort.sort([]);
		expect(
			cmdsEmpty.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p => typeof p === 'string' && p.includes('Data must contain integers'),
					),
			),
		).toBe(true);

		// > 15 elements
		const largeList = Array.from({ length: 16 }, (_, i) => String(i));
		const cmdsLarge = fredSort.sort(largeList);
		expect(
			cmdsLarge.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p =>
							typeof p === 'string' &&
							p.includes('Data cannot contain more than 15 numbers'),
					),
			),
		).toBe(true);

		// Non-numeric or > 999
		const cmdsInvalid = fredSort.sort(['abc', '1000']);
		expect(
			cmdsInvalid.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(p => typeof p === 'string' && p.includes('non-numeric values')),
			),
		).toBe(true);
	});

	test('sorts list by partitioning and merging', () => {
		fredSort.listField.value = '4,2,7,1';
		fredSort.sortCallback();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
		expect(fredSort.arrayData).toEqual([1, 2, 4, 7]);
	});

	test('handles duplicate values by appending distinguishing letters', () => {
		fredSort.listField.value = '3,3,1';
		fredSort.sortCallback();

		const calls = mockAm.startNewAnimation.mock.calls;
		const lastCmds = calls[calls.length - 1][0];
		const rects = lastCmds.filter(cmd => cmd[0] === act.createRectangle);

		expect(rects.some(r => r[1].includes('3a'))).toBe(true);
	});

	test('selects preset examples and random arrays', () => {
		fredSort.exampleDropdown.value = '1,2,3,4,5,6,7,8,9';
		fredSort.exampleCallback();
		expect(fredSort.listField.value).toBe('1,2,3,4,5,6,7,8,9');

		fredSort.exampleDropdown.value = 'Random';
		fredSort.exampleCallback();
		expect(fredSort.listField.value.length).toBeGreaterThan(0);

		fredSort.exampleDropdown.value = '';
		fredSort.exampleCallback();
	});

	test('clears and resets visualization state', () => {
		fredSort.listField.value = '9,5,1';
		fredSort.sortCallback();

		fredSort.clearCallback();
		expect(fredSort.listField.value).toBe('');
		expect(fredSort.arrayData).toEqual([]);

		fredSort.reset();
		expect(fredSort.compCount).toBe(0);
	});

	test('sets URL parameters for data', () => {
		const searchParams = new URLSearchParams('data=5,3,9');
		fredSort.setURLData(searchParams);

		expect(fredSort.arrayData).toEqual([3, 5, 9]);
	});

	test('disables and enables UI controls', () => {
		fredSort.disableUI();
		fredSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		fredSort.enableUI();
		fredSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('triggers sort on Enter key in listField', () => {
		fredSort.listField.value = '2,1';
		const event = new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 });
		fredSort.listField.dispatchEvent(event);

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});
});

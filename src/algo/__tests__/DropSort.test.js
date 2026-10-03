import DropSort from '../DropSort.js';
import { act } from '../../anim/AnimationMain';

describe('DropSort', () => {
	let dropSort;
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

		dropSort = new DropSort(mockAm, 800, 600);
	});

	test('initializes controls and labels', () => {
		expect(dropSort.listField).toBeDefined();
		expect(dropSort.sortButton).toBeDefined();
		expect(dropSort.exampleDropdown).toBeDefined();
		expect(dropSort.clearButton).toBeDefined();
		expect(dropSort.compCount).toBe(0);

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('validates invalid inputs in sort', () => {
		// Empty array
		const cmdsEmpty = dropSort.sort([]);
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
		const cmdsLarge = dropSort.sort(largeList);
		expect(
			cmdsLarge.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p =>
							typeof p === 'string' &&
							p.includes('Data cannot contain more than 18 numbers'),
					),
			),
		).toBe(true);

		// Non-numeric or > 999
		const cmdsInvalid = dropSort.sort(['abc', '1000']);
		expect(
			cmdsInvalid.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(p => typeof p === 'string' && p.includes('non-numeric values')),
			),
		).toBe(true);
	});

	test('sorts already sorted list without dropping elements', () => {
		dropSort.listField.value = '1,2,3';
		dropSort.sortCallback();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
		expect(dropSort.arrayData).toEqual([1, 2, 3]);

		const calls = mockAm.startNewAnimation.mock.calls;
		const lastCmds = calls[calls.length - 1][0];

		// Check green highlights on retained elements
		const greenFills = lastCmds.filter(
			cmd => cmd[0] === act.setBackgroundColor && cmd[1].includes('#2ECC71'),
		);
		expect(greenFills.length).toBe(3);
	});

	test('drops descending elements when unsorted', () => {
		// In [1, 5, 2, 4], 2 is smaller than 5, so 2 will be dropped
		dropSort.listField.value = '1,5,2,4';
		dropSort.sortCallback();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
		// Elements after drops should be non-decreasing
		expect(dropSort.arrayData).toEqual([1, 5]);
	});

	test('handles duplicates by labeling with letters', () => {
		dropSort.listField.value = '2,2,3';
		dropSort.sortCallback();

		const calls = mockAm.startNewAnimation.mock.calls;
		const lastCmds = calls[calls.length - 1][0];
		const rects = lastCmds.filter(cmd => cmd[0] === act.createRectangle);

		expect(rects.some(r => r[1].includes('2a'))).toBe(true);
	});

	test('selects preset examples and random arrays', () => {
		dropSort.exampleDropdown.value = '1,2,3,4,5,6,7,8,9';
		dropSort.exampleCallback();
		expect(dropSort.listField.value).toBe('1,2,3,4,5,6,7,8,9');

		dropSort.exampleDropdown.value = 'Random';
		dropSort.exampleCallback();
		expect(dropSort.listField.value.length).toBeGreaterThan(0);

		dropSort.exampleDropdown.value = '';
		dropSort.exampleCallback();
	});

	test('clears and resets visualization state', () => {
		dropSort.listField.value = '5,3,8';
		dropSort.sortCallback();

		dropSort.clearCallback();
		expect(dropSort.listField.value).toBe('');
		expect(dropSort.arrayData).toEqual([]);

		dropSort.reset();
		expect(dropSort.compCount).toBe(0);
		expect(dropSort.swapCount).toBe(0);
	});

	test('sets URL parameters for data', () => {
		const searchParams = new URLSearchParams('data=1,5,10');
		dropSort.setURLData(searchParams);

		expect(dropSort.arrayData).toEqual([1, 5, 10]);
	});

	test('disables and enables UI controls', () => {
		dropSort.disableUI();
		dropSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		dropSort.enableUI();
		dropSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('triggers sort on Enter key in listField', () => {
		dropSort.listField.value = '1,2';
		const event = new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 });
		dropSort.listField.dispatchEvent(event);

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});
});

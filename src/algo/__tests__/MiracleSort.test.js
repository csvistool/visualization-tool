import MiracleSort from '../MiracleSort.js';
import { act } from '../../anim/AnimationMain';

describe('MiracleSort', () => {
	let miracleSort;
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

		miracleSort = new MiracleSort(mockAm, 800, 600);
	});

	test('initializes controls and labels', () => {
		expect(miracleSort.listField).toBeDefined();
		expect(miracleSort.sortButton).toBeDefined();
		expect(miracleSort.exampleDropdown).toBeDefined();
		expect(miracleSort.clearButton).toBeDefined();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('validates invalid inputs in sort', () => {
		// Empty array
		const cmdsEmpty = miracleSort.sort([]);
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
		const cmdsLarge = miracleSort.sort(largeList);
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
		const cmdsInvalid = miracleSort.sort(['abc', '1000']);
		expect(
			cmdsInvalid.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(p => typeof p === 'string' && p.includes('non-numeric values')),
			),
		).toBe(true);
	});

	test('runs miracle sort waiting animation and sets info text', () => {
		miracleSort.listField.value = '3,1,2';
		miracleSort.sortCallback();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
		const calls = mockAm.startNewAnimation.mock.calls;
		const lastCmds = calls[calls.length - 1][0];

		// Check miracle waiting message
		const miracleMsg = lastCmds.find(
			cmd =>
				cmd[0] === act.setText &&
				cmd[1].some(p => typeof p === 'string' && p.includes('Waiting for a miracle')),
		);
		expect(miracleMsg).toBeDefined();

		// Check light blue cell coloring
		const blueFills = lastCmds.filter(
			cmd => cmd[0] === act.setBackgroundColor && cmd[1].includes('#ADD8E6'),
		);
		expect(blueFills.length).toBe(3);
	});

	test('handles duplicate values by appending distinguishing letters', () => {
		miracleSort.listField.value = '5,5,1';
		miracleSort.sortCallback();

		const calls = mockAm.startNewAnimation.mock.calls;
		const lastCmds = calls[calls.length - 1][0];
		const rects = lastCmds.filter(cmd => cmd[0] === act.createRectangle);

		expect(rects.some(r => r[1].includes('5a'))).toBe(true);
	});

	test('selects preset examples and random arrays', () => {
		miracleSort.exampleDropdown.value = '1,2,3,4,5,6,7,8,9';
		miracleSort.exampleCallback();
		expect(miracleSort.listField.value).toBe('1,2,3,4,5,6,7,8,9');

		miracleSort.exampleDropdown.value = 'Random';
		miracleSort.exampleCallback();
		expect(miracleSort.listField.value.length).toBeGreaterThan(0);

		miracleSort.exampleDropdown.value = '';
		miracleSort.exampleCallback();
	});

	test('clears and resets visualization state', () => {
		miracleSort.listField.value = '7,3,1';
		miracleSort.sortCallback();

		miracleSort.clearCallback();
		expect(miracleSort.listField.value).toBe('');
		expect(miracleSort.arrayData).toEqual([]);

		miracleSort.reset();
		expect(miracleSort.compCount).toBe(0);
	});

	test('sets URL parameters for data', () => {
		const searchParams = new URLSearchParams('data=4,2,8');
		miracleSort.setURLData(searchParams);

		expect(miracleSort.arrayData).toEqual([4, 2, 8]);
	});

	test('disables and enables UI controls', () => {
		miracleSort.disableUI();
		miracleSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		miracleSort.enableUI();
		miracleSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('triggers sort on Enter key in listField', () => {
		miracleSort.listField.value = '3,1';
		const event = new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 });
		miracleSort.listField.dispatchEvent(event);

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});
});

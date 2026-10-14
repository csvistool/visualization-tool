import SleepSort from '../SleepSort.js';
import { act } from '../../anim/AnimationMain';

describe('SleepSort', () => {
	let sleepSort;
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

		sleepSort = new SleepSort(mockAm, 800, 600);
	});

	test('initializes controls and labels', () => {
		expect(sleepSort.listField).toBeDefined();
		expect(sleepSort.sortButton).toBeDefined();
		expect(sleepSort.exampleDropdown).toBeDefined();
		expect(sleepSort.clearButton).toBeDefined();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('validates invalid inputs in sort', () => {
		// Empty array
		const cmdsEmpty = sleepSort.sort([]);
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
		const cmdsLarge = sleepSort.sort(largeList);
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
		const cmdsInvalid = sleepSort.sort(['abc', '1000']);
		expect(
			cmdsInvalid.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(p => typeof p === 'string' && p.includes('non-numeric values')),
			),
		).toBe(true);
	});

	test('runs sleep sort timer countdown and populates sorted output', () => {
		sleepSort.listField.value = '3,1,2';
		sleepSort.sortCallback();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
		const calls = mockAm.startNewAnimation.mock.calls;
		const lastCmds = calls[calls.length - 1][0];

		// Check timer creation labels
		const timerLabels = lastCmds.filter(cmd => cmd[0] === act.createLabel);
		expect(timerLabels.length).toBeGreaterThan(0);

		// Check sorted elements placed in second array with green background
		const greenFills = lastCmds.filter(
			cmd => cmd[0] === act.setBackgroundColor && cmd[1].includes('#2ECC71'),
		);
		expect(greenFills.length).toBe(3);

		// Check completion message
		expect(
			lastCmds.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(p => typeof p === 'string' && p.includes('Sorting complete')),
			),
		).toBe(true);
	});

	test('handles duplicate values by appending distinguishing letters', () => {
		sleepSort.listField.value = '4,4,2';
		sleepSort.sortCallback();

		const calls = mockAm.startNewAnimation.mock.calls;
		const lastCmds = calls[calls.length - 1][0];
		const rects = lastCmds.filter(cmd => cmd[0] === act.createRectangle);

		expect(rects.some(r => r[1].includes('4a'))).toBe(true);
	});

	test('selects preset examples and random arrays', () => {
		sleepSort.exampleDropdown.value = '1,2,3,4,5,6,7,8,9';
		sleepSort.exampleCallback();
		expect(sleepSort.listField.value).toBe('1,2,3,4,5,6,7,8,9');

		sleepSort.exampleDropdown.value = 'Random';
		sleepSort.exampleCallback();
		expect(sleepSort.listField.value.length).toBeGreaterThan(0);

		sleepSort.exampleDropdown.value = '';
		sleepSort.exampleCallback();
	});

	test('clears and resets visualization state', () => {
		sleepSort.listField.value = '6,2,9';
		sleepSort.sortCallback();

		sleepSort.clearCallback();
		expect(sleepSort.listField.value).toBe('');
		expect(sleepSort.arrayData).toEqual([]);

		sleepSort.reset();
		expect(sleepSort.arrayData).toEqual([]);
	});

	test('sets URL parameters for data', () => {
		const searchParams = new URLSearchParams('data=5,1,8');
		sleepSort.setURLData(searchParams);

		expect(sleepSort.arrayData).toEqual([5, 1, 8]);
	});

	test('disables and enables UI controls', () => {
		sleepSort.disableUI();
		sleepSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		sleepSort.enableUI();
		sleepSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('triggers sort on Enter key in listField', () => {
		sleepSort.listField.value = '3,2';
		const event = new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 });
		sleepSort.listField.dispatchEvent(event);

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});
});

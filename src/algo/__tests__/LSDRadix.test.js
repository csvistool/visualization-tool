/* eslint-disable no-extend-native */
import LSDRadix from '../LSDRadix.js';
import { act } from '../../anim/AnimationMain';

describe('LSDRadix', () => {
	let lsdRadix;
	let mockAm;

	beforeEach(() => {
		document.body.innerHTML = `
			<div id="AlgorithmSpecificControls"></div>
			<div id="GeneralAnimationControls"></div>
		`;

		// Mock code/english on String.prototype to prevent crashes in toggleNegativeNumbers
		String.prototype.code = Array.from({ length: 25 }, () => [1]);
		String.prototype.english = Array.from({ length: 25 }, () => [1]);

		mockAm = {
			addListener: jest.fn(),
			startNewAnimation: jest.fn(),
			clearHistory: jest.fn(),
			skipForward: jest.fn(),
			step: jest.fn(),
			setInfoText: jest.fn(),
		};

		lsdRadix = new LSDRadix(mockAm, 800, 600);
	});

	afterEach(() => {
		delete String.prototype.code;
		delete String.prototype.english;
	});

	test('initializes controls and default state', () => {
		expect(lsdRadix.listField).toBeDefined();
		expect(lsdRadix.sortButton).toBeDefined();
		expect(lsdRadix.exampleDropdown).toBeDefined();
		expect(lsdRadix.clearButton).toBeDefined();
		expect(lsdRadix.negativeNumbersCheckbox).toBeDefined();
		expect(lsdRadix.negativeNumbersCheckbox.checked).toBe(false);
	});

	test('validates empty input list', () => {
		lsdRadix.listField.value = '';
		lsdRadix.sortCallback();

		const setLabels = mockAm.startNewAnimation.mock.calls.flatMap(call =>
			call[0].filter(cmd => cmd[0] === act.setText && cmd[1].includes(lsdRadix.infoLabelID)),
		);
		expect(
			setLabels.some(cmd =>
				cmd[1].some(p => typeof p === 'string' && p.includes('Data must contain integers')),
			),
		).toBe(true);
	});

	test('validates input exceeding maximum array size (18)', () => {
		lsdRadix.listField.value = Array.from({ length: 19 }, (_, i) => i + 1).join(',');
		lsdRadix.sortCallback();

		const setLabels = mockAm.startNewAnimation.mock.calls.flatMap(call =>
			call[0].filter(cmd => cmd[0] === act.setText && cmd[1].includes(lsdRadix.infoLabelID)),
		);
		expect(
			setLabels.some(cmd =>
				cmd[1].some(
					p =>
						typeof p === 'string' &&
						p.includes('Data cannot contain more than 18 numbers'),
				),
			),
		).toBe(true);
	});

	test('validates non-numeric input', () => {
		lsdRadix.listField.value = '1,2,abc,4';
		lsdRadix.sortCallback();

		const setLabels = mockAm.startNewAnimation.mock.calls.flatMap(call =>
			call[0].filter(cmd => cmd[0] === act.setText && cmd[1].includes(lsdRadix.infoLabelID)),
		);
		expect(
			setLabels.some(cmd =>
				cmd[1].some(p => typeof p === 'string' && p.includes('non-numeric values')),
			),
		).toBe(true);
	});

	test('validates numbers with more than 6 digits', () => {
		lsdRadix.listField.value = '100,1000000,5';
		lsdRadix.sortCallback();

		const setLabels = mockAm.startNewAnimation.mock.calls.flatMap(call =>
			call[0].filter(cmd => cmd[0] === act.setText && cmd[1].includes(lsdRadix.infoLabelID)),
		);
		expect(
			setLabels.some(cmd =>
				cmd[1].some(p => typeof p === 'string' && p.includes('more than 6 digits')),
			),
		).toBe(true);
	});

	test('validates negative numbers when sort negative numbers is disabled', () => {
		lsdRadix.listField.value = '5,-3,10';
		lsdRadix.sortCallback();

		const setLabels = mockAm.startNewAnimation.mock.calls.flatMap(call =>
			call[0].filter(cmd => cmd[0] === act.setText && cmd[1].includes(lsdRadix.infoLabelID)),
		);
		expect(
			setLabels.some(cmd =>
				cmd[1].some(p => typeof p === 'string' && p.includes('Sort negative numbers')),
			),
		).toBe(true);
	});

	test('sorts positive numbers successfully', () => {
		lsdRadix.listField.value = '123,45,6';
		lsdRadix.sortCallback();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
		const creates = mockAm.startNewAnimation.mock.calls.flatMap(call =>
			call[0].filter(cmd => cmd[0] === act.createRectangle),
		);
		expect(creates.length).toBeGreaterThanOrEqual(3);
	});

	test('toggles negative numbers sorting and sorts with negatives', () => {
		lsdRadix.negativeNumbersCheckbox.checked = true;
		lsdRadix.toggleNegativeNumbers();

		lsdRadix.listField.value = '-42,10,-5,0';
		lsdRadix.sortCallback();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();

		// Toggle back to disabled
		lsdRadix.negativeNumbersCheckbox.checked = false;
		lsdRadix.toggleNegativeNumbers();
	});

	test('selects preset examples and random arrays', () => {
		lsdRadix.exampleDropdown.value = '603,509,701,404,307,909,102,800,401';
		lsdRadix.exampleCallback();
		expect(lsdRadix.listField.value).toBe('603,509,701,404,307,909,102,800,401');

		// Random selection with negatives disabled
		lsdRadix.exampleDropdown.value = 'Random';
		lsdRadix.exampleCallback();
		expect(lsdRadix.listField.value.length).toBeGreaterThan(0);

		// Random selection with negatives enabled
		lsdRadix.negativeNumbersCheckbox.checked = true;
		lsdRadix.toggleNegativeNumbers();
		lsdRadix.exampleDropdown.value = 'Random';
		lsdRadix.exampleCallback();
		expect(lsdRadix.listField.value.length).toBeGreaterThan(0);

		// Clean up toggle
		lsdRadix.toggleNegativeNumbers();

		// Empty selection does nothing
		lsdRadix.exampleDropdown.value = '';
		lsdRadix.exampleCallback();
	});

	test('clears and resets visualization state', () => {
		lsdRadix.listField.value = '10,20,30';
		lsdRadix.sortCallback();

		lsdRadix.clearCallback();
		expect(lsdRadix.listField.value).toBe('');
		expect(lsdRadix.arrayData).toEqual([]);

		lsdRadix.reset();
		expect(lsdRadix.arrayData).toEqual([]);
		expect(lsdRadix.bucketsData).toEqual([]);
	});

	test('sets URL parameters for negative and data', () => {
		const searchParams = new URLSearchParams('negative=1&data=99,12,4');
		lsdRadix.setURLData(searchParams);

		expect(lsdRadix.negativeNumbersCheckbox.checked).toBe(true);

		// Toggle back to disabled
		lsdRadix.toggleNegativeNumbers();
	});

	test('disables and enables UI controls', () => {
		lsdRadix.disableUI();
		lsdRadix.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		lsdRadix.enableUI();
		lsdRadix.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('triggers sort on Enter key in listField', () => {
		lsdRadix.listField.value = '4,2,7';
		const event = new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 });
		lsdRadix.listField.dispatchEvent(event);

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});
});

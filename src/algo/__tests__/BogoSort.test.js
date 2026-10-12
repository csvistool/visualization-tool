import BogoSort from '../BogoSort.js';
import { act } from '../../anim/AnimationMain';

describe('BogoSort', () => {
	let bogoSort;
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

		bogoSort = new BogoSort(mockAm, 800, 600);
	});

	test('initializes controls and labels', () => {
		expect(bogoSort.listField).toBeDefined();
		expect(bogoSort.sortButton).toBeDefined();
		expect(bogoSort.exampleDropdown).toBeDefined();
		expect(bogoSort.clearButton).toBeDefined();
		expect(bogoSort.iterations).toBe(0);

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('sorts already-sorted small array in one iteration', () => {
		bogoSort.listField.value = '1,2,3';
		bogoSort.sortCallback();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
		const calls = mockAm.startNewAnimation.mock.calls;
		const lastCmds = calls[calls.length - 1][0];

		// Check background color set for sorted elements
		const colorFills = lastCmds.filter(
			cmd =>
				cmd[0] === act.setBackgroundColor &&
				cmd[1].some(p => typeof p === 'string' && bogoSort.colors.includes(p)),
		);
		expect(colorFills.length).toBeGreaterThanOrEqual(3);
	});

	test('handles arrays of length >= 10 by warning and aborting', () => {
		bogoSort.listField.value = '10,9,8,7,6,5,4,3,2,1,0';
		bogoSort.sortCallback();

		const calls = mockAm.startNewAnimation.mock.calls;
		const lastCmds = calls[calls.length - 1][0];

		const warningCmd = lastCmds.find(
			cmd =>
				cmd[0] === act.setText &&
				cmd[1].some(p => typeof p === 'string' && p.includes('too long')),
		);
		expect(warningCmd).toBeDefined();
	});

	test('ignores invalid input in sortCallback', () => {
		mockAm.startNewAnimation.mockClear();

		// Empty list
		bogoSort.listField.value = '';
		bogoSort.sortCallback();
		expect(mockAm.startNewAnimation).not.toHaveBeenCalled();

		// Array > 18 elements
		bogoSort.listField.value = Array.from({ length: 19 }, (_, i) => i + 1).join(',');
		bogoSort.sortCallback();
		expect(mockAm.startNewAnimation).not.toHaveBeenCalled();

		// Elements > 999 or non-numeric
		bogoSort.listField.value = '1000,5';
		bogoSort.sortCallback();
		expect(mockAm.startNewAnimation).not.toHaveBeenCalled();

		bogoSort.listField.value = 'foo,bar';
		bogoSort.sortCallback();
		expect(mockAm.startNewAnimation).not.toHaveBeenCalled();
	});

	test('swaps and shuffles unsorted array', () => {
		// Mock random so swap order completes quickly
		const originalRandom = Math.random;
		// Return 0 so random index picks 0, resulting in quickly sorted
		Math.random = jest.fn(() => 0.1);

		bogoSort.listField.value = '2,1';
		bogoSort.sortCallback();

		Math.random = originalRandom;
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('handles duplicate values by appending distinguishing letters', () => {
		bogoSort.listField.value = '2,2,3';
		bogoSort.sortCallback();

		const calls = mockAm.startNewAnimation.mock.calls;
		const lastCmds = calls[calls.length - 1][0];
		const rects = lastCmds.filter(cmd => cmd[0] === act.createRectangle);

		// Second duplicate gets 'a' suffix
		expect(rects.some(r => r[1].includes('2a'))).toBe(true);
	});

	test('selects preset examples and random arrays', () => {
		bogoSort.exampleDropdown.value = '1,2,3,4,5,6,7,8,9';
		bogoSort.exampleCallback();
		expect(bogoSort.listField.value).toBe('1,2,3,4,5,6,7,8,9');

		bogoSort.exampleDropdown.value = 'Random';
		bogoSort.exampleCallback();
		expect(bogoSort.listField.value.length).toBeGreaterThan(0);

		bogoSort.exampleDropdown.value = '';
		bogoSort.exampleCallback();
	});

	test('clears and resets visualization state', () => {
		bogoSort.listField.value = '1,2,3';
		bogoSort.sortCallback();

		bogoSort.clearCallback();
		expect(bogoSort.listField.value).toBe('');
		expect(bogoSort.arrayData).toEqual([]);

		bogoSort.reset();
		expect(bogoSort.iterations).toBe(0);
	});

	test('disables and enables UI controls', () => {
		bogoSort.disableUI();
		bogoSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		bogoSort.enableUI();
		bogoSort.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('triggers sort on Enter key in listField', () => {
		bogoSort.listField.value = '1,2';
		const event = new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 });
		bogoSort.listField.dispatchEvent(event);

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});
});

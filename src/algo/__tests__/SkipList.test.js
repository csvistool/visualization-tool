import SkipList from '../SkipList.js';

describe('SkipList', () => {
	let skipList;
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

		skipList = new SkipList(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls and default properties correctly', () => {
		expect(skipList.controls).toBeDefined();
		expect(skipList.addValueField).toBeDefined();
		expect(skipList.headsField).toBeDefined();
		expect(skipList.addWithHeadsButton).toBeDefined();
		expect(skipList.addValueFieldRandom).toBeDefined();
		expect(skipList.addRandomlyButton).toBeDefined();
		expect(skipList.removeField).toBeDefined();
		expect(skipList.removeButton).toBeDefined();
		expect(skipList.getField).toBeDefined();
		expect(skipList.getButton).toBeDefined();
		expect(skipList.randomButton).toBeDefined();
		expect(skipList.clearButton).toBeDefined();

		expect(skipList.size).toBe(0);
		expect(skipList.nodeID.length).toBe(2);
		expect(skipList.data[0][0]).toBe(Number.NEGATIVE_INFINITY);
		expect(skipList.data[1][0]).toBe(Number.POSITIVE_INFINITY);
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('enableUI and disableUI toggle disabled state on controls', () => {
		skipList.disableUI();
		skipList.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		skipList.enableUI();
		skipList.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('addWithHeadsCallback shakes button on empty inputs and adds with specified heads', () => {
		const shakeSpy = jest.spyOn(skipList, 'shake').mockImplementation(() => {});

		skipList.addValueField.value = '';
		skipList.headsField.value = '2';
		skipList.addWithHeadsCallback();
		expect(shakeSpy).toHaveBeenCalledWith(skipList.addWithHeadsButton);

		skipList.addValueField.value = '25';
		skipList.headsField.value = '';
		skipList.addWithHeadsCallback();
		expect(shakeSpy).toHaveBeenCalledWith(skipList.addWithHeadsButton);

		skipList.addValueField.value = '25';
		skipList.headsField.value = '2';
		skipList.addWithHeadsCallback();
		expect(skipList.size).toBe(1);
		expect(skipList.addValueField.value).toBe('');
		expect(skipList.headsField.value).toBe('');
		expect(mockAm.startNewAnimation).toHaveBeenCalled();

		shakeSpy.mockRestore();
	});

	test('addRandomlyCallback shakes button on empty input and adds element', () => {
		const shakeSpy = jest.spyOn(skipList, 'shake').mockImplementation(() => {});

		skipList.addValueFieldRandom.value = '';
		skipList.addRandomlyCallback();
		expect(shakeSpy).toHaveBeenCalledWith(skipList.addRandomlyButton);

		skipList.addValueFieldRandom.value = '15';
		skipList.addRandomlyCallback();
		expect(skipList.size).toBe(1);
		expect(skipList.addValueFieldRandom.value).toBe('');

		shakeSpy.mockRestore();
	});

	test('inserts multiple sorted elements and handles duplicates', () => {
		skipList.add('10', 1);
		skipList.add('30', 2);
		skipList.add('20', 1);
		expect(skipList.size).toBe(3);

		// Inserting duplicate element
		skipList.add('20', 1);
		expect(skipList.size).toBe(4);
	});

	test('removeCallback shakes button on empty input and removes existing elements', () => {
		const shakeSpy = jest.spyOn(skipList, 'shake').mockImplementation(() => {});

		skipList.removeField.value = '';
		skipList.removeCallback();
		expect(shakeSpy).toHaveBeenCalledWith(skipList.removeButton);

		skipList.add('10', 1);
		skipList.add('20', 2);
		skipList.add('30', 1);
		expect(skipList.size).toBe(3);

		// Remove present element
		const initialCols = skipList.nodeID.length;
		skipList.removeField.value = '20';
		skipList.removeCallback();
		expect(skipList.nodeID.length).toBe(initialCols - 1);
		expect(skipList.size).toBe(2);

		shakeSpy.mockRestore();
	});

	test('getCallback shakes button on empty input and searches for elements', () => {
		const shakeSpy = jest.spyOn(skipList, 'shake').mockImplementation(() => {});

		skipList.getField.value = '';
		skipList.getCallback();
		expect(shakeSpy).toHaveBeenCalledWith(skipList.getButton);

		skipList.add('10', 1);
		skipList.add('20', 2);

		// Search present element
		skipList.getField.value = '10';
		skipList.getCallback();
		expect(skipList.getField.value).toBe('');

		// Search absent element
		skipList.getField.value = '50';
		skipList.getCallback();

		shakeSpy.mockRestore();
	});

	test('compare method compares numbers and strings accurately', () => {
		expect(skipList.compare(10, 20)).toBeLessThan(0);
		expect(skipList.compare(20, 10)).toBeGreaterThan(0);
		expect(skipList.compare(10, 10)).toBe(0);

		expect(skipList.compare('apple', 'banana')).toBeLessThan(0);
		expect(skipList.compare('banana', 'apple')).toBeGreaterThan(0);
		expect(skipList.compare('apple', 'apple')).toBe(0);

		expect(skipList.compare(10, 'apple')).toBeLessThan(0);
		expect(skipList.compare('apple', 10)).toBeGreaterThan(0);
	});

	test('randomCallback clears list and generates random elements', () => {
		skipList.randomCallback();
		expect(skipList.size).toBeGreaterThan(0);
	});

	test('clearCallback and clearAll reset skip list nodes and towers', () => {
		skipList.add('10', 2);
		skipList.add('20', 1);
		expect(skipList.size).toBe(2);

		skipList.clearCallback();
		expect(skipList.size).toBe(0);
		expect(skipList.data[0][0]).toBe(Number.NEGATIVE_INFINITY);
		expect(skipList.data[1][0]).toBe(Number.POSITIVE_INFINITY);
	});

	test('reset resets size, seed, and data arrays', () => {
		skipList.add('10', 2);
		skipList.reset();
		expect(skipList.size).toBe(0);
		expect(skipList.data[0][0]).toBe(Number.NEGATIVE_INFINITY);
		expect(skipList.data[1][0]).toBe(Number.POSITIVE_INFINITY);
	});

	test('setURLData parses comma-separated entries and adds them randomly', () => {
		const params = new URLSearchParams('data=10,20,30');
		skipList.setURLData(params);
		expect(skipList.size).toBe(3);
	});
});

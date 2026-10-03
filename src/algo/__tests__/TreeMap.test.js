import TreeMap from '../TreeMap.js';

describe('TreeMap', () => {
	let treeMap;
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

		treeMap = new TreeMap(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls and default properties correctly', () => {
		expect(treeMap.controls).toBeDefined();
		expect(treeMap.keyField).toBeDefined();
		expect(treeMap.valueField).toBeDefined();
		expect(treeMap.insertButton).toBeDefined();
		expect(treeMap.deleteField).toBeDefined();
		expect(treeMap.deleteButton).toBeDefined();
		expect(treeMap.findField).toBeDefined();
		expect(treeMap.findButton).toBeDefined();
		expect(treeMap.randomButton).toBeDefined();
		expect(treeMap.clearButton).toBeDefined();
		expect(treeMap.predButton).toBeDefined();
		expect(treeMap.succButton).toBeDefined();

		expect(treeMap.predSucc).toBe('succ');
		expect(treeMap.treeRoot).toBeFalsy();
		expect(treeMap.edges).toEqual([]);
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('enableUI and disableUI toggle disabled state on controls', () => {
		treeMap.disableUI();
		treeMap.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		treeMap.enableUI();
		treeMap.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('predSucc radio buttons update property', () => {
		treeMap.predButton.onclick();
		expect(treeMap.predSucc).toBe('pred');

		treeMap.succButton.onclick();
		expect(treeMap.predSucc).toBe('succ');
	});

	test('sizeChanged updates startingX position', () => {
		treeMap.sizeChanged(1000);
		expect(treeMap.startingX).toBe(500);
	});

	test('insertCallback shakes button on empty inputs and inserts valid key-value pair', () => {
		const shakeSpy = jest.spyOn(treeMap, 'shake').mockImplementation(() => {});

		treeMap.keyField.value = '';
		treeMap.valueField.value = 'A';
		treeMap.insertCallback();
		expect(shakeSpy).toHaveBeenCalledWith(treeMap.insertButton);

		treeMap.keyField.value = '10';
		treeMap.valueField.value = '';
		treeMap.insertCallback();
		expect(shakeSpy).toHaveBeenCalledWith(treeMap.insertButton);

		treeMap.keyField.value = '10';
		treeMap.valueField.value = 'Alpha';
		treeMap.insertCallback();
		expect(treeMap.treeRoot).toBeDefined();
		expect(treeMap.treeRoot.key).toBe('10');
		expect(treeMap.treeRoot.value).toBe('Alpha');
		expect(treeMap.keyField.value).toBe('');
		expect(treeMap.valueField.value).toBe('');
		expect(mockAm.startNewAnimation).toHaveBeenCalled();

		shakeSpy.mockRestore();
	});

	test('inserting duplicate key updates its value', () => {
		treeMap.add('10', 'OldValue');
		expect(treeMap.treeRoot.value).toBe('OldValue');

		treeMap.add('10', 'NewValue');
		expect(treeMap.treeRoot.value).toBe('NewValue');
	});

	test('inserts causing LL, RR, LR, and RL rotations to maintain AVL balance', () => {
		// LL rotation (inserting 30, 20, 10)
		treeMap.add('30', 'val30');
		treeMap.add('20', 'val20');
		treeMap.add('10', 'val10');
		expect(treeMap.treeRoot.key).toBe('20');
		expect(treeMap.treeRoot.left.key).toBe('10');
		expect(treeMap.treeRoot.right.key).toBe('30');

		// Clear and test RR rotation (10, 20, 30)
		treeMap.clear();
		treeMap.add('10', 'val10');
		treeMap.add('20', 'val20');
		treeMap.add('30', 'val30');
		expect(treeMap.treeRoot.key).toBe('20');
		expect(treeMap.treeRoot.left.key).toBe('10');
		expect(treeMap.treeRoot.right.key).toBe('30');

		// Clear and test LR rotation (30, 10, 20)
		treeMap.clear();
		treeMap.add('30', 'val30');
		treeMap.add('10', 'val10');
		treeMap.add('20', 'val20');
		expect(treeMap.treeRoot.key).toBe('20');
		expect(treeMap.treeRoot.left.key).toBe('10');
		expect(treeMap.treeRoot.right.key).toBe('30');

		// Clear and test RL rotation (10, 30, 20)
		treeMap.clear();
		treeMap.add('10', 'val10');
		treeMap.add('30', 'val30');
		treeMap.add('20', 'val20');
		expect(treeMap.treeRoot.key).toBe('20');
		expect(treeMap.treeRoot.left.key).toBe('10');
		expect(treeMap.treeRoot.right.key).toBe('30');
	});

	test('findCallback shakes button on empty input and searches tree', () => {
		const shakeSpy = jest.spyOn(treeMap, 'shake').mockImplementation(() => {});

		treeMap.findField.value = '';
		treeMap.findCallback();
		expect(shakeSpy).toHaveBeenCalledWith(treeMap.findButton);

		// Search in empty tree
		treeMap.findField.value = '10';
		treeMap.findCallback();
		expect(treeMap.findField.value).toBe('');

		// Populate tree and search
		treeMap.add('20', 'Twenty');
		treeMap.add('10', 'Ten');
		treeMap.add('30', 'Thirty');

		// Hit
		treeMap.findField.value = '10';
		treeMap.findCallback();

		// Miss (smaller and larger)
		treeMap.findField.value = '5';
		treeMap.findCallback();

		treeMap.findField.value = '50';
		treeMap.findCallback();

		shakeSpy.mockRestore();
	});

	test('deleteCallback shakes button when empty or no treeRoot', () => {
		const shakeSpy = jest.spyOn(treeMap, 'shake').mockImplementation(() => {});

		treeMap.deleteField.value = '';
		treeMap.deleteCallback();
		expect(shakeSpy).toHaveBeenCalledWith(treeMap.deleteButton);

		treeMap.deleteField.value = '10';
		treeMap.deleteCallback();
		expect(shakeSpy).toHaveBeenCalledWith(treeMap.deleteButton);

		shakeSpy.mockRestore();
	});

	test('deletes leaf node, one-child node, and two-child node with successor/predecessor', () => {
		treeMap.add('20', 'Twenty');
		treeMap.add('10', 'Ten');
		treeMap.add('30', 'Thirty');
		treeMap.add('5', 'Five');
		treeMap.add('15', 'Fifteen');
		treeMap.add('25', 'TwentyFive');
		treeMap.add('35', 'ThirtyFive');

		// Delete leaf
		treeMap.deleteField.value = '5';
		treeMap.deleteCallback();
		expect(treeMap.deleteField.value).toBe('');

		// Delete node with one child
		treeMap.deleteField.value = '10';
		treeMap.deleteCallback();

		// Delete node with two children using successor
		treeMap.predSucc = 'succ';
		treeMap.deleteField.value = '20';
		treeMap.deleteCallback();

		// Delete node with two children using predecessor
		treeMap.predSucc = 'pred';
		treeMap.deleteField.value = '30';
		treeMap.deleteCallback();
	});

	test('randomCallback clears tree and populates with random key-value pairs', () => {
		treeMap.randomCallback();
		expect(treeMap.treeRoot).toBeDefined();
	});

	test('clearCallback clears all nodes and resets treeRoot', () => {
		treeMap.add('10', 'Ten');
		treeMap.add('20', 'Twenty');
		expect(treeMap.treeRoot).toBeDefined();

		treeMap.clearCallback();
		expect(treeMap.treeRoot).toBeNull();
	});

	test('reset resets indices and treeRoot', () => {
		treeMap.add('10', 'Ten');
		treeMap.reset();
		expect(treeMap.treeRoot).toBeNull();
		expect(treeMap.nextIndex).toBe(1);
		expect(treeMap.edges).toEqual([]);
	});

	test('compare handles both numeric and string keys', () => {
		expect(treeMap.compare('10', '20')).toBeLessThan(0);
		expect(treeMap.compare('20', '10')).toBeGreaterThan(0);
		expect(treeMap.compare('10', '10')).toBe(0);

		expect(treeMap.compare('apple', 'banana')).toBeLessThan(0);
		expect(treeMap.compare('banana', 'apple')).toBeGreaterThan(0);
		expect(treeMap.compare('apple', 'apple')).toBe(0);

		expect(treeMap.compare('10', 'apple')).toBeLessThan(0);
		expect(treeMap.compare('apple', '10')).toBeGreaterThan(0);
	});

	test('setURLData parses predSucc and comma-separated data values', () => {
		const params = new URLSearchParams('predSucc=pred&data=10,20,30');
		treeMap.setURLData(params);
		expect(treeMap.predSucc).toBe('pred');
		expect(treeMap.predButton.checked).toBe(true);
		expect(treeMap.treeRoot).toBeDefined();

		const params2 = new URLSearchParams('predSucc=succ');
		treeMap.setURLData(params2);
		expect(treeMap.predSucc).toBe('succ');
		expect(treeMap.succButton.checked).toBe(true);
	});
});

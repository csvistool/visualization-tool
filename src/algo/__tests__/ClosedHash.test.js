import ClosedHash from '../ClosedHash.js';

describe('ClosedHash', () => {
	let closedHash;
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

		closedHash = new ClosedHash(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls and separate chaining table properties correctly', () => {
		expect(closedHash.controls).toBeDefined();
		expect(closedHash.keyField).toBeDefined();
		expect(closedHash.valueField).toBeDefined();
		expect(closedHash.insertButton).toBeDefined();
		expect(closedHash.deleteField).toBeDefined();
		expect(closedHash.deleteButton).toBeDefined();
		expect(closedHash.findField).toBeDefined();
		expect(closedHash.findButton).toBeDefined();
		expect(closedHash.hashTypeDropDown).toBeDefined();
		expect(closedHash.randomButton).toBeDefined();

		expect(closedHash.table_size).toBe(7);
		expect(closedHash.size).toBe(0);
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('insertCallback shakes button on empty input and inserts into bucket', () => {
		const shakeSpy = jest.spyOn(closedHash, 'shake').mockImplementation(() => {});

		closedHash.keyField.value = '10';
		closedHash.valueField.value = '';
		closedHash.insertCallback();
		expect(shakeSpy).toHaveBeenCalledWith(closedHash.insertButton);

		closedHash.keyField.value = '10';
		closedHash.valueField.value = 'Ten';
		closedHash.insertCallback();
		expect(closedHash.size).toBe(1);
		expect(closedHash.keyField.value).toBe('');
		expect(closedHash.valueField.value).toBe('');

		shakeSpy.mockRestore();
	});

	test('handles collisions via separate chaining', () => {
		// Both 3 and 10 hash to index 3 (3 % 7 = 3, 10 % 7 = 3)
		closedHash.insertElement('3', 'Three');
		closedHash.insertElement('10', 'Ten');

		expect(closedHash.size).toBe(2);
		expect(closedHash.hashTableValues[3]).toBeDefined();
		expect(closedHash.hashTableValues[3].key).toBe('10'); // New node placed at head of chain
		expect(closedHash.hashTableValues[3].next.key).toBe('3');
	});

	test('updating existing key modifies value in chain without increasing size', () => {
		closedHash.insertElement('5', 'OldVal');
		expect(closedHash.size).toBe(1);

		closedHash.insertElement('5', 'NewVal');
		expect(closedHash.size).toBe(1);
		expect(closedHash.hashTableValues[5].val).toBe('NewVal');
	});

	test('findCallback searches for present key and traverses chain on collision', () => {
		const shakeSpy = jest.spyOn(closedHash, 'shake').mockImplementation(() => {});

		closedHash.findField.value = '';
		closedHash.findCallback();
		expect(shakeSpy).toHaveBeenCalledWith(closedHash.findButton);

		closedHash.insertElement('3', 'Three');
		closedHash.insertElement('10', 'Ten');

		// Find key at head of chain
		closedHash.findField.value = '10';
		closedHash.findCallback();

		// Find key deeper in chain
		closedHash.findField.value = '3';
		closedHash.findCallback();

		// Find absent key
		closedHash.findField.value = '17';
		closedHash.findCallback();

		shakeSpy.mockRestore();
	});

	test('deleteCallback removes key and unlinks from chain', () => {
		const shakeSpy = jest.spyOn(closedHash, 'shake').mockImplementation(() => {});

		closedHash.deleteField.value = '';
		closedHash.deleteCallback();
		expect(shakeSpy).toHaveBeenCalledWith(closedHash.deleteButton);

		closedHash.insertElement('3', 'Three');
		closedHash.insertElement('10', 'Ten');
		expect(closedHash.size).toBe(2);

		// Delete head of chain (10)
		closedHash.deleteField.value = '10';
		closedHash.deleteCallback();
		expect(closedHash.size).toBe(1);
		expect(closedHash.hashTableValues[3].key).toBe('3');

		// Delete remaining node (3)
		closedHash.deleteField.value = '3';
		closedHash.deleteCallback();
		expect(closedHash.size).toBe(0);
		expect(closedHash.hashTableValues[3]).toBeNull();

		shakeSpy.mockRestore();
	});

	test('table resizes when load factor threshold is crossed', () => {
		closedHash.insertElement('1', 'A');
		closedHash.insertElement('2', 'B');
		closedHash.insertElement('3', 'C');
		closedHash.insertElement('4', 'D');
		expect(closedHash.table_size).toBe(7);

		closedHash.insertElement('5', 'E');
		expect(closedHash.table_size).toBeGreaterThan(7);
	});

	test('resizeInitialTable resets and resizes table', () => {
		closedHash.initialCapacityField.value = '13';
		closedHash.resizeInitialTableCall();
		expect(closedHash.table_size).toBe(13);
	});

	test('randomCallback clears and populates random chained elements', () => {
		closedHash.randomCallback();
		expect(closedHash.size).toBeGreaterThan(0);
	});
});

import NonLinearProbing from '../NonLinearProbing.js';

describe('NonLinearProbing', () => {
	let nonLinearProbing;
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

		nonLinearProbing = new NonLinearProbing(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls and non-linear probing table defaults correctly', () => {
		expect(nonLinearProbing.controls).toBeDefined();
		expect(nonLinearProbing.keyField).toBeDefined();
		expect(nonLinearProbing.valueField).toBeDefined();
		expect(nonLinearProbing.insertButton).toBeDefined();
		expect(nonLinearProbing.deleteField).toBeDefined();
		expect(nonLinearProbing.deleteButton).toBeDefined();
		expect(nonLinearProbing.findField).toBeDefined();
		expect(nonLinearProbing.findButton).toBeDefined();
		expect(nonLinearProbing.fillButton).toBeDefined();

		expect(nonLinearProbing.table_size).toBe(18);
		expect(nonLinearProbing.size).toBe(0);
		expect(nonLinearProbing.equation).toBeDefined();
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('insertCallback shakes button on missing inputs and inserts valid element', () => {
		const shakeSpy = jest.spyOn(nonLinearProbing, 'shake').mockImplementation(() => {});

		nonLinearProbing.keyField.value = '5';
		nonLinearProbing.valueField.value = '';
		nonLinearProbing.insertCallback();
		expect(shakeSpy).toHaveBeenCalledWith(nonLinearProbing.insertButton);

		nonLinearProbing.keyField.value = '5';
		nonLinearProbing.valueField.value = 'Five';
		nonLinearProbing.insertCallback();
		expect(nonLinearProbing.size).toBe(1);
		expect(nonLinearProbing.keyField.value).toBe('');
		expect(nonLinearProbing.valueField.value).toBe('');

		shakeSpy.mockRestore();
	});

	test('handles collision and updates existing key', () => {
		// Insert initial element
		nonLinearProbing.insertElement('5', 'Initial');
		expect(nonLinearProbing.size).toBe(1);

		// Update same key
		nonLinearProbing.insertElement('5', 'Updated');
		expect(nonLinearProbing.size).toBe(1);
		expect(nonLinearProbing.hashTableValues[5].val).toBe('Updated');

		// Insert colliding element (5 + 18 = 23, 23 % 18 = 5)
		nonLinearProbing.insertElement('23', 'Colliding');
		expect(nonLinearProbing.size).toBe(2);
	});

	test('findCallback searches for existing and absent keys', () => {
		const shakeSpy = jest.spyOn(nonLinearProbing, 'shake').mockImplementation(() => {});

		nonLinearProbing.findField.value = '';
		nonLinearProbing.findCallback();
		expect(shakeSpy).toHaveBeenCalledWith(nonLinearProbing.findButton);

		nonLinearProbing.insertElement('7', 'Seven');

		// Search present key
		nonLinearProbing.findField.value = '7';
		nonLinearProbing.findCallback();
		expect(nonLinearProbing.findField.value).toBe('');

		// Search absent key
		nonLinearProbing.findField.value = '99';
		nonLinearProbing.findCallback();

		shakeSpy.mockRestore();
	});

	test('deleteCallback removes key and marks deleted', () => {
		const shakeSpy = jest.spyOn(nonLinearProbing, 'shake').mockImplementation(() => {});

		nonLinearProbing.deleteField.value = '';
		nonLinearProbing.deleteCallback();
		expect(shakeSpy).toHaveBeenCalledWith(nonLinearProbing.deleteButton);

		nonLinearProbing.insertElement('4', 'Four');
		expect(nonLinearProbing.size).toBe(1);

		nonLinearProbing.deleteField.value = '4';
		nonLinearProbing.deleteCallback();
		expect(nonLinearProbing.size).toBe(0);
		expect(nonLinearProbing.deleted[4]).toBe(true);

		shakeSpy.mockRestore();
	});

	test('fillCallback fills map with entries until full', () => {
		nonLinearProbing.fillCallback();
		expect(nonLinearProbing.size).toBeGreaterThan(0);
	});
});

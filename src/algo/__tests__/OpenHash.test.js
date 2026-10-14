import OpenHash from '../OpenHash.js';

describe('OpenHash', () => {
	let openHash;
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

		openHash = new OpenHash(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls, table array, and probing defaults properly', () => {
		expect(openHash.controls).toBeDefined();
		expect(openHash.keyField).toBeDefined();
		expect(openHash.valueField).toBeDefined();
		expect(openHash.insertButton).toBeDefined();
		expect(openHash.deleteField).toBeDefined();
		expect(openHash.deleteButton).toBeDefined();
		expect(openHash.findField).toBeDefined();
		expect(openHash.findButton).toBeDefined();
		expect(openHash.probeTypeDropDown).toBeDefined();
		expect(openHash.hashTypeDropDown).toBeDefined();

		expect(openHash.currentProbeType).toBe('linear');
		expect(openHash.table_size).toBe(7);
		expect(openHash.size).toBe(0);
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('changeProbeType and checkProbeType toggle linear, quadratic, and double probing', () => {
		openHash.probeTypeDropDown.value = 'quadratic';
		openHash.checkProbeType();
		expect(openHash.currentProbeType).toBe('quadratic');
		expect(openHash.skipDist[0]).toBe(1);
		expect(openHash.skipDist[1]).toBe(4);

		openHash.probeTypeDropDown.value = 'double';
		openHash.checkProbeType();
		expect(openHash.currentProbeType).toBe('double');

		openHash.probeTypeDropDown.value = 'linear';
		openHash.checkProbeType();
		expect(openHash.currentProbeType).toBe('linear');
		expect(openHash.skipDist[0]).toBe(1);
		expect(openHash.skipDist[1]).toBe(2);
	});

	test('insertCallback shakes button when input is missing and inserts valid element', () => {
		const shakeSpy = jest.spyOn(openHash, 'shake').mockImplementation(() => {});

		openHash.keyField.value = '10';
		openHash.valueField.value = '';
		openHash.insertCallback();
		expect(shakeSpy).toHaveBeenCalledWith(openHash.insertButton);

		openHash.keyField.value = '10';
		openHash.valueField.value = 'A';
		openHash.insertCallback();
		expect(openHash.size).toBe(1);
		expect(openHash.keyField.value).toBe('');
		expect(openHash.valueField.value).toBe('');

		shakeSpy.mockRestore();
	});

	test('handles collision and linear probing correctly', () => {
		// Table size 7. 3 and 10 collide at index 3 (3 % 7 == 3, 10 % 7 == 3)
		openHash.insertElement('3', 'Three');
		openHash.insertElement('10', 'Ten');

		expect(openHash.hashTableValues[3].key).toBe('3');
		expect(openHash.hashTableValues[4].key).toBe('10'); // Probed to next slot
		expect(openHash.size).toBe(2);
	});

	test('updating existing key modifies value without increasing size', () => {
		openHash.insertElement('5', 'First');
		expect(openHash.size).toBe(1);

		openHash.insertElement('5', 'Second');
		expect(openHash.size).toBe(1);
		expect(openHash.hashTableValues[5].val).toBe('Second');
	});

	test('findCallback searches for present and absent keys', () => {
		const shakeSpy = jest.spyOn(openHash, 'shake').mockImplementation(() => {});

		openHash.findField.value = '';
		openHash.findCallback();
		expect(shakeSpy).toHaveBeenCalledWith(openHash.findButton);

		openHash.insertElement('12', 'Twelve');

		// Find present key
		openHash.findField.value = '12';
		openHash.findCallback();
		expect(openHash.findField.value).toBe('');

		// Find absent key
		openHash.findField.value = '99';
		openHash.findCallback();

		shakeSpy.mockRestore();
	});

	test('deleteCallback removes key and marks slot deleted', () => {
		const shakeSpy = jest.spyOn(openHash, 'shake').mockImplementation(() => {});

		openHash.deleteField.value = '';
		openHash.deleteCallback();
		expect(shakeSpy).toHaveBeenCalledWith(openHash.deleteButton);

		openHash.insertElement('8', 'Eight'); // 8 % 7 = 1
		expect(openHash.size).toBe(1);

		openHash.deleteField.value = '8';
		openHash.deleteCallback();
		expect(openHash.size).toBe(0);
		expect(openHash.deleted[1]).toBe(true);

		shakeSpy.mockRestore();
	});

	test('table resizes when load factor threshold is crossed', () => {
		// Initial size is 7, load factor is 0.67 (threshold = 7 * 0.67 ≈ 4.69)
		openHash.insertElement('1', 'A');
		openHash.insertElement('2', 'B');
		openHash.insertElement('3', 'C');
		openHash.insertElement('4', 'D');
		expect(openHash.table_size).toBe(7);

		// 5th element exceeds load factor and triggers resize
		openHash.insertElement('5', 'E');
		expect(openHash.table_size).toBeGreaterThan(7);
	});

	test('loadFactorCallBack updates load factor threshold', () => {
		openHash.loadField.value = '50';
		openHash.loadFactorCallBack();
		expect(openHash.load_factor).toBe(0.5);
	});

	test('resizeInitialTableCall resizes table to specified capacity', () => {
		openHash.initialCapacityField.value = '11';
		openHash.resizeInitialTableCall();
		expect(openHash.table_size).toBe(11);
	});

	test('setURLData parses probeType and base parameters', () => {
		const params = new URLSearchParams('probeType=quadratic&loadFactor=80');
		openHash.setURLData(params);
		expect(openHash.currentProbeType).toBe('quadratic');
		expect(openHash.load_factor).toBe(0.8);
	});

	test('randomCallback clears and populates random elements', () => {
		openHash.randomCallback();
		expect(openHash.size).toBeGreaterThan(0);
	});
});

import Hash from '../Hash.js';

describe('Hash', () => {
	let hash;
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

		hash = new Hash(mockAm, 800, 600);
		// Mock table properties typically initialized by subclasses
		hash.table_size = 7;
		hash.indexXPos = [100, 185, 270, 355, 440, 525, 610];
		hash.indexYPos = [110, 110, 110, 110, 110, 110, 110];
		hash.clear = jest.fn(() => []);
		hash.insertElement = jest.fn(() => []);
		hash.changeLoadFactor = jest.fn(() => []);
		hash.resizeInitialTableCall = jest.fn();
		hash.loadFactorCallBack = jest.fn();
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls and default hashType correctly', () => {
		expect(hash.controls).toBeDefined();
		expect(hash.keyField).toBeDefined();
		expect(hash.valueField).toBeDefined();
		expect(hash.insertButton).toBeDefined();
		expect(hash.deleteField).toBeDefined();
		expect(hash.deleteButton).toBeDefined();
		expect(hash.findField).toBeDefined();
		expect(hash.findButton).toBeDefined();
		expect(hash.loadField).toBeDefined();
		expect(hash.loadButton).toBeDefined();
		expect(hash.initialCapacityField).toBeDefined();
		expect(hash.restartButton).toBeDefined();

		expect(hash.hashType).toBe('integers');
	});

	test('changeHashType toggles hashType between integers, strings, and true', () => {
		hash.resetAll = jest.fn(() => []);

		hash.changeHashType('strings');
		expect(hash.hashType).toBe('strings');
		expect(hash.resetAll).toHaveBeenCalled();

		hash.changeHashType('true');
		expect(hash.hashType).toBe('true');

		hash.changeHashType('integers');
		expect(hash.hashType).toBe('integers');
	});

	test('checkHashType updates hashType based on dropDown value', () => {
		hash.hashTypeDropDown = { value: 'Strings' };
		hash.checkHashType();
		expect(hash.hashType).toBe('strings');

		hash.hashTypeDropDown = { value: 'True' };
		hash.checkHashType();
		expect(hash.hashType).toBe('true');

		hash.hashTypeDropDown = { value: 'Integers' };
		hash.checkHashType();
		expect(hash.hashType).toBe('integers');
	});

	test('doHash computes index for integer keys', () => {
		hash.hashType = 'integers';
		const index = hash.doHash('15');
		expect(index).toBe(15 % 7);
		expect(hash.currHash).toBe(15);
	});

	test('doHash animates character hashing for string keys', () => {
		hash.hashType = 'strings';
		const index = hash.doHash('cat');
		expect(index).toBeDefined();
		expect(typeof index).toBe('number');
	});

	test('setURLData parses initialCapacity, loadFactor, hashType, and data', () => {
		const params = new URLSearchParams(
			'initialCapacity=11&loadFactor=75&hashType=Strings&data=cat:pet,dog:bark',
		);
		hash.hashTypeDropDown = { value: 'Integers' };

		hash.setURLData(params);
		expect(hash.resizeInitialTableCall).toHaveBeenCalled();
		expect(hash.loadFactorCallBack).toHaveBeenCalled();
		expect(hash.insertElement).toHaveBeenCalledWith('cat', 'pet');
		expect(hash.insertElement).toHaveBeenCalledWith('dog', 'bark');
	});

	test('setURLData rejects non-integer keys when hashType is integers', () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		hash.hashType = 'integers';
		const params = new URLSearchParams('data=abc:123');

		hash.setURLData(params);
		expect(consoleSpy).toHaveBeenCalledWith(
			'Cannot add non-integer keys when hashType is Integers.',
		);
		consoleSpy.mockRestore();
	});

	test('randomCallback generates random key-value pairs and clears prior state', () => {
		hash.hashType = 'integers';
		hash.randomCallback();
		expect(hash.clear).toHaveBeenCalled();
		expect(hash.insertElement).toHaveBeenCalled();

		hash.clear.mockClear();
		hash.insertElement.mockClear();

		hash.hashType = 'strings';
		hash.randomCallback();
		expect(hash.clear).toHaveBeenCalled();
		expect(hash.insertElement).toHaveBeenCalled();
	});

	test('clearCallback triggers clear implementation', () => {
		hash.clearCallback();
		expect(hash.clear).toHaveBeenCalled();
	});
});

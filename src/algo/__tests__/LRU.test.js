import LRU, { STATUS } from '../LRU';
import pseudocodeText from '../../pseudocode.json';
import timeComplexities from '../../time_complexities.json';

describe('LRU Cache metadata', () => {
	test('LRU pseudocode is defined for put, get, and delete', () => {
		expect(pseudocodeText.LRU).toBeDefined();
		expect(pseudocodeText.LRU.put).toBeDefined();
		expect(pseudocodeText.LRU.get).toBeDefined();
		expect(pseudocodeText.LRU.delete).toBeDefined();

		expect(pseudocodeText.LRU.put.code.length).toBeGreaterThan(0);
		expect(pseudocodeText.LRU.get.code.length).toBeGreaterThan(0);
		expect(pseudocodeText.LRU.delete.code.length).toBeGreaterThan(0);
	});

	test('LRU time complexities are properly defined', () => {
		expect(timeComplexities.LRU).toBeDefined();
		expect(timeComplexities.LRU['LRU Cache']).toBeDefined();
		const ops = timeComplexities.LRU['LRU Cache'];
		expect(ops['put (no eviction)'].big_o).toBe('O(1)');
		expect(ops['put (with eviction)'].big_o).toBe('O(1)');
		expect(ops['get'].big_o).toBe('O(1)');
		expect(ops['delete'].big_o).toBe('O(1)');
	});

	test('STATUS dictionary formats expected status messages', () => {
		expect(STATUS.NEED_KEY_VALUE).toBe('Please enter both a key and a value.');
		expect(STATUS.FORBIDDEN_KEY('__proto__')).toContain('__proto__');
		expect(STATUS.INVALID_CAPACITY(10)).toContain('between 1 and 10');
		expect(STATUS.PUT_HIT('k1', 'v1')).toContain('Cache Hit on key "k1"');
		expect(STATUS.PUT_EVICT(5, 'k_old')).toContain('evicting LRU key "k_old"');
		expect(STATUS.GET_MISS('missing')).toContain('Cache Miss');
		expect(STATUS.GET_HIT('k1')).toContain('Cache Hit');
		expect(STATUS.DEL_COMPLETE('k1')).toContain('delete("k1") complete');
		expect(STATUS.INSPECT('k1', 'v1', 'index 0 (MRU)')).toContain('index 0 (MRU)');
	});
});

describe('LRU Visualization Class (LRU.js)', () => {
	let mockAm;
	let lru;

	beforeEach(() => {
		document.body.innerHTML = `
			<div id="AlgorithmSpecificControls"></div>
			<div id="GeneralAnimationControls"></div>
			<canvas id="canvas" width="1000" height="600"></canvas>
		`;

		mockAm = {
			addListener: jest.fn(),
			startNewAnimation: jest.fn(),
			setAnimationDelay: jest.fn(),
			skipForward: jest.fn(),
			clearHistory: jest.fn(),
			currentlyAnimating: false,
		};

		lru = new LRU(mockAm, 1000, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes default state, controls, and canvas structures', () => {
		expect(lru.capacity).toBe(5);
		expect(lru.map).toBeDefined();
		expect(Object.keys(lru.map).length).toBe(0);
		expect(lru.dll).toEqual([]);
		expect(lru.controls.length).toBeGreaterThan(0);
		expect(lru.putKeyField).toBeDefined();
		expect(lru.putValField).toBeDefined();
		expect(lru.putButton).toBeDefined();
		expect(lru.getKeyField).toBeDefined();
		expect(lru.getButton).toBeDefined();
		expect(lru.deleteKeyField).toBeDefined();
		expect(lru.deleteButton).toBeDefined();
	});

	test('animatePut inserts into cache map and doubly linked list at MRU', () => {
		lru.animatePut('k1', 'v1');

		expect(lru.map['k1']).toBeDefined();
		expect(lru.dll.length).toBe(1);
		expect(lru.dll[0].key).toBe('k1');
		expect(lru.dll[0].value).toBe('v1');

		// Insert second element
		lru.animatePut('k2', 'v2');
		expect(lru.dll.length).toBe(2);
		expect(lru.dll[0].key).toBe('k2'); // MRU
		expect(lru.dll[1].key).toBe('k1'); // LRU
	});

	test('animateGet on existing key moves it to MRU (head of list)', () => {
		lru.animatePut('k1', 'v1');
		lru.animatePut('k2', 'v2');
		lru.animatePut('k3', 'v3');
		// Initial order: k3 (MRU), k2, k1 (LRU)
		expect(lru.dll.map(n => n.key)).toEqual(['k3', 'k2', 'k1']);

		const cmds = lru.animateGet('k1');
		expect(cmds.length).toBeGreaterThan(0);
		// After get(k1), k1 must become MRU
		expect(lru.dll.map(n => n.key)).toEqual(['k1', 'k3', 'k2']);
	});

	test('animateGet on nonexistent key leaves list unchanged', () => {
		lru.animatePut('k1', 'v1');
		const cmds = lru.animateGet('nonexistent');
		expect(cmds.length).toBeGreaterThan(0);
		expect(lru.dll.length).toBe(1);
		expect(lru.dll[0].key).toBe('k1');
	});

	test('animatePut updating an existing key updates value and promotes to MRU without increasing size', () => {
		lru.animatePut('k1', 'v1');
		lru.animatePut('k2', 'v2');
		expect(lru.dll.length).toBe(2);

		lru.animatePut('k1', 'v1_updated');
		expect(lru.dll.length).toBe(2);
		expect(lru.dll[0].key).toBe('k1');
		expect(lru.dll[0].value).toBe('v1_updated');
		expect(lru.dll[1].key).toBe('k2');
	});

	test('evicts the LRU tail node when capacity is exceeded', () => {
		lru.capacity = 2;
		lru.animatePut('1', 'one');
		lru.animatePut('2', 'two');
		expect(lru.dll.map(n => n.key)).toEqual(['2', '1']);

		// Access '1' to make '2' the LRU node
		lru.animateGet('1');
		expect(lru.dll.map(n => n.key)).toEqual(['1', '2']);

		// Put '3' -> evicts '2'
		lru.animatePut('3', 'three');
		expect(lru.map['2']).toBeUndefined();
		expect(lru.map['1']).toBeDefined();
		expect(lru.map['3']).toBeDefined();
		expect(lru.dll.map(n => n.key)).toEqual(['3', '1']);
	});

	test('animateDelete removes element from cache map and dll', () => {
		lru.animatePut('1', 'a');
		lru.animatePut('2', 'b');
		expect(lru.dll.length).toBe(2);

		lru.animateDelete('1');
		expect(lru.map['1']).toBeUndefined();
		expect(lru.dll.length).toBe(1);
		expect(lru.dll[0].key).toBe('2');

		// Deleting nonexistent key causes no errors
		const cmds = lru.animateDelete('nonexistent');
		expect(cmds.length).toBeGreaterThan(0);
		expect(lru.dll.length).toBe(1);
	});

	test('handles inspection mode and clearInspection', () => {
		lru.animatePut('k1', 'v1');
		lru.animatePut('k2', 'v2');

		lru.inspectKey('k1');
		expect(lru.inspectedKey).toBe('k1');

		lru.clearInspection();
		expect(lru.inspectedKey).toBeNull();
	});

	test('putCallback processes valid input and clears fields', () => {
		lru.putKeyField.value = 'userKey';
		lru.putValField.value = 'userVal';
		lru.putCallback();

		expect(lru.map['userKey']).toBeDefined();
		expect(lru.dll[0].key).toBe('userKey');
		expect(lru.dll[0].value).toBe('userVal');
		expect(lru.putKeyField.value).toBe('');
		expect(lru.putValField.value).toBe('');
	});

	test('putCallback with empty inputs shakes button and shows error', () => {
		lru.putKeyField.value = '';
		lru.putValField.value = '';
		lru.putCallback();

		expect(lru.putButton.classList.contains('shake')).toBe(true);
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('getCallback processes valid key, promotes to MRU, and clears field', () => {
		lru.animatePut('g1', 'v1');
		lru.animatePut('g2', 'v2');

		lru.getKeyField.value = 'g1';
		lru.getCallback();

		expect(lru.dll[0].key).toBe('g1');
		expect(lru.getKeyField.value).toBe('');
	});

	test('getCallback with empty key shakes button and shows error', () => {
		lru.getKeyField.value = '';
		lru.getCallback();

		expect(lru.getButton.classList.contains('shake')).toBe(true);
	});

	test('deleteCallback processes valid key and clears field', () => {
		lru.animatePut('d1', 'v1');
		lru.deleteKeyField.value = 'd1';
		lru.deleteCallback();

		expect(lru.map['d1']).toBeUndefined();
		expect(lru.dll.length).toBe(0);
		expect(lru.deleteKeyField.value).toBe('');
	});

	test('deleteCallback with empty key shakes button and shows error', () => {
		lru.deleteKeyField.value = '';
		lru.deleteCallback();

		expect(lru.deleteButton.classList.contains('shake')).toBe(true);
	});

	test('clearCallback empties cache while preserving capacity setting', () => {
		lru.capacity = 3;
		lru.animatePut('c1', 'v1');
		lru.animatePut('c2', 'v2');
		expect(lru.dll.length).toBe(2);

		lru.clearCallback();

		expect(lru.capacity).toBe(3);
		expect(lru.dll.length).toBe(0);
		expect(Object.keys(lru.map).length).toBe(0);
		expect(lru.inspectedKey).toBeNull();
	});

	test('canvas mousemove updates cursor style based on hit testing', () => {
		lru.animatePut('m1', 'v1');
		lru.canvas.getBoundingClientRect = () => ({
			left: 0,
			top: 0,
			width: 1000,
			height: 600,
		});

		// Hover directly over row 0 (MAP_START_Y = 130)
		lru.handleCanvasMouseMove({ clientX: 48, clientY: 130 });
		expect(lru.canvas.style.cursor).toBe('pointer');

		// Hover outside row 0
		lru.handleCanvasMouseMove({ clientX: 500, clientY: 500 });
		expect(lru.canvas.style.cursor).toBe('default');
	});

	test('canvas click toggles inspection and handles outside click', () => {
		lru.animatePut('c1', 'v1');
		lru.canvas.getBoundingClientRect = () => ({
			left: 0,
			top: 0,
			width: 1000,
			height: 600,
		});

		// Click on row 0 -> inspects c1
		lru.handleCanvasClick({ clientX: 48, clientY: 130 });
		expect(lru.inspectedKey).toBe('c1');

		// Click same row again -> dismisses inspection (toggle off)
		lru.handleCanvasClick({ clientX: 48, clientY: 130 });
		expect(lru.inspectedKey).toBeNull();

		// Click on row 0 again -> inspects
		lru.handleCanvasClick({ clientX: 48, clientY: 130 });
		expect(lru.inspectedKey).toBe('c1');

		// Click outside -> dismisses inspection
		lru.handleCanvasClick({ clientX: 500, clientY: 500 });
		expect(lru.inspectedKey).toBeNull();

		// Clicking while animating is ignored
		lru.animationManager.currentlyAnimating = true;
		lru.handleCanvasClick({ clientX: 48, clientY: 130 });
		expect(lru.inspectedKey).toBeNull();
		lru.animationManager.currentlyAnimating = false;
	});

	test('starting any operation automatically dismisses active inspection', () => {
		lru.animatePut('x1', 'v1');
		lru.inspectKey('x1');
		expect(lru.inspectedKey).toBe('x1');

		// Starting a putCallback dismisses inspection
		lru.putKeyField.value = 'x2';
		lru.putValField.value = 'v2';
		lru.putCallback();
		expect(lru.inspectedKey).toBeNull();
	});

	test('rejects invalid capacity inputs during restartCallback', () => {
		lru.capacity = 3;

		// Test 0
		lru.capacityField.value = '0';
		lru.restartCallback();
		expect(lru.capacity).toBe(3); // unchanged

		// Test negative
		lru.capacityField.value = '-5';
		lru.restartCallback();
		expect(lru.capacity).toBe(3);

		// Test > 10
		lru.capacityField.value = '11';
		lru.restartCallback();
		expect(lru.capacity).toBe(3);

		// Test valid capacity
		lru.capacityField.value = '7';
		lru.restartCallback();
		expect(lru.capacity).toBe(7);
	});

	test('rejects forbidden prototype keys in putCallback', () => {
		lru.putKeyField.value = '__proto__';
		lru.putValField.value = 'danger';
		lru.putCallback();

		expect(lru.map['__proto__']).toBeUndefined();
		expect(lru.dll.length).toBe(0);
	});
});

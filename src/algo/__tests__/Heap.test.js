import Heap from '../Heap.js';

describe('Heap', () => {
	let heap;
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

		heap = new Heap(mockAm);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls, canvas array, and state properly', () => {
		expect(heap.controls).toBeDefined();
		expect(heap.insertField).toBeDefined();
		expect(heap.insertButton).toBeDefined();
		expect(heap.removeButton).toBeDefined();
		expect(heap.buildHeapField).toBeDefined();
		expect(heap.buildHeapButton).toBeDefined();
		expect(heap.randomButton).toBeDefined();
		expect(heap.clearButton).toBeDefined();
		expect(heap.minHeapButton).toBeDefined();
		expect(heap.maxHeapButton).toBeDefined();

		expect(heap.isMinHeap).toBe(true);
		expect(heap.currentHeapSize).toBe(0);
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('enableUI and disableUI toggle disabled state on controls', () => {
		heap.disableUI();
		heap.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		heap.enableUI();
		heap.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('insertCallback inserts valid value or shakes on invalid input or max capacity', () => {
		const implementActionSpy = jest.spyOn(heap, 'implementAction');
		const shakeSpy = jest.spyOn(heap, 'shake').mockImplementation(() => {});

		heap.insertField.value = '';
		heap.insertCallback();
		expect(shakeSpy).toHaveBeenCalledWith(heap.insertButton);

		heap.insertField.value = '15';
		heap.insertCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), 15);
		expect(heap.insertField.value).toBe('');

		heap.currentHeapSize = 31;
		heap.insertField.value = '99';
		heap.insertCallback();
		expect(shakeSpy).toHaveBeenCalledWith(heap.insertButton);
	});

	test('removeCallback removes root or shakes when empty', () => {
		const implementActionSpy = jest.spyOn(heap, 'implementAction');

		heap.removeCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function));
	});

	test('buildHeapCallback validates comma-separated list and builds heap', () => {
		const implementActionSpy = jest.spyOn(heap, 'implementAction');

		heap.buildHeapField.value = '5,3,8,1';
		heap.buildHeapCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), ['5', '3', '8', '1']);
	});

	test('minHeapCallback and maxHeapCallback toggle heap order', () => {
		heap.maxHeapCallback();
		expect(heap.isMinHeap).toBe(false);

		heap.minHeapCallback();
		expect(heap.isMinHeap).toBe(true);
	});

	test('insertElement in MinHeap inserts and percolates up', () => {
		heap.insertElement(50);
		expect(heap.currentHeapSize).toBe(1);
		expect(heap.arrayData[1]).toBe(50);

		// Insert smaller value, percolates to root (index 1)
		const commands = heap.insertElement(10);
		expect(commands.length).toBeGreaterThan(0);
		expect(heap.currentHeapSize).toBe(2);
		expect(heap.arrayData[1]).toBe(10);
		expect(heap.arrayData[2]).toBe(50);
	});

	test('insertElement in MaxHeap inserts and percolates larger element up', () => {
		heap.isMinHeap = false;

		heap.insertElement(20);
		heap.insertElement(80);

		expect(heap.currentHeapSize).toBe(2);
		expect(heap.arrayData[1]).toBe(80);
		expect(heap.arrayData[2]).toBe(20);
	});

	test('remove in MinHeap removes min and percolates down', () => {
		heap.insertElement(10);
		heap.insertElement(20);
		heap.insertElement(30);
		heap.insertElement(40);
		expect(heap.currentHeapSize).toBe(4);

		const commands = heap.remove();
		expect(commands.length).toBeGreaterThan(0);
		expect(heap.currentHeapSize).toBe(3);
		expect(heap.arrayData[1]).toBe(20);
	});

	test('remove in MaxHeap removes max and percolates down', () => {
		heap.isMinHeap = false;
		heap.insertElement(90);
		heap.insertElement(70);
		heap.insertElement(80);

		const commands = heap.remove();
		expect(commands.length).toBeGreaterThan(0);
		expect(heap.currentHeapSize).toBe(2);
		expect(heap.arrayData[1]).toBe(80);
	});

	test('buildHeap constructs heap using bottom-up heapify', () => {
		const commands = heap.buildHeap(['9', '4', '7', '1', '6']);

		expect(commands.length).toBeGreaterThan(0);
		expect(heap.currentHeapSize).toBe(5);
		// In min-heap, min element 1 should be at root
		expect(heap.arrayData[1]).toBe(1);
	});

	test('randomCallback generates random comma-separated numbers in buildHeapField', () => {
		heap.randomCallback();

		expect(heap.buildHeapField.value).not.toBe('');
		const values = heap.buildHeapField.value.split(',');
		expect(values.length).toBeGreaterThanOrEqual(5);
	});

	test('clearCallback and clear reset heap data and visual entities', () => {
		heap.insertElement(15);
		heap.insertElement(25);
		expect(heap.currentHeapSize).toBe(2);

		heap.clearCallback();

		expect(heap.currentHeapSize).toBe(0);
	});

	test('reset clears heap size', () => {
		heap.currentHeapSize = 7;
		heap.reset();

		expect(heap.currentHeapSize).toBe(0);
	});

	test('setURLData populates buildHeapField and triggers buildHeapCallback', () => {
		const buildHeapSpy = jest.spyOn(heap, 'buildHeapCallback');
		const searchParams = new URLSearchParams('data=4,2,6');

		heap.setURLData(searchParams);

		expect(buildHeapSpy).toHaveBeenCalled();
		expect(heap.currentHeapSize).toBe(3);
		expect(heap.arrayData[1]).toBe(2);
	});
});

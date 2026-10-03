import QueueArray from '../QueueArray.js';

describe('QueueArray', () => {
	let queue;
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

		queue = new QueueArray(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls, canvas pointers, and labels correctly', () => {
		expect(queue.controls).toBeDefined();
		expect(queue.controls.length).toBe(5);
		expect(queue.enqueueField).toBeDefined();
		expect(queue.enqueueButton).toBeDefined();
		expect(queue.dequeueButton).toBeDefined();
		expect(queue.randomButton).toBeDefined();
		expect(queue.clearButton).toBeDefined();

		expect(queue.front).toBe(0);
		expect(queue.size).toBe(0);
		expect(queue.arraySize).toBe(7);
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('enableUI and disableUI toggle disabled state on controls', () => {
		queue.disableUI();
		queue.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		queue.enableUI();
		queue.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('enqueueCallback enqueues when under capacity and shakes on invalid input or max capacity', () => {
		const implementActionSpy = jest.spyOn(queue, 'implementAction');
		const shakeSpy = jest.spyOn(queue, 'shake').mockImplementation(() => {});

		queue.enqueueField.value = '';
		queue.enqueueCallback();
		expect(shakeSpy).toHaveBeenCalledWith(queue.enqueueButton);

		queue.enqueueField.value = '10';
		queue.enqueueCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), '10');
		expect(queue.enqueueField.value).toBe('');

		// Exceed MAX_SIZE
		queue.size = 30;
		queue.arraySize = 30;
		queue.enqueueField.value = '99';
		queue.enqueueCallback();
		expect(shakeSpy).toHaveBeenCalledWith(queue.enqueueButton);
	});

	test('enqueueCallback triggers resize when array is full and below MAX_SIZE', () => {
		const implementActionSpy = jest.spyOn(queue, 'implementAction');
		queue.size = 7;
		queue.arraySize = 7;
		queue.enqueueField.value = '55';

		queue.enqueueCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), '55');
	});

	test('enqueue executes animation commands and increments size with circular indexing', () => {
		queue.front = 5;
		queue.size = 0;
		const commands = queue.enqueue('X');

		expect(commands.length).toBeGreaterThan(0);
		expect(queue.size).toBe(1);
		expect(queue.arrayData[5]).toBe('X');

		// Second enqueue wraps around modulo 7: (5 + 1) % 7 = 6
		queue.enqueue('Y');
		expect(queue.size).toBe(2);
		expect(queue.arrayData[6]).toBe('Y');

		// Third enqueue wraps around: (5 + 2) % 7 = 0
		queue.enqueue('Z');
		expect(queue.size).toBe(3);
		expect(queue.arrayData[0]).toBe('Z');
	});

	test('dequeueCallback triggers dequeue when size > 0 and shakes when empty', () => {
		const implementActionSpy = jest.spyOn(queue, 'implementAction');
		const shakeSpy = jest.spyOn(queue, 'shake').mockImplementation(() => {});

		queue.dequeueCallback();
		expect(shakeSpy).toHaveBeenCalledWith(queue.dequeueButton);

		queue.size = 1;
		queue.dequeueCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function));
	});

	test('dequeue executes animation commands, advances front with modulo, and decrements size', () => {
		queue.arrayData[0] = 'First';
		queue.size = 1;
		queue.front = 0;

		const commands = queue.dequeue();

		expect(commands.length).toBeGreaterThan(0);
		expect(queue.size).toBe(0);
		expect(queue.front).toBe(1);

		// Circular wrap around for front pointer
		queue.front = 6;
		queue.size = 1;
		queue.arrayData[6] = 'End';
		queue.dequeue();

		expect(queue.size).toBe(0);
		expect(queue.front).toBe(0);
	});

	test('resize unrolls circular elements and enqueues new element into doubled array', () => {
		queue.front = 3;
		queue.size = 7;
		queue.arraySize = 7;
		for (let i = 0; i < 7; i++) {
			queue.arrayData[(3 + i) % 7] = `val${i}`;
		}

		const commands = queue.resize('newVal');

		expect(commands.length).toBeGreaterThan(0);
		expect(queue.front).toBe(0);
		expect(queue.size).toBe(8);
		expect(queue.arraySize).toBe(14);
		expect(queue.arrayData[0]).toBe('val0');
		expect(queue.arrayData[6]).toBe('val6');
		expect(queue.arrayData[7]).toBe('newVal');
	});

	test('randomCallback clears queue and enqueues random elements', () => {
		const clearAllSpy = jest.spyOn(queue, 'clearAll');
		const enqueueSpy = jest.spyOn(queue, 'enqueue');

		queue.randomCallback();

		expect(clearAllSpy).toHaveBeenCalled();
		expect(enqueueSpy).toHaveBeenCalled();
		expect(queue.size).toBeGreaterThan(0);
	});

	test('clearCallback and clearAll reset elements, front pointer, and size', () => {
		queue.enqueue('A');
		queue.enqueue('B');
		expect(queue.size).toBe(2);

		queue.clearCallback();

		expect(queue.size).toBe(0);
		expect(queue.front).toBe(0);
		expect(queue.arraySize).toBe(7);
	});

	test('reset restores initial state', () => {
		queue.size = 5;
		queue.front = 4;
		queue.reset();

		expect(queue.size).toBe(0);
		expect(queue.front).toBe(0);
		expect(queue.arraySize).toBe(7);
	});

	test('setURLData parses and enqueues comma-separated values', () => {
		const searchParams = new URLSearchParams('data=1,2,3');
		queue.setURLData(searchParams);

		expect(queue.size).toBe(3);
		expect(queue.arrayData[0]).toBe('1');
		expect(queue.arrayData[1]).toBe('2');
		expect(queue.arrayData[2]).toBe('3');
	});
});

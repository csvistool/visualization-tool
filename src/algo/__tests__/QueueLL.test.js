import QueueLL from '../QueueLL.js';

describe('QueueLL', () => {
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

		queue = new QueueLL(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls, Head, and Tail pointers properly', () => {
		expect(queue.controls).toBeDefined();
		expect(queue.controls.length).toBe(5);
		expect(queue.enqueueField).toBeDefined();
		expect(queue.enqueueButton).toBeDefined();
		expect(queue.dequeueButton).toBeDefined();
		expect(queue.randomButton).toBeDefined();
		expect(queue.clearButton).toBeDefined();

		expect(queue.top).toBe(0);
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

	test('enqueueCallback enqueues on valid input and shakes on empty input or max capacity', () => {
		const implementActionSpy = jest.spyOn(queue, 'implementAction');
		const shakeSpy = jest.spyOn(queue, 'shake').mockImplementation(() => {});

		queue.enqueueField.value = '';
		queue.enqueueCallback();
		expect(shakeSpy).toHaveBeenCalledWith(queue.enqueueButton);

		queue.enqueueField.value = '25';
		queue.enqueueCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), '25');
		expect(queue.enqueueField.value).toBe('');

		queue.top = 32;
		queue.enqueueField.value = '99';
		queue.enqueueCallback();
		expect(shakeSpy).toHaveBeenCalledWith(queue.enqueueButton);
	});

	test('enqueue to empty queue points Head and Tail to the first node', () => {
		const commands = queue.enqueue('1st');

		expect(commands.length).toBeGreaterThan(0);
		expect(queue.top).toBe(1);
		expect(queue.arrayData[0]).toBe('1st');
	});

	test('enqueue to non-empty queue connects previous node to new node and updates Tail', () => {
		queue.enqueue('1st');
		const commands = queue.enqueue('2nd');

		expect(commands.length).toBeGreaterThan(0);
		expect(queue.top).toBe(2);
		expect(queue.arrayData[0]).toBe('2nd');
		expect(queue.arrayData[1]).toBe('1st');
	});

	test('dequeueCallback triggers dequeue when top > 0 and shakes when empty', () => {
		const implementActionSpy = jest.spyOn(queue, 'implementAction');
		const shakeSpy = jest.spyOn(queue, 'shake').mockImplementation(() => {});

		queue.dequeueCallback();
		expect(shakeSpy).toHaveBeenCalledWith(queue.dequeueButton);

		queue.enqueue('Item');
		queue.dequeueCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function));
	});

	test('dequeue removes front element and points Head to next element', () => {
		queue.enqueue('First');
		queue.enqueue('Second');
		expect(queue.top).toBe(2);

		const commands = queue.dequeue();

		expect(commands.length).toBeGreaterThan(0);
		expect(queue.top).toBe(1);
	});

	test('dequeue from single-element queue nullifies both Head and Tail', () => {
		queue.enqueue('Only');
		expect(queue.top).toBe(1);

		const commands = queue.dequeue();

		expect(commands.length).toBeGreaterThan(0);
		expect(queue.top).toBe(0);
	});

	test('randomCallback clears queue and enqueues random elements', () => {
		const clearAllSpy = jest.spyOn(queue, 'clearAll');
		const enqueueSpy = jest.spyOn(queue, 'enqueue');

		queue.randomCallback();

		expect(clearAllSpy).toHaveBeenCalled();
		expect(enqueueSpy).toHaveBeenCalled();
		expect(queue.top).toBeGreaterThan(0);
	});

	test('clearCallback and clearAll delete all nodes and nullify Head and Tail', () => {
		queue.enqueue('10');
		queue.enqueue('20');
		expect(queue.top).toBe(2);

		queue.clearCallback();

		expect(queue.top).toBe(0);
	});

	test('reset restores initial state', () => {
		queue.top = 5;
		queue.reset();

		expect(queue.top).toBe(0);
		expect(queue.nextIndex).toBe(queue.initialIndex);
	});

	test('setURLData parses and enqueues comma-separated values in sequence', () => {
		const searchParams = new URLSearchParams('data=a,b,c');
		queue.setURLData(searchParams);

		expect(queue.top).toBe(3);
		// Enqueuing a, then b, then c puts c at [0], b at [1], a at [2]
		expect(queue.arrayData[2]).toBe('a');
		expect(queue.arrayData[1]).toBe('b');
		expect(queue.arrayData[0]).toBe('c');
	});
});

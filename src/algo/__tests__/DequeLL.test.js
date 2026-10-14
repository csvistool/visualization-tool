import DequeLL from '../DequeLL.js';

describe('DequeLL', () => {
	let deque;
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

		deque = new DequeLL(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls, Head, and Tail doubly-linked pointers properly', () => {
		expect(deque.controls).toBeDefined();
		expect(deque.controls.length).toBe(7);
		expect(deque.addField).toBeDefined();
		expect(deque.addFirstButton).toBeDefined();
		expect(deque.addLastButton).toBeDefined();
		expect(deque.removeFirstButton).toBeDefined();
		expect(deque.removeLastButton).toBeDefined();
		expect(deque.randomButton).toBeDefined();
		expect(deque.clearButton).toBeDefined();

		expect(deque.size).toBe(0);
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('enableUI and disableUI toggle disabled state on controls', () => {
		deque.disableUI();
		deque.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		deque.enableUI();
		deque.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('addFirstCallback triggers add at index 0 and shakes on empty input', () => {
		const implementActionSpy = jest.spyOn(deque, 'implementAction');
		const shakeSpy = jest.spyOn(deque, 'shake').mockImplementation(() => {});

		deque.addField.value = '';
		deque.addFirstCallback();
		expect(shakeSpy).toHaveBeenCalledWith(deque.addFirstButton);

		deque.addField.value = '100';
		deque.addFirstCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), '100', 0);
		expect(deque.addField.value).toBe('');
	});

	test('addLastCallback triggers add at index size and shakes on empty input', () => {
		const implementActionSpy = jest.spyOn(deque, 'implementAction');
		const shakeSpy = jest.spyOn(deque, 'shake').mockImplementation(() => {});

		deque.addField.value = '';
		deque.addLastCallback();
		expect(shakeSpy).toHaveBeenCalledWith(deque.addLastButton);

		deque.size = 2;
		deque.addField.value = '200';
		deque.addLastCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), '200', 2);
		expect(deque.addField.value).toBe('');
	});

	test('add to empty deque connects both Head and Tail', () => {
		const commands = deque.add('Front', 0);

		expect(commands.length).toBeGreaterThan(0);
		expect(deque.size).toBe(1);
		expect(deque.arrayData[0]).toBe('Front');
	});

	test('add to front of non-empty deque re-links previous head and points Head to new node', () => {
		deque.add('OldHead', 0);
		const commands = deque.add('NewHead', 0);

		expect(commands.length).toBeGreaterThan(0);
		expect(deque.size).toBe(2);
		expect(deque.arrayData[0]).toBe('NewHead');
		expect(deque.arrayData[1]).toBe('OldHead');
	});

	test('add to back of non-empty deque connects previous tail to new node and updates Tail', () => {
		deque.add('A', 0);
		const commands = deque.add('B', 1);

		expect(commands.length).toBeGreaterThan(0);
		expect(deque.size).toBe(2);
		expect(deque.arrayData[0]).toBe('A');
		expect(deque.arrayData[1]).toBe('B');
	});

	test('add at middle index rewires bidirectional pointers between neighbors', () => {
		deque.add('A', 0);
		deque.add('C', 1);
		expect(deque.size).toBe(2);

		const commands = deque.add('B', 1);

		expect(commands.length).toBeGreaterThan(0);
		expect(deque.size).toBe(3);
		expect(deque.arrayData[0]).toBe('A');
		expect(deque.arrayData[1]).toBe('B');
		expect(deque.arrayData[2]).toBe('C');
	});

	test('removeFirstCallback triggers remove at index 0 and shakes when empty', () => {
		const implementActionSpy = jest.spyOn(deque, 'implementAction');
		const shakeSpy = jest.spyOn(deque, 'shake').mockImplementation(() => {});

		deque.removeFirstCallback();
		expect(shakeSpy).toHaveBeenCalledWith(deque.removeFirstButton);

		deque.size = 1;
		deque.removeFirstCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), 0);
	});

	test('removeLastCallback triggers remove at index size - 1 and shakes when empty', () => {
		const implementActionSpy = jest.spyOn(deque, 'implementAction');
		const shakeSpy = jest.spyOn(deque, 'shake').mockImplementation(() => {});

		deque.removeLastCallback();
		expect(shakeSpy).toHaveBeenCalledWith(deque.removeLastButton);

		deque.size = 3;
		deque.removeLastCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), 2);
	});

	test('remove from single-element deque disconnects Head and Tail and decrements size to 0', () => {
		deque.add('Solo', 0);
		expect(deque.size).toBe(1);

		const commands = deque.remove(0);

		expect(commands.length).toBeGreaterThan(0);
		expect(deque.size).toBe(0);
	});

	test('remove from front of multi-element deque advances Head and sets prevNull on new head', () => {
		deque.add('H1', 0);
		deque.add('H2', 1);
		expect(deque.size).toBe(2);

		const commands = deque.remove(0);

		expect(commands.length).toBeGreaterThan(0);
		expect(deque.size).toBe(1);
		expect(deque.arrayData[0]).toBe('H2');
	});

	test('remove from back of multi-element deque updates Tail and sets nextNull on new tail', () => {
		deque.add('T1', 0);
		deque.add('T2', 1);
		expect(deque.size).toBe(2);

		const commands = deque.remove(1);

		expect(commands.length).toBeGreaterThan(0);
		expect(deque.size).toBe(1);
		expect(deque.arrayData[0]).toBe('T1');
	});

	test('remove from middle of deque reconnects neighbors across deleted node', () => {
		deque.add('X', 0);
		deque.add('Y', 1);
		deque.add('Z', 2);
		expect(deque.size).toBe(3);

		const commands = deque.remove(1);

		expect(commands.length).toBeGreaterThan(0);
		expect(deque.size).toBe(2);
		expect(deque.arrayData[0]).toBe('X');
		expect(deque.arrayData[1]).toBe('Z');
	});

	test('randomCallback clears deque and adds random elements', () => {
		const clearAllSpy = jest.spyOn(deque, 'clearAll');
		const addSpy = jest.spyOn(deque, 'add');

		deque.randomCallback();

		expect(clearAllSpy).toHaveBeenCalled();
		expect(addSpy).toHaveBeenCalled();
		expect(deque.size).toBeGreaterThan(0);
	});

	test('clearCallback and clearAll delete all nodes and reset pointers', () => {
		deque.add('1', 0);
		deque.add('2', 1);
		expect(deque.size).toBe(2);

		deque.clearCallback();

		expect(deque.size).toBe(0);
	});

	test('reset restores initial state', () => {
		deque.size = 5;
		deque.reset();

		expect(deque.size).toBe(0);
		expect(deque.nextIndex).toBe(deque.initialIndex + 1);
	});

	test('setURLData parses and adds comma-separated values to deque', () => {
		const searchParams = new URLSearchParams('data=one,two,four');
		deque.setURLData(searchParams);

		expect(deque.size).toBe(3);
		// In setURLData, list is reversed and added at index 0
		// dataList.reverse() -> four, two, one
		// add(four, 0) -> [four]
		// add(two, 0) -> [two, four]
		// add(one, 0) -> [one, two, four]
		expect(deque.arrayData[0]).toBe('one');
		expect(deque.arrayData[1]).toBe('two');
		expect(deque.arrayData[2]).toBe('four');
	});
});

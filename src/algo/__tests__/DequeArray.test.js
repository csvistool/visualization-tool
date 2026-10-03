import DequeArray from '../DequeArray.js';

describe('DequeArray', () => {
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

		deque = new DequeArray(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls, front/size pointers, and labels correctly', () => {
		expect(deque.controls).toBeDefined();
		expect(deque.controls.length).toBe(7);
		expect(deque.addField).toBeDefined();
		expect(deque.addFirstButton).toBeDefined();
		expect(deque.addLastButton).toBeDefined();
		expect(deque.removeFirstButton).toBeDefined();
		expect(deque.removeLastButton).toBeDefined();
		expect(deque.randomButton).toBeDefined();
		expect(deque.clearButton).toBeDefined();

		expect(deque.front).toBe(0);
		expect(deque.size).toBe(0);
		expect(deque.arraySize).toBe(7);
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

	test('addFirstCallBack adds to front or shakes on invalid input or max capacity', () => {
		const implementActionSpy = jest.spyOn(deque, 'implementAction');
		const shakeSpy = jest.spyOn(deque, 'shake').mockImplementation(() => {});

		deque.addField.value = '';
		deque.addFirstCallBack();
		expect(shakeSpy).toHaveBeenCalledWith(deque.addFirstButton);

		deque.addField.value = '11';
		deque.addFirstCallBack();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), '11');
		expect(deque.addField.value).toBe('');

		deque.size = 30;
		deque.arraySize = 30;
		deque.addField.value = '99';
		deque.addFirstCallBack();
		expect(shakeSpy).toHaveBeenCalledWith(deque.addFirstButton);
	});

	test('addFirstCallBack triggers resize when full and under MAX_SIZE', () => {
		const implementActionSpy = jest.spyOn(deque, 'implementAction');
		deque.size = 7;
		deque.arraySize = 7;
		deque.addField.value = '77';

		deque.addFirstCallBack();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), '77', true);
	});

	test('addLastCallback adds to back or shakes on invalid input or max capacity', () => {
		const implementActionSpy = jest.spyOn(deque, 'implementAction');
		const shakeSpy = jest.spyOn(deque, 'shake').mockImplementation(() => {});

		deque.addField.value = '';
		deque.addLastCallback();
		expect(shakeSpy).toHaveBeenCalledWith(deque.addLastButton);

		deque.addField.value = '22';
		deque.addLastCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), '22');
		expect(deque.addField.value).toBe('');

		deque.size = 30;
		deque.arraySize = 30;
		deque.addField.value = '99';
		deque.addLastCallback();
		expect(shakeSpy).toHaveBeenCalledWith(deque.addLastButton);
	});

	test('addLastCallback triggers resize when full and under MAX_SIZE', () => {
		const implementActionSpy = jest.spyOn(deque, 'implementAction');
		deque.size = 7;
		deque.arraySize = 7;
		deque.addField.value = '88';

		deque.addLastCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), '88', false);
	});

	test('addFirst decrements front with circular modulo and increments size', () => {
		deque.front = 0;
		deque.size = 0;

		const commands = deque.addFirst('First');

		expect(commands.length).toBeGreaterThan(0);
		// (0 - 1 + 7) % 7 = 6
		expect(deque.front).toBe(6);
		expect(deque.size).toBe(1);
		expect(deque.arrayData[6]).toBe('First');

		// Add first again: (6 - 1 + 7) % 7 = 5
		deque.addFirst('Second');
		expect(deque.front).toBe(5);
		expect(deque.size).toBe(2);
		expect(deque.arrayData[5]).toBe('Second');
	});

	test('addLast increments size with circular modulo indexing', () => {
		deque.front = 5;
		deque.size = 0;

		const commands = deque.addLast('Back1');

		expect(commands.length).toBeGreaterThan(0);
		expect(deque.size).toBe(1);
		expect(deque.arrayData[5]).toBe('Back1');

		// (5 + 1) % 7 = 6
		deque.addLast('Back2');
		expect(deque.size).toBe(2);
		expect(deque.arrayData[6]).toBe('Back2');

		// (5 + 2) % 7 = 0
		deque.addLast('Back3');
		expect(deque.size).toBe(3);
		expect(deque.arrayData[0]).toBe('Back3');
	});

	test('removeFirstCallback triggers removeFirst when non-empty and shakes when empty', () => {
		const implementActionSpy = jest.spyOn(deque, 'implementAction');
		const shakeSpy = jest.spyOn(deque, 'shake').mockImplementation(() => {});

		deque.removeFirstCallback();
		expect(shakeSpy).toHaveBeenCalledWith(deque.removeFirstButton);

		deque.size = 1;
		deque.removeFirstCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function));
	});

	test('removeFirst advances front with modulo and decrements size', () => {
		deque.front = 6;
		deque.size = 2;
		deque.arrayData[6] = 'OldFront';
		deque.arrayData[0] = 'NextFront';

		const commands = deque.removeFirst();

		expect(commands.length).toBeGreaterThan(0);
		expect(deque.front).toBe(0);
		expect(deque.size).toBe(1);
	});

	test('removeLastCallback triggers removeLast when non-empty and shakes when empty', () => {
		const implementActionSpy = jest.spyOn(deque, 'implementAction');
		const shakeSpy = jest.spyOn(deque, 'shake').mockImplementation(() => {});

		deque.removeLastCallback();
		expect(shakeSpy).toHaveBeenCalledWith(deque.removeLastButton);

		deque.size = 1;
		deque.removeLastCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function));
	});

	test('removeLast removes element from back and decrements size', () => {
		deque.front = 0;
		deque.size = 2;
		deque.arrayData[0] = 'A';
		deque.arrayData[1] = 'B';

		const commands = deque.removeLast();

		expect(commands.length).toBeGreaterThan(0);
		expect(deque.size).toBe(1);
	});

	test('resize for addFirst unrolls elements shifted by 1 into doubled array', () => {
		deque.front = 4;
		deque.size = 7;
		deque.arraySize = 7;
		for (let i = 0; i < 7; i++) {
			deque.arrayData[(4 + i) % 7] = `val${i}`;
		}

		const commands = deque.resize('newHead', true);

		expect(commands.length).toBeGreaterThan(0);
		expect(deque.front).toBe(0);
		expect(deque.size).toBe(8);
		expect(deque.arraySize).toBe(14);
		expect(deque.arrayData[0]).toBe('newHead');
		expect(deque.arrayData[1]).toBe('val0');
		expect(deque.arrayData[7]).toBe('val6');
	});

	test('resize for addLast unrolls elements and adds to back of doubled array', () => {
		deque.front = 4;
		deque.size = 7;
		deque.arraySize = 7;
		for (let i = 0; i < 7; i++) {
			deque.arrayData[(4 + i) % 7] = `val${i}`;
		}

		const commands = deque.resize('newTail', false);

		expect(commands.length).toBeGreaterThan(0);
		expect(deque.front).toBe(0);
		expect(deque.size).toBe(8);
		expect(deque.arraySize).toBe(14);
		expect(deque.arrayData[0]).toBe('val0');
		expect(deque.arrayData[6]).toBe('val6');
		expect(deque.arrayData[7]).toBe('newTail');
	});

	test('randomCallback clears deque and adds random elements', () => {
		const clearAllSpy = jest.spyOn(deque, 'clearAll');
		const addFirstSpy = jest.spyOn(deque, 'addFirst');
		const addLastSpy = jest.spyOn(deque, 'addLast');

		deque.randomCallback();

		expect(clearAllSpy).toHaveBeenCalled();
		expect(addFirstSpy.mock.calls.length + addLastSpy.mock.calls.length).toBeGreaterThan(0);
		expect(deque.size).toBeGreaterThan(0);
	});

	test('clearCallback and clearAll reset elements, front, and size', () => {
		deque.addLast('1');
		deque.addLast('2');
		expect(deque.size).toBe(2);

		deque.clearCallback();

		expect(deque.size).toBe(0);
		expect(deque.front).toBe(0);
		expect(deque.arraySize).toBe(7);
	});

	test('reset restores initial parameters', () => {
		deque.size = 4;
		deque.front = 3;
		deque.reset();

		expect(deque.size).toBe(0);
		expect(deque.front).toBe(0);
		expect(deque.arraySize).toBe(7);
	});

	test('setURLData parses comma-separated values and adds them to back', () => {
		const searchParams = new URLSearchParams('data=x,y,z');
		deque.setURLData(searchParams);

		expect(deque.size).toBe(3);
		expect(deque.arrayData[0]).toBe('x');
		expect(deque.arrayData[1]).toBe('y');
		expect(deque.arrayData[2]).toBe('z');
	});
});

import StackLL from '../StackLL.js';

describe('StackLL', () => {
	let stack;
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

		stack = new StackLL(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls and linked list head entity properly', () => {
		expect(stack.controls).toBeDefined();
		expect(stack.controls.length).toBe(5);
		expect(stack.pushField).toBeDefined();
		expect(stack.pushButton).toBeDefined();
		expect(stack.popButton).toBeDefined();
		expect(stack.randomButton).toBeDefined();
		expect(stack.clearButton).toBeDefined();

		expect(stack.top).toBe(0);
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('enableUI and disableUI toggle disabled state on controls', () => {
		stack.disableUI();
		stack.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		stack.enableUI();
		stack.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('pushCallback triggers push with valid value and shakes on invalid input or max capacity', () => {
		const implementActionSpy = jest.spyOn(stack, 'implementAction');
		const shakeSpy = jest.spyOn(stack, 'shake').mockImplementation(() => {});

		stack.pushField.value = '';
		stack.pushCallback();
		expect(shakeSpy).toHaveBeenCalledWith(stack.pushButton);

		stack.pushField.value = '24';
		stack.pushCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), '24');
		expect(stack.pushField.value).toBe('');

		stack.top = 32;
		stack.pushField.value = '99';
		stack.pushCallback();
		expect(shakeSpy).toHaveBeenCalledWith(stack.pushButton);
	});

	test('push to empty stack creates node and points Head to it', () => {
		const commands = stack.push('A');

		expect(commands.length).toBeGreaterThan(0);
		expect(stack.top).toBe(1);
		expect(stack.arrayData[0]).toBe('A');
	});

	test('push to non-empty stack links new node to previous top and repoints Head', () => {
		stack.push('First');
		const commands = stack.push('Second');

		expect(commands.length).toBeGreaterThan(0);
		expect(stack.top).toBe(2);
		expect(stack.arrayData[1]).toBe('Second');
	});

	test('popCallback triggers pop when top > 0 and shakes when empty', () => {
		const implementActionSpy = jest.spyOn(stack, 'implementAction');
		const shakeSpy = jest.spyOn(stack, 'shake').mockImplementation(() => {});

		stack.popCallback();
		expect(shakeSpy).toHaveBeenCalledWith(stack.popButton);

		stack.push('X');
		stack.popCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function));
	});

	test('pop from multi-element stack removes top and points Head to predecessor', () => {
		stack.push('X');
		stack.push('Y');
		expect(stack.top).toBe(2);

		const commands = stack.pop();

		expect(commands.length).toBeGreaterThan(0);
		expect(stack.top).toBe(1);
	});

	test('pop from single-element stack sets Head back to null', () => {
		stack.push('Only');
		expect(stack.top).toBe(1);

		const commands = stack.pop();

		expect(commands.length).toBeGreaterThan(0);
		expect(stack.top).toBe(0);
	});

	test('randomCallback clears stack and pushes random elements', () => {
		const clearAllSpy = jest.spyOn(stack, 'clearAll');
		const pushSpy = jest.spyOn(stack, 'push');

		stack.randomCallback();

		expect(clearAllSpy).toHaveBeenCalled();
		expect(pushSpy).toHaveBeenCalled();
		expect(stack.top).toBeGreaterThan(0);
	});

	test('clearCallback and clearAll delete all nodes and nullify Head', () => {
		stack.push('1');
		stack.push('2');
		expect(stack.top).toBe(2);

		stack.clearCallback();

		expect(stack.top).toBe(0);
	});

	test('reset resets top and nextIndex', () => {
		stack.top = 4;
		stack.reset();

		expect(stack.top).toBe(0);
		expect(stack.nextIndex).toBe(stack.initialIndex);
	});

	test('setURLData parses and pushes comma-separated values in reverse order', () => {
		const searchParams = new URLSearchParams('data=one,two,four');
		stack.setURLData(searchParams);

		expect(stack.top).toBe(3);
		// With dataList.reverse(), order of pushes is four, two, one
		expect(stack.arrayData[0]).toBe('four');
		expect(stack.arrayData[1]).toBe('two');
		expect(stack.arrayData[2]).toBe('one');
	});
});

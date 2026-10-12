import StackArray from '../StackArray.js';

describe('StackArray', () => {
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

		stack = new StackArray(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls, canvas entities, and labels properly', () => {
		expect(stack.controls).toBeDefined();
		expect(stack.controls.length).toBe(5);
		expect(stack.pushField).toBeDefined();
		expect(stack.pushButton).toBeDefined();
		expect(stack.popButton).toBeDefined();
		expect(stack.randomButton).toBeDefined();
		expect(stack.clearButton).toBeDefined();

		expect(stack.top).toBe(0);
		expect(stack.arraySize).toBe(7);
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

	test('pushCallback triggers push action when input is valid and under capacity', () => {
		const implementActionSpy = jest.spyOn(stack, 'implementAction');
		stack.pushField.value = '42';

		stack.pushCallback();

		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), '42');
		expect(stack.pushField.value).toBe('');
	});

	test('pushCallback shakes button on empty input', () => {
		const shakeSpy = jest.spyOn(stack, 'shake').mockImplementation(() => {});
		stack.pushField.value = '';

		stack.pushCallback();

		expect(shakeSpy).toHaveBeenCalledWith(stack.pushButton);
	});

	test('pushCallback triggers resize action when array is full and below max size', () => {
		const implementActionSpy = jest.spyOn(stack, 'implementAction');
		stack.top = stack.arrayData.length;
		stack.pushField.value = '99';

		stack.pushCallback();

		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), '99');
	});

	test('pushCallback shakes button when array exceeds MAX_SIZE', () => {
		const shakeSpy = jest.spyOn(stack, 'shake').mockImplementation(() => {});
		stack.top = 30;
		stack.arrayData = new Array(30);
		stack.pushField.value = '100';

		stack.pushCallback();

		expect(shakeSpy).toHaveBeenCalledWith(stack.pushButton);
	});

	test('push executes animation commands and increments top', () => {
		const commands = stack.push('15');

		expect(commands.length).toBeGreaterThan(0);
		expect(stack.top).toBe(1);
		expect(stack.arrayData[0]).toBe('15');
	});

	test('popCallback triggers pop when top > 0 and shakes when empty', () => {
		const implementActionSpy = jest.spyOn(stack, 'implementAction');
		const shakeSpy = jest.spyOn(stack, 'shake').mockImplementation(() => {});

		stack.popCallback();
		expect(shakeSpy).toHaveBeenCalledWith(stack.popButton);

		stack.top = 1;
		stack.popCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function));
	});

	test('pop executes animation commands and decrements top', () => {
		stack.push('50');
		expect(stack.top).toBe(1);

		const commands = stack.pop();

		expect(commands.length).toBeGreaterThan(0);
		expect(stack.top).toBe(0);
		expect(stack.arrayData[0]).toBe('');
	});

	test('resize creates doubled array and moves existing elements', () => {
		for (let i = 0; i < 7; i++) {
			stack.arrayData[i] = `${i}`;
		}
		stack.top = 7;

		const commands = stack.resize('77');

		expect(commands.length).toBeGreaterThan(0);
		expect(stack.top).toBe(8);
		expect(stack.arraySize).toBe(14);
		expect(stack.arrayData[7]).toBe('77');
	});

	test('randomCallback clears and pushes random elements', () => {
		const clearAllSpy = jest.spyOn(stack, 'clearAll');
		const pushSpy = jest.spyOn(stack, 'push');

		stack.randomCallback();

		expect(clearAllSpy).toHaveBeenCalled();
		expect(pushSpy).toHaveBeenCalled();
		expect(stack.top).toBeGreaterThan(0);
	});

	test('clearCallback, clearData, and clearAll reset array text and size', () => {
		stack.push('1');
		stack.push('2');
		expect(stack.top).toBe(2);

		stack.clearCallback();

		expect(stack.top).toBe(0);
		expect(stack.arraySize).toBe(7);
	});

	test('reset restores initial state', () => {
		stack.top = 5;
		stack.reset();

		expect(stack.top).toBe(0);
		expect(stack.arrayData.length).toBe(7);
	});

	test('setURLData parses and pushes comma-separated values', () => {
		const searchParams = new URLSearchParams('data=10,20,30');
		stack.setURLData(searchParams);

		expect(stack.top).toBe(3);
		expect(stack.arrayData[0]).toBe('10');
		expect(stack.arrayData[1]).toBe('20');
		expect(stack.arrayData[2]).toBe('30');
	});
});

import AVL from '../AVL.js';

describe('AVL', () => {
	let avl;
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

		avl = new AVL(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls, radio groups, and state properly', () => {
		expect(avl.controls).toBeDefined();
		expect(avl.insertField).toBeDefined();
		expect(avl.insertButton).toBeDefined();
		expect(avl.deleteField).toBeDefined();
		expect(avl.deleteButton).toBeDefined();
		expect(avl.findField).toBeDefined();
		expect(avl.findButton).toBeDefined();
		expect(avl.printButton).toBeDefined();
		expect(avl.randomButton).toBeDefined();
		expect(avl.clearButton).toBeDefined();
		expect(avl.predButton).toBeDefined();
		expect(avl.succButton).toBeDefined();

		expect(avl.predSucc).toBe('succ');
		expect(avl.treeRoot).toBeFalsy();
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('enableUI and disableUI toggle disabled state on controls', () => {
		avl.disableUI();
		avl.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		avl.enableUI();
		avl.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('insertCallback inserts valid value or shakes when empty', () => {
		const implementActionSpy = jest.spyOn(avl, 'implementAction');
		const shakeSpy = jest.spyOn(avl, 'shake').mockImplementation(() => {});

		avl.insertField.value = '';
		avl.insertCallback();
		expect(shakeSpy).toHaveBeenCalledWith(avl.insertButton);

		avl.insertField.value = '45';
		avl.insertCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), '45');
		expect(avl.insertField.value).toBe('');
	});

	test('deleteCallback deletes valid value when tree exists or shakes when invalid', () => {
		const implementActionSpy = jest.spyOn(avl, 'implementAction');
		const shakeSpy = jest.spyOn(avl, 'shake').mockImplementation(() => {});

		avl.deleteField.value = '10';
		avl.deleteCallback();
		expect(shakeSpy).toHaveBeenCalledWith(avl.deleteButton);

		avl.add('10');
		avl.deleteField.value = '';
		avl.deleteCallback();
		expect(shakeSpy).toHaveBeenCalledWith(avl.deleteButton);

		avl.deleteField.value = '10';
		avl.deleteCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), '10');
		expect(avl.deleteField.value).toBe('');
	});

	test('findCallback searches for value or shakes when empty', () => {
		const implementActionSpy = jest.spyOn(avl, 'implementAction');
		const shakeSpy = jest.spyOn(avl, 'shake').mockImplementation(() => {});

		avl.findField.value = '';
		avl.findCallback();
		expect(shakeSpy).toHaveBeenCalledWith(avl.findButton);

		avl.findField.value = '20';
		avl.findCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), '20');
		expect(avl.findField.value).toBe('');
	});

	test('printCallback triggers print action when tree exists or shakes when empty', () => {
		const implementActionSpy = jest.spyOn(avl, 'implementAction');
		const shakeSpy = jest.spyOn(avl, 'shake').mockImplementation(() => {});

		avl.printCallback();
		expect(shakeSpy).toHaveBeenCalledWith(avl.printButton);

		avl.add('10');
		avl.printCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function));
	});

	test('pred/succ radio buttons update predSucc mode', () => {
		avl.predButton.onclick();
		expect(avl.predSucc).toBe('pred');

		avl.succButton.onclick();
		expect(avl.predSucc).toBe('succ');
	});

	test('add handles single right rotation (LL imbalance)', () => {
		avl.add('30');
		avl.add('20');
		const commands = avl.add('10');

		expect(commands.length).toBeGreaterThan(0);
		expect(avl.treeRoot.data).toBe('20');
		expect(avl.treeRoot.left.data).toBe('10');
		expect(avl.treeRoot.right.data).toBe('30');
	});

	test('add handles single left rotation (RR imbalance)', () => {
		avl.add('10');
		avl.add('20');
		const commands = avl.add('30');

		expect(commands.length).toBeGreaterThan(0);
		expect(avl.treeRoot.data).toBe('20');
		expect(avl.treeRoot.left.data).toBe('10');
		expect(avl.treeRoot.right.data).toBe('30');
	});

	test('add handles double left-right rotation (LR imbalance)', () => {
		avl.add('30');
		avl.add('10');
		const commands = avl.add('20');

		expect(commands.length).toBeGreaterThan(0);
		expect(avl.treeRoot.data).toBe('20');
		expect(avl.treeRoot.left.data).toBe('10');
		expect(avl.treeRoot.right.data).toBe('30');
	});

	test('add handles double right-left rotation (RL imbalance)', () => {
		avl.add('10');
		avl.add('30');
		const commands = avl.add('20');

		expect(commands.length).toBeGreaterThan(0);
		expect(avl.treeRoot.data).toBe('20');
		expect(avl.treeRoot.left.data).toBe('10');
		expect(avl.treeRoot.right.data).toBe('30');
	});

	test('findElement traverses tree searching for value', () => {
		avl.add('20');
		avl.add('10');
		avl.add('30');

		const commandsFound = avl.findElement('30');
		expect(commandsFound.length).toBeGreaterThan(0);

		const commandsNotFound = avl.findElement('999');
		expect(commandsNotFound.length).toBeGreaterThan(0);
	});

	test('remove deletes nodes and rebalances tree', () => {
		avl.add('50');
		avl.add('25');
		avl.add('75');
		avl.add('10');
		avl.add('30');
		avl.add('60');
		avl.add('80');

		// Delete leaf
		let commands = avl.remove('10');
		expect(commands.length).toBeGreaterThan(0);

		// Delete node with one child
		commands = avl.remove('25');
		expect(commands.length).toBeGreaterThan(0);

		// Delete node with two children using successor
		avl.predSucc = 'succ';
		commands = avl.remove('75');
		expect(commands.length).toBeGreaterThan(0);

		// Delete root node
		commands = avl.remove('50');
		expect(commands.length).toBeGreaterThan(0);

		// Delete non-existent node
		commands = avl.remove('999');
		expect(commands.length).toBeGreaterThan(0);
	});

	test('printTree prints nodes in-order without throwing', () => {
		expect(avl.printTree()).toEqual([]);

		avl.add('20');
		avl.add('10');
		avl.add('30');

		const commands = avl.printTree();
		expect(commands.length).toBeGreaterThan(0);
	});

	test('sizeChanged updates tree starting coordinate', () => {
		avl.sizeChanged(1000);
		expect(avl.startingX).toBe(500);
	});

	test('randomCallback clears and adds random elements', () => {
		const clearSpy = jest.spyOn(avl, 'clear');
		const addSpy = jest.spyOn(avl, 'add');

		avl.randomCallback();

		expect(clearSpy).toHaveBeenCalled();
		expect(addSpy).toHaveBeenCalled();
		expect(avl.treeRoot).not.toBeNull();
	});

	test('clearCallback and clear reset tree structure', () => {
		avl.add('10');
		avl.add('20');
		expect(avl.treeRoot).not.toBeNull();

		avl.clearCallback();

		expect(avl.treeRoot).toBeNull();
	});

	test('reset clears internal fields', () => {
		avl.treeRoot = { data: 'dummy' };
		avl.reset();

		expect(avl.treeRoot).toBeNull();
		expect(avl.nextIndex).toBe(1);
	});

	test('setURLData parses predSucc and loads data items', () => {
		const searchParams = new URLSearchParams('predSucc=pred&data=15,10,25');
		avl.setURLData(searchParams);

		expect(avl.predSucc).toBe('pred');
		expect(avl.treeRoot).not.toBeNull();
		expect(avl.treeRoot.data).toBe(15);
		expect(avl.treeRoot.left.data).toBe(10);
		expect(avl.treeRoot.right.data).toBe(25);

		const searchParamsSucc = new URLSearchParams('predSucc=succ');
		avl.setURLData(searchParamsSucc);
		expect(avl.predSucc).toBe('succ');
	});
});

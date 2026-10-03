import BST from '../BST.js';

describe('BST', () => {
	let bst;
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

		bst = new BST(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls and radio groups properly', () => {
		expect(bst.controls).toBeDefined();
		expect(bst.insertField).toBeDefined();
		expect(bst.insertButton).toBeDefined();
		expect(bst.deleteField).toBeDefined();
		expect(bst.deleteButton).toBeDefined();
		expect(bst.findField).toBeDefined();
		expect(bst.findButton).toBeDefined();
		expect(bst.traverseButton).toBeDefined();
		expect(bst.randomButton).toBeDefined();
		expect(bst.clearButton).toBeDefined();
		expect(bst.preOrderSelect).toBeDefined();
		expect(bst.inOrderSelect).toBeDefined();
		expect(bst.postOrderSelect).toBeDefined();
		expect(bst.levelOrderSelect).toBeDefined();
		expect(bst.predButton).toBeDefined();
		expect(bst.succButton).toBeDefined();

		expect(bst.traversal).toBe('pre');
		expect(bst.predSucc).toBe('succ');
		expect(bst.treeRoot).toBeFalsy();
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('enableUI and disableUI toggle disabled state on controls', () => {
		bst.disableUI();
		bst.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		bst.enableUI();
		bst.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('insertCallback inserts valid value or shakes when empty', () => {
		const implementActionSpy = jest.spyOn(bst, 'implementAction');
		const shakeSpy = jest.spyOn(bst, 'shake').mockImplementation(() => {});

		bst.insertField.value = '';
		bst.insertCallback();
		expect(shakeSpy).toHaveBeenCalledWith(bst.insertButton);

		bst.insertField.value = '50';
		bst.insertCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), '50');
		expect(bst.insertField.value).toBe('');
	});

	test('deleteCallback deletes valid value when tree exists or shakes when invalid', () => {
		const implementActionSpy = jest.spyOn(bst, 'implementAction');
		const shakeSpy = jest.spyOn(bst, 'shake').mockImplementation(() => {});

		bst.deleteField.value = '20';
		bst.deleteCallback();
		expect(shakeSpy).toHaveBeenCalledWith(bst.deleteButton);

		bst.add('50');
		bst.deleteField.value = '';
		bst.deleteCallback();
		expect(shakeSpy).toHaveBeenCalledWith(bst.deleteButton);

		bst.deleteField.value = '50';
		bst.deleteCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), '50');
		expect(bst.deleteField.value).toBe('');
	});

	test('findCallback searches for value when tree exists or shakes when invalid', () => {
		const implementActionSpy = jest.spyOn(bst, 'implementAction');
		const shakeSpy = jest.spyOn(bst, 'shake').mockImplementation(() => {});

		bst.findField.value = '10';
		bst.findCallback();
		expect(shakeSpy).toHaveBeenCalledWith(bst.findButton);

		bst.add('30');
		bst.findField.value = '30';
		bst.findCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), '30');
		expect(bst.findField.value).toBe('');
	});

	test('traverseCallback triggers traversal action and selection clicks update state', () => {
		const implementActionSpy = jest.spyOn(bst, 'implementAction');

		bst.inOrderSelect.onclick();
		expect(bst.traversal).toBe('in');

		bst.postOrderSelect.onclick();
		expect(bst.traversal).toBe('post');

		bst.levelOrderSelect.onclick();
		expect(bst.traversal).toBe('level');

		bst.preOrderSelect.onclick();
		expect(bst.traversal).toBe('pre');

		bst.traverseCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function));
	});

	test('pred/succ radio buttons update predSucc mode', () => {
		bst.predButton.onclick();
		expect(bst.predSucc).toBe('pred');

		bst.succButton.onclick();
		expect(bst.predSucc).toBe('succ');
	});

	test('add builds binary search tree structure correctly', () => {
		bst.add('50');
		expect(bst.treeRoot).not.toBeNull();
		expect(bst.treeRoot.data).toBe('50');

		bst.add('25');
		expect(bst.treeRoot.left).not.toBeNull();
		expect(bst.treeRoot.left.data).toBe('25');

		bst.add('75');
		expect(bst.treeRoot.right).not.toBeNull();
		expect(bst.treeRoot.right.data).toBe('75');

		// Duplicate insertion
		const commands = bst.add('50');
		expect(commands.length).toBeGreaterThan(0);
	});

	test('findElement traverses tree searching for key', () => {
		bst.add('50');
		bst.add('25');
		bst.add('75');

		const commandsFound = bst.findElement('75');
		expect(commandsFound.length).toBeGreaterThan(0);

		const commandsNotFound = bst.findElement('999');
		expect(commandsNotFound.length).toBeGreaterThan(0);
	});

	test('remove deletes leaf node, one-child node, and two-children node', () => {
		bst.add('50');
		bst.add('25');
		bst.add('75');
		bst.add('10');
		bst.add('60');
		bst.add('80');

		// Delete leaf node (10)
		let commands = bst.remove('10');
		expect(commands.length).toBeGreaterThan(0);
		expect(bst.treeRoot.left.left).toBeNull();

		// Delete node with one child (75 has 60 and 80, but let's delete 80 first so 75 has one child)
		bst.remove('80');
		commands = bst.remove('75');
		expect(commands.length).toBeGreaterThan(0);

		// Delete node with two children using successor
		bst.predSucc = 'succ';
		bst.add('65');
		bst.add('55');
		commands = bst.remove('60');
		expect(commands.length).toBeGreaterThan(0);

		// Delete node with two children using predecessor
		bst.predSucc = 'pred';
		bst.add('15');
		bst.add('35');
		commands = bst.remove('25');
		expect(commands.length).toBeGreaterThan(0);

		// Delete root node
		commands = bst.remove('50');
		expect(commands.length).toBeGreaterThan(0);

		// Delete non-existent node
		commands = bst.remove('9999');
		expect(commands.length).toBeGreaterThan(0);
	});

	test('traversals (pre, in, post, level) execute without error', () => {
		bst.add('50');
		bst.add('20');
		bst.add('70');

		bst.traversal = 'pre';
		let commands = bst.traverse();
		expect(commands.length).toBeGreaterThan(0);

		bst.traversal = 'in';
		commands = bst.traverse();
		expect(commands.length).toBeGreaterThan(0);

		bst.traversal = 'post';
		commands = bst.traverse();
		expect(commands.length).toBeGreaterThan(0);

		bst.traversal = 'level';
		commands = bst.traverse();
		expect(commands.length).toBeGreaterThan(0);
	});

	test('sizeChanged updates tree starting coordinate', () => {
		bst.sizeChanged(1200);
		expect(bst.startingX).toBe(600);
	});

	test('randomCallback clears and populates random elements', () => {
		const clearSpy = jest.spyOn(bst, 'clear');
		const addSpy = jest.spyOn(bst, 'add');

		bst.randomCallback();

		expect(clearSpy).toHaveBeenCalled();
		expect(addSpy).toHaveBeenCalled();
		expect(bst.treeRoot).not.toBeNull();
	});

	test('clearCallback and clear reset tree structure', () => {
		bst.add('10');
		bst.add('20');
		expect(bst.treeRoot).not.toBeNull();

		bst.clearCallback();

		expect(bst.treeRoot).toBeNull();
	});

	test('reset clears internal fields', () => {
		bst.treeRoot = { data: 'dummy' };
		bst.reset();

		expect(bst.treeRoot).toBeNull();
		expect(bst.nextIndex).toBe(1);
	});

	test('setURLData parses predSucc setting and data elements', () => {
		const searchParams = new URLSearchParams('predSucc=pred&data=40,20,60');
		bst.setURLData(searchParams);

		expect(bst.predSucc).toBe('pred');
		expect(bst.treeRoot).not.toBeNull();
		expect(bst.treeRoot.data).toBe(40);
		expect(bst.treeRoot.left.data).toBe(20);
		expect(bst.treeRoot.right.data).toBe(60);

		const searchParamsSucc = new URLSearchParams('predSucc=succ');
		bst.setURLData(searchParamsSucc);
		expect(bst.predSucc).toBe('succ');
	});
});

import SplayTree from '../SplayTree.js';

describe('SplayTree', () => {
	let splayTree;
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

		splayTree = new SplayTree(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls and state properly', () => {
		expect(splayTree.controls).toBeDefined();
		expect(splayTree.insertField).toBeDefined();
		expect(splayTree.insertButton).toBeDefined();
		expect(splayTree.deleteField).toBeDefined();
		expect(splayTree.deleteButton).toBeDefined();
		expect(splayTree.findField).toBeDefined();
		expect(splayTree.findButton).toBeDefined();
		expect(splayTree.printButton).toBeDefined();
		expect(splayTree.randomButton).toBeDefined();
		expect(splayTree.clearButton).toBeDefined();

		expect(splayTree.treeRoot).toBeFalsy();
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('enableUI and disableUI toggle disabled state on controls', () => {
		splayTree.disableUI();
		splayTree.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		splayTree.enableUI();
		splayTree.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('insertCallback inserts valid value or shakes when empty', () => {
		const implementActionSpy = jest.spyOn(splayTree, 'implementAction');
		const shakeSpy = jest.spyOn(splayTree, 'shake').mockImplementation(() => {});

		splayTree.insertField.value = '';
		splayTree.insertCallback();
		expect(shakeSpy).toHaveBeenCalledWith(splayTree.insertButton);

		splayTree.insertField.value = '35';
		splayTree.insertCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), 35);
		expect(splayTree.insertField.value).toBe('');
	});

	test('deleteCallback deletes valid value or shakes when empty', () => {
		const implementActionSpy = jest.spyOn(splayTree, 'implementAction');
		const shakeSpy = jest.spyOn(splayTree, 'shake').mockImplementation(() => {});

		splayTree.deleteField.value = '';
		splayTree.deleteCallback();
		expect(shakeSpy).toHaveBeenCalledWith(splayTree.deleteButton);

		splayTree.deleteField.value = '35';
		splayTree.deleteCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), 35);
		expect(splayTree.deleteField.value).toBe('');
	});

	test('findCallback searches for value or shakes when empty', () => {
		const implementActionSpy = jest.spyOn(splayTree, 'implementAction');
		const shakeSpy = jest.spyOn(splayTree, 'shake').mockImplementation(() => {});

		splayTree.findField.value = '';
		splayTree.findCallback();
		expect(shakeSpy).toHaveBeenCalledWith(splayTree.findButton);

		splayTree.findField.value = '55';
		splayTree.findCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function), 55);
		expect(splayTree.findField.value).toBe('');
	});

	test('printCallback triggers print action', () => {
		const implementActionSpy = jest.spyOn(splayTree, 'implementAction');

		splayTree.printCallback();
		expect(implementActionSpy).toHaveBeenCalledWith(expect.any(Function));
	});

	test('insertElement splays inserted elements to root with zig, zig-zig, and zig-zag rotations', () => {
		// Single element becomes root
		let commands = splayTree.insertElement(50);
		expect(commands.length).toBeGreaterThan(0);
		expect(splayTree.treeRoot.data).toBe(50);

		// Insert second element (zig rotation)
		commands = splayTree.insertElement(25);
		expect(commands.length).toBeGreaterThan(0);
		expect(splayTree.treeRoot.data).toBe(25);
		expect(splayTree.treeRoot.right.data).toBe(50);

		// Insert third element along same line (zig-zig rotation)
		commands = splayTree.insertElement(10);
		expect(commands.length).toBeGreaterThan(0);
		expect(splayTree.treeRoot.data).toBe(10);

		// Insert fourth element creating zig-zag rotation
		commands = splayTree.insertElement(30);
		expect(commands.length).toBeGreaterThan(0);
		expect(splayTree.treeRoot.data).toBe(30);
	});

	test('findElement finds existing node or closest node and splays it to root', () => {
		splayTree.insertElement(20);
		splayTree.insertElement(40);
		splayTree.insertElement(60);

		// Find existing element 20
		let commands = splayTree.findElement(20);
		expect(commands.length).toBeGreaterThan(0);
		expect(splayTree.treeRoot.data).toBe(20);

		// Search for non-existing element 50
		commands = splayTree.findElement(50);
		expect(commands.length).toBeGreaterThan(0);
		expect(splayTree.treeRoot).not.toBeNull();
	});

	test('deleteElement removes value and restructures tree', () => {
		// Delete from empty tree
		let commands = splayTree.deleteElement(10);
		expect(commands.length).toBeGreaterThan(0);

		splayTree.insertElement(10);
		splayTree.insertElement(20);
		splayTree.insertElement(30);
		expect(splayTree.treeRoot.data).toBe(30);

		// Delete 20
		commands = splayTree.deleteElement(20);
		expect(commands.length).toBeGreaterThan(0);

		// Delete root 30
		commands = splayTree.deleteElement(30);
		expect(commands.length).toBeGreaterThan(0);
		expect(splayTree.treeRoot.data).toBe(10);
	});

	test('printTree traverses tree in-order', () => {
		expect(splayTree.printTree()).toEqual([]);

		splayTree.insertElement(10);
		splayTree.insertElement(20);

		const commands = splayTree.printTree();
		expect(commands.length).toBeGreaterThan(0);
	});

	test('randomCallback clears tree and inserts random elements', () => {
		const clearSpy = jest.spyOn(splayTree, 'clear');
		const insertSpy = jest.spyOn(splayTree, 'insertElement');

		splayTree.randomCallback();

		expect(clearSpy).toHaveBeenCalled();
		expect(insertSpy).toHaveBeenCalled();
		expect(splayTree.treeRoot).not.toBeNull();
	});

	test('clearCallback and clear reset tree structure', () => {
		splayTree.insertElement(10);
		splayTree.insertElement(20);
		expect(splayTree.treeRoot).not.toBeNull();

		splayTree.clearCallback();

		expect(splayTree.treeRoot).toBeNull();
	});

	test('reset resets treeRoot and nextIndex', () => {
		splayTree.treeRoot = { data: 'dummy' };
		splayTree.reset();

		expect(splayTree.treeRoot).toBeNull();
		expect(splayTree.nextIndex).toBe(1);
	});

	test('setURLData parses comma-separated data and inserts into splay tree', () => {
		const searchParams = new URLSearchParams('data=15,25,35');
		splayTree.setURLData(searchParams);

		expect(splayTree.treeRoot).not.toBeNull();
		// In splay tree, last inserted element 35 is splayed to root
		expect(splayTree.treeRoot.data).toBe(35);
	});
});

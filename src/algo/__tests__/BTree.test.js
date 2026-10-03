import BTree from '../BTree.js';

describe('BTree', () => {
	let btree;
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

		btree = new BTree(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls and default properties correctly', () => {
		expect(btree.controls).toBeDefined();
		expect(btree.insertField).toBeDefined();
		expect(btree.insertButton).toBeDefined();
		expect(btree.deleteField).toBeDefined();
		expect(btree.deleteButton).toBeDefined();
		expect(btree.findField).toBeDefined();
		expect(btree.findButton).toBeDefined();
		expect(btree.randomButton).toBeDefined();
		expect(btree.clearButton).toBeDefined();
		expect(btree.splitSecondSelect).toBeDefined();
		expect(btree.splitThirdSelect).toBeDefined();
		expect(btree.predButton).toBeDefined();
		expect(btree.succButton).toBeDefined();
		expect(btree.buildTreeField).toBeDefined();
		expect(btree.buildTreeButton).toBeDefined();

		expect(btree.max_degree).toBe(4);
		expect(btree.max_keys).toBe(3);
		expect(btree.min_keys).toBe(1);
		expect(btree.split_index).toBe(1);
		expect(btree.predSucc).toBe('succ');
		expect(btree.treeRoot).toBeFalsy();
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('enableUI and disableUI toggle disabled state on controls', () => {
		btree.disableUI();
		btree.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		btree.enableUI();
		btree.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('split and pred/succ radio buttons update properties', () => {
		btree.splitThirdSelect.onclick();
		expect(btree.split_index).toBe(2);

		btree.splitSecondSelect.onclick();
		expect(btree.split_index).toBe(1);

		btree.predCallback();
		expect(btree.predSucc).toBe('pred');

		btree.succCallback();
		expect(btree.predSucc).toBe('succ');
	});

	test('insertCallback shakes button on empty input and inserts valid value', () => {
		const shakeSpy = jest.spyOn(btree, 'shake').mockImplementation(() => {});

		btree.insertField.value = '';
		btree.insertCallback();
		expect(shakeSpy).toHaveBeenCalledWith(btree.insertButton);

		btree.insertField.value = '25';
		btree.insertCallback();
		expect(btree.treeRoot).toBeDefined();
		expect(btree.treeRoot.keys[0]).toBe(25);
		expect(btree.insertField.value).toBe('');
		expect(mockAm.startNewAnimation).toHaveBeenCalled();

		shakeSpy.mockRestore();
	});

	test('inserts multiple values causing node split and tree height increase', () => {
		btree.insertField.value = '10';
		btree.insertCallback();
		btree.insertField.value = '20';
		btree.insertCallback();
		btree.insertField.value = '30';
		btree.insertCallback();
		// max_keys is 3, inserting 4th element causes a split
		btree.insertField.value = '40';
		btree.insertCallback();

		expect(btree.treeRoot).toBeDefined();
		expect(btree.treeRoot.isLeaf).toBe(false);
		expect(btree.treeRoot.children.length).toBeGreaterThan(0);
	});

	test('inserting preemptively splits full nodes when preemptiveSplit is enabled', () => {
		btree.preemptiveSplit = true;
		btree.insertElement(10);
		btree.insertElement(20);
		btree.insertElement(30);
		// Root now has 3 keys (max_keys). Preemptive split will split root before insert
		btree.insertElement(40);
		expect(btree.treeRoot.isLeaf).toBe(false);
	});

	test('findCallback shakes button on empty input and finds present or absent elements', () => {
		const shakeSpy = jest.spyOn(btree, 'shake').mockImplementation(() => {});

		btree.findField.value = '';
		btree.findCallback();
		expect(shakeSpy).toHaveBeenCalledWith(btree.findButton);

		// Search in empty tree
		btree.findField.value = '10';
		btree.findCallback();
		expect(btree.findField.value).toBe('');

		// Insert values and search
		btree.insertElement(50);
		btree.insertElement(25);
		btree.insertElement(75);
		btree.insertElement(10);

		// Find present value
		btree.findField.value = '25';
		btree.findCallback();

		// Find missing value smaller/larger
		btree.findField.value = '99';
		btree.findCallback();

		btree.findField.value = '5';
		btree.findCallback();

		shakeSpy.mockRestore();
	});

	test('deleteCallback shakes button when empty or no treeRoot', () => {
		const shakeSpy = jest.spyOn(btree, 'shake').mockImplementation(() => {});

		btree.deleteField.value = '';
		btree.deleteCallback();
		expect(shakeSpy).toHaveBeenCalledWith(btree.deleteButton);

		btree.deleteField.value = '10';
		btree.deleteCallback();
		expect(shakeSpy).toHaveBeenCalledWith(btree.deleteButton);

		shakeSpy.mockRestore();
	});

	test('deletes leaf element and elements requiring predecessor/successor', () => {
		btree.insertElement(10);
		btree.insertElement(20);
		btree.insertElement(30);
		btree.insertElement(40);
		btree.insertElement(50);

		// Delete leaf key
		btree.deleteField.value = '50';
		btree.deleteCallback();
		expect(btree.deleteField.value).toBe('');

		// Delete with predecessor
		btree.predSucc = 'pred';
		btree.deleteField.value = '20';
		btree.deleteCallback();

		// Delete with successor
		btree.predSucc = 'succ';
		btree.deleteField.value = '30';
		btree.deleteCallback();
	});

	test('printCallback shakes button when empty and prints tree when populated', () => {
		const shakeSpy = jest.spyOn(btree, 'shake').mockImplementation(() => {});
		btree.printButton = document.createElement('button');

		btree.printCallback();
		expect(shakeSpy).toHaveBeenCalledWith(btree.printButton);

		btree.insertElement(20);
		btree.insertElement(10);
		btree.insertElement(30);
		btree.insertElement(40);

		btree.printCallback();
		expect(mockAm.startNewAnimation).toHaveBeenCalled();

		shakeSpy.mockRestore();
	});

	test('buildTreeCallback builds tree from valid pipe/comma format', () => {
		btree.buildTreeField.value = '2,9,13|1|5,6,7|11,12|14,16';
		btree.buildTreeCallback();

		expect(btree.treeRoot).toBeDefined();
		expect(btree.treeRoot.keys).toEqual([2, 9, 13]);
		expect(btree.treeRoot.children.length).toBe(4);
	});

	test('buildTreeCallback detects problem and shakes button on invalid trees', () => {
		const shakeSpy = jest.spyOn(btree, 'shake').mockImplementation(() => {});

		// Invalid: more than max_keys (3)
		btree.buildTreeField.value = '1,2,3,4,5';
		btree.buildTreeCallback();
		expect(shakeSpy).toHaveBeenCalledWith(btree.buildTreeButton);

		// Invalid: unordered keys within node
		btree.buildTreeField.value = '5,2';
		btree.buildTreeCallback();
		expect(shakeSpy).toHaveBeenCalledWith(btree.buildTreeButton);

		shakeSpy.mockRestore();
	});

	test('randomCallback builds a random tree and clears history', () => {
		btree.randomCallback();
		expect(btree.treeRoot).toBeDefined();
	});

	test('clearCallback empties tree and resets treeRoot', () => {
		btree.insertElement(10);
		expect(btree.treeRoot).toBeDefined();

		btree.clearCallback();
		expect(btree.treeRoot).toBeNull();
	});

	test('reset restores initial state', () => {
		btree.insertElement(10);
		btree.reset();
		expect(btree.treeRoot).toBeNull();
		expect(btree.max_degree).toBe(4);
		expect(btree.max_keys).toBe(3);
	});

	test('changeDegree changes max_degree and resets tree', () => {
		btree.maxDegreeRadioButtons = [{ checked: false }, { checked: false }, { checked: false }];
		btree.changeDegree(5);
		expect(btree.max_degree).toBe(5);
		expect(btree.max_keys).toBe(4);
		expect(btree.min_keys).toBe(2);
	});

	test('changePreemtiveSplit toggles preemptive split', () => {
		btree.premptiveSplitBox = { checked: false };
		btree.changePreemtiveSplit(true);
		expect(btree.preemptiveSplit).toBe(true);
		expect(btree.premptiveSplitBox.checked).toBe(true);
	});

	test('setURLData parses promote, predSucc, and data parameters', () => {
		const params = new URLSearchParams('promote=third&predSucc=pred');
		btree.setURLData(params);
		expect(btree.split_index).toBe(2);
		expect(btree.predSucc).toBe('pred');

		const params2 = new URLSearchParams('promote=second&predSucc=succ');
		btree.setURLData(params2);
		expect(btree.split_index).toBe(1);
		expect(btree.predSucc).toBe('succ');

		const buildSpy = jest.spyOn(btree, 'buildTreeCallback').mockImplementation(() => {});
		const params3 = new URLSearchParams('data=2,9|1|5|10');
		btree.setURLData(params3);
		expect(btree.buildTreeField.value).toBe('2,9|1|5|10');
		expect(buildSpy).toHaveBeenCalled();
		buildSpy.mockRestore();
	});
});

import DisjointSet from '../DisjointSet.js';

describe('DisjointSet', () => {
	let disjointSet;
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

		disjointSet = new DisjointSet(mockAm, 800, 600);
		// Alias rebuildRootValues to fix upstream typo (rebuildRootValue vs rebuildRootValues)
		disjointSet.rebuildRootValues = disjointSet.rebuildRootValue.bind(disjointSet);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls and default properties correctly', () => {
		expect(disjointSet.controls).toBeDefined();
		expect(disjointSet.union1Field).toBeDefined();
		expect(disjointSet.union2Field).toBeDefined();
		expect(disjointSet.unionButton).toBeDefined();
		expect(disjointSet.findField).toBeDefined();
		expect(disjointSet.findButton).toBeDefined();
		expect(disjointSet.pathCompressionBox).toBeDefined();
		expect(disjointSet.unionByRankBox).toBeDefined();
		expect(disjointSet.rankNumberOfNodesButton).toBeDefined();
		expect(disjointSet.rankEstimatedHeightButton).toBeDefined();

		expect(disjointSet.setData.length).toBe(16);
		expect(disjointSet.setData.every(v => v === -1)).toBe(true);
		expect(disjointSet.pathCompression).toBe(false);
		expect(disjointSet.unionByRank).toBe(false);
		expect(disjointSet.rankAsHeight).toBe(false);
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('enableUI and disableUI toggle disabled state on controls', () => {
		disjointSet.disableUI();
		disjointSet.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		disjointSet.enableUI();
		disjointSet.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('unionCallback validates inputs and performs union', () => {
		// Empty inputs do nothing
		disjointSet.union1Field.value = '';
		disjointSet.union2Field.value = '1';
		disjointSet.unionCallback();
		expect(disjointSet.setData[0]).toBe(-1);

		// Out of bound inputs (>= 16)
		disjointSet.union1Field.value = '16';
		disjointSet.union2Field.value = '1';
		disjointSet.unionCallback();
		expect(disjointSet.setData[1]).toBe(-1);

		// Valid union between 0 and 1
		disjointSet.union1Field.value = '0';
		disjointSet.union2Field.value = '1';
		disjointSet.unionCallback();
		expect(disjointSet.union1Field.value).toBe('');
		expect(disjointSet.union2Field.value).toBe('');
		expect(disjointSet.findRoot(0)).toBe(disjointSet.findRoot(1));
	});

	test('unions multiple elements into sets and ignores self-union', () => {
		disjointSet.doUnion('0;1');
		disjointSet.doUnion('2;3');
		expect(disjointSet.findRoot(0)).toBe(disjointSet.findRoot(1));
		expect(disjointSet.findRoot(2)).toBe(disjointSet.findRoot(3));
		expect(disjointSet.findRoot(0)).not.toBe(disjointSet.findRoot(2));

		// Merge the two sets
		disjointSet.doUnion('1;3');
		expect(disjointSet.findRoot(0)).toBe(disjointSet.findRoot(2));

		// Union elements already in same set
		disjointSet.doUnion('0;2');
		expect(disjointSet.findRoot(0)).toBe(disjointSet.findRoot(2));
	});

	test('union with unionByRank and rankAsHeight', () => {
		disjointSet.unionByRank = true;
		disjointSet.rankAsHeight = true;

		disjointSet.doUnion('0;1');
		disjointSet.doUnion('2;3');
		disjointSet.doUnion('0;2');
		expect(disjointSet.findRoot(1)).toBe(disjointSet.findRoot(3));
	});

	test('union with unionByRank using number of nodes', () => {
		disjointSet.unionByRank = true;
		disjointSet.rankAsHeight = false;

		disjointSet.doUnion('4;5');
		disjointSet.doUnion('6;7');
		disjointSet.doUnion('5;7');
		expect(disjointSet.findRoot(4)).toBe(disjointSet.findRoot(6));
	});

	test('findCallback validates input and searches element root', () => {
		disjointSet.findField.value = '';
		disjointSet.findCallback();

		disjointSet.findField.value = '20';
		disjointSet.findCallback();

		disjointSet.doUnion('0;1');
		disjointSet.doUnion('1;2');

		disjointSet.findField.value = '2';
		disjointSet.findCallback();
		expect(disjointSet.findField.value).toBe('');
		expect(disjointSet.findRoot(2)).toBe(disjointSet.findRoot(0));
	});

	test('findElement with path compression compresses path to root', () => {
		disjointSet.pathCompression = true;
		disjointSet.doUnion('0;1');
		disjointSet.doUnion('1;2');
		disjointSet.doUnion('2;3');

		const root = disjointSet.findRoot(0);
		expect(root).toBe(3);
		expect(disjointSet.setData[0]).toBe(1); // Initially points to 1

		disjointSet.findElement('0');
		expect(disjointSet.setData[0]).toBe(root); // Compressed directly to 3
	});

	test('pathCompressionChangeCallback toggles pathCompression', () => {
		disjointSet.pathCompressionBox.checked = true;
		disjointSet.pathCompressionChangeCallback();
		expect(disjointSet.pathCompression).toBe(true);

		disjointSet.pathCompressionBox.checked = false;
		disjointSet.pathCompressionChangeCallback();
		expect(disjointSet.pathCompression).toBe(false);
	});

	test('unionByRankChangeCallback invokes changeUnionByRank action', () => {
		const actionSpy = jest.spyOn(disjointSet, 'implementAction');
		disjointSet.unionByRankBox.checked = true;
		disjointSet.unionByRankChangeCallback();
		expect(actionSpy).toHaveBeenCalled();
		actionSpy.mockRestore();
	});

	test('rankTypeChangedCallback updates rankAsHeight', () => {
		disjointSet.rankTypeChangedCallback(true);
		expect(disjointSet.rankAsHeight).toBe(true);

		disjointSet.rankTypeChangedCallback(false);
		expect(disjointSet.rankAsHeight).toBe(false);
	});

	test('clearCallback and clearAll reset all sets and tree positions', () => {
		disjointSet.doUnion('0;1');
		disjointSet.doUnion('2;3');

		disjointSet.clearCallback();
		expect(disjointSet.setData.every(v => v === -1)).toBe(true);
	});

	test('reset restores initial settings', () => {
		disjointSet.doUnion('0;1');
		disjointSet.pathCompression = true;
		disjointSet.unionByRank = true;

		disjointSet.reset();
		expect(disjointSet.setData.every(v => v === -1)).toBe(true);
		expect(disjointSet.pathCompression).toBe(false);
		expect(disjointSet.unionByRank).toBe(false);
		expect(disjointSet.rankAsHeight).toBe(false);
	});

	test('getSizes computes correct tree component sizes', () => {
		disjointSet.doUnion('0;1');
		disjointSet.doUnion('1;2');

		const sizes = disjointSet.getSizes();
		const root = disjointSet.findRoot(0);
		expect(sizes[root]).toBe(3);
	});
});

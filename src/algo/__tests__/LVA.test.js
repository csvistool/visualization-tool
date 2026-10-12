import LVA from '../LVA.js';

describe('LVA', () => {
	let lva;
	let mockAm;

	beforeEach(() => {
		document.body.innerHTML = `
			<div id="AlgorithmSpecificControls"></div>
			<div id="GeneralAnimationControls"></div>
		`;

		mockAm = {
			addListener: jest.fn(),
			startNewAnimation: jest.fn(),
			clearHistory: jest.fn(),
			skipForward: jest.fn(),
			step: jest.fn(),
			resetAll: jest.fn(),
		};

		lva = new LVA(mockAm, 800, 600);
	});

	test('initializes controls and labels', () => {
		expect(lva.insertField).toBeDefined();
		expect(lva.insertButton).toBeDefined();
		expect(lva.deleteField).toBeDefined();
		expect(lva.deleteButton).toBeDefined();
		expect(lva.findField).toBeDefined();
		expect(lva.findButton).toBeDefined();
		expect(lva.printButton).toBeDefined();
		expect(lva.clearButton).toBeDefined();
		expect(lva.rightButton).toBeDefined();
		expect(lva.leftButton).toBeDefined();
		expect(lva.rightLeft).toBe('right');

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('inserts elements and handles right vs left LVA balance', () => {
		lva.insertField.value = '50';
		lva.insertCallback();

		lva.insertField.value = '25';
		lva.insertCallback();

		lva.insertField.value = '75';
		lva.insertCallback();

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
		expect(lva.treeRoot).not.toBeNull();
		expect(lva.treeRoot.data).toBe(25);
	});

	test('finds existing and non-existing elements', () => {
		lva.insertField.value = '10';
		lva.insertCallback();

		// Find existing
		lva.findField.value = '10';
		lva.findCallback();
		expect(mockAm.startNewAnimation).toHaveBeenCalled();

		// Find non-existing
		lva.findField.value = '99';
		lva.findCallback();
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('deletes element from tree', () => {
		lva.insertField.value = '20';
		lva.insertCallback();

		lva.deleteField.value = '20';
		lva.deleteCallback();
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('prints tree traversal', () => {
		lva.insertField.value = '30';
		lva.insertCallback();

		lva.printCallback();
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('toggles between Right-LVA and Left-LVA modes', () => {
		lva.leftButton.onclick();
		expect(lva.rightLeft).toBe('left');

		lva.rightButton.onclick();
		expect(lva.rightLeft).toBe('right');
	});

	test('clears and resets tree', () => {
		lva.insertField.value = '15';
		lva.insertCallback();

		lva.clearCallback();
		expect(lva.treeRoot).toBeNull();

		lva.reset();
		expect(lva.treeRoot).toBeNull();
		expect(lva.edges).toEqual([]);
	});

	test('handles sizeChanged re-layout', () => {
		lva.sizeChanged(1000);
		expect(lva.startingX).toBe(500);
	});

	test('disables and enables UI controls', () => {
		lva.disableUI();
		lva.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		lva.enableUI();
		lva.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('triggers operations on Enter key in input fields', () => {
		lva.insertField.value = '8';
		lva.insertField.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 }));

		lva.findField.value = '8';
		lva.findField.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 }));

		lva.deleteField.value = '8';
		lva.deleteField.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13 }));

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});
});

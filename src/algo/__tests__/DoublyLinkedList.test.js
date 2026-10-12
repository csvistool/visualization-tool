import DoublyLinkedList from '../DoublyLinkedList';

describe('DoublyLinkedList', () => {
	let controlBar;
	let animControls;
	let mockAm;
	let list;

	beforeEach(() => {
		document.body.innerHTML = '';

		controlBar = document.createElement('div');
		controlBar.id = 'AlgorithmSpecificControls';
		document.body.appendChild(controlBar);

		animControls = document.createElement('div');
		animControls.id = 'GeneralAnimationControls';
		document.body.appendChild(animControls);

		mockAm = {
			addListener: jest.fn(),
			startNewAnimation: jest.fn(),
			skipForward: jest.fn(),
			clearHistory: jest.fn(),
			setAllLayers: jest.fn(),
		};

		list = new DoublyLinkedList(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
		jest.clearAllMocks();
	});

	describe('Initialization and controls', () => {
		it('instantiates DoublyLinkedList and registers controls', () => {
			expect(list.size).toBe(0);
			expect(list.controls.length).toBeGreaterThan(0);
			expect(list.addValueField).toBeDefined();
			expect(list.addIndexField).toBeDefined();
			expect(list.addFrontButton).toBeDefined();
			expect(list.addBackButton).toBeDefined();
			expect(list.addIndexButton).toBeDefined();
			expect(list.removeField).toBeDefined();
			expect(list.removeFrontButton).toBeDefined();
			expect(list.removeBackButton).toBeDefined();
			expect(list.removeIndexButton).toBeDefined();
			expect(list.randomButton).toBeDefined();
			expect(list.clearButton).toBeDefined();
		});

		it('disables and enables all controls with disableUI and enableUI', () => {
			list.disableUI();
			list.controls.forEach(c => expect(c.disabled).toBe(true));

			list.enableUI();
			list.controls.forEach(c => expect(c.disabled).toBe(false));
		});

		it('resets internal state with reset()', () => {
			list.size = 5;
			list.reset();
			expect(list.size).toBe(0);
		});
	});

	describe('Insertion operations (add)', () => {
		it('adds nodes to front, back, and index updating bidirectional pointers', () => {
			// Add to front (empty list)
			list.addValueField.value = '10';
			list.addFrontButton.click();
			expect(list.size).toBe(1);

			// Add to back
			list.addValueField.value = '30';
			list.addBackButton.click();
			expect(list.size).toBe(2);

			// Add at index 1
			list.addValueField.value = '20';
			list.addIndexField.value = '1';
			list.addIndexButton.click();
			expect(list.size).toBe(3);
		});

		it('validates empty inputs and bounds for additions', () => {
			list.addValueField.value = '';
			list.addFrontButton.click();
			expect(list.size).toBe(0);

			list.addBackButton.click();
			expect(list.size).toBe(0);

			list.addValueField.value = '5';
			list.addIndexField.value = '10';
			list.addIndexButton.click();
			expect(list.size).toBe(0);
		});
	});

	describe('Removal operations (remove)', () => {
		beforeEach(() => {
			// Prepopulate with 3 items: [10, 20, 30]
			list.addValueField.value = '10';
			list.addBackButton.click();
			list.addValueField.value = '20';
			list.addBackButton.click();
			list.addValueField.value = '30';
			list.addBackButton.click();
			expect(list.size).toBe(3);
		});

		it('removes nodes from front, back, and index', () => {
			// Remove from front (removes 10)
			list.removeFrontButton.click();
			expect(list.size).toBe(2);

			// Remove from back (removes 30)
			list.removeBackButton.click();
			expect(list.size).toBe(1);

			// Remove from index 0 (removes 20)
			list.removeField.value = '0';
			list.removeIndexButton.click();
			expect(list.size).toBe(0);
		});

		it('validates removing from empty list', () => {
			list.clearCallback();
			expect(list.size).toBe(0);

			list.removeFrontButton.click();
			expect(list.size).toBe(0);

			list.removeBackButton.click();
			expect(list.size).toBe(0);

			list.removeField.value = '0';
			list.removeIndexButton.click();
			expect(list.size).toBe(0);
		});

		it('validates remove index inputs and bounds', () => {
			list.removeField.value = '';
			list.removeIndexButton.click();
			expect(list.size).toBe(3);

			list.removeField.value = '10';
			list.removeIndexButton.click();
			expect(list.size).toBe(3);
		});
	});

	describe('Bulk operations and URL synchronization', () => {
		it('generates random nodes with randomCallback', () => {
			list.randomCallback();
			expect(list.size).toBeGreaterThanOrEqual(1);
		});

		it('clears all nodes with clearCallback', () => {
			list.addValueField.value = '55';
			list.addBackButton.click();
			expect(list.size).toBe(1);

			list.clearCallback();
			expect(list.size).toBe(0);
		});

		it('populates initial data with setURLData', () => {
			const params = new URLSearchParams('data=1,2,3');
			list.setURLData(params);
			expect(list.size).toBe(3);
		});
	});
});

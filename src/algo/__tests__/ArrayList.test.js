import ArrayList from '../ArrayList';

describe('ArrayList', () => {
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
		};

		list = new ArrayList(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
		jest.clearAllMocks();
	});

	describe('Initialization and controls', () => {
		it('instantiates ArrayList and sets up control buttons and fields', () => {
			expect(list.size).toBe(0);
			expect(list.length).toBe(7);
			expect(list.arrayData.length).toBe(7);
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

			expect(list.initialCapacityField).toBeDefined();
			expect(list.restartButton).toBeDefined();
			expect(list.randomButton).toBeDefined();
			expect(list.clearButton).toBeDefined();
		});

		it('disables and enables all controls with disableUI and enableUI', () => {
			list.disableUI();
			list.controls.forEach(ctrl => expect(ctrl.disabled).toBe(true));

			list.enableUI();
			list.controls.forEach(ctrl => expect(ctrl.disabled).toBe(false));
		});

		it('resets internal tracking state with reset()', () => {
			list.size = 5;
			list.reset();
			expect(list.size).toBe(0);
			expect(list.length).toBe(7);
		});
	});

	describe('Insertion operations (add)', () => {
		it('adds elements to front, back, and at index', () => {
			// Add to front
			list.addValueField.value = '10';
			list.addFrontButton.click();
			expect(list.size).toBe(1);
			expect(list.arrayData[0]).toBe('10');
			expect(mockAm.startNewAnimation).toHaveBeenCalled();

			// Add to back
			list.addValueField.value = '20';
			list.addBackButton.click();
			expect(list.size).toBe(2);
			expect(list.arrayData[1]).toBe('20');

			// Add at index 1
			list.addValueField.value = '15';
			list.addIndexField.value = '1';
			list.addIndexButton.click();
			expect(list.size).toBe(3);
			expect(list.arrayData[0]).toBe('10');
			expect(list.arrayData[1]).toBe('15');
			expect(list.arrayData[2]).toBe('20');
		});

		it('validates add front and back missing input values', () => {
			list.addValueField.value = '';
			list.addFrontButton.click();
			expect(list.size).toBe(0);

			list.addBackButton.click();
			expect(list.size).toBe(0);
		});

		it('validates addIndex input values and bounds', () => {
			// Missing both
			list.addValueField.value = '';
			list.addIndexField.value = '';
			list.addIndexButton.click();
			expect(list.size).toBe(0);

			// Out of bounds on empty list
			list.addValueField.value = '5';
			list.addIndexField.value = '1';
			list.addIndexButton.click();
			expect(list.size).toBe(0);

			// Add valid element first
			list.addValueField.value = '5';
			list.addIndexField.value = '0';
			list.addIndexButton.click();
			expect(list.size).toBe(1);

			// Out of bounds on non-empty list
			list.addValueField.value = '99';
			list.addIndexField.value = '5';
			list.addIndexButton.click();
			expect(list.size).toBe(1);
		});
	});

	describe('Removal operations (remove)', () => {
		beforeEach(() => {
			// Populate list with 3 items: [A, B, C]
			list.addValueField.value = 'A';
			list.addBackButton.click();
			list.addValueField.value = 'B';
			list.addBackButton.click();
			list.addValueField.value = 'C';
			list.addBackButton.click();
			expect(list.size).toBe(3);
		});

		it('removes from front, back, and index', () => {
			// Remove from front (A)
			list.removeFrontButton.click();
			expect(list.size).toBe(2);
			expect(list.arrayData[0]).toBe('B');
			expect(list.arrayData[1]).toBe('C');

			// Remove from back (C)
			list.removeBackButton.click();
			expect(list.size).toBe(1);
			expect(list.arrayData[0]).toBe('B');

			// Remove from index 0 (B)
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

		it('validates invalid remove index ranges', () => {
			// Empty index field
			list.removeField.value = '';
			list.removeIndexButton.click();
			expect(list.size).toBe(3);

			// Index out of bounds (> size - 1)
			list.removeField.value = '10';
			list.removeIndexButton.click();
			expect(list.size).toBe(3);

			// Single element out of bounds error branch
			list.removeFrontButton.click(); // size 2
			list.removeFrontButton.click(); // size 1
			expect(list.size).toBe(1);
			list.removeField.value = '5';
			list.removeIndexButton.click();
			expect(list.size).toBe(1);
		});
	});

	describe('Dynamic array resizing', () => {
		it('doubles capacity and moves elements when full during add operations', () => {
			// Fill initial capacity (7 elements)
			for (let i = 0; i < 7; i++) {
				list.addValueField.value = `val${i}`;
				list.addBackButton.click();
			}
			expect(list.size).toBe(7);
			expect(list.length).toBe(7);

			// Adding 8th element triggers resize (capacity becomes 14)
			list.addValueField.value = 'val7';
			list.addBackButton.click();
			expect(list.size).toBe(8);
			expect(list.length).toBe(14);
			expect(list.arrayData[7]).toBe('val7');

			// Trigger resize adding to front
			list.clearAll();
			list.length = 2;
			list.arrayData = new Array(2);
			list.arrayID = [100, 101];
			list.arrayLabelID = [102, 103];
			list.size = 2;
			list.arrayData[0] = 'X';
			list.arrayData[1] = 'Y';

			list.addValueField.value = 'W';
			list.addFrontButton.click();
			expect(list.size).toBe(3);
			expect(list.length).toBe(4);
			expect(list.arrayData[0]).toBe('W');
			expect(list.arrayData[1]).toBe('X');
			expect(list.arrayData[2]).toBe('Y');

			// Trigger resize adding at index
			list.addValueField.value = 'Z';
			list.addIndexField.value = '1';
			list.addIndexButton.click();
			expect(list.size).toBe(4);

			list.addValueField.value = 'V';
			list.addIndexField.value = '2';
			list.addIndexButton.click();
			expect(list.size).toBe(5);
			expect(list.length).toBe(8);
		});
	});

	describe('Capacity controls, random generation, and URL parameter handling', () => {
		it('resizes initial capacity with restartButton click', () => {
			list.initialCapacityField.value = '10';
			const event = new MouseEvent('click', { bubbles: true, cancelable: true });
			list.restartButton.dispatchEvent(event);

			expect(list.length).toBe(10);
			expect(list.size).toBe(0);

			// Exceeding MAX_SIZE (30) is rejected
			list.initialCapacityField.value = '50';
			list.restartButton.dispatchEvent(event);
			expect(list.length).toBe(10);
		});

		it('generates random elements with randomCallback', () => {
			list.randomCallback();
			expect(list.size).toBeGreaterThanOrEqual(3);
			expect(list.size).toBeLessThan(list.length);
		});

		it('clears all elements with clearCallback', () => {
			list.addValueField.value = '10';
			list.addBackButton.click();
			expect(list.size).toBe(1);

			list.clearCallback();
			expect(list.size).toBe(0);
			expect(list.length).toBe(7);
		});

		it('populates initial state from URL search params with setURLData', () => {
			const params = new URLSearchParams('initialCapacity=12&data=5,10,15');
			list.setURLData(params);

			expect(list.size).toBe(3);
			expect(list.arrayData[0]).toBe('5');
			expect(list.arrayData[1]).toBe('10');
			expect(list.arrayData[2]).toBe('15');
		});
	});
});

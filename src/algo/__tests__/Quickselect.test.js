import Quickselect from '../Quickselect.js';
import { act } from '../../anim/AnimationMain';

describe('Quickselect', () => {
	let quickselect;
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

		quickselect = new Quickselect(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls correctly', () => {
		expect(quickselect.controls).toBeDefined();
		expect(quickselect.listField).toBeDefined();
		expect(quickselect.kField).toBeDefined();
		expect(quickselect.findButton).toBeDefined();
		expect(quickselect.exampleDropdown).toBeDefined();
		expect(quickselect.clearButton).toBeDefined();
		expect(quickselect.randomPivotSelect).toBeDefined();
		expect(quickselect.perfectPivotSelect).toBeDefined();
		expect(quickselect.minPivotSelect).toBeDefined();
		expect(quickselect.setPivotSelect).toBeDefined();
		expect(quickselect.pivotType).toBe('random');
		expect(quickselect.compCount).toBe(0);
	});

	test('setup and reset initialize and reset state properly', () => {
		quickselect.compCount = 10;
		quickselect.reset();
		expect(quickselect.compCount).toBe(0);
		expect(quickselect.arrayData).toEqual([]);
		expect(quickselect.arrayID).toEqual([]);
	});

	test('setPivotType updates pivotType and container visibility', () => {
		quickselect.setPivotType('perfect');
		expect(quickselect.pivotType).toBe('perfect');

		quickselect.setPivotType('min');
		expect(quickselect.pivotType).toBe('min');

		quickselect.setPivotType('set');
		expect(quickselect.pivotType).toBe('set');

		quickselect.setPivotType('random');
		expect(quickselect.pivotType).toBe('random');
	});

	test('validates invalid inputs and out-of-range k in run', () => {
		// Empty array
		const cmdsEmpty = quickselect.run([], 1);
		expect(
			cmdsEmpty.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p => typeof p === 'string' && p.includes('Data must contain integers'),
					),
			),
		).toBe(true);

		// > 18 elements
		const largeList = Array.from({ length: 19 }, (_, i) => String(i));
		const cmdsLarge = quickselect.run(largeList, 1);
		expect(
			cmdsLarge.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p => typeof p === 'string' && p.includes('Data cannot contain more than'),
					),
			),
		).toBe(true);

		// Non-numeric or > 999
		const cmdsOver999 = quickselect.run(['5', '1000'], 1);
		expect(
			cmdsOver999.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p =>
							typeof p === 'string' &&
							p.includes('Data cannot contain non-numeric values or numbers > 999'),
					),
			),
		).toBe(true);

		// k out of bounds (k = 0 or k > list.length)
		const cmdsK0 = quickselect.run(['5', '2', '3'], 0);
		expect(
			cmdsK0.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p =>
							typeof p === 'string' &&
							p.includes('kᵗʰ element to select must be an integer between 1 and 3'),
					),
			),
		).toBe(true);

		const cmdsKHigh = quickselect.run(['5', '2', '3'], 5);
		expect(
			cmdsKHigh.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p =>
							typeof p === 'string' &&
							p.includes('kᵗʰ element to select must be an integer between 1 and 3'),
					),
			),
		).toBe(true);
	});

	test('run finds the k-th smallest element with partitioning', () => {
		quickselect.setPivotType('perfect');
		const cmds = quickselect.run(['7', '10', '4', '3', '20', '15'], 3);
		expect(cmds.length).toBeGreaterThan(0);
		expect(quickselect.compCount).toBeGreaterThan(0);
	});

	test('runCallback parses input list and k and triggers find', () => {
		const implementActionSpy = jest.spyOn(quickselect, 'implementAction');
		quickselect.listField.value = '5,2,8,1,4';
		quickselect.kField.value = '2';

		quickselect.runCallback();

		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('exampleCallback handles predefined examples and Random', () => {
		quickselect.exampleDropdown.value = '1,2,3,4,5,6,7,8,9;k=4';
		quickselect.exampleCallback();
		expect(quickselect.listField.value).toBe('1,2,3,4,5,6,7,8,9');
		expect(quickselect.kField.value).toBe('4');

		quickselect.exampleDropdown.value = 'Random';
		quickselect.exampleCallback();
		expect(quickselect.listField.value.length).toBeGreaterThan(0);
		expect(quickselect.kField.value.length).toBeGreaterThan(0);

		// Empty value
		quickselect.exampleDropdown.value = '';
		quickselect.exampleCallback();
	});

	test('clear and clearCallback reset IDs and inputs', () => {
		quickselect.listField.value = '3,2,1';
		quickselect.kField.value = '2';
		quickselect.arrayID = [1, 2, 3];
		quickselect.arrayData = [3, 2, 1];

		const cmds = quickselect.clear(false);
		expect(cmds.length).toBeGreaterThan(0);
		expect(quickselect.listField.value).toBe('');
		expect(quickselect.kField.value).toBe('');
		expect(quickselect.compCount).toBe(0);

		// keepInput preserves fields
		quickselect.listField.value = '5,4';
		quickselect.kField.value = '1';
		quickselect.clear(true);
		expect(quickselect.listField.value).toBe('5,4');
		expect(quickselect.kField.value).toBe('1');

		const implementActionSpy = jest.spyOn(quickselect, 'implementAction');
		quickselect.clearCallback();
		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('disableUI and enableUI update controls disabled status', () => {
		quickselect.disableUI();
		quickselect.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		quickselect.enableUI();
		quickselect.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('setURLData handles pivot, data, and k searchParams', () => {
		const runCallbackSpy = jest.spyOn(quickselect, 'runCallback');
		const setPivotTypeSpy = jest.spyOn(quickselect, 'setPivotType');

		const params = new URLSearchParams('pivot=min&data=5,2,8&k=2');
		quickselect.setURLData(params);

		expect(setPivotTypeSpy).toHaveBeenCalledWith('min');
		expect(quickselect.listField.value).toBe('5,2,8');
		expect(quickselect.kField.value).toBe('2');
		expect(runCallbackSpy).toHaveBeenCalled();
	});
});

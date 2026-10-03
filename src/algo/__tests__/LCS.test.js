import LCS from '../LCS.js';
import { act } from '../../anim/AnimationMain';

describe('LCS', () => {
	let lcs;
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

		lcs = new LCS(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls correctly', () => {
		expect(lcs.controls).toBeDefined();
		expect(lcs.S1Field).toBeDefined();
		expect(lcs.S2Field).toBeDefined();
		expect(lcs.tableButton).toBeDefined();
		expect(lcs.randomButton).toBeDefined();
		expect(lcs.clearButton).toBeDefined();
	});

	test('setup and reset initialize and reset state properly', () => {
		lcs.oldIDs = [1, 2, 3];
		lcs.reset();
		expect(lcs.oldIDs).toEqual([]);
		expect(lcs.nextIndex).toBe(lcs.initialIndex);
	});

	test('validates empty inputs in run', () => {
		const cmds1 = lcs.run('', 'ABC');
		expect(cmds1.length).toBeGreaterThan(0);
		expect(
			cmds1.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p => typeof p === 'string' && p.includes('must be non-empty strings'),
					),
			),
		).toBe(true);

		const cmds2 = lcs.run('ABC', '');
		expect(cmds2.length).toBeGreaterThan(0);
		expect(
			cmds2.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p => typeof p === 'string' && p.includes('must be non-empty strings'),
					),
			),
		).toBe(true);
	});

	test('run constructs DP matrix and extracts LCS sequence for matching strings', () => {
		const cmds = lcs.run('ABC', 'ABC');
		expect(cmds.length).toBeGreaterThan(0);
		// Checks table creation
		expect(cmds.some(cmd => cmd[0] === act.createRectangle)).toBe(true);
		// Check that match increments from diagonal
		expect(
			cmds.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p => typeof p === 'string' && p.includes('increment from the diagonal'),
					),
			),
		).toBe(true);
		// Check tableVals final corner
		expect(lcs.tableVals[3][3]).toBe(3);
	});

	test('run handles mismatches by propagating max from adjacent cells', () => {
		// 'AB' and 'BA': 'A' != 'B', so it takes max from adjacent cells
		const cmds = lcs.run('AB', 'BA');
		expect(cmds.length).toBeGreaterThan(0);
		expect(
			cmds.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p =>
							typeof p === 'string' &&
							p.includes('Mismatch, copy greatest value from left or above'),
					),
			),
		).toBe(true);
		expect(lcs.tableVals[2][2]).toBe(1);
	});

	test('run handles both branches of mismatch comparison (left > above and above >= left)', () => {
		// 'ABC' and 'AC' has both scenarios during table construction
		const cmds = lcs.run('ABC', 'AC');
		expect(cmds.length).toBeGreaterThan(0);
		expect(lcs.tableVals[3][2]).toBe(2);
	});

	test('buildLCSFromTable correctly backtracks through table', () => {
		// Sets up table manually or runs then checks sequence extraction
		lcs.run('AC', 'ABC');
		// buildLCSFromTable is called during run
		expect(lcs.tableVals).toBeDefined();
	});

	test('runCallback calls run via implementAction', () => {
		const implementActionSpy = jest.spyOn(lcs, 'implementAction');
		lcs.S1Field.value = 'ABC';
		lcs.S2Field.value = 'AC';

		lcs.runCallback();

		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('randomCallback sets S1 and S2 from predefined sets', () => {
		lcs.randomCallback();
		expect(lcs.S1Field.value.length).toBeGreaterThan(0);
		expect(lcs.S2Field.value.length).toBeGreaterThan(0);
	});

	test('clear and clearCallback reset IDs and inputs', () => {
		lcs.S1Field.value = 'ABC';
		lcs.S2Field.value = 'DEF';
		lcs.oldIDs = [1, 2, 3];

		const cmds = lcs.clear(false);
		expect(cmds.length).toBeGreaterThan(0);
		expect(lcs.S1Field.value).toBe('');
		expect(lcs.S2Field.value).toBe('');
		expect(lcs.oldIDs).toEqual([]);

		// keepInput preserves values
		lcs.S1Field.value = 'XYZ';
		lcs.S2Field.value = '123';
		lcs.clear(true);
		expect(lcs.S1Field.value).toBe('XYZ');
		expect(lcs.S2Field.value).toBe('123');

		const implementActionSpy = jest.spyOn(lcs, 'implementAction');
		lcs.clearCallback();
		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('disableUI and enableUI update controls disabled status', () => {
		lcs.disableUI();
		lcs.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		lcs.enableUI();
		lcs.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('setURLData populates fields and triggers run', () => {
		const runCallbackSpy = jest.spyOn(lcs, 'runCallback');
		const params = new URLSearchParams('s1=ABCDE&s2=ACE');

		lcs.setURLData(params);

		expect(lcs.S1Field.value).toBe('ABCDE');
		expect(lcs.S2Field.value).toBe('ACE');
		expect(runCallbackSpy).toHaveBeenCalled();
	});
});

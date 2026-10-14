import KMP from '../KMP.js';
import { act } from '../../anim/AnimationMain';

describe('KMP', () => {
	let kmp;
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

		kmp = new KMP(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls correctly', () => {
		expect(kmp.controls).toBeDefined();
		expect(kmp.textField).toBeDefined();
		expect(kmp.patternField).toBeDefined();
		expect(kmp.findButton).toBeDefined();
		expect(kmp.bftButton).toBeDefined();
		expect(kmp.exampleDropdown).toBeDefined();
		expect(kmp.clearButton).toBeDefined();
		expect(kmp.compCount).toBe(0);
	});

	test('setup and reset initialize and reset state properly', () => {
		kmp.compCount = 12;
		kmp.reset();
		expect(kmp.compCount).toBe(0);
		expect(kmp.textRowID).toEqual([]);
		expect(kmp.comparisonMatrixID).toEqual([]);
		expect(kmp.failureTableCharacterID).toEqual([]);
		expect(kmp.failureTableValueID).toEqual([]);
	});

	test('validates empty text or pattern in find', () => {
		const cmds1 = kmp.find('', 'abc');
		expect(cmds1.length).toBeGreaterThan(0);
		expect(
			cmds1.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(p => typeof p === 'string' && p.includes('must not be empty')),
			),
		).toBe(true);

		const cmds2 = kmp.find('abc', '');
		expect(cmds2.length).toBeGreaterThan(0);
		expect(
			cmds2.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(p => typeof p === 'string' && p.includes('must not be empty')),
			),
		).toBe(true);
	});

	test('validates pattern longer than text in find', () => {
		const cmds = kmp.find('cat', 'caterpillar');
		expect(cmds.length).toBeGreaterThan(0);
		expect(
			cmds.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p =>
							typeof p === 'string' &&
							p.includes('Pattern is longer than text, no matches exist'),
					),
			),
		).toBe(true);
	});

	test('buildFailureTableCallback and onlyBuildFailureTable handle empty and valid patterns', () => {
		const cmdsEmpty = kmp.onlyBuildFailureTable(0, '');
		expect(
			cmdsEmpty.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(p => typeof p === 'string' && p.includes('must not be empty')),
			),
		).toBe(true);

		const cmdsValid = kmp.onlyBuildFailureTable(0, 'ababaca');
		expect(cmdsValid.length).toBeGreaterThan(0);
		expect(cmdsValid.some(cmd => cmd[0] === act.createRectangle)).toBe(true);

		const implementActionSpy = jest.spyOn(kmp, 'implementAction');
		kmp.patternField.value = 'ababaca';
		kmp.buildFailureTableCallback();
		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('buildFailureTable builds correct failure table array', () => {
		const table = kmp.buildFailureTable(10, 'ababaca');
		expect(table).toEqual([0, 0, 1, 2, 3, 0, 1]);
	});

	test('find finds pattern in text with failure table shifts', () => {
		const cmds = kmp.find('abacabacababa', 'abab');
		expect(cmds.length).toBeGreaterThan(0);
		expect(kmp.compCount).toBeGreaterThan(0);
		// Checks match highlight color #2ECC71 and mismatch #E74C3C
		expect(
			cmds.some(
				cmd =>
					cmd[0] === act.setBackgroundColor &&
					cmd[1].some(p => typeof p === 'string' && p.toUpperCase() === '#2ECC71'),
			),
		).toBe(true);
		expect(
			cmds.some(
				cmd =>
					cmd[0] === act.setBackgroundColor &&
					cmd[1].some(p => typeof p === 'string' && p.toUpperCase() === '#E74C3C'),
			),
		).toBe(true);
	});

	test('find handles mismatch at first character (j === 0)', () => {
		const cmds = kmp.find('xyz', 'abc');
		expect(cmds.length).toBeGreaterThan(0);
		expect(
			cmds.some(
				cmd =>
					cmd[0] === act.setBackgroundColor &&
					cmd[1].some(p => typeof p === 'string' && p.toUpperCase() === '#E74C3C'),
			),
		).toBe(true);
	});

	test('getMaxRows returns correct number of rows for KMP search', () => {
		const rows = kmp.getMaxRows('abacabacababa', 'abab');
		expect(rows).toBeGreaterThan(0);
	});

	test('findCallback triggers find via implementAction', () => {
		const implementActionSpy = jest.spyOn(kmp, 'implementAction');
		kmp.textField.value = 'hello world';
		kmp.patternField.value = 'world';

		kmp.findCallback();

		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('exampleCallback handles predefined examples and Random', () => {
		kmp.exampleDropdown.value = 'aaab in aaaaaaaaaaaaa';
		kmp.exampleCallback();
		expect(kmp.textField.value).toBe('aaaaaaaaaaaaa');
		expect(kmp.patternField.value).toBe('aaab');

		kmp.exampleDropdown.value = 'Random';
		kmp.exampleCallback();
		expect(kmp.textField.value.length).toBe(15);
		expect(kmp.patternField.value.length).toBe(3);

		// Empty value
		kmp.exampleDropdown.value = '';
		kmp.exampleCallback();
	});

	test('generateRandomString creates random string with and without mustInclude', () => {
		const strWithout = kmp.generateRandomString(6, 'abc');
		expect(strWithout.length).toBe(6);

		const strWith = kmp.generateRandomString(8, 'abc', 'cba');
		expect(strWith.length).toBe(8);
		expect(strWith.includes('cba')).toBe(true);
	});

	test('clear and clearCallback reset IDs and inputs', () => {
		kmp.textField.value = 'abc';
		kmp.patternField.value = 'a';
		kmp.textRowID = [1];
		kmp.comparisonMatrixID = [[2]];
		kmp.rowCountID = [0, 3];
		kmp.failureTableCharacterID = [4];
		kmp.failureTableValueID = [5];

		kmp.clear(false);
		expect(kmp.textField.value).toBe('');
		expect(kmp.patternField.value).toBe('');
		expect(kmp.compCount).toBe(0);

		// keepInput preserves fields
		kmp.textField.value = 'foo';
		kmp.patternField.value = 'bar';
		kmp.clear(true);
		expect(kmp.textField.value).toBe('foo');
		expect(kmp.patternField.value).toBe('bar');

		const implementActionSpy = jest.spyOn(kmp, 'implementAction');
		kmp.clearCallback();
		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('disableUI and enableUI update controls disabled status', () => {
		kmp.disableUI();
		kmp.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		kmp.enableUI();
		kmp.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('setURLData populates fields and triggers search', () => {
		const findCallbackSpy = jest.spyOn(kmp, 'findCallback');
		const params = new URLSearchParams('text=abcde&pattern=bc');

		kmp.setURLData(params);

		expect(kmp.textField.value).toBe('abcde');
		expect(kmp.patternField.value).toBe('bc');
		expect(findCallbackSpy).toHaveBeenCalled();
	});
});

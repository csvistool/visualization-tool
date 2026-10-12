import RabinKarp from '../RabinKarp.js';
import { act } from '../../anim/AnimationMain';

describe('RabinKarp', () => {
	let rabinKarp;
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

		rabinKarp = new RabinKarp(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls correctly', () => {
		expect(rabinKarp.controls).toBeDefined();
		expect(rabinKarp.textField).toBeDefined();
		expect(rabinKarp.patternField).toBeDefined();
		expect(rabinKarp.findButton).toBeDefined();
		expect(rabinKarp.baseField).toBeDefined();
		expect(rabinKarp.baseButton).toBeDefined();
		expect(rabinKarp.exampleDropdown).toBeDefined();
		expect(rabinKarp.clearButton).toBeDefined();
		expect(rabinKarp.baseValue).toBe(1);
		expect(rabinKarp.compCount).toBe(0);
	});

	test('setup and reset initialize and reset state properly', () => {
		rabinKarp.compCount = 15;
		rabinKarp.reset();
		expect(rabinKarp.compCount).toBe(0);
		expect(rabinKarp.textRowID).toEqual([]);
		expect(rabinKarp.comparisonMatrixID).toEqual([]);
	});

	test('changeBase validates non-zero integer base and updates baseValue', () => {
		// Invalid base (0 or empty)
		const cmdsInvalid = rabinKarp.changeBase(0);
		expect(
			cmdsInvalid.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p => typeof p === 'string' && p.includes('must be a non-zero integer'),
					),
			),
		).toBe(true);

		// Valid base
		const cmdsValid = rabinKarp.changeBase(3);
		expect(rabinKarp.baseValue).toBe(3);
		expect(
			cmdsValid.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(p => typeof p === 'string' && p.includes('Base set to 3')),
			),
		).toBe(true);

		const implementActionSpy = jest.spyOn(rabinKarp, 'implementAction');
		rabinKarp.baseField.value = '5';
		rabinKarp.baseCallback();
		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('validates empty or invalid text or pattern in find', () => {
		// Non-letter or empty
		const cmds1 = rabinKarp.find('123', '456');
		expect(
			cmds1.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(
						p => typeof p === 'string' && p.includes('must be lowercase letters'),
					),
			),
		).toBe(true);

		// Pattern longer than text
		const cmds2 = rabinKarp.find('cat', 'caterpillar');
		expect(
			cmds2.some(
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

	test('find finds pattern with matching rolling hash and matching characters', () => {
		rabinKarp.baseValue = 3;
		const cmds = rabinKarp.find('abcde', 'cde');
		expect(cmds.length).toBeGreaterThan(0);
		// Check that yellow background is used on hash mismatch (#FFFF4D)
		expect(
			cmds.some(
				cmd =>
					cmd[0] === act.setBackgroundColor &&
					cmd[1].some(p => typeof p === 'string' && p.toUpperCase() === '#FFFF4D'),
			),
		).toBe(true);
		// Check that green background is used on character match (#2ECC71)
		expect(
			cmds.some(
				cmd =>
					cmd[0] === act.setBackgroundColor &&
					cmd[1].some(p => typeof p === 'string' && p.toUpperCase() === '#2ECC71'),
			),
		).toBe(true);
		expect(rabinKarp.compCount).toBeGreaterThan(0);
	});

	test('find handles hash collision with character mismatch (spurious hit)', () => {
		// With baseValue = 1: 'ba' (1*1 + 0*1 = 1) has hash (1)+0 = 1
		// 'ab' (0*1 + 1*1 = 1) has hash (0)+1 = 1
		// So 'ba' and 'ab' have the exact same hash when baseValue = 1, but are not equal!
		rabinKarp.baseValue = 1;
		const cmds = rabinKarp.find('ba', 'ab');
		expect(cmds.length).toBeGreaterThan(0);
		// Spurious hit causes character verification, resulting in red mismatch highlight #E74C3C
		expect(
			cmds.some(
				cmd =>
					cmd[0] === act.setBackgroundColor &&
					cmd[1].some(p => typeof p === 'string' && p.toUpperCase() === '#E74C3C'),
			),
		).toBe(true);
	});

	test('findCallback triggers find via implementAction', () => {
		const implementActionSpy = jest.spyOn(rabinKarp, 'implementAction');
		rabinKarp.textField.value = 'hello';
		rabinKarp.patternField.value = 'll';

		rabinKarp.findCallback();

		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('exampleCallback handles predefined examples and Random', () => {
		rabinKarp.exampleDropdown.value = 'abab in abacabacababa';
		rabinKarp.exampleCallback();
		expect(rabinKarp.textField.value).toBe('abacabacababa');
		expect(rabinKarp.patternField.value).toBe('abab');

		rabinKarp.exampleDropdown.value = 'Random';
		rabinKarp.exampleCallback();
		expect(rabinKarp.textField.value.length).toBe(15);
		expect(rabinKarp.patternField.value.length).toBe(3);

		// Empty value
		rabinKarp.exampleDropdown.value = '';
		rabinKarp.exampleCallback();
	});

	test('generateRandomString creates random string with and without mustInclude', () => {
		const strWithout = rabinKarp.generateRandomString(5, 'abc');
		expect(strWithout.length).toBe(5);

		const strWith = rabinKarp.generateRandomString(8, 'abc', 'cab');
		expect(strWith.length).toBe(8);
		expect(strWith.includes('cab')).toBe(true);
	});

	test('clear and clearCallback reset IDs and inputs', () => {
		rabinKarp.textField.value = 'abc';
		rabinKarp.patternField.value = 'a';
		rabinKarp.textRowID = [1];
		rabinKarp.comparisonMatrixID = [[2]];
		rabinKarp.rowCountID = [0, 3];

		rabinKarp.clear(false);
		expect(rabinKarp.textField.value).toBe('');
		expect(rabinKarp.patternField.value).toBe('');
		expect(rabinKarp.compCount).toBe(0);

		// keepInput preserves fields
		rabinKarp.textField.value = 'foo';
		rabinKarp.patternField.value = 'bar';
		rabinKarp.clear(true);
		expect(rabinKarp.textField.value).toBe('foo');
		expect(rabinKarp.patternField.value).toBe('bar');

		const implementActionSpy = jest.spyOn(rabinKarp, 'implementAction');
		rabinKarp.clearCallback();
		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('disableUI and enableUI update controls disabled status', () => {
		rabinKarp.disableUI();
		rabinKarp.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		rabinKarp.enableUI();
		rabinKarp.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('setURLData handles base, text, and pattern searchParams', () => {
		const baseCallbackSpy = jest.spyOn(rabinKarp, 'baseCallback');
		const findCallbackSpy = jest.spyOn(rabinKarp, 'findCallback');

		const params = new URLSearchParams('base=7&text=abcdef&pattern=cde');
		rabinKarp.setURLData(params);

		expect(rabinKarp.baseField.value).toBe('7');
		expect(baseCallbackSpy).toHaveBeenCalled();
		expect(rabinKarp.textField.value).toBe('abcdef');
		expect(rabinKarp.patternField.value).toBe('cde');
		expect(findCallbackSpy).toHaveBeenCalled();
	});
});

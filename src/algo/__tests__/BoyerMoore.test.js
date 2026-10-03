import BoyerMoore from '../BoyerMoore.js';
import { act } from '../../anim/AnimationMain';

describe('BoyerMoore', () => {
	let boyerMoore;
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

		boyerMoore = new BoyerMoore(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls correctly', () => {
		expect(boyerMoore.controls).toBeDefined();
		expect(boyerMoore.textField).toBeDefined();
		expect(boyerMoore.patternField).toBeDefined();
		expect(boyerMoore.findButton).toBeDefined();
		expect(boyerMoore.blotButton).toBeDefined();
		expect(boyerMoore.exampleDropdown).toBeDefined();
		expect(boyerMoore.clearButton).toBeDefined();
		expect(boyerMoore.galilButton).toBeDefined();
		expect(boyerMoore.galilRuleEnabled).toBe(false);
	});

	test('setup and reset initialize and reset state properly', () => {
		boyerMoore.compCount = 10;
		boyerMoore.period = 3;
		boyerMoore.reset();
		expect(boyerMoore.compCount).toBe(0);
		expect(boyerMoore.period).toBe(1);
		expect(boyerMoore.textRowID).toEqual([]);
		expect(boyerMoore.comparisonMatrixID).toEqual([]);
	});

	test('toggleGalilRule flips galilRuleEnabled flag', () => {
		expect(boyerMoore.galilRuleEnabled).toBe(false);
		boyerMoore.toggleGalilRule();
		expect(boyerMoore.galilRuleEnabled).toBe(true);
		boyerMoore.toggleGalilRule();
		expect(boyerMoore.galilRuleEnabled).toBe(false);
	});

	test('validates empty text or pattern in find', () => {
		const cmds1 = boyerMoore.find('', 'abc');
		expect(cmds1.length).toBeGreaterThan(0);
		expect(
			cmds1.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(p => typeof p === 'string' && p.includes('must not be empty')),
			),
		).toBe(true);

		const cmds2 = boyerMoore.find('abc', '');
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
		const cmds = boyerMoore.find('cat', 'caterpillar');
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

	test('buildLastOccurrenceTableCallback and onlyBuildLastOccurrenceTable handle empty pattern and building table', () => {
		// Empty pattern
		const cmdsEmpty = boyerMoore.onlyBuildLastOccurrenceTable(0, '');
		expect(
			cmdsEmpty.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(p => typeof p === 'string' && p.includes('must not be empty')),
			),
		).toBe(true);

		// Valid pattern
		const cmdsValid = boyerMoore.onlyBuildLastOccurrenceTable(0, 'aba');
		expect(cmdsValid.length).toBeGreaterThan(0);
		expect(cmdsValid.some(cmd => cmd[0] === act.createRectangle)).toBe(true);

		const implementActionSpy = jest.spyOn(boyerMoore, 'implementAction');
		boyerMoore.patternField.value = 'aba';
		boyerMoore.buildLastOccurrenceTableCallback();
		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('buildLastTable creates last occurrence table correctly with * wildcard', () => {
		const table = boyerMoore.buildLastTable(10, 'abacaba');
		expect(table).toBeDefined();
		expect(table['a']).toBe(6);
		expect(table['b']).toBe(5);
		expect(table['c']).toBe(3);

		// Check that '*' entry is created in commands
		expect(
			boyerMoore.commands.some(
				cmd => cmd[0] === act.createRectangle && cmd[1].some(p => p === '*'),
			),
		).toBe(true);
		// Wildcard value -1
		expect(
			boyerMoore.commands.some(
				cmd => cmd[0] === act.createRectangle && cmd[1].some(p => p === '-1' || p === -1),
			),
		).toBe(true);
	});

	test('find finds pattern without Galil rule optimization', () => {
		boyerMoore.galilRuleEnabled = false;
		const cmds = boyerMoore.find('abacabacababa', 'abab');
		expect(cmds.length).toBeGreaterThan(0);
		expect(boyerMoore.compCount).toBeGreaterThan(0);
		expect(
			cmds.some(
				cmd =>
					cmd[0] === act.setBackgroundColor &&
					cmd[1].some(p => typeof p === 'string' && p.toUpperCase() === '#2ECC71'),
			),
		).toBe(true);
	});

	test('find finds pattern with Galil rule optimization enabled', () => {
		boyerMoore.galilRuleEnabled = true;
		const cmds = boyerMoore.find('aaaaaaaaaaaaa', 'aaaa');
		expect(cmds.length).toBeGreaterThan(0);
		expect(boyerMoore.compCount).toBeGreaterThan(0);
		// Galil period label update
		expect(
			cmds.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(p => typeof p === 'string' && p.includes('Period =')),
			),
		).toBe(true);
	});

	test('getMaxRows computes row counts with and without Galil rule', () => {
		boyerMoore.galilRuleEnabled = false;
		const rows1 = boyerMoore.getMaxRows('aaaaaaaaaaaaa', 'aaaa');
		expect(rows1).toBeGreaterThan(0);

		boyerMoore.galilRuleEnabled = true;
		const rows2 = boyerMoore.getMaxRows('aaaaaaaaaaaaa', 'aaaa');
		expect(rows2).toBeGreaterThan(0);
		expect(boyerMoore.period).toBe(1);
	});

	test('findCallback triggers find via implementAction', () => {
		const implementActionSpy = jest.spyOn(boyerMoore, 'implementAction');
		boyerMoore.textField.value = 'hello world';
		boyerMoore.patternField.value = 'world';

		boyerMoore.findCallback();

		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('exampleCallback handles predefined examples and Random', () => {
		boyerMoore.exampleDropdown.value = 'baaa in aaaaaaaaaaaaa';
		boyerMoore.exampleCallback();
		expect(boyerMoore.textField.value).toBe('aaaaaaaaaaaaa');
		expect(boyerMoore.patternField.value).toBe('baaa');

		boyerMoore.exampleDropdown.value = 'Random';
		boyerMoore.exampleCallback();
		expect(boyerMoore.textField.value.length).toBe(15);
		expect(boyerMoore.patternField.value.length).toBe(3);

		// Empty value
		boyerMoore.exampleDropdown.value = '';
		boyerMoore.exampleCallback();
	});

	test('generateRandomString produces random string with and without mustInclude', () => {
		const strWithout = boyerMoore.generateRandomString(8, 'xyz');
		expect(strWithout.length).toBe(8);

		const strWith = boyerMoore.generateRandomString(10, 'abc', 'bb');
		expect(strWith.length).toBe(10);
		expect(strWith.includes('bb')).toBe(true);
	});

	test('clear and clearCallback reset IDs and inputs', () => {
		boyerMoore.textField.value = 'abc';
		boyerMoore.patternField.value = 'a';
		boyerMoore.textRowID = [1, 2];
		boyerMoore.comparisonMatrixID = [[3]];
		boyerMoore.rowCountID = [0, 4];
		boyerMoore.patternTableCharacterID = [5];
		boyerMoore.patternTableIndexID = [6];
		boyerMoore.lastTableCharacterID = [7];
		boyerMoore.lastTableValueID = [8];
		boyerMoore.failureTableCharacterID = [9];
		boyerMoore.failureTableValueID = [10];

		boyerMoore.clear(false);
		expect(boyerMoore.textField.value).toBe('');
		expect(boyerMoore.patternField.value).toBe('');
		expect(boyerMoore.compCount).toBe(0);

		// clear(true) preserves input
		boyerMoore.textField.value = 'foo';
		boyerMoore.patternField.value = 'bar';
		boyerMoore.clear(true);
		expect(boyerMoore.textField.value).toBe('foo');
		expect(boyerMoore.patternField.value).toBe('bar');

		const implementActionSpy = jest.spyOn(boyerMoore, 'implementAction');
		boyerMoore.clearCallback();
		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('disableUI and enableUI update controls disabled status', () => {
		boyerMoore.disableUI();
		boyerMoore.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		boyerMoore.enableUI();
		boyerMoore.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('setURLData handles galil, text, and pattern searchParams', () => {
		const toggleGalilSpy = jest.spyOn(boyerMoore, 'toggleGalilRule');
		const findCallbackSpy = jest.spyOn(boyerMoore, 'findCallback');

		const params = new URLSearchParams('galil=1&text=abcdef&pattern=cd');
		boyerMoore.setURLData(params);

		expect(boyerMoore.galilButton.checked).toBe(true);
		expect(toggleGalilSpy).toHaveBeenCalled();
		expect(boyerMoore.textField.value).toBe('abcdef');
		expect(boyerMoore.patternField.value).toBe('cd');
		expect(findCallbackSpy).toHaveBeenCalled();
	});
});

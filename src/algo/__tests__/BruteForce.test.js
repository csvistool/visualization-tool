import BruteForce from '../BruteForce.js';
import { act } from '../../anim/AnimationMain';

describe('BruteForce', () => {
	let bruteForce;
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

		bruteForce = new BruteForce(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	test('initializes controls correctly', () => {
		expect(bruteForce.controls).toBeDefined();
		expect(bruteForce.textField).toBeDefined();
		expect(bruteForce.patternField).toBeDefined();
		expect(bruteForce.findButton).toBeDefined();
		expect(bruteForce.exampleDropdown).toBeDefined();
		expect(bruteForce.clearButton).toBeDefined();
		expect(bruteForce.compCount).toBe(0);
	});

	test('setup and reset initialize and reset state properly', () => {
		bruteForce.compCount = 15;
		bruteForce.reset();
		expect(bruteForce.compCount).toBe(0);
		expect(bruteForce.textRowID).toEqual([]);
		expect(bruteForce.comparisonMatrixID).toEqual([]);
	});

	test('validates empty text or pattern in find', () => {
		const cmds1 = bruteForce.find('', 'abc');
		expect(cmds1.length).toBeGreaterThan(0);
		expect(
			cmds1.some(
				cmd =>
					cmd[0] === act.setText &&
					cmd[1].some(p => typeof p === 'string' && p.includes('must not be empty')),
			),
		).toBe(true);

		const cmds2 = bruteForce.find('abc', '');
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
		const cmds = bruteForce.find('cat', 'caterpillar');
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

	test('find finds matching pattern in text and updates comparisons', () => {
		const cmds = bruteForce.find('aba', 'ba');
		expect(cmds.length).toBeGreaterThan(0);
		// Check that rectangles for text and comparison matrix are created
		expect(cmds.some(cmd => cmd[0] === act.createRectangle)).toBe(true);
		// Highlight circle for pointers
		expect(cmds.some(cmd => cmd[0] === act.createHighlightCircle)).toBe(true);
		// Match highlight color '#2ECC71' (green) should be present
		expect(
			cmds.some(
				cmd =>
					cmd[0] === act.setBackgroundColor &&
					cmd[1].some(p => typeof p === 'string' && p.toUpperCase() === '#2ECC71'),
			),
		).toBe(true);
		// Comparison count increased
		expect(bruteForce.compCount).toBeGreaterThan(0);
	});

	test('find handles mismatches correctly with red highlight', () => {
		const cmds = bruteForce.find('abc', 'xyz');
		expect(cmds.length).toBeGreaterThan(0);
		// Mismatch highlight color '#E74C3C' (red) should be present
		expect(
			cmds.some(
				cmd =>
					cmd[0] === act.setBackgroundColor &&
					cmd[1].some(p => typeof p === 'string' && p.toUpperCase() === '#E74C3C'),
			),
		).toBe(true);
	});

	test('find calculates cell sizes based on text and pattern length', () => {
		// maxRows <= 14 -> cellSize = 30
		bruteForce.find('shorttext', 'short');
		expect(bruteForce.cellSize).toBe(30);

		// maxRows between 15 and 17 -> cellSize = 25
		bruteForce.find('abcdefghijklmnopqrst', 'abcd'); // 20 - 4 + 1 = 17
		expect(bruteForce.cellSize).toBe(25);

		// maxRows > 17 -> cellSize = 20
		bruteForce.find('abcdefghijklmnopqrstuvwxyz', 'ab'); // 26 - 2 + 1 = 25
		expect(bruteForce.cellSize).toBe(20);
	});

	test('findCallback triggers find action via implementAction', () => {
		const implementActionSpy = jest.spyOn(bruteForce, 'implementAction');
		bruteForce.textField.value = 'hello world';
		bruteForce.patternField.value = 'world';

		bruteForce.findCallback();

		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('exampleCallback handles predefined examples and Random', () => {
		bruteForce.exampleDropdown.value = 'aaaa in aaaaaaaaaaaaa';
		bruteForce.exampleCallback();
		expect(bruteForce.textField.value).toBe('aaaaaaaaaaaaa');
		expect(bruteForce.patternField.value).toBe('aaaa');

		bruteForce.exampleDropdown.value = 'Random';
		bruteForce.exampleCallback();
		expect(bruteForce.textField.value.length).toBe(15);
		expect(bruteForce.patternField.value.length).toBe(3);
		expect(bruteForce.textField.value.includes(bruteForce.patternField.value)).toBe(true);

		// Empty selection does nothing
		bruteForce.exampleDropdown.value = '';
		bruteForce.exampleCallback();
		expect(bruteForce.textField.value.length).toBe(15);
	});

	test('generateRandomString creates valid random strings with and without mustInclude', () => {
		const strWithout = bruteForce.generateRandomString(10, 'abc');
		expect(strWithout.length).toBe(10);
		for (const ch of strWithout) {
			expect(['a', 'b', 'c']).toContain(ch);
		}

		const strWith = bruteForce.generateRandomString(12, 'xyz', 'foo');
		expect(strWith.length).toBe(12);
		expect(strWith.includes('foo')).toBe(true);
	});

	test('clearCallback and clear reset fields and IDs', () => {
		bruteForce.textField.value = 'abc';
		bruteForce.patternField.value = 'a';
		bruteForce.textRowID = [1, 2, 3];
		bruteForce.comparisonMatrixID = [[4, 5]];
		bruteForce.rowCountID = [0, 6];

		const cmds = bruteForce.clear(false);
		expect(cmds.length).toBeGreaterThan(0);
		expect(bruteForce.textField.value).toBe('');
		expect(bruteForce.patternField.value).toBe('');
		expect(bruteForce.compCount).toBe(0);

		// clearCallback wraps clear
		const implementActionSpy = jest.spyOn(bruteForce, 'implementAction');
		bruteForce.clearCallback();
		expect(implementActionSpy).toHaveBeenCalled();
	});

	test('clear keeps inputs when keepInput is true', () => {
		bruteForce.textField.value = 'abc';
		bruteForce.patternField.value = 'a';
		bruteForce.clear(true);
		expect(bruteForce.textField.value).toBe('abc');
		expect(bruteForce.patternField.value).toBe('a');
	});

	test('disableUI and enableUI modify control disabled state', () => {
		bruteForce.disableUI();
		bruteForce.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		bruteForce.enableUI();
		bruteForce.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});

	test('setURLData populates fields and triggers search', () => {
		const findCallbackSpy = jest.spyOn(bruteForce, 'findCallback');
		const params = new URLSearchParams('text=banana&pattern=nan');

		bruteForce.setURLData(params);

		expect(bruteForce.textField.value).toBe('banana');
		expect(bruteForce.patternField.value).toBe('nan');
		expect(findCallbackSpy).toHaveBeenCalled();
	});
});

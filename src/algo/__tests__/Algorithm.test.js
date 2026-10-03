import Algorithm, {
	addCheckboxToAlgorithmBar,
	addControlToAlgorithmBar,
	addDivisorToAlgorithmBar,
	addDropDownGroupToAlgorithmBar,
	addGroupToAlgorithmBar,
	addLabelToAlgorithmBar,
	addRadioButtonGroupToAlgorithmBar,
	controlKey,
} from '../Algorithm';
import { act } from '../../anim/AnimationMain';

describe('Algorithm and Control Bar Helpers', () => {
	let controlBar;
	let animControls;
	let mockAm;
	let algo;

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
		};

		algo = new Algorithm(mockAm, 800, 600);
	});

	afterEach(() => {
		document.body.innerHTML = '';
		jest.clearAllMocks();
	});

	describe('Control bar helper functions', () => {
		it('adds label to control bar without group', () => {
			const label = addLabelToAlgorithmBar('Test Label');
			expect(label.tagName).toBe('P');
			expect(label.textContent).toBe('Test Label');
			expect(controlBar.contains(label)).toBe(true);
		});

		it('adds label to a specified group container', () => {
			const group = document.createElement('div');
			const label = addLabelToAlgorithmBar('Group Label', group);
			expect(label.className).toBe('groupChild');
			expect(group.contains(label)).toBe(true);
		});

		it('adds checkbox to control bar with initial checked state', () => {
			const cb = addCheckboxToAlgorithmBar('myCheckbox', true);
			expect(cb.type).toBe('checkbox');
			expect(cb.checked).toBe(true);
			expect(controlBar.contains(cb)).toBe(true);

			const group = document.createElement('div');
			const cbInGroup = addCheckboxToAlgorithmBar('groupCb', false, group);
			expect(cbInGroup.checked).toBe(false);
			expect(group.contains(cbInGroup)).toBe(true);
		});

		it('adds dropdown select group with option mappings and algorithm tab navigation', () => {
			const options = [
				['val1', 'Option 1'],
				['val2', 'Option 2'],
			];
			const select = addDropDownGroupToAlgorithmBar(options, 'mySelect', null, algo);
			expect(select.name).toBe('mySelect');
			expect(select.options.length).toBe(2);
			expect(select.options[0].value).toBe('val1');
			expect(select.options[1].text).toBe('Option 2');
			expect(controlBar.contains(select)).toBe(true);

			const group = document.createElement('div');
			const selectGroup = addDropDownGroupToAlgorithmBar(options, 'groupSelect', group);
			expect(group.contains(selectGroup)).toBe(true);
		});

		it('adds radio button group with table layout and labels', () => {
			const names = ['Radio1', 'Radio2'];
			const buttons = addRadioButtonGroupToAlgorithmBar(names, 'testRadios', null, algo);
			expect(buttons.length).toBe(2);
			expect(buttons[0].type).toBe('radio');
			expect(buttons[0].name).toBe('testRadios');
			expect(buttons[0].value).toBe('Radio1');
			expect(controlBar.contains(buttons[0])).toBe(true);

			const group = document.createElement('div');
			const groupButtons = addRadioButtonGroupToAlgorithmBar(names, 'groupRadios', group);
			expect(group.contains(groupButtons[0])).toBe(true);
		});

		it('adds control elements (buttons, inputs) with keyboard tab navigation', () => {
			const btn = addControlToAlgorithmBar('Button', 'Run', null, algo);
			expect(btn.type).toBe('button');
			expect(btn.value).toBe('Run');
			expect(btn.getAttribute('tabindex')).toBe('0');
			expect(controlBar.contains(btn)).toBe(true);

			const group = document.createElement('div');
			const textInput = addControlToAlgorithmBar('Text', 'Initial', group);
			expect(textInput.type).toBe('text');
			expect(group.contains(textInput)).toBe(true);
		});

		it('adds divisor separators to control bar', () => {
			addDivisorToAlgorithmBar();
			expect(controlBar.querySelector('.divisorLeft')).not.toBeNull();
			expect(controlBar.querySelector('.divisorRight')).not.toBeNull();
		});

		it('adds grouped container with horizontal and vertical layouts', () => {
			const hgroup = addGroupToAlgorithmBar(true);
			expect(hgroup.className).toBe('hgroup');
			expect(controlBar.contains(hgroup)).toBe(true);

			const parent = document.createElement('div');
			const vgroup = addGroupToAlgorithmBar(false, parent);
			expect(vgroup.className).toBe('vgroup');
			expect(parent.contains(vgroup)).toBe(true);
		});

		it('identifies control keys with controlKey()', () => {
			expect(controlKey(8)).toBe(true); // Backspace
			expect(controlKey(9)).toBe(true); // Tab
			expect(controlKey(46)).toBe(true); // Delete
			expect(controlKey(65)).toBe(false); // Key 'A'
		});
	});

	describe('Base Algorithm lifecycle and command management', () => {
		it('initializes listeners on AnimationManager', () => {
			expect(mockAm.addListener).toHaveBeenCalledWith(
				'AnimationStarted',
				algo,
				algo.disableUI,
			);
			expect(mockAm.addListener).toHaveBeenCalledWith('AnimationEnded', algo, algo.enableUI);
			expect(mockAm.addListener).toHaveBeenCalledWith('AnimationUndo', algo, algo.undo);
			expect(algo.canvasWidth).toBe(800);
			expect(algo.canvasHeight).toBe(600);
		});

		it('handles constructor when AnimationManager is null', () => {
			const emptyAlgo = new Algorithm(null, 100, 100);
			expect(emptyAlgo.animationManager).toBeUndefined();
		});

		it('buffers commands when recordAnimation is true', () => {
			algo.recordAnimation = true;
			algo.commands = [];
			algo.cmd(act.createCircle, 1, 'Circle', 100, 100);
			expect(algo.commands).toEqual([[act.createCircle, [1, 'Circle', 100, 100]]]);

			algo.recordAnimation = false;
			algo.cmd(act.createCircle, 2, 'Circle2', 200, 200);
			expect(algo.commands.length).toBe(1);
		});

		it('clears action history', () => {
			algo.actionHistory = [[() => {}, [1, 2]]];
			algo.clearHistory();
			expect(algo.actionHistory).toEqual([]);
		});

		it('implements actions and starts new animation on animationManager', () => {
			const mockAction = jest.fn(() => ['cmd1', 'cmd2']);
			algo.implementAction(mockAction, 'param1', 'param2');

			expect(mockAction).toHaveBeenCalledWith('param1', 'param2');
			expect(algo.actionHistory.length).toBe(1);
			expect(mockAm.startNewAnimation).toHaveBeenCalledWith(['cmd1', 'cmd2']);
		});

		it('replays action history on undo', () => {
			const step1 = jest.fn();
			const step2 = jest.fn();
			algo.reset = jest.fn();

			algo.actionHistory = [
				[step1, ['arg1']],
				[step2, ['arg2']],
			];

			algo.undo();

			expect(algo.reset).toHaveBeenCalled();
			expect(step1).toHaveBeenCalledWith('arg1');
			expect(step2).not.toHaveBeenCalled();
			expect(algo.actionHistory.length).toBe(1);
		});

		it('normalizes numeric input strings', () => {
			expect(algo.normalizeNumber('12345', 3)).toBe('345');
			expect(algo.normalizeNumber('abc', 3)).toBe('abc');
			expect(algo.normalizeNumber('', 3)).toBe('');
		});

		it('throws errors for abstract methods', () => {
			expect(() => algo.sizeChanged(100, 100)).toThrow(
				'sizeChanged() should be implemented in base class',
			);
			expect(() => algo.disableUI()).toThrow(
				'disableUI() should be implemented in base class',
			);
			expect(() => algo.enableUI()).toThrow('enableUI() should be implemented in base class');
			expect(() => algo.reset()).toThrow('reset() should be implemented in base class');
		});
	});

	describe('Pseudocode canvas layout and highlighting', () => {
		const mockCode = {
			testKey: {
				english: [['Line 1', ' extra'], ['Line 2']],
				code: [['codeLine 1'], ['codeLine 2']],
			},
		};

		beforeEach(() => {
			algo.nextIndex = 100;
		});

		it('adds pseudocode matrices to canvas base and returns code IDs', () => {
			const codeIDs = algo.addCodeToCanvasBaseAll(mockCode, 'testKey', 50, 50, 16);
			expect(codeIDs.english.length).toBe(2);
			expect(codeIDs.code.length).toBe(2);
			expect(algo.commands.length).toBeGreaterThan(0);
		});

		it('highlights code lines with string key or matrix coordinates', () => {
			algo.commands = [];
			algo.highlight(1, null, 'myMethod');
			expect(algo.commands).toContainEqual([act.highlightCodeLine, ['myMethod', 1]]);

			algo.commands = [];
			const singleMatrix = [[101], [102]];
			algo.highlight(1, 0, singleMatrix);
			expect(algo.commands).toContainEqual([act.setForegroundColor, [102, '#FF0000']]);

			algo.commands = [];
			const dualMatrix = { english: [[101]], code: [[102]] };
			algo.highlight(0, 0, dualMatrix);
			expect(algo.commands).toContainEqual([act.setForegroundColor, [101, '#FF0000']]);
			expect(algo.commands).toContainEqual([act.setForegroundColor, [102, '#FF0000']]);

			algo.commands = [];
			algo.highlight(0, 0, dualMatrix, 'code');
			expect(algo.commands).toContainEqual([act.setForegroundColor, [102, '#FF0000']]);
		});

		it('unhighlights code lines with string key or matrix coordinates', () => {
			algo.commands = [];
			algo.unhighlight(2, null, 'myMethod');
			expect(algo.commands).toContainEqual([act.unhighlightCodeLine, ['myMethod', 2]]);

			algo.commands = [];
			const singleMatrix = [[101], [102]];
			algo.unhighlight(0, 0, singleMatrix);
			expect(algo.commands).toContainEqual([act.setForegroundColor, [101, '#000000']]);

			algo.commands = [];
			const dualMatrix = { english: [[101]], code: [[102]] };
			algo.unhighlight(0, 0, dualMatrix);
			expect(algo.commands).toContainEqual([act.setForegroundColor, [101, '#000000']]);
			expect(algo.commands).toContainEqual([act.setForegroundColor, [102, '#000000']]);

			algo.commands = [];
			algo.unhighlight(0, 0, dualMatrix, 'english');
			expect(algo.commands).toContainEqual([act.setForegroundColor, [101, '#000000']]);
		});

		it('removes code labels from canvas', () => {
			algo.commands = [];
			const codeIDs = {
				english: [[201], [202]],
				code: [[301]],
			};
			algo.removeCode(codeIDs);
			expect(algo.commands).toContainEqual([act.delete, [201]]);
			expect(algo.commands).toContainEqual([act.delete, [202]]);
			expect(algo.commands).toContainEqual([act.delete, [301]]);
		});

		it('sets alpha on code elements', () => {
			algo.commands = [];
			algo.setCodeAlpha([[401, 402]], 0.5);
			expect(algo.commands).toContainEqual([act.setAlpha, [401, 0.5]]);
			expect(algo.commands).toContainEqual([act.setAlpha, [402, 0.5]]);
		});
	});

	describe('Input validation, keyboard navigation, and button shake', () => {
		it('shakes a button by toggling CSS class with timer', () => {
			jest.useFakeTimers();
			const btn = document.createElement('button');
			algo.shake(btn);
			expect(btn.classList.contains('shake')).toBe(true);

			jest.advanceTimersByTime(750);
			expect(btn.classList.contains('shake')).toBe(false);
			jest.useRealTimers();
		});

		it('handles input field highlighting and unhighlighting', () => {
			const input = document.createElement('input');
			input.type = 'text';
			input.select = jest.fn();
			controlBar.appendChild(input);

			algo.highlightInputField(input);
			expect(input.classList.contains('tab-focused-input')).toBe(true);
			expect(input.select).toHaveBeenCalled();

			algo.unhighlightInputFields();
			expect(input.classList.contains('tab-focused-input')).toBe(false);
		});

		it('finds next focusable input element', () => {
			const input1 = document.createElement('input');
			input1.type = 'text';
			const input2 = document.createElement('input');
			input2.type = 'text';

			controlBar.appendChild(input1);
			controlBar.appendChild(input2);

			expect(algo.getNextFocusableInput(input1, 1)).toBe(input2);
			expect(algo.getNextFocusableInput(input2, 1)).toBe(input1);
			expect(algo.getNextFocusableInput(input1, -1)).toBe(input2);
		});

		it('attaches enter key trigger on buttons and inputs', () => {
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.click = jest.fn();
			algo.attachTabNavigation(btn);

			const enterEvent = new KeyboardEvent('keydown', { keyCode: 13 });
			btn.dispatchEvent(enterEvent);
			expect(btn.click).toHaveBeenCalled();

			const customAction = jest.fn();
			const customInput = document.createElement('input');
			algo.attachTabNavigation(customInput, customAction);
			customInput.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13 }));
			expect(customAction).toHaveBeenCalled();
		});

		it('validates returnSubmit key events', () => {
			const submitAction = jest.fn();
			const input = document.createElement('input');
			input.value = '12';
			const handler = algo.returnSubmit(input, submitAction, 4, true);

			// Enter key triggers submit
			handler({ which: 13 });
			expect(submitAction).toHaveBeenCalled();

			// Numeric digit allowed
			expect(handler({ which: 50 })).toBeUndefined();

			// Character rejected for integer-only input
			expect(handler({ which: 65 })).toBe(false);

			// Backspace control key allowed
			expect(handler({ which: 8 })).toBeUndefined();
		});

		it('validates returnSubmitFloat for decimal numbers', () => {
			const submitAction = jest.fn();
			const input = document.createElement('input');
			input.value = '12';
			const handler = algo.returnSubmitFloat(input, submitAction, 6);

			// Enter submits
			handler({ which: 13 });
			expect(submitAction).toHaveBeenCalled();

			// Decimal point allowed once
			expect(handler({ which: 190 })).toBeUndefined();

			// Control key allowed
			expect(handler({ which: 8 })).toBeUndefined();

			// Alpha character rejected
			expect(handler({ which: 65 })).toBe(false);
		});

		it('binds returnSubmit with addReturnSubmit', () => {
			const input = document.createElement('input');
			const action = jest.fn();
			algo.addReturnSubmit(input, action);
			expect(typeof input.onkeydown).toBe('function');
		});

		it('handles Tab key navigation cycling across controls in control root', () => {
			const input1 = document.createElement('input');
			input1.type = 'text';
			Object.defineProperty(input1, 'offsetParent', { value: controlBar });
			const input2 = document.createElement('input');
			input2.type = 'text';
			Object.defineProperty(input2, 'offsetParent', { value: controlBar });

			controlBar.appendChild(input1);
			controlBar.appendChild(input2);

			input1.focus();
			expect(document.activeElement).toBe(input1);

			// Forward Tab
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
			expect(input2.classList.contains('tab-focused-input')).toBe(true);

			// Shift+Tab backward
			document.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
			);
			expect(input1.classList.contains('tab-focused-input')).toBe(true);
		});

		it('enables tab navigation for button using enableTabNavigationForButton helper', () => {
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.click = jest.fn();
			algo.enableTabNavigationForButton(btn);

			btn.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13 }));
			expect(btn.click).toHaveBeenCalled();
		});

		it('calls parseInput placeholder without throwing', () => {
			expect(() => algo.parseInput('123', true)).not.toThrow();
		});
	});
});

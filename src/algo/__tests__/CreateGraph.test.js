import CreateGraph from '../CreateGraph.js';

describe('CreateGraph', () => {
	let createGraph;
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
			setAllLayers: jest.fn(),
			setLayer: jest.fn(),
		};

		createGraph = new CreateGraph(mockAm, 800, 600);
	});

	test('initializes controls with default adjacency list in textarea', () => {
		expect(createGraph.listField).toBeDefined();
		expect(createGraph.runButton).toBeDefined();
		expect(createGraph.listField.value).toContain('A->');

		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('sanitizes input on textarea input event', () => {
		createGraph.listField.value = 'A->B,C!@#123';
		const event = new Event('input');
		createGraph.listField.dispatchEvent(event);

		// Disallowed characters (!@#123) should be stripped
		expect(createGraph.listField.value).toBe('A->B,C');
	});

	test('shakes run button when input is empty', () => {
		mockAm.resetAll.mockClear();
		createGraph.listField.value = '';
		createGraph.startCallback();

		expect(mockAm.resetAll).not.toHaveBeenCalled();
	});

	test('parses adjacency list and updates graph on startCallback', () => {
		createGraph.listField.value = 'A->B\nB->A';
		createGraph.startCallback();

		expect(mockAm.resetAll).toHaveBeenCalled();
	});

	test('handles layer switches between logical, list, and matrix representations', () => {
		createGraph.graphRepChangedCallback(2);
		expect(createGraph.currentLayer).toBe(2);

		createGraph.graphRepChangedCallback(3);
		expect(createGraph.currentLayer).toBe(3);

		createGraph.graphRepChangedCallback(1);
		expect(createGraph.currentLayer).toBe(1);
	});
});

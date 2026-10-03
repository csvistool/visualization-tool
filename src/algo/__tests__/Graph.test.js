import Graph, { LARGE_SIZE, SMALL_SIZE } from '../Graph.js';

describe('Graph', () => {
	let graph;
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

		graph = new Graph(mockAm, 800, 600, [], false, false, false);
		graph.addControls();
	});

	test('initializes default small graph with controls', () => {
		expect(graph.newGraphButton).toBeDefined();
		expect(graph.defaultGraphButton).toBeDefined();
		expect(graph.undirectedGraphButton).toBeDefined();
		expect(graph.directedGraphButton).toBeDefined();
		expect(graph.smallGraphButton).toBeDefined();
		expect(graph.largeGraphButton).toBeDefined();
		expect(graph.logicalButton).toBeDefined();
		expect(graph.adjacencyListButton).toBeDefined();
		expect(graph.adjacencyMatrixButton).toBeDefined();

		expect(graph.size).toBe(SMALL_SIZE);
		expect(mockAm.startNewAnimation).toHaveBeenCalled();
	});

	test('switches between small and large graph representations', () => {
		graph.largeGraphCallback();
		expect(graph.size).toBe(LARGE_SIZE);
		expect(mockAm.resetAll).toHaveBeenCalled();

		graph.smallGraphCallback();
		expect(graph.size).toBe(SMALL_SIZE);
	});

	test('switches between directed and undirected graph modes', () => {
		expect(graph.directed).toBe(false);

		graph.directedGraphCallback(true);
		expect(graph.directed).toBe(true);

		graph.directedGraphCallback(false);
		expect(graph.directed).toBe(false);
	});

	test('handles newGraphCallback and defaultGraphCallback', () => {
		graph.newGraphCallback();
		expect(mockAm.resetAll).toHaveBeenCalled();

		graph.defaultGraphCallback();
		expect(mockAm.resetAll).toHaveBeenCalled();
	});

	test('changes graph representation layer', () => {
		// Layer 2: Adjacency List
		graph.graphRepChangedCallback(2);
		expect(graph.currentLayer).toBe(2);
		expect(mockAm.setAllLayers).toHaveBeenCalledWith([0, 32, 2]);

		// Layer 3: Adjacency Matrix
		graph.graphRepChangedCallback(3);
		expect(graph.currentLayer).toBe(3);
		expect(mockAm.setAllLayers).toHaveBeenCalledWith([0, 32, 3]);

		// Layer 1: Logical
		graph.graphRepChangedCallback(1);
		expect(graph.currentLayer).toBe(1);
		expect(mockAm.setAllLayers).toHaveBeenCalledWith([0, 32, 1]);
	});

	test('disables and enables UI controls', () => {
		graph.disableUI();
		graph.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(true);
		});

		graph.enableUI();
		graph.controls.forEach(ctrl => {
			expect(ctrl.disabled).toBe(false);
		});
	});
});

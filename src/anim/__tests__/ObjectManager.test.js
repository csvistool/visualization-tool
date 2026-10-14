import ObjectManager from '../ObjectManager';

describe('ObjectManager', () => {
	let mockContext;
	let canvasRef;
	let manager;

	beforeEach(() => {
		mockContext = {
			arc: jest.fn(),
			beginPath: jest.fn(),
			clearRect: jest.fn(),
			closePath: jest.fn(),
			fill: jest.fn(),
			fillText: jest.fn(),
			lineTo: jest.fn(),
			measureText: jest.fn(str => ({ width: str.length * 8 })),
			moveTo: jest.fn(),
			quadraticCurveTo: jest.fn(),
			stroke: jest.fn(),
			strokeText: jest.fn(),
		};

		canvasRef = {
			current: {
				getContext: jest.fn(() => mockContext),
			},
		};

		manager = new ObjectManager(canvasRef);
		manager.width = 800;
		manager.height = 600;
	});

	it('initializes with default canvas context, layers, and status report label', () => {
		expect(manager.ctx).toBe(mockContext);
		expect(manager.nodes).toEqual([]);
		expect(manager.edges).toEqual([]);
		expect(manager.backEdges).toEqual([]);
		expect(manager.activeLayers[0]).toBe(true);
		expect(manager.activeLayers[32]).toBe(true);
		expect(manager.activeLayers[33]).toBe(false);
		expect(manager.framenum).toBe(0);
		expect(manager.statusReport).toBeDefined();
		expect(manager.statusReport.x).toBe(30);

		manager.update(); // no-op
	});

	describe('Object registration and retrieval', () => {
		it('registers all animated object types without error and prevents duplicate IDs', () => {
			manager.addCircleObject(1, 'C1');
			expect(() => manager.addCircleObject(1, 'C1_dup')).toThrow(
				'addCircleObject: object with same ID (1) already exists!',
			);

			manager.addHighlightCircleObject(2, '#FF0000', 20);
			expect(() => manager.addHighlightCircleObject(2, '#FF0000', 20)).toThrow(
				'addHighlightCircleObject: object with same ID (2) already exists!',
			);

			manager.addRectangleObject(3, 'R1', 50, 30, 'center', 'center', '#FFF', '#000');
			expect(() =>
				manager.addRectangleObject(3, 'R1', 50, 30, 'center', 'center', '#FFF', '#000'),
			).toThrow('addRectangleObject: object with same ID already exists!');

			manager.addLabelObject(4, 'L1', true, false, false);
			expect(() => manager.addLabelObject(4, 'L1', true, false, false)).toThrow(
				'addLabelObject: object already exists!',
			);

			manager.addLinkedListObject(5, ['LL'], 60, 30, 0.25, false, true, '#FFF', '#000');
			expect(() =>
				manager.addLinkedListObject(5, ['LL'], 60, 30, 0.25, false, true, '#FFF', '#000'),
			).toThrow('addLinkedListObject: object with same ID already exists!');

			manager.addDoublyLinkedListObject(6, 'DLL', 70, 35, 0.2, '#FFF', '#000');
			expect(() =>
				manager.addDoublyLinkedListObject(6, 'DLL', 70, 35, 0.2, '#FFF', '#000'),
			).toThrow('addDoublyLinkedListObject: object with same ID already exists!');

			manager.addCircularlyLinkedListObject(7, 'CLL', 65, 30, 0.2, '#FFF', '#000');
			expect(() =>
				manager.addCircularlyLinkedListObject(7, 'CLL', 65, 30, 0.2, '#FFF', '#000'),
			).toThrow('addCircularlyLinkedListObject: object with same ID already exists!');

			manager.addSkipListObject(8, 'SKL', 50, 25, '#FFF', '#000');
			expect(() => manager.addSkipListObject(8, 'SKL', 50, 25, '#FFF', '#000')).toThrow(
				'addSkipListObject: object with same ID already exists!',
			);

			manager.addBTreeNode(9, 40, 30, 2, '#FFF', '#000');
			expect(() => manager.addBTreeNode(9, 40, 30, 2, '#FFF', '#000')).toThrow(
				'addBTreeNode: object with same ID already exists!',
			);

			// addBTreeNode default colors
			manager.addBTreeNode(10, 40, 30, 1);
			expect(manager.nodes[10].backgroundColor).toBe('#FFFFFF');
			expect(manager.nodes[10].foregroundColor).toBe('#FFFFFF');

			// getObject
			expect(manager.getObject(1)).toBe(manager.nodes[1]);
			expect(() => manager.getObject(999)).toThrow(
				'getObject:Object with ID (999) does not exist',
			);
		});

		it('removes objects from last and middle positions', () => {
			manager.addCircleObject(0, 'A');
			manager.addCircleObject(1, 'B');
			manager.addCircleObject(2, 'C');

			// Removing last item pops array
			const removedLast = manager.removeObject(2);
			expect(removedLast.objectID).toBe(2);
			expect(manager.nodes.length).toBe(2);

			// Removing middle item sets to null
			const removedMid = manager.removeObject(0);
			expect(removedMid.objectID).toBe(0);
			expect(manager.nodes[0]).toBeNull();

			// clearAllObjects
			manager.clearAllObjects();
			expect(manager.nodes).toEqual([]);
			expect(manager.edges).toEqual([]);
			expect(manager.backEdges).toEqual([]);
		});
	});

	describe('Position, dimension, and property accessors', () => {
		it('manages position, dimensions, colors, and alpha with fallback for missing nodes', () => {
			manager.addRectangleObject(1, 'Node1', 60, 30, 'center', 'center', '#FFF', '#000');

			// Node coordinates
			manager.setNodePosition(1, 150, 250);
			expect(manager.getNodeX(1)).toBe(150);
			expect(manager.getNodeY(1)).toBe(250);

			// Unset or invalid inputs
			manager.setNodePosition(1, undefined, 250);
			expect(manager.getNodeX(1)).toBe(150);
			manager.setNodePosition(999, 10, 20); // missing node
			expect(manager.getNodeX(999)).toBeUndefined();
			expect(manager.getNodeY(999)).toBeUndefined();

			// Width and Height
			manager.setWidth(1, 80);
			manager.setHeight(1, 40);
			expect(manager.getWidth(1)).toBe(80);
			expect(manager.getHeight(1)).toBe(40);
			expect(manager.getWidth(999)).toBe(-1);
			expect(manager.getHeight(999)).toBe(-1);
			manager.setWidth(999, 50); // no error
			manager.setHeight(999, 50);

			// Alpha
			manager.setAlpha(1, 0.5);
			expect(manager.getAlpha(1)).toBe(0.5);
			expect(manager.getAlpha(999)).toBe(-1);
			manager.setAlpha(999, 0.8);

			// Colors
			manager.setBackgroundColor(1, '#112233');
			manager.setForegroundColor(1, '#445566');
			expect(manager.backgroundColor(1)).toBe('#112233');
			expect(manager.foregroundColor(1)).toBe('#445566');
			expect(manager.backgroundColor(999)).toBe('#000000');
			expect(manager.foregroundColor(999)).toBe('#000000');
			manager.setBackgroundColor(999, '#FFF');
			manager.setForegroundColor(999, '#FFF');

			// Text colors
			manager.setTextColor(1, '#AABBCC', 0);
			expect(manager.getTextColor(1, 0)).toBe('#AABBCC');
			expect(manager.getTextColor(999, 0)).toBe('#000000');
			manager.setTextColor(999, '#FFF', 0);

			// Highlights
			manager.setHighlight(1, true, '#FF0000');
			expect(manager.getHighlight(1)).toBe(true);
			expect(manager.getHighlight(999)).toBe(false);
			manager.setHighlight(999, true);

			manager.setHighlightIndex(1, 2);
			expect(manager.getHighlightIndex(1)).toBe(2);
			expect(manager.getHighlightIndex(999)).toBe(false);
			manager.setHighlightIndex(999, 2);
		});

		it('manages text, text width calculation, and multi-line strings', () => {
			manager.addCircleObject(1, 'Initial');
			expect(manager.getText(1, 0)).toBe('Initial');

			manager.setText(1, 'Updated', 0);
			expect(manager.getText(1, 0)).toBe('Updated');

			expect(() => manager.setText(999, 'Missing')).toThrow(
				'setting text of an object that does not exist',
			);
			expect(() => manager.getText(999)).toThrow(
				'getting text of an object that does not exist',
			);

			// getTextWidth with different formats
			const singleWidth = manager.getTextWidth('Hello', false, false);
			expect(singleWidth).toBe(40);

			const codeWidth = manager.getTextWidth('code', true, false);
			expect(mockContext.font).toBe('13px "Source Code Pro", monospace');
			expect(codeWidth).toBe(32);

			const ptrWidth = manager.getTextWidth('ptr', false, true);
			expect(mockContext.font).toBe('16px Arial');
			expect(ptrWidth).toBe(24);

			const multiLineWidth = manager.getTextWidth('Line1\nLongerLine2', false, false);
			expect(multiLineWidth).toBe(11 * 8);
		});

		it('manages null pointer properties across different node types', () => {
			manager.addLinkedListObject(1, ['Val'], 50, 30, 0.2, false, true, '#FFF', '#000');
			manager.setNull(1, true);
			expect(manager.getNull(1)).toBe(true);
			expect(manager.getNull(999)).toBe(false);
			manager.setNull(999, true);

			manager.addDoublyLinkedListObject(2, 'DVal', 60, 30, 0.2, '#FFF', '#000');
			manager.setPrevNull(2, true);
			manager.setNextNull(2, true);
			expect(manager.getLeftNull(2)).toBe(true);
			expect(manager.getRightNull(2)).toBe(true);
			expect(manager.getLeftNull(999)).toBe(false);
			expect(manager.getRightNull(999)).toBe(false);
			manager.setPrevNull(999, true);
			manager.setNextNull(999, true);
		});

		it('manages alwaysOnTop, rectangle edge thickness, and numElements', () => {
			manager.addRectangleObject(1, 'R1', 40, 40, 'center', 'center', '#FFF', '#000');

			const prevOnTop = manager.setAlwaysOnTop(1, true);
			expect(prevOnTop).toBeUndefined();
			expect(manager.nodes[1].alwaysOnTop).toBe(true);
			expect(() => manager.setAlwaysOnTop(999, true)).toThrow(
				"Trying to bring node that doesn't exist to top",
			);

			const oldThick = manager.setRectangleEdgeThickness(1, [true, false, true, false]);
			expect(oldThick).toEqual([false, false, false, false]);
			expect(manager.nodes[1].getEdgeThickness()).toEqual([true, false, true, false]);
			expect(() => manager.setRectangleEdgeThickness(999, [true])).toThrow(
				"Trying to bring node that doesn't exist to top",
			);

			manager.addBTreeNode(2, 30, 20, 3, '#FFF', '#000');
			expect(manager.getNumElements(2)).toBe(3);
			manager.setNumElements(2, 5);
			expect(manager.getNumElements(2)).toBe(5);
		});
	});

	describe('Alignment methods', () => {
		it('aligns nodes and returns alignment positions correctly', () => {
			manager.addRectangleObject(1, 'Target', 60, 40, 'center', 'center', '#FFF', '#000');
			manager.addRectangleObject(2, 'Mover', 40, 20, 'center', 'center', '#FFF', '#000');
			manager.setNodePosition(1, 200, 200);

			manager.alignTop(2, 1);
			expect(manager.getNodeY(2)).toBeLessThan(200);

			manager.alignBottom(2, 1);
			expect(manager.getNodeY(2)).toBeGreaterThan(200);

			manager.alignLeft(2, 1);
			expect(manager.getNodeX(2)).toBeGreaterThan(200);

			manager.alignRight(2, 1);
			expect(manager.getNodeX(2)).toBeLessThan(200);

			const rightPos = manager.getAlignRightPos(2, 1);
			expect(rightPos).toHaveLength(2);

			const leftPos = manager.getAlignLeftPos(2, 1);
			expect(leftPos).toHaveLength(2);

			// Missing nodes throw errors
			expect(() => manager.alignTop(999, 1)).toThrow(
				"Trying to align two nodes, one doesn't exist",
			);
			expect(() => manager.alignBottom(1, 999)).toThrow(
				"Trying to align two nodes, one doesn't exist",
			);
			expect(() => manager.alignLeft(999, 999)).toThrow(
				"Trying to align two nodes, one doesn't exist",
			);
			expect(() => manager.alignRight(999, 1)).toThrow(
				"Trying to align two nodes, one doesn't exist",
			);
			expect(() => manager.getAlignRightPos(999, 1)).toThrow(
				"Trying to align two nodes, one doesn't exist",
			);
			expect(() => manager.getAlignLeftPos(1, 999)).toThrow(
				"Trying to align two nodes, one doesn't exist",
			);
		});
	});

	describe('Edges, connections, and incidents', () => {
		it('creates, customizes, and disconnects edges', () => {
			manager.addCircleObject(1, 'A');
			manager.addCircleObject(2, 'B');
			manager.setNodePosition(1, 100, 100);
			manager.setNodePosition(2, 300, 100);

			// connectEdge
			manager.connectEdge(1, 2, '#000000', 0, true, 'lab', 0, 2);
			expect(manager.edges[1]).toHaveLength(1);
			expect(manager.backEdges[2]).toHaveLength(1);

			// Failure if node does not exist
			expect(() => manager.connectEdge(1, 999)).toThrow(
				"Tried to connect two nodes, one didn't exist!",
			);

			// Edge properties
			const oldColor = manager.setEdgeColor(1, 2, '#FF0000');
			expect(oldColor).toBe('#000000');

			const oldAlpha = manager.setEdgeAlpha(1, 2, 0.4);
			expect(oldAlpha).toBe(1.0);

			const oldThickness = manager.setEdgeThickness(1, 2, 4);
			expect(oldThickness).toBe(2);

			const oldHighlight = manager.setEdgeHighlight(1, 2, true, '#00FF00');
			expect(oldHighlight).toBe(false);

			// Edge property setters with invalid fromID are safe
			expect(manager.setEdgeColor(999, 2, '#FFF')).toBe('#000000');
			expect(manager.setEdgeAlpha(999, 2, 0.5)).toBe(1.0);
			expect(manager.setEdgeThickness(999, 2, 3)).toBe(1);
			expect(manager.setEdgeHighlight(999, 2, true)).toBe(false);

			// disconnect
			const undoDisconnect = manager.disconnect(1, 2);
			expect(undoDisconnect).toBeDefined();
			expect(manager.edges[1]).toHaveLength(0);
			expect(manager.backEdges[2]).toHaveLength(0);

			// disconnect when no edges exist
			expect(manager.disconnect(999, 999)).toBeNull();
		});

		it('deletes incident edges from both forward and backward connections', () => {
			manager.addCircleObject(1, 'A');
			manager.addCircleObject(2, 'B');
			manager.addCircleObject(3, 'C');

			manager.connectEdge(1, 2, '#000', 0, true, '', 0, 1);
			manager.connectEdge(3, 1, '#000', 0, true, '', 0, 1);

			const undoList = manager.deleteIncident(1);
			expect(undoList).toHaveLength(2);
			expect(manager.edges[1]).toBeNull();
			expect(manager.backEdges[1]).toBeNull();
		});
	});

	describe('Layers and visibility', () => {
		it('toggles, updates, and sets layers for nodes and connected edges', () => {
			manager.addCircleObject(1, 'A');
			manager.addCircleObject(2, 'B');
			manager.setLayer(1, 1);
			manager.setLayer(2, 2);
			manager.connectEdge(1, 2, '#000', 0, true, '', 0, 1);

			// Layer 1 is initially not active
			expect(manager.nodes[1].addedToScene).toBe(false);

			// updateLayer activates layer 1
			manager.updateLayer(1, true);
			expect(manager.activeLayers[1]).toBe(true);
			expect(manager.nodes[1].addedToScene).toBe(true);
			// Edge not added until layer 2 is also active
			expect(manager.edges[1][0].addedToScene).toBe(false);

			manager.updateLayer(2, true);
			expect(manager.edges[1][0].addedToScene).toBe(true);

			// Changing layer on target node updates its incoming backEdges
			manager.setLayer(2, 3);
			expect(manager.nodes[2].addedToScene).toBe(false);
			expect(manager.edges[1][0].addedToScene).toBe(false);

			// Changing layer on source node with active layer updates outgoing edges
			manager.setLayer(1, 0);
			expect(manager.nodes[1].addedToScene).toBe(true);

			// toggleLayer
			manager.toggleLayer(1);
			expect(manager.activeLayers[1]).toBe(false);
			expect(manager.nodes[1].addedToScene).toBe(true);

			// setLayers & setAllLayers
			manager.setLayers(true, [1]);
			expect(manager.activeLayers[1]).toBe(true);

			manager.setAllLayers([0, 1]);
			expect(manager.activeLayers[0]).toBe(true);
			expect(manager.activeLayers[1]).toBe(true);
			expect(manager.activeLayers[2]).toBeUndefined();

			// setLayer on missing node
			manager.setLayer(999, 1); // safe
		});
	});

	describe('draw() pipeline', () => {
		it('executes full drawing pipeline across unhighlighted, highlighted, alwaysOnTop nodes and edges', () => {
			manager.addCircleObject(1, 'Normal');
			manager.addCircleObject(2, 'Highlighted');
			manager.addCircleObject(3, 'AlwaysOnTop');
			manager.addCircleObject(4, 'HighOnTop');

			manager.setNodePosition(1, 50, 50);
			manager.setNodePosition(2, 100, 100);
			manager.setNodePosition(3, 150, 150);
			manager.setNodePosition(4, 200, 200);

			manager.nodes[1].addedToScene = true;

			manager.nodes[2].addedToScene = true;
			manager.nodes[2].highlighted = true;

			manager.nodes[3].addedToScene = true;
			manager.nodes[3].alwaysOnTop = true;

			manager.nodes[4].addedToScene = true;
			manager.nodes[4].alwaysOnTop = true;
			manager.nodes[4].highlighted = true;

			manager.connectEdge(1, 2, '#000', 0, true, '', 0, 1);
			manager.edges[1][0].addedToScene = true;

			manager.framenum = 1001; // tests framenum reset back to 0
			manager.draw();

			expect(manager.framenum).toBe(0);
			expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
			expect(manager.statusReport.y).toBe(585);
			expect(mockContext.stroke).toHaveBeenCalled();
		});
	});
});

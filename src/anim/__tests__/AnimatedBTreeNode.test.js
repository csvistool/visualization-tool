import AnimatedBTreeNode from '../AnimatedBTreeNode';

describe('AnimatedBTreeNode', () => {
	let mockContext;
	let mockWorld;

	beforeEach(() => {
		mockContext = {
			beginPath: jest.fn(),
			closePath: jest.fn(),
			fill: jest.fn(),
			fillText: jest.fn(),
			lineTo: jest.fn(),
			moveTo: jest.fn(),
			stroke: jest.fn(),
		};

		mockWorld = {
			addBTreeNode: jest.fn(),
			setHighlight: jest.fn(),
			setLayer: jest.fn(),
			setNodePosition: jest.fn(),
			setText: jest.fn(),
			setTextColor: jest.fn(),
		};
	});

	it('initializes with expected default properties and dimensions', () => {
		const node = new AnimatedBTreeNode(1, 40, 30, 3, '#FFFFFF', '#000000');

		expect(node.objectID).toBe(1);
		expect(node.widthPerElement).toBe(40);
		expect(node.h).toBe(30);
		expect(node.numLabels).toBe(3);
		expect(node.backgroundColor).toBe('#FFFFFF');
		expect(node.foregroundColor).toBe('#000000');
		expect(node.highlighted).toBe(false);
		expect(node.getNumElements()).toBe(3);
		expect(node.getWidth()).toBe(120);
		expect(node.getHeight()).toBe(30);
		expect(node.labelColors).toEqual(['#000000', '#000000', '#000000']);
	});

	it('returns MIN_WIDTH when numLabels is 0', () => {
		const emptyNode = new AnimatedBTreeNode(2, 40, 30, 0, '#FFF', '#000');
		expect(emptyNode.getWidth()).toBe(10);
	});

	it('dynamically adjusts element count via setNumElements', () => {
		const node = new AnimatedBTreeNode(3, 30, 20, 2, '#FFF', '#000');
		node.labels = ['A', 'B'];

		// Expand elements: 2 -> 4
		node.setNumElements(4);
		expect(node.getNumElements()).toBe(4);
		expect(node.labels[2]).toBe('');
		expect(node.labels[3]).toBe('');
		expect(node.labelColors[2]).toBe('#000');
		expect(node.labelColors[3]).toBe('#000');

		// Shrink elements: 4 -> 1
		node.setNumElements(1);
		expect(node.getNumElements()).toBe(1);
		expect(node.labels[1]).toBeNull();

		// Same element count: no-op
		node.setNumElements(1);
		expect(node.getNumElements()).toBe(1);
	});

	it('gets and sets text and text colors with and without explicit index', () => {
		const node = new AnimatedBTreeNode(4, 30, 20, 3, '#FFF', '#000');

		// Default index (0)
		node.setText('First');
		expect(node.getText()).toBe('First');
		expect(node.getText(0)).toBe('First');

		node.setTextColor('#0000FF');
		expect(node.getTextColor()).toBe('#0000FF');
		expect(node.getTextColor(0)).toBe('#0000FF');

		// Explicit index (2)
		node.setText('Third', 2);
		expect(node.getText(2)).toBe('Third');

		node.setTextColor('#00FF00', 2);
		expect(node.getTextColor(2)).toBe('#00FF00');
	});

	it('updates foreground color safely across labels', () => {
		const node = new AnimatedBTreeNode(5, 30, 20, 2, '#FFF', '#000');
		node.labelColor = []; // initialize array to safeguard against implementation property name
		node.setForegroundColor('#FF00FF');
		expect(node.foregroundColor).toBe('#FF00FF');
		expect(node.labelColor[0]).toBe('#FF00FF');
		expect(node.labelColor[1]).toBe('#FF00FF');

		const emptyNode = new AnimatedBTreeNode(6, 30, 20, 0, '#FFF', '#000');
		emptyNode.setForegroundColor('#123456');
		expect(emptyNode.foregroundColor).toBe('#123456');
	});

	describe('Bounding box calculations', () => {
		it('computes left, right, top, bottom accurately', () => {
			const node = new AnimatedBTreeNode(1, 40, 30, 3, '#FFF', '#000');
			node.x = 200;
			node.y = 100;

			// width = 120, height = 30
			expect(node.left()).toBe(140);
			expect(node.right()).toBe(260);
			expect(node.top()).toBe(85);
			expect(node.bottom()).toBe(115);
		});
	});

	describe('Pointer attachment calculations', () => {
		it('computes tail pointer attachment for anchor 0, anchor numLabels, and middle anchors', () => {
			const node = new AnimatedBTreeNode(1, 40, 30, 3, '#FFF', '#000');
			node.x = 200;
			node.y = 100;
			// left = 140, right = 260

			// anchor === 0 -> [left() + 5, y] = [145, 100]
			expect(node.getTailPointerAttachPos(0, 0, 0)).toEqual([145, 100]);

			// anchor === 3 (numLabels) -> [right() - 5, y] = [255, 100]
			expect(node.getTailPointerAttachPos(0, 0, 3)).toEqual([255, 100]);

			// anchor === 1 -> [left() + 1 * 40, y] = [180, 100]
			expect(node.getTailPointerAttachPos(0, 0, 1)).toEqual([180, 100]);

			// anchor === 2 -> [left() + 2 * 40, y] = [220, 100]
			expect(node.getTailPointerAttachPos(0, 0, 2)).toEqual([220, 100]);
		});

		it('computes head pointer attachment based on source position', () => {
			const node = new AnimatedBTreeNode(1, 40, 30, 3, '#FFF', '#000');
			node.x = 200;
			node.y = 100;
			// top = 85, bottom = 115, left = 140, right = 260

			// fromY < y - h / 2 (above top)
			expect(node.getHeadPointerAttachPos(200, 50)).toEqual([200, 85]);

			// fromY not < 85, fromX < left (140)
			expect(node.getHeadPointerAttachPos(100, 100)).toEqual([140, 100]);

			// fromY not < 85, fromX >= left (140)
			expect(node.getHeadPointerAttachPos(300, 100)).toEqual([260, 100]);

			// When this.fromY is set on node
			node.fromY = 200;
			expect(node.getHeadPointerAttachPos(200, 100)).toEqual([200, 115]);
		});
	});

	describe('draw() method', () => {
		it('renders highlighted BTree node with labels and fallback for NaN startX', () => {
			const node = new AnimatedBTreeNode(1, 50, 40, 2, '#FFFFFF', '#000000');
			node.x = 100;
			node.y = 100;
			node.labels = ['K1', 'K2'];
			node.highlighted = true;
			node.highlightDiff = 3;

			node.draw(mockContext);

			expect(mockContext.stroke).toHaveBeenCalled();
			expect(mockContext.fill).toHaveBeenCalled();
			expect(mockContext.fillText).toHaveBeenCalledWith('K1', 75, 100);
			expect(mockContext.fillText).toHaveBeenCalledWith('K2', 125, 100);

			// Test startX = 0 fallback when x is NaN
			node.x = NaN;
			node.draw(mockContext);
			expect(mockContext.stroke).toHaveBeenCalled();
		});

		it('renders unhighlighted BTree node without error', () => {
			const node = new AnimatedBTreeNode(2, 40, 30, 1, '#EEEEEE', '#111111');
			node.x = 50;
			node.y = 50;
			node.labels = ['OnlyKey'];

			node.draw(mockContext);

			expect(mockContext.stroke).toHaveBeenCalled();
			expect(mockContext.fillText).toHaveBeenCalledWith('OnlyKey', 50, 50);
		});
	});

	it('creates UndoDeleteBTreeNode and restores state on undoInitialStep', () => {
		const node = new AnimatedBTreeNode(9, 45, 35, 2, '#ABCDEF', '#123456');
		node.x = 150;
		node.y = 80;
		node.labels = ['KeyA', 'KeyB'];
		node.labelColors = ['#111', '#222'];
		node.layer = 2;
		node.highlighted = true;
		node.highlightColor = '#FF0000';

		const undoBlock = node.createUndoDelete();
		undoBlock.undoInitialStep(mockWorld);

		expect(mockWorld.addBTreeNode).toHaveBeenCalledWith(9, 45, 35, 2, '#ABCDEF', '#123456');
		expect(mockWorld.setNodePosition).toHaveBeenCalledWith(9, 150, 80);
		expect(mockWorld.setText).toHaveBeenCalledWith(9, 'KeyA', 0);
		expect(mockWorld.setText).toHaveBeenCalledWith(9, 'KeyB', 1);
		expect(mockWorld.setTextColor).toHaveBeenCalledWith(9, '#111', 0);
		expect(mockWorld.setTextColor).toHaveBeenCalledWith(9, '#222', 1);
		expect(mockWorld.setLayer).toHaveBeenCalledWith(9, 2);
		expect(mockWorld.setHighlight).toHaveBeenCalledWith(9, true, '#FF0000');
	});
});

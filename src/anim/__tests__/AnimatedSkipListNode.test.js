import AnimatedSkipListNode from '../AnimatedSkipListNode';

describe('AnimatedSkipListNode', () => {
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
			addSkipListObject: jest.fn(),
			setHighlight: jest.fn(),
			setLayer: jest.fn(),
			setNodePosition: jest.fn(),
			setTextColor: jest.fn(),
		};
	});

	it('initializes with expected default properties and dimensions', () => {
		const node = new AnimatedSkipListNode(1, '42', 50, 25, '#FFFFFF', '#000000');

		expect(node.objectID).toBe(1);
		expect(node.label).toBe('42');
		expect(node.w).toBe(50);
		expect(node.h).toBe(25);
		expect(node.backgroundColor).toBe('#FFFFFF');
		expect(node.foregroundColor).toBe('#000000');
		expect(node.highlighted).toBe(false);
		expect(node.labelColor).toBe('#000000');
		expect(node.getWidth()).toBe(50);
		expect(node.getHeight()).toBe(25);
	});

	it('updates dimensions, text, and highlight states', () => {
		const node = new AnimatedSkipListNode(2, 'Old', 40, 20, '#FFF', '#000');

		node.setWidth(60);
		node.setHeight(30);
		expect(node.getWidth()).toBe(60);
		expect(node.getHeight()).toBe(30);

		expect(node.getText()).toBe('Old');
		node.setText('New');
		expect(node.getText()).toBe('New');

		node.setTextColor('#00FF00');
		expect(node.getTextColor()).toBe('#00FF00');

		node.setHighlight(true);
		expect(node.highlighted).toBe(true);
		node.setHighlight(true); // unchanged
		expect(node.highlighted).toBe(true);
	});

	describe('Bounding box calculations', () => {
		it('computes left, right, top, bottom accurately', () => {
			const node = new AnimatedSkipListNode(1, 'Node', 60, 40, '#FFF', '#000');
			node.x = 100;
			node.y = 80;

			expect(node.left()).toBe(70);
			expect(node.right()).toBe(130);
			expect(node.top()).toBe(60);
			expect(node.bottom()).toBe(100);
		});
	});

	describe('Pointer attachment calculations', () => {
		it('computes tail pointer attachment for anchors 0, 1, 2, 3, and fallback', () => {
			const node = new AnimatedSkipListNode(1, 'Node', 60, 40, '#FFF', '#000');
			node.x = 100;
			node.y = 80;
			// left = 70, right = 130, top = 60, bottom = 100

			// 0: top
			expect(node.getTailPointerAttachPos(0, 0, 0)).toEqual([100, 60]);
			// 1: bottom
			expect(node.getTailPointerAttachPos(0, 0, 1)).toEqual([100, 100]);
			// 2: left
			expect(node.getTailPointerAttachPos(0, 0, 2)).toEqual([70, 80]);
			// 3: right
			expect(node.getTailPointerAttachPos(0, 0, 3)).toEqual([130, 80]);
			// default: cardinal point towards (100, 0)
			expect(node.getTailPointerAttachPos(100, 0, 99)).toEqual([100, 60]);
		});

		it('delegates head pointer attachment to closest cardinal point', () => {
			const node = new AnimatedSkipListNode(1, 'Node', 60, 40, '#FFF', '#000');
			node.x = 100;
			node.y = 80;

			expect(node.getHeadPointerAttachPos(0, 80)).toEqual([70, 80]);
			expect(node.getHeadPointerAttachPos(200, 80)).toEqual([130, 80]);
		});
	});

	describe('draw() method', () => {
		it('renders highlighted node with regular text', () => {
			const node = new AnimatedSkipListNode(1, '77', 50, 30, '#FFFFFF', '#000000');
			node.x = 100;
			node.y = 100;
			node.highlighted = true;
			node.highlightDiff = 3;

			node.draw(mockContext);

			expect(mockContext.stroke).toHaveBeenCalled();
			expect(mockContext.fill).toHaveBeenCalled();
			expect(mockContext.font).toBe('12px Arial');
			expect(mockContext.fillText).toHaveBeenCalledWith('77', 100, 100);
		});

		it('renders negative infinity (-∞) and positive infinity (∞) with larger sans-serif font', () => {
			const ninfNode = new AnimatedSkipListNode(2, '\u2212\u221E', 50, 30, '#FFF', '#000');
			ninfNode.draw(mockContext);
			expect(mockContext.font).toBe('18px sans-serif');

			const pinfNode = new AnimatedSkipListNode(3, '\u221E', 50, 30, '#FFF', '#000');
			pinfNode.draw(mockContext);
			expect(mockContext.font).toBe('18px sans-serif');
		});
	});

	it('creates UndoDeleteSkipList and restores state on undoInitialStep', () => {
		const node = new AnimatedSkipListNode(8, 'Val8', 55, 25, '#EEE', '#222');
		node.x = 140;
		node.y = 90;
		node.labelColor = '#333';
		node.layer = 1;
		node.highlighted = true;
		node.highlightColor = '#0000FF';

		const undoBlock = node.createUndoDelete();
		undoBlock.undoInitialStep(mockWorld);

		expect(mockWorld.addSkipListObject).toHaveBeenCalledWith(8, 'Val8', 55, 25, '#EEE', '#222');
		expect(mockWorld.setTextColor).toHaveBeenCalledWith(8, '#333');
		expect(mockWorld.setNodePosition).toHaveBeenCalledWith(8, 140, 90);
		expect(mockWorld.setLayer).toHaveBeenCalledWith(8, 1);
		expect(mockWorld.setHighlight).toHaveBeenCalledWith(8, true, '#0000FF');
	});
});

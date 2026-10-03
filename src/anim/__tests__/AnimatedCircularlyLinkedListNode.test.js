import AnimatedCircularlyLinkedListNode from '../AnimatedCircularlyLinkedListNode';

describe('AnimatedCircularlyLinkedListNode', () => {
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
			addCircularlyLinkedListObject: jest.fn(),
			setHighlight: jest.fn(),
			setLayer: jest.fn(),
			setNodePosition: jest.fn(),
			setNull: jest.fn(),
			setTextColor: jest.fn(),
		};
	});

	it('initializes with expected default properties and dimensions', () => {
		const node = new AnimatedCircularlyLinkedListNode(
			1,
			'ValC',
			70,
			35,
			0.2,
			'#FFFFFF',
			'#000000',
		);

		expect(node.objectID).toBe(1);
		expect(node.label).toBe('ValC');
		expect(node.w).toBe(70);
		expect(node.h).toBe(35);
		expect(node.linkPercent).toBe(0.2);
		expect(node.backgroundColor).toBe('#FFFFFF');
		expect(node.foregroundColor).toBe('#000000');
		expect(node.highlighted).toBe(false);
		expect(node.nullPointer).toBe(false);
		expect(node.getNull()).toBe(false);
		expect(node.labelColor).toBe('#000000');
		expect(node.getWidth()).toBe(70);
		expect(node.getHeight()).toBe(35);
	});

	it('updates dimensions, text, and null pointer state correctly', () => {
		const node = new AnimatedCircularlyLinkedListNode(2, 'Old', 60, 30, 0.25, '#FFF', '#000');

		node.setWidth(80);
		node.setHeight(40);
		expect(node.getWidth()).toBe(80);
		expect(node.getHeight()).toBe(40);

		expect(node.getText()).toBe('Old');
		node.setText('New');
		expect(node.getText()).toBe('New');

		node.setTextColor('#00FF00');
		expect(node.getTextColor()).toBe('#00FF00');

		node.setNull(true);
		expect(node.getNull()).toBe(true);
		node.setNull(true); // unchanged
		expect(node.getNull()).toBe(true);

		node.setHighlight(true);
		expect(node.highlighted).toBe(true);
		node.setHighlight(true); // unchanged
		expect(node.highlighted).toBe(true);
	});

	describe('Bounding box and attach position calculations', () => {
		it('computes left, right, top, and bottom accurately', () => {
			const node = new AnimatedCircularlyLinkedListNode(
				1,
				'Val',
				100,
				40,
				0.2,
				'#FFF',
				'#000',
			);
			node.x = 200;
			node.y = 100;

			// left: 200 - (100 * (1 - 0.2)) / 2 = 200 - 40 = 160
			expect(node.left()).toBe(160);
			// right: 200 + (100 * (0.2 + 1)) / 2 = 200 + 60 = 260
			expect(node.right()).toBe(260);
			// top: 100 - 40 / 2 = 80
			expect(node.top()).toBe(80);
			// bottom: 100 + 40 / 2 = 120
			expect(node.bottom()).toBe(120);
		});

		it('calculates tail pointer attachment position', () => {
			const node = new AnimatedCircularlyLinkedListNode(
				1,
				'Val',
				100,
				40,
				0.2,
				'#FFF',
				'#000',
			);
			node.x = 200;
			node.y = 100;

			expect(node.getTailPointerAttachPos()).toEqual([250, 100]);
		});

		it('calculates head pointer attachment positions depending on fromX direction', () => {
			const node = new AnimatedCircularlyLinkedListNode(
				1,
				'Val',
				100,
				40,
				0.2,
				'#FFF',
				'#000',
			);
			node.x = 200;
			node.y = 100;

			// fromX < this.x: uses closest cardinal point
			// from (0, 100) -> left edge cardinal point: [160, 100]
			expect(node.getHeadPointerAttachPos(0, 100)).toEqual([160, 100]);

			// fromX >= this.x: connects to [this.x, this.bottom()] (curved pointer from right)
			expect(node.getHeadPointerAttachPos(300, 100)).toEqual([200, 120]);
		});
	});

	describe('draw() method', () => {
		it('renders highlighted node with null pointer line', () => {
			const node = new AnimatedCircularlyLinkedListNode(
				1,
				'Circ1',
				90,
				45,
				0.25,
				'#EEEEEE',
				'#222222',
			);
			node.x = 150;
			node.y = 90;
			node.highlighted = true;
			node.highlightDiff = 3;
			node.nullPointer = true;

			node.draw(mockContext);

			expect(mockContext.stroke).toHaveBeenCalled();
			expect(mockContext.fill).toHaveBeenCalled();
			expect(mockContext.fillText).toHaveBeenCalledWith('Circ1', 150, 90);
		});

		it('renders unhighlighted node without null pointer', () => {
			const node = new AnimatedCircularlyLinkedListNode(
				2,
				'Circ2',
				70,
				35,
				0.2,
				'#FFF',
				'#000',
			);
			node.x = 100;
			node.y = 60;

			node.draw(mockContext);

			expect(mockContext.stroke).toHaveBeenCalled();
			expect(mockContext.fillText).toHaveBeenCalledWith('Circ2', 100, 60);
		});
	});

	it('creates UndoDeleteCircularlyLinkedList and restores properties on undoInitialStep', () => {
		const node = new AnimatedCircularlyLinkedListNode(
			5,
			'ToRestore',
			85,
			40,
			0.2,
			'#FFF',
			'#000',
		);
		node.x = 110;
		node.y = 70;
		node.layer = 2;
		node.nullPointer = true;
		node.highlighted = true;
		node.highlightColor = '#FF00FF';

		const undoBlock = node.createUndoDelete();
		undoBlock.undoInitialStep(mockWorld);

		expect(mockWorld.addCircularlyLinkedListObject).toHaveBeenCalledWith(
			5,
			'ToRestore',
			85,
			40,
			0.2,
			'#FFF',
			'#000',
		);
		expect(mockWorld.setNodePosition).toHaveBeenCalledWith(5, 110, 70);
		expect(mockWorld.setLayer).toHaveBeenCalledWith(5, 2);
		expect(mockWorld.setNull).toHaveBeenCalledWith(5, true);
		expect(mockWorld.setTextColor).toHaveBeenCalledWith(5, '#000');
		expect(mockWorld.setHighlight).toHaveBeenCalledWith(5, true, '#FF00FF');
	});
});

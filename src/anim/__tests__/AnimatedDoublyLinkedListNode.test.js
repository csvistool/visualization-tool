import AnimatedDoublyLinkedListNode from '../AnimatedDoublyLinkedListNode';

describe('AnimatedDoublyLinkedListNode', () => {
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
			addDoublyLinkedListObject: jest.fn(),
			setHighlight: jest.fn(),
			setLayer: jest.fn(),
			setNextNull: jest.fn(),
			setNodePosition: jest.fn(),
			setPrevNull: jest.fn(),
			setTextColor: jest.fn(),
		};
	});

	it('initializes with expected default properties and dimensions', () => {
		const node = new AnimatedDoublyLinkedListNode(1, 'Val', 80, 40, 0.2, '#FFFFFF', '#000000');

		expect(node.objectID).toBe(1);
		expect(node.label).toBe('Val');
		expect(node.w).toBe(80);
		expect(node.h).toBe(40);
		expect(node.linkPercent).toBe(0.2);
		expect(node.backgroundColor).toBe('#FFFFFF');
		expect(node.foregroundColor).toBe('#000000');
		expect(node.highlighted).toBe(false);
		expect(node.prevNullPointer).toBe(false);
		expect(node.nextNullPointer).toBe(false);
		expect(node.getLeftNull()).toBe(false);
		expect(node.getRightNull()).toBe(false);
		expect(node.labelColor).toBe('#000000');
		expect(node.getWidth()).toBe(80);
		expect(node.getHeight()).toBe(40);
	});

	it('updates dimensions, text, and null pointers correctly', () => {
		const node = new AnimatedDoublyLinkedListNode(2, 'Old', 60, 30, 0.25, '#FFF', '#000');

		node.setWidth(90);
		node.setHeight(45);
		expect(node.getWidth()).toBe(90);
		expect(node.getHeight()).toBe(45);

		expect(node.getText()).toBe('Old');
		node.setText('New');
		expect(node.getText()).toBe('New');

		node.setTextColor('#0000FF');
		expect(node.getTextColor()).toBe('#0000FF');

		node.setPrevNull(true);
		expect(node.getLeftNull()).toBe(true);
		node.setPrevNull(true); // unchanged
		expect(node.getLeftNull()).toBe(true);

		node.setNextNull(true);
		expect(node.getRightNull()).toBe(true);
		node.setNextNull(true); // unchanged
		expect(node.getRightNull()).toBe(true);

		node.setHighlight(true);
		expect(node.highlighted).toBe(true);
		node.setHighlight(true); // unchanged
		expect(node.highlighted).toBe(true);
	});

	describe('Bounding box and coordinate calculations', () => {
		it('computes left, right, top, and bottom accurately', () => {
			const node = new AnimatedDoublyLinkedListNode(1, 'Val', 100, 40, 0.2, '#FFF', '#000');
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

		it('calculates tail pointer attachment positions for anchor 0 and other anchors', () => {
			const node = new AnimatedDoublyLinkedListNode(1, 'Val', 100, 50, 0.2, '#FFF', '#000');
			node.x = 200;
			node.y = 100;

			// anchor === 0: [x + w / 2, y - h * 0.2] = [200 + 50, 100 - 10] = [250, 90]
			expect(node.getTailPointerAttachPos(0, 0, 0)).toEqual([250, 90]);

			// anchor !== 0: [left() + (w * linkPercent) / 2, y + h * 0.2]
			// left = 160. 160 + (100 * 0.2) / 2 = 160 + 10 = 170. y + 10 = 110.
			expect(node.getTailPointerAttachPos(0, 0, 1)).toEqual([170, 110]);
		});

		it('calculates head pointer attachment positions across sides', () => {
			const node = new AnimatedDoublyLinkedListNode(1, 'Val', 100, 50, 0.2, '#FFF', '#000');
			node.x = 200;
			node.y = 100;

			// From left side (closest[1] === y, closest[0] === left()):
			// closest cardinal from (0, 100) -> [160, 100] -> [160, 100 - 10] = [160, 90]
			expect(node.getHeadPointerAttachPos(0, 100)).toEqual([160, 90]);

			// From right side (closest[1] === y, closest[0] === right()):
			// closest cardinal from (400, 100) -> [260, 100] -> [260, 100 + 10] = [260, 110]
			expect(node.getHeadPointerAttachPos(400, 100)).toEqual([260, 110]);

			// From top (closest[1] !== y):
			// closest cardinal from (200, 0) -> [200, 75]
			expect(node.getHeadPointerAttachPos(200, 0)).toEqual([200, 75]);
		});
	});

	describe('draw() method', () => {
		it('renders highlighted doubly linked list node with null markers', () => {
			const node = new AnimatedDoublyLinkedListNode(
				1,
				'DL1',
				100,
				40,
				0.2,
				'#FFFFFF',
				'#000000',
			);
			node.x = 150;
			node.y = 80;
			node.highlighted = true;
			node.highlightDiff = 3;
			node.prevNullPointer = true;
			node.nextNullPointer = true;

			node.draw(mockContext);

			expect(mockContext.stroke).toHaveBeenCalled();
			expect(mockContext.fill).toHaveBeenCalled();
			expect(mockContext.fillText).toHaveBeenCalledWith('DL1', expect.any(Number), 80);
		});

		it('renders unhighlighted doubly linked list node without null markers', () => {
			const node = new AnimatedDoublyLinkedListNode(
				2,
				'DL2',
				80,
				30,
				0.25,
				'#FFFFFF',
				'#000000',
			);
			node.x = 100;
			node.y = 50;

			node.draw(mockContext);

			expect(mockContext.stroke).toHaveBeenCalled();
			expect(mockContext.fillText).toHaveBeenCalledWith('DL2', expect.any(Number), 50);
		});
	});

	it('creates UndoDeleteDoublyLinkedList and restores properties via undoInitialStep', () => {
		const node = new AnimatedDoublyLinkedListNode(7, 'RestoreMe', 90, 45, 0.2, '#FFF', '#000');
		node.x = 130;
		node.y = 75;
		node.layer = 1;
		node.prevNullPointer = true;
		node.nextNullPointer = false;
		node.highlighted = true;
		node.highlightColor = '#00FF00';

		const undoBlock = node.createUndoDelete();
		undoBlock.undoInitialStep(mockWorld);

		expect(mockWorld.addDoublyLinkedListObject).toHaveBeenCalledWith(
			7,
			'RestoreMe',
			90,
			45,
			0.2,
			'#FFF',
			'#000',
		);
		expect(mockWorld.setNodePosition).toHaveBeenCalledWith(7, 130, 75);
		expect(mockWorld.setLayer).toHaveBeenCalledWith(7, 1);
		expect(mockWorld.setPrevNull).toHaveBeenCalledWith(7, true);
		expect(mockWorld.setNextNull).toHaveBeenCalledWith(7, false);
		expect(mockWorld.setTextColor).toHaveBeenCalledWith(7, undefined);
		expect(mockWorld.setHighlight).toHaveBeenCalledWith(7, true, '#00FF00');
	});
});

import AnimatedLinkedListNode from '../AnimatedLinkedListNode';

describe('AnimatedLinkedListNode', () => {
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
			addLinkedListObject: jest.fn(),
			setHighlight: jest.fn(),
			setLayer: jest.fn(),
			setNodePosition: jest.fn(),
			setNull: jest.fn(),
			setTextColor: jest.fn(),
		};
	});

	it('initializes with expected default properties and dimensions', () => {
		const node = new AnimatedLinkedListNode(
			1,
			['NodeA'],
			60,
			30,
			0.25,
			false,
			true,
			'#FFFFFF',
			'#000000',
		);

		expect(node.objectID).toBe(1);
		expect(node.labels).toEqual(['NodeA']);
		expect(node.w).toBe(60);
		expect(node.h).toBe(30);
		expect(node.linkPercent).toBe(0.25);
		expect(node.vertical).toBe(false);
		expect(node.linkPosEnd).toBe(true);
		expect(node.backgroundColor).toBe('#FFFFFF');
		expect(node.foregroundColor).toBe('#000000');
		expect(node.highlighted).toBe(false);
		expect(node.nullPointer).toBe(false);
		expect(node.labelColors).toEqual(['#000000']);
		expect(node.getWidth()).toBe(60);
		expect(node.getHeight()).toBe(30);
	});

	it('allows updating dimensions, labels, and text colors', () => {
		const node = new AnimatedLinkedListNode(
			2,
			['Old1', 'Old2'],
			50,
			25,
			0.2,
			true,
			false,
			'#FFF',
			'#000',
		);

		node.setWidth(70);
		node.setHeight(35);
		expect(node.getWidth()).toBe(70);
		expect(node.getHeight()).toBe(35);

		expect(node.getText(0)).toBe('Old1');
		node.setText('New1', 0);
		expect(node.getText(0)).toBe('New1');

		node.setTextColor('#FF0000', 1);
		expect(node.getTextColor(1)).toBe('#FF0000');

		node.setNull(true);
		expect(node.getNull()).toBe(true);
		node.setNull(true); // unchanged
		expect(node.getNull()).toBe(true);

		node.setHighlight(true);
		expect(node.highlighted).toBe(true);
		node.setHighlight(true); // unchanged
		expect(node.highlighted).toBe(true);
	});

	describe('Bounding box calculations', () => {
		it('computes left, right, top, bottom for horizontal node with link at end', () => {
			const node = new AnimatedLinkedListNode(
				1,
				['Val'],
				100,
				40,
				0.2,
				false, // horizontal
				true, // linkPosEnd
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

		it('computes left, right, top, bottom for horizontal node with link at start', () => {
			const node = new AnimatedLinkedListNode(
				1,
				['Val'],
				100,
				40,
				0.2,
				false, // horizontal
				false, // not linkPosEnd
				'#FFF',
				'#000',
			);
			node.x = 200;
			node.y = 100;

			// left: 200 - (100 * (0.2 + 1)) / 2 = 200 - 60 = 140
			expect(node.left()).toBe(140);
			// right: 200 + (100 * (1 - 0.2)) / 2 = 200 + 40 = 240
			expect(node.right()).toBe(240);
			expect(node.top()).toBe(80);
			expect(node.bottom()).toBe(120);
		});

		it('computes left, right, top, bottom for vertical node with link at end', () => {
			const node = new AnimatedLinkedListNode(
				1,
				['Val'],
				40,
				100,
				0.2,
				true, // vertical
				true, // linkPosEnd
				'#FFF',
				'#000',
			);
			node.x = 100;
			node.y = 200;

			expect(node.left()).toBe(80);
			expect(node.right()).toBe(120);
			// top: 200 - (100 * (1 - 0.2)) / 2 = 200 - 40 = 160
			expect(node.top()).toBe(160);
			// bottom: 200 + (100 * (1 + 0.2)) / 2 = 200 + 60 = 260
			expect(node.bottom()).toBe(260);
		});

		it('computes left, right, top, bottom for vertical node with link at start', () => {
			const node = new AnimatedLinkedListNode(
				1,
				['Val'],
				40,
				100,
				0.2,
				true, // vertical
				false, // not linkPosEnd
				'#FFF',
				'#000',
			);
			node.x = 100;
			node.y = 200;

			expect(node.left()).toBe(80);
			expect(node.right()).toBe(120);
			// top: 200 - (100 * (1 + 0.2)) / 2 = 200 - 60 = 140
			expect(node.top()).toBe(140);
			// bottom: 200 + (100 * (1 - 0.2)) / 2 = 200 + 40 = 240
			expect(node.bottom()).toBe(240);
		});
	});

	describe('Pointer attachment calculations', () => {
		it('returns tail pointer attachment for vertical linkPosEnd and non-linkPosEnd', () => {
			const nodeEnd = new AnimatedLinkedListNode(
				1,
				['A'],
				40,
				80,
				0.2,
				true,
				true,
				'#FFF',
				'#000',
			);
			nodeEnd.x = 50;
			nodeEnd.y = 100;
			expect(nodeEnd.getTailPointerAttachPos(0, 0)).toEqual([50, 140]);

			const nodeStart = new AnimatedLinkedListNode(
				2,
				['B'],
				40,
				80,
				0.2,
				true,
				false,
				'#FFF',
				'#000',
			);
			nodeStart.x = 50;
			nodeStart.y = 100;
			expect(nodeStart.getTailPointerAttachPos(0, 0)).toEqual([50, 60]);
		});

		it('returns tail pointer attachment for horizontal linkPosEnd and non-linkPosEnd', () => {
			const nodeEnd = new AnimatedLinkedListNode(
				1,
				['A'],
				80,
				40,
				0.2,
				false,
				true,
				'#FFF',
				'#000',
			);
			nodeEnd.x = 100;
			nodeEnd.y = 50;
			expect(nodeEnd.getTailPointerAttachPos(0, 0)).toEqual([140, 50]);

			const nodeStart = new AnimatedLinkedListNode(
				2,
				['B'],
				80,
				40,
				0.2,
				false,
				false,
				'#FFF',
				'#000',
			);
			nodeStart.x = 100;
			nodeStart.y = 50;
			expect(nodeStart.getTailPointerAttachPos(0, 0)).toEqual([60, 50]);
		});

		it('delegates getHeadPointerAttachPos to cardinal point', () => {
			const node = new AnimatedLinkedListNode(
				1,
				['A'],
				80,
				40,
				0.2,
				false,
				true,
				'#FFF',
				'#000',
			);
			node.x = 100;
			node.y = 50;
			expect(node.getHeadPointerAttachPos(100, 200)).toEqual([100, 70]);
		});
	});

	describe('draw() method', () => {
		it('draws highlighted horizontal node with multiple labels and null pointer', () => {
			const node = new AnimatedLinkedListNode(
				1,
				['Key', 'Value'],
				100,
				50,
				0.25,
				false,
				true,
				'#EEEEEE',
				'#111111',
			);
			node.x = 150;
			node.y = 100;
			node.highlighted = true;
			node.highlightDiff = 3;
			node.nullPointer = true;

			node.draw(mockContext);

			expect(mockContext.stroke).toHaveBeenCalled();
			expect(mockContext.fill).toHaveBeenCalled();
			expect(mockContext.fillText).toHaveBeenCalledWith('Key', expect.any(Number), 100);
			expect(mockContext.fillText).toHaveBeenCalledWith('Value', expect.any(Number), 100);
		});

		it('draws vertical node with multiple labels and linkPosEnd true with null pointer', () => {
			const node = new AnimatedLinkedListNode(
				2,
				['Top', 'Bottom'],
				50,
				100,
				0.2,
				true,
				true,
				'#EEE',
				'#111',
			);
			node.x = 100;
			node.y = 150;
			node.nullPointer = true;

			node.draw(mockContext);

			expect(mockContext.stroke).toHaveBeenCalled();
			expect(mockContext.fillText).toHaveBeenCalledWith('Top', 100, expect.any(Number));
			expect(mockContext.fillText).toHaveBeenCalledWith('Bottom', 100, expect.any(Number));
		});

		it('draws vertical node with linkPosEnd false and null pointer', () => {
			const node = new AnimatedLinkedListNode(
				3,
				['Single'],
				50,
				100,
				0.2,
				true,
				false,
				'#EEE',
				'#111',
			);
			node.x = 100;
			node.y = 150;
			node.nullPointer = true;

			node.draw(mockContext);

			expect(mockContext.stroke).toHaveBeenCalled();
			expect(mockContext.fillText).toHaveBeenCalledWith('Single', 100, expect.any(Number));
		});

		it('draws horizontal node with linkPosEnd false and null pointer', () => {
			const node = new AnimatedLinkedListNode(
				4,
				['Single'],
				100,
				50,
				0.2,
				false,
				false,
				'#EEE',
				'#111',
			);
			node.x = 150;
			node.y = 100;
			node.nullPointer = true;

			node.draw(mockContext);

			expect(mockContext.stroke).toHaveBeenCalled();
			expect(mockContext.fillText).toHaveBeenCalledWith('Single', expect.any(Number), 100);
		});

		it('draws nodes when nullPointer is false across vertical and horizontal configurations', () => {
			const vEnd = new AnimatedLinkedListNode(
				5,
				['V1'],
				50,
				100,
				0.2,
				true,
				true,
				'#EEE',
				'#111',
			);
			vEnd.nullPointer = false;
			vEnd.draw(mockContext);

			const vStart = new AnimatedLinkedListNode(
				6,
				['V2'],
				50,
				100,
				0.2,
				true,
				false,
				'#EEE',
				'#111',
			);
			vStart.nullPointer = false;
			vStart.draw(mockContext);

			const hEnd = new AnimatedLinkedListNode(
				7,
				['H1'],
				100,
				50,
				0.2,
				false,
				true,
				'#EEE',
				'#111',
			);
			hEnd.nullPointer = false;
			hEnd.draw(mockContext);

			const hStart = new AnimatedLinkedListNode(
				8,
				['H2'],
				100,
				50,
				0.2,
				false,
				false,
				'#EEE',
				'#111',
			);
			hStart.nullPointer = false;
			hStart.draw(mockContext);

			expect(mockContext.stroke).toHaveBeenCalled();
		});
	});

	it('creates UndoDeleteLinkedList and restores state via undoInitialStep', () => {
		const node = new AnimatedLinkedListNode(
			10,
			['L1', 'L2'],
			80,
			40,
			0.3,
			false,
			true,
			'#FFF',
			'#000',
		);
		node.x = 120;
		node.y = 80;
		node.layer = 2;
		node.nullPointer = true;
		node.highlighted = true;
		node.highlightColor = '#00FF00';
		node.setTextColor('#000', 1);

		const undoBlock = node.createUndoDelete();
		undoBlock.undoInitialStep(mockWorld);

		expect(mockWorld.addLinkedListObject).toHaveBeenCalledWith(
			10,
			['L1', 'L2'],
			80,
			40,
			0.3,
			false,
			true,
			'#FFF',
			'#000',
		);
		expect(mockWorld.setNodePosition).toHaveBeenCalledWith(10, 120, 80);
		expect(mockWorld.setLayer).toHaveBeenCalledWith(10, 2);
		expect(mockWorld.setNull).toHaveBeenCalledWith(10, true);
		expect(mockWorld.setTextColor).toHaveBeenCalledWith(10, '#000', 0);
		expect(mockWorld.setTextColor).toHaveBeenCalledWith(10, '#000', 1);
		expect(mockWorld.setHighlight).toHaveBeenCalledWith(10, true, '#00FF00');
	});
});

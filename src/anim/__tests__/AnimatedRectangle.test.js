import AnimatedRectangle from '../AnimatedRectangle';

describe('AnimatedRectangle', () => {
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
			addRectangleObject: jest.fn(),
			setHighlight: jest.fn(),
			setLayer: jest.fn(),
			setNodePosition: jest.fn(),
		};
	});

	it('initializes with constructor parameters and default properties', () => {
		const rect = new AnimatedRectangle(1, 'Node1', 100, 50, 'center', 'center', '#FFF', '#000');

		expect(rect.objectID).toBe(1);
		expect(rect.label).toBe('Node1');
		expect(rect.w).toBe(100);
		expect(rect.h).toBe(50);
		expect(rect.xJustify).toBe('center');
		expect(rect.yJustify).toBe('center');
		expect(rect.backgroundColor).toBe('#FFF');
		expect(rect.foregroundColor).toBe('#000');
		expect(rect.textColor).toBe('#000');
		expect(rect.highlighted).toBe(false);
		expect(rect.thicknessArray).toEqual([false, false, false, false]);
		expect(rect.nullPointer).toBe(false);
	});

	it('sets and gets nullPointer flag', () => {
		const rect = new AnimatedRectangle(1, '', 50, 50, 'center', 'center', '#FFF', '#000');
		rect.setNull(true);
		expect(rect.getNull()).toBe(true);
		rect.setNull(false);
		expect(rect.getNull()).toBe(false);
	});

	it('calculates bounds and centers for center justification', () => {
		const rect = new AnimatedRectangle(1, '', 80, 40, 'center', 'center', '#FFF', '#000');
		rect.x = 100;
		rect.y = 200;

		expect(rect.left()).toBe(60);
		expect(rect.right()).toBe(140);
		expect(rect.centerX()).toBe(100);
		expect(rect.top()).toBe(180);
		expect(rect.bottom()).toBe(220);
		expect(rect.centerY()).toBe(200);
	});

	it('calculates bounds and centers for left/top justification', () => {
		const rect = new AnimatedRectangle(1, '', 80, 40, 'left', 'top', '#FFF', '#000');
		rect.x = 100;
		rect.y = 200;

		expect(rect.left()).toBe(100);
		expect(rect.right()).toBe(180);
		expect(rect.centerX()).toBe(140);
		expect(rect.top()).toBe(200);
		expect(rect.bottom()).toBe(240);
		expect(rect.centerY()).toBe(220);
	});

	it('calculates bounds and centers for right/bottom justification', () => {
		const rect = new AnimatedRectangle(1, '', 80, 40, 'right', 'bottom', '#FFF', '#000');
		rect.x = 100;
		rect.y = 200;

		expect(rect.left()).toBe(20);
		expect(rect.right()).toBe(100);
		expect(rect.centerX()).toBe(60);
		expect(rect.top()).toBe(160);
		expect(rect.bottom()).toBe(200);
		expect(rect.centerY()).toBe(160); // 200 - 80 / 2
	});

	it('returns pointer attach positions for all anchor values', () => {
		const rect = new AnimatedRectangle(1, '', 80, 40, 'center', 'center', '#FFF', '#000');
		rect.x = 100;
		rect.y = 100;

		// Head pointer attaches to closest cardinal point
		expect(rect.getHeadPointerAttachPos(200, 100)).toEqual([140, 100]);

		// Tail pointer anchors
		expect(rect.getTailPointerAttachPos(200, 100, 0)).toEqual([140, 100]); // default
		expect(rect.getTailPointerAttachPos(200, 100, 1)).toEqual([100, 80]); // top
		expect(rect.getTailPointerAttachPos(200, 100, 2)).toEqual([100, 120]); // bottom
		expect(rect.getTailPointerAttachPos(200, 100, 3)).toEqual([60, 100]); // left
		expect(rect.getTailPointerAttachPos(200, 100, 4)).toEqual([140, 100]); // right
		expect(rect.getTailPointerAttachPos(200, 100, 99)).toBeNull(); // invalid anchor
	});

	it('sets and gets width, height, text, textColor, and edge thickness', () => {
		const rect = new AnimatedRectangle(1, 'Old', 50, 50, 'center', 'center', '#FFF', '#000');

		rect.setWidth(75);
		expect(rect.getWidth()).toBe(75);

		rect.setHeight(85);
		expect(rect.getHeight()).toBe(85);

		rect.setText('New');
		expect(rect.label).toBe('New');

		rect.setTextColor('#ABC');
		expect(rect.getTextColor()).toBe('#ABC');

		rect.setHighlight(true);
		expect(rect.highlighted).toBe(true);

		rect.setEdgeThickness([true, false, true, false]);
		expect(rect.getEdgeThickness()).toEqual([true, false, true, false]);
	});

	describe('draw() method', () => {
		it('returns early when addedToScene is false', () => {
			const rect = new AnimatedRectangle(
				1,
				'Hidden',
				50,
				50,
				'center',
				'center',
				'#FFF',
				'#000',
			);
			rect.addedToScene = false;

			rect.draw(mockContext);

			expect(mockContext.beginPath).not.toHaveBeenCalled();
		});

		it('draws highlighted rectangle with startX/startY for left/top justification', () => {
			const rect = new AnimatedRectangle(
				1,
				'Box',
				100,
				60,
				'left',
				'top',
				'#FFFFFF',
				'#000000',
			);
			rect.x = 50;
			rect.y = 50;
			rect.highlighted = true;
			rect.highlightDiff = 5;

			rect.draw(mockContext);

			expect(mockContext.stroke).toHaveBeenCalled();
			expect(mockContext.fill).toHaveBeenCalled();
			expect(mockContext.fillText).toHaveBeenCalledWith('Box', 50, 50);
		});

		it('computes startX/startY for right/bottom justification and draws thick edges', () => {
			const rect = new AnimatedRectangle(
				1,
				'Box2',
				100,
				60,
				'right',
				'bottom',
				'#FFF',
				'#000',
			);
			rect.x = 200;
			rect.y = 200;
			rect.thicknessArray = [true, true, true, true]; // all 4 thick edges

			rect.draw(mockContext);

			// Checks that all 4 borders are drawn
			expect(mockContext.beginPath).toHaveBeenCalled();
			expect(mockContext.stroke).toHaveBeenCalled();
		});

		it('draws null pointer diagonal slash when nullPointer is true', () => {
			const rect = new AnimatedRectangle(
				1,
				'NullBox',
				40,
				40,
				'center',
				'center',
				'#FFF',
				'#000',
			);
			rect.x = 100;
			rect.y = 100;
			rect.nullPointer = true;

			rect.draw(mockContext);

			expect(mockContext.moveTo).toHaveBeenCalledWith(80, 80);
			expect(mockContext.lineTo).toHaveBeenCalledWith(120, 120);
		});

		it('handles unrecognized justification strings without throwing', () => {
			const rect = new AnimatedRectangle(
				1,
				'CustomBox',
				100,
				60,
				'unknown',
				'unknown',
				'#FFF',
				'#000',
			);
			rect.draw(mockContext);
			expect(mockContext.stroke).toHaveBeenCalled();
		});
	});

	it('creates UndoDeleteRectangle and restores properties on undoInitialStep', () => {
		const rect = new AnimatedRectangle(
			5,
			'ToRestore',
			90,
			45,
			'center',
			'center',
			'#123',
			'#456',
		);
		rect.x = 150;
		rect.y = 250;
		rect.layer = 2;
		rect.highlighted = true;
		rect.highlightColor = '#FF0000';

		const undo = rect.createUndoDelete();
		undo.undoInitialStep(mockWorld);

		expect(mockWorld.addRectangleObject).toHaveBeenCalledWith(
			5,
			'ToRestore',
			90,
			45,
			'center',
			'center',
			'#123',
			'#456',
		);
		expect(mockWorld.setNodePosition).toHaveBeenCalledWith(5, 150, 250);
		expect(mockWorld.setLayer).toHaveBeenCalledWith(5, 2);
		expect(mockWorld.setHighlight).toHaveBeenCalledWith(5, true, '#FF0000');
	});
});

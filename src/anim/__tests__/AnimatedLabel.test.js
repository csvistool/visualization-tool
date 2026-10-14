import AnimatedLabel from '../AnimatedLabel';

describe('AnimatedLabel', () => {
	let mockContext;
	let mockWorld;

	let canvasMock;

	beforeEach(() => {
		mockContext = {
			beginPath: jest.fn(),
			closePath: jest.fn(),
			fillText: jest.fn(),
			measureText: jest.fn(str => ({ width: str.length * 8 })),
			strokeText: jest.fn(),
		};

		mockWorld = {
			addLabelObject: jest.fn(),
			setForegroundColor: jest.fn(),
			setHighlight: jest.fn(),
			setLayer: jest.fn(),
			setNodePosition: jest.fn(),
		};

		const mockLoad = jest.fn().mockResolvedValue({});
		global.FontFace = jest.fn(() => ({ load: mockLoad }));
		document.fonts = { add: jest.fn() };

		canvasMock = document.createElement('canvas');
		canvasMock.id = 'canvas';
		canvasMock.getContext = jest.fn(() => mockContext);
		document.body.appendChild(canvasMock);
	});

	afterEach(() => {
		if (canvasMock && canvasMock.parentNode) {
			canvasMock.parentNode.removeChild(canvasMock);
		}
	});

	it('initializes with default and custom constructor values', () => {
		const label = new AnimatedLabel(1, 'Sample', true, 80, false, false);

		expect(label.objectID).toBe(1);
		expect(label.label).toBe('Sample');
		expect(label.centered).toBe(true);
		expect(label.textWidth).toBe(80);
		expect(label.isCode).toBe(false);
		expect(label.isPointer).toBe(false);
		expect(label.highlighted).toBe(false);
		expect(label.highlightIndex).toBe(-1);
		expect(label.getWidth()).toBe(80);
		expect(label.getHeight()).toBe(10);
		expect(AnimatedLabel.prototype.centered.call({ centered: true })).toBe(true);
	});

	it('loads font successfully when isCode is true', async () => {
		const label = new AnimatedLabel(2, 'CodeLine', false, 120, true, false);
		await label.loadFont();

		expect(global.FontFace).toHaveBeenCalledWith(
			'Source Code Pro',
			'url(/SourceCodePro-Regular.ttf)',
			{ display: 'swap' },
		);
		expect(document.fonts.add).toHaveBeenCalled();
		expect(label.fontLoaded).toBe(true);
	});

	it('handles font loading failure gracefully', async () => {
		const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		global.FontFace = jest.fn(() => ({
			load: jest.fn().mockRejectedValue(new Error('Font failed to load')),
		}));

		const label = new AnimatedLabel(3, 'CodeFail', false, 100, true, false);
		await label.loadFont();

		expect(label.fontLoaded).toBe(false);
		expect(consoleSpy).toHaveBeenCalled();
		consoleSpy.mockRestore();
	});

	describe('Bounds and Centers', () => {
		it('computes centers and bounds for centered labels', () => {
			const label = new AnimatedLabel(1, 'Center', true, 60, false, false);
			label.x = 100;
			label.y = 50;

			expect(label.centerX()).toBe(100);
			expect(label.centerY()).toBe(50);
			expect(label.left()).toBe(70);
			expect(label.right()).toBe(130);
			expect(label.top()).toBe(45);
			expect(label.bottom()).toBe(55);
		});

		it('computes centers and bounds for uncentered labels', () => {
			const label = new AnimatedLabel(2, 'Left', false, 60, false, false);
			label.x = 100;
			label.y = 50;

			expect(label.centerX()).toBe(160);
			expect(label.centerY()).toBe(55);
			expect(label.left()).toBe(100);
			expect(label.right()).toBe(160);
			expect(label.top()).toBe(50);
			expect(label.bottom()).toBe(60);
		});
	});

	describe('Alignment calculations', () => {
		const mockTarget = {
			bottom: () => 120,
			centerX: () => 100,
			centerY: () => 100,
			left: () => 80,
			right: () => 120,
			top: () => 80,
		};

		it('computes align positions and updates positions for centered labels', () => {
			const label = new AnimatedLabel(1, 'AlignC', true, 40, false, false);

			expect(label.getAlignLeftPos(mockTarget)).toEqual([60, 100]);
			expect(label.getAlignRightPos(mockTarget)).toEqual([140, 100]);
			expect(label.getAlignTopPos(mockTarget)).toEqual([100, 75]);
			expect(label.getAlignBottomPos(mockTarget)).toEqual([100, 125]);

			label.alignLeft(mockTarget);
			expect(label.x).toBe(60);
			expect(label.y).toBe(100);

			label.alignRight(mockTarget);
			expect(label.x).toBe(140);
			expect(label.y).toBe(100);

			label.alignTop(mockTarget);
			expect(label.x).toBe(100);
			expect(label.y).toBe(75);

			label.alignBottom(mockTarget);
			expect(label.x).toBe(100);
			expect(label.y).toBe(125);
		});

		it('computes align positions and updates positions for uncentered labels', () => {
			const label = new AnimatedLabel(2, 'AlignU', false, 40, false, false);

			expect(label.getAlignLeftPos(mockTarget)).toEqual([40, 95]);
			expect(label.getAlignRightPos(mockTarget)).toEqual([120, 95]);
			expect(label.getAlignTopPos(mockTarget)).toEqual([80, 70]);
			expect(label.getAlignBottomPos(mockTarget)).toEqual([80, 120]);

			label.alignLeft(mockTarget);
			expect(label.x).toBe(40);
			expect(label.y).toBe(95);

			label.alignRight(mockTarget);
			expect(label.x).toBe(120);
			expect(label.y).toBe(95);

			label.alignTop(mockTarget);
			expect(label.x).toBe(80);
			expect(label.y).toBe(70);

			label.alignBottom(mockTarget);
			expect(label.x).toBe(80);
			expect(label.y).toBe(120);
		});
	});

	it('manages highlightIndex constraints and text changes', () => {
		const label = new AnimatedLabel(1, 'SingleLine', true, 50, false, false);
		label.setHighlightIndex(3);
		expect(label.highlightIndex).toBe(3);

		// Exceeds string length -> resets to -1
		label.setHighlightIndex(50);
		expect(label.highlightIndex).toBe(-1);

		// Multi-line labels cannot have highlightIndex
		label.label = 'Line1\nLine2';
		label.setHighlightIndex(1);
		expect(label.highlightIndex).toBe(-1);

		// setText updates label and initialWidth
		label.setText('NewText', 0, 70);
		expect(label.label).toBe('NewText');
		expect(label.textWidth).toBe(70);

		label.setHighlight(true);
		expect(label.highlighted).toBe(true);

		// Attach positions delegate to closest cardinal point
		expect(label.getTailPointerAttachPos(200, label.centerY())).toEqual([
			label.right(),
			label.centerY(),
		]);
		expect(label.getHeadPointerAttachPos(label.centerX(), 200)).toEqual([
			label.centerX(),
			label.bottom(),
		]);
	});

	describe('draw() method', () => {
		it('returns early when addedToScene is false or code font is not loaded', () => {
			const label = new AnimatedLabel(1, 'Hidden', true, 50, false, false);
			label.addedToScene = false;
			label.draw(mockContext);
			expect(mockContext.fillText).not.toHaveBeenCalled();

			const codeLabel = new AnimatedLabel(2, 'Code', true, 50, true, false);
			codeLabel.fontLoaded = false;
			codeLabel.draw(mockContext);
			expect(mockContext.fillText).not.toHaveBeenCalled();
		});

		it('resets highlightIndex if it is greater than or equal to label length', () => {
			const label = new AnimatedLabel(3, 'Hi', true, 30, false, false);
			label.highlightIndex = 5;
			label.draw(mockContext);
			expect(label.highlightIndex).toBe(-1);
		});

		it('applies correct fonts for regular, code, and pointer labels', () => {
			const codeLabel = new AnimatedLabel(1, 'Code', true, 50, true, false);
			codeLabel.fontLoaded = true;
			codeLabel.draw(mockContext);
			expect(mockContext.font).toBe('13px "Source Code Pro", monospace');

			const ptrLabel = new AnimatedLabel(2, 'Ptr', true, 50, false, true);
			ptrLabel.draw(mockContext);
			expect(mockContext.font).toBe('16px Arial');

			const normalLabel = new AnimatedLabel(3, 'Normal', false, 50, false, false);
			normalLabel.draw(mockContext);
			expect(mockContext.font).toBe('12px Arial');
		});

		it('draws single-line label with character highlight and stroke highlight', () => {
			const label = new AnimatedLabel(1, 'ABC', true, 30, false, false);
			label.highlighted = true;
			label.highlightDiff = 4;
			label.setHighlightIndex(1); // 'B'

			label.draw(mockContext);

			expect(mockContext.strokeText).toHaveBeenCalledWith('ABC', label.x, label.y);
			expect(mockContext.fillText).toHaveBeenCalledWith('A', expect.any(Number), label.y);
			expect(mockContext.fillText).toHaveBeenCalledWith('B', expect.any(Number), label.y);
			expect(mockContext.fillText).toHaveBeenCalledWith('C', expect.any(Number), label.y);
		});

		it('draws multi-line text for centered and uncentered labels', () => {
			const multiLabelC = new AnimatedLabel(1, 'Line1\nLine2', true, 40, false, false);
			multiLabelC.draw(mockContext);
			expect(mockContext.fillText).toHaveBeenCalledWith(
				'Line1',
				multiLabelC.x,
				expect.any(Number),
			);
			expect(mockContext.fillText).toHaveBeenCalledWith(
				'Line2',
				multiLabelC.x,
				expect.any(Number),
			);

			const multiLabelU = new AnimatedLabel(2, 'Line1\nLine2', false, 40, false, false);
			multiLabelU.draw(mockContext);
			expect(mockContext.fillText).toHaveBeenCalledWith(
				'Line1',
				multiLabelU.x,
				multiLabelU.y,
			);
		});
	});

	it('creates UndoDeleteLabel and restores state on undoInitialStep', () => {
		const label = new AnimatedLabel(5, 'RestoreMe', true, 60, false, true);
		label.x = 30;
		label.y = 40;
		label.labelColor = '#555';
		label.layer = 1;
		label.highlighted = true;
		label.highlightColor = '#00FF00';

		const undo = label.createUndoDelete();
		undo.undoInitialStep(mockWorld);

		expect(mockWorld.addLabelObject).toHaveBeenCalledWith(5, 'RestoreMe', true, false, true);
		expect(mockWorld.setNodePosition).toHaveBeenCalledWith(5, 30, 40);
		expect(mockWorld.setForegroundColor).toHaveBeenCalledWith(5, '#555');
		expect(mockWorld.setLayer).toHaveBeenCalledWith(5, 1);
		expect(mockWorld.setHighlight).toHaveBeenCalledWith(5, true, '#00FF00');
	});
});

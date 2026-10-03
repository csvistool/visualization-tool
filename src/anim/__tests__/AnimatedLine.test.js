import AnimatedLine from '../AnimatedLine';
import { UndoConnect } from '../AnimatedLine';

describe('AnimatedLine and UndoConnect', () => {
	let mockFromNode;
	let mockToNode;
	let mockContext;
	let mockWorld;

	beforeEach(() => {
		mockFromNode = {
			getTailPointerAttachPos: jest.fn((toX, toY, anchor) => [100, 100]),
			objectID: 1,
			x: 100,
			y: 100,
		};

		mockToNode = {
			getHeadPointerAttachPos: jest.fn((fromX, fromY) => [200, 100]),
			objectID: 2,
			x: 200,
			y: 100,
		};

		mockContext = {
			beginPath: jest.fn(),
			closePath: jest.fn(),
			fill: jest.fn(),
			fillText: jest.fn(),
			lineTo: jest.fn(),
			moveTo: jest.fn(),
			quadraticCurveTo: jest.fn(),
			stroke: jest.fn(),
		};

		mockWorld = {
			connectEdge: jest.fn(),
			disconnect: jest.fn(),
			setEdgeHighlight: jest.fn(),
		};
	});

	it('initializes with given constructor properties', () => {
		const line = new AnimatedLine(
			mockFromNode,
			mockToNode,
			'#0000FF',
			0.2,
			true,
			'weight: 5',
			0,
			3,
		);

		expect(line.fromID).toBe(mockFromNode);
		expect(line.toID).toBe(mockToNode);
		expect(line.foregroundColor).toBe('#0000FF');
		expect(line.curve).toBe(0.2);
		expect(line.directed).toBe(true);
		expect(line.edgeLabel).toBe('weight: 5');
		expect(line.anchorPoint).toBe(0);
		expect(line.thickness).toBe(3);
		expect(line.highlighted).toBe(false);
		expect(line.dirty).toBe(false);
		expect(line.alpha).toBe(1.0);
	});

	it('sets and gets color, thickness, and highlight', () => {
		const line = new AnimatedLine(mockFromNode, mockToNode, '#000', 0, false, '', 0, 1);

		expect(line.color()).toBe('#000');
		line.setColor('#FFF');
		expect(line.color()).toBe('#FFF');
		expect(line.dirty).toBe(true);

		line.setThickness(4);
		expect(line.thickness).toBe(4);

		line.setHighlight(true, '#00FF00');
		expect(line.highlighted).toBe(true);
		expect(line.highlightColor).toBe('#00FF00');

		// Defaults to red when color omitted
		line.setHighlight(true);
		expect(line.highlightColor).toBe('#FF0000');
	});

	it('pulses highlight when highlighted is true and is no-op when false', () => {
		const line = new AnimatedLine(mockFromNode, mockToNode, '#000', 0, false, '', 0, 2);

		line.setHighlight(true);
		line.pulseHighlight(28);
		expect(line.highlightDiff).toBeGreaterThanOrEqual(5); // thickness 2 + LINE_MIN_HEIGHT_DIFF 3
		expect(line.dirty).toBe(true);

		line.setHighlight(false);
		line.dirty = false;
		line.pulseHighlight(28);
		expect(line.dirty).toBe(false);
	});

	it('checks if line connects to a specific node', () => {
		const line = new AnimatedLine(mockFromNode, mockToNode, '#000', 0, false, '', 0, 1);
		const otherNode = { objectID: 3 };

		expect(line.hasNode(mockFromNode)).toBe(true);
		expect(line.hasNode(mockToNode)).toBe(true);
		expect(line.hasNode(otherNode)).toBe(false);
	});

	it('calculates sign correctly', () => {
		const line = new AnimatedLine(mockFromNode, mockToNode, '#000', 0, false, '', 0, 1);
		expect(line.sign(5)).toBe(1);
		expect(line.sign(0)).toBe(-1);
		expect(line.sign(-3)).toBe(-1);
	});

	describe('draw() and drawArrow()', () => {
		it('draws directed curved line with arrowhead and edge label', () => {
			const line = new AnimatedLine(
				mockFromNode,
				mockToNode,
				'#FF0000',
				0.3,
				true,
				'dist',
				0,
				2,
			);
			line.draw(mockContext);

			expect(mockContext.beginPath).toHaveBeenCalled();
			expect(mockContext.moveTo).toHaveBeenCalledWith(100, 100);
			expect(mockContext.quadraticCurveTo).toHaveBeenCalled();
			expect(mockContext.stroke).toHaveBeenCalled();
			expect(mockContext.fillText).toHaveBeenCalledWith(
				'dist',
				expect.any(Number),
				expect.any(Number),
			);
			expect(mockContext.fill).toHaveBeenCalled(); // arrowhead fill
		});

		it('draws highlighted line invoking drawArrow with highlightDiff and thickness', () => {
			const line = new AnimatedLine(mockFromNode, mockToNode, '#000', 0, false, '', 0, 2);
			line.highlighted = true;
			line.highlightDiff = 6;
			line.highlightColor = '#00FF00';

			const drawArrowSpy = jest.spyOn(line, 'drawArrow');
			line.draw(mockContext);

			expect(drawArrowSpy).toHaveBeenCalledTimes(2);
			expect(drawArrowSpy).toHaveBeenNthCalledWith(1, 6, '#00FF00', mockContext);
			expect(drawArrowSpy).toHaveBeenNthCalledWith(2, 2, '#000', mockContext);
		});

		it('handles zero-length vector gracefully when fromPos and toPos are identical', () => {
			mockToNode.getHeadPointerAttachPos.mockReturnValue([100, 100]);
			const line = new AnimatedLine(mockFromNode, mockToNode, '#000', 0, true, 'zero', 0, 1);

			expect(() => line.draw(mockContext)).not.toThrow();
			expect(mockContext.fillText).toHaveBeenCalledWith('zero', 100, 100);
		});
	});

	describe('UndoConnect', () => {
		it('creates UndoConnect via createUndoConnect', () => {
			const line = new AnimatedLine(mockFromNode, mockToNode, '#00F', 0.1, true, 'w', 1, 2);
			line.highlighted = true;

			const undo = line.createUndoConnect();
			expect(undo).toBeInstanceOf(UndoConnect);
			expect(undo.fromID).toBe(1);
			expect(undo.toID).toBe(2);
			expect(undo.createConnection).toBe(true);
			expect(undo.addUndoAnimation()).toBe(false);
		});

		it('connects edge when createConnection is true', () => {
			const undo = new UndoConnect(1, 2, true, '#00F', 0.1, true, 'w', 1, 2, true);
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.connectEdge).toHaveBeenCalledWith(1, 2, '#00F', 0.1, true, 'w', 1, 2);
			expect(mockWorld.setEdgeHighlight).toHaveBeenCalledWith(1, 2, true);
		});

		it('disconnects edge when createConnection is false', () => {
			const undo = new UndoConnect(1, 2, false, '#00F', 0.1, true, 'w', 1, 2, false);
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.disconnect).toHaveBeenCalledWith(1, 2);
		});
	});
});

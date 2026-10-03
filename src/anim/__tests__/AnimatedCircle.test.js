import AnimatedCircle from '../AnimatedCircle';
import AnimatedHighlightCircle from '../AnimatedHighlightCircle';

describe('AnimatedCircle and AnimatedHighlightCircle', () => {
	let mockContext;
	let mockWorld;

	beforeEach(() => {
		mockContext = {
			arc: jest.fn(),
			beginPath: jest.fn(),
			closePath: jest.fn(),
			fill: jest.fn(),
			fillText: jest.fn(),
			measureText: jest.fn(str => ({ width: str.length * 8 })),
			stroke: jest.fn(),
		};

		mockWorld = {
			addCircleObject: jest.fn(),
			addHighlightCircleObject: jest.fn(),
			setAlpha: jest.fn(),
			setBackgroundColor: jest.fn(),
			setForegroundColor: jest.fn(),
			setHighlight: jest.fn(),
			setLayer: jest.fn(),
			setNodePosition: jest.fn(),
			setWidth: jest.fn(),
		};
	});

	describe('AnimatedCircle', () => {
		let circle;

		beforeEach(() => {
			circle = new AnimatedCircle(1, 'TestNode');
			circle.x = 100;
			circle.y = 100;
		});

		it('initializes with default radius and properties', () => {
			expect(circle.objectID).toBe(1);
			expect(circle.label).toBe('TestNode');
			expect(circle.radius).toBe(20);
			expect(circle.thickness).toBe(3);
			expect(circle.highlightIndex).toBe(-1);
			expect(circle.getWidth()).toBe(40);
		});

		it('updates radius through setWidth', () => {
			circle.setWidth(60);
			expect(circle.radius).toBe(30);
			expect(circle.getWidth()).toBe(60);
		});

		it('updates highlight index and marks it dirty', () => {
			circle.setHighlightIndex(2);
			expect(circle.highlightIndex).toBe(2);
			expect(circle.highlightIndexDirty).toBe(true);
		});

		it('computes head pointer attach position on the circle perimeter', () => {
			// Point directly to the right
			const [xRight, yRight] = circle.getHeadPointerAttachPos(200, 100);
			expect(xRight).toBeCloseTo(120);
			expect(yRight).toBeCloseTo(100);

			// Point directly above
			const [xTop, yTop] = circle.getHeadPointerAttachPos(100, 50);
			expect(xTop).toBeCloseTo(100);
			expect(yTop).toBeCloseTo(80);

			// From exact center (len === 0)
			const [xCenter, yCenter] = circle.getHeadPointerAttachPos(100, 100);
			expect(xCenter).toBe(100);
			expect(yCenter).toBe(100);
		});

		it('delegates tail pointer attach position to head pointer attach position', () => {
			const pos = circle.getTailPointerAttachPos(150, 100);
			expect(pos).toEqual(circle.getHeadPointerAttachPos(150, 100));
		});

		it('draws unhighlighted circle with single-line label', () => {
			circle.draw(mockContext);

			expect(mockContext.beginPath).toHaveBeenCalled();
			expect(mockContext.arc).toHaveBeenCalledWith(100, 100, 20, 0, Math.PI * 2, true);
			expect(mockContext.fill).toHaveBeenCalled();
			expect(mockContext.stroke).toHaveBeenCalled();
			expect(mockContext.fillText).toHaveBeenCalledWith('TestNode', 100, 100);
		});

		it('draws highlighted circle with highlight outer ring', () => {
			circle.highlighted = true;
			circle.highlightColor = '#00FF00';
			circle.highlightDiff = 6;

			circle.draw(mockContext);

			// First arc is the highlight ring
			expect(mockContext.arc).toHaveBeenCalledWith(100, 100, 26, 0, Math.PI * 2, true);
			// Second arc is the circle body
			expect(mockContext.arc).toHaveBeenCalledWith(100, 100, 20, 0, Math.PI * 2, true);
		});

		it('draws single-line label with character-level highlight', () => {
			circle.label = 'ABCDE';
			circle.setHighlightIndex(2); // highlight 'C'

			circle.draw(mockContext);

			expect(mockContext.measureText).toHaveBeenCalled();
			expect(circle.highlightIndexDirty).toBe(false);
			// Left, highlighted char, and right strings
			expect(mockContext.fillText).toHaveBeenCalledWith('AB', expect.any(Number), 100);
			expect(mockContext.fillText).toHaveBeenCalledWith('C', expect.any(Number), 100);
			expect(mockContext.fillText).toHaveBeenCalledWith('DE', expect.any(Number), 100);
		});

		it('draws multi-line label with even number of lines', () => {
			circle.label = 'Line1\nLine2';

			circle.draw(mockContext);

			expect(mockContext.fillText).toHaveBeenCalledWith('Line1', 100, 100 - 0.5 * 12);
			expect(mockContext.fillText).toHaveBeenCalledWith('Line2', 100, 100 + 0.5 * 12);
		});

		it('draws multi-line label with odd number of lines', () => {
			circle.label = 'Top\nMiddle\nBottom';

			circle.draw(mockContext);

			expect(mockContext.fillText).toHaveBeenCalledWith('Middle', 100, 100);
			expect(mockContext.fillText).toHaveBeenCalledWith('Top', 100, 100 - 12);
			expect(mockContext.fillText).toHaveBeenCalledWith('Bottom', 100, 100 + 12);
		});

		it('creates UndoDeleteCircle and restores properties on undoInitialStep', () => {
			circle.x = 75;
			circle.y = 85;
			circle.radius = 25;
			circle.foregroundColor = '#111';
			circle.backgroundColor = '#EEE';
			circle.layer = 2;
			circle.highlighted = true;
			circle.highlightColor = '#FF0000';

			const undo = circle.createUndoDelete();
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.addCircleObject).toHaveBeenCalledWith(1, 'TestNode');
			expect(mockWorld.setWidth).toHaveBeenCalledWith(1, 50);
			expect(mockWorld.setNodePosition).toHaveBeenCalledWith(1, 75, 85);
			expect(mockWorld.setForegroundColor).toHaveBeenCalledWith(1, '#111');
			expect(mockWorld.setBackgroundColor).toHaveBeenCalledWith(1, '#EEE');
			expect(mockWorld.setLayer).toHaveBeenCalledWith(1, 2);
			expect(mockWorld.setHighlight).toHaveBeenCalledWith(1, true, '#FF0000');
		});
	});

	describe('AnimatedHighlightCircle', () => {
		let highlightCircle;

		beforeEach(() => {
			highlightCircle = new AnimatedHighlightCircle(2, '#FF5500', 35);
			highlightCircle.x = 150;
			highlightCircle.y = 250;
		});

		it('initializes with given foregroundColor and radius', () => {
			expect(highlightCircle.objectID).toBe(2);
			expect(highlightCircle.foregroundColor).toBe('#FF5500');
			expect(highlightCircle.radius).toBe(35);
			expect(highlightCircle.thickness).toBe(4);
		});

		it('draws highlight stroke on canvas context', () => {
			highlightCircle.alpha = 0.8;
			highlightCircle.draw(mockContext);

			expect(mockContext.globalAlpha).toBe(0.8);
			expect(mockContext.strokeStyle).toBe('#FF5500');
			expect(mockContext.lineWidth).toBe(4);
			expect(mockContext.arc).toHaveBeenCalledWith(150, 250, 35, 0, Math.PI * 2, true);
			expect(mockContext.stroke).toHaveBeenCalled();
		});

		it('creates UndoDeleteHighlightCircle and restores properties on undoInitialStep', () => {
			highlightCircle.layer = 3;
			highlightCircle.alpha = 0.5;
			highlightCircle.highlighted = true;
			highlightCircle.highlightColor = '#00FFFF';

			const undo = highlightCircle.createUndoDelete();
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.addHighlightCircleObject).toHaveBeenCalledWith(2, '#FF5500', 35);
			expect(mockWorld.setNodePosition).toHaveBeenCalledWith(2, 150, 250);
			expect(mockWorld.setLayer).toHaveBeenCalledWith(2, 3);
			expect(mockWorld.setAlpha).toHaveBeenCalledWith(2, 0.5);
			expect(mockWorld.setHighlight).toHaveBeenCalledWith(2, true, '#00FFFF');
		});
	});
});

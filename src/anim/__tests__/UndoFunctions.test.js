import {
	UndoBlock,
	UndoCodeHighlight,
	UndoCodeUnhighlight,
	UndoCreate,
	UndoHighlight,
	UndoHighlightEdge,
	UndoMove,
	UndoSetAlpha,
	UndoSetAlwaysOnTop,
	UndoSetBackgroundColor,
	UndoSetEdgeAlpha,
	UndoSetEdgeColor,
	UndoSetEdgeThickness,
	UndoSetForegroundColor,
	UndoSetHeight,
	UndoSetHighlightIndex,
	UndoSetNextNull,
	UndoSetNull,
	UndoSetNumElements,
	UndoSetPosition,
	UndoSetPrevNull,
	UndoSetRectangleEdgeThickness,
	UndoSetText,
	UndoSetTextColor,
	UndoSetWidth,
} from '../UndoFunctions';
import SingleAnimation from '../SingleAnimation';

describe('SingleAnimation and UndoFunctions', () => {
	let mockWorld;

	beforeEach(() => {
		mockWorld = {
			removeObject: jest.fn(),
			setAlwaysOnTop: jest.fn(),
			setAlpha: jest.fn(),
			setBackgroundColor: jest.fn(),
			setEdgeAlpha: jest.fn(),
			setEdgeColor: jest.fn(),
			setEdgeHighlight: jest.fn(),
			setEdgeThickness: jest.fn(),
			setForegroundColor: jest.fn(),
			setHeight: jest.fn(),
			setHighlight: jest.fn(),
			setHighlightIndex: jest.fn(),
			setNextNull: jest.fn(),
			setNodePosition: jest.fn(),
			setNull: jest.fn(),
			setNumElements: jest.fn(),
			setPrevNull: jest.fn(),
			setRectangleEdgeThickness: jest.fn(),
			setText: jest.fn(),
			setTextColor: jest.fn(),
			setWidth: jest.fn(),
		};
	});

	describe('SingleAnimation', () => {
		it('constructs with given id and coordinates', () => {
			const anim = new SingleAnimation(10, 20, 30, 40, 50);
			expect(anim.objectID).toBe(10);
			expect(anim.fromX).toBe(20);
			expect(anim.fromY).toBe(30);
			expect(anim.toX).toBe(40);
			expect(anim.toY).toBe(50);
		});
	});

	describe('UndoBlock Base Class', () => {
		it('default addUndoAnimation returns false', () => {
			const block = new UndoBlock();
			expect(block.addUndoAnimation([])).toBe(false);
		});

		it('default undoInitialStep executes without error', () => {
			const block = new UndoBlock();
			expect(() => block.undoInitialStep(mockWorld)).not.toThrow();
		});
	});

	describe('UndoMove', () => {
		it('stores coordinates and appends SingleAnimation to list', () => {
			const undoMove = new UndoMove(1, 100, 200, 300, 400);
			const animList = [];

			const result = undoMove.addUndoAnimation(animList);

			expect(result).toBe(true);
			expect(animList).toHaveLength(1);
			expect(animList[0]).toBeInstanceOf(SingleAnimation);
			expect(animList[0].objectID).toBe(1);
			expect(animList[0].fromX).toBe(100);
			expect(animList[0].fromY).toBe(200);
			expect(animList[0].toX).toBe(300);
			expect(animList[0].toY).toBe(400);
		});
	});

	describe('UndoCreate', () => {
		it('calls world.removeObject on undoInitialStep', () => {
			const undoCreate = new UndoCreate(42);
			undoCreate.undoInitialStep(mockWorld);

			expect(mockWorld.removeObject).toHaveBeenCalledWith(42);
		});
	});

	describe('UndoCodeUnhighlight and UndoCodeHighlight', () => {
		it('UndoCodeUnhighlight invokes highlightCodeLine callback', () => {
			const mockHighlight = jest.fn();
			const undo = new UndoCodeUnhighlight(mockHighlight, 'addAtIndex', 3);

			undo.undoInitialStep();

			expect(mockHighlight).toHaveBeenCalledWith('addAtIndex', 3);
		});

		it('UndoCodeHighlight invokes unhighlightCodeLine callback', () => {
			const mockUnhighlight = jest.fn();
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
			const undo = new UndoCodeHighlight(mockUnhighlight, 'remove', 5);

			undo.undoInitialStep();

			expect(mockUnhighlight).toHaveBeenCalledWith('remove', 5);
			consoleSpy.mockRestore();
		});
	});

	describe('UndoHighlight', () => {
		it('calls world.setHighlight on undoInitialStep', () => {
			const undo = new UndoHighlight(7, true, '#FF0000');
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setHighlight).toHaveBeenCalledWith(7, true, '#FF0000');
		});
	});

	describe('UndoSetHeight and UndoSetWidth', () => {
		it('UndoSetHeight calls world.setHeight', () => {
			const undo = new UndoSetHeight(3, 120);
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setHeight).toHaveBeenCalledWith(3, 120);
		});

		it('UndoSetWidth calls world.setWidth', () => {
			const undo = new UndoSetWidth(4, 250);
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setWidth).toHaveBeenCalledWith(4, 250);
		});
	});

	describe('UndoSetNumElements', () => {
		it('captures trimmed elements and restores their labels and colors when size decreases', () => {
			const mockObj = {
				objectID: 99,
				getNumElements: () => 4,
				getText: idx => `label-${idx}`,
				getTextColor: idx => (idx % 2 === 0 ? '#111' : '#222'),
			};

			const undo = new UndoSetNumElements(mockObj, 2);
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setNumElements).toHaveBeenCalledWith(99, 4);
			expect(mockWorld.setText).toHaveBeenCalledWith(99, 'label-2', 2);
			expect(mockWorld.setTextColor).toHaveBeenCalledWith(99, '#111', 2);
			expect(mockWorld.setText).toHaveBeenCalledWith(99, 'label-3', 3);
			expect(mockWorld.setTextColor).toHaveBeenCalledWith(99, '#222', 3);
		});

		it('does not capture trimmed elements when size increases or stays the same', () => {
			const mockObj = {
				objectID: 99,
				getNumElements: () => 2,
				getText: jest.fn(),
				getTextColor: jest.fn(),
			};

			const undo = new UndoSetNumElements(mockObj, 5);
			undo.undoInitialStep(mockWorld);

			expect(mockObj.getText).not.toHaveBeenCalled();
			expect(mockWorld.setNumElements).toHaveBeenCalledWith(99, 2);
			expect(mockWorld.setText).not.toHaveBeenCalled();
		});
	});

	describe('UndoSetAlpha, UndoSetNull, UndoSetPrevNull, UndoSetNextNull', () => {
		it('UndoSetAlpha calls world.setAlpha', () => {
			const undo = new UndoSetAlpha(10, 0.75);
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setAlpha).toHaveBeenCalledWith(10, 0.75);
		});

		it('UndoSetNull calls world.setNull', () => {
			const undo = new UndoSetNull(11, true);
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setNull).toHaveBeenCalledWith(11, true);
		});

		it('UndoSetPrevNull calls world.setPrevNull', () => {
			const undo = new UndoSetPrevNull(12, false);
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setPrevNull).toHaveBeenCalledWith(12, false);
		});

		it('UndoSetNextNull calls world.setNextNull', () => {
			const undo = new UndoSetNextNull(13, true);
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setNextNull).toHaveBeenCalledWith(13, true);
		});
	});

	describe('Colors and Labels', () => {
		it('UndoSetForegroundColor calls world.setForegroundColor', () => {
			const undo = new UndoSetForegroundColor(1, '#AABBCC');
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setForegroundColor).toHaveBeenCalledWith(1, '#AABBCC');
		});

		it('UndoSetBackgroundColor calls world.setBackgroundColor', () => {
			const undo = new UndoSetBackgroundColor(2, '#DDEEFF');
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setBackgroundColor).toHaveBeenCalledWith(2, '#DDEEFF');
		});

		it('UndoSetHighlightIndex calls world.setHighlightIndex', () => {
			const undo = new UndoSetHighlightIndex(3, 2);
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setHighlightIndex).toHaveBeenCalledWith(3, 2);
		});

		it('UndoSetText calls world.setText', () => {
			const undo = new UndoSetText(4, 'Node A', 0);
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setText).toHaveBeenCalledWith(4, 'Node A', 0);
		});

		it('UndoSetTextColor calls world.setTextColor', () => {
			const undo = new UndoSetTextColor(5, '#333333', 1);
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setTextColor).toHaveBeenCalledWith(5, '#333333', 1);
		});
	});

	describe('Edges, Position, Layering, and Dimensions', () => {
		it('UndoHighlightEdge calls world.setEdgeHighlight', () => {
			const undo = new UndoHighlightEdge(10, 20, true);
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setEdgeHighlight).toHaveBeenCalledWith(10, 20, true);
		});

		it('UndoSetEdgeThickness calls world.setEdgeThickness', () => {
			const undo = new UndoSetEdgeThickness(10, 20, 4);
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setEdgeThickness).toHaveBeenCalledWith(10, 20, 4);
		});

		it('UndoSetEdgeColor calls world.setEdgeColor', () => {
			const undo = new UndoSetEdgeColor(10, 20, '#00FF00');
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setEdgeColor).toHaveBeenCalledWith(10, 20, '#00FF00');
		});

		it('UndoSetEdgeAlpha calls world.setEdgeAlpha', () => {
			const undo = new UndoSetEdgeAlpha(10, 20, 0.5);
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setEdgeAlpha).toHaveBeenCalledWith(10, 20, 0.5);
		});

		it('UndoSetPosition calls world.setNodePosition', () => {
			const undo = new UndoSetPosition(15, 350, 450);
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setNodePosition).toHaveBeenCalledWith(15, 350, 450);
		});

		it('UndoSetAlwaysOnTop calls world.setAlwaysOnTop', () => {
			const undo = new UndoSetAlwaysOnTop(16, true);
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setAlwaysOnTop).toHaveBeenCalledWith(16, true);
		});

		it('UndoSetRectangleEdgeThickness calls world.setRectangleEdgeThickness', () => {
			const undo = new UndoSetRectangleEdgeThickness(17, [1, 2, 3, 4]);
			undo.undoInitialStep(mockWorld);

			expect(mockWorld.setRectangleEdgeThickness).toHaveBeenCalledWith(17, [1, 2, 3, 4]);
		});
	});
});

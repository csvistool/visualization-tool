import AnimatedObject from '../AnimatedObject';

class TestObject extends AnimatedObject {
	constructor(x = 100, y = 100, width = 50, height = 50) {
		super();
		this.x = x;
		this.y = y;
		this.w = width;
		this.h = height;
	}

	left() {
		return this.x - this.w / 2;
	}

	right() {
		return this.x + this.w / 2;
	}

	top() {
		return this.y - this.h / 2;
	}

	bottom() {
		return this.y + this.h / 2;
	}

	getWidth() {
		return this.w;
	}

	getHeight() {
		return this.h;
	}
}

describe('AnimatedObject Base Class', () => {
	let obj;

	beforeEach(() => {
		obj = new AnimatedObject();
	});

	it('initializes with default values', () => {
		expect(obj.objectID).toBe(-1);
		expect(obj.x).toBe(0);
		expect(obj.y).toBe(0);
		expect(obj.backgroundColor).toBe('#FFFFFF');
		expect(obj.foregroundColor).toBe('#000000');
		expect(obj.highlighted).toBe(false);
		expect(obj.label).toBe('');
		expect(obj.labelColor).toBe('#000000');
		expect(obj.layer).toBe(0);
		expect(obj.alpha).toBe(1.0);
		expect(obj.addedToScene).toBe(true);
		expect(obj.highlightIndex).toBe(-1);
		expect(obj.highlightIndexDirty).toBe(true);
		expect(obj.identifier()).toBe(-1);
		expect(obj.centered()).toBe(false);
		expect(obj.getWidth()).toBe(0);
		expect(obj.getHeight()).toBe(0);
		expect(obj.centerX()).toBe(0);
		expect(obj.centerY()).toBe(0);
		expect(obj.getNull()).toBe(false);
	});

	it('sets and gets background, foreground, and label colors', () => {
		obj.setBackgroundColor('#123456');
		expect(obj.backgroundColor).toBe('#123456');

		obj.setForegroundColor('#654321');
		expect(obj.foregroundColor).toBe('#654321');
		expect(obj.labelColor).toBe('#654321');

		obj.setTextColor('#ABCDEF');
		expect(obj.getTextColor()).toBe('#ABCDEF');
	});

	it('sets and gets text and labels', () => {
		obj.setText('Custom Label');
		expect(obj.getText()).toBe('Custom Label');
	});

	it('sets and gets alpha opacity', () => {
		obj.setAlpha(0.65);
		expect(obj.getAlpha()).toBe(0.65);
	});

	it('sets and gets highlight state and highlight color', () => {
		obj.setHighlight(true, '#00FF00');
		expect(obj.getHighlight()).toBe(true);
		expect(obj.highlightColor).toBe('#00FF00');

		// Defaults to red when color omitted
		obj.setHighlight(true);
		expect(obj.highlightColor).toBe('#ff0000');
	});

	it('sets and gets highlight index', () => {
		obj.setHighlightIndex(3);
		expect(obj.getHighlightIndex()).toBe(3);
		expect(obj.highlightIndexDirty).toBe(true);
	});

	it('throws error when setWidth is called on base AnimatedObject', () => {
		expect(() => obj.setWidth(50)).toThrow('setWidth() should be implemented in a base class');
	});

	it('returns coordinates for pointer attachment positions', () => {
		obj.x = 25;
		obj.y = 75;
		expect(obj.getTailPointerAttachPos()).toEqual([25, 75]);
		expect(obj.getHeadPointerAttachPos()).toEqual([25, 75]);
	});

	it('does not throw when calling setNull', () => {
		expect(() => obj.setNull()).not.toThrow();
	});

	it('pulses highlight when highlighted is true', () => {
		obj.setHighlight(true);
		obj.pulseHighlight(14);
		expect(obj.highlightDiff).toBeGreaterThanOrEqual(obj.minHeightDiff);

		// When highlighted is false, pulseHighlight is a no-op
		obj.setHighlight(false);
		delete obj.highlightDiff;
		obj.pulseHighlight(14);
		expect(obj.highlightDiff).toBeUndefined();
	});

	describe('Alignment calculations', () => {
		it('computes alignment positions relative to another object', () => {
			const target = new TestObject(100, 100, 40, 60);
			const moving = new TestObject(0, 0, 20, 20);

			expect(moving.getAlignLeftPos(target)).toEqual([120 + 10, 100]);
			expect(moving.getAlignRightPos(target)).toEqual([80 - 10, 100]);
			expect(moving.getAlignTopPos(target)).toEqual([100, 70 - 10]);
			expect(moving.getAlignBottomPos(target)).toEqual([100, 130 + 10]);
		});

		it('aligns position relative to another object', () => {
			const target = new TestObject(200, 200, 80, 80);
			const moving = new TestObject(0, 0, 40, 40);

			moving.alignLeft(target);
			expect(moving.x).toBe(240 + 20);
			expect(moving.y).toBe(200);

			moving.alignRight(target);
			expect(moving.x).toBe(160 - 20);
			expect(moving.y).toBe(200);

			moving.alignTop(target);
			expect(moving.x).toBe(200);
			expect(moving.y).toBe(160 - 20);

			moving.alignBottom(target);
			expect(moving.x).toBe(200);
			expect(moving.y).toBe(240 + 20);
		});
	});

	describe('Cardinal point calculations (getClosestCardinalPoint)', () => {
		it('calculates closest point when point is to the left with xDelta dominant', () => {
			const box = new TestObject(100, 100, 40, 40); // left=80, right=120, top=80, bottom=120
			// fromX=20, fromY=95 -> xDelta=60, yDelta=0 -> xDelta > yDelta => yPos = centerY
			const [x, y] = box.getClosestCardinalPoint(20, 95);
			expect(x).toBe(80);
			expect(y).toBe(100);
		});

		it('calculates closest point when point is to the right with yDelta dominant', () => {
			const box = new TestObject(100, 100, 40, 40);
			// fromX=130, fromY=200 -> xDelta=10, yDelta=80 -> yDelta > xDelta => xPos = centerX
			const [x, y] = box.getClosestCardinalPoint(130, 200);
			expect(x).toBe(100);
			expect(y).toBe(120);
		});

		it('calculates closest point when point is above with yDelta dominant', () => {
			const box = new TestObject(100, 100, 40, 40);
			// fromX=95, fromY=20 -> xDelta=0, yDelta=60 -> yDelta > xDelta => xPos = centerX
			const [x, y] = box.getClosestCardinalPoint(95, 20);
			expect(x).toBe(100);
			expect(y).toBe(80);
		});

		it('calculates closest point when point is inside box boundaries', () => {
			const box = new TestObject(100, 100, 40, 40);
			// fromX=100, fromY=100 -> xDelta=0, yDelta=0 -> yDelta > xDelta is false => yPos = centerY
			const [x, y] = box.getClosestCardinalPoint(100, 100);
			expect(x).toBe(100);
			expect(y).toBe(100);
		});
	});
});

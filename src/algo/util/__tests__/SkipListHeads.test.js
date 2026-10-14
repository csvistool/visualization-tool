import { NUM_HEADS } from '../SkipListHeads';

describe('SkipListHeads', () => {
	it('exports NUM_HEADS as a non-empty array of head counts', () => {
		expect(Array.isArray(NUM_HEADS)).toBe(true);
		expect(NUM_HEADS.length).toBe(1000);
	});

	it('contains non-negative integer head counts within bounds [0, 4]', () => {
		NUM_HEADS.forEach((val, idx) => {
			expect(Number.isInteger(val)).toBe(true);
			expect(val).toBeGreaterThanOrEqual(0);
			expect(val).toBeLessThanOrEqual(4);
		});
	});
});

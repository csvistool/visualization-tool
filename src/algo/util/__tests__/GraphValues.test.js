import {
	BFS_DFS_ADJ_LIST,
	DIJKSTRAS_ADJ_LIST,
	FLOYD_ADJ_LIST,
	KRUSKALS_DS_COLORS,
	LARGE_ADJ_LIST,
	LARGE_ALLOWED,
	LARGE_CURVE,
	LARGE_X_POS_LOGICAL,
	LARGE_Y_POS_LOGICAL,
	PRIMS_KRUSKALS_ADJ_LIST,
	SMALL_ALLLOWED,
	SMALL_CURVE,
	SMALL_X_POS_LOGICAL,
	SMALL_Y_POS_LOGICAL,
} from '../GraphValues';

describe('GraphValues', () => {
	describe('Small graph definitions (8 vertices)', () => {
		it('defines logical X and Y coordinate positions for 8 vertices', () => {
			expect(SMALL_X_POS_LOGICAL.length).toBe(8);
			expect(SMALL_Y_POS_LOGICAL.length).toBe(8);

			SMALL_X_POS_LOGICAL.forEach(x => expect(typeof x).toBe('number'));
			SMALL_Y_POS_LOGICAL.forEach(y => expect(typeof y).toBe('number'));
		});

		it('defines an 8x8 boolean adjacency allowance matrix (SMALL_ALLLOWED)', () => {
			expect(SMALL_ALLLOWED.length).toBe(8);
			SMALL_ALLLOWED.forEach(row => {
				expect(row.length).toBe(8);
				row.forEach(cell => expect(typeof cell).toBe('boolean'));
			});
		});

		it('defines an 8x8 curve configuration matrix (SMALL_CURVE)', () => {
			expect(SMALL_CURVE.length).toBe(8);
			SMALL_CURVE.forEach(row => {
				expect(row.length).toBe(8);
				row.forEach(curve => expect(typeof curve).toBe('number'));
			});
		});

		it('defines BFS/DFS 8x8 adjacency matrix with 1 for edges and -1 for absent edges', () => {
			expect(BFS_DFS_ADJ_LIST.length).toBe(8);
			BFS_DFS_ADJ_LIST.forEach((row, i) => {
				expect(row.length).toBe(8);
				expect(row[i]).toBe(-1); // No self loops
				row.forEach(val => expect([-1, 1]).toContain(val));
			});
		});

		it('defines Dijkstras 8x8 weighted adjacency matrix with non-negative weights or -1', () => {
			expect(DIJKSTRAS_ADJ_LIST.length).toBe(8);
			DIJKSTRAS_ADJ_LIST.forEach((row, i) => {
				expect(row.length).toBe(8);
				expect(row[i]).toBe(-1);
				row.forEach(val => {
					expect(val === -1 || val >= 0).toBe(true);
				});
			});
		});

		it('defines Floyd 8x8 adjacency matrix with positive weights or -1 for no edge', () => {
			expect(FLOYD_ADJ_LIST.length).toBe(8);
			FLOYD_ADJ_LIST.forEach((row, i) => {
				expect(row.length).toBe(8);
				expect(row[i]).toBe(-1);
				row.forEach(val => {
					expect(val === -1 || val > 0).toBe(true);
				});
			});
		});

		it('defines Prims/Kruskals 8x8 symmetric adjacency matrix converted to numbers', () => {
			expect(PRIMS_KRUSKALS_ADJ_LIST.length).toBe(8);
			PRIMS_KRUSKALS_ADJ_LIST.forEach((row, i) => {
				expect(row.length).toBe(8);
				row.forEach((val, j) => {
					expect(typeof val).toBe('number');
					expect(val).toBe(PRIMS_KRUSKALS_ADJ_LIST[j][i]); // Symmetric undirected graph
				});
			});
		});

		it('defines distinct Disjoint Set colors for Kruskals', () => {
			expect(KRUSKALS_DS_COLORS.length).toBe(8);
			const uniqueColors = new Set(KRUSKALS_DS_COLORS);
			expect(uniqueColors.size).toBe(8);
			KRUSKALS_DS_COLORS.forEach(color => {
				expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
			});
		});
	});

	describe('Large graph definitions (18 vertices)', () => {
		it('defines logical X and Y coordinates for 18 vertices', () => {
			expect(LARGE_X_POS_LOGICAL.length).toBe(18);
			expect(LARGE_Y_POS_LOGICAL.length).toBe(18);

			LARGE_X_POS_LOGICAL.forEach(x => expect(typeof x).toBe('number'));
			LARGE_Y_POS_LOGICAL.forEach(y => expect(typeof y).toBe('number'));
		});

		it('defines an 18x18 boolean allowance matrix (LARGE_ALLOWED)', () => {
			expect(LARGE_ALLOWED.length).toBe(18);
			LARGE_ALLOWED.forEach(row => {
				expect(row.length).toBe(18);
				row.forEach(cell => expect(typeof cell).toBe('boolean'));
			});
		});

		it('defines an 18x18 curve matrix (LARGE_CURVE)', () => {
			expect(LARGE_CURVE.length).toBe(18);
			LARGE_CURVE.forEach(row => {
				expect(row.length).toBe(18);
				row.forEach(curve => expect(typeof curve).toBe('number'));
			});
		});

		it('defines an 18x18 adjacency list with 1 for edges and -1 for absent edges', () => {
			expect(LARGE_ADJ_LIST.length).toBe(18);
			LARGE_ADJ_LIST.forEach((row, i) => {
				expect(row.length).toBe(18);
				expect(row[i]).toBe(-1); // No self loops
				row.forEach(val => expect([-1, 1]).toContain(val));
			});
		});
	});
});

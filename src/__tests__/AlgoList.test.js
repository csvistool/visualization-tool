import { algoFilter, algoList, algoMap, relatedSearches } from '../AlgoList';

describe('AlgoList module', () => {
	describe('algoMap', () => {
		test('contains all expected algorithms with valid tuple metadata', () => {
			const expectedKeys = [
				'NonLinearProbing',
				'LVA',
				'BogoSort',
				'DropSort',
				'SleepSort',
				'MiracleSort',
				'FredSort',
				'ArrayList',
				'LinkedList',
				'DoublyLinkedList',
				'CircularlyLinkedList',
				'StackArray',
				'StackLL',
				'QueueArray',
				'QueueLL',
				'DequeArray',
				'DequeLL',
				'BST',
				'Heap',
				'SkipList',
				'OpenHash',
				'ClosedHash',
				'SplayTree',
				'AVL',
				'BTree',
				'BubbleSort',
				'CocktailSort',
				'InsertionSort',
				'SelectionSort',
				'Quicksort',
				'Quickselect',
				'MergeSort',
				'LSDRadix',
				'HeapSort',
				'BruteForce',
				'BoyerMoore',
				'KMP',
				'RabinKarp',
				'CreateGraph',
				'BFS',
				'DFS',
				'Dijkstra',
				'Prim',
				'Kruskal',
				'DisjointSet',
				'LCS',
				'Floyd',
				'TreeMap',
			];

			for (const key of expectedKeys) {
				expect(algoMap).toHaveProperty(key);
				const entry = algoMap[key];
				expect(Array.isArray(entry)).toBe(true);
				expect(entry.length).toBeGreaterThanOrEqual(2);

				// [0] Menu Display Name
				expect(typeof entry[0]).toBe('string');
				expect(entry[0].length).toBeGreaterThan(0);

				// [1] Algorithm Class Component
				expect(typeof entry[1]).toBe('function');

				// [2] Optional/hasPseudocode boolean
				if (entry.length >= 3) {
					expect(typeof entry[2]).toBe('boolean');
				}

				// [3] Optional Verbose Display Name
				if (entry.length >= 4 && entry[3] !== undefined) {
					expect(typeof entry[3]).toBe('string');
				}

				// [4] Optional Rainbow Color boolean
				if (entry.length >= 5 && entry[4] !== undefined) {
					expect(typeof entry[4]).toBe('boolean');
				}
			}
		});

		test('specific algorithm entries have expected display names and flags', () => {
			expect(algoMap.ArrayList[0]).toBe('ArrayList');
			expect(algoMap.ArrayList[2]).toBe(true);

			expect(algoMap.LinkedList[0]).toBe('Singly LinkedList');
			expect(algoMap.LinkedList[2]).toBe(true);

			expect(algoMap.BST[0]).toBe('Binary Search Tree');
			expect(algoMap.BST[2]).toBe(true);

			expect(algoMap.NonLinearProbing[4]).toBe(true);
			expect(algoMap.LCS[3]).toBe('Longest Common Subsequence');
		});
	});

	describe('algoList', () => {
		test('is a non-empty array of strings containing categories and algorithms', () => {
			expect(Array.isArray(algoList)).toBe(true);
			expect(algoList.length).toBeGreaterThan(0);

			for (const item of algoList) {
				expect(typeof item).toBe('string');
				expect(item.length).toBeGreaterThan(0);
			}
		});

		test('contains all expected category section headers', () => {
			const expectedHeaders = [
				'Lists',
				'Stacks, Queues and Deques',
				'Trees and SkipList',
				'Maps',
				'Sorting and Quickselect',
				'String Searching',
				'Graphs',
				'DP & Extras',
			];

			for (const header of expectedHeaders) {
				expect(algoList).toContain(header);
			}
		});

		test('all non-category items in algoList exist in algoMap or are separators', () => {
			const nonAlgoItems = new Set([
				'Lists',
				'Stacks, Queues and Deques',
				'Trees and SkipList',
				'Maps',
				'Sorting and Quickselect',
				'String Searching',
				'Graphs',
				'---',
				'DP & Extras',
			]);

			for (const item of algoList) {
				if (!nonAlgoItems.has(item)) {
					expect(algoMap[item]).toBeDefined();
				}
			}
		});
	});

	describe('relatedSearches', () => {
		test('contains valid mappings where keys and values map to known algorithms', () => {
			const keys = Object.keys(relatedSearches);
			expect(keys.length).toBeGreaterThan(0);

			for (const [algoKey, related] of Object.entries(relatedSearches)) {
				expect(algoMap[algoKey]).toBeDefined();
				expect(Array.isArray(related)).toBe(true);

				for (const rel of related) {
					expect(algoMap[rel]).toBeDefined();
				}
			}
		});

		test('verifies specific relationship mappings', () => {
			expect(relatedSearches.ArrayList).toContain('LinkedList');
			expect(relatedSearches.BubbleSort).toEqual(
				expect.arrayContaining(['InsertionSort', 'SelectionSort', 'CocktailSort']),
			);
			expect(relatedSearches.BFS).toEqual(
				expect.arrayContaining(['DFS', 'Dijkstra', 'Prim', 'Kruskal', 'DisjointSet']),
			);
		});
	});

	describe('algoFilter', () => {
		test('contains valid objects with id and category properties', () => {
			expect(Array.isArray(algoFilter)).toBe(true);
			expect(algoFilter.length).toBeGreaterThan(0);

			for (const item of algoFilter) {
				expect(item).toHaveProperty('id');
				expect(item).toHaveProperty('category');
				expect(typeof item.id).toBe('string');
				expect(typeof item.category).toBe('string');
				expect(algoMap[item.id]).toBeDefined();
			}
		});

		test('includes all expected categories across the filter items', () => {
			const categories = new Set(algoFilter.map(item => item.category));
			expect(categories).toContain('Lists');
			expect(categories).toContain('Linear Data Structures');
			expect(categories).toContain('Trees and SkipList');
			expect(categories).toContain('Maps');
			expect(categories).toContain('Sorting and Quickselect');
			expect(categories).toContain('Pattern Matching');
			expect(categories).toContain('Graphs');
			expect(categories).toContain('DP & Extras');
		});
	});
});

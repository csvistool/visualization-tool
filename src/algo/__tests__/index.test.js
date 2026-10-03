import * as algos from '../index';

describe('algo index exports', () => {
	const expectedExports = [
		'AVL',
		'ArrayList',
		'BFS',
		'BST',
		'BTree',
		'BogoSort',
		'BoyerMoore',
		'BruteForce',
		'BubbleSort',
		'CircularlyLinkedList',
		'ClosedHash',
		'CocktailSort',
		'CreateGraph',
		'DFS',
		'DequeArray',
		'DequeLL',
		'Dijkstras',
		'DisjointSet',
		'DoublyLinkedList',
		'DropSort',
		'Floyd',
		'FredSort',
		'Heap',
		'HeapSort',
		'InsertionSort',
		'KMP',
		'Kruskals',
		'LCS',
		'LSDRadix',
		'LVA',
		'LinkedList',
		'MergeSort',
		'MiracleSort',
		'NonLinearProbing',
		'OpenHash',
		'Prims',
		'QueueArray',
		'QueueLL',
		'Quickselect',
		'Quicksort',
		'RabinKarp',
		'SelectionSort',
		'SkipList',
		'SleepSort',
		'SplayTree',
		'StackArray',
		'StackLL',
		'TreeMap',
	];

	test('exports all expected algorithm visualizer classes', () => {
		for (const name of expectedExports) {
			expect(algos[name]).toBeDefined();
			expect(typeof algos[name]).toBe('function');
		}
	});

	test('exports the exact set of expected algorithm visualizers', () => {
		const exportedKeys = Object.keys(algos);
		expect(exportedKeys.sort()).toEqual(expectedExports.sort());
	});
});

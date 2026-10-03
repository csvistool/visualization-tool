import Modals from '../InfoModals';
import React from 'react';
import { render } from '@testing-library/react';

describe('InfoModals', () => {
	const expectedModalKeys = [
		'ArrayList',
		'AVL',
		'BoyerMoore',
		'BruteForce',
		'BST',
		'BTree',
		'BubbleSort',
		'CircularlyLinkedList',
		'ClosedHash',
		'CocktailSort',
		'DoublyLinkedList',
		'InsertionSort',
		'Quickselect',
		'Quicksort',
		'LinkedList',
		'LSDRadix',
		'SkipList',
		'OpenHash',
		'SelectionSort',
		'SplayTree',
		'RabinKarp',
		'FredSort',
		'DropSort',
		'MiracleSort',
		'SleepSort',
	];

	test('contains all expected algorithm modal definitions', () => {
		for (const key of expectedModalKeys) {
			expect(Modals[key]).toBeDefined();
			expect(React.isValidElement(Modals[key])).toBe(true);
		}
	});

	test('renders ArrayList modal content correctly', () => {
		const { getByText } = render(<div>{Modals.ArrayList}</div>);
		expect(
			getByText(
				/ArrayLists must be contiguous so you cannot add at an index greater than size/i,
			),
		).toBeInTheDocument();
	});

	test('renders AVL modal content correctly', () => {
		const { getByText } = render(<div>{Modals.AVL}</div>);
		expect(
			getByText(/To cause a left rotation, add 1, 2 and 3, in that order/i),
		).toBeInTheDocument();
	});

	test('renders BoyerMoore modal content correctly', () => {
		const { getByText } = render(<div>{Modals.BoyerMoore}</div>);
		expect(
			getByText(/The worst case is when we have a text with only one letter/i),
		).toBeInTheDocument();
		expect(getByText(/When incorporating the Galil Rule/i)).toBeInTheDocument();
	});

	test('renders BruteForce modal content correctly', () => {
		const { getByText } = render(<div>{Modals.BruteForce}</div>);
		expect(
			getByText(/The worst case is when we have a text with only one letter/i),
		).toBeInTheDocument();
	});

	test('renders BST modal content correctly', () => {
		const { getByText } = render(<div>{Modals.BST}</div>);
		expect(getByText(/To get a degenerate BST/i)).toBeInTheDocument();
		expect(getByText(/To get a full and complete BST/i)).toBeInTheDocument();
	});

	test('renders BTree modal content correctly', () => {
		const { getByText } = render(<div>{Modals.BTree}</div>);
		expect(getByText(/When performing a transfer/i)).toBeInTheDocument();
		expect(getByText(/To cause overflow and trigger a promotion/i)).toBeInTheDocument();
	});

	test('renders BubbleSort modal content correctly', () => {
		const { getByText } = render(<div>{Modals.BubbleSort}</div>);
		expect(getByText(/The best case is when we have a sorted array/i)).toBeInTheDocument();
	});

	test('renders CircularlyLinkedList modal content correctly', () => {
		const { getByText } = render(<div>{Modals.CircularlyLinkedList}</div>);
		expect(getByText(/This is a singly circular LinkedList with no tail/i)).toBeInTheDocument();
	});

	test('renders ClosedHash modal content correctly', () => {
		const { getByText } = render(<div>{Modals.ClosedHash}</div>);
		expect(
			getByText(/The Hash Integers option uses the integer key itself as a hashcode/i),
		).toBeInTheDocument();
	});

	test('renders OpenHash modal content correctly', () => {
		const { getByText } = render(<div>{Modals.OpenHash}</div>);
		expect(
			getByText(/The True Hash option generates a Java-like hashcode/i),
		).toBeInTheDocument();
	});

	test('renders CocktailSort modal content correctly', () => {
		const { getByText } = render(<div>{Modals.CocktailSort}</div>);
		expect(
			getByText(/Even though Cocktail Shaker Sort has the same big-O as Bubble Sort/i),
		).toBeInTheDocument();
	});

	test('renders DoublyLinkedList modal content correctly', () => {
		const { getByText } = render(<div>{Modals.DoublyLinkedList}</div>);
		expect(getByText(/Since this is a DLL with a tail/i)).toBeInTheDocument();
	});

	test('renders LinkedList modal content correctly', () => {
		const { getByText } = render(<div>{Modals.LinkedList}</div>);
		expect(getByText(/LinkedLists are designed to operate at the head/i)).toBeInTheDocument();
	});

	test('renders InsertionSort modal content correctly', () => {
		const { getByText } = render(<div>{Modals.InsertionSort}</div>);
		expect(getByText(/The best case is when we have a sorted array/i)).toBeInTheDocument();
	});

	test('renders Quicksort modal content correctly', () => {
		const { getByText } = render(<div>{Modals.Quicksort}</div>);
		expect(
			getByText(/The worst case occurs when we pick a bad pivot every time/i),
		).toBeInTheDocument();
	});

	test('renders Quickselect modal content correctly', () => {
		const { getByText } = render(<div>{Modals.Quickselect}</div>);
		expect(getByText(/The best case is with a perfect pivot/i)).toBeInTheDocument();
	});

	test('renders LSDRadix modal content correctly', () => {
		const { getByText } = render(<div>{Modals.LSDRadix}</div>);
		expect(
			getByText(/The range of sortable numbers for this visualization is/i),
		).toBeInTheDocument();
	});

	test('renders SkipList modal content correctly', () => {
		const { getByText } = render(<div>{Modals.SkipList}</div>);
		expect(getByText(/You can get a degenerate SkipList/i)).toBeInTheDocument();
	});

	test('renders SelectionSort modal content correctly', () => {
		const { getByText } = render(<div>{Modals.SelectionSort}</div>);
		expect(
			getByText(/The minimum option selects the smallest number to swap with/i),
		).toBeInTheDocument();
	});

	test('renders SplayTree modal content correctly', () => {
		const { getByText } = render(<div>{Modals.SplayTree}</div>);
		expect(
			getByText(
				/SplayTrees are optimized for frequently accessing the same subset of elements/i,
			),
		).toBeInTheDocument();
	});

	test('renders RabinKarp modal content correctly', () => {
		const { getByText } = render(<div>{Modals.RabinKarp}</div>);
		expect(getByText(/The base value is initially set to 1/i)).toBeInTheDocument();
	});

	test('renders FredSort modal content correctly', () => {
		const { getByText } = render(<div>{Modals.FredSort}</div>);
		expect(
			getByText(/FredSort is an iterative sort created by our very own Professor/i),
		).toBeInTheDocument();
	});

	test('renders DropSort modal content correctly', () => {
		const { getByText } = render(<div>{Modals.DropSort}</div>);
		expect(
			getByText(/This sort, also commonly known by other less appropriate names/i),
		).toBeInTheDocument();
	});

	test('renders MiracleSort modal content correctly', () => {
		const { getByText } = render(<div>{Modals.MiracleSort}</div>);
		expect(getByText(/This sort does nothing to actively sort the data/i)).toBeInTheDocument();
	});

	test('renders SleepSort modal content correctly', () => {
		const { getByText } = render(<div>{Modals.SleepSort}</div>);
		expect(
			getByText(/The algorithm creates a delayed routine for each element in the array/i),
		).toBeInTheDocument();
	});
});

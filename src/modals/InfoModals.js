import React from 'react';

// Include the ClassName of algorithms that should have an example modal
const Modals = {
	ArrayList: (
		<ul>
			<li>ArrayLists must be contiguous so you cannot add at an index greater than size.</li>
			<li>Likewise, you cannot remove at an index greater than or equal to size.</li>
		</ul>
	),
	AVL: (
		<ul>
			<li>To cause a left rotation, add 1, 2 and 3, in that order</li>
			<li>To cause a right rotation, add 3, 2 and 1, in that order</li>
			<li>To cause a left-right rotation, add 3, 1 and 2, in that order</li>
			<li>To cause a right-left rotation, add 1, 3 and 2, in that order</li>
		</ul>
	),
	BoyerMoore: (
		<ul>
			<li>
				The worst case is when we have a text with only one letter and a pattern with that
				same letter, but a different first letter (for example, &quot;aaaaaaaaa&quot; for
				text and &quot;baaaa&quot; for pattern), since we will only mismatch on the last
				comparison
			</li>
			<li>
				When incorporating the Galil Rule, we can use logic similar to that of KMP to
				optimize our shifts. After finding a full match, instead of shifting by 1 we shift
				by the period <i>k = m - ft[m - 1]</i>. After that shift, we don't need to compare
				the first <i>k</i> characters in the pattern because we've already compared them and
				know that they match!
			</li>
		</ul>
	),
	BruteForce: (
		<ul>
			<li>
				The worst case is when we have a text with only one letter and a pattern with that
				same letter, but a different last letter (for example, &quot;aaaaaaaaa&quot; for
				text and &quot;aaaab&quot; for pattern), since we will only mismatch on the last
				comparison
			</li>
		</ul>
	),
	BST: (
		<ul>
			<li>To get a degenerate BST, you can add ascending data, such as 1, 2, 3, ...</li>
			<li>To get a full BST, you can add 2, 1, 4, 3, 5, in that order</li>
			<li>To get a complete BST, you can add 3, 2, 4, 1, in that order</li>
			<li>To get a full and complete BST, you can add 4, 2, 5, 1, 3, in that order</li>
		</ul>
	),
	BTree: (
		<ul>
			<li>
				When performing a transfer, the left sibling data will be considered before the
				right sibling data
			</li>
			<li>
				To cause overflow and trigger a promotion, add more than 3 data (for example 1, 2, 3
				and 4)
			</li>
			<li>
				To remove from a leaf node, add 1, 2, 3 and 4, in that order, then remove 3 or 4
			</li>
			<li>
				To remove from an inner node and use the predecessor, add 1, 3, 4, 5 and 2, in that
				order, then remove 3
			</li>
			<li>
				To cause underflow and trigger a rotation/transfer, add 1, 2, 3 and 4, in that
				order, then remove 1
			</li>
			<li>To cause underflow and trigger a fusion, follow the steps above then remove 2</li>
		</ul>
	),
	BubbleSort: (
		<ul>
			<li>The best case is when we have a sorted array (terminates if no swaps are made)</li>
			<li>
				The worst case is when we have a reverse sorted array (we perform
				<span className="equation">n + (n - 1) + (n - 2) + ... = n²</span>
				comparisons)
			</li>
		</ul>
	),
	CircularlyLinkedList: (
		<ul>
			<li>This is a singly circular LinkedList with no tail.</li>
			<li>
				Adding to the front, adding to the back, and removing from the front can all be done
				in <span className="equation">O(1)</span> using data movement tricks and pointer
				manipulation.
			</li>
			<li>
				Removing from the back requires a traversal to the node before the last node making
				it <span className="equation">O(n)</span>
			</li>
		</ul>
	),
	ClosedHash: (
		<ul>
			<li>The Hash Integers option uses the integer key itself as a hashcode.</li>
			<li>
				This Hash Strings option hashes the string key using the sum of the key's ASCII
				values and the XOR operator.
			</li>
			<li>
				The True Hash option generates a Java-like hashcode for both integer and string
				keys.
			</li>
			<li>Integer keys must be positive for these visualizations.</li>
		</ul>
	),
	CocktailSort: (
		<ul>
			<li>The best case is when we have a sorted array (terminates if no swaps are made)</li>
			<li>
				The worst case is when we have a reverse sorted array (we perform
				<span className="equation">n + (n - 1) + (n - 2) + ... = n²</span>
				comparisons)
			</li>
			<li>
				Even though Cocktail Shaker Sort has the same big-O as Bubble Sort, it is still
				faster; one case where it significantly outperforms Bubble Sort is when we have a
				sorted array, except for the last element which is the smallest, for example [2, 3,
				4, 5, 6, 7, 8, 9, 1]
			</li>
		</ul>
	),
	DoublyLinkedList: (
		<ul>
			<li>
				The visualization may make it appear as if the head and tail are a separate nodes.
				But keep in mind the head and tail are just references to the first node and last
				nodes. So the head/tail points to and effectively is the first/last node.
			</li>
			<li>
				Since this is a DLL with a tail, all operations acting at the front and back of the
				list are <span className="equation">O(1)</span>
			</li>
		</ul>
	),
	InsertionSort: (
		<ul>
			<li>The best case is when we have a sorted array (terminates if no swaps are made)</li>
			<li>
				The worst case is when we have a reverse sorted array (we perform
				<span className="equation">n + (n - 1) + (n - 2) + ... = n²</span>
				comparisons)
			</li>
		</ul>
	),
	Quickselect: (
		<ul>
			<li>
				The worst case occurs when we pick a bad pivot every time, such as the mininum or
				maximum element. Then, one partition will be empty and the other will have all of
				the remaining data, causing Quickselect to degenerate into a Selection Sort.
			</li>
			<li>
				The best case is with a perfect pivot. This is when the median element is chosen as
				the pivot, because then each partition will have half of the remaining data.
			</li>
		</ul>
	),
	Quicksort: (
		<ul>
			<li>
				The worst case occurs when we pick a bad pivot every time, such as the mininum or
				maximum element. Then, one partition will be empty and the other will have all of
				the remaining data, causing Quicksort to degenerate into a Selection Sort.
			</li>
			<li>
				The best case is with a perfect pivot. This is when the median element is chosen as
				the pivot, because then each partition will have half of the remaining data.
			</li>
		</ul>
	),
	LinkedList: (
		<ul>
			<li>
				The visualization may make it appear as if the head and tail are a separate nodes.
				But keep in mind the head and tail are just a references to first and last nodes. So
				the head points to and effectively is the first node, and the tail points to and
				effectively is the last node.
			</li>
			<li>
				LinkedLists are designed to operate at the head. So all operations acting at the
				front are <span className="equation">O(1).</span>
			</li>
			<li>
				Without the tail, adding to the back is <span className="equation">O(n)</span> since
				we must traverse from the head to the last node.
			</li>
			<li>
				With the tail, adding to the back becomes <span className="equation">O(1)</span>{' '}
				since we can set the next pointer of the tail to the new node and then have the tail
				point to the new node.
			</li>
		</ul>
	),
	LSDRadix: (
		<ul>
			<li>
				The range of sortable numbers for this visualization is [-99999, 999999]. Any
				numbers outside this range will not be sorted.
			</li>
			<li>
				When sorting negative numbers, a larger buckets array with indices -9 to 9 is
				needed.
			</li>
		</ul>
	),
	SkipList: (
		<ul>
			<li>
				You can get a degenerate SkipList by always adding with a constant amount of heads,
				for example 0 or 4.
			</li>
		</ul>
	),
	OpenHash: (
		<ul>
			<li>The Hash Integers option uses the integer key itself as a hashcode.</li>
			<li>
				This Hash Strings option hashes the string key using the sum of the key's ASCII
				values and the XOR operator.
			</li>
			<li>
				The True Hash option generates a Java-like hashcode for integer and string keys.
			</li>
			<li>Integer keys must be positive for these visualizations.</li>
		</ul>
	),
	SelectionSort: (
		<ul>
			<li>The minimum option selects the smallest number to swap with.</li>
			<li>The maximum option selects the largest number to swap with.</li>
		</ul>
	),
	SplayTree: (
		<ul>
			<li>
				SplayTrees are optimized for frequently accessing the same subset of elements. After
				an operation on an element, the element is moved to the root of the tree. This
				allows for faster access next time this element is searched for, and frequently-
				searched elements will tend to be towards the top of the tree.
			</li>
		</ul>
	),
	RabinKarp: (
		<ul>
			<li>The base value is initially set to 1.</li>
			<li>
				To reduce to liklihood of pattern/text hash collisions, a large prime number should
				be used for the base.
			</li>
		</ul>
	),
	FredSort: (
		<ul>
			<li>
				First, split the array into √n partitions. Then, run Insertion Sort on each
				partition. Lastly, merge each partition together in sorted order, similar to
				MergeSort.
			</li>
			<li>
				FredSort is an iterative sort created by our very own Professor{' '}
				<strong>Fred</strong>eric Faulkner. It is generally worse than MergeSort for
				efficiency, but is a fun exercise for algorithmic analysis.
			</li>
		</ul>
	),
	DropSort: (
		<ul>
			<li>
				This sort, also commonly known by other less appropriate names, is a way to create a
				sorted array of data in O(n) time.
			</li>
			<li>
				Iterate through the array left-to-right and <strong>drop (delete)</strong> any
				out-of-order elements, so that we end up with a sorted list.
			</li>
			<li>
				While this sort is technically O(n), it is not recommended for any real-world use
				since the user typically does not want to lose parts of their data when sorting.
			</li>
		</ul>
	),
	MiracleSort: (
		<ul>
			<li>
				This sort does nothing to actively sort the data. It simply waits and hopes for a
				miracle to happen. Specifically, we are hoping that the bytes representing the
				memory locations of each element are flipped by some cosmic radiation such that the
				ordering of each element is modified into a sorted order.
			</li>
		</ul>
	),
	SleepSort: (
		<ul>
			<li>
				The algorithm creates a delayed routine for each element in the array. The delay is
				proportional to the value of the element. The elements are then copied into a new
				array in order of the delay, which should be in ascending order.
			</li>
		</ul>
	),
};

export default Modals;

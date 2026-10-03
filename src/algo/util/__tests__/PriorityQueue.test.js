import PriorityQueue from '../PriorityQueue';

describe('PriorityQueue', () => {
	let pq;

	beforeEach(() => {
		pq = new PriorityQueue();
	});

	it('initializes with an empty backingArray and size 0', () => {
		expect(pq.backingArray).toEqual([]);
		expect(pq.size()).toBe(0);
		expect(pq.getIDs()).toEqual([]);
	});

	it('enqueues and sorts elements by priority ascending', () => {
		pq.enqueue('data1', 1, 10);
		pq.enqueue('data2', 2, 5);
		pq.enqueue('data3', 3, 20);

		expect(pq.size()).toBe(3);
		expect(pq.getIDs()).toEqual([2, 1, 3]);

		const first = pq.dequeue();
		expect(first).toEqual(['data2', 2]);
		expect(pq.size()).toBe(2);

		const second = pq.dequeue();
		expect(second).toEqual(['data1', 1]);

		const third = pq.dequeue();
		expect(third).toEqual(['data3', 3]);
		expect(pq.size()).toBe(0);
	});

	it('breaks ties using scalar data when priorities are equal', () => {
		pq.enqueue(30, 1, 5);
		pq.enqueue(10, 2, 5);
		pq.enqueue(20, 3, 5);

		expect(pq.getIDs()).toEqual([2, 3, 1]);
		expect(pq.dequeue()).toEqual([10, 2]);
		expect(pq.dequeue()).toEqual([20, 3]);
		expect(pq.dequeue()).toEqual([30, 1]);
	});

	it('breaks ties using array-based data on first element when priorities are equal', () => {
		pq.enqueue([3, 10], 1, 5);
		pq.enqueue([1, 20], 2, 5);
		pq.enqueue([2, 30], 3, 5);

		expect(pq.getIDs()).toEqual([2, 3, 1]);
		expect(pq.dequeue()).toEqual([[1, 20], 2]);
		expect(pq.dequeue()).toEqual([[2, 30], 3]);
		expect(pq.dequeue()).toEqual([[3, 10], 1]);
	});

	it('breaks ties using array-based data on second element when first elements are equal', () => {
		pq.enqueue([1, 50], 1, 5);
		pq.enqueue([1, 20], 2, 5);
		pq.enqueue([1, 35], 3, 5);

		expect(pq.getIDs()).toEqual([2, 3, 1]);
		expect(pq.dequeue()).toEqual([[1, 20], 2]);
		expect(pq.dequeue()).toEqual([[1, 35], 3]);
		expect(pq.dequeue()).toEqual([[1, 50], 1]);
	});
});

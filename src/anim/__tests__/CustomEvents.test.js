import EventListener from '../CustomEvents';

describe('EventListener (CustomEvents)', () => {
	let eventListener;

	beforeEach(() => {
		eventListener = new EventListener();
	});

	it('adds a listener and fires event to invoke callback', () => {
		const callback = jest.fn();
		eventListener.addListener('testEvent', null, callback);

		eventListener.fireEvent('testEvent', { data: 123 });

		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith({ data: 123 });
	});

	it('invokes callback with correct scope binding', () => {
		const scope = { multiplier: 5, result: 0 };
		function handler(val) {
			this.result = val * this.multiplier;
		}

		eventListener.addListener('compute', scope, handler);
		eventListener.fireEvent('compute', 4);

		expect(scope.result).toBe(20);
	});

	it('supports multiple listeners for the same event kind and scope', () => {
		const fn1 = jest.fn();
		const fn2 = jest.fn();
		eventListener.addListener('multi', null, fn1);
		eventListener.addListener('multi', null, fn2);

		eventListener.fireEvent('multi', 'payload');

		expect(fn1).toHaveBeenCalledWith('payload');
		expect(fn2).toHaveBeenCalledWith('payload');
	});

	it('supports listeners registered under different scopes for the same event kind', () => {
		const scopeA = { name: 'A', calls: [] };
		const scopeB = { name: 'B', calls: [] };
		function onEvent(val) {
			this.calls.push(val);
		}

		eventListener.addListener('eventX', scopeA, onEvent);
		eventListener.addListener('eventX', scopeB, onEvent);

		eventListener.fireEvent('eventX', 'dataX');

		expect(scopeA.calls).toEqual(['dataX']);
		expect(scopeB.calls).toEqual(['dataX']);
	});

	it('does not add duplicate functions under the same scope', () => {
		const callback = jest.fn();
		eventListener.addListener('dedupe', null, callback);
		eventListener.addListener('dedupe', null, callback);

		eventListener.fireEvent('dedupe');

		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('does not throw when firing an event with no listeners', () => {
		expect(() => {
			eventListener.fireEvent('nonExistentEvent', {});
		}).not.toThrow();
	});

	it('removes an existing listener by kind, scope, and function reference', () => {
		const fn1 = jest.fn();
		const fn2 = jest.fn();
		eventListener.addListener('removeTest', null, fn1);
		eventListener.addListener('removeTest', null, fn2);

		eventListener.removeListener('removeTest', null, fn1);
		eventListener.fireEvent('removeTest', 'val');

		expect(fn1).not.toHaveBeenCalled();
		expect(fn2).toHaveBeenCalledWith('val');
	});

	it('safely handles removeListener when kind does not exist', () => {
		expect(() => {
			eventListener.removeListener('unknownEvent', null, jest.fn());
		}).not.toThrow();
	});

	it('safely handles removeListener when scope does not match', () => {
		const fn = jest.fn();
		const scopeA = {};
		const scopeB = {};
		eventListener.addListener('scopeTest', scopeA, fn);

		expect(() => {
			eventListener.removeListener('scopeTest', scopeB, fn);
		}).not.toThrow();

		eventListener.fireEvent('scopeTest');
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('safely handles removeListener when function does not exist within the scope', () => {
		const fnRegistered = jest.fn();
		const fnUnregistered = jest.fn();
		eventListener.addListener('funcTest', null, fnRegistered);

		expect(() => {
			eventListener.removeListener('funcTest', null, fnUnregistered);
		}).not.toThrow();

		eventListener.fireEvent('funcTest');
		expect(fnRegistered).toHaveBeenCalledTimes(1);
	});
});

import { debounce } from '../src';
// Tell Jest to mock all timeout functions
jest.useFakeTimers();

describe('debounce', () => {
  test('execute just once with immediate false', () => {
    let func = jest.fn();
    let debouncedFunc = debounce(func, 1000);

    for (let i = 0; i < 100; i += 1) {
      debouncedFunc();
    }

    // Fast-forward time
    jest.runAllTimers();

    expect(func).toBeCalledTimes(1);
  });

  test('execute twice with immediate true', () => {
    let func = jest.fn();
    let debouncedFunc = debounce(func, 1000, true);

    for (let i = 0; i < 100; i += 1) {
      debouncedFunc();
    }

    jest.runAllTimers();

    expect(func).toBeCalledTimes(2);
  });

  test('should pass arguments to the original function', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 1000);

    debouncedFunc('a', 'b', 'c');
    jest.runAllTimers();

    expect(func).toHaveBeenCalledWith('a', 'b', 'c');
  });

  test('should maintain the correct context', () => {
    const context = {
      name: 'test',
      method: function() {
        this.callCount = (this.callCount || 0) + 1;
      },
      callCount: 0,
    };

    const debouncedMethod = debounce(context.method, 1000);
    debouncedMethod.call(context);

    jest.runAllTimers();

    expect(context.callCount).toBe(1);
  });

  test('should respect maxWait parameter', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 1000, false, 2500);

    // Call immediately
    debouncedFunc();

    // Advance time but not enough to trigger normal debounce
    jest.advanceTimersByTime(800);

    // Call again to reset the debounce timer
    debouncedFunc();

    // Advance time but not enough to trigger normal debounce
    jest.advanceTimersByTime(800);

    // Call again to reset the debounce timer
    debouncedFunc();

    // Advance time but not enough to trigger normal debounce
    jest.advanceTimersByTime(800);

    // At this point, maxWait (2500ms) should have triggered the function
    // even though we kept resetting the debounce timer
    expect(func).toHaveBeenCalledTimes(1);

    // Complete the remaining time
    jest.advanceTimersByTime(200);

    // The normal debounce should now fire
    expect(func).toHaveBeenCalledTimes(2);
  });

  test('should cancel pending executions', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 1000);

    debouncedFunc();

    // Advance time but not enough to trigger
    jest.advanceTimersByTime(500);

    // Cancel by clearing all timers
    jest.clearAllTimers();
    jest.runAllTimers();

    expect(func).not.toHaveBeenCalled();
  });

  test('should execute immediately only on first call', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 1000, true);

    // First call - should execute immediately
    debouncedFunc('first');
    expect(func).toHaveBeenCalledWith('first');
    expect(func).toHaveBeenCalledTimes(1);

    // Reset mock to clearly see next calls
    func.mockClear();

    // Second call - should not execute immediately
    debouncedFunc('second');
    expect(func).not.toHaveBeenCalled();

    // Fast-forward time
    jest.runAllTimers();

    // Should have executed after the debounce period
    expect(func).toHaveBeenCalledWith('second');
    expect(func).toHaveBeenCalledTimes(1);
  });

  test('should handle multiple sequential calls with proper timing', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 1000);

    // First call
    debouncedFunc('first');

    // Advance time but not enough to trigger
    jest.advanceTimersByTime(500);

    // Second call - should reset the timer
    debouncedFunc('second');

    // Advance time but not enough to trigger from second call
    jest.advanceTimersByTime(500);

    // Function should not have been called yet
    expect(func).not.toHaveBeenCalled();

    // Advance time to trigger from second call
    jest.advanceTimersByTime(500);

    // Function should now be called with the arguments from the second call
    expect(func).toHaveBeenCalledWith('second');
    expect(func).toHaveBeenCalledTimes(1);
  });
});

import { jest, describe, it, expect } from '@jest/globals';

import fetch, { Response, RequestInfo } from 'node-fetch';

// Mock fetch methods
jest.mock('node-fetch');

import { runInParallel } from '../../runInParallel';

// Use fake timers to correctly check fetch calls within specific timestamps
jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

// Prevent network calls in tests
const todo = {
  userId: 1,
  id: 1,
  title: 'delectus aut autem',
  completed: false,
};

const text = jest.fn() as jest.MockedFunction<any>;
text.mockResolvedValue(todo);

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
mockFetch.mockImplementation((url: RequestInfo) => {
  const splittedUrl = url.toString().split('/');
  const method = splittedUrl[3];
  const timeout = parseInt(splittedUrl[4] as string);
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      method === 'reject'
        ? reject({ error: 'Fetch rejected' })
        : resolve({ ok: true, text } as Response);
    }, timeout)
  );
});

// https://gist.github.com/apieceofbart/e6dea8d884d29cf88cdb54ef14ddbcc4
const flushPromises = () =>
  new Promise(
    (jest.requireActual('timers') as { setImmediate: () => void }).setImmediate
  );

const advanceTimersByTime = (ms: number) => {
  jest.advanceTimersByTime(ms);
  return flushPromises();
};

const runAllTimers = () => (jest.runAllTimers(), flushPromises());

describe('runInParallel', function () {
  // We'll be testing fetch calls in specific times to verify the limited concurrency

  it('only executes as many fetches in parallel as defined by concurrency', async function () {
    expect.assertions(6);

    jest.clearAllMocks();

    expect(mockFetch).not.toBeCalled();
    const prom = runInParallel(
      new Array(5).fill('http://fetch/resolve/500'),
      2
    );
    expect(mockFetch).toHaveBeenCalledTimes(2);
    await advanceTimersByTime(500);
    expect(mockFetch).toHaveBeenCalledTimes(4);
    await advanceTimersByTime(500);
    expect(mockFetch).toHaveBeenCalledTimes(5);
    await runAllTimers();
    const res = await prom;
    expect(mockFetch).toHaveBeenCalledTimes(5);
    expect(res).toStrictEqual(new Array(5).fill(todo));
  });

  it('executes all promises in parallel when concurrency is bigger than needed', async function () {
    expect.assertions(4);
    jest.clearAllMocks();

    expect(mockFetch).not.toBeCalled();
    const prom = runInParallel(
      new Array(3).fill('http://fetch/resolve/500'),
      6
    );
    expect(mockFetch).toHaveBeenCalledTimes(3);
    await runAllTimers();
    const res = await prom;
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(res).toStrictEqual(new Array(3).fill(todo));
  });
});

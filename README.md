# Asynchronous programming

Component that accepts an array of URLs and allows to fetch multiple resources in parallel, returning their `.text` representation. Provides a parameter so that the caller can limit the number of concurrent fetches run in parallel.

Characteristics:
- When one promise is rejected, it rejects immediately.
- When available, it executes the iterator `next()` function to handle new promises ASAP.

```tsx
async function runInParallel (urls: string[], concurrency: number) : Promise<string[]> {
  // ...
}
```

## Usage

```
$ npm install
$ npm start
```

```js
import { runInParallel } from './runInParallel'

...

runInParallel(urls, 2)
  .then((value: string[]) => ...)
  .catch(error => ...);
```

## Test

Tests verifies that fetch calls are executed in specific times due to the limited concurrency.

To execute them:

```
$ npm test
```
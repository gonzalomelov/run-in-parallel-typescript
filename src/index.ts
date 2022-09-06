import { runInParallel } from './runInParallel';

const urls = Array.from({ length: 10 }, (_, i) => i + 1).map(
  (val, index) => `https://jsonplaceholder.typicode.com/todos/${val}`
);

runInParallel(urls, 2)
  .then((value: string[]) => console.log(value))
  .catch((error) => console.log(error));

import fetch from 'node-fetch';

export async function runInParallel(
  urls: string[],
  concurrency: number
): Promise<string[]> {
  const results: string[] = [];

  async function execute(iter: IterableIterator<[number, string]>) {
    for (const [index, url] of iter) {
      const text = await fetch(url).then((res) => res.text());
      results[index] = text;
    }
  }

  const iter = urls.entries();
  const tasks = new Array(concurrency).fill(iter).map(execute);

  await Promise.all(tasks);

  return results;
}

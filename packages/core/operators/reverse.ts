import { getAsyncIterator, getIterator } from './utilities';

/**
 * Inverts the order of the elements in a sequence.
 *
 * @example```typescript
 * import { reverse } from '@fiorite/core/operators';
 *
 * const operator = reverse<number>();
 * operator([1, 2, 3]); // [Iterable [3, 2, 1]]
 *
 * ```
 */
export function reverse<E>() {
  return function *(iterable: Iterable<E>): Iterable<E> {
    const iterator = getIterator(iterable);
    const buffer: E[] = [];

    let result = iterator.next();

    while (!result.done) {
      buffer.push(result.value);
      result = iterator.next();
    }

    for (let i = buffer.length - 1; i >= 0; i--) {
      yield buffer[i];
    }
  };
}

/**
 * Inverts the order of the elements in a sequence.
 *
 * @example```typescript
 * import { reverseAsync } from '@fiorite/core/operators';
 * import { Readable } from 'stream';
 *
 * const operator = reverseAsync<number>();
 * operator(Readable.from([1, 2, 3])); // [AsyncIterable [3, 2, 1]]
 *
 * ```
 */
export function reverseAsync<E>() {
  return async function *(iterable: AsyncIterable<E>): AsyncIterable<E> {
    const iterator = getAsyncIterator(iterable);
    const buffer: E[] = [];

    let result = await iterator.next();

    while (!result.done) {
      buffer.push(result.value);
      result = await iterator.next();
    }

    for (let i = buffer.length - 1; i >= 0; i--) {
      yield buffer[i];
    }
  };
}

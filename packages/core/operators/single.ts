import { AnyPredicate, Predicate } from './functional_types';
import { InvalidOperationError } from './errors';
import { getAsyncIterator, getIterator } from './utilities';

/**
 * Returns a single, specific element of a sequence or only element that specifies a predicate.
 *
 * @param predicate
 *
 * @throws InvalidOperationError
 */
export function single<E>(predicate: Predicate<E> = () => true) {
  let predicated = arguments.length > 0;

  return function (iterable: Iterable<E>): E {
    const iterator = getIterator(iterable);

    let result = iterator.next();
    let element: E;
    let found = false;

    while (!result.done) {
      if (predicate(result.value)) {
        if (found) {
          if (iterator.return) {
            iterator.return();
          }

          throw new InvalidOperationError('There is more than one element.');
        }

        element = result.value;
        found = true;
      }

      result = iterator.next();
    }

    if (!found) {
      throw predicated ?
        new InvalidOperationError('There is no element that satisfies condition in a sequence.') :
        new InvalidOperationError('There is no element in a sequence.');
    }

    return element!;
  };
}

/**
 * Returns a single, specific element of a sequence or only element that specifies a predicate.
 *
 * @param predicate
 *
 * @throws InvalidOperationError
 */
export function singleAsync<E>(predicate: AnyPredicate<E> = () => true) {
  const predicated = arguments.length > 0;

  return async function (iterable: AsyncIterable<E>): Promise<E> {
    const iterator = getAsyncIterator(iterable);

    let result = await iterator.next();
    let element: E;
    let found = false;

    while (!result.done) {
      if (await predicate(result.value)) {
        if (found) {
          if (iterator.return) {
            await iterator.return();
          }

          throw new InvalidOperationError('There is more than one element.');
        }

        element = result.value;
        found = true;
      }

      result = await iterator.next();
    }

    if (!found) {
      throw predicated ?
        new InvalidOperationError('There is no element that satisfies condition in a sequence.') :
        new InvalidOperationError('There is no element in a sequence.');
    }

    return element!;
  };
}

import { Collection } from './collection';
import { OldInvalidOperationError } from '../errors';
import { EqualityComparer, equals } from '../equality';
import { Selector, forEach } from '../operators';
import { CollectionBuffer } from './collection_buffer';

export class HashMapError<K> extends OldInvalidOperationError {
  constructor(message: string, readonly key: K) {
    super(message);
  }
}

function inspectKey(key: any) {
  return typeof key === 'function' ? key.name : key;
}

export class HashMap<K, V> extends CollectionBuffer<[K, V]> {
  /**
   * Provides string tag.
   */
  get [Symbol.toStringTag]() {
    return 'HashMap';
  }

  /**
   * Returns keys collection.
   */
  get keys(): Collection<K> {
    return this.map(x => x[0]);
  }

  /**
   * Returns values collection.
   */
  get values(): Collection<V> {
    return this.map(x => x[1]);
  }

  /**
   * Instantiates {@link HashMap} from {@link Iterable}.
   *
   * @param iterable
   * @param key
   */
  static from<E, K>(iterable: Iterable<E>, key: Selector<E, K>): HashMap<K, E>;

  /**
   * Instantiates {@link HashMap} from {@link Iterable}.
   *
   * @param iterable
   * @param key
   * @param value
   */
  static from<E, K, V>(iterable: Iterable<E>, key: Selector<E, K>, value: Selector<E, V>): HashMap<K, E>;

  static from<E, K, V>(iterable: Iterable<E>, key: Selector<E, K>, value: Selector<E, V>, keyComparer: EqualityComparer<K>): HashMap<K, V>;

  /**
   * @inheritDoc
   */
  static from<E, K, V>(iterable: Iterable<E>, key: Selector<E, K>, value: Selector<E, V> = x => x as unknown as V, keyComparer: EqualityComparer<K> = equals): HashMap<K, V> {
    const buffer: [K, V][] = Array.from(iterable).map(e => [key(e), value(e)]);

    return new HashMap<K, V>(buffer, keyComparer);
  }

  /**
   * Instantiates map, applies {@param keyComparer} and sets {@param source} as a {@link _buffer}.
   *
   * @param source
   * @param keyComparer
   */
  static proxy<K, V>(source: [K, V][], keyComparer: EqualityComparer<K> = equals): HashMap<K, V> {
    const instance = new HashMap<K, V>([], keyComparer);

    instance.buffer = source;

    return instance;
  }

  /**
   * Instantiates map, applies {@param keyComparer} and performs {@link addAll} on {@param iterable}.
   *
   * @param iterable
   */
  constructor(iterable: Iterable<[K, V]> = [], public keyComparer: EqualityComparer<K> = equals) {
    super((x, y) => this.keyComparer(x[0], y[0]));
    this.addAll(iterable);
  }

  /**
   * Sets entry of throws {@link HashMapError} whether there is another entry with the same {@param key}.
   *
   * @param key
   * @param value
   *
   * @throws HashMapError An entry with the same {@param key} already exists.
   */
  add(key: K, value: V): this {
    if (this.has(key)) {
      throw new HashMapError('An entry with the same key "' + inspectKey(key) + '" already exists.', key);
    }

    this.set(key, value);

    return this;
  }

  /**
   * Sets entry whether there is no entry with {@param key}.
   *
   * @param key
   * @param value
   */
  tryAdd(key: K, value: V): boolean {
    if (!this.has(key)) {
      this.set(key, value);

      return true;
    }

    return false;
  }

  /**
   * Sets every entry of {@param iterable} of throws {@link HashMapError} whether one of keys exists.
   *
   * @param iterable
   *
   * @throws HashMapError An entry with the same key already exists.
   */
  addAll(iterable: Iterable<[K, V]>): this {
    forEach<[K, V]>(([key, value]) => this.add(key, value))(iterable);

    return this;
  }

  /**
   * Sets every entry of {@param entries} whether there is no entry with the same key.
   *
   * @param entries
   */
  tryAddAll(entries: Iterable<[K, V]>): this {
    const iterator = entries[Symbol.iterator]();

    let result = iterator.next();

    while (!result.done) {
      const [key, value] = result.value;
      this.tryAdd(key, value);

      result = iterator.next();
    }

    return this;
  }

  /**
   * Sets entry.
   *
   * @param key
   * @param value
   */
  set(key: K, value: V): this {
    const index = this.buffer.findIndex(([x]) => this.keyComparer(key, x));

    if (index < 0) {
      this.buffer.push([key, value]);
    } else {
      this.buffer.splice(index, 1, [key, value]);
    }

    return this;
  }

  /**
   * Sets every entry of {@param iterable}.
   *
   * @param iterable
   */
  setAll(iterable: Iterable<[K, V]>): this {
    forEach<[K, V]>(([key, value]) => this.set(key, value))(iterable);

    return this;
  }

  /**
   * Checks whether there is an entry with a {@param key}.
   *
   * @param key
   */
  has(key: K): boolean {
    return this.buffer.findIndex(([x]) => this.keyComparer(key, x)) > -1;
  }

  /**
   * Gets entry value by {@param key} or throws {@link TypeError} if there is no entry with such key.
   *
   * @param key
   *
   * @throws
   */
  get(key: K): V {
    const index = this.buffer.findIndex(([x]) => this.keyComparer(key, x));

    if (index < 0) {
      throw new HashMapError('An entry with key "' + inspectKey(key) +  '" is not exist.', key);
    }

    return this.buffer[index][1];
  }

  /**
   * Gets entry value by {@param key} or returns null if there is no entry with such key.
   *
   * @param key
   */
  tryGet(key: K): V | null;

  /**
   * Gets entry value by {@param key} or returns null if there is no entry with such key.
   *
   * @param key
   * @param _default
   */
  tryGet(key: K, _default: V): V;

  /**
   * @inheritDoc
   */
  tryGet(key: K, _default: V | null = null): V | null {
    const index = this.buffer.findIndex(([x]) => this.keyComparer(key, x));

    if (index < 0) {
      return _default;
    }

    return this.buffer[index][1];
  }

  /**
   * Deletes entry by {@param key} from the map.
   *
   * @param key
   */
  delete(key: K): this {
    const index = this.buffer.findIndex(([x]) => this.keyComparer(key, x));

    if (index > -1) {
      this.buffer.splice(index, 1);
    }

    return this;
  }

  /**
   * Clones instance and internal buffer.
   */
  [Symbol.clone](): this {
    const clone = Object.create(this) as this;

    clone.buffer = this.buffer.slice();
    clone.keyComparer = this.keyComparer;

    return clone;
  }
}

// TODO: Implements IterableHashMap and ReadonlyHashMap.

// export class IterableHashMap<K, V> extends Collection<K, V> {
//   constructor(readonly iterable: Iterable<[K, V]>, keyComparer: EqualityComparer<K> = EqualityComparer.DEFAULT) {
//     super(keyComparer);
//   }
// }

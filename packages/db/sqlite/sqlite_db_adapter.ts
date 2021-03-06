import { Database } from 'sqlite3';

import { SqliteDbIterator } from './sqlite_db_iterator';
import { Logger } from '@fiorite/core/logger';
import { DbAdapter, DbMigrator, DbQuery } from '../common';

export class SqliteDbAdapter implements DbAdapter {
  constructor(
    readonly database: Database,
    readonly migrator: DbMigrator,
    readonly logger?: Logger,
  ) { }

  count<E>(query: DbQuery): Promise<number> {
    return Promise.resolve(0);
  }

  query<E>(query: DbQuery): AsyncIterator<E> {
    let sql = `SELECT * FROM \`${query.target}\``;

    if (query.take !== null) {
      sql += ` LIMIT ${query.take}`;
    }

    if (query.skip !== null) {
      sql += ` OFFSET ${query.skip}`;
    }

    this.logger?.verbose('[SqliteDbAdapter] Query is prepared "' + sql + '"');

    const statement = this.database.prepare(sql);

    return new SqliteDbIterator(statement);
  }
  //
  // insert<E extends DbModel>(target: string, object: E): Promise<void> {
  //   const { keys, values } = Object.keys(object).reduce((result, key: string) => {
  //
  //     result.keys.push(key);
  //
  //     let value = (object as any)[key];
  //
  //     if (typeof value === 'string') { // Escape string.
  //       value = "\"" + escapeString(value) + "\"";
  //     }
  //
  //     result.values.push(value);
  //
  //     return result;
  //   }, { keys: [] as string[], values: [] as string[] });
  //
  //   const statement = this.database.exec(sql);
  //
  //   `INSERT INTO ${target} (${keys.join(', ')}) VALUES (${ values.join(', ') })`
  //
  //   throw new NotImplementedError();
  // }
  //
  // update<E extends DbModel>(target: string, object: E): Promise<void> {
  //   const keys = Object.keys(object);
  //
  //   throw new NotImplementedError();
  // }
  //
  // delete<E extends DbModel>(target: string, object: E): Promise<void> {
  //   const keys = Object.keys(object);
  //
  //   throw new NotImplementedError();
  // }
}

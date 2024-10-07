import { ApplicationFeature, registerServices } from '../app';
import { DbConnectionName, DbManager } from './manager';
import { DbModel } from './model';
import { DbSequence } from './sequence';
import { Provide, provide, ProvideDecorator } from '../di';

export function addDbManager(): ApplicationFeature {
  return registerServices(serviceSet => {
    if (!serviceSet.hasType(DbManager)) {
      serviceSet.addSingleton(DbManager, () => new DbManager());
    }
  });
}

export function dbSequence<T>(model: DbModel<T>, connection?: DbConnectionName): DbSequence<T> {
  const adapter = provide(DbManager).get(connection);
  if (undefined === adapter) {
    throw new Error('DbAdapter is not implemented for connection: '+String(connection || 'default'))
  }
  return new DbSequence(model, adapter.reader, adapter.writer);
}

/**
 * Provides `DbSequence<T>` of {@link model} and connection.
 * @param model
 * @param connection
 * @constructor
 */
export function FromDbModel<T>(model: DbModel<T>, connection?: DbConnectionName): ProvideDecorator<DbManager> {
  return Provide(DbManager, manager => {
    const adapter = manager.get(connection);
    if (undefined === adapter) {
      throw new Error('DbAdapter is not implemented for connection: '+String(connection || 'default'))
    }
    return new DbSequence(model, adapter.reader, adapter.writer);
  })
}
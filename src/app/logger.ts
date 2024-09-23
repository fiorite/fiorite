import { ServiceSet } from '../di';
import { ConsoleLogger, LevelFilter, Logger, LogLevel } from '../logger';
import { ApplicationFeature } from './feature';

export class ConsoleLoggerFeature implements ApplicationFeature {
  constructor(readonly level?: LogLevel) {
  }

  configureServices(serviceSet: ServiceSet) {
    let logger: Logger = new ConsoleLogger();
    if (this.level) {
      logger = new LevelFilter(logger, this.level!);
    }
    serviceSet.addValue(Logger, logger);
  }
}

export function addConsoleLogger(level?: LogLevel): ConsoleLoggerFeature {
  return new ConsoleLoggerFeature(level);
}
import { ApplicationFeature } from './feature';
import { BehaveLike, runProviderContext, ServiceProvider, ServiceProviderWithReturnFunction, ServiceSet } from '../di';
import { HttpServer } from '../http';
import { RouteMatcher } from '../routing';
import { Logger } from '../logging';
import { MaybePromiseLike, ValueCallback, VoidCallback } from '../core';
import { addHttpServer, HttpServerFeature } from './http-server';
import { HttpServerListener } from '../http/server';

export class Application {
  private readonly _provider: ServiceProvider;

  get provider(): ServiceProvider {
    return this._provider;
  }

  get provide(): ServiceProviderWithReturnFunction {
    return this._provider.withReturn;
  }

  get server(): HttpServer {
    return this._provider(HttpServer);
  }

  get router(): RouteMatcher {
    return this._provider(RouteMatcher);
  }

  get logger(): Logger {
    return this._provider(Logger);
  }

  constructor(provider: ServiceProvider) {
    this._provider = provider;
  }

  withProviderContext(callback: (complete: VoidCallback) => void): void {
    runProviderContext(this._provider, callback);
  }

  listen(port: number, callback: ValueCallback<unknown>): HttpServerListener {
    let listener: HttpServerListener;
    runProviderContext(this._provider, complete => {
      listener = this._provider(HttpServer).listen(port, value => {
        MaybePromiseLike.then(() => callback(value), complete);
      });
    });
    return listener!;
  }
}

export function makeApplication(...features: ApplicationFeature[]): Application {
  const serviceSet = new ServiceSet();

  serviceSet.addDecoratedBy(BehaveLike);

  if (!features.some(x => x instanceof HttpServerFeature)) {  // should be by default.
    features.unshift(addHttpServer());
  }

  features.filter(x => x.configureServices).forEach(x => x.configureServices!(serviceSet));

  serviceSet.includeDependencies();
  const provider = new ServiceProvider(serviceSet);
  const touchSingletons = true;

  runProviderContext(provider, complete => {
    let completed = false;
    let configured = false;

    if (touchSingletons) {
      provider.touchAllSingletons(() => {
        completed = true;
        if (configured) {
          complete();
        }
      });
    }

    features.filter(x => x.configure).forEach(x => x.configure!(provider));
    configured = true;
    if (completed) {
      complete();
    }
  });

  return new Application(provider);
}

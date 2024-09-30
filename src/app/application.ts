import { ApplicationFeature } from './feature';
import { BehaveLike, runProviderContext, ServiceProvider, ServiceProviderWithReturnFunction, ServiceSet } from '../di';
import { HttpCallback, HttpMethod } from '../http';
import { RouteDescriptor, RouteMatcher } from '../routing';
import { Logger } from '../logging';
import { MaybePromiseLike, ValueCallback, VoidCallback } from '../core';
import { addHttpServer, HttpServerFeature } from './http-server';
import { HttpServer, HttpServerListener } from '../http/server';

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

  get routes(): RouteMatcher {
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

  // region routes

  map(path: string, callback: HttpCallback): this;
  map(method: HttpMethod | string, path: string, callback: HttpCallback): this;
  map(...args: unknown[]): this {
    if (args.length === 2) {
      const [path, callback] = args as [string, HttpCallback];
      const route = new RouteDescriptor({ path, callback });
      this.routes.add(route);
      return this;
    }

    if (args.length === 3) {
      const [method, path, callback] = args as [HttpMethod | string, string, HttpCallback];
      const route = new RouteDescriptor({ path, method, callback });
      this.routes.add(route);
      return this;
    }

    throw new Error('wrong number of args. see overloads.');
  }

  mapGet(path: string, callback: HttpCallback): this {
    return this.map(HttpMethod.Get, path, callback);
  }

  mapHead(path: string, callback: HttpCallback): this {
    return this.map(HttpMethod.Head, path, callback);
  }

  mapPost(path: string, callback: HttpCallback): this {
    return this.map(HttpMethod.Post, path, callback);
  }

  mapPut(path: string, callback: HttpCallback): this {
    return this.map(HttpMethod.Put, path, callback);
  }

  mapDelete(path: string, callback: HttpCallback): this {
    return this.map(HttpMethod.Delete, path, callback);
  }

  mapConnect(path: string, callback: HttpCallback): this {
    return this.map(HttpMethod.Connect, path, callback);
  }

  mapOptions(path: string, callback: HttpCallback): this {
    return this.map(HttpMethod.Options, path, callback);
  }

  mapTrace(path: string, callback: HttpCallback): this {
    return this.map(HttpMethod.Trace, path, callback);
  }

  mapPatch(path: string, callback: HttpCallback): this {
    return this.map(HttpMethod.Patch, path, callback);
  }

  // endregion
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

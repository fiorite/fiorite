import { FunctionClass, MaybePromiseLike } from '../core';
import { HttpCallback } from '../http';
import { RouteMatcher } from './route-matcher';
import { RouteParams } from './route-params';
import { Logger } from '../logging';

export class RoutingMiddleware extends FunctionClass<HttpCallback> {
  constructor(routeMatcher: RouteMatcher) {
    super((context, next) => {
      const result = routeMatcher.match(context.request.url!.pathname, context.request.method);
      if (undefined !== result) {
        const params = context.provide(RouteParams);

        params.clear();
        Object.entries(result.params).forEach((x) => params.set(x[0], x[1] as any));

        const length = result.descriptor.callback instanceof FunctionClass ?
          result.descriptor.callback[FunctionClass.callback].length :
          result.descriptor.callback.length;

        if (length < 2) {
          // next is not bound to route callback.
          const logger = context.provide(Logger);
          logger.warn('next is not added to main callback, auto-close after sync or promise will be applied');
        }

        MaybePromiseLike.then(() => { // todo: maybe allow all the matched handlers (middleware as part of routing?)
          return result.descriptor.callback(context, next);
        }, () => {
          if (length < 2) {
            next();
          }
        }, err => {
          throw err;
        });
      } else {
        next();
      }
    });
  }
}

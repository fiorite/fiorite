import { ServiceProvider, ServiceSet } from '../di';
import { HttpContext, HttpContextHost, HttpPipeline, HttpQuery, HttpRequest, HttpResponse } from '../http';
import { ApplicationFeature } from './feature';
import { HttpServer } from '../http/server';

export class HttpServerFeature implements ApplicationFeature {
  configureServices(serviceSet: ServiceSet) {
    const pipeline = new HttpPipeline();

    serviceSet.addValue(HttpPipeline, pipeline)
      .addSingleton(HttpServer, (provider: ServiceProvider) => {
        return new HttpServer({ callback: pipeline, provider, });
      }, [ServiceProvider])
      .addScoped(HttpContextHost)
      .addInherited(HttpContext, (host: HttpContextHost) => {
        if (!host.context) {
          throw new Error('HttpContext is missing');
        }
        return host.context;
      }, [HttpContextHost])
      .addInherited(HttpRequest, (context: HttpContext) => context.request, [HttpContext])
      .addInherited(HttpQuery, (request: HttpRequest) => request.query, [HttpRequest])
      .addInherited(HttpResponse, (context: HttpContext) => context.response, [HttpContext])
    ;
  }
}

export function addHttpServer(): HttpServerFeature {
  return new HttpServerFeature();
}

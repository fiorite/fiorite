import { DecoratorFunction, DecoratorOuterFunction } from './typing';
import { FunctionClass } from '../function-class';
import { DecoratorRecorder } from './recorder';

export abstract class DecoratorWithPayload<TPayload, TDecorator extends DecoratorFunction> extends FunctionClass<TDecorator> {
  private readonly _decorator: DecoratorOuterFunction<TDecorator>;

  get decorator(): DecoratorOuterFunction<TDecorator> {
    return this._decorator;
  }

  private readonly _payload: TPayload;

  get payload(): TPayload {
    return this._payload;
  }

  private _callStack: DecoratorOuterFunction<TDecorator>[] = [];

  get callStack(): readonly DecoratorOuterFunction<TDecorator>[] {
    return this._callStack;
  }

  constructor(decorator: DecoratorOuterFunction<TDecorator>, payload: TPayload, include: readonly TDecorator[] = []) {
    super((
      (...args: any[]): any => {
        DecoratorRecorder.addEvent<TPayload, TDecorator, any[]>({ path: args, decorator, payload: payload });
        include.forEach((otherDecorator: Function) => otherDecorator(...args));
      }
    ) as TDecorator);
    this._decorator = decorator;
    this._payload = payload;
  }

  calledBy(decorator: DecoratorOuterFunction<TDecorator>): this {
    this._callStack.push(decorator);
    return this;
  }
}

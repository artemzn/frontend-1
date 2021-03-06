import { attach, Effect, Event } from 'effector-root';
import * as typed from 'typed-contracts';
import { splitMap } from 'patronum/split-map';
import { Answer, Request, requestFx } from './common';

interface ResourcePart<P, Done, Fail> {
  doneBody: Event<Done>;
  doneInvalid: Event<Answer<unknown>>;

  failBody: Event<Fail>;
  failInvalid: Event<Answer<unknown>>;
}

type Resource<Params, Done, Fail> = Effect<Params, Answer<Done>, Answer<Fail>> &
  ResourcePart<Params, Done, Fail>;

interface Options<Params, Done, Fail> {
  name: string;
  contractDone: typed.Contract<Done>;
  contractFail: typed.Contract<Fail>;
  mapParams: (params: Params) => Request;
}

export function createResource<Params = void, Done = void, Fail = void>(
  options: Options<Params, Done, Fail>,
): Resource<Params, Done, Fail> {
  const original = attach({
    effect: requestFx,
    mapParams: options.mapParams,
  });

  const doneValidator = options.contractDone(`${options.name}.done`);
  const failValidator = options.contractFail(`${options.name}.fail`);

  const mappedDone = splitMap(original.done, {
    correct: ({ params, result }) => {
      const validated = doneValidator(result.body);
      if (validated instanceof typed.ValidationError) {
        return undefined;
      }
      return { params, result: { ...result, body: validated } };
    },
  });

  const done = mappedDone.correct;
  const doneData = done.map(({ result }) => result);
  const doneBody = doneData.map(({ body }) => body);
  const doneInvalid = mappedDone.__; // eslint-disable-line no-underscore-dangle

  const mappedFail = splitMap(original.fail, {
    correct: ({ params, error }) => {
      const validated = failValidator(error.body);
      if (validated instanceof typed.ValidationError) {
        return undefined;
      }
      return { params, error: { ...error, body: validated } };
    },
  });

  const fail = mappedFail.correct;
  const failData = fail.map(({ error }) => error);
  const failBody = failData.map(({ body }) => body);
  const failInvalid = mappedFail.__; // eslint-disable-line no-underscore-dangle

  const properties = { ...original };
  const callee = original.map((argument) => argument);
  Object.assign(callee, properties, {
    done,
    doneData,
    doneBody,
    doneInvalid,
    fail,
    failData,
    failBody,
    failInvalid,
    // TODO: rewrite to handle validated type in .finally
  });

  return callee as any;
}

import type { IActorQueryOperationOutputBindings } from '@comunica/bus-query-operation';
import {
  ActorQueryOperation,
  Bindings,
  KEY_CONTEXT_PATTERN_PARENTMETADATA,
} from '@comunica/bus-query-operation';
import { ActionContext, Bus, KEY_CONTEXT_LOG } from '@comunica/core';
import { literal, namedNode, variable } from '@rdfjs/data-model';
import { ArrayIterator } from 'asynciterator';
import { ActorQueryOperationQuadpatternMembershipFilter } from '../lib/ActorQueryOperationQuadpatternMembershipFilter';
const arrayifyStream = require('arrayify-stream');

const subjectUri = 'http://example.org/s';
const predicateUri = 'http://example.org/p';
const objectUri = 'http://example.org/o';
const graphUri = 'http://example.org/g';

describe('ActorQueryOperationQuadpatternMembershipFilter', () => {
  let bus: any;
  let mediatorQueryOperation: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
    mediatorQueryOperation = {
      mediate: (arg: any) => Promise.resolve({
        bindingsStream: new ArrayIterator([
          Bindings({ a: literal('1') }),
          Bindings({ a: literal('2') }),
          Bindings({ a: literal('3') }),
        ]),
        metadata: () => Promise.resolve({ totalItems: 3 }),
        operated: arg,
        type: 'bindings',
        variables: [ 'a' ],
      }),
    };
  });

  describe('The ActorQueryOperationQuadpatternMembershipFilter module', () => {
    it('should be a function', () => {
      expect(ActorQueryOperationQuadpatternMembershipFilter).toBeInstanceOf(Function);
    });

    it('should be a ActorQueryOperationQuadpatternMembershipFilter constructor', () => {
      expect(new (<any> ActorQueryOperationQuadpatternMembershipFilter)({ name: 'actor', bus, mediatorQueryOperation }))
        .toBeInstanceOf(ActorQueryOperationQuadpatternMembershipFilter);
      expect(new (<any> ActorQueryOperationQuadpatternMembershipFilter)({ name: 'actor', bus, mediatorQueryOperation }))
        .toBeInstanceOf(ActorQueryOperation);
    });

    it('should not be able to create new ActorQueryOperationQuadpatternMembershipFilter objects without \'new\'',
      () => {
        expect(() => { (<any> ActorQueryOperationQuadpatternMembershipFilter)(); }).toThrow();
      });
  });

  describe('An ActorQueryOperationQuadpatternMembershipFilter instance', () => {
    let actor: ActorQueryOperationQuadpatternMembershipFilter;

    beforeEach(() => {
      actor = new ActorQueryOperationQuadpatternMembershipFilter(
        { name: 'actor', bus, mediatorQueryOperation, subjectUri, predicateUri, objectUri, graphUri },
      );
    });

    it('should have a termUriMapper object', () => {
      return expect(actor.termUriMapper).toEqual({
        [subjectUri]: 'subject',
        [predicateUri]: 'predicate',
        [objectUri]: 'object',
        [graphUri]: 'graph',
      });
    });

    it('should test on a quadpattern without variables and a membership filters', () => {
      const operation = {
        graph: namedNode('g'),
        object: namedNode('o'),
        predicate: namedNode('p'),
        subject: namedNode('s'),
        type: 'pattern',
      };
      const context = ActionContext({
        [KEY_CONTEXT_PATTERN_PARENTMETADATA]: {
          approximateMembershipFilters: [
            {
              filter: {
                filter: () => true,
              },
              variable: subjectUri,
            },
          ],
        },
      });
      const op = { operation, context };
      return expect(actor.test(op)).resolves.toBeTruthy();
    });

    it('should not test on a quadpattern with variables', () => {
      const operation = {
        graph: namedNode('g'),
        object: namedNode('o'),
        predicate: variable('p'),
        subject: namedNode('s'),
        type: 'pattern',
      };
      const context = ActionContext({
        [KEY_CONTEXT_PATTERN_PARENTMETADATA]: {
          approximateMembershipFilters: [
            {
              filter: {
                filter: () => true,
              },
              variable: subjectUri,
            },
          ],
        },
      });
      const op = { operation, context };
      return expect(actor.test(op)).rejects.toEqual(
        new Error('Actor actor can only handle patterns without variables.'),
      );
    });

    it('should not test on a quadpattern without variables and 0 membership filters', () => {
      const operation = {
        graph: namedNode('g'),
        object: namedNode('o'),
        predicate: namedNode('p'),
        subject: namedNode('s'),
        type: 'pattern',
      };
      const context = ActionContext({
        [KEY_CONTEXT_PATTERN_PARENTMETADATA]: {
          approximateMembershipFilters: [],
        },
      });
      const op = { operation, context };
      return expect(actor.test(op)).rejects.toEqual(
        new Error('Actor actor requires approximate membership filter metadata.'),
      );
    });

    it('should not test on a quadpattern without variables and no membership filter metadata', () => {
      const operation = {
        graph: namedNode('g'),
        object: namedNode('o'),
        predicate: variable('p'),
        subject: namedNode('s'),
        type: 'pattern',
      };
      const context = ActionContext({
        [KEY_CONTEXT_PATTERN_PARENTMETADATA]: {},
      });
      const op = { operation, context };
      return expect(actor.test(op)).rejects.toEqual(
        new Error('Actor actor requires approximate membership filter metadata.'),
      );
    });

    it('should not test on a quadpattern without variables and no metadata', () => {
      const operation = {
        graph: namedNode('g'),
        object: namedNode('o'),
        predicate: variable('p'),
        subject: namedNode('s'),
        type: 'pattern',
      };
      const context = ActionContext({});
      const op = { operation, context };
      return expect(actor.test(op)).rejects.toEqual(
        new Error('Actor actor requires a context with an entry @comunica/bus-query-operation:patternParentMetadata.'),
      );
    });

    it('should not test on a quadpattern without variables and no context', () => {
      const operation = {
        graph: namedNode('g'),
        object: namedNode('o'),
        predicate: variable('p'),
        subject: namedNode('s'),
        type: 'pattern',
      };
      const context = null;
      const op: any = { operation, context };
      return expect(actor.test(op)).rejects.toEqual(
        new Error('Actor actor requires a context with an entry @comunica/bus-query-operation:patternParentMetadata.'),
      );
    });

    it('should not test on non-quadpattern', () => {
      const op = { operation: { type: 'some-other-type' }};
      return expect(actor.test(op)).rejects.toBeTruthy();
    });

    it('should run for all-matching filters', () => {
      const operation = {
        graph: namedNode('g'),
        object: namedNode('o'),
        predicate: namedNode('p'),
        subject: namedNode('s'),
        type: 'pattern',
      };
      const context = ActionContext({
        [KEY_CONTEXT_PATTERN_PARENTMETADATA]: {
          approximateMembershipFilters: [
            {
              filter: {
                filter: () => true,
              },
              variable: subjectUri,
            },
          ],
        },
      });
      return actor.run({ operation, context }).then(async(output: IActorQueryOperationOutputBindings) => {
        expect(output.variables).toEqual([ 'a' ]);
        expect(await (<any> output.metadata)()).toEqual({ totalItems: 3 });
        expect(await arrayifyStream(output.bindingsStream)).toEqual(
          [
            Bindings({ a: literal('1') }),
            Bindings({ a: literal('2') }),
            Bindings({ a: literal('3') }),
          ],
        );
      });
    });

    it('should run for all-non-matching filters', async() => {
      const operation = {
        graph: namedNode('g'),
        object: namedNode('o'),
        predicate: namedNode('p'),
        subject: namedNode('s'),
        type: 'pattern',
      };
      const logger = {
        info: jest.fn(),
      };
      const context = ActionContext({
        [KEY_CONTEXT_PATTERN_PARENTMETADATA]: {
          approximateMembershipFilters: [
            {
              filter: {
                filter: () => false,
              },
              variable: subjectUri,
            },
          ],
        },
        [KEY_CONTEXT_LOG]: logger,
      });
      await actor.run({ operation, context }).then(async(output: IActorQueryOperationOutputBindings) => {
        expect(output.variables).toEqual([]);
        expect(await (<any> output.metadata)()).toEqual({ totalItems: 0 });
        expect(await arrayifyStream(output.bindingsStream)).toEqual([]);
      });
      expect(logger.info).toHaveBeenCalledWith('True negative for AMF', {
        actor: 'actor',
        pattern: expect.anything(),
      });
    });

    it('should run for an all-matching and a non-matching filters', () => {
      const operation = {
        graph: namedNode('g'),
        object: namedNode('o'),
        predicate: namedNode('p'),
        subject: namedNode('s'),
        type: 'pattern',
      };
      const context = ActionContext({
        [KEY_CONTEXT_PATTERN_PARENTMETADATA]: {
          approximateMembershipFilters: [
            {
              filter: {
                filter: () => true,
              },
              variable: subjectUri,
            },
            {
              filter: {
                filter: () => false,
              },
              variable: subjectUri,
            },
          ],
        },
      });
      return actor.run({ operation, context }).then(async(output: IActorQueryOperationOutputBindings) => {
        expect(output.variables).toEqual([]);
        expect(await (<any> output.metadata)()).toEqual({ totalItems: 0 });
        expect(await arrayifyStream(output.bindingsStream)).toEqual([]);
      });
    });
  });
});

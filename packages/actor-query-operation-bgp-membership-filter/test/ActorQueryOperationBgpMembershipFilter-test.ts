import {ActorQueryOperation, Bindings, IActorQueryOperationOutputBindings,
  KEY_CONTEXT_BGP_PARENTMETADATA} from "@comunica/bus-query-operation";
import {ActionContext, Bus} from "@comunica/core";
import {literal, namedNode} from "@rdfjs/data-model";
import {ArrayIterator} from "asynciterator";
import {ActorQueryOperationBgpMembershipFilter} from "../lib/ActorQueryOperationBgpMembershipFilter";
const arrayifyStream = require('arrayify-stream');

const subjectUri = 'http://example.org/s';
const predicateUri = 'http://example.org/p';
const objectUri = 'http://example.org/o';
const graphUri = 'http://example.org/g';

describe('ActorQueryOperationBgpMembershipFilter', () => {
  let bus;
  let mediatorQueryOperation;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
    mediatorQueryOperation = {
      mediate: (arg) => Promise.resolve({
        bindingsStream: new ArrayIterator([
          Bindings({ a: literal('1') }),
          Bindings({ a: literal('2') }),
          Bindings({ a: literal('3') }),
        ]),
        metadata: () => Promise.resolve({ totalItems: 3 }),
        operated: arg,
        type: 'bindings',
        variables: ['a'],
      }),
    };
  });

  describe('The ActorQueryOperationBgpMembershipFilter module', () => {
    it('should be a function', () => {
      expect(ActorQueryOperationBgpMembershipFilter).toBeInstanceOf(Function);
    });

    it('should be a ActorQueryOperationBgpMembershipFilter constructor', () => {
      expect(new (<any> ActorQueryOperationBgpMembershipFilter)({ name: 'actor', bus, mediatorQueryOperation }))
        .toBeInstanceOf(ActorQueryOperationBgpMembershipFilter);
      expect(new (<any> ActorQueryOperationBgpMembershipFilter)({ name: 'actor', bus, mediatorQueryOperation }))
        .toBeInstanceOf(ActorQueryOperation);
    });

    it('should not be able to create new ActorQueryOperationBgpMembershipFilter objects without \'new\'', () => {
      expect(() => { (<any> ActorQueryOperationBgpMembershipFilter)(); }).toThrow();
    });
  });

  describe('An ActorQueryOperationBgpMembershipFilter instance', () => {
    let actor: ActorQueryOperationBgpMembershipFilter;

    beforeEach(() => {
      actor = new ActorQueryOperationBgpMembershipFilter(
        { name: 'actor', bus, mediatorQueryOperation, subjectUri, predicateUri, objectUri, graphUri });
    });

    it('should have a termUriMapper object', () => {
      return expect(actor.termUriMapper).toEqual({
        [subjectUri]: 'subject',
        [predicateUri]: 'predicate',
        [objectUri]: 'object',
        [graphUri]: 'graph',
      });
    });

    it('should test on a BGP and membership filters', () => {
      const operation = {
        patterns: [
          {
            graph: namedNode('g'),
            object: namedNode('o'),
            predicate: namedNode('p'),
            subject: namedNode('s'),
            type: 'pattern',
          },
        ],
        type: 'bgp',
      };
      const context = ActionContext({
        [KEY_CONTEXT_BGP_PARENTMETADATA]: [{
          approximateMembershipFilters: [
            {
              filter: {
                filter: () => true,
              },
              variable: subjectUri,
            },
          ],
        }],
      });
      const op = { operation, context };
      return expect(actor.test(op)).resolves.toBeTruthy();
    });

    it('should test on a BGP without filters', () => {
      const operation = {
        patterns: [
          {
            graph: namedNode('g'),
            object: namedNode('o'),
            predicate: namedNode('p'),
            subject: namedNode('s'),
            type: 'pattern',
          },
        ],
        type: 'bgp',
      };
      const context = ActionContext({
        [KEY_CONTEXT_BGP_PARENTMETADATA]: [{
          approximateMembershipFilters: [],
        }],
      });
      const op = { operation, context };
      return expect(actor.test(op)).rejects
        .toThrow(new Error('Actor actor requires approximate membership filter metadata.'));
    });

    it('should test on a BGP with no filters entry', () => {
      const operation = {
        patterns: [
          {
            graph: namedNode('g'),
            object: namedNode('o'),
            predicate: namedNode('p'),
            subject: namedNode('s'),
            type: 'pattern',
          },
        ],
        type: 'bgp',
      };
      const context = ActionContext({
        [KEY_CONTEXT_BGP_PARENTMETADATA]: [{}],
      });
      const op = { operation, context };
      return expect(actor.test(op)).rejects
        .toThrow(new Error('Actor actor requires approximate membership filter metadata.'));
    });

    it('should test on a BGP without metadata', () => {
      const operation = {
        patterns: [
          {
            graph: namedNode('g'),
            object: namedNode('o'),
            predicate: namedNode('p'),
            subject: namedNode('s'),
            type: 'pattern',
          },
        ],
        type: 'bgp',
      };
      const context = ActionContext({});
      const op = { operation, context };
      return expect(actor.test(op)).rejects.toThrow(
        new Error('Actor actor requires a context with an entry @comunica/bus-query-operation:bgpParentMetadata.'));
    });

    it('should not test on non-bgp', () => {
      const op = { operation: { type: 'some-other-type' } };
      return expect(actor.test(op)).rejects
        .toThrow(new Error('Actor actor only supports bgp operations, but got some-other-type'));
    });

    it('should run for all-matching filters', () => {
      const operation = {
        patterns: [
          {
            graph: namedNode('g'),
            object: namedNode('o'),
            predicate: namedNode('p'),
            subject: namedNode('s'),
            type: 'pattern',
          },
        ],
        type: 'bgp',
      };
      const context = ActionContext({
        [KEY_CONTEXT_BGP_PARENTMETADATA]: [{
          approximateMembershipFilters: [
            {
              filter: {
                filter: () => true,
              },
              variable: subjectUri,
            },
          ],
        }],
      });
      return actor.run({ operation, context }).then(async (output: IActorQueryOperationOutputBindings) => {
        expect(output.variables).toEqual([ 'a' ]);
        expect(await output.metadata()).toEqual({ totalItems: 3 });
        expect(await arrayifyStream(output.bindingsStream)).toEqual(
          [
            Bindings({ a: literal('1') }),
            Bindings({ a: literal('2') }),
            Bindings({ a: literal('3') }),
          ]);
      });
    });

    it('should run for all-non-matching filters', () => {
      const operation = {
        patterns: [
          {
            graph: namedNode('g'),
            object: namedNode('o'),
            predicate: namedNode('p'),
            subject: namedNode('s'),
            type: 'pattern',
          },
        ],
        type: 'bgp',
      };
      const context = ActionContext({
        [KEY_CONTEXT_BGP_PARENTMETADATA]: [{
          approximateMembershipFilters: [
            {
              filter: {
                filter: () => false,
              },
              variable: subjectUri,
            },
          ],
        }],
      });
      return actor.run({ operation, context }).then(async (output: IActorQueryOperationOutputBindings) => {
        expect(output.variables).toEqual([]);
        expect(await output.metadata()).toEqual({ totalItems: 0 });
        expect(await arrayifyStream(output.bindingsStream)).toEqual([]);
      });
    });

    it('should run for an all-matching and a non-matching filters', () => {
      const operation = {
        patterns: [
          {
            graph: namedNode('g'),
            object: namedNode('o'),
            predicate: namedNode('p'),
            subject: namedNode('s'),
            type: 'pattern',
          },
        ],
        type: 'bgp',
      };
      const context = ActionContext({
        [KEY_CONTEXT_BGP_PARENTMETADATA]: [{
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
        }],
      });
      return actor.run({ operation, context }).then(async (output: IActorQueryOperationOutputBindings) => {
        expect(output.variables).toEqual([]);
        expect(await output.metadata()).toEqual({ totalItems: 0 });
        expect(await arrayifyStream(output.bindingsStream)).toEqual([]);
      });
    });

    it('should run for patterns without metadata', () => {
      const operation = {
        patterns: [
          {
            graph: namedNode('g'),
            object: namedNode('o'),
            predicate: namedNode('p'),
            subject: namedNode('s'),
            type: 'pattern',
          },
          {
            graph: namedNode('g'),
            object: namedNode('o'),
            predicate: namedNode('p'),
            subject: namedNode('s'),
            type: 'pattern',
          },
        ],
        type: 'bgp',
      };
      const context = ActionContext({
        [KEY_CONTEXT_BGP_PARENTMETADATA]: [
          {
            approximateMembershipFilters: [
              {
                filter: {
                  filter: () => true,
                },
                variable: subjectUri,
              },
            ],
          },
          {
            // Empty
          },
        ],
      });
      return actor.run({ operation, context }).then(async (output: IActorQueryOperationOutputBindings) => {
        expect(output.variables).toEqual([ 'a' ]);
        expect(await output.metadata()).toEqual({ totalItems: 3 });
        expect(await arrayifyStream(output.bindingsStream)).toEqual(
          [
            Bindings({ a: literal('1') }),
            Bindings({ a: literal('2') }),
            Bindings({ a: literal('3') }),
          ]);
      });
    });
  });
});

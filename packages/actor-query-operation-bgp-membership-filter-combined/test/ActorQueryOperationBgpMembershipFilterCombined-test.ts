import {ActorQueryOperation, Bindings, IActorQueryOperationOutputBindings,
  KEY_CONTEXT_BGP_CURRENTMETADATA, KEY_CONTEXT_BGP_PARENTMETADATA,
  KEY_CONTEXT_BGP_PATTERNBINDINGS} from "@comunica/bus-query-operation";
import {ActionContext, Bus} from "@comunica/core";
import {literal, namedNode, variable} from "@rdfjs/data-model";
import {ArrayIterator} from "asynciterator";
import {ActorQueryOperationBgpMembershipFilterCombined} from "../lib/ActorQueryOperationBgpMembershipFilterCombined";
const arrayifyStream = require('arrayify-stream');

const subjectUri = 'http://example.org/s';
const predicateUri = 'http://example.org/p';
const objectUri = 'http://example.org/o';
const graphUri = 'http://example.org/g';
const plainRequestSize = 1000;
const amfTripleSize = 2;

describe('ActorQueryOperationBgpMembershipFilterCombined', () => {
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

  describe('The ActorQueryOperationBgpMembershipFilterCombined module', () => {
    it('should be a function', () => {
      expect(ActorQueryOperationBgpMembershipFilterCombined).toBeInstanceOf(Function);
    });

    it('should be a ActorQueryOperationBgpMembershipFilterCombined constructor', () => {
      expect(new (<any> ActorQueryOperationBgpMembershipFilterCombined)({ name: 'actor', bus, mediatorQueryOperation }))
        .toBeInstanceOf(ActorQueryOperationBgpMembershipFilterCombined);
      expect(new (<any> ActorQueryOperationBgpMembershipFilterCombined)({ name: 'actor', bus, mediatorQueryOperation }))
        .toBeInstanceOf(ActorQueryOperation);
    });

    it('should not be able to create new ActorQueryOperationBgpMembershipFilterCombined objects without \'new\'',
      () => {
        expect(() => { (<any> ActorQueryOperationBgpMembershipFilterCombined)(); }).toThrow();
      });
  });

  describe('An ActorQueryOperationBgpMembershipFilterCombined instance', () => {
    let actor: ActorQueryOperationBgpMembershipFilterCombined;

    beforeEach(() => {
      actor = new ActorQueryOperationBgpMembershipFilterCombined(
        {
          amfTripleSize,
          bus,
          graphUri,
          mediatorQueryOperation,
          name: 'actor',
          objectUri,
          plainRequestSize,
          predicateUri,
          subjectUri,
        });
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
        [KEY_CONTEXT_BGP_CURRENTMETADATA]: {
          totalItems: 10,
        },
        [KEY_CONTEXT_BGP_PARENTMETADATA]: [{
          approximateMembershipFilters: [
            {
              filter: {
                filter: () => true,
              },
              variable: subjectUri,
            },
          ],
          totalItems: 10,
        }],
        [KEY_CONTEXT_BGP_PATTERNBINDINGS]: [
          {
            subject: variable('s'),
          },
        ],
      });
      const op = { operation, context };
      return expect(actor.test(op)).resolves.toBeTruthy();
    });

    it('should test on a BGP and membership filters with empty current metadata', () => {
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
        [KEY_CONTEXT_BGP_CURRENTMETADATA]: {},
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
        [KEY_CONTEXT_BGP_PATTERNBINDINGS]: [
          {
            subject: variable('s'),
          },
        ],
      });
      const op = { operation, context };
      return expect(actor.test(op)).resolves.toBeTruthy();
    });

    it('should not test on a BGP without current metadata', () => {
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
        [KEY_CONTEXT_BGP_PATTERNBINDINGS]: [
          {
            subject: variable('s'),
          },
        ],
      });
      const op = { operation, context };
      return expect(actor.test(op)).rejects.toThrow(
        new Error('Actor actor requires a context with an entry @comunica/bus-query-operation:bgpCurrentMetadata.'));
    });

    it('should not test on a BGP with current metadata with low count and very high remaining pattern count', () => {
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
        [KEY_CONTEXT_BGP_CURRENTMETADATA]: {
          totalItems: 1,
        },
        [KEY_CONTEXT_BGP_PARENTMETADATA]: [{
          approximateMembershipFilters: [
            {
              filter: {
                filter: () => true,
              },
              variable: subjectUri,
            },
          ],
          totalItems: 100000,
        }],
        [KEY_CONTEXT_BGP_PATTERNBINDINGS]: [
          {
            subject: variable('s'),
          },
        ],
      });
      const op = { operation, context };
      return expect(actor.test(op)).rejects.toThrow(
        new Error('Actor actor is skipped because the AMF would be ineffective.'));
    });

    it('should not test on a BGP with current metadata with low count and unknown remaining pattern count', () => {
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
        [KEY_CONTEXT_BGP_CURRENTMETADATA]: {
          totalItems: 1,
        },
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
        [KEY_CONTEXT_BGP_PATTERNBINDINGS]: [
          {
            subject: variable('s'),
          },
        ],
      });
      const op = { operation, context };
      return expect(actor.test(op)).rejects.toThrow(
        new Error('Actor actor is skipped because the AMF would be ineffective.'));
    });

    it('should not test on a BGP without filters', () => {
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
        [KEY_CONTEXT_BGP_CURRENTMETADATA]: {
          totalItems: 10,
        },
        [KEY_CONTEXT_BGP_PARENTMETADATA]: [{
          approximateMembershipFilters: [],
        }],
        [KEY_CONTEXT_BGP_PATTERNBINDINGS]: [
          {
            subject: variable('s'),
          },
        ],
      });
      const op = { operation, context };
      return expect(actor.test(op)).rejects
        .toThrow(new Error('Actor actor requires approximate membership filter metadata.'));
    });

    it('should test on a BGP and membership filters without pattern bindings', () => {
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
        [KEY_CONTEXT_BGP_CURRENTMETADATA]: {
          totalItems: 10,
        },
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
      return expect(actor.test(op)).rejects.toThrow(new Error(
        'Actor actor requires a context with an entry @comunica/bus-query-operation:bgpPatternBindings.'));
    });

    it('should not test on a BGP with no filters entry', () => {
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
        [KEY_CONTEXT_BGP_CURRENTMETADATA]: {
          totalItems: 10,
        },
        [KEY_CONTEXT_BGP_PARENTMETADATA]: [{}],
        [KEY_CONTEXT_BGP_PATTERNBINDINGS]: [
          {
            subject: variable('s'),
          },
        ],
      });
      const op = { operation, context };
      return expect(actor.test(op)).rejects
        .toThrow(new Error('Actor actor requires approximate membership filter metadata.'));
    });

    it('should not test on a BGP without parent metadata', () => {
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
        [KEY_CONTEXT_BGP_CURRENTMETADATA]: {
          totalItems: 10,
        },
        [KEY_CONTEXT_BGP_PATTERNBINDINGS]: [
          {
            subject: variable('s'),
          },
        ],
      });
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
        [KEY_CONTEXT_BGP_CURRENTMETADATA]: {
          totalItems: 10,
        },
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
        [KEY_CONTEXT_BGP_PATTERNBINDINGS]: [
          {
            subject: variable('s'),
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
        [KEY_CONTEXT_BGP_CURRENTMETADATA]: {
          totalItems: 10,
        },
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
        [KEY_CONTEXT_BGP_PATTERNBINDINGS]: [
          {
            subject: variable('s'),
          },
        ],
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
        [KEY_CONTEXT_BGP_CURRENTMETADATA]: {
          totalItems: 10,
        },
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
        [KEY_CONTEXT_BGP_PATTERNBINDINGS]: [
          {
            subject: variable('s'),
          },
        ],
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
        [KEY_CONTEXT_BGP_CURRENTMETADATA]: {
          totalItems: 10,
        },
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
        [KEY_CONTEXT_BGP_PATTERNBINDINGS]: [
          {
            subject: variable('s'),
          },
          {},
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

    it('should run for BGP with 2 patterns with matching bound variables', () => {
      const operation = {
        patterns: [
          {
            graph: namedNode('g1'),
            object: variable('o1'),
            predicate: namedNode('p1'),
            subject: namedNode('s1'),
            type: 'pattern',
          },
          {
            graph: namedNode('g2'),
            object: variable('o2'),
            predicate: namedNode('p2'),
            subject: namedNode('s2'),
            type: 'pattern',
          },
        ],
        type: 'bgp',
      };
      const context = ActionContext({
        [KEY_CONTEXT_BGP_CURRENTMETADATA]: {
          totalItems: 10,
        },
        [KEY_CONTEXT_BGP_PARENTMETADATA]: [{
          approximateMembershipFilters: [
            {
              filter: {
                filter: () => true,
              },
              variable: graphUri,
            },
            {
              filter: {
                filter: () => false,
              },
              variable: graphUri,
            },
          ],
        }],
        [KEY_CONTEXT_BGP_PATTERNBINDINGS]: [
          {
            graph: variable('g'),
          },
          {
            graph: variable('g'),
          },
        ],
      });
      return actor.run({ operation, context }).then(async (output: IActorQueryOperationOutputBindings) => {
        expect(output.variables).toEqual([]);
        expect(await output.metadata()).toEqual({ totalItems: 0 });
        expect(await arrayifyStream(output.bindingsStream)).toEqual([]);
      });
    });

    it('should run for BGP with 2 patterns with non-matching bound variables', () => {
      const operation = {
        patterns: [
          {
            graph: namedNode('g1'),
            object: variable('o1'),
            predicate: namedNode('p1'),
            subject: namedNode('s1'),
            type: 'pattern',
          },
          {
            graph: namedNode('g2'),
            object: variable('o2'),
            predicate: namedNode('p2'),
            subject: namedNode('s2'),
            type: 'pattern',
          },
        ],
        type: 'bgp',
      };
      const context = ActionContext({
        [KEY_CONTEXT_BGP_CURRENTMETADATA]: {
          totalItems: 10,
        },
        [KEY_CONTEXT_BGP_PARENTMETADATA]: [
          {
            approximateMembershipFilters: [
              {
                filter: {
                  filter: () => true,
                  prefetch: () => null,
                },
                variable: predicateUri,
              },
            ],
          },
          {
            approximateMembershipFilters: [
              {
                filter: {
                  filter: () => false,
                },
                variable: graphUri,
              },
            ],
          }],
        [KEY_CONTEXT_BGP_PATTERNBINDINGS]: [
          {
            predicate: variable('p'),
          },
          {
            graph: variable('g'),
            subject: variable('s'),
          },
        ],
      });
      return actor.run({ operation, context }).then(async (output: IActorQueryOperationOutputBindings) => {
        expect(output.variables).toEqual([]);
        expect(await output.metadata()).toEqual({ totalItems: 0 });
        expect(await arrayifyStream(output.bindingsStream)).toEqual([]);
      });
    });
  });
});

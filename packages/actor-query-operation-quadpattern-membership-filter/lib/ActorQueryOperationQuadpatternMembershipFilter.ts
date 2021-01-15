import type { IApproximateMembershipHolder } from '@comunica/actor-rdf-metadata-extract-membership';
import type { IActorQueryOperationOutput, IActorQueryOperationOutputBindings,
  IActorQueryOperationTypedMediatedArgs } from '@comunica/bus-query-operation';
import { ActorQueryOperationTypedMediated, KEY_CONTEXT_PATTERN_PARENTMETADATA } from '@comunica/bus-query-operation';
import type { ActionContext, IActorTest } from '@comunica/core';
import { ArrayIterator } from 'asynciterator';
import type * as RDF from 'rdf-js';
import type { QuadTermName } from 'rdf-terms';
import { someTerms } from 'rdf-terms';
import type { Algebra } from 'sparqlalgebrajs';

/**
 * A comunica Quadpattern Membership Filter Query Operation Actor.
 * It will filter out fully materialized patterns that are guaranteed
 * to have no matches based on any available approximate membership filters.
 */
export class ActorQueryOperationQuadpatternMembershipFilter extends ActorQueryOperationTypedMediated<Algebra.Pattern> {
  public readonly subjectUri: string;
  public readonly predicateUri: string;
  public readonly objectUri: string;
  public readonly graphUri: string;

  public readonly termUriMapper: {[termUri: string]: QuadTermName};

  public constructor(args: IActorQueryOperationQuadpatternMembershipFilterArgs) {
    super(args, 'pattern');
    this.termUriMapper = {
      [this.subjectUri]: 'subject',
      [this.predicateUri]: 'predicate',
      [this.objectUri]: 'object',
      [this.graphUri]: 'graph',
    };
  }

  public static hasVariables(quad: RDF.BaseQuad): boolean {
    return someTerms(quad, value => value.termType === 'Variable');
  }

  public async testOperation(pattern: Algebra.Pattern, context: ActionContext): Promise<IActorTest> {
    if (!context || !context.has(KEY_CONTEXT_PATTERN_PARENTMETADATA)) {
      throw new Error(`Actor ${this.name} requires a context with an entry ${KEY_CONTEXT_PATTERN_PARENTMETADATA}.`);
    }
    const metadata = context.get(KEY_CONTEXT_PATTERN_PARENTMETADATA);
    if (!metadata.approximateMembershipFilters || metadata.approximateMembershipFilters.length === 0) {
      throw new Error(`Actor ${this.name} requires approximate membership filter metadata.`);
    }
    if (ActorQueryOperationQuadpatternMembershipFilter.hasVariables(pattern)) {
      throw new Error(`Actor ${this.name} can only handle patterns without variables.`);
    }
    return true;
  }

  public async runOperation(pattern: Algebra.Pattern, context: ActionContext): Promise<IActorQueryOperationOutput> {
    const filters: IApproximateMembershipHolder[] = context.get(KEY_CONTEXT_PATTERN_PARENTMETADATA)
      .approximateMembershipFilters;

    // Test all available filters (false positive is possible)
    // If we have a *non-match*, we are certain that the pattern has *no* matches.
    for (const { filter, variable } of filters) {
      const term = pattern[this.termUriMapper[variable]];
      if (!await filter.filter(term, context)) {
        this.logInfo(context, `True negative for AMF`, () => ({ pattern }));
        return <IActorQueryOperationOutputBindings> {
          bindingsStream: new ArrayIterator([], { autoStart: false }),
          metadata: () => Promise.resolve({ totalItems: 0 }),
          type: 'bindings',
          variables: [],
          canContainUndefs: false,
        };
      }
    }

    // Fallback to default quad pattern actor if all filters (approximately) passed.
    // In this case, the pattern *may* have results.
    return await this.mediatorQueryOperation.mediate(
      { operation: pattern, context: context.delete(KEY_CONTEXT_PATTERN_PARENTMETADATA) },
    );
  }
}

export interface IActorQueryOperationQuadpatternMembershipFilterArgs extends IActorQueryOperationTypedMediatedArgs {
  subjectUri: string;
  predicateUri: string;
  objectUri: string;
  graphUri?: string;
}

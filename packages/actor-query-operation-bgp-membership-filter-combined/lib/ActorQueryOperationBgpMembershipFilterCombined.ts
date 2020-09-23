import type { IActorQueryOperationOutput,
  IActorQueryOperationTypedMediatedArgs, IPatternBindings } from '@comunica/bus-query-operation';
import {
  ActorQueryOperationTypedMediated,
  KEY_CONTEXT_BGP_CURRENTMETADATA, KEY_CONTEXT_BGP_PARENTMETADATA, KEY_CONTEXT_BGP_PATTERNBINDINGS,
} from '@comunica/bus-query-operation';
import type { IActorQueryOperationOutputBindings } from '@comunica/bus-query-operation/lib/ActorQueryOperation';
import type { IApproximateMembershipFilter } from '@comunica/bus-rdf-membership-filter';
import type { ActionContext, IActorTest } from '@comunica/core';
import { ArrayIterator } from 'asynciterator';
import type { QuadTermName } from 'rdf-terms';
import { QUAD_TERM_NAMES } from 'rdf-terms';
import type { Algebra } from 'sparqlalgebrajs';

/**
 * A comunica BGP Membership Filter Combined Query Operation Actor.
 * It will filter out patterns that are guaranteed to have no matches
 * based on all available approximate membership filters.
 */
export class ActorQueryOperationBgpMembershipFilterCombined extends ActorQueryOperationTypedMediated<Algebra.Bgp> {
  public readonly subjectUri: string;
  public readonly predicateUri: string;
  public readonly objectUri: string;
  public readonly graphUri: string;
  public readonly plainRequestSize: number;
  public readonly amfTripleSize: number;

  public readonly termUriMapper: {[termUri: string]: QuadTermName};

  public constructor(args: IActorQueryOperationBgpMembershipFilterCombinedArgs) {
    super(args, 'bgp');
    this.termUriMapper = {
      [this.subjectUri]: 'subject',
      [this.predicateUri]: 'predicate',
      [this.objectUri]: 'object',
      [this.graphUri]: 'graph',
    };
  }

  public isAmfEffective(bindings: number, patternMetadatas: any[]): boolean {
    const joinRequestData: number = (bindings * patternMetadatas.length) * this.plainRequestSize;
    const totalAmfsSize: number = patternMetadatas.reduce(
      (acc: number, metadata) => acc + <number> ('totalItems' in metadata ? metadata.totalItems : Infinity), 0,
    ) * this.amfTripleSize;

    return totalAmfsSize < joinRequestData;
  }

  public async testOperation(pattern: Algebra.Bgp, context: ActionContext): Promise<IActorTest> {
    if (!context || !context.has(KEY_CONTEXT_BGP_CURRENTMETADATA)) {
      throw new Error(`Actor ${this.name} requires a context with an entry ${KEY_CONTEXT_BGP_CURRENTMETADATA}.`);
    }
    if (!context.has(KEY_CONTEXT_BGP_PARENTMETADATA)) {
      throw new Error(`Actor ${this.name} requires a context with an entry ${KEY_CONTEXT_BGP_PARENTMETADATA}.`);
    }
    if (!context.has(KEY_CONTEXT_BGP_PATTERNBINDINGS)) {
      throw new Error(`Actor ${this.name} requires a context with an entry ${KEY_CONTEXT_BGP_PATTERNBINDINGS}.`);
    }
    const metadatas: any[] = context.get(KEY_CONTEXT_BGP_PARENTMETADATA);
    if (!metadatas || metadatas.length === 0 || !metadatas.some(
      metadata => metadata.approximateMembershipFilters && metadata.approximateMembershipFilters.length,
    )) {
      throw new Error(`Actor ${this.name} requires approximate membership filter metadata.`);
    }
    const currentMetadata: any = context.get(KEY_CONTEXT_BGP_CURRENTMETADATA);
    if (currentMetadata.totalItems && !this.isAmfEffective(currentMetadata.totalItems, metadatas)) {
      throw new Error(`Actor ${this.name} is skipped because the AMF would be ineffective.`);
    }
    return true;
  }

  public async runOperation(pattern: Algebra.Bgp, context: ActionContext): Promise<IActorQueryOperationOutput> {
    // Create combined filters
    const filters: { [variableName: string]: IApproximateMembershipFilter[] } = {};
    const metadatas: any[] = context.get(KEY_CONTEXT_BGP_PARENTMETADATA);
    const patternBindingsArray: IPatternBindings[] = context.get(KEY_CONTEXT_BGP_PATTERNBINDINGS);
    for (let i = 0; i < pattern.patterns.length; i++) {
      const metadata = metadatas[i];
      const patternBindings = patternBindingsArray[i];
      if (metadata && metadata.approximateMembershipFilters && metadata.approximateMembershipFilters.length > 0) {
        for (const { filter, variable: termUri } of metadata.approximateMembershipFilters) {
          const termName: QuadTermName = this.termUriMapper[termUri];
          const variable = patternBindings[termName];
          if (variable) {
            const variableName = variable.value;
            let filterArray: IApproximateMembershipFilter[] = filters[variableName];
            if (!filterArray) {
              filterArray = filters[variableName] = [];
            }
            filterArray.push(filter);

            // We will most likely need this filter later, so let's start loading it already.
            if (filter.prefetch) {
              filter.prefetch();
            }
          }
        }
      }
    }

    // Run the bound pattern's variable through their respective filters
    for (let i = 0; i < pattern.patterns.length; i++) {
      const quadPattern: Algebra.Pattern = pattern.patterns[i];
      const patternBindings = patternBindingsArray[i];
      for (const termName of QUAD_TERM_NAMES) {
        const termValue = quadPattern[termName];
        // Only check non-variable terms
        if (termValue.termType !== 'Variable') {
          const variable = patternBindings[termName];
          // Check if the term was just bound from a variable
          if (variable) {
            // Retrieve all filters for that variable
            const filterArray: IApproximateMembershipFilter[] = filters[variable.value];
            if (filterArray) {
              for (const filter of filterArray) {
                if (!await filter.filter(termValue, context)) {
                  return <IActorQueryOperationOutputBindings> {
                    bindingsStream: new ArrayIterator([], { autoStart: false }),
                    metadata: () => Promise.resolve({ totalItems: 0 }),
                    type: 'bindings',
                    variables: [],
                    canContainUndefs: false,
                  };
                }
              }
            }
          }
        }
      }
    }

    // Fallback to next BGP actor if all filters (approximately) passed.
    // In this case, the pattern *may* have results.
    context = context
      .delete(KEY_CONTEXT_BGP_CURRENTMETADATA)
      .delete(KEY_CONTEXT_BGP_PARENTMETADATA)
      .delete(KEY_CONTEXT_BGP_PATTERNBINDINGS);
    return await this.mediatorQueryOperation.mediate({ operation: pattern, context });
  }
}

export interface IActorQueryOperationBgpMembershipFilterCombinedArgs extends IActorQueryOperationTypedMediatedArgs {
  subjectUri: string;
  predicateUri: string;
  objectUri: string;
  graphUri?: string;
  plainRequestSize: number;
  amfTripleSize: number;
}

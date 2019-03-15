import {ActorQueryOperationTypedMediated, IActorQueryOperationOutput, IActorQueryOperationOutputBindings,
  IActorQueryOperationTypedMediatedArgs, KEY_CONTEXT_BGP_CURRENTMETADATA,
  KEY_CONTEXT_BGP_PARENTMETADATA} from "@comunica/bus-query-operation";
import {ActionContext, IActorTest} from "@comunica/core";
import {EmptyIterator} from "asynciterator";
import {QuadTermName} from "rdf-terms";
import {Algebra} from "sparqlalgebrajs";

/**
 * A comunica BGP Membership Filter Query Operation Actor.
 * It will filter out patterns that are guaranteed to have no matches
 * based on any available approximate membership filters.
 */
export class ActorQueryOperationBgpMembershipFilter extends ActorQueryOperationTypedMediated<Algebra.Bgp> {

  public readonly subjectUri: string;
  public readonly predicateUri: string;
  public readonly objectUri: string;
  public readonly graphUri?: string;
  public readonly minimumTotalItemsPatternsFactor: number;

  public readonly termUriMapper: {[termUri: string]: QuadTermName};

  constructor(args: IActorQueryOperationBgpMembershipFilterArgs) {
    super(args, 'bgp');
    this.termUriMapper = {
      [this.subjectUri]: 'subject',
      [this.predicateUri]: 'predicate',
      [this.objectUri]: 'object',
      [this.graphUri]: 'graph',
    };
  }

  public async testOperation(pattern: Algebra.Bgp, context: ActionContext): Promise<IActorTest> {
    if (!context || !context.has(KEY_CONTEXT_BGP_CURRENTMETADATA)) {
      throw new Error(`Actor ${this.name} requires a context with an entry ${KEY_CONTEXT_BGP_CURRENTMETADATA}.`);
    }
    const currentMetadata: any = context.get(KEY_CONTEXT_BGP_CURRENTMETADATA);
    if (currentMetadata.totalItems
      && currentMetadata.totalItems <= pattern.patterns.length * this.minimumTotalItemsPatternsFactor) {
      throw new Error(`Actor ${this.name} is skipped because the total count is too low.`);
    }
    if (!context.has(KEY_CONTEXT_BGP_PARENTMETADATA)) {
      throw new Error(`Actor ${this.name} requires a context with an entry ${KEY_CONTEXT_BGP_PARENTMETADATA}.`);
    }
    const metadatas: any[] = context.get(KEY_CONTEXT_BGP_PARENTMETADATA);
    if (!metadatas || !metadatas.length || !metadatas.some(
      (metadata) => metadata.approximateMembershipFilters && metadata.approximateMembershipFilters.length)) {
      throw new Error(`Actor ${this.name} requires approximate membership filter metadata.`);
    }
    return true;
  }

  public async runOperation(pattern: Algebra.Bgp, context: ActionContext)
    : Promise<IActorQueryOperationOutput> {
    try {
      const metadatas: any[] = context.get(KEY_CONTEXT_BGP_PARENTMETADATA);
      // We parallelize filtering for each pattern, as lazy filters may require expensive HTTP requests.
      await Promise.all(pattern.patterns.map(async (triplePattern: Algebra.Pattern, i: number) => {
        const metadata = metadatas[i];
        if (metadata && metadata.approximateMembershipFilters && metadata.approximateMembershipFilters.length) {
          for (const { filter, variable } of metadata.approximateMembershipFilters) {
            const term = triplePattern[this.termUriMapper[variable]];
            if (term.termType !== 'Variable' && !await filter.filter(term, context)) {
              const error = new Error('`True negative for BGP AMF`');
              (<any> error).triplePattern = triplePattern;
              throw error;
            }
          }
        }
      }));
    } catch (e) {
      this.logInfo(context, e.message, { triplePattern: e.triplePattern });
      return <IActorQueryOperationOutputBindings> {
        bindingsStream: new EmptyIterator(),
        metadata: () => Promise.resolve({ totalItems: 0 }),
        type: 'bindings',
        variables: [],
      };
    }

    // Fallback to next BGP actor if all filters (approximately) passed.
    // In this case, the pattern *may* have results.
    context = context.delete(KEY_CONTEXT_BGP_CURRENTMETADATA).delete(KEY_CONTEXT_BGP_PARENTMETADATA);
    return await this.mediatorQueryOperation.mediate({ operation: pattern, context });
  }

}

export interface IActorQueryOperationBgpMembershipFilterArgs extends IActorQueryOperationTypedMediatedArgs {
  subjectUri: string;
  predicateUri: string;
  objectUri: string;
  graphUri?: string;
  minimumTotalItemsPatternsFactor: number;
}

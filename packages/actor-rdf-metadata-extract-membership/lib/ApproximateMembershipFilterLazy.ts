import type { IActionRdfDereference, IActorRdfDereferenceOutput } from '@comunica/bus-rdf-dereference';
import type { IApproximateMembershipFilter, IActionRdfMembershipFilter,
  IActorRdfMembershipFilterOutput } from '@comunica/bus-rdf-membership-filter';

import type { ActionContext, Actor, IActorTest, Mediator } from '@comunica/core';
import type * as RDF from 'rdf-js';
import { ActorRdfMetadataExtractMembership } from './ActorRdfMetadataExtractMembership';

/**
 * An approximate membership filter that will (lazily) fetch
 * the remote filter's declaration and instantiate a function for it.
 */
export class ApproximateMembershipFilterLazy implements IApproximateMembershipFilter {
  private readonly filterUri: string;
  private readonly mediatorRdfMembership: Mediator<Actor<IActionRdfMembershipFilter, IActorTest,
  IActorRdfMembershipFilterOutput>, IActionRdfMembershipFilter, IActorTest, IActorRdfMembershipFilterOutput>;

  private readonly mediatorRdfDereference: Mediator<Actor<IActionRdfDereference, IActorTest,
  IActorRdfDereferenceOutput>, IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>;

  private filterInstance?: Promise<IApproximateMembershipFilter>;

  public constructor(filterUri: string, mediatorRdfMembership: Mediator<Actor<IActionRdfMembershipFilter, IActorTest,
  IActorRdfMembershipFilterOutput>, IActionRdfMembershipFilter, IActorTest,
  IActorRdfMembershipFilterOutput>,
  mediatorRdfDereference: Mediator<Actor<IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>,
  IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>) {
    this.filterUri = filterUri;
    this.mediatorRdfMembership = mediatorRdfMembership;
    this.mediatorRdfDereference = mediatorRdfDereference;

    this.filterInstance = undefined;
  }

  public async filter(term: RDF.Term, context: ActionContext): Promise<boolean> {
    return (await this.prefetch(context)).filter(term, context);
  }

  public prefetch(context: ActionContext): Promise<IApproximateMembershipFilter> {
    if (!this.filterInstance) {
      this.filterInstance = new Promise<IApproximateMembershipFilter>(async(resolve, reject) => {
        const { quads } = await this.mediatorRdfDereference.mediate({ url: this.filterUri, context });
        const filterProps: any = {};
        const filters = { [this.filterUri]: filterProps };
        await ActorRdfMetadataExtractMembership.detectMembershipProperties(quads, filters);
        if (filterProps[ActorRdfMetadataExtractMembership.RDF_TYPE]) {
          try {
            const { filter } = await this.mediatorRdfMembership
              .mediate({ typeUri: filterProps[ActorRdfMetadataExtractMembership.RDF_TYPE], properties: filterProps });
            resolve(filter);
          } catch (error: unknown) {
            reject(error);
          }
        } else {
          reject(new Error(`Could not find a valid membership filter type for ${this.filterUri}`));
        }
      });
    }

    return this.filterInstance;
  }
}

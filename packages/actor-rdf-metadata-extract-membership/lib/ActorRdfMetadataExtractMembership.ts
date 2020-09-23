import type { IActionRdfDereference, IActorRdfDereferenceOutput } from '@comunica/bus-rdf-dereference';
import type { IApproximateMembershipFilter, IActionRdfMembershipFilter,
  IActorRdfMembershipFilterOutput } from '@comunica/bus-rdf-membership-filter';
import type { IActionRdfMetadataExtract,
  IActorRdfMetadataExtractOutput } from '@comunica/bus-rdf-metadata-extract';
import { ActorRdfMetadataExtract } from '@comunica/bus-rdf-metadata-extract';
import type { Actor, IActorArgs, IActorTest, Mediator } from '@comunica/core';
import type * as RDF from 'rdf-js';
import { termToString } from 'rdf-string';
import { ApproximateMembershipFilterLazy } from './ApproximateMembershipFilterLazy';

/**
 * A comunica Membership RDF Metadata Extract Actor.
 */
export class ActorRdfMetadataExtractMembership extends ActorRdfMetadataExtract {
  public static readonly RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
  public static readonly MEM: string = 'http://semweb.mmlab.be/ns/membership#';
  public static readonly MEM_LINK: string = `${ActorRdfMetadataExtractMembership.MEM}membershipFilter`;
  public static readonly MEM_VARIABLE: string = `${ActorRdfMetadataExtractMembership.MEM}variable`;

  public readonly mediatorRdfMembership: Mediator<Actor<IActionRdfMembershipFilter, IActorTest,
  IActorRdfMembershipFilterOutput>, IActionRdfMembershipFilter, IActorTest, IActorRdfMembershipFilterOutput>;

  public readonly mediatorRdfDereference: Mediator<Actor<IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>,
  IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>;

  public constructor(args: IActorRdfMetadataExtractMembershipArgs) {
    super(args);
  }

  /**
   * Collect all membership properties from a given metadata stream
   * in a nice convenient nested hash (filter ID / property / value).
   * @param {RDF.Stream} metadata The incoming metadata stream.
   * @param {{[p: string]: {[p: string]: string}}} filters The filters data object.
   * @return The collected membership properties.
   */
  public static detectMembershipProperties(metadata: RDF.Stream,
    filters: {[filterId: string]: {[property: string]: string}}): Promise<void> {
    return new Promise((resolve, reject) => {
      metadata.on('error', reject);
      metadata.on('data', (quad: RDF.Quad) => {
        if (quad.predicate.value === ActorRdfMetadataExtractMembership.MEM_LINK) {
          filters[termToString(quad.object)] = { pageUrl: quad.subject.value };
        } else if (filters[termToString(quad.subject)]) {
          const filter = filters[termToString(quad.subject)];
          filter[quad.predicate.value] = quad.object.value;
        }
      });

      metadata.on('end', () => resolve());
    });
  }

  /**
   * Remove all membership filter metadata that is not applicable to the current page.
   * @param {string} pageUrl The current page URL.
   * @param {{[p: string]: {[p: string]: string}}} filters The filters data object.
   */
  public filterPageMembershipFilters(
    pageUrl: string,
    filters: {[filterId: string]: {[property: string]: string}},
  ): void {
    for (const filterId in filters) {
      if (filters[filterId].pageUrl !== pageUrl) {
        delete filters[filterId];
      }
    }
  }

  /**
   * Create filters for all given filter properties.
   * @param {{[p: string]: {[p: string]: string}}} filters The filters data object.
   * @return {Promise<IApproximateMembershipHolder[]>} A promise resolving to an array of membership functions.
   */
  public async initializeFilters(
    filters: {[filterId: string]: {[property: string]: string}},
  ): Promise<IApproximateMembershipHolder[]> {
    const filterInstances: IApproximateMembershipHolder[] = [];
    for (const filterId in filters) {
      const filterProps = filters[filterId];
      if (filterProps[ActorRdfMetadataExtractMembership.MEM_VARIABLE]) {
        if (filterProps[ActorRdfMetadataExtractMembership.RDF_TYPE]) {
          // We have all required properties, instantiate
          const { filter } = await this.mediatorRdfMembership
            .mediate({ typeUri: filterProps[ActorRdfMetadataExtractMembership.RDF_TYPE], properties: filterProps });
          filterInstances.push({ filter, variable: filterProps[ActorRdfMetadataExtractMembership.MEM_VARIABLE] });
        } else {
          // We don't have all required properties yet, so we have to dereference filterId
          const filter = new ApproximateMembershipFilterLazy(filterId,
            this.mediatorRdfMembership,
            this.mediatorRdfDereference);
          filterInstances.push({ filter, variable: filterProps[ActorRdfMetadataExtractMembership.MEM_VARIABLE] });
        }
      }
    }
    return filterInstances;
  }

  public async test(action: IActionRdfMetadataExtract): Promise<IActorTest> {
    return true;
  }

  public async run(action: IActionRdfMetadataExtract): Promise<IActorRdfMetadataExtractOutput> {
    const metadata: {[id: string]: any} = {};
    const membershipProperties = {};
    await ActorRdfMetadataExtractMembership.detectMembershipProperties(action.metadata, membershipProperties);
    this.filterPageMembershipFilters(action.url, membershipProperties);
    metadata.approximateMembershipFilters = await this.initializeFilters(membershipProperties);
    return { metadata };
  }
}

export interface IActorRdfMetadataExtractMembershipArgs
  extends IActorArgs<IActionRdfMetadataExtract, IActorTest, IActorRdfMetadataExtractOutput> {
  mediatorRdfMembership: Mediator<Actor<IActionRdfMembershipFilter, IActorTest,
  IActorRdfMembershipFilterOutput>, IActionRdfMembershipFilter, IActorTest, IActorRdfMembershipFilterOutput>;
  mediatorRdfDereference: Mediator<Actor<IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>,
  IActionRdfDereference, IActorTest, IActorRdfDereferenceOutput>;
}

export interface IApproximateMembershipHolder {
  /**
   * The variable the filter applies to.
   */
  variable: string;
  /**
   * The filter instance.
   */
  filter: IApproximateMembershipFilter;
}

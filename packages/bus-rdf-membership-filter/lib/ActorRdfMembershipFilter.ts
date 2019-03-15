import {ActionContext, Actor, IAction, IActorArgs, IActorOutput, IActorTest} from "@comunica/core";
import * as RDF from "rdf-js";

/**
 * A comunica actor for rdf-membership-filter events.
 *
 * Actor types:
 * * Input:  IActionRdfMembershipFilter:      Creates a membership filter of the given type and properties.
 * * Test:   <none>
 * * Output: IActorRdfMembershipFilterOutput: The created filter.
 *
 * @see IActionRdfMembershipFilter
 * @see IActorRdfMembershipFilterOutput
 */
export abstract class ActorRdfMembershipFilter
  extends Actor<IActionRdfMembershipFilter, IActorTest, IActorRdfMembershipFilterOutput> {

  constructor(args: IActorArgs<IActionRdfMembershipFilter, IActorTest, IActorRdfMembershipFilterOutput>) {
    super(args);
  }

}

export interface IActionRdfMembershipFilter extends IAction {
  /**
   * A URI identifying the type of filter to create.
   */
  typeUri: string;
  /**
   * The properties of the filter to create.
   */
  properties: {[propertyUri: string]: string};
}

export interface IActorRdfMembershipFilterOutput extends IActorOutput {
  /**
   * The created filter.
   */
  filter: IApproximateMembershipFilter;
}

/**
 * A filter that can test approximate memberships.
 */
export interface IApproximateMembershipFilter {
  /**
   * An approximate filter function.
   * @param {Term} term An RDF Term.
   * @param {ActionContext} context The action context.
   * @return {boolean} True if the term is probably in the dataset, false if the term is definitely not in the dataset.
   */
  filter(term: RDF.Term, context: ActionContext): Promise<boolean>;

  /**
   * Calling this method will make sure that this filter will become fully loaded.
   * This is useful when the filter is lazily constructed.
   * @param {ActionContext} context The action context.
   * @return {Promise<void>} A promise resolving when the filter has been fully loaded.
   */
  prefetch?(context: ActionContext): Promise<any>;
}

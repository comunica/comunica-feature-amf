import type { IActorArgs, IActorTest } from '@comunica/core';
import type { IActionRdfMembershipFilter,
  IActorRdfMembershipFilterOutput } from './ActorRdfMembershipFilter';
import {
  ActorRdfMembershipFilter,
} from './ActorRdfMembershipFilter';

/**
 * A base implementation for membership filter actors for a specific type.
 */
export abstract class ActorRdfMembershipFilterTyped extends ActorRdfMembershipFilter {
  private readonly typeUri: string;

  public constructor(args: IActorRdfMembershipFilterTypedArgs) {
    super(args);
    if (!args.typeUri) {
      throw new Error('A valid "typeUri" argument must be provided.');
    }
  }

  public async test(action: IActionRdfMembershipFilter): Promise<IActorTest> {
    if (!action.typeUri) {
      throw new Error(`Missing field 'typeUri' in the membership filter action: ${require('util').inspect(action)}`);
    }
    if (action.typeUri !== this.typeUri) {
      throw new Error(`Actor ${this.name} only supports ${this.typeUri} membership filter actions, but got ${
        action.typeUri}`);
    }
    return true;
  }
}

export interface IActorRdfMembershipFilterTypedArgs
  extends IActorArgs<IActionRdfMembershipFilter, IActorTest, IActorRdfMembershipFilterOutput> {
  typeUri: string;
}

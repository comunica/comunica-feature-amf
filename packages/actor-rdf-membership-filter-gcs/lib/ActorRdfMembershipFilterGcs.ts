import {ActorRdfMembershipFilterTyped, IActionRdfMembershipFilter,
  IActorRdfMembershipFilterOutput, IActorRdfMembershipFilterTypedArgs} from "@comunica/bus-rdf-membership-filter";
import {IActorTest} from "@comunica/core";
import {ApproximateMembershipFilterGcs} from "./ApproximateMembershipFilterGcs";

/**
 * A comunica GCS RDF Membership Filter Actor.
 */
export class ActorRdfMembershipFilterGcs extends ActorRdfMembershipFilterTyped {

  public static readonly MEM: string = 'http://semweb.mmlab.be/ns/membership#';
  public static readonly MEM_FILTER: string = ActorRdfMembershipFilterGcs.MEM + 'filter';

  constructor(args: IActorRdfMembershipFilterTypedArgs) {
    super(args);
  }

  public async test(action: IActionRdfMembershipFilter): Promise<IActorTest> {
    await super.test(action);
    if (!(ActorRdfMembershipFilterGcs.MEM_FILTER in action.properties)) {
      throw new Error('Missing membership filter filter param in a GCS filter action: '
        + require('util').inspect(action));
    }
    return true;
  }

  public async run(action: IActionRdfMembershipFilter): Promise<IActorRdfMembershipFilterOutput> {
    const filter = Buffer.from(action.properties[ActorRdfMembershipFilterGcs.MEM_FILTER], 'base64');
    return { filter: new ApproximateMembershipFilterGcs(filter) };
  }

}

import {ActorRdfMembershipFilterTyped, IActionRdfMembershipFilter,
  IActorRdfMembershipFilterOutput, IActorRdfMembershipFilterTypedArgs} from "@comunica/bus-rdf-membership-filter";
import {IActorTest} from "@comunica/core";
import {ApproximateMembershipFilterBloom} from "./ApproximateMembershipFilterBloom";

/**
 * A comunica Bloom RDF Membership Filter Actor.
 */
export class ActorRdfMembershipFilterBloom extends ActorRdfMembershipFilterTyped {

  public static readonly MEM: string = 'http://semweb.mmlab.be/ns/membership#';
  public static readonly MEM_FILTER: string = ActorRdfMembershipFilterBloom.MEM + 'filter';
  public static readonly MEM_HASHES: string = ActorRdfMembershipFilterBloom.MEM + 'hashes';
  public static readonly MEM_BITS: string = ActorRdfMembershipFilterBloom.MEM + 'bits';

  constructor(args: IActorRdfMembershipFilterTypedArgs) {
    super(args);
  }

  public async test(action: IActionRdfMembershipFilter): Promise<IActorTest> {
    await super.test(action);
    if (!(ActorRdfMembershipFilterBloom.MEM_FILTER in action.properties)) {
      throw new Error('Missing membership filter filter param in a bloom filter action: '
        + require('util').inspect(action));
    }
    if (!(ActorRdfMembershipFilterBloom.MEM_HASHES in action.properties)) {
      throw new Error('Missing membership filter hashes param in a bloom filter action: '
        + require('util').inspect(action));
    }
    if (!(ActorRdfMembershipFilterBloom.MEM_BITS in action.properties)) {
      throw new Error('Missing membership filter bits param in a bloom filter action: '
        + require('util').inspect(action));
    }
    return true;
  }

  public async run(action: IActionRdfMembershipFilter): Promise<IActorRdfMembershipFilterOutput> {
    const bits = parseInt(action.properties[ActorRdfMembershipFilterBloom.MEM_BITS], 10);
    const hashes = parseInt(action.properties[ActorRdfMembershipFilterBloom.MEM_HASHES], 10);
    const filter = Buffer.from(action.properties[ActorRdfMembershipFilterBloom.MEM_FILTER], 'base64');
    return { filter: new ApproximateMembershipFilterBloom(bits, hashes, filter) };
  }

}

import {IApproximateMembershipFilter} from "@comunica/bus-rdf-membership-filter";
import {v3 as hash} from "murmurhash";
import * as RDF from "rdf-js";
import {termToString} from "rdf-string";

/**
 * An approximate membership filter that is backed by a GCS filter.
 */
export class ApproximateMembershipFilterGcs implements IApproximateMembershipFilter {

  private readonly gcsFilter: any;

  constructor(buffer: Buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; i++) {
      view[i] = buffer[i];
    }
    this.gcsFilter = new (require('golombcodedsets').GCSQuery)(arrayBuffer, hash);
  }

  public async filter(term: RDF.Term): Promise<boolean> {
    const stringTerm = termToString(term);
    return stringTerm && this.gcsFilter.query(stringTerm);
  }

}

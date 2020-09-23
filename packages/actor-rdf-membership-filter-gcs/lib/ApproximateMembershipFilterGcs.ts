import type { IApproximateMembershipFilter } from '@comunica/bus-rdf-membership-filter';
import { v3 as hash } from 'murmurhash';
import type * as RDF from 'rdf-js';
import { termToString } from 'rdf-string';

/**
 * An approximate membership filter that is backed by a GCS filter.
 */
export class ApproximateMembershipFilterGcs implements IApproximateMembershipFilter {
  private readonly gcsFilter: any;

  public constructor(buffer: Buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (const [ i, element ] of buffer.entries()) {
      view[i] = element;
    }
    this.gcsFilter = new (require('golombcodedsets').GCSQuery)(arrayBuffer, hash);
  }

  public async filter(term: RDF.Term): Promise<boolean> {
    const stringTerm = termToString(term);
    return stringTerm && this.gcsFilter.query(stringTerm);
  }
}

import type { IApproximateMembershipFilter } from '@comunica/bus-rdf-membership-filter';
import { Bloem } from 'bloem';
import type * as RDF from 'rdf-js';
import { termToString } from 'rdf-string';

/**
 * An approximate membership filter that is backed by a Bloom filter.
 */
export class ApproximateMembershipFilterBloom implements IApproximateMembershipFilter {
  private readonly bloomFilter: Bloem;

  public constructor(bits: number, hashes: number, filter: Buffer) {
    this.bloomFilter = new Bloem(bits, hashes, filter);
  }

  public async filter(term: RDF.Term): Promise<boolean> {
    const stringTerm = termToString(term);
    return Boolean(stringTerm) && this.bloomFilter.has(Buffer.from(stringTerm));
  }
}

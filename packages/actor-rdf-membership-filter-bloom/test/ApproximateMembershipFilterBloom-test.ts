import { namedNode } from '@rdfjs/data-model';

import { ApproximateMembershipFilterBloom } from '../lib/ApproximateMembershipFilterBloom';

describe('ActorRdfMembershipFilterBloom', () => {
  let filter: any;

  beforeEach(() => {
    const encodedFilter = `tgPrhQp36wDadpZyrO0CXVrAQH7g9g3wLa9WLlgPLsH+CKi8Bqy3eGdLsnyKGc4O66pK/AHGbIIYOGLpgWJbhEab7BQWG0UDZiSgAwjMVhMPDsRvDvQhFEFaQB2GttYn6OlRKSAG7T8PgWeeCNGcZ3WdPhgjDRSH62UcY5+wFPbm95nRoS+Y0ii8UEhmmNLdT8He2vgw+k+cEB12/JSb5kR5K7FKi153EwONAnEN8Xn9XU2TlMVQ1DEfBQ0cVSFtoMC8BUErHoBOsQ4mLPECmahSHyVTBypA8Rw9HhZw6wGhacTynhScPXY5SudBs/NcfFw6Nk8BriCAZxywnB40745vyANvbwwEqj50AoCZIw9LhaUaAZGjiAxLIUML2aaDI6rc3lo9vszwahFxwUja4oA+iTwFISEB1UpmAFa2D6c215Hdb5BAPvGZImd7mTtv8lQUCfmiDZVI4KF+8sMZ9kIrg8izieI3mziHh5q3YuigWxBoQg4R1wbJ4quZHTh435wdR6NnvVg1fjjXCSiKI172jqk2mkPCHBEjB0JbifxrVJh8SbbOUg7dWR1yxoIB`;
    filter = new ApproximateMembershipFilterBloom(3451, 10, Buffer.from(encodedFilter, 'base64'));
  });

  it('should return false for a non-term', async() => {
    expect(await filter.filter({})).toBeFalsy();
  });

  it('should return false for a non-contained term', async() => {
    expect(await filter.filter(namedNode('http://db.uwaterloo.ca/~galuc/wsdbm/CityNONE'))).toBeFalsy();
  });

  it('should return true for contained terms', async() => {
    expect(await filter.filter(namedNode('http://db.uwaterloo.ca/~galuc/wsdbm/City0'))).toBeTruthy();
    expect(await filter.filter(namedNode('http://db.uwaterloo.ca/~galuc/wsdbm/City1'))).toBeTruthy();
    expect(await filter.filter(namedNode('http://db.uwaterloo.ca/~galuc/wsdbm/City100'))).toBeTruthy();
  });
});

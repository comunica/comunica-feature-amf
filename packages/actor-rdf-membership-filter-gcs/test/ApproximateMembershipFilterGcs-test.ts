import {namedNode} from "@rdfjs/data-model";
import {ActorRdfMembershipFilterGcs} from "../lib/ActorRdfMembershipFilterGcs";
import {ApproximateMembershipFilterGcs} from "../lib/ApproximateMembershipFilterGcs";

describe('ActorRdfMembershipFilterGcs', () => {
  let filter;

  beforeEach(() => {
    // tslint:disable-next-line:max-line-length
    const encodedFilter = 'AAAA8AAABACC9wCpa7LHBhg3WEKmY6otBJ0p7iFgYhpbNfwEiXkFS/DJz91V2NOzf7hFLp8VELi4XeBodHXu1sKUVjhIc3oxNvmCxpDCJwkhRExyehJcVbUthWa6ADk7AsaWD8RbNTsJ5Ny03B3BCaBv0wv+2YSnmH1fgQq5hZjqlKdEqw/BqSUTb/OopeOecoQQJQ15vXlMGi0o9rHMiMZZBMpyA3RiG54j7Na6/4bVQmxdgJtMUOL7nsQkCy5OhXgUCaDN2+gckBvQPDPDIauIolbDikmSDKhvcitELjIkZbCC0oGROE8GhXr7nvmQP4g0VGY0O3BcSem4lI363x/GbYBadPE5J6ZOhXjkNuCEpsF4JybQ0YBS1OMLoNQltmiezOGyBVkkdQHUkJHQ/5gQbM+husFYMJ+1BnMsYjQ4x1h7maCV4RQ9h0L+vVLseq2YKnKrZsW/DKuhlybOVizQ';
    filter = new ApproximateMembershipFilterGcs(Buffer.from(encodedFilter, 'base64'));
  });

  it('should return false for a non-term', async () => {
    expect(await filter.filter({})).toBeFalsy();
  });

  it('should return false for a non-contained term', async () => {
    expect(await filter.filter(namedNode('http://db.uwaterloo.ca/~galuc/wsdbm/CityNONE'))).toBeFalsy();
  });

  it('should return true for contained terms', async () => {
    expect(await filter.filter(namedNode('http://db.uwaterloo.ca/~galuc/wsdbm/City0'))).toBeTruthy();
    expect(await filter.filter(namedNode('http://db.uwaterloo.ca/~galuc/wsdbm/City1'))).toBeTruthy();
    expect(await filter.filter(namedNode('http://db.uwaterloo.ca/~galuc/wsdbm/City100'))).toBeTruthy();
  });

});

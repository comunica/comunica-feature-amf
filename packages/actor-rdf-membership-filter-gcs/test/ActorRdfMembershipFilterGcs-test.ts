import { ActorRdfMembershipFilter } from '@comunica/bus-rdf-membership-filter';
import { Bus } from '@comunica/core';
import { ActorRdfMembershipFilterGcs } from '../lib/ActorRdfMembershipFilterGcs';
import { ApproximateMembershipFilterGcs } from '../lib/ApproximateMembershipFilterGcs';

describe('ActorRdfMembershipFilterGcs', () => {
  let bus: any;
  let typeUri: any;
  let properties: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
    typeUri = 'BLOOM';
    properties = {
      'http://semweb.mmlab.be/ns/membership#filter': 'AAAA8AAABACC9wCpa7LHBhg3WEKmY6otBJ0p7iFgYhpbNfwE',
    };
  });

  describe('The ActorRdfMembershipFilterGcs module', () => {
    it('should be a function', () => {
      expect(ActorRdfMembershipFilterGcs).toBeInstanceOf(Function);
    });

    it('should be a ActorRdfMembershipFilterGcs constructor', () => {
      expect(new (<any> ActorRdfMembershipFilterGcs)({ name: 'actor', bus, typeUri }))
        .toBeInstanceOf(ActorRdfMembershipFilterGcs);
      expect(new (<any> ActorRdfMembershipFilterGcs)({ name: 'actor', bus, typeUri }))
        .toBeInstanceOf(ActorRdfMembershipFilter);
    });

    it('should not be able to create new ActorRdfMembershipFilterGcs objects without \'new\'', () => {
      expect(() => { (<any> ActorRdfMembershipFilterGcs)(); }).toThrow();
    });

    it('should not be able to create new ActorRdfMembershipFilterGcs objects without typeUri', () => {
      expect(() => { new ActorRdfMembershipFilterGcs(<any> { name: 'actor', bus }); }).toThrow();
    });
  });

  describe('An ActorRdfMembershipFilterGcs instance', () => {
    let actor: ActorRdfMembershipFilterGcs;

    beforeEach(() => {
      actor = new ActorRdfMembershipFilterGcs({ name: 'actor', bus, typeUri });
    });

    it('should test', () => {
      return expect(actor.test({ typeUri, properties })).resolves.toBeTruthy();
    });

    it('should not test on missing typeUri', () => {
      return expect(actor.test(<any> { properties })).rejects.toBeTruthy();
    });

    it('should not test on a different typeUri', () => {
      return expect(actor.test({ typeUri: 'bla', properties })).rejects.toBeTruthy();
    });

    it('should not test on missing properties', () => {
      return expect(actor.test(<any> { typeUri })).rejects.toBeTruthy();
    });

    it('should not test on missing filter property', () => {
      return expect(actor.test(<any> {
        properties: {},
        typeUri,
      })).rejects.toBeTruthy();
    });

    it('should run', async() => {
      const filter = (await actor.run({ typeUri, properties })).filter;
      expect(filter).toBeInstanceOf(ApproximateMembershipFilterGcs);
    });
  });
});

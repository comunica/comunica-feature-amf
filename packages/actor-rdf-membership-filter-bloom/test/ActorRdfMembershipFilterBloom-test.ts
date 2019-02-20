import {ActorRdfMembershipFilter} from "@comunica/bus-rdf-membership-filter";
import {Bus} from "@comunica/core";
import {ActorRdfMembershipFilterBloom} from "../lib/ActorRdfMembershipFilterBloom";
import {ApproximateMembershipFilterBloom} from "../lib/ApproximateMembershipFilterBloom";

describe('ActorRdfMembershipFilterBloom', () => {
  let bus;
  let typeUri;
  let properties;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
    typeUri = 'BLOOM';
    properties = {
      'http://semweb.mmlab.be/ns/membership#bits': '3451',
      'http://semweb.mmlab.be/ns/membership#filter': 'F',
      'http://semweb.mmlab.be/ns/membership#hashes': '10',
    };
  });

  describe('The ActorRdfMembershipFilterBloom module', () => {
    it('should be a function', () => {
      expect(ActorRdfMembershipFilterBloom).toBeInstanceOf(Function);
    });

    it('should be a ActorRdfMembershipFilterBloom constructor', () => {
      expect(new (<any> ActorRdfMembershipFilterBloom)({ name: 'actor', bus, typeUri }))
        .toBeInstanceOf(ActorRdfMembershipFilterBloom);
      expect(new (<any> ActorRdfMembershipFilterBloom)({ name: 'actor', bus, typeUri }))
        .toBeInstanceOf(ActorRdfMembershipFilter);
    });

    it('should not be able to create new ActorRdfMembershipFilterBloom objects without \'new\'', () => {
      expect(() => { (<any> ActorRdfMembershipFilterBloom)(); }).toThrow();
    });

    it('should not be able to create new ActorRdfMembershipFilterBloom objects without typeUri', () => {
      expect(() => { new ActorRdfMembershipFilterBloom(<any> { name: 'actor', bus }); }).toThrow();
    });
  });

  describe('An ActorRdfMembershipFilterBloom instance', () => {
    let actor: ActorRdfMembershipFilterBloom;

    beforeEach(() => {
      actor = new ActorRdfMembershipFilterBloom({ name: 'actor', bus, typeUri });
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
        properties: {
          [ActorRdfMembershipFilterBloom.MEM_HASHES]: '10',
          [ActorRdfMembershipFilterBloom.MEM_BITS]: '10',
        },
        typeUri,
      })).rejects.toBeTruthy();
    });

    it('should not test on missing hashes property', () => {
      return expect(actor.test(<any> {
        properties: {
          [ActorRdfMembershipFilterBloom.MEM_FILTER]: '10',
          [ActorRdfMembershipFilterBloom.MEM_BITS]: '10',
        },
        typeUri,
      })).rejects.toBeTruthy();
    });

    it('should not test on missing bits property', () => {
      return expect(actor.test(<any> {
        properties: {
          [ActorRdfMembershipFilterBloom.MEM_HASHES]: '10',
          [ActorRdfMembershipFilterBloom.MEM_FILTER]: '10',
        },
        typeUri,
      })).rejects.toBeTruthy();
    });

    it('should run', async () => {
      const filter = (await actor.run({ typeUri, properties })).filter;
      return expect(filter).toBeInstanceOf(ApproximateMembershipFilterBloom);
    });
  });
});

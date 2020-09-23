import type { Readable } from 'stream';
import { ActorRdfMetadataExtract } from '@comunica/bus-rdf-metadata-extract';
import { Bus } from '@comunica/core';
import { ActorRdfMetadataExtractMembership } from '../lib/ActorRdfMetadataExtractMembership';
import { ApproximateMembershipFilterLazy } from '../lib/ApproximateMembershipFilterLazy';
const quad = require('rdf-quad');
const stream = require('streamify-array');

describe('ActorRdfMetadataExtractMembership', () => {
  let bus: any;

  beforeEach(() => {
    bus = new Bus({ name: 'bus' });
  });

  describe('The ActorRdfMetadataExtractMembership module', () => {
    it('should be a function', () => {
      expect(ActorRdfMetadataExtractMembership).toBeInstanceOf(Function);
    });

    it('should be a ActorRdfMetadataExtractMembership constructor', () => {
      expect(new (<any> ActorRdfMetadataExtractMembership)({ name: 'actor', bus }))
        .toBeInstanceOf(ActorRdfMetadataExtractMembership);
      expect(new (<any> ActorRdfMetadataExtractMembership)({ name: 'actor', bus }))
        .toBeInstanceOf(ActorRdfMetadataExtract);
    });

    it('should not be able to create new ActorRdfMetadataExtractMembership objects without \'new\'', () => {
      expect(() => { (<any> ActorRdfMetadataExtractMembership)(); }).toThrow();
    });
  });

  describe('An ActorRdfMetadataExtractMembership instance', () => {
    let actor: ActorRdfMetadataExtractMembership;
    let input: Readable;
    let inputNone: Readable;
    let inputLink: Readable;
    let inputLinkProps: Readable;
    let mediatorRdfMembership: any;
    let mediatorRdfDereference: any;

    beforeEach(() => {
      mediatorRdfMembership = {
        mediate: async({ typeUri, properties }: any) => ({ filter: { type: typeUri, ...properties }}),
      };
      mediatorRdfDereference = null;
      actor = new ActorRdfMetadataExtractMembership(
        { name: 'actor', bus, mediatorRdfMembership, mediatorRdfDereference },
      );
      input = stream([
        quad('s1', 'p1', 'o1', ''),
        quad('g1', 'py', '12345', ''),
        quad('s2', 'px', '5678', ''),
        quad('s3', 'p3', 'o3', ''),
      ]);
      inputNone = stream([
        quad('s1', 'p1', 'o1', ''),
      ]);
      inputLink = stream([
        quad(
          'http://ex.org/subject',
          'http://semweb.mmlab.be/ns/membership#membershipFilter',
          'http://ex.org/filter',
          '',
        ),
      ]);
      inputLinkProps = stream([
        quad('http://ex.org/subject', 'http://semweb.mmlab.be/ns/membership#membershipFilter', 'http://ex.org/filter'),
        quad('http://ex.org/filter', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://ex.org/type'),
        quad('http://ex.org/filter', 'http://semweb.mmlab.be/ns/membership#filter', '"abc"'),
        quad('http://ex.org/filter', 'http://semweb.mmlab.be/ns/membership#variable', 'http://ex.org/var'),
        quad('http://ex.org/filter', 'http://semweb.mmlab.be/ns/membership#hashes', '"1"'),
        quad('http://ex.org/filter', 'http://semweb.mmlab.be/ns/membership#bits', '"2"'),
        quad('http://ex.org/filter', 'http://ex.org/other', '"Other"'),
      ]);
    });

    describe('#detectMembershipProperties', () => {
      it('should detect nothing in an empty stream', async() => {
        const filters = {};
        await ActorRdfMetadataExtractMembership.detectMembershipProperties(inputNone, filters);
        expect(filters).toEqual({});
      });

      it('should detect nothing in a stream without membership metadata', async() => {
        const filters = {};
        await ActorRdfMetadataExtractMembership.detectMembershipProperties(input, filters);
        expect(filters).toEqual({});
      });

      it('should detect links', async() => {
        const filters = {};
        await ActorRdfMetadataExtractMembership.detectMembershipProperties(inputLink, filters);
        expect(filters).toEqual({ 'http://ex.org/filter': { pageUrl: 'http://ex.org/subject' }});
      });

      it('should detect links with properties', async() => {
        const filters = {};
        await ActorRdfMetadataExtractMembership.detectMembershipProperties(inputLinkProps, filters);
        expect(filters).toEqual({
          'http://ex.org/filter': {
            'http://ex.org/other': 'Other',
            'http://semweb.mmlab.be/ns/membership#bits': '2',
            'http://semweb.mmlab.be/ns/membership#filter': 'abc',
            'http://semweb.mmlab.be/ns/membership#hashes': '1',
            'http://semweb.mmlab.be/ns/membership#variable': 'http://ex.org/var',
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://ex.org/type',
            pageUrl: 'http://ex.org/subject',
          },
        });
      });
    });

    describe('#filterPageMembershipFilters', () => {
      it('should not change an empty object', async() => {
        const filters = {};
        actor.filterPageMembershipFilters('http://ex.org/page', filters);
        expect(filters).toEqual({});
      });

      it('should not filter out a filter with the pageUrl', async() => {
        const filters = {
          'http://ex.org/filter': {
            bits: '2',
            filter: 'abc',
            hashes: '1',
            pageUrl: 'http://ex.org/page',
            type: 'http://ex.org/type',
            variable: 'http://ex.org/var',
          },
        };
        actor.filterPageMembershipFilters('http://ex.org/page', filters);
        expect(filters).toEqual({
          'http://ex.org/filter': {
            bits: '2',
            filter: 'abc',
            hashes: '1',
            pageUrl: 'http://ex.org/page',
            type: 'http://ex.org/type',
            variable: 'http://ex.org/var',
          },
        });
      });

      it('should filter out filters with a different pageUrl', async() => {
        const filters = {
          'http://ex.org/filter1': {
            bits: '2',
            filter: 'abc',
            hashes: '1',
            pageUrl: 'http://ex.org/page',
            type: 'http://ex.org/type',
            variable: 'http://ex.org/var',
          },
          'http://ex.org/filter2': {
            bits: '2',
            filter: 'abc',
            hashes: '1',
            pageUrl: 'http://ex.org/pageOther',
            type: 'http://ex.org/type',
            variable: 'http://ex.org/var',
          },
          'http://ex.org/filter3': {
            bits: '2',
            filter: 'abc',
            hashes: '1',
            pageUrl: 'http://ex.org/pageOther',
            type: 'http://ex.org/type',
            variable: 'http://ex.org/var',
          },
        };
        actor.filterPageMembershipFilters('http://ex.org/page', filters);
        expect(filters).toEqual({
          'http://ex.org/filter1': {
            bits: '2',
            filter: 'abc',
            hashes: '1',
            pageUrl: 'http://ex.org/page',
            type: 'http://ex.org/type',
            variable: 'http://ex.org/var',
          },
        });
      });
    });

    describe('#initializeFilters', () => {
      it('should initialize nothing for an empty object', async() => {
        const filters = {};
        expect(await actor.initializeFilters(filters)).toEqual([]);
      });

      it('should ignore filters without variable', async() => {
        const filters = {
          'http://ex.org/filter1': {
            'http://semweb.mmlab.be/ns/membership#filter': 'abc',
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://ex.org/type',
          },
        };
        expect(await actor.initializeFilters(filters)).toEqual([]);
      });

      it('should initialize a filter by valid type', async() => {
        const filters = {
          'http://ex.org/filter1': {
            'http://semweb.mmlab.be/ns/membership#filter': 'abc',
            'http://semweb.mmlab.be/ns/membership#variable': 'http://ex.org/var',
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://ex.org/type',
          },
        };
        expect(await actor.initializeFilters(filters)).toEqual([
          {
            filter: {
              'http://semweb.mmlab.be/ns/membership#filter': 'abc',
              'http://semweb.mmlab.be/ns/membership#variable': 'http://ex.org/var',
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://ex.org/type',
              type: 'http://ex.org/type',
            },
            variable: 'http://ex.org/var',
          },
        ]);
      });

      it('should initialize a filter with missing type lazily', async() => {
        const filters = {
          'http://ex.org/filter1': {
            'http://semweb.mmlab.be/ns/membership#variable': 'http://ex.org/var',
          },
        };
        expect(await actor.initializeFilters(filters)).toEqual([
          {
            filter: new ApproximateMembershipFilterLazy('http://ex.org/filter1',
              mediatorRdfMembership,
              mediatorRdfDereference),
            variable: 'http://ex.org/var',
          },
        ]);
      });
    });

    it('should test', () => {
      return expect(actor.test({ url: '', metadata: input })).resolves.toBeTruthy();
    });

    it('should run', () => {
      return expect(actor.run({ url: '', metadata: input })).resolves
        .toEqual({ metadata: { approximateMembershipFilters: []}});
    });
  });
});

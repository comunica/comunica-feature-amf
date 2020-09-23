import { namedNode } from '@rdfjs/data-model';
import { ArrayIterator } from 'asynciterator';
import { ApproximateMembershipFilterLazy } from '../lib/ApproximateMembershipFilterLazy';
const quad = require('rdf-quad');

describe('ApproximateMembershipFilterLazy', () => {
  let filter: any;
  let mediatorRdfMembership: any;
  let mediatorRdfDereference: any;

  beforeEach(() => {
    mediatorRdfMembership = {
      async mediate({ typeUri, properties }: any) {
        if (typeUri === 'UNKNOWN') {
          throw new Error(`Unknown filter type ${typeUri}`);
        }
        return {
          filter: {
            filter: (term: any) => properties['http://semweb.mmlab.be/ns/membership#filter'] === term.value,
          },
        };
      },
    };
    mediatorRdfDereference = {
      mediate: jest.fn(async() => ({
        quads: new ArrayIterator([
          quad('http://ex.org/filter', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://ex.org/type'),
          quad('http://ex.org/filter', 'http://semweb.mmlab.be/ns/membership#filter', '"abc"'),
        ]),
      })),
    };
    filter = new ApproximateMembershipFilterLazy('http://ex.org/filter',
      mediatorRdfMembership,
      mediatorRdfDereference);
  });

  describe('instantiated', () => {
    it('should have an uninitialized filterInstance', () => {
      return expect(filter.filterInstance).toBe(undefined);
    });

    it('should initialize filterInstance when first calling #filter', async() => {
      expect(await filter.filter(namedNode('http://example.org/'))).toBe(false);
      expect(await filter.filter(namedNode('abc'))).toBe(true);
    });

    it('should not initialize filterInstance when calling #filter twice', async() => {
      expect(await filter.filter(namedNode('http://example.org/'))).toBe(false);
      expect(await filter.filter(namedNode('abc'))).toBe(true);

      expect(mediatorRdfDereference.mediate).toHaveBeenCalledTimes(1);
    });

    it('should error on missing types', async() => {
      mediatorRdfDereference = {
        mediate: async() => ({
          quads: new ArrayIterator([
            quad('http://ex.org/filter', 'http://semweb.mmlab.be/ns/membership#filter', '"abc"'),
          ]),
        }),
      };
      filter = new ApproximateMembershipFilterLazy('http://ex.org/filter',
        mediatorRdfMembership,
        mediatorRdfDereference);
      await expect(filter.filter(namedNode('http://example.org/'))).rejects
        .toEqual(new Error('Could not find a valid membership filter type for http://ex.org/filter'));
    });

    it('should error on unknown types', async() => {
      mediatorRdfDereference = {
        mediate: async() => ({
          quads: new ArrayIterator([
            quad('http://ex.org/filter', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'UNKNOWN'),
            quad('http://ex.org/filter', 'http://semweb.mmlab.be/ns/membership#filter', '"abc"'),
          ]),
        }),
      };
      filter = new ApproximateMembershipFilterLazy('http://ex.org/filter',
        mediatorRdfMembership,
        mediatorRdfDereference);
      await expect(filter.filter(namedNode('http://example.org/'))).rejects
        .toEqual(new Error('Unknown filter type UNKNOWN'));
    });
  });
});

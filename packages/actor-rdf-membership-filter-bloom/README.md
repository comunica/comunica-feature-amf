# Comunica Bloom RDF Membership Filter Actor

[![npm version](https://badge.fury.io/js/%40comunica%2Factor-rdf-membership-filter-bloom.svg)](https://www.npmjs.com/package/@comunica/actor-rdf-membership-filter-bloom)

An [RDF Membership Filter](https://github.com/comunica/comunica-feature-amf/tree/master/packages/bus-rdf-membership-filter) actor that
can create Bloom instances for filters with the `http://semweb.mmlab.be/ns/membership#BloomFilter` type.

This module is part of the [Comunica framework](https://github.com/comunica/comunica),
and should only be used by [developers that want to build their own query engine](https://comunica.dev/docs/modify/).

[Click here if you just want to query with Comunica](https://comunica.dev/docs/query/).

This module is part of the [Comunica framework](https://github.com/comunica/comunica).

## Install

```bash
$ yarn add @comunica/actor-rdf-membership-filter-bloom
```

## Configure

After installing, this package can be added to your engine's configuration as follows:
```text
{
  "@context": [
    ...
    "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-rdf-membership-filter-bloom/^1.0.0/components/context.jsonld"  
  ],
  "actors": [
    ...
    {
      "@id": "config-setsa:rdf-membership-filter.json#myBloomFilter",
      "@type": "ActorRdfMembershipFilterBloom"
    }
  ]
}
```

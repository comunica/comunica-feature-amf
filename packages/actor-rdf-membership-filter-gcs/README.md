# Comunica GCS RDF Membership Filter Actor

[![npm version](https://badge.fury.io/js/%40comunica%2Factor-rdf-membership-filter-gcs.svg)](https://www.npmjs.com/package/@comunica/actor-rdf-membership-filter-gcs)

An [RDF Membership Filter](https://github.com/comunica/comunica-feature-amf/tree/master/packages/bus-rdf-membership-filter) actor that
can create Golomb Coded Sets for filters with the `http://semweb.mmlab.be/ns/membership#GCSFilter` type.

This module is part of the [Comunica framework](https://github.com/comunica/comunica),
and should only be used by [developers that want to build their own query engine](https://comunica.dev/docs/modify/).

[Click here if you just want to query with Comunica](https://comunica.dev/docs/query/).

## Install

```bash
$ yarn add @comunica/actor-rdf-membership-filter-gcs
```

## Configure

After installing, this package can be added to your engine's configuration as follows:
```text
{
  "@context": [
    ...
    "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-rdf-membership-filter-gcs/^1.0.0/components/context.jsonld"  
  ],
  "actors": [
    ...
    {
      "@id": "config-setsa:rdf-membership-filter.json#myGcsFilter",
      "@type": "ActorRdfMembershipFilterGcs"
    }
  ]
}
```

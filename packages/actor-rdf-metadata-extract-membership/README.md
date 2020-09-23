# Comunica Membership RDF Metadata Extract Actor

[![npm version](https://badge.fury.io/js/%40comunica%2Factor-rdf-metadata-extract-membership.svg)](https://www.npmjs.com/package/@comunica/actor-rdf-metadata-extract-membership)

An [RDF Metadata Extract](https://github.com/comunica/comunica/tree/master/packages/bus-rdf-metadata-extract) actor that
extracts [Approximate Membership metadata](http://semweb.mmlab.be/ns/membership).

This module is part of the [Comunica framework](https://github.com/comunica/comunica),
and should only be used by [developers that want to build their own query engine](https://comunica.dev/docs/modify/).

[Click here if you just want to query with Comunica](https://comunica.dev/docs/query/).

## Install

```bash
$ yarn add @comunica/actor-rdf-metadata-extract-membership
```

## Metadata entries

This actor adds the following entries to the metadata object.

* `approximateMembershipFilters`: An array of [`IApproximateMembershipHolder`]'s, which are created using the [RDF Membership Filter bus](https://github.com/comunica/comunica-feature-amf/tree/master/packages/bus-rdf-membership-filter).

## Configure

After installing, this package can be added to your engine's configuration as follows:
```text
{
  "@context": [
    ...
    "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-rdf-metadata-extract-membership/^1.0.0/components/context.jsonld"  
  ],
  "actors": [
    ...
    {
      "@id": "config-setsa:rdf-membership-filter.json#myMembershipMetadataExtractor",
      "@type": "ActorRdfMetadataExtractMembership",
      "carmem:mediatorRdfMembership": {
        "@id": "config-setsa:rdf-membership-filter.json#mediatorRdfMembership",
        "@type": "MediatorRace",
        "cc:Mediator/bus": { "@id": "cbrmf:Bus/RdfMembershipFilter" }
      },
      "carmem:mediatorRdfDereference": {
        "@id": "config-setsa:rdf-membership-filter.json#mediatorRdfDereference",
        "@type": "MediatorRace",
        "cc:Mediator/bus": { "@id": "cbrd:Bus/RdfDereference" }
      }
    }
  ]
}
```

### Config Parameters

* `carmem:mediatorRdfMembership`: A mediator over the [RDF Membership Filter bus](https://github.com/comunica/comunica-feature-amf/tree/master/packages/bus-rdf-membership-filter).
* `carmem:mediatorRdfDereference`: A mediator over the [RDF Dereference bus](https://github.com/comunica/comunica/tree/master/packages/bus-rdf-dereference).


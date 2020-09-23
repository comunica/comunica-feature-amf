# Comunica BGP Membership Filter Combined Query Operation Actor

[![npm version](https://badge.fury.io/js/%40comunica%2Factor-query-operation-bgp-membership-filter-combined.svg)](https://www.npmjs.com/package/@comunica/actor-query-operation-bgp-membership-filter-combined)

A [Query Operation](https://github.com/comunica/comunica/tree/master/packages/bus-query-operation) actor that
handles [SPARQL triple/quad pattern](https://www.w3.org/TR/sparql11-query/#QSynTriples) operations
and filter out patterns that are guaranteed to have no matches based on all available approximate membership filters.

This module is part of the [Comunica framework](https://github.com/comunica/comunica),
and should only be used by [developers that want to build their own query engine](https://comunica.dev/docs/modify/).

[Click here if you just want to query with Comunica](https://comunica.dev/docs/query/).

## Install

```bash
$ yarn add @comunica/actor-query-operation-bgp-membership-filter-combined
```

## Configure

After installing, this package can be added to your engine's configuration as follows:
```text
{
  "@context": [
    ...
    "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-query-operation-bgp-membership-filter-combined/^1.0.0/components/context.jsonld"  
  ],
  "actors": [
    ...
    {
      "@id": "config-setsa:rdf-membership-filter.json#myBgpMembershipFilterOperatorCombined",
      "@type": "ActorQueryOperationBgpMembershipFilterCombined",
      "caqobmfc:Actor/QueryOperation/BgpMembershipFilter/plainRequestSize": 1000,
      "caqobmfc:Actor/QueryOperation/BgpMembershipFilter/amfTripleSize": 2,
      "cbqo:mediatorQueryOperation": { "@id": "config-setsa:rdf-membership-filter.json#mediatorQueryOperation" }
    }
  ]
}
```

### Config Parameters

* `cbqo:mediatorQueryOperation`: A mediator over the [Query Operation bus](https://github.com/comunica/comunica/tree/master/packages/bus-query-operation).
* `caqobmfc:Actor/QueryOperation/BgpMembershipFilter/plainRequestSize`: The estimated size in bytes of a membership request. Used for the application heuristic of this actor.
* `caqobmfc:Actor/QueryOperation/BgpMembershipFilter/amfTripleSize`: The esimated size in bytes of a triple in an AMF. Used for the application heuristic of this actor. Set to 0 to disable this heuristic.


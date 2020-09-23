# Comunica Quadpattern Membership Filter Query Operation Actor

[![npm version](https://badge.fury.io/js/%40comunica%2Factor-query-operation-quadpattern-membership-filter.svg)](https://www.npmjs.com/package/@comunica/actor-query-operation-quadpattern-membership-filter)

A [Query Operation](https://github.com/comunica/comunica/tree/master/packages/bus-query-operation) actor that
handles [SPARQL triple/quad pattern](https://www.w3.org/TR/sparql11-query/#QSynTriples) operations
and filter out fully materialized patterns that are guaranteed to have no matches based on any available approximate membership filters.

This module is part of the [Comunica framework](https://github.com/comunica/comunica),
and should only be used by [developers that want to build their own query engine](https://comunica.dev/docs/modify/).

[Click here if you just want to query with Comunica](https://comunica.dev/docs/query/).

This module is part of the [Comunica framework](https://github.com/comunica/comunica).

## Install

```bash
$ yarn add @comunica/actor-query-operation-quadpattern-membership-filter
```

## Configure

After installing, this package can be added to your engine's configuration as follows:
```text
{
  "@context": [
    ...
    "https://linkedsoftwaredependencies.org/bundles/npm/@comunica/actor-query-operation-quadpattern-membership-filter/^1.0.0/components/context.jsonld"  
  ],
  "actors": [
    ...
    {
      "@id": "config-setsa:rdf-membership-filter.json#myTripleMembershipFilterOperator",
      "@type": "ActorQueryOperationQuadpatternMembershipFilter",
      "cbqo:mediatorQueryOperation": {
        "@id": "config-setsa:rdf-membership-filter.json#mediatorQueryOperation",
        "@type": "MediatorNumberMin",
        "field": "httpRequests",
        "ignoreErrors": true,
        "cc:Mediator/bus": { "@id": "cbqo:Bus/QueryOperation" }
      }
    }
  ]
}
```

### Config Parameters

* `cbqo:mediatorQueryOperation`: A mediator over the [Query Operation bus](https://github.com/comunica/comunica/tree/master/packages/bus-query-operation).


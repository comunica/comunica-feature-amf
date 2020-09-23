# Comunica SPARQL AMF Init Actor

[![npm version](https://badge.fury.io/js/%40comunica%2Factor-init-sparql-amf.svg)](https://www.npmjs.com/package/@comunica/actor-init-sparql-amf)
[![Docker Pulls](https://img.shields.io/docker/pulls/comunica/actor-init-sparql-amf.svg)](https://hub.docker.com/r/comunica/actor-init-sparql-amf/)

Comunica SPARQL AMF is a SPARQL query engine for JavaScript that takes into account [approximate membership functions](https://comunica.github.io/Article-SSWS2020-AMF/).

This can be tested using [the `feature-handlers-amf-2` branch in the LDF Server](https://github.com/LinkedDataFragments/Server.js/tree/feature-handlers-amf-2).

This module is part of the [Comunica framework](https://comunica.dev/).

## Install

```bash
$ yarn add @comunica/actor-init-sparql-amf
```

or

```bash
$ npm install -g @comunica/actor-init-sparql-amf
```

## Usage

Show 100 triples from http://localhost:3000/dataset:

```bash
$ comunica-sparql-amf http://localhost:3000/dataset "CONSTRUCT WHERE { ?s ?p ?o } LIMIT 100"
```

Show the help with all options:

```bash
$ comunica-sparql-amf --help
```

Just like [Comunica SPARQL](https://github.com/comunica/comunica/tree/master/packages/actor-init-sparql),
a [dynamic variant](https://github.com/comunica/comunica/tree/master/packages/actor-init-sparql#usage-from-the-command-line) (`comunica-dynamic-sparql-link-traversal`) also exists.

_[**Read more** about querying from the command line](https://comunica.dev/docs/query/getting_started/query_cli/)._

### Usage within application

This engine can be used in JavaScript/TypeScript applications as follows:

```javascript
const newEngine = require('@comunica/actor-init-sparql-amf').newEngine;
const myEngine = newEngine();

const result = await myEngine.query(`
  SELECT * WHERE {
      ?s ?p ?o
  }`, {
  sources: ['http://localhost:3000/dataset'],
});

// Consume results as a stream (best performance)
result.bindingsStream.on('data', (binding) => {
    console.log(binding.get('?s').value);
    console.log(binding.get('?s').termType);

    console.log(binding.get('?p').value);

    console.log(binding.get('?o').value);
});

// Consume results as an array (easier)
const bindings = await result.bindings();
console.log(bindings[0].get('?s').value);
console.log(bindings[0].get('?s').termType);
```

_[**Read more** about querying an application](https://comunica.dev/docs/query/getting_started/query_app/)._

### Usage as a SPARQL endpoint

Start a webservice exposing http://localhost:3000/dataset via the SPARQL protocol, i.e., a _SPARQL endpoint_.

```bash
$ comunica-sparql-amf-http https://www.rubensworks.net/
```

Show the help with all options:

```bash
$ comunica-sparql-amf-http --help
```

The SPARQL endpoint can only be started dynamically.
An alternative config file can be passed via the `COMUNICA_CONFIG` environment variable.

Use `bin/http.js` when running in the Comunica monorepo development environment.

_[**Read more** about setting up a SPARQL endpoint](https://comunica.dev/docs/query/getting_started/setup_endpoint/)._


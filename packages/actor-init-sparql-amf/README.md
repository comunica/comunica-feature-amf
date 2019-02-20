# Comunica SPARQL AMF Init Actor

[![npm version](https://badge.fury.io/js/%40comunica%2Factor-init-sparql-amf.svg)](https://www.npmjs.com/package/@comunica/actor-init-sparql-amf)

A comunica SPARQL File Init Actor.

This module is part of the [Comunica framework](https://github.com/comunica/comunica).

## Install

```bash
$ yarn add @comunica/actor-init-sparql-file
```

## Usage

Show 100 triples from http://fragments.dbpedia.org/2015-10/en:

```bash
$ comunica-sparql-amf http://fragments.dbpedia.org/2015-10/en "CONSTRUCT WHERE { ?s ?p ?o } LIMIT 100"
```

Show the help with all options:

```bash
$ comunica-sparql-amf --help
```

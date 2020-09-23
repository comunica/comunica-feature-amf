<p align="center">
  <a href="https://comunica.dev/">
    <img alt="Comunica" src="https://comunica.dev/img/comunica_red.svg" width="200">
  </a>
</p>

<p align="center">
  <strong>Approximate Membership Functions for Comunica</strong>
</p>

<p align="center">
<a href="https://travis-ci.org/comunica/comunica-feature-amf"><img src="https://travis-ci.org/comunica/comunica-feature-amf.svg?branch=master" alt="Build Status"></a>
<a href="https://coveralls.io/github/comunica/comunica-feature-amf?branch=master"><img src="https://coveralls.io/repos/github/comunica/comunica-feature-amf/badge.svg?branch=master" alt="Coverage Status"></a>
<a href="https://gitter.im/comunica/Lobby"><img src="https://badges.gitter.im/comunica.png" alt="Gitter chat"></a>
</p>

**[Learn more about Comunica on our website](https://comunica.dev/).**

This is a monorepo that contains packages for allowing [Comunica](https://github.com/comunica/comunica) to handle [approximate membership functions](https://comunica.github.io/Article-SSWS2020-AMF/).
If you want to _use_ an AMF-enabled Comunica engine, have a look at [Comunica SPARQL AMF](https://github.com/comunica/comunica-feature-amf/tree/master/packages/actor-init-sparql-amf).

This can be tested using [the `feature-handlers-amf-2` branch in the LDF Server](https://github.com/LinkedDataFragments/Server.js/tree/feature-handlers-amf-2).

Concretely, this monorepo adds AMF support to Comunica using the following packages:
* [RDF Membership Filter Bus](https://github.com/comunica/comunica-feature-amf/tree/master/packages/bus-rdf-membership-filter): A bus for actors that can construct approximate membership filters.
* [Bloom RDF Membership Filter Actor](https://github.com/comunica/comunica-feature-amf/tree/master/packages/actor-rdf-membership-filter-bloom): An approximate membership filter actor for constructing Bloom filters.
* [GCS RDF Membership Filter Actor](https://github.com/comunica/comunica-feature-amf/tree/master/packages/actor-rdf-membership-filter-gcs): An approximate membership filter actor for constructing GCS filters.
* [Membership Metadata Extractor Actor](https://github.com/comunica/comunica-feature-amf/tree/master/packages/actor-rdf-metadata-extract-membership): An actor that extracts approximate membership filter metadata, and dynamically constructs membership filters.
* [AMF Quad Pattern Actor](https://github.com/comunica/comunica-feature-amf/tree/master/packages/actor-query-operation-quadpattern-membership-filter): An AMF-aware quad pattern actor.
* [AMF BGP Actor](https://github.com/comunica/comunica-feature-amf/tree/master/packages/actor-query-operation-bgp-membership-filter): An AMF-aware BGP actor that applies filters on separate patterns.
* [Combined AMF BGP Actor](https://github.com/comunica/comunica-feature-amf/tree/master/packages/actor-query-operation-bgp-membership-filter-combined): An AMF-aware BGP actor that combines filters and executes them on all relevant patterns to achieve a higher filtering yield.

## Development Setup

_(JSDoc: https://comunica.github.io/comunica-feature-amf/)_

This repository should be used by Comunica module **developers** as it contains multiple Comunica modules that can be composed.
This repository is managed as a [monorepo](https://github.com/babel/babel/blob/master/doc/design/monorepo.md)
using [Lerna](https://lernajs.io/).

If you want to develop new features
or use the (potentially unstable) in-development version,
you can set up a development environment for Comunica.

Comunica requires [Node.JS](http://nodejs.org/) 8.0 or higher and the [Yarn](https://yarnpkg.com/en/) package manager.
Comunica is tested on OSX, Linux and Windows.

This project can be setup by cloning and installing it as follows:

```bash
$ git clone https://github.com/comunica/comunica.git
$ cd comunica
$ yarn install
```

**Note: `npm install` is not supported at the moment, as this project makes use of Yarn's [workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) functionality**

This will install the dependencies of all modules, and bootstrap the Lerna monorepo.
After that, all [Comunica packages](https://github.com/comunica/comunica-feature-amf/tree/master/packages) are available in the `packages/` folder
and can be used in a development environment, such as querying with [Comunica SPARQL AMF (`packages/actor-init-sparql-amf`)](https://github.com/comunica/comunica-feature-amf/tree/master/packages/actor-init-sparql-amf).

Furthermore, this will add [pre-commit hooks](https://www.npmjs.com/package/pre-commit)
to build, lint and test.
These hooks can temporarily be disabled at your own risk by adding the `-n` flag to the commit command.

## License
This code is copyrighted by [Ghent University – imec](http://idlab.ugent.be/)
and released under the [MIT license](http://opensource.org/licenses/MIT).

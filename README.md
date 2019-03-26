# Comunica Feature — AMF

[![Greenkeeper badge](https://badges.greenkeeper.io/comunica/comunica-feature-amf.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/comunica/comunica-feature-amf.svg?branch=master)](https://travis-ci.org/comunica/comunica-feature-amf)
[![Coverage Status](https://coveralls.io/repos/github/comunica/comunica-feature-amf/badge.svg?branch=master)](https://coveralls.io/github/comunica/comunica-feature-amf?branch=master)

This is a monorepo that contains packages for allowing [Comunica](https://github.com/comunica/comunica) to handle approximate membership functions.
If you want to _use_ an AMF-enabled Comunica engine, have a look at [Comunica SPARQL AMF](https://github.com/comunica/comunica-feature-amf/tree/master/packages/actor-init-sparql-amf).

Concretely, this monorepo adds AMF support to Comunica using the following packages:
* [RDF Membership Filter Bus](https://github.com/comunica/comunica-feature-amf/tree/master/packages/bus-rdf-membership-filter): A bus for actors that can construct approximate membership filters.
* [Bloom RDF Membership Filter Actor](https://github.com/comunica/comunica-feature-amf/tree/master/packages/actor-rdf-membership-filter-bloom): An approximate membership filter actor for constructing Bloom filters.
* [GCS RDF Membership Filter Actor](https://github.com/comunica/comunica-feature-amf/tree/master/packages/actor-rdf-membership-filter-gcs): An approximate membership filter actor for constructing GCS filters.
* [Membership Metadata Extractor Actor](https://github.com/comunica/comunica-feature-amf/tree/master/packages/actor-rdf-metadata-extract-membership): An actor that extracts approximate membership filter metadata, and dynamically constructs membership filters.
* [AMF Quad Pattern Actor](https://github.com/comunica/comunica-feature-amf/tree/master/packages/actor-query-operation-quadpattern-membership-filter): An AMF-aware quad pattern actor.
* [AMF BGP Actor](https://github.com/comunica/comunica-feature-amf/tree/master/packages/actor-query-operation-bgp-membership-filter): An AMF-aware BGP actor that applies filters on separate patterns.
* [Combined AMF BGP Actor](https://github.com/comunica/comunica-feature-amf/tree/master/packages/actor-query-operation-bgp-membership-filter-combined): An AMF-aware BGP actor that combines filters and executes them on all relevant patterns to achieve a higher filtering yield.

## Development Setup

If you want to develop new features
or use the (potentially unstable) in-development version,
you can set up a development environment for Comunica.

Comunica requires [Node.JS](http://nodejs.org/) 8.0 or higher and the [Yarn](https://yarnpkg.com/en/) package manager.
Comunica is tested on OSX, Linux and Windows.

This project can be setup by cloning and installing it as follows:

```bash
$ git clone git@github.com:comunica/comunica-feature-amf
$ cd comunica-feature-amf
$ yarn install
```

**Note: `npm install` is not supported at the moment, as this project makes use of Yarn's [workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) functionality**

This will install the dependencies of all modules, and bootstrap the Lerna monorepo.
After that, all [Comunica packages](https://github.com/comunica/comunica-feature-amf/tree/master/packages) are available in the `packages/` folder.

Furthermore, this will add [pre-commit hooks](https://www.npmjs.com/package/pre-commit)
to build, lint and test.
These hooks can temporarily be disabled at your own risk by adding the `-n` flag to the commit command.

## License
This code is copyrighted by [Ghent University – imec](http://idlab.ugent.be/)
and released under the [MIT license](http://opensource.org/licenses/MIT).

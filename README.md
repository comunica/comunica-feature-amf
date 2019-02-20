# Comunica Feature — AMF

[![Greenkeeper badge](https://badges.greenkeeper.io/comunica/comunica-feature-amf.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/comunica/comunica-feature-amf.svg?branch=master)](https://travis-ci.org/comunica/comunica-feature-amf)
[![Coverage Status](https://coveralls.io/repos/github/comunica/comunica-feature-amf/badge.svg?branch=master)](https://coveralls.io/github/comunica/comunica-feature-amf?branch=master)

This is a monorepo that contains packages for allowing [Comunica](https://github.com/comunica/comunica) to handle approximate membership functions.

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

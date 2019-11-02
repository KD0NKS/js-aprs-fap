# js-aprs-fap [![Build Status](https://travis-ci.org/KD0NKS/js-aprs-fap.svg?branch=master)](https://travis-ci.org/KD0NKS/js-aprs-fap) [![Coverage Status](https://coveralls.io/repos/github/KD0NKS/js-aprs-fap/badge.svg?branch=2019-03-18_CIIntegrations)](https://coveralls.io/github/KD0NKS/js-aprs-fap?branch=2019-03-18_CIIntegrations) [![Greenkeeper badge](https://badges.greenkeeper.io/KD0NKS/js-aprs-fap.svg)](https://greenkeeper.io/)
APRS is a registered trademark Bob Bruninga, WB4APR.

This is an APRS parser based on [Ham::APRS::FAP](https://github.com/hessu/perl-aprs-fap) rewritten in JavaScript.  Therefore, much of what
is listed here is directly copied from the original repository.

## Goals - work in progress
- Be lightweight
  - Consuming world stream with Celeron 900 processor, 4GB ram, while utilizing the machine for development.
- Parse all message types
- Respond appropriately to all queries
- Implement full APRS spec
- Full code coverage with unit tests

## Implemented features - parse
- normal
- mic-e and compressed location packets
- NMEA location packets
- objects
- items
- messages
- telemetry
- weather packets

## Needs test cases to implement
- DX
- Capabilities

## Additional Information
As of right now, this module's goal of functionality and behavior is to be similar to the original library.  However, upon complete conversion, the code base and functionality will probably begin to diverge to better meet the JavaScript paradigm.  Also optimizations will be made to try to
imporove performance.

## APRS features specifically NOT handled by this module:
- special objects (area, signpost, etc)
- network tunneling/third party packets
- direction finding
- station capability queries
- status reports (partially)
- user defined data formats

## Optimizations Needed
- Quit leaking arguments (modifying them), explicitly return the $rethash value.  Any errors thrown, should also be done explicitly.

## Unit Tests Needed
- packet that causes a result code: srccall_noax25

## May have issues
- _wx_parse
  - comments/software - trimming may not be accurate

## USAGE
### Demo
[https://github.com/KD0NKS/aprs-is-demo](https://github.com/KD0NKS/aprs-is-demo)

### npm
npm install js-aprs-fap --save

## SEE ALSO
* [perl-aprs-fap](https://github.com/hessu/perl-aprs-fap)
* [C library port of Ham::APRS::FAP](http://pakettiradio.net/libfap/)
* [Python bindings for libfap](http://github.com/kd7lxl/python-libfap)

# ORIGINAL COPYRIGHT
* Copyright (C) 2005-2012 Tapio Sokura
* Copyright (C) 2007-2012 Heikki Hannikainen

This library is free software; you can redistribute it and/or modify
it under the same terms as Perl itself.
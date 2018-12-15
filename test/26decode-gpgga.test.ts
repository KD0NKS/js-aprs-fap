/**
 * a $GPRMC NMEA decoding test
 * Wed Dec 12 2007, Hessu, OH7LZB
 */
import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

describe('FAP - Test decoding GPGGA NMEA', function() {
    let parser = new aprsParser();

    describe('#parseaprs - Test parsing a GPGGA packet with a bad checksum', function() {
        let parsed: aprsPacket = parser.parseaprs("DL5UY-3>GPSC70,DB0RO,WIDE1,F5ZEE,LX0APR-2,WIDE2*,qAR,DB0NIS-10:$GPGGA,222814.000,484768272,N,00829.8212,E,2,09,1.0,714.0,M,48.0,M,1.8,0000*7B");

        it('Should return a result code: nmea_inv_cksum', function() {
            assert.equal("nmea_inv_cksum", parsed.resultCode);
        });
    });
});
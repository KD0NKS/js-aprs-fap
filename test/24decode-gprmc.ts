/**
 * a $GPRMC NMEA decoding test
 * Wed Dec 12 2007, Hessu, OH7LZB
 */
import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

describe('FAP - Test decoding GPRMC NMEA', function() {
    let parser = new aprsParser();

    describe('#parseaprs - Test parsing a GPRMC NMEA packet', function() {
        let $srccall = "OH7LZB-11";
        let $dstcall = "APRS";
        let $header = `${$srccall}>${$dstcall},W4GR*,WIDE2-1,qAR,WA4DSY`;
        let $body = '$GPRMC,145526,A,3349.0378,N,08406.2617,W,23.726,27.9,121207,4.9,W*7A';
        let $aprspacket = `${$header}:${$body}`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        // the parser always appends an SSID - make sure the behaviour doesn't change
        $dstcall += '-0';

        it(`Should return the header: ${$header}`, function() {
            assert.equal($header, parsed.header);
        });

        it(`Should return the body: ${$body}`, function() {
            assert.equal($body, parsed.body);
        });

        it('Should return the location type: location', function() {
            assert.equal('location', parsed.type);
        });

        it('Should return the type: nmea', function() {
            assert.equal('nmea', parsed.format);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return posambiguity: null', function() {
            should.not.exist(parsed.posambiguity);
        });

        it('Should return messaging: null', function() {
            should.not.exist(parsed.messaging);
        });

        it('Should return a checksumok: 1 or true', function() {
            assert.equal(true, parsed.checksumok);
        });

        it('Should return a timestamp: 1197471326', function() {
            assert.equal(1197471326, parsed.timestamp);
        });

        it('Should return latitude value, that when rounded should equal: 33.8173', function() {
            assert.equal(33.8173, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -84.1044', function() {
            assert.equal(-84.1044, parsed.longitude.toFixed(4));
        });

        it('Should return position resolution: 0.1852', function() {
            assert.equal(0.1852, parsed.posresolution);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return speed: 43.94', function() {
            assert.equal(43.94, parsed.speed.toFixed(2));
        });

        it('Should return course: 28', function() {
            assert.equal(28, parsed.course);
        });

        it('Should return altitude: null', function() {
            should.not.exist(parsed.altitude);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid position', function() {
        let parsed: aprsPacket = parser.parseaprs("AE4XO-14>GPSLK,WIDE1-1,WIDE2-2,qAR,AE4XO:$GPRMC,,V,3237.1002,N,08340.7972,W,,,,3.2,W*62");

        it('Should return a result code: gprmc_nofix', function() {
            assert.equal("gprmc_nofix", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid timestamp', function() {
        let parsed: aprsPacket = parser.parseaprs("KB9WGA-2>APRS,W9DOR-10*,WIDE2-1,qAR,KI8KR-10:$GPRMC,11,A,4458.2127,N,08720.8152,W,0.000,0.0,120,2.2, W * 0");

        it('Should return a result code: gprmc_inv_time', function() {
            assert.equal("gprmc_inv_time", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid date', function() {
        let parsed: aprsPacket = parser.parseaprs("KD6VKF-12>GPSLK,KF6ILA*,KF6ILA-10*,WIDE2*,qAR,KK6TV-10:$GPRMC,153041.000,A,3300.8386,N,11656.7468,W,6.72,27.02,id`fbnXXX�Thh�");

        it('Should return a result code: gprmc_inv_date', function() {
            assert.equal("gprmc_inv_date", parsed.resultCode);
        });
    });
});
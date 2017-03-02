/**
 * a $GPRMC NMEA decoding test
 * Wed Dec 12 2007, Hessu, OH7LZB
 *

var assert = require('assert')
        , parser = require('../parser')
        , should = require('chai').should()
        ;

describe('FAP - Test decoding GPRMC NMEA', function() {
    describe('#parseaprs - Test parsing a GPRMC NMEA packet', function() {
        let $srccall = "OH7LZB-11";
        let $dstcall = "APRS";
        let $header = `${$srccall}>${$dstcall},W4GR*,WIDE2-1,qAR,WA4DSY`;
        let $body = '$GPRMC,145526,A,3349.0378,N,08406.2617,W,23.726,27.9,121207,4.9,W*7A';
        let $aprspacket = `${$header}:${$body}`;

        let parsed = parser.parseaprs($aprspacket);

        // the parser always appends an SSID - make sure the behaviour doesn't change
        $dstcall += '-0';

        it(`Should return the header: ${$header}`, function() {
            assert.equal($header, parsed['header']);
        });

        it(`Should return the body: ${$body}`, function() {
            assert.equal($body, parsed['body']);
        });

        it('Should return the location type: location', function() {
            assert.equal('location', parsed['type']);
        });

        it('Should return the type: nmea', function() {
            assert.equal('nmea', parsed['format']);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return posambiguity: null', function() {
            should.not.exist(parsed['posambiguity']);
        });

        it('Should return messaging: null', function() {
            should.not.exist(parsed['messaging']);
        });

        it('Should return a checksumok: 1 or true', function() {
            assert.equal(true, parsed['checksumok']);
        });

        it('Should return a timestamp: 1197471326', function() {
            assert.equal(1197471326, parsed['timestamp']);
        });

        it('Should return latitude value, that when rounded should equal: 33.8173', function() {
            assert.equal(33.8173, parsed['latitude'].toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -84.1044', function() {
            assert.equal(-84.1044, parsed['longitude'].toFixed(4));
        });

        it('Should return position resolution: 0.1852', function() {
            assert.equal(0.1852, parsed['posresolution']);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return speed: 43.94', function() {
            assert.equal(43.94, parsed['speed'].toFixed(2));
        });

        it('Should return course: 28', function() {
            assert.equal(28, parsed['course']);
        });

        it('Should return altitude: null', function() {
            should.not.exist(parsed['altitude']);
        });
    });
});
*/
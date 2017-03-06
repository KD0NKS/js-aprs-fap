/**
 * test packets with DAO extensions
 * Original tests written: Wed May 5 2008, Hessu, OH7LZB
 */
import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

describe('FAP - Test decoding DAO', function() {
    let parser = new aprsParser();

    describe('#parseaprs - Test parsing an uncompressed packet with human-readable DAO; DAO in beginning of comment', function() {
        let $aprspacket = "K0ELR-15>APOT02,WIDE1-1,WIDE2-1,qAo,K0ELR:/102033h4133.03NX09029.49Wv204/000!W33! 12.3V 21C/A=000665";

        let parsed = parser.parseaprs($aprspacket);

        it('Should return a daodatumbyte: W', function() {
            assert.equal('W', parsed.daodatumbyte);
        });

        it('Should return a comment: "12.3V 21C"', function() {
            assert.equal('12.3V 21C', parsed.comment);
        });

        it('Should return latitude value, that when rounded should equal: 41.55055', function() {
            assert.equal(41.55055, parsed.latitude.toFixed(5));
        });

        it('Should return longitude value, that when rounded should equal: -90.49155', function() {
            assert.equal(-90.49155, parsed.longitude.toFixed(5));
        });

        it('Should return altitude: 203', function() {
            assert.equal(203, parsed.altitude.toFixed(0));
        });

        it('Should return position resolution: 1.852', function() {
            assert.equal(1.852, parsed.posresolution);
        });
    });

    describe('#parseaprs - Test parsing a compressed packet with BASE91 DAO; DAO in end of comment', function() {
        let $aprspacket = "OH7LZB-9>APZMDR,WIDE2-2,qAo,OH2RCH:!/0(yiTc5y>{2O http://aprs.fi/!w11!";

        let parsed = parser.parseaprs($aprspacket);

        it('Should return a daodatumbyte: W', function() {
            assert.equal('W', parsed.daodatumbyte);
        });

        it('Should return a comment: "http://aprs.fi/"', function() {
            assert.equal('http://aprs.fi/', parsed.comment);
        });

        it('Should return latitude value, that when rounded should equal: 60.15273', function() {
            assert.equal(60.15273, parsed.latitude.toFixed(5));
        });

        it('Should return longitude value, that when rounded should equal: 24.66222', function() {
            assert.equal(24.66222, parsed.longitude.toFixed(5));
        });

        it('Should return position resolution: 0.1852', function() {
            assert.equal(0.1852, parsed.posresolution);
        });
    });

    describe('#parseaprs - Test parsing a mic-e packet with BASE91 DAO; DAO in middle of comment', function() {
        let $aprspacket = "OH2JCQ-9>VP1U88,TRACE2-2,qAR,OH2RDK-5:'5'9\"^Rj/]\"4-}Foo !w66!Bar";

        let parsed = parser.parseaprs($aprspacket);

        it('Should return a daodatumbyte: W', function() {
            assert.equal('W', parsed.daodatumbyte);
        });

        it('Should return a comment: "]Foo Bar"', function() {
            assert.equal(']Foo Bar', parsed.comment);
        });

        it('Should return latitude value, that when rounded should equal: 60.26471', function() {
            assert.equal(60.26471, parsed.latitude.toFixed(5));
        });

        it('Should return longitude value, that when rounded should equal: 25.18821', function() {
            assert.equal(25.18821, parsed.longitude.toFixed(5));
        });

        it('Should return position resolution: 0.1852', function() {
            assert.equal(0.1852, parsed.posresolution);
        });
    });
});
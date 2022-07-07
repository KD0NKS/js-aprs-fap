const assert = require('assert');

import { AprsPacket } from '../src/models/AprsPacket';
import { AprsParser } from '../src/parsers/AprsParser';
import { ParserOptions } from '../src/parsers/ParserOptions';

// validate the check_ax25_call function

describe('FAP - Validate the check_ax25_call function', function() {
    const parser = new AprsParser();
    let parserOptions = new ParserOptions();
    parserOptions.isAx25 = true

    // successes
    describe('#check_ax25_call - Check valid call signs.', function() {
        it('Should return: OH7LZB', function() {
            assert.equal('OH7LZB', parser.checkAX25Call('OH7LZB'));
        });

        it('Should return: OH7LZB-9', function() {
            assert.equal('OH7LZB-9', parser.checkAX25Call('OH7LZB-9'));
        });

        it('Should return: OH7LZB-15', function() {
            assert.equal('OH7LZB-15', parser.checkAX25Call('OH7LZB-15'));
        });
    });

    // fails
    describe('FAP - Validate the check_ax25_call function these should fail.', function() {
        it('Should return: null', function() {
            assert.equal(null, parser.checkAX25Call('OH7LZB-16'));
        });

        it('Should return: null', function() {
            assert.equal(null, parser.checkAX25Call('OH7LZB-166'));
        });

        it('Should return: null', function() {
            assert.equal(null, parser.checkAX25Call('OH7LZBXXX'));
        });
    });

    // full packets
    // successes
    describe('#parseaprs - Valid ax25 source call', function() {
        const parsed: AprsPacket = parser.parseAprs(
                "OH7LZB>APJS10,TCPIP*,qAC,K6IFR-BS:;K6IFR B *250300z3351.79ND11626.40WaRNG0040 440 Voice 447.140 -5.00 Mhz"
                , parserOptions
                );

        it('Should return sourceCallsign: OH7LZB', function() {
            assert.equal('OH7LZB', parsed.sourceCallsign);
        });

        const parsed2: AprsPacket = parser.parseAprs(
                "OH7LZB-9>APJS10,TCPIP*,qAC,K6IFR-BS:;K6IFR B *250300z3351.79ND11626.40WaRNG0040 440 Voice 447.140 -5.00 Mhz"
                , parserOptions
                );

        it('Should return sourceCallsign: OH7LZB-9', function() {
            assert.equal('OH7LZB-9', parsed2.sourceCallsign);
        });

        const parsed3: AprsPacket = parser.parseAprs(
                "OH7LZB-15>APJS10,TCPIP*,qAC,K6IFR-BS:;K6IFR B *250300z3351.79ND11626.40WaRNG0040 440 Voice 447.140 -5.00 Mhz"
                , parserOptions
                );

        it('Should return sourceCallsign: OH7LZB-15', function() {
            assert.equal('OH7LZB-15', parsed3.sourceCallsign);
        });
    });

    // fails
    describe('#parseaprs - Invalid ax25 source call', function() {
        //srccall_noax25
        const parsed: AprsPacket = parser.parseAprs(
                "OH7LZB-16>APJS10,TCPIP*,qAC,K6IFR-BS:;K6IFR B *250300z3351.79ND11626.40WaRNG0040 440 Voice 447.140 -5.00 Mhz"
                , parserOptions
                );

        it('Should return a resultcode: srccall_noax25', function() {
            assert.equal('srccall_noax25', parsed.resultCode);
        });

        // bad chars
        const parsed2: AprsPacket = parser.parseAprs(
                "OH7LZB-166>APJS10,TCPIP*,qAC,K6IFR-BS:;K6IFR B *250300z3351.79ND11626.40WaRNG0040 440 Voice 447.140 -5.00 Mhz"
                , parserOptions
                );

        it('Should return a resultcode: srccall_noax25', function() {
            assert.equal('srccall_badchars', parsed2.resultCode);
        });

        const parsed3: AprsPacket = parser.parseAprs(
                "OH7LZBXXX>APJS10,TCPIP*,qAC,K6IFR-BS:;K6IFR B *250300z3351.79ND11626.40WaRNG0040 440 Voice 447.140 -5.00 Mhz"
                , parserOptions
                );

        it('Should return a resultcode: srccall_noax25', function() {
            assert.equal('srccall_noax25', parsed3.resultCode);
        });
    });
});
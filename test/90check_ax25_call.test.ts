const assert = require('assert');

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

// validate the check_ax25_call function

describe('FAP - Validate the check_ax25_call function', function() {
    let parser = new aprsParser();

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
    describe('#parseaprs - Valid ax25 source call', () => {
        let $aprspacket = `OH7LZB>APJS10,TCPIP*,qAC,K6IFR-BS:;K6IFR B *250300z3351.79ND11626.40WaRNG0040 440 Voice 447.140 -5.00 Mhz`;
        let parsed: aprsPacket = parser.parseaprs($aprspacket, { isax25: true });

        it('Should return sourceCallsign: OH7LZB', function() {
            assert.equal('OH7LZB', parsed.sourceCallsign);
        });

        let $aprspacket2 = `OH7LZB-9>APJS10,TCPIP*,qAC,K6IFR-BS:;K6IFR B *250300z3351.79ND11626.40WaRNG0040 440 Voice 447.140 -5.00 Mhz`;
        let parsed2: aprsPacket = parser.parseaprs($aprspacket2, { isax25: true });

        it('Should return sourceCallsign: OH7LZB-9', function() {
            assert.equal('OH7LZB-9', parsed2.sourceCallsign);
        });

        let $aprspacket3 = `OH7LZB-15>APJS10,TCPIP*,qAC,K6IFR-BS:;K6IFR B *250300z3351.79ND11626.40WaRNG0040 440 Voice 447.140 -5.00 Mhz`;
        let parsed3: aprsPacket = parser.parseaprs($aprspacket3, { isax25: true });

        it('Should return sourceCallsign: OH7LZB-15', function() {
            assert.equal('OH7LZB-15', parsed3.sourceCallsign);
        });
    });

    // fails
    describe('#parseaprs - Invalid ax25 source call', () => {
        //srccall_noax25
        let $aprspacket = `OH7LZB-16>APJS10,TCPIP*,qAC,K6IFR-BS:;K6IFR B *250300z3351.79ND11626.40WaRNG0040 440 Voice 447.140 -5.00 Mhz`;
        let parsed: aprsPacket = parser.parseaprs($aprspacket, { isax25: true });

        it('Should return a resultcode: srccall_noax25', () => {
            assert.equal('srccall_noax25', parsed.resultCode);
        });

        // bad chars
        let $aprspacket2 = `OH7LZB-166>APJS10,TCPIP*,qAC,K6IFR-BS:;K6IFR B *250300z3351.79ND11626.40WaRNG0040 440 Voice 447.140 -5.00 Mhz`;
        let parsed2: aprsPacket = parser.parseaprs($aprspacket2, { isax25: true });

        it('Should return a resultcode: srccall_noax25', () => {
            assert.equal('srccall_badchars', parsed2.resultCode);
        });

        let $aprspacket3 = `OH7LZBXXX>APJS10,TCPIP*,qAC,K6IFR-BS:;K6IFR B *250300z3351.79ND11626.40WaRNG0040 440 Voice 447.140 -5.00 Mhz`;
        let parsed3: aprsPacket = parser.parseaprs($aprspacket3, { isax25: true });

        it('Should return a resultcode: srccall_noax25', () => {
            assert.equal('srccall_noax25', parsed3.resultCode);
        });
    });
});
// a bad packet test
// Tue Dec 11 2007, Hessu, OH7LZB
import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';


describe('FAP - test bad packets', function() {
    let parser = new aprsParser();

    describe('#parseaprs - corrupted uncompressed packet', function() {
        let $srccall = "OH2RDP-1";
        let $dstcall = "BEACON-15";

        let $aprspacket = `${$srccall}>${$dstcall},OH2RDG*,WIDE:!60ff.51N/0250akh3r99hfae`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return a resultcode: loc_inv', function() {
            assert.equal('loc_inv', parsed.resultCode);
        });

        it('Should return a resultmsg: "Invalid uncompressed location: undefined"', function() {
            assert.equal('Invalid uncompressed location: undefined', parsed.resultMessage);
        });

        it('Should return a type: location', function() {
            assert.equal('location', parsed.type);
        });

        it('Should return the source call sign: ' + $srccall, function() {
            assert.equal($srccall, parsed.sourceCallsign);
        });

        it('Should return the destination call sign: ' + $dstcall, function() {
            assert.equal($dstcall, parsed.destCallsign);
        });

        it('Should not return latitude', function() {
            should.not.exist(parsed.latitude);
        });

        it('Should not return longitude', function() {
            should.not.exist(parsed.longitude);
        });
    });

    describe('#parseaprs - bad source call', function() {
        let $aprspacket = `K6IFR_S>APJS10,TCPIP*,qAC,K6IFR-BS:;K6IFR B *250300z3351.79ND11626.40WaRNG0040 440 Voice 447.140 -5.00 Mhz`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);
        console.log(parsed);

        it('Should return a resultcode: srccall_badchars', function() {
            assert.equal('srccall_badchars', parsed.resultCode);
        });

        it('Should return a resultmsg: "Source callsign contains bad characters: undefined"', function() {
            assert.equal('Source callsign contains bad characters: undefined', parsed.resultMessage);
        });

        it('Should not return a type', function() {
            should.not.exist(parsed.type);
        });
    });

    describe('#parseaprs - bad digipeater call', function() {
        let $aprspacket = `SV2BRF-6>APU25N,TCPXX*,qAX,SZ8L_GREE:=/:\$U#T<:G- BVagelis, qrv:434.350, tsq:77 {UIV32N}`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return a resultcode: digicall_badchars', function() {
            assert.equal('digicall_badchars', parsed.resultCode);
        });

        it('Should return a resultmsg: "Digipeater callsign contains bad characters: undefined"', function() {
            assert.equal('Digipeater callsign contains bad characters: undefined', parsed.resultMessage);
        });

        it('Should not return a type', function() {
            should.not.exist(parsed.type);
        });
    });

    describe('#parseaprs - bad symbol table', function() {
        let $aprspacket = `ASDF>DSALK,OH2RDG*,WIDE:!6028.51N,02505.68E#`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return a resultcode: sym_inv_table', function() {
            assert.equal('sym_inv_table', parsed.resultCode);
        });

        it('Should return a resultmsg: "Invalid symbol table or overlay: undefined"', function() {
            assert.equal('Invalid symbol table or overlay: undefined', parsed.resultMessage);
        });
    });
});
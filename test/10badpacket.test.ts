// a bad packet test
// Tue Dec 11 2007, Hessu, OH7LZB
import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

describe('FAP - test bad packets', () => {
    let parser = new aprsParser();

    describe('#parseaprs - corrupted uncompressed packet', () => {
        let $srccall = "OH2RDP-1";
        let $dstcall = "BEACON-15";

        let $aprspacket = `${$srccall}>${$dstcall},OH2RDG*,WIDE:!60ff.51N/0250akh3r99hfae`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return a resultcode: loc_inv', () => {
            assert.equal('loc_inv', parsed.resultCode);
        });

        it('Should return a resultmsg: "Invalid uncompressed location: undefined"', () => {
            assert.equal('Invalid uncompressed location: undefined', parsed.resultMessage);
        });

        it('Should return a type: location', () => {
            assert.equal('location', parsed.type);
        });

        it('Should return the source call sign: ' + $srccall, () => {
            assert.equal($srccall, parsed.sourceCallsign);
        });

        it('Should return the destination call sign: ' + $dstcall, () => {
            assert.equal($dstcall, parsed.destCallsign);
        });

        it('Should not return latitude', () => {
            should.not.exist(parsed.latitude);
        });

        it('Should not return longitude', () => {
            should.not.exist(parsed.longitude);
        });
    });

    describe('#parseaprs - bad source call', () => {
        let $aprspacket = `K6IFR_S>APJS10,TCPIP*,qAC,K6IFR-BS:;K6IFR B *250300z3351.79ND11626.40WaRNG0040 440 Voice 447.140 -5.00 Mhz`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return a resultcode: srccall_badchars', () => {
            assert.equal('srccall_badchars', parsed.resultCode);
        });

        it('Should return a resultmsg: "Source callsign contains bad characters: undefined"', () => {
            assert.equal('Source callsign contains bad characters: undefined', parsed.resultMessage);
        });

        it('Should not return a type', () => {
            should.not.exist(parsed.type);
        });
    });

    describe('#parseaprs - bad digipeater call', () => {
        let $aprspacket = `SV2BRF-6>APU25N,TCPXX*,qAX,SZ8L_GREE:=/:\$U#T<:G- BVagelis, qrv:434.350, tsq:77 {UIV32N}`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return a resultcode: digicall_badchars', () => {
            assert.equal('digicall_badchars', parsed.resultCode);
        });

        it('Should return a resultmsg: "Digipeater callsign contains bad characters: undefined"', () => {
            assert.equal('Digipeater callsign contains bad characters: undefined', parsed.resultMessage);
        });

        it('Should not return a type', () => {
            should.not.exist(parsed.type);
        });
    });

    describe('#parseaprs - bad symbol table', () => {
        let $aprspacket = `ASDF>DSALK,OH2RDG*,WIDE:!6028.51N,02505.68E#`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return a resultcode: sym_inv_table', () => {
            assert.equal('sym_inv_table', parsed.resultCode);
        });

        it('Should return a resultmsg: "Invalid symbol table or overlay: undefined"', () => {
            assert.equal('Invalid symbol table or overlay: undefined', parsed.resultMessage);
        });
    });

    describe('#parsepars - no packet', () => {
        let parsed: aprsPacket = parser.parseaprs(undefined);

        it('Should return a resultCode: "packet_no"', () => {
            assert.equal('packet_no', parsed.resultCode);
        });
    });

    describe('#parseaprs - packet too short', () => {
        let parsed: aprsPacket = parser.parseaprs('');

        it('Should return a resultCode: "packet_short"', () => {
            assert.equal('packet_short', parsed.resultCode);
        });
    });

    describe('#parseaprs - packet no body', () => {
        let parsed: aprsPacket = parser.parseaprs('!6028.51N,02505.68E#');

        it('Should return a resultCode: "packet_nobody"', () => {
            assert.equal('packet_nobody', parsed.resultCode);
        });
    });

    describe('#parseaprs - packet with invalid destCallsign', () => {
        let parsed: aprsPacket = parser.parseaprs('None>None,qAR,TACO:!3751.90NS12213.23W#PHG7500/W2,NCAn, WA6TLW, Berkeley, CA A=001720');

        it('Should return a resultCode: "dstcall_noax25"', () => {
            assert.equal('dstcall_noax25', parsed.resultCode);
        });
    });

    describe('#parseaprs - packet with no destCallsign', () => {
        let parsed: aprsPacket = parser.parseaprs('None>:!3751.90NS12213.23W#PHG7500/W2,NCAn, WA6TLW, Berkeley, CA A=001720');

        it('Should return a resultCode: "dstcall_none"', () => {
            assert.equal('dstcall_none', parsed.resultCode);
        });
    });

    describe('Test trying to parse an invalid location packet', () => {
        let parsed: aprsPacket = parser.parseaprs('PY5LF-13>APTT4,WIDE1-1,WIDE2-1,qAR,PU5SZN-2:! Weather Station ISS Davis CURITIBA - PR');

        it('Should return a resultCode: "packet_invalid"', () => {
            assert.equal('packet_invalid', parsed.resultCode);
        });
    });

    describe('#parseaprs - packet with invalid destination callsign', () => {
        let parsed: aprsPacket = parser.parseaprs('BH8SEL-3>Office,qAS,BG6CQ:=2503.22N/10130.90E_000/000g000t057r000p000h48b08209ESP8266 MAC 84:0d:8e:84:26:c3 RSSI: -43');

        it('Should return a resultCode: "dstcall_noax25"', () => {
            assert.equal('dstcall_noax25', parsed.resultCode);
        });
    });
});
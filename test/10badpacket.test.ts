// @ts-nocheck strictNullChecks

// a bad packet test
// Tue Dec 11 2007, Hessu, OH7LZB
import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import { AprsPacket } from '../src/models/AprsPacket';
import { PacketTypeEnum } from '../src/enums/PacketTypeEnum';
import { AprsParser } from '../src/parsers/AprsParser';

describe('FAP - test bad packets', function() {
    let parser = new AprsParser();

    describe('#parseaprs - corrupted uncompressed packet', function() {
        const srccall = "OH2RDP-1";
        const dstcall = "BEACON-15";

        const parsed: AprsPacket = parser.parseAprs(`${srccall}>${dstcall},OH2RDG*,WIDE:!60ff.51N/0250akh3r99hfae`);

        it('Should return a resultcode: loc_inv', function() {
            assert.equal('loc_inv', parsed.resultCode);
        });

        it('Should return a resultmsg: "Invalid uncompressed location: undefined"', function() {
            assert.equal('Invalid uncompressed location: undefined', parsed.resultMessage);
        });

        it('Should return a type: location', function() {
            assert.equal(PacketTypeEnum.LOCATION, parsed.type);
        });

        it(`Should return the source call sign: ${srccall}`, function() {
            assert.equal(srccall, parsed.sourceCallsign);
        });

        it(`Should return the destination call sign: ${dstcall}`, function() {
            assert.equal(dstcall, parsed.destCallsign);
        });

        it('Should not return latitude', function() {
            should.not.exist(parsed.latitude);
        });

        it('Should not return longitude', function() {
            should.not.exist(parsed.longitude);
        });
    });

    describe('#parseaprs - bad source call', function() {
        const parsed: AprsPacket = parser.parseAprs('K6IFR_S>APJS10,TCPIP*,qAC,K6IFR-BS:;K6IFR B *250300z3351.79ND11626.40WaRNG0040 440 Voice 447.140 -5.00 Mhz');

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
        const parsed: AprsPacket = parser.parseAprs('SV2BRF-6>APU25N,TCPXX*,qAX,SZ8L_GREE:=/:\$U#T<:G- BVagelis, qrv:434.350, tsq:77 {UIV32N}');

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
        const parsed: AprsPacket = parser.parseAprs('ASDF>DSALK,OH2RDG*,WIDE:!6028.51N,02505.68E#');

        it('Should return a resultcode: sym_inv_table', function() {
            assert.equal('sym_inv_table', parsed.resultCode);
        });

        it('Should return a resultmsg: "Invalid symbol table or overlay: undefined"', function() {
            assert.equal('Invalid symbol table or overlay: undefined', parsed.resultMessage);
        });
    });

    describe('#parsepars - no packet', function() {
        const parsed: AprsPacket = parser.parseAprs(undefined);

        it('Should return a resultCode: "packet_no"', () => {
            assert.equal('packet_no', parsed.resultCode);
        });
    });

    describe('#parseaprs - packet too short', function()  {
        const parsed: AprsPacket = parser.parseAprs('');

        it('Should return a resultCode: "packet_short"', function() {
            assert.equal('packet_short', parsed.resultCode);
        });
    });

    describe('#parseaprs - packet no body', function() {
        const parsed: AprsPacket = parser.parseAprs('!6028.51N,02505.68E#');

        it('Should return a resultCode: "packet_nobody"', function() {
            assert.equal('packet_nobody', parsed.resultCode);
        });
    });

    describe('#parseaprs - packet with invalid destCallsign', function() {
        const parsed: AprsPacket = parser.parseAprs('None>None,qAR,TACO:!3751.90NS12213.23W#PHG7500/W2,NCAn, WA6TLW, Berkeley, CA A=001720');

        it('Should return a resultCode: "dstcall_noax25"', function() {
            assert.equal('dstcall_noax25', parsed.resultCode);
        });
    });

    describe('#parseaprs - packet with no destCallsign', function() {
        const parsed: AprsPacket = parser.parseAprs('None>:!3751.90NS12213.23W#PHG7500/W2,NCAn, WA6TLW, Berkeley, CA A=001720');

        it('Should return a resultCode: "dstcall_none"', function() {
            assert.equal('dstcall_none', parsed.resultCode);
        });
    });

    describe('Test trying to parse an invalid location packet', function() {
        const parsed: AprsPacket = parser.parseAprs('PY5LF-13>APTT4,WIDE1-1,WIDE2-1,qAR,PU5SZN-2:! Weather Station ISS Davis CURITIBA - PR');

        it('Should return a resultCode: "packet_invalid"', function() {
            assert.equal('packet_invalid', parsed.resultCode);
        });
    });

    describe('#parseaprs - packet with invalid destination callsign', function() {
        const parsed: AprsPacket = parser.parseAprs('BH8SEL-3>Office,qAS,BG6CQ:=2503.22N/10130.90E_000/000g000t057r000p000h48b08209ESP8266 MAC 84:0d:8e:84:26:c3 RSSI: -43');

        it('Should return a resultCode: "dstcall_noax25"', function() {
            assert.equal('dstcall_noax25', parsed.resultCode);
        });
    });
});
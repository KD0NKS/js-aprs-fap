// message decoding
// Tue Dec 11 2007, Hessu, OH7LZB
import * as chai from 'chai';

const assert = require('assert')
const expect = chai.expect

import { AprsPacket } from '../src/models/AprsPacket';
import { PacketTypeEnum } from '../src/enums/PacketTypeEnum';
import { AprsParser } from '../src/parsers/AprsParser';

describe('FAP - Test parsing object', function() {
    const parser = new AprsParser();

    describe('#parseaprs - Test object parsing', function() {
        const srccall = "OH2KKU-1";
        const dstcall = "APRS";
        const body = ",TCPIP*,qAC,FIRST:;SRAL HQ  *100927zS0%E/Th4_a  A";
        const comment = "Kaupinmaenpolku9,open M-Th12-17,F12-14 lcl";

        const parsed: AprsPacket = parser.parseAprs(`${srccall}>${dstcall}${body}${comment}`);

        it(`Should return srccallsign: ${srccall}`, function() {
            assert.equal(srccall, parsed.sourceCallsign);
        });

        it('Should return a null result code.', function() {
            assert.equal(null, parsed.resultCode);
        });

        it(`Should return a dstcall: ${dstcall}`, function() {
            assert.equal(dstcall, parsed.destCallsign);
        });

        it('Should return type value: object', function() {
            assert.equal(PacketTypeEnum.OBJECT, parsed.type);
        });

        it('Should return object name: \'SRAL HQ  \'', function() {
            assert.equal('SRAL HQ  ', parsed.objectname);
        });

        it('Should return alive value: 1', function() {
            assert.equal(1, parsed.alive);
        });

        // timestamp test has been disabled, because it cannot be
        // done this way - the timestamp in the packet is not
        // fully specified, so the resulting value will depend
        // on the time the parsing is executed.
        // ok($h{'timestamp'}, 1197278820, "wrong timestamp");

        it('Should return the symbol table code: S', function() {
            assert.equal('S', parsed.symboltable);
        });

        it('Should return the symbol code: a', function() {
            assert.equal('a', parsed.symbolcode);
        });

        it('Should return latitude value, that when rounded should equal: 60.2305', function() {
            assert.equal(60.2305, parsed.latitude?.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: 24.8790', function() {
            assert.equal(24.8790, parsed.longitude?.toFixed(4));
        });

        it('Should return position resolution: 0.291', function() {
            assert.equal(0.291, parsed.posresolution);
        });

        it('Should return PHG: null', function() {
            assert.equal(null, parsed.phg);
        });

        it(`Should return the comment: ${comment}`, function() {
            assert.equal(comment, parsed.comment);
        });
    });

    describe('Test object where there is an issue parsing the object location', function() {
        const parsed: AprsPacket = parser.parseAprs('K8ETN-S>APJIO4,TCPIP*,qAC,K8ETN-GS:;K8ETN  C *080015z    .  ND     .  EaRNG0045 2m Voice 145.200 -0.600 MHz');

        it('Should return a resultCode: "obj_dec_err"', function() {
            expect(parsed.resultCode).to.equal("obj_dec_err");
        });
    });

    describe('Regular APRS position - alive', function() {
        const parsed: AprsPacket = parser.parseAprs('OH2KKU-1>APRS,TCPIP*,qAC,OH2KKU-1:;LEADER   *092345z4903.50N/07201.75W>088/036')

        assert.equal(null, parsed.resultCode)
        assert.equal('object', parsed.type)
        assert.equal('LEADER   ', parsed.objectname)
        assert.equal(true, parsed.alive)
        // TODO: Potential bug.  Should these be trimmed to 4 decimal places?
        assert.equal(49.05833333333333, parsed.latitude)
        assert.equal(-72.02916666666667, parsed.longitude)
        assert.equal(18.520, parsed.posresolution)
        assert.equal(null, parsed.phg)
        assert.equal(null, parsed.comment)
    })

    describe('Regular APRS position - killed', function() {
        const parsed: AprsPacket = parser.parseAprs('OH2KKU-1>APRS,TCPIP*,qAC,OH2KKU-1:;LEADER   _092345z4903.50N/07201.75W>088/036')

        assert.equal(null, parsed.resultCode)
        assert.equal('object', parsed.type)
        assert.equal('LEADER   ', parsed.objectname)
        assert.equal(false, parsed.alive)
    })
});
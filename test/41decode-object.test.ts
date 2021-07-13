// message decoding
// Tue Dec 11 2007, Hessu, OH7LZB
import * as chai from 'chai';

const assert = require('assert')
const expect = chai.expect

import aprsPacket from '../src/aprsPacket';
import { PacketTypeEnum } from '../src/enums/PacketTypeEnum';
import aprsParser from '../src/parser';

describe('FAP - Test parsing object', () => {
    let parser = new aprsParser();

    describe('#parseaprs - Test object parsing', () => {
        let $srccall = "OH2KKU-1";
        let $dstcall = "APRS";
        let $comment = "Kaupinmaenpolku9,open M-Th12-17,F12-14 lcl";
        let $aprspacket = $srccall + '>';

        let tmp = "415052532C54435049502A2C7141432C46495253543A3B5352414C20485120202A3130303932377A533025452F5468345F612020414B617570696E6D61656E706F6C6B75392C6F70656E204D2D546831322D31372C4631322D3134206C636C".match(/.{2}/g);
        tmp.forEach(x => {
            $aprspacket += String.fromCharCode(parseInt(x, 16));
        });

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return srccallsign: ' + $srccall, () => {
            assert.equal($srccall, parsed.sourceCallsign);
        });

        it('Should return a null result code.', () => {
            assert.equal(null, parsed.resultCode);
        });

        it('Should return a dstcall: ' + $dstcall, () => {
            assert.equal($dstcall, parsed.destCallsign);
        });

        it('Should return type value: object', () => {
            assert.equal(PacketTypeEnum.OBJECT, parsed.type);
        });

        it('Should return object name: \'SRAL HQ  \'', () => {
            assert.equal('SRAL HQ  ', parsed.objectname);
        });

        it('Should return alive value: 1', () => {
            assert.equal(1, parsed.alive);
        });

        // timestamp test has been disabled, because it cannot be
        // done this way - the timestamp in the packet is not
        // fully specified, so the resulting value will depend
        // on the time the parsing is executed.
        // ok($h{'timestamp'}, 1197278820, "wrong timestamp");

        it('Should return the symbol table code: S', () => {
            assert.equal('S', parsed.symboltable);
        });

        it('Should return the symbol code: a', () => {
            assert.equal('a', parsed.symbolcode);
        });

        it('Should return latitude value, that when rounded should equal: 60.2305', () => {
            assert.equal(60.2305, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: 24.8790', () => {
            assert.equal(24.8790, parsed.longitude.toFixed(4));
        });

        it('Should return position resolution: 0.291', () => {
            assert.equal(0.291, parsed.posresolution);
        });

        it('Should return PHG: null', () => {
            assert.equal(null, parsed.phg);
        });

        it('Should return the comment: ' + $comment, () => {
            assert.equal($comment, parsed.comment);
        });
    });

    describe('Test object where there is an issue parsing the object location', () => {
        let parsed: aprsPacket = parser.parseaprs('K8ETN-S>APJIO4,TCPIP*,qAC,K8ETN-GS:;K8ETN  C *080015z    .  ND     .  EaRNG0045 2m Voice 145.200 -0.600 MHz');

        it('Should return a resultCode: "obj_dec_err"', () => {
            expect(parsed.resultCode).to.equal("obj_dec_err");
        });
    });
});
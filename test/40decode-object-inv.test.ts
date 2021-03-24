/**
 * object decoding - bad packet
 * the packet contains has some binary characters, which were destroyed in
 * a cut 'n paste operation
 * Tue Dec 11 2007, Hessu, OH7LZB
 */
import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';
import * as chai from 'chai';

const assert = chai.assert;

describe('FAP - Test parsing a bad packet', function() {
    const parser: aprsParser = new aprsParser();

    describe('#parseaprs - Test parsing a bad packet', function() {
        const $aprspacket = `OH2KKU-1>APRS,TCPIP*,qAC,FIRST:;SRAL HQ *110507zS0%E/Th4_a AKaupinmaenpolku9,open M-Th12-17,F12-14 lcl`
        const parsed: aprsPacket = parser.parseaprs($aprspacket)

        it('Should return a resultcode: obj_inv', function() {
            assert.equal('obj_inv', parsed.resultCode);
        })

        it('Should return a type: object', function() {
            assert.equal('object', parsed.type);
        })
    })

    // Note: the perl version will never hit this scenario as it dumps out when trying to decide what type of packet it is
    // because it is less than 31 characters
    describe('#parseaprs - Test parsing a bad packet', function () {
        const $aprspacket = `OH2KKU-1>APRS:;110507zS0%E/Th4_a AK`
        const parsed: aprsPacket = parser.parseaprs($aprspacket, { isax25: true })

        it('Should return a resultcode: obj_short', function () {
            assert.equal('obj_short', parsed.resultCode);
        })

        it('Should return a type: object', function () {
            assert.equal('object', parsed.type);
        })
    })

    describe('#parseaprs - Test parsing a bad packet', function () {
        const $aprspacket = `K8ETN-S>APJIO4,TCPIP*,qAC,K8ETN-GS:;K8ETN  C *240015h    .  ND     .  EaRNG0045 2m Voice 145.200 -0.600 MHz`
        const parsed: aprsPacket = parser.parseaprs($aprspacket)

        it('Should return a warning code \'timestamp_inv_obj', function () {
            assert.equal('timestamp_inv_obj', parsed.warningCodes[0])
        })

        it('Should return a timestamp: 0', function () {
            assert.equal(0, parsed.timestamp)
        })
    })
})
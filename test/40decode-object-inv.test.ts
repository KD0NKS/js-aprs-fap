/**
 * object decoding - bad packet
 * the packet contains has some binary characters, which were destroyed in
 * a cut 'n paste operation
 * Tue Dec 11 2007, Hessu, OH7LZB
 */
import { equal } from 'assert'

import { AprsPacket } from '../src/models/aprsPacket'
import { AprsParser } from '../src/parsers/AprsParser';
import { PacketTypeEnum } from '../src/enums/PacketTypeEnum'
import { ParserOptions } from '../src/parsers/ParserOptions';


describe('FAP - Test parsing a bad packet', function() {
    const parser: AprsParser = new AprsParser();
    let parserOptions = new ParserOptions();

    describe('#parseaprs - Test parsing a bad packet', function() {
        const parsed: AprsPacket = parser.parseAprs("OH2KKU-1>APRS,TCPIP*,qAC,FIRST:;SRAL HQ *110507zS0%E/Th4_a AKaupinmaenpolku9,open M-Th12-17,F12-14 lcl")

        it('Should return a resultcode: obj_inv', function() {
            equal('obj_inv', parsed.resultCode);
        })

        it('Should return a type: object', function() {
            equal(PacketTypeEnum.OBJECT, parsed.type);
        })
    })

    // Note: the perl version will never hit this scenario as it dumps out when trying to decide what type of packet it is
    // because it is less than 31 characters
    describe('#parseaprs - Test parsing a bad packet', function() {
        parserOptions.isAx25 = true;

        const parsed: AprsPacket = parser.parseAprs("OH2KKU-1>APRS:;110507zS0%E/Th4_a AK", parserOptions)

        it('Should return a resultcode: obj_short', function() {
            equal('obj_short', parsed.resultCode);
        })

        it('Should return a type: object', function () {
            equal(PacketTypeEnum.OBJECT, parsed.type);
        })
    })

    describe('#parseaprs - Test parsing a packet where the object has an invalid timestamp', function() {
        const parsed: AprsPacket = parser.parseAprs("K8ETN-S>APJIO4,TCPIP*,qAC,K8ETN-GS:;K8ETN  C *240015h    .  ND     .  EaRNG0045 2m Voice 145.200 -0.600 MHz")

        it('Should return a warning code \'timestamp_inv_obj', function () {
            equal('timestamp_inv_obj', parsed.warningCodes[0])
        })

        it('Should return a timestamp: 0', function () {
            equal(0, parsed.timestamp)
        })
    })
})
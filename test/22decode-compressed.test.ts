/**
 * A basic compressed packet decoding test for a non-moving target
 * Tue Dec 11 2007, Hessu, OH7LZB
 */
import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();
const expect = chai.expect;

import aprsPacket from '../src/aprsPacket';
import { PacketTypeEnum } from '../src/enums/PacketTypeEnum';
import aprsParser from '../src/parser';

describe('FAP - Test decoding compressed packets', function() {
    let parser = new aprsParser();

    describe('#parseaprs - Test parsing a compressed packet', function() {
        let $srccall = "OH2KKU-15";
        let $dstcall = "APRS";
        let $header = `${$srccall}>${$dstcall},TCPIP*,qAC,FOURTH`;

        // The comment field contains telemetry just to see that it doesn't break
        // the actual position parsing.
        let $body = "!I0-X;T_Wv&{-Aigate testing";

        let $aprspacket = `${$header}:${$body}`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it(`Should return the source call sign: ${$srccall}`, function() {
            assert.equal($srccall, parsed.sourceCallsign);
        });

        it(`Should return the destination call sign: ${$dstcall}`, function() {
            assert.equal($dstcall, parsed.destCallsign);
        });

        it(`Should return a header: ${$header}`, function() {
            assert.equal($header, parsed.header);
        });

        it(`Should return a body: ${$body}`, function() {
            assert.equal($body, parsed.body);
        });

        it('Should return a type: location', function() {
            assert.equal(PacketTypeEnum.LOCATION, parsed.type);
        });

        it('Should return format: compressed', function() {
            assert.equal('compressed', parsed.format);
        });

        it('Should return a comment: "igate testing"', function() {
            assert.equal('igate testing', parsed.comment);
        });

        it('Should return 3 valid digis', function() {
            assert.equal(3, parsed.digipeaters.length);

            assert.equal('TCPIP', parsed.digipeaters[0].callsign);
            assert.equal(true, parsed.digipeaters[0].wasDigipeated);

            assert.equal('qAC', parsed.digipeaters[1].callsign);
            assert.equal(false, parsed.digipeaters[1].wasDigipeated);

            assert.equal('FOURTH', parsed.digipeaters[2].callsign);
            assert.equal(false, parsed.digipeaters[2].wasDigipeated);
        });

        it('Should return the symbol table code: I', function() {
            assert.equal('I', parsed.symboltable);
        });

        it('Should return the symbol code: &', function() {
            assert.equal('&', parsed.symbolcode);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return posambiguity: null', function() {
            should.not.exist(parsed.posambiguity);
        });

        it('Should return messaging: false', function() {
            assert.equal(false, parsed.messaging);
        });

        it('Should return latitude value, that when rounded should equal: 60.0520', function() {
            assert.equal(60.0520, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: 24.5045', function() {
            assert.equal(24.5045, parsed.longitude.toFixed(4));
        });

        it('Should return position resolution: 0.291', function() {
            assert.equal(0.291, parsed.posresolution);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return speed: null', function() {
            should.not.exist(parsed.speed);
        });

        it('Should return course: null', function() {
            should.not.exist(parsed.course);
        });

        it('Should return altitude: null', function() {
            should.not.exist(parsed.altitude);
        });
    });

    describe('#parseaprs - Test parsing another packet', function() {
        let $srccall = "OH2KKU-10";
        let $dstcall = "APZMDR";
        let $header = `${$srccall}>${$dstcall},WIDE3-2,qAo,OH2MQK-1`;

        // some telemetry in the comment
        let $comment = "Tero, Green Volvo 960, GGL-880";

        // The comment field contains telemetry just to see that it doesn't break
        // the actual position parsing.
        let $body = `!//zPHTfVv>!V_ ${$comment}|!!!!!!!!!!!!!!|`;

        let $aprspacket = `${$header}:${$body}`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it(`Should return the source call sign: ${$srccall}`, function() {
            assert.equal($srccall, parsed.sourceCallsign);
        });

        it(`Should return the destination call sign: ${$dstcall}`, function() {
            assert.equal($dstcall, parsed.destCallsign);
        });

        it(`Should return a header: ${$header}`, function() {
            assert.equal($header, parsed.header);
        });

        it(`Should return a body: ${$body}`, function() {
            assert.equal($body, parsed.body);
        });

        it(`Should return a comment: ${$comment}`, function() {
            assert.equal($comment, parsed.comment);
        });

        it('Should return 3 valid digis', function() {
            assert.equal(3, parsed.digipeaters.length);

            assert.equal('WIDE3-2', parsed.digipeaters[0].callsign);
            assert.equal(false, parsed.digipeaters[0].wasDigipeated);

            assert.equal('qAo', parsed.digipeaters[1].callsign);
            assert.equal(false, parsed.digipeaters[1].wasDigipeated);

            assert.equal('OH2MQK-1', parsed.digipeaters[2].callsign);
            assert.equal(false, parsed.digipeaters[2].wasDigipeated);
        });

        it('Should return the symbol table code: /', function() {
            assert.equal('/', parsed.symboltable);
        });

        it('Should return the symbol code: >', function() {
            assert.equal('>', parsed.symbolcode);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return posambiguity: null', function() {
            should.not.exist(parsed.posambiguity);
        });

        it('Should return messaging: false', function() {
            assert.equal(false, parsed.messaging);
        });

        it('Should return latitude value, that when rounded should equal: 60.3582', function() {
            assert.equal(60.3582, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: 24.8084', function() {
            assert.equal(24.8084, parsed.longitude.toFixed(4));
        });

        it('Should return position resolution: 0.291', function() {
            assert.equal(0.291, parsed.posresolution);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return speed: 107.57', function() {
            assert.equal(107.57, parsed.speed.toFixed(2));
        });

        it('Should return course: 360', function() {
            assert.equal(360, parsed.course);
        });

        it('Should return altitude: null', function() {
            should.not.exist(parsed.altitude);
        });
    });

    describe('#parseaprs - Test parsing short compressed packet without speed, altitude or course. The APRS 1.01 spec is '
             + 'clear on this - says that compressed packet is always 13 bytes long. Must not decode, even though this packet'
             + ' is otherwise valid. It\'s just missing 2 bytes of padding.', function() {
        let $aprspacket = 'KJ4ERJ-AL>APWW05,TCPIP*,qAC,FOURTH:@075111h/@@.Y:*lol ';

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return resultcode: packet_invalid', function() {
            assert.equal('packet_invalid', parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a compressed packet with weather', function() {
        let $aprspacket = 'SV4IKL-2>APU25N,WIDE2-2,qAR,SV6EXB-1:@011444z/:JF!T/W-_e!bg000t054r000p010P010h65b10073WS 2300 {UIV32N}';

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return the symbol table code: /', function() {
            assert.equal('/', parsed.symboltable);
        });

        it('Should return the symbol code: _', function() {
            assert.equal('_', parsed.symbolcode);
        });

        it('Should return a comment: "WS 2300 {UIV32N}"', function() {
            assert.equal('WS 2300 {UIV32N}', parsed.comment);
        });

        it('Should return temp: 12.2', function() {
            assert.equal(12.2, parsed.wx.temp);
        });

        it('Should return humidity: 65', function() {
            assert.equal(65, parsed.wx.humidity);
        });

        it('Should return pressure: 1007.3', function() {
            assert.equal(1007.3, parsed.wx.pressure);
        });
    });

    describe('Test parsing an invalid location packet... packet length > 106', () => {
        let packet: aprsPacket = parser.parseaprs("I5NOD-5>APMI06,TCPIP*,qAS,I5NOD:@ARI Altopascio Montecarlo Monte Cascetto Lucca slm 950 metri");

        it('Should return a packet with a result code: packet_invalid', () => {
            expect(packet.resultCode).to.equal("packet_invalid");
        });
    });

    describe('Test parsing an invalid compressed location packet', () => {
        let packet: aprsPacket = parser.parseaprs("SR3NRI>APNW01,SR3NJE*,qAR,SR3NDG:/111959zNEW SOFT WX3In1+ TEST");

        it('Should return a packet with a result code: comp_inv', () => {
            expect(packet.resultCode).to.equal("comp_inv");
        });
    });

});
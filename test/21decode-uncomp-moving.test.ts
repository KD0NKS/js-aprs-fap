/**
 * a basic uncompressed packet decoding test for a moving target
 * Tue Dec 11 2007, Hessu, OH7LZB
 */
import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import aprsPacket from '../src/aprsPacket';
import { PacketTypeEnum } from '../src/PacketTypeEnum';
import aprsParser from '../src/parser';

describe('FAP - Test decoding uncompressed packets', function() {
    let parser: aprsParser = new aprsParser();

    describe('#parseaprs - Test parsing uncompressed packet', function() {
        let $srccall = "OH7FDN";
        let $dstcall = "APZMDR";
        let $header = $srccall + '>' + $dstcall + ',OH7AA-1*,WIDE2-1,qAR,OH7AA';

        // The comment field contains telemetry just to see that it doesn't break
        // the actual position parsing.
        let $body = "!6253.52N/02739.47E>036/010/A=000465 |!!!!!!!!!!!!!!|";

        let $aprspacket = $header + ':' + $body;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return the source call sign: ' + $srccall, function() {
            assert.equal($srccall, parsed.sourceCallsign);
        });

        it('Should return the destination call sign: ' + $dstcall, function() {
            assert.equal($dstcall, parsed.destCallsign);
        });

        it('Should return a header: ' + $header, function() {
            assert.equal($header, parsed.header);
        });

        it('Should return a body: ' + $body, function() {
            assert.equal($body, parsed.body);
        });

        it('Should return a type: location', function() {
            assert.equal(PacketTypeEnum.LOCATION, parsed.type);
        });

        it('Should return 3 valid digis', function() {
            assert.equal(4, parsed.digipeaters.length);

            assert.equal('OH7AA-1', parsed.digipeaters[0].callsign);
            assert.equal(true, parsed.digipeaters[0].wasDigipeated);

            assert.equal('WIDE2-1', parsed.digipeaters[1].callsign);
            assert.equal(false, parsed.digipeaters[1].wasDigipeated);

            assert.equal('qAR', parsed.digipeaters[2].callsign);
            assert.equal(false, parsed.digipeaters[2].wasDigipeated);

            assert.equal('OH7AA', parsed.digipeaters[3].callsign);
            assert.equal(false, parsed.digipeaters[3].wasDigipeated);
        });

        it('Should return the symbol table code: /', function() {
            assert.equal('/', parsed.symboltable);
        });

        it('Should return the symbol code: >', function() {
            assert.equal('>', parsed.symbolcode);
        });

        it('Should return posambiguity: 0', function() {
            assert.equal(0, parsed.posambiguity);
        });

        it('Should return messaging: false', function() {
            assert.equal(false, parsed.messaging);
        });

        it('Should return latitude value, that when rounded should equal: 62.8920', function() {
            assert.equal(62.8920, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: 27.6578', function() {
            assert.equal(27.6578, parsed.longitude.toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            assert.equal(18.52, parsed.posresolution);
        });

        it('Should return speed: 18.52', function() {
            assert.equal(18.52, parsed.speed);
        });

        it('Should return course: 36', function() {
            assert.equal(36, parsed.course);
        });

        it('Should return altitude: 141.732', function() {
            assert.equal(141.732, parsed.altitude);
        });
    });

    describe('#parseaprs - Test parsing uncompressed packet with invalid course and invalid speed', function () {
        let $srccall = "OH7FDN";
        let $dstcall = "APZMDR";
        let $header = $srccall + '>' + $dstcall + ',OH7AA-1*,WIDE2-1,qAR,OH7AA';

        // The comment field contains telemetry just to see that it doesn't break
        // the actual position parsing.
        let $body = "!6253.52N/02739.47E>366/   /A=000465 |!!!!!!!!!!!!!!|";

        let $aprspacket = $header + ':' + $body;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return course: 0', function () {
            assert.equal(0, parsed.course);
        });

        it('Should not return a speed', function () {
            should.not.exist(parsed.speed, 'Speed should not exist')
        });
    });
});
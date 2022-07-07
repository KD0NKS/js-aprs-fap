/**
 * test timestamp option decoding
 */
const assert = require('assert');

import { AprsPacket } from '../src/models/AprsPacket';
import { AprsParser } from '../src/parsers/AprsParser';
import { ParserOptions } from '../src/parsers/ParserOptions';

describe('FAP - Test decoding timestamps', function() {
    const parser = new AprsParser();
    let parserOptions = new ParserOptions();

    describe('#parseaprs - First, try to get the raw timestamp through', function() {
        const padding = '00';
        const date = new Date();
        const tstamp = ((padding + date.getUTCDate()).slice(-2)
                + (padding + date.getUTCHours()).slice(-2)
                + (padding + date.getUTCMinutes()).slice(-2)
                );

        parserOptions.isRawTimestamp = true;

        const parsed: AprsPacket = parser.parseAprs(`KB3HVP-14>APU25N,N8TJG-10*,WIDE2-1,qAR,LANSNG:@${tstamp}z4231.16N/08449.88Wu227/052/A=000941 {UIV32N}`, parserOptions);

        it(`Should return a timestamp: ${tstamp}`, function() {
            assert.equal(tstamp, parsed.timestamp);
        });
    });

    describe('#parseaprs - Then, try the one decoded to an UNIX timestamp', function() {
        const padding = '00';
        const date = new Date();
        const outcome = Math.floor(date.getTime() / 1000) - Math.floor((date.getTime() / 1000) % 60); // will round down to the minute
        const tstamp = ((padding + date.getUTCDate()).slice(-2)
                + (padding + date.getUTCHours()).slice(-2)
                + (padding + date.getUTCMinutes()).slice(-2)
                );

        const packet = `KB3HVP-14>APU25N,N8TJG-10*,WIDE2-1,qAR,LANSNG:@${tstamp}z4231.16N/08449.88Wu227/052/A=000941 {UIV32N}`;

        const parsed: AprsPacket = parser.parseAprs(packet);

        it(`Should return a timestamp: ${outcome}`, function() {
            assert.equal(outcome, parsed.timestamp);
        });
    });

    describe('#parseaprs - Raw again, from a HMS version', function() {
        parserOptions.isRawTimestamp = true;

        const parsed: AprsPacket = parser.parseAprs(
                "G4EUM-9>APOTC1,G4EUM*,WIDE2-2,qAS,M3SXA-10:/055816h5134.38N/00019.47W>155/023!W26!/A=000188 14.3V 27C HDOP01.0 SATS09"
                , parserOptions
                );

        it("Should return a timestamp: 055816", function() {
            assert.equal('055816', parsed.timestamp);
        });
    });

    describe('#parseaprs - decoded UNIX timestamp from HMS', function() {
        // TODO: Javascript getTime is always UTC, not GMT, does this matter?
        // Dealing with GMT would require an extra library.
        const padding = '00';
        const now = new Date();
        const nowTime = Math.floor(now.getTime() / 1000);
        const tstamp = ((padding + now.getUTCHours()).slice(-2)
                + (padding + now.getUTCMinutes()).slice(-2)
                + (padding + now.getUTCSeconds()).slice(-2)
                );

        const parsed = parser.parseAprs(`G4EUM-9>APOTC1,G4EUM*,WIDE2-2,qAS,M3SXA-10:/${tstamp}h5134.38N/00019.47W>155/023!W26!/A=000188 14.3V 27C HDOP01.0 SATS09`);

        it(`Should return a timestamp: ${nowTime}`, function() {
            assert.equal(nowTime, parsed.timestamp);
        });
    });

    describe('#parseaprs - raw again, from a local-time DMH', function() {
        parserOptions.isRawTimestamp = true;
        const parsed: AprsPacket = parser.parseAprs(
                "G4EUM-9>APOTC1,G4EUM*,WIDE2-2,qAS,M3SXA-10:/060642/5134.38N/00019.47W>155/023!W26!/A=000188 14.3V 27C HDOP01.0 SATS09"
                , parserOptions
                );

        it(`Should return a timestamp: 060642`, function() {
            assert.equal('060642', parsed.timestamp);
        });
    });

    describe('#parseaprs - decoded UNIX timestamp from local-time DMH', function() {
        const padding = '00';
        const now = new Date();
        const nowTime = Math.floor(now.getTime() / 1000);
        const outcome = nowTime - (nowTime % 60);
        const tstamp = ((padding + now.getDate()).slice(-2)
                + (padding + now.getHours()).slice(-2)
                + (padding + now.getMinutes()).slice(-2)
                );

        const parsed: AprsPacket = parser.parseAprs(`G4EUM-9>APOTC1,G4EUM*,WIDE2-2,qAS,M3SXA-10:/${tstamp}/5134.38N/00019.47W>155/023!W26!/A=000188 14.3V 27C HDOP01.0 SATS09`);

        it(`Should return a timestamp: ${tstamp}`, function() {
            assert.equal(outcome, parsed.timestamp);
        });
    });
});
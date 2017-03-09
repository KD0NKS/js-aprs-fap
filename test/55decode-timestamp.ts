/**
 * test timestamp option decoding
 */
const assert = require('assert');

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

describe('FAP - Test decoding timestamps', function() {
    let parser = new aprsParser();

    describe('#parseaprs - First, try to get the raw timestamp through', function() {
        let padding = '00';
        let date = new Date();
        let tstamp = ((padding + date.getUTCDate()).slice(-2)
                + (padding + date.getUTCHours()).slice(-2)
                + (padding + date.getUTCMinutes()).slice(-2)
                );

        let $aprspacket = `KB3HVP-14>APU25N,N8TJG-10*,WIDE2-1,qAR,LANSNG:@${tstamp}z4231.16N/08449.88Wu227/052/A=000941 {UIV32N}`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket, { "raw_timestamp": true });

        it(`Should return a timestamp: ${tstamp}`, function() {
            assert.equal(tstamp, parsed.timestamp);
        });
    });

    describe('#parseaprs - Then, try the one decoded to an UNIX timestamp', function() {
        let padding = '00';
        let date = new Date();
        let outcome = Math.floor(date.getTime() / 1000) - Math.floor((date.getTime() / 1000) % 60); // will round down to the minute
        let tstamp = ((padding + date.getUTCDate()).slice(-2)
                + (padding + date.getUTCHours()).slice(-2)
                + (padding + date.getUTCMinutes()).slice(-2)
                );

        let $aprspacket = `KB3HVP-14>APU25N,N8TJG-10*,WIDE2-1,qAR,LANSNG:@${tstamp}z4231.16N/08449.88Wu227/052/A=000941 {UIV32N}`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it(`Should return a timestamp: ${outcome}`, function() {
            assert.equal(outcome, parsed.timestamp);
        });
    });

    describe('#parseaprs - Raw again, from a HMS version', function() {
        let $aprspacket = `G4EUM-9>APOTC1,G4EUM*,WIDE2-2,qAS,M3SXA-10:/055816h5134.38N/00019.47W>155/023!W26!/A=000188 14.3V 27C HDOP01.0 SATS09`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket, { "raw_timestamp": true });

        it(`Should return a timestamp: 055816`, function() {
            assert.equal('055816', parsed.timestamp);
        });
    });

    describe('#parseaprs - decoded UNIX timestamp from HMS', function() {
        // TODO: Javascript getTime is always UTC, not GMT, does this matter?
        // Dealing with GMT would require an extra library.
        let padding = '00';
        let now = new Date();
        let nowTime = Math.floor(now.getTime() / 1000);
        let tstamp = ((padding + now.getUTCHours()).slice(-2)
                + (padding + now.getUTCMinutes()).slice(-2)
                + (padding + now.getUTCSeconds()).slice(-2)
                );

        let $aprspacket = `G4EUM-9>APOTC1,G4EUM*,WIDE2-2,qAS,M3SXA-10:/${tstamp}h5134.38N/00019.47W>155/023!W26!/A=000188 14.3V 27C HDOP01.0 SATS09`;

        let parsed = parser.parseaprs($aprspacket);

        it(`Should return a timestamp: ${nowTime}`, function() {
            assert.equal(nowTime, parsed.timestamp);
        });
    });

    describe('#parseaprs - raw again, from a local-time DMH', function() {
        let $aprspacket = `G4EUM-9>APOTC1,G4EUM*,WIDE2-2,qAS,M3SXA-10:/060642/5134.38N/00019.47W>155/023!W26!/A=000188 14.3V 27C HDOP01.0 SATS09`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket, { "raw_timestamp": true });

        it(`Should return a timestamp: 060642`, function() {
            assert.equal('060642', parsed.timestamp);
        });
    });

    describe('#parseaprs - decoded UNIX timestamp from local-time DMH', function() {
        let padding = '00';
        let now = new Date();
        let nowTime = Math.floor(now.getTime() / 1000);
        let outcome = nowTime - (nowTime % 60);
        let tstamp = ((padding + now.getDate()).slice(-2)
                + (padding + now.getHours()).slice(-2)
                + (padding + now.getMinutes()).slice(-2)
                );

        let $aprspacket = `G4EUM-9>APOTC1,G4EUM*,WIDE2-2,qAS,M3SXA-10:/${tstamp}/5134.38N/00019.47W>155/023!W26!/A=000188 14.3V 27C HDOP01.0 SATS09`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it(`Should return a timestamp: ${tstamp}`, function() {
            assert.equal(outcome, parsed.timestamp);
        });
    });
});
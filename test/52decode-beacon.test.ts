// message decoding
// Tue Dec 11 2007, Hessu, OH7LZB
const assert = require('assert');

import { AprsParser } from '../src/parsers/AprsParser';

describe('FAP - Test parsing beacons', function() {
    const parser = new AprsParser();

    describe('#parseaprs - Test a beacon parsing', function() {
        const srccall = "OH2RDU";
        const dstcall = "UIDIGI";
        const message = " UIDIGI 1.9";

        const retVal = parser.parseAprs(`${srccall}>${dstcall}:${message}`);

        it(`Should return srccallsign: ${srccall}`, function() {
            assert.equal(srccall, retVal.sourceCallsign);
        });

        it(`Should return a dstcall: ${dstcall}`, function() {
            assert.equal(dstcall, retVal.destCallsign);
        });

        it(`Should return body value: ${message}`, function() {
            assert.equal(message, retVal.body);
        });
    });
});
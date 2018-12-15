// message decoding
// Tue Dec 11 2007, Hessu, OH7LZB
const assert = require('assert');

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

describe('FAP - Test parsing beacons', function() {
    let parser = new aprsParser();

    describe('#parseaprs - Test a beacon parsing', function() {
        let srccall = "OH2RDU";
        let dstcall = "UIDIGI";
        let message = " UIDIGI 1.9";

        let aprspacket = srccall + '>' + dstcall + ':' + message;
        let retVal = parser.parseaprs(aprspacket);

        it('Should return srccallsign: ' + srccall, function() {
            assert.equal(srccall, retVal.sourceCallsign);
        });

        it('Should return a dstcall: ' + dstcall, function() {
            assert.equal(dstcall, retVal.destCallsign);
        });

        it('Should return body value: ' + message, function() {
            assert.equal(message, retVal.body);
        });
    });
});
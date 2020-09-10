/**
 * object decoding - bad packet
 * the packet contains has some binary characters, which were destroyed in
 * a cut 'n paste operation
 * Tue Dec 11 2007, Hessu, OH7LZB
 */
import * as chai from 'chai';

const assert = chai.assert;

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

describe('FAP - Test parsing a bad packet', function() {
    let parser: aprsParser = new aprsParser();

    describe('#parseaprs - Test parsing a bad packet', function() {
        let $srccall = "OH2KKU-1";
        let $dstcall = "APRS";

        let $aprspacket = `${$srccall}>${$dstcall},TCPIP*,qAC,FIRST:;SRAL HQ *110507zS0%E/Th4_a AKaupinmaenpolku9,open M-Th12-17,F12-14 lcl`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return a resultcode: obj_inv', function() {
            assert.equal('obj_inv', parsed.resultCode);
        });

        it('Should return a type: object', function() {
            assert.equal('object', parsed.type);
        });
    });

    // Note: the perl version will never hit this scenario as it dumps out when trying to decide what type of packet it is
    // because it is less than 31 characters
    describe('#parseaprs - Test parsing a bad packet', function () {
        let $srccall = "OH2KKU-1";
        let $dstcall = "APRS";

        let $aprspacket = `${$srccall}>${$dstcall}:;110507zS0%E/Th4_a AK`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket, { isax25: true });

        it('Should return a resultcode: obj_short', function () {
            assert.equal('obj_short', parsed.resultCode);
        });

        it('Should return a type: object', function () {
            assert.equal('object', parsed.type);
        });
    });
});
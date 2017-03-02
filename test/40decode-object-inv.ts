/**
 * object decoding - bad packet
 * the packet contains has some binary characters, which were destroyed in
 * a cut 'n paste operation
 * Tue Dec 11 2007, Hessu, OH7LZB
 *
var assert = require('assert')
        , parser = require('../parser')
        , should = require('chai').should()
        ;

describe('FAP - Test parsing a bad packet', function() {
    describe('#parseaprs - Test parsing a bad packet', function() {
        let $srccall = "OH2KKU-1";
        let $dstcall = "APRS";

        let $aprspacket = `${$srccall}>${$dstcall},TCPIP*,qAC,FIRST:;SRAL HQ *110507zS0%E/Th4_a AKaupinmaenpolku9,open M-Th12-17,F12-14 lcl`;

        let parsed = parser.parseaprs($aprspacket);

        it('Should return a resultcode: obj_inv', function() {
            assert.equal('obj_inv', parsed['resultcode']);
        });

        it('Should return a type: object', function() {
            assert.equal('object', parsed['type']);
        });
    });
});
*/
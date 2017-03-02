/*
const assert = require('assert')
        , should = require('chai').should()
        , parser = require('../parser')
        ;

describe('FAP - Telemetry packet parsing', function() {
    describe('#parseaprs - Telemetry parse test', function() {
        let $srccall = "SRCCALL";
        let $dstcall = "APRS";
        let $aprspacket = $srccall + '>' + $dstcall + ':T#324,000,038,257,255,50.12,01000001';

        let $retval = parser.parseaprs($aprspacket);

        it('Should return a result code: null', function() {
            assert.equal(null, $retval['resultcode']);
        });

        it('Should return a telemetry object', function() {
            should.exist($retval['telemetry']);
        });

        it('Should return a seq value: 324', function() {
            assert.equal(324, $retval['telemetry'].seq);
        });

        it('Should return bits: 01000001', function() {
            assert.equal('01000001', $retval['telemetry'].bits);
        });

        it('Should return telemetry vals[0]: 0.00', function() {
            assert.equal('0.00', $retval['telemetry'].vals[0]);
        });

        it('Should return telemetry vals[0]: 38.00', function() {
            assert.equal('38.00', $retval['telemetry'].vals[1]);
        });

        it('Should return telemetry vals[0]: 257.00', function() {
            assert.equal('257.00', $retval['telemetry'].vals[2]);
        });

        it('Should return telemetry vals[0]: 255.00', function() {
            assert.equal('255.00', $retval['telemetry'].vals[3]);
        });

        it('Should return telemetry vals[0]: 50.12', function() {
            assert.equal('50.12', $retval['telemetry'].vals[4]);
        });
    });
});
*/
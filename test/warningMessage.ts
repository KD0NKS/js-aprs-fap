// a bad packet test
// Tue Dec 11 2007, Hessu, OH7LZB
import aprsPacket from '../src/aprsPacket'
import aprsParser from '../src/parser';

//import * as chai from 'chai';

const assert = require('assert');
const should = require('chai').should();

describe('FAP - test warning message function', function() {
    let parser = new aprsParser();

    describe('#parseaprs - test result messages where the warning code message is defined', function() {
        //let parsed = { "test": "test" };
        let parsed = new aprsPacket();
        parsed.type = "test";

        parsed = parser.addWarning(parsed, "unknown", "test");

        it("Should return a an array of warncodes.", function() {
            should.exist(parsed.warningCodes);
        });

        it("Should return an array of warncodes with 1 element: 'unknown'", function() {
            assert.equal(1, parsed.warningCodes.length);
            assert.equal("unknown", parsed.warningCodes[0]);
        });

        it("Should return a resultmsg: Unsupported packet format: test", function() {
            assert.equal("Unsupported packet format: test", parsed.resultMessage);
        });
    });

    describe('#parseaprs - test result messages where the warning code message is not defined', function() {
        let parsed = new aprsPacket();
        parsed.warningCodes = [ "unknown" ];

        parsed = parser.addWarning(parsed, "test_code", "test");

        it("Should return an array of warncodes with 1 element: 'unknown'", function() {
            assert.equal(2, parsed.warningCodes.length);
            assert.equal("unknown", parsed.warningCodes[0]);
            assert.equal("test_code", parsed.warningCodes[1]);
        });

        it("Should return a resultmsg: test_code", function() {
            assert.equal("test_code: test", parsed.resultMessage);
        });
    });
});
// @ts-nocheck strictNullChecks

// a bad packet test
// Tue Dec 11 2007, Hessu, OH7LZB
import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import { AprsPacket } from '../src/models/AprsPacket';
import { AprsParser } from '../src/parsers/AprsParser';

describe('FAP - test warning message function', function() {
    const parser = new AprsParser();

    describe('#parseaprs - test result messages where the warning code message is defined', function() {
        //let parsed = { "test": "test" };
        let parsed: AprsPacket = new AprsPacket();
        parsed.type = "test";

        parsed = parser.addWarning(parsed, "unknown", "test");

        it("Should return a an array of warncodes.", function() {
            should.exist(parsed.warningCodes);
        });

        it("Should return an array of warncodes with 1 element: 'unknown'", function() {
            assert.equal(1, parsed.warningCodes?.length);
            assert.equal("unknown", parsed.warningCodes[0]);
        });

        it("Should return a resultmsg: Unsupported packet format: test", function() {
            assert.equal("Unsupported packet format: test", parsed.resultMessage);
        });
    });

    describe('#parseaprs - test result messages where the warning code message is not defined', function() {
        let parsed: AprsPacket = new AprsPacket();
        parsed.warningCodes = [ "unknown" ];

        parsed = parser.addWarning(parsed, "test_code", "test");

        it("Should return an array of warncodes with 1 element: 'unknown'", function() {
            assert.equal(2, parsed.warningCodes?.length);
            assert.equal("unknown", parsed.warningCodes[0]);
            assert.equal("test_code", parsed.warningCodes[1]);
        });

        it("Should return a resultmsg: test_code", function() {
            assert.equal("test_code: test", parsed.resultMessage);
        });
    });

    describe('#parseaprs - test result message where a value is not given.', function() {
        let parsed: AprsPacket = new AprsPacket();
        parsed = parser.addWarning(parsed, "test_code");

        it("Should return a resultmsg: test_code", function() {
            assert.equal("test_code", parsed.resultMessage);
        });
    });
});
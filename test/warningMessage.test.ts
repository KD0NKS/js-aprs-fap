// a bad packet test
// Tue Dec 11 2007, Hessu, OH7LZB
import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

describe('FAP - test warning message function', () => {
    let parser = new aprsParser();

    describe('#parseaprs - test result messages where the warning code message is defined', () => {
        //let parsed = { "test": "test" };
        let parsed: aprsPacket = new aprsPacket();
        parsed.type = "test";

        parsed = parser.addWarning(parsed, "unknown", "test");

        it("Should return a an array of warncodes.", () => {
            should.exist(parsed.warningCodes);
        });

        it("Should return an array of warncodes with 1 element: 'unknown'", () => {
            assert.equal(1, parsed.warningCodes.length);
            assert.equal("unknown", parsed.warningCodes[0]);
        });

        it("Should return a resultmsg: Unsupported packet format: test", () => {
            assert.equal("Unsupported packet format: test", parsed.resultMessage);
        });
    });

    describe('#parseaprs - test result messages where the warning code message is not defined', () => {
        let parsed: aprsPacket = new aprsPacket();
        parsed.warningCodes = [ "unknown" ];

        parsed = parser.addWarning(parsed, "test_code", "test");

        it("Should return an array of warncodes with 1 element: 'unknown'", () => {
            assert.equal(2, parsed.warningCodes.length);
            assert.equal("unknown", parsed.warningCodes[0]);
            assert.equal("test_code", parsed.warningCodes[1]);
        });

        it("Should return a resultmsg: test_code", () => {
            assert.equal("test_code: test", parsed.resultMessage);
        });
    });

    describe('#parseaprs - test result message where a value is not given.', () => {
        let parsed: aprsPacket = new aprsPacket();
        parsed = parser.addWarning(parsed, "test_code");

        it("Should return a resultmsg: test_code", () => {
            assert.equal("test_code", parsed.resultMessage);
        });
    });
});
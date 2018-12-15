import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();
const expect = chai.expect;

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

describe('FAP - test warning message function', () => {
    let parser = new aprsParser();

    describe('#parseaprs - test where the result messages does not contain the error code.', () => {
        let parsed: aprsPacket = new aprsPacket();

        parsed = parser.addError(parsed, 'test');

        it("Should return a result message: 'test: undefined'", () => {
            expect(parsed.resultMessage).equals('test: undefined');
        });
    });
});
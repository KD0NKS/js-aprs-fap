const assert = require('assert');

import { AprsPacket } from '../src/models/AprsPacket';
import { AprsParser } from '../src/parsers/AprsParser';

describe('FAP - test warning message function', () => {
    let parser = new AprsParser();

    describe('#parseaprs - test where the result messages does not contain the error code.', () => {
        let parsed: AprsPacket = new AprsPacket();

        parsed = parser.addError(parsed, 'test');

        it("Should return a result message: 'test: undefined'", () => {
            assert.equal('test: undefined', parsed.resultMessage);
        });
    });
});
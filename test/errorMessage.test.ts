const assert = require('assert');

import { AprsPacket } from '../src/models/AprsPacket';
import { AprsParser } from '../src/parsers/AprsParser';

describe('FAP - test warning message function', function() {
    const parser = new AprsParser();

    describe('#parseaprs - test where the result messages does not contain the error code.', function() {
        let parsed: AprsPacket = new AprsPacket();

        parsed = parser.addError(parsed, 'test');

        it("Should return a result message: 'test: undefined'", function() {
            assert.equal('test: undefined', parsed.resultMessage);
        });
    });
});
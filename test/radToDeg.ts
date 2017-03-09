var assert = require('assert');
import aprsParser from '../src/parser';

describe('#radToDeg', function() {
    let parser = new aprsParser();

    it('should return ~0.017453', function() {
        assert.equal(57.29577951308232, parser.radToDeg(1));
    });
});
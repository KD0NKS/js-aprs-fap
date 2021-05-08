var assert = require('assert');
import ConversionUtil from '../src/utils/ConversionUtil';

describe('#radToDeg', function() {
    it('should return ~0.017453', function() {
        assert.equal(57.29577951308232, ConversionUtil.RadToDeg(1));
    });
});
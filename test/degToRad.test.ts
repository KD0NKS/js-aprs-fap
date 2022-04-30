var assert = require('assert');
import { ConversionUtil } from '../src/utils/ConversionUtil';

describe('#degToRad', function() {
    it('should return ~0.017453', function() {
        assert.equal(0.017453292519943295, ConversionUtil.DegToRad(1));
    });
});
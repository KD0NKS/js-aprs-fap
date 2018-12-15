var assert = require('assert');
import aprsParser from '../src/parser';

describe('#degToRad', function() {
    let parser = new aprsParser();

    it('should return ~0.017453', function() {
        assert.equal(0.017453292519943295, parser.degToRad(1));
    });
});
const assert = require('assert');

import aprsPacket from '../src/aprsPacket';
import digipeater from '../src/digipeater';
import aprsParser from '../src/parser';

// validate the check_ax25_call function

describe('FAP - Validate the check_ax25_call function', function() {
    let parser = new aprsParser();

    describe('#check_ax25_call - Check valid call signs.', function() {
        it('Should return: OH7LZB', function() {
            assert.equal('OH7LZB', parser.checkAX25Call('OH7LZB'));
        });

        it('Should return: OH7LZB-9', function() {
            assert.equal('OH7LZB-9', parser.checkAX25Call('OH7LZB-9'));
        });

        it('Should return: OH7LZB-15', function() {
            assert.equal('OH7LZB-15', parser.checkAX25Call('OH7LZB-15'));
        });
    });

    describe('FAP - Validate the check_ax25_call function these should fail.', function() {
        it('Should return: null', function() {
            assert.equal(null, parser.checkAX25Call('OH7LZB-16'));
        });

        it('Should return: null', function() {
            assert.equal(null, parser.checkAX25Call('OH7LZB-166'));
        });

        it('Should return: null', function() {
            assert.equal(null, parser.checkAX25Call('OH7LZBXXX'));
        });
    });
});
const assert = require('assert');

import aprsParser from '../src/parser';

describe('checkDate', function() {
    let parser = new aprsParser();

    describe('Test valid checkdate', function() {
        let isValidDate = parser.checkDate(2011, 5, 30);

        it(`Should return return true for valid date.`, function() {
            assert.equal(true, isValidDate);
        });
    });

    describe('Test invalid checkdate', function() {
        let isValidDate = parser.checkDate(2011, 5, 31);

        it(`Should return return false for valid date.`, function() {
            assert.equal(false, isValidDate);
        });
    });
});
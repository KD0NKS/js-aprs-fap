const assert = require('assert');

import { ConversionUtil } from '../src/utils/ConversionUtil';

describe('checkDate', function() {
    describe('Test valid checkdate', function() {
        const isValidDate = ConversionUtil.CheckDate(2011, 5, 30);

        it(`Should return return true for valid date.`, function() {
            assert.equal(true, isValidDate);
        });
    });

    describe('Test invalid checkdate', function() {
        const isValidDate = ConversionUtil.CheckDate(2011, 5, 31);

        it(`Should return return false for valid date.`, function() {
            assert.equal(false, isValidDate);
        });
    });
});
const assert = require('assert');

import { KissUtil } from '../src/KissUtil';

// a mic-e decoding test
// Tue Dec 11 2007, Hessu, OH7LZB
describe('FAP - Test parsing mic-e packages', () => {
    //let parser: aprsParser = new aprsParser();
    let util: KissUtil = new KissUtil();

    describe('Test 1', () => {
        let aprspacket = "TEST-9>TEST,WIDE1-1,WIDE2-1:!3430.00SI15000.00E#1";
        let test = util.tnc2ToKiss(aprspacket)

        if(test?.charAt(0) == String.fromCharCode(parseInt("c0", 16))) {
            test = test.substring(1)
        }

        if(test?.endsWith(String.fromCharCode(parseInt("c0", 16)))) {
            test = test.substring(0, test.length - 1);
        }

        test = util.kissToTnc2(String(test))

        /*
        * Convert a KISS-frame into a TNC-2 compatible UI-frame. Non-UI and non-pid-F0 frames are dropped.
        * @param {string} frame The KISS-frame to be decoded should not have FEND (0xC0) characters
        * in the beginning or in the end. Byte unstuffing must not be done before calling this function.
        */

        it("Should result in matching packets", () => {
            assert.equal(aprspacket, test)
        })
    })

    describe('Test 2', () => {
        let aprspacket = "TEST-9>TEST,WIDE1-1,WIDE2-2:!3430.00SI15000.00E#2";
        let test = util.tnc2ToKiss(aprspacket)

        if(test?.charAt(0) == String.fromCharCode(parseInt("c0", 16))) {
            test = test.substring(1)
        }

        if(test?.endsWith(String.fromCharCode(parseInt("c0", 16)))) {
            test = test.substring(0, test.length - 1);
        }

        test = util.kissToTnc2(String(test))

        /*
        * Convert a KISS-frame into a TNC-2 compatible UI-frame. Non-UI and non-pid-F0 frames are dropped.
        * @param {string} frame The KISS-frame to be decoded should not have FEND (0xC0) characters
        * in the beginning or in the end. Byte unstuffing must not be done before calling this function.
        */

        it("Should result in matching packets", () => {
            assert.equal(aprspacket, test)
        })
    })

    describe('Test 3', () => {
        let aprspacket = "TEST-9>TEST,WIDE2-2:!3430.00SI15000.00E#3";
        let test = util.tnc2ToKiss(aprspacket)

        if(test?.charAt(0) == String.fromCharCode(parseInt("c0", 16))) {
            test = test.substring(1)
        }

        if(test?.endsWith(String.fromCharCode(parseInt("c0", 16)))) {
            test = test.substring(0, test.length - 1);
        }

        test = util.kissToTnc2(String(test))

        /*
        * Convert a KISS-frame into a TNC-2 compatible UI-frame. Non-UI and non-pid-F0 frames are dropped.
        * @param {string} frame The KISS-frame to be decoded should not have FEND (0xC0) characters
        * in the beginning or in the end. Byte unstuffing must not be done before calling this function.
        */

        it("Should result in matching packets", () => {
            assert.equal(aprspacket, test)
        })
    })

    describe('Test 4', () => {
        let aprspacket = "TEST-9>TEST,WIDE1-1,TEST*,WIDE2-1:!3430.00SI15000.00E#4";
        let test = util.tnc2ToKiss(aprspacket)

        if(test?.charAt(0) == String.fromCharCode(parseInt("c0", 16))) {
            test = test.substring(1)
        }

        if(test?.endsWith(String.fromCharCode(parseInt("c0", 16)))) {
            test = test.substring(0, test.length - 1);
        }

        test = util.kissToTnc2(String(test))

        /*
        * Convert a KISS-frame into a TNC-2 compatible UI-frame. Non-UI and non-pid-F0 frames are dropped.
        * @param {string} frame The KISS-frame to be decoded should not have FEND (0xC0) characters
        * in the beginning or in the end. Byte unstuffing must not be done before calling this function.
        */

        it("Should result in matching packets", () => {
            assert.equal(aprspacket, test)
        })
    })

    describe('Test 5', () => {
        let aprspacket = "TEST-9>TEST,WIDE1*,WIDE2-1:!3430.00SI15000.00E#5";
        let test = util.tnc2ToKiss(aprspacket)

        if(test?.charAt(0) == String.fromCharCode(parseInt("c0", 16))) {
            test = test.substring(1)
        }

        if(test?.endsWith(String.fromCharCode(parseInt("c0", 16)))) {
            test = test.substring(0, test.length - 1);
        }

        test = util.kissToTnc2(String(test))

        /*
        * Convert a KISS-frame into a TNC-2 compatible UI-frame. Non-UI and non-pid-F0 frames are dropped.
        * @param {string} frame The KISS-frame to be decoded should not have FEND (0xC0) characters
        * in the beginning or in the end. Byte unstuffing must not be done before calling this function.
        */

        it("Should result in matching packets", () => {
            assert.equal(aprspacket, test)
        })
    })

    describe('Test 6', () => {
        let aprspacket = "TEST-9>TEST,TEST*,WIDE1*,WIDE2-1:!3430.00SI15000.00E#6";
        let test = util.tnc2ToKiss(aprspacket)

        if(test?.charAt(0) == String.fromCharCode(parseInt("c0", 16))) {
            test = test.substring(1)
        }

        if(test?.endsWith(String.fromCharCode(parseInt("c0", 16)))) {
            test = test.substring(0, test.length - 1);
        }

        test = util.kissToTnc2(String(test))

        /*
        * Convert a KISS-frame into a TNC-2 compatible UI-frame. Non-UI and non-pid-F0 frames are dropped.
        * @param {string} frame The KISS-frame to be decoded should not have FEND (0xC0) characters
        * in the beginning or in the end. Byte unstuffing must not be done before calling this function.
        */

        it("Should result in matching packets", () => {
            assert.equal(aprspacket, test)
        })
    })

    describe('Test 10', () => {
        let aprspacket = "TEST-9>TEST,VK2AMW-1,WIDE2-1:!3430.00SI15000.00E#10";
        let test = util.tnc2ToKiss(aprspacket)

        if(test?.charAt(0) == String.fromCharCode(parseInt("c0", 16))) {
            test = test.substring(1)
        }

        if(test?.endsWith(String.fromCharCode(parseInt("c0", 16)))) {
            test = test.substring(0, test.length - 1);
        }

        test = util.kissToTnc2(String(test))

        /*
        * Convert a KISS-frame into a TNC-2 compatible UI-frame. Non-UI and non-pid-F0 frames are dropped.
        * @param {string} frame The KISS-frame to be decoded should not have FEND (0xC0) characters
        * in the beginning or in the end. Byte unstuffing must not be done before calling this function.
        */

        it("Should result in matching packets", () => {
            assert.equal(aprspacket, test)
        })
    })

    describe('Test 11', () => {
        let aprspacket = "TEST-9>TEST,VK2RHR-1,WIDE2-1:!3430.00SI15000.00E#11";
        let test = util.tnc2ToKiss(aprspacket)

        if(test?.charAt(0) == String.fromCharCode(parseInt("c0", 16))) {
            test = test.substring(1)
        }

        if(test?.endsWith(String.fromCharCode(parseInt("c0", 16)))) {
            test = test.substring(0, test.length - 1);
        }

        test = util.kissToTnc2(String(test))

        /*
        * Convert a KISS-frame into a TNC-2 compatible UI-frame. Non-UI and non-pid-F0 frames are dropped.
        * @param {string} frame The KISS-frame to be decoded should not have FEND (0xC0) characters
        * in the beginning or in the end. Byte unstuffing must not be done before calling this function.
        */

        it("Should result in matching packets", () => {
            assert.equal(aprspacket, test)
        })
    })

    describe('Test 51', () => {
        let aprspacket = "TEST-9>TEST,WIDE1-1,WIDE2-4:!3430.00SI15000.00E#51";
        let test = util.tnc2ToKiss(aprspacket)

        if(test?.charAt(0) == String.fromCharCode(parseInt("c0", 16))) {
            test = test.substring(1)
        }

        if(test?.endsWith(String.fromCharCode(parseInt("c0", 16)))) {
            test = test.substring(0, test.length - 1);
        }

        test = util.kissToTnc2(String(test))

        /*
        * Convert a KISS-frame into a TNC-2 compatible UI-frame. Non-UI and non-pid-F0 frames are dropped.
        * @param {string} frame The KISS-frame to be decoded should not have FEND (0xC0) characters
        * in the beginning or in the end. Byte unstuffing must not be done before calling this function.
        */

        it("Should result in matching packets", () => {
            assert.equal(aprspacket, test)
        })
    })

    describe('Test 52', () => {
        let aprspacket = "TEST-9>TEST,WIDE1-1,WIDE2-2,WIDE2-2:!3430.00SI15000.00E#52";
        let test = util.tnc2ToKiss(aprspacket)

        if(test?.charAt(0) == String.fromCharCode(parseInt("c0", 16))) {
            test = test.substring(1)
        }

        if(test?.endsWith(String.fromCharCode(parseInt("c0", 16)))) {
            test = test.substring(0, test.length - 1);
        }

        test = util.kissToTnc2(String(test))

        /*
        * Convert a KISS-frame into a TNC-2 compatible UI-frame. Non-UI and non-pid-F0 frames are dropped.
        * @param {string} frame The KISS-frame to be decoded should not have FEND (0xC0) characters
        * in the beginning or in the end. Byte unstuffing must not be done before calling this function.
        */

        it("Should result in matching packets", () => {
            assert.equal(aprspacket, test)
        })
    })

    describe('Test 53', () => {
        let aprspacket = "TEST-9>TEST,TEST*,WIDE1*,WIDE2-1:!3430.00SI15000.00E#53";
        let test = util.tnc2ToKiss(aprspacket)

        if(test?.charAt(0) == String.fromCharCode(parseInt("c0", 16))) {
            test = test.substring(1)
        }

        if(test?.endsWith(String.fromCharCode(parseInt("c0", 16)))) {
            test = test.substring(0, test.length - 1);
        }

        test = util.kissToTnc2(String(test))

        /*
        * Convert a KISS-frame into a TNC-2 compatible UI-frame. Non-UI and non-pid-F0 frames are dropped.
        * @param {string} frame The KISS-frame to be decoded should not have FEND (0xC0) characters
        * in the beginning or in the end. Byte unstuffing must not be done before calling this function.
        */

        it("Should result in matching packets", () => {
            assert.equal(aprspacket, test)
        })
    })
})

/*
NOTE: Tests from: https://owenduffy.net/blog/?p=3716
#generic digiok
- TEST-9>TEST,WIDE1-1,WIDE2-1:!3430.00SI15000.00E#1
- TEST-9>TEST,WIDE1-1,WIDE2-2:!3430.00SI15000.00E#2
- TEST-9>TEST,WIDE2-2:!3430.00SI15000.00E#3
- TEST-9>TEST,WIDE1-1,TEST*,WIDE2-1:!3430.00SI15000.00E#4
- TEST-9>TEST,WIDE1*,WIDE2-1:!3430.00SI15000.00E#5
- TEST-9>TEST,TEST*,WIDE1*,WIDE2-1:!3430.00SI15000.00E#6
#specific digiok
- TEST-9>TEST,VK2AMW-1,WIDE2-1:!3430.00SI15000.00E#10
- TEST-9>TEST,VK2RHR-1,WIDE2-1:!3430.00SI15000.00E#11
#should digi as fault, all *
- TEST-9>TEST,WIDE1-1,WIDE2-4:!3430.00SI15000.00E#51
#should digi as fault for hopsreq<7, all *
- TEST-9>TEST,WIDE1-1,WIDE2-2,WIDE2-2:!3430.00SI15000.00E#52
#should not digi for maxhops<1
- TEST-9>TEST,TEST*,WIDE1*,WIDE2-1:!3430.00SI15000.00E#53
*/
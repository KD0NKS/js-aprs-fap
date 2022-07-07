// @ts-nocheck strictNullChecks

/**
 * test mic-e telemetry decoding
 */
const assert = require('assert');

import { AprsPacket } from '../src/models/aprsPacket';
import { AprsParser } from '../src/parsers/AprsParser';

describe('FAP - Test decoding mic-e packet with sequence 00, 5 channels of telemetry and one channel of binary bits', function() {
    const parser: AprsParser = new AprsParser();

    describe('#parseaprs - Test parsing a mic-e packet packet', function() {
        const comment = "comment";

        // The new mic-e telemetry format:
        // }ss112233445566}

        const parsed: AprsPacket = parser.parseAprs(`OH7LZB-13>SX15S6,TCPIP*,qAC,FOURTH:'I',l \x1C>/ ${comment} |!!!!!!!!!!!!!!|`);

        it(`Should return the comment: ${comment}`, function() {
            assert.equal(comment, parsed.comment);
        });

        it(`Should return a telemetry sequence: 0`, function() {
            assert.equal(0, parsed.telemetry?.seq);
        });

        it('Should return 5 valid telemetry values', function() {
            assert.equal(5, parsed.telemetry?.vals?.length);

            assert.equal('0', parsed.telemetry?.vals[0]);
            assert.equal('0', parsed.telemetry?.vals[1]);
            assert.equal('0', parsed.telemetry?.vals[2]);
            assert.equal('0', parsed.telemetry?.vals[3]);
            assert.equal('0', parsed.telemetry?.vals[4]);
        });

        it(`Should return a telemetry bits: '00000000'`, function() {
            assert.equal('00000000', parsed.telemetry?.bits);
        });
    });

    describe('#parseaprs - Test parsing a mic-e packet packet with sequence 00, 1 channel of telemetry', function() {
        const comment = "comment";

        // The new mic-e telemetry format:
        // }ss112233445566}
        const parsed: AprsPacket = parser.parseAprs(`OH7LZB-13>SX15S6,TCPIP*,qAC,FOURTH:'I',l \x1C>/ ${comment} |!!!!|`);

        it(`Should return the comment: ${comment}`, function() {
            assert.equal(comment, parsed.comment);
        });

        it(`Should return a telemetry sequence: 0`, function() {
            assert.equal(0, parsed.telemetry?.seq);
        });

        it('Should return 1 valid telemetry value; the rest null', function() {
            assert.equal(5, parsed.telemetry?.vals?.length);

            assert.equal('0', parsed.telemetry?.vals[0]);
            assert.equal(null, parsed.telemetry?.vals[1]);
            assert.equal(null, parsed.telemetry?.vals[2]);
            assert.equal(null, parsed.telemetry?.vals[3]);
            assert.equal(null, parsed.telemetry?.vals[4]);
        });
    });

    describe('#parseaprs - Test parsing a harder one', function() {
        const parsed: AprsPacket = parser.parseAprs("N6BG-1>S6QTUX:`+,^l!cR/'\";z}||ss11223344bb!\"|!w>f!|3");

        it(`Should return a telemetry bits: '10000000'`, function() {
            assert.equal('10000000', parsed.telemetry?.bits);
        });
    });

    describe('#parseaprs - Test parsing one to confuse with !DAO!', function() {
        const comment = "comment";

        // The new mic-e telemetry format:
        // }ss112233445566}
        const parsed: AprsPacket = parser.parseAprs(`OH7LZB-13>SX15S6,TCPIP*,qAC,FOURTH:'I',l \x1C>/ ${comment} |!wEU!![S|`);

        it(`Should return the comment: ${comment}`, function() {
            assert.equal(comment, parsed.comment);
        });
    });

    // TODO: THIS SHOULD BE VALID!!!
    //describe('#it should be valid', () => {
    //    let parsed: aprsPacket = parser.parseAprs("KA0GFC-14>S8UR5V,KC0MGG-3,WIDE1*,WIDE2-2,qAR,KE0WVG:'xR;o6`k/]\"6P}")
    //    console.log(parsed)
    //})
});
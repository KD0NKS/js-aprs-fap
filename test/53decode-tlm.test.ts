import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

describe('FAP - Telemetry packet parsing', () => {
    let parser: aprsParser = new aprsParser();

    describe('#parseaprs - Telemetry parse test', () => {
        const parsed: aprsPacket = parser.parseaprs('SRCCALL>APRS:T#324,000,038,257,255,50.12,01000001');

        it('Should return a result code: null', () => {
            assert.equal(null, parsed.resultCode);
        });

        it('Should return a telemetry object', () => {
            should.exist(parsed.telemetry);
        });

        it('Should return a seq value: 324', () => {
            assert.equal(324, parsed.telemetry.seq);
        });

        it('Should return bits: 01000001', () => {
            assert.equal('01000001', parsed.telemetry.bits);
        });

        it('Should return telemetry vals[0]: 0.00', () => {
            assert.equal('0.00', parsed.telemetry.vals[0]);
        });

        it('Should return telemetry vals[0]: 38.00', () => {
            assert.equal('38.00', parsed.telemetry.vals[1]);
        });

        it('Should return telemetry vals[0]: 257.00', () => {
            assert.equal('257.00', parsed.telemetry.vals[2]);
        });

        it('Should return telemetry vals[0]: 255.00', () => {
            assert.equal('255.00', parsed.telemetry.vals[3]);
        });

        it('Should return telemetry vals[0]: 50.12', () => {
            assert.equal('50.12', parsed.telemetry.vals[4]);
        });
    });

    /* TODO: Is this actually invalid?
    describe('Invalid telemetry parse test', () => {
        let packet = 'E27BXY-1>APESPG,TCPIP*,qAC,APRSTH:T#002,18,164,6,-76,NAPA SAMPHAN,000000000';
        let parsed: aprsPacket = parser.parseaprs(packet);

        console.log(parsed)

        it('Should return a result code: tlm_inv', () => {
            assert.equal('tlm_inv', parsed.resultCode);
        });
    });
    */

    describe('Invalid telemetry parse test', () => {
        let packet = 'E27BXY-1>APESPG,TCPIP*,qAC,APRSTH:T#324,,,,,,01000001';
        let parsed: aprsPacket = parser.parseaprs(packet);

        it('Should have 5 items telemetry vals array', () => {
            assert.equal(5, parsed.telemetry.vals.length);
        })

        it('Should have all 0s in telemetry vals array', () => {
            assert.equal(undefined, parsed.telemetry.vals[0]);
            assert.equal(undefined, parsed.telemetry.vals[1]);
            assert.equal(undefined, parsed.telemetry.vals[2]);
            assert.equal(undefined, parsed.telemetry.vals[3]);
            assert.equal(undefined, parsed.telemetry.vals[4]);
        })
    });

    // rng
    //W9CFV-B>APDG02,TCPIP*,qAC,W9CFV-BS:!4311.53ND09019.67W&RNG0001 440 Voice 432.62500MHz +0.0000MHz
});
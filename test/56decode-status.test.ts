import * as chai from 'chai';

import { RESULT_MESSAGES } from '../src/enums/ResultMessages'

import { AprsPacket } from '../src/models/AprsPacket'
import { AprsParser } from '../src/parsers/AprsParser';
import { ParserOptions } from '../src/parsers/ParserOptions';

const assert = chai.assert;
const should = chai.should();

describe('FAP - Status message decoding', function() {
    let parserOptions = new ParserOptions();
    parserOptions.isRawTimestamp = true;

    let parser = new AprsParser()

    describe('#parseaprs - Status message\'s timestamp is not affected by the isRawTimestamp flag.', function() {
        let now = new Date()
        now.setMilliseconds(0) // null out milliseconds as they aren't taken into consideration during parsing
        now.setSeconds(0)

        const timeStamp = ('00'.substring(0, 2 - now.getUTCDate().toString().length) + now.getUTCDate())
                + ('00'.substring(0, 2 - now.getUTCHours().toString().length) + now.getUTCHours())
                + ('00'.substring(0, 2 - now.getUTCMinutes().toString().length) + now.getUTCMinutes())
                + 'z'

        const nowTime = Math.floor(now.getTime() / 1000)
        const outcome = nowTime - (nowTime % 60)
        const msg = '>>Nashville,TN>>Toronto,ON'
        const packet = `KB3HVP-14>APU25N,WIDE2-2,qAR,LANSNG:>${timeStamp}${msg}`

        const parsed: AprsPacket = parser.parseAprs(packet, parserOptions)

        it('Should return the type: status', function() {
            assert.equal('status', parsed.type)
        })

        it(`Should return the timestamp: ${outcome}`, function() {
            assert.equal(outcome, parsed.timestamp)
        })

        it(`Should return the status: ${msg}`, function() {
            assert.equal(msg, parsed.status)
        })
    });

    describe('#parseaprs - Status message\'s timestamp is invalid.', function () {
        const packet = 'KB3HVP-14>APU25N,WIDE2-2,qAR,LANSNG:>000000z>>Nashville,TN>>Toronto,ON'
        const parsed: AprsPacket = parser.parseAprs(packet, parserOptions)

        it('Should return a warning code \'timestamp_inv_sta', function() {
            assert.equal('timestamp_inv_sta', parsed.warningCodes[0])
        })

        it(`Should return a resultMessage: ${ RESULT_MESSAGES['timestamp_inv_sta'] }`, function() {
            assert.equal(RESULT_MESSAGES['timestamp_inv_sta'], parsed.resultMessage)
        })
    })

    describe('#parseaprs - Status message has no timestamp', function() {
        const packet = 'KB3HVP-14>APU25N,WIDE2-2,qAR,LANSNG:>Nashville,TN>>Toronto,ON'
        const parsed: AprsPacket = parser.parseAprs(packet, parserOptions)

        it('Should not have a timestamp', function() {
            should.not.exist(parsed.timestamp)
        })
    })

    describe('#parseaprs - Status message has no body', function() {
        const packet = 'KB3HVP-14>APU25N,WIDE2-2,qAR,LANSNG:>'

        parserOptions.isRawTimestamp = false;

        const parsed: AprsPacket = parser.parseAprs(packet)

        it('#parseaprse - Status message should not have an error or warning', function() {
            should.not.exist(parsed.resultCode)
            should.not.exist(parsed.resultMessage)
            should.not.exist(parsed.warningCodes)
        })
    })

    // TODO: Tests for status reports with beam heading and maidenhead grid locator
    // See pages 80-82 of spec
})
import * as chai from 'chai'
import { AprsPacket } from '../src/models/AprsPacket';
import { AprsParser } from '../src/parsers/AprsParser';

const assert = require('assert')
const should = chai.should()

describe('FAP - Test parsing capabilities packet', function() {
    const parser = new AprsParser();

    describe('#parseaprs - Test parsing a capabilites packet where the body is too short', function() {
        // TODO: This should probably return a packet with a no type error or something
        const parsed: AprsPacket = parser.parseAprs("K3AWS-C>APJI40,TCPIP*,qAC,K3AWS-GS:<");

        it('#parseaprs - packet does not have type capabilites', function() {
            should.not.exist(parsed.type);
        });
    });

    describe('#parseaprs - packet has type capabilities', function() {
        const parsed: AprsPacket = parser.parseAprs("K3AWS-C>APJI40,TCPIP*,qAC,K3AWS-GS:<IGATE,MSG_CNT=0,LOC_CNT=0");

        it('#parseaprs - Capabilities packet should have a type', function() {
            assert.equal(parsed.type, "capabilities");
        });

        // TODO: Complete the rest of testing once the capabilities parsing is complete
    });
});
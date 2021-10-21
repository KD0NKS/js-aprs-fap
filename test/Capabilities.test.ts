import * as chai from 'chai'
import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

const assert = require('assert')
const should = chai.should()

describe('FAP - Test parsing capabilities packet', () => {
    let parser = new aprsParser();

    describe('#parseaprs - Test parsing a capabilites packet where the body is too short', () => {
        // TODO: This should probably return a packet with a no type error or something
        let parsed: aprsPacket = parser.parseaprs("K3AWS-C>APJI40,TCPIP*,qAC,K3AWS-GS:<");

        it('#parseaprs - packet does not have type capabilites', () => {
            should.not.exist(parsed.type)
        })
    })

    describe('#parseaprs - packet has type capabilities', () => {
        // TODO: Complete the rest of testing once the capabilities parsing is complete
        let parsed: aprsPacket = parser.parseaprs("K3AWS-C>APJI40,TCPIP*,qAC,K3AWS-GS:<IGATE,MSG_CNT=0,LOC_CNT=0")
        console.log(parsed)

        it('#parseaprs - Capabilities packet should have a type', () => {
            assert.equal(parsed.type, "capabilities")
        })
    })
})
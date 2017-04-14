import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import aprsPacket from '../src/aprsPacket';
import digipeater from '../src/digipeater';
import aprsParser from '../src/parser';

describe('Test parsing messages', function() {
    let parser = new aprsParser();
    let messageids = [ 1, 42, 10512, 'a', '1Ff84', 'F00b4' ];

    messageids.forEach(function(messageid) {
        describe('#parseaprs - Test a message with id: ' + messageid, function() {
            let srccall = "OH7AA-1";
            let destination = "OH7LZB   ";
            let dstcall = "APRS";
            let message = "Testing, 1 2 3";

            let aprspacke = srccall + '>' + dstcall + ',WIDE1-1,WIDE2-2,qAo,OH7AA::' + destination + ':' + message + '\{' + messageid;
            let packet: aprsPacket = parser.parseaprs(aprspacke);

            it('Should return a result code: null', function() {
                assert.equal(undefined, packet.resultCode);
            });

            it('Should return a type: message', function() {
                assert.equal('message', packet.type);
            });

            it('Should return a destination: ' + destination.trim(), function() {
                assert.equal(destination.trim(), packet.destination);
            });

            it('Should return a messageid: ' + messageid, function() {
                assert.equal(messageid, packet.messageId);
            });

            it('Should return a message: ' + message, function() {
                assert.equal(message, packet.message);
            });
        });


        describe('#parseaprs - Test an ack message with id: ' + messageid, function() {
            let srccall = "OH7AA-1";
            let destination = "OH7LZB   ";
            let dstcall = "APRS";

            let aprspacke = srccall + '>' + dstcall + ',WIDE1-1,WIDE2-2,qAo,OH7AA::' + destination + ':ack' + messageid;
            let packet = parser.parseaprs(aprspacke);

            it('Should return a result code: null', function() {
                assert.equal(null, packet.resultCode);
            });

            it('Should return a type: message', function() {
                assert.equal('message', packet.type);

            });

            it('Should return a destination: ' + destination.trim(), function() {
                assert.equal(destination.trim(), packet.destination);
            });

            it('Should return an ack id (messageAck): ' + messageid, function() {
                assert.equal(messageid, packet.messageAck);
            });
        });

        describe('#parseaprs - Test a reject message with id: ' + messageid, function() {
            let srccall = "OH7AA-1";
            let destination = "OH7LZB   ";
            let dstcall = "APRS";

            let aprspacke = `${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:rej${messageid}`;
            let packet = parser.parseaprs(aprspacke);

            it('Should return a result code: undefined', function() {
                assert.equal(undefined, packet.resultCode);
            });

            it('Should return a type: message', function() {
                assert.equal("message", packet.type);
            });

            it('Should return a destination: ' + destination.trim(), function() {
                assert.equal(destination.trim(), packet.destination);
            });

            it('Should return a messageReject: ' + messageid, function() {
                assert.equal(messageid, packet.messageReject);
            });
        });
    });

    describe('#parseaprs - Test a message without id.', function() {
        let srccall = "OH7AA-1";
        let destination = "OH7LZB   ";
        let dstcall = "APRS";
        let message = "Testing, 1 2 3";

        let aprspacket = `${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:${message}`;
        let packet: aprsPacket = parser.parseaprs(aprspacket);

        it('Should not return a message id', function() {
            should.not.exist(packet.messageId);
        });

        it('Should return a type: message', function() {
            assert.equal("message", packet.type);
        });

        it('Should return a destination: ' + destination.trim(), function() {
            assert.equal(destination.trim(), packet.destination);
        });

        it('Should return a message: ' + message, function() {
            assert.equal(message, packet.message);
        });
    });

    describe('#parseaprs - Test a telemetry message.', function() {
        let srccall = "OH7AA-1";
        let destination = "OH7LZB   ";
        let dstcall = "APRS";
        let message = "BITS.11111111,Telemetry test";
        //ON7KEI-10>APMI04,TCPIP*,qAC,T2POLAND::ON7KEI-10:BITS.11111111,Telemetry test

        let aprspacket = `${srccall}>${dstcall},TCPIP*,qAC,T2POLAND::${destination}:${message}`;
        let packet: aprsPacket = parser.parseaprs(aprspacket);

        it('Should not return a message id', function() {
            should.not.exist(packet.messageId);
        });

        it('Should return a type: message', function() {
            assert.equal("telemetry-message", packet.type);
        });

        it('Should return a message: ' + message, function() {
            assert.equal(message, packet.message);
        });
    });

    describe('#parseaprs - Test an invalid message.', function() {
        // message text may contain any printable ascii chars except |, ~, or, {
        let srccall = "OH7AA-1";
        let destination = "OH7LZB   ";
        let dstcall = "APRS";
        let message = "~|Testing{";

        let aprspacket = `${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:${message}`;
        let packet: aprsPacket = parser.parseaprs(aprspacket);

        it('Should return a resultCode: "msg_inv"', function() {
            assert.equal("msg_inv", packet.resultCode);
        });
    });

    describe('#parseaprs - Test an invalid message.', function() {
        // message text may contain any printable ascii chars except |, ~, or, {
        let srccall = "OH7AA-1";
        let destination = "OH7LZB   ";
        let dstcall = "APRS";

        let aprspacket = `${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:`;
        let packet: aprsPacket = parser.parseaprs(aprspacket);

        it('Should return a resultCode: "msg_inv"', function() {
            assert.equal("msg_inv", packet.resultCode);
        });
    });
});
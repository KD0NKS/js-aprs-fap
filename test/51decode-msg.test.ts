import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import aprsPacket from '../src/aprsPacket';
import { PacketTypeEnum } from '../src/PacketTypeEnum';
import aprsParser from '../src/parser';

describe('Test parsing messages', () => {
    const parser = new aprsParser();
    const messageids = [ 1, 42, 10512, 'a', '1Ff84', 'F00b4' ];
    const srccall = "OH7AA-1";
    const destination = "OH7LZB   ";
    const dstcall = "APRS";
    const message = "Testing, 1 2 3";

    messageids.forEach((messageid) => {
        describe('#parseaprs - Test a message with id: ' + messageid, () => {
            const packet: aprsPacket = parser.parseaprs(`${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:${message}\{${messageid}`);

            it('Should return a result code: null', () => {
                assert.equal(undefined, packet.resultCode);
            });

            it('Should return a type: message', () => {
                assert.equal(PacketTypeEnum.MESSAGE, packet.type);
            });

            it('Should return a destination: ' + destination.trim(), () => {
                assert.equal(destination.trim(), packet.destination);
            });

            it('Should return a messageid: ' + messageid, () => {
                assert.equal(messageid, packet.messageId);
            });

            it('Should return a message: ' + message, () => {
                assert.equal(message, packet.message);
            });

            it('Should not have a message ack.', () => {
                assert.equal(null, packet.messageAck)
            })
        });

        describe('#parseaprs - Reply ack format but no ack http://www.aprs.org/aprs11/replyacks.txt', function () {
            const packet = parser.parseaprs(`${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:${message}\{${messageid}\}`)

            it('Should return a result code: null', () => {
                assert.equal(undefined, packet.resultCode)
            })

            it('Should return a type: message', () => {
                assert.equal(PacketTypeEnum.MESSAGE, packet.type);
            });

            it('Should return a destination: ' + destination.trim(), () => {
                assert.equal(destination.trim(), packet.destination);
            });

            it(`Should return a messageid: ${messageid}`, () => {
                assert.equal(messageid, packet.messageId);
            });

            it('Should not have a message ack.', () => {
                assert.equal(null, packet.messageAck)
            })
        })

        describe('#parseaprs - replyback http://www.aprs.org/aprs11/replyacks.txt', () => {
            const replyack = 'f001'
            const packet = parser.parseaprs(`${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:${message}\{${messageid}\}${replyack}`)

            it('Should return a result code: null', () => {
                assert.equal(undefined, packet.resultCode)
            })

            it('Should return a type: message', () => {
                assert.equal(PacketTypeEnum.MESSAGE, packet.type);
            })

            it(`Should return a destination: ${destination.trim()}`, () => {
                assert.equal(destination.trim(), packet.destination.trim());
            })

            it(`Should return a messageid: ${messageid}`, () => {
                assert.equal(messageid, packet.messageId);
            })

            it(`Should return a messageack: ${replyack}`, () => {
                assert.equal(replyack, packet.messageAck);
            })
        })

        describe('#parseaprs - Test an ack message with id: ' + messageid, () => {
            const packet = parser.parseaprs(`${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:ack${messageid}`);

            it('Should return a result code: null', () => {
                assert.equal(null, packet.resultCode);
            });

            it('Should return a type: message', () => {
                assert.equal(PacketTypeEnum.MESSAGE, packet.type);

            });

            it('Should return a destination: ' + destination.trim(), () => {
                assert.equal(destination.trim(), packet.destination);
            });

            it(`Should return an ack id: ${messageid}`, () => {
                assert.equal(messageid, packet.messageAck);
            });
        });

        describe('#parseaprs - Test a reject message with id: ' + messageid, () => {
            const packet = parser.parseaprs(`${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:rej${messageid}`);

            it('Should return a result code: undefined', () => {
                assert.equal(undefined, packet.resultCode);
            });

            it('Should return a type: message', () => {
                assert.equal(PacketTypeEnum.MESSAGE, packet.type);
            });

            it('Should return a destination: ' + destination.trim(), () => {
                assert.equal(destination.trim(), packet.destination);
            });

            it('Should return a messageReject: ' + messageid, () => {
                assert.equal(messageid, packet.messageReject);
            });
        });
    });

    describe('#parseaprs - Test a message without id.', () => {
        const packet: aprsPacket = parser.parseaprs(`${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:${message}`);

        it('Should not return a message id', () => {
            should.not.exist(packet.messageId);
        });

        it('Should return a type: message', () => {
            assert.equal(PacketTypeEnum.MESSAGE, packet.type);
        });

        it(`Should return a destination: ${destination.trim()}`, () => {
            assert.equal(destination.trim(), packet.destination);
        });

        it(`Should return a message: ${message}`, () => {
            assert.equal(message, packet.message);
        });
    });

    describe('#parseaprs - Test a telemetry message.', () => {
        const message = "BITS.11111111, Telemetry test";
        const packet: aprsPacket = parser.parseaprs(`${srccall}>${dstcall},TCPIP*,qAC,T2POLAND::${destination}:${message}`);

        it('Should not return a message id', () => {
            should.not.exist(packet.messageId);
        });

        it('Should return a type: message', () => {
            assert.equal(PacketTypeEnum.TELEMETRY_MESSAGE, packet.type);
        });

        it(`Should return a message: ${message}`, () => {
            assert.equal(message, packet.message);
        });
    });

    describe('#parseaprs - Test an invalid message.', () => {
        // message text may contain any printable ascii chars except |, ~, or, {
        const packet: aprsPacket = parser.parseaprs(`${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:~|Testing{`);

        it('Should return a resultCode: "msg_inv"', () => {
            assert.equal("msg_inv", packet.resultCode);
        });
    });

    describe('#parseaprs - Test an invalid message.', () => {
        // message text may contain any printable ascii chars except |, ~, or, {
        const packet: aprsPacket = parser.parseaprs(`${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:`);

        it('Should return a resultCode: "msg_inv"', () => {
            assert.equal("msg_inv", packet.resultCode);
        });
    });
});
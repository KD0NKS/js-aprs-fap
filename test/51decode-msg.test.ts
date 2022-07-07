import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import { AprsPacket } from '../src/models/AprsPacket';
import { PacketTypeEnum } from '../src/enums/PacketTypeEnum';
import { AprsParser } from '../src/parsers/AprsParser';

describe('Test parsing messages', function() {
    const parser = new AprsParser();
    const messageids = [ 1, 42, 10512, 'a', '1Ff84', 'F00b4' ];
    const srccall = "OH7AA-1";
    const destination = "OH7LZB   ";
    const dstcall = "APRS";
    const message = "Testing, 1 2 3";

    messageids.forEach((messageid) => {
        describe(`#parseaprs - Test a message with id: ${messageid}`, function() {
            const packet: AprsPacket = parser.parseAprs(`${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:${message}\{${messageid}`);

            it('Should return a result code: null', function() {
                assert.equal(undefined, packet.resultCode);
            });

            it('Should return a type: message', function() {
                assert.equal(PacketTypeEnum.MESSAGE, packet.type);
            });

            it(`Should return a destination: ${destination.trim()}`, function() {
                assert.equal(destination.trim(), packet.destination);
            });

            it(`Should return a messageid: ${messageid}`, function() {
                assert.equal(messageid, packet.messageId);
            });

            it(`Should return a message: ${message}`, function() {
                assert.equal(message, packet.message);
            });

            it('Should not have a message ack.', function() {
                assert.equal(null, packet.messageAck)
            })
        });

        describe('#parseaprs - Reply ack format but no ack http://www.aprs.org/aprs11/replyacks.txt', function () {
            const packet = parser.parseAprs(`${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:${message}\{${messageid}\}`)

            it('Should return a result code: null', function() {
                assert.equal(undefined, packet.resultCode)
            })

            it('Should return a type: message', function() {
                assert.equal(PacketTypeEnum.MESSAGE, packet.type);
            });

            it(`Should return a destination: ${destination.trim()}`, function() {
                assert.equal(destination.trim(), packet.destination);
            });

            it(`Should return a messageid: ${messageid}`, function() {
                assert.equal(messageid, packet.messageId);
            });

            it('Should not have a message ack.', function() {
                assert.equal(null, packet.messageAck)
            })
        })

        describe('#parseaprs - replyback http://www.aprs.org/aprs11/replyacks.txt', function() {
            const replyack = 'f001'
            const packet = parser.parseAprs(`${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:${message}\{${messageid}\}${replyack}`)

            it('Should return a result code: null', function() {
                assert.equal(undefined, packet.resultCode)
            })

            it('Should return a type: message', function() {
                assert.equal(PacketTypeEnum.MESSAGE, packet.type);
            })

            it(`Should return a destination: ${destination.trim()}`, function() {
                assert.equal(destination.trim(), packet.destination?.trim());
            })

            it(`Should return a messageid: ${messageid}`, function() {
                assert.equal(messageid, packet.messageId);
            })

            it(`Should return a messageack: ${replyack}`, function() {
                assert.equal(replyack, packet.messageAck);
            })
        })

        describe(`#parseaprs - Test an ack message with id: ${ messageid }`, function() {
            const packet = parser.parseAprs(`${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:ack${messageid}`);

            it('Should return a result code: null', function() {
                assert.equal(null, packet.resultCode);
            });

            it('Should return a type: message', function() {
                assert.equal(PacketTypeEnum.MESSAGE, packet.type);

            });

            it(`Should return a destination: ${destination.trim()}`, function() {
                assert.equal(destination.trim(), packet.destination);
            });

            it(`Should return an ack id: ${messageid}`, function() {
                assert.equal(messageid, packet.messageAck);
            });
        });

        describe(`#parseaprs - Test a reject message with id: ${messageid}`, function() {
            const packet = parser.parseAprs(`${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:rej${messageid}`);

            it('Should return a result code: undefined', function() {
                assert.equal(undefined, packet.resultCode);
            });

            it('Should return a type: message', function() {
                assert.equal(PacketTypeEnum.MESSAGE, packet.type);
            });

            it(`Should return a destination: ${destination.trim()}`, function() {
                assert.equal(destination.trim(), packet.destination);
            });

            it(`Should return a messageReject: ${messageid}`, function() {
                assert.equal(messageid, packet.messageReject);
            });
        });
    });

    describe('#parseaprs - Test a message without id.', function() {
        const packet: AprsPacket = parser.parseAprs(`${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:${message}`);

        it('Should not return a message id', function() {
            should.not.exist(packet.messageId);
        });

        it('Should return a type: message', function() {
            assert.equal(PacketTypeEnum.MESSAGE, packet.type);
        });

        it(`Should return a destination: ${destination.trim()}`, function() {
            assert.equal(destination.trim(), packet.destination);
        });

        it(`Should return a message: ${message}`, function() {
            assert.equal(message, packet.message);
        });
    });

    describe('#parseaprs - Test a telemetry message.', function() {
        const message = "BITS.11111111, Telemetry test";
        const packet: AprsPacket = parser.parseAprs(`${srccall}>${dstcall},TCPIP*,qAC,T2POLAND::${destination}:${message}`);

        it('Should not return a message id', function() {
            should.not.exist(packet.messageId);
        });

        it('Should return a type: message', function() {
            assert.equal(PacketTypeEnum.TELEMETRY_MESSAGE, packet.type);
        });

        it(`Should return a message: ${message}`, function() {
            assert.equal(message, packet.message);
        });
    });

    describe('#parseaprs - Test an invalid message.', function() {
        // message text may contain any printable ascii chars except |, ~, or, {
        const packet: AprsPacket = parser.parseAprs(`${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:~|Testing{`);

        it('Should return a resultCode: "msg_inv"', function() {
            assert.equal("msg_inv", packet.resultCode);
        });
    });

    describe('#parseaprs - Test an invalid message.', function() {
        // message text may contain any printable ascii chars except |, ~, or, {
        const packet: AprsPacket = parser.parseAprs(`${srccall}>${dstcall},WIDE1-1,WIDE2-2,qAo,OH7AA::${destination}:`);

        it('Should return a resultCode: "msg_inv"', function() {
            assert.equal("msg_inv", packet.resultCode);
        });
    });
});
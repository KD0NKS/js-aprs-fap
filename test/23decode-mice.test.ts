// @ts-nocheck strictNullChecks

import { equal } from 'assert';

import { AprsPacket } from '../src/models/AprsPacket';
import { PacketTypeEnum } from '../src/enums/PacketTypeEnum';
import { AprsParser } from '../src/parsers/AprsParser';
import { ParserOptions } from '../src/parsers/ParserOptions';

// a mic-e decoding test
// Tue Dec 11 2007, Hessu, OH7LZB
describe('FAP - Test parsing mic-e packages', function() {
    const parser: AprsParser = new AprsParser();
    let parserOptions: ParserOptions = new ParserOptions();

    describe('#parseaprs - Non-moving target mic-e packet test.', function() {
        const srcCall = "OH7LZB-13";
        const dstCall = "SX15S6";
        const header = `${srcCall}>${dstCall},TCPIP*,qAC,FOURTH`;
        const body = "'I',l \x1C>/]";

        const parsed: AprsPacket = parser.parseAprs(`${header}:${body}`);

        it('Should return a non-null packet without any error messages.', function() {
            equal(null, parsed.resultCode);
            equal(null, parsed.resultMessage);
        });

        it(`Should return the source call sign: ${srcCall}`, function() {
            equal(srcCall, parsed.sourceCallsign);
        });

        it(`Should return the destination call sign: ${dstCall}`, function() {
            equal(dstCall, parsed.destCallsign);
        });

        it(`Should return the header: ${header}`, function() {
            equal(header, parsed.header);
        });

        it(`Should return the body: ${body}`, function() {
            equal(body, parsed.body);
        });

        it('Should return the location type: location', function() {
            equal(PacketTypeEnum.LOCATION, parsed.type);
        });

        it('Should return the type: mice', function() {
            equal('mice', parsed.format);
        });

        it('Should return the comment: ]', function() {
            equal(']', parsed.comment);
        });

        // If 1 fails, most likely they will all fail.
        it('Should return 3 valid digis', function() {
            equal(3, parsed.digipeaters?.length);

            equal('TCPIP', parsed.digipeaters[0].callsign);
            equal(true, parsed.digipeaters[0].wasDigipeated);

            equal('qAC', parsed.digipeaters[1].callsign);
            equal(false, parsed.digipeaters[1].wasDigipeated);

            equal('FOURTH', parsed.digipeaters[2].callsign);
            equal(false, parsed.digipeaters[2].wasDigipeated);
        });

        it('Should return the symbol table code: /', function() {
            equal('/', parsed.symboltable);
        });

        it('Should return the symbol code: >', function() {
            equal('>', parsed.symbolcode);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return posambiguity: 0', function() {
            equal(0, parsed.posambiguity);
        });

        it('Should return messaging: null', function() {
            equal(null, parsed.messaging);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: -38.2560', function() {
            equal(-38.2560, parsed.latitude?.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: 145.1860', function() {
            equal(145.1860, parsed.longitude?.toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            equal(18.52, parsed.posresolution);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return speed: 0', function() {
            equal(0, parsed.speed);
        });

        it('Should return course: 0', function() {
            equal(0, parsed.course);
        });

        it('Should return altitude: null', function() {
            equal(null, parsed.altitude);
        });
    });

    describe('#parseaprs - Moving target mic-e packet test.', function() {
        const srcCall = "OH7LZB-2";
        const dstCall = "TQ4W2V";
        const header = `${srcCall}>${dstCall},WIDE2-1,qAo,OH7LZB`;
        const body = "`c51!f?>/]\"3x}=";

        const parsed: AprsPacket = parser.parseAprs(`${header}:${body}`);

        it(`Should return the source call sign: ${srcCall}`, function() {
            equal(srcCall, parsed.sourceCallsign);
        });

        it(`Should return the destination call sign: ${dstCall}`, function() {
            equal(dstCall, parsed.destCallsign);
        });

        it(`Should return the header: ${header}`, function() {
            equal(header, parsed.header);
        });

        it(`Should return the body: ${body}`, function() {
            equal(body, parsed.body);
        });

        it('Should return the location type: location', function() {
            equal(PacketTypeEnum.LOCATION, parsed.type);
        });

        it('Should return the type: mice', function() {
            equal('mice', parsed.format);
        });

        it('Should return the comment: ]', function() {
            equal(']=', parsed.comment);
        });

        // If 1 fails, most likely they will all fail.
        it('Should return 3 valid digis', function() {
            equal(3, parsed.digipeaters?.length);

            equal('WIDE2-1', parsed.digipeaters[0].callsign);
            equal(false, parsed.digipeaters[0].wasDigipeated);

            equal('qAo', parsed.digipeaters[1].callsign);
            equal(false, parsed.digipeaters[1].wasDigipeated);

            equal('OH7LZB', parsed.digipeaters[2].callsign);
            equal(false, parsed.digipeaters[2].wasDigipeated);
        });

        it('Should return the symbol table code: /', function() {
            equal('/', parsed.symboltable);
        });

        it('Should return the symbol code: >', function() {
            equal('>', parsed.symbolcode);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return posambiguity: 0', function() {
            equal(0, parsed.posambiguity);
        });

        it('Should return messaging: null', function() {
            equal(null, parsed.messaging);
        });

        it('Should return mbits: \'110\'', function() {
            equal('110', parsed.mbits);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: 41.7877', function() {
            equal(41.7877, parsed.latitude?.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -71.4202', function() {
            equal(-71.4202, parsed.longitude?.toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            equal(18.52, parsed.posresolution);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return speed: 105.56', function() {
            equal(105.56, parsed.speed?.toFixed(2));
        });

        it('Should return course: 35', function() {
            equal(35, parsed.course);
        });

        it('Should return altitude: 6', function() {
            equal(6, parsed.altitude);
        });
    });

    describe('#parseaprs - Decoding a mic-e packet which has an invalid symbol table (\',\').', function() {
        const srcCall = "OZ2BRN-4";
        const dstCall = "5U2V08";
        const header = `${srcCall}>${dstCall},OZ3RIN-3,OZ4DIA-2*,WIDE2-1,qAR,DB0KUE`;
        const body = "`'O<l!{,,\"4R}";

        const parsed: AprsPacket = parser.parseAprs(`${header}:${body}`);

        it(`Should return the source call sign: ${srcCall}`, function() {
            equal(srcCall, parsed.sourceCallsign);
        });

        it(`Should return the destination call sign: ${dstCall}`, function() {
            equal(dstCall, parsed.destCallsign);
        });

        it(`Should return the header: ${header}`, function() {
            equal(header, parsed.header);
        });

        it(`Should return the body: ${body}`, function() {
            equal(body, parsed.body);
        });

        it('Should return the location type: location', function() {
            equal(PacketTypeEnum.LOCATION, parsed.type);
        });

        it('Should return the type: mice', function() {
            equal('mice', parsed.format);
        });

        it('Should return the comment: null', function() {
            equal(null, parsed.comment);
        });

        it('Should return a result code: \'sym_inv_table\'', function() {
            equal('sym_inv_table', parsed.resultCode);
        });

    });

    describe('#parseaprs - Decoding a mice-e packet with 5-channel Mic-E Telemetry', function() {
        const comment = "commeeeent";
        const parsed: AprsPacket = parser.parseAprs(`OZ2BRN-4>5U2V08,WIDE2-1,qAo,OH7LZB:\`c51!f?>/‘102030FFff${comment}`);

        // let's skip all the working stuff...
        it(`Should return the comment: ${comment}`, function() {
            equal(comment, parsed.comment);
        });

        it('Should return telemetry values: [16, 32, 48, 255, 255]', function() {
            equal(5, parsed.telemetry?.vals?.length);

            equal(16, parsed.telemetry?.vals[0]);
            equal(32, parsed.telemetry?.vals[1]);
            equal(48, parsed.telemetry?.vals[2]);
            equal(255, parsed.telemetry?.vals[3]);
            equal(255, parsed.telemetry?.vals[4]);
        });
    });

    describe('#parseaprs - Decoding a packet with 2-channel Mic-E Telemetry', function() {
        const comment = "commeeeent";
        const parsed: AprsPacket = parser.parseAprs(`OZ2BRN-4>5U2V08,WIDE2-1,qAo,OH7LZB:\`c51!f?>/'1020 ${comment}`);

        it(`Should return the comment: ${comment}`, function() {
            equal(comment, parsed.comment);
        });

        it('Should return telemetry values: [16, 0, 32]', function() {
            equal(3, parsed.telemetry?.vals?.length);

            equal(16, parsed.telemetry?.vals[0]);
            equal(0, parsed.telemetry?.vals[1]);
            equal(32, parsed.telemetry?.vals[2]);
        });
    });

    describe('#parseaprs - Decoding a packet which has had a binary byte removed', function() {
        parserOptions.isAcceptBrokenMice = true

        const comment = ']Greetings via ISS=';
        const parsed: AprsPacket = parser.parseAprs(`KD0KZE>TUPX9R,RS0ISS*,qAR,K0GDI-6:'yaIl -/${comment}`, parserOptions);

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: 45.1487', function() {
            equal(45.1487, parsed.latitude?.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -93.1575', function() {
            equal(-93.1575, parsed.longitude?.toFixed(4));
        });

        it('Should return the symbol table code: /', function() {
            equal('/', parsed.symboltable);
        });

        it('Should return the symbol code: -', function() {
            equal('-', parsed.symbolcode);
        });

        it(`Should return the comment: ${comment}`, function() {
            equal(comment, parsed.comment);
        });

        it('Shold not parse course.  Expected: null', function() {
            equal(null, parsed.course);
        });

        it('Shold not parse speed.  Expected: null', function() {
            equal(null, parsed.speed);
        });

        it('Shold mice_mangled value: true', function() {
            equal(true, parsed.mice_mangled);
        });
    });

    describe('#parseaprs - Should give an accurate longitude', function() {
        const parsed = parser.parseAprs('W4RK-9>S8SR5R,KB4VSP-3,WIDE1*,WIDE2-1,qAR,WX0BC-3:`x- n"@>/]"6>}=')

        it('It should have a speed of 37.04', function() {
            equal(parsed.speed, 37.04)
        });

        it('It should have a position resolution of 18.52', function() {
            equal(parsed.posresolution, 18.52)
        });

        it('It should have a latitude of 38.542', function() {
            equal(parsed.latitude, 38.542)
        });

        it('It should have a course of 236', function() {
            equal(parsed.course, 236)
        });

        it('It should have a position ambiguity of 0', function() {
            equal(parsed.posambiguity, 0)
        });

        it('It should have an altitude of 221 ', function() {
            equal(parsed.altitude, 221)
        });

        it('It should have a longitude of -92.284', function() {
            equal(parsed.longitude, -92.284)
        });

        it('It should have mbits equaling 101', function() {
            equal(parsed.mbits, 101)
        });
    });

    describe('#parseaprs - Should give an accurate latitude', function() {
        const parsed = parser.parseAprs('N5ZRU>S8ST3U,KB4VSP-3,WIDE1*,WIDE2-1,qAR,WX0BC-3:`x)em}J>/`"63}_%')

        it('It should have a speed of 35.188', function() {
            equal(parsed.speed, 35.188)
        });

        it('It should have a position resolution of 18.52', function() {
            equal(parsed.posresolution, 18.52)
        });

        it('It should have a latitude of 38.5725', function() {
            equal(parsed.latitude, 38.5725)
        });

        it('It should have a course of 346', function() {
            equal(parsed.course, 346)
        });

        it('It should have a position ambiguity of 0', function() {
            equal(parsed.posambiguity, 0)
        });

        it('It should have an altitude of 210 ', function() {
            equal(parsed.altitude, 210)
        });

        it('It should have a longitude of -92.22883333333333', function() {
            equal(parsed.longitude, -92.22883333333333)
        });

        it('It should have mbits equaling 101', function() {
            equal(parsed.mbits, 101)
        });
    });

    describe('#parseaprs - Decoding a packet which has had a binary byte removed, not accepting broken packet.', function() {
        const parsed: AprsPacket = parser.parseAprs('IV3CVN-9>TU3RY9,IR2AO,WIDE1*,WIDE2,qAR,I1EPJ-10:` )T!6S>/>"5G}Riccardo IV3CVN 73! =');

        // check for undefined value, when there is no such data in the packet
        it('Should return resultCode: mice_inv_info', function() {
            equal(parsed.resultCode, "mice_inv_info");
        });
    });

    describe('#parseaprs - Test parsing a mic-e packet with invalid symbol table code', function() {
        parserOptions.isAcceptBrokenMice = true;

        const packet: AprsPacket = parser.parseAprs("K1LEF-1>S2QPVR,qAR,N7HND:`\'[!>fk/]\"<j}=", parserOptions);

        it('Should return a resultCode: sym_inv_table', function() {
            equal(packet.resultCode, "sym_inv_table");
        });
    });

    describe('#parseaprs - Test parsing a mic-e packet with invalid position ambiguity', function() {
        const packet: AprsPacket = parser.parseAprs('KM6LOU-9>SSULXR,N6EX-4,KF6ILA-10,WIDE2*,qAR,KF6NXQ-15:`-S@m_Ok/]"4q}=');

        it('Should return a resultCode: mice_amb_inv', function() {
            equal(packet.resultCode, "mice_amb_inv");
        });
    });

    describe('#parseaprs - Test parsing a mic-e packet with invalid characters in the last 3 chars of the dest callsign.', function() {
        parserOptions.isAcceptBrokenMice = true;

        const packet: AprsPacket = parser.parseAprs('N9317>SS5RWI,KF6ILA-10,WIDE2*,qAR,KF6NXQ-15:`.1?shd\'/":l}K6SBZ', parserOptions);

        it('Should return a resultCode: mice_inv', function() {
            equal(packet.resultCode, "mice_inv");
        });
    });

    describe('#parseaprs - Test parsing a mic-e packet where the dest callsign is too short', function() {
        parserOptions.isAcceptBrokenMice = true;

        const packet: AprsPacket = parser.parseAprs('PU2WAT-9>CMD,qAR,PU2WAT-1:`JAXm{=k/]"<=}=', parserOptions);

        it('Should return a resultCode: mice_short', function() {
            equal(packet.resultCode, "mice_short");
        });
    });
});

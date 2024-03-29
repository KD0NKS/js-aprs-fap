const assert = require('assert');

import aprsPacket from '../src/aprsPacket';
import { PacketTypeEnum } from '../src/PacketTypeEnum';
import aprsParser from '../src/parser';

// a mic-e decoding test
// Tue Dec 11 2007, Hessu, OH7LZB
describe('FAP - Test parsing mic-e packages', () => {
    let parser: aprsParser = new aprsParser();

    describe('#parseaprs - Non-moving target mic-e packet test.', () => {
        let $srccall = "OH7LZB-13";
        let $dstcall = "SX15S6";
        let $header = $srccall + '>' + $dstcall + ',TCPIP*,qAC,FOURTH';
        let $body = "'I',l \x1C>/]";
        let $aprspacket = $header + ':' + $body;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return a non-null packet without any error messages.', () => {
            assert.equal(null, parsed.resultCode);
            assert.equal(null, parsed.resultMessage);
        });

        it('Should return the source call sign: ' + $srccall, () => {
            assert.equal($srccall, parsed.sourceCallsign);
        });

        it('Should return the destination call sign: ' + $dstcall, () => {
            assert.equal($dstcall, parsed.destCallsign);
        });

        it('Should return the header: ' + $header, () => {
            assert.equal($header, parsed.header);
        });

        it('Should return the body: ' + $body, () => {
            assert.equal($body, parsed.body);
        });

        it('Should return the location type: location', () => {
            assert.equal(PacketTypeEnum.LOCATION, parsed.type);
        });

        it('Should return the type: mice', () => {
            assert.equal('mice', parsed.format);
        });

        it('Should return the comment: ]', () => {
            assert.equal(']', parsed.comment);
        });

        // If 1 fails, most likely they will all fail.
        it('Should return 3 valid digis', () => {
            assert.equal(3, parsed.digipeaters.length);

            assert.equal('TCPIP', parsed.digipeaters[0].callsign);
            assert.equal(true, parsed.digipeaters[0].wasDigipeated);

            assert.equal('qAC', parsed.digipeaters[1].callsign);
            assert.equal(false, parsed.digipeaters[1].wasDigipeated);

            assert.equal('FOURTH', parsed.digipeaters[2].callsign);
            assert.equal(false, parsed.digipeaters[2].wasDigipeated);
        });

        it('Should return the symbol table code: /', () => {
            assert.equal('/', parsed.symboltable);
        });

        it('Should return the symbol code: >', () => {
            assert.equal('>', parsed.symbolcode);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return posambiguity: 0', () => {
            assert.equal(0, parsed.posambiguity);
        });

        it('Should return messaging: null', () => {
            assert.equal(null, parsed.messaging);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: -38.2560', () => {
            assert.equal(-38.2560, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: 145.1860', () => {
            assert.equal(145.1860, parsed.longitude.toFixed(4));
        });

        it('Should return position resolution: 18.52', () => {
            assert.equal(18.52, parsed.posresolution);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return speed: 0', () => {
            assert.equal(0, parsed.speed);
        });

        it('Should return course: 0', () => {
            assert.equal(0, parsed.course);
        });

        it('Should return altitude: null', () => {
            assert.equal(null, parsed.altitude);
        });
    });

    describe('#parseaprs - Moving target mic-e packet test.', () => {
        let $srccall = "OH7LZB-2";
        let $dstcall = "TQ4W2V";
        let $header = $srccall + '>' + $dstcall + ',WIDE2-1,qAo,OH7LZB';
        let $body = "`c51!f?>/]\"3x}=";
        let $aprspacket = $header + ':' + $body;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return the source call sign: ' + $srccall, () => {
            assert.equal($srccall, parsed.sourceCallsign);
        });

        it('Should return the destination call sign: ' + $dstcall, () => {
            assert.equal($dstcall, parsed.destCallsign);
        });

        it('Should return the header: ' + $header, () => {
            assert.equal($header, parsed.header);
        });

        it('Should return the body: ' + $body, () => {
            assert.equal($body, parsed.body);
        });

        it('Should return the location type: location', () => {
            assert.equal(PacketTypeEnum.LOCATION, parsed.type);
        });

        it('Should return the type: mice', () => {
            assert.equal('mice', parsed.format);
        });

        it('Should return the comment: ]', () => {
            assert.equal(']=', parsed.comment);
        });

        // If 1 fails, most likely they will all fail.
        it('Should return 3 valid digis', () => {
            assert.equal(3, parsed.digipeaters.length);

            assert.equal('WIDE2-1', parsed.digipeaters[0].callsign);
            assert.equal(false, parsed.digipeaters[0].wasDigipeated);

            assert.equal('qAo', parsed.digipeaters[1].callsign);
            assert.equal(false, parsed.digipeaters[1].wasDigipeated);

            assert.equal('OH7LZB', parsed.digipeaters[2].callsign);
            assert.equal(false, parsed.digipeaters[2].wasDigipeated);
        });

        it('Should return the symbol table code: /', () => {
            assert.equal('/', parsed.symboltable);
        });

        it('Should return the symbol code: >', () => {
            assert.equal('>', parsed.symbolcode);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return posambiguity: 0', () => {
            assert.equal(0, parsed.posambiguity);
        });

        it('Should return messaging: null', () => {
            assert.equal(null, parsed.messaging);
        });

        it('Should return mbits: \'110\'', () => {
            assert.equal('110', parsed.mbits);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: 41.7877', () => {
            assert.equal(41.7877, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -71.4202', () => {
            assert.equal(-71.4202, parsed.longitude.toFixed(4));
        });

        it('Should return position resolution: 18.52', () => {
            assert.equal(18.52, parsed.posresolution);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return speed: 105.56', () => {
            assert.equal(105.56, parsed.speed.toFixed(2));
        });

        it('Should return course: 35', () => {
            assert.equal(35, parsed.course);
        });

        it('Should return altitude: 6', () => {
            assert.equal(6, parsed.altitude);
        });
    });

    describe('#parseaprs - Decoding a mic-e packet which has an invalid symbol table (\',\').', () => {
        let $srccall = "OZ2BRN-4";
        let $dstcall = "5U2V08";
        let $header = $srccall + '>' + $dstcall + ',OZ3RIN-3,OZ4DIA-2*,WIDE2-1,qAR,DB0KUE';
        let $body = "`'O<l!{,,\"4R}";
        let $aprspacket = $header + ':' + $body;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return the source call sign: ' + $srccall, () => {
            assert.equal($srccall, parsed.sourceCallsign);
        });

        it('Should return the destination call sign: ' + $dstcall, () => {
            assert.equal($dstcall, parsed.destCallsign);
        });

        it('Should return the header: ' + $header, () => {
            assert.equal($header, parsed.header);
        });

        it('Should return the body: ' + $body, () => {
            assert.equal($body, parsed.body);
        });

        it('Should return the location type: location', () => {
            assert.equal(PacketTypeEnum.LOCATION, parsed.type);
        });

        it('Should return the type: mice', () => {
            assert.equal('mice', parsed.format);
        });

        it('Should return the comment: null', () => {
            assert.equal(null, parsed.comment);
        });

        it('Should return a result code: \'sym_inv_table\'', () => {
            assert.equal('sym_inv_table', parsed.resultCode);
        });

    });

    describe('#parseaprs - Decoding a mice-e packet with 5-channel Mic-E Telemetry', () => {
        let $srccall = "OZ2BRN-4";
        let $dstcall = "5U2V08";
        let $header = $srccall + '>' + $dstcall + ',WIDE2-1,qAo,OH7LZB';
        let $telemetry = "‘102030FFff";
        let $comment = "commeeeent";
        let $body = '`c51!f?>/' + $telemetry + $comment;
        let $aprspacket = $header + ':' + $body;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        // let's skip all the working stuff...

        it('Should return the comment: ' + $comment, () => {
            assert.equal($comment, parsed.comment);
        });

        it('Should return telemetry values: [16, 32, 48, 255, 255]', () => {
            assert.equal(5, parsed.telemetry.vals.length);

            assert.equal(16, parsed.telemetry.vals[0]);
            assert.equal(32, parsed.telemetry.vals[1]);
            assert.equal(48, parsed.telemetry.vals[2]);
            assert.equal(255, parsed.telemetry.vals[3]);
            assert.equal(255, parsed.telemetry.vals[4]);
        });
    });

    describe('#parseaprs - Decoding a packet with 2-channel Mic-E Telemetry', () => {
        let $srccall = "OZ2BRN-4";
        let $dstcall = "5U2V08";
        let $header = $srccall + '>' + $dstcall + ',WIDE2-1,qAo,OH7LZB';
        let $telemetry = "'1020";
        let $comment = "commeeeent";
        let $body = '`c51!f?>/' + $telemetry + ' ' + $comment;
        let $aprspacket = $header + ':' + $body;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return the comment: ' + $comment, () => {
            assert.equal($comment, parsed.comment);
        });

        it('Should return telemetry values: [16, 0, 32]', () => {
            assert.equal(3, parsed.telemetry.vals.length);

            assert.equal(16, parsed.telemetry.vals[0]);
            assert.equal(0, parsed.telemetry.vals[1]);
            assert.equal(32, parsed.telemetry.vals[2]);
        });
    });

    describe('#parseaprs - Decoding a packet which has had a binary byte removed', () => {
        let $comment = ']Greetings via ISS=';
        let $aprspacket = "KD0KZE>TUPX9R,RS0ISS*,qAR,K0GDI-6:'yaIl -/" + $comment;

        let parsed: aprsPacket = parser.parseaprs($aprspacket, { accept_broken_mice: 1 });

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: 45.1487', () => {
            assert.equal(45.1487, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -93.1575', () => {
            assert.equal(-93.1575, parsed.longitude.toFixed(4));
        });

        it('Should return the symbol table code: /', () => {
            assert.equal('/', parsed.symboltable);
        });

        it('Should return the symbol code: -', () => {
            assert.equal('-', parsed.symbolcode);
        });

        it('Should return the comment: ' + $comment, () => {
            assert.equal($comment, parsed.comment);
        });

        it('Shold not parse course.  Expected: null', () => {
            assert.equal(null, parsed.course);
        });

        it('Shold not parse speed.  Expected: null', () => {
            assert.equal(null, parsed.speed);
        });

        it('Shold mice_mangled value: true', () => {
            assert.equal(true, parsed.mice_mangled);
        });
    });

    describe('#parseaprs - Should give an accurate longitude', () => {
        let parsed = parser.parseaprs('W4RK-9>S8SR5R,KB4VSP-3,WIDE1*,WIDE2-1,qAR,WX0BC-3:`x- n"@>/]"6>}=')

        it('It should have a speed of 37.04', () => {
            assert.equal(parsed.speed, 37.04)
        });

        it('It should have a position resolution of 18.52', () => {
            assert.equal(parsed.posresolution, 18.52)
        });

        it('It should have a latitude of 38.542', () => {
            assert.equal(parsed.latitude, 38.542)
        });

        it('It should have a course of 236', () => {
            assert.equal(parsed.course, 236)
        });

        it('It should have a position ambiguity of 0', () => {
            assert.equal(parsed.posambiguity, 0)
        });

        it('It should have an altitude of 221 ', () => {
            assert.equal(parsed.altitude, 221)
        });

        it('It should have a longitude of -92.284', () => {
            assert.equal(parsed.longitude, -92.284)
        });

        it('It should have mbits equaling 101', () => {
            assert.equal(parsed.mbits, 101)
        });
    })

    describe('#parseaprs - Should give an accurate latitude', () => {
        let parsed = parser.parseaprs('N5ZRU>S8ST3U,KB4VSP-3,WIDE1*,WIDE2-1,qAR,WX0BC-3:`x)em}J>/`"63}_%')

        it('It should have a speed of 35.188', () => {
            assert.equal(parsed.speed, 35.188)
        });

        it('It should have a position resolution of 18.52', () => {
            assert.equal(parsed.posresolution, 18.52)
        });

        it('It should have a latitude of 38.5725', () => {
            assert.equal(parsed.latitude, 38.5725)
        });

        it('It should have a course of 346', () => {
            assert.equal(parsed.course, 346)
        });

        it('It should have a position ambiguity of 0', () => {
            assert.equal(parsed.posambiguity, 0)
        });

        it('It should have an altitude of 210 ', () => {
            assert.equal(parsed.altitude, 210)
        });

        it('It should have a longitude of -92.22883333333333', () => {
            assert.equal(parsed.longitude, -92.22883333333333)
        });

        it('It should have mbits equaling 101', () => {
            assert.equal(parsed.mbits, 101)
        });
    })


    describe('#parseaprs - Decoding a packet which has had a binary byte removed, not accepting broken packet.', () => {
        let parsed: aprsPacket = parser.parseaprs('IV3CVN-9>TU3RY9,IR2AO,WIDE1*,WIDE2,qAR,I1EPJ-10:` )T!6S>/>"5G}Riccardo IV3CVN 73! =');

        // check for undefined value, when there is no such data in the packet
        it('Should return resultCode: mice_inv_info', () => {
            assert.equal(parsed.resultCode, "mice_inv_info");
        });
    });

    describe('#parseaprs - Test parsing a mic-e packet with invalid symbol table code', () => {
        let packet: aprsPacket = parser.parseaprs("K1LEF-1>S2QPVR,qAR,N7HND:`\'[!>fk/]\"<j}=", { accept_broken_mice: true });

        it('Should return a resultCode: sym_inv_table', () => {
            assert.equal(packet.resultCode, "sym_inv_table");
        });
    });

    describe('#parseaprs - Test parsing a mic-e packet with invalid position ambiguity', () => {
        let packet: aprsPacket = parser.parseaprs('KM6LOU-9>SSULXR,N6EX-4,KF6ILA-10,WIDE2*,qAR,KF6NXQ-15:`-S@m_Ok/]"4q}=', { accept_broken_mice: true });

        it('Should return a resultCode: mice_amb_inv', () => {
            assert.equal(packet.resultCode, "mice_amb_inv");
        });
    });

    describe('#parseaprs - Test parsing a mic-e packet with invalid characters in the last 3 chars of the dest callsign.', () => {
        let packet: aprsPacket = parser.parseaprs('N9317>SS5RWI,KF6ILA-10,WIDE2*,qAR,KF6NXQ-15:`.1?shd\'/":l}K6SBZ', { accept_broken_mice: true });

        it('Should return a resultCode: mice_inv', () => {
            assert.equal(packet.resultCode, "mice_inv");
        });
    });

    describe('#parseaprs - Test parsing a mic-e packet where the dest callsign is too short', () => {
        let packet: aprsPacket = parser.parseaprs('PU2WAT-9>CMD,qAR,PU2WAT-1:`JAXm{=k/]"<=}=', { accept_broken_mice: true });

        it('Should return a resultCode: mice_short', () => {
            assert.equal(packet.resultCode, "mice_short");
        });
    });
});
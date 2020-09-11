/**
# a basic uncompressed packet decoding test
# Mon Dec 10 2007, Hessu, OH7LZB
 */
import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

describe('FAP - Test decoding uncompressed packets', () => {
    let parser = new aprsParser();

    describe('#parseaprs - Test parsing uncompressed packet', () => {
        let $srccall = "OH2RDP-1";
        let $dstcall = "BEACON-15";
        let $comment = "RELAY,WIDE, OH2AP Jarvenpaa";
        let $phg = "7220";

        let $aprspacket = $srccall + '>' + $dstcall + ',OH2RDG*,WIDE:!6028.51N/02505.68E#PHG' + $phg + '/' + $comment;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return a format type: uncompressed', () => {
            assert.equal('uncompressed', parsed.format);
        });

        it('Should return the source call sign: ' + $srccall, () => {
            assert.equal($srccall, parsed.sourceCallsign);
        });

        it('Should return the destination call sign: ' + $dstcall, () => {
            assert.equal($dstcall, parsed.destCallsign);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: 60.4752', () => {
            assert.equal(60.4752, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: 25.0947', () => {
            assert.equal(25.0947, parsed.longitude.toFixed(4));
        });

        it('Should return position resolution: 18.52', () => {
            assert.equal(18.52, parsed.posresolution);
        });

        it('Should return phg: ' + $phg, () => {
            assert.equal($phg, parsed.phg);
        });

        it('Should return comment: ' + $comment, () => {
            assert.equal($comment, parsed.comment);
        });

        // If 1 fails, most likely they will all fail.
        it('Should return 2 valid digis', () => {
            assert.equal(2, parsed.digipeaters.length);

            assert.equal('OH2RDG', parsed.digipeaters[0].callsign);
            assert.equal(true, parsed.digipeaters[0].wasDigipeated);

            assert.equal('WIDE', parsed.digipeaters[1].callsign);
            assert.equal(false, parsed.digipeaters[1].wasDigipeated);
        });
    });

    describe('#parseaprs - Test parsing uncompressed packet (same, southwestern)', () => {
        let $srccall = "OH2RDP-1";
        let $dstcall = "BEACON-15";
        let $comment = "RELAY,WIDE, OH2AP Jarvenpaa";
        let $phg = "7220";

        let $aprspacket = $srccall + '>' + $dstcall + ',OH2RDG*,WIDE:!6028.51S/02505.68W#PHG' + $phg + '/' + $comment;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: -60.4752', () => {
            assert.equal(-60.4752, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -25.0947', () => {
            assert.equal(-25.0947, parsed.longitude.toFixed(4));
        });

        it('Should return position resolution: 18.52', () => {
            assert.equal(18.52, parsed.posresolution);
        });
    });

    describe('#parseaprs - Test parsing uncompressed packet (same, with pos ambiguity)', () => {
        let $srccall = "OH2RDP-1";
        let $dstcall = "BEACON-15";
        let $comment = "RELAY,WIDE, OH2AP Jarvenpaa";
        let $phg = "7220";

        let $aprspacket = $srccall + '>' + $dstcall + ',OH2RDG*,WIDE:!602 .  S/0250 .  W#PHG' + $phg + '/' + $comment;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: -60.4167', () => {
            assert.equal(-60.4167, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -25.0833', () => {
            assert.equal(-25.0833, parsed.longitude.toFixed(4));
        });

        it('Should return position ambiguity: 3', () => {
            assert.equal(3, parsed.posambiguity);
        });

        it('Should return position resolution: 18520', () => {
            assert.equal(18520, parsed.posresolution);
        });
    });

    describe('#parseaprs - Test parsing uncompressed packet (same, with even more ambiguity)', () => {
        let $srccall = "OH2RDP-1";
        let $dstcall = "BEACON-15";
        let $comment = "RELAY,WIDE, OH2AP Jarvenpaa";
        let $phg = "7220";

        let $aprspacket = $srccall + '>' + $dstcall + ',OH2RDG*,WIDE:!60  .  S/025  .  W#PHG' + $phg + '/' + $comment;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: -60.5000', () => {
            assert.equal(-60.5000, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -25.5000', () => {
            assert.equal(-25.5000, parsed.longitude.toFixed(4));
        });

        it('Should return position ambiguity: 4', () => {
            assert.equal(4, parsed.posambiguity);
        });

        it('Should return position resolution: 111120', () => {
            assert.equal(111120, parsed.posresolution);
        });
    });

    describe('#parseaprs - Test parsing uncompressed packet (same with "last resort" !-location parsing)', () => {
        let $srccall = "OH2RDP-1";
        let $dstcall = "BEACON-15";
        let $comment = "RELAY,WIDE, OH2AP Jarvenpaa";
        let $phg = "7220";

        let $aprspacket = $srccall + '>' + $dstcall + ",OH2RDG*,WIDE:hoponassualku!6028.51S/02505.68W#PHG" + $phg + $comment;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: -60.4752', () => {
            assert.equal(-60.4752, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -25.0947', () => {
            assert.equal(-25.0947, parsed.longitude.toFixed(4));
        });

        it('Should return position resolution: 18.52', () => {
            assert.equal(18.52, parsed.posresolution);
        });

        it('Should return comment: ' + $comment, () => {
            assert.equal($comment, parsed.comment);
        });
    });

    describe('#parseaprs - Test parsing uncompressed packet with comment on a station with a WX symbol. The comment is ignored, because it easily gets confused with weather data.'
            , () => {
        let $aprspacket = 'A0RID-1>KC0PID-7,WIDE1,qAR,NX0R-6:=3851.38N/09908.75W_Home of KA0RID';

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: 38.8563', () => {
            assert.equal(38.8563, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -99.1458', () => {
            assert.equal(-99.1458, parsed.longitude.toFixed(4));
        });

        it('Should return position resolution: 18.52', () => {
            assert.equal(18.52, parsed.posresolution);
        });

        it('Should return comment: null', () => {
            assert.equal(null, parsed.comment);
        });
    });

    describe('#parseaprs - Test parsing packet position with timestamp and altitude.', () => {
        let $aprspacket = 'YB1RUS-9>APOTC1,WIDE2-2,qAS,YC0GIN-1:/180000z0609.31S/10642.85E>058/010/A=000079 13.8V 15CYB1RUS-9 Mobile Tracker';

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: -6.15517', () => {
            assert.equal(-6.15517, parsed.latitude.toFixed(5));
        });

        it('Should return longitude value, that when rounded should equal: 106.71417', () => {
            assert.equal(106.71417, parsed.longitude.toFixed(5));
        });

        it('Should return altitude: 24.07920', () => {
            assert.equal(24.07920, parsed.altitude);
        });
    });

    describe('#parseaprs - Test parsing position with timestamp and altitude', () => {
        let $aprspacket = 'YB1RUS-9>APOTC1,WIDE2-2,qAS,YC0GIN-1:/180000z0609.31S/10642.85E>058/010/A=-00079 13.8V 15CYB1RUS-9 Mobile Tracker';

        let parsed = parser.parseaprs($aprspacket);

        it('Should return altitude: -24.07920', () => {
            assert.equal(-24.07920, parsed.altitude);
        });
    });

    describe('#parseaprs - Test parsing a rather basic position packet', () => {
        let $aprspacket = 'YC0SHR>APU25N,TCPIP*,qAC,ALDIMORI:=0606.23S/10644.61E-GW SAHARA PENJARINGAN JAKARTA 147.880 MHz';

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return latitude value, that when rounded should equal: -6.10383', () => {
            assert.equal(-6.10383, parsed.latitude.toFixed(5));
        });

        it('Should return longitude value, that when rounded should equal: 106.74350', () => {
            assert.equal(106.74350, parsed.longitude.toFixed(5));
        });
    });

    describe('Test parsing a location packet that is too short', () => {
        let packet: aprsPacket = parser.parseaprs("DB0GV>APNU19,WIDE1-1,WIDE3-3,DB0ZAV-1,IGATE,qAS,DB0ZAV-1:!5007.86700");

        it('Should return a packet with a result code: packet_short', () => {
            assert.equal("packet_short", packet.resultCode);
        });
    });

    describe('Test parsing a location packet that is too short', () => {
        let packet: aprsPacket = parser.parseaprs("DB0ZEH>APNDBB,DB0LDS*,WIDE3-2,qAR,DB0ZEH:;800-ZEH  *111111z5258.75N/01319.9");

        it('Should return a packet with a result code: loc_short', () => {
            assert.equal("loc_short", packet.resultCode);
        });
    });

    describe('Test parsing an uncompressed packet where the location is too large', () => {
        let packet: aprsPacket = parser.parseaprs("N6BMW-1>APRS,DMR*,qAS,n3fe-10:=3426.19N/24051.47E[Dan - Ojai CA");

        it('Should return a packet with a result code: loc_large', () => {
            assert.equal("loc_large", packet.resultCode);
        });
    });

    describe('Test parsing a packet where the location where the decimals are not used and is ambiguous', () => {
        let packet: aprsPacket = parser.parseaprs("SPBLTZ>APRS,TCPIP*,qAC,T2POLAND:;SPBLTZ   *112050z5210.  N/021  .  E? Informacje burzowe, op. Pawel SP5MNC");

        it('Should return a packet with a result code: loc_amb_inv', () => {
            assert.equal("loc_amb_inv", packet.resultCode);
        });

        it('Should return a packet with a result message: Invalid position ambiguity: lat/lon 2', () => {
            assert.equal("Invalid position ambiguity: lat/lon 2", packet.resultMessage);
        });
    });

    describe('Test parsing a packet where the location where the packet body is too short', () => {
        let parsed: aprsPacket = parser.parseaprs('IR1AX-11>APNU19,WIDE1-1,WIDE2-2,qAR,IZ1REU-11:=4429.38N/00&11.');

        it('Should not have a longitude', () => {
            should.not.exist(parsed.longitude);
        });

        it('Should not have a latitude', () => {
            should.not.exist(parsed.latitude);
        });
    });



    /* TODO:
     * no pos amb with err
     * pos amb 1 w/wo err
     * pos amb 2 w/wo err
     * pos amb 3 w/err
     * try to hit scenario where pos falls through all scenarios
     */
});
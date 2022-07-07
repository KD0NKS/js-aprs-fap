/**
# a basic uncompressed packet decoding test
# Mon Dec 10 2007, Hessu, OH7LZB
 */
import * as chai from 'chai';
const should = chai.should();

import { equal } from 'assert';

import { AprsPacket } from '../src/models/aprsPacket';
import { AprsParser } from '../src/parsers/AprsParser';

describe('FAP - Test decoding uncompressed packets', function() {
    const parser = new AprsParser();

    describe('#parseaprs - Test parsing uncompressed packet', function() {
        const srccall = "OH2RDP-1";
        const dstcall = "BEACON-15";
        const comment = "RELAY,WIDE, OH2AP Jarvenpaa";
        const phg = "7220";

        const parsed: AprsPacket = parser.parseAprs(`${srccall}>${dstcall},OH2RDG*,WIDE:!6028.51N/02505.68E#PHG${phg}/${comment}`);

        it('Should return a format type: uncompressed', function() {
            equal('uncompressed', parsed.format);
        });

        it(`Should return the source call sign: ${srccall}`, function() {
            equal(srccall, parsed.sourceCallsign);
        });

        it(`Should return the destination call sign: ${dstcall}`, function() {
            equal(dstcall, parsed.destCallsign);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: 60.4752', function() {
            equal(60.4752, parsed.latitude?.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: 25.0947', function() {
            equal(25.0947, parsed.longitude?.toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            equal(18.52, parsed.posresolution);
        });

        it(`Should return phg: ${phg}`, function() {
            equal(phg, parsed.phg);
        });

        it(`Should return comment: ${comment}`, function() {
            equal(comment, parsed.comment);
        });

        // If 1 fails, most likely they will all fail.
        it('Should return 2 valid digis', function() {
            equal(2, parsed.digipeaters?.length);

            equal('OH2RDG', parsed.digipeaters[0].callsign);
            equal(true, parsed.digipeaters[0].wasDigipeated);

            equal('WIDE', parsed.digipeaters[1].callsign);
            equal(false, parsed.digipeaters[1].wasDigipeated);
        });
    });

    describe('#parseaprs - Test parsing uncompressed packet (same, southwestern)', function() {
        const parsed: AprsPacket = parser.parseAprs(`OH2RDP-1>BEACON-15,OH2RDG*,WIDE:!6028.51S/02505.68W#PHG7220/RELAY,WIDE, OH2AP Jarvenpaa`);

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: -60.4752', function() {
            equal(-60.4752, parsed.latitude?.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -25.0947', function() {
            equal(-25.0947, parsed.longitude?.toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            equal(18.52, parsed.posresolution);
        });
    });

    describe('#parseaprs - Test parsing uncompressed packet (same, with pos ambiguity)', function() {
        const parsed: AprsPacket = parser.parseAprs("OH2RDP-1>BEACON-15,OH2RDG*,WIDE:!602 .  S/0250 .  W#PHG7220/RELAY,WIDE, OH2AP Jarvenpaa");

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: -60.4167', function() {
            equal(-60.4167, parsed.latitude?.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -25.0833', function() {
            equal(-25.0833, parsed.longitude?.toFixed(4));
        });

        it('Should return position ambiguity: 3', function() {
            equal(3, parsed.posambiguity);
        });

        it('Should return position resolution: 18520', function() {
            equal(18520, parsed.posresolution);
        });
    });

    describe('#parseaprs - Test parsing uncompressed packet (same, with even more ambiguity)', function() {
        const parsed: AprsPacket = parser.parseAprs("OH2RDP-1>BEACON-15,OH2RDG*,WIDE:!60  .  S/025  .  W#PHG7220/RELAY,WIDE, OH2AP Jarvenpaa");

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: -60.5000', function() {
            equal(-60.5000, parsed.latitude?.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -25.5000', function() {
            equal(-25.5000, parsed.longitude?.toFixed(4));
        });

        it('Should return position ambiguity: 4', function() {
            equal(4, parsed.posambiguity);
        });

        it('Should return position resolution: 111120', function() {
            equal(111120, parsed.posresolution);
        });
    });

    describe('#parseaprs - Test parsing uncompressed packet (same with "last resort" !-location parsing)', function() {
        const comment = "RELAY,WIDE, OH2AP Jarvenpaa";
        const parsed: AprsPacket = parser.parseAprs(`OH2RDP-1>BEACON-15,OH2RDG*,WIDE:hoponassualku!6028.51S/02505.68W#PHG7220${comment}`);

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: -60.4752', function() {
            equal(-60.4752, parsed.latitude?.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -25.0947', function() {
            equal(-25.0947, parsed.longitude?.toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            equal(18.52, parsed.posresolution);
        });

        it(`Should return comment: ${comment}`, function() {
            equal(comment, parsed.comment);
        });
    });

    describe('#parseaprs - Test parsing uncompressed packet with comment on a station with a WX symbol. The comment is ignored, because it easily gets confused with weather data.'
            , function() {
        const parsed: AprsPacket = parser.parseAprs('A0RID-1>KC0PID-7,WIDE1,qAR,NX0R-6:=3851.38N/09908.75W_Home of KA0RID');

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: 38.8563', function() {
            equal(38.8563, parsed.latitude?.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -99.1458', function() {
            equal(-99.1458, parsed.longitude?.toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            equal(18.52, parsed.posresolution);
        });

        it('Should return comment: null', function() {
            equal(null, parsed.comment);
        });
    });

    describe('#parseaprs - Test parsing packet position with timestamp and altitude.', function() {
        const parsed: AprsPacket = parser.parseAprs('YB1RUS-9>APOTC1,WIDE2-2,qAS,YC0GIN-1:/180000z0609.31S/10642.85E>058/010/A=000079 13.8V 15CYB1RUS-9 Mobile Tracker');

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: -6.15517', function() {
            equal(-6.15517, parsed.latitude?.toFixed(5));
        });

        it('Should return longitude value, that when rounded should equal: 106.71417', function() {
            equal(106.71417, parsed.longitude?.toFixed(5));
        });

        it('Should return altitude: 24.07920', function() {
            equal(24.07920, parsed.altitude);
        });
    });

    describe('#parseaprs - Test parsing position with timestamp and altitude', function() {
        const parsed = parser.parseAprs('YB1RUS-9>APOTC1,WIDE2-2,qAS,YC0GIN-1:/180000z0609.31S/10642.85E>058/010/A=-00079 13.8V 15CYB1RUS-9 Mobile Tracker');

        it('Should return altitude: -24.07920', function() {
            equal(-24.07920, parsed.altitude);
        });
    });

    describe('#parseaprs - Test parsing a rather basic position packet', function() {
        const parsed: AprsPacket = parser.parseAprs('YC0SHR>APU25N,TCPIP*,qAC,ALDIMORI:=0606.23S/10644.61E-GW SAHARA PENJARINGAN JAKARTA 147.880 MHz');

        it('Should return latitude value, that when rounded should equal: -6.10383', function() {
            equal(-6.10383, parsed.latitude?.toFixed(5));
        });

        it('Should return longitude value, that when rounded should equal: 106.74350', function() {
            equal(106.74350, parsed.longitude?.toFixed(5));
        });
    });

    describe('Test parsing a location packet that is too short', function() {
        const packet: AprsPacket = parser.parseAprs("DB0GV>APNU19,WIDE1-1,WIDE3-3,DB0ZAV-1,IGATE,qAS,DB0ZAV-1:!5007.86700");

        it('Should return a packet with a result code: packet_short', function() {
            equal("packet_short", packet.resultCode);
        });
    });

    describe('Test parsing a location packet that is too short', function() {
        const packet: AprsPacket = parser.parseAprs("DB0ZEH>APNDBB,DB0LDS*,WIDE3-2,qAR,DB0ZEH:;800-ZEH  *111111z5258.75N/01319.9");

        it('Should return a packet with a result code: loc_short', function() {
            equal("loc_short", packet.resultCode);
        });
    });

    describe('Test parsing an uncompressed packet where the location is too large', function() {
        const packet: AprsPacket = parser.parseAprs("N6BMW-1>APRS,DMR*,qAS,n3fe-10:=3426.19N/24051.47E[Dan - Ojai CA");

        it('Should return a packet with a result code: loc_large', function() {
            equal("loc_large", packet.resultCode);
        });
    });

    describe('Test parsing a packet where the location where the decimals are not used and is ambiguous', function() {
        const packet: AprsPacket = parser.parseAprs("SPBLTZ>APRS,TCPIP*,qAC,T2POLAND:;SPBLTZ   *112050z5210.  N/021  .  E? Informacje burzowe, op. Pawel SP5MNC");

        it('Should return a packet with a result code: loc_amb_inv', function() {
            equal("loc_amb_inv", packet.resultCode);
        });

        it('Should return a packet with a result message: Invalid position ambiguity: lat/lon 2', function() {
            equal("Invalid position ambiguity: lat/lon 2", packet.resultMessage);
        });
    });

    describe('Test parsing a packet where the location where the packet body is too short', function() {
        const parsed: AprsPacket = parser.parseAprs('IR1AX-11>APNU19,WIDE1-1,WIDE2-2,qAR,IZ1REU-11:=4429.38N/00&11.');

        it('Should not have a longitude', function() {
            should.not.exist(parsed.longitude);
        });

        it('Should not have a latitude', function() {
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
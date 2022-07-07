/**
 * a $GPRMC NMEA decoding test
 * Wed Dec 12 2007, Hessu, OH7LZB
 */
import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import { AprsPacket } from '../src/models/AprsPacket';
import { PacketTypeEnum } from '../src/enums/PacketTypeEnum';
import { AprsParser } from '../src/parsers/AprsParser';

describe('FAP - Test decoding GPRMC NMEA', function() {
    const parser = new AprsParser();

    describe('#parseaprs - Test parsing a GPRMC NMEA packet', function() {
        const header = `OH7LZB-11>APRS,W4GR*,WIDE2-1,qAR,WA4DSY`;
        const body = '$GPRMC,145526,A,3349.0378,N,08406.2617,W,23.726,27.9,121207,4.9,W*7A';

        const parsed: AprsPacket = parser.parseAprs(`${header}:${body}`);

        it(`Should return the header: ${header}`, function() {
            assert.equal(header, parsed.header);
        });

        it(`Should return the body: ${body}`, function() {
            assert.equal(body, parsed.body);
        });

        it('Should return the location type: location', function() {
            assert.equal(PacketTypeEnum.LOCATION, parsed.type);
        });

        it('Should return the type: nmea', function() {
            assert.equal('nmea', parsed.format);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return posambiguity: null', function() {
            should.not.exist(parsed.posambiguity);
        });

        it('Should return messaging: null', function() {
            should.not.exist(parsed.messaging);
        });

        it('Should return a checksumok: 1 or true', function() {
            assert.equal(true, parsed.checksumok);
        });

        it('Should return a timestamp: 1197471326', function() {
            assert.equal(1197471326, parsed.timestamp);
        });

        it('Should return latitude value, that when rounded should equal: 33.8173', function() {
            assert.equal(33.8173, parsed.latitude?.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -84.1044', function() {
            assert.equal(-84.1044, parsed.longitude?.toFixed(4));
        });

        it('Should return position resolution: 0.1852', function() {
            assert.equal(0.1852, parsed.posresolution);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return speed: 43.94', function() {
            assert.equal(43.94, parsed.speed?.toFixed(2));
        });

        it('Should return course: 28', function() {
            assert.equal(28, parsed.course);
        });

        it('Should return altitude: null', function() {
            should.not.exist(parsed.altitude);
        });
    });

    // Same packet only Southern latitude East longitude.
    describe('#parseaprs - Test parsing a GPRMC NMEA packet', function() {
        const parsed: AprsPacket = parser.parseAprs("OH7LZB-11>APRS,W4GR*,WIDE2-1,qAR,WA4DSY:$GPRMC,145526,A,3349.0378,S,08406.2617,E,23.726,27.9,121207,4.9,W*75");

        it('Should return latitude value, that when rounded should equal: -33.8173', function() {
            assert.equal(-33.8173, parsed.latitude?.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: 84.1044', function() {
            assert.equal(84.1044, parsed.longitude?.toFixed(4));
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid position', function() {
        const parsed: AprsPacket = parser.parseAprs("AE4XO-14>GPSLK,WIDE1-1,WIDE2-2,qAR,AE4XO:$GPRMC,,V,3237.1002,N,08340.7972,W,,,,3.2,W*62");

        it('Should return a result code: gprmc_nofix', function() {
            assert.equal("gprmc_nofix", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid timestamp', function() {
        const parsed: AprsPacket = parser.parseAprs("KB9WGA-2>APRS,W9DOR-10*,WIDE2-1,qAR,KB8ZXE-1:$GPRMC,A2,A,,,,,,,,, W * 0");

        it('Should return a result code: gprmc_inv_time - 2nd path', function() {
            assert.equal("gprmc_inv_time", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid timestamp', function() {
        const parsed: AprsPacket = parser.parseAprs("KB9WGA-2>APRS,W9DOR-10*,WIDE2-1,qAR,KI8KR-10:$GPRMC,11,A,4458.2127,N,08720.8152,W,0.000,0.0,120,2.2, W * 0");

        it('Should return a result code: gprmc_inv_time - 2nd path', function() {
            assert.equal("gprmc_inv_time", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid date', function() {
        const parsed: AprsPacket = parser.parseAprs("KD6VKF-12>GPSLK,KF6ILA*,KF6ILA-10*,WIDE2*,qAR,KK6TV-10:$GPRMC,153041.000,A,3300.8386,N,11656.7468,W,6.72,27.02,id`fbnXXX�Thh�");

        it('Should return a result code: gprmc_inv_date', function() {
            assert.equal("gprmc_inv_date", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with too large E/W value.', function() {
        const parsed: AprsPacket = parser.parseAprs("KD6VKF-12>GPSLK,KF6ILA*,KF6ILA-10*,WIDE2*,qAR,KK6TV-10:$GPRMC,145526,A,3349.0378,N,18406.2617,W,180,27.9,121207,4.9,W*5E");

        it('Should return a result code: nmea_large_ew', function() {
            assert.equal("nmea_large_ew", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with too large N/S value.', function() {
        const parsed: AprsPacket = parser.parseAprs("KD6VKF-12>GPSLK,KF6ILA*,KF6ILA-10*,WIDE2*,qAR,KK6TV-10:$GPRMC,145526,A,9049.0378,N,18406.2617,W,180,27.9,121207,4.9,W*57");

        it('Should return a result code: nmea_large_ns', function() {
            assert.equal("nmea_large_ns", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with too too few fields.', function() {
        const parsed: AprsPacket = parser.parseAprs("KD6VKF-12>GPSLK,KF6ILA*,KF6ILA-10*,WIDE2*,qAR,KK6TV-10:$GPRMC,N,18406.2617,W,180,27.9,121207,4.9,W*1D");

        it('Should return a result code: gprmc_fewfields', function() {
            assert.equal("gprmc_fewfields", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid sign.', function() {
        const parsed: AprsPacket = parser.parseAprs("KD6VKF-12>GPSLK,KF6ILA*,KF6ILA-10*,WIDE2*,qAR,KK6TV-10:$GPRMC,145526,A,9049.0378,R,18406.2617,W,180,27.9,121207,4.9,W*4B");

        it('Should return a result code: nmea_inv_sign', function() {
            assert.equal("nmea_inv_sign", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid coordinate.', function() {
        const parsed: AprsPacket = parser.parseAprs(`KD6VKF-12>GPSLK,KF6ILA*,KF6ILA-10*,WIDE2*,qAR,KK6TV-10:$GPRMC,145526,A,9049.0D78,N,18406.2617,W,180,27.9,121207,4.9,W*20`);

        it('Should return a result code: nmea_inv_sign', function() {
            assert.equal("nmea_inv_cval", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid time.', function() {
        const parsed: AprsPacket = parser.parseAprs(`OH7LZB-11>APRS,W4GR*,WIDE2-1,qAR,WA4DSY:$GPRMC,545526,A,3349.0378,S,08406.2617,E,23.726,27.9,121207,4.9,W*113`);

        it('Should return a result code: gprmc_inv_time', function() {
            assert.equal("gprmc_inv_time", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid time.', function() {
        const parsed: AprsPacket = parser.parseAprs(`OH7LZB-11>APRS,W4GR*,WIDE2-1,qAR,WA4DSY:$GPMY,145526,A,3349.0378,S,08406.2617,E,23.726,27.9,121207,4.9,W*113`);

        it('Should return a result code: nmea_unsupp', function() {
            assert.equal("nmea_unsupp", parsed.resultCode);
        });
    });
});
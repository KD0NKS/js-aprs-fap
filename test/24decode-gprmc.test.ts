/**
 * a $GPRMC NMEA decoding test
 * Wed Dec 12 2007, Hessu, OH7LZB
 */
import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import aprsPacket from '../src/aprsPacket';
import { PacketTypeEnum } from '../src/PacketTypeEnum';
import aprsParser from '../src/parser';

describe('FAP - Test decoding GPRMC NMEA', () => {
    let parser = new aprsParser();

    describe('#parseaprs - Test parsing a GPRMC NMEA packet', () => {
        let $srccall = "OH7LZB-11";
        let $dstcall = "APRS";
        let $header = `${$srccall}>${$dstcall},W4GR*,WIDE2-1,qAR,WA4DSY`;
        let $body = '$GPRMC,145526,A,3349.0378,N,08406.2617,W,23.726,27.9,121207,4.9,W*7A';

        let $aprspacket = `${$header}:${$body}`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        // the parser always appends an SSID - make sure the behaviour doesn't change
        $dstcall += '-0';

        it(`Should return the header: ${$header}`, () => {
            assert.equal($header, parsed.header);
        });

        it(`Should return the body: ${$body}`, () => {
            assert.equal($body, parsed.body);
        });

        it('Should return the location type: location', () => {
            assert.equal(PacketTypeEnum.LOCATION, parsed.type);
        });

        it('Should return the type: nmea', () => {
            assert.equal('nmea', parsed.format);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return posambiguity: null', () => {
            should.not.exist(parsed.posambiguity);
        });

        it('Should return messaging: null', () => {
            should.not.exist(parsed.messaging);
        });

        it('Should return a checksumok: 1 or true', () => {
            assert.equal(true, parsed.checksumok);
        });

        it('Should return a timestamp: 1197471326', () => {
            assert.equal(1197471326, parsed.timestamp);
        });

        it('Should return latitude value, that when rounded should equal: 33.8173', () => {
            assert.equal(33.8173, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -84.1044', () => {
            assert.equal(-84.1044, parsed.longitude.toFixed(4));
        });

        it('Should return position resolution: 0.1852', () => {
            assert.equal(0.1852, parsed.posresolution);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return speed: 43.94', () => {
            assert.equal(43.94, parsed.speed.toFixed(2));
        });

        it('Should return course: 28', () => {
            assert.equal(28, parsed.course);
        });

        it('Should return altitude: null', () => {
            should.not.exist(parsed.altitude);
        });
    });

    // Same packet only Southern latitude East longitude.
    describe('#parseaprs - Test parsing a GPRMC NMEA packet', () => {
        let $aprspacket = `OH7LZB-11>APRS,W4GR*,WIDE2-1,qAR,WA4DSY:$GPRMC,145526,A,3349.0378,S,08406.2617,E,23.726,27.9,121207,4.9,W*75`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return latitude value, that when rounded should equal: -33.8173', () => {
            assert.equal(-33.8173, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: 84.1044', () => {
            assert.equal(84.1044, parsed.longitude.toFixed(4));
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid position', () => {
        let parsed: aprsPacket = parser.parseaprs("AE4XO-14>GPSLK,WIDE1-1,WIDE2-2,qAR,AE4XO:$GPRMC,,V,3237.1002,N,08340.7972,W,,,,3.2,W*62");

        it('Should return a result code: gprmc_nofix', () => {
            assert.equal("gprmc_nofix", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid timestamp', () => {
        let parsed: aprsPacket = parser.parseaprs("KB9WGA-2>APRS,W9DOR-10*,WIDE2-1,qAR,KB8ZXE-1:$GPRMC,A2,A,,,,,,,,, W * 0");

        it('Should return a result code: gprmc_inv_time - 2nd path', () => {
            assert.equal("gprmc_inv_time", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid timestamp', () => {
        let parsed: aprsPacket = parser.parseaprs("KB9WGA-2>APRS,W9DOR-10*,WIDE2-1,qAR,KI8KR-10:$GPRMC,11,A,4458.2127,N,08720.8152,W,0.000,0.0,120,2.2, W * 0");

        it('Should return a result code: gprmc_inv_time - 2nd path', () => {
            assert.equal("gprmc_inv_time", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid date', () => {
        let parsed: aprsPacket = parser.parseaprs("KD6VKF-12>GPSLK,KF6ILA*,KF6ILA-10*,WIDE2*,qAR,KK6TV-10:$GPRMC,153041.000,A,3300.8386,N,11656.7468,W,6.72,27.02,id`fbnXXX�Thh�");

        it('Should return a result code: gprmc_inv_date', () => {
            assert.equal("gprmc_inv_date", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with too large E/W value.', () => {
        let $srccall = "KD6VKF-12";
        let $dstcall = "GPSLK";
        let $header = `${$srccall}>${$dstcall},KF6ILA*,KF6ILA-10*,WIDE2*,qAR,KK6TV-10`;
        let $body = '$GPRMC,145526,A,3349.0378,N,18406.2617,W,180,27.9,121207,4.9,W*5E';

        let $aprspacket = `${$header}:${$body}`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return a result code: nmea_large_ew', () => {
            assert.equal("nmea_large_ew", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with too large N/S value.', () => {
        let $srccall = "KD6VKF-12";
        let $dstcall = "GPSLK";
        let $header = `${$srccall}>${$dstcall},KF6ILA*,KF6ILA-10*,WIDE2*,qAR,KK6TV-10`;
        let $body = '$GPRMC,145526,A,9049.0378,N,18406.2617,W,180,27.9,121207,4.9,W*57';

        let $aprspacket = `${$header}:${$body}`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return a result code: nmea_large_ns', () => {
            assert.equal("nmea_large_ns", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with too too few fields.', () => {
        let $srccall = "KD6VKF-12";
        let $dstcall = "GPSLK";
        let $header = `${$srccall}>${$dstcall},KF6ILA*,KF6ILA-10*,WIDE2*,qAR,KK6TV-10`;
        let $body = '$GPRMC,N,18406.2617,W,180,27.9,121207,4.9,W*1D';

        let $aprspacket = `${$header}:${$body}`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return a result code: gprmc_fewfields', () => {
            assert.equal("gprmc_fewfields", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid sign.', () => {
        let $srccall = "KD6VKF-12";
        let $dstcall = "GPSLK";
        let $header = `${$srccall}>${$dstcall},KF6ILA*,KF6ILA-10*,WIDE2*,qAR,KK6TV-10`;
        let $body = '$GPRMC,145526,A,9049.0378,R,18406.2617,W,180,27.9,121207,4.9,W*4B';

        let $aprspacket = `${$header}:${$body}`;

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return a result code: nmea_inv_sign', () => {
            assert.equal("nmea_inv_sign", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid coordinate.', () => {
        let parsed: aprsPacket = parser.parseaprs(`KD6VKF-12>GPSLK,KF6ILA*,KF6ILA-10*,WIDE2*,qAR,KK6TV-10:$GPRMC,145526,A,9049.0D78,N,18406.2617,W,180,27.9,121207,4.9,W*20`)

        it('Should return a result code: nmea_inv_sign', () => {
            assert.equal("nmea_inv_cval", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid time.', () => {
        let parsed: aprsPacket = parser.parseaprs(`OH7LZB-11>APRS,W4GR*,WIDE2-1,qAR,WA4DSY:$GPRMC,545526,A,3349.0378,S,08406.2617,E,23.726,27.9,121207,4.9,W*113`)

        it('Should return a result code: gprmc_inv_time', () => {
            assert.equal("gprmc_inv_time", parsed.resultCode);
        });
    });

    describe('#parseaprs - Test parsing a GPRMC packet with an invalid time.', () => {
        let parsed: aprsPacket = parser.parseaprs(`OH7LZB-11>APRS,W4GR*,WIDE2-1,qAR,WA4DSY:$GPMY,145526,A,3349.0378,S,08406.2617,E,23.726,27.9,121207,4.9,W*113`)

        it('Should return a result code: nmea_unsupp', () => {
            assert.equal("nmea_unsupp", parsed.resultCode);
        });
    });
});
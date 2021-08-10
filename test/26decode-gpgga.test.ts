/**
 * a $GPRMC NMEA decoding test
 * Wed Dec 12 2007, Hessu, OH7LZB
 */
const assert = require('assert');

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

describe('FAP - Test decoding GPGGA NMEA', function() {
    let parser = new aprsParser();

    describe('#parseaprs - Test parsing a GPGGA packet with a bad checksum', function() {
        let parsed: aprsPacket = parser.parseaprs("DL5UY-3>GPSC70,DB0RO,WIDE1,F5ZEE,LX0APR-2,WIDE2*,qAR,DB0NIS-10:$GPGGA,222814.000,484768272,N,00829.8212,E,2,09,1.0,714.0,M,48.0,M,1.8,0000*7B");

        it('Should return a result code: nmea_inv_cksum', function() {
            assert.equal("nmea_inv_cksum", parsed.resultCode);
        });
    });

    /*
    describe('#parseaprs - Test parsing something', () => {
        let parsed: aprsPacket = parser.parseaprs("N7UV-5>APRS,KE7JVX-4,UNION,WIDE2*,qAR,K6YTE-10:$GPGSV,4,3,16,17,12,193,26,23,14,155,17,27,09,037,33,28,47,256,27*75");

        console.log(parsed);

        aprsPacket {
            origpacket: 'N7UV-5>APRS,KE7JVX-4,UNION,WIDE2*,qAR,K6YTE-10:$GPGSV,4,3,16,17,12,193,26,23,14,155,17,27,09,037,33,28,47,256,27*75',
            header: 'N7UV-5>APRS,KE7JVX-4,UNION,WIDE2*,qAR,K6YTE-10',
            body: '$GPGSV,4,3,16,17,12,193,26,23,14,155,17,27,09,037,33,28,47,256,27*75',
            sourceCallsign: 'N7UV-5',
            destCallsign: 'APRS',
            digipeaters: [
                digipeater { callsign: 'KE7JVX-4', wasDigipeated: false },
                digipeater { callsign: 'UNION', wasDigipeated: false },
                digipeater { callsign: 'WIDE2', wasDigipeated: true },
                digipeater { callsign: 'qAR', wasDigipeated: false },
                digipeater { callsign: 'K6YTE-10', wasDigipeated: false }
            ],
            type: 'location',
            checksumok: true,
            format: 'nmea',
            symboltable: '/',
            symbolcode: '/'
        }
    });
    */
});
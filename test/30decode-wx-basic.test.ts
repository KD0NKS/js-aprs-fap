/**
 * a basic wx packet decoding test
 * Tue Dec 11 2007, Hessu, OH7LZB
 */

// message decoding
// Tue Dec 11 2007, Hessu, OH7LZB
import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import { AprsPacket } from '../src/models/AprsPacket';
import { AprsParser } from '../src/parsers/AprsParser';

describe('FAP - Test wx packet parsing', function() {
    const parser: AprsParser = new AprsParser();

    describe('#parseaprs - Test parsing location weather packet with software', function() {
        const srccall = "OH2RDP-1";
        const dstcall = "BEACON-15";

        const parsed: AprsPacket = parser.parseAprs(`${srccall}>${dstcall},WIDE2-1,qAo,OH2MQK-1:=6030.35N/02443.91E_150/002g004t039r001P002p004h00b10125XRSW`);

        it(`Should return srccallsign: ${srccall}`, function() {
            assert.equal(srccall, parsed.sourceCallsign);
        });

        it('Should return a null result code.', function() {
            assert.equal(null, parsed.resultCode);
        });

        it(`Should return a dstcall: ${dstcall}`, function() {
            assert.equal(dstcall, parsed.destCallsign);
        });

        it('Should return latitude value, that when rounded should equal: 60.5058', function() {
            assert.equal(60.5058, parsed.latitude?.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: 24.7318', function() {
            assert.equal(24.7318, parsed.longitude?.toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            assert.equal(18.52, parsed.posresolution);
        });

        it('Should return a wx object', function() {
            should.exist(parsed.weather);
        });

        it('Should return wind direction: 150', function() {
            assert.equal(150, parsed.weather?.wind_direction);
        });

        it('Should return wind speed: 0.9', function() {
            assert.equal(0.9, parsed.weather?.wind_speed);
        });

        it('Should return wind gust: 1.8', function() {
            assert.equal(1.8, parsed.weather?.wind_gust);
        });

        it('Should return temp: 3.9', function() {
            assert.equal(3.9, parsed.weather?.temp);
        });

        it('Should return humidity: 100', function() {
            assert.equal(100, parsed.weather?.humidity);
        });

        it('Should return pressure: 1012.5', function() {
            assert.equal(1012.5, parsed.weather?.pressure);
        });

        it('Should return rain 24h: 1.0', function() {
            assert.equal(1.0, parsed.weather?.rain_24h);
        });

        it('Should return rain 1h: 0.3', function() {
            assert.equal(0.3, parsed.weather?.rain_1h);
        });

        it('Should return rain midnight: 0.5', function() {
            assert.equal(0.5, parsed.weather?.rain_midnight);
        });

        it('Should return software: XRSW', function() {
            assert.equal("XRSW", parsed.weather?.soft);
        });
    });

    describe('#parseaprs - Test parsing location weather packet with comment', function() {
        const parsed: AprsPacket = parser.parseAprs("OH2GAX>APU25N,TCPIP*,qAC,OH2GAX:@101317z6024.78N/02503.97E_156/001g005t038r000p000P000h91b10093/type ?sade for more wx info");

        it('Should return latitude value, that when rounded should equal: 60.4130', function() {
            assert.equal(60.4130, parsed.latitude?.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: 25.0662', function() {
            assert.equal(25.0662, parsed.longitude?.toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            assert.equal(18.52, parsed.posresolution);
        });

        it('Should return comment: "/type ?sade for more wx info"', function() {
            assert.equal("/type ?sade for more wx info", parsed.comment);
        });

        it('Should return a wx object', function() {
            should.exist(parsed.weather);
        });

        it('Should return wind direction: 156', function() {
            assert.equal(156, parsed.weather?.wind_direction);
        });

        it('Should return wind speed: 0.4', function() {
            assert.equal(0.4, parsed.weather?.wind_speed);
        });

        it('Should return wind gust: 2.2', function() {
            assert.equal(2.2, parsed.weather?.wind_gust);
        });

        it('Should return temp: 3.3', function() {
            assert.equal(3.3, parsed.weather?.temp);
        });

        it('Should return humidity: 91', function() {
            assert.equal(91, parsed.weather?.humidity);
        });

        it('Should return pressure: 1009.3', function() {
            assert.equal(1009.3, parsed.weather?.pressure);
        });

        it('Should return rain 24h: 0.0', function() {
            assert.equal(0.0, parsed.weather?.rain_24h);
        });

        it('Should return rain 1h: 0.0', function() {
            assert.equal(0.0, parsed.weather?.rain_1h);
        });

        it('Should return rain midnight: 0.0', function() {
            assert.equal(0.0, parsed.weather?.rain_midnight);
        });
    });

    describe('#parseaprs - Test a third location weather packet with comment', function() {
        const parsed: AprsPacket = parser.parseAprs("JH9YVX>APU25N,TCPIP*,qAC,T2TOKYO3:@011241z3558.58N/13629.67E_068/001g001t033r000p020P020b09860h98Oregon WMR100N Weather Station {UIV32N}");

        it('Should return latitude value, that when rounded should equal: 35.9763', function() {
            assert.equal(35.9763, parsed.latitude?.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: 136.4945', function() {
            assert.equal(136.4945, parsed.longitude?.toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            assert.equal(18.52, parsed.posresolution);
        });

        it('Should return comment: "Oregon WMR100N Weather Station {UIV32N}"', function() {
            assert.equal("Oregon WMR100N Weather Station {UIV32N}", parsed.comment);
        });

        it('Should return wind direction: 68', function() {
            assert.equal(68, parsed.weather?.wind_direction);
        });

        it('Should return wind speed: 0.4', function() {
            assert.equal(0.4, parsed.weather?.wind_speed);
        });

        it('Should return wind gust: 0.4', function() {
            assert.equal(0.4, parsed.weather?.wind_gust);
        });

        it('Should return rain 1h: 0.0', function() {
            assert.equal(0.0, parsed.weather?.rain_1h);
        });

        it('Should return rain 24h: 5.1', function() {
            assert.equal(5.1, parsed.weather?.rain_24h);
        });

        it('Should return rain midnight: 5.1', function() {
            assert.equal(5.1, parsed.weather?.rain_midnight);
        });
    });

    describe('#parseaprs - Test a positionless weather packet with snowfall', function() {
        const parsed: AprsPacket = parser.parseAprs("JH9YVX>APU25N,TCPIP*,qAC,T2TOKYO3:_12032359c180s001g002t033r010p040P080b09860h98Os010L500");

        it('Should return latitude value: null', function() {
            should.not.exist(parsed.latitude);
        });

        it('Should return longitude value: null', function() {
            should.not.exist(parsed.longitude);
        });

        it('Should return position resolution: null', function() {
            should.not.exist(parsed.posresolution);
        });

        it('Should return wind direction: 180', function() {
            assert.equal(180, parsed.weather?.wind_direction);
        });

        it('Should return wind speed: 0.4', function() {
            assert.equal(0.4, parsed.weather?.wind_speed);
        });

        it('Should return wind gust: 0.9', function() {
            assert.equal(0.9, parsed.weather?.wind_gust);
        });

        it('Should return temp: 0.6', function() {
            assert.equal(0.6, parsed.weather?.temp);
        });

        it('Should return humidity: 98', function() {
            assert.equal(98, parsed.weather?.humidity);
        });

        it('Should return pressure: 986.0', function() {
            assert.equal(986.0, parsed.weather?.pressure);
        });

        it('Should return rain 1h: 2.5', function() {
            assert.equal(2.5, parsed.weather?.rain_1h);
        });

        it('Should return rain 24h: 10.2', function() {
            assert.equal(10.2, parsed.weather?.rain_24h);
        });

        it('Should return rain midnight: 20.3', function() {
            assert.equal(20.3, parsed.weather?.rain_midnight);
        });

        it('Should return snow 24h: 2.5', function() {
            assert.equal(2.5, parsed.weather?.snow_24h);
        });

        it('Should return luminosity: 500', function() {
            assert.equal(500, parsed.weather?.luminosity);
        });
    });

    describe('#parseaprs - Test an unsupported positionless weather report', function() {
        const parsed: AprsPacket = parser.parseAprs("WA2GUG>BEACON,WA2GUG-15,K1FFK,WIDE1*,qAR,N3LEE-4:_42204.57N/07401.85W#PHG1010/ GRN WX contact wa2gug@arrl.net");

        it('Should return result code: wx_unsupp', function() {
            assert.equal('wx_unsupp', parsed.resultCode);
        });
    });

    /*
    describe('#parseaprs - Test a packet with spaces when no wind gust readings are available.', function() {

    });
    */
});
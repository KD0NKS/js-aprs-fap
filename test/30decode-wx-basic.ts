/**
 * a basic wx packet decoding test
 * Tue Dec 11 2007, Hessu, OH7LZB
 */

// message decoding
// Tue Dec 11 2007, Hessu, OH7LZB
import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

describe('FAP - Test wx packet parsing', function() {
    let parser: aprsParser = new aprsParser();

    describe('#parseaprs - Test parsing location weather packet with software', function() {
        let $srccall = "OH2RDP-1";
        let $dstcall = "BEACON-15";
        let $aprspacket = $srccall + '>' + $dstcall + ',WIDE2-1,qAo,OH2MQK-1:=6030.35N/02443.91E_150/002g004t039r001P002p004h00b10125XRSW';

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return srccallsign: ' + $srccall, function() {
            assert.equal($srccall, parsed.sourceCallsign);
        });

        it('Should return a null result code.', function() {
            assert.equal(null, parsed.resultCode);
        });

        it('Should return a dstcall: ' + $dstcall, function() {
            assert.equal($dstcall, parsed.destCallsign);
        });

        it('Should return latitude value, that when rounded should equal: 60.5058', function() {
            assert.equal(60.5058, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: 24.7318', function() {
            assert.equal(24.7318, parsed.longitude.toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            assert.equal(18.52, parsed.posresolution);
        });

        it('Should return a wx object', function() {
            should.exist(parsed.wx);
        });

        it('Should return wind direction: 150', function() {
            assert.equal(150, parsed.wx.wind_direction);
        });

        it('Should return wind speed: 0.9', function() {
            assert.equal(0.9, parsed.wx.wind_speed);
        });

        it('Should return wind gust: 1.8', function() {
            assert.equal(1.8, parsed.wx.wind_gust);
        });

        it('Should return temp: 3.9', function() {
            assert.equal(3.9, parsed.wx.temp);
        });

        it('Should return humidity: 100', function() {
            assert.equal(100, parsed.wx.humidity);
        });

        it('Should return pressure: 1012.5', function() {
            assert.equal(1012.5, parsed.wx.pressure);
        });

        it('Should return rain 24h: 1.0', function() {
            assert.equal(1.0, parsed.wx.rain_24h);
        });

        it('Should return rain 1h: 0.3', function() {
            assert.equal(0.3, parsed.wx.rain_1h);
        });

        it('Should return rain midnight: 0.5', function() {
            assert.equal(0.5, parsed.wx.rain_midnight);
        });

        it('Should return software: XRSW', function() {
            assert.equal("XRSW", parsed.wx.soft);
        });
    });

    describe('#parseaprs - Test parsing location weather packet with comment', function() {
        let $aprspacket = "OH2GAX>";

        let tmp = '41505532354E2C54435049502A2C7141432C4F48324741583A403130313331377A363032342E37384E2F30323530332E3937455F3135362F30303167303035743033387230303070303030503030306839316231303039332F74797065203F7361646520666F72206D6F726520777820696E666F'.match(/.{2}/g);
        tmp.forEach(function(x) {
            $aprspacket += String.fromCharCode(parseInt(x, 16));
        });

        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return latitude value, that when rounded should equal: 60.4130', function() {
            assert.equal(60.4130, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: 25.0662', function() {
            assert.equal(25.0662, parsed.longitude.toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            assert.equal(18.52, parsed.posresolution);
        });

        it('Should return comment: "/type ?sade for more wx info"', function() {
            assert.equal("/type ?sade for more wx info", parsed.comment);
        });

        it('Should return a wx object', function() {
            should.exist(parsed.wx);
        });

        it('Should return wind direction: 156', function() {
            assert.equal(156, parsed.wx.wind_direction);
        });

        it('Should return wind speed: 0.4', function() {
            assert.equal(0.4, parsed.wx.wind_speed);
        });

        it('Should return wind gust: 2.2', function() {
            assert.equal(2.2, parsed.wx.wind_gust);
        });

        it('Should return temp: 3.3', function() {
            assert.equal(3.3, parsed.wx.temp);
        });

        it('Should return humidity: 91', function() {
            assert.equal(91, parsed.wx.humidity);
        });

        it('Should return pressure: 1009.3', function() {
            assert.equal(1009.3, parsed.wx.pressure);
        });

        it('Should return rain 24h: 0.0', function() {
            assert.equal(0.0, parsed.wx.rain_24h);
        });

        it('Should return rain 1h: 0.0', function() {
            assert.equal(0.0, parsed.wx.rain_1h);
        });

        it('Should return rain midnight: 0.0', function() {
            assert.equal(0.0, parsed.wx.rain_midnight);
        });
    });

    describe('#parseaprs - Test a third location weather packet with comment', function() {
        let $aprspacket = 'JH9YVX>APU25N,TCPIP*,qAC,T2TOKYO3:@011241z3558.58N/13629.67E_068/001g001t033r000p020P020b09860h98Oregon WMR100N Weather Station {UIV32N}';
        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return latitude value, that when rounded should equal: 35.9763', function() {
            assert.equal(35.9763, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: 136.4945', function() {
            assert.equal(136.4945, parsed.longitude.toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            assert.equal(18.52, parsed.posresolution);
        });

        it('Should return comment: "Oregon WMR100N Weather Station {UIV32N}"', function() {
            assert.equal("Oregon WMR100N Weather Station {UIV32N}", parsed.comment);
        });

        it('Should return wind direction: 68', function() {
            assert.equal(68, parsed.wx.wind_direction);
        });

        it('Should return wind speed: 0.4', function() {
            assert.equal(0.4, parsed.wx.wind_speed);
        });

        it('Should return wind gust: 0.4', function() {
            assert.equal(0.4, parsed.wx.wind_gust);
        });

        it('Should return rain 1h: 0.0', function() {
            assert.equal(0.0, parsed.wx.rain_1h);
        });

        it('Should return rain 24h: 5.1', function() {
            assert.equal(5.1, parsed.wx.rain_24h);
        });

        it('Should return rain midnight: 5.1', function() {
            assert.equal(5.1, parsed.wx.rain_midnight);
        });
    });

    describe('#parseaprs - Test a positionless weather packet with snowfall', function() {
        let $aprspacket = 'JH9YVX>APU25N,TCPIP*,qAC,T2TOKYO3:_12032359c180s001g002t033r010p040P080b09860h98Os010L500';
        let parsed: aprsPacket = parser.parseaprs($aprspacket);

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
            assert.equal(180, parsed.wx.wind_direction);
        });

        it('Should return wind speed: 0.4', function() {
            assert.equal(0.4, parsed.wx.wind_speed);
        });

        it('Should return wind gust: 0.9', function() {
            assert.equal(0.9, parsed.wx.wind_gust);
        });

        it('Should return temp: 0.6', function() {
            assert.equal(0.6, parsed.wx.temp);
        });

        it('Should return humidity: 98', function() {
            assert.equal(98, parsed.wx.humidity);
        });

        it('Should return pressure: 986.0', function() {
            assert.equal(986.0, parsed.wx.pressure);
        });

        it('Should return rain 1h: 2.5', function() {
            assert.equal(2.5, parsed.wx.rain_1h);
        });

        it('Should return rain 24h: 10.2', function() {
            assert.equal(10.2, parsed.wx.rain_24h);
        });

        it('Should return rain midnight: 20.3', function() {
            assert.equal(20.3, parsed.wx.rain_midnight);
        });

        it('Should return snow 24h: 2.5', function() {
            assert.equal(2.5, parsed.wx.snow_24h);
        });

        it('Should return luminosity: 500', function() {
            assert.equal(500, parsed.wx.luminosity);
        });
    });
});
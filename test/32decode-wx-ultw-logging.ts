/**
 * an ultw wx packet decoding test
 * Tue Dec 11 2007, Hessu, OH7LZB
 */
import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

describe('FAP - Test parsing $ULTW logging', function() {
    let parser = new aprsParser();

    describe('#parseaprs - Test parsing the first $ULTW format', function() {
        let $aprspacket = 'MB7DS>APRS,TCPIP*,qAC,APRSUK2:!!00000066013D000028710166--------0158053201200210';
        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return wind direction: 144', function() {
            assert.equal(144, parsed.wx.wind_direction);
        });

        it('Should return wind speed: 14.7', function() {
            assert.equal(14.7, parsed.wx.wind_speed);
        });

        it('Should return wind gust: null', function() {
            should.not.exist(parsed.wx.wind_gust);
        });

        it('Should return temp: -0.2', function() {
            assert.equal(-0.2, parsed.wx.temp);
        });

        it('Should return temp_in: 2.1', function() {
            assert.equal(2.1, parsed.wx.temp_in);
        });

        it('Should return humidity: null', function() {
            should.not.exist(parsed.wx.humidity);
        });

        it('Should return pressure: 1035.3', function() {
            assert.equal(1035.3, parsed.wx.pressure);
        });

        it('Should return rain 24h: null', function() {
            should.not.exist(parsed.wx.rain_24h);
        });

        it('Should return rain 1h: null', function() {
            should.not.exist(parsed.wx.rain_1h);
        });

        it('Should return rain midnight: 73.2', function() {
            assert.equal(73.2, parsed.wx.rain_midnight);
        });

        it('Should return software: null', function() {
            should.not.exist(parsed.wx.soft);
        });
    });
});
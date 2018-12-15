/**
 * an ultw wx packet decoding test
 * Tue Dec 11 2007, Hessu, OH7LZB
 */
import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

describe('FAP - Test $ULTW wx packet parsing', function() {
    let parser = new aprsParser();

    describe('#parseaprs - Test parsing the first $ULTW format', function() {
        let $aprspacket = 'WC4PEM-14>APN391,WIDE2-1,qAo,K2KZ-3:$ULTW0053002D028D02FA2813000D87BD000103E8015703430010000C';
        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return wind direction: 64', function() {
            assert.equal(64, parsed.wx.wind_direction);
        });

        it('Should return wind speed: 0.3', function() {
            assert.equal(0.3, parsed.wx.wind_speed);
        });

        it('Should return wind gust: 2.3', function() {
            assert.equal(2.3, parsed.wx.wind_gust);
        });

        it('Should return temp: 18.5', function() {
            assert.equal(18.5, parsed.wx.temp);
        });

        it('Should return humidity: 100', function() {
            assert.equal(100, parsed.wx.humidity);
        });

        it('Should return pressure: 1025.9', function() {
            assert.equal(1025.9, parsed.wx.pressure);
        });

        it('Should return rain 24h: null', function() {
            should.not.exist(parsed.wx.rain_24h);
        });

        it('Should return rain 1h: null', function() {
            should.not.exist(parsed.wx.rain_1h);
        });

        it('Should return rain midnight: 4.1', function() {
            assert.equal(4.1, parsed.wx.rain_midnight);
        });

        it('Should return software: null', function() {
            should.not.exist(parsed.wx.soft);
        });
    });

    describe('#parseaprs - Test parse a $ULTW format packet with a temperature below 0F', function() {
        let $aprspacket = 'SR3DGT>APN391,SQ2LYH-14,SR4DOS,WIDE2*,qAo,SR4NWO-1:$ULTW00000000FFEA0000296F000A9663000103E80016025D';
        let parsed: aprsPacket = parser.parseaprs($aprspacket);

        it('Should return wind direction: 0', function() {
            assert.equal(0, parsed.wx.wind_direction);
        });

        it('Should return wind speed: null', function() {
            should.not.exist(parsed.wx.wind_speed);
        });

        it('Should return wind gust: 0.0', function() {
            assert.equal(0.0, parsed.wx.wind_gust);
        });

        it('Should return temp: -19.0', function() {
            assert.equal(-19.0, parsed.wx.temp);
        });

        it('Should return humidity: 100', function() {
            assert.equal(100, parsed.wx.humidity);
        });

        it('Should return pressure: 1060.7', function() {
            assert.equal(1060.7, parsed.wx.pressure);
        });

        it('Should return rain 24h: null', function() {
            should.not.exist(parsed.wx.rain_24h);
        });

        it('Should return rain 1h: null', function() {
            should.not.exist(parsed.wx.rain_1h);
        });

        it('Should return rain midnight: 0.0', function() {
            assert.equal(0.0, parsed.wx.rain_midnight);
        });

        it('Should return software: null', function() {
            should.not.exist(parsed.wx.soft);
        });
    });
});
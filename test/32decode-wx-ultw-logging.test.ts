/**
 * an ultw wx packet decoding test
 * Tue Dec 11 2007, Hessu, OH7LZB
 */
import * as chai from 'chai';

const assert = require('assert');
const should = chai.should();

import { AprsPacket } from '../src/models/AprsPacket';
import { AprsParser } from '../src/parsers/AprsParser';

describe('FAP - Test parsing $ULTW logging', function() {
    let parser = new AprsParser();

    describe('#parseaprs - Test parsing the first $ULTW format', function() {
        let $aprspacket = 'MB7DS>APRS,TCPIP*,qAC,APRSUK2:!!00000066013D000028710166--------0158053201200210';
        let parsed: AprsPacket = parser.parseAprs($aprspacket);

        it('Should return wind direction: 144', function() {
            assert.equal(144, parsed.weather.wind_direction);
        });

        it('Should return wind speed: 14.7', function() {
            assert.equal(14.7, parsed.weather.wind_speed);
        });

        it('Should return wind gust: null', function() {
            should.not.exist(parsed.weather.wind_gust);
        });

        it('Should return temp: -0.2', function() {
            assert.equal(-0.2, parsed.weather.temp);
        });

        it('Should return temp_in: 2.1', function() {
            assert.equal(2.1, parsed.weather.temp_in);
        });

        it('Should return humidity: null', function() {
            should.not.exist(parsed.weather.humidity);
        });

        it('Should return pressure: 1035.3', function() {
            assert.equal(1035.3, parsed.weather.pressure);
        });

        it('Should return rain 24h: null', function() {
            should.not.exist(parsed.weather.rain_24h);
        });

        it('Should return rain 1h: null', function() {
            should.not.exist(parsed.weather.rain_1h);
        });

        it('Should return rain midnight: 73.2', function() {
            assert.equal(73.2, parsed.weather.rain_midnight);
        });

        it('Should return software: null', function() {
            should.not.exist(parsed.weather.soft);
        });
    });
});
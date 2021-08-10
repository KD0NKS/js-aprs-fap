// message decoding
// Tue Dec 11 2007, Hessu, OH7LZB
const assert = require('assert');

import aprsPacket from '../src/aprsPacket';
import { PacketTypeEnum } from '../src/PacketTypeEnum';
import aprsParser from '../src/parser';

describe('FAP - Test item parsing', function() {
    let parser = new aprsParser();

    describe('#parseaprs - Test parsing uncompressed item', function() {
        let $srccall = "OH2KKU-1";
        let $dstcall = "APRS";
        let $header = $srccall + '>' + $dstcall;
        let $body = ")AID #2!4903.50N/07201.75WA";
        let $aprspacket = $header + ':' + $body;

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

        it('Should return type value: item', function() {
            assert.equal(PacketTypeEnum.ITEM, parsed.type);
        });

        it('Should return alive value: true', function() {
            assert.equal(true, parsed.alive);
        });

        it('Should return item name: \'AID #2\'', function() {
            assert.equal('AID #2', parsed.itemname);
        });

        it('Should return format type: uncompressed', function() {
            assert.equal('uncompressed', parsed.format);
        });

        it('Should return the symbol table code: /', function() {
            assert.equal('/', parsed.symboltable);
        });

        it('Should return the symbol code: A', function() {
            assert.equal('A', parsed.symbolcode);
        });

        it('Should return latitude value, that when rounded should equal: 49.0583', function() {
            assert.equal(49.0583, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -72.0292', function() {
            assert.equal(-72.0292, parsed.longitude.toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            assert.equal(18.52, parsed.posresolution);
        });
    });

    describe('#parseaprs - Test parsing uncompressed item - kill', function() {
        let $srccall = "OH2KKU-1";
        let $dstcall = "APRS";
        let $header = $srccall + '>' + $dstcall;
        let $body = ")AID #2_4903.50N/07201.75WA";
        let $aprspacket = $header + ':' + $body;

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

        it('Should return type value: item', function() {
            assert.equal(PacketTypeEnum.ITEM, parsed.type);
        });

        it('Should return alive value: false', function() {
            assert.equal(false, parsed.alive);
        });

        it('Should return item name: \'AID #2\'', function() {
            assert.equal('AID #2', parsed.itemname);
        });

        it('Should return format type: uncompressed', function() {
            assert.equal('uncompressed', parsed.format);
        });

        it('Should return the symbol table code: /', function() {
            assert.equal('/', parsed.symboltable);
        });

        it('Should return the symbol code: A', function() {
            assert.equal('A', parsed.symbolcode);
        });

        it('Should return latitude value, that when rounded should equal: 49.0583', function() {
            assert.equal(49.0583, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -72.0292', function() {
            assert.equal(-72.0292, parsed.longitude.toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            assert.equal(18.52, parsed.posresolution);
        });
    });

    describe('#parseaprs - Test parsing compressed item', function() {
        let $srccall = "OH2KKU-1";
        let $dstcall = "APRS";
        let $header = $srccall + '>' + $dstcall;
        let $body = ")MOBIL!\\5L!!<*e79 sT";
        let $aprspacket = $header + ':' + $body;

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

        it('Should return type value: item', function() {
            assert.equal(PacketTypeEnum.ITEM, parsed.type);
        });

        it('Should return alive value: true', function() {
            assert.equal(true, parsed.alive);
        });

        it('Should return item name: \'AID #2\'', function() {
            assert.equal('MOBIL', parsed.itemname);
        });

        it('Should return format type: compressed', function() {
            assert.equal('compressed', parsed.format);
        });

        it('Should return the symbol table code: \\', function() {
            assert.equal('\\', parsed.symboltable);
        });

        it('Should return the symbol code: 9', function() {
            assert.equal('9', parsed.symbolcode);
        });

        it('Should return latitude value, that when rounded should equal: 49.5000', function() {
            assert.equal(49.5000, parsed.latitude.toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -72.7500', function() {
            assert.equal(-72.7500, parsed.longitude.toFixed(4));
        });

        it('Should return position resolution: 0.291', function() {
            assert.equal(0.291, parsed.posresolution);
        });
    });

    describe('#parseaprs - Test parsing an item with an error in decoding location', () => {
        let packet: aprsPacket = parser.parseaprs('FR5GS>APZDMR,QTH*,TCPIP*,qAU,T2STRAS:)FR5GS-DP!-21-4.88S/05541.66rRNG0034 IPSC2-FRANCE 3 MMDVM 439.9500@-9.4 MHz ');

        it('Should return a resultCode: item_dec_err', () => {
            assert.equal("item_dec_err", packet.resultCode);
        });
    });

    describe('#parseaprs - Test parsing an item with an error in decoding location', () => {
        let packet: aprsPacket = parser.parseaprs('HS3LSE-10>APZMDM,WIDE1-1,WIDE2-1,RELAY,WIDE,WIDE2-1*,qAR,DU6DKL-5:)SRNEMT02!1453.16N/103');

        it('Should return a resultCode: loc_short', () => {
            assert.equal("loc_short", packet.resultCode);
        });
    });

    // The perl parser cannot hit this scenario.
    describe("#parseaprs - Test parsing an item that's too short", () => {
        let packet: aprsPacket = parser.parseaprs('HS3LSE-10>APZMDM,WIDE1-1,WIDE2-1,RELAY,WIDE,WIDE2-1*,qAR,DU6DKL-5:)SRNEMT02!1453.16');

        it('Should return a resultCode: item_short', () => {
            assert.equal("item_short", packet.resultCode);
        });
    });
});
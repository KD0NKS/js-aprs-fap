// message decoding
// Tue Dec 11 2007, Hessu, OH7LZB
/*
var assert = require('assert');
var parser = require('../parser');

describe('FAP - Test item parsing', function() {
    describe('#parseaprs - Test parsing uncompressed item', function() {
        let $srccall = "OH2KKU-1";
        let $dstcall = "APRS";
        let $header = $srccall + '>' + $dstcall;
        let $body = ")AID #2!4903.50N/07201.75WA";
        let $aprspacket = $header + ':' + $body;

        let parsed = parser.parseaprs($aprspacket);

        it('Should return srccallsign: ' + $srccall, function() {
            assert.equal($srccall, parsed['srccallsign']);
        });

        it('Should return a null result code.', function() {
            assert.equal(null, parsed['resultcode']);
        });

        it('Should return a dstcall: ' + $dstcall, function() {
            assert.equal($dstcall, parsed['dstcallsign']);
        });

        it('Should return type value: item', function() {
            assert.equal('item', parsed['type']);
        });

        it('Should return alive value: 1', function() {
            assert.equal(1, parsed['alive']);
        });

        it('Should return item name: \'AID #2\'', function() {
            assert.equal('AID #2', parsed['itemname']);
        });

        it('Should return format type: uncompressed', function() {
            assert.equal('uncompressed', parsed['format']);
        });

        it('Should return the symbol table code: /', function() {
            assert.equal('/', parsed['symboltable']);
        });

        it('Should return the symbol code: A', function() {
            assert.equal('A', parsed['symbolcode']);
        });

        it('Should return latitude value, that when rounded should equal: 49.0583', function() {
            assert.equal(49.0583, parsed['latitude'].toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -72.0292', function() {
            assert.equal(-72.0292, parsed['longitude'].toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            assert.equal(18.52, parsed['posresolution']);
        });
    });

    describe('#parseaprs - Test parsing uncompressed item - kill', function() {
        let $srccall = "OH2KKU-1";
        let $dstcall = "APRS";
        let $header = $srccall + '>' + $dstcall;
        let $body = ")AID #2_4903.50N/07201.75WA";
        let $aprspacket = $header + ':' + $body;

        let parsed = parser.parseaprs($aprspacket);

        it('Should return srccallsign: ' + $srccall, function() {
            assert.equal($srccall, parsed['srccallsign']);
        });

        it('Should return a null result code.', function() {
            assert.equal(null, parsed['resultcode']);
        });

        it('Should return a dstcall: ' + $dstcall, function() {
            assert.equal($dstcall, parsed['dstcallsign']);
        });

        it('Should return type value: item', function() {
            assert.equal('item', parsed['type']);
        });

        it('Should return alive value: 0', function() {
            assert.equal(0, parsed['alive']);
        });

        it('Should return item name: \'AID #2\'', function() {
            assert.equal('AID #2', parsed['itemname']);
        });

        it('Should return format type: uncompressed', function() {
            assert.equal('uncompressed', parsed['format']);
        });

        it('Should return the symbol table code: /', function() {
            assert.equal('/', parsed['symboltable']);
        });

        it('Should return the symbol code: A', function() {
            assert.equal('A', parsed['symbolcode']);
        });

        it('Should return latitude value, that when rounded should equal: 49.0583', function() {
            assert.equal(49.0583, parsed['latitude'].toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -72.0292', function() {
            assert.equal(-72.0292, parsed['longitude'].toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            assert.equal(18.52, parsed['posresolution']);
        });
    });

    describe('#parseaprs - Test parsing compressed item', function() {
        let $srccall = "OH2KKU-1";
        let $dstcall = "APRS";
        let $header = $srccall + '>' + $dstcall;
        let $body = ")MOBIL!\\5L!!<*e79 sT";
        let $aprspacket = $header + ':' + $body;

        let parsed = parser.parseaprs($aprspacket);

        it('Should return srccallsign: ' + $srccall, function() {
            assert.equal($srccall, parsed['srccallsign']);
        });

        it('Should return a null result code.', function() {
            assert.equal(null, parsed['resultcode']);
        });

        it('Should return a dstcall: ' + $dstcall, function() {
            assert.equal($dstcall, parsed['dstcallsign']);
        });

        it('Should return type value: item', function() {
            assert.equal('item', parsed['type']);
        });

        it('Should return alive value: 1', function() {
            assert.equal(1, parsed['alive']);
        });

        it('Should return item name: \'AID #2\'', function() {
            assert.equal('MOBIL', parsed['itemname']);
        });

        it('Should return format type: compressed', function() {
            assert.equal('compressed', parsed['format']);
        });

        it('Should return the symbol table code: \\', function() {
            assert.equal('\\', parsed['symboltable']);
        });

        it('Should return the symbol code: 9', function() {
            assert.equal('9', parsed['symbolcode']);
        });

        it('Should return latitude value, that when rounded should equal: 49.5000', function() {
            assert.equal(49.5000, parsed['latitude'].toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -72.7500', function() {
            assert.equal(-72.7500, parsed['longitude'].toFixed(4));
        });

        it('Should return position resolution: 0.291', function() {
            assert.equal(0.291, parsed['posresolution']);
        });
    });
});
*/
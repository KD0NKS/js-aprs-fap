/**
# a basic uncompressed packet decoding test
# Mon Dec 10 2007, Hessu, OH7LZB
 *
var assert = require('assert');
var parser = require('../parser');


describe('FAP - Test decoding uncompressed packets', function() {
    describe('#parseaprs - Test parsing uncompressed packet', function() {
        let $srccall = "OH2RDP-1";
        let $dstcall = "BEACON-15";
        let $comment = "RELAY,WIDE, OH2AP Jarvenpaa";
        let $phg = "7220";

        let $aprspacket = $srccall + '>' + $dstcall + ',OH2RDG*,WIDE:!6028.51N/02505.68E#PHG' + $phg + '/' + $comment;

        let parsed = parser.parseaprs($aprspacket);

        it('Should return a format type: uncompressed', function() {
            assert.equal('uncompressed', parsed['format']);
        });

        it('Should return the source call sign: ' + $srccall, function() {
            assert.equal($srccall, parsed['srccallsign']);
        });

        it('Should return the destination call sign: ' + $dstcall, function() {
            assert.equal($dstcall, parsed['dstcallsign']);
        });

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: 60.4752', function() {
            assert.equal(60.4752, parsed['latitude'].toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: 25.0947', function() {
            assert.equal(25.0947, parsed['longitude'].toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            assert.equal(18.52, parsed['posresolution']);
        });

        it('Should return phg: ' + $phg, function() {
            assert.equal($phg, parsed['phg']);
        });

        it('Should return comment: ' + $comment, function() {
            assert.equal($comment, parsed['comment']);
        });

        // If 1 fails, most likely they will all fail.
        it('Should return 2 valid digis', function() {
            assert.equal(2, parsed['digipeaters'].length);

            assert.equal('OH2RDG', parsed['digipeaters'][0].call);
            assert.equal(true, parsed['digipeaters'][0].wasdigied);

            assert.equal('WIDE', parsed['digipeaters'][1].call);
            assert.equal(false, parsed['digipeaters'][1].wasdigied);
        });
    });

    describe('#parseaprs - Test parsing uncompressed packet (same, southwestern)', function() {
        let $srccall = "OH2RDP-1";
        let $dstcall = "BEACON-15";
        let $comment = "RELAY,WIDE, OH2AP Jarvenpaa";
        let $phg = "7220";

        let $aprspacket = $srccall + '>' + $dstcall + ',OH2RDG*,WIDE:!6028.51S/02505.68W#PHG' + $phg + '/' + $comment;

        let parsed = parser.parseaprs($aprspacket);

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: -60.4752', function() {
            assert.equal(-60.4752, parsed['latitude'].toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -25.0947', function() {
            assert.equal(-25.0947, parsed['longitude'].toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            assert.equal(18.52, parsed['posresolution']);
        });
    });

    describe('#parseaprs - Test parsing uncompressed packet (same, with pos ambiguity)', function() {
        let $srccall = "OH2RDP-1";
        let $dstcall = "BEACON-15";
        let $comment = "RELAY,WIDE, OH2AP Jarvenpaa";
        let $phg = "7220";

        let $aprspacket = $srccall + '>' + $dstcall + ',OH2RDG*,WIDE:!602 .  S/0250 .  W#PHG' + $phg + '/' + $comment;

        let parsed = parser.parseaprs($aprspacket);

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: -60.4167', function() {
            assert.equal(-60.4167, parsed['latitude'].toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -25.0833', function() {
            assert.equal(-25.0833, parsed['longitude'].toFixed(4));
        });

        it('Should return position ambiguity: 3', function() {
            assert.equal(3, parsed['posambiguity']);
        });

        it('Should return position resolution: 18520', function() {
            assert.equal(18520, parsed['posresolution']);
        });
    });

    describe('#parseaprs - Test parsing uncompressed packet (same, with even more ambiguity)', function() {
        let $srccall = "OH2RDP-1";
        let $dstcall = "BEACON-15";
        let $comment = "RELAY,WIDE, OH2AP Jarvenpaa";
        let $phg = "7220";

        let $aprspacket = $srccall + '>' + $dstcall + ',OH2RDG*,WIDE:!60  .  S/025  .  W#PHG' + $phg + '/' + $comment;

        let parsed = parser.parseaprs($aprspacket);

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: -60.5000', function() {
            assert.equal(-60.5000, parsed['latitude'].toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -25.5000', function() {
            assert.equal(-25.5000, parsed['longitude'].toFixed(4));
        });

        it('Should return position ambiguity: 4', function() {
            assert.equal(4, parsed['posambiguity']);
        });

        it('Should return position resolution: 111120', function() {
            assert.equal(111120, parsed['posresolution']);
        });
    });

    describe('#parseaprs - Test parsing uncompressed packet (same with "last resort" !-location parsing)', function() {
        let $srccall = "OH2RDP-1";
        let $dstcall = "BEACON-15";
        let $comment = "RELAY,WIDE, OH2AP Jarvenpaa";
        let $phg = "7220";

        let $aprspacket = $srccall + '>' + $dstcall + ",OH2RDG*,WIDE:hoponassualku!6028.51S/02505.68W#PHG" + $phg + $comment;

        let parsed = parser.parseaprs($aprspacket);

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: -60.4752', function() {
            assert.equal(-60.4752, parsed['latitude'].toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -25.0947', function() {
            assert.equal(-25.0947, parsed['longitude'].toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            assert.equal(18.52, parsed['posresolution']);
        });

        it('Should return comment: ' + $comment, function() {
            assert.equal($comment, parsed['comment']);
        });
    });

    describe('#parseaprs - Test parsing uncompressed packet with comment on a station with a WX symbol. The comment is ignored, because it easily gets confused with weather data.'
            , function() {
        let $aprspacket = 'A0RID-1>KC0PID-7,WIDE1,qAR,NX0R-6:=3851.38N/09908.75W_Home of KA0RID';

        let parsed = parser.parseaprs($aprspacket);

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: 38.8563', function() {
            assert.equal(38.8563, parsed['latitude'].toFixed(4));
        });

        it('Should return longitude value, that when rounded should equal: -99.1458', function() {
            assert.equal(-99.1458, parsed['longitude'].toFixed(4));
        });

        it('Should return position resolution: 18.52', function() {
            assert.equal(18.52, parsed['posresolution']);
        });

        it('Should return comment: null', function() {
            assert.equal(null, parsed['comment']);
        });
    });

    describe('#parseaprs - Test parsing packet position with timestamp and altitude.', function() {
        let $aprspacket = 'YB1RUS-9>APOTC1,WIDE2-2,qAS,YC0GIN-1:/180000z0609.31S/10642.85E>058/010/A=000079 13.8V 15CYB1RUS-9 Mobile Tracker';

        let parsed = parser.parseaprs($aprspacket);

        // check for undefined value, when there is no such data in the packet
        it('Should return latitude value, that when rounded should equal: -6.15517', function() {
            assert.equal(-6.15517, parsed['latitude'].toFixed(5));
        });

        it('Should return longitude value, that when rounded should equal: 106.71417', function() {
            assert.equal(106.71417, parsed['longitude'].toFixed(5));
        });

        it('Should return altitude: 24.07920', function() {
            assert.equal(24.07920, parsed['altitude']);
        });
    });

    describe('#parseaprs - Test parsing position with timestamp and altitude', function() {
        let $aprspacket = 'YB1RUS-9>APOTC1,WIDE2-2,qAS,YC0GIN-1:/180000z0609.31S/10642.85E>058/010/A=-00079 13.8V 15CYB1RUS-9 Mobile Tracker';

        let parsed = parser.parseaprs($aprspacket);

        it('Should return altitude: -24.07920', function() {
            assert.equal(-24.07920, parsed['altitude']);
        });
    });

    describe('#parseaprs - Test parsing a rather basic position packet', function() {
        let $aprspacket = 'YC0SHR>APU25N,TCPIP*,qAC,ALDIMORI:=0606.23S/10644.61E-GW SAHARA PENJARINGAN JAKARTA 147.880 MHz';

        let parsed = parser.parseaprs($aprspacket);

        it('Should return latitude value, that when rounded should equal: -6.10383', function() {
            assert.equal(-6.10383, parsed['latitude'].toFixed(5));
        });

        it('Should return longitude value, that when rounded should equal: 106.74350', function() {
            assert.equal(106.74350, parsed['longitude'].toFixed(5));
        });
    });
});
*/
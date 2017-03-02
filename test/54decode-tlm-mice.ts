/**
 * test mic-e telemetry decoding
 *
var assert = require('assert')
        , parser = require('../parser')
        , should = require('chai').should()
        ;

describe('FAP - Test decoding mic-e packet with sequence 00, 5 channels of telemetry and one channel of binary bits', function() {
    describe('#parseaprs - Test parsing a mic-e packet packet', function() {
        let $srccall = "OH7LZB-13";
        let $dstcall = "SX15S6";
        let $header = `${$srccall}>${$dstcall},TCPIP*,qAC,FOURTH`;
        let $body = "'I',l \x1C>/";
        let $comment = "comment";

        // The new mic-e telemetry format:
        // }ss112233445566}
        let $tlm = '|!!!!!!!!!!!!!!|';

        let $aprspacket = `${$header}:${$body} ${$comment} ${$tlm}`;

        let parsed = parser.parseaprs($aprspacket);

        it(`Should return the comment: ${$comment}`, function() {
            assert.equal($comment, parsed['comment']);
        });

        it(`Should return a telemetry sequence: 0`, function() {
            assert.equal(0, parsed['telemetry'].seq);
        });

        it('Should return 5 valid telemetry values', function() {
            assert.equal(5, parsed['telemetry'].vals.length);

            assert.equal('0', parsed['telemetry'].vals[0]);
            assert.equal('0', parsed['telemetry'].vals[1]);
            assert.equal('0', parsed['telemetry'].vals[2]);
            assert.equal('0', parsed['telemetry'].vals[3]);
            assert.equal('0', parsed['telemetry'].vals[4]);
        });

        it(`Should return a telemetry bits: '00000000'`, function() {
            assert.equal('00000000', parsed['telemetry'].bits);
        });
    });

    describe('#parseaprs - Test parsing a mic-e packet packet with sequence 00, 1 channel of telemetry', function() {
        let $srccall = "OH7LZB-13";
        let $dstcall = "SX15S6";
        let $header = `${$srccall}>${$dstcall},TCPIP*,qAC,FOURTH`;
        let $body = "'I',l \x1C>/";
        let $comment = "comment";

        // The new mic-e telemetry format:
        // }ss112233445566}
        let $tlm = '|!!!!|';

        let $aprspacket = `${$header}:${$body} ${$comment} ${$tlm}`;

        let parsed = parser.parseaprs($aprspacket);

        it(`Should return the comment: ${$comment}`, function() {
            assert.equal($comment, parsed['comment']);
        });

        it(`Should return a telemetry sequence: 0`, function() {
            assert.equal(0, parsed['telemetry'].seq);
        });

        it('Should return 1 valid telemetry value; the rest null', function() {
            assert.equal(5, parsed['telemetry'].vals.length);

            assert.equal('0', parsed['telemetry'].vals[0]);
            assert.equal(null, parsed['telemetry'].vals[1]);
            assert.equal(null, parsed['telemetry'].vals[2]);
            assert.equal(null, parsed['telemetry'].vals[3]);
            assert.equal(null, parsed['telemetry'].vals[4]);
        });
    });

    describe('#parseaprs - Test parsing a harder one', function() {
        let $aprspacket = "N6BG-1>S6QTUX:`+,^l!cR/'\";z}||ss11223344bb!\"|!w>f!|3";
        let parsed = parser.parseaprs($aprspacket);

        it(`Should return a telemetry bits: '10000000'`, function() {
            assert.equal('10000000', parsed['telemetry'].bits);
        });
    });

    describe('#parseaprs - Test parsing one to confuse with !DAO!', function() {
        let $srccall = "OH7LZB-13";
        let $dstcall = "SX15S6";
        let $header = `${$srccall}>${$dstcall},TCPIP*,qAC,FOURTH`;
        let $body = "'I',l \x1C>/";
        let $comment = "comment";

        // The new mic-e telemetry format:
        // }ss112233445566}
        let $tlm = '|!wEU!![S|';

        let $aprspacket = `${$header}:${$body} ${$comment} ${$tlm}`;

        let parsed = parser.parseaprs($aprspacket);

        it(`Should return the comment: ${$comment}`, function() {
            assert.equal($comment, parsed['comment']);
        });
    });
});
*/
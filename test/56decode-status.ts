const assert = require('assert');

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

describe('FAP - Status message decoding', function() {
    let parser = new aprsParser();

    describe('#parseaprs - Status message\'s timestamp is not affected by the raw_timestamp flag.', function() {
        let $now = new Date();
        $now.setMilliseconds(0); // null out milliseconds as they aren't taken into consideration during parsing
        $now.setSeconds(0);

        let $tstamp = ('00'.substring(0, 2 - $now.getUTCDate().toString().length) + $now.getUTCDate())
                + ('00'.substring(0, 2 - $now.getUTCHours().toString().length) + $now.getUTCHours())
                + ('00'.substring(0, 2 - $now.getUTCMinutes().toString().length) + $now.getUTCMinutes())
                + 'z';

        let nowTime = Math.floor($now.getTime() / 1000);
        let outcome = nowTime - (nowTime % 60);
        let $msg = '>>Nashville,TN>>Toronto,ON';
        let $aprspacket = 'KB3HVP-14>APU25N,WIDE2-2,qAR,LANSNG:>' + $tstamp + $msg;

        let parsed: aprsPacket = parser.parseaprs($aprspacket, { 'raw_timestamp': 1 });

        it('Should return the type: status', function() {
            assert.equal('status', parsed.type);
        });

        it('Should return the timestamp: ' + outcome, function() {
            assert.equal(outcome, parsed.timestamp);
        });

        it('Should return the status: ' + $msg, function() {
            assert.equal($msg, parsed.status);
        });
    });
});
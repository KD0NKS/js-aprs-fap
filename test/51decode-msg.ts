const assert = require('assert');

import aprsPacket from '../src/aprsPacket';
import digipeater from '../src/digipeater';
import aprsParser from '../src/parser';

describe('Test parsing messages', function() {
    let parser = new aprsParser();
    let $messageids = [ 1, 42, 10512, 'a', '1Ff84', 'F00b4' ];

    $messageids.forEach(function($messageid) {
        describe('#parseaprs - Test a message with id: ' + $messageid, function() {
            let $srccall = "OH7AA-1";
            let $destination = "OH7LZB   ";
            let $dstcall = "APRS";
            let $message = "Testing, 1 2 3";

            let $aprspacket = $srccall + '>' + $dstcall + ',WIDE1-1,WIDE2-2,qAo,OH7AA::' + $destination + ':' + $message + '\{' + $messageid;
            let $retval: aprsPacket = parser.parseaprs($aprspacket);

            it('Should return a result code: null', function() {
                assert.equal(undefined, $retval.resultCode);
            });

            it('Should return a type: message', function() {
                assert.equal('message', $retval.type);
            });

            it('Should return a destination: ' + $destination.trim(), function() {
                assert.equal($destination.trim(), $retval.destination);
            });

            it('Should return a messageid: ' + $messageid, function() {
                assert.equal($messageid, $retval.messageId);
            });

            it('Should return a message: ' + $message, function() {
                assert.equal($message, $retval.message);
            });
        });


        describe('#parseaprs - Test an ack message with id: ' + $messageid, function() {
            let $srccall = "OH7AA-1";
            let $destination = "OH7LZB   ";
            let $dstcall = "APRS";

            let $aprspacket = $srccall + '>' + $dstcall + ',WIDE1-1,WIDE2-2,qAo,OH7AA::' + $destination + ':ack' + $messageid;
            let $retval = parser.parseaprs($aprspacket);

            it('Should return a result code: null', function() {
                assert.equal(null, $retval.resultcode);
            });

            it('Should return a type: message', function() {
                assert.equal('message', $retval.type);

            });

            it('Should return a destination: ' + $destination.trim(), function() {
                assert.equal($destination.trim(), $retval.destination);
            });

            it('Should return an ack id (messageAck): ' + $messageid, function() {
                assert.equal($messageid, $retval.messageAck);
            });
        });

        describe('#parseaprs - Test a reject message with id: ' + $messageid, function() {
            let $srccall = "OH7AA-1";
            let $destination = "OH7LZB   ";
            let $dstcall = "APRS";

            let $aprspacket = $srccall + '>' + $dstcall + ',WIDE1-1,WIDE2-2,qAo,OH7AA::' + $destination + ':rej' + $messageid;
            let $retval = parser.parseaprs($aprspacket);

            it('Should return a result code: undefined', function() {
                assert.equal(undefined, $retval.resultcode);
            });

            it('Should return a type: message', function() {
                assert.equal("message", $retval.type);
            });

            it('Should return a destination: ' + $destination.trim(), function() {
                assert.equal($destination.trim(), $retval.destination);
            });

            it('Should return a messageReject: ' + $messageid, function() {
                assert.equal($messageid, $retval.messageReject);
            });
        });
    });
});
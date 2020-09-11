/**
 * APRS-IS path special cases
 * Fri Sep 10 2010, Hessu, OH7LZB
 */
import * as chai from 'chai';

const assert = require('assert');
const expect = chai.expect;

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

describe('FAP - Test decoding aprs paths', function() {
    let parser = new aprsParser();

    // ax25 fails this as the digi calls are too long
    describe('#parseaprs - Special case digi 1', function() {
        let parsed: aprsPacket = parser.parseaprs(`IQ3VQ>APD225,TCPIP*,qAI,IQ3VQ,THIRD,92E5A2B6,T2HUB1,200106F8020204020000000000000002,T2FINLAND:!4526.66NI01104.68E#PHG21306/- Lnx APRS Srv - sez. ARI VR EST`);

        it(`Should return a list of digipeaters where the 6th digi call is: 200106F8020204020000000000000002`, function() {
            assert.equal('200106F8020204020000000000000002', parsed.digipeaters[6].callsign);
        });
    });

    describe('#parseaprs - Special case digi 2', function() {
        let parsed: aprsPacket = parser.parseaprs(`IQ3VQ>APD225,200106F8020204020000000000000002,TCPIP*,qAI,IQ3VQ,THIRD,92E5A2B6,T2HUB1,200106F8020204020000000000000002,T2FINLAND:!4526.66NI01104.68E#PHG21306/- Lnx APRS Srv - sez. ARI VR EST`);

        it(`Should return an error because qAI exists before IPv6 address.`, function() {
            expect(parsed.resultCode).to.exist;
        });

        // ax25
        let parsed2: aprsPacket = parser.parseaprs(
                `IQ3VQ>APD225,200106F8020204020000000000000002,TCPIP*,qAI,IQ3VQ,THIRD,92E5A2B6,T2HUB1,200106F8020204020000000000000002,T2FINLAND:!4526.66NI01104.68E#PHG21306/- Lnx APRS Srv - sez. ARI VR EST`
                , { isax25: true }
                );

        it(`Should - ax25 - return an error because qAI exists before IPv6 address.`, function() {
            assert.equal('dstpath_toomany', parsed2.resultCode)
        });
    });

    describe('#parseaprs - ax25 - digi bad chars', function() {
        // ax25
        let parsed2: aprsPacket = parser.parseaprs(
            `IQ3VQ>APD225,APD225_2:!4526.66NI01104.68E#PHG21306/- Lnx APRS Srv - sez. ARI VR EST`
            , { isax25: true }
            );

        it(`Should - ax25 - return a result code: digicall_badchars`, function() {
            assert.equal('digicall_badchars', parsed2.resultCode);
        });
    });
});
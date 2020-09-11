const assert = require('assert');

import aprsPacket from '../src/aprsPacket';
import aprsParser from '../src/parser';

describe('FAP - Unsupported packet types', function () {
    let parser: aprsParser = new aprsParser();

    describe('#parseaprs - Telemetry parse test', function () {
        let packet = 'WC4PEM-10>APMI06,TCPIP*,qAC,EIGHTH:{{I302233zU=16.7V,T=86.9F';

        let parsed: aprsPacket = parser.parseaprs(packet);

        it('Should return a result code: exp_unsupp', function () {
            assert.equal('exp_unsupp', parsed.resultCode);
        });
    })
});
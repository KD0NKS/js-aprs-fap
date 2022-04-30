const assert = require('assert');

import { AprsPacket } from '../src/models/AprsPacket';
import { AprsParser } from '../src/parsers/AprsParser';

describe('FAP - Unsupported packet types', function () {
    let parser: AprsParser = new AprsParser();

    describe('#parseaprs - Telemetry parse test', function () {
        let packet = 'WC4PEM-10>APMI06,TCPIP*,qAC,EIGHTH:{{I302233zU=16.7V,T=86.9F';

        let parsed: AprsPacket = parser.parseAprs(packet);

        it('Should return a result code: exp_unsupp', function () {
            assert.equal('exp_unsupp', parsed.resultCode);
        });
    })
});
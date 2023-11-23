const assert = require('assert')

import { expect } from "chai"
import { BuildPositionModel } from "../src/BuildPositionModel"
import { PacketFactory } from "../src/PacketFactory"
import aprsParser from "../src/parser"
import { TimeFormatEnum } from "../src/TimeFormatEnum"

describe('PacketFactory - Test makePosition', () => {
    let factory = new PacketFactory()

    describe("Null data check.", () => {
        it("No data check.", () => {
            // Note: Typescript will complain about a null here, though the test does work.
            expect(() => { factory.makePosition(null) }).to.throw("No data provided.")
        })
    })

    describe("Invalid location exception checks.", () => {
        it("Should throw error because latitude is not set.", function() {
            const params = new BuildPositionModel()
            expect(function() { factory.makePosition(params) }).to.throw("Invalid location.")
        })

        it("Should throw error because longitude is not set.", function() {
            const params = new BuildPositionModel({ latitude: 60 })

            expect(function() { factory.makePosition(params) }).to.throw("Invalid location.")
        })

        it("Should throw error because longitude is too small.", function() {
            const params = new BuildPositionModel({ latitude: 60, longitude: -180 })

            expect(function() { factory.makePosition(params) }).to.throw("Invalid location.")
        })

        it("Should throw error because longitude is too big.", function() {
            const params = new BuildPositionModel({ latitude: 60, longitude: -180 })

            expect(function() { factory.makePosition(params) }).to.throw("Invalid location.")
        })

        it("Should throw error because latitude is too small.", function() {
            const params = new BuildPositionModel({ latitude: -90, longitude: 60 })

            expect(function() { factory.makePosition(params) }).to.throw("Invalid location.")
        })

        it("Should throw error because latitude is too big.", function() {
            const params = new BuildPositionModel({ latitude: 90, longitude: 60 })

            expect(function() { factory.makePosition(params) }).to.throw("Invalid location.")
        })
    })

    describe("Non-Compressed Tests.", () => {
        describe("Check North/South, East/West and roundings for coordinates.", () => {
            describe("Basic position, Northeast, no speed/course/alt.", () => {
                const params = new BuildPositionModel({
                    latitude: 63.06716666666667
                    , longitude: 27.6605
                    , symbols: "/#"
                })

                it("Should return a string: '6304.03N/02739.63E#'.", () => {
                    assert.equal("!6304.03N/02739.63E#", factory.makePosition(params))
                })
            })

            describe("Basic position, Southwest, no speed/course/alt.", () => {
                const params = new BuildPositionModel({
                    latitude: -23.64266666666667
                    , longitude: -46.797
                    , symbols: "/#"
                })

                it("Should return a string: '2338.56S/04647.82W#'.", () => {
                    assert.equal("!2338.56S/04647.82W#", factory.makePosition(params))
                })
            })
        })

        describe("Optional speed/course and altitude.", () => {
            describe("Basic position, Northeast, has speed/course/alt.", () => {
                const params = new BuildPositionModel({
                    latitude: 52.364
                    , longitude: 14.1045
                    , speed: 83.34
                    , course: 353
                    , altitude: 95.7072
                    , symbols: "/>"
                })

                it("Should return a string: '!5221.84N/01406.27E>353/045/A=000314'.", () => {
                    assert.equal("!5221.84N/01406.27E>353/045/A=000314", factory.makePosition(params))
                })
            })

            describe("Basic position, Northeast, no speed/course, has alt.", () => {
                const params = new BuildPositionModel({
                    latitude: 52.364
                    , longitude: 14.1045
                    , altitude: 95.7072
                    , symbols: "/>"
                })

                it("Should return a string: '!5221.84N/01406.27E>/A=000314'.", () => {
                    assert.equal("!5221.84N/01406.27E>/A=000314", factory.makePosition(params))
                })
            })

            describe("Special case test - Speed over 999, course over 360, while below sea level.", () => {
                const params = new BuildPositionModel({
                    latitude: 52.364
                    , longitude: 14.1045
                    , altitude: -100
                    , symbols: "/#"
                    , course: 480
                    , speed: 1852
                })

                it("Should return a string where the course and speed have been fixed: '!5221.84N/01406.27E#000/999/A=-00328'", () => {
                    assert.equal("!5221.84N/01406.27E#000/999/A=-00328", factory.makePosition(params))
                })
            })
        })

        describe("Timestamp checks", () => {
            // timestamp and messaging tests, need to build the test cases on the fly with
            // current time because there is limited range in the APRS packet timestmap
            const $reftime = new Date().getTime();
            const $reftime_hms = $reftime - 555;
            const $reftime_dhm = $reftime - 1000000;
            const $expected_time_hms = factory.makeTimestamp($reftime_hms, 1);
            const $expected_time_dhm = factory.makeTimestamp($reftime_dhm, 0);

            describe("Basic position, northeast, has speed/course/alt, timestamp HMS", () => {
                const params = new BuildPositionModel({
                    latitude: 52.364
                    , longitude: 14.1045
                    , speed: 83.34
                    , course: 353
                    , altitude: 95.7072
                    , symbols: "/>"
                    , timestamp: $reftime_hms
                })

                it(`Should return a packet with valid timestamp: '/${$expected_time_hms}5221.84N/01406.27E>353/045/A=000314'.`, () => {
                    assert.equal(`/${$expected_time_hms}5221.84N/01406.27E>353/045/A=000314`, factory.makePosition(params))
                })
            })

            describe("Basic position, northeast, has speed/course/alt, timestamp DHM and messaging", () => {
                const params = new BuildPositionModel({
                    latitude: 52.364
                    , longitude: 14.1045
                    , speed: 83.34
                    , course: 353
                    , altitude: 95.7072
                    , symbols: "/>"
                    , timestamp: $reftime_dhm
                    , isMessagingEnabled: true
                })

                it(`Should return a packet with valid timestamp: '@${$expected_time_dhm}5221.84N/01406.27E>353/045/A=000314'.`, () => {
                    assert.equal(`@${$expected_time_dhm}5221.84N/01406.27E>353/045/A=000314`, factory.makePosition(params))
                })
            })

            describe("Basic position, northeast, has speed/course/alt, with messaging, no timestamp.", () => {
                const params = new BuildPositionModel({
                    latitude: 52.364
                    , longitude: 14.1045
                    , speed: 83.34
                    , course: 353
                    , altitude: 95.7072
                    , symbols: "/>"
                    , isMessagingEnabled: true
                })

                it("Should return a packet with valid timestamp: '=5221.84N/01406.27E>353/045/A=000314'.", () => {
                    assert.equal("=5221.84N/01406.27E>353/045/A=000314", factory.makePosition(params))
                })
            })

            describe("Basic position, northeast, has speed/course/alt, current timestamp and without messaging", () => {
                const params = new BuildPositionModel({
                    latitude: 52.364
                    , longitude: 14.1045
                    , speed: 83.34
                    , course: 353
                    , altitude: 95.7072
                    , symbols: "/>"
                    , timestamp: 0
                    , isMessagingEnabled: true
                })

                // current timestamp, should be HMS, without messaging, but due to
                // potential timing issues don't really check the actual timestamp
                it("Should return a packet with a valid timestamp matching the regex: 'd{6}h5221.84N/01406.27E>353/045/A=000314'.", () => {
                    assert.match(factory.makePosition(params), /\d{6}h5221\.84N\/01406\.27E>353\/045\/A=000314/)
                })
            })

            describe("Basic position, timestamp too far in the future", function() {
                const params = new BuildPositionModel({
                    latitude: 60
                    , longitude: 60
                    , symbols: "/#"
                    , timestamp: new Date().getTime() + 10000
                })


                it("Should throw an error when the timestamp is + 10.", function() {
                    expect(function() { factory.makePosition(params) }).to.throw("Timestamp too far in the futre.")
                })
            })

            describe("Basic position, timestamp over 28 days old.", function() {
                const params = new BuildPositionModel({
                    latitude: 60
                    , longitude: 60
                    , symbols: "/#"
                    , timestamp: new Date().getTime() - 2419200
                })

                it("Should throw an error when the timestamp is too far in the past.", function() {
                    expect(function() { factory.makePosition(params) }).to.throw("Timestamp too far in the past.")
                })
            })

            // Unreachable case in TypeScript 5+
            //describe("Timestamp with invalid format", () => {
            //    it("Should return a null timestamp.", () => {
            //        expect(function() { factory.makeTimestamp(0, TimeFormatEnum.) }).to.throw("Unsupported time format.")
            //    })
            //})
        })


        describe("Ambiguity Tests.", () => {
            describe("Basic position, Northeast, ambiguity 1.", () => {
                const params = new BuildPositionModel({
                    latitude: 52.364
                    , longitude: 14.1045
                    , ambiguity: 1
                    , symbols: "/>"
                })

                it("Should return a string: '!5221.8 N/01406.2 E>'.", () => {
                    assert.equal("!5221.8 N/01406.2 E>", factory.makePosition(params))
                })
            })

            describe("Basic position, Northeast, ambiguity 2.", () => {
                const params = new BuildPositionModel({
                    latitude: 52.364
                    , longitude: 14.1045
                    , ambiguity: 2
                    , symbols: "/>"
                })

                it("Should return a string: '!5221.  N/01406.  E>'.", () => {
                    assert.equal("!5221.  N/01406.  E>", factory.makePosition(params))
                })
            })

            describe("Basic position, Northeast, ambiguity 3.", () => {
                const params = new BuildPositionModel({
                    latitude: 52.364
                    , longitude: 14.1045
                    , ambiguity: 3
                    , symbols: "/>"
                })

                it("Should return a string: '!522 .  N/0140 .  E>'.", () => {
                    assert.equal("!522 .  N/0140 .  E>", factory.makePosition(params))
                })
            })

            describe("Basic position, Northeast, ambiguity 4.", () => {
                const params = new BuildPositionModel({
                    latitude: 52.364
                    , longitude: 14.1045
                    , ambiguity: 4
                    , symbols: "/>"
                })

                it("Should return a string: '!52  .  N/014  .  E>'.", () => {
                    assert.equal("!52  .  N/014  .  E>", factory.makePosition(params))
                })
            })
        })

        describe("DAO Tests.", () => {
            describe("DAO position - US", () => {
                const params = new BuildPositionModel({
                    latitude: 39.15380036630037
                    , longitude: -84.62208058608059
                    , symbols: "/>"
                    , isUseDao: true
                })

                it("Should return a string: '!3909.22N/08437.32W>!wjM!'.", () => {
                    assert.equal("!3909.22N/08437.32W>!wjM!", factory.makePosition(params))
                })
            })

            describe("DAO rounding - DAO position, US.", () => {
                const params = new BuildPositionModel({
                    latitude: 39.9999999
                    , longitude: -84.9999999
                    , isUseDao: true
                    , symbols: "/>"
                })

                it("Should return a string: '!3959.99N/08459.99W>!w{{!'.", () => {
                    assert.equal("!3959.99N/08459.99W>!w{{!", factory.makePosition(params))
                })
            })

            describe("DAO with speed, course, altitude, comment - DAO position, EU", () => {
                const params = new BuildPositionModel({
                    latitude: 48.37314835164835
                    , longitude: 15.71477838827839
                    , speed: 62.968
                    , course: 321
                    , altitude: 192.9384
                    , comment: "Comment blah"
                    , isUseDao: true
                    , symbols: "/>"
                })

                it("Should return a string: '!4822.38N/01542.88E>321/034/A=000633Comment blah!wr^!'.", () => {
                    assert.equal("!4822.38N/01542.88E>321/034/A=000633Comment blah!wr^!", factory.makePosition(params))
                })
            })
        })
    })

    describe("Compression Tests", () => {
        describe("Check North/South, East/West and roundings for coordinates.", () => {
            describe("Basic position, Northeast, compression, no speed/course/alt.", () => {
                const params = new BuildPositionModel({
                    latitude: 63.06716666666667
                    , longitude: 27.6605
                    , symbols: "/#"
                    , isUseCompression: true
                })

                it("Should return a string: '!/.XsmUM2G#  A'.", () => {
                    assert.equal("!/.XsmUM2G#  A", factory.makePosition(params))
                })
            })

            describe("Basic position, Northeast, compression no speed/course/alt.", () => {
                const params = new BuildPositionModel({
                    latitude: -23.64266666666667
                    , longitude: -46.797
                    , symbols: "/#"
                    , isUseCompression: true
                })

                it("Should return a string: '!/ZIT3B]]p#  A'.", () => {
                    assert.equal("!/ZIT3B]]p#  A", factory.makePosition(params))
                })
            })

            describe("Ensure symbol table code is being encoded if it is a number.", () => {
                const params = new BuildPositionModel({
                    latitude: -23.64266666666667
                    , longitude: -46.797
                    , symbols: "8#"
                    , isUseCompression: true
                })

                it("Should return a string: '!iZIT3B]]p#  A'.", () => {
                    assert.equal("!iZIT3B]]p#  A", factory.makePosition(params))
                })
            })

            describe("Optional speed/course and altitude.", () => {
                describe("Compressed packet with, has speed/course/alt.", () => {
                    const params = new BuildPositionModel({
                        latitude: 52.364
                        , longitude: 14.1045
                        , speed: 83.34
                        , course: 353
                        , altitude: 95.7072
                        , symbols: "/#"
                        , isUseCompression: true
                    })

                    it("Should return a string: '!/4#8;R&Eb#ySA/A=000314'.", () => {
                        assert.equal("!/4#8;R&Eb#ySA/A=000314", factory.makePosition(params))
                    })
                })

                describe("Compressed packet where speed and course get capped.", () => {
                    const params = new BuildPositionModel({
                        latitude: 52.364
                        , longitude: 14.1045
                        , speed: 1900
                        , course: 360
                        , altitude: 95.7072
                        , symbols: "/#"
                        , isUseCompression: true
                    })

                    it("Should show the position of a really really really fast moving object.", () => {
                        assert.equal("!/4#8;R&Eb#!zA/A=000314", factory.makePosition(params))
                    })
                })
            })
        })
    })

    describe("Symbol checks.", () => {
        let params: BuildPositionModel

        before(function(done) {
            params = new BuildPositionModel({ latitude: 60, longitude: 60, isMessagingEnabled: true })
            done()
        })

        it("Should default symbols when symbols param is null.", function() {
            assert.equal("=6000.00N/06000.00E/", factory.makePosition(params))
        })

        it("Should default symbols when symbols param is an empty string.", function() {
            params.symbols = ""

            assert.equal("=6000.00N/06000.00E/", factory.makePosition(params))
        })

        it("Should throw an error when an invalid symbols param is passed.", function() {
            params.symbols = "££"
            expect(function() { factory.makePosition(params) }).to.throw("Invalid symbols.")
        })
    })
})

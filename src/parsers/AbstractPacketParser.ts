/*
import { ConversionConstantEnum } from "../enums/ConversionConstantEnum";
import { PacketTypeEnum } from "../enums/PacketTypeEnum";
import { RESULT_MESSAGES } from "../enums/ResultMessages";
import { AprsPacket } from "../models/AprsPacket"
import { ConversionUtil } from "../utils/ConversionUtil";
import { ParserOptions } from "./ParserOptions";

export abstract class AbstractPacketParser {
    public abstract ParseAprsPacket(line: string): AprsPacket

    protected readonly _options: ParserOptions

    constructor(options?: ParserOptions) {
        if(this._options != null) {
            this._options = options
        } else {
            this._options = new ParserOptions()
        }
    }

    /**
     * Used to add error messages to a packet.
     *
     * @param {AprsPacket} packet Parsed values from packet.
     * @param {string} errcode Error code, this should be able to be found in the result_messages object/map.
     * @param {string} val Value that caused the error.
     * @return {void}
     *
    private addError(packet: AprsPacket, errorCode: string, value?: any): AprsPacket {
        packet.resultCode = errorCode

        packet.resultMessage = ((RESULT_MESSAGES[errorCode] !== undefined) ? RESULT_MESSAGES[errorCode] : errorCode)
                + `: ${value}`
                //+ ((value !== undefined && value) ? value : value);

        return packet
    }

    /**
     * Used to add warning messages to a packet.
     *
     * @param {AprsPacket} packet Parsed values from packet.
     * @param {string} errcode Error code, this should be able to be found in the result_messages object/map.
     * @param {string} val Value that caused the warning.
     * @return {void}
     *
    private addWarning(packet: AprsPacket, errorCode: string, value?: string): AprsPacket {
        if(packet.warningCodes == undefined || !packet.warningCodes) {
            packet.warningCodes = []
        }

        packet.warningCodes.push(errorCode);

        packet.resultMessage = ((RESULT_MESSAGES[errorCode] !== undefined && RESULT_MESSAGES[errorCode]) ? RESULT_MESSAGES[errorCode] : errorCode)
                + ((value !== undefined && value) ? `: ${value}` : '')

        return packet
    }

    protected parseDataExtensions(packet: string): AprsPacket {
        throw new Error("Not implemented")
    }

    protected parseLocationPacket(packet: string): AprsPacket {
        throw new Error("Not implemented")
    }

    protected parseMessage(packet: string, retVal: AprsPacket): AprsPacket {
        let tmp;

        // Check format
        // x20 - x7e, x80 - xfe
        if(packet.indexOf("BLN") == 0) {
            return null
        } else if(packet.indexOf("NWS") == 0) {
            return null
        } else if((tmp = packet.match(/^:([A-Za-z0-9_ -]{9}):([ -~]+)$/))) { // match all ascii printable characters for now
            const message = tmp[2];
            retVal.destination = tmp[1].trim();

            // check whether this is an ack
            if((tmp = message.match(/^ack([A-Za-z0-9}]{1,5})\s*$/))) {
                // trailing spaces are allowed because some
                // broken software insert them..
                retVal.messageAck = tmp[1];
                return retVal;
            } else if((tmp = message.match(/^rej([A-Za-z0-9}]{1,5})\s*$/))) {  // check whether this is a message reject
                retVal.messageReject = tmp[1];
                return retVal;
            } else if((tmp = message.match(/^([^{]*)\{([A-Za-z0-9]{1,5})(}[A-Za-z0-9]{1,5}|\}|)\s*$/))) {  // separate message-id from the body, if present
                retVal.message = tmp[1];
                retVal.messageId = tmp[2];

                if(tmp.length > 2 && tmp[3] != null && tmp[3].length > 1) {
                    retVal.messageAck = tmp[3].substring(1)
                }
            } else {
                retVal.message = message;
            }

            // catch telemetry messages
            if(/^(BITS|PARM|UNIT|EQNS)\./i.test(message)) {
                retVal.type = PacketTypeEnum.TELEMETRY_MESSAGE
            }

            // messages cannot contain |, ~, or {
            if(/[|~{]+/.test(retVal.message)) {
                return this.addError(retVal, 'msg_inv');
            }

            return retVal;
        }

        return this.addError(retVal, 'msg_inv');
    }

    protected parseMicEPacket(packet: string): AprsPacket {
        /*
        if(report.destination == null || report.destination == '') {
            throw new Error("Error in parsing Mic-E packet.  Destination field was empty.");
        }

        var destinationArray = unescape(encodeURIComponent(report.destination));
        var informationArray = unescape(encodeURIComponent(body));

        // Latitude
        var degLatitude = (destinationArray.charCodeAt(0) & 0x0F).toString() + (destinationArray.charCodeAt(1) & 0x0F).toString();
        var degLatMin = (parseFloat((destinationArray.charCodeAt(2) & 0x0F).toString() + (destinationArray.charCodeAt(3) & 0x0F).toString()
                + "." + (destinationArray.charCodeAt(4) & 0x0F).toString() + (destinationArray.charCodeAt(5) & 0x0F).toString()) / 60).toString();

        report.latitude = parseFloat(degLatitude + degLatMin.substring(1)).toFixed(3);
        report.latitude = parseFloat(report.latitude);

        if(destinationArray.charCodeAt(3) < 80) {
            report.latitude = report.latitude * -1;
        }

        // Longitude
        // L-Bit is contained in Destination Array as the 5th byte.
        // On Page 44 of the APRS 1.0 spec is where this is defined.
        // The offset is 100 for anything above 'P' (int val 80).
        var longitudeOffset = 0;

        if(destinationArray.charCodeAt(4) >= 80) {
            longitudeOffset = 100;
        }

        var degLongitude = informationArray.charCodeAt(0) - 28 + longitudeOffset;

        if((degLongitude >= 180) && (degLongitude <= 189)) {
            degLongitude -= 80;
        }

        if((degLongitude >= 190) && (degLongitude <= 199)) {
            degLongitude = degLongitude  - 190;
        }

        var degLonMin = informationArray.charCodeAt(1) - 28;

        if(degLonMin >= 60) {
            degLonMin = degLonMin - 60;
        }

        degLonMin = parseFloat(degLonMin + "." + (informationArray.charCodeAt(2) - 28)) / 60;

        report.longitude = parseFloat(degLongitude.toString() + degLonMin.toString().substring(1)).toFixed(3);

        if(destinationArray.charCodeAt(5) >= 80) {
            report.longitude = report.longitude * -1;
        }

        // SYMBOL
        report.symbolTableId = String.fromCharCode(informationArray.charCodeAt(7));
        report.symbolCode = String.fromCharCode(informationArray.charCodeAt(6));

        // STATION SPEED IN KNOTS
        report.speed = informationArray.charCodeAt(3) - 28;

        // this is taken from p 53 of the APRS 1.01 Spec
        if(report.speed >= 80) {
            report.speed -= 80;
        }

        report.speed = ((report.speed * 10) + ((informationArray.charCodeAt(4) - 28) / 10) % 800);

        // COURSE MUST BE IN INT FORM
        report.direction = ((informationArray.charCodeAt(4) - 28) % 10) * 100;
        report.direction = report.direction + (informationArray.charCodeAt(5) - 28);
        report.direction = report.direction % 400;

        // TODO: Position ambiguity.
        // TODO: ALTITUDE

        return body;
        *
        throw new Error("Not implemented")
    }

    /**
     * Parse an object
     *
    protected parseObject(options: any, packet: string, srcCallsign: string, retVal: AprsPacket): AprsPacket {
        let tmp;

        // Minimum length for an object is 31 characters
        // (or 46 characters for non-compressed)
        if(packet.length < 31) {
            return this.addError(retVal, 'obj_short');
        }

        // Parse the object up to the location
        let timeStamp;

        if((tmp = packet.match(/^;([\x20-\x7e]{9})(\*|_)(\d{6})(z|h|\/)/))) {
            // hash member 'objectname' signals an object
            retVal.objectname = tmp[1];
            retVal.alive = (tmp[2] == '*');

            timeStamp = tmp[3] + tmp[4];
        } else {
            return this.addError(retVal, 'obj_inv');
        }

        // Check the timestamp for validity and convert
        // to UNIX epoch. If the timestamp is invalid, set it
        // to zero.
        retVal.timestamp = this.parseTimestamp(options, timeStamp);

        if(retVal.timestamp == 0) {
            retVal = this.addWarning(retVal, 'timestamp_inv_obj');
        }

        // Forward the location parsing onwards
        let locationOffset = 18; // object location always starts here
        let locationChar = packet.charAt(18);

        if(/^[\/\\A-Za-j]$/.test(locationChar)) {
            // compressed
            retVal = this._compressed_to_decimal(packet.substring(18, 31), srcCallsign, retVal);
            locationOffset = 31; // now points to APRS data extension/comment
        } else if(/^\d$/i.test(locationChar)) {
            // normal
            retVal = this._normalpos_to_decimal(packet.substring(18), srcCallsign, retVal);
            locationOffset = 37; // now points to APRS data extension/comment
        } else {
            // error
            return this.addError(retVal, 'obj_dec_err');
        }

        // check to see if another function returned an error... explicit error throwing might cut out a lot of manual work here...
        if(retVal.resultCode != undefined && retVal.resultCode) {
            return retVal;
        }

        // Check the APRS data extension and possible comments,
        // unless it is a weather report (we don't want erroneus
        // course/speed figures and weather in the comments..)
        if(retVal.symbolcode != '_') {
            retVal = this._comments_to_decimal(packet.substring(locationOffset), srcCallsign, retVal);
        } else {
            // possibly a weather object, try to parse
            retVal = this.parseWeatherReport(packet.substring(locationOffset), retVal);
        }

        return retVal;
    }

    protected parseWeatherReport(packet: string, retVal: AprsPacket): AprsPacket {
        throw new Error("Not implemented")
    }

    protected parsePositionlessWeatherReport(packet: string, retVal: AprsPacket): AprsPacket {
        throw new Error("Not implemented")
    }

    protected parseStatusReport(packet: string, retVal: AprsPacket): AprsPacket {
        let temp

        // Remove CRs, LFs and trailing spaces
        packet = packet.trim()

        // Check for a timestamp
        if((temp = packet.match(/^(\d{6}z)/))) {
            retVal.timestamp = this.parseTimestamp({}, temp[1])

            if(retVal.timestamp == 0) {
                retVal = this.addWarning(retVal, 'timestamp_inv_sta')
            }

            packet = packet.substring(7)
        }

        // TODO: handle beam heading and maidenhead grid locator status reports

        // Save the rest as the report
        retVal.status = packet

        return retVal
    }

    /**
     * Creates a unix timestamp based on an APRS six (+ one char for type) character timestamp or 0 if it's an invalid timestamp
     *
     * @param {json} options Looking for a raw_timestamp value
     * @param {string} stamp 6 digit number followed by z, h, or /
     * @returns {number} A unix timestamp
     *
    private parseTimestamp(options: any, stamp: any): number {
        /*
        var ts = new Date();

        try {
            //var message = report.message;

            //if (report.messageType == '@') {
                /*
                * There are 3 different time formats that can be used
                * We are only dealing with Day/Hour/Minutes in either
                * zulu or local time (not with month/day/hour/minute)
                *
                //Day/Hours/Minutes
                if (body.charAt(6) == 'z') {
                    ts.setUTCDate(parseInt(body.substr(0, 2)));
                    ts.setUTCHours(parseInt(body.substr(2, 2)));
                    ts.setUTCMinutes(parseInt(body.substr(4, 2)));
                    ts.setUTCMilliseconds(0);

                    body = body.substring(7);
                } else if (body.charAt(5) == 'l') {
                    ts.setDate(parseInt(body.substr(0, 2)));
                    ts.setHours(parseInt(body.substr(2, 2)));
                    ts.setMinutes(parseInt(body.substr(4, 2)));
                    ts.setMilliseconds(0);

                    body = body.substring(6);
                }
            //}
        } catch (e) {
            console.log(e);
        }

        report.gpsTimestamp = ts;

        return body;
        *

        // Check initial format
        if(!(stamp = stamp.match(/^(\d{2})(\d{2})(\d{2})(z|h|\/)$/))) {
            return 0
        }

        if(options && options['raw_timestamp']) {
            return stamp[1] + stamp[2] + stamp[3]
        }

        let stamptype = stamp[4]

        if(stamptype == 'h') {
            // HMS format
            let hour = stamp[1]
                    , minute = stamp[2]
                    , second = stamp[3]

            // Check for invalid time
            if(hour > 23 || minute > 59 || second > 59) {
                return 0
            }

            // All calculations here are in UTC, but if this is run under old MacOS (pre-OSX), then
            // Date_to_Time could be in local time.
            let ts = new Date()
                    , currentTime: number = Math.floor(ts.getTime() / 1000)
                    , cYear = ts.getUTCFullYear()
                    , cMonth = ts.getUTCMonth()
                    , cDay = ts.getUTCDate()
                    , tStamp = Math.floor(new Date(Date.UTC(cYear, cMonth, cDay, hour, minute, second, 0)).getTime() / 1000)

            // If the time is more than about one hour
            // into the future, roll the timestamp
            // one day backwards.
            if(currentTime + 3900 < tStamp) {
                tStamp -= 86400
                // If the time is more than about 23 hours
                // into the past, roll the timestamp one
                // day forwards.
            } else if(currentTime - 82500 > tStamp) {
                tStamp += 86400
            }

            return tStamp;
        } else if(stamptype == 'z' || stamptype == '/') {
            // Timestamp is DHM, UTC (z) or local (/).
            // Always intepret local to mean local
            // to this computer.
            let day = parseInt(stamp[1])
                    , hour = parseInt(stamp[2])
                    , minute = parseInt(stamp[3])

            if(day < 1 || day > 31 || hour > 23 || minute > 59) {
                return 0;
            }

            // If time is under about 12 hours into the future, go there.
            // Otherwise get the first matching time in the past.
            let ts = new Date()
                    , currentTime = Math.floor(ts.getTime() / 1000)
                    , cYear
                    , cMonth
                    , cDay

            if (stamptype === 'z') {
                cYear = ts.getUTCFullYear()
                cMonth = ts.getUTCMonth()
                cDay = ts.getUTCDate()
            } else {
                cYear = ts.getFullYear()
                cMonth = ts.getMonth()
                cDay = ts.getDate()
            }

            // Form the possible timestamps in
            // this, the next and the previous month
            let tmpDate = new Date(cYear, cMonth, cDay, 0, 0, 0, 0)
            tmpDate.setDate(tmpDate.getMonth() + 1)

            let fwdYear = tmpDate.getFullYear()
            let fwdMonth = tmpDate.getMonth()

            // Calculate back date.
            tmpDate = new Date(cYear, cMonth, cDay, 0, 0, 0, 0)
            tmpDate.setDate(tmpDate.getMonth() - 1)

            let backYear = tmpDate.getFullYear()
            let backMonth = tmpDate.getMonth()

            let fwdtstamp = null
            let currtstamp = null
            let backtstamp = null

            if(ConversionUtil.CheckDate(cYear, cMonth, day)) {
                if(stamptype === 'z') {
                    //$currtstamp = Date_to_Time($cyear, $cmonth, $day, $hour, $minute, 0);
                    currtstamp = Math.floor(new Date(Date.UTC(cYear, cMonth, cDay, hour, minute, 0, 0)).getTime() / 1000)
                } else {
                    currtstamp = Math.floor(new Date(cYear, cMonth, day, hour, minute, 0, 0).getTime() / 1000)
                }
            }

            if(ConversionUtil.CheckDate(fwdYear, fwdMonth, day)) {
                if(stamptype === 'z') {
                    fwdtstamp = Math.floor(new Date(Date.UTC(fwdYear, fwdMonth, day, hour, minute, 0, 0)).getTime() / 1000)
                } else {
                    fwdtstamp = Math.floor(new Date(cYear, cMonth, day, hour, minute, 0, 0).getTime() / 1000)
                }
            }

            if(ConversionUtil.CheckDate(backYear, backMonth, day)) {
                if(stamptype === 'z') {
                    backtstamp = Math.floor(new Date(Date.UTC(backYear, backMonth, day, hour, minute, 0, 0)).getTime() / 1000)
                } else {
                    backtstamp = Math.floor(new Date(cYear, cMonth, day, hour, minute, 0, 0).getTime() / 1000)
                }
            }

            // Select the timestamp to use. Pick the timestamp
            // that is largest, but under about 12 hours from
            // current time.
            if(fwdtstamp && (fwdtstamp - currentTime) < 43400) {
                return fwdtstamp
            } else if(currtstamp && (currtstamp - currentTime) < 43400) {
                return currtstamp
            } else if(backtstamp) {
                return backtstamp
            }
        }

        // return failure if we haven't returned with a success earlier
        return 0
    }

    private stringToLatitude(position: string) {
        /*
        // LATITUDE
        // deg 00 - 90
        // mm - minutes
        // .
        // ss
        // N or S
        // ddmm.hh[N, S]

        double retVal = 0.0;

        try {
            position = position.Replace(' ', '0');

            double degLatMin = Convert.ToDouble(position.Substring(2, 5));
            degLatMin = (degLatMin / 60);

            retVal = Double.Parse(position.Substring(0, 2) + Convert.ToString(degLatMin).Substring(1, Convert.ToString(degLatMin).Length - 1));

            if(position[7] == 'S' || position[7] == 's') {
                retVal *= -1;
            }
        } catch {
            retVal = 0.0;
        }

        return retVal;
        *

        throw new Error("Not implemented")
    }

    private stringToLongitude(position: string, positionAmbiguity: number = 0) {
        /*
        // LONGITUDE
        // deg 000 - 180
        // mm - minutes
        // .
        // hh - hundredths of a minute
        // E or W
        // dddmm.hh[E, W]

        double retVal = 0.0;

        position = position.Replace(' ', '0');
        // TODO: If positionAmbiguity > 0, we need to ignore x numbers on the right if they are not already spaces

        try {
            // if the posit packet has an positionAmbiguity of 1, this does not seem to be affected
            double degLonMin = Convert.ToDouble(position.Substring(3, 5));
            degLonMin = (degLonMin / 60);

            retVal = Double.Parse(String.Format("{0}{1}"
                    , position.Substring(0, 3)
                    , degLonMin.ToString().Substring(1, degLonMin.ToString().Length - 1)));

            if(position[8] == 'W' || position[8] == 'w') {
                retVal *= -1;
            }
        } catch {
            retVal = 0.0;
        }

        return retVal;
        *

        throw new Error("Not implemented")
    }
}
*/
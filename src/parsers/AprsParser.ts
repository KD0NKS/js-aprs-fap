import { AprsPacket } from '../models/AprsPacket'
import { ConversionConstantEnum } from '../enums/ConversionConstantEnum'
import { ConversionUtil } from '../utils/ConversionUtil'
import Digipeater from '../models/Digipeater'
import { RESULT_MESSAGES } from '../enums/ResultMessages'
import Telemetry from '../models/Telemetry'
import Weather from '../models/Weather'
import { PacketTypeEnum } from '../enums/PacketTypeEnum'
import { ParserUtil } from './ParserUtil'
import { ParserOptions } from './ParserOptions'

export class AprsParser {
    /**
     * Used to add error messages to a packet.
     *
     * @param {json} rethash Parsed values from packet.
     * @param {string} errcode Error code, this should be able to be found in the result_messages object/map.
     * @param {string} val Value that caused the error.
     * @return {void}
     */
    addError(packet: AprsPacket, errorCode: string, value?: any): AprsPacket {
        packet.resultCode = errorCode;

        packet.resultMessage = ((RESULT_MESSAGES[errorCode] !== undefined) ? RESULT_MESSAGES[errorCode] : errorCode)
                + `: ${value}`;
                //+ ((value !== undefined && value) ? value : value);

        return packet;
    }

    /**
     * Used to add warning messages to a packet.
     *
     * @param {json} rethash Parsed values from packet.
     * @param {string} errcode Error code, this should be able to be found in the result_messages object/map.
     * @param {string} val Value that caused the warning.
     * @return {void}
     */
    addWarning(packet: AprsPacket, errorCode: string, value?: string): AprsPacket {
        if(packet.warningCodes == undefined || !packet.warningCodes) {
            packet.warningCodes = [];
        }

        packet.warningCodes.push(errorCode);

        packet.resultMessage = ((RESULT_MESSAGES[errorCode] !== undefined && RESULT_MESSAGES[errorCode]) ? RESULT_MESSAGES[errorCode] : errorCode)
                + ((value !== undefined && value) ? `: ${value}` : '');

        return packet;
    }

    /**
     * =item checkAX25Call()
     * Check the callsign for a valid AX.25 callsign format and
     * return cleaned up (OH2XYZ-0) callsign or undef if the callsign
     * is not a valid AX.25 address.
     * Please note that it's very common to use invalid callsigns on the APRS-IS.
     */
    public checkAX25Call(callsign: string) {
        let tempCallsign: string[];

        if((tempCallsign = callsign.match(/^([A-Z0-9]{1,6})(-\d{1,2}|)$/))) {
            if(!tempCallsign[2]) {
                return tempCallsign[1];
            } else {
                // convert SSID to positive and numeric
                let ssid = 0 - parseInt(tempCallsign[2]);

                if(ssid < 16) {
                    // 15 is maximum in AX.25
                    return tempCallsign[1] + '-' + ssid;
                }
            }
        }

        // no successfull return yet, so error
        return null;
    }

    /**
     * =item parseaprs($packet, $hashref, %options)
     * Parse an APRS packet given as a string, e.g.
     * "OH2XYZ>APRS,RELAY*,WIDE:!2345.56N/12345.67E-PHG0123 hi there"
     * Second parameter has to be a reference to a hash. That hash will
     * be filled with as much data as possible based on the packet
     * given as parameter.
     * Returns 1 if the decoding was successfull,
     * returns 0 if not. In case zero is returned, the contents of
     * the parameter hash should be discarded, except for the error cause
     * as reported via hash elements resultcode and resultmsg.
     * The third parameter is an optional hash containing any of the following
     * options:
     * B<isax25> - the packet should be examined in a form
     * that can exist on an AX.25 network (1) or whether the frame is
     * from the Internet (0 - default).
     * B<accept_broken_mice> - if the packet contains corrupted
     * mic-e fields, but some of the data is still recovable, decode
     * the packet instead of reporting an error. At least aprsd produces
     * these packets. 1: try to decode, 0: report an error (default).
     * Packets which have been successfully demangled will contain the
     * B<mice_mangled> flag.
     * B<raw_timestamp> - Timestamps within the packets are not decoded
     * to an UNIX timestamp, but are returned as raw strings.
     * Example:
     * my %hash;
     * my ret = parseaprs("OH2XYZ>APRS,RELAY*,WIDE:!2345.56N/12345.67E-PHG0123 hi",
     * \%hash, 'isax25' => 0, 'accept_broken_mice' => 0);
     */
    parseAprs(packet: string, options: ParserOptions = new ParserOptions()): AprsPacket {
        let retVal: AprsPacket = new AprsPacket();

        // save the original packet
        retVal.origpacket = packet;

        if(packet === undefined) {
            return this.addError(retVal, 'packet_no');;
        }

        if(!packet || packet.length < 1) {
            return this.addError(retVal, 'packet_short');
        }

        // Separate the header and packet body on the first colon.
        let [ header, body ] = packet.split(/:(.*)/);

        // If no body, skip
        if(!body) {
            return this.addError(retVal, 'packet_nobody');
        }

        // Save all the parts of the packet
        retVal.header = header;
        retVal.body = body;

        // Source callsign, put the rest in $rest
        let srcCallsign;
        let rest;
        let $header;

        if(($header = header.match(/^([A-Z0-9-]{1,9})>(.*)$/i))) {
            rest = $header[2];

            if(options.isAx25 == false) {
                srcCallsign = $header[1];
            } else {
                srcCallsign = this.checkAX25Call($header[1].toUpperCase());

                if(!srcCallsign) {
                    return this.addError(retVal, 'srccall_noax25');
                }
            }
        } else {
            // can't be a valid amateur radio callsign, even
            // in the extended sense of APRS-IS callsigns
            return this.addError(retVal, 'srccall_badchars');
        }

        retVal.sourceCallsign = srcCallsign;

        // Get the destination callsign and digipeaters.
        // Only TNC-2 format is supported, AEA (with digipeaters) is not.
        let pathcomponents = rest.split(',');

        // More than 9 (dst callsign + 8 digipeaters) path components
        // from AX.25 or less than 1 from anywhere is invalid.
        if(options.isAx25 == true) {
            if(pathcomponents.length > 9) {
                // too many fields to be from AX.25
                return this.addError(retVal, 'dstpath_toomany');
            }
        }

        if(pathcomponents.length === 1 && pathcomponents[0] === '') {
            // no destination field
            return this.addError(retVal, 'dstcall_none');
        }


        // Destination callsign. We are strict here, there
        // should be no need to use a non-AX.25 compatible
        //# destination callsigns in APRS-IS.
        let dstcallsign = this.checkAX25Call(pathcomponents.shift());

        if(!dstcallsign) {
            return this.addError(retVal, 'dstcall_noax25');
        }

        retVal.destCallsign = dstcallsign;

        // digipeaters
        let digipeaters = [];

        if(options.isAx25 == true) {
            for(let digi of pathcomponents) {
                let d;

                if((d = digi.match(/^([A-Z0-9-]+)(\*|)$/i))) {
                    let digitested = this.checkAX25Call(d[1].toUpperCase());

                    if(!digitested) {
                        return this.addError(retVal, `${digi} digicall_noax25`);
                    }

                    // add it to the digipeater array
                    digipeaters.push(new Digipeater(
                        digitested
                        , (d[2] == '*')
                    ));
                } else {
                    return this.addError(retVal, 'digicall_badchars');
                }
            }
        } else {
            let seen_qconstr = false;
            let tmp = null;

            for(let digi of pathcomponents) {
                // From the internet. Apply the same checks as for
                // APRS-IS packet originator. Allow long hexadecimal IPv6
                // address after the Q construct.
                if((tmp = digi.match(/^([A-Z0-9a-z-]{1,9})(\*|)$/))) {
                    digipeaters.push(new Digipeater(tmp[1], (tmp[2] == '*')));

                    seen_qconstr = /^q..$/.test(tmp[1]) || seen_qconstr; // if it's already true, don't reset it to false.
                } else {
                    //if ($seen_qconstr && $digi =~ /^([0-9A-F]{32})$/) { // This doesn't even make sense.  Unless perl does something special
                    // this condition should never be true.  Lets remove the first condition for fun.
                    if(seen_qconstr == true && (tmp = digi.match(/^([0-9A-F]{32})$/))) {
                        digipeaters.push(new Digipeater(tmp[1], false));
                    } else {
                        return this.addError(retVal, 'digicall_badchars');
                    }
                }
            }
        }

        retVal.digipeaters = digipeaters;

        // So now we have source and destination callsigns and
        // digipeaters parsed and ok. Move on to the body.

        // Check the first character of the packet
        // and determine the packet type
        //let retval = -1;
        let packettype = body.charAt(0);
        let paclen = body.length;

        // Check the packet type and proceed depending on it
        // Mic-encoder packet
        if(packettype == '\'' || packettype == '`') {
            // the following are obsolete mic-e types: 0x1c 0x1d
            // mic-encoder data
            // minimum body length 9 chars
            if(paclen >= 9) {
                retVal.type = PacketTypeEnum.LOCATION

                retVal = this.miceToDecimal(body.substring(1), dstcallsign, retVal, options);
            }
        // Normal or compressed location packet, with or without
        // timestamp, with or without messaging capability
        } else if(packettype == '!' || packettype == '=' ||
                packettype == '/' || packettype == '@') {
            // with or without messaging
            retVal.messaging = !(packettype == '!' || packettype == '/');

            if(paclen >= 14) {
                retVal.type = PacketTypeEnum.LOCATION;

                if(packettype == '/' || packettype == '@') {
                    // With a prepended timestamp, check it and jump over.
                    // If the timestamp is invalid, it will be set to zero.
                    retVal.timestamp = this.parseTimestamp(body.substring(1, 8), options);

                    // TODO: this can be hit if this condition is not met: /^(\d{2})(\d{2})(\d{2})(z|h|\/)$/
                    if(retVal.timestamp == 0) {
                        this.addWarning(retVal, 'timestamp_inv_loc');
                    }

                    body = body.substring(7);
                }

                // remove the first character
                body = body.substring(1);

                // grab the ascii value of the first byte of body
                let poschar = body.charCodeAt(0);

                if(poschar >= 48 && poschar <= 57) {
                    // poschar is a digit... normal uncompressed position
                    if(body.length >= 19) {
                        retVal = this.normalPositionToDecimal(body, retVal);

                        // continue parsing with possible comments, but only
                        // if this is not a weather report (course/speed mixup,
                        // weather as comment)
                        // if the comments don't parse, don't raise an error
                        if((retVal.resultCode === undefined && !retVal.resultCode)  && retVal.symbolcode != '_') {
                            retVal = this.commentsToDecimal(body.substring(19), retVal);
                        } else {
                            // warn "maybe a weather report?\n" . substring($body, 19) . "\n";
                            retVal = this.parseWeather(body.substring(19), retVal);
                        }
                    }

                    // TODO: Should an error be added here since there's no location data on the packet?
                } else if(poschar == 47 || poschar == 92
                        || (poschar >= 65 && poschar <= 90)
                        || (poschar >= 97 && poschar <= 106)) {
                    // compressed position
                    if(body.length >= 13) {
                        retVal = this.compressedPositionToDecimal(body.substring(0, 13), retVal);

                        // continue parsing with possible comments, but only
                        // if this is not a weather report (course/speed mixup,
                        // weather as comment)
                        // if the comments don't parse, don't raise an error
                        if((retVal.resultCode === undefined && !retVal.resultCode) && retVal.symbolcode != '_') {
                            retVal = this.commentsToDecimal(body.substring(13), retVal);
                        } else {
                            // warn "maybe a weather report?\n" . substring($body, 13) . "\n";
                            retVal = this.parseWeather(body.substring(13), retVal);
                        }
                    } else {
                        return this.addError(retVal, 'packet_invalid', 'Body is too short.');
                    }
                } else if(poschar == 33) { // '!'
                    // Weather report from Ultimeter 2000
                    retVal.type = PacketTypeEnum.WEATHER

                    retVal = this.parseWeatherPeetLogging(body.substring(1), retVal);
                } else {
                    return this.addError(retVal, 'packet_invalid');
                }
            } else {
                return this.addError(retVal, 'packet_short', 'location');
            }
        // Weather report
        } else if(packettype == '_') {
            if(/_(\d{8})c[\- \.\d]{1,3}s[\- \.\d]{1,3}/.test(body)) {
                retVal.type = PacketTypeEnum.WEATHER

                retVal = this.parseWeather(body.substring(9), retVal);
            } else {
                return this.addError(retVal, 'wx_unsupp', 'Positionless');
            }
        // Object
        } else if (packettype == ';') {
            // if(paclen >= 31) { is there a case where this couldn't be
            retVal.type = PacketTypeEnum.OBJECT

            retVal = this.objectToDecimal(body, retVal, options);
        // NMEA data
        } else if(packettype == '$') {
            // don't try to parse the weather stations, require "$GP" start
            if(body.substring(0, 3) == '$GP') {
                // dstcallsign can contain the APRS symbol to use,
                // so read that one too
                retVal.type = PacketTypeEnum.LOCATION

                retVal = this.nmeaToDecimal(body.substring(1), dstcallsign, retVal);
            } else if(body.substring(0, 5) == '$ULTW') {
                retVal.type = PacketTypeEnum.WEATHER
                retVal = this.weatherParsePeetPacket(body.substring(5), retVal);
            }
            /*
            else {
                throw new Error(`test 1 - ${retVal.origpacket}`);
            }
            */
        // Item
        } else if (packettype == ')') {
            retVal.type = PacketTypeEnum.ITEM
            retVal = this.itemToDecimal(body, srcCallsign, retVal);
        // Message, bulletin or an announcement
        } else if(packettype === ':') {
            if(paclen >= 11) {
                // all are labeled as messages for the time being
                retVal.type = PacketTypeEnum.MESSAGE

                retVal = this.parseMessage(body, retVal);
            }
            /*
            else {
                throw new Error(`test 2 - ${retVal.origpacket}`);
            }
            */
        // Station capabilities
        } else if(packettype == '<') {
            // at least one other character besides '<' required
            if(paclen >= 2) {
                retVal.type = PacketTypeEnum.CAPABILITIES

                retVal = this.parseCapabilities(body.substring(1), srcCallsign, retVal);
            }

            // TODO: add an error to the packet?
        // Status reports
        } else if(packettype == '>') {
            // we can live with empty status reports
            // if($paclen >= 1) { NOTE: this cannot ever hit the else case, because the body will be empty and return an error
                retVal.type = PacketTypeEnum.STATUS

                retVal = this.parseStatus(body.substring(1), retVal, options)
            //}
        // Telemetry
        } else if(/^T#(.*?),(.*)$/.test(body)) {
            retVal.type = PacketTypeEnum.TELEMETRY

            retVal = this.parseTelemetry(body.substring(2), retVal)
        // DX spot
        }
        /*
        else if (/^DX\s+de\s+(.*?)\s*[:>]\s*(.*)$/i.test(body)) {
            var tmp: string[];
            tmp = body.match(/^DX\s+de\s+(.*?)\s*[:>]\s*(.*)$/i);

            retVal.type = PacketTypeEnum.DX

            retVal = this._dx_parse(tmp[1], tmp[2], retVal);
        //# Experimental
        } */
        else if(/^\{\{/i.test(body)) {
            return this.addError(retVal, 'exp_unsupp');
        // When all else fails, try to look for a !-position that can
        // occur anywhere within the 40 first characters according
        // to the spec.
        } else {
            let pos = body.indexOf('!');

            if(pos >= 0 && pos <= 39) {
                retVal.type = PacketTypeEnum.LOCATION
                retVal.messaging = false;

                let pChar = body.substring(pos + 1, pos + 2);

                if(/^[\/\\A-Za-j]$/.test(pChar)) {
                    // compressed position
                    if(body.length >= (pos + 1 + 13)) {
                        retVal = this.compressedPositionToDecimal(body.substring(pos + 1, pos + 13), retVal);

                        // check the APRS data extension and comment,
                        // if not weather data
                        if(retVal.resultCode === undefined && !retVal.resultCode && retVal.symbolcode != '_') {
                            retVal = this.commentsToDecimal(body.substring(pos + 14), retVal);
                        }
                    }
                } else if(/^\d$/i.test(pChar)) {
                    // normal uncompressed position
                    if(body.length >= (pos + 1 + 19)) {
                        retVal = this.normalPositionToDecimal(body.substring(pos + 1), retVal);

                        // check the APRS data extension and comment,
                        // if not weather data
                        if(!retVal.resultMessage && retVal.symbolcode != '_') {
                            retVal =  this.commentsToDecimal(body.substring(pos + 20), retVal);
                        }
                    }
                }
            }
        }

        // Return packet regardless of if there were errors or not
        return retVal;
    }

    /**
     * Parse a status report. Only timestamps
     * and text report are supported. Maidenhead,
     * beam headings and symbols are not.
     */
    private parseStatus(packet: string, rethash: AprsPacket, options: ParserOptions): AprsPacket {
        let tmp;

        // Remove CRs, LFs and trailing spaces
        packet = packet.trim();

        // Check for a timestamp
        if((tmp = packet.match(/^(\d{6}z)/))) {
            // Use default parser options for parsing the timestamp here per the original code.
            // $rethash->{'timestamp'} = _parse_timestamp({}, $1)
            rethash.timestamp = this.parseTimestamp(tmp[1], new ParserOptions());

            if(rethash.timestamp == 0) {
                rethash = this.addWarning(rethash, 'timestamp_inv_sta') ;
            }

            packet = packet.substring(7);
        }

        // TODO: handle beam heading and maidenhead grid locator status reports

        // Save the rest as the report
        rethash.status = packet;

        return rethash;
    }

    /**
     * Creates a unix timestamp based on an APRS six (+ one char for type) character timestamp or 0 if it's an invalid timestamp
     *
     * @param {json} options Looking for a raw_timestamp value
     * @param {string} stamp 6 digit number followed by z, h, or /
     * @returns {number} A unix timestamp
     */
    private parseTimestamp(stamp: any, options: ParserOptions): number {
        // Check initial format
        if(!(stamp = stamp.match(/^(\d{2})(\d{2})(\d{2})(z|h|\/)$/))) {
            return 0;
        }

        if(options.isRawTimestamp == true) {
            return stamp[1] + stamp[2] + stamp[3];
        }

        let stamptype = stamp[4];

        if(stamptype == 'h') {
            // HMS format
            let hour = stamp[1];
            let minute = stamp[2];
            let second = stamp[3];

            // Check for invalid time
            if(hour > 23 || minute > 59 || second > 59) {
                return 0;
            }

            // All calculations here are in UTC, but if this is run under old MacOS (pre-OSX), then
            // Date_to_Time could be in local time.
            let ts = new Date();
            let currentTime: number = Math.floor(ts.getTime() / 1000);
            let cYear = ts.getUTCFullYear();
            let cMonth = ts.getUTCMonth();
            let cDay = ts.getUTCDate();
            let tStamp = Math.floor(new Date(Date.UTC(cYear, cMonth, cDay, hour, minute, second, 0)).getTime() / 1000);

            // If the time is more than about one hour
            // into the future, roll the timestamp
            // one day backwards.
            if(currentTime + 3900 < tStamp) {
                tStamp -= 86400;
                // If the time is more than about 23 hours
                // into the past, roll the timestamp one
                // day forwards.
            } else if(currentTime - 82500 > tStamp) {
                tStamp += 86400;
            }

            return tStamp;
        } else if(stamptype == 'z' || stamptype == '/') {
            // Timestamp is DHM, UTC (z) or local (/).
            // Always intepret local to mean local
            // to this computer.
            let day = parseInt(stamp[1]);
            let hour = parseInt(stamp[2]);
            let minute = parseInt(stamp[3]);

            if(day < 1 || day > 31 || hour > 23 || minute > 59) {
                return 0;
            }

            // If time is under about 12 hours into the future, go there.
            // Otherwise get the first matching time in the past.
            let ts = new Date();
            let currentTime = Math.floor(ts.getTime() / 1000);
            let cYear;
            let cMonth;
            let cDay;

            if (stamptype === 'z') {
                cYear = ts.getUTCFullYear();
                cMonth = ts.getUTCMonth();
                cDay = ts.getUTCDate();
            } else {
                cYear = ts.getFullYear();
                cMonth = ts.getMonth()
                cDay = ts.getDate();
            }

            // Form the possible timestamps in
            // this, the next and the previous month
            let tmpDate = new Date(cYear, cMonth, cDay, 0, 0, 0, 0);
            tmpDate.setDate(tmpDate.getMonth() + 1);

            let fwdYear = tmpDate.getFullYear();
            let fwdMonth = tmpDate.getMonth();

            // Calculate back date.
            //tmpDate = new Date($cyear, $cmonth - 1, $cday, 0, 0, 0, 0);
            tmpDate = new Date(cYear, cMonth, cDay, 0, 0, 0, 0);
            tmpDate.setDate(tmpDate.getMonth() - 1);

            let backYear = tmpDate.getFullYear();
            let backMonth = tmpDate.getMonth();

            let fwdtstamp = null;
            let currtstamp = null;
            let backtstamp = null;

            if(ConversionUtil.CheckDate(cYear, cMonth, day)) {
                if(stamptype === 'z') {
                    //$currtstamp = Date_to_Time($cyear, $cmonth, $day, $hour, $minute, 0);
                    currtstamp = Math.floor(new Date(Date.UTC(cYear, cMonth, cDay, hour, minute, 0, 0)).getTime() / 1000);
                } else {
                    currtstamp = Math.floor(new Date(cYear, cMonth, day, hour, minute, 0, 0).getTime() / 1000);
                }
            }

            if(ConversionUtil.CheckDate(fwdYear, fwdMonth, day)) {
                if(stamptype === 'z') {
                    fwdtstamp = Math.floor(new Date(Date.UTC(fwdYear, fwdMonth, day, hour, minute, 0, 0)).getTime() / 1000);
                } else {
                    fwdtstamp = Math.floor(new Date(cYear, cMonth, day, hour, minute, 0, 0).getTime() / 1000);
                }
            }

            if(ConversionUtil.CheckDate(backYear, backMonth, day)) {
                if(stamptype === 'z') {
                    backtstamp = Math.floor(new Date(Date.UTC(backYear, backMonth, day, hour, minute, 0, 0)).getTime() / 1000);
                } else {
                    backtstamp = Math.floor(new Date(cYear, cMonth, day, hour, minute, 0, 0).getTime() / 1000);
                }
            }

            // Select the timestamp to use. Pick the timestamp
            // that is largest, but under about 12 hours from
            // current time.
            if(fwdtstamp && (fwdtstamp - currentTime) < 43400) {
                return fwdtstamp;
            } else if(currtstamp && (currtstamp - currentTime) < 43400) {
                return currtstamp;
            } else if(backtstamp) {
                return backtstamp;
            }
        }

        // return failure if we haven't returned with a success earlier
        return 0;
    }

    /**
     * Parse a message
     * possible TODO: ack piggybacking
     */
    private parseMessage(packet: string, retVal: AprsPacket) {
        let tmp;

        // Check format
        // x20 - x7e, x80 - xfe
        if((tmp = packet.match(/^:([A-Za-z0-9_ -]{9}):([ -~]+)$/))) { // match all ascii printable characters for now
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

    /**
     * Parse an object
     */
    private objectToDecimal(packet: string, retVal: AprsPacket, options: ParserOptions): AprsPacket {
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
        retVal.timestamp = this.parseTimestamp(timeStamp, options);

        if(retVal.timestamp == 0) {
            retVal = this.addWarning(retVal, 'timestamp_inv_obj');
        }

        // Forward the location parsing onwards
        let locationOffset = 18; // object location always starts here
        let locationChar = packet.charAt(18);

        if(/^[\/\\A-Za-j]$/.test(locationChar)) {
            // compressed
            retVal = this.compressedPositionToDecimal(packet.substring(18, 31), retVal);
            locationOffset = 31; // now points to APRS data extension/comment
        } else if(/^\d$/i.test(locationChar)) {
            // normal
            retVal = this.normalPositionToDecimal(packet.substring(18), retVal);
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
            retVal = this.commentsToDecimal(packet.substring(locationOffset), retVal);
        } else {
            // possibly a weather object, try to parse
            retVal = this.parseWeather(packet.substring(locationOffset), retVal);
        }

        return retVal;
    }

    /**
     * Return an NMEA latitude or longitude.
     *
     * @param {string} value Latitude or Longitude value to convert. (dd)dmm.m(mmm..)
     * @param {string} sign North/South or East/West indicator.
     * @param {json} retHash JSON object containing the parsed values of the packet.
     * @returns {float} The returned value is decimal degrees, North and East are positive.  Value is null if there's an error.
     * TODO: should this return the packet instead?
     */
    private parseNmeaLatLon(value: string, sign: string, rethash: AprsPacket): [ AprsPacket, number ] {
        let tmp;
        let retVal: number;

        // upcase the sign for compatibility
        sign = sign.toUpperCase();

        // Be leninent on what to accept, anything
        // goes as long as degrees has 1-3 digits,
        // minutes has 2 digits and there is at least
        // one decimal minute.
        if((tmp = value.match(/^\s*(\d{1,3})([0-5][0-9])\.(\d+)\s*$/))) {
            let minutes = `${tmp[2]}.${tmp[3]}`;

            // javascript engines aren't smart enough to convert these to numeric form
            retVal = parseFloat(tmp[1]) + (parseFloat(minutes) / 60);

            // capture position resolution in meters based
            // on the amount of minute decimals present
            rethash.posresolution = ParserUtil.calculatePositionResolution(tmp[3].length);
        } else {
            return [ this.addError(rethash, 'nmea_inv_cval', value), null ];
        }

        if(/^\s*[EW]\s*$/.test(sign)) {
            // make sure the value is ok
            if(retVal > 179.999999) {
                return [ this.addError(rethash, 'nmea_large_ew', value), null ];
            }

            // west negative
            if(/^\s*W\s*$/.test(sign)) {
                retVal *= -1;
            }
        } else if(/^\s*[NS]\s*$/.test(sign)) {
            // make sure the value is ok
            if(retVal > 89.999999) {
                return [ this.addError(rethash, 'nmea_large_ns', value), null ];
            }

            // south negative
            if(/^\s*S\s*$/.test(sign)) {
                retVal *= -1;
            }
        } else {
            // incorrect sign
            return [ this.addError(rethash, 'nmea_inv_sign', sign), null ];
        }

        // all ok
        return [ rethash, retVal ];
    }

    /**
     * Parse an NMEA location
     */
    private nmeaToDecimal(body: string, dstcallsign: string, rethash: AprsPacket): AprsPacket {
        let tmp;

        // verify checksum first, if it is provided
        body = body.trimEnd() // NOTE: Perl version only trims spaces, not all whitespace

        if ((tmp = body.match(/^([\x20-\x7e]+)\*([0-9A-F]{2})$/i))) {
            const checksumarea = tmp[1];

            // hex(): Interprets EXPR as a hex string and returns the corresponding numeric value.
            let checksumgiven: any = parseInt(tmp[2], 16).toString(10);
            let checksumcalculated = 0;

            for (var i = 0; i < checksumarea.length; i++) {
                checksumcalculated ^= checksumarea.charCodeAt(i);
            }

            if(checksumgiven != checksumcalculated.toString()) {
                // invalid checksum
                return this.addError(rethash, 'nmea_inv_cksum');
            }

            // make a note of the existance of a checksum
            rethash.checksumok = true;
        }

        // checksum ok or not provided
        rethash.format = 'nmea';

        // use a dot as a default symbol if one is not defined in
        // the destination callsign
        let [ symtable, symcode ] = ParserUtil.symbolFromDst(dstcallsign);

        if(!symtable || !symcode) {
            rethash.symboltable = '/';
            rethash.symbolcode = '/';
        } else {
            rethash.symboltable = symtable;
            rethash.symbolcode = symcode;
        }

        // Split to NMEA fields
        body = body.replace(/\*[0-9A-F]{2}$/, '');    // remove checksum from body first
        let nmeafields = body.split(',');

        // Now check the sentence type and get as much info
        // as we can (want).
        if(nmeafields[0] == 'GPRMC') {
            // we want at least 10 fields
            if(nmeafields.length < 10) {
                return this.addError(rethash, 'gprmc_fewfields', nmeafields);
            }

            if(nmeafields[2] != 'A') {
                // invalid position
                return this.addError(rethash, 'gprmc_nofix');
            }

            // check and save the timestamp
            let hour;
            let minute;
            let second;

            if((tmp = nmeafields[1].match(/^\s*(\d{2})(\d{2})(\d{2})(|\.\d+)\s*$/))) {
                // if seconds has a decimal part, ignore it
                // leap seconds are not taken into account...
                if(parseInt(tmp[1]) > 23 || parseInt(tmp[2]) > 59 || parseInt(tmp[3]) > 59) {
                    return this.addError(rethash, 'gprmc_inv_time', nmeafields[1]);
                }

                hour = parseInt(tmp[1]);
                minute = parseInt(tmp[2]);
                second = parseInt(tmp[3]);
            } else {
                return this.addError(rethash, 'gprmc_inv_time');
            }

            let year: number;
            let month: number;
            let day: number;

            if((tmp = nmeafields[9].match(/^\s*(\d{2})(\d{2})(\d{2})\s*$/))) {
                // check the date for validity. Assume
                // years 0-69 are 21st century and years
                // 70-99 are 20th century
                year = 2000 + parseInt(tmp[3]);

                if(parseInt(tmp[3]) >= 70) {
                    year = 1900 + parseInt(tmp[3]);
                }

                // check for invalid date
                // javascript months are 0 based
                if(!(ConversionUtil.CheckDate(year, parseInt(tmp[2]) - 1, parseInt(tmp[1])))) {
                    return this.addError(rethash, 'gprmc_inv_date', `${year} ${parseInt(tmp[2]) - 1} ${tmp[1]}`);
                }

                // javascript months are 0 based
                month = parseInt(tmp[2]) - 1; // force numeric
                day = parseInt(tmp[1]);
            } else {
                return this.addError(rethash, 'gprmc_inv_date');
            }

            // TODO: This isn't true for javascript - https://stackoverflow.com/questions/11526504/minimum-and-maximum-date
            // Date_to_Time() can only handle 32-bit unix timestamps,
            // so make sure it is not used for those years that
            // are outside that range.
            if(year >= 2038 || year < 1970) {
                rethash.timestamp = 0;
                return this.addError(rethash, 'gprmc_date_out', year);
            } else {
                let d = new Date(Date.UTC(year, month, day, hour, minute, second, 0));

                rethash.timestamp = d.getTime() / 1000;
            }

            // speed (knots) and course, make these optional
            // in the parsing sense (don't fail if speed/course
            // can't be decoded).
            if((tmp = nmeafields[7].match(/^\s*(\d+(|\.\d+))\s*$/))) {
                // convert to km/h
                rethash.speed = parseFloat(tmp[1]) * ConversionConstantEnum.KNOT_TO_KMH;
            }

            if((tmp = nmeafields[8].match(/^\s*(\d+(|\.\d+))\s*$/))) {
                // round to nearest integer
                let course = Math.round((parseFloat(tmp[1]) + 0.5));

                // if zero, set to 360 because in APRS
                // zero means invalid course...
                if(course == 0) {
                    course = 360;
                } else if(course > 360) {
                    course = 0; // invalid
                }

                rethash.course = course;
            } else {
                rethash.course = 0; // unknown
            }

            // latitude and longitude
            let latitude: number;
            [ rethash, latitude ] = this.parseNmeaLatLon(nmeafields[3], nmeafields[4], rethash);

            if(latitude === undefined || !latitude) {
                return rethash;
            }

            rethash.latitude = latitude;

            let longitude: number;
            [ rethash, longitude ] = this.parseNmeaLatLon(nmeafields[5], nmeafields[6], rethash);

            if(longitude === undefined || !longitude) {
                return rethash;
            }

            rethash.longitude = longitude;

            // we have everything we want, return
            return rethash;
        }
        /*
            else if(nmeafields[0] == 'GPGGA') {

            # we want at least 11 fields
            if (@nmeafields < 11) {
                addError($rethash, 'gpgga_fewfields', scalar(@nmeafields));
                return 0;
            }

            # check for position validity
            if ($nmeafields[6] =~ /^\s*(\d+)\s*$/o) {
                if ($1 < 1) {
                    addError($rethash, 'gpgga_nofix', $1);
                    return 0;
                }
            } else {
                addError($rethash, 'gpgga_nofix');
                return 0;
            }

            # Use the APRS time parsing routines to check
            # the time and convert it to timestamp.
            # But before that, remove a possible decimal part
            $nmeafields[1] =~ s/\.\d+$//;
            $rethash->{'timestamp'} = _parse_timestamp($options, $nmeafields[1] . 'h');
            if ($rethash->{'timestamp'} == 0) {
                addError($rethash, 'timestamp_inv_gpgga');
                return 0;
            }

            # latitude and longitude
            my $latitude = _nmea_getlatlon($nmeafields[2], $nmeafields[3], $rethash);
            if (not(defined($latitude))) {
                return 0;
            }
            $rethash->{'latitude'} = $latitude;
            my $longitude = _nmea_getlatlon($nmeafields[4], $nmeafields[5], $rethash);
            if (not(defined($longitude))) {
                return 0;
            }
            $rethash->{'longitude'} = $longitude;

            # altitude, only meters are accepted
            if ($nmeafields[10] eq 'M' &&
                $nmeafields[9] =~ /^(-?\d+(|\.\d+))$/o) {
                # force numeric interpretation
                $rethash->{'altitude'} = $1 + 0;
            }

            # ok
            return 1;
            *
        } else if(nmeafields[0] == 'GPGLL') {
            /*
            # we want at least 5 fields
            if (@nmeafields < 5) {
                addError($rethash, 'gpgll_fewfields', scalar(@nmeafields));
                return 0;
            }

            # latitude and longitude
            my $latitude = _nmea_getlatlon($nmeafields[1], $nmeafields[2], $rethash);
            if (not(defined($latitude))) {
                return 0;
            }
            $rethash->{'latitude'} = $latitude;
            my $longitude = _nmea_getlatlon($nmeafields[3], $nmeafields[4], $rethash);
            if (not(defined($longitude))) {
                return 0;
            }
            $rethash->{'longitude'} = $longitude;

            # Use the APRS time parsing routines to check
            # the time and convert it to timestamp.
            # But before that, remove a possible decimal part
            if (@nmeafields >= 6) {
                $nmeafields[5] =~ s/\.\d+$//;
                $rethash->{'timestamp'} = _parse_timestamp($options, $nmeafields[5] . 'h');
                if ($rethash->{'timestamp'} == 0) {
                    addError($rethash, 'timestamp_inv_gpgll');
                    return 0;
                }
            }

            if (@nmeafields >= 7) {
                # GPS fix validity supplied
                if ($nmeafields[6] ne 'A') {
                    addError($rethash, 'gpgll_nofix');
                    return 0;
                }
            }

            # ok
            return 1;
            *
        //} elsif ($nmeafields[0] eq 'GPVTG') {
        //} elsif ($nmeafields[0] eq 'GPWPT') {
        }
        */
        else {
            return this.addError(
                rethash
                , 'nmea_unsupp'
                , nmeafields[0].replace(/[\x00-\x1f]/, (x) => { return parseInt(x, 16).toString(16) })
            )
        }
    }

    /**
     * Parse the possible APRS data extension
     * as well as comment
     */
    private commentsToDecimal(rest: string, rethash: AprsPacket): AprsPacket {
        let tmprest;

        // First check the possible APRS data extension,
        // immediately following the packet
        if(rest.length >= 7) {
            if((tmprest = rest.match(/^([0-9. ]{3})\/([0-9. ]{3})/))) {
                let course = tmprest[1];
                let speed = tmprest[2];

                if(/^\d{3}$/.test(course) &&
                        parseInt(course) <= 360 &&
                        parseInt(course) >= 1) {
                    // force numeric interpretation
                    rethash.course = parseInt(course);
                } else {
                    // course is invalid, set it to zero
                    rethash.course = 0;
                }

                // If speed is invalid, don't set it
                // (zero speed is a valid speed).
                if(/^\d{3}$/.test(speed)) {
                    // force numeric interpretation
                    // and convert to km/h
                    rethash.speed = parseInt(speed) * ConversionConstantEnum.KNOT_TO_KMH;
                }

                rest = rest.substring(7);
            } else if((tmprest = rest.match(/^PHG(\d[\x30-\x7e]\d\d[0-9A-Z])\//))) {
                // PHGR
                rethash.phg = tmprest[1];
                rest = rest.substring(8);
            } else if((tmprest = rest.match(/^PHG(\d[\x30-\x7e]\d\d)/))) {
                // don't do anything fancy with PHG, just store it
                rethash.phg = tmprest[1];
                rest = rest.substring(7);
            } else if((tmprest = rest.match(/^RNG(\d{4})/))) {
                // radio range, in miles, so convert to km
                rethash.radiorange = parseInt(tmprest[1]) * ConversionConstantEnum.MPH_TO_KMH;
                rest = rest.substring(7);
            }
        }

        // Check for optional altitude anywhere in the comment,
        // take the first occurrence
        if((tmprest = rest.match(/^(.*?)\/A=(-\d{5}|\d{6})(.*)$/))) {
            // convert to meters as well
            rethash.altitude = parseFloat(tmprest[2]) * ConversionConstantEnum.FEET_TO_METERS;
            rest = tmprest[1] + tmprest[3];
        }

        // Check for new-style base-91 comment telemetry - ISSUE HERE
        [ rest, rethash ] = this.parseCommentTelemetry(rethash, rest);

        // Check for !DAO!, take the last occurrence (per recommendation)
        if((tmprest = rest.match(/^(.*)\!([\x21-\x7b][\x20-\x7b]{2})\!(.*?)$/))) {
            let found = false;
            [ rethash, found ] = this.parseDao(tmprest[2], rethash);

            if(found === true) {
                rest = tmprest[1] + tmprest[3];
            }
        }

        // Strip a / or a ' ' from the beginning of a comment
        // (delimiter after PHG or other data stuffed within the comment)
        rest = rest.replace(/^[\/\s]/, '');

        // Save the rest as a separate comment, if
        // anything is left (trim unprintable chars
        // out first and white space from both ends)
        if(rest.length > 0) {
            rethash.comment = rest.trim();
        }

        // Always succeed as these are optional
        return rethash;
    }

    /**
     * Parse a station capabilities packet
     */
    private parseCapabilities(packet: string, srccallsign: string, rethash: AprsPacket): AprsPacket {
        /*
        # Remove CRs, LFs and trailing spaces
        $packet =~ tr/\r\n//d;
        $packet =~ s/\s+$//;
        # Then just split the packet, we aren't too picky about the format here.
        # Also duplicates and case changes are not handled in any way,
        # so the last part will override an earlier part and different
        # cases can be present. Just remove trailing/leading spaces.
        my @caps = split(/,/, $packet);
        my %caphash = ();
        foreach my $cap (@caps) {
            if ($cap =~ /^\s*([^=]+?)\s*=\s*(.*?)\s*$/o) {
                # TOKEN=VALUE
                $caphash{$1} = $2;
            } elsif ($cap =~ /^\s*([^=]+?)\s*$/o) {
                # just TOKEN
                $caphash{$1} = undef;
            }
        }

        my $keycount = keys(%caphash);
        if ($keycount > 0) {
            # store the capabilities in the return hash
            $rethash->{'capabilities'} = \%caphash;
            return 1;
        }
        */

        // at least one capability has to be defined for a capability
        // packet to be counted as valid
        // return 0;
        return rethash;
    }

    private parseCommentTelemetry(rethash: AprsPacket, rest: string): [ string, AprsPacket ] {
        rest = rest.replace(/^(.*)\|([!-{]{2})([!-{]{2})([!-{]{2}|)([!-{]{2}|)([!-{]{2}|)([!-{]{2}|)([!-{]{2}|)\|(.*)$/, function(a, b, c, d, e, f, g, h, i, j) {
            rethash.telemetry = new Telemetry(
                ((c.charCodeAt(0) - 33) * 91) + ((c.charCodeAt(1) - 33))
                , [
                    ((d.charCodeAt(0) - 33) * 91) + (d.charCodeAt(1) - 33)
                    , e != '' ? ((e.charCodeAt(0) - 33) * 91) + ((e.charCodeAt(1) - 33)) : null
                    , f != '' ? ((f.charCodeAt(0) - 33) * 91) + ((f.charCodeAt(1) - 33)) : null
                    , g != '' ? ((g.charCodeAt(0) - 33) * 91) + ((g.charCodeAt(1) - 33)) : null
                    , h != '' ? ((h.charCodeAt(0) - 33) * 91) + ((h.charCodeAt(1) - 33)) : null
                ]
            );

            if(i != '') {
                // bits: first, decode the base-91 integer
                let bitint = (((i.charCodeAt(0) - 33) * 91) + ((i.charCodeAt(1) - 33)));

                // then, decode the 8 bits of telemetry
                let bitstr = (bitint << 7).toString(2)

                rethash.telemetry.bits = '00000000'.substring(0, 8 - bitstr.length) + bitstr; //unpack('b8', pack('C', $bitint));
            }

            return b + j;
        });

        return [ rest, rethash ];
    }

    /**
     * Parse an item
     */
    private itemToDecimal(packet: string, srccallsign: string, rethash: AprsPacket): AprsPacket {
        let tmp;

        // Minimum length for an item is 18 characters
        // (or 24 characters for non-compressed)
        if(packet.length < 18) {
            return this.addError(rethash, 'item_short');
        }

        // Parse the item up to the location
        if((tmp = packet.match(/^\)([\x20\x22-\x5e\x60-\x7e]{3,9})(!|_)/))) {
            // hash member 'itemname' signals an item
            rethash.itemname = tmp[1];

            if(tmp[2] == '!') {
                rethash.alive = true;
            } else {
                rethash.alive = false;
            }
        } else {
            return this.addError(rethash, 'item_inv');
        }

        // Forward the location parsing onwards
        let locationoffset = 2 + rethash.itemname.length;
        let locationchar = packet.charAt(locationoffset);

        if(/^[\/\\A-Za-j]$/.test(locationchar)) {
            // compressed
            rethash = this.compressedPositionToDecimal(packet.substring(locationoffset, locationoffset + 13), rethash);
            locationoffset += 13;
        } else if(/^\d$/i.test(locationchar)) {
            // normal
            rethash = this.normalPositionToDecimal(packet.substring(locationoffset), rethash);
            locationoffset += 19;
        } else {
            // error
            return this.addError(rethash, 'item_dec_err');
        }

        // check to see if another function returned an error... explicit error throwing might cut out a lot of manual work here...
        if(rethash.resultCode !== undefined && rethash.resultCode) {
            return rethash;
        }

        // Check the APRS data extension and possible comments,
        // unless it is a weather report (we don't want erroneus
        // course/speed figures and weather in the comments..)
        if(rethash.symbolcode != '_') {
            rethash = this.commentsToDecimal(packet.substring(locationoffset), rethash);
        }

        return rethash;
    }

    /**
     * Parse a normal uncompressed location
     */
    private normalPositionToDecimal(packet: string, rethash: AprsPacket): AprsPacket {
        // Check the length
        if(packet.length < 19) {
            return this.addError(rethash, 'loc_short');
        }

        rethash.format = 'uncompressed';

        // Make a more detailed check on the format, but do the
        // actual value checks later
        let lon_deg;
        let lat_deg;
        let lon_min;
        let lat_min;
        let issouth = 0;
        let iswest = 0;
        let symboltable;
        let matches;

        if((matches = packet.match(/^(\d{2})([0-7 ][0-9 ]\.[0-9 ]{2})([NnSs])(.)(\d{3})([0-7 ][0-9 ]\.[0-9 ]{2})([EeWw])([\x21-\x7b\x7d])/))) {
            let sind = matches[3].toUpperCase();
            let wind = matches[7].toUpperCase();

            symboltable = matches[4];

            rethash.symbolcode = matches[8];

            if(sind == 'S') {
                issouth = 1;
            }

            if(wind == 'W') {
                iswest = 1;
            }

            lat_deg = matches[1];
            lat_min = matches[2];
            lon_deg = matches[5];
            lon_min = matches[6];
        } else {
            return this.addError(rethash, 'loc_inv');
        }

        if(!/^[\/\\A-Z0-9]$/.test(symboltable)) {
            return this.addError(rethash, 'sym_inv_table');
        }

        rethash.symboltable = symboltable;

        // Check the degree values
        if(parseInt(lat_deg) > 89 || parseInt(lon_deg) > 179) {
            return this.addError(rethash, 'loc_large');
        }

        // Find out the amount of position ambiguity
        let tmplat = lat_min.replace(/\./, '');

        // Count the amount of spaces at the end
        if((matches = tmplat.match(/^(\d{0,4})( {0,4})$/i))) {
            rethash.posambiguity = matches[2].length;
        } else {
            return this.addError(rethash, 'loc_amb_inv');
        }

        let latitude: number;
        let longitude: number;

        if(rethash.posambiguity == 0) {
            // No position ambiguity. Check longitude for invalid spaces
            if(/ /.test(lon_min)) {
                return this.addError(rethash, 'loc_amb_inv', 'longitude 0');
            }

            latitude = parseFloat(lat_deg) + (parseFloat(lat_min) / 60);
            longitude = parseFloat(lon_deg) + (parseFloat(lon_min) / 60);
        } else if(rethash.posambiguity == 4) {
            // disregard the minutes and add 0.5 to the degree values
            latitude = parseFloat(lat_deg) + 0.5;
            longitude = parseFloat(lon_deg) + 0.5;
        } else if(rethash.posambiguity == 1) {
            // the last digit is not used
            lat_min = lat_min.substring(0, 4);
            lon_min = lon_min.substring(0, 4);

            if(/ /i.test(lat_min) || (/ /i).test(lon_min)) {
                return this.addError(rethash, 'loc_amb_inv', 'lat/lon 1');
            }

            latitude = parseFloat(lat_deg) + ((parseFloat(lat_min) + 0.05) / 60);
            longitude = parseFloat(lon_deg) + ((parseFloat(lon_min) + 0.05) / 60);
        } else if(rethash.posambiguity == 2) {
            // the minute decimals are not used
            lat_min = lat_min.substring(0, 2);
            lon_min = lon_min.substring(0, 2);

            if(/ /i.test(lat_min) || / /i.test(lon_min)) {
                return this.addError(rethash, 'loc_amb_inv', 'lat/lon 2');
            }

            latitude = parseFloat(lat_deg) + ((parseFloat(lat_min) + 0.5) / 60);
            longitude = parseFloat(lon_deg) + ((parseFloat(lon_min) + 0.5) / 60);
        } else if(rethash.posambiguity == 3) {
            // the single minutes are not used
            lat_min = lat_min.charAt(0) + '5';
            lon_min = lon_min.charAt(0) + '5';

            if(/ /i.test(lat_min) || / /i.test(lon_min)) {
                return this.addError(rethash, 'loc_amb_inv', 'lat/lon 3');
            }

            latitude = parseFloat(lat_deg) + (parseFloat(lat_min) / 60);
            longitude = parseFloat(lon_deg) + (parseFloat(lon_min) / 60);
        } else {
            return this.addError(rethash, 'loc_amb_inv');
        }

        // Finally apply south/west indicators
        if(issouth == 1) {
            latitude = 0 - latitude;
        }

        if(iswest == 1) {
            longitude = 0 - longitude;
        }

        // Store the locations
        // TODO: Are these supposed to be fixed to 4 decimal places?
        rethash.latitude = latitude;
        rethash.longitude = longitude;

        // Calculate position resolution based on position ambiguity
        // calculated above.
        rethash.posresolution = ParserUtil.calculatePositionResolution(2 - rethash.posambiguity);

        // Parse possible APRS data extension
        // afterwards along with comments
        return rethash;
    }

    /**
     * convert a mic-encoder packet
     */
    private miceToDecimal(packet: string, dstcallsign: string, rethash: AprsPacket, options: ParserOptions): AprsPacket {
        let tmp: any;
        rethash.format = 'mice';

        // We only want the base callsign
        dstcallsign = dstcallsign.replace(/-\d+$/, '');

        // Check the format
        if(packet.length < 8 || dstcallsign.length != 6) {
            // too short packet to be mic-e
            return this.addError(rethash, 'mice_short');
        }

        if(!(/^[0-9A-LP-Z]{3}[0-9LP-Z]{3}$/i.test(dstcallsign))) {
            // A-K characters are not used in the last 3 characters
            // and MNO are never used
            return this.addError(rethash, 'mice_inv');
        }

        // check the information field (longitude, course, speed and
        // symbol table and code are checked). Not bullet proof..
        let mice_fixed;
        let symboltable = packet.charAt(7);

        if(!(tmp = packet.match(/^[\x26-\x7f][\x26-\x61][\x1c-\x7f]{2}[\x1c-\x7d][\x1c-\x7f][\x21-\x7b\x7d][\/\\A-Z0-9]/))) {
            // If the accept_broken_mice option is given, check for a known
            // corruption in the packets and try to fix it - aprsd is
            // replacing some valid but non-printable mic-e packet
            // characters with spaces, and some other software is replacing
            // the multiple spaces with a single space. This regexp
            // replaces the single space with two spaces, so that the rest
            // of the code can still parse the position data.

            if(options.isAcceptBrokenMice == true
                    && (packet = packet.replace(/^([\x26-\x7f][\x26-\x61][\x1c-\x7f]{2})\x20([\x21-\x7b\x7d][\/\\A-Z0-9])(.*)/, '$1\x20\x20$2$3'))) {
                mice_fixed = 1;
                // Now the symbol table identifier is again in the correct spot...
                symboltable = packet.charAt(7);

                if(!/^[\/\\A-Z0-9]$/.test(symboltable)) {
                    return this.addError(rethash, 'sym_inv_table');
                }
            } else {
                // Get a more precise error message for invalid symbol table
                if(!(/^[\/\\A-Z0-9]$/.test(symboltable))) {
                    return this.addError(rethash, 'sym_inv_table');
                } else {
                    return this.addError(rethash, 'mice_inv_info');
                }
            }
        }

        // First do the destination callsign
        // (latitude, message bits, N/S and W/E indicators and long. offset)

        // Translate the characters to get the latitude
        let tmplat: any = dstcallsign.toUpperCase();
        tmplat = tmplat.split('');
        tmp = '';

        // /A-JP-YKLZ/0-90-9___/ <- Unfortunately, JavaScript isn't as cool as Perl
        // Lets discrace Perl's awesomeness and use a loop instead.
        tmplat.forEach(function(c: string) {
            if(/[A-J]/.test(c)) {
                tmp += (c.charCodeAt(0) - 65);
            } else if(/[P-Y]/.test(c)) {
                tmp += (c.charCodeAt(0) - 80);
            } else if(/[KLZ]/.test(c)) {
                tmp += '_';
            } else {
                tmp += c;
            }
        });

        tmplat = tmp;

        // Find out the amount of position ambiguity
        if((tmp = tmplat.match(/^(\d+)(_*)$/i))) {
            let amount = 6 - tmp[1].length;

            if(amount > 4) {
                // only minutes and decimal minutes can
                // be masked out
                return this.addError(rethash, 'mice_amb_large');
            }

            rethash.posambiguity = amount;

            // Calculate position resolution based on position ambiguity
            // calculated above.
            rethash.posresolution = ParserUtil.calculatePositionResolution(2 - amount);
        } else {
            // no digits in the beginning, baaad..
            // or the ambiguity digits weren't continuous
            return this.addError(rethash, 'mice_amb_inv');
        }

        // convert the latitude to the midvalue if position ambiguity
        // is used
        if(rethash.posambiguity >= 4) {
            // the minute is between 0 and 60, so
            // the middle point is 30
            tmplat = tmplat.replace('_', '3');
        } else {
            tmplat = tmplat.replace('_', '5');  // the first is changed to digit 5
        }

        tmplat = tmplat.replace(/_/g, '0'); // the rest are changed to digit 0

        // get the degrees
        let latitude = tmplat.substring(0, 2);

        // the minutes
        let latminutes = tmplat.substring(2, 4) + '.' + tmplat.substring(4, 6);

        // convert the minutes to decimal degrees and combine
        latitude = parseFloat(latitude) + (parseFloat(latminutes) / 60);

        // check the north/south direction and correct the latitude
        // if necessary
        let nschar = dstcallsign.charCodeAt(3);

        if(nschar <= 0x4c) {
            latitude = (0 - parseFloat(latitude));
        }

        // Latitude is finally complete, so store it
        rethash.latitude = latitude;

        // Get the message bits. 1 is standard one-bit and
        // 2 is custom one-bit. mice_messagetypes provides
        // the mappings to message names
        let mbitstring = dstcallsign.substring(0, 3);

        mbitstring = mbitstring.replace(/[0-9L]/g, '0');
        mbitstring = mbitstring.replace(/[P-Z]/g, '1');
        mbitstring = mbitstring.replace(/[A-K]/g, '2');

        rethash.mbits = mbitstring;

        // Decode the longitude, the first three bytes of the
        // body after the data type indicator.
        // First longitude degrees, remember the longitude offset
        let longitude = packet.charCodeAt(0) - 28;
        let longoffsetchar = dstcallsign.charCodeAt(4);

        if(longoffsetchar >= 80) {
            longitude = longitude + 100;
        }

        if(longitude >= 180 && longitude <= 189) {
            longitude = longitude - 80;
        } else if(longitude >= 190 && longitude <= 199) {
            longitude = longitude - 190;
        }

        // Decode the longitude minutes
        let longminutes: any = packet.charCodeAt(1) - 28;

        if(longminutes >= 60) {
            longminutes -= 60;
        }

        // ... and minute decimals
        longminutes = longminutes + '.' + (packet.charCodeAt(2) - 28).toString().padStart(2, '0');

        // apply position ambiguity to longitude
        if(rethash.posambiguity == 4) {
            // minute is unused -> add 0.5 degrees to longitude
            longitude += 0.5;
        } else if(rethash.posambiguity == 3) {
            //let tempLon = longminutes.charAt(0) + '5';
            longitude = longitude + (parseFloat(longminutes.charAt(0) + '5') / 60);
        } else if(rethash.posambiguity == 2) {
            //let tempLon = longminutes.substring(0, 2) + '.5';
            longitude = longitude + (parseFloat(longminutes.substring(0, 2) + '.5') / 60);
        } else if(rethash.posambiguity == 1) {
            //let tempLon = longminutes.substring(0, 4) + '5';
            longitude = (longitude + (parseFloat(longminutes.substring(0, 4) + '5') / 60));
        } else if(rethash.posambiguity == 0) {
            longitude = longitude + (parseFloat(longminutes) / 60);
        } else {
            return this.addError(rethash, 'mice_amb_odd', rethash.posambiguity.toString());
        }

        // check the longitude E/W sign
        if(dstcallsign.charCodeAt(5) >= 80) {
            longitude = longitude * -1;
        }

        // Longitude is finally complete, so store it
        rethash.longitude = longitude;

        // Now onto speed and course.
        // If the packet has had a mic-e fix applied, course and speed are likely to be off.
        if(!mice_fixed) {
            let speed = ((packet.charCodeAt(3)) - 28) * 10;
            let coursespeed = (packet.charCodeAt(4)) - 28;
            let coursespeedtmp = Math.floor(coursespeed / 10);  // had been parseint... changed to math.floor because tests started failing.

            speed += coursespeedtmp;
            coursespeed -= coursespeedtmp * 10;

            let course = (100 * coursespeed) + (packet.charCodeAt(5) - 28);

            if(course >= 400) {
                course -= 400;
            }

            // also zero course is saved, which means unknown
            if(course >= 0) {
                rethash.course = course;
            }

            // do some important adjustements
            if(speed >= 800) {
                speed -= 800;
            }

            // convert speed to km/h and store
            rethash.speed = speed * ConversionConstantEnum.KNOT_TO_KMH;
        }

        // save the symbol table and code
        rethash.symbolcode = packet.charAt(6);
        rethash.symboltable = symboltable;

        // Check for possible altitude and comment data.
        // It is base-91 coded and in format 'xxx}' where
        // x are the base-91 digits in meters, origin is 10000 meters
        // below sea.
        if(packet.length > 8) {
            let rest = packet.substring(8);

            // check for Mic-E Telemetry Data
            if((tmp = rest.match(/^'([0-9a-f]{2})([0-9a-f]{2})(.*)$/i))) {
                // two hexadecimal values: channels 1 and 3
                rest = tmp[3];

                rethash.telemetry = new Telemetry(null, [ parseInt(tmp[1], 16), 0, parseInt(tmp[2], 16) ]);
            }

            if((tmp = rest.match(/^‘([0-9a-f]{10})(.*)$/i))) {
                // five channels:
                rest = tmp[2];

                // less elegant version of pack/unpack... gets the job done. deal with it or fix it
                tmp[1] = tmp[1].match(/.{2}/g);
                // don't know what item is, don't care, but don't remove it
                tmp[1].forEach(function(item: any, index: number) { tmp[1][index] = parseInt(tmp[1][index], 16); });

                rethash.telemetry = new Telemetry(null, tmp[1]);
            }

            // check for altitude
            if((tmp = rest.match(/^(.*?)([\x21-\x7b])([\x21-\x7b])([\x21-\x7b])\}(.*)$/))) {
                rethash.altitude = (
                        ((tmp[2].charCodeAt(0) - 33) * Math.pow(91, 2))
                        + ((tmp[3].charCodeAt(0) - 33) * 91)
                        + (tmp[4].charCodeAt(0) - 33))
                    - 10000;

                rest = tmp[1] + tmp[5];
            }

            // Check for new-style base-91 comment telemetry
            [ rest, rethash ] = this.parseCommentTelemetry(rethash, rest);

            // Check for !DAO!, take the last occurrence (per recommendation)
            if((tmp = rest.match(/^(.*)\!([\x21-\x7b][\x20-\x7b]{2})\!(.*?)$/))) {
                let daofound = false;
                [ rethash, daofound ] = this.parseDao(tmp[2], rethash);

                if(daofound === true) {
                    rest = tmp[1] + tmp[3];
                }
            }

            // If anything is left, store it as a comment
            // after removing non-printable ASCII
            // characters
            if(rest.length > 0) {
                rethash.comment = rest.trim();
            }
        }

        if(mice_fixed) {
            rethash.mice_mangled = true;
            // TODO: warn "$srccallsign: fixed packet was parsed\n";
        }

        return rethash;
    }

    /**
     * convert a compressed position to decimal degrees
     */
    private compressedPositionToDecimal(data: string, retVal: AprsPacket): AprsPacket {
        // A compressed position is always 13 characters long.
        // Make sure we get at least 13 characters and that they are ok.
        // Also check the allowed base-91 characters at the same time.
        if(!(/^[\/\\A-Za-j]{1}[\x21-\x7b]{8}[\x21-\x7b\x7d]{1}[\x20-\x7b]{3}/.test(data))) {
            return this.addError(retVal, 'comp_inv');
        }

        retVal.format = 'compressed';

        let lat1 = data.charCodeAt(1) - 33;
        let lat2 = data.charCodeAt(2) - 33;
        let lat3 = data.charCodeAt(3) - 33;
        let lat4 = data.charCodeAt(4) - 33;
        let long1 = data.charCodeAt(5) - 33;
        let long2 = data.charCodeAt(6) - 33;
        let long3 = data.charCodeAt(7) - 33;
        let long4 = data.charCodeAt(8) - 33;
        let symbolcode = data.charAt(9);
        let c1 = data.charCodeAt(10) - 33;
        let s1 = data.charCodeAt(11) - 33;
        let comptype = data.charCodeAt(12) - 33;

        // save the symbol table and code
        retVal.symbolcode = symbolcode;

        // the symbol table values a..j are really 0..9
        if(/a-j/.test(data.charAt(0))) {
            retVal.symboltable =  (data.charCodeAt(0) - 97).toString();
        } else {
            retVal.symboltable =  data.charAt(0);
        }

        // calculate latitude and longitude
        retVal.latitude = 90 - ((
                lat1 * Math.pow(91, 3)
                + lat2 * Math.pow(91, 2)
                + lat3 * 91
                + lat4
                ) / 380926);

        retVal.longitude = -180 + ((
                long1 * Math.pow(91, 3)
                + long2 * Math.pow(91, 2)
                + long3 * 91
                + long4
                ) / 190463);

        // save best-case position resolution in meters
        // 1852 meters * 60 minutes in a degree * 180 degrees
        // / 91 ** 4
        retVal.posresolution = 0.291;

        // GPS fix status, only if csT is used
        if(c1 != -1) {
            if((comptype & 0x20) == 0x20) {
                retVal.gpsfixstatus = true;
            } else {
                retVal.gpsfixstatus = false;
            }
        }

        // check the compression type, if GPGGA, then
        // the cs bytes are altitude. Otherwise try
        // to decode it as course and speed. And
        // finally as radio range
        // if c is space, then csT is not used.
        // Also require that s is not a space.
        if(c1 == -1 || s1 == -1) {
            // csT not used
        } else if((comptype & 0x18) == 0x10) {
            // cs is altitude
            let cs = c1 * 91 + s1;
            // convert directly to meters
            retVal.altitude = Math.pow(1.002, cs) * ConversionConstantEnum.FEET_TO_METERS;
        } else if(c1 >= 0 && c1 <= 89) {
            if(c1 == 0) {
                // special case of north, APRS spec
                // uses zero for unknown and 360 for north.
                // so remember to convert north here.
                retVal.course = 360;
            } else {
                retVal.course = c1 * 4;
            }

            // convert directly to km/h
            retVal.speed = (Math.pow(1.08, s1) - 1) * ConversionConstantEnum.KNOT_TO_KMH;
        } else if(c1 == 90) {
            // convert directly to km
            retVal.radiorange = (2 * Math.pow(1.08, s1)) * ConversionConstantEnum.MPH_TO_KMH;
        }

        return retVal;
    }

    /**
     * Parse a possible !DAO! extension (datum and extra
     * lat/lon digits). Returns 1 if a valid !DAO! extension was
     * detected in the test subject (and stored in retVal), 0 if not.
     * Only the "DAO" should be passed as the candidate parameter,
     * not the delimiting exclamation marks.
     */
    private parseDao(daocandidate: string, retVal: AprsPacket): [ AprsPacket, boolean ] {
        // datum character is the first character and also
        // defines how the rest is interpreted
        let latoff;
        let lonoff;
        let tmp;

        if((tmp = daocandidate.match(/^([A-Z])(\d)(\d)$/))) {
            // human readable (datum byte A...Z)
            retVal.posresolution = ParserUtil.calculatePositionResolution(3);
            retVal.daodatumbyte = tmp[1];

            latoff = parseInt(tmp[2]) * 0.001 / 60;
            lonoff = parseInt(tmp[3]) * 0.001 / 60;
        } else if((tmp = daocandidate.match(/^([a-z])([\x21-\x7b])([\x21-\x7b])$/))) {
            // base-91 (datum byte a...z)
            // store the datum in upper case, still
            retVal.daodatumbyte = tmp[1].toUpperCase();

            // close enough.. not exact:
            retVal.posresolution = ParserUtil.calculatePositionResolution(4);

            // do proper scaling of base-91 values
            latoff = (tmp[2].charCodeAt(0) - 33) / 91 * 0.01 / 60;
            lonoff = (tmp[3].charCodeAt(0) - 33) / 91 * 0.01 / 60;
        } else if((tmp = daocandidate.match(/^([\x21-\x7b])\s\s$/))) {
            // only datum information, no lat/lon digits
            retVal.daodatumbyte = tmp[1].toUpperCase();

            return [ retVal, true ];
        } else {
            return [ retVal, false ];
        }

        // check N/S and E/W
        if(retVal.latitude < 0) {
            retVal.latitude -= latoff;
        } else {
            retVal.latitude += latoff;
        }

        if(retVal.longitude < 0) {
            retVal.longitude -= lonoff;
        } else {
            retVal.longitude += lonoff;
        }

        return [ retVal, true ];
    }

    /**
     * _dx_parse($sourcecall, $info, $rethash)
     *
     * Parses the body of a DX spot packet. Returns the following
     * hash elements: dxsource (source of the info), dxfreq (frequency),
     * dxcall (DX callsign) and dxinfo (info string).
     *
    private _dx_parse($sourcecall: string, $info: string, $rethash: aprsPacket): aprsPacket {
        if(!this.checkAX25Call($sourcecall)) {
            return this.addError($rethash, 'dx_inv_src', $sourcecall);
        }

        $rethash['dxsource'] = $sourcecall;

        $info = $info.replace(/^\s*(.*?)\s*$/, $1); // strip whitespace

        if(($info = $info.match(/\s*(\d{3,4}Z/))) {
            $rethash['dxtime'] = $info[1];
        }

        if(!($info = $info.match(/^(\d+\.\d+)\s* /))) {
            this.addError($rethash, 'dx_inv_freq')  //); // TODO: remove space between * and /
            return 0;
        }

        $rethash['dxfreq'] = $info[1];

        if(!($info = $info.match(/^([a-zA-Z0-9-\/]+)\s* /))) {
            this.addError($rethash, 'dx_no_dx'); // TODO: remove space between * and /
            return 0;
        }

        $rethash['dxcall'] = $info[1];

        $info = $info.match(/\s+/ /g);
        $rethash['dxinfo'] = $info;

        return 1;

        return $rethash;
    }
    */

    /**
     * _wx_parse($s, $rethash)
     *
     * Parses a normal uncompressed weather report packet.
     */
    private parseWeather(data: string, retVal: AprsPacket): AprsPacket {
        // 257/007g013t055r000P000p000h56b10160v31
        // 045/000t064r000p000h35b10203.open2300v1.10
        // 175/007g007p...P000r000t062h32b10224wRSW
        let wx = new Weather();
        let windDir;
        let windSpeed;
        let temp;
        let windGust;
        let tmp;

        if((tmp = data.match(/^_{0,1}([\d \.\-]{3})\/([\d \.]{3})g([\d \.]+)t(-{0,1}[\d \.]+)/))
                || (tmp = data.match(/^_{0,1}c([\d \.\-]{3})s([\d \.]{3})g([\d \.]+)t(-{0,1}[\d \.]+)/))) {
            // TODO: warn "wind $1 / $2 gust $3 temp $4\n";
            windDir = tmp[1];
            windSpeed = tmp[2];
            windGust = tmp[3];

            if(tmp[0]) {
                data = data.replace(tmp[0], '');
            }

            temp = tmp[4];
        } else if((tmp = data.match(/^_{0,1}([\d \.\-]{3})\/([\d \.]{3})t(-{0,1}[\d \.]+)/))) {
            // TODO: warn "$initial\nwind $1 / $2 temp $3\n";
            windDir = tmp[1];
            windSpeed = tmp[2];

            if(tmp[0]) {
                data = data.replace(tmp[0], '');
            }

            temp = tmp[3];
        } else if((tmp = data.match(/^_{0,1}([\d \.\-]{3})\/([\d \.]{3})g([\d \.]+)/))) {
            // TODO: warn "$initial\nwind $1 / $2 gust $3\n";
            windDir = tmp[1];
            windSpeed = tmp[2];
            windGust = tmp[3];

            if(tmp[0]) {
                data = data.replace(tmp[0], '');
            }
        } else if((tmp = data.match(/^g([\d .]+)t(-{0,1}[\d \.]+)/))) {
            // g000t054r000p010P010h65b10073WS 2300 {UIV32N}
            windGust = tmp[1];

            if(tmp[0]) {
                data = data.replace(tmp[0], '');
            }

            temp = tmp[2];
        } else {
            // TODO: warn "wx_parse: no initial match: $s\n";
            return retVal;
        }

        if(!temp) {
            data = data.replace(/t(-{0,1}\d{1,3})/, function(a, b) {
                if(b) {
                    temp = b;
                }

                return '';
            });
        }

        if(/^\d+$/.test(windGust)) {
            wx.wind_gust = (parseFloat(windGust) * ConversionConstantEnum.MPH_TO_MS).toFixed(1);
        }

        if(/^\d+$/.test(windDir)) {
            wx.wind_direction = parseFloat(windDir).toFixed(0);
        }

        if(/^\d+$/.test(windSpeed)) {
            wx.wind_speed = (parseFloat(windSpeed) * ConversionConstantEnum.MPH_TO_MS).toFixed(1);
        }

        if(/^-{0,1}\d+$/.test(temp)) {
            wx.temp = ConversionUtil.FahrenheitToCelsius(parseInt(temp)).toFixed(1) ;
        }

        data = data.replace(/r(\d{1,3})/, function($a, b) {
            if(b) {
                wx.rain_1h = (parseFloat(b) * ConversionConstantEnum.HINCH_TO_MM).toFixed(1); // during last 1h
            }

            return '';
        });

        data = data.replace(/p(\d{1,3})/, function(a, b) {
            if(b) {
                wx.rain_24h = (parseFloat(b) * ConversionConstantEnum.HINCH_TO_MM).toFixed(1); // during last 24h
            }

            return '';
        });

        data = data.replace(/P(\d{1,3})/, function(a, b) {
            if(b) {
                wx.rain_midnight = (parseFloat(b) * ConversionConstantEnum.HINCH_TO_MM).toFixed(1); // since midnight
            }

            return '';
        });

        data = data.replace(/h(\d{1,3})/, function(a, b) {
            if(b) {
                wx.humidity = parseInt(b); // percentage

                if(wx.humidity == 0) {
                    wx.humidity = 100;
                }

                if(wx.humidity > 100 || wx.humidity < 1) {
                    wx.humidity = null;
                }
            }

            return '';
        });

        data = data.replace(/b(\d{4,5})/, function(a, b) {
            if(b) {
                wx.pressure = (b / 10).toFixed(1); // results in millibars
            }

            return '';
        });

        data = data.replace(/([lL])(\d{1,3})/, function(a, b, c) {
            if(c) {
                wx.luminosity = parseFloat(c).toFixed(0); // watts / m2
            }

            if(b && b == 'l') {
                wx.luminosity += 1000;
            }

            return '';
        });

        /*
        if ($s =~ s/v([\-\+]{0,1}\d+)//) {
            # what ?
        }
        */

        data = data.replace(/s(\d{1,3})/, function(a, b) {
            // snowfall
            if(b) {
                wx.snow_24h = (b * ConversionConstantEnum.HINCH_TO_MM).toFixed(1);
            }

            return '';
        });

        /*
        if ($s =~ s/#(\d+)//) {
            # raw rain counter
        }
        */

        tmp = data.match(/^([rPphblLs#][\. ]{1,5})+/);

        //$s =~ s/^\s+//;
        //$s =~ s/\s+/ /;

        if(/^[a-zA-Z0-9\-_]{3,5}$/.test(data)) {
            if(data != '') {
                wx.soft = data.substring(0, 16);
            }
        } else {
            retVal.comment = data.trim();
        }

        if(wx.temp || (wx.wind_speed && wx.wind_direction)) {
            // warn "ok: $initial\n$s\n";
            retVal.weather = wx;
        }

        return retVal;
    }

    /**
     * weatherParsePeetPacket($s, $sourcecall, $rethash)
     *
     * Parses a Peet bros Ultimeter weather packet ($ULTW header).
     */
    private weatherParsePeetPacket(data: string, rethash: AprsPacket): AprsPacket {
        // warn "\$ULTW: $s\n";
        // 0000000001FF000427C70002CCD30001026E003A050F00040000
        let wx = new Weather();
        let tmp;
        let vals: number[] = [];

        while(/^([0-9a-f]{4}|----)/i.test(data)) {
            data = data.replace(/^([0-9a-f]{4}|----)/i, function(a, b) {
                if(b == '----') {
                    vals.push(null);
                } else {
                    // Signed 16-bit integers in network (big-endian) order
                    // encoded in hex, high nybble first.
                    // Perl 5.10 unpack supports n! for signed ints, 5.8
                    // requires tricks like this:
                    let v = 0; //= unpack('n', pack('H*', $1));

                    for(var i = 0; i < 4; i++) {
                        var c = b.charAt(i);

                        v += parseInt(c, 16) << 12 - (4 * i); // 12 = 16(bits) - 4  shortcut to reduce mathmatical operations
                    }

                    if(v >= 32768) {
                        v = v - 65536;
                    }

                    vals.push(v);
                }

                return '';
            });
        }

        if(!vals || vals.length == 0) {
            return null;
        }

        tmp = vals.shift();
        if(tmp != null) {
            wx.wind_gust = (tmp * ConversionConstantEnum.KMH_TO_MS / 10).toFixed(1);
        }

        tmp = vals.shift();
        if(tmp != null) {
            wx.wind_direction = ((tmp & 0xff) * 1.41176).toFixed(0);  // 1/255 => 1/360
        }

        tmp = vals.shift();
        if(tmp != null) {
            wx.temp = ConversionUtil.FahrenheitToCelsius(tmp / 10).toFixed(1);   // 1/255 => 1/360
        }

        tmp = vals.shift();
        if(tmp != null) {
            wx.rain_midnight = (tmp * ConversionConstantEnum.HINCH_TO_MM).toFixed(1);
        }

        tmp = vals.shift();
        if(tmp && tmp >= 10) {
            wx.pressure = (tmp / 10).toFixed(1);
        }

        // Do we care about these?
        vals.shift(); // Barometer Delta
        vals.shift(); // Barometer Corr. Factor (LSW)
        vals.shift(); // Barometer Corr. Factor (MSW)

        tmp = vals.shift();
        if(tmp) {
            wx.humidity = Math.floor(tmp / 10);    // .toFixed(0) percentage

            if(wx.humidity > 100 || wx.humidity < 1) {
                delete wx.humidity;
            }
        }

        // Do we care about these?
        vals.shift(); // date
        vals.shift(); // time

        tmp = vals.shift();
        if(tmp) {
            wx.rain_midnight = (tmp * ConversionConstantEnum.HINCH_TO_MM).toFixed(1);
        }

        tmp = vals.shift();
        if(tmp) {
            wx.wind_speed = (tmp * ConversionConstantEnum.KMH_TO_MS / 10).toFixed(1);
        }

        if(wx.temp
                || (wx.wind_speed && wx.wind_direction)
                || wx.pressure
                || wx.humidity
                ) {
            rethash.weather = wx;

            //return $rethash;
        }

        //return 0;
        return rethash; // do we need to notify somehow the parsing failed?
    }

    /**
     * _wx_parse_peet_logging($s, $sourcecall, $rethash)
     *
     * Parses a Peet bros Ultimeter weather logging frame (!! header).
     */
    private parseWeatherPeetLogging(data: string, retVal: AprsPacket): AprsPacket {
        // warn "\!!: $s\n";
        // 0000000001FF000427C70002CCD30001026E003A050F00040000
        let wx = new Weather();
        let tmp;
        let vals: number[] = [];

        while(/^([0-9a-f]{4}|----)/i.test(data)) {
            data = data.replace(/^([0-9a-f]{4}|----)/i, function(a, b) {
                if(b == '----') {
                    vals.push(null);
                } else {
                    // Signed 16-bit integers in network (big-endian) order
                    // encoded in hex, high nybble first.
                    // Perl 5.10 unpack supports n! for signed ints, 5.8
                    // requires tricks like this:
                    let v = 0; //= unpack('n', pack('H*', $1));

                    for(var i = 0; i < 4; i++) {
                        var c = b.charAt(i);

                        v += parseInt(c, 16) << 12 - (4 * i); // 12 = 16(bits) - 4  shortcut to reduce mathmatical operations
                    }

                    if(v >= 32768) {
                        v = v - 65536;
                    }

                    vals.push(v);
                }

                return '';
            });
        }

        if(!vals || vals.length == 0) {
            return retVal; // TODO: do we need to signal an error?
        }

        //0000 0066 013D 0000 2871 0166 ---- ---- 0158 0532 0120 0210

        tmp = vals.shift(); // instant wind speed
        if(tmp != null) {
            wx.wind_speed = (tmp * ConversionConstantEnum.KMH_TO_MS / 10).toFixed(1);
        }

        tmp = vals.shift();
        if(tmp != null) {
            wx.wind_direction = ((tmp & 0xff) * 1.41176).toFixed(0); // 1/255 => 1/360
        }

        tmp = vals.shift();
        if(tmp) {
            wx.temp = ConversionUtil.FahrenheitToCelsius(tmp / 10).toFixed(1); // 1/255 => 1/360
        }

        tmp = vals.shift();
        if(tmp) {
            wx.rain_midnight = (tmp * ConversionConstantEnum.HINCH_TO_MM).toFixed(1);
        }

        tmp = vals.shift();
        if(tmp && tmp >= 10) {
            wx.pressure = (tmp / 10).toFixed(1);
        }

        tmp = vals.shift();
        if(tmp) {
            wx.temp_in = parseFloat(ConversionUtil.FahrenheitToCelsius(tmp / 10).toFixed(1));   // 1/255 => 1/360
        }

        tmp = vals.shift();
        if(tmp) {
            wx.humidity = Math.floor(tmp / 10);    // .toFixed(0) percentage

            if(wx.humidity > 100 || wx.humidity < 1) {
                delete wx.humidity;
            }
        }

        tmp = vals.shift();
        if(tmp) {
            wx.humidity_in = Math.floor(tmp / 10); // .toFixed(0) percentage

            if(wx.humidity > 100 || wx.humidity < 1) {
                delete wx.humidity_in;
            }
        }

        vals.shift(); // date
        vals.shift(); // time

        tmp = vals.shift();
        if(tmp) {
            wx.rain_midnight = (tmp * ConversionConstantEnum.HINCH_TO_MM).toFixed(1);
        }

        // avg wind speed
        tmp = vals.shift();
        if(tmp) {
            wx.wind_speed = (tmp * ConversionConstantEnum.KMH_TO_MS / 10).toFixed(1);
        }

        // if inside temperature exists but no outside, use inside
        if(wx.temp_in && !wx.temp) {
            wx.temp = wx.temp_in.toString();
        }

        if(wx.humidity_in && !wx.humidity) {
            wx.humidity = wx.humidity_in;
        }

        if(wx.temp || wx.pressure || wx.humidity
                || (wx.wind_speed && wx.wind_direction)) {
            retVal.weather = wx;

            //return 1;
        }

        return retVal; // this originally returned 0, TODO: signal error?
    }

    /**
     * _telemetry_parse($s, $rethash)
     *
     * Parses a telemetry packet.
     */
    private parseTelemetry(data: string, retVal: AprsPacket): AprsPacket {
        // warn "did match\n";
		let t: Telemetry = new Telemetry()
        let tmp: string[]

        if((tmp = data.match(/^(\d+),([\-\d\,\.]+)/))) {
            t.seq = parseInt(tmp[0])

            //let $vals: string[] = [ (tmp[2] + tmp[3]), (tmp[4] + tmp[5]), (tmp[6] + tmp[7])
            //        , (tmp[8] + tmp[9]), (tmp[10] + tmp[11]) ];
            let vals: string[] = tmp[2].split(',')
            let vout: number[] = []

            for(let i = 0; i <= 4; i++) {
                let v: number

                if(i < vals.length && vals[i] != null && vals[i] != undefined && vals[i] != '') {
                    if(vals[i].match(/^-{0,1}(\d+|\d*\.\d+)$/)) {
                        v = parseFloat(vals[i])

                        // NOTE: http://blog.aprs.fi/2020/03/aprsfi-supports-kenneths-proposed.html
                        if(parseFloat(vals[i]) < -2147483648 || parseFloat(vals[i]) > 2147483647) {
                            return this.addError(retVal, 'tlm_large')
                        }
                    } else {
                        // TODO: Can this scenario even happen?  The parent if statement should prevent this from happening.
                        return this.addError(retVal, 'tlm_inv')
                    }
                }

                vout.push(v)
            }

            t.vals = vout

            // TODO: validate bits
            if(vals[5] && vals[5] != '') {
                t.bits = vals[5]

                // expand bits to 8 bits if some are missing
                if(t.bits.length < 8) {
                    t.bits = t.bits.padEnd(8, '0')
                }
                // TODO: What happens if there's more than 8 bits?
            }
        } else {
            return this.addError(retVal, 'tlm_inv');
        }

        retVal.telemetry = t;

        //warn 'ok: ' . Dumper(\%t);
        return retVal;
    }
}
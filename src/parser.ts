import aprsPacket from './aprsPacket';
import digipeater from './digipeater';
import telemetry from './telemetry';
import wx from './wx';

// conversion constants
const KNOT_TO_KMH = 1.852;   // nautical miles per hour to kilometers per hour
const MPH_TO_KMH = 1.609344; // miles per hour to kilometers per hour
const KMH_TO_MS = 10 / 36;   // kilometers per hour to meters per second
const MPH_TO_MS = MPH_TO_KMH * KMH_TO_MS;  // miles per hour to meters per second
const HINCH_TO_MM = 0.254;   // hundredths of an inch to millimeters

const RESULT_MESSAGES: any = {
    'unknown': 'Unsupported packet format'
    , 'packet_no': 'No packet given to parse'
    , 'packet_short': 'Too short packet'
    , 'packet_nobody': 'No body in packet'
    , 'srccall_noax25': 'Source callsign is not a valid AX.25 call'
    , 'srccall_badchars': 'Source callsign contains bad characters'
    , 'dstpath_toomany': 'Too many destination path components to be AX.25'
    , 'dstcall_none': 'No destination field in packet'
    , 'dstcall_noax25': 'Destination callsign is not a valid AX.25 call'
    , 'digicall_noax25': 'Digipeater callsign is not a valid AX.25 call'
    , 'digicall_badchars': 'Digipeater callsign contains bad characters'
    , 'timestamp_inv_loc': 'Invalid timestamp in location'
    , 'timestamp_inv_obj': 'Invalid timestamp in object'
    , 'timestamp_inv_sta': 'Invalid timestamp in status'
    , 'timestamp_inv_gpgga': 'Invalid timestamp in GPGGA sentence'
    , 'timestamp_inv_gpgll': 'Invalid timestamp in GPGLL sentence'
    , 'packet_invalid': 'Invalid packet'
    , 'nmea_inv_cval': 'Invalid coordinate value in NMEA sentence'
    , 'nmea_large_ew': 'Too large value in NMEA sentence (east/west)'
    , 'nmea_large_ns': 'Too large value in NMEA sentence (north/south)'
    , 'nmea_inv_sign': 'Invalid lat/long sign in NMEA sentence'
    , 'nmea_inv_cksum': 'Invalid checksum in NMEA sentence'
    , 'gprmc_fewfields': 'Less than ten fields in GPRMC sentence '
    , 'gprmc_nofix': 'No GPS fix in GPRMC sentence'
    , 'gprmc_inv_time': 'Invalid timestamp in GPRMC sentence'
    , 'gprmc_inv_date': 'Invalid date in GPRMC sentence'
    , 'gprmc_date_out': 'GPRMC date does not fit in an Unix timestamp'
    , 'gpgga_fewfields': 'Less than 11 fields in GPGGA sentence'
    , 'gpgga_nofix': 'No GPS fix in GPGGA sentence'
    , 'gpgll_fewfields': 'Less than 5 fields in GPGLL sentence'
    , 'gpgll_nofix': 'No GPS fix in GPGLL sentence'
    , 'nmea_unsupp': 'Unsupported NMEA sentence type'
    , 'obj_short': 'Too short object'
    , 'obj_inv': 'Invalid object'
    , 'obj_dec_err': 'Error in object location decoding'
    , 'item_short': 'Too short item'
    , 'item_inv': 'Invalid item'
    , 'item_dec_err': 'Error in item location decoding'
    , 'loc_short': 'Too short uncompressed location'
    , 'loc_inv': 'Invalid uncompressed location'
    , 'loc_large': 'Degree value too large'
    , 'loc_amb_inv': 'Invalid position ambiguity'
    , 'mice_short': 'Too short mic-e packet'
    , 'mice_inv': 'Invalid characters in mic-e packet'
    , 'mice_inv_info': 'Invalid characters in mic-e information field'
    , 'mice_amb_large': 'Too much position ambiguity in mic-e packet'
    , 'mice_amb_inv': 'Invalid position ambiguity in mic-e packet'
    , 'mice_amb_odd': 'Odd position ambiguity in mic-e packet'
    , 'comp_inv': 'Invalid compressed packet'
    , 'msg_inv': 'Invalid message packet'
    , 'wx_unsupp': 'Unsupported weather format'
    , 'user_unsupp': 'Unsupported user format'
    , 'dx_inv_src': 'Invalid DX spot source callsign'
    , 'dx_inf_freq': 'Invalid DX spot frequency'
    , 'dx_no_dx': 'No DX spot callsign found'
    , 'tlm_inv': 'Invalid telemetry packet'
    , 'tlm_large': 'Too large telemetry value'
    , 'tlm_unsupp': 'Unsupported telemetry'
    , 'exp_unsupp': 'Unsupported experimental'
    , 'sym_inv_table': 'Invalid symbol table or overlay'
};

/**
 * message bit types for mic-e
 * from left to right, bits a, b and c
 * standard one bit is 1, custom one bit is 2
 */
const MICE_MESSAGE_TYPES = {
    '111': 'off duty'
    , '222': 'custom 0'
    , '110': 'en route'
    , '220': 'custom 1'
    , '101': 'in service'
    , '202': 'custom 2'
    , '100': 'returning'
    , '200': 'custom 3'
    , '011': 'committed'
    , '022': 'custom 4'
    , '010': 'special'
    , '020': 'custom 5'
    , '001': 'priority'
    , '002': 'custom 6'
    , '000': 'emergency'
};

/**
 * A list of mappings from GPSxyz (or SPCxyz)
 * to APRS symbols. Overlay characters (z) are
 * not handled here
 */
const DST_SYMBOLS = {
    'BB': '/!', 'BC': '/"', 'BD': '/#',  'BE': '/$', 'BF': '/%', 'BG': '/&', 'BH': '/\'', 'BI': '/(!'
    , 'BJ': '/)', 'BK': '/*', 'BL': '/+',  'BM': '/,)' , 'BN': '/-', 'BO': '/.', 'BP': '//'
    , 'P0': '/0', 'P1': '/1', 'P2': '/2', 'P3': '/3'
    , 'P4': '/4', 'P5': '/5', 'P6': '/6', 'P7': '/7'
    , 'P8': '/8', 'P9': '/9'
    , 'MR': '/:', 'MS': '/;', 'MT': '/<', 'MU': '/='
    , 'MV': '/>', 'MW': '/?', 'MX': '/@'
    , 'PA': '/A', 'PB': '/B', 'PC': '/C', 'PD': '/D'
    , 'PE': '/E', 'PF': '/F', 'PG': '/G', 'PH': '/H'
    , 'PI': '/I', 'PJ': '/J', 'PK': '/K', 'PL': '/L'
    , 'PM': '/M', 'PN': '/N', 'PO': '/O', 'PP': '/P'
    , 'PQ': '/Q', 'PR': '/R', 'PS': '/S', 'PT': '/T'
    , 'PU': '/U', 'PV': '/V', 'PW': '/W', 'PX': '/X'
    , 'PY': '/Y', 'PZ': '/Z'
    , 'HS': '/[', 'HT': '/\\', 'HU': '/]', 'HV': '/^'
    , 'HW': '/_', 'HX': '/`'
    , 'LA': '/a', 'LB': '/b', 'LC': '/c', 'LD': '/d'
    , 'LE': '/e', 'LF': '/f', 'LG': '/g', 'LH': '/h'
    , 'LI': '/i', 'LJ': '/j', 'LK': '/k', 'LL': '/l'
    , 'LM': '/m', 'LN': '/n', 'LO': '/o', 'LP': '/p'
    , 'LQ': '/q', 'LR': '/r', 'LS': '/s', 'LT': '/t'
    , 'LU': '/u', 'LV': '/v', 'LW': '/w', 'LX': '/x'
    , 'LY': '/y', 'LZ': '/z'
    , 'J1': '/{', 'J2': '/|', 'J3': '/}', 'J4': '/~'
    , 'OB': '\\!', 'OC': '\\"', 'OD': '\\#', 'OE': '\\$'
    , 'OF': '\\%', 'OG': '\\&', 'OH': '\\\'', 'OI': '\\('
    , 'OJ': '\\)', 'OK': '\\*', 'OL': '\\+', 'OM': '\\,'
    , 'ON': '\\-', 'OO': '\\.', 'OP': '\\/'
    , 'A0': '\\0', 'A1': '\\1', 'A2': '\\2', 'A3': '\\3'
    , 'A4': '\\4', 'A5': '\\5', 'A6': '\\6', 'A7': '\\7'
    , 'A8': '\\8', 'A9': '\\9'
    , 'NR': '\\:', 'NS': '\\;', 'NT': '\\<', 'NU': '\\='
    , 'NV': '\\>', 'NW': '\\?', 'NX': '\\@'
    , 'AA': '\\A', 'AB': '\\B', 'AC': '\\C', 'AD': '\\D'
    , 'AE': '\\E', 'AF': '\\F', 'AG': '\\G', 'AH': '\\H'
    , 'AI': '\\I', 'AJ': '\\J', 'AK': '\\K', 'AL': '\\L'
    , 'AM': '\\M', 'AN': '\\N', 'AO': '\\O', 'AP': '\\P'
    , 'AQ': '\\Q', 'AR': '\\R', 'AS': '\\S', 'AT': '\\T'
    , 'AU': '\\U', 'AV': '\\V', 'AW': '\\W', 'AX': '\\X'
    , 'AY': '\\Y', 'AZ': '\\Z'
    , 'DS': '\\[', 'DT': '\\\\', 'DU': '\\]', 'DV': '\\^'
    , 'DW': '\\_', 'DX': '\\`'
    , 'SA': '\\a', 'SB': '\\b', 'SC': '\\c', 'SD': '\\d'
    , 'SE': '\\e', 'SF': '\\f', 'SG': '\\g', 'SH': '\\h'
    , 'SI': '\\i', 'SJ': '\\j', 'SK': '\\k', 'SL': '\\l'
    , 'SM': '\\m', 'SN': '\\n', 'SO': '\\o', 'SP': '\\p'
    , 'SQ': '\\q', 'SR': '\\r', 'SS': '\\s', 'ST': '\\t'
    , 'SU': '\\u', 'SV': '\\v', 'SW': '\\w', 'SX': '\\x'
    , 'SY': '\\y', 'SZ': '\\z'
    , 'Q1': '\\{', 'Q2': '\\|', 'Q3': '\\}', 'Q4': '\\~'
};

export default class aprsParser {
    constructor() {

    }

    /**
     * Used to add error messages to a packet.
     *
     * @param {json} $rethash Parsed values from packet.
     * @param {string} $errcode Error code, this should be able to be found in the result_messages object/map.
     * @param {string} $val Value that caused the error.
     * @return {void}
     */
    addError = function(packet: aprsPacket, errorCode: string, value?: string): aprsPacket {
        packet.resultCode = errorCode;

        packet.resultMessage = ((RESULT_MESSAGES[errorCode]) ? RESULT_MESSAGES[errorCode] : errorCode)
                + ((value !== undefined && value) ? value : value);

        return packet;
    }

    /**
     * Used to add warning messages to a packet.
     *
     * @param {json} $rethash Parsed values from packet.
     * @param {string} $errcode Error code, this should be able to be found in the result_messages object/map.
     * @param {string} $val Value that caused the warning.
     * @return {void}
     */
    addWarning = function(packet: aprsPacket, errorCode: string, value?: string): aprsPacket {
        if(packet.warningCodes == undefined || !packet.warningCodes) {
            packet.warningCodes = [];
        }

        packet.warningCodes.push(errorCode);

        packet.resultMessage = ((RESULT_MESSAGES[errorCode] !== undefined && RESULT_MESSAGES[errorCode]) ? RESULT_MESSAGES[errorCode] : errorCode)
                + ((value !== undefined && value) ? `: ${value}` : '');

        return packet;
    }

    // Utility Functions
    degToRad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    radToDeg(rad: number): number {
        return rad * (180 / Math.PI);
    }

    /**
     * Converts Degrees Fahrenheit to Celsius
     * @param {number} degF Degrees in Fahrenheit
     * @returns {number} Degrees in Celsius
     */
    fahrenheitToCelsius(degF: number): number {
        return (degF - 32) / 1.8;
    }

    /**
     * Utility method to replace perl's Date-Calc check_date method.
     * Given the year, month, and day, this checks to see if it it's a valid date.
     *
     * @param {Number} year year for the date
     * @param {Number} month month for the date
     * @param {Number} day day for the date
     * @returns {boolean} Whether or not the given date is valid
     */
    checkDate = function (year: number, month: number, day: number): boolean {
        var d = new Date(year, month, day);

        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    }

    /**
     * =item checkAX25Call()
     * Check the callsign for a valid AX.25 callsign format and
     * return cleaned up (OH2XYZ-0) callsign or undef if the callsign
     * is not a valid AX.25 address.
     * Please note that it's very common to use invalid callsigns on the APRS-IS.
     */
    checkAX25Call(callsign: string) {
        let tempCallsign: string[];

        if((tempCallsign = callsign.match(/^([A-Z0-9]{1,6})(-\d{1,2}|)$/))) {
            if(!tempCallsign[2]) {
                return tempCallsign[1];
            } else {
                // convert SSID to positive and numeric
                let $ssid = 0 - parseInt(tempCallsign[2]);

                if($ssid < 16) {
                    // 15 is maximum in AX.25
                    return tempCallsign[1] + '-' + $ssid;
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
     * my $ret = parseaprs("OH2XYZ>APRS,RELAY*,WIDE:!2345.56N/12345.67E-PHG0123 hi",
     * \%hash, 'isax25' => 0, 'accept_broken_mice' => 0);
     */
    parseaprs = function(packet: string, options?: any) {
        let retVal: aprsPacket = new aprsPacket();
        let $isax25 = (options && options['isax25'] != undefined) ? options['isax25'] : false;

        if(!packet) {
            return this.addError(retVal, 'packet_no');;
        }

        if(packet.length < 1) {
            return this.addError(retVal, 'packet_short');
        }

        // Separate the header and packet body on the first colon.
        let [ header, body ] = packet.split(/:(.*)/);

        // If no body, skip
        if(!body) {
            return this.addError(retVal, 'packet_nobody');
        }

        // Save all the parts of the packet
        retVal.origpacket = packet;
        retVal.header = header;
        retVal.body = body;

        // Source callsign, put the rest in $rest
        let srcCallsign;
        let rest;
        let $header;

        if(($header = header.match(/^([A-Z0-9-]{1,9})>(.*)$/i))) {
            rest = $header[2];

            if($isax25 == false) {
                srcCallsign = $header[1];
            } else {
                srcCallsign = this.checkAX25Call($header[1].toUpperCase());

                if(!srcCallsign) {
                    this.addError(retVal, 'srccall_noax25');
                    return retVal;
                }
            }
        } else {
            // can't be a valid amateur radio callsign, even
            // in the extended sense of APRS-IS callsigns
            this.addError(retVal, 'srccall_badchars');
            return retVal;
        }

        retVal.sourceCallsign = srcCallsign;

        // Get the destination callsign and digipeaters.
        // Only TNC-2 format is supported, AEA (with digipeaters) is not.
        let $pathcomponents = rest.split(',');

        // More than 9 (dst callsign + 8 digipeaters) path components
        // from AX.25 or less than 1 from anywhere is invalid.
        if($isax25 == true) {
            if($pathcomponents.length > 9) {
                // too many fields to be from AX.25
                this.addError(retVal, 'dstpath_toomany');
                return retVal;
            }
        }

        if($pathcomponents.length < 1) {
            // no destination field
            this.addError(retVal, 'dstcall_none');
            return retVal;
        }


        // Destination callsign. We are strict here, there
        // should be no need to use a non-AX.25 compatible
        //# destination callsigns in the APRS-IS.
        let $dstcallsign = this.checkAX25Call($pathcomponents.shift());

        if(!$dstcallsign) {
            this.addError(retVal, 'dstcall_noax25');
            return retVal;
        }

        retVal.destCallsign = $dstcallsign;

        // digipeaters
        let $digipeaters = [];

        if($isax25 == true) {
            for(let $digi of $pathcomponents) {
                let $d;
                if(($d = $digi.match(/^([A-Z0-9-]+)(\*|)$/i))) {
                    let $digitested = this.checkAX25Call($d[1].toUpperCase());

                    if(!$digitested) {
                        this.addError(retVal, 'digicall_noax25');
                        return retVal;
                    }

                    // add it to the digipeater array
                    $digipeaters.push(new digipeater(
                        $digitested
                        , ($d[2] == '*')
                    ));
                } else {
                    this.addError(retVal, 'digicall_badchars');
                    return retVal;
                }
            }
        } else {
            let $seen_qconstr = false;
            let tmp = null;

            for(let $digi of $pathcomponents) {
                // From the internet. Apply the same checks as for
                // APRS-IS packet originator. Allow long hexadecimal IPv6
                // address after the Q construct.
                if((tmp = $digi.match(/^([A-Z0-9a-z-]{1,9})(\*|)$/))) {
                    $digipeaters.push(new digipeater(tmp[1], (tmp[2] == '*')));

                    $seen_qconstr = /^q..$/.test(tmp[1]) || $seen_qconstr; // if it's already true, don't reset it to false.
                } else {
                    //if ($seen_qconstr && $digi =~ /^([0-9A-F]{32})$/) { // This doesn't even make sense.  Unless perl does something special
                    // this condition should never be true.  Lets remove the first condition for fun.
                    if($seen_qconstr == true && (tmp = $digi.match(/^([0-9A-F]{32})$/))) {
                        $digipeaters.push(new digipeater(tmp[1], false));
                    } else {
                        this.addError(retVal, 'digicall_badchars');

                        return retVal;
                    }
                }
            }
        }

        retVal.digipeaters = $digipeaters;

        // So now we have source and destination callsigns and
        // digipeaters parsed and ok. Move on to the body.

        // Check the first character of the packet
        // and determine the packet type
        //let $retval = -1;
        let $packettype = body.charAt(0);
        let $paclen = body.length;

        // Check the packet type and proceed depending on it
        // Mic-encoder packet
        if($packettype == '\'' || $packettype == '`') {
            // the following are obsolete mic-e types: 0x1c 0x1d
            // mic-encoder data
            // minimum body length 9 chars
            if($paclen >= 9) {
                retVal.type = 'location';

                retVal = this._mice_to_decimal(body.substr(1), $dstcallsign, srcCallsign, retVal, options);
                //return $rethash;
            }
        // Normal or compressed location packet, with or without
        // timestamp, with or without messaging capability
        } else if($packettype == '!' || $packettype == '=' ||
                $packettype == '/' || $packettype == '@') {
            // with or without messaging
            retVal.messaging = !($packettype == '!' || $packettype == '/');

            if($paclen >= 14) {
                retVal.type = 'location';

                if($packettype == '/' || $packettype == '@') {
                    // With a prepended timestamp, check it and jump over.
                    // If the timestamp is invalid, it will be set to zero.
                    retVal.timestamp = this.parseTimestamp(options, body.substr(1, 7));

                    /* TODO: DO WE NEED THIS?
                    if($rethash['timestamp'] == false) {
                        addWarning($rethash, 'timestamp_inv_loc');
                    }
                    */

                    body = body.substr(7);
                }

                // remove the first character
                body = body.substr(1);

                // grab the ascii value of the first byte of body
                let $poschar = body.charCodeAt(0);

                if($poschar >= 48 && $poschar <= 57) {
                    // poschar is a digit... normal uncompressed position
                    if(body.length >= 19) {
                        retVal = this._normalpos_to_decimal(body, srcCallsign, retVal);

                        // continue parsing with possible comments, but only
                        // if this is not a weather report (course/speed mixup,
                        // weather as comment)
                        // if the comments don't parse, don't raise an error
                        if((retVal.resultCode === undefined && !retVal.resultCode)  && retVal.symbolcode != '_') {
                            retVal = this._comments_to_decimal(body.substr(19), srcCallsign, retVal);
                        } else {
                            // warn "maybe a weather report?\n" . substr($body, 19) . "\n";
                            retVal = this._wx_parse(body.substr(19), retVal);
                        }
                    }
                } else if($poschar == 47 || $poschar == 92
                        || ($poschar >= 65 && $poschar <= 90)
                        || ($poschar >= 97 && $poschar <= 106)) {
                    // compressed position
                    if(body.length >= 13) {
                        retVal = this._compressed_to_decimal(body.substr(0, 13), srcCallsign, retVal);

                        // continue parsing with possible comments, but only
                        // if this is not a weather report (course/speed mixup,
                        // weather as comment)
                        // if the comments don't parse, don't raise an error
                        if((retVal.resultCode === undefined && !retVal.resultCode) && retVal.symbolcode != '_') {
                            this._comments_to_decimal(body.substr(13), srcCallsign, retVal);
                        } else {
                            // warn "maybe a weather report?\n" . substr($body, 13) . "\n";
                            this._wx_parse(body.substr(13), retVal);
                        }
                    } else {
                        this.addError(retVal, 'packet_invalid', 'Body is too short.');
                    }
                } else if($poschar == 33) { // '!'
                    // Weather report from Ultimeter 2000
                    retVal.type = 'wx';

                    this._wx_parse_peet_logging(body.substr(1), srcCallsign, retVal);
                } else {
                    this.addError(retVal, 'packet_invalid');
                }
            } else {
                return this.addError(retVal, 'packet_short', 'location');
            }
        // Weather report
        } else if($packettype == '_') {
            if(/_(\d{8})c[\- \.\d]{1,3}s[\- \.\d]{1,3}/.test(body)) {
                retVal.type = 'wx';

                retVal = this._wx_parse(body.substr(9), retVal);
            } else {
                return this.addError(retVal, 'wx_unsupp', 'Positionless');
            }
        // Object
        } else if($packettype == ';') {
            if($paclen >= 31) {
                retVal.type = 'object';

                this.objectToDecimal(options, body, srcCallsign, retVal);
            }
        // NMEA data
        } else if($packettype == '$') {
            /*
            // don't try to parse the weather stations, require "$GP" start
            if($body.substr(0, 3) == '$GP') {
                // dstcallsign can contain the APRS symbol to use,
                // so read that one too
                $rethash.type = 'location';

                this._nmea_to_decimal($options, $body.substr(1), $srccallsign, $dstcallsign, $rethash);
            } else if($body.substr(0, 5) == '$ULTW') {
                $rethash.type = 'wx';

                this._wx_parse_peet_packet($body.substr(5), $srccallsign, $rethash);
            }
            */
        // Item
        } else if($packettype == ')') {
            if($paclen >= 18) {
                retVal.type = 'item';
                retVal = this._item_to_decimal(body, srcCallsign, retVal);
            }
        // Message, bulletin or an announcement
        } else if($packettype === ':') {
            if($paclen >= 11) {
                // all are labeled as messages for the time being
                retVal.type = 'message';

                retVal = this.messageParse(body, retVal);
            }

        // Station capabilities
        } else if($packettype == '<') {
            /*
            // at least one other character besides '<' required
            if($paclen >= 2) {
                $rethash.type = 'capabilities';

                return this._capabilities_parse($body.substr(1), $srccallsign, $rethash);
            }
            */
        // Status reports
        } else if($packettype == '>') {
            // we can live with empty status reports
            if($paclen >= 1) {
                retVal.type = 'status';

                retVal = this._status_parse(options, body.substr(1), srcCallsign, retVal)
            }
        // Telemetry
        } else if(/^T#(.*?),(.*)$/.test(body)) {
            /*
            $rethash.type = 'telemetry';

            this._telemetry_parse($body.substr(2), $rethash);
            */
        // DX spot
        } else if(/^DX\s+de\s+(.*?)\s*[:>]\s*(.*)$/i.test(body)) {
            /*
            $body = $body.match(/^DX\s+de\s+(.*?)\s*[:>]\s*(.*)$/i);

            $rethash.type = 'dx';

            return this._dx_parse($body[1], $body[2], $rethash);
            */
        //# Experimental
        } else if(/^\{\{/i.test(body)) {
            /*
            this.addError($rethash, 'exp_unsupp');
            return $rethash;
            */
        // When all else fails, try to look for a !-position that can
        // occur anywhere within the 40 first characters according
        // to the spec.
        } else {
            /*
            let $pos = $body.indexOf('!');

            if($pos >= 0 && $pos <= 39) {
                $rethash.type = 'location';
                $rethash['messaging'] = false;

                let $pchar = $body.substr($pos + 1, 1);

                if(/^[\/\\A-Za-j]$/.test($pchar)) {
                    // compressed position
                    if($body.length >= ($pos + 1 + 13)) {
                        this._compressed_to_decimal($body.substr($pos + 1, 13), $srccallsign, $rethash);

                        // check the APRS data extension and comment,
                        // if not weather data
                        if($retval == 1 && $rethash['symbolcode'] != '_') {
                            this._comments_to_decimal($body.substr($pos + 14), $srccallsign, $rethash);
                        }
                    }
                } else if(/^\d$/i.test($pchar)) {
                    // normal uncompressed position
                    if($body.length >= ($pos + 1 + 19)) {
                        this._normalpos_to_decimal($body.substr($pos + 1), $srccallsign, $rethash);

                        // check the APRS data extension and comment,
                        // if not weather data
                        if(!$retval['resultmsg'] && $rethash['symbolcode'] != '_') {
                            this._comments_to_decimal($body.substr($pos + 20), $srccallsign, $rethash);
                        }
                    }
                }
            }
            */
        }

        // Return packet regardless of if there were errors or not
        return retVal;
    }

    /**
     * Parse a status report. Only timestamps
     * and text report are supported. Maidenhead,
     * beam headings and symbols are not.
     */
    private _status_parse($options: any, $packet: string, $srccallsign: string, $rethash: aprsPacket): aprsPacket {
        let tmp;

        // Remove CRs, LFs and trailing spaces
        $packet = $packet.trim();

        // Check for a timestamp
        if((tmp = $packet.match(/^(\d{6}z)/))) {
            $rethash.timestamp = this.parseTimestamp({}, tmp[1]);

            if($rethash.timestamp == 0) {
                $rethash = this.addWarning($rethash, 'timestamp_inv_sta') ;
            }

            $packet = $packet.substr(7);
        }

        // Save the rest as the report
        $rethash.status = $packet;

        return $rethash;
    }

    /**
     * Creates a unix timestamp based on an APRS six (+ one char for type) character timestamp or 0 if it's an invalid timestamp
     *
     * @param {json} $options Looking for a raw_timestamp value
     * @param {string} $stamp 6 digit number followed by z, h, or /
     * @returns {number} A unix timestamp
     */
    private parseTimestamp = function($options: any, $stamp: any): number {
        // Check initial format
        if(!($stamp = $stamp.match(/^(\d{2})(\d{2})(\d{2})(z|h|\/)$/))) {
            return 0;
        }

        if($options && $options['raw_timestamp']) {
            return $stamp[1] + $stamp[2] + $stamp[3];
        }

        let $stamptype = $stamp[4];

        if($stamptype == 'h') {
            // HMS format
            let $hour = $stamp[1];
            let $minute = $stamp[2];
            let $second = $stamp[3];

            // Check for invalid time
            if($hour > 23 || $minute > 59 || $second > 59) {
                return 0;
            }

            // All calculations here are in UTC, but if this is run under old MacOS (pre-OSX), then
            // Date_to_Time could be in local time.
            let ts = new Date();
            let $currenttime: number = Math.floor(ts.getTime() / 1000);
            let $cyear = ts.getUTCFullYear();
            let $cmonth = ts.getUTCMonth();
            let $cday = ts.getUTCDate();
            let $tstamp = Math.floor(new Date(Date.UTC($cyear, $cmonth, $cday, $hour, $minute, $second, 0)).getTime() / 1000);

            // If the time is more than about one hour
            // into the future, roll the timestamp
            // one day backwards.
            if($currenttime + 3900 < $tstamp) {
                $tstamp -= 86400;
                // If the time is more than about 23 hours
                // into the past, roll the timestamp one
                // day forwards.
            } else if($currenttime - 82500 > $tstamp) {
                $tstamp += 86400;
            }

            return $tstamp;
        } else if($stamptype == 'z' || $stamptype == '/') {
            // Timestamp is DHM, UTC (z) or local (/).
            // Always intepret local to mean local
            // to this computer.
            let $day = parseInt($stamp[1]);
            let $hour = parseInt($stamp[2]);
            let $minute = parseInt($stamp[3]);

            if($day < 1 || $day > 31 || $hour > 23 || $minute > 59) {
                return 0;
            }

            // If time is under about 12 hours into the future, go there.
            // Otherwise get the first matching time in the past.
            let ts = new Date();
            let $currenttime = Math.floor(ts.getTime() / 1000);
            let $cyear;
            let $cmonth;
            let $cday;

            if ($stamptype === 'z') {
                $cyear = ts.getUTCFullYear();
                $cmonth = ts.getUTCMonth();
                $cday = ts.getUTCDate();
            } else {
                $cyear = ts.getFullYear();
                $cmonth = ts.getMonth()
                $cday = ts.getDate();
            }

            // Form the possible timestamps in
            // this, the next and the previous month
            let tmpDate = new Date($cyear, $cmonth, $cday, 0, 0, 0, 0);
            tmpDate.setDate(tmpDate.getMonth() + 1);

            let $fwdyear = tmpDate.getFullYear();
            let $fwdmonth = tmpDate.getMonth();

            // Calculate back date.
            //tmpDate = new Date($cyear, $cmonth - 1, $cday, 0, 0, 0, 0);
            tmpDate = new Date($cyear, $cmonth, $cday, 0, 0, 0, 0);
            tmpDate.setDate(tmpDate.getMonth() - 1);

            let $backyear = tmpDate.getFullYear();
            let $backmonth = tmpDate.getMonth();

            let $fwdtstamp = null;
            let $currtstamp = null;
            let $backtstamp = null;

            if(this.checkDate($cyear, $cmonth, $day)) {
                if($stamptype === 'z') {
                    //$currtstamp = Date_to_Time($cyear, $cmonth, $day, $hour, $minute, 0);
                    $currtstamp = Math.floor(new Date(Date.UTC($cyear, $cmonth, $cday, $hour, $minute, 0, 0)).getTime() / 1000);
                } else {
                    $currtstamp = Math.floor(new Date($cyear, $cmonth, $day, $hour, $minute, 0, 0).getTime() / 1000);
                }
            }

            if(this.checkDate($fwdyear, $fwdmonth, $day)) {
                if($stamptype === 'z') {
                    $fwdtstamp = Math.floor(new Date(Date.UTC($fwdyear, $fwdmonth, $day, $hour, $minute, 0, 0)).getTime() / 1000);
                } else {
                    $fwdtstamp = Math.floor(new Date($cyear, $cmonth, $day, $hour, $minute, 0, 0).getTime() / 1000);
                }
            }

            if(this.checkDate($backyear, $backmonth, $day)) {
                if($stamptype === 'z') {
                    $backtstamp = Math.floor(new Date(Date.UTC($backyear, $backmonth, $day, $hour, $minute, 0, 0)).getTime() / 1000);
                } else {
                    $backtstamp = Math.floor(new Date($cyear, $cmonth, $day, $hour, $minute, 0, 0).getTime() / 1000);
                }
            }

            // Select the timestamp to use. Pick the timestamp
            // that is largest, but under about 12 hours from
            // current time.
            if($fwdtstamp && ($fwdtstamp - $currenttime) < 43400) {
                return $fwdtstamp;
            } else if($currtstamp && ($currtstamp - $currenttime) < 43400) {
                return $currtstamp;
            } else if($backtstamp) {
                return $backtstamp;
            }
        }

        // return failure if we haven't returned with a success earlier
        return 0;
    }

    /**
     * Parse a message
     * possible TODO: ack piggybacking
     */
    private messageParse(packet: string, retVal: aprsPacket) {
        let tmp;

        // Check format
        if((tmp = packet.match(/^:([A-Za-z0-9_ -]{9}):([\x20-\x7e\x80-\xfe]+)$/))) {
            let $message = tmp[2];
            retVal.destination = tmp[1].trim();

            // check whether this is an ack
            if((tmp = $message.match(/^ack([A-Za-z0-9}]{1,5})\s*$/))) {
                // trailing spaces are allowed because some
                // broken software insert them..
                retVal.messageAck = tmp[1];
                return retVal;
            }

            // check whether this is a message reject
            if((tmp = $message.match(/^rej([A-Za-z0-9}]{1,5})\s*$/))) {
                retVal.messageReject = tmp[1];
                return retVal;
            }

            // separate message-id from the body, if present
            if((tmp = $message.match(/^([^{]*)\{([A-Za-z0-9}]{1,5})\s*$/))) {
                retVal.message = tmp[1];
                retVal.messageId = tmp[2];
            } else {
                retVal.message = $message;
            }

            // catch telemetry messages
            if(/^(BITS|PARM|UNIT|EQNS)\./i.test($message)) {
                retVal.type = 'telemetry-message';
            }

            return retVal;
        }

        this.addError(retVal, 'msg_inv');

        return retVal;
    }

    /**
     * Parse an object
     */
    private objectToDecimal(options: any, packet: string, srcCallsign: string, retVal: aprsPacket): aprsPacket {
        let tmp;

        // Minimum length for an object is 31 characters
        // (or 46 characters for non-compressed)
        if(packet.length < 31) {
            return this.addError(retVal, 'obj_short');
        }

        // Parse the object up to the location
        let $timestamp;

        if((tmp = packet.match(/^;([\x20-\x7e]{9})(\*|_)(\d{6})(z|h|\/)/))) {
            // hash member 'objectname' signals an object
            retVal.objectname = tmp[1];
            retVal.alive = (tmp[2] == '*');

            $timestamp = tmp[3] + tmp[4];
        } else {
            return this.addError(retVal, 'obj_inv');
        }

        // Check the timestamp for validity and convert
        // to UNIX epoch. If the timestamp is invalid, set it
        // to zero.
        retVal.timestamp = this.parseTimestamp(options, $timestamp);

        if(retVal.timestamp == 0) {
            retVal = this.addWarning(retVal, 'timestamp_inv_obj');
        }

        // Forward the location parsing onwards
        let $locationoffset = 18; // object location always starts here
        let $locationchar = packet.charAt(18);

        if(/^[\/\\A-Za-j]$/.test($locationchar)) {
            // compressed
            retVal = this._compressed_to_decimal(packet.substr(18, 13), srcCallsign, retVal);
            $locationoffset = 31; // now points to APRS data extension/comment
        } else if(/^\d$/i.test($locationchar)) {
            // normal
            retVal = this._normalpos_to_decimal(packet.substr(18), srcCallsign, retVal);
            $locationoffset = 37; // now points to APRS data extension/comment
        } else {
            // error
            return this.addError(retVal, 'obj_dec_err');
        }

        if(retVal.resultCode != undefined && retVal.resultCode) {
            return retVal;
        }

        // Check the APRS data extension and possible comments,
        // unless it is a weather report (we don't want erroneus
        // course/speed figures and weather in the comments..)
        if(retVal.symbolcode != '_') {
            this._comments_to_decimal(packet.substr($locationoffset), srcCallsign, retVal);
        } else {
            // possibly a weather object, try to parse
            this._wx_parse(packet.substr($locationoffset), retVal);
        }

        return retVal;
    }

    /**
     * mice_mbits_to_message($packetdata{'mbits'})
     * Convert mic-e message bits (three numbers 0-2) to a textual message.
     *
     * @param {Number} $bits Three numbers 0 - 2
     * @returns {string} the message on success, null on failure.
     */
    private mice_mbits_to_message($bits: string): aprsPacket {
        /*
        if(($bits = $bits.match(/^\s*([0-2]{3})\s*$/))) {
            $bits = $bits[1];

            if(mice_messagetypes[$bits]) {
                return mice_messagetypes[$bits];
            }
        }
        */

        return null;
    }

    /**
     * If no parameter is given, use current time,
     * else use the unix timestamp given in the parameter.
     *
     * @returns {string} A human readable timestamp in UTC, string form.
     */
    private _gettime(): string {
        /*
        let($sec,$min,$hour,$mday,$mon,$year,$wday,$yday);

        if(scalar(@_) >= 1) {
            my $tstamp = shift @_;
            ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday) = gmtime($tstamp);
        } else {
            ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday) = gmtime();
        }

        let $timestring = sprintf('%d-%02d-%02d %02d:%02d:%02d UTC',
            $year + 1900,
            $mon + 1,
            $mday,
            $hour,
            $min,
            $sec);

        return $timestring;
        */

        return null;
    }

    /**
     * Calculates the distance in kilometers between two locations
     * given in decimal degrees.  East and North positive. The calculation uses the great circle distance, it
     * is not too exact, but good enough for us.
     *
     * @param {float} $lon0 The first station's longitude.
     * @param {float} $lat0 The first station's latitude.
     * @param {float} $lon1 The second station's longitude.
     * @param {float} $lat1 The second station's latitude.
     * @returns {float} The distance between 2 stations
     */
    private distance($lon0: number, $lat0: number, $lon1: number, $lat1: number): number {
        /*
        // decimal to radian
        $lon0 = this.deg2rad($lon0);
        $lon1 = this.deg2rad($lon1);
        $lat0 = this.deg2rad($lat0);
        $lat1 = this.deg2rad($lat1);

        // Use the haversine formula for distance calculation
        // http://mathforum.org/library/drmath/view/51879.html
        let $dlon = $lon1 - $lon0;
        let $dlat = $lat1 - $lat0;
        let $a = Math.pow(Math.sin($dlat / 2), 2) + Math.cos($lat0) * Math.cos($lat1) * Math.pow(Math.sin($dlon / 2), 2);
        let $c = 2 * Math.atan2(Math.sqrt($a), Math.sqrt(1 - $a));
        let $distance = $c * 6366.71;  // in kilometers

        return $distance;
        */

        return null;
    }

    /**
     * Returns the initial great circle direction in degrees
     * from lat0/lon0 to lat1/lon1. Locations are input
     * in decimal degrees, north and east positive.
     *
     * @param {float} $lon0 Longitude of the first station.
     * @param {float} $lat0 Latitude of the first station.
     * @param {float} $lon1 Longitude of the second station.
     * @param {float} $lat1 Latitude of the second station.
     * @return {float} The initial great circle direction in degrees from lat0/lon0 to lat1/lon1.
     */
    private direction = function($lon0: number, $lat0: number, $lon1: number, $lat1: number): number {
        /*
        $lon0 = this.deg2rad($lon0);
        $lon1 = this.deg2rad($lon1);
        $lat0 = this.deg2rad($lat0);
        $lat1 = this.deg2rad($lat1);

        // direction from Aviation Formulary V1.42 by Ed Williams
        let $direction = Math.atan2(Math.sin($lon1-$lon0) * Math.cos($lat1)
                , Math.cos($lat0) * Math.sin($lat1) - Math.sin($lat0) * Math.cos($lat1) * Math.cos($lon1-$lon0));

        if($direction < 0) {
            // make direction positive
            $direction += 2 * Math.PI;
        }

        return this.rad2deg($direction);
        */

        return null;
    }

    /**
     * Count the number of digipeated hops in a (KISS) packet and return it. Returns -1 in case of error.
     * The header parameter can contain the full packet or just the header
     * in TNC2 format. All callsigns in the header must be AX.25 compatible
     * and remember that the number returned is just an educated guess, not
     * absolute truth.
     *
     * @param {string} $header Full APRS packet or just the header of the packet
     * @returns {Number} The number of digipeated hops in the KISS packet.
     */
    private count_digihops($header: string): number {
        let tmp;

        // Do a rough check on the header syntax
        $header = $header.trim();
        $header = $header.toUpperCase();

        if((tmp = $header.match(/^([^:]+):/))) {
            // remove data part of packet, if present
            $header = tmp[1];
        }

        /*


        let $hops;;

        if($header =~ /^([A-Z0-9-]+)\>([A-Z0-9-]+)$/o) {
            # check the callsigns for validity
            my $retval = checkAX25Call($1);
            if (not(defined($retval))) {
                if ($debug > 0) {
                    warn "count_digihops: invalid source callsign ($1)\n";
                }
                return -1;
            }
            $retval = checkAX25Call($2);
            if (not(defined($retval))) {
                if ($debug > 0) {
                    warn "count_digihops: invalid destination callsign ($2)\n";
                }
                return -1;
            }
            # no path at all, so zero hops
            return 0;

        } elsif ($header =~ /^([A-Z0-9-]+)\>([A-Z0-9-]+),([A-Z0-9,*-]+)$/o) {
            my $retval = checkAX25Call($1);
            if (not(defined($retval))) {
                if ($debug > 0) {
                    warn "count_digihops: invalid source callsign ($1)\n";
                }
                return -1;
            }
            $retval = checkAX25Call($2);
            if (not(defined($retval))) {
                if ($debug > 0) {
                    warn "count_digihops: invalid destination callsign ($2)\n";
                }
                return -1;
            }
            # some hops
            $hops = $3;

        } else {
            # invalid
            if ($debug > 0) {
                warn "count_digihops: invalid packet header\n";
            }
            return -1;
        }

        my $hopcount = 0;
        # split the path into parts
        my @parts = split(/,/, $hops);
        # now examine the parts one by one
        foreach my $piece (@parts) {
            # remove the possible "digistar" from the end of callsign
            # and take note of its existence
            my $wasdigied = 0;
            if ($piece =~ /^[A-Z0-9-]+\*$/o) {
                $wasdigied = 1;
                $piece =~ s/\*$//;
            }
            # check the callsign for validity and expand it
            my $call = checkAX25Call($piece);
            if (not(defined($call))) {
                if ($debug > 0) {
                    warn "count_digihops: invalid callsign in path ($piece)\n";
                }
                return -1;
            }
            # check special cases, wideN-N and traceN-N for now
            if ($call =~ /^WIDE([1-7])-([0-7])$/o) {
                my $difference = $1 - $2;
                if ($difference < 0) {
                    # ignore reversed N-N
                    if ($debug > 0) {
                        warn "count_digihops: reversed N-N in path ($call)\n";
                    }
                    next;
                }
                $hopcount += $difference;

            } elsif ($call =~ /^TRACE([1-7])-([0-7])$/o) {
                # skip traceN-N because the hops are already individually shown
                # before this
                next;

            } else {
                # just a normal packet. if "digistar" is there,
                # increment the digicounter by one
                if ($wasdigied == 1) {
                    $hopcount++;
                }
            }
        }

        return $hopcount;
        */

        return null;
    }

    /**
     * Returns position resolution in meters based on the number
     * of minute decimal digits.
     *
     * Also accepts negative numbers,
     * i.e. -1 for 10 minute resolution and -2 for 1 degree resolution.
     * Calculation is based on latitude so it is worst case
     * (resolution in longitude gets better as you get closer to the poles).
     *
     * @param {Number} dec Minute decimal digits.
     * @returns {Number} Position resolution in meters based on the number of minute decimal digits.
     */
    private get_posresolution(dec: number): number {
        return KNOT_TO_KMH * (dec <= -2 ? 600 : 1000) * Math.pow(10, (-1 * dec));
    }

    /**
     * Return an NMEA latitude or longitude.
     *
     * @param {string} $value Latitude or Longitude value to convert. (dd)dmm.m(mmm..)
     * @param {string} $sign North/South or East/West indicator.
     * @param {json} $rethash JSON object containing the parsed values of the packet.
     * @returns {float} The returned value is decimal degrees, North and East are positive.  Value is null if there's an error.
     * TODO: should this return the packet instead?
     */
    private _nmea_getlatlon($value: string, $sign: string, $rethash: aprsPacket): number {
        /*
        let tmp;

        // upcase the sign for compatibility
        $sign = $sign.toUpperCase();

        // Be leninent on what to accept, anything
        // goes as long as degrees has 1-3 digits,
        // minutes has 2 digits and there is at least
        // one decimal minute.
        if((tmp = $value.match(/^\s*(\d{1,3})([0-5][0-9])\.(\d+)\s*$/))) {
            let $minutes = `${tmp[2]}.${tmp[3]}`;

            // javascript engines aren't smart enough to convert these to numeric form
            $value = parseFloat(tmp[1]) + (parseFloat($minutes) / 60);

            // capture position resolution in meters based
            // on the amount of minute decimals present
            $rethash['posresolution'] = this._get_posresolution(tmp[3].length);
        } else {
            this.addError($rethash, 'nmea_inv_cval', $value);
            return null;
        }

        if(/^\s*[EW]\s*$/.test($sign)) {
            // make sure the value is ok
            if($value > 179.999999) {
                this.addError($rethash, 'nmea_large_ew', $value);

                return null;
            }

            // west negative
            if(/^\s*W\s*$/.test($sign)) {
                $value *= -1;
            }
        } else if(/^\s*[NS]\s*$/.test($sign)) {
            // make sure the value is ok
            if($value > 89.999999) {
                this.addError($rethash, 'nmea_large_ns', $value);

                return null;
            }

            // south negative
            if(/^\s*S\s*$/.test($sign)) {
                $value *= -1;
            }
        } else {
            // incorrect sign
            this.addError($rethash, 'nmea_inv_sign', $sign);
            return null;
        }

        // all ok
        return $value;
        */

        return 0;
    }

    /**
     * return a two element array, first containing
     * the symbol table id (or overlay) and second
     * containing symbol id. return undef in error
     */
    private _get_symbol_fromdst($dstcallsign: string): any {
        /*
        let $table;
        let $code;

        if ($dstcallsign =~ /^(GPS|SPC)([A-Z0-9]{2,3})/o) {
            my $leftoverstring = $2;
            my $type = substr($leftoverstring, 0, 1);
            my $sublength = length($leftoverstring);
            if ($sublength == 3) {
                if ($type eq 'C' || $type eq 'E') {
                    my $numberid = substr($leftoverstring, 1, 2);
                    if ($numberid =~ /^(\d{2})$/o &&
                        $numberid > 0 &&
                        $numberid < 95) {
                        $code = chr($1 + 32);
                        if ($type eq 'C') {
                            $table = '/';
                        } else {
                            $table = "\\";
                        }
                        return { $table, $code };
                    } else {
                        return undef;
                    }
                } else {
                    # secondary symbol table, with overlay
                    # Check first that we really are in the
                    # secondary symbol table
                    my $dsttype = substr($leftoverstring, 0, 2);
                    my $overlay = substr($leftoverstring, 2, 1);
                    if (($type eq 'O' ||
                        $type eq 'A' ||
                        $type eq 'N' ||
                        $type eq 'D' ||
                        $type eq 'S' ||
                        $type eq 'Q') && $overlay =~ /^[A-Z0-9]$/o) {
                        if (defined(dstsymbol{$dsttype})) {
                            $code = substr(dstsymbol{$dsttype}, 1, 1);
                            return { $overlay, $code };
                        } else {
                            return undef;
                        }
                    } else {
                        return undef;
                    }
                }
            } else {
                # primary or secondary symbol table, no overlay
                if (defined(dstsymbol{$leftoverstring})) {
                    $table = substr(dstsymbol{$leftoverstring}, 0, 1);
                    $code = substr(dstsymbol{$leftoverstring}, 1, 1);
                    return { $table, $code };
                } else {
                    return undef;
                }
            }
        } else {
            return undef;
        }
        */

        // failsafe catch-all
        // when returning a deconstructable set of values, null cannot be returned
        return {};
    }

    /**
     * Parse an NMEA location
     */
    private _nmea_to_decimal($options: any, $body: string, $srccallsign: string, $dstcallsign: string, $rethash: aprsPacket): aprsPacket {
        let tmp;
        /*
        if ($debug > 1) {
            # print packet, after stripping control chars
            my $printbody = $body;
            $printbody =~ tr/[\x00-\x1f]//d;
            warn "NMEA: from $srccallsign to $dstcallsign: $printbody\n";
        }
        *

        // verify checksum first, if it is provided
        // trimRight would be preferred, but not supported in all browser engines.
        $body = $body.replace(/\s+$/, '');     // remove possible white space from the end

        if((tmp = $body.match(/^([\x20-\x7e]+)\*([0-9A-F]{2})$/i))) {
            let $checksumarea = tmp[1];
            let $checksumgiven = String.fromCharCode(tmp[2]).charCodeAt(0).toString(16);
            let $checksumcalculated = 0;

            for(var $i = 0; $i < $checksumarea.length; $i++) {
                $checksumcalculated = ($checksumcalculated ^ String.fromCharCode($i).charCodeAt(0).toString(16));
            }

            if($checksumgiven != $checksumcalculated) {
                // invalid checksum
                this.addError($rethash, 'nmea_inv_cksum');
                return 0;
            }

            // make a note of the existance of a checksum
            $rethash['checksumok'] = 1;
        }

        // checksum ok or not provided

        $rethash['format'] = 'nmea';

        // use a dot as a default symbol if one is not defined in
        // the destination callsign
        let { $symtable, $symcode } = this._get_symbol_fromdst($dstcallsign);

        if(!$symtable || !$symcode) {
            $rethash['symboltable'] = '/';
            $rethash['symbolcode'] = '/';
        } else {
            $rethash['symboltable'] = $symtable;
            $rethash['symbolcode'] = $symcode;
        }

        // Split to NMEA fields
        $body = $body.replace(/\*[0-9A-F]{2}$/, '');    // remove checksum from body first
        let nmeafields = $body.split(',');

        // Now check the sentence type and get as much info
        // as we can (want).
        if(nmeafields[0] == 'GPRMC') {
            // we want at least 10 fields
            if(nmeafields.length < 10) {
                this.addError($rethash, 'gprmc_fewfields', nmeafields);
                return 0;
            }

            if(nmeafields[2] != 'A') {
                // invalid position
                this.addError($rethash, 'gprmc_nofix');

                return 0;
            }

            // check and save the timestamp
            let $hour;
            let $minute;
            let $second;

            if((tmp = nmeafields[1].match(/^\s*(\d{2})(\d{2})(\d{2})(|\.\d+)\s*$/))) {
                // if seconds has a decimal part, ignore it
                // leap seconds are not taken into account...
                if(tmp[1] > 23 || tmp[2] > 59 || tmp[3] > 59) {
                    this.addError($rethash, 'gprmc_inv_time', nmeafields[1]);
                    return 0;
                }

                $hour = parseInt(tmp[1]);
                $minute = parseInt(tmp[2]);
                $second = parseInt(tmp[3]);
            } else {
                this.addError($rethash, 'gprmc_inv_time');
                return 0;
            }

            let $year;
            let $month;
            let $day;

            if((tmp = nmeafields[9].match(/^\s*(\d{2})(\d{2})(\d{2})\s*$/))) {
                // check the date for validity. Assume
                // years 0-69 are 21st century and years
                // 70-99 are 20th century
                $year = 2000 + parseInt(tmp[3]);

                if(tmp[3] >= 70) {
                    $year = 1900 + tmp[3];
                }

                // check for invalid date
                // javascript months are 0 based
                if(!(this.check_date($year, tmp[2] - 1, parseInt(tmp[1])))) {
                    this.addError($rethash, 'gprmc_inv_date', `${$year} ${tmp[2] - 1} ${tmp[1]}`);
                    return 0;
                }

                // javascript months are 0 based
                $month = tmp[2] - 1; // force numeric
                $day = tmp[1];
            } else {
                this.addError($rethash, 'gprmc_inv_date');
                return 0;
            }

            // Date_to_Time() can only handle 32-bit unix timestamps,
            // so make sure it is not used for those years that
            // are outside that range.
            if($year >= 2038 || $year < 1970) {
                $rethash['timestamp'] = 0;
                this.addError($rethash, 'gprmc_date_out', $year);

                return 0;
            } else {
                let d = new Date(Date.UTC($year, $month, $day, $hour, $minute, $second, 0));

                $rethash['timestamp'] = d.getTime() / 1000;
            }

            // speed (knots) and course, make these optional
            // in the parsing sense (don't fail if speed/course
            // can't be decoded).
            if((tmp = nmeafields[7].match(/^\s*(\d+(|\.\d+))\s*$/))) {
                // convert to km/h
                $rethash['speed'] = tmp[1] * $knot_to_kmh;
            }

            if((tmp = nmeafields[8].match(/^\s*(\d+(|\.\d+))\s*$/))) {
                // round to nearest integer
                let $course = Math.round((parseFloat(tmp[1]) + 0.5));

                // if zero, set to 360 because in APRS
                // zero means invalid course...
                if($course == 0) {
                    $course = 360;
                } else if($course > 360) {
                    $course = 0; // invalid
                }

                $rethash['course'] = $course;
            } else {
                $rethash['course'] = 0; // unknown
            }

            // latitude and longitude
            let $latitude = this._nmea_getlatlon(nmeafields[3], nmeafields[4], $rethash);

            if(!$latitude) {
                return 0;
            }

            $rethash['latitude'] = $latitude;

            let $longitude = this._nmea_getlatlon(nmeafields[5], nmeafields[6], $rethash);

            if(!$longitude) {
                return 0;
            }

            $rethash['longitude'] = $longitude;

            // we have everything we want, return
            return 1;
        } else if(nmeafields[0] == 'GPGGA') {
            /*
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
        } else {
            //nmeafields[0] =~ tr/[\x00-\x1f]//d;
            //addError($rethash, 'nmea_unsupp', $nmeafields[0]);

            return 0;
        }

        return 0;
        */

        return $rethash
    }

    /**
     * Parse the possible APRS data extension
     * as well as comment
     */
    private _comments_to_decimal($rest: string, $srccallsign: string, $rethash: aprsPacket) {
        let tmprest;

        // First check the possible APRS data extension,
        // immediately following the packet
        if($rest.length >= 7) {
            if((tmprest = $rest.match(/^([0-9. ]{3})\/([0-9. ]{3})/))) {
                let $course = tmprest[1];
                let $speed = tmprest[2];
                let match;

                if((match = $course.match(/^\d{3}$/)) &&
                        parseInt($course) <= 360 &&
                        parseInt($course) >= 1) {
                    // force numeric interpretation
                    $rethash.course = parseInt($course);
                } else {
                    // course is invalid, set it to zero
                    $rethash.course = 0;
                }

                // If speed is invalid, don't set it
                // (zero speed is a valid speed).
                if((match = $speed.match(/^\d{3}$/))) {
                    // force numeric interpretation
                    // and convert to km/h
                    $rethash.speed = parseInt($speed) * KNOT_TO_KMH;
                }

                $rest = $rest.substr(7);
            } else if((tmprest = $rest.match(/^PHG(\d[\x30-\x7e]\d\d[0-9A-Z])\//))) {
                // PHGR
                $rethash.phg = tmprest[1];
                $rest = $rest.substr(8);
            } else if((tmprest = $rest.match(/^PHG(\d[\x30-\x7e]\d\d)/))) {
                // don't do anything fancy with PHG, just store it
                $rethash.phg = tmprest[1];
                $rest = $rest.substr(7);
            } else if((tmprest = $rest.match(/^RNG(\d{4})/))) {
                // radio range, in miles, so convert to km
                $rethash['radiorange'] = parseInt(tmprest[1]) * MPH_TO_KMH;
                $rest = $rest.substr(7);
            }
        }

        // Check for optional altitude anywhere in the comment,
        // take the first occurrence
        if((tmprest = $rest.match(/^(.*?)\/A=(-\d{5}|\d{6})(.*)$/))) {
            // convert to meters as well
            $rethash.altitude = parseFloat(tmprest[2]) * 0.3048;
            $rest = tmprest[1] + tmprest[3];
        }

        // Check for new-style base-91 comment telemetry - ISSUE HERE
        [ $rest, $rethash ] = this._comment_telemetry($rethash, $rest);

        // Check for !DAO!, take the last occurrence (per recommendation)
        if((tmprest = $rest.match(/^(.*)\!([\x21-\x7b][\x20-\x7b]{2})\!(.*?)$/))) {
            $rethash = this._dao_parse(tmprest[2], $srccallsign, $rethash);

            if($rethash.resultCode == undefined && !$rethash.resultCode) {
                $rest = tmprest[1] + tmprest[3];
            }
        }

        // Strip a / or a ' ' from the beginning of a comment
        // (delimiter after PHG or other data stuffed within the comment)
        $rest = $rest.replace(/^[\/\s]/, '');

        // Save the rest as a separate comment, if
        // anything is left (trim unprintable chars
        // out first and white space from both ends)
        if($rest.length > 0) {
            $rethash['comment'] = $rest.trim();
        }

        // Always succeed as these are optional
        return $rethash;
    }

    /**
     * Parse a station capabilities packet
     */
    private _capabilities_parse($packet: string, $srccallsign: string, $rethash: aprsPacket): aprsPacket {
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
        return $rethash;
    }

    private _comment_telemetry($rethash: aprsPacket, $rest: string): [ string, aprsPacket ] {
        $rest = $rest.replace(/^(.*)\|([!-{]{2})([!-{]{2})([!-{]{2}|)([!-{]{2}|)([!-{]{2}|)([!-{]{2}|)([!-{]{2}|)\|(.*)$/, function($0, $1, $2, $3, $4, $5, $6, $7, $8, $9) {
            $rethash.telemetry = new telemetry(
                (($2.charCodeAt(0) - 33) * 91) + (($2.charCodeAt(1) - 33))
                , [
                    (($3.charCodeAt(0) - 33) * 91) + ($3.charCodeAt(1) - 33)
                    , $4 != '' ? (($4.charCodeAt(0) - 33) * 91) + (($4.charCodeAt(1) - 33)) : null
                    , $5 != '' ? (($5.charCodeAt(0) - 33) * 91) + (($5.charCodeAt(1) - 33)) : null
                    , $6 != '' ? (($6.charCodeAt(0) - 33) * 91) + (($6.charCodeAt(1) - 33)) : null
                    , $7 != '' ? (($7.charCodeAt(0) - 33) * 91) + (($7.charCodeAt(1) - 33)) : null
                ]
            );

            if($8 != '') {
                // bits: first, decode the base-91 integer
                let $bitint = ((($8.charCodeAt(0) - 33) * 91) + (($8.charCodeAt(1) - 33)));

                // then, decode the 8 bits of telemetry
                let $bitstr = ($bitint << 7).toString(2)

                $rethash.telemetry.bits = '00000000'.substring(0, 8 - $bitstr.length) + $bitint; //unpack('b8', pack('C', $bitint));
            }

            return $1 + $9;
        });

        return [ $rest, $rethash ];
    }

    /**
     * Parse an item
     */
    private _item_to_decimal($packet: string, $srccallsign: string, $rethash: aprsPacket): aprsPacket {
        let tmp;

        // Minimum length for an item is 18 characters
        // (or 24 characters for non-compressed)
        if($packet.length < 18) {
            return this.addError($rethash, 'item_short');
        }

        // Parse the item up to the location
        if((tmp = $packet.match(/^\)([\x20\x22-\x5e\x60-\x7e]{3,9})(!|_)/))) {
            // hash member 'itemname' signals an item
            $rethash.itemname = tmp[1];

            if(tmp[2] == '!') {
                $rethash.alive = true;
            } else {
                $rethash.alive = false;
            }
        } else {
            return this.addError($rethash, 'item_inv');
        }

        // Forward the location parsing onwards
        let $locationoffset = 2 + $rethash.itemname.length;
        let $locationchar = $packet.charAt($locationoffset);

        if(/^[\/\\A-Za-j]$/.test($locationchar)) {
            // compressed
            $rethash = this._compressed_to_decimal($packet.substr($locationoffset, 13), $srccallsign, $rethash);
            $locationoffset += 13;
        } else if(/^\d$/i.test($locationchar)) {
            // normal
            $rethash = this._normalpos_to_decimal($packet.substr($locationoffset), $srccallsign, $rethash);
            $locationoffset += 19;
        } else {
            // error
            return this.addError($rethash, 'item_dec_err');
        }

        if($rethash.resultCode !== undefined && $rethash.resultCode) {
            return $rethash;
        }

        // Check the APRS data extension and possible comments,
        // unless it is a weather report (we don't want erroneus
        // course/speed figures and weather in the comments..)
        if($rethash['symbolcode'] != '_') {
            $rethash = this._comments_to_decimal($packet.substr($locationoffset), $srccallsign, $rethash);
        }

        return $rethash;
    }

    /**
     * Parse a normal uncompressed location
     */
    private _normalpos_to_decimal($packet: string, $srccallsign: string, $rethash: aprsPacket): aprsPacket {
        // Check the length
        if($packet.length < 19) {
            return this.addError($rethash, 'loc_short');
        }

        $rethash.format = 'uncompressed';

        // Make a more detailed check on the format, but do the
        // actual value checks later
        let $lon_deg;
        let $lat_deg;
        let $lon_min;
        let $lat_min;
        let $issouth = 0;
        let $iswest = 0;
        let $symboltable;
        let matches;

        if((matches = $packet.match(/^(\d{2})([0-7 ][0-9 ]\.[0-9 ]{2})([NnSs])(.)(\d{3})([0-7 ][0-9 ]\.[0-9 ]{2})([EeWw])([\x21-\x7b\x7d])/))) {
            let $sind = matches[3].toUpperCase();
            let $wind = matches[7].toUpperCase();

            $symboltable = matches[4];

            $rethash['symbolcode'] = matches[8];

            if($sind == 'S') {
                $issouth = 1;
            }

            if($wind == 'W') {
                $iswest = 1;
            }

            $lat_deg = matches[1];
            $lat_min = matches[2];
            $lon_deg = matches[5];
            $lon_min = matches[6];
        } else {
            return this.addError($rethash, 'loc_inv');
        }

        if(!$symboltable.match(/^[\/\\A-Z0-9]$/)) {
            return this.addError($rethash, 'sym_inv_table');
        }

        $rethash.symboltable = $symboltable;

        // Check the degree values
        if(parseInt($lat_deg) > 89 || parseInt($lon_deg) > 179) {
            return this.addError($rethash, 'loc_large');
        }

        // Find out the amount of position ambiguity
        let $tmplat = $lat_min.replace(/\./, '');

        // Count the amount of spaces at the end
        if((matches = $tmplat.match(/^(\d{0,4})( {0,4})$/i))) {
            $rethash.posambiguity = matches[2].length;
        } else {
            return this.addError($rethash, 'loc_amb_inv');
        }

        let $latitude: number;
        let $longitude: number;

        if($rethash.posambiguity == 0) {
            // No position ambiguity. Check longitude for invalid spaces
            if($lon_min.match(/ /)) {
                return this.addError($rethash, 'loc_amb_inv', 'longitude 0');
            }

            $latitude = parseFloat($lat_deg) + (parseFloat($lat_min) / 60);
            $longitude = parseFloat($lon_deg) + (parseFloat($lon_min) / 60);
        } else if($rethash.posambiguity == 4) {
            // disregard the minutes and add 0.5 to the degree values
            $latitude = parseFloat($lat_deg) + 0.5;
            $longitude = parseFloat($lon_deg) + 0.5;
        } else if($rethash.posambiguity == 1) {
            // the last digit is not used
            $lat_min = $lat_min.substr(0, 4);
            $lon_min = $lon_min.substr(0, 4);

            if($lat_min.match(/ /i) || $lon_min.match(/ /i)) {
                return this.addError($rethash, 'loc_amb_inv', 'lat/lon 1');
            }

            $latitude = parseFloat($lat_deg) + ((parseFloat($lat_min) + 0.05) / 60);
            $longitude = parseFloat($lon_deg) + ((parseFloat($lon_min) + 0.05) / 60);
        } else if($rethash.posambiguity == 2) {
            // the minute decimals are not used
            $lat_min = $lat_min.substr(0, 2);
            $lon_min = $lon_min.substr(0, 2);

            if($lat_min.match(/ /i) || $lon_min.match(/ /i)) {
                return this.addError($rethash, 'loc_amb_inv', 'lat/lon 2');
            }

            $latitude = parseFloat($lat_deg) + ((parseFloat($lat_min) + 0.5) / 60);
            $longitude = parseFloat($lon_deg) + ((parseFloat($lon_min) + 0.5) / 60);
        } else if($rethash.posambiguity == 3) {
            // the single minutes are not used
            $lat_min = $lat_min.charAt(0) + '5';
            $lon_min = $lon_min.charAt(0) + '5';

            if($lat_min.match(/ /i) || $lon_min.match(/ /i)) {
                return this.addError($rethash, 'loc_amb_inv', 'lat/lon 3');
            }

            $latitude = parseFloat($lat_deg) + (parseFloat($lat_min) / 60);
            $longitude = parseFloat($lon_deg) + (parseFloat($lon_min) / 60);
        } else {
            return this.addError($rethash, 'loc_amb_inv');
        }

        // Finally apply south/west indicators
        if($issouth == 1) {
            $latitude = 0 - $latitude;
        }

        if($iswest == 1) {
            $longitude = 0 - $longitude;
        }

        // Store the locations
        $rethash.latitude = $latitude;
        $rethash.longitude = $longitude;

        // Calculate position resolution based on position ambiguity
        // calculated above.
        $rethash.posresolution = this.get_posresolution(2 - $rethash.posambiguity);

        // Parse possible APRS data extension
        // afterwards along with comments
        return $rethash;
    }

    /**
     * convert a mic-encoder packet
     */
    private _mice_to_decimal($packet: string, $dstcallsign: string, $srccallsign: string, $rethash: aprsPacket, $options: any): aprsPacket {
        let tmp: any;
        $rethash.format = 'mice';

        // We only want the base callsign
        $dstcallsign = $dstcallsign.replace(/-\d+$/, '');

        // Check the format
        if($packet.length < 8 || $dstcallsign.length != 6) {
            // too short packet to be mic-e
            return this.addError($rethash, 'mice_short');
        }

        if(!(/^[0-9A-LP-Z]{3}[0-9LP-Z]{3}$/i.test($dstcallsign))) {
            // A-K characters are not used in the last 3 characters
            // and MNO are never used
            return this.addError($rethash, 'mice_inv');
        }

        // check the information field (longitude, course, speed and
        // symbol table and code are checked). Not bullet proof..
        let $mice_fixed;
        let $symboltable = $packet.charAt(7);

        // TODO: Too sober to figure this out right now...
        if(!(tmp = $packet.match(/^[\x26-\x7f][\x26-\x61][\x1c-\x7f]{2}[\x1c-\x7d][\x1c-\x7f][\x21-\x7b\x7d][\/\\A-Z0-9]/))) {
            // If the accept_broken_mice option is given, check for a known
            // corruption in the packets and try to fix it - aprsd is
            // replacing some valid but non-printable mic-e packet
            // characters with spaces, and some other software is replacing
            // the multiple spaces with a single space. This regexp
            // replaces the single space with two spaces, so that the rest
            // of the code can still parse the position data.

            if($options && $options['accept_broken_mice']
                    && ($packet = $packet.replace(/^([\x26-\x7f][\x26-\x61][\x1c-\x7f]{2})\x20([\x21-\x7b\x7d][\/\\A-Z0-9])(.*)/, '$1\x20\x20$2$3'))) {
                $mice_fixed = 1;
                // Now the symbol table identifier is again in the correct spot...
                $symboltable = $packet.charAt(7);

                if(!/^[\/\\A-Z0-9]$/.test($symboltable)) {
                    return this.addError($rethash, 'sym_inv_table');
                }
            } else {
                // Get a more precise error message for invalid symbol table
                if(!(/^[\/\\A-Z0-9]$/.test($symboltable))) {
                    return this.addError($rethash, 'sym_inv_table');
                } else {
                    return this.addError($rethash, 'mice_inv_info');
                }
            }
        }

        // First do the destination callsign
        // (latitude, message bits, N/S and W/E indicators and long. offset)

        // Translate the characters to get the latitude
        let $tmplat: any = $dstcallsign.toUpperCase();
        $tmplat = $tmplat.split('');
        tmp = '';

        // /A-JP-YKLZ/0-90-9___/ <- Unfortunately, JavaScript isn't as cool as Perl
        // Lets discrace Perl's awesomeness and use a loop instead.
        $tmplat.forEach(function(c: string) {
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

        $tmplat = tmp;

        // Find out the amount of position ambiguity
        if((tmp = $tmplat.match(/^(\d+)(_*)$/i))) {
            let $amount = 6 - tmp[1].length;

            if($amount > 4) {
                // only minutes and decimal minutes can
                // be masked out
                return this.addError($rethash, 'mice_amb_large');
            }

            $rethash.posambiguity = $amount;

            // Calculate position resolution based on position ambiguity
            // calculated above.
            $rethash.posresolution = this.get_posresolution(2 - $amount);
        } else {
            // no digits in the beginning, baaad..
            // or the ambiguity digits weren't continuous
            return this.addError($rethash, 'mice_amb_inv');
        }

        // convert the latitude to the midvalue if position ambiguity
        // is used
        if($rethash.posambiguity >= 4) {
            // the minute is between 0 and 60, so
            // the middle point is 30
            $tmplat = $tmplat.replace('_', '3');
        } else {
            $tmplat = $tmplat.replace('_', '5');  // the first is changed to digit 5
        }

        $tmplat = $tmplat.replace(/_/g, '0'); // the rest are changed to digit 0

        // get the degrees
        let $latitude = $tmplat.substr(0, 2);

        // the minutes
        let $latminutes = $tmplat.substr(2, 2) + '.' + $tmplat.substr(4, 2);

        // convert the minutes to decimal degrees and combine
        $latitude = parseFloat($latitude) + (parseFloat($latminutes) / 60);

        // check the north/south direction and correct the latitude
        // if necessary
        let $nschar = $dstcallsign.charCodeAt(3);

        if($nschar <= 0x4c) {
            $latitude = (0 - parseFloat($latitude));
        }

        // Latitude is finally complete, so store it
        $rethash.latitude = $latitude;

        // Get the message bits. 1 is standard one-bit and
        // 2 is custom one-bit. mice_messagetypes provides
        // the mappings to message names
        let $mbitstring = $dstcallsign.substr(0, 3);

        $mbitstring = $mbitstring.replace(/[0-9L]/g, '0');
        //$mbitstring = $mbitstring.replace(/[]/g, '0');
        $mbitstring = $mbitstring.replace(/[P-Z]/g, '1');
        $mbitstring = $mbitstring.replace(/[A-K]/g, '2');

        $rethash.mbits = $mbitstring;

        // Decode the longitude, the first three bytes of the
        // body after the data type indicator.
        // First longitude degrees, remember the longitude offset
        let $longitude = $packet.charCodeAt(0) - 28;
        let $longoffsetchar = $dstcallsign.charCodeAt(4);

        if($longoffsetchar >= 0x50) {
            $longitude = $longitude + 100;
        }

        if($longitude >= 180 && $longitude <= 189) {
            $longitude = $longitude - 80;
        } else if($longitude >= 190 && $longitude <= 199) {
            $longitude = $longitude - 190;
        }

        // Decode the longitude minutes
        let $longminutes: any = $packet.charCodeAt(1) - 28;

        if($longminutes >= 60) {
            $longminutes -= 60;
        }

        // ... and minute decimals
        $longminutes = $longminutes + '.' + ($packet.charCodeAt(2) - 28);

        // apply position ambiguity to longitude
        if($rethash.posambiguity == 4) {
            // minute is unused -> add 0.5 degrees to longitude
            $longitude += 0.5;
        } else if ($rethash.posambiguity == 3) {
            let $lontmp = $longminutes.charAt(0) + '5';
            $longitude = $longitude + (parseFloat($lontmp) / 60);
        } else if($rethash.posambiguity == 2) {
            let $lontmp = $longminutes.substr(0, 2) + '.5';
            $longitude = $longitude + (parseFloat($lontmp) / 60);
        } else if($rethash.posambiguity == 1) {
            let $lontmp = $longminutes.substr(0, 4) + '5';
            $longitude = ($longitude + (parseFloat($lontmp) / 60));
        } else if($rethash.posambiguity == 0) {
            $longitude = $longitude + (parseFloat($longminutes) / 60);
        } else {
            return this.addError($rethash, 'mice_amb_odd', $rethash.posambiguity.toString());
        }

        // check the longitude E/W sign
        let $ewchar = $dstcallsign.charCodeAt(5);
        if($ewchar >= 0x50) {
            $longitude = 0 - $longitude;
        }

        // Longitude is finally complete, so store it
        $rethash.longitude = $longitude;

        // Now onto speed and course.
        // If the packet has had a mic-e fix applied, course and speed are likely to be off.
        if(!$mice_fixed) {
            let $speed = (($packet.charCodeAt(3)) - 28) * 10;
            let $coursespeed = ($packet.charCodeAt(4)) - 28;
            let $coursespeedtmp = Math.round($coursespeed / 10);  // had been parseint... change to math.floor if tests start failing.

            $speed += $coursespeedtmp;
            $coursespeed -= $coursespeedtmp * 10;

            let $course = (100 * $coursespeed) + ($packet.charCodeAt(5) - 28);

            if($course >= 400) {
                $course -= 400;
            }

            // also zero course is saved, which means unknown
            if($course >= 0) {
                $rethash['course'] = $course;
            }

            // do some important adjustements
            if($speed >= 800) {
                $speed -= 800;
            }

            // convert speed to km/h and store
            $rethash.speed = $speed * KNOT_TO_KMH;
        }

        // save the symbol table and code
        $rethash.symbolcode = $packet.charAt(6);
        $rethash.symboltable = $symboltable;

        // Check for possible altitude and comment data.
        // It is base-91 coded and in format 'xxx}' where
        // x are the base-91 digits in meters, origin is 10000 meters
        // below sea.
        if($packet.length > 8) {
            let $rest = $packet.substr(8);

            // check for Mic-E Telemetry Data
            if((tmp = $rest.match(/^'([0-9a-f]{2})([0-9a-f]{2})(.*)$/i))) {
                // two hexadecimal values: channels 1 and 3
                $rest = tmp[3];

                $rethash.telemetry = new telemetry(null, [ parseInt(tmp[1], 16), 0, parseInt(tmp[2], 16) ]);
            }

            if((tmp = $rest.match(/^‘([0-9a-f]{10})(.*)$/i))) {
                // five channels:
                $rest = tmp[2];

                // less elegant version of pack/unpack... gets the job done. deal with it or fix it
                tmp[1] = tmp[1].match(/.{2}/g);
                // don't know what item is, don't care, but don't remove it
                tmp[1].forEach(function(item: any, index: number) { tmp[1][index] = parseInt(tmp[1][index], 16); });

                $rethash.telemetry = new telemetry(null, tmp[1]);
            }


            // check for altitude
            if((tmp = $rest.match(/^(.*?)([\x21-\x7b])([\x21-\x7b])([\x21-\x7b])\}(.*)$/))) {
                $rethash.altitude = (
                        ((tmp[2].charCodeAt(0) - 33) * Math.pow(91, 2))
                        + ((tmp[3].charCodeAt(0) - 33) * 91)
                        + (tmp[4].charCodeAt(0) - 33))
                    - 10000;

                $rest = tmp[1] + tmp[5];
            }

            // Check for new-style base-91 comment telemetry
            [ $rest, $rethash ] = this._comment_telemetry($rethash, $rest);

            // Check for !DAO!, take the last occurrence (per recommendation)
            if((tmp = $rest.match(/^(.*)\!([\x21-\x7b][\x20-\x7b]{2})\!(.*?)$/))) {
                let $daofound = this._dao_parse(tmp[2], $srccallsign, $rethash);

                if($daofound == 1) {
                    $rest = tmp[1] + tmp[3];
                }
            }

            // If anything is left, store it as a comment
            // after removing non-printable ASCII
            // characters
            if($rest.length > 0) {
                $rethash.comment = $rest.trim();
            }
        }

        if($mice_fixed) {
            $rethash.mice_mangled = true;
            // warn "$srccallsign: fixed packet was parsed\n";
        }

        return $rethash;
    }

    /**
     * convert a compressed position to decimal degrees
     */
    private _compressed_to_decimal($packet: string, $srccallsign: string, $rethash: aprsPacket): aprsPacket {
        // A compressed position is always 13 characters long.
        // Make sure we get at least 13 characters and that they are ok.
        // Also check the allowed base-91 characters at the same time.
        if(!(/^[\/\\A-Za-j]{1}[\x21-\x7b]{8}[\x21-\x7b\x7d]{1}[\x20-\x7b]{3}/.test($packet))) {
            return this.addError($rethash, 'comp_inv');
        }

        $rethash.format = 'compressed';

        let $lat1 = $packet.charCodeAt(1) - 33;
        let $lat2 = $packet.charCodeAt(2) - 33;
        let $lat3 = $packet.charCodeAt(3) - 33;
        let $lat4 = $packet.charCodeAt(4) - 33;
        let $long1 = $packet.charCodeAt(5) - 33;
        let $long2 = $packet.charCodeAt(6) - 33;
        let $long3 = $packet.charCodeAt(7) - 33;
        let $long4 = $packet.charCodeAt(8) - 33;
        let $symbolcode = $packet.charAt(9);
        let $c1 = $packet.charCodeAt(10) - 33;
        let $s1 = $packet.charCodeAt(11) - 33;
        let $comptype = $packet.charCodeAt(12) - 33;

        // save the symbol table and code
        $rethash.symbolcode = $symbolcode;

        // the symbol table values a..j are really 0..9
        if(/a-j/.test($packet.charAt(0))) {
            $rethash.symboltable =  ($packet.charCodeAt(0) - 97).toString();
        } else {
            $rethash.symboltable =  $packet.charAt(0);
        }

        // calculate latitude and longitude
        $rethash.latitude = 90 - ((
                $lat1 * Math.pow(91, 3)
                + $lat2 * Math.pow(91, 2)
                + $lat3 * 91
                + $lat4
                ) / 380926);

        $rethash.longitude = -180 + ((
                $long1 * Math.pow(91, 3)
                + $long2 * Math.pow(91, 2)
                + $long3 * 91
                + $long4
                ) / 190463);

        // save best-case position resolution in meters
        // 1852 meters * 60 minutes in a degree * 180 degrees
        // / 91 ** 4
        $rethash.posresolution = 0.291;

        // GPS fix status, only if csT is used
        if($c1 != -1) {
            if(($comptype & 0x20) == 0x20) {
                $rethash.gpsfixstatus = true;
            } else {
                $rethash.gpsfixstatus = false;
            }
        }

        // check the compression type, if GPGGA, then
        // the cs bytes are altitude. Otherwise try
        // to decode it as course and speed. And
        // finally as radio range
        // if c is space, then csT is not used.
        // Also require that s is not a space.
        if($c1 == -1 || $s1 == -1) {
            // csT not used
        } else if(($comptype & 0x18) == 0x10) {
            // cs is altitude
            let $cs = $c1 * 91 + $s1;
            // convert directly to meters
            $rethash.altitude = Math.pow(1.002, $cs) * 0.3048;
        } else if($c1 >= 0 && $c1 <= 89) {
            if($c1 == 0) {
                // special case of north, APRS spec
                // uses zero for unknown and 360 for north.
                // so remember to convert north here.
                $rethash.course = 360;
            } else {
                $rethash.course = $c1 * 4;
            }

            // convert directly to km/h
            $rethash.speed = (Math.pow(1.08, $s1) - 1) * KNOT_TO_KMH;
        } else if($c1 == 90) {
            // convert directly to km
            $rethash.radiorange = (2 * Math.pow(1.08, $s1)) * MPH_TO_KMH;
        }

        return $rethash;
    }

    /**
     * Parse a possible !DAO! extension (datum and extra
     * lat/lon digits). Returns 1 if a valid !DAO! extension was
     * detected in the test subject (and stored in $rethash), 0 if not.
     * Only the "DAO" should be passed as the candidate parameter,
     * not the delimiting exclamation marks.
     */
    private _dao_parse($daocandidate: string, $srccallsign: string, $rethash: aprsPacket): aprsPacket {
        /*
        // datum character is the first character and also
        // defines how the rest is interpreted
        let $latoff;
        let $lonoff;
        let tmp;

        if((tmp = $daocandidate.match(/^([A-Z])(\d)(\d)$/))) {
            // human readable (datum byte A...Z)
            $rethash['daodatumbyte'] = tmp[1];
            $rethash['posresolution'] = this._get_posresolution(3);

            $latoff = parseInt(tmp[2]) * 0.001 / 60;
            $lonoff = parseInt(tmp[3]) * 0.001 / 60;
        } else if((tmp = $daocandidate.match(/^([a-z])([\x21-\x7b])([\x21-\x7b])$/))) {
            // base-91 (datum byte a...z)
            // store the datum in upper case, still
            $rethash['daodatumbyte'] = tmp[1].toUpperCase();

            // close enough.. not exact:
            $rethash['posresolution'] = this._get_posresolution(4);

            // do proper scaling of base-91 values
            $latoff = (tmp[2].charCodeAt(0) - 33) / 91 * 0.01 / 60;
            $lonoff = (tmp[3].charCodeAt(0) - 33) / 91 * 0.01 / 60;
        } else if((tmp = $daocandidate.match(/^([\x21-\x7b])\s\s$/))) {
            // only datum information, no lat/lon digits
            let $daodatumbyte = tmp[1];

            if(/^[a-z]$/.test($daodatumbyte)) {
                $daodatumbyte = $daodatumbyte.toUpperCase();
            }

            $rethash['daodatumbyte'] = $daodatumbyte;

            return 1;
        } else {
            return 0;
        }

        // check N/S and E/W
        if($rethash['latitude'] < 0) {
            $rethash['latitude'] -= $latoff;
        } else {
            $rethash['latitude'] += $latoff;
        }

        if($rethash['longitude'] < 0) {
            $rethash['longitude'] -= $lonoff;
        } else {
            $rethash['longitude'] += $lonoff;
        }

        return 1;
        */

        return null;
    }

    /**
     * _dx_parse($sourcecall, $info, $rethash)
     *
     * Parses the body of a DX spot packet. Returns the following
     * hash elements: dxsource (source of the info), dxfreq (frequency),
     * dxcall (DX callsign) and dxinfo (info string).
     */
    private _dx_parse($sourcecall: string, $info: string, $rethash: aprsPacket): aprsPacket {
        /*
        if(!this.checkAX25Call($sourcecall)) {
            this.addError($rethash, 'dx_inv_src', $sourcecall);
            return 0;
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
        *

        return 1;
        */

        return null;
    }

    /**
     * _wx_parse($s, $rethash)
     *
     * Parses a normal uncompressed weather report packet.
     */
    private _wx_parse($s: string, $rethash: aprsPacket): aprsPacket {
        // 257/007g013t055r000P000p000h56b10160v31
        // 045/000t064r000p000h35b10203.open2300v1.10
        // 175/007g007p...P000r000t062h32b10224wRSW
        let $w = new wx();
        let $wind_dir;
        let $wind_speed;
        let $temp;
        let $wind_gust;
        let tmp;

        if((tmp = $s.match(/^_{0,1}([\d \.\-]{3})\/([\d \.]{3})g([\d \.]+)t(-{0,1}[\d \.]+)/))
            || (tmp = $s.match(/^_{0,1}c([\d \.\-]{3})s([\d \.]{3})g([\d \.]+)t(-{0,1}[\d \.]+)/))) {
            // warn "wind $1 / $2 gust $3 temp $4\n";
            $wind_dir = tmp[1];
            $wind_speed = tmp[2];
            $wind_gust = tmp[3];

            if(tmp[0]) {
                $s = $s.replace(tmp[0], '');
            }

            $temp = tmp[4];
        } else if((tmp = $s.match(/^_{0,1}([\d \.\-]{3})\/([\d \.]{3})t(-{0,1}[\d \.]+)/))) {
            // warn "$initial\nwind $1 / $2 temp $3\n";
            $wind_dir = tmp[1];
            $wind_speed = tmp[2];

            if(tmp[0]) {
                $s = $s.replace(tmp[0], '');
            }

            $temp = tmp[3];
        } else if((tmp = $s.match(/^_{0,1}([\d \.\-]{3})\/([\d \.]{3})g([\d \.]+)/))) {
            // warn "$initial\nwind $1 / $2 gust $3\n";
            $wind_dir = tmp[1];
            $wind_speed = tmp[2];
            $wind_gust = tmp[3];

            if(tmp[0]) {
                $s = $s.replace(tmp[0], '');
            }
        } else if((tmp = $s.match(/^g(\d+)t(-{0,1}[\d \.]+)/))) {
            // g000t054r000p010P010h65b10073WS 2300 {UIV32N}
            $wind_gust = tmp[1];

            if(tmp[0]) {
                $s = $s.replace(tmp[0], '');
            }

            $temp = tmp[2];
        } else {
            // warn "wx_parse: no initial match: $s\n";
            return $rethash;
        }

        if(!$temp) {
            $s = $s.replace(/t(-{0,1}\d{1,3})/, function($0, $1) {
                if($1) {
                    $temp = $1;
                }

                return '';
            });
        }

        if(/^\d+$/.test($wind_gust)) {
            $w.wind_gust = (parseFloat($wind_gust) * MPH_TO_MS).toFixed(1);
        }

        if(/^\d+$/.test($wind_dir)) {
            $w.wind_direction = parseFloat($wind_dir).toFixed(0);
        }

        if(/^\d+$/.test($wind_speed)) {
            $w.wind_speed = (parseFloat($wind_speed) * MPH_TO_MS).toFixed(1);
        }

        if(/^-{0,1}\d+$/.test($temp)) {
            $w.temp = this.fahrenheitToCelsius(parseInt($temp)).toFixed(1) ;
        }

        $s = $s.replace(/r(\d{1,3})/, function($0, $1) {
            if($1) {
                $w.rain_1h = (parseFloat($1) * HINCH_TO_MM).toFixed(1); // during last 1h
            }

            return '';
        });

        $s = $s.replace(/p(\d{1,3})/, function($0, $1) {
            if($1) {
                $w.rain_24h = (parseFloat($1) * HINCH_TO_MM).toFixed(1); // during last 24h
            }

            return '';
        });

        $s = $s.replace(/P(\d{1,3})/, function($0, $1) {
            if($1) {
                $w.rain_midnight = (parseFloat($1) * HINCH_TO_MM).toFixed(1); // since midnight
            }

            return '';
        });

        $s = $s.replace(/h(\d{1,3})/, function($0, $1) {
            if($1) {
                $w.humidity = parseInt($1); // percentage

                if($w.humidity == 0) {
                    $w.humidity = 100;
                }

                if($w.humidity > 100 || $w.humidity < 1) {
                    $w.humidity = null;
                }
            }

            return '';
        });

        $s = $s.replace(/b(\d{4,5})/, function($0, $1) {
            if($1) {
                $w.pressure = ($1 / 10).toFixed(1); // results in millibars
            }

            return '';
        });

        $s = $s.replace(/([lL])(\d{1,3})/, function($0, $1, $2) {
            if($2) {
                $w.luminosity = parseFloat($2).toFixed(0); // watts / m2
            }

            if($1 && $1 == 'l') {
                $w.luminosity += 1000;
            }

            return '';
        });

        /*
        if ($s =~ s/v([\-\+]{0,1}\d+)//) {
            # what ?
        }
        */

        $s = $s.replace(/s(\d{1,3})/, function($0, $1) {
            // snowfall
            if($1) {
                $w.snow_24h = ($1 * HINCH_TO_MM).toFixed(1);
            }

            return '';
        });

        /*
        if ($s =~ s/#(\d+)//) {
            # raw rain counter
        }
        */

        tmp = $s.match(/^([rPphblLs#][\. ]{1,5})+/);

        //$s =~ s/^\s+//;
        //$s =~ s/\s+/ /;

        if(/^[a-zA-Z0-9\-_]{3,5}$/.test($s)) {
            if($s != '') {
                $w.soft = $s.substr(0, 16);
            }
        } else {
            $rethash.comment = $s.trim();
        }

        if($w.temp || ($w.wind_speed && $w.wind_direction)) {
            // warn "ok: $initial\n$s\n";
            $rethash.wx = $w;
        }

        return $rethash;
    }

    /**
     * _wx_parse_peet_packet($s, $sourcecall, $rethash)
     *
     * Parses a Peet bros Ultimeter weather packet ($ULTW header).
     */
    private _wx_parse_peet_packet($s: string, $sourcecall: string, $rethash: aprsPacket): aprsPacket {
        /*
        // warn "\$ULTW: $s\n";
        // 0000000001FF000427C70002CCD30001026E003A050F00040000
        let $w = {};
        let $t;
        let $vals = [];

        while(/^([0-9a-f]{4}|----)/i.test($s)) {
            $s = $s.replace(/^([0-9a-f]{4}|----)/i, function($0, $1) {
                if($1 == '----') {
                    $vals.push(null);
                } else {
                    // Signed 16-bit integers in network (big-endian) order
                    // encoded in hex, high nybble first.
                    // Perl 5.10 unpack supports n! for signed ints, 5.8
                    // requires tricks like this:
                    let $v = 0; //= unpack('n', pack('H*', $1));

                    for(var i = 0; i < 4; i++) {
                        var c = $1.charAt(i);

                        $v += parseInt(c, 16) << 12 - (4 * i); // 12 = 16(bits) - 4  shortcut to reduce mathmatical operations
                    }

                    if($v >= 32768) {
                        $v = $v - 65536;
                    }

                    $vals.push($v);
                }

                return '';
            });
        }

        if(!$vals || $vals.length == 0) {
            return 0;
        }

        $t = $vals.shift();
        if($t != null) {
            $w['wind_gust'] = ($t * $kmh_to_ms / 10).toFixed(1);
        }

        $t = $vals.shift();
        if($t != null) {
            $w['wind_direction'] = (($t & 0xff) * 1.41176).toFixed(0);  // 1/255 => 1/360
        }

        $t = $vals.shift();
        if($t != null) {
            $w['temp'] = this._fahrenheit_to_celsius($t / 10).toFixed(1);   // 1/255 => 1/360
        }

        $t = $vals.shift();
        if($t != null) {
            $w['rain_midnight'] = ($t * $hinch_to_mm).toFixed(1);
        }

        $t = $vals.shift();
        if($t && $t >= 10) {
            $w['pressure'] = ($t / 10).toFixed(1);
        }

        // Do we care about these?
        $vals.shift(); // Barometer Delta
        $vals.shift(); // Barometer Corr. Factor (LSW)
        $vals.shift(); // Barometer Corr. Factor (MSW)

        $t = $vals.shift();
        if($t) {
            $w['humidity'] = ($t / 10).toFixed(0);    // percentage

            if($w['humidity'] > 100 || $w['humidity'] < 1) {
                delete $w['humidity'] ;
            }
        }

        // Do we care about these?
        $vals.shift(); // date
        $vals.shift(); // time

        $t = $vals.shift();
        if($t) {
            $w['rain_midnight'] = ($t * $hinch_to_mm).toFixed(1);
        }

        $t = $vals.shift();
        if($t) {
            $w['wind_speed'] = ($t * $kmh_to_ms / 10).toFixed(1);
        }

        if($w['temp']
                || ($w['wind_speed'] && $w['wind_direction'])
                || $w['pressure']
                || $w['humidity']
                ) {
            $rethash['wx'] = $w;

            return 1;
        }

        return 0;
        */

        return null;
    }

    /**
     * _wx_parse_peet_logging($s, $sourcecall, $rethash)
     *
     * Parses a Peet bros Ultimeter weather logging frame (!! header).
     */
    private _wx_parse_peet_logging($s: string, $sourcecall: string, $rethash: aprsPacket): aprsPacket {
        /*
        // warn "\!!: $s\n";
        // 0000000001FF000427C70002CCD30001026E003A050F00040000
        let $w = {};
        let $t;
        let $vals = [];

        while(/^([0-9a-f]{4}|----)/i.test($s)) {
            $s = $s.replace(/^([0-9a-f]{4}|----)/i, function($0, $1) {
                if($1 == '----') {
                    $vals.push(null);
                } else {
                    // Signed 16-bit integers in network (big-endian) order
                    // encoded in hex, high nybble first.
                    // Perl 5.10 unpack supports n! for signed ints, 5.8
                    // requires tricks like this:
                    let $v = 0; //= unpack('n', pack('H*', $1));

                    for(var i = 0; i < 4; i++) {
                        var c = $1.charAt(i);

                        $v += parseInt(c, 16) << 12 - (4 * i); // 12 = 16(bits) - 4  shortcut to reduce mathmatical operations
                    }

                    if($v >= 32768) {
                        $v = $v - 65536;
                    }

                    $vals.push($v);
                }

                return '';
            });
        }

        if(!$vals || $vals.length == 0) {
            return 0;
        }

        //0000 0066 013D 0000 2871 0166 ---- ---- 0158 0532 0120 0210

        $t = $vals.shift(); // instant wind speed
        if($t != null) {
            $w['wind_speed'] = ($t * $kmh_to_ms / 10).toFixed(1);
        }

        $t = $vals.shift();
        if($t != null) {
            $w['wind_direction'] = (($t & 0xff) * 1.41176).toFixed(0); // 1/255 => 1/360
        }

        $t = $vals.shift();
        if($t) {
            $w['temp'] = this._fahrenheit_to_celsius($t / 10).toFixed(1); // 1/255 => 1/360
        }

        $t = $vals.shift();
        if($t) {
            $w['rain_midnight'] = ($t * $hinch_to_mm).toFixed(1);
        }

        $t = $vals.shift();
        if($t && $t >= 10) {
            $w['pressure'] = ($t / 10).toFixed(1);
        }

        $t = $vals.shift();
        if($t) {
            $w['temp_in'] = this._fahrenheit_to_celsius($t / 10).toFixed(1);   // 1/255 => 1/360
        }

        $t = $vals.shift();
        if($t) {
            $w['humidity'] = ($t / 10).toFixed(0);    // percentage

            if($w['humidity'] > 100 || $w['humidity'] < 1) {
                delete $w['humidity'];
            }
        }

        $t = $vals.shift();
        if($t) {
            $w['humidity_in'] = ($t / 10).toFixed(0); // percentage

            if($w['humidity'] > 100 || $w['humidity'] < 1) {
                delete $w['humidity_in'];
            }
        }

        $vals.shift(); // date
        $vals.shift(); // time

        $t = $vals.shift();
        if($t) {
            $w['rain_midnight'] = ($t * $hinch_to_mm).toFixed(1);
        }

        // avg wind speed
        $t = $vals.shift();
        if($t) {
            $w['wind_speed'] = ($t * $kmh_to_ms / 10).toFixed(1);
        }

        // if inside temperature exists but no outside, use inside
        if($w['temp_in'] && !$w['temp']) {
            $w['temp'] = $w['temp_in'];
        }

        if($w['humidity_in'] && !$w['humidity']) {
            $w['humidity'] = $w['humidity_in'];
        }

        if ($w['temp'] || $w['pressure'] || $w['humidity']
                || ($w['wind_speed'] && $w['wind_direction'])) {
            $rethash['wx'] = $w;

            return 1;
        }

        return 0;
        */

        return null;
    }

    /**
     * _telemetry_parse($s, $rethash)
     *
     * Parses a telemetry packet.
     */
    private _telemetry_parse($s: string, $rh: aprsPacket): aprsPacket {
        /*
        let $t = {};

        if(($s = $s.match(/^(\d+),(-|)(\d{1,6}|\d+\.\d+|\.\d+|),(-|)(\d{1,6}|\d+\.\d+|\.\d+|),(-|)(\d{1,6}|\d+\.\d+|\.\d+|),(-|)(\d{1,6}|\d+\.\d+|\.\d+|),(-|)(\d{1,6}|\d+\.\d+|\.\d+|),([01]{0,8})/))) {
            $t['seq'] = $s[1];

            let $vals = [ ($s[2] + $s[3]), ($s[4] + $s[5]), ($s[6] + $s[7]), ($s[8] + $s[9]), ($s[10] + $s[11]) ];

            for(let $i = 0; $i < $vals.length; $i++) {
                //$vals[$i] = $vals[$i] == '' ? 0 : sprintf('%.2f', $vals[$i]);
                if($vals[$i] == '') {
                    $vals[$i] = 0
                } else {
                    $vals[$i] = parseFloat($vals[$i]).toFixed(2);
                }

                if($vals[$i] >= 999999 || $vals[$i] <= -999999) {
                    this.addError($rh, 'tlm_large');
                    return 0;
                }
            }

            $t['vals'] = $vals;
            $t['bits'] = $s[12];

            // expand bits to 8 bits if some are missing
            if($t['bits'].length < 8) {
                $t['bits'] += '0x' + (8 - $t['bits'].length);
            }
        } else {
            this.addError($rh, 'tlm_inv');
            return 0;
        }

        $rh['telemetry'] = $t;

        //warn 'ok: ' . Dumper(\%t);
        return 1;
        */

        return null;
    }

    /**
     * Checks a callsign for validity and strips
     * trailing spaces out and returns the string.
     * @param {string} $callsign Station callsign to validate
     *
     * @returns {string} null on invalid callsign or callsign + ssid
     */
    private _kiss_checkcallsign($callsign: string): string {
        /*
        //if((a = a.match(/[a-zA-Z]+/g))) {
        if(($callsign = $callsign.match(/^([A-Z0-9]+)\s*(|-\d+)$/))) {
            if($callsign[2].length > 0) {
                // check the SSID if given
                if($callsign[2] < -15) {
                    return null;
                }
            }

            return $callsign[1] + $callsign[2];
        }
        */

        // no match
        return null;
    }

    /**
     * =item kiss_to_tnc2($kissframe)
     * Convert a KISS-frame into a TNC-2 compatible UI-frame.
     * Non-UI and non-pid-F0 frames are dropped. The KISS-frame
     * to be decoded should not have FEND (0xC0) characters
     * in the beginning or in the end. Byte unstuffing
     * must not be done before calling this function. Returns
     * a string containing the TNC-2 frame (no CR and/or LF)
     * or undef on error.
     */
    private kiss_to_tnc2($kissframe: string): string {
        /*
        let $asciiframe = '';
        let $dstcallsign = '';
        let $callsigntmp = '';
        let $digipeatercount = 0; // max. 8 digipeaters


        # perform byte unstuffing for kiss first
        $kissframe =~ s/\xdb\xdc/\xc0/g;
        $kissframe =~ s/\xdb\xdd/\xdb/g;

        # length checking _after_ byte unstuffing
        if (length($kissframe) < 16) {
            if ($debug > 0) {
                warn "too short frame to be valid kiss\n";
            }
            return undef;
        }

        # the first byte has to be zero (kiss data)
        if (ord(substr($kissframe, 0, 1)) != 0) {
            if ($debug > 0) {
                warn "not a kiss data frame\n";
            }
            return undef;
        }

        my $addresspart = 0;
        my $addresscount = 0;
        while (length($kissframe) > 0) {
            # in the first run this removes the zero byte,
            # in subsequent runs this removes the previous byte
            $kissframe = substr($kissframe, 1);
            my $charri = substr($kissframe, 0, 1);

            if ($addresspart == 0) {
                $addresscount++;
                # we are in the address field, go on
                # decoding it
                # switch to numeric
                $charri = ord($charri);
                # check whether this is the last
                # (0-bit is one)
                if ($charri & 1) {
                    if ($addresscount < 14 ||
                        ($addresscount % 7) != 0) {
                        # addresses ended too soon or in the
                        # wrong place
                        if ($debug > 0) {
                            warn "addresses ended too soon or in the wrong place in kiss frame\n";
                        }
                        return undef;
                    }
                    # move on to control field next time
                    $addresspart = 1;
                }
                # check the complete callsign
                # (7 bytes)
                if (($addresscount % 7) == 0) {
                    # this is SSID, get the number
                    my $ssid = ($charri >> 1) & 0xf;
                    if ($ssid != 0) {
                        # don't print zero SSID
                        $callsigntmp .= "-" . $ssid;
                    }
                    # check the callsign for validity
                    my $chkcall = _kiss_checkcallsign($callsigntmp);
                    if (not(defined($chkcall))) {
                        if ($debug > 0) {
                            warn "Invalid callsign in kiss frame, discarding\n";
                        }
                        return undef;
                    }
                    if ($addresscount == 7) {
                        # we have a destination callsign
                        $dstcallsign = $chkcall;
                        $callsigntmp = "";
                        next;
                    } elsif ($addresscount == 14) {
                        # we have a source callsign, copy
                        # it to the final frame directly
                        $asciiframe = $chkcall . ">" . $dstcallsign;
                        $callsigntmp = "";
                    } elsif ($addresscount > 14) {
                        # get the H-bit as well if we
                        # are in the path part
                        $asciiframe .= $chkcall;
                        $callsigntmp = "";
                        if ($charri & 0x80) {
                            $asciiframe .= "*";
                        }
                        $digipeatercount++;
                    } else {
                        if ($debug > 0) {
                            warn "Internal error 1 in kiss_to_tnc2()\n";
                        }
                        return undef;
                    }
                    if ($addresspart == 0) {
                        # more address fields will follow
                        # check that there are a maximum
                        # of eight digipeaters in the path
                        if ($digipeatercount >= 8) {
                            if ($debug > 0) {
                                warn "Too many digipeaters in kiss packet, discarding\n";
                            }
                            return undef;
                        }
                        $asciiframe .= ",";
                    } else {
                        # end of address fields
                        $asciiframe .= ":";
                    }
                    next;
                }
                # shift one bit right to get the ascii
                # character
                $charri >>= 1;
                $callsigntmp .= chr($charri);

            } elsif ($addresspart == 1) {
                # control field. we are only interested in
                # UI frames, discard others
                $charri = ord($charri);
                if ($charri != 3) {
                    if ($debug > 0) {
                        warn "not UI frame, skipping\n";
                    }
                    return undef;
                }
                #print " control $charri";
                $addresspart = 2;

            } elsif ($addresspart == 2) {
                # PID
                #printf(" PID %02x data: ", ord($charri));
                # we want PID 0xFO
                $charri = ord($charri);
                if ($charri != 0xf0) {
                    if ($debug > 0) {
                        warn "PID not 0xF0, skipping\n";
                    }
                    return undef;
                }
                $addresspart = 3;

            } else {
                # body
                $asciiframe .= $charri;
            }
        }

        # Ok, return whole frame
        return $asciiframe;
        */

        return null;
    }

    /**
     * =item tnc2_to_kiss($tnc2frame)
     * Convert a TNC-2 compatible UI-frame into a KISS data
     * frame (single port KISS TNC). The frame will be complete,
     * i.e. it has byte stuffing done and FEND (0xC0) characters
     * on both ends. If conversion fails, return undef.
     */
    private tnc2_to_kiss($gotframe: string): string {
        let $kissframe = 0x00; // kiss frame starts with byte 0x00
        /*
        let $body;
        let $header;

        # separate header and body
        if ($gotframe =~ /^([A-Z0-9,*>-]+):(.+)$/o) {
            $header = $1;
            $body = $2;
        } else {
            if ($debug > 0) {
                warn "tnc2_to_kiss(): separation into header and body failed\n";
            }
            return undef;
        }

        # separate the sender, recipient and digipeaters
        my $sender;
        my $sender_ssid;
        my $receiver;
        my $receiver_ssid;
        my $digipeaters;
        if ($header =~ /^([A-Z0-9]{1,6})(-\d+|)>([A-Z0-9]{1,6})(-\d+|)(|,.*)$/o) {
            $sender = $1;
            $sender_ssid = $2;
            $receiver = $3;
            $receiver_ssid = $4;
            $digipeaters = $5;
        } else {
            if ($debug > 0) {
                warn "tnc2_to_kiss(): separation of sender and receiver from header failed\n";
            }
            return undef;
        }

        # Check SSID format and convert to number
        if (length($sender_ssid) > 0) {
            $sender_ssid = 0 - $sender_ssid;
            if ($sender_ssid > 15) {
                if ($debug > 0) {
                    warn "tnc2_to_kiss(): sender SSID ($sender_ssid) is over 15\n";
                }
                return undef;
            }
        } else {
            $sender_ssid = 0;
        }
        if (length($receiver_ssid) > 0) {
            $receiver_ssid = 0 - $receiver_ssid;
            if ($receiver_ssid > 15) {
                if ($debug > 0) {
                    warn "tnc2_to_kiss(): receiver SSID ($receiver_ssid) is over 15\n";
                }
                return undef;
            }
        } else {
            $receiver_ssid = 0;
        }
        # pad callsigns to 6 characters with space
        $sender .= ' ' x (6 - length($sender));
        $receiver .= ' ' x (6 - length($receiver));
        # encode destination and source
        for (my $i = 0; $i < 6; $i++) {
            $kissframe .= chr(ord(substr($receiver, $i, 1)) << 1);
        }
        $kissframe .= chr(0xe0 | ($receiver_ssid << 1));
        for (my $i = 0; $i < 6; $i++) {
            $kissframe .= chr(ord(substr($sender, $i, 1)) << 1);
        }
        if (length($digipeaters) > 0) {
            $kissframe .= chr(0x60 | ($sender_ssid << 1));
        } else {
            $kissframe .= chr(0x61 | ($sender_ssid << 1));
        }

        # if there are digipeaters, add them
        if (length($digipeaters) > 0) {
            $digipeaters =~ s/,//; # remove the first comma
            # split into parts
            my @digis = split(/,/, $digipeaters);
            my $digicount = scalar(@digis);
            if ($digicount > 8 || $digicount < 1) {
                # too many (or none?!?) digipeaters
                if ($debug > 0) {
                    warn "tnc2_to_kiss(): too many (or zero) digipeaters: $digicount\n";
                }
                return undef;
            }
            for (my $i = 0; $i < $digicount; $i++) {
                # split into callsign, SSID and h-bit
                if ($digis[$i] =~ /^([A-Z0-9]{1,6})(-\d+|)(\*|)$/o) {
                    my $callsign = $1 . ' ' x (6 - length($1));
                    my $ssid = 0;
                    my $hbit = 0x00;
                    if (length($2) > 0) {
                        $ssid = 0 - $2;
                        if ($ssid > 15) {
                            if ($debug > 0) {
                                warn "tnc2_to_kiss(): digipeater nr. $i SSID ($ssid) invalid\n";
                            }
                            return undef;
                        }
                    }
                    if ($3 eq '*') {
                        $hbit = 0x80;
                    }
                    # add to kiss frame
                    for (my $k = 0; $k < 6; $k++) {
                        $kissframe .= chr(ord(substr($callsign, $k, 1)) << 1);
                    }
                    if ($i + 1 < $digicount) {
                        # more digipeaters to follow
                        $kissframe .= chr($hbit | 0x60 | ($ssid << 1));
                    } else {
                        # last digipeater
                        $kissframe .= chr($hbit | 0x61 | ($ssid << 1));
                    }

                } else {
                    if ($debug > 0) {
                        warn "tnc2_to_kiss(): digipeater nr. $i parsing failed\n";
                    }
                    return undef;
                }
            }
        }

        # add frame type (0x03) and PID (0xF0)
        $kissframe .= chr(0x03) . chr(0xf0);
        # add frame body
        $kissframe .= $body;
        # perform KISS byte stuffing
        $kissframe =~ s/\xdb/\xdb\xdd/g;
        $kissframe =~ s/\xc0/\xdb\xdc/g;
        # add FENDs
        $kissframe = chr(0xc0) . $kissframe . chr(0xc0);
        *

        return $kissframe;
        */

        return null;
    }

    /**
     * =item aprs_duplicate_parts($packet)
     * Accepts a TNC-2 format frame and extracts the original
     * sender callsign, destination callsign (without ssid) and
     * payload data for duplicate detection. Returns
     * sender, receiver and body on success, undef on error.
     * In the case of third party packets, always gets this
     * information from the innermost data. Also removes
     * possible trailing spaces to improve detection
     * (e.g. aprsd replaces trailing CRs or LFs in a packet with a space).
     */
    private aprs_duplicate_parts($packet: string): any {
        /*
        # If this is a third party packet format,
        # strip out the outer layer and focus on the inside.
        # Do this several times in a row if necessary
        while (1) {
            if ($packet =~ /^[^:]+:\}(.*)$/io) {
                $packet = $1;
            } else {
                last;
            }
        }

        if ($packet =~ /^([A-Z0-9]{1,6})(-[A-Z0-9]{1,2}|)>([A-Z0-9]{1,6})(-\d{1,2}|)(:|,[^:]+:)(.*)$/io) {
            my $source;
            my $destination;
            my $body = $6;
            if ($2 eq "") {
                # ssid 0
                $source = $1 . "-0";
            } else {
                $source = $1 . $2;
            }
            # drop SSID for destination
            $destination = $3;
            # remove trailing spaces from body
            $body =~ s/\s+$//;
            return ($source, $destination, $body);
        }
        */

        return null;
    }

    /**
     * =item make_object($name, $tstamp, $lat, $lon, $symbols, $speed, $course, $altitude, $alive, $usecompression, $posambiguity, $comment)
     * Creates an APRS object. Returns a body of an APRS object, i.e. ";OBJECTNAM*DDHHMM/DDMM.hhN/DDDMM.hhW$CSE/SPDcomments..."
     * or undef on error.
     * Parameters:
     *  1st: object name, has to be valid APRS object name, does not need to be space-padded
     *  2nd: object timestamp as a unix timestamp, or zero to use current time
     *  3rd: object latitude, decimal degrees
     *  4th: object longitude, decimal degrees
     *  5th: object symbol table (or overlay) and symbol code, two bytes if the given symbole length is zero (""), use point (//)
     *  6th: object speed, -1 if non-moving (km/h)
     *  7th: object course, -1 if non-moving
     *  8th: object altitude, -10000 or less if not used
     *  9th: alive or dead object (0 == dead, 1 == alive)
     *  10th: compressed (1) or uncompressed (0)
     *  11th: position ambiguity (0..4)
     *  12th: object comment text
     * Note: Course/speed/altitude/compression is not implemented.
     * This function API will probably change in the near future. The long list of
     * parameters should be changed to hash with named parameters.
     */
    private make_object($name: string, $tstamp: number, $lat: number, $lon: number, $symbols:string
            , $speed: number, $course: number, $altitude: number, $alive: boolean
            , $usecompression: boolean, $posambiguity: number, $comment: string): string {

        // FIXME: course/speed/altitude/compression not implemented

        let $packetbody = ";";

        /*
        # name
        if ($name =~ /^([\x20-\x7e]{1,9})$/o) {
            # also pad with whitespace
            $packetbody .= $1 . " " x (9 - length($1));
        } else {
            return undef;
        }

        # dead/alive
        if ($alive == 1) {
            $packetbody .= "*";
        } elsif ($alive == 0) {
            $packetbody .= "_";
        } else {
            return undef;
        }

        # timestamp, hardwired for DHM
        my $aptime = make_timestamp($tstamp, 0);
        if (not(defined($aptime))) {
            return undef;
        } else {
            $packetbody .= $aptime;
        }

        # actual position
        my $posstring = make_position($lat, $lon, $speed, $course, $altitude, $symbols, $usecompression, $posambiguity);
        if (not(defined($posstring))) {
            return undef;
        } else {
            $packetbody .= $posstring;
        }

        # add comments to the end
        $packetbody .= $comment;

        return $packetbody;
        */
        return null;
    }

    /**
     * =item make_timestamp($timestamp, $format)
     * Create an APRS (UTC) six digit (DHM or HMS) timestamp from a unix timestamp.
     * The first parameter is the unix timestamp to use, or zero to use
     * current time. Second parameter should be one for
     * HMS format, zero for DHM format.
     * Returns a 7-character string (e.g. "291345z") or undef on error.
     */
    private make_timestamp($tstamp: number, $tformat: number): string {
        /*
        if($tstamp == 0) {
            $tstamp = new Date(); // Should already be UTC
        } else {
            // TODO: convert $tstamp from string to time?
        }

        // Is this check needed with js?
        if(!$tstamp.getUTCDay()) {
            return null;
        }

        let $tstring = "";

        if ($tformat == 0) {
            $tstring = "00".substring(0, 2 - $tstamp.getUTCDay().length) + ('' + $tstamp.getUTCDay())
                    + "00".substring(0, 2 - $tstamp.getUTCHours().length) + ('' + $tstamp.getUTCHours())
                    + "00".substring(0, 2 - $tstamp.getUTCMinutes().length) + ('' + $tstamp.getUTCMinutes())
                    + 'z';
            //$tstring = sprintf("%02d%02d%02dz", $day, $hour, $minute);
        } else if($tformat == 1) {
            //$tstring = sprintf("%02d%02d%02dh", $hour, $minute, $sec);
            $tstring = "00".substring(0, 2 - $tstamp.getUTCHours().length) + ('' + $tstamp.getUTCHours())
                    + "00".substring(0, 2 - $tstamp.getUTCMinutes().length) + ('' + $tstamp.getUTCMinutes())
                    + "00".substring(0, 2 - $tstamp.getUTCSeconds().length) + ('' + $tstamp.getUTCSeconds())
                    + 'h';
        } else {
            return null;
        }

        return $tstring;
        */

        return null;
    }

    /**
     * =item make_position($lat, $lon, $speed, $course, $altitude, $symbols, $usecompression, $posambiguity)
     * Creates an APRS position for position/object/item. Parameters:
     *  1st: latitude in decimal degrees
     *  2nd: longitude in decimal degrees
     *  3rd: speed in km/h, -1 == don't include
     *  4th: course in degrees, -1 == don't include. zero == unknown course, 360 == north
     *  5th: altitude in meters above mean sea level, -10000 or under == don't use
     *  6th: aprs symbols to use, first table/overlay and then code (two bytes). If string length is zero (""), uses default.
     *  7th: use compression (1) or not (0)
     *  8th: use amount (0..4) of position ambiguity. Note that position ambiguity and compression can't be used at the same time.
     * Returns a string such as "1234.56N/12345.67E/CSD/SPD" or in
     * compressed form "F*-X;n_Rv&{-A" or undef on error.
     * Please note: course/speed/altitude are not supported yet, and neither is compressed format or position ambiguity.
     * This function API will probably change in the near future. The long list of
     * parameters should be changed to hash with named parameters.
     */
    private make_position($lat: number, $lon: number, $speed: number, $course: number
            , $altitude: number, $symbols: string, $usecompression: boolean, $posambiguity: number) {

        // FIXME: course/speed/altitude are not supported yet,
        //        neither is compressed format or position ambiguity

        /*
        if ($lat < -89.99999 ||
            $lat > 89.99999 ||
            $lon < -179.99999 ||
            $lon > 179.99999) {
            # invalid location
            return undef;
        }

        my $symboltable = "";
        my $symbolcode = "";
        if (length($symbols) == 0) {
            $symboltable = "/";
            $symbolcode = "/";
        } elsif ($symbols =~ /^([\/\\A-Z0-9])([\x21-\x7b\x7d])$/o) {
            $symboltable = $1;
            $symbolcode = $2;
        } else {
            return undef;
        }


        if ($usecompression == 1) {
            my $latval = 380926 * (90 - $lat);
            my $lonval = 190463 * (180 + $lon);
            my $latstring = "";
            my $lonstring = "";
            for (my $i = 3; $i >= 0; $i--) {
                # latitude character
                my $value = int($latval / (91 ** $i));
                $latval = $latval % (91 ** $i);
                $latstring .= chr($value + 33);
                # longitude character
                $value = int($lonval / (91 ** $i));
                $lonval = $lonval % (91 ** $i);
                $lonstring .= chr($value + 33);
            }
            # encode overlay character if it is a number
            $symboltable =~ tr/0-9/a-j/;
            # FIXME: no speed/course/altitude/radiorange encoding
            my $retstring = $symboltable . $latstring . $lonstring . $symbolcode;
            if ($speed >= 0 && $course > 0 && $course <= 360) {
                # In APRS spec unknown course is zero normally (and north is 360),
                # but in compressed aprs north is zero and there is no unknown course.
                # So round course to nearest 4-degree section and remember
                # to do the 360 -> 0 degree transformation.
                my $cval = int(($course + 2) / 4);
                if ($cval > 89) {
                    $cval = 0;
                }
                $retstring .= chr($cval + 33);
                # speed is in knots in compressed form. round to nearest integer
                my $speednum = int((log(($speed / $knot_to_kmh) + 1) / log(1.08)) + 0.5);
                if ($speednum > 89) {
                    # limit top speed
                    $speednum = 89;
                }
                $retstring .= chr($speednum + 33) . "A";
            } else {
                $retstring .= "  A";
            }
            return $retstring;

        # normal position format
        } else {
            # convert to degrees and minutes
            my $isnorth = 1;
            if ($lat < 0.0) {
                $lat = 0 - $lat;
                $isnorth = 0;
            }
            my $latdeg = int($lat);
            my $latmin = sprintf("%04d", ($lat - $latdeg) * 6000);
            my $latstring = sprintf("%02d%02d.%02d", $latdeg, substr($latmin, 0, 2), substr($latmin, 2, 2));
            if ($posambiguity > 0 || $posambiguity <= 4) {
                # position ambiguity
                if ($posambiguity <= 2) {
                    # only minute decimals are blanked
                    $latstring = substr($latstring, 0, 7 - $posambiguity) . " " x $posambiguity;
                } elsif ($posambiguity == 3) {
                    $latstring = substr($latstring, 0, 3) . " .  ";
                } elsif ($posambiguity == 4) {
                    $latstring = substr($latstring, 0, 2) . "  .  ";
                }
            }
            if ($isnorth == 1) {
                $latstring .= "N";
            } else {
                $latstring .= "S";
            }
            my $iseast = 1;
            if ($lon < 0.0) {
                $lon = 0 - $lon;
                $iseast = 0;
            }
            my $londeg = int($lon);
            my $lonmin = sprintf("%04d", ($lon - $londeg) * 6000);
            my $lonstring = sprintf("%03d%02d.%02d", $londeg, substr($lonmin, 0, 2), substr($lonmin, 2, 2));
            if ($posambiguity > 0 || $posambiguity <= 4) {
                # position ambiguity
                if ($posambiguity <= 2) {
                    # only minute decimals are blanked
                    $lonstring = substr($lonstring, 0, 8 - $posambiguity) . " " x $posambiguity;
                } elsif ($posambiguity == 3) {
                    $lonstring = substr($lonstring, 0, 4) . " .  ";
                } elsif ($posambiguity == 4) {
                    $lonstring = substr($lonstring, 0, 3) . "  .  ";
                }
            }
            if ($iseast == 1) {
                $lonstring .= "E";
            } else {
                $lonstring .= "W";
            }

            my $retstring;

            if ($options->{'timestamp'}) {
                my($sec,$min,$hour) = gmtime($options->{'timestamp'});
                $retstring = sprintf('/%02d%02d%02dh', $hour, $min, $sec);
            } else {
                $retstring = '!';
            }
            $retstring .= $latstring . $symboltable . $lonstring . $symbolcode;

            # add course/speed, if given
            if ($speed >= 0 && $course >= 0) {
                # convert speed to knots
                $speed = $speed / $knot_to_kmh;
                if ($speed > 999) {
                    $speed = 999; # maximum speed
                }
                if ($course > 360) {
                    $course = 0; # unknown course
                }
                $retstring .= sprintf("%03d/%03d", $course, $speed);
            }
            return $retstring;
        }
        */
    }
}
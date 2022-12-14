import { ConversionConstantEnum } from "./ConversionConstantEnum";
import { BuildPositionModel } from "./BuildPositionModel";
import { TimeFormatEnum } from "./TimeFormatEnum";
import { NmeaSourceEnum } from "./NmeaSourceEnum";
import { CompressionOriginEnum } from "./CompressionOriginEnum";

export class PacketFactory {
    /**
     * TODO: Move to factory class
     *
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
     *
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
        my $posstring = make_position($lat, $lon, $speed, $course, $altitude, $symbols, $optionref);
        if (not(defined($posstring))) {
            return undef;
        } else {
            $packetbody .= $posstring;
        }

        # add comments to the end
        $packetbody .= $comment;

        return $packetbody;
        *
        return null;
    }
    */

    /**
     * Create an APRS (UTC) six digit (DHM or HMS) timestamp from a unix timestamp.
     *
     * @param {number} timestamp = unix timestamp
     * @param {TimeFormatEnum} timeFormat - format to use for timestamp
     *
     * @returns {string} - 7 character time string (e.g. "291345z")
     */
    public makeTimestamp(timestamp: number, timeFormat: TimeFormatEnum): string {
        let date: Date

        if(timestamp == 0) {
            date = new Date(); // Should already be UTC
        } else {
            date = new Date(timestamp);
        }

        let retVal = "";

        if (timeFormat == TimeFormatEnum.DHM) {
            retVal = String(date.getUTCDate()).padStart(2, "0")
                    + String(date.getUTCHours()).padStart(2, "0")
                    + String(date.getUTCMinutes()).padStart(2, "0")
                    + 'z';
            //$tstring = sprintf("%02d%02d%02dz", $day, $hour, $minute);
        } else if(timeFormat == TimeFormatEnum.HMS) {
            //$tstring = sprintf("%02d%02d%02dh", $hour, $minute, $sec);
            retVal = String(date.getUTCHours()).padStart(2, "0")
                    + String(date.getUTCMinutes()).padStart(2, "0")
                    + String(date.getUTCSeconds()).padStart(2, "0")
                    + "h"
        } else {
            throw new Error("Unsupported time format.");
        }

        return retVal;
    }

    /**
     * Creates an APRS position for position/object/item.
     *
     * @param {BuildPositionModel} data - See model class
     * @returns {string} - "!1234.56N/12345.67E/CSD/SPD" or in compressed form "!F*-X;n_Rv&{-A" or an error.
     */
    public makePosition(data: BuildPositionModel): string | null {
        let retVal = "";

        try {
            retVal = this.buildData(data)
        } catch(e) {
            throw e;
        }

        // add the correct packet type character based on messaging and timestamp
        if(data.timestamp && data.timestamp != null) {
            if(data.isMessagingEnabled && data.isMessagingEnabled == true) {
                retVal = `@${retVal}`;
            } else {
                retVal = `/${retVal}`;
            }
        } else {
            if(data.isMessagingEnabled && data.isMessagingEnabled == true) {
                retVal = `=${retVal}`;
            } else {
                retVal = `!${retVal}`;
            }
        }

        return retVal;
    }

    // TODO: GPS Fix Status, NMEA Source, Compression Origin
    private buildData(data: BuildPositionModel): string | null {
        if(!data || data == null) {
            throw new Error("No data provided.")
        }

        if(data.ambiguity && data.ambiguity != null && data.ambiguity != undefined) {
            // can't be ambiguous and then add precision with !DAO!
            data.isUseDao = false;
        }

        if(!data.latitude || data.latitude == null || data.latitude < -89.99999 || data.latitude > 89.99999
                || !data.longitude || data.longitude == null || data.longitude < -179.99999 || data.longitude > 179.99999) {
            // invalid location
            throw new Error("Invalid location.")
        }

        let symbolTable = "";
        let symbolCode = "";
        let tmpSymbols = []

        if(data.symbols == null || data.symbols == "") {
            symbolTable = "/";
            symbolCode = "/";
        } else if(tmpSymbols = data.symbols.match(/^([\/\\A-Z0-9])([\x21-\x7b\x7d])$/)) {
            symbolTable = tmpSymbols[1];
            symbolCode = tmpSymbols[2];
        } else {
            throw new Error("Invalid symbols.");
        }

        // Build the return string little by little, first populate with position, either compressed or uncompressed
        let retVal = "";
        let latMinDao;
        let lonMinDao;

        if(data.isUseCompression == true) {
            let lat = 380926 * (90 - data.latitude);
            let lon = 190463 * (180 + data.longitude);
            let latString = "";
            let lonString = "";

            for(let i = 3; i >= 0; i--) {
                // latitude character
                let value = Math.floor(lat / (91 ** i));
                lat = lat % (91 ** i);
                latString += String.fromCharCode(value + 33);

                // longitude character
                value = Math.floor(lon / (91 ** i));
                lon = lon % (91 ** i);
                lonString += String.fromCharCode(value + 33);
            }

            // encode overlay character if it is a number
            if(isNaN(Number(symbolTable)) == false) {
                symbolTable = [ "a", "b", "c", "d", "e", "f", "g", "h", "i", "j" ][Number(symbolTable)];
            }

            // FIXME: no altitude/radiorange encoding
            // but /A= comment altitude can be used
            retVal = symbolTable + latString + lonString + symbolCode;

            if(data.speed != null && data.speed >= 0
                    && data.course != null && data.course > 0 && data.course <= 360
                    ) {
                // In APRS spec unknown course is zero normally (and north is 360),
                // but in compressed aprs north is zero and there is no unknown course.
                // So round course to nearest 4-degree section and remember
                // to do the 360 -> 0 degree transformation.
                let cVal = Math.floor((data.course + 2) / 4);

                if(cVal > 89) {
                    cVal = 0;
                }

                retVal += String.fromCharCode(cVal + 33);

                // speed is in knots in compressed form. round to nearest integer
                let speedNum = Math.floor((Math.log((data.speed / ConversionConstantEnum.KNOT_TO_KMH) + 1) / Math.log(1.08)) + 0.5);

                if(speedNum > 89) {
                    // limit top speed
                    speedNum = 89;
                }

                // NOTE: This could be A or C see p 39 of the spec.
                retVal += String.fromCharCode(speedNum + 33);
            } else {
                retVal += "  "
            }

            // Compression type.  Hard code for now
            const compressionType = String.fromCharCode(parseInt("001" + NmeaSourceEnum.OTHER + CompressionOriginEnum.COMPRESSED, 2) + 33);
            retVal += compressionType;
        } else {    // normal position format
            // convert to degrees and minutes
            let isNorth: boolean = true;
            let latitude = data.latitude
            let longitude = data.longitude

            if(latitude && latitude != null && latitude < 0.0) {
                latitude = latitude * -1;
                isNorth = false;
            }

            let latDegrees = Math.floor(latitude);
            let latMin = (latitude - latDegrees) * 60;
            let latMinStr;

            // if we're doing DAO, round to 6 digits and grab the last 2 characters for DAO
            if(data.isUseDao != null && data.isUseDao == true) {
                latMinStr = String((latMin * 10000).toFixed(0)).padStart(6, "0")
                latMinDao = latMinStr.substring(4, 6);
            } else {
                latMinStr = String((latMin * 100).toFixed(0)).padStart(4, "0")
            }

            // check for rouding to 60 minutes and fix to 59.99 and DAO to 99
            if(latMinStr.match(/^60/)) {
                latMinStr = "5999";
                latMinDao = "99";
            }

            let latString = String(latDegrees).padStart(2, "0")
                    +  String(latMinStr).substring(0, 2).padStart(2, "0")
                    + "."
                    + String(latMinStr).substring(2, 4);

            if(data.ambiguity && data.ambiguity > 0 && data.ambiguity <= 4) {
                // position ambiguity
                if(data.ambiguity <= 2) {
                    // only minute decimals are blanked
                    latString = latString.substring(0, 7 - data.ambiguity).padEnd(7, " ")
                } else if(data.ambiguity == 3) {
                    latString = latString.substring(0, 3) + " .  ";
                } else if(data.ambiguity == 4) {
                    latString = latString.substring(0, 2) + "  .  ";
                }
            }

            if (isNorth == true) {
                latString += "N";
            } else {
                latString += "S";
            }

            let isEast = 1;
            if(longitude && longitude != null && longitude < 0.0) {
                longitude = longitude * -1;
                isEast = 0;
            }

            let lonDegrees = Math.floor(longitude);
            let lonMin = (longitude - lonDegrees) * 60;
            let lonMinStr;

            // if we're doing DAO, round to 6 digits and grab the last 2 characters for DAO
            if(data.isUseDao != null && data.isUseDao == true) {
                lonMinStr = String((lonMin * 10000).toFixed(0)).padStart(6, "0")
                lonMinDao = lonMinStr.substring(4, 6)
            } else {
                lonMinStr = String((lonMin * 100).toFixed(0)).padStart(4, "0")
            }

            // check for rouding to 60 minutes and fix to 59.99 and DAO to 99
            if(lonMinStr.match(/^60/)) {
                lonMinStr = "5999";
                lonMinDao = "99";
            }

            let lonString = String(lonDegrees).padStart(3, "0") + String(lonMinStr).substring(0, 2) + "." + String(lonMinStr).substring(2, 4);

            if(data.ambiguity && data.ambiguity > 0 && data.ambiguity <= 4) {
                // position ambiguity
                if(data.ambiguity <= 2) {
                    // only minute decimals are blanked
                    lonString = lonString.substring(0, 8 - data.ambiguity).padEnd(8, " ");
                } else if(data.ambiguity == 3) {
                    lonString = lonString.substring(0, 4) + " .  ";
                } else if(data.ambiguity == 4) {
                    lonString = lonString.substring(0, 3) + "  .  ";
                }
            }

            if(isEast == 1) {
                lonString += "E";
            } else {
                lonString += "W";
            }

            retVal += latString + symbolTable + lonString + symbolCode;

            let course = data.course;
            let speed = data.speed;

            // add course/speed, if given
            if(course && course != null && course >= 0
                    && speed && speed != null && speed >= 0 ) {
                // convert speed to knots
                speed = speed / ConversionConstantEnum.KNOT_TO_KMH;

                if(speed > 999) {
                    speed = 999;   // maximum speed
                }

                if(course > 360) {
                    course = 0;    // unknown course
                }

                retVal += String(course).padStart(3, "0") + "/" + String(speed).padStart(3, "0");
            }
        }

        if(data.altitude && data.altitude != null) {
            let altitude = data.altitude / ConversionConstantEnum.FEET_TO_METERS;

            // /A=(-\d{5}|\d{6})
            if(altitude >= 0) {
                retVal += "/A=" + String(altitude.toFixed(0)).padStart(6, "0")
            } else {
                retVal += "/A=-" + Math.abs(altitude).toFixed(0).padStart(5, "0")
            }
        }

        if(data.comment && data.comment != null && data.comment != "") {
            retVal += data.comment;
        }

        if(data.isUseCompression == false && data.isUseDao != null && data.isUseDao == true) {
            // !DAO! extension, use Base91 format for best precision
            // /1.1 : scale from 0.99 to 0..90 for base91, int(... + 0.5): round to nearest integer
            retVal += '!w' + String.fromCharCode((Math.floor(Number(latMinDao)) / 1.1 + 0.5) + 33)
                    + String.fromCharCode((Math.floor(Number(lonMinDao)) / 1.1 + 0.5) + 33) + '!';
        }

        if(data.timestamp != null) {
            let timestamp = data.timestamp

            // This *shouldn't* be possible to hit
            if(/^\d+$/.test(timestamp.toString()) == false) {
                throw new Error("Timestamp must be numeric.");
            }

            let now = new Date().getTime();

            if(timestamp == 0) {
                timestamp = now;
            }

            let age = now - timestamp;

            // NOTE: 86400 seconds in a day
            if(age < -3610) {
                // over 1 hour into the future, fail
                throw new Error("Timestamp too far in the futre.")
            } else if(age < 84600) {   // 86400 - 1800
                //  within the last 23 hours, HMS
                retVal = `${ this.makeTimestamp(timestamp, TimeFormatEnum.HMS) }${retVal}`
            } else if(age < 2419200) {   // 28 * 86400
                // within the last 28 days, DHM
                retVal = `${ this.makeTimestamp(timestamp, TimeFormatEnum.DHM) }${retVal}`
            } else {
                // over 28 days into the past, fail
                throw new Error("Timestamp too far in the past.")
            }

            // check for failed timestamp generation
            // This *shouldn't* be possible to hit
            //if(!retVal || retVal == null || retVal == "") {
            //    throw new Error("Packet contains no data.");
            //}
        }

        return retVal;
    }
}


    /**
     * =item tnc2_to_kiss($tnc2frame)
     * Convert a TNC-2 compatible UI-frame into a KISS data
     * frame (single port KISS TNC). The frame will be complete,
     * i.e. it has byte stuffing done and FEND (0xC0) characters
     * on both ends. If conversion fails, return undef.
     *
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
        *

        return null;
    }
    */

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
     *
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
        *

        return null;
    }
    */

    /**
     * Checks a callsign for validity and strips
     * trailing spaces out and returns the string.
     * @param {string} $callsign Station callsign to validate
     *
     * @returns {string} null on invalid callsign or callsign + ssid
     *
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
        *

        // no match
        return null;
    }
    */

    /**
     * =item kiss_to_tnc2($kissframe)
     * Convert a KISS-frame into a TNC-2 compatible UI-frame.
     * Non-UI and non-pid-F0 frames are dropped. The KISS-frame
     * to be decoded should not have FEND (0xC0) characters
     * in the beginning or in the end. Byte unstuffing
     * must not be done before calling this function. Returns
     * a string containing the TNC-2 frame (no CR and/or LF)
     * or undef on error.
     *
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
        *

        return null;
    }
    */

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
     * TODO: Move to factory class
     *
     * =item make_timestamp($timestamp, $format)
     * Create an APRS (UTC) six digit (DHM or HMS) timestamp from a unix timestamp.
     * The first parameter is the unix timestamp to use, or zero to use
     * current time. Second parameter should be one for
     * HMS format, zero for DHM format.
     * Returns a 7-character string (e.g. "291345z") or undef on error.
     *
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
        *

        return null;
    }
    */

    /**
     * TODO: Move to factory class
     *
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
     *
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
        *
    }
    */
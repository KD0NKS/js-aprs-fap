    /**
     * mice_mbits_to_message($packetdata{'mbits'})
     * Convert mic-e message bits (three numbers 0-2) to a textual message.
     *
     * @param {Number} $bits Three numbers 0 - 2
     * @returns {string} the message on success, null on failure.
     *
    private mice_mbits_to_message($bits: string): aprsPacket {
        /*
        if(($bits = $bits.match(/^\s*([0-2]{3})\s*$/))) {
            $bits = $bits[1];

            if(mice_messagetypes[$bits]) {
                return mice_messagetypes[$bits];
            }
        }
        *

        return null;
    }
    */

    /**
     * If no parameter is given, use current time,
     * else use the unix timestamp given in the parameter.
     *
     * @returns {string} A human readable timestamp in UTC, string form.
     *
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
        *

        return null;
    }
    */

    /**
     * TODO: Move to utility class
     * Calculates the distance in kilometers between two locations
     * given in decimal degrees.  East and North positive. The calculation uses the great circle distance, it
     * is not too exact, but good enough for us.
     *
     * @param {float} $lon0 The first station's longitude.
     * @param {float} $lat0 The first station's latitude.
     * @param {float} $lon1 The second station's longitude.
     * @param {float} $lat1 The second station's latitude.
     * @returns {float} The distance between 2 stations
     *
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
        *

        return null;
    }
    */

    /**
     * TODO: Move to utility class
     * Returns the initial great circle direction in degrees
     * from lat0/lon0 to lat1/lon1. Locations are input
     * in decimal degrees, north and east positive.
     *
     * @param {float} $lon0 Longitude of the first station.
     * @param {float} $lat0 Latitude of the first station.
     * @param {float} $lon1 Longitude of the second station.
     * @param {float} $lat1 Latitude of the second station.
     * @return {float} The initial great circle direction in degrees from lat0/lon0 to lat1/lon1.
     *
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
        *

        return null;
    }
    */

    /**
     * TODO: Move to utility class
     *
     * Count the number of digipeated hops in a (KISS) packet and return it. Returns -1 in case of error.
     * The header parameter can contain the full packet or just the header
     * in TNC2 format. All callsigns in the header must be AX.25 compatible
     * and remember that the number returned is just an educated guess, not
     * absolute truth.
     *
     * @param {string} $header Full APRS packet or just the header of the packet
     * @returns {Number} The number of digipeated hops in the KISS packet.
     *
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
        *

        return null;
    }
    */
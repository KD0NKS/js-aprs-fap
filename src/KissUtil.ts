export class KissUtil {
    /**
     * Checks a callsign for validity and strips trailing spaces out and returns the string.
     * @returns {string|null} null on invalid callsign
     */
    public checkKissCallsign(callsign: string): string | null {
        const matches = callsign.match(/^([A-Z0-9]+)\s*(|-\d+)$/)

        if(matches && matches.length > 0) {
            if(matches[2] == undefined || matches[2] == null || matches[2].trim().length === 0) {
                // check the SSID if given
                if(parseInt(matches[2]) < -15) {
                    return null;
                }
            }

            return `${matches[1]}${matches[2]}`;
        }

        // no match
        return null;
    }

    /**
     * Convert a KISS-frame into a TNC-2 compatible UI-frame. Non-UI and non-pid-F0 frames are dropped.
     * @param {string} frame The KISS-frame to be decoded should not have FEND (0xC0) characters
     * in the beginning or in the end. Byte unstuffing must not be done before calling this function.
     * @returns {string} A string containing the TNC-2 frame (no CR and/or LF) or undef on error.
    */
    public kissToTnc2(frame: string): string | null {
        let asciiFrame = "";
        let dstCallsign = "";
        let callsignTmp = "";
        let digipeaterCount = 0; // #max. 8 digipeaters

        // byte unstuffing
        // TODO: Don't think this is working properly after being converted to TypeScript
        frame.replace(/\xDB\xDC\xC0\xDB\xDD\xDB/, '');

        // length checking after byte unstuffing
        if(frame.length < 16) {
            return null;
        }

        // the first byte hast bo be zero (kiss data)
        if(frame.charCodeAt(0) != 0) {
            throw new Error(`not a kiss frame ${frame.charCodeAt(0)}.`);
        }

        let addressPart = 0;
        let addressCount = 0;

        do {
            // in the first run this removes the zero byte,
		    // in subsequent runs this removes the previous byte
		    frame = frame.substring(1);
		    let charri: string = frame.substring(0, 1);
            let charCode = frame.charCodeAt(0);

            if(addressPart == 0) {
                addressCount++;

                // check whether this is the last
                // (0-bit is one)
                if(charCode & 1) {
                    if(addressCount < 14 || (addressCount % 7) != 0) {
                        throw new Error("addresses ended too soon or in the wrong place in kiss frame.");
                    }

                    // move on to control field next time
                    addressPart = 1;
                }

                // check the complete callsign
                // (7 bytes)
                if ((addressCount % 7) == 0) {
                    // this is SSID, get the number
                    let ssid = (charCode >> 1) & 0xF;

                    if(ssid != 0) {
                        // don't print zero SSID
                        callsignTmp = `${callsignTmp}-${ssid}`;
                    }

                    // check the callsign for validity
                    let chkCall = this.checkKissCallsign(callsignTmp);
                    if(!chkCall || chkCall == null) {
                        throw new Error("Invalid callsign in kiss frame, discarding.");
                    }

                    if(addressCount == 7) {
                        // we have a destination callsign
                        dstCallsign = chkCall;

                        callsignTmp = "";

                        continue;
                    } else if(addressCount == 14) {
                        // we have a source callsign, copy it to the final frame directly
                        asciiFrame = `${chkCall}>${dstCallsign}`;

                        callsignTmp = "";
                    } else if(addressCount > 14) {
                        // get the H-bit as well if we are in the path part
                        asciiFrame = `${asciiFrame}${chkCall}`;

                        callsignTmp = "";

                        if(charCode & 0x80) {
                            asciiFrame = `${asciiFrame}*`;
                        }

                        digipeaterCount++;
                    } else {
                        throw new Error("Internal error 1 in kiss_to_tnc2()");
                    }

                    if(addressPart == 0) {
                        // more address fields will follow
                        // check that there are a maximum
                        // of eight digipeaters in the path
                        if(digipeaterCount >= 8) {
                            throw new Error("Too many digipeaters in kiss packet, discarding.");
                        }

                        asciiFrame = `${asciiFrame},`;
                    } else {
                        // end of address fields
                        asciiFrame = `${asciiFrame}:`;
                    }


                    continue;
                }

                // shift one bit right to get the ascii
                // character
                charCode = charCode >> 1;
                callsignTmp = callsignTmp + String.fromCharCode(charCode);
            } else if(addressPart == 1) {
                // control field. we are only interested in
                // UI frames, discard others
                if(charCode != 3) {
                    throw new Error("not UI frame, skipping.");
                }

                addressPart = 2;
            } else if(addressPart == 2) {
                // we want PID 0xFO
                if(charCode != 0xF0) {
                    throw new Error("PID not 0xF0, skipping.")
                }

                addressPart = 3;
            } else {
                // body
			    asciiFrame = `${asciiFrame}${charri}`;
            }
        } while(frame.length > 0);

        return asciiFrame;
    }
}

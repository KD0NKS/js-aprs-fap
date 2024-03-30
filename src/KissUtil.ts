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
        frame.replace(/\0xDB\0xDC\0xC0\0xDB\0xDD\0xDB/, '');

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
                        //throw new Error("addresses ended too soon or in the wrong place in kiss frame.");
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
                    //if(!chkCall || chkCall == null) {
                    //    throw new Error("Invalid callsign in kiss frame, discarding.");
                    //}

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
                    //throw new Error("not UI frame, skipping.");
                }

                addressPart = 2;
            } else if(addressPart == 2) {
                // we want PID 0xFO
                if(charCode != 0xF0) {
                    //throw new Error("PID not 0xF0, skipping.")
                }

                addressPart = 3;
            } else {
                // body
			    asciiFrame = `${asciiFrame}${charri}`;
            }
        } while(frame.length > 0);

        return asciiFrame;
    }

    /**
     * =item tnc2_to_kiss($tnc2frame)
     * Convert a TNC-2 compatible UI-frame into a KISS data
     * frame (single port KISS TNC). The frame will be complete,
     * i.e. it has byte stuffing done and FEND (0xC0) characters
     * on both ends. If conversion fails, return undef.
     *
     * NOTE: While all callsigns should be uppercase, regexes may need to account for a-z
     */
    public tnc2ToKiss(frame: string): string | null {
        let kissFrame = String.fromCharCode(parseInt("00", 16)); // kiss frame starts with byte 0x00

        let body;
        let header;

        // separate header and body
        if(/^([A-Z0-9,*>-]+):(.+)$/.test(frame)) {
            [, header, body] = frame.match(/^([A-Z0-9,*>-]+):(.+)$/)
        } else {
            throw new Error("Separation into header and body failed.");
        }

        // separate the sender, recipient and digipeaters
        let sender;
        let senderSsid;
        let receiver;
        let receiverSsid;
        let digipeaters;

        if(/^([A-Z0-9]{1,6})(-\d+|)>([A-Z0-9]{1,6})(-\d+|)(|,.*)$/.test(header)) {
            [, sender, senderSsid, receiver, receiverSsid, digipeaters] = header.match(/^([A-Z0-9]{1,6})(-\d+|)>([A-Z0-9]{1,6})(-\d+|)(|,.*)$/)
        } else {
            throw new Error("Separation of sender and receiver from header failed.");
        }

        // Check SSID format and convert to number
        if(senderSsid.length > 0) {
            senderSsid = Number(senderSsid) * -1;

            if(senderSsid > 15) {
                throw new Error("Sender SSID ($sender_ssid) is over 15.");
            }
        } else {
            senderSsid = 0;
        }

        if(receiverSsid.length > 0) {
            receiverSsid = Number(receiverSsid) * -1;

            if(receiverSsid > 15) {
                throw new Error("tnc2_to_kiss(): receiver SSID ($receiver_ssid) is over 15.");
            }
        } else {
            receiverSsid = 0;
        }

        // pad callsigns to 6 characters with space
        sender = sender.padEnd(6, ' ') // ' ' x (6 - length($sender));
        receiver = receiver.padEnd(6, ' ') //' ' x (6 - length($receiver));

        // encode destination and source
        kissFrame += this.encodeString(receiver);
        kissFrame += String.fromCharCode(0xe0 | (receiverSsid << 1));

        kissFrame += this.encodeString(sender);

        if(digipeaters.length > 0) {
            kissFrame += String.fromCharCode(0x60 | (senderSsid << 1));
        } else {
            kissFrame += String.fromCharCode(0x61 | (senderSsid << 1));
        }

        // if there are digipeaters, add them
        if(digipeaters.length > 0) {
            digipeaters = digipeaters.indexOf(',') == 0 ? digipeaters.substring(1) : digipeaters; // remove the first comma

            // split into parts
            let digis = digipeaters.split(/,/);
            //let $digicount = scalar(@digis);

            if(digis.length > 8 || digis.length < 1) {
                // too many (or none?!?) digipeaters
                throw new Error(`Too many (or zero) digipeaters: ${digis.length}`);
            }

            for(let i = 0; i < digis.length; i++) {
                let tmp

                // split into callsign, SSID and h-bit
                if((tmp = digis[i].match(/^([A-Z0-9]{1,6})(-\d+|)(\*|)$/))) {
                    let callsign = tmp[1].padEnd(6, ' ');
                    let ssid = 0;
                    let hbit = 0x00;

                    if(tmp[2].length > 0) {
                        ssid = Number(tmp[2]) * -1;

                        if(ssid > 15) {
                            throw new Error(`Digipeater nr. ${i} SSID ($ssid) invalid.`);
                        }
                    }

                    if(tmp[3] == '*') {
                        hbit = 0x80;
                    }

                    // add to kiss frame
                    kissFrame += this.encodeString(callsign);

                    if(i + 1 < digis.length) {
                        // more digipeaters to follow
                        kissFrame += String.fromCharCode(hbit | 0x60 | (ssid << 1));
                    } else {
                        // last digipeater
                        kissFrame += String.fromCharCode(hbit | 0x61 | (ssid << 1));
                    }

                } else {
                    throw new Error(`Digipeater nr. ${i} parsing failed.`);
                }
            }
        }

        // add frame type (0x03) and PID (0xF0)
        kissFrame = `${kissFrame}${String.fromCharCode(0x03)}${String.fromCharCode(0xf0)}`

        // add frame body
        kissFrame += body;

        // perform KISS byte stuffing
        kissFrame.replace(/\xdb/, `${String.fromCharCode(0xdb)}${String.fromCharCode(0xdd)}`)
        kissFrame.replace(/\xc0/, `${String.fromCharCode(0xdb)}${String.fromCharCode(0xdc)}`)
        //$kissframe =~ s/\xdb/\xdb\xdd/g;
        //$kissframe =~ s/\xc0/\xdb\xdc/g;

        // add FENDs
        kissFrame =  `${String.fromCharCode(parseInt("c0", 16))}${kissFrame}${String.fromCharCode(parseInt("c0", 16))}`

        return kissFrame;
    }

    private encodeString(value: string): string {
        let retVal = "";

        for(let i = 0; i < value.length; i++) {
            retVal += String.fromCharCode(value.charCodeAt(i) << 1);
        }

        return retVal;
    }
}

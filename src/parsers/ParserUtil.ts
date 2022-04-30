import { ConversionConstantEnum } from "../enums/ConversionConstantEnum";
import { DSTSymbols } from "../enums/DSTSymbols";

export class ParserUtil {
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
    public static calculatePositionResolution(dec: number): number {
        return parseFloat((ConversionConstantEnum.KNOT_TO_KMH * (dec <= -2 ? 600 : 1000) * Math.pow(10, (-1 * dec))).toFixed(4));
    }

    /**
     * return a two element array, first containing
     * the symbol table id (or overlay) and second
     * containing symbol id. return undef in error
     */
    public static symbolFromDst(dstCallsign: string): [ string, string] {
        let table;
        let code;
        let tmp;

        if(tmp = dstCallsign.match(/^(GPS|SPC)([A-Z0-9]{2,3})/)) {
            let leftoverstring = tmp[2];
            let type = leftoverstring.substring(0, 1);
            let sublength = leftoverstring.length;

            if(sublength === 3) {
                if(type === 'C' || type === 'E') {
                    let numberid = leftoverstring.substring(1, 2);

                    if((tmp = numberid.match(/^(\d{2})$/)) && parseInt(numberid) > 0 && parseInt(numberid) < 95) {
                        code = String.fromCharCode(parseInt(tmp[1]) + 32);

                        if(type === 'C') {
                            table = '/';
                        } else {
                            table = "\\";
                        }

                        return [ table, code ];
                    } else {
                        return [ null, null ];
                    }
                } else {
                    // secondary symbol table, with overlay
                    // Check first that we really are in the
                    // secondary symbol table
                    let dsttype = leftoverstring.substring(0, 2);
                    let overlay = leftoverstring.substring(2, 3);

                    if((type === 'O' || type === 'A' || type === 'N'
                            || type === 'D' || type === 'S' || type === 'Q')
                            && (/^[A-Z0-9]$/).test(overlay)) {
                        if(dsttype in DSTSymbols) {
                            code = DSTSymbols[dsttype].substring(1, 2);
                            return [ overlay, code ];
                        } else {
                            return [ null, null ];
                        }
                    } else {
                        return [ null, null ];
                    }
                }
            } else {
                // primary or secondary symbol table, no overlay
                if(leftoverstring in DSTSymbols) {
                    let dstsymbol = DSTSymbols[leftoverstring];
                    table = dstsymbol.substring(0, 1);
                    code = dstsymbol.substring(1, 2);
                    return [ table, code ];
                } else {
                    return [ null, null ];
                }
            }
        } else {
            return [ null, null ];
        }
    }
}
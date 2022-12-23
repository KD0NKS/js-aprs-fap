export abstract class AbstractBuilderModel {
    /**
     * In decimal degrees.
     */
    public latitude: number

    /**
     * In decimal degrees.
     */
    public longitude: number

    /**
     * APRS symbol to use, first table/overlay and then code (two bytes).
     * If string length is zero (""), uses default.
     */
    public symbols: string = ""

    /**
     * Speed in km/h, -1 == don't include.
     * NOTE! Ignored if course is null.
     */
    public speed?: number = null

    /**
     * Course in degrees, -1 == don't include. zero == unknown course, 360 == North.
     * NOTE: Ignored if speed is null.
     */
    public course?: number = null

    /**
     * Altitude in meters above mean sea level.
     * NOTE: Ignored -10000 or under is
     */
    public altitude?: number = null

    /**
     * True if compressed format should be used.
     */
    public isUseCompression: boolean = false

    /**
     * Unix timestamp to include in the generated packet, 0 for current time.
     * Autoswitches from HMS to DHM when the timestamp is over 23 hours old
     * and causes failure (returns undef) after 28 days because the timestamp
     * would become ambiguous.
     * Also fails if the timestamp is over 1 hour into the future
     */
    public timestamp?: number = null

    /**
     * Comment to add to packet
     */
    public comment?: string = null

    /**
     * Use amount (0..4) of position ambiguity.
     * NOTE: Position ambiguity and compression can't be used at the same time.
     */
    public ambiguity?: 1 | 2 | 3 | 4 | null = null

    /**
     * Use !DAO! extension for improved precision.
     * Note: Ignored with compressed positions.
     */
    public isUseDao: boolean = false

    protected isBoolean(val: any): boolean {
        return 'boolean' === typeof val;
    }

    constructor(options?: any) {
        if(options && options != null) {
            if(options["latitude"] != null && isNaN(Number(options["latitude"])) == false) {
                this.latitude = Number(options["latitude"])
            }

            if(options["longitude"] != null && isNaN(Number(options["longitude"])) == false) {
                this.longitude = Number(options["longitude"])
            }

            if(options["speed"] != null && isNaN(Number(options["speed"])) == false) {
                this.speed = Number(options["speed"])
            }

            if(options["course"] != null && isNaN(Number(options["course"])) == false) {
                this.course = Number(options["course"])
            }

            if(options["altitude"] != null && isNaN(Number(options["altitude"])) == false) {
                this.altitude = Number(options["altitude"])
            }

            if(options["timestamp"] != null && isNaN(Number(options["timestamp"])) == false) {
                this.timestamp = Number(options["timestamp"])
            }

            if(options["ambiguity"] != null && isNaN(Number(options["ambiguity"])) == false
                    && (
                        Number(options["ambiguity"]) == 0
                        || Number(options["ambiguity"]) == 1
                        || Number(options["ambiguity"]) == 2
                        || Number(options["ambiguity"]) == 3
                        || Number(options["ambiguity"]) == 4
                    )) {
                this.ambiguity = options["ambiguity"]
            }

            if(options["symbols"] && options["symbols"] != null) {
                this.symbols = String(options["symbols"])
            }

            if(options["comment"] && options["comment"] != null) {
                this.comment = String(options["comment"])
            }

            if(options["isUseCompression"] && options["isUseCompression"] != null && this.isBoolean(options["isUseCompression"])) {
                this.isUseCompression = options["isUseCompression"]
            }

            if(options["isUseDao"] && options["isUseDao"] != null && this.isBoolean(options["isUseDao"])) {
                this.isUseDao = options["isUseDao"]
            }
        }
    }
}
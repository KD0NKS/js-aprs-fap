export class ParserOptions {
    /**
     * The packet should be examined in a form that can exist on an AX.25 network
     * (true) or whether the frame is from the Internet (0 - default).
     *
     * @default false
     */
    public isAx25: boolean = false

    /**
     * If the packet contains corrupted mic-e fields, but some of the data is still recovable, decode
     * the packet instead of reporting an error. At least aprsd produces these packets.
     * 1: try to decode
     * 0: report an error (default)
     *
     * Packets which have been successfully demangled will contain the isMiceMangled> flag.
     */
    public isAcceptBrokenMice: boolean = false


    /**
     * Timestamps within the packets are not decoded to an UNIX timestamp, but are returned as raw strings.
     */
    public isRawTimestamp: boolean = false
}
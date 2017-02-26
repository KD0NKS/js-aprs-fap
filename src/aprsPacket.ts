import digipeater from './digipeater';

export default class aprsPacket {
    constructor() { }

    public header?: string;
    public body?: string;
    public type?: string;
    public sourceCallsign?: string;
    public destCallsign?: string;
    public digipeaters?: digipeater[];
    public timestamp?: number;
    public status?: string;
    public message: string;
    public messageAck: string;
    public messageId: string;
    public messageReject: string;
    public origpacket: string;

    public destination?: string;

    public resultCode?: string;
    public resultMessage?: string;
    public warningCodes?: string[];
}
import digipeater from './digipeater';

export default class aprsPacket {
    constructor() { }

    public alive: boolean;
    public altitude?: number;
    public body?: string;
    public comment?: string;
    public destCallsign?: string;
    public destination?: string;
    public digipeaters?: digipeater[];
    public format?: string;
    public header?: string;
    public latitude?: number;
    public longitude?: number;
    public message?: string;
    public messageAck?: string;
    public messageId?: string;
    public messageReject?: string;
    public objectname?: string;
    public origpacket?: string;
    public phg?: string;
    public posambiguity?: number;
    public posresolution?: number;
    public resultCode?: string;
    public resultMessage?: string;
    public sourceCallsign?: string;
    public status?: string;
    public symbolcode?: string;
    public symboltable?: string;
    public timestamp?: number;
    public type?: string;
    public warningCodes?: string[];
}
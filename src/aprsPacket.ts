import digipeater from './digipeater'
import telemetry from './telemetry'
import wx from './wx'

export default class aprsPacket {
    constructor() {
        this.receivedTime = Date.now()
    }

    public id: string | number

    public alive?: boolean
    public altitude?: number
    public body?: string
    public checksumok?: boolean
    public comment?: string
    public course?: number
    public daodatumbyte?: string
    public destCallsign?: string
    public destination?: string
    public digipeaters?: digipeater[]
    public format?: string
    public gpsfixstatus?: boolean
    public header?: string
    public itemname?: string
    public latitude?: number
    public longitude?: number
    public mbits?: string
    public message?: string
    public messageAck?: string
    public messageId?: string
    public messageReject?: string
    public messaging?: boolean
    public mice_mangled?: boolean
    public objectname?: string
    public origpacket?: string
    public phg?: string
    public posambiguity?: number
    public posresolution?: number
    public receivedTime: number
    public radiorange?: number
    public resultCode?: string
    public resultMessage?: string
    public sourceCallsign?: string
    public speed?: number
    public status?: string
    public symbolcode?: string
    public symboltable?: string
    public telemetry?: telemetry
    public timestamp?: number
    public type?: string
    public warningCodes?: string[]
    public wx?: wx
}
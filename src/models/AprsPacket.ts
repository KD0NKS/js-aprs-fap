import Digipeater from './Digipeater'
import Telemetry from './Telemetry'
import Weather from './Weather'

export class AprsPacket {
    constructor() {
        this.receivedTime = Date.now()
    }

    public id: string | number

    public alive?: boolean
    public altitude?: number

    // TODO: Depricate this
    public body?: string
    public checksumok?: boolean
    public comment?: string
    public course?: number
    public daodatumbyte?: string
    public destCallsign?: string
    public destination?: string
    public digipeaters?: Digipeater[]
    public format?: string
    public gpsfixstatus?: boolean

    // TODO: Depricate this
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
    public telemetry?: Telemetry
    public timestamp?: number
    public type?: string
    public warningCodes?: string[]
    public weather?: Weather
}
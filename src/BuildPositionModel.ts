import { AbstractBuilderModel } from './AbstractBuilderModel'

export class BuildPositionModel extends AbstractBuilderModel {
    /**
     * True to signal messaging capability, 0 for no messaging capability (default)
     */
    public isMessagingEnabled = false

    constructor(options?: any) {
        if(options && options != null) {
            super(options)

            if(options["isMessagingEnabled"] && options["isMessagingEnabled"] != null && this.isBoolean(options["isMessagingEnabled"])) {
                this.isMessagingEnabled = options["isMessagingEnabled"]
            }
        } else {
            super()
        }
    }
}